-- ====================================================
-- BLKOUT Liberation Platform - Community Features
-- Phase 3 Sprint 5: Enhanced Community Management
-- ====================================================

-- Event Organizers Table
-- Tracks verified organizers and their permissions
CREATE TABLE IF NOT EXISTS event_organizers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL UNIQUE,

    -- Profile
    display_name TEXT NOT NULL,
    bio TEXT,
    avatar_url TEXT,
    website_url TEXT,
    social_links JSONB DEFAULT '{}',

    -- Verification
    is_verified BOOLEAN DEFAULT FALSE,
    verified_at TIMESTAMPTZ,
    verified_by TEXT,
    verification_notes TEXT,

    -- Permissions
    can_create_events BOOLEAN DEFAULT TRUE,
    can_feature_events BOOLEAN DEFAULT FALSE,
    can_moderate BOOLEAN DEFAULT FALSE,
    max_events_per_month INTEGER DEFAULT 10,

    -- Stats (denormalized)
    total_events INTEGER DEFAULT 0,
    total_attendees INTEGER DEFAULT 0,
    average_rating DECIMAL(3,2) DEFAULT 0,

    -- Liberation metrics
    liberation_score INTEGER DEFAULT 50,
    community_impact_score INTEGER DEFAULT 50,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Community Groups Table
-- Groups for organizing events and discussions
CREATE TABLE IF NOT EXISTS community_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Basic info
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    cover_image TEXT,

    -- Settings
    visibility TEXT NOT NULL DEFAULT 'public' CHECK (visibility IN (
        'public',       -- Anyone can see and join
        'private',      -- Invite only
        'hidden'        -- Not discoverable
    )),
    join_policy TEXT NOT NULL DEFAULT 'open' CHECK (join_policy IN (
        'open',         -- Anyone can join
        'approval',     -- Requires approval
        'invite'        -- Invite only
    )),

    -- Categories
    category TEXT,
    tags JSONB DEFAULT '[]',

    -- Location focus
    location_focus TEXT,  -- e.g., "London", "Manchester", "UK-wide"

    -- Stats
    member_count INTEGER DEFAULT 0,
    event_count INTEGER DEFAULT 0,

    -- Liberation
    liberation_aligned BOOLEAN DEFAULT TRUE,
    community_guidelines TEXT,

    created_by TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Group Memberships Table
CREATE TABLE IF NOT EXISTS group_memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES community_groups(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,

    -- Role
    role TEXT NOT NULL DEFAULT 'member' CHECK (role IN (
        'member',       -- Regular member
        'moderator',    -- Can moderate content
        'admin',        -- Can manage group settings
        'owner'         -- Full control
    )),

    -- Status
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN (
        'pending',      -- Awaiting approval
        'active',       -- Active member
        'suspended',    -- Temporarily suspended
        'banned'        -- Permanently banned
    )),

    -- Notifications
    notifications_enabled BOOLEAN DEFAULT TRUE,
    digest_frequency TEXT DEFAULT 'weekly',

    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE(group_id, user_id)
);

-- Event Moderation Table
-- Tracks moderation actions on events
CREATE TABLE IF NOT EXISTS event_moderation (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL,

    -- Action
    action TEXT NOT NULL CHECK (action IN (
        'approve',
        'reject',
        'flag',
        'unflag',
        'feature',
        'unfeature',
        'suspend',
        'restore',
        'delete'
    )),
    reason TEXT,
    notes TEXT,

    -- Actor
    moderator_id TEXT NOT NULL,
    moderator_name TEXT,

    -- Previous state
    previous_status TEXT,
    new_status TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Event Reports Table
-- Community reports on events
CREATE TABLE IF NOT EXISTS event_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL,
    reporter_id TEXT NOT NULL,

    -- Report details
    reason TEXT NOT NULL CHECK (reason IN (
        'spam',
        'inappropriate',
        'misleading',
        'harassment',
        'safety',
        'scam',
        'duplicate',
        'other'
    )),
    description TEXT,
    evidence_urls JSONB DEFAULT '[]',

    -- Status
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
        'pending',
        'reviewing',
        'resolved',
        'dismissed'
    )),

    -- Resolution
    resolved_by TEXT,
    resolved_at TIMESTAMPTZ,
    resolution_notes TEXT,
    action_taken TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Organizer Analytics Table
-- Detailed analytics for organizers
CREATE TABLE IF NOT EXISTS organizer_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organizer_id UUID NOT NULL REFERENCES event_organizers(id) ON DELETE CASCADE,
    event_id UUID,

    -- Time period
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,

    -- Metrics
    views INTEGER DEFAULT 0,
    rsvps INTEGER DEFAULT 0,
    check_ins INTEGER DEFAULT 0,
    cancellations INTEGER DEFAULT 0,
    waitlist_conversions INTEGER DEFAULT 0,

    -- Engagement
    calendar_adds INTEGER DEFAULT 0,
    shares INTEGER DEFAULT 0,
    saves INTEGER DEFAULT 0,

    -- Demographics (anonymized)
    attendee_demographics JSONB DEFAULT '{}',

    -- Liberation impact
    liberation_reach INTEGER DEFAULT 0,
    community_engagement_score INTEGER DEFAULT 0,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Event Collaborators Table
-- Multiple organizers per event
CREATE TABLE IF NOT EXISTS event_collaborators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL,
    user_id TEXT NOT NULL,

    -- Role
    role TEXT NOT NULL DEFAULT 'collaborator' CHECK (role IN (
        'owner',        -- Primary organizer
        'collaborator', -- Can edit event
        'promoter',     -- Can share/promote
        'volunteer'     -- Event day help
    )),

    -- Permissions
    can_edit BOOLEAN DEFAULT FALSE,
    can_manage_rsvps BOOLEAN DEFAULT FALSE,
    can_check_in BOOLEAN DEFAULT FALSE,
    can_view_analytics BOOLEAN DEFAULT FALSE,

    invited_by TEXT,
    accepted_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE(event_id, user_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_organizers_user ON event_organizers(user_id);
CREATE INDEX IF NOT EXISTS idx_organizers_verified ON event_organizers(is_verified);
CREATE INDEX IF NOT EXISTS idx_groups_slug ON community_groups(slug);
CREATE INDEX IF NOT EXISTS idx_groups_visibility ON community_groups(visibility);
CREATE INDEX IF NOT EXISTS idx_memberships_user ON group_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_memberships_group ON group_memberships(group_id);
CREATE INDEX IF NOT EXISTS idx_moderation_event ON event_moderation(event_id);
CREATE INDEX IF NOT EXISTS idx_reports_event ON event_reports(event_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON event_reports(status);
CREATE INDEX IF NOT EXISTS idx_analytics_organizer ON organizer_analytics(organizer_id);
CREATE INDEX IF NOT EXISTS idx_collaborators_event ON event_collaborators(event_id);
CREATE INDEX IF NOT EXISTS idx_collaborators_user ON event_collaborators(user_id);

-- Row Level Security
ALTER TABLE event_organizers ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_moderation ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizer_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_collaborators ENABLE ROW LEVEL SECURITY;

-- Service role policies
CREATE POLICY "Service role full access to organizers"
    ON event_organizers FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access to groups"
    ON community_groups FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access to memberships"
    ON group_memberships FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access to moderation"
    ON event_moderation FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access to reports"
    ON event_reports FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access to analytics"
    ON organizer_analytics FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access to collaborators"
    ON event_collaborators FOR ALL USING (auth.role() = 'service_role');

-- User policies
CREATE POLICY "Users can view own organizer profile"
    ON event_organizers FOR SELECT
    USING (user_id = auth.uid()::text);

CREATE POLICY "Public groups are viewable"
    ON community_groups FOR SELECT
    USING (visibility = 'public');

CREATE POLICY "Users can view own memberships"
    ON group_memberships FOR SELECT
    USING (user_id = auth.uid()::text);

CREATE POLICY "Users can view own analytics"
    ON organizer_analytics FOR SELECT
    USING (organizer_id IN (
        SELECT id FROM event_organizers WHERE user_id = auth.uid()::text
    ));

-- Functions
CREATE OR REPLACE FUNCTION update_group_member_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE community_groups
    SET member_count = (
        SELECT COUNT(*)
        FROM group_memberships
        WHERE group_id = COALESCE(NEW.group_id, OLD.group_id)
        AND status = 'active'
    ),
    updated_at = NOW()
    WHERE id = COALESCE(NEW.group_id, OLD.group_id);

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_group_member_count
    AFTER INSERT OR UPDATE OR DELETE ON group_memberships
    FOR EACH ROW
    EXECUTE FUNCTION update_group_member_count();

CREATE OR REPLACE FUNCTION update_organizer_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Update total events count
    UPDATE event_organizers
    SET total_events = (
        SELECT COUNT(DISTINCT event_id)
        FROM event_collaborators
        WHERE user_id = NEW.user_id
        AND role = 'owner'
    ),
    updated_at = NOW()
    WHERE user_id = NEW.user_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ====================================================
-- Liberation Commentary:
-- This community management system supports liberation by:
-- - Enabling verified Black queer organizers
-- - Creating safe community spaces with moderation
-- - Tracking liberation impact metrics
-- - Supporting collaborative event organizing
-- - Maintaining community safety through reporting
-- ====================================================

COMMENT ON TABLE event_organizers IS
    'Verified event organizers with liberation metrics';
COMMENT ON TABLE community_groups IS
    'Community groups for organizing and discussion';
COMMENT ON TABLE group_memberships IS
    'Group membership with roles and permissions';
COMMENT ON TABLE event_moderation IS
    'Moderation action log for events';
COMMENT ON TABLE event_reports IS
    'Community reports on events';
COMMENT ON TABLE organizer_analytics IS
    'Detailed organizer analytics';
COMMENT ON TABLE event_collaborators IS
    'Event collaboration permissions';
