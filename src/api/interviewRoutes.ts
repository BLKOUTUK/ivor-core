import { Router, type Request, type Response } from 'express'
import OpenAI from 'openai'
import { getInterviewSystemPrompt, getTableConfig } from '../data/interviewPrompts.js'

const router = Router()

// Initialise LLM client — same pattern as conversationService.ts
function createLLMClient(): { client: OpenAI; model: string } | null {
  const groqKey = process.env.GROQ_API_KEY
  const dashscopeKey = process.env.DASHSCOPE_API_KEY

  if (dashscopeKey && dashscopeKey !== 'your-dashscope-api-key-here') {
    return {
      client: new OpenAI({
        apiKey: dashscopeKey,
        baseURL: process.env.DASHSCOPE_BASE_URL || 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1',
      }),
      model: process.env.DASHSCOPE_MODEL || 'qwen-max',
    }
  }

  if (groqKey && groqKey !== 'your-groq-api-key-here') {
    return {
      client: new OpenAI({
        apiKey: groqKey,
        baseURL: 'https://api.groq.com/openai/v1',
      }),
      model: 'llama-3.3-70b-versatile',
    }
  }

  return null
}

const llm = createLLMClient()

/**
 * POST /api/interview
 *
 * Body: { tableId: number, message: string, sessionMessages: { role, content }[] }
 * Returns: { response: string, tableId: number }
 */
router.post('/', async (req: Request, res: Response) => {
  const { tableId, message, sessionMessages } = req.body

  // Validate
  if (!tableId || tableId < 1 || tableId > 7) {
    return res.status(400).json({ error: 'tableId must be 1–7' })
  }
  if (!message || typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({ error: 'message is required' })
  }

  const systemPrompt = getInterviewSystemPrompt(tableId)
  const config = getTableConfig(tableId)

  if (!systemPrompt || !config) {
    return res.status(400).json({ error: `No configuration for table ${tableId}` })
  }

  if (!llm) {
    return res.status(503).json({ error: 'LLM service not available' })
  }

  try {
    // Build message history
    const messages: OpenAI.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt },
      ...(Array.isArray(sessionMessages)
        ? sessionMessages
            .filter((m: { role: string }) => m.role === 'user' || m.role === 'assistant')
            .map((m: { role: string; content: string }) => ({
              role: m.role as 'user' | 'assistant',
              content: m.content,
            }))
        : []),
      { role: 'user', content: message.trim() },
    ]

    const completion = await llm.client.chat.completions.create({
      model: llm.model,
      messages,
      max_tokens: 500,
      temperature: 0.7,
    })

    const response = completion.choices[0]?.message?.content || 'The archive could not produce a response.'

    return res.json({ response, tableId })
  } catch (err) {
    console.error(`Interview API error (table ${tableId}):`, err)
    return res.status(500).json({ error: 'Archive temporarily unavailable' })
  }
})

/**
 * GET /api/interview/tables
 * Returns table configs (directions, prompts) — no system prompts exposed
 */
router.get('/tables', (_req: Request, res: Response) => {
  const { TABLE_CONFIGS } = require('../data/interviewPrompts.js')
  return res.json({ tables: TABLE_CONFIGS })
})

export default router
