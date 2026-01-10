-- ============================================
-- BLKOUT SHOP: Database Schema Migration
-- Created: January 15, 2025
-- ============================================
-- Comprehensive e-commerce infrastructure for:
-- - Physical products (Teemill merch)
-- - Digital products (journals, zines, guides)
-- - Multi-vendor marketplace
-- - Event ticketing
-- - Incubator program tracking
-- - Member benefits integration
-- ============================================

-- ============================================
-- SHOP PRODUCTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.shop_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Basic info
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  short_description TEXT,
  slug TEXT UNIQUE NOT NULL,

  -- Product type
  type TEXT NOT NULL CHECK (type IN ('physical', 'digital', 'journal', 'ticket', 'marketplace')),

  -- Pricing (in pence for precision)
  price_gbp DECIMAL(10,2) NOT NULL,
  cost_gbp DECIMAL(10,2), -- Production cost for transparency
  currency TEXT DEFAULT 'GBP',

  -- Physical products (Teemill)
  teemill_product_id TEXT UNIQUE,
  teemill_url TEXT,
  sizes TEXT[] DEFAULT '{}',
  colors TEXT[] DEFAULT '{}',

  -- Digital products
  file_url TEXT, -- Supabase Storage URL (private bucket)
  file_size_mb DECIMAL(10,2),
  file_format TEXT, -- PDF, EPUB, MP3, etc.
  download_limit INTEGER DEFAULT 5,
  license_type TEXT CHECK (license_type IN ('personal', 'commercial', 'unlimited')),

  -- Journal products (physical + digital bundle)
  has_digital_version BOOLEAN DEFAULT false,
  digital_product_id UUID REFERENCES public.shop_products(id),
  included_in_membership BOOLEAN DEFAULT false, -- Member benefit?

  -- Tickets (linked to events)
  event_id UUID, -- References public.events(id) if events table exists
  ticket_capacity INTEGER,
  tickets_sold INTEGER DEFAULT 0,
  ticket_type TEXT, -- 'general', 'vip', 'supporter'

  -- Marketplace (vendor products)
  vendor_id UUID, -- Will reference vendors table
  commission_rate DECIMAL(5,2) DEFAULT 15.00, -- BLKOUT commission %

  -- Images
  image_urls JSONB DEFAULT '[]',
  thumbnail_url TEXT,

  -- SEO & Discovery
  category TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  featured BOOLEAN DEFAULT false,
  seasonal_campaign TEXT, -- 'pride-2025', 'black-history-month', 'christmas-2025'

  -- Status
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'sold_out', 'archived')),

  -- Liberation values (existing BLKOUT pattern)
  liberation_score DECIMAL(3,2), -- 0.00-1.00
  values_alignment JSONB, -- { sustainable: true, black_owned: true, ... }

  -- Transparent profit breakdown (cooperative economics)
  profit_breakdown JSONB NOT NULL DEFAULT '{"creator": 60, "platform": 25, "community": 15, "production": 0}'::jsonb,

  -- Governance integration
  approved_by_governance BOOLEAN DEFAULT false,
  governance_proposal_id UUID,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_products_type ON shop_products(type);
CREATE INDEX IF NOT EXISTS idx_products_status ON shop_products(status);
CREATE INDEX IF NOT EXISTS idx_products_category ON shop_products(category);
CREATE INDEX IF NOT EXISTS idx_products_seasonal ON shop_products(seasonal_campaign);
CREATE INDEX IF NOT EXISTS idx_products_vendor ON shop_products(vendor_id);

-- ============================================
-- VENDORS TABLE (Marketplace Sellers)
-- ============================================
CREATE TABLE IF NOT EXISTS public.vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Business info
  business_name TEXT NOT NULL,
  business_description TEXT,
  business_type TEXT, -- 'black_queer_owned', 'cooperative', 'social_enterprise'
  slug TEXT UNIQUE NOT NULL,

  -- Owner/Contact
  owner_id UUID, -- References auth.users(id)
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  website_url TEXT,

  -- Branding
  logo_url TEXT,
  cover_image_url TEXT,

  -- Location
  city TEXT,
  country TEXT DEFAULT 'United Kingdom',
  online_only BOOLEAN DEFAULT false,

  -- Verification & Trust
  verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMPTZ,
  verified_by UUID, -- References auth.users(id)
  community_endorsements INTEGER DEFAULT 0,

  -- Liberation values
  values_alignment JSONB, -- { black_owned: true, queer_owned: true, sustainable: true }
  liberation_score DECIMAL(3,2),

  -- Incubator program
  incubator_participant BOOLEAN DEFAULT false,
  incubator_tier TEXT CHECK (incubator_tier IN ('aspiring', 'emerging', 'established')),
  training_completed JSONB DEFAULT '[]', -- ['retail-101', 'marketing-basics', 'financial-literacy']
  mentorship_status TEXT,

  -- Payout details (Stripe Connect)
  stripe_account_id TEXT UNIQUE,
  payout_schedule TEXT DEFAULT 'weekly' CHECK (payout_schedule IN ('daily', 'weekly', 'monthly')),

  -- Performance metrics
  total_revenue_gbp DECIMAL(10,2) DEFAULT 0,
  total_orders INTEGER DEFAULT 0,
  average_rating DECIMAL(3,2),

  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended', 'rejected')),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vendors_status ON vendors(status);
CREATE INDEX IF NOT EXISTS idx_vendors_incubator ON vendors(incubator_participant);
CREATE INDEX IF NOT EXISTS idx_vendors_owner ON vendors(owner_id);

-- ============================================
-- ORDERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.shop_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Order identification
  order_number TEXT UNIQUE NOT NULL, -- Format: BLK-2025-XXXXXX

  -- Customer
  customer_id UUID, -- References auth.users(id)
  customer_email TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  is_member BOOLEAN DEFAULT false, -- For member pricing/benefits

  -- Order status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled')),

  -- Payment
  stripe_payment_intent_id TEXT UNIQUE,
  stripe_charge_id TEXT,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'succeeded', 'failed', 'refunded')),

  -- Pricing
  subtotal_gbp DECIMAL(10,2) NOT NULL,
  discount_gbp DECIMAL(10,2) DEFAULT 0,
  shipping_gbp DECIMAL(10,2) DEFAULT 0,
  total_gbp DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'GBP',

  -- Revenue sharing (calculated at order time, immutable)
  revenue_split JSONB NOT NULL DEFAULT '{"creator": 0, "platform": 0, "community": 0, "production": 0}'::jsonb,

  -- Fulfillment
  fulfillment_status TEXT DEFAULT 'pending' CHECK (fulfillment_status IN (
    'pending', 'processing', 'shipped', 'delivered', 'digital_sent', 'pickup_ready'
  )),
  tracking_number TEXT,
  carrier TEXT,

  -- Addresses
  billing_address JSONB,
  shipping_address JSONB,

  -- Notes
  customer_notes TEXT,
  admin_notes TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  shipped_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_orders_customer ON shop_orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON shop_orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON shop_orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_payment_intent ON shop_orders(stripe_payment_intent_id);

-- ============================================
-- ORDER ITEMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.shop_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  order_id UUID REFERENCES public.shop_orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.shop_products(id),
  vendor_id UUID REFERENCES public.vendors(id),

  -- Snapshot product details (immutable after purchase)
  product_name TEXT NOT NULL,
  product_type TEXT NOT NULL,
  product_slug TEXT NOT NULL,
  price_gbp DECIMAL(10,2) NOT NULL,
  quantity INTEGER DEFAULT 1 CHECK (quantity > 0),

  -- Revenue split for this line item
  item_revenue_split JSONB NOT NULL DEFAULT '{"creator": 0, "platform": 0, "community": 0, "production": 0, "vendor": 0}'::jsonb,

  -- Digital product delivery
  download_token TEXT UNIQUE, -- UUID for secure downloads
  download_url TEXT, -- Signed Supabase Storage URL
  download_count INTEGER DEFAULT 0,
  download_expires_at TIMESTAMPTZ, -- 30 days after purchase

  -- Ticket delivery
  ticket_code TEXT UNIQUE,
  ticket_qr_code TEXT, -- Base64 QR code image
  ticket_checked_in BOOLEAN DEFAULT false,
  ticket_checked_in_at TIMESTAMPTZ,

  -- Fulfillment
  fulfillment_status TEXT DEFAULT 'pending',

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON shop_order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product ON shop_order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_order_items_vendor ON shop_order_items(vendor_id);
CREATE INDEX IF NOT EXISTS idx_order_items_download_token ON shop_order_items(download_token);

-- ============================================
-- CARTS TABLE (Session-based)
-- ============================================
CREATE TABLE IF NOT EXISTS public.shop_carts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  user_id UUID, -- References auth.users(id)
  session_id TEXT, -- For guest carts

  items JSONB DEFAULT '[]', -- [{ product_id, quantity, variant }]

  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days'),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT cart_user_or_session CHECK (user_id IS NOT NULL OR session_id IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_carts_user ON shop_carts(user_id);
CREATE INDEX IF NOT EXISTS idx_carts_session ON shop_carts(session_id);
CREATE INDEX IF NOT EXISTS idx_carts_expires ON shop_carts(expires_at);

-- ============================================
-- REVIEWS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.shop_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  product_id UUID REFERENCES public.shop_products(id) ON DELETE CASCADE,
  order_id UUID REFERENCES public.shop_orders(id),
  user_id UUID, -- References auth.users(id)

  -- Ratings
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  liberation_impact_rating INTEGER CHECK (liberation_impact_rating >= 1 AND liberation_impact_rating <= 5),

  -- Review content
  title TEXT,
  review_text TEXT NOT NULL,
  photos JSONB DEFAULT '[]',

  -- Verification
  verified_purchase BOOLEAN DEFAULT true,

  -- Moderation
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'flagged')),
  moderation_notes TEXT,

  -- Helpfulness
  helpful_count INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reviews_product ON shop_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user ON shop_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON shop_reviews(status);

-- ============================================
-- DOWNLOADS TABLE (Track digital product downloads)
-- ============================================
CREATE TABLE IF NOT EXISTS public.shop_downloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  order_item_id UUID REFERENCES public.shop_order_items(id),
  user_id UUID, -- References auth.users(id)

  download_token TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,

  downloaded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_downloads_order_item ON shop_downloads(order_item_id);
CREATE INDEX IF NOT EXISTS idx_downloads_token ON shop_downloads(download_token);

-- ============================================
-- MEMBER BENEFITS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.member_benefits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  user_id UUID UNIQUE, -- References auth.users(id)

  -- Membership tier
  tier TEXT DEFAULT 'standard' CHECK (tier IN ('standard', 'supporter', 'patron')),

  -- Journal access
  journal_physical_claimed BOOLEAN DEFAULT false,
  journal_digital_access BOOLEAN DEFAULT true,

  -- Benefits
  free_shipping BOOLEAN DEFAULT false,
  early_access_products BOOLEAN DEFAULT false,
  discount_percentage INTEGER DEFAULT 0,

  -- Status
  active BOOLEAN DEFAULT true,
  expires_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_member_benefits_user ON member_benefits(user_id);

-- ============================================
-- INCUBATOR PARTICIPANTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.incubator_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  vendor_id UUID REFERENCES public.vendors(id),

  -- Program details
  cohort TEXT NOT NULL, -- '2025-Q1', '2025-Q2'
  tier TEXT NOT NULL CHECK (tier IN ('aspiring', 'emerging', 'established')),

  -- Training modules
  training_progress JSONB DEFAULT '{}', -- { 'retail-101': { completed: true, score: 95 } }

  -- Mentorship
  mentor_id UUID, -- References auth.users(id)
  mentorship_hours INTEGER DEFAULT 0,

  -- Testing/validation
  test_products_sold INTEGER DEFAULT 0,
  test_revenue_gbp DECIMAL(10,2) DEFAULT 0,
  customer_feedback_score DECIMAL(3,2),

  -- Graduation criteria
  ready_for_graduation BOOLEAN DEFAULT false,
  graduated BOOLEAN DEFAULT false,
  graduated_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_incubator_vendor ON incubator_participants(vendor_id);
CREATE INDEX IF NOT EXISTS idx_incubator_cohort ON incubator_participants(cohort);

-- ============================================
-- SHOP GOVERNANCE PARAMETERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.shop_governance_parameters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  parameter_name TEXT UNIQUE NOT NULL,
  parameter_value JSONB NOT NULL,
  approved_by_proposal UUID, -- References governance_proposals(id) if exists
  effective_date TIMESTAMPTZ DEFAULT NOW(),

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default governance parameters
INSERT INTO public.shop_governance_parameters (parameter_name, parameter_value)
VALUES
  ('creator_minimum_percentage', '{"value": 60, "description": "Minimum revenue share for creators"}'::jsonb),
  ('platform_maximum_percentage', '{"value": 15, "description": "Maximum platform operations fee"}'::jsonb),
  ('community_fund_minimum', '{"value": 5, "description": "Minimum allocation to community programs"}'::jsonb),
  ('liberation_score_threshold', '{"value": 0.5, "description": "Minimum liberation score for products"}'::jsonb),
  ('vendor_endorsement_requirement', '{"value": 3, "description": "Minimum community endorsements for vendors"}'::jsonb)
ON CONFLICT (parameter_name) DO NOTHING;

-- ============================================
-- Row Level Security (RLS)
-- ============================================

ALTER TABLE shop_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_benefits ENABLE ROW LEVEL SECURITY;

-- Public can view active products
DROP POLICY IF EXISTS "Public can view active products" ON shop_products;
CREATE POLICY "Public can view active products"
  ON shop_products FOR SELECT
  USING (status = 'active' AND published_at IS NOT NULL);

-- Public can view verified vendors
DROP POLICY IF EXISTS "Public can view verified vendors" ON vendors;
CREATE POLICY "Public can view verified vendors"
  ON vendors FOR SELECT
  USING (verified = true AND status = 'active');

-- Users can view their own orders
DROP POLICY IF EXISTS "Users can view their own orders" ON shop_orders;
CREATE POLICY "Users can view their own orders"
  ON shop_orders FOR SELECT
  USING (auth.uid() = customer_id);

-- Users can manage their own carts
DROP POLICY IF EXISTS "Users can manage their own carts" ON shop_carts;
CREATE POLICY "Users can manage their own carts"
  ON shop_carts FOR ALL
  USING (auth.uid() = user_id);

-- Verified purchasers can leave reviews
DROP POLICY IF EXISTS "Users can create reviews for purchased products" ON shop_reviews;
CREATE POLICY "Users can create reviews for purchased products"
  ON shop_reviews FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM shop_orders o
      JOIN shop_order_items oi ON o.id = oi.order_id
      WHERE o.customer_id = auth.uid()
      AND oi.product_id = shop_reviews.product_id
      AND o.status = 'completed'
    )
  );

-- Service role has full access
DROP POLICY IF EXISTS "Service role full access on shop_products" ON shop_products;
CREATE POLICY "Service role full access on shop_products"
  ON shop_products FOR ALL
  USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service role full access on shop_orders" ON shop_orders;
CREATE POLICY "Service role full access on shop_orders"
  ON shop_orders FOR ALL
  USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service role full access on vendors" ON vendors;
CREATE POLICY "Service role full access on vendors"
  ON vendors FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_shop_products_updated_at ON shop_products;
CREATE TRIGGER update_shop_products_updated_at
    BEFORE UPDATE ON shop_products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_vendors_updated_at ON vendors;
CREATE TRIGGER update_vendors_updated_at
    BEFORE UPDATE ON vendors
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_shop_orders_updated_at ON shop_orders;
CREATE TRIGGER update_shop_orders_updated_at
    BEFORE UPDATE ON shop_orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
-- Next steps:
-- 1. Run this migration in Supabase SQL Editor
-- 2. Verify tables created: SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename LIKE 'shop_%';
-- 3. Test RLS policies with test user account
-- 4. Populate initial products via API or admin interface
-- ============================================
