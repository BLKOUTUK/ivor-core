/**
 * Kings' Speech coach: route-level tests (WP4).
 * The model and the store are mocked; the route runs on a local ephemeral port.
 */
import express from 'express'
import type { AddressInfo } from 'net'
import type { Server } from 'http'
import type { ModelRequest, ModelResult } from '../speechCoach.js'

jest.mock('../speechModel', () => ({
  callSpeechModel: jest.fn(),
  speechProvider: () => 'anthropic',
}))
jest.mock('../speechTurnStore', () => ({
  ...jest.requireActual('../speechTurnStore'),
  saveSpeechTurns: jest.fn(async () => ({ status: 'STORED' })),
}))

import router from '../../api/speechRoutes.js'
import { callSpeechModel } from '../speechModel.js'
import { saveSpeechTurns } from '../speechTurnStore.js'

const callModel = callSpeechModel as unknown as jest.Mock<Promise<ModelResult>, [ModelRequest]>
const save = saveSpeechTurns as unknown as jest.Mock

function ok(text: string): ModelResult {
  return { ok: true, refused: false, text, provider: 'anthropic', model: 'fake', stopReason: 'end_turn', usage: null }
}

let server: Server
let base = ''

beforeAll((done) => {
  const app = express()
  app.use(express.json({ limit: '2mb' }))
  app.use('/api/speech', router)
  server = app.listen(0, '127.0.0.1', () => {
    base = `http://127.0.0.1:${(server.address() as AddressInfo).port}/api/speech`
    done()
  })
})
afterAll((done) => {
  server.close(() => done())
})
beforeEach(() => {
  callModel.mockReset()
  save.mockClear()
})

async function post(body: unknown) {
  const res = await fetch(base, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) })
  return { status: res.status, body: (await res.json()) as any }
}

let n = 0
function sid(): string {
  n++
  return `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`
}

const DISCLOSURE = 'my dad died three weeks before that, sorry, give me a second'

describe('POST /api/speech: disclosures are not stored', () => {
  it('stores no user row on a FULL_STOP turn (assistant row only)', async () => {
    callModel.mockResolvedValue(ok("That's fine. We'll stop right here. We can stay here, change the subject, or stop for today."))
    const r = await post({ mode: 'interview', message: DISCLOSURE, sessionId: sid() })
    expect(r.status).toBe(200)
    expect(r.body.status).toBe('FULL_STOP')
    expect(save).toHaveBeenCalledTimes(1)
    const rows = save.mock.calls[0][0] as Array<{ role: string; content: string }>
    expect(rows.some((row) => row.role === 'user')).toBe(false)
    expect(JSON.stringify(rows)).not.toMatch(/dad died/)
  })

  it('stores no user row on a risk (ENDED) turn', async () => {
    callModel.mockResolvedValue(ok("Thank you for telling me. We're stopping here."))
    const r = await post({ mode: 'interview', message: 'I want to kill myself', sessionId: sid() })
    expect(r.status).toBe(200)
    expect(r.body.status).toBe('ENDED')
    expect(r.body.supportMessage).toBeTruthy()
    const rows = save.mock.calls[0][0] as Array<{ role: string }>
    expect(rows.some((row) => row.role === 'user')).toBe(false)
    expect(JSON.stringify(rows)).not.toMatch(/kill myself/)
  })

  it('still stores the user row on an ordinary turn', async () => {
    callModel.mockResolvedValue(ok('You said the light was on. Who left it?'))
    await post({ mode: 'interview', message: 'the light was on in the kitchen', sessionId: sid() })
    const rows = save.mock.calls[0][0] as Array<{ role: string }>
    expect(rows.map((row) => row.role)).toEqual(['user', 'assistant'])
  })
})

describe('POST /api/speech: server holds full_stop / ended per session', () => {
  it('keeps full_stop when the client drops state, until a valid choice clears it', async () => {
    const id = sid()
    callModel.mockResolvedValue(ok("That's fine. We'll stop right here. We can stay here, change the subject, or stop for today."))
    expect((await post({ mode: 'interview', message: DISCLOSURE, sessionId: id })).body.status).toBe('FULL_STOP')

    callModel.mockReset()
    callModel.mockResolvedValue(ok('should not be called'))
    const reset = await post({ mode: 'interview', message: 'anyway, back to the kitchen', sessionId: id, state: 'open' })
    expect(reset.body.status).toBe('FULL_STOP')
    expect(callModel).not.toHaveBeenCalled()

    callModel.mockResolvedValue(ok('What was the best meal you had this year?'))
    const chose = await post({ mode: 'interview', message: '', sessionId: id, fullStopChoice: 'change_subject' })
    expect(chose.status).toBe(200)
    expect(chose.body.status).toBe('OK')

    const after = await post({ mode: 'interview', message: 'the light was on', sessionId: id })
    expect(after.body.status).toBe('OK')
  })

  it('keeps ended when the client drops state', async () => {
    const id = sid()
    callModel.mockResolvedValue(ok("Thank you for telling me. We're stopping here."))
    expect((await post({ mode: 'interview', message: 'I want to kill myself', sessionId: id })).body.status).toBe('ENDED')
    callModel.mockReset()
    const again = await post({ mode: 'interview', message: 'hello again', sessionId: id })
    expect(again.body.status).toBe('ENDED')
    expect(again.body.supportMessage).toBeTruthy()
    expect(callModel).not.toHaveBeenCalled()
  })
})

describe('POST /api/speech: model unreachable', () => {
  it('returns 503 coach_unreachable instead of a canned question that looks like Ivor working', async () => {
    callModel.mockResolvedValue({ ok: false, refused: false, text: '', provider: 'anthropic', model: 'fake', stopReason: null, usage: null, error: 'anthropic 401 AuthenticationError' })
    const r = await post({ mode: 'interview', message: 'hello', sessionId: sid() })
    expect(r.status).toBe(503)
    expect(r.body).toEqual({ error: 'coach_unreachable', status: 'MODEL_FAILED_FALLBACK' })
  })

  it('keeps 200 for a guard fallback', async () => {
    callModel.mockResolvedValue(ok("You could say: the light was still on. Here's a draft."))
    const r = await post({ mode: 'interview', message: 'give me an opening line' })
    expect(r.status).toBe(200)
    expect(r.body.status).toBe('GUARD_FAILED_FALLBACK')
  })
})

describe('POST /api/speech: history cap', () => {
  it('caps total history at about 24,000 characters, dropping the oldest turns', async () => {
    callModel.mockResolvedValue(ok('Where were you standing?'))
    const sessionMessages = Array.from({ length: 40 }, (_, i) => ({
      role: i % 2 ? 'user' : 'assistant',
      content: `turn${i} ` + 'x'.repeat(3990),
    }))
    const r = await post({ mode: 'interview', message: 'the light was on', sessionMessages })
    expect(r.status).toBe(200)
    const sent = callModel.mock.calls[0][0].history
    const total = sent.reduce((s, t) => s + t.content.length, 0)
    expect(total).toBeLessThanOrEqual(24000)
    expect(sent[sent.length - 1].content.startsWith('turn39 ')).toBe(true)
    expect(sent.some((t) => t.content.startsWith('turn0 '))).toBe(false)
  })
})
