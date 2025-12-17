-- Sprint 6: Analytics Dashboard Migration
-- Comprehensive analytics tables for the BLKOUT Liberation Platform

-- Platform-wide analytics aggregation
CREATE TABLE IF NOT EXISTS platform_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL UNIQUE,
  total_users INTEGER DEFAULT 0,
  active_users INTEGER DEFAULT 0,
  new_users INTEGER DEFAULT 0,
  total_events INTEGER DEFAULT 0,
  new_events INTEGER DEFAULT 0,
  total_rsvps INTEGER DEFAULT 0,
  total_check_ins INTEGER DEFAULT 0,
  total_groups INTEGER DEFAULT 0,
  active_groups INTEGER DEFAULT 0,
  liberation_score DECIMAL(5,2) DEFAULT 0,
  community_reach INTEGER DEFAULT 0,
  engagement_rate DECIMAL(5,4) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Event analytics (detailed per-event metrics)
CREATE TABLE IF NOT EXISTS event_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL,
  date DATE NOT NULL,
  views INTEGER DEFAULT 0,
  unique_views INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  saves INTEGER DEFAULT 0,
  rsvps INTEGER DEFAULT 0,
  cancellations INTEGER DEFAULT 0,
  check_ins INTEGER DEFAULT 0,
  no_shows INTEGER DEFAULT 0,
  conversion_rate DECIMAL(5,4) DEFAULT 0,
  engagement_score DECIMAL(5,2) DEFAULT 0,
  liberation_impact DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, date)
);

-- User engagement analytics
CREATE TABLE IF NOT EXISTS user_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  date DATE NOT NULL,
  events_viewed INTEGER DEFAULT 0,
  events_rsvped INTEGER DEFAULT 0,
  events_attended INTEGER DEFAULT 0,
  groups_joined INTEGER DEFAULT 0,
  interactions INTEGER DEFAULT 0,
  liberation_contributions INTEGER DEFAULT 0,
  session_duration INTEGER DEFAULT 0, -- in seconds
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Geographic analytics
CREATE TABLE IF NOT EXISTS geographic_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  region VARCHAR(100) NOT NULL,
  date DATE NOT NULL,
  event_count INTEGER DEFAULT 0,
  attendee_count INTEGER DEFAULT 0,
  group_count INTEGER DEFAULT 0,
  active_organizers INTEGER DEFAULT 0,
  liberation_score DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(region, date)
);

-- Category analytics
CREATE TABLE IF NOT EXISTS category_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category VARCHAR(100) NOT NULL,
  date DATE NOT NULL,
  event_count INTEGER DEFAULT 0,
  total_rsvps INTEGER DEFAULT 0,
  total_attendance INTEGER DEFAULT 0,
  average_rating DECIMAL(3,2) DEFAULT 0,
  liberation_alignment DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(category, date)
);

-- Liberation impact tracking
CREATE TABLE IF NOT EXISTS liberation_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL UNIQUE,
  community_connections INTEGER DEFAULT 0,
  safe_spaces_created INTEGER DEFAULT 0,
  black_queer_events INTEGER DEFAULT 0,
  accessibility_score DECIMAL(5,2) DEFAULT 0,
  inclusion_index DECIMAL(5,2) DEFAULT 0,
  mutual_aid_events INTEGER DEFAULT 0,
  educational_events INTEGER DEFAULT 0,
  wellness_events INTEGER DEFAULT 0,
  cultural_events INTEGER DEFAULT 0,
  advocacy_events INTEGER DEFAULT 0,
  overall_liberation_score DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Analytics reports (saved reports for export)
CREATE TABLE IF NOT EXISTS analytics_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  report_type VARCHAR(50) NOT NULL, -- 'platform', 'event', 'organizer', 'liberation'
  title VARCHAR(255) NOT NULL,
  date_range_start DATE NOT NULL,
  date_range_end DATE NOT NULL,
  filters JSONB DEFAULT '{}',
  data JSONB DEFAULT '{}',
  format VARCHAR(20) DEFAULT 'json', -- 'json', 'csv', 'pdf'
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_platform_analytics_date ON platform_analytics(date);
CREATE INDEX IF NOT EXISTS idx_event_analytics_event_date ON event_analytics(event_id, date);
CREATE INDEX IF NOT EXISTS idx_user_analytics_user_date ON user_analytics(user_id, date);
CREATE INDEX IF NOT EXISTS idx_geographic_analytics_region ON geographic_analytics(region, date);
CREATE INDEX IF NOT EXISTS idx_category_analytics_category ON category_analytics(category, date);
CREATE INDEX IF NOT EXISTS idx_liberation_metrics_date ON liberation_metrics(date);
CREATE INDEX IF NOT EXISTS idx_analytics_reports_user ON analytics_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_reports_type ON analytics_reports(report_type);

-- Enable RLS
ALTER TABLE platform_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE geographic_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE category_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE liberation_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Platform analytics readable by admins
CREATE POLICY "Admins can read platform analytics" ON platform_analytics
  FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

-- Event analytics readable by event organizers
CREATE POLICY "Organizers can read their event analytics" ON event_analytics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM events e
      WHERE e.id = event_analytics.event_id
      AND e.organizer_id = auth.uid()
    )
  );

-- Users can read their own analytics
CREATE POLICY "Users can read own analytics" ON user_analytics
  FOR SELECT USING (user_id = auth.uid());

-- Geographic and category analytics public read
CREATE POLICY "Public read geographic analytics" ON geographic_analytics
  FOR SELECT USING (true);

CREATE POLICY "Public read category analytics" ON category_analytics
  FOR SELECT USING (true);

-- Liberation metrics public read (transparency)
CREATE POLICY "Public read liberation metrics" ON liberation_metrics
  FOR SELECT USING (true);

-- Users can manage their own reports
CREATE POLICY "Users can manage own reports" ON analytics_reports
  FOR ALL USING (user_id = auth.uid());

-- Function to aggregate daily platform analytics
CREATE OR REPLACE FUNCTION aggregate_daily_platform_analytics()
RETURNS void AS $$
BEGIN
  INSERT INTO platform_analytics (
    date,
    total_events,
    total_rsvps,
    total_check_ins,
    liberation_score
  )
  SELECT
    CURRENT_DATE,
    COUNT(DISTINCT e.id),
    COALESCE(SUM(e.rsvp_count), 0),
    COALESCE(SUM(e.check_in_count), 0),
    COALESCE(AVG(ea.liberation_impact), 0)
  FROM events e
  LEFT JOIN event_analytics ea ON e.id = ea.event_id
  ON CONFLICT (date) DO UPDATE SET
    total_events = EXCLUDED.total_events,
    total_rsvps = EXCLUDED.total_rsvps,
    total_check_ins = EXCLUDED.total_check_ins,
    liberation_score = EXCLUDED.liberation_score;
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE platform_analytics IS 'Daily aggregated platform-wide analytics';
COMMENT ON TABLE event_analytics IS 'Per-event daily analytics and metrics';
COMMENT ON TABLE user_analytics IS 'Per-user daily engagement analytics';
COMMENT ON TABLE geographic_analytics IS 'Regional analytics by date';
COMMENT ON TABLE category_analytics IS 'Event category analytics by date';
COMMENT ON TABLE liberation_metrics IS 'Liberation impact tracking metrics';
COMMENT ON TABLE analytics_reports IS 'Saved analytics reports for export';
