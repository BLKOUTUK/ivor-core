/**
 * News API Routes for IVOR Core
 * Central API gateway for news-blkout frontend
 *
 * Liberation Features:
 * - Auto-publish for liberation-compliant articles
 * - Anti-oppression content screening
 * - Creator sovereignty and narrative control
 *
 * BLKOUT Community Liberation Platform
 */

import express from 'express';
import axios from 'axios';

const router = express.Router();

// Supabase configuration
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';

/**
 * Liberation validation for article submissions
 */
function validateArticleLiberation(article: {
  title: string;
  content: string;
  excerpt?: string;
  author?: string;
}): {
  passed: boolean;
  recommendation: 'publish' | 'review' | 'reject';
  liberationScore: number;
  concerns: string[];
  narrativeControl: 'creator-owned' | 'community-shared';
} {
  const contentText = `${article.title} ${article.content || ''} ${article.excerpt || ''}`.toLowerCase();

  // Liberation alignment indicators
  const liberationIndicators = [
    'black queer', 'black trans', 'qtipoc', 'lgbtq', 'uk',
    'community', 'liberation', 'solidarity', 'healing', 'joy',
    'britain', 'london', 'manchester', 'birmingham'
  ];

  const alignmentCount = liberationIndicators.filter(ind => contentText.includes(ind)).length;
  const liberationScore = Math.min(1, alignmentCount / 5);

  // Anti-oppression checks
  const concerns: string[] = [];
  const problematicPatterns = [
    { pattern: /respectability politics|tone policing/i, concern: 'Respectability politics' },
    { pattern: /all lives matter/i, concern: 'All lives matter rhetoric' },
    { pattern: /reverse racism/i, concern: 'Reverse racism claims' },
    { pattern: /not all (white|men|police)/i, concern: 'Derailing language' }
  ];

  for (const { pattern, concern } of problematicPatterns) {
    if (pattern.test(contentText)) concerns.push(concern);
  }

  // Determine recommendation
  let recommendation: 'publish' | 'review' | 'reject' = 'review';
  if (liberationScore >= 0.4 && concerns.length === 0) {
    recommendation = 'publish';
  } else if (concerns.length > 1) {
    recommendation = 'reject';
  }

  return {
    passed: concerns.length === 0,
    recommendation,
    liberationScore,
    concerns,
    narrativeControl: 'creator-owned'
  };
}

/**
 * POST /api/news/submit
 * Submit a new article with liberation validation
 */
router.post('/submit', async (req, res) => {
  try {
    const {
      title,
      url,
      excerpt,
      category,
      content,
      submittedBy = 'community-member',
      type = 'story'
    } = req.body;

    // Validation
    if (!title || !url) {
      return res.status(400).json({
        success: false,
        error: 'Title and URL are required'
      });
    }

    // Liberation validation
    const liberationCheck = validateArticleLiberation({
      title,
      content: content || excerpt || '',
      excerpt,
      author: submittedBy
    });

    console.log('🏴‍☠️ [News] Liberation validation:', liberationCheck);

    // Determine status based on liberation check
    const articleStatus = liberationCheck.recommendation === 'publish' ? 'published' : 'review';
    const isAutoPublished = liberationCheck.recommendation === 'publish';

    // Prepare article data
    const articleData = {
      title,
      source_url: url,
      excerpt: excerpt || 'No excerpt provided',
      category: category || 'community',
      content: content || 'Content pending moderation',
      author: submittedBy,
      read_time: '5 min read',
      status: articleStatus,
      published: isAutoPublished,
      published_at: isAutoPublished ? new Date().toISOString() : null,
      created_at: new Date().toISOString()
    };

    // Check if Supabase is configured
    if (!SUPABASE_URL || !SUPABASE_KEY) {
      console.log('⚠️ [News] Supabase not configured - returning mock response');
      return res.status(201).json({
        success: true,
        message: isAutoPublished
          ? 'Article auto-published (liberation-compliant)'
          : 'Article submitted for moderation',
        data: {
          id: `mock-${Date.now()}`,
          title,
          status: articleStatus
        },
        liberation: {
          score: liberationCheck.liberationScore,
          recommendation: liberationCheck.recommendation,
          narrativeControl: liberationCheck.narrativeControl,
          autoPublished: isAutoPublished
        }
      });
    }

    // Submit to Supabase
    const response = await axios.post(
      `${SUPABASE_URL}/rest/v1/news_articles`,
      articleData,
      {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        }
      }
    );

    console.log('✅ [News] Article submitted:', response.data?.[0]?.id);

    return res.status(201).json({
      success: true,
      message: isAutoPublished
        ? 'Article auto-published (liberation-compliant content)'
        : 'Article submitted for moderation',
      data: response.data?.[0],
      liberation: {
        score: liberationCheck.liberationScore,
        recommendation: liberationCheck.recommendation,
        narrativeControl: liberationCheck.narrativeControl,
        autoPublished: isAutoPublished
      }
    });

  } catch (error: any) {
    console.error('[News] Submission error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Submission failed',
      message: error.message || 'An unexpected error occurred'
    });
  }
});

/**
 * GET /api/news/articles
 * Get published articles
 */
router.get('/articles', async (req, res) => {
  try {
    if (!SUPABASE_URL || !SUPABASE_KEY) {
      return res.status(200).json({
        success: true,
        articles: [],
        message: 'Supabase not configured'
      });
    }

    const { limit = 20, category } = req.query;

    const params: any = {
      status: 'eq.published',
      published: 'eq.true',
      order: 'published_at.desc',
      limit: limit
    };

    if (category && category !== 'all') {
      params.category = `eq.${category}`;
    }

    const response = await axios.get(
      `${SUPABASE_URL}/rest/v1/news_articles`,
      {
        params,
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        }
      }
    );

    return res.status(200).json({
      success: true,
      articles: response.data || [],
      count: response.data?.length || 0
    });

  } catch (error: any) {
    console.error('[News] Fetch error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch articles',
      articles: []
    });
  }
});

/**
 * GET /api/news/pending
 * Get articles pending moderation
 */
router.get('/pending', async (req, res) => {
  try {
    if (!SUPABASE_URL || !SUPABASE_KEY) {
      return res.status(200).json({
        success: true,
        articles: [],
        message: 'Supabase not configured'
      });
    }

    const response = await axios.get(
      `${SUPABASE_URL}/rest/v1/news_articles`,
      {
        params: {
          status: 'eq.review',
          order: 'created_at.desc',
          limit: 100
        },
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        }
      }
    );

    return res.status(200).json({
      success: true,
      articles: response.data || [],
      count: response.data?.length || 0
    });

  } catch (error: any) {
    console.error('[News] Fetch pending error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch pending articles',
      articles: []
    });
  }
});

/**
 * POST /api/news/:id/moderate
 * Moderate an article (approve/reject/edit)
 */
router.post('/:id/moderate', async (req, res) => {
  try {
    const { id } = req.params;
    const { action, edits } = req.body;

    if (!SUPABASE_URL || !SUPABASE_KEY) {
      return res.status(200).json({
        success: true,
        message: `Article ${action} (mock mode)`
      });
    }

    let updateData: any = {
      updated_at: new Date().toISOString()
    };

    switch (action) {
      case 'approve':
        updateData.status = 'published';
        updateData.published = true;
        updateData.published_at = new Date().toISOString();
        break;
      case 'reject':
        updateData.status = 'archived';
        updateData.published = false;
        break;
      case 'edit':
        if (edits) {
          if (edits.title) updateData.title = edits.title;
          if (edits.excerpt) updateData.excerpt = edits.excerpt;
          if (edits.content) updateData.content = edits.content;
          if (edits.category) updateData.category = edits.category;
        }
        break;
      default:
        return res.status(400).json({
          success: false,
          error: 'Invalid action'
        });
    }

    await axios.patch(
      `${SUPABASE_URL}/rest/v1/news_articles`,
      updateData,
      {
        params: { id: `eq.${id}` },
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log(`✅ [News] Article ${action}:`, id);

    return res.status(200).json({
      success: true,
      message: `Article ${action === 'approve' ? 'approved and published' : action === 'reject' ? 'rejected' : 'updated'}`
    });

  } catch (error: any) {
    console.error('[News] Moderation error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Moderation failed'
    });
  }
});

/**
 * GET /api/news/:id
 * Get a single article
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!SUPABASE_URL || !SUPABASE_KEY) {
      return res.status(404).json({
        success: false,
        error: 'Article not found'
      });
    }

    const response = await axios.get(
      `${SUPABASE_URL}/rest/v1/news_articles`,
      {
        params: { id: `eq.${id}` },
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        }
      }
    );

    if (!response.data || response.data.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Article not found'
      });
    }

    return res.status(200).json({
      success: true,
      article: response.data[0]
    });

  } catch (error: any) {
    console.error('[News] Fetch article error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch article'
    });
  }
});

export default router;
