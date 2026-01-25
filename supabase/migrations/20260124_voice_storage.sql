-- IVOR Voice Storage Migration
-- Creates storage bucket for voice responses with 7-day cache
-- Zero recurring costs architecture

-- Create storage bucket for voice responses
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'ivor-voice-responses',
  'ivor-voice-responses',
  true,
  10485760, -- 10MB max file size
  ARRAY['audio/mpeg', 'audio/mp3']
)
ON CONFLICT (id) DO NOTHING;

-- Public read access (anyone can listen to cached responses)
CREATE POLICY "Public read access for voice responses"
ON storage.objects FOR SELECT
USING (bucket_id = 'ivor-voice-responses');

-- Authenticated upload (service role only)
CREATE POLICY "Service role upload for voice responses"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'ivor-voice-responses'
  AND auth.role() = 'service_role'
);

-- Authenticated delete (service role only, for cache cleanup)
CREATE POLICY "Service role delete for voice responses"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'ivor-voice-responses'
  AND auth.role() = 'service_role'
);

-- Create function to clean up old cached audio (>7 days)
CREATE OR REPLACE FUNCTION cleanup_old_voice_cache()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM storage.objects
  WHERE bucket_id = 'ivor-voice-responses'
    AND created_at < NOW() - INTERVAL '7 days';
END;
$$;

-- Schedule cleanup to run daily (requires pg_cron extension)
-- Uncomment if pg_cron is installed:
-- SELECT cron.schedule(
--   'cleanup-voice-cache',
--   '0 2 * * *', -- 2 AM daily
--   'SELECT cleanup_old_voice_cache();'
-- );

-- Create analytics table for voice usage tracking (optional)
CREATE TABLE IF NOT EXISTS ivor_voice_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT,
  user_id TEXT,
  text_length INTEGER,
  audio_size INTEGER,
  cached BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for analytics queries
CREATE INDEX IF NOT EXISTS idx_voice_analytics_created_at
ON ivor_voice_analytics(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_voice_analytics_session
ON ivor_voice_analytics(session_id);

-- RLS for analytics (service role only)
ALTER TABLE ivor_voice_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access for voice analytics"
ON ivor_voice_analytics
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Comments for documentation
COMMENT ON TABLE ivor_voice_analytics IS 'Tracks usage of IVOR voice synthesis for analytics and optimization';
COMMENT ON COLUMN ivor_voice_analytics.text_length IS 'Length of text sent for synthesis';
COMMENT ON COLUMN ivor_voice_analytics.audio_size IS 'Size of generated audio file in bytes';
COMMENT ON COLUMN ivor_voice_analytics.cached IS 'Whether response was served from cache';
