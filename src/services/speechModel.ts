/**
 * Kings' Speech writing coach: the model call (WP4).
 *
 * Primary: Claude via the official @anthropic-ai/sdk, model from SPEECH_MODEL
 * (default claude-sonnet-5-5), key from ANTHROPIC_API_KEY (never logged).
 * Fallback when ANTHROPIC_API_KEY is unset: the existing Groq client pattern
 * (GROQ_API_KEY, GROQ_MODEL default openai/gpt-oss-120b). The provider that ran
 * is returned on every result.
 *
 * Sonnet 5.5 request rules followed here: no temperature/top_p/top_k; thinking
 * omitted (runs adaptive); effort set explicitly (SPEECH_EFFORT, default
 * 'medium'); no forced tool_choice; no prefill; streamed with finalMessage();
 * stop_reason checked, including 'refusal'; server-side fallbacks on
 * (beta server-side-fallback-2026-07-01, fallbacks: 'default').
 * Caching: the frozen system prompt carries cache_control; the per-turn
 * operator note goes after his message as a mid-conversation system message.
 */

import Anthropic from '@anthropic-ai/sdk'
import OpenAI from 'openai'
import { SPEECH_SYSTEM_PROMPT } from '../data/speechPrompts.js'
import type { ModelCaller, ModelRequest, ModelResult, ChatTurn } from './speechCoach.js'

type Effort = 'low' | 'medium' | 'high' | 'xhigh' | 'max'
const EFFORTS: Effort[] = ['low', 'medium', 'high', 'xhigh', 'max']

export type SpeechProvider = 'anthropic' | 'groq' | 'none'

export function speechProvider(): SpeechProvider {
  if (process.env.ANTHROPIC_API_KEY) return 'anthropic'
  const groq = process.env.GROQ_API_KEY
  if (groq && groq !== 'your-groq-api-key-here') return 'groq'
  return 'none'
}

/** History must open with a user turn; Ivor's opening question may come first. */
function normaliseHistory(history: ChatTurn[]): ChatTurn[] {
  const clean = history.filter((t) => (t.role === 'user' || t.role === 'assistant') && t.content && t.content.trim())
  if (clean.length && clean[0].role === 'assistant') {
    return [{ role: 'user', content: '[He opened the speech coach.]' }, ...clean]
  }
  return clean
}

/** Bound every call: a hung provider must not hang his turn. */
const CLIENT_OPTIONS = { timeout: 30_000, maxRetries: 1 }

let anthropicClient: Anthropic | null = null
let groqClient: OpenAI | null = null

async function callAnthropic(req: ModelRequest): Promise<ModelResult> {
  const model = process.env.SPEECH_MODEL || 'claude-sonnet-5-5'
  const effortEnv = (process.env.SPEECH_EFFORT || 'medium') as Effort
  const effort: Effort = EFFORTS.includes(effortEnv) ? effortEnv : 'medium'
  if (!anthropicClient) anthropicClient = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY, ...CLIENT_OPTIONS })

  try {
    const stream = anthropicClient.beta.messages.stream({
      model,
      max_tokens: 8000,
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      output_config: { effort },
      system: [{ type: 'text', text: SPEECH_SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } }],
      messages: [
        ...normaliseHistory(req.history),
        { role: 'user', content: req.userMessage },
        { role: 'system', content: req.instruction },
      ],
    })
    const msg = await stream.finalMessage()
    const text = msg.content
      .filter((b): b is Anthropic.Beta.BetaTextBlock => b.type === 'text')
      .map((b) => b.text)
      .join('')
      .trim()
    const iterations = ((msg.usage as unknown as { iterations?: Array<{ type: string }> }).iterations || [])
    const refused = msg.stop_reason === 'refusal'
    return {
      ok: !refused && msg.stop_reason !== 'max_tokens',
      refused,
      text,
      provider: 'anthropic',
      model: msg.model,
      stopReason: msg.stop_reason,
      usage: {
        input_tokens: msg.usage.input_tokens,
        output_tokens: msg.usage.output_tokens,
        cache_creation_input_tokens: msg.usage.cache_creation_input_tokens,
        cache_read_input_tokens: msg.usage.cache_read_input_tokens,
      },
      servedByFallback: iterations.some((i) => i.type === 'fallback_message'),
      error: refused ? `refusal (${msg.stop_details?.category ?? 'no category'})` : undefined,
    }
  } catch (err) {
    const e = err instanceof Anthropic.APIError ? `anthropic ${err.status ?? ''} ${err.name}`.trim() : 'anthropic call failed'
    console.error('[speech] model call FAILED:', e)
    return { ok: false, refused: false, text: '', provider: 'anthropic', model, stopReason: null, usage: null, error: e }
  }
}

async function callGroq(req: ModelRequest): Promise<ModelResult> {
  const model = process.env.GROQ_MODEL || 'openai/gpt-oss-120b'
  if (!groqClient) groqClient = new OpenAI({ apiKey: process.env.GROQ_API_KEY, baseURL: 'https://api.groq.com/openai/v1', ...CLIENT_OPTIONS })
  try {
    const completion = await groqClient.chat.completions.create({
      model,
      max_tokens: 1000,
      messages: [
        { role: 'system', content: SPEECH_SYSTEM_PROMPT },
        ...normaliseHistory(req.history),
        { role: 'user', content: req.userMessage },
        { role: 'system', content: req.instruction },
      ],
    })
    const choice = completion.choices[0]
    const text = (choice?.message?.content || '').trim()
    const stopReason = choice?.finish_reason === 'length' ? 'max_tokens' : choice?.finish_reason || null
    return {
      ok: !!text && stopReason !== 'max_tokens',
      refused: false,
      text,
      provider: 'groq',
      model,
      stopReason,
      usage: completion.usage
        ? { input_tokens: completion.usage.prompt_tokens, output_tokens: completion.usage.completion_tokens }
        : null,
    }
  } catch {
    console.error('[speech] groq call FAILED')
    return { ok: false, refused: false, text: '', provider: 'groq', model, stopReason: null, usage: null, error: 'groq call failed' }
  }
}

export const callSpeechModel: ModelCaller = async (req) => {
  const provider = speechProvider()
  if (provider === 'anthropic') return callAnthropic(req)
  if (provider === 'groq') return callGroq(req)
  return { ok: false, refused: false, text: '', provider: 'none', model: '', stopReason: null, usage: null, error: 'no model configured' }
}
