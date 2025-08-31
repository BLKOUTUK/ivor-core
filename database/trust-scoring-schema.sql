-- Trust Scoring Database Schema
-- Supabase SQL migration for IVOR trust scoring system

-- Add trust score column to existing knowledge entries
ALTER TABLE IF EXISTS knowledge_entries ADD COLUMN IF NOT EXISTS trust_score DECIMAL(3,2) DEFAULT 0.5;
ALTER TABLE IF EXISTS knowledge_entries ADD COLUMN IF NOT EXISTS trust_last_calculated TIMESTAMP DEFAULT NOW();

-- Create knowledge trust scores table for detailed tracking
CREATE TABLE IF NOT EXISTS knowledge_trust_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    knowledge_entry_id UUID REFERENCES knowledge_entries(id) ON DELETE CASCADE,
    source_score DECIMAL(3,2) NOT NULL DEFAULT 0.5,
    recency_score DECIMAL(3,2) NOT NULL DEFAULT 0.5,
    verification_score DECIMAL(3,2) NOT NULL DEFAULT 0.5,
    community_score DECIMAL(3,2) DEFAULT NULL,
    final_score DECIMAL(3,2) NOT NULL DEFAULT 0.5,
    url_validation_status JSONB DEFAULT '{}', -- Store URL validation results
    last_calculated TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create community ratings table
CREATE TABLE IF NOT EXISTS knowledge_ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    knowledge_entry_id UUID REFERENCES knowledge_entries(id) ON DELETE CASCADE,
    user_hash VARCHAR(64) NOT NULL, -- Anonymous user identifier (hashed IP + user agent)
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    feedback_text TEXT,
    helpful_votes INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    
    -- Prevent duplicate ratings from same user hash within 24 hours
    CONSTRAINT unique_user_rating_per_day UNIQUE (knowledge_entry_id, user_hash, DATE(created_at))
);

-- Create resource trust scores table  
CREATE TABLE IF NOT EXISTS resource_trust_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resource_id VARCHAR(255) NOT NULL, -- References UKResource.id
    trust_score DECIMAL(3,2) NOT NULL DEFAULT 0.5,
    url_validation_status BOOLEAN DEFAULT NULL,
    last_validated TIMESTAMP DEFAULT NOW(),
    validation_error TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create URL validation cache table
CREATE TABLE IF NOT EXISTS url_validation_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    url TEXT NOT NULL UNIQUE,
    is_valid BOOLEAN NOT NULL,
    status_code INTEGER,
    error_message TEXT,
    last_checked TIMESTAMP DEFAULT NOW(),
    check_count INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create feedback responses table for collecting user responses to IVOR
CREATE TABLE IF NOT EXISTS ivor_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id VARCHAR(255),
    user_hash VARCHAR(64), -- Anonymous identifier
    user_input TEXT NOT NULL,
    ivor_response TEXT NOT NULL,
    journey_stage VARCHAR(50),
    trust_score DECIMAL(3,2),
    user_rating INTEGER CHECK (user_rating BETWEEN 1 AND 5),
    feedback_text TEXT,
    resources_provided JSONB DEFAULT '[]',
    helpful BOOLEAN DEFAULT NULL,
    response_time_ms INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_knowledge_trust_scores_entry_id ON knowledge_trust_scores(knowledge_entry_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_ratings_entry_id ON knowledge_ratings(knowledge_entry_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_ratings_created_at ON knowledge_ratings(created_at);
CREATE INDEX IF NOT EXISTS idx_resource_trust_scores_resource_id ON resource_trust_scores(resource_id);
CREATE INDEX IF NOT EXISTS idx_url_validation_cache_url ON url_validation_cache(url);
CREATE INDEX IF NOT EXISTS idx_url_validation_cache_last_checked ON url_validation_cache(last_checked);
CREATE INDEX IF NOT EXISTS idx_ivor_feedback_session_id ON ivor_feedback(session_id);
CREATE INDEX IF NOT EXISTS idx_ivor_feedback_user_hash ON ivor_feedback(user_hash);
CREATE INDEX IF NOT EXISTS idx_ivor_feedback_journey_stage ON ivor_feedback(journey_stage);
CREATE INDEX IF NOT EXISTS idx_ivor_feedback_created_at ON ivor_feedback(created_at);

-- Create view for aggregated trust metrics
CREATE OR REPLACE VIEW knowledge_trust_summary AS
SELECT 
    ke.id,
    ke.title,
    ke.category,
    ke.trust_score,
    ke.trust_last_calculated,
    COALESCE(AVG(kr.rating), 0) as avg_community_rating,
    COUNT(kr.id) as total_ratings,
    kts.source_score,
    kts.recency_score,
    kts.verification_score,
    kts.final_score as detailed_trust_score
FROM knowledge_entries ke
LEFT JOIN knowledge_ratings kr ON ke.id = kr.knowledge_entry_id
LEFT JOIN knowledge_trust_scores kts ON ke.id = kts.knowledge_entry_id
GROUP BY ke.id, ke.title, ke.category, ke.trust_score, ke.trust_last_calculated, 
         kts.source_score, kts.recency_score, kts.verification_score, kts.final_score;

-- Create view for system health monitoring
CREATE OR REPLACE VIEW trust_system_health AS
SELECT 
    'knowledge_entries' as table_name,
    COUNT(*) as total_records,
    AVG(trust_score) as avg_trust_score,
    COUNT(CASE WHEN trust_score >= 0.8 THEN 1 END) as high_trust_count,
    COUNT(CASE WHEN trust_score < 0.4 THEN 1 END) as low_trust_count
FROM knowledge_entries
UNION ALL
SELECT 
    'community_ratings' as table_name,
    COUNT(*) as total_records,
    AVG(rating) as avg_rating,
    COUNT(CASE WHEN rating >= 4 THEN 1 END) as positive_ratings,
    COUNT(CASE WHEN rating <= 2 THEN 1 END) as negative_ratings
FROM knowledge_ratings
UNION ALL
SELECT 
    'url_validation_cache' as table_name,
    COUNT(*) as total_records,
    AVG(CASE WHEN is_valid THEN 1.0 ELSE 0.0 END) as url_success_rate,
    COUNT(CASE WHEN is_valid THEN 1 END) as valid_urls,
    COUNT(CASE WHEN NOT is_valid THEN 1 END) as invalid_urls
FROM url_validation_cache;

-- Enable Row Level Security (RLS) for privacy
ALTER TABLE knowledge_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE ivor_feedback ENABLE ROW LEVEL SECURITY;

-- Create policies for anonymous access to ratings
CREATE POLICY IF NOT EXISTS "Allow anonymous rating insert" ON knowledge_ratings
    FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Allow anonymous rating read" ON knowledge_ratings
    FOR SELECT TO anon USING (true);

CREATE POLICY IF NOT EXISTS "Allow anonymous feedback insert" ON ivor_feedback
    FOR INSERT TO anon WITH CHECK (true);

-- Create function to update trust scores
CREATE OR REPLACE FUNCTION update_knowledge_trust_score(entry_id UUID)
RETURNS DECIMAL(3,2)
LANGUAGE plpgsql
AS $$
DECLARE
    new_trust_score DECIMAL(3,2);
    avg_rating DECIMAL(3,2);
BEGIN
    -- Calculate average community rating
    SELECT COALESCE(AVG(rating), 0) / 5.0 INTO avg_rating
    FROM knowledge_ratings 
    WHERE knowledge_entry_id = entry_id;
    
    -- Simple trust score calculation (will be enhanced by TrustScoreService)
    new_trust_score := LEAST(GREATEST(0.5 + (avg_rating * 0.3), 0.0), 1.0);
    
    -- Update the knowledge entry
    UPDATE knowledge_entries 
    SET trust_score = new_trust_score, 
        trust_last_calculated = NOW()
    WHERE id = entry_id;
    
    RETURN new_trust_score;
END;
$$;

-- Create trigger to update trust scores when ratings change
CREATE OR REPLACE FUNCTION trigger_update_trust_score()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    PERFORM update_knowledge_trust_score(
        CASE 
            WHEN TG_OP = 'DELETE' THEN OLD.knowledge_entry_id
            ELSE NEW.knowledge_entry_id
        END
    );
    RETURN NULL;
END;
$$;

CREATE TRIGGER IF NOT EXISTS update_trust_score_on_rating
    AFTER INSERT OR UPDATE OR DELETE ON knowledge_ratings
    FOR EACH ROW
    EXECUTE FUNCTION trigger_update_trust_score();

-- Insert some test data if knowledge_entries table exists and is empty
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'knowledge_entries') THEN
        IF NOT EXISTS (SELECT 1 FROM knowledge_entries LIMIT 1) THEN
            -- Insert test knowledge entry for validation
            INSERT INTO knowledge_entries (
                id, title, content, category, journey_stages, location, tags, 
                sources, last_updated, verification_status, community_validated, trust_score
            ) VALUES (
                gen_random_uuid(),
                'Test Trust Scoring Entry',
                'This is a test entry for validating the trust scoring system.',
                'System Test',
                ARRAY['growth']::text[],
                ARRAY['unknown']::text[],
                ARRAY['test', 'validation']::text[],
                ARRAY['https://nhs.uk', 'https://example.com']::text[],
                NOW(),
                'verified',
                true,
                0.5
            );
        END IF;
    END IF;
END $$;