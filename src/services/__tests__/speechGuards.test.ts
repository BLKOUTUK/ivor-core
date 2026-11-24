/**
 * Kings' Speech coach: guard tests (WP4).
 * Each guard must return status 'FAILED' on the fault it guards, never a
 * value that reads as success.
 */
import {
  checkNoWriting,
  verifyQuotes,
  detectDistress,
  checkInvention,
  checkFullStopReply,
} from '../speechGuards.js'

const transcript = [
  'I was standing in the kitchen at my mum\'s place in Croydon when the call came.',
  'The light was still on and Marcus had left his coat on the chair.',
  'I danced at Pride for the first time, honestly I nearly didn\'t go.',
].join('\n')

describe('checkNoWriting (interview / reflect / stuck)', () => {
  it('passes a short single question in interview mode', () => {
    const r = checkNoWriting('You said the kitchen light was still on. Who had left it?', 'interview')
    expect(r.status).toBe('PASSED')
  })

  it('FAILS a reply over 40 words in interview mode', () => {
    const long = Array.from({ length: 45 }, (_, i) => `word${i}`).join(' ') + '?'
    const r = checkNoWriting(long, 'interview')
    expect(r.status).toBe('FAILED')
    expect(r.reasons.join(' ')).toMatch(/words/)
  })

  it('FAILS a reply that offers wording ("you could say")', () => {
    const r = checkNoWriting('You could say: this year I learned to rest. Does that fit?', 'interview')
    expect(r.status).toBe('FAILED')
    expect(r.reasons.join(' ')).toMatch(/you could say/i)
  })

  it.each([
    'How about opening with the kitchen?',
    "Here's a draft opening for you.",
    'Try saying it like this.',
    'Your opening line could be: the light was on.',
    'Something like "the year I stopped waiting" might work.',
  ])('FAILS writing phrase in stuck mode: %s', (reply) => {
    expect(checkNoWriting(reply, 'stuck').status).toBe('FAILED')
  })

  it('does not apply the 40-word limit in reflect mode, but still applies phrases', () => {
    const quotes = Array.from({ length: 12 }, () => '"I was standing in the kitchen"').join('\n')
    const ok = checkNoWriting(`Here is what I heard, in your words:\n${quotes}\nWhich of these do you want to keep? What's missing?`, 'reflect')
    expect(ok.status).toBe('PASSED')
    expect(checkNoWriting('You could say "I was standing in the kitchen".', 'reflect').status).toBe('FAILED')
  })

  it("FAILS interview wording offered with bare 'open with' / 'start with' / 'one option'", () => {
    expect(checkNoWriting("Open with 'this was the year I wore my crown'. Where were you?", 'interview').status).toBe('FAILED')
    expect(checkNoWriting('Start with the kitchen light. Who left it on?', 'interview').status).toBe('FAILED')
    expect(checkNoWriting('One option: the light was on. Does that fit?', 'stuck').status).toBe('FAILED')
  })

  it('is NOT_APPLICABLE in shape mode (opt-in writing help)', () => {
    expect(checkNoWriting("Here's a draft from your words.", 'shape').status).toBe('NOT_APPLICABLE')
  })
})

describe('verifyQuotes', () => {
  it('passes when every quoted span appears in his transcript', () => {
    const r = verifyQuotes('Here is what I heard: "the light was still on" and "I nearly didn\'t go".', transcript)
    expect(r.status).toBe('PASSED')
    expect(r.verified).toHaveLength(2)
  })

  it('tolerates curly quotes, case and punctuation differences', () => {
    const r = verifyQuotes('“The light was still on.” “I nearly didn’t go”', transcript)
    expect(r.status).toBe('PASSED')
  })

  it('FAILS and lists the span when a quote is not in his transcript', () => {
    const r = verifyQuotes('"the light was still on" and "this year I found my crown"', transcript)
    expect(r.status).toBe('FAILED')
    expect(r.unverified).toEqual(['this year I found my crown'])
    expect(r.verified).toEqual(['the light was still on'])
  })

  it('FAILS when the transcript is empty but quotes are present', () => {
    expect(verifyQuotes('"anything"', '').status).toBe('FAILED')
  })

  it('FAILS a straight-single-quoted span he never said', () => {
    const r = verifyQuotes("Open with 'this was the year I wore my crown'. Where were you?", transcript)
    expect(r.status).toBe('FAILED')
    expect(r.unverified).toEqual(['this was the year I wore my crown'])
  })

  it('does not read apostrophes inside words as quotes', () => {
    expect(verifyQuotes("You said you didn't go. Who's the person you'd thank?", transcript).status).toBe('NO_QUOTES')
    expect(verifyQuotes("You said 'I nearly didn't go'. Why not?", transcript).status).toBe('PASSED')
  })

  it('reports NO_QUOTES (not PASSED) when there is nothing to verify', () => {
    expect(verifyQuotes('Where were you standing?', transcript).status).toBe('NO_QUOTES')
  })
})

describe('detectDistress', () => {
  it('triggers a pause on the plan\'s test disclosure', () => {
    const r = detectDistress('my dad died three weeks before that, sorry, give me a second')
    expect(r.triggered).toBe(true)
    expect(r.level).toBe('pause')
    expect(r.matched.length).toBeGreaterThan(0)
  })

  it.each([
    'I need a minute',
    "I'm crying a bit, hang on",
    'this is hard to talk about',
    'we buried him in March, the funeral was',
    "I can't do this right now",
  ])('triggers on: %s', (msg) => {
    expect(detectDistress(msg).triggered).toBe(true)
  })

  it('escalates to risk on self-harm language', () => {
    const r = detectDistress("honestly some days I don't want to be here anymore")
    expect(r.level).toBe('risk')
  })

  it('does not trigger on an ordinary answer', () => {
    const r = detectDistress('I was at Pride with my mates and we danced till 2')
    expect(r.triggered).toBe(false)
    expect(r.level).toBe('none')
  })

  it('treats a bare "sorry" as a weak cue only (no trigger on its own)', () => {
    expect(detectDistress('sorry, I meant Tuesday not Monday').triggered).toBe(false)
  })

  it.each([
    'I wanna die',
    'I want to take my own life',
    "honestly they'd be better off without me",
    'kms',
    "I don't want to live",
    'I don’t want to live',
    'I donʼt want to live',
  ])('escalates to risk on: %s', (msg) => {
    expect(detectDistress(msg).level).toBe('risk')
  })

  it.each(['I was so angry', "I'm furious with him", 'honestly I was fuming'])('pauses on plain anger: %s', (msg) => {
    expect(detectDistress(msg).level).toBe('pause')
  })

  it.each(['I was killing myself laughing', 'my mate died by suicide'])('idiom / third person pauses, never risk: %s', (msg) => {
    expect(detectDistress(msg).level).toBe('pause')
  })

  it.each(['I ate too much at Christmas', "I'm dying to tell you about Pride"])('does not trigger at all: %s', (msg) => {
    expect(detectDistress(msg).triggered).toBe(false)
  })
})

describe('checkInvention (shape mode)', () => {
  it('passes a suggestion built only from his words', () => {
    const r = checkInvention('Two ways in, yours to change: "The light was still on." Or: "Marcus had left his coat on the chair."', transcript)
    expect(r.status).toBe('PASSED')
  })

  it('FAILS and flags a name he never said', () => {
    const r = checkInvention('You could open with your friend Jerome waiting at the door.', transcript)
    expect(r.status).toBe('FAILED')
    expect(r.flagged).toContain('Jerome')
  })

  it('FAILS and flags a number or place absent from his transcript', () => {
    const r = checkInvention('In 2019 you moved to Brixton and danced at Pride.', transcript)
    expect(r.status).toBe('FAILED')
    expect(r.flagged).toEqual(expect.arrayContaining(['2019', 'Brixton']))
    expect(r.flagged).not.toContain('Pride')
  })

  it('does not flag ordinary sentence-initial words', () => {
    const r = checkInvention('Here are two ways in. Maybe start with the kitchen. Which feels like you?', transcript)
    expect(r.status).toBe('PASSED')
  })
})

describe('checkFullStopReply', () => {
  it('passes a plain acknowledgement with the three options and no question', () => {
    const r = checkFullStopReply("That's fine. We'll stop right here. What you just said hasn't been kept. We can stay here, change the subject, or stop for today.")
    expect(r.status).toBe('PASSED')
  })

  it('FAILS a reply that asks him to type ("say so"): the full-stop screen has no text box', () => {
    expect(checkFullStopReply("That's fine. If you want that left out, say so.").status).toBe('FAILED')
    expect(checkFullStopReply("We'll stay here. When you want to carry on, just say.").status).toBe('FAILED')
  })

  it('FAILS a reply that asks about what surfaced', () => {
    const r = checkFullStopReply("Don't apologise, this is exactly what we need. So after your dad died, what did you decide?")
    expect(r.status).toBe('FAILED')
  })

  it('FAILS praise / "good material" language even without a question', () => {
    expect(checkFullStopReply('That is really powerful. Take your time.').status).toBe('FAILED')
  })
})
