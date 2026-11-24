/**
 * Kings' Speech coach: model client options and store timeout (WP4).
 * Both SDKs and Supabase are mocked; nothing leaves the machine.
 */

const anthropicOpts: unknown[] = []
const openaiOpts: unknown[] = []

jest.mock('@anthropic-ai/sdk', () => {
  class FakeAnthropic {
    static APIError = class extends Error {}
    beta = {
      messages: {
        stream: () => ({
          finalMessage: async () => ({
            content: [{ type: 'text', text: 'Where were you?' }],
            stop_reason: 'end_turn',
            model: 'fake',
            usage: { input_tokens: 1, output_tokens: 1 },
          }),
        }),
      },
    }
    constructor(opts: unknown) {
      anthropicOpts.push(opts)
    }
  }
  return { __esModule: true, default: FakeAnthropic }
})

jest.mock('openai', () => {
  class FakeOpenAI {
    chat = {
      completions: {
        create: async () => ({ choices: [{ message: { content: 'Where were you?' }, finish_reason: 'stop' }], usage: null }),
      },
    }
    constructor(opts: unknown) {
      openaiOpts.push(opts)
    }
  }
  return { __esModule: true, default: FakeOpenAI }
})

jest.mock('@supabase/supabase-js', () => ({
  createClient: () => ({ from: () => ({ insert: () => new Promise(() => {}) }) }),
}))

import { callSpeechModel } from '../speechModel.js'
import { saveSpeechTurns, STORE_TIMEOUT_MS } from '../speechTurnStore.js'

const req = { mode: 'interview' as const, history: [], userMessage: 'hello', instruction: 'MODE: interview.' }

describe('speech model clients', () => {
  const env = { ...process.env }
  afterAll(() => {
    process.env = env
  })

  it('sets a 30s timeout and one retry on the Anthropic client', async () => {
    process.env.ANTHROPIC_API_KEY = 'test-key'
    const r = await callSpeechModel(req)
    expect(r.provider).toBe('anthropic')
    expect(anthropicOpts[0]).toEqual(expect.objectContaining({ timeout: 30_000, maxRetries: 1 }))
  })

  it('sets a 30s timeout and one retry on the Groq fallback client', async () => {
    delete process.env.ANTHROPIC_API_KEY
    process.env.GROQ_API_KEY = 'test-key'
    const r = await callSpeechModel(req)
    expect(r.provider).toBe('groq')
    expect(openaiOpts[0]).toEqual(expect.objectContaining({ timeout: 30_000, maxRetries: 1 }))
  })
})

describe('saveSpeechTurns', () => {
  it('gives up with FAILED after the store timeout when the insert hangs', async () => {
    process.env.SPEECH_SUPABASE_URL = 'https://example.invalid'
    process.env.SPEECH_SUPABASE_SERVICE_ROLE_KEY = 'test-key'
    jest.useFakeTimers()
    try {
      const p = saveSpeechTurns(
        [{ session_id: '00000000-0000-4000-8000-000000000001', role: 'assistant', mode: 'interview', content: 'x', consent_level: 'crew' }],
        { offRecord: false },
      )
      await jest.advanceTimersByTimeAsync(STORE_TIMEOUT_MS + 10)
      await expect(p).resolves.toEqual({ status: 'FAILED', error: 'timeout' })
    } finally {
      jest.useRealTimers()
    }
  })
})
