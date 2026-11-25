import { checkFollowUp, followUpFor, GUEST_INTERVIEWS } from '../guestInterview'
import { cleanTranscript } from '../../api/guestInterviewRoutes'

const answer = 'I built Portaul after a friend found out about an exposure three weeks late, by text, from someone who was too scared to ring him.'
const cfg = GUEST_INTERVIEWS['portaul-2026']

describe('guest interview: the questions', () => {
  it('are the eight sent to Doyin on 31 Oct 2026', () => {
    expect(cfg.questions).toHaveLength(8)
    expect(cfg.questions[0]).toBe('Tell us about Portaul in a sentence or two, and about yourself.')
    expect(cfg.questions[7]).toBe('If every man reading this did one thing this winter, what would you want it to be?')
  })
})

describe('checkFollowUp', () => {
  it('accepts NONE as no follow-up', () => {
    expect(checkFollowUp('NONE', answer)).toEqual({ ok: true, followUp: null })
    expect(checkFollowUp(' none. ', answer)).toEqual({ ok: true, followUp: null })
  })
  it('accepts one short question built on her words', () => {
    const r = checkFollowUp('You said he found out “three weeks late”. What would Portaul have done differently for him?', answer)
    expect(r.ok).toBe(true)
    expect(r.followUp).toBe('You said he found out “three weeks late”. What would Portaul have done differently for him?')
  })
  it('REFUSES a statement, two questions, or several lines', () => {
    expect(checkFollowUp('That is a striking story.', answer).ok).toBe(false)
    expect(checkFollowUp('What happened next? And how did he feel?', answer).ok).toBe(false)
    expect(checkFollowUp('Here is one.\nWhat happened next?', answer).ok).toBe(false)
  })
  it('REFUSES praise, a quote she never said, and a long question', () => {
    expect(checkFollowUp('That is powerful: what happened next?', answer).ok).toBe(false)
    expect(checkFollowUp('You said it was “a matter of life and death”. Why?', answer).ok).toBe(false)
    expect(checkFollowUp(`${'What exactly '.repeat(25)}happened?`, answer).ok).toBe(false)
  })
})

describe('followUpFor', () => {
  it('returns a checked follow-up', async () => {
    const r = await followUpFor(cfg, 1, answer, async () => 'What did that friend say when you showed him the app?')
    expect(r).toEqual({ followUp: 'What did that friend say when you showed him the app?', attempts: 1, refused: [] })
  })
  it('retries once with the reason, then gives up with no follow-up', async () => {
    const calls: string[] = []
    const r = await followUpFor(cfg, 1, answer, async (_s, u) => { calls.push(u); return 'What a great answer.' })
    expect(r.followUp).toBeNull()
    expect(r.attempts).toBe(2)
    expect(calls[1]).toMatch(/not usable/)
  })
  it('returns no follow-up when the model cannot be reached', async () => {
    expect((await followUpFor(cfg, 1, answer, async () => null)).followUp).toBeNull()
  })
  it('tells the model which questions are still to come, and none after the last', async () => {
    const seen: string[] = []
    await followUpFor(cfg, 0, answer, async (_s, u) => { seen.push(u); return 'NONE' })
    await followUpFor(cfg, 7, answer, async (_s, u) => { seen.push(u); return 'NONE' })
    expect(seen[0]).toMatch(/What comes next for Portaul in 2027\?/)
    expect(seen[1]).not.toMatch(/STILL TO COME/)
  })
})

describe('cleanTranscript', () => {
  it('keeps the expected fields, in question order', () => {
    const t = cleanTranscript([
      { q: 1, answer: 'b', follow_up: 'Why?', follow_up_answer: 'because', skipped: false, extra: 'x' },
      { q: 0, answer: 'a' },
    ], 8)
    expect(t).toEqual([
      { q: 0, answer: 'a', follow_up: null, follow_up_answer: '', skipped: false },
      { q: 1, answer: 'b', follow_up: 'Why?', follow_up_answer: 'because', skipped: false },
    ])
  })
  it('REFUSES a wrong shape, a repeated question, or a question that does not exist', () => {
    expect(cleanTranscript('nope', 8)).toBeNull()
    expect(cleanTranscript([{ q: 0, answer: 'a' }, { q: 0, answer: 'b' }], 8)).toBeNull()
    expect(cleanTranscript([{ q: 9, answer: 'a' }], 8)).toBeNull()
  })
  it('cuts an over-long answer', () => {
    expect(cleanTranscript([{ q: 0, answer: 'x'.repeat(20000) }], 8)![0].answer).toHaveLength(8000)
  })
})
