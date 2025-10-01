# IVOR Core - GROQ AI Setup Guide

## Overview

IVOR Core now uses GROQ AI for liberation-centered, trauma-informed responses for Black queer communities in the UK.

## Architecture

```
User Message → IVOR Core /api/chat → GROQ API (Llama 3.1 70B) → Liberation-centered Response
                                   ↓
                              Fallback Pattern-Matching (if API unavailable)
```

## Setup Instructions

### 1. Get GROQ API Key

1. Visit [https://console.groq.com](https://console.groq.com)
2. Sign up or log in
3. Navigate to **API Keys** section
4. Create a new API key
5. Copy the key (starts with `gsk_...`)

### 2. Local Development Setup

**Add API Key to `.env`:**
```bash
GROQ_API_KEY=gsk_your_actual_api_key_here
```

⚠️ **IMPORTANT**:
- DO NOT commit `.env` with your real API key
- The `.env` file is gitignored to prevent accidental commits
- Use the placeholder in `.env.example` as a template

### 3. Production Deployment (Vercel)

**Add Environment Variable:**
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select project: `ivor-core`
3. Navigate to **Settings** → **Environment Variables**
4. Add:
   - **Name**: `GROQ_API_KEY`
   - **Value**: `[Your GROQ API key from https://console.groq.com]`
   - **Environment**: Select all (Production, Preview, Development)
5. Click **Save**
6. Redeploy application

**Note**: Contact project maintainer for the actual GROQ API key value.

## API Endpoint

### POST /api/chat

**Request:**
```json
{
  "message": "How can I access PrEP on NHS?",
  "conversationHistory": [],
  "sessionId": "optional-session-id",
  "userId": "optional-user-id"
}
```

**Response (AI-powered):**
```json
{
  "success": true,
  "response": "PrEP is available free on the NHS for those at high risk of HIV...",
  "source": "groq-ai",
  "model": "llama-3.1-70b-versatile",
  "service": "ivor-core",
  "serviceName": "IVOR Core - Personal AI Services",
  "sessionId": "session-1234",
  "userId": "anonymous",
  "communityFocused": true,
  "culturallyAffirming": true,
  "liberation": "✊🏾 Powered by community-owned AI",
  "timestamp": "2025-10-01T..."
}
```

**Response (Fallback - no API key):**
```json
{
  "success": true,
  "response": "Pattern-matched response...",
  "source": "fallback",
  "message": "Using pattern-matching (AI not configured)",
  "service": "ivor-core",
  "sessionId": "session-1234",
  "communityFocused": true
}
```

## System Prompt

IVOR uses a liberation-centered system prompt that:
- Centers Black queer liberation
- Uses trauma-informed language
- Provides UK-specific resources (NHS, CliniQ, menrus.co.uk, etc.)
- Offers crisis support with UK hotlines
- Promotes mutual aid and community care
- Validates experiences while acknowledging systemic oppression

## Fallback System

If GROQ API is unavailable or not configured:
- **Crisis intervention**: Immediate UK crisis hotlines
- **Greetings**: Welcoming community message
- **Health queries**: NHS and menrus.co.uk resources
- **Mental health**: Grounding techniques and UK support services
- **Default**: Community-centered fallback message

## UK-Specific Crisis Resources

The system provides:
- **Samaritans**: 116 123 (24/7)
- **Crisis Text Line**: Text SHOUT to 85258
- **LGBT+ Switchboard**: 0300 330 0630
- **Galop**: 0800 999 5428
- **Mindline Trans+**: 0300 330 5468

## Testing

### Test Locally
```bash
# Start dev server
npm run dev

# Test health endpoint
curl http://localhost:3001/api/health

# Test chat endpoint
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello IVOR!"}'
```

### Test Production
```bash
# Replace with your actual deployment URL
curl -X POST https://ivor-core.vercel.app/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "How can I access sexual health services in London?"}'
```

## Cost Management

**GROQ Pricing:**
- **Free tier**: Generous limits for development
- **Pay-as-you-go**: Only pay for what you use
- **Fast inference**: Lower costs due to speed
- **Llama 3.1 70B**: High quality, reasonable cost

**Monitor usage at**: https://console.groq.com/usage

## Troubleshooting

### "Using pattern-matching (AI not configured)"
- API key not set in environment variables
- Check `.env` has correct `GROQ_API_KEY`
- Restart development server after adding key

### "AI temporarily unavailable"
- GROQ API might be down (check status)
- API key might be invalid
- Fallback responses still work

### No response at all
- Check server logs for errors
- Verify API endpoint is accessible
- Check CORS headers for browser requests

## Security

- ✅ API key stored in environment variables (never in code)
- ✅ Server-side API calls only (key not exposed to client)
- ✅ CORS headers configured for security
- ✅ Graceful fallback if API unavailable
- ✅ .env gitignored to prevent key leaks

## Integration with Platform

The main platform (`blkout-community-platform`) will integrate with IVOR Core by:
1. Linking to IVOR Core as external service (e.g., `https://ivor-core.vercel.app`)
2. Embedding IVOR Core chat interface via iframe or API calls
3. Using same GROQ API key for consistent responses

---

**Part of the BLKOUT Liberation Platform | Community-owned AI | Liberation through technology** ✊🏾
