import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || ''
)

export class JournalService {

  /**
   * Claim free digital journal as member benefit
   */
  async claimMemberJournal(userId: string, memberBenefits: any) {
    try {
      // Get digital journal product
      const { data: digitalJournal, error: productError } = await supabase
        .from('shop_products')
        .select('id, file_url, name')
        .eq('type', 'journal')
        .eq('name', 'BLKOUT Liberation Journal (Digital)')
        .single()

      if (productError || !digitalJournal) {
        throw new Error('Digital journal product not found')
      }

      // Get user email for order record
      const { data: user } = await supabase.auth.admin.getUserById(userId)

      if (!user) {
        throw new Error('User not found')
      }

      // Create "order" for tracking (£0.00 transaction)
      const orderNumber = `BLK-MEMBER-${Date.now()}`

      const { data: order, error: orderError } = await supabase
        .from('shop_orders')
        .insert({
          order_number: orderNumber,
          customer_id: userId,
          customer_email: user.user.email || '',
          customer_name: user.user.user_metadata?.full_name || 'Member',
          total_gbp: 0,
          subtotal_gbp: 0,
          status: 'completed',
          payment_status: 'succeeded',
          is_member: true,
          revenue_split: {
            creator: 0,
            platform: 0,
            community: 0,
            production: 0
          }
        })
        .select()
        .single()

      if (orderError) throw orderError

      // Create order item with download token
      const downloadToken = crypto.randomUUID()
      const expiresAt = new Date()
      expiresAt.setFullYear(expiresAt.getFullYear() + 1) // 1 year access for members

      const { data: orderItem, error: itemError } = await supabase
        .from('shop_order_items')
        .insert({
          order_id: order.id,
          product_id: digitalJournal.id,
          product_name: digitalJournal.name,
          product_type: 'journal',
          product_slug: 'blkout-liberation-journal-digital',
          price_gbp: 0,
          download_token: downloadToken,
          download_expires_at: expiresAt.toISOString(),
          fulfillment_status: 'digital_sent',
          item_revenue_split: {
            creator: 0,
            platform: 0,
            community: 0,
            production: 0
          }
        })
        .select()
        .single()

      if (itemError) throw itemError

      // Mark benefit as claimed
      await supabase
        .from('member_benefits')
        .update({ journal_digital_access: true })
        .eq('user_id', userId)

      console.log(`✅ Member ${userId} claimed digital journal benefit`)

      return {
        download_url: `/api/shop/download/${downloadToken}`,
        expires_at: orderItem.download_expires_at,
        order_number: orderNumber
      }

    } catch (error) {
      console.error('Member journal claim error:', error)
      throw new Error(`Failed to claim member journal: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Apply member discount to physical journal
   */
  async applyMemberDiscount(userId: string, productId: string) {
    try {
      const { data: benefits, error: benefitsError } = await supabase
        .from('member_benefits')
        .select('discount_percentage, active, tier')
        .eq('user_id', userId)
        .single()

      if (benefitsError || !benefits || !benefits.active) {
        return null
      }

      const { data: product, error: productError } = await supabase
        .from('shop_products')
        .select('price_gbp, type, name')
        .eq('id', productId)
        .single()

      if (productError || !product) return null

      // Members get 40% off physical journal (£24.50 → £14.70)
      const memberDiscount = product.type === 'journal' ? 40 : benefits.discount_percentage
      const discount = (parseFloat(product.price_gbp) * memberDiscount) / 100
      const discountedPrice = parseFloat(product.price_gbp) - discount

      return {
        original_price: parseFloat(product.price_gbp),
        discount_percentage: memberDiscount,
        discount_amount: discount,
        final_price: discountedPrice,
        member_tier: benefits.tier
      }

    } catch (error) {
      console.error('Member discount calculation error:', error)
      return null
    }
  }

  /**
   * Generate secure download URL for digital journal
   */
  async generateDownloadUrl(downloadToken: string, userId: string) {
    try {
      // Verify download token is valid and belongs to user
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
        .eq('download_token', downloadToken)
        .single()

      if (error || !orderItem) {
        throw new Error('Invalid download token')
      }

      // Check if download has expired
      if (new Date(orderItem.download_expires_at) < new Date()) {
        throw new Error('Download link has expired')
      }

      // Check download limit (5 downloads max)
      if (orderItem.download_count >= 5) {
        throw new Error('Download limit exceeded')
      }

      // Verify user owns this order
      if (orderItem.shop_orders.customer_id !== userId) {
        throw new Error('Unauthorized access')
      }

      // Generate signed URL from Supabase Storage (5 minutes validity)
      const { data: signedUrl, error: storageError } = await supabase.storage
        .from('digital-products')
        .createSignedUrl(orderItem.shop_products.file_url, 300)

      if (storageError) throw storageError

      // Log download
      await supabase.from('shop_downloads').insert({
        order_item_id: orderItem.id,
        user_id: userId,
        download_token: downloadToken
      })

      // Increment download count
      await supabase
        .from('shop_order_items')
        .update({ download_count: orderItem.download_count + 1 })
        .eq('id', orderItem.id)

      console.log(`✅ Generated download URL for user ${userId}`)

      return {
        download_url: signedUrl.signedUrl,
        product_name: orderItem.shop_products.name,
        downloads_remaining: 5 - (orderItem.download_count + 1),
        expires_at: orderItem.download_expires_at
      }

    } catch (error) {
      console.error('Download URL generation error:', error)
      throw new Error(`Failed to generate download URL: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Create member benefit record for new member
   */
  async createMemberBenefit(userId: string, tier: 'standard' | 'supporter' | 'patron' = 'standard') {
    try {
      const benefits = {
        standard: {
          discount_percentage: 0,
          free_shipping: false,
          early_access_products: false
        },
        supporter: {
          discount_percentage: 10,
          free_shipping: true,
          early_access_products: true
        },
        patron: {
          discount_percentage: 20,
          free_shipping: true,
          early_access_products: true
        }
      }

      const tierBenefits = benefits[tier]

      const { data, error } = await supabase
        .from('member_benefits')
        .insert({
          user_id: userId,
          tier,
          journal_digital_access: false, // Not claimed yet
          ...tierBenefits,
          active: true
        })
        .select()
        .single()

      if (error) throw error

      console.log(`✅ Created ${tier} member benefits for user ${userId}`)

      return data

    } catch (error) {
      console.error('Member benefit creation error:', error)
      throw new Error(`Failed to create member benefit: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Get journal content prompts for a specific day
   */
  async getJournalPrompt(day: number): Promise<{
    day: number
    week: number
    theme: string
    prompt: string
    category: string
  }> {
    // Mock journal prompts (would be stored in database or JSON file)
    const prompts = this.get90DayPrompts()

    if (day < 1 || day > 90) {
      throw new Error('Day must be between 1 and 90')
    }

    return prompts[day - 1]
  }

  /**
   * Get all 90-day journal prompts
   * TODO: Move this to database or external JSON file
   */
  private get90DayPrompts() {
    // Simplified example - would have 90 unique prompts
    const themes = [
      { week: 1, theme: 'Self-Discovery', category: 'Identity' },
      { week: 2, theme: 'Community Connection', category: 'Relationships' },
      { week: 3, theme: 'Ancestors & Legacy', category: 'Heritage' },
      { week: 4, theme: 'Joy & Celebration', category: 'Wellness' },
      { week: 5, theme: 'Boundaries & Protection', category: 'Self-Care' },
      { week: 6, theme: 'Activism & Action', category: 'Liberation' },
      { week: 7, theme: 'Rest & Restoration', category: 'Wellness' },
      { week: 8, theme: 'Relationships & Love', category: 'Connection' },
      { week: 9, theme: 'Creativity & Expression', category: 'Identity' },
      { week: 10, theme: 'Healing & Growth', category: 'Transformation' },
      { week: 11, theme: 'Future Vision', category: 'Purpose' },
      { week: 12, theme: 'Liberation Practice', category: 'Freedom' }
    ]

    const prompts = []

    for (let day = 1; day <= 90; day++) {
      const weekIndex = Math.floor((day - 1) / 7) % 12
      const theme = themes[weekIndex]

      prompts.push({
        day,
        week: theme.week,
        theme: theme.theme,
        category: theme.category,
        prompt: `Day ${day}: ${theme.theme} - What does this theme mean to you today?`
      })
    }

    return prompts
  }
}

export default JournalService
