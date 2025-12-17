-- ====================================================
-- BLKOUT Liberation Platform - Notification System
-- Phase 3 Sprint 1: Push Notifications
-- ====================================================

-- Notification Subscriptions Table
-- Stores push notification subscriptions for PWA users
CREATE TABLE IF NOT EXISTS notification_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL DEFAULT 'anonymous',
    endpoint TEXT NOT NULL UNIQUE,
    p256dh TEXT NOT NULL,
    auth TEXT NOT NULL,
    preferences JSONB NOT NULL DEFAULT '{
        "events": true,
        "news": true,
        "community": true,
        "reminders": true
    }',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for efficient querying by user and preferences
CREATE INDEX IF NOT EXISTS idx_notification_subs_user
    ON notification_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_subs_events
    ON notification_subscriptions((preferences->>'events'));
CREATE INDEX IF NOT EXISTS idx_notification_subs_news
    ON notification_subscriptions((preferences->>'news'));

-- Notification Log Table
-- Tracks sent notifications for analytics
CREATE TABLE IF NOT EXISTS notification_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    topic TEXT NOT NULL DEFAULT 'general',
    sent_count INTEGER NOT NULL DEFAULT 0,
    success_count INTEGER DEFAULT 0,
    failure_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for efficient time-based queries
CREATE INDEX IF NOT EXISTS idx_notification_log_created
    ON notification_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notification_log_topic
    ON notification_log(topic);

-- Event Reminders Table
-- Tracks scheduled reminders for events
CREATE TABLE IF NOT EXISTS event_reminders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL,
    user_id TEXT,
    reminder_type TEXT NOT NULL DEFAULT '24h', -- '24h', '1h', 'now'
    scheduled_for TIMESTAMPTZ NOT NULL,
    sent BOOLEAN NOT NULL DEFAULT FALSE,
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for reminder scheduling
CREATE INDEX IF NOT EXISTS idx_event_reminders_scheduled
    ON event_reminders(scheduled_for) WHERE sent = FALSE;
CREATE INDEX IF NOT EXISTS idx_event_reminders_event
    ON event_reminders(event_id);

-- Row Level Security
ALTER TABLE notification_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_reminders ENABLE ROW LEVEL SECURITY;

-- Policy: Allow service role full access
CREATE POLICY "Service role full access to subscriptions"
    ON notification_subscriptions
    FOR ALL
    USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access to notification log"
    ON notification_log
    FOR ALL
    USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access to event reminders"
    ON event_reminders
    FOR ALL
    USING (auth.role() = 'service_role');

-- Policy: Users can manage their own subscriptions
CREATE POLICY "Users can view own subscriptions"
    ON notification_subscriptions
    FOR SELECT
    USING (user_id = auth.uid()::text OR user_id = 'anonymous');

CREATE POLICY "Users can insert subscriptions"
    ON notification_subscriptions
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Users can update own subscriptions"
    ON notification_subscriptions
    FOR UPDATE
    USING (user_id = auth.uid()::text OR user_id = 'anonymous');

CREATE POLICY "Users can delete own subscriptions"
    ON notification_subscriptions
    FOR DELETE
    USING (user_id = auth.uid()::text OR user_id = 'anonymous');

-- Function to update timestamp
CREATE OR REPLACE FUNCTION update_notification_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for auto-updating timestamp
CREATE TRIGGER trigger_notification_sub_updated
    BEFORE UPDATE ON notification_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_notification_updated_at();

-- ====================================================
-- Liberation Commentary:
-- This notification system enables community-owned
-- communication channels, ensuring:
-- - User consent for all notifications (opt-in)
-- - Preference control for notification types
-- - Transparent logging of sent notifications
-- - Event reminders to support community gatherings
-- ====================================================

COMMENT ON TABLE notification_subscriptions IS
    'Push notification subscriptions - community-controlled communication';
COMMENT ON TABLE notification_log IS
    'Notification history for transparency and analytics';
COMMENT ON TABLE event_reminders IS
    'Scheduled reminders for community events';
