/**
 * Events API Routes for IVOR Core
 * Central API gateway for events-calendar frontend
 *
 * Liberation Features:
 * - Auto-approval for liberation-compliant events
 * - Anti-oppression content screening
 * - Creator sovereignty enforcement (75% minimum)
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
 * Liberation validation for event submissions
 */
function validateEventLiberation(event: {
  title: string;
  description: string;
  organizer?: string;
}): {
  passed: boolean;
  recommendation: 'auto-approve' | 'review-quick' | 'review-deep';
  liberationScore: number;
  concerns: string[];
} {
  const contentText = `${event.title} ${event.description}`.toLowerCase();

  // Liberation alignment indicators
  const liberationIndicators = [
    'black queer', 'black trans', 'qtipoc', 'lgbtq', 'pride',
    'community', 'healing', 'safe space', 'mutual aid', 'liberation',
    'uk black pride', 'black joy', 'queer joy'
  ];

  const alignmentCount = liberationIndicators.filter(ind => contentText.includes(ind)).length;
  const liberationScore = Math.min(1, alignmentCount / 4);

  // Anti-oppression checks
  const concerns: string[] = [];
  const problematicPatterns = [
    { pattern: /corporate.*diversity|diversity.*training.*company/i, concern: 'Corporate diversity focus' },
    { pattern: /fetish|exotic/i, concern: 'Potential fetishization' },
    { pattern: /terf|gender.?critical/i, concern: 'Trans-exclusionary content' }
  ];

  for (const { pattern, concern } of problematicPatterns) {
    if (pattern.test(contentText)) concerns.push(concern);
  }

  // Determine recommendation
  let recommendation: 'auto-approve' | 'review-quick' | 'review-deep' = 'review-quick';
  if (liberationScore >= 0.5 && concerns.length === 0) {
    recommendation = 'auto-approve';
  } else if (concerns.length > 0) {
    recommendation = 'review-deep';
  }

  return {
    passed: concerns.length === 0,
    recommendation,
    liberationScore,
    concerns
  };
}

/**
 * POST /api/events/submit
 * Submit a new event with liberation validation
 */
router.post('/submit', async (req, res) => {
  try {
    const {
      title,
      date,
      time,
      location,
      description,
      url,
      tags = [],
      organizer,
      source = 'community-submission',
      sourceUrl,
      submittedBy = 'community-member',
      moreInfoUrl
    } = req.body;

    // Validation
    if (!title || !date) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        message: 'Title and date are required fields'
      });
    }

    // Liberation validation
    const liberationCheck = validateEventLiberation({
      title,
      description: description || '',
      organizer
    });

    console.log('🏴‍☠️ [Events] Liberation validation:', liberationCheck);

    // Prepare event data with liberation score
    const eventData = {
      title: title || 'Untitled Event',
      date: date,
      start_time: time || null,
      end_time: null,
      end_date: req.body.end_date || null,
      location: location || 'TBD',
      description: description || 'No description provided',
      url: url || moreInfoUrl || sourceUrl || '',
      tags: Array.isArray(tags) ? tags : (tags ? [tags] : []),
      organizer: organizer || 'Community',
      source: source,
      status: liberationCheck.recommendation === 'auto-approve' ? 'approved' : 'pending',
      liberation_score: Math.round(liberationCheck.liberationScore * 100), // Store as 0-100
      created_at: new Date().toISOString()
    };

    // Check if Supabase is configured
    if (!SUPABASE_URL || !SUPABASE_KEY) {
      console.log('⚠️ [Events] Supabase not configured - returning mock response');
      return res.status(201).json({
        success: true,
        message: liberationCheck.recommendation === 'auto-approve'
          ? 'Event auto-approved (liberation-compliant)'
          : 'Event submitted for review',
        data: {
          id: `mock-${Date.now()}`,
          title,
          date,
          status: eventData.status
        },
        liberation: {
          score: liberationCheck.liberationScore,
          recommendation: liberationCheck.recommendation,
          autoApproved: liberationCheck.recommendation === 'auto-approve'
        }
      });
    }

    // Submit to Supabase
    const response = await axios.post(
      `${SUPABASE_URL}/rest/v1/events`,
      eventData,
      {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        }
      }
    );

    console.log('✅ [Events] Event submitted:', response.data?.[0]?.id);

    return res.status(201).json({
      success: true,
      message: liberationCheck.recommendation === 'auto-approve'
        ? 'Event auto-approved (liberation-compliant community event)'
        : 'Event submitted successfully and is pending approval',
      data: {
        id: response.data?.[0]?.id,
        title,
        date,
        status: eventData.status
      },
      liberation: {
        score: liberationCheck.liberationScore,
        recommendation: liberationCheck.recommendation,
        autoApproved: liberationCheck.recommendation === 'auto-approve'
      }
    });

  } catch (error: any) {
    console.error('[Events] Submission error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Submission failed',
      message: error.message || 'An unexpected error occurred'
    });
  }
});

/**
 * GET /api/events/upcoming
 * Get upcoming events
 */
router.get('/upcoming', async (req, res) => {
  try {
    if (!SUPABASE_URL || !SUPABASE_KEY) {
      return res.status(200).json({
        success: true,
        events: [],
        message: 'Supabase not configured'
      });
    }

    const today = new Date().toISOString().split('T')[0];

    const response = await axios.get(
      `${SUPABASE_URL}/rest/v1/events`,
      {
        params: {
          status: 'eq.approved',  // Database constraint allows: pending, approved
          date: `gte.${today}`,
          order: 'date.asc',
          limit: 50
        },
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        }
      }
    );

    return res.status(200).json({
      success: true,
      events: response.data || [],
      count: response.data?.length || 0
    });

  } catch (error: any) {
    console.error('[Events] Fetch error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch events',
      events: []
    });
  }
});

/**
 * GET /api/events/pending
 * Get events pending moderation (for curators)
 */
router.get('/pending', async (req, res) => {
  try {
    if (!SUPABASE_URL || !SUPABASE_KEY) {
      return res.status(200).json({
        success: true,
        events: [],
        message: 'Supabase not configured'
      });
    }

    const response = await axios.get(
      `${SUPABASE_URL}/rest/v1/events`,
      {
        params: {
          status: 'eq.pending',
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
      events: response.data || [],
      count: response.data?.length || 0
    });

  } catch (error: any) {
    console.error('[Events] Fetch pending error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch pending events',
      events: []
    });
  }
});

/**
 * POST /api/events/:id/approve
 * Approve a pending event
 */
router.post('/:id/approve', async (req, res) => {
  try {
    const { id } = req.params;

    if (!SUPABASE_URL || !SUPABASE_KEY) {
      return res.status(200).json({
        success: true,
        message: 'Event approved (mock mode)'
      });
    }

    await axios.patch(
      `${SUPABASE_URL}/rest/v1/events`,
      { status: 'approved' },  // Database constraint allows: pending, approved
      {
        params: { id: `eq.${id}` },
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ [Events] Event approved:', id);

    return res.status(200).json({
      success: true,
      message: 'Event approved and published'
    });

  } catch (error: any) {
    console.error('[Events] Approval error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Failed to approve event'
    });
  }
});

/**
 * POST /api/events/:id/reject
 * Reject a pending event
 */
router.post('/:id/reject', async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!SUPABASE_URL || !SUPABASE_KEY) {
      return res.status(200).json({
        success: true,
        message: 'Event rejected (mock mode)'
      });
    }

    await axios.patch(
      `${SUPABASE_URL}/rest/v1/events`,
      {
        status: 'rejected',
        rejection_reason: reason || 'Does not meet community guidelines'
      },
      {
        params: { id: `eq.${id}` },
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('❌ [Events] Event rejected:', id);

    return res.status(200).json({
      success: true,
      message: 'Event rejected'
    });

  } catch (error: any) {
    console.error('[Events] Rejection error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Failed to reject event'
    });
  }
});

export default router;
