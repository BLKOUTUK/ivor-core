# BLKOUT Shop - Quick Start Guide

## ✅ What's Complete

The BLKOUT Shop backend is **fully implemented and ready for testing**. Here's what you have:

### 🗄️ Database (Complete)
- ✅ All 9 shop tables created in Supabase
- ✅ 3 test products inserted (digital journal, physical journal, zine)
- ✅ Indexes and constraints applied
- ✅ Revenue-sharing model configured

### 🔌 API Endpoints (Complete)

**Shop Browsing**:
- `GET /api/shop/products` - List products with filters
- `GET /api/shop/products/:slug` - Get single product
- `GET /api/shop/vendors` - List marketplace vendors
- `GET /api/shop/vendors/:slug` - Get vendor profile

**Shopping Cart**:
- `GET /api/shop/cart` - Get user's cart
- `POST /api/shop/cart/add` - Add item to cart
- `DELETE /api/shop/cart/remove` - Remove item

**Checkout**:
- `POST /api/checkout/create-order` - Create order + Stripe session
- `GET /api/checkout/order/:order_id` - Get order details
- `GET /api/checkout/download/:token` - Download digital products

**Reviews**:
- `GET /api/shop/reviews/:product_id` - Get product reviews
- `POST /api/shop/reviews` - Submit review

**Vendors**:
- `POST /api/shop/vendors/apply` - Submit vendor application

**Webhooks**:
- `POST /api/webhooks/stripe` - Process Stripe payment events

### 💳 Payment Processing (Complete)
- ✅ Stripe integration with UK configuration
- ✅ Checkout session creation
- ✅ Webhook handling for payment events
- ✅ Digital product delivery automation
- ✅ Event ticket generation
- ✅ Vendor payout calculation

### 📦 Services (Complete)
- ✅ **PaymentService**: Stripe integration, refunds, webhooks
- ✅ **VendorService**: Vendor onboarding, payouts, incubator management
- ✅ **JournalService**: Digital downloads, member benefits, journal prompts

## 🚀 Quick Test

### 1. Test Product Listing

```bash
curl https://ivor.blkoutuk.cloud/api/shop/products | jq
```

**Expected**: JSON with 3 products

### 2. Test Single Product

```bash
curl https://ivor.blkoutuk.cloud/api/shop/products/blkout-liberation-journal-digital | jq
```

**Expected**: Product details with vendor info

### 3. Test Checkout Flow

```bash
curl -X POST https://ivor.blkoutuk.cloud/api/checkout/create-order \
  -H "Content-Type: application/json" \
  -d '{
    "customer_email": "test@blkoutuk.com",
    "customer_name": "Test User",
    "cart_items": [
      {
        "product_id": "GET_FROM_PRODUCTS_LIST",
        "quantity": 1
      }
    ]
  }' | jq
```

**Expected**: Checkout URL to Stripe

## 📋 Before Going Live

### Required Setup (5 minutes)

1. **Create Supabase Storage Bucket**:
   - Go to Supabase Dashboard → Storage
   - Create bucket: `digital-products` (private)
   - Apply RLS policies (see `SUPABASE_STORAGE_SETUP.md`)

2. **Configure Stripe**:
   - Get API keys from https://dashboard.stripe.com/apikeys
   - Set environment variables in Coolify:
     ```
     STRIPE_SECRET_KEY=sk_test_...
     STRIPE_PUBLISHABLE_KEY=pk_test_...
     STRIPE_WEBHOOK_SECRET=whsec_...
     VITE_APP_URL=https://blkoutuk.com
     ```

3. **Setup Stripe Webhook**:
   - Go to https://dashboard.stripe.com/webhooks
   - Add endpoint: `https://ivor.blkoutuk.cloud/api/webhooks/stripe`
   - Select events: `checkout.session.completed`, `payment_intent.succeeded`, etc.
   - Copy signing secret to `STRIPE_WEBHOOK_SECRET`

### Optional Enhancements

- Upload real product images
- Create more test products
- Build frontend UI (products listing, cart, checkout)
- Set up email notifications
- Configure Teemill integration for physical merch

## 📚 Documentation

- **Deployment Guide**: `SHOP_DEPLOYMENT_GUIDE.md` - Complete deployment checklist
- **Admin Guide**: `SHOP_ADMIN_GUIDE.md` - Daily operations and vendor management
- **Storage Setup**: `SUPABASE_STORAGE_SETUP.md` - Digital products storage configuration
- **Test Data**: `../database/seeds/001_shop_test_products.sql` - Sample products

## 🎯 Next Steps

1. **Deploy backend** to Coolify with Stripe env vars
2. **Test API endpoints** with Postman or curl
3. **Build frontend UI** or use Stripe Payment Links for MVP
4. **Upload digital products** to Supabase Storage
5. **Test end-to-end flow** with Stripe test cards

## 🐛 Troubleshooting

**Products not showing up?**
→ Check status is 'active' and published_at is set

**Stripe checkout fails?**
→ Verify STRIPE_SECRET_KEY is correct (test vs live)

**Webhook not firing?**
→ Check webhook signing secret matches Stripe dashboard

**Digital download 404?**
→ Verify file exists in Supabase Storage `digital-products` bucket

---

**Status**: ✅ Ready for deployment and testing
**Time to deploy**: ~10 minutes (with Stripe setup)
**Backend completeness**: 100%
**Frontend needed**: Yes (products page, cart, checkout UI)
