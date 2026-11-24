/**
 * Kings' Speech writing coach: turn storage (WP4).
 *
 * Turns only; audio lives in Choose Joy's private bucket cj-audio (WP5).
 * Writes to the Choose Joy Supabase project, NOT ivor-core's own database:
 * env SPEECH_SUPABASE_URL + SPEECH_SUPABASE_SERVICE_ROLE_KEY (from Rob; none
 * guessed). Never falls back to SUPABASE_URL.
 *
 * Statuses are explicit: STORED, NOT_STORED_OFF_RECORD (his choice),
 * NOT_CONFIGURED (env missing), FAILED (write error). Only STORED means stored.
 *
 * The table is created by the WP5 migration in Choose Joy
 * (supabase-monologue.sql). Expected shape:
 *
 *   create table public.cj_speech_turns (
 *     id            bigint generated always as identity primary key,
 *     session_id    uuid        not null,
 *     role          text        not null check (role in ('user','assistant')),
 *     mode          text        not null check (mode in ('interview','reflect','stuck','shape')),
 *     content       text        not null,
 *     consent_level text        not null default 'crew' check (consent_level in ('crew','private')),
 *     turn_status   text,       -- SpeechTurnResult.status for assistant rows
 *     guards        jsonb,
 *     provider      text,
 *     model         text,
 *     created_at    timestamptz not null default now()
 *   );
 *   alter table public.cj_speech_turns enable row level security;
 *   -- no anon/authenticated policies: service role only, read back via
 *   -- SECURITY DEFINER RPCs keyed to the member's token (Choose Joy pattern).
 *   -- Deleting a recording/session must delete its turns.
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js'

export const SPEECH_TURNS_TABLE = 'cj_speech_turns'

export type StoreStatus = 'STORED' | 'NOT_STORED_OFF_RECORD' | 'NOT_CONFIGURED' | 'FAILED'

export interface SpeechTurnRow {
  session_id: string
  role: 'user' | 'assistant'
  mode: string
  content: string
  consent_level: 'crew' | 'private'
  turn_status?: string | null
  guards?: unknown
  provider?: string | null
  model?: string | null
}

export interface StoreResult {
  status: StoreStatus
  error?: string
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export function isUuid(s: unknown): s is string {
  return typeof s === 'string' && UUID_RE.test(s)
}

let client: SupabaseClient | null = null

function getClient(): SupabaseClient | null {
  if (client) return client
  // Same Supabase project as the rest of ivor-core, so its existing settings serve when no speech-specific ones are set.
  const url = process.env.SPEECH_SUPABASE_URL || process.env.SUPABASE_URL
  const key = process.env.SPEECH_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  client = createClient(url, key, { auth: { persistSession: false } })
  return client
}

/** A hung store must not hang his reply. */
export const STORE_TIMEOUT_MS = 5_000

export async function saveSpeechTurns(rows: SpeechTurnRow[], opts: { offRecord: boolean }): Promise<StoreResult> {
  if (opts.offRecord) return { status: 'NOT_STORED_OFF_RECORD' }
  const db = getClient()
  if (!db) return { status: 'NOT_CONFIGURED', error: 'SPEECH_SUPABASE_URL / SPEECH_SUPABASE_SERVICE_ROLE_KEY not set' }
  if (!rows.length || !rows.every((r) => isUuid(r.session_id))) return { status: 'FAILED', error: 'invalid session id' }
  let timer: ReturnType<typeof setTimeout> | undefined
  const timeout = new Promise<'timeout'>((resolve) => {
    timer = setTimeout(() => resolve('timeout'), STORE_TIMEOUT_MS)
  })
  try {
    const outcome = await Promise.race([Promise.resolve(db.from(SPEECH_TURNS_TABLE).insert(rows)), timeout])
    if (outcome === 'timeout') {
      console.error('[speech] turn store FAILED: timeout')
      return { status: 'FAILED', error: 'timeout' }
    }
    const { error } = outcome
    if (error) {
      console.error('[speech] turn store FAILED:', error.code || error.message)
      return { status: 'FAILED', error: error.code || 'insert failed' }
    }
    return { status: 'STORED' }
  } catch {
    console.error('[speech] turn store FAILED: insert threw')
    return { status: 'FAILED', error: 'insert failed' }
  } finally {
    clearTimeout(timer)
  }
}
