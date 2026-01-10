# BLKOUT Shop - Deployment & Testing Guide

## 🚀 Quick Start

The BLKOUT Shop is now ready for testing and deployment. This guide covers the complete setup process.

## ✅ Pre-Deployment Checklist

### 1. Database Setup

- [x] Database migrations applied
  - `shop_products`, `vendors`, `shop_orders`, `shop_order_items`
  - `shop_carts`, `shop_reviews`, `shop_downloads`
  - `member_benefits`, `incubator_participants`

- [x] Test data inserted
  - 3 sample products (digital journal, physical journal, zine)
  - Products visible in Supabase dashboard

- [ ] Supabase Storage bucket created
  - Bucket name: `digital-products`
  - Public: NO (private bucket)
  - RLS policies applied (see `SUPABASE_STORAGE_SETUP.md`)

### 2. Environment Variables

Required environment variables in `.env`:

```bash
# Existing variables
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
GROQ_API_KEY=your-groq-key

# NEW: Stripe Configuration
STRIPE_SECRET_KEY=sk_test_... # Use sk_live_... for production
STRIPE_PUBLISHABLE_KEY=pk_test_... # Use pk_live_... for production
STRIPE_WEBHOOK_SECRET=whsec_... # Get from Stripe dashboard after webhook setup

# NEW: Application URL (for Stripe redirects)
VITE_APP_URL=https://blkoutuk.com # Production URL
```

### 3. Stripe Setup

#### A. Create Stripe Account
1. Sign up at https://stripe.com (if not already done)
2. Complete account verification for UK business
3. Enable test mode for development

#### B. Get API Keys
1. Go to https://dashboard.stripe.com/apikeys
2. Copy "Publishable key" → `STRIPE_PUBLISHABLE_KEY`
3. Reveal and copy "Secret key" → `STRIPE_SECRET_KEY`

#### C. Configure Webhooks
1. Go to https://dashboard.stripe.com/webhooks
2. Click "Add endpoint"
3. Endpoint URL: `https://ivor.blkoutuk.cloud/api/webhooks/stripe`
4. Select events:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
5. Copy "Signing secret" → `STRIPE_WEBHOOK_SECRET`

### 4. Backend Deployment (Coolify)

#### Deploy to Coolify

1. **Update environment variables in Coolify**:
   ```bash
   # In Coolify dashboard for ivor-core service
   STRIPE_SECRET_KEY=sk_live_... # PRODUCTION key
   STRIPE_PUBLISHABLE_KEY=pk_live_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   VITE_APP_URL=https://blkoutuk.com
   ```

2. **Rebuild and deploy**:
   ```bash
   cd blkout-platform/apps/ivor-core
   git add .
   git commit -m "🛍️ Add BLKOUT Shop e-commerce functionality"
   git push origin main
   ```

3. **Verify deployment**:
   - Check Coolify build logs
   - Verify service is running
   - Test health endpoint: `https://ivor.blkoutuk.cloud/health`

### 5. API Testing

#### Test Shop Endpoints

```bash
# 1. List products
curl https://ivor.blkoutuk.cloud/api/shop/products

# 2. Get single product
curl https://ivor.blkoutuk.cloud/api/shop/products/blkout-liberation-journal-digital

# 3. Add to cart (requires user_id or session_id)
curl -X POST https://ivor.blkoutuk.cloud/api/shop/cart/add \
  -H "Content-Type: application/json" \
  -d '{
    "product_id": "uuid-here",
    "quantity": 1,
    "session_id": "test-session-123"
  }'

# 4. Create checkout session (requires full cart)
curl -X POST https://ivor.blkoutuk.cloud/api/checkout/create-order \
  -H "Content-Type: application/json" \
  -d '{
    "customer_email": "test@blkoutuk.com",
    "customer_name": "Test User",
    "cart_items": [
      {
        "product_id": "uuid-here",
        "quantity": 1
      }
    ]
  }'
```

#### Expected Responses

**Products List** (200 OK):
```json
{
  "success": true,
  "data": [...products],
  "pagination": {
    "total": 3,
    "limit": 24,
    "offset": 0
  }
}
```

**Checkout Session** (200 OK):
```json
{
  "success": true,
  "data": {
    "order_id": "uuid",
    "order_number": "BLK-1234567890-ABC",
    "checkout_url": "https://checkout.stripe.com/...",
    "session_id": "cs_test_...",
    "total_gbp": "14.99"
  }
}
```

### 6. Frontend Integration (Next Steps)

The shop frontend UI needs to be built. Options:

1. **Quick Testing UI** (Recommended for MVP):
   - Simple product listing page
   - Add to cart functionality
   - Checkout button redirects to Stripe
   - Order confirmation page

2. **Full Shop UI** (Future enhancement):
   - Product filtering and search
   - Vendor marketplace pages
   - Member benefits integration
   - Admin dashboard

Example frontend integration:

```typescript
// Fetch products
const response = await fetch('https://ivor.blkoutuk.cloud/api/shop/products')
const { data: products } = await response.json()

// Create checkout
const checkoutResponse = await fetch('https://ivor.blkoutuk.cloud/api/checkout/create-order', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    customer_email: user.email,
    customer_name: user.name,
    cart_items: [{ product_id: selectedProduct.id, quantity: 1 }]
  })
})

const { data: { checkout_url } } = await checkoutResponse.json()

// Redirect to Stripe checkout
window.location.href = checkout_url
```

### 7. Supabase Storage Setup

Upload digital product files:

1. **Create bucket** (if not done):
   - Go to Supabase Dashboard → Storage
   - Create bucket: `digital-products` (private)

2. **Upload test file**:
   - Upload a sample PDF: `journals/blkout-liberation-journal-digital.pdf`
   - Note the file path

3. **Update product**:
   ```sql
   UPDATE shop_products
   SET file_url = 'journals/blkout-liberation-journal-digital.pdf'
   WHERE slug = 'blkout-liberation-journal-digital';
   ```

4. **Test download** (requires valid order):
   ```bash
   curl https://ivor.blkoutuk.cloud/api/checkout/download/TOKEN?user_id=USER_ID
   ```

## 🧪 End-to-End Testing

### Test Flow 1: Digital Product Purchase

1. Browse products: `/api/shop/products`
2. Add to cart: `/api/shop/cart/add`
3. Create checkout: `/api/checkout/create-order`
4. Complete payment on Stripe (use test card: `4242 4242 4242 4242`)
5. Webhook processes payment: `/api/webhooks/stripe`
6. Download product: `/api/checkout/download/:token`

### Test Flow 2: Member Benefits

1. Create member benefit for test user
2. Purchase journal as member (40% discount applied)
3. Claim free digital journal
4. Verify free shipping applied

### Test Flow 3: Marketplace Vendor

1. Submit vendor application: `/api/shop/vendors/apply`
2. Approve vendor (manual in Supabase)
3. Create marketplace product
4. Purchase and verify revenue split

## 📊 Monitoring

### Key Metrics to Track

1. **Sales metrics**:
   - Total revenue: `SELECT SUM(total_gbp) FROM shop_orders WHERE status = 'completed'`
   - Order count: `SELECT COUNT(*) FROM shop_orders WHERE status = 'completed'`
   - Average order value: `SELECT AVG(total_gbp) FROM shop_orders WHERE status = 'completed'`

2. **Product performance**:
   ```sql
   SELECT
     p.name,
     COUNT(oi.id) as sales_count,
     SUM(oi.price_gbp * oi.quantity) as total_revenue
   FROM shop_products p
   LEFT JOIN shop_order_items oi ON p.id = oi.product_id
   GROUP BY p.id, p.name
   ORDER BY total_revenue DESC;
   ```

3. **Failed payments**:
   ```sql
   SELECT * FROM shop_orders
   WHERE payment_status = 'failed'
   ORDER BY created_at DESC;
   ```

### Stripe Dashboard

Monitor in Stripe dashboard:
- https://dashboard.stripe.com/payments
- https://dashboard.stripe.com/webhooks (check delivery status)
- https://dashboard.stripe.com/events (debug webhook events)

## 🔧 Troubleshooting

### Webhook Not Firing

1. Check webhook is configured in Stripe dashboard
2. Verify `STRIPE_WEBHOOK_SECRET` is set correctly
3. Check Coolify logs for webhook errors:
   ```bash
   # In Coolify, view ivor-core service logs
   # Look for "Stripe webhook received" messages
   ```

4. Test webhook manually:
   ```bash
   stripe trigger checkout.session.completed
   ```

### Payment Not Processing

1. Verify Stripe keys are correct (test vs live)
2. Check order was created in database
3. Verify Stripe session ID matches order
4. Check webhook delivery in Stripe dashboard

### Digital Download Not Working

1. Verify Supabase Storage bucket exists and is private
2. Check file_url is set correctly in shop_products
3. Verify download_token exists in shop_order_items
4. Check Service Role Key has storage permissions

## 🎉 Launch Checklist

Before going live with real payments:

- [ ] Switch Stripe to live mode (live keys)
- [ ] Update webhook endpoint to use live mode
- [ ] Test complete checkout flow with real card (then refund)
- [ ] Verify all email notifications work
- [ ] Upload all digital product files to storage
- [ ] Create real product listings with images
- [ ] Set up monitoring alerts (failed payments, webhook errors)
- [ ] Document admin processes for order fulfillment
- [ ] Train team on vendor onboarding process
- [ ] Test member benefit flows end-to-end

## 📚 Related Documentation

- `SUPABASE_STORAGE_SETUP.md` - Storage bucket configuration
- `../../database/seeds/001_shop_test_products.sql` - Test data
- `../../database/migrations/20250115_shop_schema.sql` - Database schema
- Shop API routes: `../api/shopRoutes.ts`
- Checkout routes: `../api/checkoutRoutes.ts`
- Stripe webhook: `../api/webhooks/stripeWebhook.ts`

---

**Status**: ✅ Backend complete and ready for deployment
**Next**: Build frontend UI or use Postman for API testing
**Priority**: Set up Supabase Storage bucket and upload first digital products
