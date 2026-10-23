import express from 'express'
import crypto from 'crypto'
import { getSupabaseClient } from '../../lib/supabaseClient.js'

const router = express.Router()

// Signature tolerance recommended by Zeffy (https://api.zeffy.com/api/docs, "Verifying the signature")
const TOLERANCE_SECONDS = 5 * 60

/**
 * Zeffy-Signature: `t=<unix seconds>,v1=<hex>` where v1 = HMAC-SHA256(secret, `${t}.${rawBody}`).
 */
export function verifyZeffySignature(
  rawBody: Buffer,
  header: string | undefined,
  secret: string,
  nowSeconds = Math.floor(Date.now() / 1000)
): boolean {
  if (!header || !secret) return false
  const parts = Object.fromEntries(
    header.split(',').map(p => {
      const i = p.indexOf('=')
      return [p.slice(0, i).trim(), p.slice(i + 1).trim()]
    })
  )
  const t = Number(parts.t)
  const v1 = parts.v1
  if (!Number.isFinite(t) || !v1) return false
  if (Math.abs(nowSeconds - t) > TOLERANCE_SECONDS) return false

  const expected = crypto.createHmac('sha256', secret).update(`${t}.`).update(rawBody).digest('hex')
  const a = Buffer.from(expected, 'hex')
  const b = Buffer.from(v1, 'hex')
  return a.length === b.length && crypto.timingSafeEqual(a, b)
}

/**
 * Zeffy Payment object -> print_orders row.
 * Shop products arrive as items: parent_rate_title = product, rate_title = variant (e.g. size);
 * a product with no variants has only rate_title. One item per unit bought.
 */
export function toPrintOrder(event: any) {
  const p = event.data
  const buyer = p.buyer || {}
  const name = [buyer.first_name, buyer.last_name].filter(Boolean).join(' ') || null
  return {
    zeffy_payment_id: p.id,
    zeffy_event_id: event.id,
    zeffy_campaign_id: p.campaign_id,
    buyer_email: buyer.email ?? null,
    buyer_name: name,
    shipping_address: buyer.address ?? null,
    items: (p.items || []).map((it: any) => ({
      product: it.parent_rate_title ?? it.rate_title,
      variant: it.parent_rate_title ? it.rate_title : null,
      rate_id: it.rate_id,
      type: it.type,
      amount_pence: it.amount,
    })),
    buyer_answers: p.buyer_questions || [],
    amount_pence: p.amount,
    currency: p.currency,
    paid_at: new Date(p.created * 1000).toISOString(),
  }
}

/**
 * POST /api/webhooks/zeffy
 * Zeffy payment.completed for the print range store -> public.print_orders (status 'received').
 *
 * Mounted with express.raw() BEFORE express.json() in server.ts: the signature covers the raw body.
 * Env: ZEFFY_WEBHOOK_SECRET (whsec_..., Zeffy Settings → Integrations → Webhook),
 *      ZEFFY_PRINT_CAMPAIGN_ID (the print range store form; other Zeffy payments are ignored).
 */
router.post('/', async (req, res) => {
  const rawBody = req.body as Buffer
  if (!Buffer.isBuffer(rawBody)) {
    console.error('[Zeffy Webhook] Body was parsed before the raw handler; check mount order in server.ts')
    return res.status(500).send('Misconfigured')
  }

  const secret = process.env.ZEFFY_WEBHOOK_SECRET || ''
  if (!verifyZeffySignature(rawBody, req.headers['zeffy-signature'] as string | undefined, secret)) {
    console.error('[Zeffy Webhook] Signature verification FAILED')
    return res.status(400).send('Invalid signature')
  }

  let event: any
  try {
    event = JSON.parse(rawBody.toString('utf8'))
  } catch {
    return res.status(400).send('Invalid JSON')
  }

  if (event.type !== 'payment.completed') {
    return res.json({ received: true, ignored: event.type })
  }
  const campaignId = process.env.ZEFFY_PRINT_CAMPAIGN_ID
  if (!campaignId || event.data?.campaign_id !== campaignId) {
    return res.json({ received: true, ignored: 'not the print range store' })
  }

  const supabase = getSupabaseClient()
  if (!supabase) {
    // 500 so Zeffy retries (up to 3 days) once the database is reachable
    return res.status(500).send('Database not configured')
  }

  // Retries carry the same payment: the unique zeffy_payment_id makes this a no-op the second time
  const row = toPrintOrder(event)
  const { error } = await supabase
    .from('print_orders')
    .upsert(row, { onConflict: 'zeffy_payment_id', ignoreDuplicates: true })
  if (error) {
    console.error('[Zeffy Webhook] print_orders insert FAILED:', error.message)
    return res.status(500).send('Insert failed')
  }

  // WTTB Print API: forward the order here once WTTB send docs + sandbox (access requested 22 Oct 2026).
  // Until then status stays 'received' and the order is placed by hand on wttb.co.uk.
  console.log(`[Zeffy Webhook] print order recorded: payment ${row.zeffy_payment_id}, ${row.items.length} item(s)`)
  return res.json({ received: true })
})

export default router
