/**
 * Guest interview API for BLKOUT Voices (25 Nov 2026). See src/services/guestInterview.ts.
 *
 * Every route is keyed by the private link's token. An unknown token gets 404 from every route, including the
 * model-backed one, so the link is also what stops strangers spending model calls.
 *
 *   GET  /api/guest-interview/:token             the interview, and her saved progress
 *   PUT  /api/guest-interview/:token             save progress { transcript, bio? }
 *   POST /api/guest-interview/:token/follow-up   { questionIndex, answer } -> { followUp: string | null }
 *   POST /api/guest-interview/:token/submit      { transcript, bio? } -> marks it submitted
 */

import { Router, type Request, type Response } from 'express'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { GUEST_INTERVIEWS, followUpFor } from '../services/guestInterview.js'

const router = Router()

const TABLE = 'guest_interviews'
const MAX_ANSWER_CHARS = 8000
const MAX_BIO_CHARS = 600
/** Each question can earn one follow-up; this allows for answers being revised, and no more. */
const MAX_FOLLOW_UPS = 30

let client: SupabaseClient | null = null
function db(): SupabaseClient | null {
  if (client) return client
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  client = createClient(url, key, { auth: { persistSession: false } })
  return client
}

interface Row {
  id: string
  interview: string
  guest_name: string
  transcript: unknown
  bio: string | null
  status: 'open' | 'submitted'
  follow_ups_used: number
}

export interface TranscriptEntry {
  q: number
  answer: string
  follow_up: string | null
  follow_up_answer: string
  skipped: boolean
}

/** Keeps only the fields we expect, at the sizes we allow. Returns null if the shape is wrong. */
export function cleanTranscript(input: unknown, questionCount: number): TranscriptEntry[] | null {
  if (!Array.isArray(input) || input.length > questionCount) return null
  const out: TranscriptEntry[] = []
  const seen = new Set<number>()
  for (const e of input) {
    if (!e || typeof e !== 'object') return null
    const r = e as Record<string, unknown>
    const q = r.q
    if (typeof q !== 'number' || !Number.isInteger(q) || q < 0 || q >= questionCount || seen.has(q)) return null
    seen.add(q)
    const str = (v: unknown, max: number) => (typeof v === 'string' ? v.slice(0, max) : '')
    out.push({
      q,
      answer: str(r.answer, MAX_ANSWER_CHARS),
      follow_up: typeof r.follow_up === 'string' && r.follow_up.trim() ? r.follow_up.slice(0, 400) : null,
      follow_up_answer: str(r.follow_up_answer, MAX_ANSWER_CHARS),
      skipped: r.skipped === true,
    })
  }
  return out.sort((a, b) => a.q - b.q)
}

async function load(token: string): Promise<{ row: Row } | { status: number; error: string }> {
  if (typeof token !== 'string' || !/^[A-Za-z0-9_-]{32,80}$/.test(token)) return { status: 404, error: 'not found' }
  const d = db()
  if (!d) return { status: 503, error: 'storage not configured' }
  const { data, error } = await d
    .from(TABLE)
    .select('id, interview, guest_name, transcript, bio, status, follow_ups_used')
    .eq('token', token)
    .maybeSingle()
  if (error) {
    console.error('[guest-interview] load FAILED:', error.code || error.message)
    return { status: 503, error: 'storage unavailable' }
  }
  if (!data || !GUEST_INTERVIEWS[(data as Row).interview]) return { status: 404, error: 'not found' }
  return { row: data as Row }
}

router.get('/:token', async (req: Request, res: Response) => {
  const r = await load(req.params.token)
  if ('error' in r) return res.status(r.status).json({ error: r.error })
  const cfg = GUEST_INTERVIEWS[r.row.interview]
  return res.json({
    title: cfg.title,
    intro: cfg.intro,
    questions: cfg.questions,
    guestName: r.row.guest_name,
    transcript: r.row.transcript,
    bio: r.row.bio || '',
    status: r.row.status,
  })
})

async function save(req: Request, res: Response, submit: boolean) {
  const r = await load(req.params.token)
  if ('error' in r) return res.status(r.status).json({ error: r.error })
  const cfg = GUEST_INTERVIEWS[r.row.interview]
  const transcript = cleanTranscript(req.body?.transcript, cfg.questions.length)
  if (!transcript) return res.status(400).json({ error: 'transcript is not in the expected shape' })
  if (submit && !transcript.some((t) => t.answer.trim())) return res.status(400).json({ error: 'nothing to send yet' })
  const bio = typeof req.body?.bio === 'string' ? req.body.bio.slice(0, MAX_BIO_CHARS) : r.row.bio
  const now = new Date().toISOString()
  const { error } = await db()!
    .from(TABLE)
    .update({ transcript, bio, updated_at: now, ...(submit ? { status: 'submitted', submitted_at: now } : {}) })
    .eq('id', r.row.id)
  if (error) {
    console.error('[guest-interview] save FAILED:', error.code || error.message)
    return res.status(503).json({ error: 'not saved', status: 'FAILED' })
  }
  return res.json({ status: submit ? 'SUBMITTED' : 'SAVED', savedAt: now })
}

router.put('/:token', (req: Request, res: Response) => save(req, res, false))
router.post('/:token/submit', (req: Request, res: Response) => save(req, res, true))

router.post('/:token/follow-up', async (req: Request, res: Response) => {
  const r = await load(req.params.token)
  if ('error' in r) return res.status(r.status).json({ error: r.error })
  const cfg = GUEST_INTERVIEWS[r.row.interview]
  const qi = req.body?.questionIndex
  const answer = typeof req.body?.answer === 'string' ? req.body.answer.trim().slice(0, MAX_ANSWER_CHARS) : ''
  if (typeof qi !== 'number' || !Number.isInteger(qi) || qi < 0 || qi >= cfg.questions.length) {
    return res.status(400).json({ error: 'questionIndex out of range' })
  }
  // A very short answer has nothing to follow up; a spent allowance means no more model calls on this link.
  if (answer.split(/\s+/).length < 8 || r.row.follow_ups_used >= MAX_FOLLOW_UPS) return res.json({ followUp: null })

  await db()!.from(TABLE).update({ follow_ups_used: r.row.follow_ups_used + 1 }).eq('id', r.row.id)
  const out = await followUpFor(cfg, qi, answer)
  if (out.refused.length) console.warn(`[guest-interview] follow-up refused: ${out.refused.join('; ')}`)
  return res.json({ followUp: out.followUp })
})

export default router
