import express from 'express'
import { createClient } from '@supabase/supabase-js'

const router = express.Router()

// Graceful Supabase initialization (Jules' pattern)
const createNoOpSupabaseClient = () => {
  const handler = {
    get: (target: any, prop: string) => {
      if (prop === 'then') return undefined;
      return () => {
        console.warn(`[Shop Routes] Supabase ${prop} called but not configured`);
        return Promise.resolve({ data: null, error: { message: 'Supabase not configured' } });
      };
    }
  };
  return new Proxy({}, handler) as any;
};

// Initialize Supabase client only if credentials exist
const supabase = (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY)
  ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY)
  : createNoOpSupabaseClient()

// ============================================
// PRODUCTS ENDPOINTS
// ============================================

/**
 * GET /api/shop/products
 * List products with filtering and sorting
 */
router.get('/products', async (req, res) => {
  try {
    const {
      type,           // 'physical', 'digital', 'journal', 'marketplace'
      category,
      seasonal,       // 'pride-2025', 'black-history-month'
      featured,
      sort = 'created_at',
      order = 'desc',
      limit = 24,
      offset = 0
    } = req.query

    let query = supabase
      .from('shop_products')
      .select('*', { count: 'exact' })
      .eq('status', 'active')
      .not('published_at', 'is', null)

    if (type) query = query.eq('type', type)
    if (category) query = query.eq('category', category)
    if (seasonal) query = query.eq('seasonal_campaign', seasonal)
    if (featured === 'true') query = query.eq('featured', true)

    query = query
      .order(sort as string, { ascending: order === 'asc' })
      .range(Number(offset), Number(offset) + Number(limit) - 1)

    const { data: products, error, count } = await query

    if (error) throw error

    res.json({
      success: true,
      data: products,
      pagination: {
        total: count || 0,
        limit: Number(limit),
        offset: Number(offset)
      }
    })
  } catch (error) {
    console.error('Products list error:', error)
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch products'
    })
  }
})

/**
 * GET /api/shop/products/:slug
 * Get single product with full details
 */
router.get('/products/:slug', async (req, res) => {
  try {
    const { slug } = req.params

    const { data: product, error } = await supabase
      .from('shop_products')
      .select(`
        *,
        vendors (
          id,
          business_name,
          slug,
          logo_url,
          liberation_score,
          average_rating
        )
      `)
      .eq('slug', slug)
      .eq('status', 'active')
      .single()

    if (error) throw error
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' })
    }

    // Get average rating from reviews
    const { data: reviews } = await supabase
      .from('shop_reviews')
      .select('rating, liberation_impact_rating')
      .eq('product_id', product.id)
      .eq('status', 'approved')

    const avgRating = reviews?.length
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : null

    res.json({
      success: true,
      data: {
        ...product,
        average_rating: avgRating,
        review_count: reviews?.length || 0
      }
    })
  } catch (error) {
    console.error('Product detail error:', error)
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch product'
    })
  }
})

// ============================================
// CART ENDPOINTS
// ============================================

/**
 * GET /api/shop/cart
 * Get user's current cart
 */
router.get('/cart', async (req, res) => {
  try {
    const userId = req.query.user_id as string
    const sessionId = req.query.session_id as string

    if (!userId && !sessionId) {
      return res.status(400).json({ success: false, error: 'User ID or session ID required' })
    }

    let query = supabase
      .from('shop_carts')
      .select('*')
      .gt('expires_at', new Date().toISOString())

    if (userId) {
      query = query.eq('user_id', userId)
    } else if (sessionId) {
      query = query.eq('session_id', sessionId)
    }

    const { data: cart, error } = await query.maybeSingle()

    if (error && error.code !== 'PGRST116') throw error

    res.json({
      success: true,
      data: cart || { items: [] }
    })
  } catch (error) {
    console.error('Cart fetch error:', error)
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch cart'
    })
  }
})

/**
 * POST /api/shop/cart/add
 * Add item to cart
 */
router.post('/cart/add', async (req, res) => {
  try {
    const { product_id, quantity = 1, variant, user_id, session_id } = req.body

    if (!user_id && !session_id) {
      return res.status(400).json({ success: false, error: 'User ID or session ID required' })
    }

    // Validate product exists and is available
    const { data: product, error: productError } = await supabase
      .from('shop_products')
      .select('id, name, price_gbp, type, status')
      .eq('id', product_id)
      .eq('status', 'active')
      .single()

    if (productError || !product) {
      return res.status(404).json({ success: false, error: 'Product not found' })
    }

    // Get or create cart
    let cartQuery = supabase
      .from('shop_carts')
      .select('*')

    if (user_id) {
      cartQuery = cartQuery.eq('user_id', user_id)
    } else {
      cartQuery = cartQuery.eq('session_id', session_id)
    }

    const { data: existingCart } = await cartQuery.maybeSingle()

    const cartItem = {
      product_id,
      quantity,
      variant,
      price_gbp: product.price_gbp
    }

    if (existingCart) {
      // Update existing cart
      const items = existingCart.items || []
      const existingItemIndex = items.findIndex(
        (item: any) => item.product_id === product_id
      )

      if (existingItemIndex >= 0) {
        items[existingItemIndex].quantity += quantity
      } else {
        items.push(cartItem)
      }

      const { error: updateError } = await supabase
        .from('shop_carts')
        .update({ items, updated_at: new Date().toISOString() })
        .eq('id', existingCart.id)

      if (updateError) throw updateError
    } else {
      // Create new cart
      const { error: insertError } = await supabase
        .from('shop_carts')
        .insert({
          user_id: user_id || null,
          session_id: session_id || null,
          items: [cartItem]
        })

      if (insertError) throw insertError
    }

    res.json({
      success: true,
      message: 'Item added to cart'
    })
  } catch (error) {
    console.error('Cart add error:', error)
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to add item to cart'
    })
  }
})

/**
 * DELETE /api/shop/cart/remove
 * Remove item from cart
 */
router.delete('/cart/remove', async (req, res) => {
  try {
    const { product_id, user_id, session_id } = req.body

    let cartQuery = supabase
      .from('shop_carts')
      .select('*')

    if (user_id) {
      cartQuery = cartQuery.eq('user_id', user_id)
    } else if (session_id) {
      cartQuery = cartQuery.eq('session_id', session_id)
    } else {
      return res.status(400).json({ success: false, error: 'User ID or session ID required' })
    }

    const { data: cart } = await cartQuery.maybeSingle()

    if (!cart) {
      return res.status(404).json({ success: false, error: 'Cart not found' })
    }

    // Remove item from cart
    const items = (cart.items || []).filter((item: any) => item.product_id !== product_id)

    const { error } = await supabase
      .from('shop_carts')
      .update({ items, updated_at: new Date().toISOString() })
      .eq('id', cart.id)

    if (error) throw error

    res.json({
      success: true,
      message: 'Item removed from cart'
    })
  } catch (error) {
    console.error('Cart remove error:', error)
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to remove item from cart'
    })
  }
})

// ============================================
// VENDORS/MARKETPLACE ENDPOINTS
// ============================================

/**
 * GET /api/shop/vendors
 * List verified vendors
 */
router.get('/vendors', async (req, res) => {
  try {
    const { limit = 20, offset = 0 } = req.query

    const { data: vendors, error, count } = await supabase
      .from('vendors')
      .select('*', { count: 'exact' })
      .eq('verified', true)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .range(Number(offset), Number(offset) + Number(limit) - 1)

    if (error) throw error

    res.json({
      success: true,
      data: vendors,
      pagination: {
        total: count || 0,
        limit: Number(limit),
        offset: Number(offset)
      }
    })
  } catch (error) {
    console.error('Vendors list error:', error)
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch vendors'
    })
  }
})

/**
 * GET /api/shop/vendors/:slug
 * Get vendor profile with products
 */
router.get('/vendors/:slug', async (req, res) => {
  try {
    const { slug } = req.params

    const { data: vendor, error } = await supabase
      .from('vendors')
      .select(`
        *,
        shop_products!vendor_id (
          id,
          name,
          slug,
          thumbnail_url,
          price_gbp,
          category,
          status
        )
      `)
      .eq('slug', slug)
      .eq('status', 'active')
      .single()

    if (error) throw error

    res.json({
      success: true,
      data: vendor
    })
  } catch (error) {
    console.error('Vendor detail error:', error)
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch vendor'
    })
  }
})

/**
 * POST /api/shop/vendors/apply
 * Submit vendor application
 */
router.post('/vendors/apply', async (req, res) => {
  try {
    const {
      business_name,
      business_description,
      business_type,
      contact_email,
      website_url,
      values_alignment,
      incubator_interest,
      user_id
    } = req.body

    const slug = business_name.toLowerCase().replace(/[^a-z0-9]+/g, '-')

    // Create vendor application
    const { data: vendor, error } = await supabase
      .from('vendors')
      .insert({
        business_name,
        business_description,
        business_type,
        slug,
        owner_id: user_id,
        contact_email,
        website_url,
        values_alignment,
        status: 'pending',
        incubator_participant: incubator_interest || false
      })
      .select()
      .single()

    if (error) throw error

    res.json({
      success: true,
      data: vendor,
      message: 'Application submitted! Community voting will begin shortly.'
    })
  } catch (error) {
    console.error('Vendor application error:', error)
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to submit vendor application'
    })
  }
})

// ============================================
// REVIEWS ENDPOINTS
// ============================================

/**
 * GET /api/shop/reviews/:product_id
 * Get reviews for a product
 */
router.get('/reviews/:product_id', async (req, res) => {
  try {
    const { product_id } = req.params
    const { limit = 10, offset = 0 } = req.query

    const { data: reviews, error, count } = await supabase
      .from('shop_reviews')
      .select('*', { count: 'exact' })
      .eq('product_id', product_id)
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .range(Number(offset), Number(offset) + Number(limit) - 1)

    if (error) throw error

    res.json({
      success: true,
      data: reviews,
      pagination: {
        total: count || 0,
        limit: Number(limit),
        offset: Number(offset)
      }
    })
  } catch (error) {
    console.error('Reviews fetch error:', error)
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch reviews'
    })
  }
})

/**
 * POST /api/shop/reviews
 * Submit a product review
 */
router.post('/reviews', async (req, res) => {
  try {
    const {
      product_id,
      order_id,
      user_id,
      rating,
      liberation_impact_rating,
      title,
      review_text
    } = req.body

    // Verify user purchased this product
    const { data: orderItem, error: verifyError } = await supabase
      .from('shop_order_items')
      .select(`
        id,
        shop_orders!inner (
          customer_id,
          status
        )
      `)
      .eq('product_id', product_id)
      .eq('shop_orders.customer_id', user_id)
      .eq('shop_orders.status', 'completed')
      .single()

    if (verifyError || !orderItem) {
      return res.status(403).json({
        success: false,
        error: 'You must purchase this product before reviewing it'
      })
    }

    const { data: review, error } = await supabase
      .from('shop_reviews')
      .insert({
        product_id,
        order_id: orderItem.shop_orders[0]?.id,
        user_id,
        rating,
        liberation_impact_rating,
        title,
        review_text,
        verified_purchase: true,
        status: 'pending'
      })
      .select()
      .single()

    if (error) throw error

    res.json({
      success: true,
      data: review,
      message: 'Review submitted! It will be published after moderation.'
    })
  } catch (error) {
    console.error('Review submission error:', error)
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to submit review'
    })
  }
})

// ============================================
// MEMBER BENEFITS ENDPOINTS
// ============================================

/**
 * GET /api/shop/member-benefits/:user_id
 * Get member benefits for a user
 */
router.get('/member-benefits/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params

    const { data: benefits, error } = await supabase
      .from('member_benefits')
      .select('*')
      .eq('user_id', user_id)
      .eq('active', true)
      .single()

    if (error && error.code !== 'PGRST116') throw error

    res.json({
      success: true,
      data: benefits || null
    })
  } catch (error) {
    console.error('Member benefits error:', error)
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch member benefits'
    })
  }
})

// ============================================
// TRANSPARENCY ENDPOINTS
// ============================================

/**
 * GET /api/shop/transparency/metrics
 * Get shop impact metrics for transparency dashboard
 */
router.get('/transparency/metrics', async (req, res) => {
  try {
    // Get total revenue
    const { data: orders } = await supabase
      .from('shop_orders')
      .select('total_gbp, revenue_split')
      .eq('status', 'completed')

    const totalRevenue = orders?.reduce((sum, order) => sum + parseFloat(order.total_gbp), 0) || 0

    // Aggregate revenue splits
    const revenueSplit = orders?.reduce(
      (acc, order) => {
        const split = order.revenue_split || {}
        return {
          creators: acc.creators + (split.creator || 0),
          platform: acc.platform + (split.platform || 0),
          community: acc.community + (split.community || 0),
          production: acc.production + (split.production || 0)
        }
      },
      { creators: 0, platform: 0, community: 0, production: 0 }
    )

    // Get vendor count
    const { count: vendorCount } = await supabase
      .from('vendors')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')

    // Get featured vendors
    const { data: featuredVendors } = await supabase
      .from('vendors')
      .select('id, business_name, logo_url, business_description, total_revenue_gbp')
      .eq('status', 'active')
      .order('total_revenue_gbp', { ascending: false })
      .limit(6)

    res.json({
      success: true,
      data: {
        total_revenue: totalRevenue,
        businesses_supported: vendorCount || 0,
        programs_funded: 3, // Mock for now
        jobs_created: 12,   // Mock for now
        revenue_split: revenueSplit,
        featured_vendors: featuredVendors || [],
        monthly_reports: [] // TODO: Implement monthly reports
      }
    })
  } catch (error) {
    console.error('Transparency metrics error:', error)
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch transparency metrics'
    })
  }
})

export default router
