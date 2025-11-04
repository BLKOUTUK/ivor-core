# 🚨 IMPORTANT UPDATE: Google Sheets Authentication Changed

## New Requirement: Service Account Authentication

**CRITICAL DISCOVERY**: Google Sheets API v4 **does NOT support API keys for write operations**.

After testing, we discovered:
- ✅ API keys work for **READ operations** (getting sheet data)
- ❌ API keys **DON'T work for WRITE operations** (appending rows)

**Error with API key writes**:
```json
{
  "error": {
    "code": 401,
    "message": "API keys are not supported by this API. Expected OAuth2 access token",
    "status": "UNAUTHENTICATED"
  }
}
```

## Solution: Use Service Account (See GOOGLE_SERVICE_ACCOUNT_SETUP.md)

The Google Sheet needs to be set to **"Anyone with the link can edit"** for the API key authentication method to work.

### Steps to Fix:

1. **Open the Google Sheet**:
   - https://docs.google.com/spreadsheets/d/12kIERdVbiuycjdvFQMzkbY08Xjc15k0N2KE-pJuk9WQ

2. **Click the "Share" button** (top right corner of the sheet)

3. **Change sharing settings**:
   - Click on **"Anyone with the link"**
   - Change the dropdown from **"Viewer"** to **"Editor"**
   - Click **"Done"**

That's it! The webhook will immediately be able to write events to the sheet.

## Verification

After fixing the permissions, you can:

1. **Check the sheet manually** to see if the test event appears in the `Events_PendingReview` tab
2. **Or run this command** to verify API access:

```bash
curl -s "https://sheets.googleapis.com/v4/spreadsheets/12kIERdVbiuycjdvFQMzkbY08Xjc15k0N2KE-pJuk9WQ/values/Events_PendingReview?key=AIzaSyBo_xRw_fNS_ZHMySwDb3QXtb_1CdZqHT8"
```

## What's Already Working

✅ Railway deployment successful
✅ Webhook endpoint live at `https://ivor-core-production.up.railway.app/api/browseract/webhook`
✅ IVOR AI moderation processing events (314ms response time)
✅ Event routing logic working correctly
✅ Google Sheets API credentials configured

❌ **Only blocker**: Sheet permissions need to be set to "Editor"

## After Fixing Permissions

Once permissions are fixed, you can proceed to:
- Configure BrowserAct automations to send events to the webhook
- Events will automatically appear in the Google Sheet
- Curators can review and approve events from the sheet

## Security Note

**Why "Anyone with the link can edit"?**

This is required for the simple API key authentication method. The sheet URL is not publicly accessible, and only people with:
- The sheet URL
- The API key (stored securely in Railway environment variables)

can write to it. For production use with sensitive data, you would use a Service Account instead of an API key.
