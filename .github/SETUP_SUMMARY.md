# Event Scraping Automation - Complete Setup Summary

## ✅ What's Been Completed

### 1. Infrastructure Renaming (Generic Event Webhook)
**Status:** ✅ DEPLOYED

**Changes Made:**
- Renamed API endpoint: `/api/browseract/webhook` → `/api/events/webhook`
- Renamed files for generic event handling (not BrowserAct-specific)
- Updated environment variables: `BROWSERACT_SECRET_TOKEN` → `WEBHOOK_SECRET_TOKEN`
- Updated authentication headers: `X-BrowserAct-Token` → `X-Webhook-Token`

**Files Updated:**
```
✅ src/api/browserActRoutes.ts → src/api/eventsWebhookRoutes.ts
✅ scripts/scrape-and-webhook.js → scripts/events-scraper.js
✅ browseract-config.json → events-sources-config.json
✅ .github/workflows/scrape-events.yml (updated paths)
✅ src/server.ts (updated imports and route registration)
```

**Deployed:** Railway auto-deployed from GitHub ✅

### 2. Evidence-Based Event Source Configuration
**Status:** ✅ ANALYZED

Based on 76 approved events in Supabase:

**Source Distribution:**
- OutSavvy: 40% (30 events) - **#1 producer**
- Eventbrite: 33% (25 events)
- lgbthero.org.uk: 13% (10 events) - **was missing!**
- Other: 14% (11 events)

**Event Types Found:**
- Writing workshops, creative sessions
- Age-specific meetups (40+, 50+)
- Wellness and healing circles
- Gaming socials, board game nights
- Book clubs, film clubs
- Professional networking
- Pride celebrations, activism

**Configured Sources:**
- ✅ Eventbrite: 21 search terms
- ✅ OutSavvy: 7 search terms
- ✅ Direct sites: lgbthero.org.uk, LGBT Consortium, QX Magazine, Attitude Magazine

### 3. Documentation Created
**Status:** ✅ COMPLETE

**Files Created:**
1. `.github/EVENTS_AUTOMATION_SETUP.md` - General automation guide
2. `.github/RENAMING_CHANGELOG.md` - Migration guide with breaking changes
3. `.github/BROWSERACT_REAL_INTEGRATION.md` - **ACCURATE** BrowserAct + n8n guide
4. `.github/SETUP_SUMMARY.md` - This file (complete overview)

**Deprecated Documentation:**
- ~~`.github/BROWSERACT_INTEGRATION_SETUP.md`~~ (incorrect - assumed direct webhooks)

---

## 🎯 Current Architecture

### Backend (IVOR Core)
```
Railway Deployment: https://ivor-core-production.up.railway.app
API Endpoint: /api/events/webhook
Authentication: X-Webhook-Token header
AI Moderation: Groq + llama-3.3-70b-versatile
Database: Supabase (REST API)
Table: browseract_events
```

### Webhook Accepts:
```json
{
  "events": [{
    "type": "event",
    "title": "Event Title",
    "description": "Full description",
    "event_date": "2026-01-15",
    "location": "London, UK",
    "source_url": "https://source.com/event",
    "organizer_name": "Organizer Name",
    "tags": ["black", "queer"],
    "price": "Free"
  }]
}
```

### IVOR Moderation Flow:
```
Event → IVOR AI Analysis → Auto-Approval Decision
  ├─ ≥90% confidence + HIGH relevance → auto-approved
  ├─ 70-89% confidence → review-quick
  └─ <70% confidence → review-deep
```

---

## ⚠️ Action Required (Your Side)

### 1. Update Railway Environment Variables
**URL:** https://railway.app/dashboard

**Action:**
1. Go to ivor-core project → Variables
2. Add or rename:
   ```
   WEBHOOK_SECRET_TOKEN=DI9qU+3JW9jmlV0e5ti+accAZDRYzthYz9WYsldlExc=
   ```
3. Optional: Remove old variable after testing:
   ```
   BROWSERACT_SECRET_TOKEN (deprecated)
   ```

**Test After Update:**
```bash
curl -X POST https://ivor-core-production.up.railway.app/api/events/webhook \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Token: DI9qU+3JW9jmlV0e5ti+accAZDRYzthYz9WYsldlExc=" \
  -d '{"events":[{"type":"event","title":"Test","description":"Testing","event_date":"2026-01-15","location":"London","source_url":"https://example.com","organizer_name":"Test","tags":["test"],"price":"Free"}]}'
```

Expected: `{"success": true, "message": "Events processed successfully"}`

### 2. Update GitHub Secrets
**URL:** https://github.com/BLKOUTUK/ivor-core/settings/secrets/actions

**Action:**
1. Add new secret:
   - Name: `WEBHOOK_TOKEN`
   - Value: `DI9qU+3JW9jmlV0e5ti+accAZDRYzthYz9WYsldlExc=`
2. Optional: Remove old secret after GitHub Actions workflow runs successfully:
   - Name: `BROWSERACT_TOKEN` (deprecated)

### 3. Set Up BrowserAct + n8n Integration

**Why n8n?** BrowserAct doesn't send webhooks directly - it integrates via n8n or Make!

#### Option A: n8n Cloud (Easiest)
1. Sign up: https://n8n.io
2. Create workflow with 4 nodes:
   - Webhook (receive from BrowserAct)
   - Function (transform to IVOR format)
   - HTTP Request (send to IVOR)
   - Error Handler (log failures)

#### Option B: Self-Hosted n8n (Most Control)
```bash
docker volume create n8n_data
docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  -v n8n_data:/home/node/.n8n \
  n8nio/n8n

# Access: http://localhost:5678
```

#### n8n Workflow Configuration:

**Node 1: Webhook (Trigger)**
- Path: `/browseract-events`
- Method: POST
- Creates URL: `https://your-n8n.com/webhook/browseract-events`

**Node 2: Function (Transform)**
```javascript
const browserActData = $input.all();

const transformedEvents = browserActData.map(item => {
  return {
    type: 'event',
    title: item.json.title || 'Untitled Event',
    description: item.json.description || '',
    event_date: item.json.date || null,
    location: item.json.location || 'See event page',
    source_url: item.json.url || '',
    organizer_name: item.json.organizer || 'Unknown',
    tags: item.json.tags || ['black', 'queer', 'community'],
    price: item.json.price || 'Free',
    image_url: item.json.image || null
  };
});

return [{ json: { events: transformedEvents } }];
```

**Node 3: HTTP Request**
- URL: `https://ivor-core-production.up.railway.app/api/events/webhook`
- Method: POST
- Headers:
  - `X-Webhook-Token`: `DI9qU+3JW9jmlV0e5ti+accAZDRYzthYz9WYsldlExc=`
  - `Content-Type`: `application/json`
- Body: `{{ $json }}`

**Node 4: Error Handler**
- Connect to HTTP Request node
- Log failures, send notifications

### 4. Configure BrowserAct Workflows

**Sign up:** https://www.browseract.com (500 free credits!)

**Create AI Workflows using natural language:**

**Example Workflow 1: Eventbrite Black Queer Events**
```
Workflow Name: "Eventbrite UK - Black Queer Events"

Instructions:
1. Go to https://www.eventbrite.co.uk/d/united-kingdom/black-queer/
2. Extract all event cards containing:
   - Event title
   - Event description
   - Date and time
   - Location
   - Organizer name
   - Price
   - Event URL
3. Send extracted data to webhook: [your n8n webhook URL]
```

**Example Workflow 2: OutSavvy London**
```
Workflow Name: "OutSavvy - Black QTIPOC Events"

Instructions:
1. Go to https://www.outsavvy.com/events/london
2. Search for: "black queer"
3. Extract all event listings with:
   - Title
   - Description
   - Date and time
   - Location
   - Price
   - Event link
4. Send to webhook: [your n8n webhook URL]
```

**Configure 21 Eventbrite workflows** (evidence-based search terms from `.github/BROWSERACT_REAL_INTEGRATION.md`)

**Configure 7 OutSavvy workflows** (top search terms)

**Configure 4 direct site scrapers** (lgbthero.org.uk, LGBT Consortium, QX Magazine, Attitude)

### 5. Schedule & Test

**In BrowserAct:**
- Set schedule: Daily at 6:00 AM UTC
- Or trigger manually for testing

**Test Full Pipeline:**
1. Trigger BrowserAct workflow
2. Check n8n executions (data received?)
3. Check Railway logs (IVOR processed?)
4. Check Supabase (events saved?)

```bash
# Check Railway logs
railway logs --tail | grep "Events Webhook"

# Expected:
# [Events Webhook] Received 15 events for processing
# [Supabase REST] ✅ Event saved (auto-approved): ...
# [Events Webhook] Processing complete: {...}
```

```sql
-- Check Supabase
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

---

## 📊 Expected Results After Setup

### Daily Scraping Output:
- **10-30 events/day** from Eventbrite (21 search terms)
- **5-15 events/day** from OutSavvy (7 search terms)
- **2-5 events/day** from direct sites (4 sources)
- **Total: 17-50 events/day**

### IVOR Moderation Distribution (Based on 76 events analyzed):
- **60-70% auto-approved** (≥90% confidence, HIGH relevance)
- **20-30% review-quick** (70-89% confidence)
- **5-10% review-deep** (<70% confidence or red flags)

### Credit Usage:
- **BrowserAct:** 5-50 credits/day (depends on complexity)
- **500 free credits** = **10-100 days** of scraping
- After free credits: $1 = 1,000 credits

---

## 🔄 Alternative: GitHub Actions (Backup)

If you don't want to use BrowserAct + n8n, the **GitHub Actions custom scrapers** are still available:

**Status:** ✅ Ready (updated with new webhook endpoint)

**Workflow File:** `.github/workflows/scrape-events.yml`

**Features:**
- ✅ Custom Node.js scrapers (Eventbrite, OutSavvy, lgbthero.org.uk)
- ✅ Daily schedule (6:00 AM UTC)
- ✅ Manual trigger available
- ✅ Free (2,000 minutes/month GitHub Actions)
- ⚠️ Requires maintenance when sites change

**To Use:**
1. Update GitHub secret: `WEBHOOK_TOKEN`
2. Update secrets: `EVENTBRITE_API_TOKEN`, `OUTSAVVY_API_KEY`
3. Trigger workflow: GitHub → Actions → "Daily Event Scraping" → Run workflow

**Note:** Eventbrite API and lgbthero.org.uk currently returning 404 errors - needs debugging or will be solved by BrowserAct.

---

## 🚀 Scaling to Newsroom

This architecture is **perfect for newsroom automation** with minimal changes:

### Same Pattern:
```
Content Source → n8n → IVOR Moderation → Supabase
```

### Newsroom Adaptations:
1. **Change content type:** `events` → `news`
2. **Add news sources:**
   - RSS feeds (Guardian, PinkNews, Black news outlets)
   - Social media monitoring (Twitter/X, Instagram)
   - Newsletter aggregation (email parsing)
   - Partner APIs (direct integrations)
3. **Adjust IVOR prompt:** News analysis instead of event analysis
4. **Add deduplication:** Same story from multiple sources
5. **Add categorization:** Local, national, culture, activism, policy

### n8n Newsroom Workflow:
```
Node 1: RSS Feed (Guardian UK Black news)
Node 2: RSS Feed (PinkNews)
Node 3: BrowserAct (Black news websites)
Node 4: Merge (combine all sources)
Node 5: Deduplicate (remove duplicate stories)
Node 6: Function (transform to IVOR format)
Node 7: HTTP Request (send to IVOR news webhook)
Node 8: Error Handler
```

---

## 📚 Documentation Reference

### Setup Guides:
- **Start Here:** `.github/SETUP_SUMMARY.md` (this file)
- **n8n Integration:** `.github/BROWSERACT_REAL_INTEGRATION.md` (accurate guide)
- **General Automation:** `.github/EVENTS_AUTOMATION_SETUP.md`
- **Migration Guide:** `.github/RENAMING_CHANGELOG.md`

### API Documentation:
- **Webhook Endpoint:** `https://ivor-core-production.up.railway.app/api/events/webhook`
- **Route Code:** `src/api/eventsWebhookRoutes.ts`
- **IVOR Moderation Logic:** See `moderateEventContent()` function

### Configuration Files:
- **Event Sources:** `events-sources-config.json` (21 Eventbrite, 7 OutSavvy, 4 direct)
- **GitHub Workflow:** `.github/workflows/scrape-events.yml`
- **Custom Scraper:** `scripts/events-scraper.js`

---

## ✅ Completion Checklist

### Infrastructure (Completed):
- [x] Rename API routes to generic event webhook
- [x] Update authentication headers and environment variables
- [x] Deploy to Railway
- [x] Update GitHub Actions workflow
- [x] Create comprehensive documentation

### Your Action Items (Pending):
- [ ] Update Railway environment variable: `WEBHOOK_SECRET_TOKEN`
- [ ] Update GitHub secret: `WEBHOOK_TOKEN`
- [ ] Sign up for BrowserAct (500 free credits)
- [ ] Set up n8n (cloud or self-hosted)
- [ ] Create n8n workflow (4 nodes)
- [ ] Configure BrowserAct AI workflows (21 Eventbrite + 7 OutSavvy + 4 direct)
- [ ] Connect BrowserAct → n8n → IVOR
- [ ] Test full pipeline
- [ ] Schedule daily scraping (6:00 AM UTC)
- [ ] Monitor credit usage and results

### Optional Enhancements:
- [ ] Add Slack/Discord notifications for errors
- [ ] Create admin dashboard for reviewing moderation queue
- [ ] Add analytics for event source performance
- [ ] Implement duplicate event detection
- [ ] Add geographic distribution analysis

---

## 🆘 Support

**Railway Logs:**
```bash
railway logs --tail
```

**Test Webhook:**
```bash
curl -X POST https://ivor-core-production.up.railway.app/api/events/webhook \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Token: DI9qU+3JW9jmlV0e5ti+accAZDRYzthYz9WYsldlExc=" \
  -d '{"events":[{"type":"event","title":"Test","description":"Testing","event_date":"2026-01-15","location":"London","source_url":"https://example.com","organizer_name":"Test","tags":["test"],"price":"Free"}]}'
```

**Check Database:**
```sql
SELECT COUNT(*) FROM browseract_events WHERE DATE(created_at) = CURRENT_DATE;
```

**Resources:**
- BrowserAct: https://www.browseract.com
- n8n Docs: https://docs.n8n.io
- IVOR Webhook Code: `src/api/eventsWebhookRoutes.ts`

---

**Last Updated:** 2025-11-04
**Status:** Infrastructure complete, awaiting external service setup (BrowserAct + n8n)
