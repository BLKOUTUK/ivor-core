# Renaming Changelog: BrowserAct → Generic Events Webhook

## Date: 2025-11-04

## Why This Renaming?

**Problem:** Original implementation used "BrowserAct" naming throughout the codebase, causing confusion when we decided to use the actual BrowserAct service (not just custom scrapers).

**Solution:** Renamed all "browseract" references to generic "events" or "webhook" terminology, making it clear that:
- The webhook accepts events from ANY source (BrowserAct service, GitHub Actions, manual submissions, etc.)
- BrowserAct is now a SERVICE we integrate with, not the name of our infrastructure

## Files Renamed

### 1. Documentation
- `BROWSERACT_SETUP.md` → `EVENTS_AUTOMATION_SETUP.md`
- Created: `BROWSERACT_INTEGRATION_SETUP.md` (new guide for actual BrowserAct service)
- Created: `RENAMING_CHANGELOG.md` (this file)

### 2. Configuration
- `browseract-config.json` → `events-sources-config.json`

### 3. Scripts
- `scripts/scrape-and-webhook.js` → `scripts/events-scraper.js`

### 4. API Routes
- `src/api/browserActRoutes.ts` → `src/api/eventsWebhookRoutes.ts`

## Code Changes

### API Endpoint Path
**Before:** `/api/browseract/webhook`
**After:** `/api/events/webhook`

**Full URL:** `https://ivor-core-production.up.railway.app/api/events/webhook`

### Environment Variables
**Before:**
```bash
BROWSERACT_SECRET_TOKEN=DI9qU+3JW9jmlV0e5ti+accAZDRYzthYz9WYsldlExc=
```

**After:**
```bash
WEBHOOK_SECRET_TOKEN=DI9qU+3JW9jmlV0e5ti+accAZDRYzthYz9WYsldlExc=
```

### GitHub Secrets
**Before:**
```bash
BROWSERACT_TOKEN
```

**After:**
```bash
WEBHOOK_TOKEN
```

### Authentication Headers
**Before:**
```bash
X-BrowserAct-Token: {token}
```

**After:**
```bash
X-Webhook-Token: {token}
```

### TypeScript Interfaces
**Before:**
```typescript
interface BrowserActEvent {
  type: 'event' | 'news'
  title: string
  // ...
}
```

**After:**
```typescript
interface IncomingEvent {
  type: 'event' | 'news'
  title: string
  // ...
}
```

### Console Logs
**Before:**
```typescript
console.log('[BrowserAct] Received events...')
```

**After:**
```typescript
console.log('[Events Webhook] Received events...')
```

### Import Statements (src/server.ts)
**Before:**
```typescript
import browserActRoutes from './api/browserActRoutes.js'
app.use('/api/browseract', browserActRoutes)
```

**After:**
```typescript
import eventsWebhookRoutes from './api/eventsWebhookRoutes.js'
app.use('/api/events', eventsWebhookRoutes)
```

## Railway Environment Variables to Update

⚠️ **IMPORTANT:** Update these in Railway dashboard:

1. **Add new variable:**
   ```
   WEBHOOK_SECRET_TOKEN=DI9qU+3JW9jmlV0e5ti+accAZDRYzthYz9WYsldlExc=
   ```

2. **Remove old variable** (after testing):
   ```
   BROWSERACT_SECRET_TOKEN
   ```

**Or:** Simply rename the existing variable to avoid downtime:
- Railway Dashboard → Variables → Edit `BROWSERACT_SECRET_TOKEN` → Rename to `WEBHOOK_SECRET_TOKEN`

## GitHub Secrets to Update

⚠️ **IMPORTANT:** Update these in GitHub repository settings:

1. **Add new secret:**
   ```
   WEBHOOK_TOKEN=DI9qU+3JW9jmlV0e5ti+accAZDRYzthYz9WYsldlExc=
   ```

2. **Remove old secret** (after updating workflow):
   ```
   BROWSERACT_TOKEN
   ```

**GitHub Workflow Updated:** `.github/workflows/scrape-events.yml` now references `WEBHOOK_TOKEN`

## Testing Checklist

### 1. Test Webhook Endpoint (New URL)
```bash
curl -X POST https://ivor-core-production.up.railway.app/api/events/webhook \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Token: DI9qU+3JW9jmlV0e5ti+accAZDRYzthYz9WYsldlExc=" \
  -d '{
    "events": [{
      "type": "event",
      "title": "Test: Post-Renaming Verification",
      "description": "Testing renamed webhook endpoint with generic event structure",
      "event_date": "2026-02-15",
      "location": "London, UK",
      "source_url": "https://example.com/test-renamed",
      "organizer_name": "Renaming Test",
      "tags": ["test", "verification"],
      "price": "Free"
    }]
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Events processed successfully",
  "stats": {
    "total": 1,
    "auto_approved": 1,
    "processing_time_ms": 2000
  }
}
```

### 2. Test Old Endpoint (Should 404)
```bash
curl -X POST https://ivor-core-production.up.railway.app/api/browseract/webhook \
  -H "Content-Type: application/json" \
  -H "X-BrowserAct-Token: DI9qU+3JW9jmlV0e5ti+accAZDRYzthYz9WYsldlExc=" \
  -d '{"events": [{"type": "event", "title": "Old endpoint test"}]}'
```

**Expected:** 404 Not Found (old endpoint no longer exists)

### 3. Verify Railway Deployment
```bash
railway logs --tail | grep "Events Webhook"
```

**Expected:**
```
[Events Webhook] 🚀 DEPLOYMENT v197585f - llama-3.3-70b-versatile + Supabase ACTIVE
[Events Webhook] Received 1 events for processing
[Events Webhook] Processing complete: {...}
```

### 4. Test GitHub Actions Workflow
**Trigger:** Go to GitHub → Actions → "Daily Event Scraping" → "Run workflow"

**Check Logs:** Should see references to:
- `scripts/events-scraper.js` (not `scrape-and-webhook.js`)
- Webhook URL: `/api/events/webhook` (not `/api/browseract/webhook`)
- Environment variable: `WEBHOOK_TOKEN` (not `BROWSERACT_TOKEN`)

### 5. Verify Supabase Writes
```sql
SELECT
  title,
  submitted_by,
  moderation_status,
  created_at
FROM browseract_events
WHERE title LIKE '%Test: Post-Renaming%'
ORDER BY created_at DESC
LIMIT 5;
```

**Expected:** Event saved with `submitted_by = 'automation'`

## Backward Compatibility

### Breaking Changes
- ❌ Old endpoint `/api/browseract/webhook` no longer works
- ❌ Old header `X-BrowserAct-Token` no longer recognized
- ❌ Old env var `BROWSERACT_SECRET_TOKEN` no longer used

### Migration Path
1. Update Railway environment variables (WEBHOOK_SECRET_TOKEN)
2. Update GitHub secrets (WEBHOOK_TOKEN)
3. Deploy changes to Railway (auto-deploys from GitHub)
4. Update BrowserAct webhook configuration (when setting up)
5. Test with curl command (see Testing Checklist)
6. Remove old environment variables and secrets after confirming everything works

## Future Integrations

This generic naming supports future event sources:

### Current Sources:
- ✅ GitHub Actions (custom scrapers via workflow)
- 🔜 BrowserAct service (professional scraping)
- 🔜 Manual submissions (admin panel)

### Future Sources (Newsroom):
- 📰 RSS feed scrapers (Guardian, PinkNews, Black news outlets)
- 🐦 Social media monitoring (Twitter/X, Instagram, TikTok)
- 📧 Newsletter aggregation (email parsing)
- 🔗 Partner organization feeds (API integrations)
- 👥 Community submissions (user-generated content)

All sources send to the same generic webhook: `/api/events/webhook`

## Rollback Plan

If issues arise, rollback steps:

1. **Revert files:**
   ```bash
   git revert HEAD
   git push origin main
   ```

2. **Restore Railway env vars:**
   ```
   BROWSERACT_SECRET_TOKEN=DI9qU+3JW9jmlV0e5ti+accAZDRYzthYz9WYsldlExc=
   ```

3. **Restore GitHub secrets:**
   ```
   BROWSERACT_TOKEN
   ```

4. **Wait for Railway auto-deploy** (2-3 minutes)

5. **Test old endpoint:**
   ```bash
   curl -X POST https://ivor-core-production.up.railway.app/api/browseract/webhook ...
   ```

## Related Documentation

- **BrowserAct Integration:** `.github/BROWSERACT_INTEGRATION_SETUP.md`
- **Events Automation:** `.github/EVENTS_AUTOMATION_SETUP.md` (formerly BROWSERACT_SETUP.md)
- **GitHub Workflow:** `.github/workflows/scrape-events.yml`
- **Webhook Route:** `src/api/eventsWebhookRoutes.ts`
- **Event Scraper:** `scripts/events-scraper.js`
- **Sources Config:** `events-sources-config.json`

## Git Commit Reference

**Commit Message:**
```
refactor: Rename BrowserAct references to generic events webhook

- Rename API route: /api/browseract → /api/events
- Rename files: browserActRoutes → eventsWebhookRoutes
- Rename env vars: BROWSERACT_SECRET_TOKEN → WEBHOOK_SECRET_TOKEN
- Rename headers: X-BrowserAct-Token → X-Webhook-Token
- Update all console logs and documentation
- Prepare for actual BrowserAct service integration

This clarifies that "BrowserAct" is a SERVICE we integrate with,
not the name of our infrastructure. The webhook now has generic
naming and can accept events from any source: BrowserAct service,
GitHub Actions, manual submissions, or future integrations.

Breaking Changes:
- Old endpoint /api/browseract/webhook no longer works
- Must update Railway env vars and GitHub secrets
- See .github/RENAMING_CHANGELOG.md for full migration guide
```

**Files Changed:**
```
renamed: BROWSERACT_SETUP.md → EVENTS_AUTOMATION_SETUP.md
renamed: browseract-config.json → events-sources-config.json
renamed: scripts/scrape-and-webhook.js → scripts/events-scraper.js
renamed: src/api/browserActRoutes.ts → src/api/eventsWebhookRoutes.ts
modified: src/server.ts
modified: .github/workflows/scrape-events.yml
new file: .github/BROWSERACT_INTEGRATION_SETUP.md
new file: .github/RENAMING_CHANGELOG.md
```
