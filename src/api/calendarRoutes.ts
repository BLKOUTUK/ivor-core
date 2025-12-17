/**
 * Calendar Integration API Routes for IVOR Core
 * ICS generation and calendar feed management
 *
 * Liberation Features:
 * - Easy event visibility through calendar apps
 * - Personalized calendar feeds
 * - Reminder integration
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

// Base URL for calendar links
const BASE_URL = process.env.BASE_URL || 'https://ivor.blkoutuk.cloud';

// In-memory feeds for demo mode
const demoFeeds: Map<string, any> = new Map();

/**
 * Generate ICS content for an event
 */
function generateICS(event: any, includeReminder = true): string {
  const uid = `${event.id}@blkoutuk.cloud`;
  const now = new Date();

  // Format date for ICS (YYYYMMDDTHHMMSS)
  const formatICSDate = (date: Date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const eventDate = new Date(event.date);
  const endDate = new Date(eventDate.getTime() + 3 * 60 * 60 * 1000); // Default 3 hours

  // Escape special characters
  const escapeICS = (text: string) => {
    if (!text) return '';
    return text
      .replace(/\\/g, '\\\\')
      .replace(/;/g, '\\;')
      .replace(/,/g, '\\,')
      .replace(/\n/g, '\\n');
  };

  let ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//BLKOUT UK//Events Calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:BLKOUT Events',
    'X-WR-CALDESC:Black queer liberation events',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${formatICSDate(now)}`,
    `DTSTART:${formatICSDate(eventDate)}`,
    `DTEND:${formatICSDate(endDate)}`,
    `SUMMARY:${escapeICS(event.title)}`,
    `DESCRIPTION:${escapeICS(event.description || event.excerpt || '')}\\n\\n🏴‍☠️ BLKOUT Liberation Event`,
    `LOCATION:${escapeICS(event.location || 'TBA')}`,
    `URL:https://events.blkoutuk.cloud/event/${event.id}`,
    'CATEGORIES:BLKOUT,Community,Liberation',
    `ORGANIZER;CN=${escapeICS(event.organizer_name || 'BLKOUT')}:mailto:events@blkoutuk.com`
  ];

  // Add reminder if requested
  if (includeReminder) {
    ics.push(
      'BEGIN:VALARM',
      'TRIGGER:-PT24H',
      'ACTION:DISPLAY',
      `DESCRIPTION:Reminder: ${escapeICS(event.title)} tomorrow`,
      'END:VALARM',
      'BEGIN:VALARM',
      'TRIGGER:-PT1H',
      'ACTION:DISPLAY',
      `DESCRIPTION:${escapeICS(event.title)} starts in 1 hour`,
      'END:VALARM'
    );
  }

  ics.push('END:VEVENT', 'END:VCALENDAR');

  return ics.join('\r\n');
}

/**
 * Generate ICS content for multiple events (feed)
 */
function generateFeedICS(events: any[], feedName = 'BLKOUT Events'): string {
  const now = new Date();

  const formatICSDate = (date: Date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const escapeICS = (text: string) => {
    if (!text) return '';
    return text
      .replace(/\\/g, '\\\\')
      .replace(/;/g, '\\;')
      .replace(/,/g, '\\,')
      .replace(/\n/g, '\\n');
  };

  let ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//BLKOUT UK//Events Calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${escapeICS(feedName)}`,
    'X-WR-CALDESC:Black queer liberation events calendar',
    'REFRESH-INTERVAL;VALUE=DURATION:PT1H'
  ];

  events.forEach(event => {
    const uid = `${event.id}@blkoutuk.cloud`;
    const eventDate = new Date(event.date);
    const endDate = new Date(eventDate.getTime() + 3 * 60 * 60 * 1000);

    ics.push(
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTAMP:${formatICSDate(now)}`,
      `DTSTART:${formatICSDate(eventDate)}`,
      `DTEND:${formatICSDate(endDate)}`,
      `SUMMARY:${escapeICS(event.title)}`,
      `DESCRIPTION:${escapeICS(event.description || event.excerpt || '')}`,
      `LOCATION:${escapeICS(event.location || 'TBA')}`,
      `URL:https://events.blkoutuk.cloud/event/${event.id}`,
      'CATEGORIES:BLKOUT,Community',
      'END:VEVENT'
    );
  });

  ics.push('END:VCALENDAR');

  return ics.join('\r\n');
}

/**
 * GET /api/calendar/event/:eventId.ics
 * Get ICS file for a single event
 */
router.get('/event/:eventId.ics', async (req, res) => {
  try {
    const { eventId } = req.params;

    if (!SUPABASE_URL || !SUPABASE_KEY) {
      // Demo event
      const demoEvent = {
        id: eventId,
        title: 'BLKOUT Community Event',
        description: 'A liberation gathering for Black queer community.',
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        location: 'London, UK',
        organizer_name: 'BLKOUT'
      };

      const ics = generateICS(demoEvent);

      res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="blkout-event-${eventId}.ics"`);
      return res.send(ics);
    }

    // Fetch event from database
    const response = await axios.get(
      `${SUPABASE_URL}/rest/v1/events`,
      {
        params: {
          id: `eq.${eventId}`,
          select: '*',
          limit: 1
        },
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        }
      }
    );

    const event = response.data?.[0];

    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      });
    }

    const ics = generateICS(event);

    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="blkout-event-${eventId}.ics"`);
    return res.send(ics);

  } catch (error: any) {
    console.error('[Calendar] ICS generation error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Failed to generate calendar file',
      message: error.message
    });
  }
});

/**
 * GET /api/calendar/feed/public
 * Get public calendar feed with all upcoming events
 */
router.get('/feed/public', async (req, res) => {
  try {
    const { limit = 50 } = req.query;

    if (!SUPABASE_URL || !SUPABASE_KEY) {
      // Demo feed
      const demoEvents = [
        {
          id: 'demo-1',
          title: 'BLKOUT Monthly Mixer',
          date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          location: 'London'
        },
        {
          id: 'demo-2',
          title: 'Liberation Workshop',
          date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          location: 'Manchester'
        }
      ];

      const ics = generateFeedICS(demoEvents, 'BLKOUT Public Events');

      res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
      return res.send(ics);
    }

    // Fetch upcoming events
    const response = await axios.get(
      `${SUPABASE_URL}/rest/v1/events`,
      {
        params: {
          status: 'in.(approved,published)',
          date: `gte.${new Date().toISOString()}`,
          select: 'id,title,description,date,location,organizer_name',
          order: 'date.asc',
          limit
        },
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        }
      }
    );

    const events = response.data || [];
    const ics = generateFeedICS(events, 'BLKOUT Community Events');

    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    return res.send(ics);

  } catch (error: any) {
    console.error('[Calendar] Feed error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Failed to generate calendar feed',
      message: error.message
    });
  }
});

/**
 * GET /api/calendar/feed/:token
 * Get personalized calendar feed by token
 */
router.get('/feed/:token', async (req, res) => {
  try {
    const { token } = req.params;

    if (!SUPABASE_URL || !SUPABASE_KEY) {
      // Demo feed
      const feed = demoFeeds.get(token);

      if (!feed) {
        return res.status(404).json({
          success: false,
          error: 'Feed not found'
        });
      }

      const ics = generateFeedICS([], feed.feed_type + ' Events');
      res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
      return res.send(ics);
    }

    // Get feed config
    const feedResponse = await axios.get(
      `${SUPABASE_URL}/rest/v1/calendar_feeds`,
      {
        params: {
          feed_token: `eq.${token}`,
          select: '*',
          limit: 1
        },
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        }
      }
    );

    const feed = feedResponse.data?.[0];

    if (!feed) {
      return res.status(404).json({
        success: false,
        error: 'Feed not found'
      });
    }

    // Update last accessed
    axios.patch(
      `${SUPABASE_URL}/rest/v1/calendar_feeds`,
      { last_accessed_at: new Date().toISOString() },
      {
        params: { id: `eq.${feed.id}` },
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    ).catch(() => {}); // Fire and forget

    // Build event query based on feed type
    let events: any[] = [];

    if (feed.feed_type === 'rsvp') {
      // Get RSVP'd events
      const rsvpResponse = await axios.get(
        `${SUPABASE_URL}/rest/v1/event_rsvps`,
        {
          params: {
            user_id: `eq.${feed.user_id}`,
            status: 'eq.confirmed',
            select: 'event_id'
          },
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`
          }
        }
      );

      const eventIds = (rsvpResponse.data || []).map((r: any) => r.event_id);

      if (eventIds.length > 0) {
        const eventsResponse = await axios.get(
          `${SUPABASE_URL}/rest/v1/events`,
          {
            params: {
              id: `in.(${eventIds.join(',')})`,
              select: 'id,title,description,date,location,organizer_name',
              order: 'date.asc'
            },
            headers: {
              'apikey': SUPABASE_KEY,
              'Authorization': `Bearer ${SUPABASE_KEY}`
            }
          }
        );
        events = eventsResponse.data || [];
      }
    } else {
      // Get all upcoming events
      const eventsResponse = await axios.get(
        `${SUPABASE_URL}/rest/v1/events`,
        {
          params: {
            status: 'in.(approved,published)',
            date: `gte.${new Date().toISOString()}`,
            select: 'id,title,description,date,location,organizer_name',
            order: 'date.asc',
            limit: 100
          },
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`
          }
        }
      );
      events = eventsResponse.data || [];
    }

    const feedName = feed.feed_type === 'rsvp' ? 'My BLKOUT Events' : 'BLKOUT Events';
    const ics = generateFeedICS(events, feedName);

    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    return res.send(ics);

  } catch (error: any) {
    console.error('[Calendar] Personal feed error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Failed to generate calendar feed',
      message: error.message
    });
  }
});

/**
 * POST /api/calendar/feed
 * Create a personalized calendar feed
 */
router.post('/feed', async (req, res) => {
  try {
    const { userId, feedType = 'rsvp', categories, locations } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId required'
      });
    }

    const feedToken = crypto.randomBytes(16).toString('hex');

    const feedData = {
      user_id: userId,
      feed_token: feedToken,
      feed_type: feedType,
      categories: categories || [],
      locations: locations || [],
      created_at: new Date().toISOString()
    };

    if (!SUPABASE_URL || !SUPABASE_KEY) {
      demoFeeds.set(feedToken, feedData);

      return res.status(201).json({
        success: true,
        feedUrl: `${BASE_URL}/api/calendar/feed/${feedToken}`,
        webcalUrl: `webcal://${BASE_URL.replace(/^https?:\/\//, '')}/api/calendar/feed/${feedToken}`,
        googleCalendarUrl: `https://calendar.google.com/calendar/r?cid=webcal://${BASE_URL.replace(/^https?:\/\//, '')}/api/calendar/feed/${feedToken}`
      });
    }

    await axios.post(
      `${SUPABASE_URL}/rest/v1/calendar_feeds`,
      feedData,
      {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const feedUrl = `${BASE_URL}/api/calendar/feed/${feedToken}`;

    return res.status(201).json({
      success: true,
      feedUrl,
      webcalUrl: `webcal://${BASE_URL.replace(/^https?:\/\//, '')}/api/calendar/feed/${feedToken}`,
      googleCalendarUrl: `https://calendar.google.com/calendar/r?cid=webcal://${BASE_URL.replace(/^https?:\/\//, '')}/api/calendar/feed/${feedToken}`,
      token: feedToken
    });

  } catch (error: any) {
    console.error('[Calendar] Create feed error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Failed to create calendar feed',
      message: error.message
    });
  }
});

/**
 * GET /api/calendar/links/:eventId
 * Get calendar links for an event (Google, Apple, ICS)
 */
router.get('/links/:eventId', async (req, res) => {
  try {
    const { eventId } = req.params;

    // Fetch event details
    let event: any;

    if (!SUPABASE_URL || !SUPABASE_KEY) {
      event = {
        id: eventId,
        title: 'BLKOUT Community Event',
        description: 'A liberation gathering',
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        location: 'London, UK'
      };
    } else {
      const response = await axios.get(
        `${SUPABASE_URL}/rest/v1/events`,
        {
          params: { id: `eq.${eventId}`, select: '*', limit: 1 },
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`
          }
        }
      );
      event = response.data?.[0];
    }

    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      });
    }

    const eventDate = new Date(event.date);
    const endDate = new Date(eventDate.getTime() + 3 * 60 * 60 * 1000);

    // Format for Google Calendar
    const googleDateFormat = (d: Date) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

    const googleUrl = new URL('https://calendar.google.com/calendar/render');
    googleUrl.searchParams.set('action', 'TEMPLATE');
    googleUrl.searchParams.set('text', event.title);
    googleUrl.searchParams.set('dates', `${googleDateFormat(eventDate)}/${googleDateFormat(endDate)}`);
    googleUrl.searchParams.set('details', event.description || '');
    googleUrl.searchParams.set('location', event.location || '');

    // Format for Outlook
    const outlookUrl = new URL('https://outlook.live.com/calendar/0/deeplink/compose');
    outlookUrl.searchParams.set('subject', event.title);
    outlookUrl.searchParams.set('startdt', eventDate.toISOString());
    outlookUrl.searchParams.set('enddt', endDate.toISOString());
    outlookUrl.searchParams.set('body', event.description || '');
    outlookUrl.searchParams.set('location', event.location || '');

    return res.status(200).json({
      success: true,
      links: {
        ics: `${BASE_URL}/api/calendar/event/${eventId}.ics`,
        google: googleUrl.toString(),
        outlook: outlookUrl.toString(),
        apple: `webcal://${BASE_URL.replace(/^https?:\/\//, '')}/api/calendar/event/${eventId}.ics`,
        yahoo: `https://calendar.yahoo.com/?v=60&title=${encodeURIComponent(event.title)}&st=${googleDateFormat(eventDate)}&et=${googleDateFormat(endDate)}&desc=${encodeURIComponent(event.description || '')}&in_loc=${encodeURIComponent(event.location || '')}`
      },
      event: {
        id: event.id,
        title: event.title,
        date: event.date,
        location: event.location
      }
    });

  } catch (error: any) {
    console.error('[Calendar] Links error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Failed to generate calendar links',
      message: error.message
    });
  }
});

export default router;
