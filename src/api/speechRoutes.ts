import { Router, type Request, type Response } from 'express'
import { SPEECH_MODES, type SpeechMode } from '../services/speechGuards.js'
import { runSpeechTurn, FULL_STOP_OPTIONS, FULL_STOP_FALLBACK_REPLY, type ChatTurn, type FullStopChoice, type SessionState } from '../services/speechCoach.js'
import { callSpeechModel, speechProvider, findNamesAmong } from '../services/speechModel.js'
import { saveSpeechTurns, isUuid } from '../services/speechTurnStore.js'

/**
 * Kings' Speech writing coach (WP4): Ivor asks; he writes.
 * Spec: /home/robbe/blkout/projects/alternative-christmas-2026/docs/kings-speech-delivery-plan-DRAFT-2026-11-22.md
 * Separate from interviewRoutes.ts (Compass archive): own prompt, own tables.
 */

const router = Router()

const MAX_MESSAGE_CHARS = 4000
const MAX_HISTORY_TURNS = 80
const MAX_HISTORY_CHARS = 24000
const STATES: SessionState[] = ['open', 'full_stop', 'ended']
const CHOICES: FullStopChoice[] = ['stay', 'change_subject', 'stop', 'resume']

// Wording owned by Rob + the safeguarding lead (WP6). Never invent a helpline.
const SUPPORT_MESSAGE =
  process.env.SPEECH_SUPPORT_MESSAGE ||
  'Rob is on hand: message him now. You can also call Samaritans free on 116 123, any time. If you are in danger, call 999.'

// Server-held session state, so a client that drops or resets `state` cannot leave
// a full stop or an ended session. In-memory is acceptable: ivor-core runs as one container.
const HELD_STATE_TTL_MS = 4 * 60 * 60 * 1000
const HELD_STATE_MAX = 2000
const heldStates = new Map<string, { state: 'full_stop' | 'ended'; expires: number }>()
const STATE_RANK: Record<SessionState, number> = { open: 0, full_stop: 1, ended: 2 }

function heldState(sessionId: string | undefined): SessionState | undefined {
  if (!sessionId) return undefined
  const held = heldStates.get(sessionId)
  if (!held) return undefined
  if (held.expires < Date.now()) {
    heldStates.delete(sessionId)
    return undefined
  }
  return held.state
}

function holdState(sessionId: string | undefined, state: SessionState) {
  if (!sessionId) return
  heldStates.delete(sessionId)
  if (state === 'open') return // a valid change_subject / resume clears it
  heldStates.set(sessionId, { state, expires: Date.now() + HELD_STATE_TTL_MS })
  while (heldStates.size > HELD_STATE_MAX) {
    const oldest = heldStates.keys().next().value
    if (oldest === undefined) break
    heldStates.delete(oldest)
  }
}

/** Newest turns first until the character budget is spent; the oldest are dropped. */
function capHistory(turns: ChatTurn[]): ChatTurn[] {
  const kept: ChatTurn[] = []
  let total = 0
  for (let i = turns.length - 1; i >= 0; i--) {
    total += turns[i].content.length
    if (total > MAX_HISTORY_CHARS) break
    kept.unshift(turns[i])
  }
  return kept
}

/**
 * POST /api/speech
 *
 * Body: {
 *   mode: 'interview' | 'reflect' | 'stuck' | 'shape',
 *   message: string,
 *   sessionMessages?: { role: 'user' | 'assistant', content: string }[],
 *   sessionId?: uuid,            // turns stored only with a session id
 *   firstName?: string,
 *   state?: 'open' | 'full_stop' | 'ended',
 *   fullStopChoice?: 'stay' | 'change_subject' | 'stop' | 'resume',
 *   offRecord?: boolean,         // not stored
 *   keepPrivate?: boolean,       // stored as consent_level 'private'
 *   transcript?: string          // his recording transcript, for quote checks
 * }
 * Returns SpeechTurnResult + { provider, storage } (200), including FULL_STOP,
 * ENDED and GUARD_FAILED_FALLBACK. Model unreachable: 503
 * { error: 'coach_unreachable', status: 'MODEL_FAILED_FALLBACK' }.
 * On FULL_STOP / ENDED turns his message is never stored; only Ivor's reply.
 */
router.post('/', async (req: Request, res: Response) => {
  const b = req.body || {}
  const mode = b.mode as SpeechMode
  if (!SPEECH_MODES.includes(mode)) {
    return res.status(400).json({ error: `mode must be one of ${SPEECH_MODES.join(', ')}` })
  }
  if (b.sessionId !== undefined && !isUuid(b.sessionId)) return res.status(400).json({ error: 'sessionId must be a uuid' })
  const sessionId: string | undefined = b.sessionId
  const clientState: SessionState = STATES.includes(b.state) ? b.state : 'open'
  const held = heldState(sessionId)
  // The more stopped of the two wins: the client can't reopen a full stop or an ended session.
  const state: SessionState = held && STATE_RANK[held] > STATE_RANK[clientState] ? held : clientState
  const fullStopChoice: FullStopChoice | undefined = CHOICES.includes(b.fullStopChoice) ? b.fullStopChoice : undefined
  const message = typeof b.message === 'string' ? b.message.trim() : ''
  if (message.length > MAX_MESSAGE_CHARS) return res.status(400).json({ error: 'message too long' })
  if (!message && !(state === 'full_stop' && fullStopChoice) && state !== 'ended') {
    return res.status(400).json({ error: 'message is required' })
  }

  const history: ChatTurn[] = Array.isArray(b.sessionMessages)
    ? capHistory(
        b.sessionMessages
          .filter((m: any) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
          .slice(-MAX_HISTORY_TURNS)
          .map((m: any) => ({ role: m.role, content: m.content.slice(0, MAX_MESSAGE_CHARS) })),
      )
    : []

  const provider = speechProvider()
  if (provider === 'none') return res.status(503).json({ error: 'Speech coach model not available' })

  try {
    const result = await runSpeechTurn(
      {
        mode,
        message,
        history,
        firstName: typeof b.firstName === 'string' ? b.firstName : undefined,
        state,
        fullStopChoice,
        transcriptExtra: typeof b.transcript === 'string' ? b.transcript.slice(0, 20000) : undefined,
      },
      { callModel: callSpeechModel, findNames: findNamesAmong, supportMessage: SUPPORT_MESSAGE },
    )

    holdState(sessionId, result.state)

    // Model unreachable: say so, never a canned question that looks like Ivor working. Nothing stored.
    if (result.status === 'MODEL_FAILED_FALLBACK') {
      return res.status(503).json({ error: 'coach_unreachable', status: 'MODEL_FAILED_FALLBACK' })
    }

    // A disclosure (full stop, ended, risk) is never kept: no user row, and no matched words in the guards.
    const stopped = result.status === 'FULL_STOP' || result.status === 'ENDED' || result.guards.distress.triggered
    let storage: { status: string; error?: string } = { status: 'NOT_STORED_NO_SESSION' }
    if (sessionId) {
      const last = result.model[result.model.length - 1]
      const consent_level = b.keepPrivate ? 'private' : 'crew'
      const guards = stopped
        ? { ...result.guards, distress: { ...result.guards.distress, matched: [] } }
        : result.guards
      storage = await saveSpeechTurns(
        [
          ...(message && !stopped ? [{ session_id: sessionId, role: 'user' as const, mode, content: message, consent_level: consent_level as 'crew' | 'private' }] : []),
          {
            session_id: sessionId,
            role: 'assistant' as const,
            mode,
            // On a full stop the model's reply can echo his disclosure; store the fixed wording instead.
            content: result.status === 'FULL_STOP' ? FULL_STOP_FALLBACK_REPLY : result.reply,
            consent_level: consent_level as 'crew' | 'private',
            turn_status: result.status,
            guards,
            provider: last?.provider ?? null,
            model: last?.model ?? null,
          },
        ],
        { offRecord: !!b.offRecord },
      )
    }

    return res.json({ ...result, provider, storage })
  } catch (err) {
    console.error('[speech] turn FAILED:', err instanceof Error ? err.message : 'unknown')
    return res.status(500).json({ error: 'Speech coach temporarily unavailable', status: 'FAILED' })
  }
})

/** GET /api/speech/config: modes and full-stop options for the UI (no prompts, no secrets). */
router.get('/config', (_req: Request, res: Response) => {
  return res.json({ modes: SPEECH_MODES, fullStopOptions: FULL_STOP_OPTIONS, provider: speechProvider() })
})

export default router
