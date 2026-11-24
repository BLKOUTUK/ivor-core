/**
 * Kings' Speech writing coach: one conversational turn, with the guards
 * enforced in code (WP4). The model caller is injected so the guards can be
 * tested without a billed call.
 *
 * Turn statuses (never read a fallback as success):
 *   OK                     model reply passed every guard
 *   REPAIRED               reflect reply had quotes he never said; they were removed
 *   FLAGGED                kept in the type but never emitted: a shape draft that fails a guard is withheld (GUARD_FAILED_FALLBACK + flagged)
 *   GUARD_FAILED_FALLBACK  guard failed twice; reply is a neutral doorway question
 *   MODEL_FAILED_FALLBACK  model refused / errored / truncated; reply is a neutral fallback
 *   FULL_STOP              emotion: only the three options until he chooses
 *   ENDED                  session over (his choice, or risk language)
 */

import {
  type SpeechMode,
  type NoWritingResult,
  type QuoteResult,
  type DistressResult,
  type InventionResult,
  type FullStopResult,
  checkNoWriting,
  verifyQuotes,
  detectDistress,
  checkInvention,
  checkFullStopReply,
} from './speechGuards.js'
import {
  DOORWAY_QUESTIONS,
  FULL_STOP_NOTE,
  RISK_NOTE,
  CHANGE_SUBJECT_NOTE,
  RESUME_NOTE,
  buildModeNote,
  buildCorrectionNote,
} from '../data/speechPrompts.js'

export type TurnStatus =
  | 'OK'
  | 'REPAIRED'
  | 'FLAGGED'
  | 'GUARD_FAILED_FALLBACK'
  | 'MODEL_FAILED_FALLBACK'
  | 'FULL_STOP'
  | 'ENDED'

export type SessionState = 'open' | 'full_stop' | 'ended'
export type FullStopChoice = 'stay' | 'change_subject' | 'stop' | 'resume'

export interface FullStopOption {
  id: Exclude<FullStopChoice, 'resume'>
  label: string
}

export const FULL_STOP_OPTIONS: FullStopOption[] = [
  { id: 'stay', label: 'Stay here' },
  { id: 'change_subject', label: 'Change the subject' },
  { id: 'stop', label: 'Stop for today' },
]

export interface ChatTurn {
  role: 'user' | 'assistant'
  content: string
}

export interface ModelRequest {
  mode: SpeechMode
  history: ChatTurn[]
  userMessage: string
  /** Operator note sent after his message (mode, name, correction). */
  instruction: string
}

export interface ModelUsage {
  input_tokens: number
  output_tokens: number
  cache_creation_input_tokens?: number | null
  cache_read_input_tokens?: number | null
}

export interface ModelResult {
  ok: boolean
  refused: boolean
  text: string
  provider: 'anthropic' | 'groq' | 'none'
  model: string
  stopReason: string | null
  usage: ModelUsage | null
  error?: string
  /** True when a server-side fallback model served the reply. */
  servedByFallback?: boolean
}

export type ModelCaller = (req: ModelRequest) => Promise<ModelResult>

export interface SpeechTurnInput {
  mode: SpeechMode
  message: string
  history: ChatTurn[]
  firstName?: string
  state?: SessionState
  fullStopChoice?: FullStopChoice
  /** Extra words of his (e.g. a recording transcript) that quotes may come from. */
  transcriptExtra?: string
}

export interface SpeechTurnResult {
  status: TurnStatus
  state: SessionState
  reply: string
  options?: FullStopOption[]
  supportMessage?: string
  flagged?: string[]
  attempts: number
  fallbackUsed: boolean
  guards: {
    distress: DistressResult
    noWriting?: NoWritingResult
    quotes?: QuoteResult
    invention?: InventionResult
    fullStop?: FullStopResult
  }
  model: Array<Pick<ModelResult, 'provider' | 'model' | 'stopReason' | 'usage' | 'refused' | 'error' | 'servedByFallback'>>
}

export interface SpeechDeps {
  callModel: ModelCaller
  supportMessage: string
}

/** The model's full-stop signal, anywhere in the reply. */
const FULL_STOP_MARKER = /\[FULL[ _]STOP\]/i
const FULL_STOP_MARKER_ALL = /\s*\[FULL[ _]STOP\]\s*/gi

function stripFullStopMarker(text: string): string {
  return text.replace(FULL_STOP_MARKER_ALL, ' ').trim()
}

// TODO(Rob): wording
export const FULL_STOP_FALLBACK_REPLY =
  "That's fine. We'll stop right here. What you just said hasn't been kept. When you're ready, use the buttons on screen: stay here, change the subject, or stop for today."
export const RISK_FALLBACK_REPLY =
  "Thank you for telling me. We're stopping here. Please reach out to someone now; the support details are below."
// TODO(Rob): wording
export const STAY_REPLY = "We'll stay here. Take whatever time you need. When you're ready, use the buttons on screen to carry on or stop."
export const STOP_REPLY = "Thank you. We'll stop for today. Everything you've said stays as you chose."
export const ENDED_REPLY = 'This session has ended.'
export const MODEL_FALLBACK_SHAPE =
  "I couldn't put a suggestion together just now. Your words are all still here; try asking again."

/** His own words: his turns in the history, this message, and any extra transcript. */
export function speakerTranscript(input: SpeechTurnInput): string {
  return [
    ...input.history.filter((t) => t.role === 'user').map((t) => t.content),
    input.message,
    input.transcriptExtra || '',
  ]
    .filter((s) => s && !s.startsWith('[chose:'))
    .join('\n')
}

export function pickDoorway(history: ChatTurn[]): string {
  const all = DOORWAY_QUESTIONS.flatMap((g) => g.questions)
  return all[history.length % all.length]
}

function modelLog(r: ModelResult) {
  return {
    provider: r.provider,
    model: r.model,
    stopReason: r.stopReason,
    usage: r.usage,
    refused: r.refused,
    error: r.error,
    servedByFallback: r.servedByFallback,
  }
}

function modelUsable(r: ModelResult): boolean {
  return r.ok && !r.refused && r.stopReason !== 'max_tokens' && !!r.text.trim()
}

function rebuildReflect(verified: string[]): string {
  return `Here is what I heard, in your words:\n${verified.map((q) => `"${q}"`).join('\n')}\nWhich of these do you want to keep? What's missing?`
}

async function fullStopTurn(
  input: SpeechTurnInput,
  deps: SpeechDeps,
  distress: DistressResult,
  risk: boolean,
  preset?: ModelResult,
): Promise<SpeechTurnResult> {
  const r =
    preset ||
    (await deps.callModel({
      mode: input.mode,
      history: input.history,
      userMessage: input.message,
      instruction: buildModeNote(input.mode, input.firstName, risk ? RISK_NOTE : FULL_STOP_NOTE),
    }))
  const text = stripFullStopMarker(r.text)
  const usable = modelUsable(r)
  const fullStop: FullStopResult = usable
    ? checkFullStopReply(text)
    : { status: 'FAILED', reasons: [`model unusable: ${r.error || r.stopReason || 'empty reply'}`] }
  // Risk replies may not contain any question at all.
  if (risk && usable && text.includes('?')) {
    fullStop.status = 'FAILED'
    fullStop.reasons.push('question in a risk reply')
  }
  const passed = fullStop.status === 'PASSED'
  const reply = passed ? text : risk ? RISK_FALLBACK_REPLY : FULL_STOP_FALLBACK_REPLY
  return {
    status: risk ? 'ENDED' : 'FULL_STOP',
    state: risk ? 'ended' : 'full_stop',
    reply,
    options: risk ? undefined : FULL_STOP_OPTIONS,
    supportMessage: deps.supportMessage,
    attempts: 1,
    fallbackUsed: !passed,
    guards: { distress, fullStop },
    model: [modelLog(r)],
  }
}

export async function runSpeechTurn(input: SpeechTurnInput, deps: SpeechDeps): Promise<SpeechTurnResult> {
  const distress = detectDistress(input.message || '')
  const base = { attempts: 0, fallbackUsed: false, model: [] as SpeechTurnResult['model'] }

  // Risk language always ends the session, whatever state we were in (even 'ended').
  if (distress.level === 'risk') return fullStopTurn(input, deps, distress, true)

  // Session already over: nothing reaches the model.
  if (input.state === 'ended') {
    return { ...base, status: 'ENDED', state: 'ended', reply: ENDED_REPLY, supportMessage: deps.supportMessage, guards: { distress } }
  }

  let extraNote: string | undefined
  if (input.state === 'full_stop') {
    switch (input.fullStopChoice) {
      case 'stop':
        return { ...base, status: 'ENDED', state: 'ended', reply: STOP_REPLY, supportMessage: deps.supportMessage, guards: { distress } }
      case 'change_subject':
        extraNote = CHANGE_SUBJECT_NOTE
        break
      case 'resume':
        extraNote = RESUME_NOTE
        break
      case 'stay':
      default:
        // No choice yet (or "stay"): only the options, no model call.
        return {
          ...base,
          status: 'FULL_STOP',
          state: 'full_stop',
          reply: input.fullStopChoice === 'stay' ? STAY_REPLY : FULL_STOP_FALLBACK_REPLY,
          options: FULL_STOP_OPTIONS,
          supportMessage: deps.supportMessage,
          guards: { distress },
        }
    }
  }
  // Every state: a fresh disclosure (including after change_subject / resume) stops again.
  if (distress.triggered) return fullStopTurn(input, deps, distress, false)

  const userMessage =
    input.message && input.message.trim()
      ? input.message.trim()
      : `[chose: ${input.fullStopChoice === 'change_subject' ? 'change the subject' : 'carry on'}]`
  const turnInput = { ...input, message: userMessage }
  const transcript = speakerTranscript(turnInput)
  const results: ModelResult[] = []
  let correction: string | undefined
  let lastGuards: SpeechTurnResult['guards'] = { distress }
  let lastText = ''

  for (let attempt = 1; attempt <= 2; attempt++) {
    const note = [extraNote, correction].filter(Boolean).join('\n') || undefined
    const r = await deps.callModel({
      mode: input.mode,
      history: input.history,
      userMessage,
      instruction: buildModeNote(input.mode, input.firstName, note),
    })
    results.push(r)

    if (!modelUsable(r)) {
      // No second call: a refusal has already been through the server-side
      // fallback chain, and the SDK already retries transient (429/5xx) errors.
      break
    }

    // The model may call the full stop itself when the detector missed it.
    if (FULL_STOP_MARKER.test(r.text)) {
      const fs = await fullStopTurn(turnInput, deps, distress, false, r)
      return { ...fs, attempts: attempt, model: results.map(modelLog) }
    }

    const text = r.text.trim()
    lastText = text
    const reasons: string[] = []

    if (input.mode === 'shape') {
      const invention = checkInvention(text, transcript)
      const quotes = verifyQuotes(text, transcript)
      lastGuards = { distress, invention, quotes }
      if (invention.status === 'PASSED' && quotes.status !== 'FAILED') {
        return { status: 'OK', state: 'open', reply: text, attempts: attempt, fallbackUsed: false, guards: lastGuards, model: results.map(modelLog) }
      }
      if (invention.status === 'FAILED') reasons.push(`names or facts not in his words: ${invention.flagged.join(', ')}`)
      if (quotes.status === 'FAILED') reasons.push(`quotes not in his words: ${quotes.unverified.join(' | ')}`)
    } else {
      const noWriting = checkNoWriting(text, input.mode)
      const quotes = verifyQuotes(text, transcript)
      lastGuards = { distress, noWriting, quotes }
      const quotesOk = input.mode === 'reflect' ? quotes.status === 'PASSED' : quotes.status !== 'FAILED'
      if (noWriting.status === 'PASSED' && quotesOk) {
        return { status: 'OK', state: 'open', reply: text, attempts: attempt, fallbackUsed: false, guards: lastGuards, model: results.map(modelLog) }
      }
      // Reflect: keep his real words, drop the rest.
      if (input.mode === 'reflect' && noWriting.status === 'PASSED' && quotes.verified.length > 0) {
        return {
          status: 'REPAIRED',
          state: 'open',
          reply: rebuildReflect(quotes.verified),
          attempts: attempt,
          fallbackUsed: false,
          guards: lastGuards,
          model: results.map(modelLog),
        }
      }
      reasons.push(...noWriting.reasons)
      if (quotes.status === 'FAILED') reasons.push(`quotes not in his words: ${quotes.unverified.join(' | ')}`)
      if (input.mode === 'reflect' && quotes.status === 'NO_QUOTES') reasons.push('reflect reply had no quotes of his')
    }
    correction = buildCorrectionNote(reasons)
  }

  // Both attempts failed a guard, or the model was unusable.
  const modelFailed = results.length === 0 || !results.some(modelUsable) || (!lastText && !modelUsable(results[results.length - 1]))
  const doorway = pickDoorway(input.history)
  const reply =
    input.mode === 'shape' ? MODEL_FALLBACK_SHAPE : `Here's a door, take it or leave it: ${doorway}`
  return {
    status: modelFailed ? 'MODEL_FAILED_FALLBACK' : 'GUARD_FAILED_FALLBACK',
    state: 'open',
    reply,
    attempts: results.length,
    fallbackUsed: true,
    flagged: lastGuards.invention?.flagged,
    guards: lastGuards,
    model: results.map(modelLog),
  }
}
