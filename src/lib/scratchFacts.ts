// Verified facts about Making Ourselves From Scratch for AIvor's prompt.
// Source: https://blkoutuk.com/scratch (checked 30 Sep 2026). Same pattern as the
// picnic block in conversationService.ts: facts only, dated, and gated so AIvor
// stops describing a closed application as open.

export const SCRATCH_APPLY_URL = 'https://blkoutuk.com/scratch'
export const SCRATCH_BRIEFING_URL =
  'https://commons.blkoutuk.com/scratch-assets/making-ourselves-from-scratch-briefing.pdf'
export const SCRATCH_CONTACT = 'rob@blkoutuk.com'

const CLOSES = '2026-10-05'
const ENDS = '2026-12-28'

const WHAT = `MAKING OURSELVES FROM SCRATCH — VERIFIED PROGRAMME FACTS (a BLKOUT programme in Croydon, funded by Croydon Loves You 2026, Croydon Culture. Answer questions about it warmly and plainly; nothing here is a secret.)
- What: eight Black queer men in Croydon come to three workshops on one theme, invitation from a place. They build a life-size cover of BLKOUT Review, BLKOUT's forthcoming magazine, and photograph each other in it. It ends on Monday 28 December, Joseph Beam Day, with a dinner each man hosts.
- Who it is for: Black gay, bi and trans men in Croydon. No experience of writing, performing or being photographed is needed.
- The three workshops: (1) choose a Croydon place that carries our history and write a monologue of invitation from it, with writer and performer Derek Aidoo; (2) a storytelling workshop with Rob Berkeley, the story you would tell a stranger cut to one line, then work the monologue and record it in your own voice; (3) a Saturday afternoon building the life-size cover together, then photographing each other in it, each under his own headline.
- Joseph Beam Day: Monday 28 December, in the Living Room at Stanley Arts. Each man's people at his table, the recordings published that day, the printed cover to take home. Joseph Beam was a Black gay writer who wrote that Black men loving Black men is the revolutionary act.
- When: late October to November 2026, two weekday evenings and one Saturday afternoon. BLKOUT confirms the exact dates with the group before starting.
- Where: Croydon Voluntary Action's Waterside Centre, South Norwood. Joseph Beam Day is at Stanley Arts.
- Staying in touch: the group has its own group on BLKOUTHUB. If someone is not on it yet, BLKOUT helps them join.
- After each session there are a couple of short questions about how it went. They help BLKOUT learn and let the funder hear what the programme meant.`

const OPEN = `${WHAT}
- HOW TO APPLY: the form at ${SCRATCH_APPLY_URL} takes about three minutes, with no test and no wrong answer. Applications close on 5 October 2026. The full briefing (PDF) is at ${SCRATCH_BRIEFING_URL}. Both are verified URLs you may share. For questions first: ${SCRATCH_CONTACT}.
- What happens after applying: an automatic note straight away, then a person from BLKOUT gets in touch within 48 hours. Places are confirmed after applications close.
- HARD RULES for this programme: never say or imply that someone has a place or will be chosen, and never say who has applied. There are eight places, so do not say anyone can join. You cannot take applications: send people to the form, and do not ask for or accept personal details in the chat for this programme. If someone says they are not in Croydon or not a man, say gently who it is for, and that BLKOUT has other things, without inventing specifics. If asked about anything not written above (fees, food, access details, exact dates), say you do not have it and point to ${SCRATCH_CONTACT}.`

const CLOSED = `${WHAT}
- Applications closed on 5 October 2026 and places are being confirmed. You cannot take applications. For questions: ${SCRATCH_CONTACT}. The full briefing (PDF) is at ${SCRATCH_BRIEFING_URL}, a verified URL you may share.
- HARD RULES for this programme: never say or imply that someone has a place, and never say who has applied. If asked about anything not written above, say you do not have it and point to ${SCRATCH_CONTACT}.`

/** today is an ISO date, YYYY-MM-DD. Returns '' outside the programme's life. */
export function scratchFacts(today: string): string {
  if (today <= CLOSES) return OPEN
  if (today <= ENDS) return CLOSED
  return ''
}
