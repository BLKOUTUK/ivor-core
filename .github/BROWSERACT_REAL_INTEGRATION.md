# BrowserAct Integration Guide (ACCURATE VERSION)

## Overview
BrowserAct is an AI-powered no-code web scraping tool that uses **natural language workflows** to extract data from websites. Data is routed to external endpoints via **n8n or Make** integrations.

**CORRECTION:** BrowserAct doesn't send webhooks directly - it integrates through n8n/Make automation platforms!

## What BrowserAct Actually Does

### Core Features:
1. **AI Workflows:** Natural language workflow builder using predefined nodes
2. **No Coding Required:** Describe tasks in plain English
3. **Accurate & Cost-Effective:** More accurate than Agents, smarter than RPA, 90% cost reduction
4. **Auto-Bypass:** Intelligently bypasses CAPTCHAs and verification automatically
5. **Clean Data:** Automatically removes ads and irrelevant content

### Integration Methods:
- **n8n:** Instant, no-code integration (recommended)
- **Make (formerly Integromat):** Instant, no-code integration
- **API:** Robust API for developers (custom implementations)

### Pricing (You Have 500 Free Credits!):
- **$1.00 = 1,000 credits**
- **Cost based on:** Number of steps your task takes
- **500 free credits** = ~50-500 scraping runs depending on complexity

## Recommended Architecture

### Option 1: BrowserAct → n8n → IVOR Webhook (RECOMMENDED)

This is the **easiest and most reliable** approach for your 500 free credits:

```
┌──────────────┐     ┌──────────┐     ┌──────────────┐     ┌──────────┐
│ BrowserAct   │────▶│   n8n    │────▶│ IVOR Webhook │────▶│ Supabase │
│  Workflows   │     │ Workflow │     │   /api/      │     │ Database │
│ (scraping)   │     │  (HTTP)  │     │  events/     │     │          │
└──────────────┘     └──────────┘     │  webhook     │     └──────────┘
                                       └──────────────┘
```

**Why n8n is Better Than Direct Integration:**
- ✅ Visual workflow editor (no code)
- ✅ Data transformation built-in
- ✅ Error handling and retries
- ✅ Free self-hosted version available
- ✅ Can add additional processing steps easily
- ✅ Schedule scraping runs
- ✅ Monitor runs in dashboard

### Option 2: BrowserAct → Make → IVOR Webhook

Same as n8n but uses Make.com instead:

```
┌──────────────┐     ┌──────────┐     ┌──────────────┐
│ BrowserAct   │────▶│   Make   │────▶│ IVOR Webhook │
│  Workflows   │     │ Scenario │     │   (Railway)  │
└──────────────┘     └──────────┘     └──────────────┘
```

**Why Make:**
- ✅ More polished UI than n8n
- ✅ Generous free tier
- ✅ Strong webhook support
- ⚠️ Cloud-only (no self-hosting)

### Option 3: BrowserAct API → Custom Script → IVOR Webhook

For developers who want full control:

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│ BrowserAct   │────▶│ Custom Node  │────▶│ IVOR Webhook │
│     API      │     │    Script    │     │   (Railway)  │
└──────────────┘     └──────────────┘     └──────────────┘
```

**Why Direct API:**
- ✅ Full control over data flow
- ✅ Custom error handling
- ✅ Can add business logic
- ⚠️ Requires coding
- ⚠️ More maintenance

## Step-by-Step Setup (n8n Method - RECOMMENDED)

### Part 1: Set Up n8n

**Option A: Cloud n8n (Easiest)**
1. Sign up at https://n8n.io
2. Create account (free tier available)
3. Access web-based workflow editor

**Option B: Self-Hosted n8n (Most Control)**
```bash
# Using Docker (recommended)
docker volume create n8n_data
docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  -v n8n_data:/home/node/.n8n \
  n8nio/n8n

# Or using npm
npm install -g n8n
n8n start

# Access at: http://localhost:5678
```

### Part 2: Configure BrowserAct

1. **Sign up for BrowserAct:** https://www.browseract.com
2. **Verify 500 free credits** in your dashboard
3. **Create AI Workflow** for event scraping:

**Example BrowserAct Workflow (Natural Language):**

```
Workflow: "Scrape UK Black QTIPOC Events"

Steps:
1. Go to https://www.eventbrite.co.uk/d/united-kingdom/black-queer/
2. Extract all event cards with:
   - Event title
   - Event description
   - Date and time
   - Location
   - Organizer name
   - Price
   - Event URL
3. Repeat for search terms:
   - "black queer"
   - "qtipoc"
   - "black trans"
   - "black lgbtq"
4. Send extracted data to webhook
```

**BrowserAct Output Format:**
BrowserAct will output structured JSON that needs transformation for IVOR.

### Part 3: Create n8n Workflow

**n8n Workflow Structure:**

```
┌─────────────────────┐
│  1. BrowserAct      │  ← Trigger from BrowserAct
│     Webhook Node    │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  2. Function Node   │  ← Transform data to IVOR format
│     (Transform)     │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  3. HTTP Request    │  ← Send to IVOR webhook
│     (POST)          │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  4. Error Handler   │  ← Log failures, retry
│     (Optional)      │
└─────────────────────┘
```

**Detailed n8n Node Configuration:**

#### Node 1: BrowserAct Webhook (Trigger)
- **Type:** Webhook (Trigger)
- **Method:** POST
- **Path:** `/browseract-events` (or any unique path)
- **Authentication:** None (BrowserAct sends data directly)
- **Response:** Immediate 200 OK

This creates a webhook URL like:
```
https://your-n8n-instance.com/webhook/browseract-events
```

Configure this URL in BrowserAct to receive scraped data.

#### Node 2: Function (Transform Data)
- **Type:** Function
- **Purpose:** Transform BrowserAct output to IVOR webhook format

```javascript
// Transform BrowserAct data to IVOR format
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

return [{
  json: {
    events: transformedEvents
  }
}];
```

#### Node 3: HTTP Request (Send to IVOR)
- **Type:** HTTP Request
- **Method:** POST
- **URL:** `https://ivor-core-production.up.railway.app/api/events/webhook`
- **Authentication:** Header Auth
  - **Header Name:** `X-Webhook-Token`
  - **Header Value:** `DI9qU+3JW9jmlV0e5ti+accAZDRYzthYz9WYsldlExc=`
- **Body Content Type:** JSON
- **Body:** `{{ $json }}`
- **Options:**
  - Timeout: 30000ms
  - Redirect: Follow
  - Response Format: JSON

#### Node 4: Error Handler (Optional but Recommended)
- **Type:** Error Trigger
- **Connected to:** HTTP Request node
- **Purpose:** Log failures, send notifications, retry

```javascript
// Example error handler
const error = $json.error;
const failedData = $json.data;

console.log('IVOR webhook failed:', error);

// Option: Send to Slack/Discord for monitoring
// Option: Store failed attempts in database for retry
// Option: Send email notification

return [{
  json: {
    error: error.message,
    timestamp: new Date().toISOString(),
    failedEvents: failedData
  }
}];
```

### Part 4: Connect BrowserAct to n8n

In BrowserAct workflow settings:

1. **Enable webhook output**
2. **Set webhook URL:** Your n8n webhook URL from Node 1
3. **Set method:** POST
4. **Set headers:** (if n8n requires authentication)
   - Content-Type: application/json
5. **Test connection:** Send test data

### Part 5: Configure Scraping Schedule

**In BrowserAct:**
- Set schedule: Daily at 6:00 AM UTC
- Or trigger manually for testing

**In n8n (Alternative):**
- Add **Schedule Trigger** node
- Configure to run daily at 6:00 AM UTC
- Connect to **BrowserAct API** node (if using API approach)

## Evidence-Based Event Sources Configuration

Based on analysis of 76 approved events:

### Eventbrite Searches (33% of events)
Configure these searches in BrowserAct:

**Core Identity (High Priority):**
```
1. "black queer" + UK filter
2. "qtipoc" + UK filter
3. "black trans" + UK filter
4. "black lgbt" + UK filter
5. "black pride" + UK filter
```

**Creative/Writing (Found in 5+ approved events):**
```
6. "black writing" + UK filter
7. "qtipoc writing" + UK filter
8. "black creative" + UK filter
9. "queer poetry" + UK filter
```

**Age-Specific (Strong pattern):**
```
10. "lgbtq 40+" + UK filter
11. "lgbtq 50+" + UK filter
12. "older lgbtq black" + UK filter
```

**Wellness (Popular theme):**
```
13. "black wellness lgbtq" + UK filter
14. "qtipoc healing" + UK filter
15. "queer joy black" + UK filter
```

**Social/Gaming:**
```
16. "queer gaming" + UK filter
17. "lgbtq board games black" + UK filter
```

**Culture:**
```
18. "black queer book club" + UK filter
19. "qtipoc film club" + UK filter
```

**Professional:**
```
20. "black lgbtq networking" + UK filter
21. "queer black industry" + UK filter
```

### OutSavvy (40% of events - #1 producer!)

**BrowserAct Workflow for OutSavvy:**
```
1. Go to https://www.outsavvy.com/events/london
2. Search for each term:
   - "black queer"
   - "qtipoc"
   - "black trans"
   - "black creative"
   - "queer wellness"
   - "black pride"
   - "lgbtq networking"
3. Extract event data
4. Send to webhook
```

### Direct Website Scraping

**lgbthero.org.uk (13% of events - was missing!):**
```
BrowserAct Workflow:
1. Go to https://www.lgbthero.org.uk/Event
2. Extract all event listings
3. Filter for Black/POC focused events
4. Send to webhook
```

**LGBT Consortium:**
```
URL: https://www.consortium.lgbt/events
Focus: National LGBTQ+ policy and advocacy
```

**QX Magazine:**
```
URL: https://www.qxmagazine.com/events/
Focus: London queer nightlife and culture
```

**Attitude Magazine:**
```
URL: https://attitude.co.uk/events
Focus: UK-wide LGBTQ+ culture and activism
```

## Testing Your Integration

### Test 1: BrowserAct → n8n (Verify Connection)
1. Trigger BrowserAct workflow manually
2. Check n8n executions dashboard
3. Verify data received in correct format

### Test 2: n8n → IVOR Webhook (Verify Transformation)
1. Check n8n Function node output
2. Verify transformed JSON matches IVOR format
3. Confirm HTTP Request node sends successfully

### Test 3: Full End-to-End (Verify Database Write)
1. Trigger complete workflow
2. Check Railway logs:
   ```bash
   railway logs --tail | grep "Events Webhook"
   ```
3. Verify events in Supabase:
   ```sql
   SELECT
     title,
     moderation_status,
     ivor_confidence,
     submitted_by,
     created_at
   FROM browseract_events
   WHERE DATE(created_at) = CURRENT_DATE
     AND submitted_by = 'automation'
   ORDER BY created_at DESC;
   ```

Expected results:
- **auto-approved:** Events with ≥90% confidence
- **review-quick:** Events with 70-89% confidence
- **review-deep:** Events with <70% confidence

## Cost Management

### Credit Usage Monitoring

**BrowserAct Dashboard:**
- Starting credits: 500 free
- Monitor daily usage
- Cost per scraping run: 5-50 credits (depends on complexity)
- **Estimated capacity:** 10-100 automated runs with free credits

**Cost Optimization Strategies:**
1. **Batch scraping:** Scrape multiple search terms in one workflow
2. **Smart scheduling:** Daily instead of hourly
3. **Target high-value sources:** Focus on OutSavvy (40% of events)
4. **Avoid redundant searches:** Remove low-performing search terms

### When Credits Run Low

**Option 1:** Purchase additional credits ($1 = 1,000 credits)
**Option 2:** Reduce scraping frequency (weekly instead of daily)
**Option 3:** Focus on top sources only (OutSavvy, Eventbrite top terms)
**Option 4:** Fall back to GitHub Actions custom scrapers (maintenance required)

## Troubleshooting

### Issue: BrowserAct not sending data to n8n

**Check:**
1. n8n webhook URL is correct and accessible
2. n8n workflow is activated (not paused)
3. BrowserAct workflow completed successfully
4. No CAPTCHA blocking the scraper

**Test manually:**
```bash
# Test n8n webhook endpoint
curl -X POST https://your-n8n.com/webhook/browseract-events \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Event",
    "description": "Testing n8n webhook",
    "date": "2026-01-15",
    "location": "London",
    "url": "https://example.com"
  }'
```

### Issue: n8n receiving data but not reaching IVOR

**Check:**
1. Function node transformation is correct
2. HTTP Request node URL is correct: `/api/events/webhook`
3. Authentication header is set: `X-Webhook-Token`
4. Railway is running (check deployment status)

**Test IVOR webhook directly:**
```bash
curl -X POST https://ivor-core-production.up.railway.app/api/events/webhook \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Token: DI9qU+3JW9jmlV0e5ti+accAZDRYzthYz9WYsldlExc=" \
  -d '{
    "events": [{
      "type": "event",
      "title": "Test: n8n Integration",
      "description": "Testing via n8n workflow",
      "event_date": "2026-02-01",
      "location": "London, UK",
      "source_url": "https://example.com",
      "organizer_name": "Test",
      "tags": ["test"],
      "price": "Free"
    }]
  }'
```

### Issue: Events reaching IVOR but not saving to Supabase

**Check Railway logs:**
```bash
railway logs --tail | grep -E "(Events Webhook|Supabase|Error)"
```

Look for:
- `[Events Webhook] Received N events`
- `[Supabase REST] ✅ Event saved`
- `[Supabase REST] ❌ Write failed` (indicates auth or schema issue)

## Scaling to Newsroom

This architecture models perfectly for newsroom automation:

### Reusable Patterns:
1. **BrowserAct/Scraper → n8n → IVOR → Database** (same architecture)
2. **AI Moderation:** IVOR analyzes for relevance, quality, liberation values
3. **Automated Approval:** High-confidence auto-approved, low to review
4. **Visual Workflow:** Easy to add new sources in n8n
5. **Error Handling:** Built-in retries and monitoring

### Newsroom Adaptations:
```
Change content type: events → news
Add news sources: Guardian, PinkNews, Black news outlets, RSS feeds
Adjust IVOR prompt: News analysis instead of event analysis
Add deduplication: Same story from multiple sources
Add categorization: Local, national, culture, activism, policy
```

### Example Newsroom Workflow:
```
┌──────────────┐     ┌──────────┐     ┌──────────────┐
│ BrowserAct   │────▶│   n8n    │────▶│ IVOR News    │
│  RSS Feeds   │     │ • Parse  │     │  Moderation  │
│  Guardian    │     │ • Dedupe │     │              │
│  PinkNews    │     │ • Format │     └──────┬───────┘
│  Black news  │     │          │            │
└──────────────┘     └──────────┘            ▼
                                     ┌──────────────┐
                                     │  Supabase    │
                                     │  news table  │
                                     └──────────────┘
```

## Next Steps

1. ✅ Sign up for BrowserAct (500 free credits)
2. ✅ Set up n8n (cloud or self-hosted)
3. ✅ Create n8n workflow (4 nodes: webhook, transform, HTTP, error)
4. ✅ Configure BrowserAct workflows for event sources
5. ✅ Connect BrowserAct → n8n webhook
6. ✅ Test full pipeline
7. ✅ Schedule daily scraping
8. 📊 Monitor credit usage and results

## Resources

- **BrowserAct:** https://www.browseract.com
- **n8n Docs:** https://docs.n8n.io
- **n8n Webhook Guide:** https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.webhook/
- **IVOR Webhook:** `https://ivor-core-production.up.railway.app/api/events/webhook`
- **GitHub (if available):** https://github.com/browseract-ai/browseract/

---

**Key Insight:** BrowserAct is a **no-code scraping tool** that outputs to **n8n/Make**, not a direct webhook service. The integration requires n8n/Make as a middleware layer to transform and route data to IVOR.
