/**
 * Guest interviews for BLKOUT Voices (25 Nov 2026).
 *
 * Ivor asks a named guest a FIXED set of questions by private link, and may add at most one short follow-up to an
 * answer. He never writes or suggests her words: BLKOUT edits the piece afterwards. First use: Dr Doyinsola Kuku
 * (Portaul), whose interview is part of Portaul's sponsorship of the Ivor's Compass journal.
 *
 * The questions are the ones Rob sent on 31 Oct 2026
 * (~/blkout/projects/portaul/package-2026-10-31/portaul-journal-page-and-interview.md). Do not reword them here.
 */

import Anthropic from '@anthropic-ai/sdk'
import { verifyQuotes } from './speechGuards.js'

export interface GuestInterviewConfig {
  title: string
  /** shown above the first question */
  intro: string[]
  questions: string[]
  system: string
}

const PORTAUL_QUESTIONS = [
  'Tell us about Portaul in a sentence or two, and about yourself.',
  'What made you build it? Was there a particular moment?',
  'Black gay, bi and trans men have every reason to be careful about who holds their health information. What would you say to someone who is wary?',
  'For many of us, testing still carries shame or fear. How does Portaul try to change that?',
  'What does “looking after each other” mean to you, when it comes to sexual health?',
  'Joseph Beam Day is about Black queer men looking out for themselves and each other. Where does Portaul fit in that?',
  'What comes next for Portaul in 2027?',
  'If every man reading this did one thing this winter, what would you want it to be?',
]

export const GUEST_INTERVIEWS: Record<string, GuestInterviewConfig> = {
  'portaul-2026': {
    title: 'BLKOUT Voices interview: Portaul',
    intro: [
      'Eight questions, one at a time. Answer as many as you like, in your own words: between 400 and 800 words in total is plenty.',
      'After some answers Ivor, our interviewer, may ask one short follow-up. He never puts words in your mouth, and you can skip anything.',
      'Your answers save as you go, so you can stop and come back to this link. Nothing is published until we have sent you the edited text.',
    ],
    questions: PORTAUL_QUESTIONS,
    system: `You are Ivor, an interviewer for BLKOUT Voices, the magazine of BLKOUT, a community-owned platform for Black queer men in the UK.
You are interviewing the founder of Portaul, a sexual-health app. The interview is part of Portaul's sponsorship of a BLKOUT journal; BLKOUT chose the questions and will edit the piece. The readers are Black gay, bi and trans men in the UK, many of whom have good reason to be wary of who holds their health information.

The questions are fixed and asked by the app. YOUR ONLY JOB: after she answers one of them, decide whether ONE short follow-up question would get something a reader needs that her answer did not give: a concrete example, a particular moment, a plain-words explanation of a term, or the practical detail a wary reader would ask for. If her answer is already concrete and complete, or she has clearly said all she wants to, reply with exactly: NONE

RULES
- Reply with EITHER the single word NONE, OR one question. Nothing else: no greeting, no comment on her answer, no thanks.
- One question only, under 35 words, ending in a question mark. Plain British English.
- Build it on something she actually said. You may quote a few of her exact words in double quotation marks; never put quotation marks round anything she did not say.
- Never write, draft or suggest wording for her answer. Never offer options for what she might say.
- No praise and no evaluation of her, her answer or the product ("great", "powerful", "important work"). You are not endorsing Portaul.
- Ask on the reader's behalf, never as promotion. No leading questions that invite a sales line.
- Do not ask for, or invite, medical advice or clinical claims. Do not ask about any individual user, or for anyone's personal health information, including hers.
- Do not ask something a later question on the list already covers.
- If her answer shows distress, or she says she would rather not go on, reply NONE.`,
  },
}

export const MAX_FOLLOW_UP_WORDS = 40
const PRAISE = /\b(great|powerful|amazing|brilliant|wonderful|fantastic|inspiring|impressive|love that|well said|important work|thank you|thanks)\b/i

export interface FollowUpCheck { ok: boolean; followUp: string | null; reason?: string }

/** The follow-up must be NONE or one short, plain question built on her words. Anything else is refused. */
export function checkFollowUp(raw: string, answer: string): FollowUpCheck {
  const text = raw.trim().replace(/^["“]|["”]$/g, '').trim()
  if (/^none\.?$/i.test(text)) return { ok: true, followUp: null }
  if (!text) return { ok: false, followUp: null, reason: 'empty' }
  if (text.includes('\n')) return { ok: false, followUp: null, reason: 'more than one line' }
  if (!text.endsWith('?') || (text.match(/\?/g) || []).length !== 1) return { ok: false, followUp: null, reason: 'not exactly one question' }
  const words = text.split(/\s+/).length
  if (words > MAX_FOLLOW_UP_WORDS) return { ok: false, followUp: null, reason: `too long (${words} words)` }
  if (PRAISE.test(text)) return { ok: false, followUp: null, reason: 'praise or evaluation' }
  if (verifyQuotes(text, answer).status === 'FAILED') return { ok: false, followUp: null, reason: 'quotes words she did not say' }
  return { ok: true, followUp: text }
}

export type FollowUpCaller = (system: string, user: string) => Promise<string | null>

let client: Anthropic | null = null

/** One short model call. Returns null on any failure: no follow-up is always a safe outcome. */
export const callFollowUpModel: FollowUpCaller = async (system, user) => {
  if (!process.env.ANTHROPIC_API_KEY) return null
  if (!client) client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY, timeout: 30_000, maxRetries: 1 })
  try {
    const msg = await client.messages.create({
      model: process.env.SPEECH_MODEL || 'claude-sonnet-5-5',
      max_tokens: 4000,
      system,
      messages: [{ role: 'user', content: user }],
    })
    return msg.content.map((b) => (b.type === 'text' ? b.text : '')).join('').trim() || null
  } catch (err) {
    const e = err instanceof Anthropic.APIError ? `anthropic ${err.status ?? ''} ${err.name}`.trim() : 'call failed'
    console.error('[guest-interview] follow-up FAILED:', e)
    return null
  }
}

/**
 * Asks for a follow-up to her answer; one retry with the reason if the first is refused; otherwise none.
 * Never throws and never returns unchecked model text.
 */
export async function followUpFor(
  config: GuestInterviewConfig,
  questionIndex: number,
  answer: string,
  call: FollowUpCaller = callFollowUpModel,
): Promise<{ followUp: string | null; attempts: number; refused: string[] }> {
  const later = config.questions.slice(questionIndex + 1)
  const base =
    `QUESTION ${questionIndex + 1} OF ${config.questions.length}: ${config.questions[questionIndex]}\n\n` +
    `HER ANSWER:\n${answer}\n\n` +
    (later.length ? `QUESTIONS STILL TO COME (do not pre-empt them):\n${later.map((q) => `- ${q}`).join('\n')}\n\n` : '') +
    'Reply with NONE, or one follow-up question.'
  const refused: string[] = []
  for (let attempt = 1; attempt <= 2; attempt++) {
    const raw = await call(config.system, refused.length ? `${base}\n\nYour last reply was not usable (${refused[refused.length - 1]}). Follow the rules exactly.` : base)
    if (raw === null) return { followUp: null, attempts: attempt, refused }
    const check = checkFollowUp(raw, answer)
    if (check.ok) return { followUp: check.followUp, attempts: attempt, refused }
    refused.push(check.reason || 'not usable')
  }
  return { followUp: null, attempts: 2, refused }
}
