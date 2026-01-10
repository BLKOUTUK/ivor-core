# BLKOUT Shop - Administration Guide

## 🎯 Overview

This guide covers daily shop administration tasks, vendor management, and order fulfillment for BLKOUT team members.

## 📦 Product Management

### Adding New Products

**Via SQL** (Recommended for initial setup):

```sql
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
  seasonal_campaign,
  status,
  published_at,
  profit_breakdown
) VALUES (
  'Product Name',
  'Full product description...',
  'Short tagline',
  'product-name-slug',
  'digital', -- or 'physical', 'journal', 'ticket', 'marketplace'
  19.99,
  2.00,
  'Category Name',
  ARRAY['tag1', 'tag2', 'tag3'],
  false, -- featured on homepage?
  'pride-2025', -- or NULL
  'active', -- 'draft', 'active', 'sold_out', 'archived'
  NOW(),
  '{"creator": 60, "platform": 25, "community": 15, "production": 0}'::jsonb
);
```

**Via Supabase Dashboard**:

1. Go to Table Editor → `shop_products`
2. Click "Insert row"
3. Fill in required fields:
   - `name`, `description`, `short_description`
   - `slug` (URL-friendly, unique)
   - `type` (dropdown)
   - `price_gbp` (decimal, e.g., 14.99)
   - `category`
   - `status` = 'active'
   - `profit_breakdown` (JSON)
4. Optional: Add images, tags, seasonal campaign
5. Click "Save"

### Updating Products

```sql
-- Change price
UPDATE shop_products
SET price_gbp = 24.99,
    updated_at = NOW()
WHERE slug = 'product-slug';

-- Mark as sold out
UPDATE shop_products
SET status = 'sold_out'
WHERE slug = 'product-slug';

-- Feature product on homepage
UPDATE shop_products
SET featured = true
WHERE slug = 'product-slug';

-- Add to seasonal campaign
UPDATE shop_products
SET seasonal_campaign = 'pride-2025'
WHERE category = 'Apparel';
```

### Managing Digital Products

1. **Upload file to Supabase Storage**:
   - Go to Storage → `digital-products` bucket
   - Upload file (e.g., `journals/new-journal.pdf`)
   - Note the file path

2. **Link to product**:
   ```sql
   UPDATE shop_products
   SET file_url = 'journals/new-journal.pdf',
       file_size_mb = 15.5,
       file_format = 'PDF'
   WHERE slug = 'product-slug';
   ```

3. **Set download limits** (optional):
   ```sql
   UPDATE shop_products
   SET download_limit = 10 -- Allow 10 downloads per purchase
   WHERE slug = 'product-slug';
   ```

## 🏪 Vendor Management

### Approving Vendor Applications

1. **View pending applications**:
   ```sql
   SELECT
     id,
     business_name,
     contact_email,
     business_description,
     values_alignment,
     created_at
   FROM vendors
   WHERE status = 'pending'
   ORDER BY created_at ASC;
   ```

2. **Review application**:
   - Check business alignment with BLKOUT values
   - Verify contact information
   - Review values_alignment JSON
   - Check for community endorsements

3. **Approve vendor**:
   ```sql
   UPDATE vendors
   SET status = 'active',
       verified = true,
       verified_at = NOW(),
       verified_by = 'YOUR_USER_ID'
   WHERE id = 'VENDOR_ID';
   ```

4. **Reject vendor**:
   ```sql
   UPDATE vendors
   SET status = 'rejected',
       mentorship_status = 'Reason for rejection...'
   WHERE id = 'VENDOR_ID';
   ```

### Onboarding Vendors to Stripe Connect

Vendors need Stripe Connect accounts to receive payouts:

1. **Generate onboarding link** (via backend):
   ```bash
   curl -X POST https://ivor.blkoutuk.cloud/api/vendors/onboard \
     -H "Content-Type: application/json" \
     -d '{"vendor_id": "uuid-here"}'
   ```

2. **Send link to vendor**:
   - Email the `onboarding_url` to vendor
   - They complete Stripe Express onboarding
   - Stripe verifies their identity and bank details

3. **Check onboarding status**:
   ```sql
   SELECT
     business_name,
     stripe_account_id,
     status
   FROM vendors
   WHERE id = 'VENDOR_ID';
   ```

## 📊 Order Management

### Viewing Orders

**All orders**:
```sql
SELECT
  order_number,
  customer_email,
  customer_name,
  total_gbp,
  status,
  payment_status,
  created_at
FROM shop_orders
ORDER BY created_at DESC
LIMIT 50;
```

**Pending fulfillment**:
```sql
SELECT
  o.order_number,
  o.customer_name,
  o.customer_email,
  o.shipping_address,
  array_agg(oi.product_name) as products
FROM shop_orders o
JOIN shop_order_items oi ON o.id = oi.order_id
WHERE o.status = 'processing'
  AND o.payment_status = 'succeeded'
GROUP BY o.id, o.order_number, o.customer_name, o.customer_email, o.shipping_address;
```

**Failed payments**:
```sql
SELECT
  order_number,
  customer_email,
  total_gbp,
  admin_notes,
  created_at
FROM shop_orders
WHERE payment_status = 'failed'
ORDER BY created_at DESC;
```

### Fulfilling Physical Orders

1. **Get order details**:
   ```sql
   SELECT
     o.*,
     json_agg(json_build_object(
       'product_name', oi.product_name,
       'quantity', oi.quantity,
       'type', oi.product_type
     )) as items
   FROM shop_orders o
   JOIN shop_order_items oi ON o.id = oi.order_id
   WHERE o.order_number = 'BLK-...'
   GROUP BY o.id;
   ```

2. **Mark as shipped**:
   ```sql
   UPDATE shop_orders
   SET status = 'completed',
       fulfillment_status = 'shipped',
       tracking_number = 'TRACKING123',
       carrier = 'Royal Mail',
       shipped_at = NOW()
   WHERE order_number = 'BLK-...';
   ```

3. **Send tracking email** (manual for now):
   - Email customer with tracking number
   - Include order number and estimated delivery

### Processing Refunds

**Full refund**:
```bash
# Via backend API (uses Stripe)
curl -X POST https://ivor.blkoutuk.cloud/api/shop/orders/ORDER_ID/refund \
  -H "Content-Type: application/json" \
  -d '{"reason": "requested_by_customer"}'
```

**Partial refund**:
```bash
curl -X POST https://ivor.blkoutuk.cloud/api/shop/orders/ORDER_ID/refund \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 10.00,
    "reason": "damaged_item"
  }'
```

**Via Stripe Dashboard**:
1. Go to https://dashboard.stripe.com/payments
2. Find payment by order number (in metadata)
3. Click "Refund"
4. Webhook will auto-update order status

## 🎓 Incubator Program Management

### Enrolling Vendors

```sql
-- Enroll vendor in incubator
INSERT INTO incubator_participants (
  vendor_id,
  cohort,
  tier
) VALUES (
  'VENDOR_ID',
  '2025-Q1',
  'aspiring' -- or 'emerging', 'established'
);

-- Update vendor record
UPDATE vendors
SET incubator_participant = true,
    incubator_tier = 'aspiring'
WHERE id = 'VENDOR_ID';
```

### Tracking Progress

```sql
-- View incubator cohort
SELECT
  v.business_name,
  ip.tier,
  ip.test_products_sold,
  ip.test_revenue_gbp,
  ip.training_progress,
  ip.ready_for_graduation
FROM incubator_participants ip
JOIN vendors v ON ip.vendor_id = v.id
WHERE ip.cohort = '2025-Q1'
ORDER BY ip.test_revenue_gbp DESC;
```

### Graduation Criteria

**Aspiring → Emerging**:
- 10+ sales
- £250+ revenue
- 3+ training modules completed

**Emerging → Established**:
- 50+ sales
- £5,000+ revenue
- 6+ training modules

**Established → Graduated**:
- 200+ sales
- £20,000+ revenue
- 8+ training modules

**Mark as graduated**:
```sql
UPDATE incubator_participants
SET graduated = true,
    graduated_at = NOW(),
    ready_for_graduation = true
WHERE vendor_id = 'VENDOR_ID';

-- Reduce commission rate for graduates
UPDATE shop_products
SET commission_rate = 5.00 -- Down from 15%
WHERE vendor_id = 'VENDOR_ID';
```

## 💰 Revenue & Financial Tracking

### Revenue Reports

**Total shop revenue**:
```sql
SELECT
  SUM(total_gbp) as total_revenue,
  SUM((revenue_split->>'creator')::decimal) as creator_revenue,
  SUM((revenue_split->>'platform')::decimal) as platform_revenue,
  SUM((revenue_split->>'community')::decimal) as community_fund,
  COUNT(*) as total_orders
FROM shop_orders
WHERE status = 'completed'
  AND payment_status = 'succeeded';
```

**Revenue by product type**:
```sql
SELECT
  oi.product_type,
  COUNT(*) as sales_count,
  SUM(oi.price_gbp * oi.quantity) as total_revenue
FROM shop_order_items oi
JOIN shop_orders o ON oi.order_id = o.id
WHERE o.status = 'completed'
GROUP BY oi.product_type
ORDER BY total_revenue DESC;
```

**Monthly revenue**:
```sql
SELECT
  DATE_TRUNC('month', created_at) as month,
  COUNT(*) as orders,
  SUM(total_gbp) as revenue
FROM shop_orders
WHERE status = 'completed'
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY month DESC;
```

### Vendor Payouts

**Weekly payout summary** (run every Monday):
```sql
SELECT
  v.business_name,
  v.stripe_account_id,
  COUNT(oi.id) as order_count,
  SUM((oi.item_revenue_split->>'vendor')::decimal) as payout_amount_gbp
FROM shop_order_items oi
JOIN shop_orders o ON oi.order_id = o.id
JOIN vendors v ON oi.vendor_id = v.id
WHERE o.status = 'completed'
  AND o.completed_at >= NOW() - INTERVAL '7 days'
  AND (oi.item_revenue_split->>'vendor')::decimal > 0
GROUP BY v.id, v.business_name, v.stripe_account_id
HAVING SUM((oi.item_revenue_split->>'vendor')::decimal) >= 10.00 -- £10 minimum payout
ORDER BY payout_amount_gbp DESC;
```

**Process payouts** (automated via backend cron):
```bash
# Trigger weekly payout job
curl -X POST https://ivor.blkoutuk.cloud/api/admin/vendor-payouts/process
```

## 🛡️ Moderation & Safety

### Review Moderation

```sql
-- Pending reviews
SELECT
  r.id,
  r.title,
  r.review_text,
  r.rating,
  p.name as product_name,
  r.created_at
FROM shop_reviews r
JOIN shop_products p ON r.product_id = p.id
WHERE r.status = 'pending'
ORDER BY r.created_at ASC;

-- Approve review
UPDATE shop_reviews
SET status = 'approved'
WHERE id = 'REVIEW_ID';

-- Reject review
UPDATE shop_reviews
SET status = 'rejected',
    moderation_notes = 'Reason for rejection...'
WHERE id = 'REVIEW_ID';
```

### Fraud Prevention

Monitor for suspicious orders:

```sql
-- Multiple failed payment attempts
SELECT
  customer_email,
  COUNT(*) as failed_attempts,
  SUM(total_gbp) as attempted_amount
FROM shop_orders
WHERE payment_status = 'failed'
  AND created_at >= NOW() - INTERVAL '24 hours'
GROUP BY customer_email
HAVING COUNT(*) >= 3;

-- High-value orders (manual review)
SELECT *
FROM shop_orders
WHERE total_gbp > 200
  AND status = 'processing'
ORDER BY created_at DESC;
```

## 📈 Analytics & Insights

### Best-Selling Products

```sql
SELECT
  p.name,
  p.category,
  COUNT(oi.id) as sales_count,
  SUM(oi.price_gbp * oi.quantity) as total_revenue,
  AVG(oi.price_gbp) as avg_price
FROM shop_products p
JOIN shop_order_items oi ON p.id = oi.product_id
JOIN shop_orders o ON oi.order_id = o.id
WHERE o.status = 'completed'
GROUP BY p.id, p.name, p.category
ORDER BY sales_count DESC
LIMIT 10;
```

### Customer Insights

```sql
-- Top customers
SELECT
  customer_email,
  customer_name,
  COUNT(*) as order_count,
  SUM(total_gbp) as lifetime_value,
  is_member
FROM shop_orders
WHERE status = 'completed'
GROUP BY customer_email, customer_name, is_member
ORDER BY lifetime_value DESC
LIMIT 20;

-- Member vs non-member revenue
SELECT
  is_member,
  COUNT(*) as orders,
  SUM(total_gbp) as revenue,
  AVG(total_gbp) as avg_order_value
FROM shop_orders
WHERE status = 'completed'
GROUP BY is_member;
```

## 🔧 Common Tasks

### Bulk Update Prices

```sql
-- Increase all apparel by 10%
UPDATE shop_products
SET price_gbp = price_gbp * 1.10,
    updated_at = NOW()
WHERE category = 'Apparel';

-- Set seasonal discount
UPDATE shop_products
SET price_gbp = cost_gbp * 1.25 -- 25% markup during sale
WHERE seasonal_campaign = 'pride-2025';
```

### Export Orders for Accounting

```sql
COPY (
  SELECT
    order_number,
    customer_email,
    total_gbp,
    (revenue_split->>'creator')::decimal as creator_share,
    (revenue_split->>'platform')::decimal as platform_share,
    (revenue_split->>'community')::decimal as community_share,
    created_at
  FROM shop_orders
  WHERE status = 'completed'
    AND created_at >= '2025-01-01'
    AND created_at < '2025-02-01'
) TO '/tmp/january_2025_orders.csv' CSV HEADER;
```

---

## 📞 Support Contacts

- **Stripe Support**: https://support.stripe.com
- **Supabase Support**: https://supabase.com/support
- **BLKOUT Tech Lead**: tech@blkoutuk.com

## 🔗 Quick Links

- Stripe Dashboard: https://dashboard.stripe.com
- Supabase Dashboard: https://supabase.com/dashboard
- Shop API Docs: `SHOP_DEPLOYMENT_GUIDE.md`
- Database Schema: `../database/migrations/20250115_shop_schema.sql`
