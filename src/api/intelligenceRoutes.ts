/**
 * IVOR Intelligence API Routes
 * Exposes conversation intelligence and community insights
 * Part of BLKOUT Self-Improving System (Phase 1.3)
 */

import { Router, Request, Response } from 'express';
import conversationIntelligenceService from '../services/ConversationIntelligenceService.js';

const router = Router();

/**
 * GET /api/intelligence/status
 * Get intelligence service status
 */
router.get('/status', async (req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      status: {
        initialized: conversationIntelligenceService.isInitialized(),
        aiExtractEnabled: conversationIntelligenceService.isAIExtractEnabled(),
        service: 'conversation-intelligence',
        version: '1.0.0'
      }
    });
  } catch (error) {
    console.error('Error getting intelligence status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get intelligence status'
    });
  }
});

/**
 * GET /api/intelligence/community-insights
 * Get aggregated community insights from IVOR conversations
 * Used by "What's the community asking?" dashboard
 */
router.get('/community-insights', async (req: Request, res: Response) => {
  try {
    const insights = await conversationIntelligenceService.getCommunityInsights();

    if (!insights) {
      return res.json({
        success: true,
        insights: null,
        message: 'No insights available yet - conversations will be analyzed as they occur'
      });
    }

    res.json({
      success: true,
      insights,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching community insights:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch community insights'
    });
  }
});

/**
 * POST /api/intelligence/resource-feedback
 * Record feedback on a recommended resource
 */
router.post('/resource-feedback', async (req: Request, res: Response) => {
  try {
    const { sessionId, resourceId, wasHelpful } = req.body;

    if (!sessionId || !resourceId || wasHelpful === undefined) {
      return res.status(400).json({
        success: false,
        error: 'sessionId, resourceId, and wasHelpful are required'
      });
    }

    await conversationIntelligenceService.recordResourceFeedback(
      sessionId,
      resourceId,
      wasHelpful
    );

    res.json({
      success: true,
      message: 'Feedback recorded successfully'
    });
  } catch (error) {
    console.error('Error recording resource feedback:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to record feedback'
    });
  }
});

/**
 * POST /api/intelligence/end-conversation
 * Manually trigger end of conversation analysis
 * (Normally called automatically after inactivity)
 */
router.post('/end-conversation', async (req: Request, res: Response) => {
  try {
    const { sessionId, userId, journeyStage } = req.body;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: 'sessionId is required'
      });
    }

    // Generate a conversation ID
    const conversationId = `conv-${Date.now()}-${sessionId.substring(0, 8)}`;

    await conversationIntelligenceService.storeConversationIntelligence(
      conversationId,
      sessionId,
      userId || 'anonymous',
      journeyStage || 'growth'
    );

    res.json({
      success: true,
      conversationId,
      message: 'Conversation intelligence stored successfully'
    });
  } catch (error) {
    console.error('Error ending conversation:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to store conversation intelligence'
    });
  }
});

/**
 * GET /api/intelligence/trending
 * Get current trending topics from community conversations
 */
router.get('/trending', async (req: Request, res: Response) => {
  try {
    const insights = await conversationIntelligenceService.getCommunityInsights();

    res.json({
      success: true,
      trendingTopics: insights?.trendingTopics || [],
      emotionalToneBreakdown: insights?.emotionalToneBreakdown || {},
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching trending topics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch trending topics'
    });
  }
});

export default router;
