-- ====================================================
-- BLKOUT Liberation Platform - Community Features
-- Phase 3 Sprint 4: RSVP & Calendar Integration
-- ====================================================

-- Event RSVP Table
-- Tracks attendee registrations for events
CREATE TABLE IF NOT EXISTS event_rsvps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL,
    user_id TEXT NOT NULL,

    -- RSVP status
    status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN (
        'confirmed',    -- Attending
        'waitlist',     -- On waitlist
        'cancelled',    -- User cancelled
        'no_show'       -- Didn't attend
    )),

    -- Attendee info
    attendee_name TEXT,
    attendee_email TEXT,
    guest_count INTEGER DEFAULT 0 CHECK (guest_count >= 0 AND guest_count <= 5),

    -- Check-in
    checked_in BOOLEAN DEFAULT FALSE,
    checked_in_at TIMESTAMPTZ,
    check_in_code TEXT UNIQUE,  -- QR code identifier

    -- Accessibility & notes
    accessibility_needs TEXT,
    dietary_requirements TEXT,
    notes TEXT,

    -- Metadata
    source TEXT DEFAULT 'web',  -- web, mobile, api
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Unique constraint: one RSVP per user per event
    UNIQUE(event_id, user_id)
);

-- Event Capacity Table
-- Manages capacity limits and waitlist settings
CREATE TABLE IF NOT EXISTS event_capacity (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL UNIQUE,

    -- Capacity settings
    max_capacity INTEGER,  -- NULL = unlimited
    waitlist_enabled BOOLEAN DEFAULT TRUE,
    max_waitlist INTEGER DEFAULT 50,

    -- Guest policy
    allow_guests BOOLEAN DEFAULT TRUE,
    max_guests_per_rsvp INTEGER DEFAULT 2,

    -- Registration settings
    registration_opens_at TIMESTAMPTZ,
    registration_closes_at TIMESTAMPTZ,
    require_approval BOOLEAN DEFAULT FALSE,

    -- Current counts (denormalized for performance)
    confirmed_count INTEGER DEFAULT 0,
    waitlist_count INTEGER DEFAULT 0,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Calendar Feeds Table
-- User-specific calendar feed subscriptions
CREATE TABLE IF NOT EXISTS calendar_feeds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,

    -- Feed configuration
    feed_token TEXT NOT NULL UNIQUE,  -- Token for feed URL
    feed_type TEXT NOT NULL DEFAULT 'rsvp' CHECK (feed_type IN (
        'rsvp',         -- Only RSVP'd events
        'saved',        -- Saved/bookmarked events
        'all',          -- All public events
        'organizer'     -- Events user is organizing
    )),

    -- Filters
    categories JSONB DEFAULT '[]',
    locations JSONB DEFAULT '[]',

    -- Settings
    include_reminders BOOLEAN DEFAULT TRUE,
    reminder_hours INTEGER DEFAULT 24,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_accessed_at TIMESTAMPTZ
);

-- Event Reminders Table (extends from Sprint 1)
-- Scheduled reminders linked to RSVPs
CREATE TABLE IF NOT EXISTS rsvp_reminders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rsvp_id UUID NOT NULL REFERENCES event_rsvps(id) ON DELETE CASCADE,
    event_id UUID NOT NULL,
    user_id TEXT NOT NULL,

    -- Reminder settings
    reminder_type TEXT NOT NULL CHECK (reminder_type IN (
        '1week',        -- 1 week before
        '1day',         -- 1 day before
        '2hours',       -- 2 hours before
        '30min'         -- 30 minutes before
    )),
    scheduled_for TIMESTAMPTZ NOT NULL,

    -- Delivery
    sent BOOLEAN DEFAULT FALSE,
    sent_at TIMESTAMPTZ,
    delivery_method TEXT DEFAULT 'push',  -- push, email, both

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_rsvps_event ON event_rsvps(event_id);
CREATE INDEX IF NOT EXISTS idx_rsvps_user ON event_rsvps(user_id);
CREATE INDEX IF NOT EXISTS idx_rsvps_status ON event_rsvps(status);
CREATE INDEX IF NOT EXISTS idx_rsvps_check_in_code ON event_rsvps(check_in_code);
CREATE INDEX IF NOT EXISTS idx_capacity_event ON event_capacity(event_id);
CREATE INDEX IF NOT EXISTS idx_feeds_user ON calendar_feeds(user_id);
CREATE INDEX IF NOT EXISTS idx_feeds_token ON calendar_feeds(feed_token);
CREATE INDEX IF NOT EXISTS idx_reminders_scheduled ON rsvp_reminders(scheduled_for) WHERE sent = FALSE;

-- Row Level Security
ALTER TABLE event_rsvps ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_capacity ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_feeds ENABLE ROW LEVEL SECURITY;
ALTER TABLE rsvp_reminders ENABLE ROW LEVEL SECURITY;

-- Service role policies
CREATE POLICY "Service role full access to rsvps"
    ON event_rsvps FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access to capacity"
    ON event_capacity FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access to feeds"
    ON calendar_feeds FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access to reminders"
    ON rsvp_reminders FOR ALL USING (auth.role() = 'service_role');

-- User policies
CREATE POLICY "Users can view own RSVPs"
    ON event_rsvps FOR SELECT
    USING (user_id = auth.uid()::text);

CREATE POLICY "Users can create RSVPs"
    ON event_rsvps FOR INSERT
    WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Users can update own RSVPs"
    ON event_rsvps FOR UPDATE
    USING (user_id = auth.uid()::text);

CREATE POLICY "Public read access to capacity"
    ON event_capacity FOR SELECT
    USING (true);

CREATE POLICY "Users can manage own feeds"
    ON calendar_feeds FOR ALL
    USING (user_id = auth.uid()::text);

-- Function to update RSVP timestamps
CREATE OR REPLACE FUNCTION update_rsvp_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_rsvp_updated
    BEFORE UPDATE ON event_rsvps
    FOR EACH ROW
    EXECUTE FUNCTION update_rsvp_updated_at();

CREATE TRIGGER trigger_capacity_updated
    BEFORE UPDATE ON event_capacity
    FOR EACH ROW
    EXECUTE FUNCTION update_rsvp_updated_at();

-- Function to update capacity counts
CREATE OR REPLACE FUNCTION update_capacity_counts()
RETURNS TRIGGER AS $$
BEGIN
    -- Update confirmed count
    UPDATE event_capacity
    SET confirmed_count = (
        SELECT COALESCE(SUM(1 + guest_count), 0)
        FROM event_rsvps
        WHERE event_id = COALESCE(NEW.event_id, OLD.event_id)
        AND status = 'confirmed'
    ),
    waitlist_count = (
        SELECT COUNT(*)
        FROM event_rsvps
        WHERE event_id = COALESCE(NEW.event_id, OLD.event_id)
        AND status = 'waitlist'
    ),
    updated_at = NOW()
    WHERE event_id = COALESCE(NEW.event_id, OLD.event_id);

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_capacity_counts
    AFTER INSERT OR UPDATE OR DELETE ON event_rsvps
    FOR EACH ROW
    EXECUTE FUNCTION update_capacity_counts();

-- Function to generate check-in code
CREATE OR REPLACE FUNCTION generate_check_in_code()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.check_in_code IS NULL THEN
        NEW.check_in_code = 'BLK-' ||
            UPPER(SUBSTRING(MD5(NEW.id::text || NOW()::text) FROM 1 FOR 8));
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_generate_check_in_code
    BEFORE INSERT ON event_rsvps
    FOR EACH ROW
    EXECUTE FUNCTION generate_check_in_code();

-- ====================================================
-- Liberation Commentary:
-- This RSVP system supports community gathering by:
-- - Enabling capacity management for safe spaces
-- - Providing QR check-in for smooth entry
-- - Supporting accessibility needs documentation
-- - Creating calendar integration for visibility
-- ====================================================

COMMENT ON TABLE event_rsvps IS
    'RSVP registrations for community events';
COMMENT ON TABLE event_capacity IS
    'Capacity and waitlist settings per event';
COMMENT ON TABLE calendar_feeds IS
    'Personalized calendar feed subscriptions';
COMMENT ON TABLE rsvp_reminders IS
    'Scheduled reminders for RSVP attendees';
