# BrowserAct Integration Setup for Automated Event Scraping

## Overview
This guide configures BrowserAct (a browser automation service with 500 free credits) to automatically scrape UK Black QTIPOC+ events and send them through IVOR moderation to your Supabase database.

## Why BrowserAct?

**Advantages over custom scrapers:**
- Pre-built scrapers for major event platforms (Eventbrite, Meetup, Eventbrite, etc.)
- Automatic handling of API changes and website updates
- Built-in browser automation for JavaScript-heavy sites
- Anti-bot detection bypassing
- No maintenance burden when sites change their structure
- Professional reliability vs. brittle custom code

**Cost-Effective:**
- 500 free credits available
- Each scraping run typically uses 1-5 credits
- 100-500 automated runs possible with free tier

## Prerequisites

1. ✅ IVOR webhook endpoint deployed on Railway: `https://ivor-core-production.up.railway.app/api/events/webhook`
2. ✅ Webhook authentication token: `DI9qU+3JW9jmlV0e5ti+accAZDRYzthYz9WYsldlExc=`
3. ✅ Supabase database with `browseract_events` table
4. ✅ IVOR AI moderation configured (Groq + llama-3.3-70b-versatile)
5. 🔜 BrowserAct account with 500 free credits

## Step 1: Sign Up for BrowserAct

1. Go to https://browseract.com (or similar service)
2. Create account with email
3. Verify you have 500 free credits in dashboard
4. Note your API key (if provided)

## Step 2: Configure Event Sources

Based on evidence-based analysis of 76 approved events:

### Eventbrite Sources (33% of events)
Configure BrowserAct to search Eventbrite with these search terms:

**Core Identity Terms:**
- `black queer`
- `black lgbt`
- `black trans`
- `qtipoc`
- `black pride`

**Creative/Writing Events (Found in 5+ approved events):**
- `black writing`
- `qtipoc writing`
- `black creative`
- `queer poetry`

**Age-Specific Groups (Strong pattern in data):**
- `lgbtq 40+`
- `lgbtq 50+`
- `older lgbtq black`

**Wellness/Healing (Popular theme):**
- `black wellness lgbtq`
- `qtipoc healing`
- `queer joy black`

**Social/Gaming:**
- `queer gaming`
- `lgbtq board games black`

**Culture (Book/Film clubs):**
- `black queer book club`
- `qtipoc film club`

**Professional Development:**
- `black lgbtq networking`
- `queer black industry`

**Location Filter:** United Kingdom (focus on London, Manchester, Birmingham, Edinburgh, Glasgow, Bristol)

### OutSavvy Sources (40% of events - #1 producer!)
Configure BrowserAct to search OutSavvy London with:
- `black queer`
- `qtipoc`
- `black trans`
- `black creative`
- `queer wellness`
- `black pride`
- `lgbtq networking`

### Direct Website Scraping
Configure BrowserAct to scrape these specific sites:

1. **lgbthero.org.uk** (13% of events - was missing!)
   - URL: https://www.lgbthero.org.uk/Event
   - Look for: Event listings page
   - Extract: Title, description, date, location, link

2. **LGBT Consortium**
   - URL: https://www.consortium.lgbt/events
   - Focus: National LGBTQ+ policy and advocacy events

3. **QX Magazine London**
   - URL: https://www.qxmagazine.com/events/
   - Focus: London queer nightlife and culture

4. **Attitude Magazine**
   - URL: https://attitude.co.uk/events
   - Focus: UK-wide LGBTQ+ culture and activism

## Step 3: Configure BrowserAct Webhook

In BrowserAct dashboard:

1. **Webhook URL:**
   ```
   https://ivor-core-production.up.railway.app/api/events/webhook
   ```

2. **Webhook Method:** POST

3. **Authentication Header:**
   ```
   X-Webhook-Token: DI9qU+3JW9jmlV0e5ti+accAZDRYzthYz9WYsldlExc=
   ```

4. **Request Format:**
   ```json
   {
     "events": [
       {
         "type": "event",
         "title": "Event Title Here",
         "description": "Event description with full details",
         "event_date": "2026-01-15",
         "location": "London, UK",
         "source_url": "https://source.com/event/123",
         "organizer_name": "Event Organizer",
         "tags": ["black", "queer", "community"],
         "price": "Free" // or "£10", "£5-15", etc.
       }
     ]
   }
   ```

5. **Field Mapping** (if BrowserAct requires mapping):
   - Title → `title`
   - Description → `description`
   - Date → `event_date` (format: YYYY-MM-DD)
   - Time → Include in `event_date` or separate field
   - Location → `location`
   - URL → `source_url`
   - Organizer → `organizer_name`
   - Price → `price`
   - Tags → `tags` (array of strings)

## Step 4: Configure Schedule

Set BrowserAct to run:

**Daily Schedule:**
- Time: 6:00 AM UTC (7:00 AM UK summer time, 6:00 AM UK winter time)
- Frequency: Daily
- Days: All days

**Why 6:00 AM UTC?**
- Catches new events posted overnight
- Low server load time
- Events processed before morning users log in
- Aligns with UK business hours

## Step 5: Test Integration

### Manual Test Run
1. In BrowserAct dashboard, trigger manual scrape
2. Watch for webhook requests in Railway logs:
   ```bash
   railway logs --tail
   ```

Expected logs:
```
[Events Webhook] 🚀 DEPLOYMENT v197585f - llama-3.3-70b-versatile + Supabase ACTIVE
[Events Webhook] Received 15 events for processing
[IVOR] Analyzing event: "Black Trans Joy Workshop"
[Supabase REST] ✅ Event saved (auto-approved): Black Trans Joy Workshop [ID: 123]
[Events Webhook] Processing complete: { total: 15, auto_approved: 12, review_quick: 2, review_deep: 1 }
```

### Verify in Supabase
```sql
-- Check newly scraped events
SELECT
  title,
  moderation_status,
  ivor_confidence,
  liberation_score,
  submitted_by,
  created_at
FROM browseract_events
WHERE DATE(created_at) = CURRENT_DATE
  AND submitted_by = 'automation'
ORDER BY created_at DESC;
```

Expected results:
- **auto-approved**: Events with ≥90% confidence, HIGH relevance, HIGH quality
- **review-quick**: Events with 70-89% confidence, needs curator quick check
- **review-deep**: Events with <70% confidence, needs curator deep review

## Step 6: Monitor Credit Usage

BrowserAct Dashboard → Credits:
- Starting credits: 500
- Current usage: Monitor daily
- Cost per run: ~1-5 credits depending on sources scraped
- Estimated runs available: 100-500 automated runs

**When credits run low:**
- Option 1: Purchase additional credits (check BrowserAct pricing)
- Option 2: Reduce scraping frequency (weekly instead of daily)
- Option 3: Reduce number of sources scraped
- Option 4: Fall back to GitHub Actions custom scrapers (maintenance required)

## Troubleshooting

### Issue: No events received
**Check:**
1. BrowserAct dashboard shows successful runs
2. Webhook URL is correct: `/api/events/webhook` (not `/api/browseract/webhook`)
3. Authentication header is set correctly
4. Railway logs show incoming requests

**Test webhook manually:**
```bash
curl -X POST https://ivor-core-production.up.railway.app/api/events/webhook \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Token: DI9qU+3JW9jmlV0e5ti+accAZDRYzthYz9WYsldlExc=" \
  -d '{
    "events": [{
      "type": "event",
      "title": "Test: BrowserAct Integration Check",
      "description": "Testing BrowserAct webhook integration with IVOR moderation",
      "event_date": "2026-02-01",
      "location": "London, UK",
      "source_url": "https://example.com/test",
      "organizer_name": "BrowserAct Test",
      "tags": ["test"],
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
    "processing_time_ms": 2500
  }
}
```

### Issue: Events not appearing in Supabase
**Check:**
1. Railway logs for Supabase errors
2. Supabase service role key is correct
3. `browseract_events` table exists and has correct schema
4. RLS policies allow inserts

**Verify Supabase connection:**
```bash
railway logs --tail | grep "Supabase"
```

Look for:
```
[Supabase REST] ✅ Event saved
```

If you see:
```
[Supabase REST] ❌ Write failed: 401 Unauthorized
```
→ Check `SUPABASE_SERVICE_ROLE_KEY` environment variable in Railway

### Issue: All events going to review instead of auto-approval
**Check:**
1. IVOR AI moderation is working (check Groq API key)
2. Search terms are producing relevant results
3. Event descriptions have enough detail for AI analysis

**Railway logs to check:**
```bash
railway logs --tail | grep "IVOR"
```

Look for confidence scores:
```
[IVOR] Event analyzed: confidence=0.92, relevance=high, quality=high → auto-approved
[IVOR] Event analyzed: confidence=0.65, relevance=medium, quality=high → review-deep
```

## Cost Analysis

### BrowserAct (FREE for 500 credits)
- Daily runs: ~1-5 credits/run
- 30 days: ~30-150 credits
- **FREE for 3-17 months** depending on configuration

### Alternative: GitHub Actions (FREE)
- Kept as backup in `.github/workflows/scrape-events.yml`
- Uses custom Node.js scrapers
- Requires maintenance when sites change
- GitHub Actions: 2,000 minutes/month free (our workflow uses ~3-5 min/run)

### Hybrid Approach (Recommended)
- **Primary:** BrowserAct for stable, maintained scraping
- **Backup:** GitHub Actions if BrowserAct credits exhausted
- **Cost:** $0/month until BrowserAct credits run out

## Evidence-Based Configuration

This configuration is based on analysis of **76 approved events** in your Supabase database:

### Source Distribution:
- **OutSavvy:** 40% (30 events) - #1 producer
- **Eventbrite:** 33% (25 events) - Strong second
- **lgbthero.org.uk:** 13% (10 events) - Was missing from original scrapers!
- **Other sources:** 14% (11 events)

### Event Types Found:
- Writing workshops and creative sessions
- Age-specific meetups (40+, 50+ groups)
- Wellness and healing circles
- Gaming socials and board game nights
- Book clubs and film clubs
- Professional networking events
- Pride celebrations and activism

### Geographic Distribution:
- **London:** 85%+ of events
- **Other UK cities:** Manchester, Birmingham, Edinburgh, Glasgow, Bristol, Croydon

### Top Organizers:
- London LGBTQ+ Community Centre
- LGBT Foundation
- UD Music
- Raze Collective
- radical rhizomes

## Next Steps After Setup

1. ✅ Complete BrowserAct account setup
2. ✅ Configure all event sources with search terms
3. ✅ Point webhook to IVOR endpoint
4. ✅ Run first manual test scrape
5. ✅ Verify events in Supabase
6. ✅ Enable daily automated schedule
7. 📊 Monitor credit usage weekly
8. 🔄 Iterate on search terms based on results

## Scaling to Newsroom (Future)

This events scraping approach models the architecture for newsroom automation:

### Reusable Patterns:
1. **Webhook Architecture:** BrowserAct/scraper → IVOR webhook → Database
2. **AI Moderation:** IVOR analyzes content for relevance, quality, liberation values
3. **Automated Approval:** High-confidence content auto-approved, low-confidence to review
4. **Evidence-Based Config:** Analyze approved content to improve scraping
5. **Hybrid Approach:** Professional service (BrowserAct) + custom scrapers (GitHub Actions) as backup

### Newsroom Adaptations:
- Change content type from `events` to `news`
- Add news-specific sources (Black LGBTQ+ media outlets)
- Adjust IVOR moderation prompt for news analysis
- Add deduplication logic (same story from multiple sources)
- Add categorization (local news, national policy, culture, activism, etc.)

## Support

- **BrowserAct Dashboard:** https://browseract.com/dashboard
- **Railway Logs:** `railway logs --tail`
- **IVOR Webhook Endpoint:** `https://ivor-core-production.up.railway.app/api/events/webhook`
- **Webhook Route Code:** `ivor-core/src/api/eventsWebhookRoutes.ts`
- **Supabase Table:** `browseract_events`
- **GitHub Actions Backup:** `.github/workflows/scrape-events.yml`
