/**
 * Campaign Tracking Service
 *
 * Tracks campaign-specific metrics for the "Meet AIvor" campaign.
 * Integrates with the chat endpoint to classify feature usage,
 * capture UTM parameters, and persist to campaign_metrics table.
 *
 * Feeds into the kaizen self-improvement loop via:
 * - get_campaign_health() SQL function (weekly health check)
 * - get_campaign_progress() SQL function (progress toward 100% target)
 * - snapshot_campaign_health() for trend persistence
 */

import { getSupabaseClient } from '../lib/supabaseClient.js'

// Feature classification regex patterns (mirrors SQL function)
const FEATURE_PATTERNS: Record<string, RegExp> = {
  events: /\b(event|what.?s on|this weekend|next week|happening|gig|party|social|gathering|meet.?up|calendar)\b/i,
  news: /\b(news|article|story|stories|update|latest|headline|what.?s new|community news|newsletter)\b/i,
  wellness: /\b(wellbeing|wellness|mental health|check.?in|how am i|feeling|stress|anxiety|depression|therapy|counsell|self.?care|journal)\b/i,
  learning: /\b(learn|study|interview|prep|problem.?solv|conflict|creative|goal|writing|resource|tool)\b/i,
  crisis: /\b(crisis|suicide|self.?harm|emergency|samaritan|switchboard|mindout|help.?line|urgent|danger)\b/i,
  voice: /\b(voice|speak|listen|audio|sound|read aloud|speaker)\b/i,
}

export interface CampaignTrackingData {
  sessionId: string
  userHash?: string
  message: string
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
  utmContent?: string
  metadata?: Record<string, unknown>
}

class CampaignTrackingService {
  private campaignSlug = 'meet-aivor'

  /**
   * Classify which platform feature a message is about
   */
  classifyFeature(message: string): string {
    for (const [feature, pattern] of Object.entries(FEATURE_PATTERNS)) {
      if (pattern.test(message)) return feature
    }
    return 'general'
  }

  /**
   * Track a conversation message for campaign metrics
   * Called from the /api/chat endpoint after processing
   */
  async trackConversation(data: CampaignTrackingData): Promise<void> {
    const supabase = getSupabaseClient()
    if (!supabase) return

    const feature = this.classifyFeature(data.message)

    const metrics = [
      // Track the conversation itself
      {
        campaign_slug: this.campaignSlug,
        metric_type: 'conversation',
        feature_name: feature,
        session_id: data.sessionId,
        user_hash: data.userHash,
        utm_source: data.utmSource,
        utm_medium: data.utmMedium,
        utm_campaign: data.utmCampaign,
        utm_content: data.utmContent,
        metadata: data.metadata || {},
      },
    ]

    // Also track feature-specific usage if not 'general'
    if (feature !== 'general') {
      metrics.push({
        campaign_slug: this.campaignSlug,
        metric_type: 'feature_usage',
        feature_name: feature,
        session_id: data.sessionId,
        user_hash: data.userHash,
        utm_source: data.utmSource,
        utm_medium: data.utmMedium,
        utm_campaign: data.utmCampaign,
        utm_content: data.utmContent,
        metadata: { ...data.metadata, classified_from: data.message.substring(0, 100) },
      })
    }

    const { error } = await supabase.from('campaign_metrics').insert(metrics)
    if (error) {
      console.error('[CampaignTracking] Insert failed:', error.message)
    }
  }

  /**
   * Track a widget open event
   */
  async trackWidgetOpen(data: {
    sessionId: string
    userHash?: string
    utmSource?: string
    utmCampaign?: string
    utmContent?: string
  }): Promise<void> {
    const supabase = getSupabaseClient()
    if (!supabase) return

    const { error } = await supabase.from('campaign_metrics').insert({
      campaign_slug: this.campaignSlug,
      metric_type: 'widget_open',
      session_id: data.sessionId,
      user_hash: data.userHash,
      utm_source: data.utmSource,
      utm_campaign: data.utmCampaign,
      utm_content: data.utmContent,
    })
    if (error) {
      console.error('[CampaignTracking] Widget open tracking failed:', error.message)
    }
  }

  /**
   * Track a social media click-through
   */
  async trackSocialClick(data: {
    utmSource: string
    utmCampaign: string
    utmContent: string
    userHash?: string
    metadata?: Record<string, unknown>
  }): Promise<void> {
    const supabase = getSupabaseClient()
    if (!supabase) return

    const { error } = await supabase.from('campaign_metrics').insert({
      campaign_slug: this.campaignSlug,
      metric_type: 'social_click',
      utm_source: data.utmSource,
      utm_campaign: data.utmCampaign,
      utm_content: data.utmContent,
      user_hash: data.userHash,
      metadata: data.metadata || {},
    })
    if (error) {
      console.error('[CampaignTracking] Social click tracking failed:', error.message)
    }
  }

  /**
   * Get campaign health via RPC function
   */
  async getCampaignHealth(): Promise<Record<string, unknown> | null> {
    const supabase = getSupabaseClient()
    if (!supabase) return null

    const { data, error } = await supabase.rpc('get_campaign_health', {
      p_campaign_slug: this.campaignSlug,
    })
    if (error) {
      console.error('[CampaignTracking] Health check failed:', error.message)
      return null
    }
    return data?.[0] || null
  }

  /**
   * Get campaign progress toward 100% target
   */
  async getCampaignProgress(): Promise<Record<string, unknown>[] | null> {
    const supabase = getSupabaseClient()
    if (!supabase) return null

    const { data, error } = await supabase.rpc('get_campaign_progress', {
      p_campaign_slug: this.campaignSlug,
    })
    if (error) {
      console.error('[CampaignTracking] Progress check failed:', error.message)
      return null
    }
    return data || null
  }

  /**
   * Trigger weekly health snapshot
   */
  async snapshotHealth(): Promise<void> {
    const supabase = getSupabaseClient()
    if (!supabase) return

    const { error } = await supabase.rpc('snapshot_campaign_health', {
      p_campaign_slug: this.campaignSlug,
    })
    if (error) {
      console.error('[CampaignTracking] Snapshot failed:', error.message)
    } else {
      console.log('[CampaignTracking] Weekly health snapshot saved')
    }
  }
}

export default new CampaignTrackingService()
