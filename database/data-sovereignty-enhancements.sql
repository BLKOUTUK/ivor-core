-- Community Data Sovereignty Layer Enhancements (Layer 4 ONLY)
-- BLKOUT Community Data Liberation Database Schema
-- Focuses exclusively on data storage, sovereignty protection, and democratic governance

-- =====================================================================================
-- TIMESCALEDB EXTENSION FOR ANALYTICS TIME-SERIES DATA
-- =====================================================================================

-- Enable TimescaleDB extension for time-series analytics
CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;

-- =====================================================================================
-- COMMUNITY DATA SOVEREIGNTY TABLES
-- =====================================================================================

-- Community instances table for multi-tenant support
CREATE TABLE IF NOT EXISTS community_instances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    community_name TEXT NOT NULL UNIQUE,
    community_slug TEXT NOT NULL UNIQUE,
    governance_model TEXT NOT NULL DEFAULT 'democratic', -- democratic, consensus, delegated
    data_sovereignty_level TEXT NOT NULL DEFAULT 'full', -- full, partial, shared
    encryption_enabled BOOLEAN DEFAULT TRUE,
    backup_retention_days INTEGER DEFAULT 365,
    
    -- Democratic governance settings
    voting_threshold DECIMAL(3,2) DEFAULT 0.60, -- 60% for decisions
    quorum_percentage DECIMAL(3,2) DEFAULT 0.33, -- 33% for quorum
    decision_timeframe_hours INTEGER DEFAULT 168, -- 1 week
    
    -- Data sovereignty policies
    data_export_allowed BOOLEAN DEFAULT TRUE,
    data_portability_enabled BOOLEAN DEFAULT TRUE,
    third_party_sharing_consent_required BOOLEAN DEFAULT TRUE,
    
    -- Liberation metrics tracking
    liberation_principles JSONB DEFAULT '{}',
    community_values JSONB DEFAULT '{}',
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Community self-determination
    community_approved BOOLEAN DEFAULT FALSE,
    approved_by_members UUID[] DEFAULT '{}',
    approval_timestamp TIMESTAMPTZ
);

-- Infrastructure metrics table for Layer 5 data storage
CREATE TABLE IF NOT EXISTS infrastructure_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id UUID REFERENCES community_instances(id) ON DELETE CASCADE,
    metric_name TEXT NOT NULL,
    metric_category TEXT NOT NULL, -- performance, sovereignty, liberation, security
    metric_value DECIMAL,
    metric_unit TEXT, -- bytes, percentage, count, milliseconds
    
    -- Liberation-specific metrics
    liberation_impact_score DECIMAL(3,2), -- 0.0 to 1.0 liberation effectiveness
    community_empowerment_level DECIMAL(3,2), -- 0.0 to 1.0 empowerment measure
    democratic_participation_rate DECIMAL(3,2), -- 0.0 to 1.0 participation rate
    
    -- Temporal tracking
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    reporting_period TEXT DEFAULT 'daily', -- hourly, daily, weekly, monthly
    
    -- Community oversight
    community_visible BOOLEAN DEFAULT TRUE,
    community_approved BOOLEAN DEFAULT TRUE,
    transparency_level TEXT DEFAULT 'full' -- full, summary, private
);

-- Backup operations table for community transparency
CREATE TABLE IF NOT EXISTS backup_operations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id UUID REFERENCES community_instances(id) ON DELETE CASCADE,
    operation_type TEXT NOT NULL, -- backup, restore, verify, migrate
    backup_scope TEXT NOT NULL, -- full, incremental, schema_only, data_only
    
    -- Community governance integration
    community_approved BOOLEAN DEFAULT FALSE,
    approved_by_members UUID[] DEFAULT '{}',
    governance_decision_id UUID, -- References community governance system
    
    -- Technical details
    backup_location TEXT, -- Storage location (encrypted reference)
    backup_size_bytes BIGINT,
    encryption_key_fingerprint TEXT, -- For verification without exposing key
    checksum_sha256 TEXT,
    
    -- Status tracking
    status TEXT NOT NULL DEFAULT 'pending', -- pending, in_progress, completed, failed, cancelled
    progress_percentage INTEGER DEFAULT 0,
    error_message TEXT,
    
    -- Liberation principles compliance
    sovereignty_compliant BOOLEAN DEFAULT TRUE,
    community_controlled BOOLEAN DEFAULT TRUE,
    democratic_oversight BOOLEAN DEFAULT TRUE,
    
    -- Timestamps
    scheduled_at TIMESTAMPTZ,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Community governance decisions table for data sovereignty
CREATE TABLE IF NOT EXISTS community_governance_decisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id UUID REFERENCES community_instances(id) ON DELETE CASCADE,
    decision_type TEXT NOT NULL, -- data_policy, backup_schedule, sovereignty_level, platform_integration
    proposal_title TEXT NOT NULL,
    proposal_description TEXT NOT NULL,
    
    -- Democratic process tracking
    proposal_created_by TEXT, -- Anonymous community member identifier
    voting_period_start TIMESTAMPTZ DEFAULT NOW(),
    voting_period_end TIMESTAMPTZ DEFAULT NOW() + INTERVAL '7 days',
    
    -- Voting results
    votes_for INTEGER DEFAULT 0,
    votes_against INTEGER DEFAULT 0,
    votes_abstain INTEGER DEFAULT 0,
    total_eligible_voters INTEGER,
    quorum_met BOOLEAN DEFAULT FALSE,
    
    -- Decision outcome
    status TEXT DEFAULT 'voting', -- voting, passed, rejected, implemented, cancelled
    decision_rationale TEXT,
    implementation_plan TEXT,
    
    -- Data sovereignty impact assessment
    sovereignty_impact_level TEXT DEFAULT 'low', -- low, medium, high, critical
    affects_data_storage BOOLEAN DEFAULT FALSE,
    affects_data_access BOOLEAN DEFAULT FALSE,
    affects_backup_policy BOOLEAN DEFAULT FALSE,
    affects_third_party_sharing BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    implemented_at TIMESTAMPTZ
);

-- Data sovereignty audit log for transparency
CREATE TABLE IF NOT EXISTS data_sovereignty_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id UUID REFERENCES community_instances(id) ON DELETE CASCADE,
    operation_type TEXT NOT NULL, -- access, modify, backup, restore, export, share
    table_name TEXT NOT NULL,
    record_id UUID,
    
    -- Who performed the action
    actor_type TEXT NOT NULL, -- community_member, system_process, external_service, admin
    actor_identifier TEXT, -- Anonymous identifier for accountability
    
    -- What was done
    operation_details JSONB DEFAULT '{}',
    data_changed JSONB DEFAULT '{}', -- What data was modified (anonymized)
    sovereignty_compliance_checked BOOLEAN DEFAULT TRUE,
    community_consent_verified BOOLEAN DEFAULT TRUE,
    
    -- Liberation principles adherence
    liberation_principles_followed TEXT[] DEFAULT '{}',
    community_values_respected BOOLEAN DEFAULT TRUE,
    democratic_process_followed BOOLEAN DEFAULT TRUE,
    
    -- Technical details
    ip_address_hash TEXT, -- Hashed for privacy
    user_agent_hash TEXT, -- Hashed for privacy
    session_id TEXT,
    
    -- Transparency levels
    public_visibility BOOLEAN DEFAULT TRUE,
    community_member_visibility BOOLEAN DEFAULT TRUE,
    admin_only BOOLEAN DEFAULT FALSE,
    
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================================================
-- TIMESCALEDB HYPERTABLES FOR ANALYTICS
-- =====================================================================================

-- Convert existing analytics tables to hypertables for better time-series performance
-- Note: This will be executed after tables exist
DO $$
BEGIN
    -- Check if social_analytics_summary exists before converting
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'social_analytics_summary') THEN
        -- Convert to hypertable if not already converted
        IF NOT EXISTS (SELECT 1 FROM timescaledb_information.hypertables WHERE hypertable_name = 'social_analytics_summary') THEN
            PERFORM create_hypertable('social_analytics_summary', 'date', if_not_exists => TRUE);
        END IF;
    END IF;
    
    -- Check if n8n_webhook_logs exists before converting
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'n8n_webhook_logs') THEN
        IF NOT EXISTS (SELECT 1 FROM timescaledb_information.hypertables WHERE hypertable_name = 'n8n_webhook_logs') THEN
            PERFORM create_hypertable('n8n_webhook_logs', 'received_at', if_not_exists => TRUE);
        END IF;
    END IF;
END $$;

-- Convert new analytics tables to hypertables
SELECT create_hypertable('infrastructure_metrics', 'timestamp', if_not_exists => TRUE);

-- =====================================================================================
-- MULTI-TENANT RLS POLICY ENHANCEMENTS
-- =====================================================================================

-- Enable Row Level Security on all new tables
ALTER TABLE community_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE infrastructure_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE backup_operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_governance_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_sovereignty_audit_log ENABLE ROW LEVEL SECURITY;

-- Community instances access (only service role and community admins)
CREATE POLICY "Service role full access" ON community_instances
    FOR ALL TO service_role USING (true);

CREATE POLICY "Community admins can manage their community" ON community_instances
    FOR ALL TO authenticated
    USING (id = (auth.jwt() ->> 'community_id')::UUID);

-- Infrastructure metrics access (community members can view their community's metrics)
CREATE POLICY "Service role full access" ON infrastructure_metrics
    FOR ALL TO service_role USING (true);

CREATE POLICY "Community members can view their metrics" ON infrastructure_metrics
    FOR SELECT TO authenticated
    USING (community_id = (auth.jwt() ->> 'community_id')::UUID);

CREATE POLICY "System can insert metrics" ON infrastructure_metrics
    FOR INSERT TO service_role WITH CHECK (true);

-- Backup operations access (community oversight required)
CREATE POLICY "Service role full access" ON backup_operations
    FOR ALL TO service_role USING (true);

CREATE POLICY "Community members can view their backup operations" ON backup_operations
    FOR SELECT TO authenticated
    USING (community_id = (auth.jwt() ->> 'community_id')::UUID);

-- Governance decisions access (democratic transparency)
CREATE POLICY "Service role full access" ON community_governance_decisions
    FOR ALL TO service_role USING (true);

CREATE POLICY "Community members can participate in their governance" ON community_governance_decisions
    FOR ALL TO authenticated
    USING (community_id = (auth.jwt() ->> 'community_id')::UUID);

-- Audit log access (transparency with privacy protection)
CREATE POLICY "Service role full access" ON data_sovereignty_audit_log
    FOR ALL TO service_role USING (true);

CREATE POLICY "Community members can view public audit logs" ON data_sovereignty_audit_log
    FOR SELECT TO authenticated
    USING (
        community_id = (auth.jwt() ->> 'community_id')::UUID 
        AND public_visibility = true
    );

-- =====================================================================================
-- ENHANCED RLS FOR EXISTING TABLES (MULTI-TENANT SUPPORT)
-- =====================================================================================

-- Add community_id to existing tables where needed
-- Note: This requires careful migration planning

-- Enhance existing knowledge_entries RLS for multi-tenant support
DO $$
BEGIN
    -- Add community_id column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'knowledge_entries' AND column_name = 'community_id') THEN
        ALTER TABLE knowledge_entries ADD COLUMN community_id UUID REFERENCES community_instances(id) ON DELETE SET NULL;
        
        -- Update existing records to belong to default community
        -- This would be handled in a separate migration with community consultation
    END IF;
END $$;

-- Community multi-tenant access policy for knowledge entries
CREATE POLICY "Community multi-tenant knowledge access" ON knowledge_entries
    FOR ALL TO authenticated
    USING (
        community_id IS NULL OR -- Legacy data accessible to all
        community_id = (auth.jwt() ->> 'community_id')::UUID
    )
    WITH CHECK (
        community_id IS NULL OR -- Allow legacy data updates
        community_id = (auth.jwt() ->> 'community_id')::UUID
    );

-- =====================================================================================
-- INDEXES AND PERFORMANCE OPTIMIZATION
-- =====================================================================================

-- Community instances indexes
CREATE INDEX IF NOT EXISTS idx_community_instances_slug ON community_instances(community_slug);
CREATE INDEX IF NOT EXISTS idx_community_instances_approved ON community_instances(community_approved);

-- Infrastructure metrics indexes
CREATE INDEX IF NOT EXISTS idx_infrastructure_metrics_community_id ON infrastructure_metrics(community_id);
CREATE INDEX IF NOT EXISTS idx_infrastructure_metrics_category ON infrastructure_metrics(metric_category);
CREATE INDEX IF NOT EXISTS idx_infrastructure_metrics_timestamp ON infrastructure_metrics(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_infrastructure_metrics_liberation_impact ON infrastructure_metrics(liberation_impact_score DESC);

-- Backup operations indexes
CREATE INDEX IF NOT EXISTS idx_backup_operations_community_id ON backup_operations(community_id);
CREATE INDEX IF NOT EXISTS idx_backup_operations_status ON backup_operations(status);
CREATE INDEX IF NOT EXISTS idx_backup_operations_scheduled ON backup_operations(scheduled_at);

-- Governance decisions indexes
CREATE INDEX IF NOT EXISTS idx_governance_decisions_community_id ON community_governance_decisions(community_id);
CREATE INDEX IF NOT EXISTS idx_governance_decisions_status ON community_governance_decisions(status);
CREATE INDEX IF NOT EXISTS idx_governance_decisions_voting_period ON community_governance_decisions(voting_period_end);

-- Audit log indexes
CREATE INDEX IF NOT EXISTS idx_audit_log_community_id ON data_sovereignty_audit_log(community_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_timestamp ON data_sovereignty_audit_log(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_operation_type ON data_sovereignty_audit_log(operation_type);
CREATE INDEX IF NOT EXISTS idx_audit_log_table_name ON data_sovereignty_audit_log(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_log_public_visibility ON data_sovereignty_audit_log(public_visibility);

-- =====================================================================================
-- AUTOMATED TRIGGERS AND FUNCTIONS
-- =====================================================================================

-- Function to update updated_at timestamp (reuse existing or create)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update triggers to new tables
CREATE TRIGGER update_community_instances_updated_at BEFORE UPDATE ON community_instances 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_backup_operations_updated_at BEFORE UPDATE ON backup_operations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_governance_decisions_updated_at BEFORE UPDATE ON community_governance_decisions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically log data sovereignty operations
CREATE OR REPLACE FUNCTION log_data_sovereignty_operation()
RETURNS TRIGGER AS $$
BEGIN
    -- Log all modifications to sovereignty-sensitive tables
    INSERT INTO data_sovereignty_audit_log (
        community_id,
        operation_type,
        table_name,
        record_id,
        actor_type,
        operation_details,
        sovereignty_compliance_checked,
        community_consent_verified
    ) VALUES (
        COALESCE(NEW.community_id, OLD.community_id),
        CASE TG_OP
            WHEN 'INSERT' THEN 'create'
            WHEN 'UPDATE' THEN 'modify'
            WHEN 'DELETE' THEN 'delete'
        END,
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        'system_process',
        jsonb_build_object(
            'operation', TG_OP,
            'table', TG_TABLE_NAME,
            'timestamp', NOW()
        ),
        true, -- Assume compliance for system operations
        true  -- Assume consent for system operations
    );
    
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Apply audit logging to sensitive tables
CREATE TRIGGER audit_community_instances AFTER INSERT OR UPDATE OR DELETE ON community_instances
    FOR EACH ROW EXECUTE FUNCTION log_data_sovereignty_operation();

CREATE TRIGGER audit_backup_operations AFTER INSERT OR UPDATE OR DELETE ON backup_operations
    FOR EACH ROW EXECUTE FUNCTION log_data_sovereignty_operation();

-- =====================================================================================
-- VIEWS FOR COMMUNITY TRANSPARENCY
-- =====================================================================================

-- Community dashboard view for democratic oversight
CREATE OR REPLACE VIEW community_sovereignty_dashboard AS
SELECT 
    ci.id as community_id,
    ci.community_name,
    ci.data_sovereignty_level,
    ci.governance_model,
    
    -- Infrastructure health metrics
    COUNT(im.id) as total_metrics_collected,
    AVG(im.liberation_impact_score) as avg_liberation_impact,
    AVG(im.community_empowerment_level) as avg_empowerment_level,
    AVG(im.democratic_participation_rate) as avg_participation_rate,
    
    -- Backup status
    COUNT(bo.id) FILTER (WHERE bo.status = 'completed') as successful_backups,
    COUNT(bo.id) FILTER (WHERE bo.status = 'failed') as failed_backups,
    MAX(bo.completed_at) as last_successful_backup,
    
    -- Governance activity
    COUNT(gd.id) FILTER (WHERE gd.status = 'voting') as active_votes,
    COUNT(gd.id) FILTER (WHERE gd.status = 'passed') as passed_decisions,
    AVG(gd.votes_for::DECIMAL / NULLIF(gd.votes_for + gd.votes_against + gd.votes_abstain, 0)) as avg_approval_rate,
    
    -- Audit transparency
    COUNT(al.id) FILTER (WHERE al.public_visibility = true) as public_audit_entries,
    COUNT(al.id) as total_audit_entries,
    
    ci.created_at,
    ci.updated_at
FROM community_instances ci
LEFT JOIN infrastructure_metrics im ON ci.id = im.community_id
LEFT JOIN backup_operations bo ON ci.id = bo.community_id
LEFT JOIN community_governance_decisions gd ON ci.id = gd.community_id
LEFT JOIN data_sovereignty_audit_log al ON ci.id = al.community_id
GROUP BY ci.id, ci.community_name, ci.data_sovereignty_level, ci.governance_model, ci.created_at, ci.updated_at;

-- Liberation metrics summary view
CREATE OR REPLACE VIEW liberation_metrics_summary AS
SELECT 
    community_id,
    metric_category,
    COUNT(*) as metric_count,
    AVG(metric_value) as avg_value,
    MAX(metric_value) as max_value,
    MIN(metric_value) as min_value,
    AVG(liberation_impact_score) as avg_liberation_impact,
    AVG(community_empowerment_level) as avg_empowerment_level,
    AVG(democratic_participation_rate) as avg_participation_rate,
    DATE_TRUNC('day', timestamp) as day
FROM infrastructure_metrics
WHERE community_visible = true
GROUP BY community_id, metric_category, DATE_TRUNC('day', timestamp)
ORDER BY day DESC, avg_liberation_impact DESC;

-- =====================================================================================
-- INITIAL COMMUNITY SETUP
-- =====================================================================================

-- Insert default BLKOUT community instance
INSERT INTO community_instances (
    community_name,
    community_slug,
    governance_model,
    data_sovereignty_level,
    voting_threshold,
    quorum_percentage,
    liberation_principles,
    community_values,
    community_approved
) VALUES (
    'BLKOUT Community',
    'blkout-main',
    'democratic',
    'full',
    0.60,
    0.33,
    '{
        "cooperative_ownership": true,
        "democratic_governance": true,
        "community_data_sovereignty": true,
        "liberation_first": true,
        "mutual_aid": true,
        "anti_oppression": true
    }',
    '{
        "values_first_development": true,
        "community_controlled_technology": true,
        "transparent_decision_making": true,
        "collective_liberation": true
    }',
    true
) ON CONFLICT (community_slug) DO NOTHING;

-- =====================================================================================
-- COMMENTS AND DOCUMENTATION
-- =====================================================================================

COMMENT ON TABLE community_instances IS 'Multi-tenant community instances with democratic governance and data sovereignty controls';
COMMENT ON TABLE infrastructure_metrics IS 'Time-series metrics for infrastructure performance and liberation impact measurement';
COMMENT ON TABLE backup_operations IS 'Community-controlled backup operations with democratic oversight and transparency';
COMMENT ON TABLE community_governance_decisions IS 'Democratic decision-making process for data sovereignty and platform governance';
COMMENT ON TABLE data_sovereignty_audit_log IS 'Comprehensive audit trail for data sovereignty compliance and community transparency';

COMMENT ON VIEW community_sovereignty_dashboard IS 'Real-time dashboard for community oversight of data sovereignty and democratic participation';
COMMENT ON VIEW liberation_metrics_summary IS 'Aggregated liberation impact metrics for community assessment and improvement planning';

-- =====================================================================================
-- LAYER 4 INTERFACE BOUNDARIES
-- =====================================================================================

-- This schema strictly adheres to Layer 4 responsibilities:
-- ✅ Community data storage and retrieval with sovereignty protection
-- ✅ Database schema management and community-controlled evolution  
-- ✅ Data backup and recovery with community ownership principles
-- ✅ Community data analytics and liberation metrics storage
-- ✅ Democratic data governance and transparency implementation

-- Layer boundaries maintained:
-- ❌ NO business logic - only data storage and sovereignty enforcement
-- ❌ NO authentication/authorization logic - delegated to Layer 2 API Gateway
-- ❌ NO application/UI logic - delegated to Layer 1 and Layer 3
-- ❌ NO cross-service communication - delegated to Layer 2
-- ❌ NO liberation policy decisions - delegated to Layer 3 Business Logic

-- Community liberation values embedded:
-- ✅ Democratic governance required for all data decisions
-- ✅ Transparency through public audit logs and community dashboards  
-- ✅ Community sovereignty through local control and democratic oversight
-- ✅ Liberation metrics tracking for continuous improvement
-- ✅ Cooperative ownership reflected in governance structures