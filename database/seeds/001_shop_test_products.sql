-- ============================================
-- BLKOUT SHOP: Test Product Data
-- ============================================
-- Sample products for initial shop testing
-- Run this after applying shop schema migration
-- ============================================

-- Insert test products for Pride 2025 campaign
INSERT INTO public.shop_products (
  name,
  description,
  short_description,
  slug,
  type,
  price_gbp,
  cost_gbp,
  category,
  tags,
  featured,
  seasonal_campaign,
  status,
  published_at,
  image_urls,
  thumbnail_url,
  profit_breakdown,
  liberation_score,
  values_alignment
) VALUES
-- Digital Products
(
  'BLKOUT Liberation Journal (Digital)',
  'A 90-day guided journal for Black queer joy, healing, and collective liberation. Includes daily prompts across 12 transformative themes: Self-Discovery, Community Connection, Ancestors & Legacy, Joy & Celebration, and more. Digital PDF with fillable fields.',
  'Digital 90-day guided journal for Black queer liberation',
  'blkout-liberation-journal-digital',
  'digital',
  14.99,
  0.50,
  'Journals & Guides',
  ARRAY['journal', 'digital', 'wellness', 'liberation', 'pride-2025'],
  true,
  'pride-2025',
  'active',
  NOW(),
  '["https://placeholder-journal-cover.jpg"]'::jsonb,
  'https://placeholder-journal-thumb.jpg',
  '{"creator": 60, "platform": 25, "community": 15, "production": 0}'::jsonb,
  0.95,
  '{"sustainable": true, "black_owned": true, "community_created": true}'::jsonb
),

-- Physical Journal
(
  'BLKOUT Liberation Journal (Physical)',
  'Premium printed 90-day guided journal for Black queer liberation. High-quality paper, perfect binding, minimalist design. Same transformative content as digital version with space for handwritten reflections.',
  'Premium printed 90-day liberation journal',
  'blkout-liberation-journal-physical',
  'journal',
  24.50,
  4.00,
  'Journals & Guides',
  ARRAY['journal', 'physical', 'wellness', 'liberation', 'pride-2025'],
  true,
  'pride-2025',
  'active',
  NOW(),
  '["https://placeholder-journal-physical.jpg"]'::jsonb,
  'https://placeholder-journal-physical-thumb.jpg',
  '{"creator": 50, "platform": 30, "community": 10, "production": 10}'::jsonb,
  0.95,
  '{"sustainable": true, "black_owned": true, "fsc_certified": true}'::jsonb
),

-- Digital Zine
(
  'Black Queer Joy Zine - Issue 1',
  'A digital zine celebrating Black queer brilliance, creativity, and resistance. Features poetry, art, interviews, and community stories. 40 pages of inspiration and affirmation.',
  'Digital zine celebrating Black queer joy',
  'black-queer-joy-zine-issue-1',
  'digital',
  7.99,
  0.25,
  'Zines & Art',
  ARRAY['zine', 'digital', 'art', 'community', 'pride-2025'],
  true,
  'pride-2025',
  'active',
  NOW(),
  '["https://placeholder-zine-cover.jpg"]'::jsonb,
  'https://placeholder-zine-thumb.jpg',
  '{"creator": 70, "platform": 20, "community": 10, "production": 0}'::jsonb,
  0.92,
  '{"black_owned": true, "queer_owned": true, "community_created": true}'::jsonb
),

-- Teemill Physical Merch (linked to external Teemill store)
(
  'BLKOUT Pride T-Shirt - "Liberation is Love"',
  'Organic cotton t-shirt with bold "Liberation is Love" design. Sustainable, ethically produced via Teemill. Available in multiple sizes and colors. Perfect for Pride events and everyday liberation.',
  'Organic cotton Pride t-shirt',
  'blkout-pride-tshirt-liberation-is-love',
  'physical',
  28.00,
  8.00,
  'Apparel',
  ARRAY['clothing', 'tshirt', 'pride', 'sustainable', 'pride-2025'],
  true,
  'pride-2025',
  'active',
  NOW(),
  '["https://placeholder-tshirt.jpg"]'::jsonb,
  'https://placeholder-tshirt-thumb.jpg',
  '{"creator": 30, "platform": 40, "community": 10, "production": 20}'::jsonb,
  0.88,
  '{"sustainable": true, "organic": true, "carbon_neutral": true}'::jsonb
),

-- Event Ticket (example)
(
  'Pride 2025 Community Celebration - General Admission',
  'Join BLKOUT for our annual Pride Community Celebration! An evening of music, food, performances, and joy. Ticket includes entry, welcome drink, and access to all activities. Limited capacity for intimate community gathering.',
  'Pride 2025 celebration ticket',
  'pride-2025-community-celebration-ticket',
  'ticket',
  18.00,
  2.00,
  'Events',
  ARRAY['event', 'ticket', 'pride', 'community', 'pride-2025'],
  true,
  'pride-2025',
  'active',
  NOW(),
  '["https://placeholder-event.jpg"]'::jsonb,
  'https://placeholder-event-thumb.jpg',
  '{"creator": 90, "platform": 5, "community": 5, "production": 0}'::jsonb,
  1.00,
  '{"community_owned": true, "accessible": true}'::jsonb
)
ON CONFLICT (slug) DO NOTHING;

-- Add Teemill product IDs (if you have them)
-- UPDATE shop_products SET
--   teemill_product_id = 'teemill-product-123',
--   teemill_url = 'https://blkoutuk.teemill.com/product/liberation-is-love-tshirt/'
-- WHERE slug = 'blkout-pride-tshirt-liberation-is-love';

-- Insert test vendor for marketplace testing
INSERT INTO public.vendors (
  business_name,
  business_description,
  business_type,
  slug,
  contact_email,
  website_url,
  city,
  country,
  verified,
  verified_at,
  status,
  values_alignment,
  liberation_score
) VALUES
(
  'Black Queer Designs Co.',
  'A Black queer-owned design studio creating affirming artwork, apparel, and home goods. Founded in 2023, we center joy, liberation, and community in everything we create.',
  'black_queer_owned',
  'black-queer-designs-co',
  'hello@blackqueerdesigns.co.uk',
  'https://blackqueerdesigns.co.uk',
  'London',
  'United Kingdom',
  true,
  NOW(),
  'active',
  '{"black_owned": true, "queer_owned": true, "sustainable": true, "london_based": true}'::jsonb,
  0.96
)
ON CONFLICT (slug) DO NOTHING;

-- Link a marketplace product to the test vendor
DO $$
DECLARE
  vendor_id_var UUID;
BEGIN
  SELECT id INTO vendor_id_var FROM vendors WHERE slug = 'black-queer-designs-co';

  INSERT INTO shop_products (
    name,
    description,
    short_description,
    slug,
    type,
    price_gbp,
    cost_gbp,
    category,
    tags,
    featured,
    status,
    published_at,
    vendor_id,
    commission_rate,
    profit_breakdown,
    liberation_score,
    values_alignment
  ) VALUES (
    'Affirmation Art Print - "We Are Our Ancestors Wildest Dreams"',
    'Beautiful A3 art print featuring bold typography and vibrant colors. Printed on sustainable recycled paper. Perfect for homes, offices, or community spaces. Each print celebrates Black queer resilience and joy.',
    'A3 affirmation art print',
    'affirmation-art-print-ancestors-dreams',
    'marketplace',
    35.00,
    8.00,
    'Art & Prints',
    ARRAY['art', 'print', 'affirmation', 'home-decor'],
    false,
    'active',
    NOW(),
    vendor_id_var,
    10.00, -- 10% commission for established marketplace vendor
    '{"creator": 80, "platform": 10, "community": 5, "production": 5}'::jsonb,
    0.94,
    '{"black_owned": true, "queer_owned": true, "recycled_materials": true}'::jsonb
  )
  ON CONFLICT (slug) DO NOTHING;
END $$;

-- Success message
SELECT 'Test products created successfully!' as message,
       COUNT(*) as total_products
FROM shop_products;
