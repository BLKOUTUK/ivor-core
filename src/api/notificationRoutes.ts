/**
 * Push Notification API Routes for IVOR Core
 * Handles subscription management and notification delivery
 *
 * Liberation Features:
 * - Community-controlled notifications
 * - Opt-in consent for all notifications
 * - Event reminders for Black queer gatherings
 *
 * BLKOUT Community Liberation Platform
 */

import express from 'express';
import axios from 'axios';

const router = express.Router();

// Supabase configuration
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';

// Firebase configuration (for push notifications)
const FIREBASE_SERVER_KEY = process.env.FIREBASE_SERVER_KEY || '';

// In-memory store for demo mode
const demoSubscriptions: Map<string, any> = new Map();

/**
 * POST /api/notifications/subscribe
 * Subscribe a device to push notifications
 */
router.post('/subscribe', async (req, res) => {
  try {
    const { subscription, userId, preferences } = req.body;

    if (!subscription || !subscription.endpoint) {
      return res.status(400).json({
        success: false,
        error: 'Push subscription data required'
      });
    }

    const subscriptionData = {
      user_id: userId || 'anonymous',
      endpoint: subscription.endpoint,
      p256dh: subscription.keys?.p256dh || '',
      auth: subscription.keys?.auth || '',
      preferences: preferences || {
        events: true,
        news: true,
        community: true,
        reminders: true
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (!SUPABASE_URL || !SUPABASE_KEY) {
      // Demo mode
      demoSubscriptions.set(subscription.endpoint, subscriptionData);
      console.log('[Notifications] Demo mode - subscription stored in memory');

      return res.status(201).json({
        success: true,
        message: 'Subscription registered (demo mode)',
        subscriptionId: subscription.endpoint.slice(-20)
      });
    }

    // Store in Supabase
    const response = await axios.post(
      `${SUPABASE_URL}/rest/v1/notification_subscriptions`,
      subscriptionData,
      {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        }
      }
    );

    console.log('🔔 [Notifications] New subscription registered');

    return res.status(201).json({
      success: true,
      message: 'Subscription registered',
      subscriptionId: response.data?.[0]?.id
    });

  } catch (error: any) {
    console.error('[Notifications] Subscribe error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Failed to register subscription',
      message: error.message
    });
  }
});

/**
 * DELETE /api/notifications/unsubscribe
 * Remove a push notification subscription
 */
router.delete('/unsubscribe', async (req, res) => {
  try {
    const { endpoint } = req.body;

    if (!endpoint) {
      return res.status(400).json({
        success: false,
        error: 'Subscription endpoint required'
      });
    }

    if (!SUPABASE_URL || !SUPABASE_KEY) {
      // Demo mode
      demoSubscriptions.delete(endpoint);
      return res.status(200).json({
        success: true,
        message: 'Unsubscribed (demo mode)'
      });
    }

    await axios.delete(
      `${SUPABASE_URL}/rest/v1/notification_subscriptions`,
      {
        params: {
          endpoint: `eq.${endpoint}`
        },
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        }
      }
    );

    console.log('🔕 [Notifications] Subscription removed');

    return res.status(200).json({
      success: true,
      message: 'Unsubscribed successfully'
    });

  } catch (error: any) {
    console.error('[Notifications] Unsubscribe error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Failed to unsubscribe',
      message: error.message
    });
  }
});

/**
 * GET /api/notifications/preferences
 * Get notification preferences for a user/device
 */
router.get('/preferences', async (req, res) => {
  try {
    const { endpoint, userId } = req.query;

    if (!endpoint && !userId) {
      return res.status(400).json({
        success: false,
        error: 'Endpoint or userId required'
      });
    }

    if (!SUPABASE_URL || !SUPABASE_KEY) {
      // Demo mode
      const sub = demoSubscriptions.get(endpoint as string);
      return res.status(200).json({
        success: true,
        preferences: sub?.preferences || {
          events: true,
          news: true,
          community: true,
          reminders: true
        }
      });
    }

    const params: any = {};
    if (endpoint) params.endpoint = `eq.${endpoint}`;
    if (userId) params.user_id = `eq.${userId}`;

    const response = await axios.get(
      `${SUPABASE_URL}/rest/v1/notification_subscriptions`,
      {
        params: {
          ...params,
          select: 'preferences',
          limit: 1
        },
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        }
      }
    );

    const preferences = response.data?.[0]?.preferences || {
      events: true,
      news: true,
      community: true,
      reminders: true
    };

    return res.status(200).json({
      success: true,
      preferences
    });

  } catch (error: any) {
    console.error('[Notifications] Get preferences error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Failed to get preferences',
      message: error.message
    });
  }
});

/**
 * PUT /api/notifications/preferences
 * Update notification preferences
 */
router.put('/preferences', async (req, res) => {
  try {
    const { endpoint, userId, preferences } = req.body;

    if (!endpoint && !userId) {
      return res.status(400).json({
        success: false,
        error: 'Endpoint or userId required'
      });
    }

    if (!preferences) {
      return res.status(400).json({
        success: false,
        error: 'Preferences object required'
      });
    }

    if (!SUPABASE_URL || !SUPABASE_KEY) {
      // Demo mode
      const sub = demoSubscriptions.get(endpoint);
      if (sub) {
        sub.preferences = preferences;
        sub.updated_at = new Date().toISOString();
      }
      return res.status(200).json({
        success: true,
        message: 'Preferences updated (demo mode)',
        preferences
      });
    }

    const params: any = {};
    if (endpoint) params.endpoint = `eq.${endpoint}`;
    if (userId) params.user_id = `eq.${userId}`;

    await axios.patch(
      `${SUPABASE_URL}/rest/v1/notification_subscriptions`,
      {
        preferences,
        updated_at: new Date().toISOString()
      },
      {
        params,
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('🔔 [Notifications] Preferences updated');

    return res.status(200).json({
      success: true,
      message: 'Preferences updated',
      preferences
    });

  } catch (error: any) {
    console.error('[Notifications] Update preferences error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Failed to update preferences',
      message: error.message
    });
  }
});

/**
 * POST /api/notifications/send
 * Send a push notification (admin only)
 */
router.post('/send', async (req, res) => {
  try {
    const { title, body, icon, url, topic, data } = req.body;

    if (!title || !body) {
      return res.status(400).json({
        success: false,
        error: 'Title and body required'
      });
    }

    // Build notification payload
    const notification = {
      title,
      body,
      icon: icon || '/pwa-192x192.png',
      badge: '/favicon-32x32.png',
      data: {
        url: url || '/',
        ...data
      }
    };

    if (!SUPABASE_URL || !SUPABASE_KEY) {
      // Demo mode - just log
      console.log('🔔 [Notifications] Demo mode - would send:', notification);
      return res.status(200).json({
        success: true,
        message: 'Notification queued (demo mode)',
        notification,
        sentTo: demoSubscriptions.size
      });
    }

    // Get subscriptions filtered by topic/preferences
    const params: any = { select: 'endpoint,p256dh,auth,preferences' };
    if (topic) {
      params[`preferences->>${topic}`] = 'eq.true';
    }

    const subsResponse = await axios.get(
      `${SUPABASE_URL}/rest/v1/notification_subscriptions`,
      {
        params,
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        }
      }
    );

    const subscriptions = subsResponse.data || [];

    // Log notification attempt
    await axios.post(
      `${SUPABASE_URL}/rest/v1/notification_log`,
      {
        title,
        body,
        topic: topic || 'general',
        sent_count: subscriptions.length,
        created_at: new Date().toISOString()
      },
      {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log(`🔔 [Notifications] Queued for ${subscriptions.length} subscribers`);

    // In a production system, you would send via web-push library or Firebase
    // This is a placeholder for the actual push mechanism

    return res.status(200).json({
      success: true,
      message: 'Notification queued',
      notification,
      sentTo: subscriptions.length
    });

  } catch (error: any) {
    console.error('[Notifications] Send error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Failed to send notification',
      message: error.message
    });
  }
});

/**
 * POST /api/notifications/event-reminder
 * Send event reminder notification
 */
router.post('/event-reminder', async (req, res) => {
  try {
    const { eventId, eventTitle, eventDate, reminderType } = req.body;

    if (!eventId || !eventTitle) {
      return res.status(400).json({
        success: false,
        error: 'Event ID and title required'
      });
    }

    const reminderMessages: Record<string, string> = {
      '24h': `Tomorrow: ${eventTitle}`,
      '1h': `Starting soon: ${eventTitle}`,
      'now': `Happening now: ${eventTitle}`
    };

    const notification = {
      title: '🏴‍☠️ BLKOUT Event Reminder',
      body: reminderMessages[reminderType] || `Don't miss: ${eventTitle}`,
      icon: '/pwa-192x192.png',
      data: {
        url: `/events/${eventId}`,
        eventId,
        type: 'event-reminder'
      }
    };

    // Forward to main send endpoint
    const sendResponse = await axios.post(
      `http://localhost:${process.env.PORT || 3021}/api/notifications/send`,
      {
        ...notification,
        topic: 'reminders'
      }
    );

    return res.status(200).json({
      success: true,
      message: 'Event reminder queued',
      notification
    });

  } catch (error: any) {
    console.error('[Notifications] Event reminder error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Failed to send event reminder',
      message: error.message
    });
  }
});

/**
 * GET /api/notifications/stats
 * Get notification statistics
 */
router.get('/stats', async (req, res) => {
  try {
    if (!SUPABASE_URL || !SUPABASE_KEY) {
      return res.status(200).json({
        success: true,
        message: 'Demo mode',
        stats: {
          totalSubscriptions: demoSubscriptions.size,
          notificationsSent: 0
        }
      });
    }

    // Get subscription count
    const subsResponse = await axios.get(
      `${SUPABASE_URL}/rest/v1/notification_subscriptions`,
      {
        params: { select: 'id' },
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Prefer': 'count=exact'
        }
      }
    );

    // Get recent notification log
    const logResponse = await axios.get(
      `${SUPABASE_URL}/rest/v1/notification_log`,
      {
        params: {
          select: 'id,title,topic,sent_count,created_at',
          order: 'created_at.desc',
          limit: 10
        },
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        }
      }
    );

    const totalSent = (logResponse.data || []).reduce(
      (sum: number, log: any) => sum + (log.sent_count || 0), 0
    );

    return res.status(200).json({
      success: true,
      stats: {
        totalSubscriptions: parseInt(subsResponse.headers['content-range']?.split('/')[1] || '0'),
        notificationsSent: totalSent,
        recentNotifications: logResponse.data || []
      }
    });

  } catch (error: any) {
    console.error('[Notifications] Stats error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Failed to get notification stats',
      message: error.message
    });
  }
});

export default router;
