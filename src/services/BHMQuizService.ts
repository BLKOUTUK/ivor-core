/**
 * BHM AIvor Icons Quiz — October 2026 only.
 * Spec: blkout/projects/bhm-2026/docs/aivor-quiz-spec.md
 *
 * Deliberately deterministic, not LLM-judged: a prize mechanism must never be
 * hallucinated (a wrong letter, a false "you've won", a fabricated entry).
 * This intercepts quiz-relevant messages before the LLM is ever called and
 * falls through ({handled: false}) for everything else, so normal IVOR chat
 * is untouched outside these specific turns.
 */

import { getSupabaseClient } from '../lib/supabaseClient.js'

// Starts a week early (24 Sep) — 1 Oct is already congested with the rest of
// the BHM campaign's own gateway content. Draw stays end of BHM, 31 October.
const QUIZ_START = new Date('2026-09-24T00:00:00Z')
const QUIZ_END = new Date('2026-11-01T00:00:00Z')

interface QuizQuestion {
  letter: string
  q: string
  match: RegExp
}

const QUESTIONS: QuizQuestion[] = [
  {
    letter: 'I',
    q: "Which BLKOUT Icon was the Black queer civil servant who welcomed the Windrush in 1948?",
    match: /cummings/i,
  },
  {
    letter: 'C',
    q: "Which Icon founded Britain's first Black ballet company, in 1946?",
    match: /pasuka/i,
  },
  {
    letter: 'O',
    q: "Which Icon ran a shebeen before turning to art nobody taught her?",
    match: /alcock/i,
  },
  {
    letter: 'N',
    q: "Which Icon became the first Black footballer to command a £1 million transfer fee?",
    match: /fashanu/i,
  },
]

const TARGET_WORD = 'ICON'
const QUIZ_TRIGGER = /\bquiz\b/i
const WORD_GUESS = /\bicons?\b/i
const EMAIL_PATTERN = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/

interface QuizProgress {
  session_id: string
  letters_collected: string[]
  word_solved: boolean
  entered: boolean
}

function inOctoberWindow(): boolean {
  // Override for local testing / an early preview, without waiting for the calendar
  if (process.env.BHM_QUIZ_FORCE_ACTIVE === 'true') return true
  const now = new Date()
  return now >= QUIZ_START && now < QUIZ_END
}

function currentQuestion(progress: QuizProgress): QuizQuestion | null {
  return QUESTIONS.find(q => !progress.letters_collected.includes(q.letter)) || null
}

function scrambled(letters: string[]): string {
  return [...letters].sort(() => Math.random() - 0.5).join(' ')
}

async function getProgress(sessionId: string): Promise<QuizProgress | null> {
  const supabase = getSupabaseClient()
  if (!supabase) return null

  const { data, error } = await supabase
    .from('bhm_quiz_progress')
    .select('*')
    .eq('session_id', sessionId)
    .maybeSingle()

  if (error) {
    console.error('[BHMQuiz] Error fetching progress:', error.message)
    return null
  }
  return data as QuizProgress | null
}

async function createProgress(sessionId: string): Promise<QuizProgress> {
  const supabase = getSupabaseClient()!
  const fresh: QuizProgress = { session_id: sessionId, letters_collected: [], word_solved: false, entered: false }

  const { error } = await supabase.from('bhm_quiz_progress').insert(fresh)
  if (error) console.error('[BHMQuiz] Error creating progress:', error.message)

  return fresh
}

async function saveLetter(sessionId: string, letters: string[], wordSolved: boolean): Promise<void> {
  const supabase = getSupabaseClient()!
  const { error } = await supabase
    .from('bhm_quiz_progress')
    .update({ letters_collected: letters, word_solved: wordSolved, updated_at: new Date().toISOString() })
    .eq('session_id', sessionId)

  if (error) console.error('[BHMQuiz] Error saving letter:', error.message)
}

async function saveEntry(sessionId: string, email: string): Promise<void> {
  const supabase = getSupabaseClient()!

  const { error: insertError } = await supabase
    .from('bhm_quiz_entries')
    .insert({ session_id: sessionId, email, submitted_word: TARGET_WORD })
  if (insertError) console.error('[BHMQuiz] Error saving entry:', insertError.message)

  const { error: updateError } = await supabase
    .from('bhm_quiz_progress')
    .update({ entered: true, updated_at: new Date().toISOString() })
    .eq('session_id', sessionId)
  if (updateError) console.error('[BHMQuiz] Error marking entered:', updateError.message)
}

/**
 * A one-line, answer-free status hint for the system prompt, so normal IVOR
 * chat can gently nudge someone back to an open quiz without ever being told
 * the letters or the target word. Cheap: empty outside October or with no
 * progress row.
 */
export async function getQuizStatusHint(sessionId: string): Promise<string> {
  if (!inOctoberWindow()) return ''

  const progress = await getProgress(sessionId)
  if (!progress || progress.entered) return ''

  if (progress.word_solved) {
    return "They've solved the AIvor Icons Quiz and just need to give their email to enter the draw — if relevant, remind them to do that."
  }

  const count = progress.letters_collected.length
  return `They're partway through the AIvor Icons Quiz (${count} of ${QUESTIONS.length} letters). If relevant, gently encourage them to say "quiz" to continue — never reveal which letter goes with which question or what the answer is.`
}

export async function handleQuizMessage(
  message: string,
  sessionId: string
): Promise<{ handled: boolean; response?: string }> {
  if (!inOctoberWindow()) return { handled: false }

  const supabase = getSupabaseClient()
  if (!supabase) return { handled: false }

  let progress = await getProgress(sessionId)

  // No progress yet — only start on an explicit ask
  if (!progress) {
    if (!QUIZ_TRIGGER.test(message)) return { handled: false }

    progress = await createProgress(sessionId)
    const first = QUESTIONS[0]
    return {
      handled: true,
      response: `AIvor's Icons Quiz is on! Four questions about the BLKOUT Icons. Get each right and I'll give you a letter — collect all four and unscramble them to win a BLKOUT Icons tee (one draw, 31 October).\n\nQuestion 1: ${first.q}`,
    }
  }

  // Already entered — nothing left to do
  if (progress.entered) {
    return { handled: true, response: "You're already in the draw — good luck! Winner picked 31 October." }
  }

  // Word solved, waiting on email
  if (progress.word_solved) {
    const emailMatch = message.match(EMAIL_PATTERN)
    if (emailMatch) {
      await saveEntry(sessionId, emailMatch[0])
      return {
        handled: true,
        response: "You're in! I've got your email just to reach you if you win — nothing else. Draw is 31 October. Good luck!",
      }
    }
    return {
      handled: true,
      response: "Nearly there — what's your email? Just to reach you if you win, nothing else.",
    }
  }

  // Mid-quiz: status check
  if (QUIZ_TRIGGER.test(message) && !currentQuestion(progress)) {
    // all letters collected but somehow not marked solved — fall through to word-guess handling below
  } else if (QUIZ_TRIGGER.test(message)) {
    const q = currentQuestion(progress)!
    return {
      handled: true,
      response: `You've got ${progress.letters_collected.length} letter${progress.letters_collected.length === 1 ? '' : 's'} so far. Current question: ${q.q}`,
    }
  }

  const question = currentQuestion(progress)

  // All four letters collected — waiting on the unscrambled word
  if (!question) {
    if (WORD_GUESS.test(message) && new RegExp(TARGET_WORD, 'i').test(message.replace(/\s+/g, ''))) {
      await saveLetter(sessionId, progress.letters_collected, true)
      return {
        handled: true,
        response: "That's it — ICON! What's your email so I can enter you in the draw? Just to reach you if you win, nothing else.",
      }
    }
    return { handled: false }
  }

  // Reject an early word guess before all letters are earned
  if (WORD_GUESS.test(message) && progress.letters_collected.length < QUESTIONS.length) {
    return {
      handled: true,
      response: `Not yet — you need all four letters first. Current question: ${question.q}`,
    }
  }

  // Check the answer to the current question
  if (question.match.test(message)) {
    const letters = [...progress.letters_collected, question.letter]
    const solved = letters.length === QUESTIONS.length
    await saveLetter(sessionId, letters, false)

    if (solved) {
      return {
        handled: true,
        response: `Got it! Your letter: ${question.letter}. That's all four — you have ${scrambled(letters)}. Unscramble them and tell me the word to enter the draw.`,
      }
    }

    const next = QUESTIONS[letters.length]
    return {
      handled: true,
      response: `Got it! Your letter: ${question.letter}. Question ${letters.length + 1}: ${next.q}`,
    }
  }

  // Not a match — let normal IVOR handle it (system prompt gently reminds, never reveals answers)
  return { handled: false }
}
