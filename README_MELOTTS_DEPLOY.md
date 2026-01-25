# MeloTTS Deployment Guide for IVOR Voice

## Overview
This guide covers deploying the MeloTTS service to enable British accent text-to-speech for IVOR with **zero recurring costs**.

**Technology Stack**:
- **MeloTTS**: Open-source TTS with native British English support (MIT License)
- **Docker**: Container deployment via Coolify
- **Supabase Storage**: Audio caching (7-day retention)
- **Node.js API**: Voice synthesis endpoint

**Cost**: $0/month (self-hosted on BLKOUTHUB)

---

## Prerequisites

### Required
- ✅ BLKOUTHUB server access (Coolify dashboard)
- ✅ Supabase project with storage enabled
- ✅ IVOR backend deployed and operational
- ✅ Docker support on BLKOUTHUB (already configured)

### Environment Variables Needed
```bash
# Add to IVOR backend environment (Coolify)
MELOTTS_URL=http://melotts:8101
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

---

## Step 1: Deploy MeloTTS Container (15 min)

### Option A: Deploy via Coolify UI (Recommended)

1. **Login to Coolify** at https://coolify.blkouthub.com

2. **Create New Service**:
   - Type: Docker Compose
   - Name: `melotts-ivor`
   - Description: "British accent TTS for IVOR"

3. **Upload Docker Compose**:
   - Copy contents of `docker-compose.melotts.yml`
   - Paste into Coolify compose editor

4. **Configure Settings**:
   - Port mapping: `8101:8000`
   - Restart policy: Unless stopped
   - Resources: 2 CPU cores, 4GB RAM max

5. **Deploy**:
   - Click "Deploy"
   - Wait 2-3 minutes for container to start
   - Verify health check passes

### Option B: Manual Docker Deploy (Alternative)

```bash
# SSH into BLKOUTHUB
ssh root@blkouthub.com

# Navigate to IVOR directory
cd /var/services/ivor-core

# Copy docker-compose file
nano docker-compose.melotts.yml
# (paste contents from docker-compose.melotts.yml)

# Start MeloTTS
docker-compose -f docker-compose.melotts.yml up -d

# Verify running
docker ps | grep melotts
```

---

## Step 2: Create Supabase Storage Bucket (10 min)

### Option A: Via Supabase Dashboard

1. **Login to Supabase** at https://supabase.com/dashboard

2. **Navigate to Storage**:
   - Click "Storage" in sidebar
   - Click "Create Bucket"

3. **Create Bucket**:
   - Name: `ivor-voice-responses`
   - Public: ✅ Yes
   - File size limit: 10 MB
   - Allowed MIME types: `audio/mpeg`, `audio/mp3`

4. **Set Policies**:
   - Go to "Policies" tab
   - Click "New Policy"
   - Template: "Public read access"
   - Apply to bucket `ivor-voice-responses`

### Option B: Via Migration SQL

```bash
# Run migration from project root
cd /home/robbe/blkout-platform/apps/ivor-core

# Apply migration (manual)
psql $SUPABASE_DB_URL -f supabase/migrations/20260124_voice_storage.sql

# Or via Supabase CLI
supabase db push
```

---

## Step 3: Deploy Voice API Endpoint (10 min)

### Update IVOR Backend Deployment

1. **Add Environment Variables** in Coolify:
   - Go to IVOR backend service
   - Click "Environment"
   - Add:
     ```
     MELOTTS_URL=http://melotts-ivor:8101
     SUPABASE_URL=https://wzlflcpwcfsyqntywmrm.supabase.co
     SUPABASE_SERVICE_ROLE_KEY=[from Supabase settings]
     ```

2. **Verify API File** exists at `api/voice.js`:
   - File already created in repository
   - Vercel will auto-deploy on next push

3. **Redeploy IVOR Backend**:
   - In Coolify, click "Redeploy"
   - Wait 2-3 minutes
   - Verify `/api/voice` endpoint accessible

---

## Step 4: Test the Voice Service (15 min)

### Test 1: MeloTTS Health Check
```bash
curl http://melotts:8101/health
# Expected: {"status": "ok"}
```

### Test 2: Direct MeloTTS Synthesis
```bash
curl -X POST http://melotts:8101/synthesize \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Hello, I am IVOR, your community AI assistant for Black queer liberation.",
    "accent": "EN-BR",
    "speed": 1.0
  }' \
  --output test-voice.mp3

# Play audio (if on local machine)
# ffplay test-voice.mp3
```

### Test 3: Voice API Endpoint
```bash
curl -X POST https://ivor.blkoutuk.cloud/api/voice \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Hello, I am IVOR. This is a test of the British accent text-to-speech system.",
    "sessionId": "test-session-123"
  }'

# Expected response:
# {
#   "success": true,
#   "audioUrl": "https://wzlflcpwcfsyqntywmrm.supabase.co/storage/v1/object/sign/...",
#   "source": "melotts",
#   "cached": false,
#   "expiresIn": 604800,
#   "service": "ivor-voice"
# }
```

### Test 4: Cache Verification
```bash
# Run same request twice
curl -X POST https://ivor.blkoutuk.cloud/api/voice \
  -H "Content-Type: application/json" \
  -d '{"text": "Testing cache mechanism"}' \
  -s | jq '.cached'

# First call: false
# Second call: true (cached)
```

---

## Step 5: Frontend Integration (30 min)

### Add VoicePlayer Component

1. **Component already created** at:
   - `apps/community-platform/src/components/ivor/VoicePlayer.tsx`

2. **Add to IVOR Widget** (update IVORWidget.tsx):
   ```typescript
   import { VoicePlayer } from './VoicePlayer';

   // In response rendering:
   {response.audioUrl && (
     <VoicePlayer
       audioUrl={response.audioUrl}
       text={response.text}
       onError={(error) => console.error('Voice playback error:', error)}
     />
   )}
   ```

3. **Update API Integration** (add voice synthesis):
   ```typescript
   // After getting chat response
   const chatResponse = await fetch('/api/chat', { ... });
   const chatData = await chatResponse.json();

   // Request voice synthesis
   const voiceResponse = await fetch('/api/voice', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({
       text: chatData.response,
       sessionId: chatData.sessionId
     })
   });

   const voiceData = await voiceResponse.json();

   // Combine responses
   const fullResponse = {
     ...chatData,
     audioUrl: voiceData.audioUrl,
     voiceCached: voiceData.cached
   };
   ```

---

## Troubleshooting

### Issue: MeloTTS not starting
**Symptoms**: Container exits immediately or health check fails

**Solutions**:
1. Check logs: `docker logs melotts-ivor`
2. Verify port 8101 not in use: `netstat -tulpn | grep 8101`
3. Increase memory limit to 4GB
4. Pull latest image: `docker pull myshell/melotts:latest`

### Issue: Voice API returns 500
**Symptoms**: `/api/voice` returns internal server error

**Solutions**:
1. Verify MELOTTS_URL environment variable
2. Check network connectivity: `curl http://melotts:8101/health`
3. Test MeloTTS directly (Test 2 above)
4. Check Vercel logs for API errors

### Issue: Supabase upload fails
**Symptoms**: Audio generated but upload fails

**Solutions**:
1. Verify SUPABASE_SERVICE_ROLE_KEY is correct
2. Check bucket exists: Supabase Dashboard → Storage
3. Verify bucket is public
4. Test manual upload via Supabase Dashboard

### Issue: Audio quality poor
**Symptoms**: Robotic voice or artifacts

**Solutions**:
1. Verify accent is `EN-BR` (not `EN-US`)
2. Adjust speed parameter (try 0.9 or 1.1)
3. Check text formatting (remove special characters)
4. Verify MeloTTS using latest model

### Issue: Slow response time
**Symptoms**: >5 second latency for voice generation

**Solutions**:
1. Check MeloTTS CPU usage: `docker stats melotts-ivor`
2. Increase CPU cores to 2
3. Implement caching (already in code)
4. Pregenerate common responses

---

## Performance Optimization

### 1. Pregenerate Common Responses
```bash
# Create script to pregenerate FAQ audio
cat > pregenerate-voice-cache.sh << 'EOF'
#!/bin/bash

# Common IVOR responses
RESPONSES=(
  "Hello! I'm IVOR, your community AI assistant."
  "I'm here to support you with learning, wellness, and community wisdom."
  "How can I help you today?"
)

for text in "${RESPONSES[@]}"; do
  curl -X POST https://ivor.blkoutuk.cloud/api/voice \
    -H "Content-Type: application/json" \
    -d "{\"text\": \"$text\"}" \
    -s > /dev/null
  echo "Cached: $text"
done
EOF

chmod +x pregenerate-voice-cache.sh
./pregenerate-voice-cache.sh
```

### 2. Monitor Cache Hit Rate
```sql
-- Run in Supabase SQL Editor
SELECT
  COUNT(*) FILTER (WHERE cached = true) AS cache_hits,
  COUNT(*) FILTER (WHERE cached = false) AS cache_misses,
  ROUND(
    COUNT(*) FILTER (WHERE cached = true)::numeric /
    COUNT(*)::numeric * 100,
    2
  ) AS hit_rate_percent
FROM ivor_voice_analytics
WHERE created_at > NOW() - INTERVAL '24 hours';
```

### 3. Cleanup Old Cache
```bash
# Run manually or via cron
psql $SUPABASE_DB_URL -c "SELECT cleanup_old_voice_cache();"
```

---

## Monitoring & Analytics

### Check Voice Usage
```sql
-- Daily voice synthesis stats
SELECT
  DATE(created_at) AS date,
  COUNT(*) AS requests,
  AVG(text_length) AS avg_text_length,
  SUM(audio_size) AS total_audio_bytes,
  COUNT(*) FILTER (WHERE cached = true) AS cached_requests
FROM ivor_voice_analytics
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

### MeloTTS Container Stats
```bash
# CPU, Memory, Network usage
docker stats melotts-ivor --no-stream

# Logs
docker logs melotts-ivor --tail 100 -f
```

### API Response Times
```bash
# Test latency
time curl -X POST https://ivor.blkoutuk.cloud/api/voice \
  -H "Content-Type: application/json" \
  -d '{"text": "Quick test"}' \
  -s > /dev/null

# Expected: <2 seconds (uncached), <500ms (cached)
```

---

## Cost Analysis

### Zero Recurring Costs Breakdown
| Component | Cost |
|-----------|------|
| MeloTTS (self-hosted) | $0/month |
| Supabase Storage (free tier: 1GB) | $0/month |
| Vercel Functions (free tier) | $0/month |
| Docker on BLKOUTHUB | $0/month (existing infrastructure) |
| **Total** | **$0/month** |

### Comparison to ElevenLabs
| Metric | ElevenLabs | MeloTTS (Self-Hosted) |
|--------|------------|----------------------|
| Monthly cost | $99 | $0 |
| Annual cost | $1,188 | $0 |
| 5-year cost | $5,940 | $0 |
| Voice quality | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| Latency | <1s | 1-2s |
| Control | Vendor lock-in | Full control |
| Values alignment | Corporate | Open source |

**Savings over 5 years**: $5,940

---

## Next Steps

### Phase 1: Launch (Week 1) ✅
- ✅ Deploy MeloTTS container
- ✅ Create Supabase storage bucket
- ✅ Deploy voice API endpoint
- ✅ Add VoicePlayer component
- ✅ Test end-to-end functionality

### Phase 2: Optimization (Week 2)
- [ ] Pregenerate common responses
- [ ] Implement request rate limiting
- [ ] Add error tracking (Sentry)
- [ ] Monitor cache hit rate
- [ ] User feedback collection

### Phase 3: Enhancement (Week 3+)
- [ ] Voice customization (speed, pitch)
- [ ] Multiple British voice options
- [ ] Offline mode (service worker caching)
- [ ] Analytics dashboard
- [ ] A/B test vs text-only

### Future: Qwen3-TTS Integration (Feb 2026)
- [ ] Deploy Qwen3-TTS for personalized voices
- [ ] Voice cloning for custom BLKOUT voice
- [ ] Intelligent routing (MeloTTS for standard, Qwen3 for personalized)
- [ ] Village Portal integration (Ancestral Whispers)

---

## Support & Resources

### Documentation
- MeloTTS GitHub: https://github.com/myshell-ai/MeloTTS
- Supabase Storage Docs: https://supabase.com/docs/guides/storage
- WCAG 2.1 AA Guidelines: https://www.w3.org/WAI/WCAG21/quickref/

### Internal Resources
- IVOR Backend Repo: `/home/robbe/blkout-platform/apps/ivor-core/`
- Memory: `ivor-voice-open-source-alternatives` (detailed TTS comparison)
- BLKOUT Tech Team: tech@blkoutuk.com

### Community
- Report issues: GitHub Issues
- Feature requests: BLKOUT Governance Portal
- Liberation Tech Forum: https://blkoutuk.com/tech-forum

---

**Liberation through technology, community through cooperation.** ✊🏾
