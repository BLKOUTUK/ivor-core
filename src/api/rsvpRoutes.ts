/**
 * RSVP & Calendar API Routes for IVOR Core
 * Event registration, capacity management, and calendar integration
 *
 * Liberation Features:
 * - Community gathering support
 * - Accessibility needs tracking
 * - Safe space capacity management
 * - QR check-in for smooth entry
 *
 * BLKOUT Community Liberation Platform
 */

import express from 'express';
import axios from 'axios';
import crypto from 'crypto';

const router = express.Router();

// Supabase configuration
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';

// In-memory stores for demo mode
const demoRsvps: Map<string, any> = new Map();
const demoCapacity: Map<string, any> = new Map();

// Helper to generate check-in code
const generateCheckInCode = () => {
  return 'BLK-' + crypto.randomBytes(4).toString('hex').toUpperCase();
};

/**
 * POST /api/events/:eventId/rsvp
 * Create or update RSVP for an event
 */
router.post('/:eventId/rsvp', async (req, res) => {
  try {
    const { eventId } = req.params;
    const {
      userId,
      attendeeName,
      attendeeEmail,
      guestCount = 0,
      accessibilityNeeds,
      dietaryRequirements,
      notes
    } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId required'
      });
    }

    const checkInCode = generateCheckInCode();
    const rsvpData = {
      event_id: eventId,
      user_id: userId,
      status: 'confirmed',
      attendee_name: attendeeName,
      attendee_email: attendeeEmail,
      guest_count: Math.min(guestCount, 5),
      accessibility_needs: accessibilityNeeds,
      dietary_requirements: dietaryRequirements,
      notes,
      check_in_code: checkInCode,
      source: 'web',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (!SUPABASE_URL || !SUPABASE_KEY) {
      // Demo mode
      const rsvpId = `rsvp_${Date.now()}`;

      // Check capacity
      const capacity = demoCapacity.get(eventId);
      if (capacity?.max_capacity) {
        const currentCount = Array.from(demoRsvps.values())
          .filter(r => r.event_id === eventId && r.status === 'confirmed')
          .reduce((sum, r) => sum + 1 + (r.guest_count || 0), 0);

        if (currentCount + 1 + guestCount > capacity.max_capacity) {
          if (capacity.waitlist_enabled) {
            rsvpData.status = 'waitlist';
          } else {
            return res.status(400).json({
              success: false,
              error: 'Event is at capacity'
            });
          }
        }
      }

      demoRsvps.set(`${eventId}_${userId}`, { id: rsvpId, ...rsvpData });

      console.log(`🎟️ [RSVP] ${rsvpData.status === 'waitlist' ? 'Waitlisted' : 'Confirmed'}: ${eventId}`);

      return res.status(201).json({
        success: true,
        message: rsvpData.status === 'waitlist' ? 'Added to waitlist' : 'RSVP confirmed',
        rsvp: {
          id: rsvpId,
          status: rsvpData.status,
          checkInCode: rsvpData.status === 'confirmed' ? checkInCode : null,
          guestCount: rsvpData.guest_count
        }
      });
    }

    // Check capacity in database
    const capacityResponse = await axios.get(
      `${SUPABASE_URL}/rest/v1/event_capacity`,
      {
        params: {
          event_id: `eq.${eventId}`,
          select: '*'
        },
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        }
      }
    );

    const capacity = capacityResponse.data?.[0];
    let status = 'confirmed';

    if (capacity?.max_capacity) {
      if (capacity.confirmed_count + 1 + guestCount > capacity.max_capacity) {
        if (capacity.waitlist_enabled && capacity.waitlist_count < capacity.max_waitlist) {
          status = 'waitlist';
        } else {
          return res.status(400).json({
            success: false,
            error: capacity.waitlist_enabled ? 'Waitlist is full' : 'Event is at capacity'
          });
        }
      }
    }

    rsvpData.status = status;

    // Upsert RSVP
    const response = await axios.post(
      `${SUPABASE_URL}/rest/v1/event_rsvps`,
      rsvpData,
      {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'resolution=merge-duplicates,return=representation'
        }
      }
    );

    const rsvp = response.data?.[0];

    console.log(`🎟️ [RSVP] ${status === 'waitlist' ? 'Waitlisted' : 'Confirmed'}: ${eventId}`);

    return res.status(201).json({
      success: true,
      message: status === 'waitlist' ? 'Added to waitlist' : 'RSVP confirmed',
      rsvp: {
        id: rsvp?.id,
        status,
        checkInCode: status === 'confirmed' ? rsvp?.check_in_code : null,
        guestCount: rsvp?.guest_count
      }
    });

  } catch (error: any) {
    console.error('[RSVP] Create error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Failed to create RSVP',
      message: error.message
    });
  }
});

/**
 * DELETE /api/events/:eventId/rsvp
 * Cancel RSVP
 */
router.delete('/:eventId/rsvp', async (req, res) => {
  try {
    const { eventId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId required'
      });
    }

    if (!SUPABASE_URL || !SUPABASE_KEY) {
      // Demo mode
      const key = `${eventId}_${userId}`;
      const rsvp = demoRsvps.get(key);

      if (rsvp) {
        rsvp.status = 'cancelled';
        rsvp.updated_at = new Date().toISOString();
      }

      console.log(`🎟️ [RSVP] Cancelled: ${eventId}`);

      return res.status(200).json({
        success: true,
        message: 'RSVP cancelled'
      });
    }

    await axios.patch(
      `${SUPABASE_URL}/rest/v1/event_rsvps`,
      {
        status: 'cancelled',
        updated_at: new Date().toISOString()
      },
      {
        params: {
          event_id: `eq.${eventId}`,
          user_id: `eq.${userId}`
        },
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // TODO: Promote from waitlist if capacity available

    console.log(`🎟️ [RSVP] Cancelled: ${eventId}`);

    return res.status(200).json({
      success: true,
      message: 'RSVP cancelled'
    });

  } catch (error: any) {
    console.error('[RSVP] Cancel error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Failed to cancel RSVP',
      message: error.message
    });
  }
});

/**
 * GET /api/events/:eventId/rsvps
 * Get RSVPs for an event (organizer view)
 */
router.get('/:eventId/rsvps', async (req, res) => {
  try {
    const { eventId } = req.params;
    const { status, limit = 100 } = req.query;

    if (!SUPABASE_URL || !SUPABASE_KEY) {
      // Demo mode
      const rsvps = Array.from(demoRsvps.values())
        .filter(r => r.event_id === eventId)
        .filter(r => !status || r.status === status);

      return res.status(200).json({
        success: true,
        rsvps,
        counts: {
          confirmed: rsvps.filter(r => r.status === 'confirmed').length,
          waitlist: rsvps.filter(r => r.status === 'waitlist').length,
          cancelled: rsvps.filter(r => r.status === 'cancelled').length
        }
      });
    }

    const params: any = {
      event_id: `eq.${eventId}`,
      select: 'id,user_id,status,attendee_name,attendee_email,guest_count,checked_in,created_at',
      order: 'created_at.asc',
      limit
    };

    if (status) {
      params.status = `eq.${status}`;
    }

    const response = await axios.get(
      `${SUPABASE_URL}/rest/v1/event_rsvps`,
      {
        params,
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        }
      }
    );

    const rsvps = response.data || [];

    return res.status(200).json({
      success: true,
      rsvps,
      counts: {
        confirmed: rsvps.filter((r: any) => r.status === 'confirmed').length,
        waitlist: rsvps.filter((r: any) => r.status === 'waitlist').length,
        total: rsvps.length
      }
    });

  } catch (error: any) {
    console.error('[RSVP] List error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Failed to get RSVPs',
      message: error.message
    });
  }
});

/**
 * POST /api/events/:eventId/check-in
 * Check in an attendee via QR code
 */
router.post('/:eventId/check-in', async (req, res) => {
  try {
    const { eventId } = req.params;
    const { checkInCode, userId } = req.body;

    if (!checkInCode && !userId) {
      return res.status(400).json({
        success: false,
        error: 'checkInCode or userId required'
      });
    }

    if (!SUPABASE_URL || !SUPABASE_KEY) {
      // Demo mode
      let rsvp = null;

      if (checkInCode) {
        rsvp = Array.from(demoRsvps.values()).find(
          r => r.event_id === eventId && r.check_in_code === checkInCode
        );
      } else {
        rsvp = demoRsvps.get(`${eventId}_${userId}`);
      }

      if (!rsvp) {
        return res.status(404).json({
          success: false,
          error: 'RSVP not found'
        });
      }

      if (rsvp.status !== 'confirmed') {
        return res.status(400).json({
          success: false,
          error: 'RSVP not confirmed'
        });
      }

      if (rsvp.checked_in) {
        return res.status(400).json({
          success: false,
          error: 'Already checked in',
          checkedInAt: rsvp.checked_in_at
        });
      }

      rsvp.checked_in = true;
      rsvp.checked_in_at = new Date().toISOString();

      console.log(`✅ [Check-in] ${rsvp.attendee_name || rsvp.user_id} checked in`);

      return res.status(200).json({
        success: true,
        message: 'Checked in successfully',
        attendee: {
          name: rsvp.attendee_name,
          guestCount: rsvp.guest_count,
          checkedInAt: rsvp.checked_in_at
        }
      });
    }

    // Find RSVP
    const params: any = { event_id: `eq.${eventId}` };
    if (checkInCode) {
      params.check_in_code = `eq.${checkInCode}`;
    } else {
      params.user_id = `eq.${userId}`;
    }

    const findResponse = await axios.get(
      `${SUPABASE_URL}/rest/v1/event_rsvps`,
      {
        params: { ...params, select: '*', limit: 1 },
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        }
      }
    );

    const rsvp = findResponse.data?.[0];

    if (!rsvp) {
      return res.status(404).json({
        success: false,
        error: 'RSVP not found'
      });
    }

    if (rsvp.status !== 'confirmed') {
      return res.status(400).json({
        success: false,
        error: 'RSVP not confirmed'
      });
    }

    if (rsvp.checked_in) {
      return res.status(400).json({
        success: false,
        error: 'Already checked in',
        checkedInAt: rsvp.checked_in_at
      });
    }

    // Update check-in status
    await axios.patch(
      `${SUPABASE_URL}/rest/v1/event_rsvps`,
      {
        checked_in: true,
        checked_in_at: new Date().toISOString()
      },
      {
        params: { id: `eq.${rsvp.id}` },
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log(`✅ [Check-in] ${rsvp.attendee_name || rsvp.user_id} checked in`);

    return res.status(200).json({
      success: true,
      message: 'Checked in successfully',
      attendee: {
        name: rsvp.attendee_name,
        guestCount: rsvp.guest_count,
        checkedInAt: new Date().toISOString()
      }
    });

  } catch (error: any) {
    console.error('[Check-in] Error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Failed to check in',
      message: error.message
    });
  }
});

/**
 * GET /api/user/rsvps
 * Get user's RSVPs
 */
router.get('/user/:userId/rsvps', async (req, res) => {
  try {
    const { userId } = req.params;
    const { status, upcoming } = req.query;

    if (!SUPABASE_URL || !SUPABASE_KEY) {
      // Demo mode
      const rsvps = Array.from(demoRsvps.values())
        .filter(r => r.user_id === userId)
        .filter(r => !status || r.status === status);

      return res.status(200).json({
        success: true,
        rsvps
      });
    }

    const params: any = {
      user_id: `eq.${userId}`,
      select: '*, events:event_id(id,title,date,location,image_url)',
      order: 'created_at.desc'
    };

    if (status) {
      params.status = `eq.${status}`;
    }

    const response = await axios.get(
      `${SUPABASE_URL}/rest/v1/event_rsvps`,
      {
        params,
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        }
      }
    );

    let rsvps = response.data || [];

    // Filter upcoming if requested
    if (upcoming === 'true') {
      const now = new Date();
      rsvps = rsvps.filter((r: any) =>
        r.events?.date && new Date(r.events.date) >= now
      );
    }

    return res.status(200).json({
      success: true,
      rsvps
    });

  } catch (error: any) {
    console.error('[RSVP] User RSVPs error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Failed to get user RSVPs',
      message: error.message
    });
  }
});

/**
 * GET /api/events/:eventId/capacity
 * Get event capacity info
 */
router.get('/:eventId/capacity', async (req, res) => {
  try {
    const { eventId } = req.params;

    if (!SUPABASE_URL || !SUPABASE_KEY) {
      const capacity = demoCapacity.get(eventId) || {
        max_capacity: null,
        confirmed_count: 0,
        waitlist_count: 0,
        waitlist_enabled: true
      };

      return res.status(200).json({
        success: true,
        capacity: {
          ...capacity,
          spotsRemaining: capacity.max_capacity
            ? capacity.max_capacity - capacity.confirmed_count
            : null,
          isFull: capacity.max_capacity
            ? capacity.confirmed_count >= capacity.max_capacity
            : false
        }
      });
    }

    const response = await axios.get(
      `${SUPABASE_URL}/rest/v1/event_capacity`,
      {
        params: {
          event_id: `eq.${eventId}`,
          select: '*'
        },
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        }
      }
    );

    const capacity = response.data?.[0] || {
      max_capacity: null,
      confirmed_count: 0,
      waitlist_count: 0,
      waitlist_enabled: true
    };

    return res.status(200).json({
      success: true,
      capacity: {
        ...capacity,
        spotsRemaining: capacity.max_capacity
          ? capacity.max_capacity - capacity.confirmed_count
          : null,
        isFull: capacity.max_capacity
          ? capacity.confirmed_count >= capacity.max_capacity
          : false
      }
    });

  } catch (error: any) {
    console.error('[Capacity] Error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Failed to get capacity',
      message: error.message
    });
  }
});

export default router;
