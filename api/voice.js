// IVOR Voice Synthesis Endpoint
// Uses self-hosted MeloTTS for British accent text-to-speech
// Zero recurring costs, WCAG 2.1 AA compliant

const { createClient } = require('@supabase/supabase-js');

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization'
};

// Environment variables
const MELOTTS_URL = process.env.MELOTTS_URL || 'http://melotts:8101';
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

module.exports = async function handler(req, res) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    Object.entries(corsHeaders).forEach(([key, value]) => {
      res.setHeader(key, value);
    });
    return res.status(200).json({});
  }

  // Set CORS headers
  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  // Only support POST
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
      message: 'Voice endpoint only supports POST requests',
      service: 'ivor-voice'
    });
  }

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

    // Initialize Supabase client
    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
      console.warn('[Voice] Supabase not configured, skipping cache check');
    } else {
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
      } catch (cacheError) {
        console.warn('[Voice] Cache check failed:', cacheError.message);
        // Continue without cache
      }
    }

    // Call MeloTTS API
    console.log(`[Voice] Calling MeloTTS at ${MELOTTS_URL}`);

    const melottsResponse = await fetch(`${MELOTTS_URL}/synthesize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: text,
        accent: 'EN-BR', // British English
        speed: 1.0,
        language: 'EN'
      })
    });

    if (!melottsResponse.ok) {
      throw new Error(`MeloTTS API error: ${melottsResponse.status} ${melottsResponse.statusText}`);
    }

    // Get audio buffer
    const audioBuffer = await melottsResponse.arrayBuffer();
    console.log(`[Voice] Generated ${audioBuffer.byteLength} bytes of audio`);

    // Upload to Supabase Storage
    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
      // Return audio directly if Supabase not configured
      console.warn('[Voice] Supabase not configured, returning audio directly');
      res.setHeader('Content-Type', 'audio/mpeg');
      res.setHeader('Content-Length', audioBuffer.byteLength);
      return res.status(200).send(Buffer.from(audioBuffer));
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // Upload to storage
    const { error: uploadError } = await supabase.storage
      .from('ivor-voice-responses')
      .upload(`cache/${cacheKey}.mp3`, audioBuffer, {
        contentType: 'audio/mpeg',
        cacheControl: '604800', // 7 days
        upsert: true
      });

    if (uploadError) {
      console.error('[Voice] Upload error:', uploadError);
      // Fallback: return audio directly
      res.setHeader('Content-Type', 'audio/mpeg');
      res.setHeader('Content-Length', audioBuffer.byteLength);
      return res.status(200).send(Buffer.from(audioBuffer));
    }

    // Generate signed URL
    const { data: signedUrl, error: signError } = await supabase.storage
      .from('ivor-voice-responses')
      .createSignedUrl(`cache/${cacheKey}.mp3`, 604800); // 7 days

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

  } catch (error) {
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
};

// Simple hash function for cache keys
function hashText(text) {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
}
