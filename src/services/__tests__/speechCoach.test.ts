/**
 * Kings' Speech coach: orchestration tests (WP4).
 * The model is faked; these prove the guards are enforced in code even when
 * the model misbehaves.
 */
import { runSpeechTurn, FULL_STOP_OPTIONS, type ModelCaller, type ModelRequest } from '../speechCoach.js'
import { DOORWAY_QUESTIONS } from '../../data/speechPrompts.js'

function fakeModel(replies: Array<string | { refused: true }>): ModelCaller & { calls: ModelRequest[] } {
  const calls: ModelRequest[] = []
  const fn = (async (req: ModelRequest) => {
    calls.push(req)
    const next = replies[Math.min(calls.length - 1, replies.length - 1)]
    if (typeof next !== 'string') {
      return { ok: false, refused: true, text: '', provider: 'anthropic', model: 'fake', stopReason: 'refusal', usage: null }
    }
    return { ok: true, refused: false, text: next, provider: 'anthropic', model: 'fake', stopReason: 'end_turn', usage: null }
  }) as ModelCaller & { calls: ModelRequest[] }
  fn.calls = calls
  return fn
}

const history = [
  { role: 'assistant' as const, content: 'Which one moment from this year would you replay? Where were you standing?' },
  { role: 'user' as const, content: "I was standing in the kitchen at my mum's place in Croydon when the call came. The light was still on." },
]

const SUPPORT = 'Support message (test)'

describe('runSpeechTurn: distress forces full stop', () => {
  it('forces FULL_STOP with three options even when the model asks about the loss', async () => {
    const model = fakeModel(["Don't apologise, this is exactly what we need. So after your dad died, what did you decide?"])
    const r = await runSpeechTurn(
      { mode: 'interview', message: 'my dad died three weeks before that, sorry, give me a second', history },
      { callModel: model, supportMessage: SUPPORT },
    )
    expect(r.status).toBe('FULL_STOP')
    expect(r.state).toBe('full_stop')
    expect(r.options).toEqual(FULL_STOP_OPTIONS)
    expect(r.options).toHaveLength(3)
    expect(r.guards.fullStop?.status).toBe('FAILED')
    expect(r.fallbackUsed).toBe(true)
    expect(r.reply).not.toMatch(/\?/)
    expect(r.reply).not.toMatch(/exactly what we need/)
    expect(model.calls[0].instruction).toMatch(/FULL STOP/)
  })

  it('keeps a compliant model reply in the full-stop state', async () => {
    const model = fakeModel(["That's fine. We'll stop right here. We can stay here, change the subject, or stop for today."])
    const r = await runSpeechTurn(
      { mode: 'interview', message: 'my dad died three weeks before that, sorry, give me a second', history },
      { callModel: model, supportMessage: SUPPORT },
    )
    expect(r.status).toBe('FULL_STOP')
    expect(r.guards.fullStop?.status).toBe('PASSED')
    expect(r.fallbackUsed).toBe(false)
  })

  it('ends the session and attaches the support message on risk language', async () => {
    const model = fakeModel(['I hear you. I am glad you said it.'])
    const r = await runSpeechTurn(
      { mode: 'interview', message: "some days I don't want to be here", history },
      { callModel: model, supportMessage: SUPPORT },
    )
    expect(r.status).toBe('ENDED')
    expect(r.state).toBe('ended')
    expect(r.supportMessage).toBe(SUPPORT)
  })

  it('honours a [FULL STOP] signal from the model when the detector missed it', async () => {
    const model = fakeModel(["[FULL STOP] That's fine. We can stay here, change the subject, or stop for today."])
    const r = await runSpeechTurn({ mode: 'interview', message: 'yeah that one is a lot', history }, { callModel: model, supportMessage: SUPPORT })
    expect(r.status).toBe('FULL_STOP')
    expect(r.reply).not.toMatch(/\[FULL STOP\]/)
  })

  it('stays in full stop without calling the model until he chooses', async () => {
    const model = fakeModel(['should not be called'])
    const r = await runSpeechTurn(
      { mode: 'interview', message: 'ok', history, state: 'full_stop' },
      { callModel: model, supportMessage: SUPPORT },
    )
    expect(r.status).toBe('FULL_STOP')
    expect(model.calls).toHaveLength(0)
  })

  it('ends warmly with no question when he chooses stop', async () => {
    const model = fakeModel(['should not be called'])
    const r = await runSpeechTurn(
      { mode: 'interview', message: '', history, state: 'full_stop', fullStopChoice: 'stop' },
      { callModel: model, supportMessage: SUPPORT },
    )
    expect(r.status).toBe('ENDED')
    expect(r.reply).not.toMatch(/\?/)
    expect(model.calls).toHaveLength(0)
  })
})

describe('runSpeechTurn: no writing in interview / stuck', () => {
  it('regenerates once, then falls back to a doorway question with GUARD_FAILED_FALLBACK', async () => {
    const model = fakeModel(['You could say: the light was still on. Want that?', "Here's a draft: the light was still on."])
    const r = await runSpeechTurn({ mode: 'interview', message: 'give me an opening line', history }, { callModel: model, supportMessage: SUPPORT })
    expect(model.calls).toHaveLength(2)
    expect(r.status).toBe('GUARD_FAILED_FALLBACK')
    expect(r.guards.noWriting?.status).toBe('FAILED')
    expect(r.fallbackUsed).toBe(true)
    expect(DOORWAY_QUESTIONS.flatMap((g) => g.questions).some((q) => r.reply.includes(q))).toBe(true)
  })

  it('accepts a good regeneration', async () => {
    const model = fakeModel(['How about: the light was still on?', 'You said the light was still on. Who had left it?'])
    const r = await runSpeechTurn({ mode: 'interview', message: 'give me an opening line', history }, { callModel: model, supportMessage: SUPPORT })
    expect(r.status).toBe('OK')
    expect(r.attempts).toBe(2)
    expect(r.reply).toMatch(/Who had left it\?/)
  })

  it('treats a quoted line he never said as writing (quote guard FAILED)', async () => {
    const model = fakeModel(['Maybe open with "this was the year I wore my crown". Where were you?'])
    const r = await runSpeechTurn({ mode: 'stuck', message: "I've got nothing", history }, { callModel: model, supportMessage: SUPPORT })
    expect(r.guards.quotes?.status).toBe('FAILED')
    expect(r.status).toBe('GUARD_FAILED_FALLBACK')
  })

  it('falls back with MODEL_FAILED_FALLBACK on a refusal', async () => {
    const model = fakeModel([{ refused: true }])
    const r = await runSpeechTurn({ mode: 'interview', message: 'hello', history }, { callModel: model, supportMessage: SUPPORT })
    expect(r.status).toBe('MODEL_FAILED_FALLBACK')
    expect(r.fallbackUsed).toBe(true)
  })

  it('does not spend a second call when the model errored (SDK already retries transient errors)', async () => {
    const calls: ModelRequest[] = []
    const failing: ModelCaller = async (req) => {
      calls.push(req)
      return { ok: false, refused: false, text: '', provider: 'anthropic', model: 'fake', stopReason: null, usage: null, error: 'anthropic 401 AuthenticationError' }
    }
    const r = await runSpeechTurn({ mode: 'interview', message: 'hello', history }, { callModel: failing, supportMessage: SUPPORT })
    expect(calls).toHaveLength(1)
    expect(r.status).toBe('MODEL_FAILED_FALLBACK')
  })
})

describe('runSpeechTurn: reflect quote verification', () => {
  it('drops a quote he never said and reports REPAIRED', async () => {
    const model = fakeModel([
      'Here is what I heard, in your words:\n"The light was still on."\n"I finally found my crown."\nWhich of these do you want to keep? What\'s missing?',
    ])
    const r = await runSpeechTurn({ mode: 'reflect', message: 'what have I got?', history }, { callModel: model, supportMessage: SUPPORT })
    expect(r.status).toBe('REPAIRED')
    expect(r.guards.quotes?.status).toBe('FAILED')
    expect(r.guards.quotes?.unverified).toEqual(['I finally found my crown.'])
    expect(r.reply).toMatch(/The light was still on/)
    expect(r.reply).not.toMatch(/crown/)
  })
})

describe('runSpeechTurn: shape invention check', () => {
  it('regenerates once, then returns FLAGGED with the invented terms', async () => {
    const model = fakeModel([
      'Two ways in, yours to change: "Jerome was waiting at the door." Or start in the kitchen.',
      'Two ways in, yours to change: "Jerome held the door in 2019."',
    ])
    const r = await runSpeechTurn({ mode: 'shape', message: 'help me write the opening', history }, { callModel: model, supportMessage: SUPPORT })
    expect(model.calls).toHaveLength(2)
    expect(r.status).toBe('FLAGGED')
    expect(r.guards.invention?.status).toBe('FAILED')
    expect(r.flagged).toEqual(expect.arrayContaining(['Jerome', '2019']))
  })

  it('passes a suggestion built from his words', async () => {
    const model = fakeModel(['Two ways in, yours to change: "The light was still on." Or: "I was standing in the kitchen when the call came."'])
    const r = await runSpeechTurn({ mode: 'shape', message: 'help me write the opening', history }, { callModel: model, supportMessage: SUPPORT })
    expect(r.status).toBe('OK')
    expect(r.guards.invention?.status).toBe('PASSED')
  })
})
