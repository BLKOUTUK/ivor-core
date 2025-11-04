# Railway Deployment Setup for ivor-core

## Current Status

### ✅ Completed
- [x] Code pushed to GitHub (4 commits)
- [x] All environment variables configured in Railway
- [x] Google Sheets created with correct tab structure
- [x] Railway configuration files fixed (railway.json, removed nixpacks.toml)
- [x] package-lock.json regenerated and synced
- [x] Deployment successful on Railway
- [x] Webhook endpoint tested successfully (314ms response time)

### ⚠️ Action Required
- [ ] **CRITICAL: Set Google Sheet sharing permissions to "Anyone with the link can edit"**
- [ ] Verify event data appears in Google Sheets after permission fix
- [ ] Configure BrowserAct automations with webhook URL

## Environment Variables

### ✅ Already Set in Railway
```bash
BROWSERACT_SECRET_TOKEN=[configured in Railway]
GROQ_API_KEY=[configured in Railway]
GOOGLE_SHEET_ID=12kIERdVbiuycjdvFQMzkbY08Xjc15k0N2KE-pJuk9WQ
SUPABASE_URL=https://bgjengudzfickgomjqmz.supabase.co
SUPABASE_SERVICE_ROLE_KEY=[configured in Railway]
SEMANTIC_SEARCH_URL=https://web-production-f5f58.up.railway.app
```

### 🚨 NEW REQUIRED: Service Account for Google Sheets
**CRITICAL UPDATE**: Code now uses Service Account authentication for Google Sheets (API keys don't support write operations).

**You must add**:
```bash
GOOGLE_SERVICE_ACCOUNT_JSON='{"type":"service_account","project_id":"...","private_key":"...","client_email":"..."}'
```

**And remove** (no longer used):
```bash
# GOOGLE_API_KEY - NOT USED ANYMORE
```

**See**: `GOOGLE_SERVICE_ACCOUNT_SETUP.md` for complete setup instructions.

## GitHub Repository

**Repo**: https://github.com/BLKOUTUK/ivor-core
**Branch**: main
**Latest Commit**: e276706 - "fix: Remove Python nixpacks.toml - this is a Node.js project"

## Railway Project Details

- **Project ID**: 7c94f468-4725-4dcc-b26d-9832a2f957f9
- **Service ID**: a1004381-5327-475c-96a9-c129ef435721
- **Environment**: production (f6ea7b05-a8a8-420a-beba-3d5552c2e69d)
- **Service Name**: ivor-core
- **Domain**: https://ivor-core-production.up.railway.app

## Railway Dashboard Setup Required

### Step 1: Connect GitHub Repository

1. Go to Railway Dashboard: https://railway.app/project/7c94f468-4725-4dcc-b26d-9832a2f957f9
2. Click on the `ivor-core` service
3. Go to **Settings** → **Source**
4. Click **Connect GitHub Repo**
5. Select repository: `BLKOUTUK/ivor-core`
6. Select branch: `main`
7. Set **Root Directory**: Leave empty (root of repo)
8. **Save changes**

### Step 2: Configure Build & Deploy

The service should auto-detect Node.js and use the existing `railway.json`:

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npx tsx src/server.ts",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### Step 3: Trigger Deployment

Once GitHub is connected:
- Railway will automatically deploy on every push to `main`
- Or click **Deploy** button manually to trigger first deployment

### Step 4: Monitor Deployment

1. Click on the deployment in Railway Dashboard
2. Watch **Build Logs** for any errors
3. Check **Deploy Logs** to see server startup
4. Look for: `🤖 IVOR Core (Personal AI Services) running on port [PORT]`

### Step 5: Test Webhook

Once deployment succeeds, test with:

```bash
curl -X POST https://ivor-core-production.up.railway.app/api/browseract/webhook \
  -H "Content-Type: application/json" \
  -H "X-BrowserAct-Token: DI9qU+3JW9jmlV0e5ti+accAZDRYzthYz9WYsldlExc=" \
  -d '{
    "events": [{
      "type": "event",
      "title": "Test: Black QTIPOC+ Poetry Night",
      "description": "A gathering space for Black queer and trans poets to share their work.",
      "event_date": "2025-11-15",
      "location": "LGBT Foundation Manchester",
      "source_url": "https://example.com/test-event",
      "organizer_name": "LGBT Foundation Manchester",
      "tags": ["poetry", "black qtipoc", "arts"],
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
    "auto_approved": 0,
    "review_quick": 1,
    "review_deep": 0,
    "processing_time_ms": 2500
  }
}
```

## Google Sheets Setup

**Sheet**: https://docs.google.com/spreadsheets/d/12kIERdVbiuycjdvFQMzkbY08Xjc15k0N2KE-pJuk9WQ

**Tabs**:
- `Events_Published` - Auto-approved events (90%+ confidence)
- `Events_PendingReview` - Events needing manual review

### 🚨 CRITICAL: Set Sharing Permissions

**REQUIRED ACTION**: The sheet MUST be set to "Anyone with the link can edit" for the API key method to work.

**Steps to fix permissions**:
1. Open the Google Sheet: https://docs.google.com/spreadsheets/d/12kIERdVbiuycjdvFQMzkbY08Xjc15k0N2KE-pJuk9WQ
2. Click the **Share** button (top right)
3. Click **"Anyone with the link"**
4. Change dropdown from **Viewer** to **Editor**
5. Click **Done**

**Without this setting, you will get**: `403 PERMISSION_DENIED` errors from the Google Sheets API

**Current Status**: ❌ Permissions not set (getting 403 errors)

## BrowserAct Configuration

Once webhook is working, configure BrowserAct automations:

1. **Webhook URL**: `https://ivor-core-production.up.railway.app/api/browseract/webhook`
2. **Headers**:
   - `Content-Type: application/json`
   - `X-BrowserAct-Token: DI9qU+3JW9jmlV0e5ti+accAZDRYzthYz9WYsldlExc=`
3. **Payload format**: JSON array of events

## Troubleshooting

### Deployment Not Starting
- Check GitHub repo is connected correctly
- Verify branch is set to `main`
- Look for build errors in Railway logs

### 404 Errors
- Deployment might not be running
- Check Railway service status
- Verify domain is active

### Build Errors
- ✅ Already fixed: Removed Python nixpacks.toml
- ✅ Already fixed: Using `npx tsx` instead of compiled build
- Check for missing dependencies in package.json

### Environment Variables Not Working
- All already set via Railway CLI
- Verify in Railway Dashboard → Settings → Variables

### Google Sheets 403 Permission Denied
**Error**: `{"error": {"code": 403, "message": "The caller does not have permission"}}`

**Cause**: Sheet sharing permissions not set correctly

**Fix**:
1. Open sheet: https://docs.google.com/spreadsheets/d/12kIERdVbiuycjdvFQMzkbY08Xjc15k0N2KE-pJuk9WQ
2. Click Share → "Anyone with the link" → Change to **Editor**
3. Webhook will automatically start writing events to the sheet

## Next Steps

1. **Connect GitHub repo** in Railway Dashboard (most important!)
2. **Trigger deployment** and monitor build/deploy logs
3. **Test webhook** endpoint once deployment succeeds
4. **Configure BrowserAct** automations to send events
5. **Monitor Google Sheets** for incoming events

## Support

- Railway Dashboard: https://railway.app/project/7c94f468-4725-4dcc-b26d-9832a2f957f9
- ivor-core GitHub: https://github.com/BLKOUTUK/ivor-core
- Google Sheet: https://docs.google.com/spreadsheets/d/12kIERdVbiuycjdvFQMzkbY08Xjc15k0N2KE-pJuk9WQ
