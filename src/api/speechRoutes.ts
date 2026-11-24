import { Router, type Request, type Response } from 'express'
import { SPEECH_MODES, type SpeechMode } from '../services/speechGuards.js'
import { runSpeechTurn, FULL_STOP_OPTIONS, type ChatTurn, type FullStopChoice, type SessionState } from '../services/speechCoach.js'
import { callSpeechModel, speechProvider } from '../services/speechModel.js'
import { saveSpeechTurns, isUuid } from '../services/speechTurnStore.js'

/**
 * Kings' Speech writing coach (WP4): Ivor asks; he writes.
 * Spec: /home/robbe/blkout/projects/alternative-christmas-2026/docs/kings-speech-delivery-plan-DRAFT-2026-11-22.md
 * Separate from interviewRoutes.ts (Compass archive): own prompt, own tables.
 */

const router = Router()

const MAX_MESSAGE_CHARS = 4000
const MAX_HISTORY_TURNS = 80
const STATES: SessionState[] = ['open', 'full_stop', 'ended']
const CHOICES: FullStopChoice[] = ['stay', 'change_subject', 'stop', 'resume']

// Wording owned by Rob + the safeguarding lead (WP6). Never invent a helpline.
const SUPPORT_MESSAGE =
  process.env.SPEECH_SUPPORT_MESSAGE ||
  'Rob is on hand: message him now. You can also call Samaritans free on 116 123, any time. If you are in danger, call 999.'

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
 * Returns SpeechTurnResult + { provider, storage }.
 */
router.post('/', async (req: Request, res: Response) => {
  const b = req.body || {}
  const mode = b.mode as SpeechMode
  if (!SPEECH_MODES.includes(mode)) {
    return res.status(400).json({ error: `mode must be one of ${SPEECH_MODES.join(', ')}` })
  }
  const state: SessionState = STATES.includes(b.state) ? b.state : 'open'
  const fullStopChoice: FullStopChoice | undefined = CHOICES.includes(b.fullStopChoice) ? b.fullStopChoice : undefined
  const message = typeof b.message === 'string' ? b.message.trim() : ''
  if (message.length > MAX_MESSAGE_CHARS) return res.status(400).json({ error: 'message too long' })
  if (!message && !(state === 'full_stop' && fullStopChoice) && state !== 'ended') {
    return res.status(400).json({ error: 'message is required' })
  }
  if (b.sessionId !== undefined && !isUuid(b.sessionId)) return res.status(400).json({ error: 'sessionId must be a uuid' })

  const history: ChatTurn[] = Array.isArray(b.sessionMessages)
    ? b.sessionMessages
        .filter((m: any) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
        .slice(-MAX_HISTORY_TURNS)
        .map((m: any) => ({ role: m.role, content: m.content.slice(0, MAX_MESSAGE_CHARS) }))
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
      { callModel: callSpeechModel, supportMessage: SUPPORT_MESSAGE },
    )

    let storage: { status: string; error?: string } = { status: 'NOT_STORED_NO_SESSION' }
    if (b.sessionId) {
      const last = result.model[result.model.length - 1]
      const consent_level = b.keepPrivate ? 'private' : 'crew'
      storage = await saveSpeechTurns(
        [
          ...(message ? [{ session_id: b.sessionId, role: 'user' as const, mode, content: message, consent_level: consent_level as 'crew' | 'private' }] : []),
          {
            session_id: b.sessionId,
            role: 'assistant' as const,
            mode,
            content: result.reply,
            consent_level: consent_level as 'crew' | 'private',
            turn_status: result.status,
            guards: result.guards,
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
