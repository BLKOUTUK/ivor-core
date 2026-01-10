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

export class VendorService {

  /**
   * Onboard vendor to Stripe Connect
   */
  async onboardVendor(vendorId: string) {
    try {
      const { data: vendor, error } = await supabase
        .from('vendors')
        .select('*')
        .eq('id', vendorId)
        .single()

      if (error || !vendor) throw new Error('Vendor not found')

      // Create Stripe Connect Express account (UK-based)
      const account = await stripe.accounts.create({
        type: 'express',
        country: 'GB',
        email: vendor.contact_email,
        business_type: 'individual', // Default, can be updated to 'company' later
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        metadata: {
          vendor_id: vendorId,
          business_name: vendor.business_name
        }
      })

      // Generate onboarding link
      const accountLink = await stripe.accountLinks.create({
        account: account.id,
        refresh_url: `${process.env.VITE_APP_URL}/vendors/onboarding/refresh`,
        return_url: `${process.env.VITE_APP_URL}/vendors/dashboard`,
        type: 'account_onboarding',
      })

      // Save Stripe account ID to vendor record
      await supabase
        .from('vendors')
        .update({ stripe_account_id: account.id })
        .eq('id', vendorId)

      return {
        onboarding_url: accountLink.url,
        stripe_account_id: account.id
      }

    } catch (error) {
      console.error('Vendor onboarding error:', error)
      throw new Error(`Vendor onboarding failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Check if vendor's Stripe Connect account is fully onboarded
   */
  async checkOnboardingStatus(vendorId: string) {
    try {
      const { data: vendor } = await supabase
        .from('vendors')
        .select('stripe_account_id')
        .eq('id', vendorId)
        .single()

      if (!vendor?.stripe_account_id) {
        return { onboarded: false, charges_enabled: false, payouts_enabled: false }
      }

      // Retrieve account from Stripe
      const account = await stripe.accounts.retrieve(vendor.stripe_account_id)

      return {
        onboarded: account.details_submitted,
        charges_enabled: account.charges_enabled,
        payouts_enabled: account.payouts_enabled,
        requirements: account.requirements
      }

    } catch (error) {
      console.error('Onboarding status check error:', error)
      throw error
    }
  }

  /**
   * Process weekly vendor payouts
   * This should be run as a cron job every week
   */
  async processVendorPayouts() {
    try {
      // Get all active vendors with pending payouts
      const { data: vendors } = await supabase
        .from('vendors')
        .select('id, stripe_account_id, business_name, payout_schedule')
        .eq('status', 'active')
        .not('stripe_account_id', 'is', null)

      if (!vendors || vendors.length === 0) {
        console.log('No vendors to process for payouts')
        return []
      }

      const results = []
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

      for (const vendor of vendors) {
        try {
          // Calculate payout amount from completed orders in the last week
          const { data: orderItems } = await supabase
            .from('shop_order_items')
            .select(`
              *,
              shop_orders!inner (
                status,
                completed_at
              )
            `)
            .eq('vendor_id', vendor.id)
            .eq('shop_orders.status', 'completed')
            .gte('shop_orders.completed_at', oneWeekAgo)

          if (!orderItems || orderItems.length === 0) continue

          // Calculate vendor's share from revenue splits
          const totalAmount = orderItems.reduce((sum, item) => {
            const vendorShare = parseFloat(item.item_revenue_split?.vendor || 0)
            return sum + vendorShare
          }, 0)

          // Minimum £10 payout threshold
          if (totalAmount < 10) {
            console.log(`Vendor ${vendor.business_name} below £10 threshold: £${totalAmount.toFixed(2)}`)
            continue
          }

          // Create Stripe transfer to vendor's connected account
          const transfer = await stripe.transfers.create({
            amount: Math.round(totalAmount * 100), // Convert to pence
            currency: 'gbp',
            destination: vendor.stripe_account_id,
            description: `Weekly payout for ${orderItems.length} orders`,
            metadata: {
              vendor_id: vendor.id,
              payout_date: new Date().toISOString(),
              order_count: orderItems.length
            }
          })

          results.push({
            vendor_id: vendor.id,
            business_name: vendor.business_name,
            amount: totalAmount,
            order_count: orderItems.length,
            transfer_id: transfer.id,
            status: 'success'
          })

          // Update vendor revenue tracking
          await supabase
            .from('vendors')
            .update({
              total_revenue_gbp: supabase.sql`total_revenue_gbp + ${totalAmount}`,
              total_orders: supabase.sql`total_orders + ${orderItems.length}`
            })
            .eq('id', vendor.id)

          console.log(`✅ Paid ${vendor.business_name}: £${totalAmount.toFixed(2)}`)

        } catch (vendorError) {
          console.error(`Error processing payout for vendor ${vendor.id}:`, vendorError)
          results.push({
            vendor_id: vendor.id,
            business_name: vendor.business_name,
            status: 'failed',
            error: vendorError instanceof Error ? vendorError.message : 'Unknown error'
          })
        }
      }

      return results

    } catch (error) {
      console.error('Payout processing error:', error)
      throw new Error(`Payout processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Enroll vendor in incubator program
   */
  async enrollInIncubator(vendorId: string, tier: 'aspiring' | 'emerging' | 'established') {
    try {
      const cohort = `${new Date().getFullYear()}-Q${Math.ceil((new Date().getMonth() + 1) / 3)}`

      const { data, error } = await supabase
        .from('incubator_participants')
        .insert({
          vendor_id: vendorId,
          cohort,
          tier,
          training_progress: {}
        })
        .select()
        .single()

      if (error) throw error

      // Update vendor record
      await supabase
        .from('vendors')
        .update({
          incubator_participant: true,
          incubator_tier: tier
        })
        .eq('id', vendorId)

      console.log(`✅ Enrolled vendor ${vendorId} in incubator: ${tier} tier, cohort ${cohort}`)

      return data

    } catch (error) {
      console.error('Incubator enrollment error:', error)
      throw new Error(`Incubator enrollment failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Check vendor graduation eligibility from incubator
   */
  async checkGraduationEligibility(vendorId: string) {
    const { data: participant } = await supabase
      .from('incubator_participants')
      .select('*')
      .eq('vendor_id', vendorId)
      .single()

    if (!participant) return { eligible: false, reason: 'Not enrolled in incubator' }

    const criteria = {
      aspiring: {
        min_sales: 10,
        min_revenue: 250,
        min_training: 3
      },
      emerging: {
        min_sales: 50,
        min_revenue: 5000,
        min_training: 6
      },
      established: {
        min_sales: 200,
        min_revenue: 20000,
        min_training: 8
      }
    }

    const tierCriteria = criteria[participant.tier as keyof typeof criteria]
    const trainingCompleted = Object.values(participant.training_progress || {}).filter(
      (module: any) => module?.completed
    ).length

    const eligible =
      participant.test_products_sold >= tierCriteria.min_sales &&
      participant.test_revenue_gbp >= tierCriteria.min_revenue &&
      trainingCompleted >= tierCriteria.min_training

    return {
      eligible,
      criteria: tierCriteria,
      current: {
        sales: participant.test_products_sold,
        revenue: participant.test_revenue_gbp,
        training: trainingCompleted
      },
      progress: {
        sales: Math.min(100, (participant.test_products_sold / tierCriteria.min_sales) * 100),
        revenue: Math.min(100, (participant.test_revenue_gbp / tierCriteria.min_revenue) * 100),
        training: Math.min(100, (trainingCompleted / tierCriteria.min_training) * 100)
      }
    }
  }

  /**
   * Mark incubator participant as graduated
   */
  async graduateParticipant(vendorId: string) {
    try {
      const { error } = await supabase
        .from('incubator_participants')
        .update({
          graduated: true,
          graduated_at: new Date().toISOString(),
          ready_for_graduation: true
        })
        .eq('vendor_id', vendorId)

      if (error) throw error

      // Update vendor commission rate (graduated alumni get reduced commission)
      await supabase
        .from('shop_products')
        .update({
          commission_rate: 5.00 // Reduced from 10-15% to 5% for graduated alumni
        })
        .eq('vendor_id', vendorId)

      console.log(`✅ Graduated vendor ${vendorId} from incubator`)

      return { success: true, message: 'Vendor graduated successfully' }

    } catch (error) {
      console.error('Graduation error:', error)
      throw new Error(`Graduation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Update vendor training progress
   */
  async updateTrainingProgress(vendorId: string, moduleId: string, completed: boolean, score?: number) {
    try {
      const { data: participant } = await supabase
        .from('incubator_participants')
        .select('training_progress')
        .eq('vendor_id', vendorId)
        .single()

      if (!participant) throw new Error('Vendor not enrolled in incubator')

      const trainingProgress = participant.training_progress || {}
      trainingProgress[moduleId] = {
        completed,
        score,
        completed_at: completed ? new Date().toISOString() : null
      }

      await supabase
        .from('incubator_participants')
        .update({ training_progress: trainingProgress })
        .eq('vendor_id', vendorId)

      return { success: true, training_progress: trainingProgress }

    } catch (error) {
      console.error('Training progress update error:', error)
      throw error
    }
  }
}

export default VendorService
