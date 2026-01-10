#!/usr/bin/env node

/**
 * Event Scraper for BLKOUT - GitHub Actions Version
 * Scrapes UK Black QTIPOC+ events and sends them to IVOR webhook for moderation
 */

const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

// Configuration
const WEBHOOK_URL = process.env.WEBHOOK_URL || 'http://localhost:8080/api/events/webhook';
const WEBHOOK_TOKEN = process.env.WEBHOOK_SECRET_TOKEN;
const EVENTBRITE_TOKEN = process.env.EVENTBRITE_API_TOKEN;
const OUTSAVVY_API_KEY = process.env.OUTSAVVY_API_KEY || 'ZR8JUA8ILRSSVWUNFIT3';

const LOG_FILE = `scraping-${new Date().toISOString().split('T')[0]}.log`;

// Logging utility
function log(level, message, data = null) {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] ${level}: ${message}`;
  console.log(logEntry);

  const logLine = data
    ? `${logEntry} ${JSON.stringify(data)}\n`
    : `${logEntry}\n`;

  fs.appendFileSync(LOG_FILE, logLine);
}

// Keywords for relevance filtering
const IDENTITY_KEYWORDS = [
  'black', 'african', 'afro', 'caribbean', 'diaspora',
  'qtipoc', 'queer', 'trans', 'transgender', 'gay', 'lesbian', 'bisexual',
  'lgbtq', 'lgbtqia', 'pride', 'rainbow', 'poc', 'people of color'
];

const EXCLUDE_KEYWORDS = [
  'corporate training', 'diversity workshop for companies', 'hr training'
];

// Calculate relevance score
function calculateRelevanceScore(title, description) {
  const text = `${title} ${description}`.toLowerCase();
  let score = 0;

  // Check for required keywords
  IDENTITY_KEYWORDS.forEach(keyword => {
    if (text.includes(keyword)) score += 10;
  });

  // Check for exclusion keywords
  EXCLUDE_KEYWORDS.forEach(keyword => {
    if (text.includes(keyword)) score -= 20;
  });

  return score;
}

// Send events to webhook in batches
async function sendToWebhook(events) {
  if (events.length === 0) {
    log('INFO', 'No events to send to webhook');
    return { success: true, processed: 0 };
  }

  const BATCH_SIZE = 10;
  const batches = [];

  for (let i = 0; i < events.length; i += BATCH_SIZE) {
    batches.push(events.slice(i, i + BATCH_SIZE));
  }

  log('INFO', `Sending ${events.length} events in ${batches.length} batches`);

  let totalProcessed = 0;
  let totalAutoApproved = 0;

  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];

    try {
      const response = await axios.post(
        WEBHOOK_URL,
        { events: batch },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-Webhook-Token': WEBHOOK_TOKEN
          },
          timeout: 30000
        }
      );

      if (response.data.success) {
        totalProcessed += response.data.stats.total;
        totalAutoApproved += response.data.stats.auto_approved || 0;
        log('INFO', `Batch ${i + 1}/${batches.length} processed`, response.data.stats);
      } else {
        log('ERROR', `Batch ${i + 1}/${batches.length} failed`, response.data);
      }

      // Rate limiting between batches
      if (i < batches.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

    } catch (error) {
      log('ERROR', `Batch ${i + 1}/${batches.length} error: ${error.message}`);
    }
  }

  return {
    success: true,
    processed: totalProcessed,
    autoApproved: totalAutoApproved
  };
}

// Scrape Eventbrite API
async function scrapeEventbrite() {
  if (!EVENTBRITE_TOKEN) {
    log('WARN', 'Eventbrite API token not configured, skipping');
    return [];
  }

  // Evidence-based search terms from 76 approved events analysis
  const searchTerms = [
    // Core identity terms (proven successful)
    'black queer',
    'black lgbt',
    'black trans',
    'qtipoc',
    'black pride',

    // Creative/Writing events (found in 5+ approved events)
    'black writing',
    'qtipoc writing',
    'black creative',
    'queer poetry',

    // Age-specific groups (strong pattern in approved events)
    'lgbtq 40+',
    'lgbtq 50+',
    'older lgbtq black',

    // Wellness/healing (popular theme in approved events)
    'black wellness lgbtq',
    'qtipoc healing',
    'queer joy black',

    // Social/gaming (multiple approved events)
    'queer gaming',
    'lgbtq board games black',

    // Culture (book clubs, film clubs found in approved events)
    'black queer book club',
    'qtipoc film club',

    // Professional development (Industry Takeover events)
    'black lgbtq networking',
    'queer black industry'
  ];

  const allEvents = [];
  const seenIds = new Set();

  for (const term of searchTerms) {
    try {
      log('INFO', `Searching Eventbrite for: "${term}"`);

      const response = await axios.get(
        'https://www.eventbriteapi.com/v3/events/search/',
        {
          params: {
            q: term,
            'location.address': 'United Kingdom',
            'location.within': '50km',
            'start_date.range_start': new Date().toISOString(),
            'start_date.range_end': new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
            expand: 'organizer,venue,ticket_availability',
            page_size: 50
          },
          headers: {
            'Authorization': `Bearer ${EVENTBRITE_TOKEN}`
          },
          timeout: 15000
        }
      );

      const events = response.data.events || [];

      events.forEach(event => {
        if (!seenIds.has(event.id)) {
          const relevanceScore = calculateRelevanceScore(
            event.name?.text || '',
            event.description?.text || ''
          );

          if (relevanceScore > 10) {
            seenIds.add(event.id);

            allEvents.push({
              type: 'event',
              title: event.name?.text || 'Untitled Event',
              description: event.description?.text || 'No description available',
              event_date: event.start?.local?.split('T')[0],
              location: event.online_event
                ? 'Online Event'
                : event.venue?.name || 'Location TBD',
              organizer_name: event.organizer?.name || 'Unknown Organizer',
              source_url: event.url,
              tags: extractTags(event),
              price: event.is_free ? 'Free' : (event.ticket_availability?.minimum_ticket_price?.display || 'See event page')
            });
          }
        }
      });

      log('INFO', `Found ${events.length} events for "${term}", ${allEvents.length} relevant so far`);

      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));

    } catch (error) {
      log('ERROR', `Eventbrite search failed for "${term}": ${error.message}`);
    }
  }

  return allEvents;
}

function extractTags(event) {
  const tags = [];

  if (event.category?.name) {
    tags.push(event.category.name.toLowerCase());
  }

  if (event.online_event) {
    tags.push('online');
  }

  const text = `${event.name?.text || ''} ${event.description?.text || ''}`.toLowerCase();

  const keywordTags = ['black', 'queer', 'trans', 'lgbtq', 'pride', 'qtipoc'];
  keywordTags.forEach(keyword => {
    if (text.includes(keyword)) {
      tags.push(keyword);
    }
  });

  return [...new Set(tags)];
}

// Scrape OutSavvy API (40% of approved events come from here!)
async function scrapeOutSavvy() {
  // Evidence shows OutSavvy is the #1 producer - use multiple search terms
  const searchTerms = [
    'black queer',
    'qtipoc',
    'black lgbt',
    'black trans',
    'queer writing',  // Found in approved events
    'lgbtq black wellness',  // Popular theme
    'queer gaming'  // Social events found
  ];

  const allEvents = [];
  const seenIds = new Set();

  for (const term of searchTerms) {
    try {
      log('INFO', `Searching OutSavvy for: "${term}"`);

      const response = await axios.get(
        'https://api.outsavvy.com/v1/events/search',
        {
          params: {
            q: term,
            latitude: 51.5074,
            longitude: -0.1278,
            range: 25,
            start_date: new Date().toISOString().split('T')[0],
            end_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          },
          headers: {
            'Authorization': `Partner ${OUTSAVVY_API_KEY}`
          },
          timeout: 15000
        }
      );

      const events = response.data.events || [];

      events.forEach(event => {
        if (!seenIds.has(event.id)) {
          const relevanceScore = calculateRelevanceScore(
            event.name || '',
            event.description || ''
          );

          if (relevanceScore > 10) {
            seenIds.add(event.id);

            allEvents.push({
              type: 'event',
              title: event.name || 'Untitled Event',
              description: event.description || 'No description available',
              event_date: event.start_date?.split('T')[0],
              location: event.venue?.name || 'Location TBD',
              organizer_name: event.organizer?.name || 'Unknown Organizer',
              source_url: event.url || `https://www.outsavvy.com/event/${event.id}`,
              tags: event.tags || [],
              price: event.price_min === 0 ? 'Free' : `£${event.price_min}`
            });
          }
        }
      });

      log('INFO', `Found ${events.length} events for "${term}", ${allEvents.length} relevant so far`);

      // Rate limiting between searches
      await new Promise(resolve => setTimeout(resolve, 2000));

    } catch (error) {
      log('ERROR', `OutSavvy search failed for "${term}": ${error.message}`);
    }
  }

  log('INFO', `Total OutSavvy events: ${allEvents.length}`);
  return allEvents;
}

// Scrape lgbthero.org.uk (13% of approved events - was completely missing!)
async function scrapeLGBTHero() {
  try {
    log('INFO', 'Scraping lgbthero.org.uk events');

    const response = await axios.get('https://www.lgbthero.org.uk/Event', {
      timeout: 15000
    });

    const $ = cheerio.load(response.data);
    const events = [];

    // Parse event listings (adjust selectors based on actual page structure)
    $('.event-item, .event-card, article[class*="event"]').each((i, el) => {
      const $event = $(el);

      const title = $event.find('h2, h3, .event-title, .title').first().text().trim();
      const description = $event.find('.event-description, .description, p').first().text().trim();
      const link = $event.find('a').first().attr('href');
      const location = $event.find('.event-location, .location').first().text().trim();
      const date = $event.find('.event-date, .date, time').first().text().trim();

      if (title && link) {
        const fullUrl = link.startsWith('http') ? link : `https://www.lgbthero.org.uk${link}`;

        // Check relevance
        const relevanceScore = calculateRelevanceScore(title, description);

        if (relevanceScore > 5) {  // Lower threshold for this trusted source
          events.push({
            type: 'event',
            title: title,
            description: description || 'LGBT Foundation event',
            event_date: parseLGBTHeroDate(date),
            location: location || 'See event page',
            organizer_name: 'LGBT Foundation',
            source_url: fullUrl,
            tags: ['lgbtq', 'community', 'lgbt foundation'],
            price: 'Free'
          });
        }
      }
    });

    log('INFO', `Found ${events.length} relevant lgbthero.org.uk events`);
    return events;

  } catch (error) {
    log('ERROR', `lgbthero.org.uk scraping failed: ${error.message}`);
    return [];
  }
}

// Helper function to parse dates from lgbthero.org.uk
function parseLGBTHeroDate(dateStr) {
  if (!dateStr) return null;

  try {
    // Try to extract date in various formats
    // Format examples: "20th November", "Wed 12 Nov", etc.
    const monthMap = {
      jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
      jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12'
    };

    const currentYear = new Date().getFullYear();
    const parts = dateStr.toLowerCase().match(/(\d{1,2})\w*\s+(\w+)/);

    if (parts) {
      const day = parts[1].padStart(2, '0');
      const monthStr = parts[2].substring(0, 3);
      const month = monthMap[monthStr];

      if (month) {
        return `${currentYear}-${month}-${day}`;
      }
    }
  } catch (e) {
    log('WARN', `Failed to parse date: ${dateStr}`);
  }

  return null;
}

// Main execution
async function main() {
  log('INFO', '========================================');
  log('INFO', 'Starting BLKOUT Event Scraping');
  log('INFO', '========================================');

  const startTime = Date.now();

  try {
    // Scrape all sources (evidence-based: Eventbrite 33%, OutSavvy 40%, lgbthero 13%)
    const [eventbriteEvents, outsavvyEvents, lgbtheroEvents] = await Promise.all([
      scrapeEventbrite(),
      scrapeOutSavvy(),
      scrapeLGBTHero()  // NEW: Was missing 13% of approved events!
    ]);

    // Combine and deduplicate
    const allEvents = [...eventbriteEvents, ...outsavvyEvents, ...lgbtheroEvents];
    const uniqueEvents = [];
    const seenTitles = new Set();

    allEvents.forEach(event => {
      const key = `${event.title}|${event.event_date}|${event.location}`.toLowerCase();
      if (!seenTitles.has(key)) {
        seenTitles.add(key);
        uniqueEvents.push(event);
      }
    });

    log('INFO', `Total events after deduplication: ${uniqueEvents.length}`);

    // Send to webhook
    const result = await sendToWebhook(uniqueEvents);

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    log('INFO', '========================================');
    log('INFO', 'Scraping Complete');
    log('INFO', `Duration: ${duration}s`);
    log('INFO', `Events scraped: ${allEvents.length}`);
    log('INFO', `Events deduplicated: ${uniqueEvents.length}`);
    log('INFO', `Events processed: ${result.processed}`);
    log('INFO', `Events auto-approved: ${result.autoApproved}`);
    log('INFO', '========================================');

    process.exit(0);

  } catch (error) {
    log('ERROR', `Fatal error: ${error.message}`);
    log('ERROR', error.stack);
    process.exit(1);
  }
}

// Run
main();
