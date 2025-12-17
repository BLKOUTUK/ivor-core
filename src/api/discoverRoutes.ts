/**
 * Smart Discovery API Routes for IVOR Core
 * Personalized recommendations with liberation-weighted ranking
 *
 * Liberation Features:
 * - Black queer centered content prioritization
 * - Community-owned recommendation algorithm
 * - Privacy-respecting interaction tracking
 * - Liberation score weighting in all rankings
 *
 * BLKOUT Community Liberation Platform
 */

import express from 'express';
import axios from 'axios';

const router = express.Router();

// Supabase configuration
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';

// In-memory stores for demo mode
const demoInteractions: any[] = [];
const demoPreferences: Map<string, any> = new Map();

// Liberation score thresholds
const LIBERATION_THRESHOLDS = {
  HIGH_ALIGNMENT: 70,    // Content strongly aligned with values
  MEDIUM_ALIGNMENT: 40,  // Content moderately aligned
  BOOST_MULTIPLIER: 1.5  // Boost for high-liberation content
};

/**
 * POST /api/discover/track
 * Track user interaction with content
 */
router.post('/track', async (req, res) => {
  try {
    const {
      userId,
      contentType,
      contentId,
      interactionType,
      metadata,
      dwellTimeSeconds,
      source,
      sessionId
    } = req.body;

    if (!contentType || !contentId || !interactionType) {
      return res.status(400).json({
        success: false,
        error: 'contentType, contentId, and interactionType required'
      });
    }

    const interaction = {
      user_id: userId || `anon_${sessionId || Date.now()}`,
      content_type: contentType,
      content_id: contentId,
      interaction_type: interactionType,
      metadata: metadata || {},
      dwell_time_seconds: dwellTimeSeconds,
      source: source || 'unknown',
      session_id: sessionId,
      created_at: new Date().toISOString()
    };

    if (!SUPABASE_URL || !SUPABASE_KEY) {
      // Demo mode
      demoInteractions.push(interaction);
      console.log(`📊 [Discovery] Tracked: ${interactionType} on ${contentType}/${contentId}`);

      return res.status(201).json({
        success: true,
        message: 'Interaction tracked (demo mode)'
      });
    }

    await axios.post(
      `${SUPABASE_URL}/rest/v1/user_interactions`,
      interaction,
      {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log(`📊 [Discovery] Tracked: ${interactionType} on ${contentType}/${contentId}`);

    return res.status(201).json({
      success: true,
      message: 'Interaction tracked'
    });

  } catch (error: any) {
    console.error('[Discovery] Track error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Failed to track interaction',
      message: error.message
    });
  }
});

/**
 * GET /api/discover/events/for-you
 * Get personalized event recommendations
 */
router.get('/events/for-you', async (req, res) => {
  try {
    const { userId, limit = 20, offset = 0 } = req.query;

    if (!SUPABASE_URL || !SUPABASE_KEY) {
      // Demo mode - return mock recommendations
      return res.status(200).json({
        success: true,
        message: 'Demo mode - returning sample recommendations',
        events: [],
        meta: {
          algorithm: 'liberation-weighted',
          personalized: !!userId,
          totalAvailable: 0
        }
      });
    }

    // Fetch published events
    const eventsResponse = await axios.get(
      `${SUPABASE_URL}/rest/v1/events`,
      {
        params: {
          status: 'in.(approved,published)',
          select: '*',
          order: 'date.asc',
          limit: 100
        },
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        }
      }
    );

    let events = eventsResponse.data || [];

    // Get user preferences if userId provided
    let userPrefs = null;
    if (userId) {
      try {
        const prefsResponse = await axios.get(
          `${SUPABASE_URL}/rest/v1/user_preferences`,
          {
            params: {
              user_id: `eq.${userId}`,
              select: '*',
              limit: 1
            },
            headers: {
              'apikey': SUPABASE_KEY,
              'Authorization': `Bearer ${SUPABASE_KEY}`
            }
          }
        );
        userPrefs = prefsResponse.data?.[0];
      } catch (e) {
        // No preferences found, use defaults
      }
    }

    // Score and rank events
    const scoredEvents = events.map((event: any) => {
      let score = 0;

      // Liberation score boost (most important)
      const liberationScore = event.liberation_score || 50;
      if (liberationScore >= LIBERATION_THRESHOLDS.HIGH_ALIGNMENT) {
        score += 30 * LIBERATION_THRESHOLDS.BOOST_MULTIPLIER;
      } else if (liberationScore >= LIBERATION_THRESHOLDS.MEDIUM_ALIGNMENT) {
        score += 20;
      } else {
        score += 10;
      }

      // Freshness score (upcoming events rank higher)
      const eventDate = new Date(event.date);
      const now = new Date();
      const daysUntil = (eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);

      if (daysUntil > 0 && daysUntil <= 7) {
        score += 25; // This week
      } else if (daysUntil > 7 && daysUntil <= 30) {
        score += 15; // This month
      } else if (daysUntil > 0) {
        score += 5; // Future
      }

      // User preference matching
      if (userPrefs) {
        const preferredCategories = userPrefs.preferred_categories || [];
        const preferredLocations = userPrefs.preferred_locations || [];

        if (preferredCategories.includes(event.category)) {
          score += 15;
        }
        if (preferredLocations.some((loc: string) =>
          event.location?.toLowerCase().includes(loc.toLowerCase())
        )) {
          score += 10;
        }
      }

      return { ...event, _score: score };
    });

    // Sort by score descending
    scoredEvents.sort((a: any, b: any) => b._score - a._score);

    // Apply pagination
    const paginatedEvents = scoredEvents.slice(
      Number(offset),
      Number(offset) + Number(limit)
    );

    // Remove internal score from response
    const responseEvents = paginatedEvents.map(({ _score, ...event }: any) => event);

    return res.status(200).json({
      success: true,
      events: responseEvents,
      meta: {
        algorithm: 'liberation-weighted',
        personalized: !!userPrefs,
        totalAvailable: scoredEvents.length,
        offset: Number(offset),
        limit: Number(limit)
      }
    });

  } catch (error: any) {
    console.error('[Discovery] For You events error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Failed to get recommendations',
      message: error.message
    });
  }
});

/**
 * GET /api/discover/events/trending
 * Get trending events based on engagement
 */
router.get('/events/trending', async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    if (!SUPABASE_URL || !SUPABASE_KEY) {
      return res.status(200).json({
        success: true,
        message: 'Demo mode',
        events: [],
        meta: { algorithm: 'trending' }
      });
    }

    // Get events with recent high engagement
    const eventsResponse = await axios.get(
      `${SUPABASE_URL}/rest/v1/events`,
      {
        params: {
          status: 'in.(approved,published)',
          select: '*',
          'date': `gte.${new Date().toISOString()}`,
          order: 'created_at.desc',
          limit: 50
        },
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        }
      }
    );

    // Get interaction counts
    const interactionsResponse = await axios.get(
      `${SUPABASE_URL}/rest/v1/user_interactions`,
      {
        params: {
          content_type: 'eq.event',
          'created_at': `gte.${new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()}`,
          select: 'content_id,interaction_type'
        },
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        }
      }
    );

    // Count interactions per event
    const interactionCounts: Record<string, number> = {};
    (interactionsResponse.data || []).forEach((i: any) => {
      const weight = i.interaction_type === 'rsvp' ? 5 :
                     i.interaction_type === 'share' ? 3 :
                     i.interaction_type === 'click' ? 2 : 1;
      interactionCounts[i.content_id] = (interactionCounts[i.content_id] || 0) + weight;
    });

    // Score events
    const scoredEvents = (eventsResponse.data || []).map((event: any) => ({
      ...event,
      _trendingScore: (interactionCounts[event.id] || 0) +
        ((event.liberation_score || 50) / 10) // Liberation boost
    }));

    scoredEvents.sort((a: any, b: any) => b._trendingScore - a._trendingScore);

    const topEvents = scoredEvents
      .slice(0, Number(limit))
      .map(({ _trendingScore, ...event }: any) => event);

    return res.status(200).json({
      success: true,
      events: topEvents,
      meta: {
        algorithm: 'trending',
        timeframe: '7 days'
      }
    });

  } catch (error: any) {
    console.error('[Discovery] Trending error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Failed to get trending events',
      message: error.message
    });
  }
});

/**
 * GET /api/discover/events/nearby
 * Get events near a location
 */
router.get('/events/nearby', async (req, res) => {
  try {
    const { lat, lng, radiusKm = 50, limit = 20 } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        error: 'lat and lng coordinates required'
      });
    }

    if (!SUPABASE_URL || !SUPABASE_KEY) {
      return res.status(200).json({
        success: true,
        message: 'Demo mode',
        events: [],
        meta: { algorithm: 'nearby', radius: radiusKm }
      });
    }

    // Fetch events (in production, use PostGIS for proper geo queries)
    const eventsResponse = await axios.get(
      `${SUPABASE_URL}/rest/v1/events`,
      {
        params: {
          status: 'in.(approved,published)',
          select: '*',
          'date': `gte.${new Date().toISOString()}`,
          limit: 100
        },
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        }
      }
    );

    // Filter by UK cities as a simple location match
    // (In production, use proper geocoding)
    const ukCities = ['london', 'manchester', 'birmingham', 'leeds', 'glasgow', 'liverpool', 'bristol', 'nottingham'];

    const nearbyEvents = (eventsResponse.data || []).filter((event: any) => {
      if (!event.location) return false;
      const loc = event.location.toLowerCase();
      return ukCities.some(city => loc.includes(city));
    });

    // Sort by liberation score
    nearbyEvents.sort((a: any, b: any) =>
      (b.liberation_score || 50) - (a.liberation_score || 50)
    );

    return res.status(200).json({
      success: true,
      events: nearbyEvents.slice(0, Number(limit)),
      meta: {
        algorithm: 'nearby',
        radius: radiusKm,
        coordinates: { lat, lng }
      }
    });

  } catch (error: any) {
    console.error('[Discovery] Nearby error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Failed to get nearby events',
      message: error.message
    });
  }
});

/**
 * GET /api/discover/news/for-you
 * Get personalized news recommendations
 */
router.get('/news/for-you', async (req, res) => {
  try {
    const { userId, limit = 20, offset = 0 } = req.query;

    if (!SUPABASE_URL || !SUPABASE_KEY) {
      return res.status(200).json({
        success: true,
        message: 'Demo mode',
        articles: [],
        meta: { algorithm: 'liberation-weighted' }
      });
    }

    // Fetch published articles
    const articlesResponse = await axios.get(
      `${SUPABASE_URL}/rest/v1/news_articles`,
      {
        params: {
          status: 'eq.published',
          select: '*',
          order: 'published_at.desc',
          limit: 100
        },
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        }
      }
    );

    let articles = articlesResponse.data || [];

    // Score articles with liberation weighting
    const scoredArticles = articles.map((article: any) => {
      let score = 0;

      // Liberation score boost
      const liberationScore = article.liberation_score || 50;
      if (liberationScore >= LIBERATION_THRESHOLDS.HIGH_ALIGNMENT) {
        score += 30 * LIBERATION_THRESHOLDS.BOOST_MULTIPLIER;
      } else if (liberationScore >= LIBERATION_THRESHOLDS.MEDIUM_ALIGNMENT) {
        score += 20;
      } else {
        score += 10;
      }

      // Freshness score
      const publishedAt = new Date(article.published_at || article.created_at);
      const hoursSincePublished = (Date.now() - publishedAt.getTime()) / (1000 * 60 * 60);

      if (hoursSincePublished <= 24) {
        score += 25; // Today
      } else if (hoursSincePublished <= 72) {
        score += 15; // Last 3 days
      } else if (hoursSincePublished <= 168) {
        score += 5; // Last week
      }

      // Category boost for key topics
      const liberationCategories = ['activism', 'community', 'health', 'culture', 'politics'];
      if (liberationCategories.includes(article.category?.toLowerCase())) {
        score += 10;
      }

      return { ...article, _score: score };
    });

    scoredArticles.sort((a: any, b: any) => b._score - a._score);

    const paginatedArticles = scoredArticles.slice(
      Number(offset),
      Number(offset) + Number(limit)
    );

    const responseArticles = paginatedArticles.map(({ _score, ...article }: any) => article);

    return res.status(200).json({
      success: true,
      articles: responseArticles,
      meta: {
        algorithm: 'liberation-weighted',
        personalized: !!userId,
        totalAvailable: scoredArticles.length
      }
    });

  } catch (error: any) {
    console.error('[Discovery] For You news error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Failed to get news recommendations',
      message: error.message
    });
  }
});

/**
 * GET /api/discover/news/related/:id
 * Get related articles
 */
router.get('/news/related/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 5 } = req.query;

    if (!SUPABASE_URL || !SUPABASE_KEY) {
      return res.status(200).json({
        success: true,
        message: 'Demo mode',
        articles: []
      });
    }

    // Get the source article
    const articleResponse = await axios.get(
      `${SUPABASE_URL}/rest/v1/news_articles`,
      {
        params: {
          id: `eq.${id}`,
          select: 'category,author'
        },
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        }
      }
    );

    const sourceArticle = articleResponse.data?.[0];
    if (!sourceArticle) {
      return res.status(404).json({
        success: false,
        error: 'Article not found'
      });
    }

    // Find related by category
    const relatedResponse = await axios.get(
      `${SUPABASE_URL}/rest/v1/news_articles`,
      {
        params: {
          id: `neq.${id}`,
          status: 'eq.published',
          category: `eq.${sourceArticle.category}`,
          select: '*',
          order: 'liberation_score.desc,published_at.desc',
          limit: Number(limit)
        },
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        }
      }
    );

    return res.status(200).json({
      success: true,
      articles: relatedResponse.data || [],
      meta: {
        sourceId: id,
        algorithm: 'category-match'
      }
    });

  } catch (error: any) {
    console.error('[Discovery] Related news error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Failed to get related articles',
      message: error.message
    });
  }
});

/**
 * GET /api/discover/news/digest
 * Get weekly liberation digest
 */
router.get('/news/digest', async (req, res) => {
  try {
    if (!SUPABASE_URL || !SUPABASE_KEY) {
      return res.status(200).json({
        success: true,
        message: 'Demo mode',
        digest: {
          period: 'weekly',
          articles: [],
          events: []
        }
      });
    }

    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    // Get top liberation-scored articles from last week
    const articlesResponse = await axios.get(
      `${SUPABASE_URL}/rest/v1/news_articles`,
      {
        params: {
          status: 'eq.published',
          'published_at': `gte.${weekAgo}`,
          'liberation_score': `gte.${LIBERATION_THRESHOLDS.MEDIUM_ALIGNMENT}`,
          select: 'id,title,excerpt,category,author,liberation_score,published_at',
          order: 'liberation_score.desc',
          limit: 10
        },
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        }
      }
    );

    // Get upcoming high-liberation events
    const eventsResponse = await axios.get(
      `${SUPABASE_URL}/rest/v1/events`,
      {
        params: {
          status: 'in.(approved,published)',
          'date': `gte.${new Date().toISOString()}`,
          'liberation_score': `gte.${LIBERATION_THRESHOLDS.MEDIUM_ALIGNMENT}`,
          select: 'id,title,date,location,liberation_score',
          order: 'liberation_score.desc,date.asc',
          limit: 5
        },
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        }
      }
    );

    return res.status(200).json({
      success: true,
      digest: {
        period: 'weekly',
        generatedAt: new Date().toISOString(),
        articles: articlesResponse.data || [],
        events: eventsResponse.data || [],
        message: '🏴‍☠️ Your weekly liberation digest - content centered on Black queer joy and power'
      }
    });

  } catch (error: any) {
    console.error('[Discovery] Digest error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Failed to generate digest',
      message: error.message
    });
  }
});

/**
 * GET/PUT /api/discover/preferences
 * Manage user discovery preferences
 */
router.get('/preferences', async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId required'
      });
    }

    const defaultPreferences = {
      preferred_categories: [],
      preferred_locations: [],
      preference_weights: {
        parties: 0.5,
        workshops: 0.5,
        cultural: 0.5,
        community: 0.5,
        activism: 0.5,
        wellness: 0.5,
        arts: 0.5
      },
      discovery_radius_km: 50,
      show_online_events: true,
      show_in_person_events: true,
      liberation_priorities: {
        black_queer_centered: true,
        community_owned: true,
        accessibility_focused: true
      }
    };

    if (!SUPABASE_URL || !SUPABASE_KEY) {
      const prefs = demoPreferences.get(userId as string) || defaultPreferences;
      return res.status(200).json({
        success: true,
        preferences: prefs
      });
    }

    const response = await axios.get(
      `${SUPABASE_URL}/rest/v1/user_preferences`,
      {
        params: {
          user_id: `eq.${userId}`,
          select: '*',
          limit: 1
        },
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        }
      }
    );

    return res.status(200).json({
      success: true,
      preferences: response.data?.[0] || defaultPreferences
    });

  } catch (error: any) {
    console.error('[Discovery] Get preferences error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Failed to get preferences',
      message: error.message
    });
  }
});

router.put('/preferences', async (req, res) => {
  try {
    const { userId, preferences } = req.body;

    if (!userId || !preferences) {
      return res.status(400).json({
        success: false,
        error: 'userId and preferences required'
      });
    }

    if (!SUPABASE_URL || !SUPABASE_KEY) {
      demoPreferences.set(userId, {
        ...preferences,
        updated_at: new Date().toISOString()
      });
      return res.status(200).json({
        success: true,
        message: 'Preferences updated (demo mode)'
      });
    }

    // Upsert preferences
    await axios.post(
      `${SUPABASE_URL}/rest/v1/user_preferences`,
      {
        user_id: userId,
        ...preferences,
        updated_at: new Date().toISOString()
      },
      {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'resolution=merge-duplicates'
        }
      }
    );

    return res.status(200).json({
      success: true,
      message: 'Preferences updated'
    });

  } catch (error: any) {
    console.error('[Discovery] Update preferences error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Failed to update preferences',
      message: error.message
    });
  }
});

export default router;
