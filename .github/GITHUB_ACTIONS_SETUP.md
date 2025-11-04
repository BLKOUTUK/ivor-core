# GitHub Actions Setup for Automated Event Scraping

## Overview
This setup uses GitHub Actions to automatically scrape UK Black QTIPOC+ events daily and send them through IVOR moderation to your Supabase database.

## Files Created
- `.github/workflows/scrape-events.yml` - GitHub Actions workflow
- `scripts/scrape-and-webhook.js` - Event scraping script

## Setup Instructions

### Step 1: Configure GitHub Secrets

Go to your repository → Settings → Secrets and variables → Actions → New repository secret

Add these secrets:

1. **BROWSERACT_TOKEN** (Required)
   ```
   DI9qU+3JW9jmlV0e5ti+accAZDRYzthYz9WYsldlExc=
   ```

2. **EVENTBRITE_API_TOKEN** (Optional but recommended)
   - Go to https://www.eventbrite.com/platform/
   - Create account → API Keys → Create API Key
   - Copy your Private Token
   - Paste as secret value

3. **OUTSAVVY_API_KEY** (Optional)
   ```
   Partner ZR8JUA8ILRSSVWUNFIT3
   ```
   (This is already set as default in the script)

### Step 2: Commit and Push Files

```bash
cd /home/robbe/ACTIVE_PROJECTS/BLKOUTNXT_Ecosystem/BLKOUTNXT_Projects/deployment-repos/ivor-core

# Add new files
git add .github/workflows/scrape-events.yml
git add scripts/scrape-and-webhook.js
git add .github/GITHUB_ACTIONS_SETUP.md
git add browseract-config.json
git add BROWSERACT_SETUP.md

# Commit
git commit -m "Add GitHub Actions automated event scraping

- Daily scraping at 6am UTC
- Eventbrite + OutSavvy integration
- Automatic IVOR moderation
- Logs and artifact upload"

# Push
git push origin main
```

### Step 3: Enable GitHub Actions

1. Go to your repository on GitHub
2. Click the "Actions" tab
3. If prompted, enable GitHub Actions for your repository
4. You should see "Daily Event Scraping" workflow

### Step 4: Test Manual Run

1. Go to Actions tab
2. Click "Daily Event Scraping" workflow
3. Click "Run workflow" dropdown
4. Click green "Run workflow" button
5. Watch the workflow run in real-time

Expected output:
```
✅ Checkout code
✅ Setup Node.js
✅ Install dependencies
✅ Scrape and send events
   - Searching Eventbrite for: "black queer"
   - Found X events for "black queer"
   - Searching OutSavvy...
   - Total events: XX
   - Sending to webhook...
   - Events processed: XX
   - Events auto-approved: XX
✅ Upload scraping logs
```

### Step 5: Verify in Supabase

```sql
-- Check newly scraped events
SELECT
  title,
  moderation_status,
  ivor_confidence,
  liberation_score,
  created_at
FROM browseract_events
WHERE DATE(created_at) = CURRENT_DATE
ORDER BY created_at DESC;
```

## Workflow Schedule

The workflow runs:
- **Daily at 6:00 AM UTC** (7:00 AM UK summer time, 6:00 AM UK winter time)
- **Manual trigger** anytime via "Run workflow" button

To change schedule, edit `.github/workflows/scrape-events.yml`:
```yaml
on:
  schedule:
    - cron: '0 6 * * *'  # Change this line
```

Cron examples:
- `0 6 * * *` - 6am daily
- `0 */6 * * *` - Every 6 hours
- `0 6 * * 1` - 6am every Monday
- `0 6 1 * *` - 6am on 1st of each month

## Monitoring

### View Workflow Runs
1. Go to repository → Actions tab
2. Click "Daily Event Scraping"
3. See all past runs and their status

### Download Logs
1. Click on a workflow run
2. Scroll down to "Artifacts"
3. Download `scraping-logs-{run_number}`
4. Unzip and view detailed logs

### Railway Logs
Check IVOR processing logs:
```bash
railway logs --tail
```

Look for:
- `[BrowserAct] Received N events for processing`
- `[Supabase REST] ✅ Event saved`

## Troubleshooting

### Issue: Workflow not running automatically
- Check Actions tab → Enable workflows if needed
- Verify cron schedule syntax
- GitHub free tier: workflows may be delayed during high load

### Issue: "BROWSERACT_TOKEN not set" error
- Verify secret name matches exactly: `BROWSERACT_TOKEN`
- Check secret value is correct
- Re-add secret if needed

### Issue: No Eventbrite events found
- Add `EVENTBRITE_API_TOKEN` secret
- Verify token is valid on Eventbrite
- Check quota limits on Eventbrite account

### Issue: Events scraped but not appearing in Supabase
- Check Railway logs for errors
- Verify webhook URL is correct
- Test webhook manually:
  ```bash
  curl -X POST https://ivor-core-production.up.railway.app/api/browseract/webhook \
    -H "Content-Type: application/json" \
    -H "X-BrowserAct-Token: DI9qU+3JW9jmlV0e5ti+accAZDRYzthYz9WYsldlExc=" \
    -d '{"events":[{"type":"event","title":"Test","description":"Test event","event_date":"2026-01-01","location":"Test","source_url":"https://example.com","organizer_name":"Test","tags":["test"],"price":"Free"}]}'
  ```

## Cost Analysis

### GitHub Actions (FREE)
- 2,000 minutes/month on free tier
- This workflow uses ~3-5 minutes/run
- Daily runs = ~120-150 minutes/month
- **100% FREE within limits**

### Alternative Costs
- Railway: Already running ($5/month for your current usage)
- Supabase: Free tier sufficient for now
- Eventbrite API: Free tier sufficient

## Extending the Scrapers

### Add More Sources

Edit `scripts/scrape-and-webhook.js`:

```javascript
// Add new scraper function
async function scrapeNewSource() {
  // Your scraping logic
  return events;
}

// Update main():
const [eventbriteEvents, outsavvyEvents, newSourceEvents] = await Promise.all([
  scrapeEventbrite(),
  scrapeOutSavvy(),
  scrapeNewSource()  // Add here
]);
```

### Add Web Scraping

Install cheerio for HTML parsing:

```javascript
const cheerio = require('cheerio');

async function scrapeLGBTFoundation() {
  const response = await axios.get('https://lgbt.foundation/events');
  const $ = cheerio.load(response.data);

  const events = [];
  $('.event-item').each((i, el) => {
    events.push({
      type: 'event',
      title: $(el).find('.event-title').text(),
      description: $(el).find('.event-description').text(),
      // ... more fields
    });
  });

  return events;
}
```

## Next Steps

1. ✅ Set up GitHub secrets
2. ✅ Push files to repository
3. ✅ Run manual test
4. ✅ Verify events in Supabase
5. ⏳ Wait for first automated run (6am UTC tomorrow)
6. 📊 Monitor and iterate

## Support

- GitHub Actions Docs: https://docs.github.com/en/actions
- Workflow file: `.github/workflows/scrape-events.yml`
- Scraper script: `scripts/scrape-and-webhook.js`
- Webhook endpoint: `ivor-core/src/api/browserActRoutes.ts`
