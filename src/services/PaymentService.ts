import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

// Initialize Stripe with UK configuration
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-12-18.acacia',
})

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || ''
)

export class PaymentService {

  /**
   * Create Stripe checkout session for shop purchase
   */
  async createCheckoutSession(order: any, cartItems: any[]) {
    try {
      // Calculate line items for Stripe
      const lineItems = cartItems.map(item => ({
        price_data: {
          currency: 'gbp',
          product_data: {
            name: item.product_name || item.name,
            description: item.short_description || '',
            images: item.thumbnail_url ? [item.thumbnail_url] : [],
          },
          unit_amount: Math.round(parseFloat(item.price_gbp) * 100), // Convert to pence
        },
        quantity: item.quantity || 1,
      }))

      // Add shipping if applicable
      const hasPhysicalItems = cartItems.some(
        item => item.type === 'physical' || item.type === 'journal'
      )

      if (hasPhysicalItems && parseFloat(order.shipping_gbp) > 0) {
        lineItems.push({
          price_data: {
            currency: 'gbp',
            product_data: {
              name: 'Shipping',
              description: 'UK delivery (3-5 business days)',
            },
            unit_amount: Math.round(parseFloat(order.shipping_gbp) * 100),
          },
          quantity: 1,
        })
      }

      // Create Stripe checkout session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: lineItems,
        mode: 'payment',
        success_url: `${process.env.VITE_APP_URL}/shop/order-confirmation?session_id={CHECKOUT_SESSION_ID}&order_id=${order.id}`,
        cancel_url: `${process.env.VITE_APP_URL}/shop/cart`,
        customer_email: order.customer_email,
        metadata: {
          order_id: order.id,
          order_number: order.order_number,
          is_member: order.is_member ? 'true' : 'false',
        },
        shipping_address_collection: hasPhysicalItems ? {
          allowed_countries: ['GB'], // UK only for now
        } : undefined,
      })

      // Update order with Stripe session ID
      await supabase
        .from('shop_orders')
        .update({
          stripe_payment_intent_id: session.payment_intent as string,
          updated_at: new Date().toISOString()
        })
        .eq('id', order.id)

      return session

    } catch (error) {
      console.error('Stripe checkout session creation error:', error)
      throw new Error(`Failed to create checkout session: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Handle Stripe webhook events
   */
  async handleWebhook(event: Stripe.Event) {
    try {
      switch (event.type) {
        case 'checkout.session.completed':
          await this.handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session)
          break

        case 'payment_intent.succeeded':
          await this.handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent)
          break

        case 'payment_intent.payment_failed':
          await this.handlePaymentFailed(event.data.object as Stripe.PaymentIntent)
          break

        case 'charge.refunded':
          await this.handleRefund(event.data.object as Stripe.Charge)
          break

        default:
          console.log(`Unhandled webhook event type: ${event.type}`)
      }
    } catch (error) {
      console.error('Webhook handling error:', error)
      throw error
    }
  }

  /**
   * Handle successful checkout session
   */
  private async handleCheckoutCompleted(session: Stripe.Checkout.Session) {
    const orderId = session.metadata?.order_id

    if (!orderId) {
      console.error('No order_id in checkout session metadata')
      return
    }

    try {
      // Update order status
      await supabase
        .from('shop_orders')
        .update({
          status: 'processing',
          payment_status: 'succeeded',
          completed_at: new Date().toISOString(),
          shipping_address: session.shipping_details?.address as any,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)

      // Process digital product deliveries
      await this.processDigitalDeliveries(orderId)

      // Process ticket deliveries
      await this.processTicketDeliveries(orderId)

      console.log(`Order ${orderId} payment completed successfully`)
    } catch (error) {
      console.error('Error handling checkout completion:', error)
      throw error
    }
  }

  /**
   * Handle successful payment intent
   */
  private async handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
    try {
      // Update order payment status if not already updated
      await supabase
        .from('shop_orders')
        .update({
          payment_status: 'succeeded',
          stripe_charge_id: paymentIntent.latest_charge as string,
          updated_at: new Date().toISOString()
        })
        .eq('stripe_payment_intent_id', paymentIntent.id)

      console.log(`Payment intent ${paymentIntent.id} succeeded`)
    } catch (error) {
      console.error('Error handling payment success:', error)
    }
  }

  /**
   * Handle failed payment intent
   */
  private async handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
    try {
      await supabase
        .from('shop_orders')
        .update({
          status: 'failed',
          payment_status: 'failed',
          admin_notes: `Payment failed: ${paymentIntent.last_payment_error?.message || 'Unknown error'}`,
          updated_at: new Date().toISOString()
        })
        .eq('stripe_payment_intent_id', paymentIntent.id)

      console.log(`Payment intent ${paymentIntent.id} failed`)
    } catch (error) {
      console.error('Error handling payment failure:', error)
    }
  }

  /**
   * Handle refund
   */
  private async handleRefund(charge: Stripe.Charge) {
    try {
      await supabase
        .from('shop_orders')
        .update({
          status: 'refunded',
          payment_status: 'refunded',
          admin_notes: `Refunded: ${charge.amount_refunded / 100} GBP`,
          updated_at: new Date().toISOString()
        })
        .eq('stripe_charge_id', charge.id)

      console.log(`Charge ${charge.id} refunded`)
    } catch (error) {
      console.error('Error handling refund:', error)
    }
  }

  /**
   * Process digital product deliveries
   */
  private async processDigitalDeliveries(orderId: string) {
    try {
      const { data: orderItems } = await supabase
        .from('shop_order_items')
        .select('id, product_id, product_type, shop_products!inner (file_url)')
        .eq('order_id', orderId)
        .in('product_type', ['digital', 'journal'])

      if (!orderItems || orderItems.length === 0) return

      for (const item of orderItems) {
        const downloadToken = crypto.randomUUID()
        const expiresAt = new Date()
        expiresAt.setDate(expiresAt.getDate() + 30) // 30 days access

        // Update order item with download token
        await supabase
          .from('shop_order_items')
          .update({
            download_token: downloadToken,
            download_expires_at: expiresAt.toISOString(),
            fulfillment_status: 'digital_sent'
          })
          .eq('id', item.id)
      }

      console.log(`Processed ${orderItems.length} digital deliveries for order ${orderId}`)
    } catch (error) {
      console.error('Error processing digital deliveries:', error)
    }
  }

  /**
   * Process event ticket deliveries
   */
  private async processTicketDeliveries(orderId: string) {
    try {
      const { data: orderItems } = await supabase
        .from('shop_order_items')
        .select('id, product_id, product_type, quantity')
        .eq('order_id', orderId)
        .eq('product_type', 'ticket')

      if (!orderItems || orderItems.length === 0) return

      for (const item of orderItems) {
        // Generate unique ticket codes (would integrate with QR code generation)
        const ticketCode = `BLKOUT-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`

        await supabase
          .from('shop_order_items')
          .update({
            ticket_code: ticketCode,
            fulfillment_status: 'digital_sent'
          })
          .eq('id', item.id)
      }

      console.log(`Processed ${orderItems.length} ticket deliveries for order ${orderId}`)
    } catch (error) {
      console.error('Error processing ticket deliveries:', error)
    }
  }

  /**
   * Calculate revenue split for cart items
   */
  static calculateRevenueSplit(cartItems: any[]): any {
    const split = {
      creator: 0,
      platform: 0,
      community: 0,
      production: 0
    }

    for (const item of cartItems) {
      const itemPrice = parseFloat(item.price_gbp) * (item.quantity || 1)
      const breakdown = item.profit_breakdown || {}

      split.creator += itemPrice * (breakdown.creator || 0) / 100
      split.platform += itemPrice * (breakdown.platform || 0) / 100
      split.community += itemPrice * (breakdown.community || 0) / 100
      split.production += itemPrice * (breakdown.production || 0) / 100
    }

    return split
  }

  /**
   * Create refund for an order
   */
  async createRefund(orderId: string, amount?: number, reason?: string) {
    try {
      // Get order
      const { data: order, error: orderError } = await supabase
        .from('shop_orders')
        .select('stripe_payment_intent_id, stripe_charge_id, total_gbp')
        .eq('id', orderId)
        .single()

      if (orderError || !order) {
        throw new Error('Order not found')
      }

      if (!order.stripe_charge_id) {
        throw new Error('No Stripe charge ID found for this order')
      }

      // Create refund via Stripe
      const refund = await stripe.refunds.create({
        charge: order.stripe_charge_id,
        amount: amount ? Math.round(amount * 100) : undefined, // Partial or full refund
        reason: reason as Stripe.RefundCreateParams.Reason,
      })

      // Update order status
      await supabase
        .from('shop_orders')
        .update({
          status: 'refunded',
          payment_status: 'refunded',
          admin_notes: `Refunded: ${refund.amount / 100} GBP. Reason: ${reason || 'Not specified'}`,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)

      return refund

    } catch (error) {
      console.error('Refund creation error:', error)
      throw new Error(`Failed to create refund: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }
}

export default PaymentService
