-- ====================================================
-- BLKOUT Liberation Platform - Smart Discovery System
-- Phase 3 Sprint 2: Personalized Recommendations
-- ====================================================

-- User Preferences Table
-- Stores explicit user preferences for personalization
CREATE TABLE IF NOT EXISTS user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL UNIQUE,

    -- Content preferences
    preferred_categories JSONB DEFAULT '[]',
    preferred_locations JSONB DEFAULT '[]',
    preferred_organizers JSONB DEFAULT '[]',

    -- Event type preferences (weighted 0-1)
    preference_weights JSONB DEFAULT '{
        "parties": 0.5,
        "workshops": 0.5,
        "cultural": 0.5,
        "community": 0.5,
        "activism": 0.5,
        "wellness": 0.5,
        "arts": 0.5,
        "networking": 0.5
    }',

    -- Discovery settings
    discovery_radius_km INTEGER DEFAULT 50,
    show_online_events BOOLEAN DEFAULT TRUE,
    show_in_person_events BOOLEAN DEFAULT TRUE,

    -- Liberation alignment (user's values)
    liberation_priorities JSONB DEFAULT '{
        "black_queer_centered": true,
        "community_owned": true,
        "accessibility_focused": true,
        "intersectional": true
    }',

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User Interactions Table
-- Tracks implicit signals for recommendation learning
CREATE TABLE IF NOT EXISTS user_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,

    -- Content reference
    content_type TEXT NOT NULL CHECK (content_type IN ('event', 'news', 'organizer')),
    content_id UUID NOT NULL,

    -- Interaction type
    interaction_type TEXT NOT NULL CHECK (interaction_type IN (
        'view',           -- Viewed content
        'click',          -- Clicked to see details
        'dwell',          -- Time spent viewing
        'share',          -- Shared content
        'save',           -- Saved/bookmarked
        'rsvp',           -- RSVP'd to event
        'attend',         -- Actually attended
        'dismiss',        -- Dismissed/not interested
        'report'          -- Reported content
    )),

    -- Interaction metadata
    metadata JSONB DEFAULT '{}',
    dwell_time_seconds INTEGER,

    -- Context
    source TEXT,  -- Where interaction came from (feed, search, direct)
    session_id TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_user_interactions_user
    ON user_interactions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_interactions_content
    ON user_interactions(content_type, content_id);
CREATE INDEX IF NOT EXISTS idx_user_interactions_type
    ON user_interactions(interaction_type);
CREATE INDEX IF NOT EXISTS idx_user_preferences_user
    ON user_preferences(user_id);

-- Content Scores Cache
-- Pre-computed scores for faster recommendations
CREATE TABLE IF NOT EXISTS content_scores_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_type TEXT NOT NULL,
    content_id UUID NOT NULL,

    -- Computed scores
    popularity_score FLOAT DEFAULT 0,
    liberation_score FLOAT DEFAULT 0,
    trending_score FLOAT DEFAULT 0,
    freshness_score FLOAT DEFAULT 0,

    -- Aggregated stats
    view_count INTEGER DEFAULT 0,
    click_count INTEGER DEFAULT 0,
    share_count INTEGER DEFAULT 0,
    save_count INTEGER DEFAULT 0,
    rsvp_count INTEGER DEFAULT 0,

    -- Cache metadata
    computed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '1 hour',

    UNIQUE(content_type, content_id)
);

CREATE INDEX IF NOT EXISTS idx_content_scores_type
    ON content_scores_cache(content_type);
CREATE INDEX IF NOT EXISTS idx_content_scores_trending
    ON content_scores_cache(trending_score DESC);
CREATE INDEX IF NOT EXISTS idx_content_scores_liberation
    ON content_scores_cache(liberation_score DESC);

-- User Feed Cache
-- Pre-computed personalized feeds for performance
CREATE TABLE IF NOT EXISTS user_feed_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    feed_type TEXT NOT NULL CHECK (feed_type IN ('events', 'news', 'digest')),

    -- Ordered list of content IDs
    content_ids JSONB NOT NULL DEFAULT '[]',

    -- Cache metadata
    computed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '30 minutes',

    UNIQUE(user_id, feed_type)
);

CREATE INDEX IF NOT EXISTS idx_user_feed_user
    ON user_feed_cache(user_id, feed_type);

-- Row Level Security
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_scores_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_feed_cache ENABLE ROW LEVEL SECURITY;

-- Policies: Service role full access
CREATE POLICY "Service role full access to preferences"
    ON user_preferences FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access to interactions"
    ON user_interactions FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access to content scores"
    ON content_scores_cache FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access to feed cache"
    ON user_feed_cache FOR ALL USING (auth.role() = 'service_role');

-- Policies: Users can manage own data
CREATE POLICY "Users can view own preferences"
    ON user_preferences FOR SELECT
    USING (user_id = auth.uid()::text);

CREATE POLICY "Users can insert own preferences"
    ON user_preferences FOR INSERT
    WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Users can update own preferences"
    ON user_preferences FOR UPDATE
    USING (user_id = auth.uid()::text);

CREATE POLICY "Users can insert own interactions"
    ON user_interactions FOR INSERT
    WITH CHECK (user_id = auth.uid()::text OR user_id LIKE 'anon_%');

CREATE POLICY "Public read access to content scores"
    ON content_scores_cache FOR SELECT
    USING (true);

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_preferences_updated
    BEFORE UPDATE ON user_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_preferences_updated_at();

-- Function to compute trending score
CREATE OR REPLACE FUNCTION compute_trending_score(
    view_count INTEGER,
    click_count INTEGER,
    share_count INTEGER,
    created_at TIMESTAMPTZ
) RETURNS FLOAT AS $$
DECLARE
    age_hours FLOAT;
    engagement_score FLOAT;
    decay_factor FLOAT;
BEGIN
    -- Calculate age in hours
    age_hours := EXTRACT(EPOCH FROM (NOW() - created_at)) / 3600;

    -- Engagement score (weighted)
    engagement_score := (view_count * 1) + (click_count * 3) + (share_count * 5);

    -- Time decay (half-life of 24 hours)
    decay_factor := POWER(0.5, age_hours / 24);

    RETURN engagement_score * decay_factor;
END;
$$ LANGUAGE plpgsql;

-- ====================================================
-- Liberation Commentary:
-- This discovery system centers Black queer experiences by:
-- - Weighting liberation-aligned content higher
-- - Tracking community preferences, not surveillance
-- - Enabling organizer/creator discovery
-- - Supporting local community connections
-- ====================================================

COMMENT ON TABLE user_preferences IS
    'User discovery preferences - community-controlled personalization';
COMMENT ON TABLE user_interactions IS
    'Interaction signals for recommendations - privacy-respecting analytics';
COMMENT ON TABLE content_scores_cache IS
    'Pre-computed content scores with liberation weighting';
COMMENT ON TABLE user_feed_cache IS
    'Personalized feed cache for performance';
