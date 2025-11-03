# Google Service Account Setup for ivor-core

## Why Service Account is Required

**CRITICAL**: Google Sheets API v4 **does NOT support API keys for write operations** (append, update, delete).

- ✅ API keys work for: **READ-ONLY** operations (getting sheet data)
- ❌ API keys DON'T work for: **WRITE operations** (appending rows, updating cells)

**Error you get with API key writes**:
```json
{
  "error": {
    "code": 401,
    "message": "API keys are not supported by this API. Expected OAuth2 access token",
    "status": "UNAUTHENTICATED",
    "reason": "CREDENTIALS_MISSING"
  }
}
```

**Solution**: Use **Service Account** authentication for server-to-server API access with write permissions.

## Step-by-Step Setup

### 1. Create Service Account in Google Cloud Console

1. Go to **Google Cloud Console**: https://console.cloud.google.com/
2. Select your project (or create a new one)
3. Navigate to **IAM & Admin** → **Service Accounts**: https://console.cloud.google.com/iam-admin/serviceaccounts
4. Click **+ CREATE SERVICE ACCOUNT**

**Service Account Details**:
- **Name**: `ivor-sheets-writer` (or similar)
- **Description**: "Service account for IVOR to write event data to Google Sheets"
- Click **CREATE AND CONTINUE**

**Grant Service Account Access** (Step 2):
- **Role**: `Editor` or `Owner` (for the project)
- Click **CONTINUE**
- Click **DONE**

### 2. Create and Download JSON Key

1. Click on the **service account email** you just created
2. Go to the **KEYS** tab
3. Click **ADD KEY** → **Create new key**
4. Select **JSON** format
5. Click **CREATE**

A JSON file will be downloaded. **Keep this file secure!** It contains credentials.

The JSON file looks like:
```json
{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "ivor-sheets-writer@your-project.iam.gserviceaccount.com",
  "client_id": "...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  ...
}
```

### 3. Enable Google Sheets API

1. Go to **APIs & Services** → **Library**: https://console.cloud.google.com/apis/library
2. Search for **"Google Sheets API"**
3. Click **ENABLE** (if not already enabled)

### 4. Share Google Sheet with Service Account

This is **CRITICAL** - the service account needs explicit access to your sheet.

1. Open your Google Sheet: https://docs.google.com/spreadsheets/d/12kIERdVbiuycjdvFQMzkbY08Xjc15k0N2KE-pJuk9WQ
2. Click the **Share** button (top right)
3. Add the **service account email** (e.g., `ivor-sheets-writer@your-project.iam.gserviceaccount.com`)
4. Give it **Editor** permissions
5. Click **Send**

**Important**: Use the exact email from the JSON file's `client_email` field.

### 5. Set Environment Variable in Railway

The service account JSON needs to be stored as an environment variable.

**Option A: Using Railway CLI** (from this directory):
```bash
railway variables --set GOOGLE_SERVICE_ACCOUNT_JSON='{"type":"service_account","project_id":"...","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"...@...iam.gserviceaccount.com",...}'
```

**Option B: Using Railway Dashboard**:
1. Go to Railway Dashboard: https://railway.app/project/7c94f468-4725-4dcc-b26d-9832a2f957f9
2. Click on **ivor-core** service
3. Go to **Variables** tab
4. Click **+ New Variable**
5. Name: `GOOGLE_SERVICE_ACCOUNT_JSON`
6. Value: Paste the **entire JSON file contents** as a single line
7. Click **Add**

**CRITICAL**: Remove the old `GOOGLE_API_KEY` variable - it's not used anymore:
```bash
railway variables --unset GOOGLE_API_KEY
```

## Code Changes Required

The code needs to be updated to use Service Account authentication instead of API key.

### Install Google Auth Library

Add to `package.json` dependencies:
```json
"googleapis": "^118.0.0"
```

Then run:
```bash
npm install
```

### Update browserActRoutes.ts

Replace the `writeToGoogleSheets` function to use Service Account:

```typescript
import { google } from 'googleapis'

const GOOGLE_SHEET_ID = process.env.GOOGLE_SHEET_ID || ''
const GOOGLE_SERVICE_ACCOUNT_JSON = process.env.GOOGLE_SERVICE_ACCOUNT_JSON || ''

async function writeToGoogleSheets(eventData: any, status: string): Promise<void> {
  if (!GOOGLE_SHEET_ID || !GOOGLE_SERVICE_ACCOUNT_JSON) {
    console.warn('[Google Sheets] Not configured - skipping write')
    return
  }

  try {
    // Parse service account credentials
    const credentials = JSON.parse(GOOGLE_SERVICE_ACCOUNT_JSON)

    // Create auth client
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    })

    const authClient = await auth.getClient()
    const sheets = google.sheets({ version: 'v4', auth: authClient })

    const sheetName = status === 'auto-approved' ? 'Events_Published' : 'Events_PendingReview'

    const row = [
      eventData.submitted_at || new Date().toISOString(),
      eventData.submitted_by || 'browseract-automation',
      'events',
      eventData.title || '',
      eventData.event_date || '',
      eventData.event_time || '',
      eventData.location || '',
      eventData.organizer_name || '',
      eventData.description || '',
      eventData.source_url || '',
      eventData.tags?.join(', ') || '',
      eventData.price || '',
      eventData.image_url || '',
      eventData.ivor_confidence || '',
      eventData.ivor_reasoning || '',
      eventData.liberation_score || '',
      eventData.moderation_status || status,
      eventData.relevance || '',
      eventData.quality || '',
      eventData.flags || '',
      'pending_review',
      ''
    ]

    await sheets.spreadsheets.values.append({
      spreadsheetId: GOOGLE_SHEET_ID,
      range: `${sheetName}!A:V`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [row]
      }
    })

    console.log(`[Google Sheets] Written to ${sheetName}: ${eventData.title}`)

  } catch (error) {
    console.error('[Google Sheets] Write failed:', error)
    // Don't throw - we don't want to fail the entire request
  }
}
```

## Verification

After deploying with Service Account:

1. **Test webhook**:
```bash
curl -X POST https://ivor-core-production.up.railway.app/api/browseract/webhook \
  -H "Content-Type: application/json" \
  -H "X-BrowserAct-Token: DI9qU+3JW9jmlV0e5ti+accAZDRYzthYz9WYsldlExc=" \
  -d '{
    "events": [{
      "type": "event",
      "title": "Test: Service Account Write",
      "description": "Testing Service Account authentication",
      "event_date": "2025-11-15",
      "location": "Test Location",
      "source_url": "https://example.com/test",
      "organizer_name": "Test Organizer",
      "tags": ["test"],
      "price": "Free"
    }]
  }'
```

2. **Check Google Sheet**: https://docs.google.com/spreadsheets/d/12kIERdVbiuycjdvFQMzkbY08Xjc15k0N2KE-pJuk9WQ

You should see the test event in the `Events_PendingReview` tab!

## Security Notes

✅ **Service Account is the correct approach** for server-to-server authentication
✅ **More secure than API keys** - credentials never leave your server
✅ **Fine-grained access control** - only has access to sheets you explicitly share
✅ **Credentials stored in Railway** - never committed to git

❌ **Never commit service account JSON to git**
❌ **Never share service account credentials publicly**
