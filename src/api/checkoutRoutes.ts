import express from 'express'
import { createClient } from '@supabase/supabase-js'
import { PaymentService } from '../services/PaymentService.js'

const router = express.Router()

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || ''
)

const paymentService = new PaymentService()

/**
 * POST /api/checkout/create-order
 * Create order and Stripe checkout session
 */
router.post('/create-order', async (req, res) => {
  try {
    const {
      customer_id,
      customer_email,
      customer_name,
      cart_items, // Array of { product_id, quantity, variant }
      is_member = false,
      billing_address,
      shipping_address,
      customer_notes
    } = req.body

    // Validate required fields
    if (!customer_email || !customer_name || !cart_items || cart_items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: customer_email, customer_name, cart_items'
      })
    }

    // Fetch product details and validate availability
    const productIds = cart_items.map((item: any) => item.product_id)
    const { data: products, error: productError } = await supabase
      .from('shop_products')
      .select('*')
      .in('id', productIds)
      .eq('status', 'active')

    if (productError) throw productError

    if (products.length !== cart_items.length) {
      return res.status(400).json({
        success: false,
        error: 'Some products are no longer available'
      })
    }

    // Build cart with full product details
    const enrichedCartItems = cart_items.map((cartItem: any) => {
      const product = products.find(p => p.id === cartItem.product_id)
      if (!product) throw new Error(`Product ${cartItem.product_id} not found`)

      return {
        ...cartItem,
        product_name: product.name,
        product_type: product.type,
        product_slug: product.slug,
        price_gbp: product.price_gbp,
        short_description: product.short_description,
        thumbnail_url: product.thumbnail_url,
        profit_breakdown: product.profit_breakdown
      }
    })

    // Calculate totals
    const subtotal = enrichedCartItems.reduce(
      (sum: number, item: any) => sum + (parseFloat(item.price_gbp) * item.quantity),
      0
    )

    // Calculate shipping (free for digital-only orders)
    const hasPhysicalItems = enrichedCartItems.some(
      (item: any) => item.product_type === 'physical' || item.product_type === 'journal'
    )
    const shipping = hasPhysicalItems ? 4.50 : 0 // £4.50 UK shipping

    // Member discount (if applicable)
    let discount = 0
    if (is_member && customer_id) {
      const { data: benefits } = await supabase
        .from('member_benefits')
        .select('discount_percentage, free_shipping')
        .eq('user_id', customer_id)
        .eq('active', true)
        .single()

      if (benefits) {
        discount = subtotal * (benefits.discount_percentage / 100)
        // Free shipping for supporters and patrons
        if (benefits.free_shipping && hasPhysicalItems) {
          // Shipping already calculated, will be zeroed in total
        }
      }
    }

    const total = subtotal - discount + shipping

    // Calculate revenue split
    const revenueSplit = PaymentService.calculateRevenueSplit(enrichedCartItems)

    // Generate order number
    const orderNumber = `BLK-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('shop_orders')
      .insert({
        order_number: orderNumber,
        customer_id: customer_id || null,
        customer_email,
        customer_name,
        is_member,
        status: 'pending',
        payment_status: 'pending',
        subtotal_gbp: subtotal.toFixed(2),
        discount_gbp: discount.toFixed(2),
        shipping_gbp: shipping.toFixed(2),
        total_gbp: total.toFixed(2),
        revenue_split: revenueSplit,
        billing_address,
        shipping_address,
        customer_notes
      })
      .select()
      .single()

    if (orderError) throw orderError

    // Create order items
    const orderItemsData = enrichedCartItems.map((item: any) => {
      const itemRevenueSplit = {
        creator: (parseFloat(item.price_gbp) * (item.profit_breakdown.creator || 0)) / 100,
        platform: (parseFloat(item.price_gbp) * (item.profit_breakdown.platform || 0)) / 100,
        community: (parseFloat(item.price_gbp) * (item.profit_breakdown.community || 0)) / 100,
        production: (parseFloat(item.price_gbp) * (item.profit_breakdown.production || 0)) / 100,
        vendor: item.vendor_id ? (parseFloat(item.price_gbp) * 0.85) : 0 // 85% to vendor, 15% commission
      }

      return {
        order_id: order.id,
        product_id: item.product_id,
        vendor_id: item.vendor_id || null,
        product_name: item.product_name,
        product_type: item.product_type,
        product_slug: item.product_slug,
        price_gbp: parseFloat(item.price_gbp),
        quantity: item.quantity,
        item_revenue_split: itemRevenueSplit
      }
    })

    const { error: itemsError } = await supabase
      .from('shop_order_items')
      .insert(orderItemsData)

    if (itemsError) throw itemsError

    // Create Stripe checkout session
    const session = await paymentService.createCheckoutSession(order, enrichedCartItems)

    res.json({
      success: true,
      data: {
        order_id: order.id,
        order_number: orderNumber,
        checkout_url: session.url,
        session_id: session.id,
        total_gbp: total.toFixed(2)
      }
    })

  } catch (error) {
    console.error('Checkout error:', error)
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create checkout session'
    })
  }
})

/**
 * GET /api/checkout/order/:order_id
 * Get order details
 */
router.get('/order/:order_id', async (req, res) => {
  try {
    const { order_id } = req.params

    const { data: order, error } = await supabase
      .from('shop_orders')
      .select(`
        *,
        shop_order_items (
          *,
          shop_products (
            name,
            thumbnail_url,
            type
          )
        )
      `)
      .eq('id', order_id)
      .single()

    if (error) throw error

    res.json({
      success: true,
      data: order
    })

  } catch (error) {
    console.error('Order fetch error:', error)
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch order'
    })
  }
})

/**
 * GET /api/checkout/download/:download_token
 * Generate signed download URL for digital products
 */
router.get('/download/:download_token', async (req, res) => {
  try {
    const { download_token } = req.params
    const user_id = req.query.user_id as string

    if (!user_id) {
      return res.status(401).json({
        success: false,
        error: 'User authentication required'
      })
    }

    // This would typically use JournalService but we'll implement inline
    const { data: orderItem, error } = await supabase
      .from('shop_order_items')
      .select(`
        *,
        shop_orders!inner (
          customer_id,
          status
        ),
        shop_products!inner (
          file_url,
          name
        )
      `)
      .eq('download_token', download_token)
      .single()

    if (error || !orderItem) {
      return res.status(404).json({
        success: false,
        error: 'Invalid download token'
      })
    }

    // Verify ownership
    if (orderItem.shop_orders.customer_id !== user_id) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized access'
      })
    }

    // Check expiration
    if (new Date(orderItem.download_expires_at) < new Date()) {
      return res.status(410).json({
        success: false,
        error: 'Download link has expired'
      })
    }

    // Generate signed URL (5 minutes)
    const { data: signedUrl, error: storageError } = await supabase.storage
      .from('digital-products')
      .createSignedUrl(orderItem.shop_products.file_url, 300)

    if (storageError) throw storageError

    // Log download
    await supabase.from('shop_downloads').insert({
      order_item_id: orderItem.id,
      user_id,
      download_token
    })

    // Increment download count
    await supabase
      .from('shop_order_items')
      .update({ download_count: (orderItem.download_count || 0) + 1 })
      .eq('id', orderItem.id)

    res.json({
      success: true,
      data: {
        download_url: signedUrl.signedUrl,
        product_name: orderItem.shop_products.name,
        downloads_remaining: 5 - ((orderItem.download_count || 0) + 1),
        expires_in_minutes: 5
      }
    })

  } catch (error) {
    console.error('Download URL generation error:', error)
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate download URL'
    })
  }
})

export default router
