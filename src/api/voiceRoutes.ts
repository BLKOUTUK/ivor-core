/**
 * Voice Routes for AIvor
 * TTS using Chatterbox (resemble-ai) — self-hosted on Coolify
 * Features: emotion control, voice cloning, paralinguistic tags
 * Fallback: Mozilla TTS if Chatterbox unavailable
 */

import express from 'express';
import { createClient } from '@supabase/supabase-js';

const router = express.Router();

// Chatterbox TTS (primary) — OpenAI-compatible API
const CHATTERBOX_URL = process.env.CHATTERBOX_URL || 'http://chatterbox.blkoutuk.cloud';
const CHATTERBOX_EMOTION = parseFloat(process.env.CHATTERBOX_EMOTION || '0.6');
// Legacy Mozilla TTS fallback
const MELOTTS_URL = process.env.MELOTTS_URL || process.env.TTS_URL || 'http://tts.blkoutuk.cloud';
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Simple hash function for cache keys
function hashText(text: string): string {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

/**
 * POST /api/voice
 * Synthesize text to speech with British accent
 */
router.post('/', async (req, res) => {
  try {
    const { text, sessionId, userId } = req.body || {};

    // Validate request
    if (!text || typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request',
        message: 'Text is required and must be a non-empty string',
        service: 'ivor-voice'
      });
    }

    // Validate text length (max 5000 characters)
    if (text.length > 5000) {
      return res.status(400).json({
        success: false,
        error: 'Text too long',
        message: 'Text must be 5000 characters or less',
        service: 'ivor-voice',
        maxLength: 5000,
        receivedLength: text.length
      });
    }

    // Check cache first (based on text hash)
    const textHash = hashText(text);
    const cacheKey = `voice-${textHash}`;

    console.log(`[Voice] Processing request for ${text.length} characters (hash: ${textHash})`);

    // Initialize Supabase client for caching
    if (SUPABASE_URL && SUPABASE_SERVICE_KEY) {
      try {
        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

        // Check if cached audio exists
        const { data: cachedFiles } = await supabase.storage
          .from('ivor-voice-responses')
          .list('cache', {
            search: `${cacheKey}.mp3`
          });

        if (cachedFiles && cachedFiles.length > 0) {
          const { data: signedUrl } = await supabase.storage
            .from('ivor-voice-responses')
            .createSignedUrl(`cache/${cacheKey}.mp3`, 604800); // 7 days

          if (signedUrl) {
            console.log(`[Voice] Cache hit for ${textHash}`);
            return res.status(200).json({
              success: true,
              audioUrl: signedUrl.signedUrl,
              source: 'cache',
              cached: true,
              expiresIn: 604800,
              service: 'ivor-voice',
              sessionId: sessionId || `session-${Date.now()}`,
              timestamp: new Date().toISOString()
            });
          }
        }
      } catch (cacheError: any) {
        console.warn('[Voice] Cache check failed:', cacheError.message);
      }
    } else {
      console.warn('[Voice] Supabase not configured, skipping cache check');
    }

    // Try Chatterbox TTS first (OpenAI-compatible), then Mozilla TTS fallback
    let ttsResponse: Response | null = null;
    let ttsSource: string = 'unknown';

    // 1. Chatterbox TTS (primary) — OpenAI-compatible /v1/audio/speech
    try {
      console.log(`[Voice] Trying Chatterbox TTS at ${CHATTERBOX_URL}`);
      const chatterboxResponse = await fetch(`${CHATTERBOX_URL}/v1/audio/speech`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: text,
          voice: 'aivor',  // Custom cloned voice (or default if not configured)
          model: 'chatterbox',
          response_format: 'mp3',
          exaggeration: CHATTERBOX_EMOTION,  // 0.0 = monotone, 1.0 = theatrical
        }),
        signal: AbortSignal.timeout(30000),
      });

      if (chatterboxResponse.ok) {
        ttsResponse = chatterboxResponse;
        ttsSource = 'chatterbox';
        console.log(`[Voice] Chatterbox TTS success`);
      } else {
        console.log(`[Voice] Chatterbox returned ${chatterboxResponse.status}, trying fallback`);
      }
    } catch (e) {
      console.log(`[Voice] Chatterbox unavailable: ${e}`);
    }

    // 2. Mozilla TTS fallback
    if (!ttsResponse) {
      console.log(`[Voice] Falling back to Mozilla TTS at ${MELOTTS_URL}`);
      const legacyEndpoints = [
        `${MELOTTS_URL}/api/tts?text=${encodeURIComponent(text)}`,
        `${MELOTTS_URL}/?text=${encodeURIComponent(text)}`,
        `${MELOTTS_URL}/synthesize?text=${encodeURIComponent(text)}`,
      ];

      for (const url of legacyEndpoints) {
        try {
          const response = await fetch(url, { method: 'GET' });
          if (response.ok) {
            ttsResponse = response;
            ttsSource = 'mozilla-tts';
            console.log(`[Voice] Mozilla TTS success with ${url}`);
            break;
          }
        } catch (e) {
          // continue to next endpoint
        }
      }
    }

    if (!ttsResponse || !ttsResponse.ok) {
      throw new Error('No TTS engine available (tried Chatterbox and Mozilla TTS)');
    }

    const melottsResponse = ttsResponse;

    // Get audio buffer
    const audioBuffer = await melottsResponse.arrayBuffer();
    console.log(`[Voice] Generated ${audioBuffer.byteLength} bytes of audio`);

    // Upload to Supabase Storage if configured
    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
      console.warn('[Voice] Supabase not configured, returning audio directly');
      res.setHeader('Content-Type', 'audio/mpeg');
      res.setHeader('Content-Length', audioBuffer.byteLength.toString());
      return res.status(200).send(Buffer.from(audioBuffer));
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // Upload to storage
    const { error: uploadError } = await supabase.storage
      .from('ivor-voice-responses')
      .upload(`cache/${cacheKey}.mp3`, audioBuffer, {
        contentType: 'audio/mpeg',
        cacheControl: '604800',
        upsert: true
      });

    if (uploadError) {
      console.error('[Voice] Upload error:', uploadError);
      res.setHeader('Content-Type', 'audio/mpeg');
      res.setHeader('Content-Length', audioBuffer.byteLength.toString());
      return res.status(200).send(Buffer.from(audioBuffer));
    }

    // Generate signed URL
    const { data: signedUrl, error: signError } = await supabase.storage
      .from('ivor-voice-responses')
      .createSignedUrl(`cache/${cacheKey}.mp3`, 604800);

    if (signError) {
      console.error('[Voice] Signed URL error:', signError);
      throw signError;
    }

    console.log(`[Voice] Successfully uploaded and cached audio for ${textHash}`);

    return res.status(200).json({
      success: true,
      audioUrl: signedUrl.signedUrl,
      source: ttsSource,
      cached: false,
      expiresIn: 604800,
      service: 'ivor-voice',
      serviceName: 'IVOR Voice - British Accent TTS',
      sessionId: sessionId || `session-${Date.now()}`,
      userId: userId || 'anonymous',
      textLength: text.length,
      audioSize: audioBuffer.byteLength,
      liberation: '✊🏾 Zero-cost community-owned TTS',
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('[Voice] Error:', error);

    return res.status(500).json({
      success: false,
      error: 'Voice synthesis failed',
      message: error.message,
      service: 'ivor-voice',
      fallback: 'Text-only mode available',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /api/voice/health
 * Health check for voice service
 */
router.get('/health', async (_req, res) => {
  try {
    // Check Mozilla TTS availability (test with short text)
    let ttsHealthy = false;
    let ttsError = '';

    try {
      const ttsCheck = await fetch(`${MELOTTS_URL}/api/tts?text=test`, {
        method: 'GET',
        signal: AbortSignal.timeout(10000)
      });
      ttsHealthy = ttsCheck.ok;
      if (!ttsCheck.ok) {
        ttsError = `HTTP ${ttsCheck.status}`;
      }
    } catch (e: any) {
      ttsError = e.message || 'Connection failed';
    }

    return res.status(200).json({
      success: true,
      service: 'ivor-voice',
      tts: {
        engine: 'Mozilla TTS (synesthesiam/mozilla-tts)',
        url: MELOTTS_URL,
        healthy: ttsHealthy,
        error: ttsError || undefined
      },
      supabase: {
        configured: !!(SUPABASE_URL && SUPABASE_SERVICE_KEY)
      },
      features: {
        accent: 'English',
        caching: 'Supabase Storage (7-day retention)',
        cost: '$0/month (self-hosted)'
      },
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message,
      service: 'ivor-voice'
    });
  }
});

export default router;
