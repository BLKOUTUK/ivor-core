# BrowserAct Setup Guide - BLKOUT Events Automation

## Overview
This guide explains how to configure BrowserAct to automatically scrape UK Black QTIPOC+ events and send them through IVOR moderation to Supabase.

## Architecture

```
BrowserAct Scrapers → Webhook → IVOR AI Moderation → Supabase Database
                      (Railway)   (llama-3.3-70b)     (browseract_events)
```

## Configuration Files

### 1. `browseract-config.json`
Main configuration file defining:
- Event sources to scrape (Eventbrite, LGBT Foundation, UK Black Pride, etc.)
- Webhook endpoint for IVOR integration
- Scraping schedule (daily at 6am UK time)
- Filtering rules for relevance

### 2. Webhook Endpoint
- **URL**: `https://ivor-core-production.up.railway.app/api/browseract/webhook`
- **Method**: POST
- **Auth**: `X-BrowserAct-Token: DI9qU+3JW9jmlV0e5ti+accAZDRYzthYz9WYsldlExc=`

## Quick Start

### Option 1: BrowserAct SaaS Platform
1. Sign up at https://browseract.com (or equivalent service)
2. Create new scraper project
3. Import `browseract-config.json`
4. Configure webhook settings:
   - URL: `https://ivor-core-production.up.railway.app/api/browseract/webhook`
   - Header: `X-BrowserAct-Token: DI9qU+3JW9jmlV0e5ti+accAZDRYzthYz9WYsldlExc=`
5. Set schedule: Daily at 06:00 Europe/London
6. Enable and test

### Option 2: Self-Hosted Scraper
If you want to run scrapers yourself:

```bash
# Use the existing real_events_scraper.cjs
cd ~/ACTIVE_PROJECTS/BLKOUTNXT_Ecosystem/BLKOUTNXT_Projects/events-calendar/black-qtipoc-events-calendar

# Modify it to POST to webhook instead of local API
# Then run with cron:
crontab -e

# Add daily scraping at 6am:
0 6 * * * cd /path/to/scraper && node real_events_scraper.cjs
```

### Option 3: GitHub Actions (Recommended for Free Tier)
Create `.github/workflows/scrape-events.yml`:

```yaml
name: Scrape Events Daily
on:
  schedule:
    - cron: '0 6 * * *'  # 6am UTC daily
  workflow_dispatch:  # Manual trigger

jobs:
  scrape:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm install axios cheerio

      - name: Run scraper
        env:
          WEBHOOK_URL: https://ivor-core-production.up.railway.app/api/browseract/webhook
          BROWSERACT_TOKEN: ${{ secrets.BROWSERACT_TOKEN }}
          EVENTBRITE_TOKEN: ${{ secrets.EVENTBRITE_API_TOKEN }}
        run: node scripts/scrape-and-webhook.js
```

## Event Sources Configured

### 1. Eventbrite UK (API-based)
- **Search terms**: "black queer", "qtipoc", "black lgbt", "black trans"
- **Coverage**: UK-wide, 50km radius from London
- **Frequency**: Every scrape
- **API**: Requires `EVENTBRITE_API_TOKEN`

### 2. LGBT Foundation Manchester (Web scraping)
- **URL**: https://lgbt.foundation/events
- **Filter**: Black/QTIPOC keywords
- **Notes**: Community-focused, trusted source

### 3. UK Black Pride (Web scraping)
- **URL**: https://www.ukblackpride.org.uk/events
- **Coverage**: All UK Black Pride events
- **Notes**: Primary source for Black QTIPOC+ events

### 4. Gendered Intelligence (Web scraping)
- **URL**: https://genderedintelligence.co.uk/events
- **Filter**: Black/QTIPOC trans events
- **Notes**: Trans-focused organization

### 5. OutSavvy API
- **API**: https://api.outsavvy.com/v1/events/search
- **Auth**: `Partner ZR8JUA8ILRSSVWUNFIT3`
- **Coverage**: London LGBTQ+ events

## IVOR Moderation Flow

When BrowserAct sends events to the webhook:

1. **Event Received** → Parse and validate
2. **IVOR AI Analysis** → llama-3.3-70b evaluates:
   - Relevance to Black QTIPOC+ communities
   - Quality and safety indicators
   - Liberation values alignment
3. **Moderation Decision**:
   - **auto-approved** (≥90% confidence + high relevance)
   - **review-quick** (70-89% confidence)
   - **review-deep** (<70% confidence or red flags)
4. **Save to Database** → `browseract_events` table

## Testing the Setup

### Test 1: Manual Webhook Test
```bash
curl -X POST https://ivor-core-production.up.railway.app/api/browseract/webhook \
  -H "Content-Type: application/json" \
  -H "X-BrowserAct-Token: DI9qU+3JW9jmlV0e5ti+accAZDRYzthYz9WYsldlExc=" \
  -d '{
    "events": [{
      "type": "event",
      "title": "Black Trans Liberation Workshop",
      "description": "Educational workshop on Black trans history and organizing. Community building for Black trans people in London.",
      "event_date": "2026-01-25",
      "location": "Southbank Centre, London",
      "source_url": "https://example.com/test",
      "organizer_name": "Test Community Group",
      "tags": ["black", "trans", "liberation"],
      "price": "Free"
    }]
  }'
```

Expected response:
```json
{
  "success": true,
  "message": "Events processed successfully",
  "stats": {
    "total": 1,
    "auto_approved": 1,
    "review_quick": 0,
    "review_deep": 0,
    "processing_time_ms": ~1200
  }
}
```

### Test 2: Check Database
```sql
SELECT
  title,
  moderation_status,
  ivor_confidence,
  liberation_score,
  relevance,
  quality
FROM browseract_events
ORDER BY created_at DESC
LIMIT 5;
```

## Monitoring

### Railway Logs
```bash
railway logs --tail
```

Look for:
- `[BrowserAct] Received N events for processing`
- `[Supabase REST] ✅ Event saved`
- `[IVOR] Moderation complete`

### Supabase Dashboard
Monitor `browseract_events` table:
- Row count growing daily
- Distribution of moderation_status
- IVOR confidence scores

## Troubleshooting

### Issue: No events being scraped
- Check BrowserAct cron/schedule is enabled
- Verify webhook URL is correct
- Test webhook manually with curl

### Issue: Events saved but all "review-deep"
- IVOR AI may need tuning
- Check event descriptions have enough detail
- Review moderation prompt in `browserActRoutes.ts`

### Issue: 401 Unauthorized
- Verify `SUPABASE_SERVICE_ROLE_KEY` in Railway
- Check `X-BrowserAct-Token` matches in config

## Next Steps

1. **Choose deployment method** (SaaS/Self-hosted/GitHub Actions)
2. **Configure secrets** (API tokens, webhook token)
3. **Test with one source** (e.g., UK Black Pride)
4. **Enable all sources** once working
5. **Build curator dashboard** to review moderated events
6. **Set up notifications** for high-value events

## Support

- Railway Deployment: https://railway.app/project/ivor-core-production
- Webhook Endpoint: `ivor-core/src/api/browserActRoutes.ts`
- Database Schema: `ivor-core/supabase/migrations/20251104000000_create_browseract_events_table.sql`
