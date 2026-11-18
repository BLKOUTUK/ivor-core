// Consulting AIvor about a gesture (being-met spec 5.9).
// Pure functions only: input contract, urgent check, prompt, output checks.
// Nothing here calls a model or sends an email.

export const THEMES = [
  'funding', 'health', 'events', 'joy', 'housing', 'belonging',
  'work', 'creative', 'information', 'other',
] as const
export type Theme = (typeof THEMES)[number]

export interface ConsultInput {
  gesture: string
  surface: string
  audience: 'man' | 'organisation'
  first_name?: string
  his_words?: string
  promise: { owed: string; follow_on?: string; not_promised?: string }
  allowed_links: string[]
}

export interface ConsultResult {
  urgent: boolean
  theme: Theme | null
  draft: string | null
  flags: string[]
}

const EMAIL = /[^\s@]+@[^\s@]+\.[^\s@]+/
// UK-style phone numbers, with or without spaces or a +44 prefix
const PHONE = /(?:\+44\s?7\d{3}|\b07\d{3})[\s-]?\d{3}[\s-]?\d{3}\b|\b0\d{2,4}[\s-]?\d{3,4}[\s-]?\d{3,4}\b/

// Deliberately broad. A false positive costs Rob a read; a false negative costs a man.
const URGENT = [
  /\bkill myself\b/i, /\bend (it|my life)\b/i, /\bsuicid/i, /\bwant to die\b/i,
  /\bself[- ]?harm/i, /\bhurt(ing)? myself\b/i, /\boverdos/i, /\bnot safe\b/i,
  /\bunsafe\b/i, /\bbeing (abused|attacked|threatened)\b/i, /\bhomeless\b/i,
  /\bno(where| one) to (go|turn)\b/i, /\bcan'?t go on\b/i, /\bdon'?t want to (be here|live)\b/i,
]

export function detectUrgent(text: string): boolean {
  return URGENT.some((re) => re.test(text))
}

export function containsPersonalIdentifiers(text: string): boolean {
  return EMAIL.test(text) || PHONE.test(text)
}

const cap = (v: unknown, max: number): string | null =>
  typeof v === 'string' && v.length <= max ? v : null

export function validateInput(raw: any): { ok: true; value: ConsultInput } | { ok: false; error: string } {
  if (!raw || typeof raw !== 'object') return { ok: false, error: 'body_required' }
  const gesture = cap(raw.gesture, 200)
  const surface = cap(raw.surface, 40)
  const audience = raw.audience === 'man' || raw.audience === 'organisation' ? raw.audience : null
  const p = raw.promise
  if (!gesture || !surface || !audience) return { ok: false, error: 'gesture_surface_audience_required' }
  if (!p || typeof p !== 'object' || !cap(p.owed, 300)) return { ok: false, error: 'promise_owed_required' }
  const first_name = raw.first_name === undefined ? undefined : cap(raw.first_name, 40)
  const his_words = raw.his_words === undefined ? undefined : cap(raw.his_words, 1500)
  const follow_on = p.follow_on === undefined ? undefined : cap(p.follow_on, 200)
  const not_promised = p.not_promised === undefined ? undefined : cap(p.not_promised, 300)
  if (first_name === null || his_words === null || follow_on === null || not_promised === null) {
    return { ok: false, error: 'field_too_long_or_wrong_type' }
  }
  const links = Array.isArray(raw.allowed_links) ? raw.allowed_links : []
  if (links.length > 10 || links.some((l: unknown) => typeof l !== 'string' || !/^https:\/\/[^\s]+$/.test(l))) {
    return { ok: false, error: 'allowed_links_invalid' }
  }
  const all = [gesture, surface, first_name, his_words, p.owed, follow_on, not_promised].filter(Boolean).join(' ')
  // The caller keeps email addresses and phone numbers. AIvor never receives them.
  if (containsPersonalIdentifiers(all)) return { ok: false, error: 'personal_identifiers_rejected' }
  return {
    ok: true,
    value: {
      gesture, surface, audience,
      first_name: first_name || undefined,
      his_words: his_words || undefined,
      promise: { owed: p.owed, follow_on: follow_on || undefined, not_promised: not_promised || undefined },
      allowed_links: links,
    },
  }
}

export function buildPrompt(i: ConsultInput): { system: string; user: string } {
  const system = [
    'You are AIvor, the assistant for BLKOUT, a community-owned organisation for Black queer men in the UK.',
    'You are drafting a short email reply for Rob Berkeley to approve. A person, not you, will send it.',
    'Rules, all hard:',
    '- British English. No emojis. Warm and plain, never gushing. 60 to 110 words.',
    '- Say plainly that this note comes from AIvor, BLKOUT\'s assistant, not from a person.',
    '- Promise only what is written under OWED. Do not promise a reply time, a place, support, or anything else.',
    '- If FOLLOW-ON is given, offer it once, lightly, as something available, never as a next step he must take.',
    '- Use only the links under ALLOWED LINKS. Invent no facts, names, dates, venues or links.',
    '- If HIS WORDS are given, refer to what he actually said in a few words. Do not repeat it back at length and do not guess anything about him.',
    '- Do not mention sexuality, health or any personal detail beyond what he wrote.',
    'Return only JSON: {"theme": one of ' + THEMES.join('|') + ', "draft": string}. The draft has no greeting line other than his first name if given, and no signature.',
  ].join('\n')
  const user = [
    `GESTURE: ${i.gesture}`,
    `SURFACE: ${i.surface}`,
    `AUDIENCE: ${i.audience}`,
    `FIRST NAME: ${i.first_name ?? '(none)'}`,
    `HIS WORDS: ${i.his_words ?? '(none)'}`,
    `OWED: ${i.promise.owed}`,
    `FOLLOW-ON: ${i.promise.follow_on ?? '(none)'}`,
    `NOT PROMISED: ${i.promise.not_promised ?? '(none)'}`,
    `ALLOWED LINKS: ${i.allowed_links.length ? i.allowed_links.join(' ') : '(none)'}`,
  ].join('\n')
  return { system, user }
}

// A draft that breaks a rule is refused, never repaired quietly.
export function checkOutput(raw: string, i: ConsultInput): ConsultResult {
  let parsed: any
  try {
    const m = raw.match(/\{[\s\S]*\}/)
    parsed = m ? JSON.parse(m[0]) : null
  } catch {
    parsed = null
  }
  const refuse = (flag: string): ConsultResult => ({ urgent: false, theme: null, draft: null, flags: [flag] })
  if (!parsed || typeof parsed.draft !== 'string' || typeof parsed.theme !== 'string') return refuse('model_output_not_json')
  const theme = (THEMES as readonly string[]).includes(parsed.theme) ? (parsed.theme as Theme) : 'other'
  const draft = parsed.draft.trim()
  if (draft.length < 40 || draft.length > 900) return refuse('draft_length_out_of_range')
  if (containsPersonalIdentifiers(draft)) return refuse('draft_contains_identifier')
  const urls = draft.match(/https?:\/\/[^\s)]+/g) ?? []
  if (urls.some((u) => !i.allowed_links.includes(u.replace(/[.,;]+$/, '')))) return refuse('draft_uses_unlisted_link')
  if (!/\bAIvor\b/.test(draft)) return refuse('draft_does_not_say_it_is_aivor')
  if (/\p{Extended_Pictographic}/u.test(draft)) return refuse('draft_contains_emoji')
  return { urgent: false, theme, draft, flags: [] }
}
