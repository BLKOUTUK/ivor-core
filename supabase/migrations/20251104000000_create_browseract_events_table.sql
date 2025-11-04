-- Create browseract_events table for storing scraped events with IVOR moderation
CREATE TABLE IF NOT EXISTS public.browseract_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Event metadata
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  submitted_by TEXT NOT NULL DEFAULT 'browseract-automation',
  content_type TEXT NOT NULL DEFAULT 'events',

  -- Event details
  title TEXT NOT NULL,
  description TEXT,
  event_date DATE,
  event_time TIME,
  location TEXT,
  organizer_name TEXT,
  source_url TEXT,
  tags TEXT[], -- Array of tags
  price TEXT,
  image_url TEXT,

  -- IVOR AI moderation results
  ivor_confidence NUMERIC(5,2), -- 0.00 to 100.00
  ivor_reasoning TEXT,
  liberation_score NUMERIC(5,2), -- 0.00 to 100.00
  moderation_status TEXT NOT NULL CHECK (moderation_status IN ('auto-approved', 'review-quick', 'review-deep')),
  relevance TEXT CHECK (relevance IN ('high', 'medium', 'low')),
  quality TEXT CHECK (quality IN ('high', 'medium', 'low')),
  flags TEXT[], -- Array of flags

  -- Curator workflow
  approval_status TEXT NOT NULL DEFAULT 'pending_review' CHECK (approval_status IN ('pending_review', 'approved', 'rejected', 'archived')),
  curator_notes TEXT,
  reviewed_at TIMESTAMPTZ,
  reviewed_by TEXT,

  -- Publishing
  published_at TIMESTAMPTZ,
  published_to TEXT[] -- Platforms where event was published
);

-- Create indexes for common queries
CREATE INDEX idx_browseract_events_moderation_status ON public.browseract_events(moderation_status);
CREATE INDEX idx_browseract_events_approval_status ON public.browseract_events(approval_status);
CREATE INDEX idx_browseract_events_event_date ON public.browseract_events(event_date);
CREATE INDEX idx_browseract_events_created_at ON public.browseract_events(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.browseract_events ENABLE ROW LEVEL SECURITY;

-- Create policy for service role (full access for backend)
CREATE POLICY "Service role has full access"
  ON public.browseract_events
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create policy for authenticated users (read-only for curators)
CREATE POLICY "Authenticated users can read all events"
  ON public.browseract_events
  FOR SELECT
  TO authenticated
  USING (true);

-- Create policy for authenticated users to update curator fields
CREATE POLICY "Authenticated users can update curator fields"
  ON public.browseract_events
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Add comment
COMMENT ON TABLE public.browseract_events IS 'Events scraped by BrowserAct and moderated by IVOR AI';
