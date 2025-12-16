/**
 * Liberation Dashboard API Routes for IVOR Core
 * Exposes Layer 3 analytics and liberation metrics
 *
 * Liberation Features:
 * - Real-time liberation score analytics
 * - Content moderation queue summary
 * - Community alignment metrics
 *
 * BLKOUT Community Liberation Platform
 */

import express from 'express';
import axios from 'axios';
import { WeeklyContentReviewService } from '../services/WeeklyContentReviewService.js';

const router = express.Router();

// Supabase configuration
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';

/**
 * GET /api/dashboard/liberation
 * Get liberation metrics overview
 */
router.get('/liberation', async (req, res) => {
  try {
    if (!SUPABASE_URL || !SUPABASE_KEY) {
      return res.status(200).json({
        success: true,
        message: 'Demo mode - Supabase not configured',
        metrics: {
          events: { total: 0, avgScore: 0, aligned: 0, pending: 0 },
          news: { total: 0, avgScore: 0, aligned: 0, pending: 0 },
          overall: { alignmentRate: 0, autoApprovalRate: 0 }
        }
      });
    }

    // Fetch events liberation data
    const eventsResponse = await axios.get(
      `${SUPABASE_URL}/rest/v1/events`,
      {
        params: {
          select: 'id,liberation_score,status',
          order: 'created_at.desc',
          limit: 500
        },
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        }
      }
    );

    // Fetch news liberation data
    const newsResponse = await axios.get(
      `${SUPABASE_URL}/rest/v1/news_articles`,
      {
        params: {
          select: 'id,liberation_score,status',
          order: 'created_at.desc',
          limit: 500
        },
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        }
      }
    );

    const events = eventsResponse.data || [];
    const news = newsResponse.data || [];

    // Calculate events metrics
    const eventsWithScore = events.filter((e: any) => e.liberation_score !== null);
    const eventsAvgScore = eventsWithScore.length > 0
      ? eventsWithScore.reduce((sum: number, e: any) => sum + (e.liberation_score || 0), 0) / eventsWithScore.length
      : 0;
    const eventsAligned = eventsWithScore.filter((e: any) => (e.liberation_score || 0) >= 50).length;
    const eventsPending = events.filter((e: any) => e.status === 'pending').length;

    // Calculate news metrics
    const newsWithScore = news.filter((n: any) => n.liberation_score !== null);
    const newsAvgScore = newsWithScore.length > 0
      ? newsWithScore.reduce((sum: number, n: any) => sum + (n.liberation_score || 0), 0) / newsWithScore.length
      : 0;
    const newsAligned = newsWithScore.filter((n: any) => (n.liberation_score || 0) >= 40).length;
    const newsPending = news.filter((n: any) => n.status === 'review').length;

    // Calculate overall metrics
    const totalWithScore = eventsWithScore.length + newsWithScore.length;
    const totalAligned = eventsAligned + newsAligned;
    const alignmentRate = totalWithScore > 0 ? (totalAligned / totalWithScore) * 100 : 0;

    const eventsAutoApproved = events.filter((e: any) => e.status === 'approved' || e.status === 'published').length;
    const newsAutoPublished = news.filter((n: any) => n.status === 'published').length;
    const autoApprovalRate = (events.length + news.length) > 0
      ? ((eventsAutoApproved + newsAutoPublished) / (events.length + news.length)) * 100
      : 0;

    return res.status(200).json({
      success: true,
      metrics: {
        events: {
          total: events.length,
          withScore: eventsWithScore.length,
          avgScore: Math.round(eventsAvgScore),
          aligned: eventsAligned,
          pending: eventsPending,
          autoApproved: eventsAutoApproved
        },
        news: {
          total: news.length,
          withScore: newsWithScore.length,
          avgScore: Math.round(newsAvgScore),
          aligned: newsAligned,
          pending: newsPending,
          autoPublished: newsAutoPublished
        },
        overall: {
          totalContent: events.length + news.length,
          alignmentRate: Math.round(alignmentRate),
          autoApprovalRate: Math.round(autoApprovalRate),
          pendingModeration: eventsPending + newsPending
        }
      },
      thresholds: {
        events: { autoApprove: 50, description: 'Events with score ≥50 are auto-approved' },
        news: { autoPublish: 40, description: 'News with score ≥40 is auto-published' }
      },
      generatedAt: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('[Dashboard] Liberation metrics error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch liberation metrics',
      message: error.message
    });
  }
});

/**
 * GET /api/dashboard/moderation-queue
 * Get pending content for moderation
 */
router.get('/moderation-queue', async (req, res) => {
  try {
    if (!SUPABASE_URL || !SUPABASE_KEY) {
      return res.status(200).json({
        success: true,
        message: 'Demo mode - Supabase not configured',
        queue: { events: [], news: [], total: 0 }
      });
    }

    // Fetch pending events
    const eventsResponse = await axios.get(
      `${SUPABASE_URL}/rest/v1/events`,
      {
        params: {
          status: 'eq.pending',
          select: 'id,title,date,liberation_score,organizer,created_at',
          order: 'created_at.desc',
          limit: 50
        },
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        }
      }
    );

    // Fetch pending news
    const newsResponse = await axios.get(
      `${SUPABASE_URL}/rest/v1/news_articles`,
      {
        params: {
          status: 'eq.review',
          select: 'id,title,category,liberation_score,author,created_at',
          order: 'created_at.desc',
          limit: 50
        },
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        }
      }
    );

    const pendingEvents = eventsResponse.data || [];
    const pendingNews = newsResponse.data || [];

    // Add type and priority to items
    const enrichedEvents = pendingEvents.map((e: any) => ({
      ...e,
      type: 'event',
      priority: (e.liberation_score || 0) < 30 ? 'high' : 'normal'
    }));

    const enrichedNews = pendingNews.map((n: any) => ({
      ...n,
      type: 'news',
      priority: (n.liberation_score || 0) < 20 ? 'high' : 'normal'
    }));

    return res.status(200).json({
      success: true,
      queue: {
        events: enrichedEvents,
        news: enrichedNews,
        total: pendingEvents.length + pendingNews.length
      },
      summary: {
        eventsPending: pendingEvents.length,
        newsPending: pendingNews.length,
        highPriority: enrichedEvents.filter((e: any) => e.priority === 'high').length +
                     enrichedNews.filter((n: any) => n.priority === 'high').length
      }
    });

  } catch (error: any) {
    console.error('[Dashboard] Moderation queue error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch moderation queue',
      message: error.message
    });
  }
});

/**
 * GET /api/dashboard/score-distribution
 * Get liberation score distribution for analytics
 */
router.get('/score-distribution', async (req, res) => {
  try {
    if (!SUPABASE_URL || !SUPABASE_KEY) {
      return res.status(200).json({
        success: true,
        message: 'Demo mode - Supabase not configured',
        distribution: { events: {}, news: {} }
      });
    }

    // Fetch all events with scores
    const eventsResponse = await axios.get(
      `${SUPABASE_URL}/rest/v1/events`,
      {
        params: {
          select: 'liberation_score',
          'liberation_score': 'not.is.null'
        },
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        }
      }
    );

    // Fetch all news with scores
    const newsResponse = await axios.get(
      `${SUPABASE_URL}/rest/v1/news_articles`,
      {
        params: {
          select: 'liberation_score',
          'liberation_score': 'not.is.null'
        },
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        }
      }
    );

    const events = eventsResponse.data || [];
    const news = newsResponse.data || [];

    // Calculate distribution buckets
    const buckets = ['0-20', '21-40', '41-60', '61-80', '81-100'];

    const getDistribution = (items: any[]) => {
      const dist: Record<string, number> = {};
      buckets.forEach(b => dist[b] = 0);

      items.forEach((item: any) => {
        const score = item.liberation_score || 0;
        if (score <= 20) dist['0-20']++;
        else if (score <= 40) dist['21-40']++;
        else if (score <= 60) dist['41-60']++;
        else if (score <= 80) dist['61-80']++;
        else dist['81-100']++;
      });

      return dist;
    };

    return res.status(200).json({
      success: true,
      distribution: {
        events: getDistribution(events),
        news: getDistribution(news)
      },
      buckets,
      totals: {
        events: events.length,
        news: news.length
      }
    });

  } catch (error: any) {
    console.error('[Dashboard] Score distribution error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch score distribution',
      message: error.message
    });
  }
});

/**
 * GET /api/dashboard/health
 * Get Layer 3 system health status
 */
router.get('/health', async (req, res) => {
  const supabaseConfigured = !!(SUPABASE_URL && SUPABASE_KEY);

  return res.status(200).json({
    success: true,
    layer3: {
      status: 'active',
      version: '3.0.0-liberation',
      services: {
        liberationValidation: true,
        antiOppressionScreening: true,
        creatorSovereignty: true,
        autoApproval: true
      }
    },
    database: {
      configured: supabaseConfigured,
      status: supabaseConfigured ? 'connected' : 'demo-mode'
    },
    thresholds: {
      eventsAutoApprove: 50,
      newsAutoPublish: 40,
      creatorMinimumShare: 75
    },
    liberationValues: {
      enforced: true,
      creatorSovereignty: '75% minimum',
      antiOppression: 'active',
      communityProtection: 'prioritized'
    }
  });
});

// Weekly review service instance (lazy initialized)
let weeklyReviewService: WeeklyContentReviewService | null = null;
let lastReviewResult: {
  timestamp: string;
  result: any;
} | null = null;

/**
 * POST /api/dashboard/weekly-review
 * Trigger weekly content review (for curators/admins)
 */
router.post('/weekly-review', async (req, res) => {
  try {
    // Initialize service if needed
    if (!weeklyReviewService) {
      weeklyReviewService = new WeeklyContentReviewService();
    }

    console.log('🏴‍☠️ [Dashboard] Triggering weekly content review...');

    const result = await weeklyReviewService.performWeeklyReview();

    // Store result for status endpoint
    lastReviewResult = {
      timestamp: new Date().toISOString(),
      result
    };

    return res.status(200).json({
      success: true,
      message: 'Weekly review completed',
      review: result,
      completedAt: lastReviewResult.timestamp
    });

  } catch (error: any) {
    console.error('[Dashboard] Weekly review error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Weekly review failed',
      message: error.message
    });
  }
});

/**
 * GET /api/dashboard/weekly-review/status
 * Get status of last weekly review
 */
router.get('/weekly-review/status', async (req, res) => {
  return res.status(200).json({
    success: true,
    lastReview: lastReviewResult || {
      message: 'No review has been run yet this session'
    },
    serviceStatus: weeklyReviewService ? 'initialized' : 'not-initialized'
  });
});

/**
 * GET /api/dashboard/content-summary
 * Get summary of content from last 7 days with liberation analysis
 */
router.get('/content-summary', async (req, res) => {
  try {
    if (!SUPABASE_URL || !SUPABASE_KEY) {
      return res.status(200).json({
        success: true,
        message: 'Demo mode - Supabase not configured',
        summary: { events: [], news: [], period: '7 days' }
      });
    }

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekAgoStr = weekAgo.toISOString();

    // Fetch recent events
    const eventsResponse = await axios.get(
      `${SUPABASE_URL}/rest/v1/events`,
      {
        params: {
          created_at: `gte.${weekAgoStr}`,
          select: 'id,title,date,status,liberation_score,source,created_at',
          order: 'created_at.desc',
          limit: 100
        },
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        }
      }
    );

    // Fetch recent news
    const newsResponse = await axios.get(
      `${SUPABASE_URL}/rest/v1/news_articles`,
      {
        params: {
          created_at: `gte.${weekAgoStr}`,
          select: 'id,title,category,status,liberation_score,author,created_at',
          order: 'created_at.desc',
          limit: 100
        },
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        }
      }
    );

    const events = eventsResponse.data || [];
    const news = newsResponse.data || [];

    // Calculate summary stats
    const eventStats = {
      total: events.length,
      approved: events.filter((e: any) => e.status === 'approved' || e.status === 'published').length,
      pending: events.filter((e: any) => e.status === 'pending').length,
      avgScore: events.length > 0
        ? Math.round(events.reduce((sum: number, e: any) => sum + (e.liberation_score || 0), 0) / events.length)
        : 0
    };

    const newsStats = {
      total: news.length,
      published: news.filter((n: any) => n.status === 'published').length,
      pending: news.filter((n: any) => n.status === 'review').length,
      avgScore: news.length > 0
        ? Math.round(news.reduce((sum: number, n: any) => sum + (n.liberation_score || 0), 0) / news.length)
        : 0
    };

    return res.status(200).json({
      success: true,
      period: {
        start: weekAgoStr,
        end: new Date().toISOString(),
        days: 7
      },
      events: {
        stats: eventStats,
        recent: events.slice(0, 10)
      },
      news: {
        stats: newsStats,
        recent: news.slice(0, 10)
      },
      combined: {
        totalContent: events.length + news.length,
        totalApproved: eventStats.approved + newsStats.published,
        totalPending: eventStats.pending + newsStats.pending,
        overallAvgScore: (events.length + news.length) > 0
          ? Math.round((eventStats.avgScore * events.length + newsStats.avgScore * news.length) / (events.length + news.length))
          : 0
      }
    });

  } catch (error: any) {
    console.error('[Dashboard] Content summary error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch content summary',
      message: error.message
    });
  }
});

export default router;
