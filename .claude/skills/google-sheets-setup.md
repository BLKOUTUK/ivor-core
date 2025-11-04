# Google Sheets API Setup Skill

This skill guides through setting up Google Sheets API integration for backend services that need to write data to sheets.

## When to Use This Skill

Use this skill when:
- Setting up a backend service that needs to write data to Google Sheets
- Creating event tracking, form submissions, or data collection systems
- Building automation that stores results in sheets for human review

## Setup Process

### 1. Create the Google Sheet

Guide the user to:
1. Go to https://sheets.google.com
2. Create a new blank spreadsheet
3. Name it appropriately for the use case

### 2. Structure the Sheet

Provide the exact tab names and column headers needed for the specific use case.

**For event moderation systems:**
- Tabs: `Events_Published` and `Events_PendingReview`
- Headers: Timestamp, Submitted By, Type, Title, Event Date, Event Time, Location, Organizer, Description, Source URL, Tags, Price, Image URL, IVOR Confidence, IVOR Reasoning, Liberation Score, Moderation Status, Relevance, Quality, Flags, Approval Status, Curator Notes

### 3. Get Sheet ID

Instruct user to:
1. Look at browser URL: `https://docs.google.com/spreadsheets/d/{SHEET_ID}/edit`
2. Copy the SHEET_ID portion

### 4. Enable Google Sheets API

Provide step-by-step:
1. Go to https://console.cloud.google.com/apis/credentials
2. Create new project (or select existing)
3. Enable Google Sheets API: https://console.cloud.google.com/apis/library/sheets.googleapis.com
4. Return to Credentials page

### 5. Create API Key

Guide through:
1. Click "+ CREATE CREDENTIALS" → "API key"
2. Copy the generated API key
3. (Optional) Restrict API key to Google Sheets API only for security

### 6. Set Permissions

**For API Key method:**
- Share sheet → "Anyone with the link" → "Editor"

**For Service Account method (more secure):**
- Create service account instead of API key
- Download JSON credentials
- Share sheet with service account email

### 7. Set Environment Variables

Once user provides credentials, set them using Railway CLI:

```bash
railway variables --set GOOGLE_SHEET_ID='user-provided-id'
railway variables --set GOOGLE_API_KEY='user-provided-key'
```

Or for service account:
```bash
railway variables --set GOOGLE_SERVICE_ACCOUNT_JSON='{"type":"service_account",...}'
```

### 8. Verify Setup

Test the integration:
```bash
curl -X POST https://your-service.railway.app/your-endpoint \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'
```

Then check the Google Sheet to verify data was written.

## Code Implementation Pattern

For writing to Google Sheets with API key:

```typescript
const GOOGLE_SHEET_ID = process.env.GOOGLE_SHEET_ID
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY

async function writeToSheet(sheetName: string, rowData: any[]) {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_SHEET_ID}/values/${sheetName}:append?valueInputOption=RAW&key=${GOOGLE_API_KEY}`

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ values: [rowData] })
  })

  if (!response.ok) {
    throw new Error(`Google Sheets API error: ${response.status}`)
  }
}
```

## Common Issues

- **403 Forbidden**: Sheet permissions not set correctly - verify "Anyone with link can edit"
- **404 Not Found**: Wrong sheet ID or sheet name (tab name)
- **API Key restrictions**: If key is restricted, ensure Google Sheets API is allowed

## Security Notes

- API Key method requires public sheet access - only use for non-sensitive data
- For production with sensitive data, use Service Account method
- Never commit API keys or sheet IDs to git - use environment variables
