-- Social Media Management Database Schema for BLKOUT
-- This schema supports N8N workflow integration and social media automation

-- N8N Workflow Status Tracking
CREATE TABLE IF NOT EXISTS n8n_workflow_status (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id TEXT NOT NULL,
    workflow_name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'unknown', -- running, completed, failed, error, unknown
    execution_id TEXT,
    data JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Index for fast lookups
    UNIQUE(workflow_id)
);

-- Social Media Content Calendar
CREATE TABLE IF NOT EXISTS social_content_calendar (
    id TEXT PRIMARY KEY, -- content_YYYYMMDD_random or emergency_platform_timestamp
    date DATE NOT NULL,
    platform TEXT NOT NULL, -- linkedin, twitter, instagram, youtube, buffer
    content_type TEXT DEFAULT 'post', -- post, story, video, carousel
    text_content TEXT NOT NULL,
    image_url TEXT,
    video_url TEXT,
    scheduled_time TIMESTAMPTZ,
    status TEXT DEFAULT 'ready', -- ready, posting, posted, failed, cancelled
    post_id TEXT, -- Platform-specific post ID after posting
    post_url TEXT, -- Direct link to published post
    urgent BOOLEAN DEFAULT FALSE,
    ai_generated BOOLEAN DEFAULT TRUE,
    
    -- AI Generation metadata
    image_prompt TEXT,
    content_prompt TEXT,
    generation_model TEXT DEFAULT 'gpt-4',
    
    -- Posting metadata
    post_status TEXT, -- posted, failed, pending
    post_error TEXT,
    posted_at TIMESTAMPTZ,
    
    -- Engagement metrics (updated via webhooks)
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    shares_count INTEGER DEFAULT 0,
    engagement_rate DECIMAL(5,2) DEFAULT 0.00,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Social Media Posting Log (for analytics and debugging)
CREATE TABLE IF NOT EXISTS social_posting_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_id TEXT REFERENCES social_content_calendar(id),
    platform TEXT NOT NULL,
    status TEXT NOT NULL, -- posted, failed, retrying
    post_id TEXT,
    post_url TEXT,
    error_message TEXT,
    metrics JSONB DEFAULT '{}',
    n8n_execution_id TEXT,
    
    posted_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Index for analytics queries
    INDEX idx_posting_log_platform_date ON social_posting_log(platform, posted_at),
    INDEX idx_posting_log_status ON social_posting_log(status)
);

-- Social Media Platform Configurations
CREATE TABLE IF NOT EXISTS social_platform_config (
    platform TEXT PRIMARY KEY,
    is_active BOOLEAN DEFAULT TRUE,
    api_status TEXT DEFAULT 'unknown', -- connected, disconnected, error
    last_post_at TIMESTAMPTZ,
    daily_post_limit INTEGER DEFAULT 10,
    current_daily_posts INTEGER DEFAULT 0,
    
    -- Platform-specific settings
    config JSONB DEFAULT '{}',
    
    -- OAuth tokens and credentials (encrypted)
    access_token_encrypted TEXT,
    refresh_token_encrypted TEXT,
    expires_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Social Media Analytics Summary
CREATE TABLE IF NOT EXISTS social_analytics_summary (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL,
    platform TEXT NOT NULL,
    
    -- Daily metrics
    posts_count INTEGER DEFAULT 0,
    total_likes INTEGER DEFAULT 0,
    total_comments INTEGER DEFAULT 0,
    total_shares INTEGER DEFAULT 0,
    total_impressions INTEGER DEFAULT 0,
    
    -- Calculated metrics
    avg_engagement_rate DECIMAL(5,2) DEFAULT 0.00,
    best_performing_post_id TEXT,
    worst_performing_post_id TEXT,
    
    -- Error tracking
    failed_posts_count INTEGER DEFAULT 0,
    error_rate DECIMAL(5,2) DEFAULT 0.00,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Unique constraint for daily summaries
    UNIQUE(date, platform)
);

-- N8N Webhook Logs (for debugging webhook issues)
CREATE TABLE IF NOT EXISTS n8n_webhook_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    webhook_type TEXT NOT NULL, -- status, content, posting
    workflow_id TEXT,
    payload JSONB NOT NULL,
    processing_status TEXT DEFAULT 'processed', -- processed, failed, ignored
    error_message TEXT,
    
    received_at TIMESTAMPTZ DEFAULT NOW(),
    processed_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Index for debugging
    INDEX idx_webhook_logs_type_date ON n8n_webhook_logs(webhook_type, received_at),
    INDEX idx_webhook_logs_workflow ON n8n_webhook_logs(workflow_id)
);

-- Insert default platform configurations
INSERT INTO social_platform_config (platform, is_active, daily_post_limit, config) VALUES
    ('linkedin', TRUE, 5, '{"best_times": ["10:00", "14:00"], "character_limit": 3000, "supports_images": true}'),
    ('twitter', TRUE, 10, '{"best_times": ["12:00", "16:00", "20:00"], "character_limit": 280, "supports_images": true}'),
    ('instagram', TRUE, 8, '{"best_times": ["18:00", "21:00"], "character_limit": 2200, "supports_images": true, "supports_video": true}'),
    ('youtube', TRUE, 3, '{"best_times": ["14:00", "19:00"], "character_limit": 5000, "supports_video": true}'),
    ('buffer', TRUE, 15, '{"aggregator": true, "supports_scheduling": true}')
ON CONFLICT (platform) DO NOTHING;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_content_calendar_date_platform ON social_content_calendar(date, platform);
CREATE INDEX IF NOT EXISTS idx_content_calendar_status ON social_content_calendar(status);
CREATE INDEX IF NOT EXISTS idx_content_calendar_scheduled_time ON social_content_calendar(scheduled_time);
CREATE INDEX IF NOT EXISTS idx_workflow_status_updated ON n8n_workflow_status(updated_at);

-- Create update timestamp triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update triggers
CREATE TRIGGER update_workflow_status_updated_at BEFORE UPDATE ON n8n_workflow_status 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_content_calendar_updated_at BEFORE UPDATE ON social_content_calendar 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_platform_config_updated_at BEFORE UPDATE ON social_platform_config 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS) for admin-only access
ALTER TABLE n8n_workflow_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_content_calendar ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_posting_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_platform_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_analytics_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE n8n_webhook_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (allow all for service role, restrict for others)
CREATE POLICY "Allow service role full access" ON n8n_workflow_status 
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Allow service role full access" ON social_content_calendar 
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Allow service role full access" ON social_posting_log 
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Allow service role full access" ON social_platform_config 
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Allow service role full access" ON social_analytics_summary 
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Allow service role full access" ON n8n_webhook_logs 
    FOR ALL USING (auth.role() = 'service_role');

-- Create a view for dashboard summary
CREATE OR REPLACE VIEW social_dashboard_summary AS
SELECT 
    -- Today's posting activity
    COUNT(CASE WHEN sc.date = CURRENT_DATE THEN 1 END) as posts_today,
    COUNT(CASE WHEN sc.date = CURRENT_DATE AND sc.status = 'posted' THEN 1 END) as successful_posts_today,
    COUNT(CASE WHEN sc.date = CURRENT_DATE AND sc.status = 'failed' THEN 1 END) as failed_posts_today,
    
    -- Overall stats
    COUNT(*) as total_posts,
    COUNT(CASE WHEN sc.status = 'posted' THEN 1 END) as total_successful_posts,
    COUNT(CASE WHEN sc.status = 'failed' THEN 1 END) as total_failed_posts,
    
    -- Platform breakdown
    COUNT(CASE WHEN sc.platform = 'linkedin' THEN 1 END) as linkedin_posts,
    COUNT(CASE WHEN sc.platform = 'twitter' THEN 1 END) as twitter_posts,
    COUNT(CASE WHEN sc.platform = 'instagram' THEN 1 END) as instagram_posts,
    COUNT(CASE WHEN sc.platform = 'youtube' THEN 1 END) as youtube_posts,
    
    -- Last activity
    MAX(sc.updated_at) as last_activity
FROM social_content_calendar sc;

COMMENT ON TABLE n8n_workflow_status IS 'Tracks the status of N8N workflows for real-time monitoring';
COMMENT ON TABLE social_content_calendar IS 'Master content calendar with AI-generated posts and scheduling';
COMMENT ON TABLE social_posting_log IS 'Detailed log of all posting attempts for analytics and debugging';
COMMENT ON TABLE social_platform_config IS 'Configuration and status for each social media platform';
COMMENT ON TABLE social_analytics_summary IS 'Daily analytics summaries for performance tracking';
COMMENT ON TABLE n8n_webhook_logs IS 'Raw webhook logs from N8N for debugging and monitoring';
COMMENT ON VIEW social_dashboard_summary IS 'Real-time dashboard summary for admin panel';