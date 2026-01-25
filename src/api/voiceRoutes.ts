/**
 * Voice Routes for IVOR Core
 * British accent TTS using self-hosted MeloTTS
 * Zero recurring costs, WCAG 2.1 AA compliant
 */

import express from 'express';
import { createClient } from '@supabase/supabase-js';

const router = express.Router();

// Environment variables
const MELOTTS_URL = process.env.MELOTTS_URL || 'http://melotts-ivor:8101';
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

    // Call Mozilla TTS API
    console.log(`[Voice] Calling Mozilla TTS at ${MELOTTS_URL}`);

    // Mozilla TTS uses GET with query parameter
    const ttsUrl = `${MELOTTS_URL}/api/tts?text=${encodeURIComponent(text)}`;
    const ttsResponse = await fetch(ttsUrl, {
      method: 'GET'
    });

    if (!ttsResponse.ok) {
      throw new Error(`Mozilla TTS API error: ${ttsResponse.status} ${ttsResponse.statusText}`);
    }

    // Alias for compatibility with rest of code
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
      source: 'melotts',
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
    const ttsCheck = await fetch(`${MELOTTS_URL}/api/tts?text=test`, {
      method: 'GET',
      signal: AbortSignal.timeout(10000)
    }).catch(() => null);

    const ttsHealthy = ttsCheck?.ok || false;

    return res.status(200).json({
      success: true,
      service: 'ivor-voice',
      tts: {
        engine: 'Mozilla TTS',
        url: MELOTTS_URL,
        healthy: ttsHealthy
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
