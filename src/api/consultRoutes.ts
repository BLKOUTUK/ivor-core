import express, { Request, Response } from 'express'
import crypto from 'crypto'
import OpenAI from 'openai'
import { buildPrompt, checkOutput, detectUrgent, validateInput, type ConsultResult } from '../lib/consult.js'

// POST /api/consult/gesture
// Being-met spec 5.9: consult AIvor about a gesture and return a DRAFT reply.
// Nothing here sends an email. The caller keeps the person's email address and
// phone number: this route rejects any payload that contains one.
//
// Auth: shared secret in x-consult-secret, compared against CONSULT_SECRET.
// If CONSULT_SECRET or GROQ_API_KEY is unset the route refuses (fail closed);
// it never returns a made-up draft.

export interface ConsultDeps {
  secret: () => string | undefined
  complete: (system: string, user: string) => Promise<string>
}

const defaultDeps: ConsultDeps = {
  secret: () => process.env.CONSULT_SECRET,
  complete: async (system, user) => {
    const key = process.env.GROQ_API_KEY
    if (!key || key === 'your-groq-api-key-here') throw new Error('ai_disabled')
    const ai = new OpenAI({ apiKey: key, baseURL: 'https://api.groq.com/openai/v1' })
    const r = await ai.chat.completions.create({
      model: process.env.GROQ_MODEL || 'openai/gpt-oss-120b',
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      max_tokens: 600,
      temperature: 0.4,
    })
    return r.choices[0]?.message?.content ?? ''
  },
}

function sameSecret(a: string, b: string): boolean {
  const x = Buffer.from(a)
  const y = Buffer.from(b)
  return x.length === y.length && crypto.timingSafeEqual(x, y)
}

export function createConsultRouter(deps: ConsultDeps = defaultDeps) {
  const router = express.Router()

  router.post('/gesture', async (req: Request, res: Response) => {
    const expected = deps.secret()
    if (!expected) return res.status(503).json({ error: 'consult_not_configured' })
    const given = req.header('x-consult-secret') || ''
    if (!sameSecret(given, expected)) return res.status(403).json({ error: 'forbidden' })

    const v = validateInput(req.body)
    if ('error' in v) return res.status(400).json({ error: v.error })

    // Distress is read by a person. The words are not sent to the model.
    if (detectUrgent([v.value.gesture, v.value.his_words ?? ''].join(' '))) {
      const out: ConsultResult = { urgent: true, theme: null, draft: null, flags: ['urgent_read_by_rob'] }
      return res.json(out)
    }

    try {
      const { system, user } = buildPrompt(v.value)
      const raw = await deps.complete(system, user)
      return res.json(checkOutput(raw, v.value))
    } catch (e: any) {
      const code = e?.message === 'ai_disabled' ? 'ai_disabled' : 'model_call_failed'
      return res.status(503).json({ error: code })
    }
  })

  return router
}

export default createConsultRouter()
