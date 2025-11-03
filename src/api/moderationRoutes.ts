import express from 'express'
import Groq from 'groq-sdk'

const router = express.Router()

// Initialize Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || ''
})

interface ModerationRequest {
  content: {
    type: 'event' | 'news'
    title: string
    description: string
    organizer_name?: string
    tags?: string[]
    source_url: string
    location?: string
    event_date?: string
  }
  moderation_type: 'event_relevance' | 'news_relevance'
}

interface ModerationResult {
  confidence: number // 0-1 scale
  relevance: 'high' | 'medium' | 'low'
  quality: 'high' | 'medium' | 'low'
  liberation_score: number // 0-1 scale
  reasoning: string
  recommendation: 'auto-approve' | 'review' | 'reject'
  processing_time_ms: number
  flags?: string[] // Any warnings or issues detected
}

/**
 * IVOR AI Moderation Endpoint
 * Analyzes scraped content for relevance to Black QTIPOC+ communities
 */
router.post('/moderate', async (req, res) => {
  const startTime = Date.now()

  try {
    const { content, moderation_type }: ModerationRequest = req.body

    // Validate required fields
    if (!content || !content.title || !content.description) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['content.title', 'content.description']
      })
    }

    // Build moderation prompt based on content type
    const prompt = buildModerationPrompt(content, moderation_type)

    // Call Groq API for AI moderation
    const completion = await groq.chat.completions.create({
      model: 'llama-3.1-70b-versatile',
      messages: [
        {
          role: 'system',
          content: 'You are IVOR, an AI moderator for the BLKOUT Liberation Platform. You analyze content for relevance to Black queer and trans communities in the UK. Always respond with valid JSON only.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3, // Low temperature for consistent moderation decisions
      max_tokens: 600,
      response_format: { type: 'json_object' }
    })

    // Parse AI response
    const aiResponse = completion.choices[0]?.message?.content
    if (!aiResponse) {
      throw new Error('No response from AI model')
    }

    let moderationResult: ModerationResult
    try {
      const parsed = JSON.parse(aiResponse)
      moderationResult = {
        confidence: parsed.confidence || 0,
        relevance: parsed.relevance || 'low',
        quality: parsed.quality || 'low',
        liberation_score: parsed.liberation_score || 0,
        reasoning: parsed.reasoning || 'No reasoning provided',
        recommendation: parsed.recommendation || 'review',
        processing_time_ms: Date.now() - startTime,
        flags: parsed.flags || []
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', aiResponse)
      throw new Error('Invalid AI response format')
    }

    // Add metadata
    const response = {
      ...moderationResult,
      content_type: content.type,
      analyzed_at: new Date().toISOString(),
      model_used: 'llama-3.1-70b-versatile',
      source_url: content.source_url
    }

    // Log moderation for training data collection
    logModerationDecision(content, moderationResult)

    res.json(response)

  } catch (error) {
    console.error('Moderation error:', error)

    // Return fallback response (conservative - requires human review)
    res.status(500).json({
      error: 'Moderation failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      confidence: 0,
      relevance: 'low',
      quality: 'low',
      liberation_score: 0,
      reasoning: 'AI moderation failed - requires manual review',
      recommendation: 'review',
      processing_time_ms: Date.now() - startTime
    })
  }
})

/**
 * Build moderation prompt based on content type
 */
function buildModerationPrompt(content: any, type: string): string {
  const baseContext = `
You are IVOR, the AI moderator for BLKOUT - a liberation platform for and by Black queer and trans people in the UK.

Your role: Analyze this ${content.type} to determine if it's relevant and valuable for Black QTIPOC+ communities.

Content to analyze:
- Title: "${content.title}"
- Description: "${content.description}"
- Organizer/Source: "${content.organizer_name || 'Unknown'}"
- Tags: ${content.tags?.join(', ') || 'None'}
- Location: "${content.location || 'Not specified'}"
- Source URL: "${content.source_url}"
${content.event_date ? `- Date: "${content.event_date}"` : ''}

Evaluation criteria:

1. **Relevance** (Is this specifically for Black QTIPOC+ people?):
   - HIGH: Explicitly mentions Black + LGBTQ+ (e.g., "Black Trans Liberation", "QTIPOC gathering", "African/Caribbean queer community")
   - MEDIUM: Mentions one but not both (e.g., "Black community event" or "LGBTQ+ gathering" but not specifically for Black people)
   - LOW: General diversity/inclusion with no specific focus on Black queer/trans people

2. **Quality** (Is this legitimate and safe?):
   - HIGH: Verified organization (LGBT Foundation, UK Black Pride, Stonewall, known community groups)
   - MEDIUM: Known local community group or grassroots organization
   - LOW: Unknown source, suspicious content, potential spam

3. **Liberation Focus** (Does this align with Black queer liberation values?):
   - HIGH: Explicitly anti-racist, anti-capitalist, community-led, mutual aid, activism, healing, grassroots organizing
   - MEDIUM: Generally progressive, inclusive, supportive but not explicitly liberation-focused
   - LOW: Corporate/commercial, apolitical, or potentially harmful to marginalized communities

4. **Red Flags** (Check for these issues):
   - Fetishization or exoticization of Black bodies
   - Corporate Pride-washing or rainbow capitalism
   - TERFs, SWERFs, or other exclusionary groups
   - "Diversity training" for corporations (not community-focused)
   - Events requiring high cost that exclude working-class people
   - Vague descriptions that could be spam

Based on your analysis, provide a confidence score (0-1) and recommendation:
- confidence ≥0.90 + HIGH relevance + HIGH quality = "auto-approve"
- confidence 0.70-0.89 + MEDIUM/HIGH relevance = "review" (curator quick check)
- confidence <0.70 or any red flags = "reject" or "review" (curator deep check)

RESPOND ONLY WITH THIS JSON FORMAT (no other text):
{
  "confidence": 0.95,
  "relevance": "high",
  "quality": "high",
  "liberation_score": 0.90,
  "reasoning": "This event is explicitly for Black trans people, organized by LGBT Foundation Manchester (trusted org with history of serving POC communities). Strong liberation focus on community organizing and self-care. No red flags detected.",
  "recommendation": "auto-approve",
  "flags": []
}
`

  return baseContext
}

/**
 * Log moderation decisions for future training
 */
function logModerationDecision(content: any, result: ModerationResult): void {
  // TODO: Store in database for future fine-tuning
  // For now, just log to console
  console.log('[IVOR Moderation]', {
    title: content.title,
    confidence: result.confidence,
    recommendation: result.recommendation,
    timestamp: new Date().toISOString()
  })
}

/**
 * Batch moderation endpoint (for processing multiple events at once)
 */
router.post('/moderate/batch', async (req, res) => {
  const startTime = Date.now()

  try {
    const { contents } = req.body

    if (!Array.isArray(contents) || contents.length === 0) {
      return res.status(400).json({
        error: 'contents must be a non-empty array'
      })
    }

    if (contents.length > 50) {
      return res.status(400).json({
        error: 'Maximum 50 items per batch'
      })
    }

    // Process all contents in parallel
    const results = await Promise.all(
      contents.map(async (content, index) => {
        try {
          // Make individual moderation request
          const moderationRequest = {
            content,
            moderation_type: content.type === 'event' ? 'event_relevance' : 'news_relevance'
          }

          const prompt = buildModerationPrompt(content, moderationRequest.moderation_type)

          const completion = await groq.chat.completions.create({
            model: 'llama-3.1-70b-versatile',
            messages: [
              {
                role: 'system',
                content: 'You are IVOR, an AI moderator for the BLKOUT Liberation Platform. Respond with valid JSON only.'
              },
              {
                role: 'user',
                content: prompt
              }
            ],
            temperature: 0.3,
            max_tokens: 600,
            response_format: { type: 'json_object' }
          })

          const aiResponse = completion.choices[0]?.message?.content
          const parsed = JSON.parse(aiResponse || '{}')

          return {
            index,
            content_id: content.id || content.title,
            success: true,
            result: {
              confidence: parsed.confidence || 0,
              relevance: parsed.relevance || 'low',
              quality: parsed.quality || 'low',
              liberation_score: parsed.liberation_score || 0,
              reasoning: parsed.reasoning || '',
              recommendation: parsed.recommendation || 'review',
              flags: parsed.flags || []
            }
          }
        } catch (error) {
          return {
            index,
            content_id: content.id || content.title,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            result: {
              confidence: 0,
              relevance: 'low',
              quality: 'low',
              liberation_score: 0,
              reasoning: 'Moderation failed',
              recommendation: 'review',
              flags: ['error']
            }
          }
        }
      })
    )

    // Calculate batch statistics
    const stats = {
      total: results.length,
      auto_approved: results.filter(r => r.result?.recommendation === 'auto-approve').length,
      review_needed: results.filter(r => r.result?.recommendation === 'review').length,
      rejected: results.filter(r => r.result?.recommendation === 'reject').length,
      failed: results.filter(r => !r.success).length,
      avg_confidence: results.reduce((sum, r) => sum + (r.result?.confidence || 0), 0) / results.length,
      processing_time_ms: Date.now() - startTime
    }

    res.json({
      results,
      stats,
      processed_at: new Date().toISOString()
    })

  } catch (error) {
    console.error('Batch moderation error:', error)
    res.status(500).json({
      error: 'Batch moderation failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

/**
 * Get moderation statistics
 */
router.get('/moderate/stats', async (req, res) => {
  // TODO: Implement stats from database
  res.json({
    message: 'Stats endpoint coming soon',
    hint: 'This will show accuracy metrics, approval rates, etc.'
  })
})

/**
 * Test endpoint for validating moderation logic
 */
router.post('/moderate/test', async (req, res) => {
  const testEvents = [
    {
      type: 'event',
      title: 'Black Trans Liberation Workshop',
      description: 'A workshop on self-care and community organizing for Black trans and non-binary people in Manchester.',
      organizer_name: 'LGBT Foundation Manchester',
      tags: ['black', 'trans', 'workshop', 'liberation'],
      source_url: 'https://lgbt.foundation/events/test',
      location: 'Manchester'
    },
    {
      type: 'event',
      title: 'Diversity Training for Corporations',
      description: 'A corporate diversity and inclusion training session.',
      organizer_name: 'Corporate Training Inc',
      tags: ['diversity', 'inclusion'],
      source_url: 'https://example.com/training',
      location: 'London'
    }
  ]

  try {
    const results = await Promise.all(
      testEvents.map(async (content) => {
        const prompt = buildModerationPrompt(content, 'event_relevance')

        const completion = await groq.chat.completions.create({
          model: 'llama-3.1-70b-versatile',
          messages: [
            {
              role: 'system',
              content: 'You are IVOR. Respond with valid JSON only.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.3,
          max_tokens: 600,
          response_format: { type: 'json_object' }
        })

        const parsed = JSON.parse(completion.choices[0]?.message?.content || '{}')
        return {
          title: content.title,
          result: parsed
        }
      })
    )

    res.json({
      test_results: results,
      expected: {
        event_1: 'Should auto-approve (Black trans specific, trusted org)',
        event_2: 'Should review/reject (corporate, not community-focused)'
      }
    })
  } catch (error) {
    res.status(500).json({
      error: 'Test failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

export default router
