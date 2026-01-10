import express from 'express'
import Stripe from 'stripe'
import { PaymentService } from '../../services/PaymentService.js'

const router = express.Router()

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-12-18.acacia',
})

const paymentService = new PaymentService()

/**
 * POST /api/webhooks/stripe
 * Handle Stripe webhook events
 *
 * IMPORTANT: This endpoint must use raw body parsing
 * Add this to server.ts BEFORE the JSON body parser:
 * app.use('/api/webhooks/stripe', express.raw({ type: 'application/json' }))
 */
router.post('/', async (req, res) => {
  const sig = req.headers['stripe-signature'] as string

  if (!sig) {
    console.error('Missing Stripe signature header')
    return res.status(400).send('Missing signature')
  }

  let event: Stripe.Event

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return res.status(400).send(`Webhook Error: ${err instanceof Error ? err.message : 'Unknown error'}`)
  }

  // Log webhook event
  console.log(`✅ Stripe webhook received: ${event.type}`)

  try {
    // Handle the event
    await paymentService.handleWebhook(event)

    // Return 200 to acknowledge receipt
    res.json({ received: true })
  } catch (error) {
    console.error('Webhook handler error:', error)
    // Still return 200 to prevent Stripe from retrying
    res.status(500).json({
      error: 'Webhook handler failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

export default router
