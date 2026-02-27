-- LLM Council + Compliance Hub tables
-- Deploy via: SUPABASE_ACCESS_TOKEN=... node scripts/supabase-query.mjs apps/ivor-core/migrations/council_and_compliance.sql

-- 1. Council sessions — stores each council deliberation
CREATE TABLE IF NOT EXISTS council_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trigger VARCHAR NOT NULL DEFAULT 'cron',       -- 'cron', 'manual', 'compliance_review'
  use_case VARCHAR NOT NULL DEFAULT 'newsletter', -- 'newsletter', 'content_review', 'compliance'
  status VARCHAR NOT NULL DEFAULT 'in_progress',  -- 'in_progress', 'completed', 'failed'

  -- Stage 1: Proposals
  proposals JSONB DEFAULT '[]'::jsonb,
  -- Array of { agentRole, proposal, reasoning, sources[] }

  -- Stage 2: Peer review
  rankings JSONB DEFAULT '{}'::jsonb,
  -- { agentRole: { score, feedback } }

  -- Stage 3: Synthesis
  verdict TEXT,                     -- Chair's final synthesised output
  dissent TEXT,                     -- Minority view if any
  liberation_score NUMERIC(3,2),    -- Layer 3 validation result (0-1)

  -- Metadata
  model_used VARCHAR DEFAULT 'llama-3.3-70b-versatile',
  total_tokens INTEGER DEFAULT 0,
  duration_ms INTEGER DEFAULT 0,
  intelligence_ids UUID[] DEFAULT '{}', -- ivor_intelligence rows used as context
  error TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  reviewed_by VARCHAR,              -- Human who approved/rejected
  reviewed_at TIMESTAMPTZ
);

-- 2. Compliance assessments — one row per principle per framework
CREATE TABLE IF NOT EXISTS compliance_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  framework VARCHAR NOT NULL,           -- 'ica_principles', 'coop_gov_code', 'gdpr', 'ai_transparency', etc.
  framework_display VARCHAR NOT NULL,   -- 'ICA Cooperative Principles', 'Co-operative Governance Code', etc.
  category VARCHAR NOT NULL,            -- 'cooperative', 'governance', 'digital_inclusion'
  principle VARCHAR NOT NULL,           -- 'democratic_control', 'data_protection', etc.
  principle_display VARCHAR NOT NULL,   -- Human-readable name
  principle_description TEXT,           -- What this principle means

  status VARCHAR NOT NULL DEFAULT 'not_assessed',
  -- 'met', 'partially_met', 'not_met', 'not_assessed', 'not_applicable'

  met_count INTEGER DEFAULT 0,         -- How many sub-requirements met
  total_count INTEGER DEFAULT 0,       -- Total sub-requirements

  evidence TEXT,                        -- What demonstrates compliance
  gaps TEXT,                            -- What's missing
  action_plan TEXT,                     -- What we'll do about gaps
  target_date DATE,                     -- When we aim to meet it

  assessed_by VARCHAR DEFAULT 'manual', -- 'manual', 'council', 'board'
  council_session_id UUID REFERENCES council_sessions(id),
  reviewed_by VARCHAR,                  -- Human who approved
  reviewed_at TIMESTAMPTZ,

  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast page rendering
CREATE INDEX IF NOT EXISTS idx_compliance_category ON compliance_assessments(category, sort_order);
CREATE INDEX IF NOT EXISTS idx_compliance_framework ON compliance_assessments(framework);
CREATE INDEX IF NOT EXISTS idx_council_sessions_status ON council_sessions(status, created_at DESC);
