-- ============================================
-- 20260512_enable_rls_priority_tables.sql
--
-- Closes the Supabase advisor alerts (11 May 2026):
--   - rls_disabled_in_public
--   - sensitive_columns_exposed
-- on the four highest-risk tables in the Community Platform project
-- (bgjengudzfickgomjqmz).
--
-- Tables addressed:
--   vendors          — has stripe_account_id, contact_email, contact_phone
--   visitor_passes   — has email
--   ivor_resources   — has phone, email, address (224 rows of public-facing
--                      community resource listings; safe to keep readable)
--   member_benefits  — has user_id linking benefits to identities
--
-- Server-side access (ivor-core, Herald) uses SUPABASE_SERVICE_ROLE_KEY,
-- which bypasses RLS — so these changes do not break any server-side route
-- provided that env var is correctly set in production (Coolify).
--
-- No table in this set is read directly from the browser via the anon key,
-- so default-deny for the anon role is safe.
--
-- IDEMPOTENT — uses DROP POLICY IF EXISTS … CREATE POLICY pattern.
-- ============================================

-- ── vendors ────────────────────────────────────────────────────
-- Restores the policy set originally defined in 20250115_shop_schema.sql,
-- which appears not to have applied on this project.

ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view verified vendors" ON public.vendors;
CREATE POLICY "Public can view verified vendors"
  ON public.vendors FOR SELECT
  USING (verified = true AND status = 'active');

DROP POLICY IF EXISTS "Service role full access on vendors" ON public.vendors;
CREATE POLICY "Service role full access on vendors"
  ON public.vendors FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');


-- ── visitor_passes ─────────────────────────────────────────────
-- Empty table, no code references. Default-deny everything; service role
-- can still operate. If a feature uses this table later, add policies then.

ALTER TABLE public.visitor_passes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role full access on visitor_passes" ON public.visitor_passes;
CREATE POLICY "Service role full access on visitor_passes"
  ON public.visitor_passes FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');


-- ── ivor_resources ─────────────────────────────────────────────
-- 224 rows of public-facing community resource listings (CliniQ, Switchboard,
-- LGBT Foundation, AKT, etc.). The phone/email/address columns hold the
-- published org contact details — not individual PII — so SELECT is
-- intentionally public for active records.

ALTER TABLE public.ivor_resources ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read active ivor resources" ON public.ivor_resources;
CREATE POLICY "Public can read active ivor resources"
  ON public.ivor_resources FOR SELECT
  USING (is_active = true);

DROP POLICY IF EXISTS "Service role full access on ivor_resources" ON public.ivor_resources;
CREATE POLICY "Service role full access on ivor_resources"
  ON public.ivor_resources FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');


-- ── member_benefits ────────────────────────────────────────────
-- Empty table. Holds per-user benefit tiers. Users should be able to read
-- their own row; writes are server-side only.

ALTER TABLE public.member_benefits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own member benefits" ON public.member_benefits;
CREATE POLICY "Users can view their own member benefits"
  ON public.member_benefits FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role full access on member_benefits" ON public.member_benefits;
CREATE POLICY "Service role full access on member_benefits"
  ON public.member_benefits FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');


-- ============================================
-- Verification queries (run after migration; not executed by the migration):
--
--   SELECT relname, relrowsecurity,
--          (SELECT COUNT(*) FROM pg_policies p
--             WHERE p.schemaname='public' AND p.tablename=c.relname) AS policies
--     FROM pg_class c
--     JOIN pg_namespace n ON n.oid = c.relnamespace
--    WHERE n.nspname='public'
--      AND c.relname IN ('vendors','visitor_passes','ivor_resources','member_benefits');
--
-- Expected: relrowsecurity=true and policies >= 1 for each.
-- ============================================
