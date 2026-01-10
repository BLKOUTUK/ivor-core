-- Rename browseract_events table to community_events
-- This removes BrowserAct branding and uses a more generic name

-- Rename the table
ALTER TABLE IF EXISTS public.browseract_events RENAME TO community_events;

-- Rename indexes
ALTER INDEX IF EXISTS idx_browseract_events_moderation_status RENAME TO idx_community_events_moderation_status;
ALTER INDEX IF EXISTS idx_browseract_events_approval_status RENAME TO idx_community_events_approval_status;
ALTER INDEX IF EXISTS idx_browseract_events_event_date RENAME TO idx_community_events_event_date;
ALTER INDEX IF EXISTS idx_browseract_events_created_at RENAME TO idx_community_events_created_at;

-- Update the default value for submitted_by column
ALTER TABLE public.community_events ALTER COLUMN submitted_by SET DEFAULT 'ivor-automation';

-- Update table comment
COMMENT ON TABLE public.community_events IS 'Community events moderated by IVOR AI';
