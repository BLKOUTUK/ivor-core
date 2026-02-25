import express from 'express'
import { Request, Response } from 'express'
import crypto from 'crypto'
import { getSupabaseClient } from '../lib/supabaseClient.js'

const router = express.Router()

/**
 * Feedback API Routes for IVOR Trust Scoring System
 * Handles user ratings and feedback collection
 */

interface FeedbackRequest {
  responseId: string
  rating: number // 1-5 scale
  feedback?: string
  helpful?: boolean
  userAgent?: string
  sessionId?: string
}

interface RatingRequest {
  knowledgeEntryId: string
  rating: number // 1-5 scale
  feedback?: string
  userAgent?: string
}

/**
 * Create anonymous user hash for privacy-preserving feedback
 */
function createUserHash(ip: string, userAgent: string = ''): string {
  const hash = crypto.createHash('sha256')
  hash.update(ip + userAgent + process.env.HASH_SALT || 'default-salt')
  return hash.digest('hex').substring(0, 16)
}

/**
 * POST /api/feedback - Submit feedback for IVOR response
 */
router.post('/feedback', async (req: Request, res: Response) => {
  try {
    const {
      responseId,
      rating,
      feedback,
      helpful,
      userAgent,
      sessionId
    }: FeedbackRequest = req.body

    // Validation
    if (!responseId || !rating) {
      return res.status(400).json({
        error: 'Missing required fields: responseId and rating'
      })
    }

    if (rating < 1 || rating > 5 || !Number.isInteger(rating)) {
      return res.status(400).json({
        error: 'Rating must be an integer between 1 and 5'
      })
    }

    // Create anonymous user identifier
    const userHash = createUserHash(
      req.ip || req.connection.remoteAddress || 'unknown',
      userAgent || req.get('User-Agent') || ''
    )

    // Store feedback (in production, this would go to Supabase)
    const feedbackData = {
      id: crypto.randomUUID(),
      responseId,
      userHash,
      rating,
      feedback: feedback?.substring(0, 1000), // Limit feedback length
      helpful,
      sessionId,
      userAgent: userAgent?.substring(0, 200), // Limit UA length
      ipHash: crypto.createHash('md5').update(req.ip || 'unknown').digest('hex'),
      createdAt: new Date().toISOString()
    }

    // Store in Supabase
    const supabase = getSupabaseClient()
    if (supabase) {
      const { error: dbError } = await supabase.from('ivor_feedback').insert({
        id: feedbackData.id,
        session_id: sessionId || null,
        user_hash: feedbackData.userHash,
        rating: feedbackData.rating,
        feedback_text: feedbackData.feedback || null,
        message_index: 0,
        created_at: feedbackData.createdAt
      })
      if (dbError) {
        console.error('[Feedback] DB insert error:', dbError.message)
      }
    }

    console.log('📝 IVOR Feedback stored:', {
      responseId: feedbackData.responseId,
      rating: feedbackData.rating,
      helpful: feedbackData.helpful,
      userHash: feedbackData.userHash.substring(0, 8) + '...'
    })

    res.json({
      success: true,
      message: 'Thank you for your feedback! This helps IVOR learn and improve.',
      feedbackId: feedbackData.id
    })

  } catch (error) {
    console.error('Error processing feedback:', error)
    res.status(500).json({
      error: 'Internal server error processing feedback'
    })
  }
})

/**
 * POST /api/rate-knowledge - Rate a specific knowledge entry
 */
router.post('/rate-knowledge', async (req: Request, res: Response) => {
  try {
    const {
      knowledgeEntryId,
      rating,
      feedback,
      userAgent
    }: RatingRequest = req.body

    // Validation
    if (!knowledgeEntryId || !rating) {
      return res.status(400).json({
        error: 'Missing required fields: knowledgeEntryId and rating'
      })
    }

    if (rating < 1 || rating > 5 || !Number.isInteger(rating)) {
      return res.status(400).json({
        error: 'Rating must be an integer between 1 and 5'
      })
    }

    // Create anonymous user identifier
    const userHash = createUserHash(
      req.ip || req.connection.remoteAddress || 'unknown',
      userAgent || req.get('User-Agent') || ''
    )

    const ratingData = {
      id: crypto.randomUUID(),
      knowledgeEntryId,
      userHash,
      rating,
      feedback: feedback?.substring(0, 1000),
      createdAt: new Date().toISOString()
    }

    // Store in ivor_feedback table
    const supabase = getSupabaseClient()
    if (supabase) {
      const { error: dbError } = await supabase.from('ivor_feedback').insert({
        id: ratingData.id,
        user_hash: ratingData.userHash,
        rating: ratingData.rating,
        feedback_text: ratingData.feedback || null,
        message_index: 0,
        created_at: ratingData.createdAt
      })
      if (dbError) {
        console.error('[Feedback] Knowledge rating DB insert error:', dbError.message)
      }
    }

    console.log('⭐ Knowledge Rating stored:', {
      knowledgeEntryId: ratingData.knowledgeEntryId,
      rating: ratingData.rating,
      userHash: ratingData.userHash.substring(0, 8) + '...'
    })

    res.json({
      success: true,
      message: 'Thank you for rating this information! Your input helps improve accuracy.',
      ratingId: ratingData.id
    })

  } catch (error) {
    console.error('Error processing knowledge rating:', error)
    res.status(500).json({
      error: 'Internal server error processing rating'
    })
  }
})

/**
 * GET /api/feedback/stats - Get anonymous feedback statistics
 */
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const supabase = getSupabaseClient()
    let stats = {
      totalFeedback: 0,
      averageRating: 0,
      lastUpdated: new Date().toISOString()
    }

    if (supabase) {
      const { data, error } = await supabase
        .from('ivor_feedback')
        .select('rating')
      if (!error && data && data.length > 0) {
        const ratings = data.filter((d: any) => d.rating != null)
        stats.totalFeedback = ratings.length
        stats.averageRating = ratings.length > 0
          ? Math.round(ratings.reduce((sum: number, d: any) => sum + d.rating, 0) / ratings.length * 10) / 10
          : 0
      }
    }

    res.json({
      success: true,
      stats,
      message: 'Anonymous feedback statistics - no personal data included'
    })

  } catch (error) {
    console.error('Error fetching feedback stats:', error)
    res.status(500).json({
      error: 'Internal server error fetching statistics'
    })
  }
})

/**
 * POST /api/feedback/helpful - Quick helpful/not helpful rating
 */
router.post('/helpful', async (req: Request, res: Response) => {
  try {
    const { responseId, helpful } = req.body

    if (!responseId || typeof helpful !== 'boolean') {
      return res.status(400).json({
        error: 'Missing required fields: responseId and helpful (boolean)'
      })
    }

    const userHash = createUserHash(
      req.ip || req.connection.remoteAddress || 'unknown',
      req.get('User-Agent') || ''
    )

    // Store quick feedback
    const quickFeedback = {
      id: crypto.randomUUID(),
      responseId,
      userHash,
      helpful,
      rating: helpful ? 5 : 2, // Convert to rating scale
      feedbackType: 'quick',
      createdAt: new Date().toISOString()
    }

    const supabase = getSupabaseClient()
    if (supabase) {
      const { error: dbError } = await supabase.from('ivor_feedback').insert({
        id: quickFeedback.id,
        user_hash: quickFeedback.userHash,
        rating: quickFeedback.rating,
        feedback_text: helpful ? 'helpful' : 'not helpful',
        message_index: 0,
        created_at: quickFeedback.createdAt
      })
      if (dbError) {
        console.error('[Feedback] Quick feedback DB insert error:', dbError.message)
      }
    }

    console.log('👍 Quick Feedback stored:', {
      responseId: quickFeedback.responseId,
      helpful: quickFeedback.helpful,
      userHash: quickFeedback.userHash.substring(0, 8) + '...'
    })

    res.json({
      success: true,
      message: helpful ? 'Thanks! Glad this was helpful.' : 'Thanks for the feedback - we\'ll work to improve.'
    })

  } catch (error) {
    console.error('Error processing quick feedback:', error)
    res.status(500).json({
      error: 'Internal server error'
    })
  }
})

/**
 * Health check endpoint
 */
router.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'operational',
    service: 'feedback-api',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  })
})

export default router