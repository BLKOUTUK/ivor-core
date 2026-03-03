-- ══════════════════════════════════════════════════
-- Meet AIvor Campaign Metrics & Self-Improvement
-- Created: 2026-03-02
-- Purpose: Track campaign KPIs, feature usage, and
--          enable automated kaizen improvement cycles
-- ══════════════════════════════════════════════════

-- Campaign metrics table — stores all measurable campaign events
CREATE TABLE IF NOT EXISTS campaign_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_slug TEXT NOT NULL DEFAULT 'meet-aivor',
  metric_type TEXT NOT NULL,  -- 'conversation', 'widget_open', 'feature_usage', 'social_click', 'referral'
  feature_name TEXT,          -- 'events', 'news', 'wellness', 'learning', 'crisis', 'general', 'voice'
  session_id TEXT,
  user_hash TEXT,
  utm_source TEXT,            -- instagram, linkedin, twitter, facebook, newsletter, direct
  utm_medium TEXT,            -- social, email, organic
  utm_campaign TEXT,          -- meet-aivor
  utm_content TEXT,           -- post slug
  metadata JSONB DEFAULT '{}',
  tracked_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for fast campaign queries
CREATE INDEX IF NOT EXISTS idx_campaign_metrics_slug ON campaign_metrics(campaign_slug);
CREATE INDEX IF NOT EXISTS idx_campaign_metrics_type ON campaign_metrics(metric_type);
CREATE INDEX IF NOT EXISTS idx_campaign_metrics_feature ON campaign_metrics(feature_name);
CREATE INDEX IF NOT EXISTS idx_campaign_metrics_tracked ON campaign_metrics(tracked_at);
CREATE INDEX IF NOT EXISTS idx_campaign_metrics_utm ON campaign_metrics(utm_campaign, utm_source);

-- Campaign health snapshots — weekly automated health scores
CREATE TABLE IF NOT EXISTS campaign_health_snapshots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_slug TEXT NOT NULL,
  snapshot_date DATE NOT NULL,
  health_score INTEGER NOT NULL CHECK (health_score >= 0 AND health_score <= 100),
  conversation_growth_rate NUMERIC(5,2),   -- % change vs baseline
  feature_adoption_rate NUMERIC(5,2),      -- % of conversations using features
  social_engagement_rate NUMERIC(5,2),     -- social interaction rate
  referral_traffic_growth NUMERIC(5,2),    -- UTM referral growth %
  total_conversations INTEGER DEFAULT 0,
  total_widget_opens INTEGER DEFAULT 0,
  total_events_queries INTEGER DEFAULT 0,
  total_news_queries INTEGER DEFAULT 0,
  total_wellness_queries INTEGER DEFAULT 0,
  unique_users INTEGER DEFAULT 0,
  recommendation TEXT,                      -- 'continue', 'boost', 'pivot'
  details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(campaign_slug, snapshot_date)
);

-- ══════════════════════════════════════════════════
-- FUNCTION: Classify conversation feature usage
-- Detects which platform feature the user is asking about
-- ══════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION classify_message_feature(p_message TEXT)
RETURNS TEXT AS $$
DECLARE
  lower_msg TEXT := LOWER(p_message);
BEGIN
  -- Events
  IF lower_msg ~ '(event|what.s on|this weekend|next week|happening|gig|party|social|gathering|meet.?up|calendar)' THEN
    RETURN 'events';
  END IF;

  -- News
  IF lower_msg ~ '(news|article|story|stories|update|latest|headline|what.s new|community news|newsletter)' THEN
    RETURN 'news';
  END IF;

  -- Wellness
  IF lower_msg ~ '(wellbeing|wellness|mental health|check.?in|how am i|feeling|stress|anxiety|depression|therapy|counsell|self.?care|journal)' THEN
    RETURN 'wellness';
  END IF;

  -- Learning tools
  IF lower_msg ~ '(learn|study|interview|prep|problem.?solv|conflict|creative|goal|writing|resource|tool)' THEN
    RETURN 'learning';
  END IF;

  -- Crisis
  IF lower_msg ~ '(crisis|suicide|self.?harm|emergency|samaritan|switchboard|mindout|help.?line|urgent|danger)' THEN
    RETURN 'crisis';
  END IF;

  -- Voice
  IF lower_msg ~ '(voice|speak|listen|audio|sound|read aloud|speaker)' THEN
    RETURN 'voice';
  END IF;

  RETURN 'general';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ══════════════════════════════════════════════════
-- FUNCTION: Get campaign health score
-- Calculates overall health based on weighted metrics
-- ══════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION get_campaign_health(p_campaign_slug TEXT DEFAULT 'meet-aivor')
RETURNS TABLE (
  campaign TEXT,
  period_start DATE,
  period_end DATE,
  health_score INTEGER,
  conversations_this_week INTEGER,
  conversations_baseline INTEGER,
  conversation_growth NUMERIC,
  events_queries INTEGER,
  news_queries INTEGER,
  wellness_queries INTEGER,
  unique_users_count INTEGER,
  utm_referrals INTEGER,
  recommendation TEXT
) AS $$
DECLARE
  v_baseline_start DATE := '2026-02-01';
  v_baseline_end DATE := '2026-02-28';
  v_current_start DATE := date_trunc('week', CURRENT_DATE)::DATE;
  v_current_end DATE := CURRENT_DATE;
  v_baseline_weekly_avg INTEGER;
  v_current_convos INTEGER;
  v_events INTEGER;
  v_news INTEGER;
  v_wellness INTEGER;
  v_unique INTEGER;
  v_referrals INTEGER;
  v_growth NUMERIC;
  v_feature_rate NUMERIC;
  v_score INTEGER;
  v_rec TEXT;
BEGIN
  -- Baseline: average weekly conversations in February
  SELECT COALESCE(COUNT(*) / GREATEST(1, EXTRACT(WEEK FROM v_baseline_end) - EXTRACT(WEEK FROM v_baseline_start) + 1), 1)::INTEGER
  INTO v_baseline_weekly_avg
  FROM ivor_feedback
  WHERE created_at >= v_baseline_start AND created_at < v_baseline_end + INTERVAL '1 day';

  -- Current week conversations
  SELECT COUNT(*) INTO v_current_convos
  FROM campaign_metrics
  WHERE campaign_slug = p_campaign_slug
    AND metric_type = 'conversation'
    AND tracked_at >= v_current_start;

  -- Feature queries this week
  SELECT COUNT(*) INTO v_events
  FROM campaign_metrics
  WHERE campaign_slug = p_campaign_slug AND feature_name = 'events'
    AND tracked_at >= v_current_start;

  SELECT COUNT(*) INTO v_news
  FROM campaign_metrics
  WHERE campaign_slug = p_campaign_slug AND feature_name = 'news'
    AND tracked_at >= v_current_start;

  SELECT COUNT(*) INTO v_wellness
  FROM campaign_metrics
  WHERE campaign_slug = p_campaign_slug AND feature_name = 'wellness'
    AND tracked_at >= v_current_start;

  -- Unique users
  SELECT COUNT(DISTINCT user_hash) INTO v_unique
  FROM campaign_metrics
  WHERE campaign_slug = p_campaign_slug
    AND tracked_at >= v_current_start
    AND user_hash IS NOT NULL;

  -- UTM referrals
  SELECT COUNT(*) INTO v_referrals
  FROM campaign_metrics
  WHERE campaign_slug = p_campaign_slug
    AND utm_campaign = 'meet-aivor'
    AND tracked_at >= v_current_start;

  -- Calculate growth
  IF v_baseline_weekly_avg > 0 THEN
    v_growth := ((v_current_convos::NUMERIC / v_baseline_weekly_avg) - 1) * 100;
  ELSE
    v_growth := 0;
  END IF;

  -- Feature adoption rate
  IF v_current_convos > 0 THEN
    v_feature_rate := ((v_events + v_news + v_wellness)::NUMERIC / v_current_convos) * 100;
  ELSE
    v_feature_rate := 0;
  END IF;

  -- Health score (0-100)
  v_score := LEAST(100, GREATEST(0,
    (LEAST(v_growth, 100) * 0.30)::INTEGER +    -- conversation growth (30%)
    (LEAST(v_feature_rate, 100) * 0.30)::INTEGER + -- feature adoption (30%)
    (CASE WHEN v_referrals > 10 THEN 20 WHEN v_referrals > 5 THEN 15 WHEN v_referrals > 0 THEN 10 ELSE 0 END) + -- referral traffic (20%)
    (CASE WHEN v_unique > 50 THEN 20 WHEN v_unique > 20 THEN 15 WHEN v_unique > 5 THEN 10 ELSE 0 END) -- unique users (20%)
  ));

  -- Recommendation
  IF v_score > 70 THEN
    v_rec := 'continue';
  ELSIF v_score > 50 THEN
    v_rec := 'boost';
  ELSE
    v_rec := 'pivot';
  END IF;

  RETURN QUERY SELECT
    p_campaign_slug,
    v_current_start,
    v_current_end,
    v_score,
    v_current_convos,
    v_baseline_weekly_avg,
    v_growth,
    v_events,
    v_news,
    v_wellness,
    v_unique,
    v_referrals,
    v_rec;
END;
$$ LANGUAGE plpgsql;

-- ══════════════════════════════════════════════════
-- FUNCTION: Snapshot campaign health (call weekly)
-- Persists health score for trend tracking
-- ══════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION snapshot_campaign_health(p_campaign_slug TEXT DEFAULT 'meet-aivor')
RETURNS void AS $$
DECLARE
  v_health RECORD;
BEGIN
  SELECT * INTO v_health FROM get_campaign_health(p_campaign_slug);

  INSERT INTO campaign_health_snapshots (
    campaign_slug, snapshot_date, health_score,
    conversation_growth_rate, feature_adoption_rate,
    total_conversations, total_widget_opens,
    total_events_queries, total_news_queries, total_wellness_queries,
    unique_users, recommendation
  ) VALUES (
    p_campaign_slug, CURRENT_DATE, v_health.health_score,
    v_health.conversation_growth, 0,
    v_health.conversations_this_week, 0,
    v_health.events_queries, v_health.news_queries, v_health.wellness_queries,
    v_health.unique_users_count, v_health.recommendation
  )
  ON CONFLICT (campaign_slug, snapshot_date)
  DO UPDATE SET
    health_score = EXCLUDED.health_score,
    conversation_growth_rate = EXCLUDED.conversation_growth_rate,
    total_conversations = EXCLUDED.total_conversations,
    total_events_queries = EXCLUDED.total_events_queries,
    total_news_queries = EXCLUDED.total_news_queries,
    total_wellness_queries = EXCLUDED.total_wellness_queries,
    unique_users = EXCLUDED.unique_users,
    recommendation = EXCLUDED.recommendation;
END;
$$ LANGUAGE plpgsql;

-- ══════════════════════════════════════════════════
-- FUNCTION: Get campaign progress report
-- Shows trajectory toward 100% increase target
-- ══════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION get_campaign_progress(p_campaign_slug TEXT DEFAULT 'meet-aivor')
RETURNS TABLE (
  metric_name TEXT,
  baseline_value INTEGER,
  current_value INTEGER,
  target_value INTEGER,
  progress_pct NUMERIC,
  on_track BOOLEAN
) AS $$
DECLARE
  v_baseline_convos INTEGER;
  v_baseline_events INTEGER;
  v_baseline_news INTEGER;
  v_current_convos INTEGER;
  v_current_events INTEGER;
  v_current_news INTEGER;
BEGIN
  -- Baseline: February daily averages
  SELECT COALESCE(COUNT(*) / 28, 1) INTO v_baseline_convos
  FROM ivor_feedback WHERE created_at >= '2026-02-01' AND created_at < '2026-03-01';

  -- Current: last 7 days daily average
  SELECT COALESCE(COUNT(*) / 7, 0) INTO v_current_convos
  FROM campaign_metrics WHERE metric_type = 'conversation'
    AND tracked_at >= CURRENT_DATE - INTERVAL '7 days';

  SELECT COALESCE(COUNT(*) / 7, 0) INTO v_current_events
  FROM campaign_metrics WHERE feature_name = 'events'
    AND tracked_at >= CURRENT_DATE - INTERVAL '7 days';

  SELECT COALESCE(COUNT(*) / 7, 0) INTO v_current_news
  FROM campaign_metrics WHERE feature_name = 'news'
    AND tracked_at >= CURRENT_DATE - INTERVAL '7 days';

  -- Estimate baseline feature usage (assume 30% events, 20% news of total)
  v_baseline_events := GREATEST(1, (v_baseline_convos * 0.3)::INTEGER);
  v_baseline_news := GREATEST(1, (v_baseline_convos * 0.2)::INTEGER);

  RETURN QUERY
  SELECT 'daily_conversations'::TEXT, v_baseline_convos, v_current_convos, v_baseline_convos * 2,
         CASE WHEN v_baseline_convos > 0 THEN ((v_current_convos::NUMERIC / v_baseline_convos) - 1) * 100 ELSE 0 END,
         v_current_convos >= v_baseline_convos * 2
  UNION ALL
  SELECT 'daily_events_queries', v_baseline_events, v_current_events, v_baseline_events * 2,
         CASE WHEN v_baseline_events > 0 THEN ((v_current_events::NUMERIC / v_baseline_events) - 1) * 100 ELSE 0 END,
         v_current_events >= v_baseline_events * 2
  UNION ALL
  SELECT 'daily_news_queries', v_baseline_news, v_current_news, v_baseline_news * 2,
         CASE WHEN v_baseline_news > 0 THEN ((v_current_news::NUMERIC / v_baseline_news) - 1) * 100 ELSE 0 END,
         v_current_news >= v_baseline_news * 2;
END;
$$ LANGUAGE plpgsql;

-- ══════════════════════════════════════════════════
-- VIEW: Campaign social content performance
-- Links social posts to engagement metrics
-- ══════════════════════════════════════════════════
CREATE OR REPLACE VIEW campaign_social_performance AS
SELECT
  cm.utm_content as post_slug,
  cm.utm_source as platform,
  COUNT(*) as clicks,
  COUNT(DISTINCT cm.user_hash) as unique_visitors,
  MIN(cm.tracked_at) as first_click,
  MAX(cm.tracked_at) as last_click,
  cm.metadata->>'impressions' as impressions,
  cm.metadata->>'engagement_rate' as engagement_rate
FROM campaign_metrics cm
WHERE cm.utm_campaign = 'meet-aivor'
  AND cm.metric_type = 'social_click'
GROUP BY cm.utm_content, cm.utm_source, cm.metadata->>'impressions', cm.metadata->>'engagement_rate';

-- Grant access
GRANT SELECT, INSERT ON campaign_metrics TO authenticated;
GRANT SELECT, INSERT ON campaign_metrics TO anon;
GRANT SELECT ON campaign_health_snapshots TO authenticated;
GRANT SELECT ON campaign_social_performance TO authenticated;
GRANT EXECUTE ON FUNCTION classify_message_feature TO authenticated;
GRANT EXECUTE ON FUNCTION get_campaign_health TO authenticated;
GRANT EXECUTE ON FUNCTION snapshot_campaign_health TO authenticated;
GRANT EXECUTE ON FUNCTION get_campaign_progress TO authenticated;
