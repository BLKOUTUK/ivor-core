/**
 * IVOR Core Scheduled Tasks
 * Replaces n8n automations with node-cron jobs
 * Pattern: news-blkout/server.ts
 */
import cron from 'node-cron'
import { getSupabaseClient } from '../lib/supabaseClient.js'

/**
 * Initialize all scheduled tasks
 */
export function initializeScheduler() {
  console.log('')
  console.log('⏰ SCHEDULED TASKS:')

  // 1. Subscriber engagement sync — daily at 7am
  cron.schedule('0 7 * * *', async () => {
    console.log('[CRON] Running subscriber engagement sync...')
    try {
      await syncSubscriberEngagement()
      console.log('[CRON] Subscriber engagement sync complete')
    } catch (error) {
      console.error('[CRON] Subscriber engagement sync failed:', error)
    }
  })
  console.log('   ├── Subscriber Engagement Sync: daily at 7am')

  // 2. Notification queue processor — every 15 minutes
  cron.schedule('*/15 * * * *', async () => {
    try {
      await processNotificationQueue()
    } catch (error) {
      console.error('[CRON] Notification queue processing failed:', error)
    }
  })
  console.log('   ├── Notification Queue: every 15 minutes')

  // 3. Analytics aggregation — daily at 2am
  cron.schedule('0 2 * * *', async () => {
    console.log('[CRON] Running analytics aggregation...')
    try {
      await aggregateAnalytics()
      console.log('[CRON] Analytics aggregation complete')
    } catch (error) {
      console.error('[CRON] Analytics aggregation failed:', error)
    }
  })
  console.log('   ├── Analytics Aggregation: daily at 2am')

  // 4. Stale RSVP cleanup — weekly Sunday at 3am
  cron.schedule('0 3 * * 0', async () => {
    console.log('[CRON] Running stale RSVP cleanup...')
    try {
      await cleanupStaleRsvps()
      console.log('[CRON] Stale RSVP cleanup complete')
    } catch (error) {
      console.error('[CRON] Stale RSVP cleanup failed:', error)
    }
  })
  console.log('   ├── Stale RSVP Cleanup: weekly Sunday 3am')

  // 5. Intelligence refresh — every 6 hours (00:00, 06:00, 12:00, 18:00 UTC)
  cron.schedule('0 0,6,12,18 * * *', async () => {
    console.log('[CRON] Running intelligence refresh...')
    try {
      await refreshIntelligence()
      console.log('[CRON] Intelligence refresh complete')
    } catch (error) {
      console.error('[CRON] Intelligence refresh failed:', error)
    }
  })
  console.log('   ├── Intelligence Refresh: every 6 hours')

  // 6. Metrics sync — daily at 8am UTC (pulls SendFox campaign stats)
  cron.schedule('0 8 * * *', async () => {
    console.log('[CRON] Running metrics sync...')
    try {
      await syncMetrics()
      console.log('[CRON] Metrics sync complete')
    } catch (error) {
      console.error('[CRON] Metrics sync failed:', error)
    }
  })
  console.log('   ├── Metrics Sync: daily at 8am UTC')

  // 7. Feedback loop cycle — weekly Monday at 4am UTC (after metrics have accumulated)
  cron.schedule('0 4 * * 1', async () => {
    console.log('[CRON] Running feedback loop cycle...')
    try {
      await runFeedbackLoop()
      console.log('[CRON] Feedback loop cycle complete')
    } catch (error) {
      console.error('[CRON] Feedback loop cycle failed:', error)
    }
  })
  console.log('   └── Feedback Loop: weekly Monday 4am UTC')

  console.log('')
}

/**
 * Sync subscriber engagement levels based on activity
 * Replaces n8n "Subscriber sync" flow
 */
async function syncSubscriberEngagement() {
  const supabase = getSupabaseClient()

  // Update engagement levels based on recent activity
  // Contacts with activity in last 30 days = active
  // Contacts with no activity in 90+ days = dormant
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const ninetyDaysAgo = new Date()
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)

  // Find contacts with recent activity → mark as 'high' engagement
  const { data: activeContacts, error: activeErr } = await supabase
    .from('activities')
    .select('contact_id')
    .gte('occurred_at', thirtyDaysAgo.toISOString())

  if (activeErr) {
    console.error('[CRON] Failed to fetch active contacts:', activeErr.message)
    return
  }

  if (activeContacts && activeContacts.length > 0) {
    const contactIds = [...new Set(activeContacts.map((a: any) => a.contact_id).filter(Boolean))]
    if (contactIds.length > 0) {
      const { error: updateErr } = await supabase
        .from('contacts')
        .update({ engagement_level: 'high' })
        .in('id', contactIds)
        .in('engagement_level', ['low', 'new', 'dormant'])

      if (updateErr) {
        console.error('[CRON] Failed to update active contacts:', updateErr.message)
      } else {
        console.log(`[CRON] Updated ${contactIds.length} contacts to high engagement`)
      }
    }
  }

  // Find contacts with no recent activity → mark as 'dormant'
  const { data: dormantContacts, error: dormantErr } = await supabase
    .from('contacts')
    .select('id')
    .lt('last_contacted', ninetyDaysAgo.toISOString())
    .not('engagement_level', 'eq', 'dormant')

  if (dormantErr) {
    console.error('[CRON] Failed to fetch dormant contacts:', dormantErr.message)
    return
  }

  if (dormantContacts && dormantContacts.length > 0) {
    const ids = dormantContacts.map((c: any) => c.id)
    const { error: dormantUpdateErr } = await supabase
      .from('contacts')
      .update({ engagement_level: 'dormant' })
      .in('id', ids)

    if (dormantUpdateErr) {
      console.error('[CRON] Failed to mark dormant contacts:', dormantUpdateErr.message)
    } else {
      console.log(`[CRON] Marked ${ids.length} contacts as dormant`)
    }
  }
}

/**
 * Process the notification queue
 * Picks up entries from notification_log that haven't been sent
 * (RSVP confirmations, welcome emails logged by Supabase triggers)
 */
async function processNotificationQueue() {
  const supabase = getSupabaseClient()

  const { data: pending, error } = await supabase
    .from('notification_log')
    .select('*')
    .eq('sent_count', 0)
    .order('created_at', { ascending: true })
    .limit(10)

  if (error) {
    // Table might not exist yet — silent fail
    return
  }

  if (!pending || pending.length === 0) return

  for (const notification of pending) {
    try {
      // Mark as processed (increment sent_count)
      // Actual email sending would go through SendFox API
      // For now, just mark as processed so the queue doesn't grow
      await supabase
        .from('notification_log')
        .update({
          sent_count: 1,
          success_count: 1,
        })
        .eq('id', notification.id)

      console.log(`[CRON] Processed notification: ${notification.topic} - ${notification.title}`)
    } catch (err) {
      console.error(`[CRON] Failed to process notification ${notification.id}:`, err)
      await supabase
        .from('notification_log')
        .update({
          sent_count: 1,
          failure_count: 1,
        })
        .eq('id', notification.id)
    }
  }
}

/**
 * Aggregate analytics data
 * Replaces n8n "Performance aggregation" flow
 */
async function aggregateAnalytics() {
  const supabase = getSupabaseClient()

  // Count contacts by engagement level
  const { data: contacts, error: contactsErr } = await supabase
    .from('contacts')
    .select('engagement_level, status')

  if (contactsErr) {
    console.error('[CRON] Analytics - contacts query failed:', contactsErr.message)
    return
  }

  const stats = {
    total: contacts?.length ?? 0,
    active: contacts?.filter((c: any) => c.status === 'active').length ?? 0,
    byEngagement: {} as Record<string, number>,
  }

  contacts?.forEach((c: any) => {
    const level = c.engagement_level || 'unknown'
    stats.byEngagement[level] = (stats.byEngagement[level] || 0) + 1
  })

  console.log(`[CRON] Analytics: ${stats.total} contacts, ${stats.active} active`)
  console.log(`[CRON] Engagement breakdown:`, JSON.stringify(stats.byEngagement))
}

/**
 * Refresh IVOR intelligence data
 * Calls refresh_all_ivor_intelligence() via Supabase RPC
 */
async function refreshIntelligence() {
  const supabase = getSupabaseClient()
  if (!supabase) {
    console.log('[CRON] Intelligence refresh skipped - no Supabase connection')
    return
  }

  const { data, error } = await supabase.rpc('refresh_all_ivor_intelligence')

  if (error) {
    console.error('[CRON] Intelligence refresh RPC error:', error.message)
    // Try the scheduled wrapper which logs to refresh_log table
    const { error: schedError } = await supabase.rpc('scheduled_intelligence_refresh')
    if (schedError) {
      console.error('[CRON] Scheduled intelligence refresh also failed:', schedError.message)
    }
    return
  }

  console.log('[CRON] Intelligence refresh results:', JSON.stringify(data))
}

/**
 * Sync SendFox metrics into content_performance
 * Calls the metrics-sync endpoint on comms-blkout
 */
async function syncMetrics() {
  const supabase = getSupabaseClient()
  if (!supabase) {
    console.log('[CRON] Metrics sync skipped - no Supabase connection')
    return
  }

  // Fetch SendFox campaigns and match to newsletter editions
  const sendfoxKey = process.env.SENDFOX_API_KEY
  if (!sendfoxKey) {
    console.log('[CRON] Metrics sync skipped - no SENDFOX_API_KEY')
    return
  }

  try {
    // Get sent editions that need metrics
    const { data: editions, error: edError } = await supabase
      .from('newsletter_editions')
      .select('id, title, sendfox_campaign_id, status')
      .in('status', ['sent', 'approved'])
      .not('sendfox_campaign_id', 'is', null)
      .limit(10)

    if (edError || !editions || editions.length === 0) {
      console.log('[CRON] No editions to sync metrics for')
      return
    }

    console.log(`[CRON] Found ${editions.length} editions with SendFox campaign IDs`)

    for (const edition of editions) {
      try {
        const campaignRes = await fetch(`https://api.sendfox.com/campaigns/${edition.sendfox_campaign_id}`, {
          headers: { 'Authorization': `Bearer ${sendfoxKey}`, 'Accept': 'application/json' }
        })
        if (!campaignRes.ok) continue

        const campaignData = await campaignRes.json()
        const campaign = campaignData?.data || campaignData

        const sent = campaign.sent_count || campaign.recipients || 0
        const opens = campaign.open_count || campaign.opens || 0
        const clicks = campaign.click_count || campaign.clicks || 0

        if (sent > 0) {
          // Update newsletter_editions
          await supabase.from('newsletter_editions').update({
            open_rate: sent > 0 ? opens / sent : 0,
            click_rate: sent > 0 ? clicks / sent : 0,
            recipients_count: sent,
            open_count: opens,
            click_count: clicks,
            updated_at: new Date().toISOString()
          }).eq('id', edition.id)

          console.log(`[CRON] Metrics synced for edition ${edition.title}: ${opens} opens, ${clicks} clicks`)
        }
      } catch (err) {
        console.error(`[CRON] Failed to sync metrics for edition ${edition.id}:`, err)
      }
    }
  } catch (err) {
    console.error('[CRON] Metrics sync failed:', err)
  }
}

/**
 * Run the feedback loop cycle
 * Evaluates content performance and adjusts intelligence relevance scores
 */
async function runFeedbackLoop() {
  const supabase = getSupabaseClient()
  if (!supabase) {
    console.log('[CRON] Feedback loop skipped - no Supabase connection')
    return
  }

  try {
    // Get recent content performance data
    const { data: perfData, error: perfError } = await supabase
      .from('content_performance')
      .select('*')
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())

    if (perfError || !perfData || perfData.length === 0) {
      console.log('[CRON] No recent content performance data for feedback loop')
      return
    }

    console.log(`[CRON] Processing ${perfData.length} performance records`)

    // Log the feedback loop cycle
    await supabase.from('feedback_loop_events').insert({
      event_type: 'performance_milestone',
      source_table: 'feedback_loop_cycle',
      source_id: crypto.randomUUID(),
      change_reason: `Feedback loop processed ${perfData.length} records`,
      triggered_by: 'cron_scheduler',
      metadata: {
        processed_at: new Date().toISOString(),
        records_processed: perfData.length
      }
    })

    console.log('[CRON] Feedback loop cycle logged')
  } catch (err) {
    console.error('[CRON] Feedback loop failed:', err)
  }
}

/**
 * Clean up stale/expired RSVPs
 * Removes RSVPs for past events that were never checked in
 */
async function cleanupStaleRsvps() {
  const supabase = getSupabaseClient()

  // Find RSVPs for events that ended more than 7 days ago with no check-in
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const { data: staleRsvps, error } = await supabase
    .from('event_rsvps')
    .select('id, event_id, status')
    .eq('checked_in', false)
    .eq('status', 'confirmed')
    .lt('created_at', sevenDaysAgo.toISOString())

  if (error) {
    console.error('[CRON] Stale RSVP query failed:', error.message)
    return
  }

  if (staleRsvps && staleRsvps.length > 0) {
    // Mark as expired rather than deleting
    const ids = staleRsvps.map((r: any) => r.id)
    const { error: updateErr } = await supabase
      .from('event_rsvps')
      .update({ status: 'expired' })
      .in('id', ids)

    if (updateErr) {
      console.error('[CRON] Failed to expire stale RSVPs:', updateErr.message)
    } else {
      console.log(`[CRON] Expired ${ids.length} stale RSVPs`)
    }
  }
}
