/**
 * Kings' Speech writing coach: guards in code (WP4).
 *
 * The prompt asks the model to behave; these check that it did. Every guard
 * returns an explicit status. A guard that cannot pass returns 'FAILED' with
 * reasons, never a value that could be read as success.
 *
 * Spec: /home/robbe/blkout/projects/alternative-christmas-2026/docs/ivor-interviewer-prompt-DRAFT-2026-11-22.md
 *       (Notes for the build) and kings-speech-delivery-plan-DRAFT-2026-11-22.md (WP4).
 */

export type SpeechMode = 'interview' | 'reflect' | 'stuck' | 'shape'
export const SPEECH_MODES: SpeechMode[] = ['interview', 'reflect', 'stuck', 'shape']

export type GuardStatus = 'PASSED' | 'FAILED' | 'NOT_APPLICABLE' | 'NO_QUOTES'

// ── shared text helpers ────────────────────────────────────────────

/** Lowercase, unify quotes/apostrophes/dashes, drop punctuation, collapse spaces. */
export function normaliseText(s: string): string {
  return s
    .toLowerCase()
    .replace(/[‘’ʼ`]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, '-')
    .replace(/[^a-z0-9'\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function countWords(s: string): number {
  const t = s.trim()
  return t ? t.split(/\s+/).length : 0
}

// ── 1. no writing in interview / reflect / stuck ───────────────────

export const MAX_WORDS_INTERVIEW = 40

/** Phrases that mean Ivor is offering wording for the speaker's piece. */
export const WRITING_PHRASES: string[] = [
  'you could say',
  'you might say',
  'you could write',
  'you might write',
  'you could open with',
  'you could start with',
  'you could begin with',
  'you could end with',
  'you could close with',
  'how about',
  'what about saying',
  'try saying',
  'try writing',
  'consider saying',
  'maybe say',
  'perhaps say',
  "here's a draft",
  'here is a draft',
  "here's a line",
  'here is a line',
  "here's an opening",
  'here is an opening',
  'opening line could be',
  'opening line:',
  'first line could be',
  'something like "',
  'something like “',
  'something along the lines of',
  'a line like',
  'draft:',
  'open with',
  'start with',
  'one option',
]

export interface NoWritingResult {
  status: GuardStatus
  reasons: string[]
  wordCount: number
}

export function checkNoWriting(reply: string, mode: SpeechMode): NoWritingResult {
  const wordCount = countWords(reply)
  if (mode === 'shape') return { status: 'NOT_APPLICABLE', reasons: [], wordCount }

  const reasons: string[] = []
  if ((mode === 'interview' || mode === 'stuck') && wordCount > MAX_WORDS_INTERVIEW) {
    reasons.push(`reply is ${wordCount} words (limit ${MAX_WORDS_INTERVIEW} in ${mode})`)
  }
  const lower = reply.toLowerCase().replace(/[‘’]/g, "'")
  for (const phrase of WRITING_PHRASES) {
    if (lower.includes(phrase)) reasons.push(`writing phrase: "${phrase}"`)
  }
  return { status: reasons.length ? 'FAILED' : 'PASSED', reasons, wordCount }
}

// ── 2. quote verification ──────────────────────────────────────────

/**
 * Pull quoted spans from a reply: straight double quotes, curly double quotes,
 * and curly or straight single quotes that open at a word boundary (so
 * apostrophes in "didn't" are not read as quotes).
 */
export function extractQuotes(reply: string): string[] {
  const out: string[] = []
  const patterns = [
    /"([^"\n]+)"/g,
    /“([^”\n]+)”/g,
    /(?:^|[\s(\[])‘([^’\n]+(?:’\w[^’\n]*)*)’(?=$|[\s.,;:!?)\]])/g,
    /(?:^|[\s(\[])'([^'\n]+(?:'\w[^'\n]*)*)'(?=$|[\s.,;:!?)\]])/g,
  ]
  for (const re of patterns) {
    let m: RegExpExecArray | null
    while ((m = re.exec(reply)) !== null) {
      const span = m[1].trim()
      if (span) out.push(span)
    }
  }
  return out
}

export interface QuoteResult {
  status: GuardStatus
  verified: string[]
  unverified: string[]
}

/** Every quoted span in the reply must appear in the speaker's own words. */
export function verifyQuotes(reply: string, speakerTranscript: string): QuoteResult {
  const quotes = extractQuotes(reply)
  if (!quotes.length) return { status: 'NO_QUOTES', verified: [], unverified: [] }
  const hay = ` ${normaliseText(speakerTranscript)} `
  const verified: string[] = []
  const unverified: string[] = []
  for (const q of quotes) {
    const needle = normaliseText(q)
    if (needle && hay.trim() && hay.includes(` ${needle} `)) verified.push(q)
    else unverified.push(q)
  }
  return { status: unverified.length ? 'FAILED' : 'PASSED', verified, unverified }
}

// ── 3. distress detector ───────────────────────────────────────────

export type DistressLevel = 'none' | 'pause' | 'risk'

// First person only: third-person or idiomatic uses fall through to PAUSE_PATTERNS.
const RISK_PATTERNS: RegExp[] = [
  /\bkill(ing)? myself\b(?! laugh)/,
  /\bkms\b/,
  /\bend (it all|my life)\b/,
  /\btake my (own )?life\b/,
  /\bi'?m (feeling )?suicidal\b/,
  /\b(feel|feeling|felt) suicidal\b/,
  /\b(thinking|thought|think) (about|of) suicide\b/,
  /\bbetter off without me\b/,
  /\bself[- ]?harm/,
  /\bhurt(ing)? myself\b/,
  /\bdon'?t want to (be here|live|wake up)\b/,
  /\b(want(ed)? to|wanna) die\b/,
  /\bno (point|reason) (in )?(living|going on)\b/,
  /\bhurt (someone|somebody|him|them)\b/,
]

const PAUSE_PATTERNS: RegExp[] = [
  /\bgive me (a|one) (sec|second|minute|min|moment)\b/,
  /\bi need (a|one) (sec|second|minute|min|moment|break)\b/,
  /\bhang on\b.*\b(cry|tears)/,
  /\bcry(ing)?\b/,
  /\bcried\b/,
  /\btears?\b/,
  /\bin bits\b/,
  /\b(died|dying(?! to\b)|passed away|passed on|funeral|buried)\b/,
  /\bsuicid(e|al)\b/,
  /\bkill(ing)? myself\b/,
  /\b(so|really|very|too|properly|fucking) (angry|mad|pissed( off)?)\b/,
  /\bi'?m angry\b/,
  /\b(furious|fuming|livid|seething|enraged)\b/,
  /\bgriev(e|ing|f)\b/,
  /\bcan'?t do this\b/,
  /\bhard to (talk|say|think) about\b/,
  /\b(it'?s|this is|that'?s|it was|this was|that was|getting|all) (a bit |just |all )?too much\b/,
  /\bbreaking down\b/,
  /\bfalling apart\b/,
  /\bashamed\b/,
  /\bshame\b/,
  /\b(it|that) (still )?hurts\b/,
  /\bheartbroken\b/,
  /\bupset\b/,
]

/** Weak cues: only count alongside a pause or risk cue. */
const WEAK_PATTERNS: RegExp[] = [/\bsorry\b/]

export interface DistressResult {
  triggered: boolean
  level: DistressLevel
  matched: string[]
}

export function detectDistress(message: string): DistressResult {
  // Every apostrophe variant (U+2018, U+2019, U+02BC, backtick, acute, prime) becomes a straight one.
  const text = message.toLowerCase().replace(/[‘’ʼ`´′]/g, "'")
  const hits = (list: RegExp[]) =>
    list.map((re) => text.match(re)?.[0]).filter((m): m is string => !!m)
  const risk = hits(RISK_PATTERNS)
  const pause = hits(PAUSE_PATTERNS)
  const weak = hits(WEAK_PATTERNS)
  if (risk.length) return { triggered: true, level: 'risk', matched: [...risk, ...pause, ...weak] }
  if (pause.length) return { triggered: true, level: 'pause', matched: [...pause, ...weak] }
  return { triggered: false, level: 'none', matched: [] }
}

// ── 4. invention check (shape mode) ────────────────────────────────

/** Capitalised words that are not names or facts when they start a sentence or stand alone. */
const COMMON_CAPITALISED = new Set(
  (
    'i a an the and but or so if then here there this that these those it its he she they we you ' +
    'your yours my mine our his her their what which who whom whose when where why how ' +
    'maybe perhaps or option one two three first second third yes no not now just only also ' +
    'start begin open close end try keep take leave let tell say said ask think feel ' +
    'ivor blkout draft suggestion suggestions way ways line lines version versions ' +
    'words unreviewed reviewed speech king kings part ' +
    "i've i'm i'll i'd it's that's there's here's what's let's don't didn't doesn't can't won't isn't wasn't " +
    'do does did can could would should will shall may might must have has had is are was were be been am ' +
    'in on at to of for from with by as after before because while since until ' +
    'again still even all any each every some both either neither more most less ' +
    'okay ok right sure thanks thank good well fine great'
  ).split(/\s+/),
)

const NUMBER_WORDS = new Set(
  'zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen twenty thirty forty fifty sixty seventy eighty ninety hundred thousand million first second third fourth fifth sixth seventh eighth ninth tenth'.split(
    ' ',
  ),
)

/** Number words that are ordinary in Ivor's own framing ("two ways in", "one line"). */
const FRAMING_NUMBER_WORDS = new Set(['one', 'two', 'three', 'first', 'second', 'third'])

export interface InventionResult {
  status: GuardStatus
  flagged: string[]
  /**
   * Capitalised words he never said that only OPEN a sentence or line. Capitalisation there proves nothing
   * ("Going home..." vs "Jerome was..."), so the caller must have them checked for names, or treat them as flagged.
   */
  unsure: string[]
}

/**
 * Flags names, places and numbers in a shape-mode suggestion that do not appear
 * in the speaker's transcript. Heuristic: capitalised words (outside a small
 * common-word list) and digits / number words beyond simple framing counts.
 *
 * A capitalised word he never said that only OPENS a sentence or line goes in
 * `unsure`, not `flagged`: every sentence of a full draft starts with one, and
 * this check cannot tell "Going" from "Jerome". runSpeechTurn has `unsure`
 * checked for names and fails closed if that check is unavailable.
 */
export function checkInvention(suggestion: string, speakerTranscript: string): InventionResult {
  const transcriptWords = new Set(normaliseText(speakerTranscript).split(' ').filter(Boolean))
  const flagged: string[] = []
  const unsure: string[] = []
  const seen = new Set<string>()
  const text = suggestion.replace(/[‘’]/g, "'")

  for (const m of text.matchAll(/[A-Za-z][A-Za-z'-]*|\d[\d,.:]*/g)) {
    const tok = m[0].replace(/'s$/i, '').replace(/[.,:]+$/, '')
    const lower = tok.toLowerCase()
    if (!tok || seen.has(lower)) continue
    let candidate = false
    // 2027 is the year the whole piece looks toward (Part 2 is "Your hopes for 2027"): the frame's own figure, not an invented one.
    if (/^\d/.test(tok)) candidate = tok !== '2027' && !isListMarker(text, m.index!, m[0])
    else if (NUMBER_WORDS.has(lower) && !FRAMING_NUMBER_WORDS.has(lower)) candidate = true
    else if (/^[A-Z]/.test(tok) && !COMMON_CAPITALISED.has(lower)) candidate = true
    if (!candidate) continue
    if (transcriptWords.has(normaliseText(tok))) { seen.add(lower); continue }
    // An opener stays unseen, so the same word mid-sentence later is still flagged outright.
    if (/^[A-Z]/.test(tok) && startsSentence(text, m.index!)) { if (!unsure.includes(tok)) unsure.push(tok); continue }
    seen.add(lower)
    flagged.push(tok)
  }
  return { status: flagged.length ? 'FAILED' : 'PASSED', flagged, unsure: unsure.filter((w) => !flagged.includes(w)) }
}

/** True when the word at `index` opens the text, a line, a list item, a quotation or a sentence. */
function startsSentence(text: string, index: number): boolean {
  const before = text.slice(0, index).replace(/[ \t"“'(\[*_-]+$/, '')
  return before === '' || /[.!?:;\n]$/.test(before) || /(^|\n)\s*\d+[.)]$/.test(before)
}

/** "1." or "2)" opening a line is list numbering, not a figure he might not have said. */
function isListMarker(text: string, index: number, raw: string): boolean {
  return /^\d{1,2}[.)]?$/.test(raw) && /(^|\n)[ \t]*$/.test(text.slice(0, index)) && /^[.)]?\s/.test(text.slice(index + raw.replace(/[.)]$/, '').length))
}

// ── 5. full-stop reply check ───────────────────────────────────────

const FULL_STOP_FORBIDDEN: RegExp[] = [
  /exactly what we need/,
  /\b(powerful|important|valuable|useful|beautiful|great material|good material)\b/,
  /\bthis is (gold|perfect)\b/,
  /\bwhat did you (decide|do|feel|learn)\b/,
  /\bhow did (that|it|you) (make you )?feel\b/,
  /\btell me more\b/,
  // The full-stop screen has no text box: never ask him to type.
  /\bsay so\b/,
  /\bjust say\b/,
]

export const MAX_WORDS_FULL_STOP = 60

export interface FullStopResult {
  status: GuardStatus
  reasons: string[]
}

/**
 * When emotion rises the interview stops: no question about what surfaced,
 * no praise, no interpretation. The only question allowed is which option he
 * wants, so any question that does not name the options fails.
 */
export function checkFullStopReply(reply: string): FullStopResult {
  const reasons: string[] = []
  const lower = reply.toLowerCase()
  for (const re of FULL_STOP_FORBIDDEN) {
    const m = lower.match(re)
    if (m) reasons.push(`forbidden in full stop: "${m[0]}"`)
  }
  const questions = reply.split(/(?<=[?])/).filter((s) => s.includes('?'))
  for (const q of questions) {
    const ql = q.toLowerCase()
    const aboutOptions = /\b(stay|change the subject|stop for today|pause|which|leave it out|only for you)\b/.test(ql)
    if (!aboutOptions) reasons.push(`question not about the options: "${q.trim()}"`)
  }
  if (questions.length > 1) reasons.push(`${questions.length} questions (max 1, about the options)`)
  const wc = countWords(reply)
  if (wc > MAX_WORDS_FULL_STOP) reasons.push(`reply is ${wc} words (limit ${MAX_WORDS_FULL_STOP} in full stop)`)
  return { status: reasons.length ? 'FAILED' : 'PASSED', reasons }
}
