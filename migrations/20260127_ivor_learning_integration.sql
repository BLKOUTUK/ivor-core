-- IVOR Learning Integration Migration
-- Part of BLKOUT Self-Improving System (Phase 1.3)
-- Created: 2026-01-27
--
-- This migration adds tables for:
-- 1. IVOR conversation intelligence storage
-- 2. Resource recommendation tracking
-- 3. Resource effectiveness metrics

-- =============================================
-- Table: ivor_resource_recommendations
-- Tracks which resources IVOR recommends in conversations
-- =============================================
CREATE TABLE IF NOT EXISTS ivor_resource_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id TEXT NOT NULL,
    resource_id TEXT NOT NULL,
    resource_title TEXT NOT NULL,
    resource_category TEXT,
    journey_stage TEXT DEFAULT 'growth',
    topic_categories TEXT[] DEFAULT '{}',
    was_helpful BOOLEAN,
    recommended_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for querying by resource
CREATE INDEX IF NOT EXISTS idx_resource_recommendations_resource_id
    ON ivor_resource_recommendations(resource_id);

-- Index for querying by conversation
CREATE INDEX IF NOT EXISTS idx_resource_recommendations_conversation_id
    ON ivor_resource_recommendations(conversation_id);

-- Index for analyzing effectiveness
CREATE INDEX IF NOT EXISTS idx_resource_recommendations_helpful
    ON ivor_resource_recommendations(resource_id, was_helpful)
    WHERE was_helpful IS NOT NULL;

-- =============================================
-- Table: ivor_resource_effectiveness
-- Aggregates effectiveness data for resources
-- =============================================
CREATE TABLE IF NOT EXISTS ivor_resource_effectiveness (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resource_id TEXT NOT NULL,
    session_id TEXT NOT NULL,
    was_helpful BOOLEAN NOT NULL,
    feedback_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(resource_id, session_id)
);

-- Index for resource effectiveness queries
CREATE INDEX IF NOT EXISTS idx_resource_effectiveness_resource_id
    ON ivor_resource_effectiveness(resource_id);

-- =============================================
-- View: ivor_resource_effectiveness_summary
-- Summarizes resource effectiveness metrics
-- =============================================
CREATE OR REPLACE VIEW ivor_resource_effectiveness_summary AS
SELECT
    resource_id,
    COUNT(*) as total_recommendations,
    COUNT(*) FILTER (WHERE was_helpful = true) as helpful_count,
    COUNT(*) FILTER (WHERE was_helpful = false) as not_helpful_count,
    COUNT(*) FILTER (WHERE was_helpful IS NOT NULL) as feedback_count,
    CASE
        WHEN COUNT(*) FILTER (WHERE was_helpful IS NOT NULL) > 0
        THEN ROUND(
            COUNT(*) FILTER (WHERE was_helpful = true)::NUMERIC /
            COUNT(*) FILTER (WHERE was_helpful IS NOT NULL) * 100,
            2
        )
        ELSE NULL
    END as helpful_percentage
FROM ivor_resource_recommendations
GROUP BY resource_id;

-- =============================================
-- View: ivor_conversation_themes_summary
-- Aggregates conversation themes for community insights
-- =============================================
CREATE OR REPLACE VIEW ivor_conversation_themes_summary AS
SELECT
    date_trunc('day', data_timestamp) as day,
    COUNT(*) as conversation_count,
    jsonb_agg(DISTINCT jsonb_array_elements_text(
        (intelligence_data->>'themes')::jsonb
    )) FILTER (WHERE intelligence_data->>'themes' IS NOT NULL) as themes,
    COUNT(*) FILTER (WHERE intelligence_data->>'emotional_tone' = 'crisis') as crisis_conversations,
    COUNT(*) FILTER (WHERE intelligence_data->>'emotional_tone' = 'stressed') as stressed_conversations,
    COUNT(*) FILTER (WHERE intelligence_data->>'emotional_tone' = 'joyful') as joyful_conversations,
    AVG((intelligence_data->>'sentiment_score')::NUMERIC) as avg_sentiment
FROM ivor_intelligence
WHERE intelligence_type = 'conversation_themes'
    AND data_timestamp > NOW() - INTERVAL '7 days'
GROUP BY date_trunc('day', data_timestamp)
ORDER BY day DESC;

-- =============================================
-- Function: refresh_ivor_trending_topics
-- Refreshes trending topics intelligence
-- Called by scheduled job
-- =============================================
CREATE OR REPLACE FUNCTION refresh_ivor_trending_topics()
RETURNS void AS $$
DECLARE
    topic_counts JSONB;
    total_convs INTEGER;
BEGIN
    -- Count themes from last 24 hours
    SELECT
        jsonb_object_agg(theme, theme_count),
        COUNT(DISTINCT id)
    INTO topic_counts, total_convs
    FROM (
        SELECT
            id,
            jsonb_array_elements_text((intelligence_data->>'themes')::jsonb) as theme
        FROM ivor_intelligence
        WHERE intelligence_type = 'conversation_themes'
            AND data_timestamp > NOW() - INTERVAL '24 hours'
    ) themes
    GROUP BY theme
    ORDER BY theme_count DESC
    LIMIT 20;

    -- Insert or update trending topics
    INSERT INTO ivor_intelligence (
        id,
        intelligence_type,
        ivor_service,
        ivor_endpoint,
        intelligence_data,
        summary,
        key_insights,
        actionable_items,
        relevance_score,
        priority,
        urgency,
        data_timestamp,
        expires_at,
        is_stale,
        tags
    ) VALUES (
        gen_random_uuid(),
        'trending_topics_hourly',
        'ivor-core',
        'scheduled_refresh',
        jsonb_build_object(
            'topic_counts', COALESCE(topic_counts, '{}'::jsonb),
            'total_conversations', total_convs,
            'window_hours', 24,
            'generated_at', NOW()
        ),
        'Hourly trending topics from community conversations',
        ARRAY(SELECT jsonb_object_keys(COALESCE(topic_counts, '{}'::jsonb)) LIMIT 5),
        ARRAY['Review trending topics for content opportunities'],
        0.8,
        'medium',
        'normal',
        NOW(),
        NOW() + INTERVAL '2 hours',
        false,
        ARRAY['trending', 'hourly', 'automated']
    );

    -- Mark older trending entries as stale
    UPDATE ivor_intelligence
    SET is_stale = true
    WHERE intelligence_type = 'trending_topics_hourly'
        AND data_timestamp < NOW() - INTERVAL '2 hours'
        AND is_stale = false;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- Function: get_community_questions
-- Returns what the community is asking about
-- =============================================
CREATE OR REPLACE FUNCTION get_community_questions(
    time_window INTERVAL DEFAULT INTERVAL '7 days'
)
RETURNS TABLE (
    theme TEXT,
    mention_count INTEGER,
    sample_categories TEXT[],
    avg_sentiment NUMERIC,
    urgency_breakdown JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        t.theme,
        COUNT(*)::INTEGER as mention_count,
        ARRAY_AGG(DISTINCT cat) FILTER (WHERE cat IS NOT NULL) as sample_categories,
        AVG((i.intelligence_data->>'sentiment_score')::NUMERIC) as avg_sentiment,
        jsonb_build_object(
            'low', COUNT(*) FILTER (WHERE i.intelligence_data->>'urgency_level' = 'low'),
            'medium', COUNT(*) FILTER (WHERE i.intelligence_data->>'urgency_level' = 'medium'),
            'high', COUNT(*) FILTER (WHERE i.intelligence_data->>'urgency_level' = 'high'),
            'critical', COUNT(*) FILTER (WHERE i.intelligence_data->>'urgency_level' = 'critical')
        ) as urgency_breakdown
    FROM ivor_intelligence i,
        LATERAL jsonb_array_elements_text((i.intelligence_data->>'themes')::jsonb) as t(theme),
        LATERAL jsonb_array_elements_text((i.intelligence_data->>'topic_categories')::jsonb) as c(cat)
    WHERE i.intelligence_type = 'conversation_themes'
        AND i.data_timestamp > NOW() - time_window
    GROUP BY t.theme
    ORDER BY mention_count DESC
    LIMIT 20;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- Trigger: Update timestamps
-- =============================================
CREATE OR REPLACE FUNCTION update_resource_recommendations_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_resource_recommendations_timestamp
    BEFORE UPDATE ON ivor_resource_recommendations
    FOR EACH ROW
    EXECUTE FUNCTION update_resource_recommendations_timestamp();

-- =============================================
-- Comments for documentation
-- =============================================
COMMENT ON TABLE ivor_resource_recommendations IS
    'Tracks resources recommended by IVOR in conversations for effectiveness analysis';

COMMENT ON TABLE ivor_resource_effectiveness IS
    'Stores feedback on whether recommended resources were helpful';

COMMENT ON VIEW ivor_resource_effectiveness_summary IS
    'Aggregated view of resource effectiveness metrics';

COMMENT ON VIEW ivor_conversation_themes_summary IS
    'Daily summary of conversation themes and emotional tones';

COMMENT ON FUNCTION refresh_ivor_trending_topics() IS
    'Scheduled function to refresh trending topics from recent conversations';

COMMENT ON FUNCTION get_community_questions(INTERVAL) IS
    'Returns aggregated themes from community conversations - powers the "What is the community asking?" dashboard';

-- =============================================
-- Grant permissions (adjust as needed)
-- =============================================
-- GRANT SELECT ON ivor_resource_effectiveness_summary TO authenticated;
-- GRANT SELECT ON ivor_conversation_themes_summary TO authenticated;
-- GRANT EXECUTE ON FUNCTION get_community_questions(INTERVAL) TO authenticated;
