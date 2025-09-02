import express from 'express'
import { createClient } from '@supabase/supabase-js'

const router = express.Router()

// Initialize Supabase client (only if environment variables are available)
const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY

let supabase: any = null
if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey)
} else {
  console.warn('Supabase not configured - using memory-only mode for social media routes')
}

// In-memory storage for workflow status (in production, use Redis or database)
let workflowStatus = {
  masterWorkflow: { id: 'RVlayfQOX6SSnY3U', name: 'BLKOUT Media Master', status: 'unknown', lastRun: null },
  contentGeneration: { id: 'content-gen', name: 'Content Generation', status: 'unknown', lastRun: null },
  linkedinPosting: { id: 'linkedin-post', name: 'LinkedIn Posting', status: 'unknown', lastRun: null },
  twitterPosting: { id: 'twitter-post', name: 'Twitter Posting', status: 'unknown', lastRun: null },
  instagramPosting: { id: 'instagram-post', name: 'Instagram Posting', status: 'unknown', lastRun: null },
  youtubePosting: { id: 'youtube-post', name: 'YouTube Posting', status: 'unknown', lastRun: null }
}

let contentCalendar: any[] = []
let socialAnalytics = {
  postsToday: 0,
  totalPosts: 0,
  engagementRate: 0,
  errors: 0,
  lastUpdated: new Date().toISOString()
}

// ==========================================
// N8N WEBHOOK ENDPOINTS
// ==========================================

// Master webhook for all N8N workflow status updates
router.post('/webhook/n8n/status', async (req, res) => {
  try {
    const { workflowId, workflowName, status, executionId, data, timestamp } = req.body
    
    console.log(`N8N Webhook received - Workflow: ${workflowName}, Status: ${status}`)
    
    // Update workflow status
    const workflowKey = Object.keys(workflowStatus).find(key => 
      workflowStatus[key].id === workflowId || 
      workflowStatus[key].name.toLowerCase().includes(workflowName?.toLowerCase() || '')
    )
    
    if (workflowKey) {
      workflowStatus[workflowKey] = {
        ...workflowStatus[workflowKey],
        status: status || 'completed',
        lastRun: timestamp || new Date().toISOString(),
        executionId: executionId,
        data: data
      }
    }
    
    // Store in database for persistence
    try {
      await supabase
        .from('n8n_workflow_status')
        .upsert({
          workflow_id: workflowId,
          workflow_name: workflowName,
          status: status,
          execution_id: executionId,
          data: data,
          updated_at: new Date().toISOString()
        })
    } catch (dbError) {
      console.log('Database storage failed, using memory:', dbError.message)
    }
    
    res.json({ 
      success: true, 
      message: 'Workflow status updated',
      workflowId,
      status 
    })
  } catch (error) {
    console.error('N8N webhook error:', error)
    res.status(500).json({ error: 'Failed to process webhook', details: error.message })
  }
})

// Content generation webhook - receives AI-generated content
router.post('/webhook/n8n/content', async (req, res) => {
  try {
    const { contentId, platform, content, imageUrl, scheduledTime, status } = req.body
    
    console.log(`Content webhook received - Platform: ${platform}, Status: ${status}`)
    
    // Add to content calendar
    const contentItem = {
      id: contentId || `content_${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      platform: platform,
      content: content,
      imageUrl: imageUrl,
      scheduledTime: scheduledTime,
      status: status || 'ready',
      createdAt: new Date().toISOString()
    }
    
    // Update in-memory calendar
    const existingIndex = contentCalendar.findIndex(item => item.id === contentItem.id)
    if (existingIndex >= 0) {
      contentCalendar[existingIndex] = contentItem
    } else {
      contentCalendar.push(contentItem)
    }
    
    // Store in database
    try {
      await supabase
        .from('social_content_calendar')
        .upsert(contentItem)
    } catch (dbError) {
      console.log('Calendar storage failed, using memory:', dbError.message)
    }
    
    res.json({ 
      success: true, 
      message: 'Content added to calendar',
      contentId: contentItem.id 
    })
  } catch (error) {
    console.error('Content webhook error:', error)
    res.status(500).json({ error: 'Failed to process content', details: error.message })
  }
})

// Posting status webhook - receives posting success/failure updates
router.post('/webhook/n8n/posting', async (req, res) => {
  try {
    const { contentId, platform, status, postId, error, metrics } = req.body
    
    console.log(`Posting webhook received - Platform: ${platform}, Status: ${status}`)
    
    // Update content calendar item
    const contentIndex = contentCalendar.findIndex(item => item.id === contentId)
    if (contentIndex >= 0) {
      contentCalendar[contentIndex] = {
        ...contentCalendar[contentIndex],
        postStatus: status,
        postId: postId,
        postError: error,
        metrics: metrics,
        postedAt: status === 'posted' ? new Date().toISOString() : undefined
      }
    }
    
    // Update analytics
    if (status === 'posted') {
      socialAnalytics.postsToday += 1
      socialAnalytics.totalPosts += 1
    } else if (status === 'failed') {
      socialAnalytics.errors += 1
    }
    
    socialAnalytics.lastUpdated = new Date().toISOString()
    
    // Store in database
    try {
      await supabase
        .from('social_posting_log')
        .insert({
          content_id: contentId,
          platform: platform,
          status: status,
          post_id: postId,
          error_message: error,
          metrics: metrics,
          posted_at: new Date().toISOString()
        })
    } catch (dbError) {
      console.log('Posting log storage failed:', dbError.message)
    }
    
    res.json({ 
      success: true, 
      message: 'Posting status updated',
      contentId,
      platform,
      status 
    })
  } catch (error) {
    console.error('Posting webhook error:', error)
    res.status(500).json({ error: 'Failed to process posting status', details: error.message })
  }
})

// ==========================================
// ADMIN DASHBOARD API ENDPOINTS
// ==========================================

// Get workflow status dashboard
router.get('/dashboard/status', async (req, res) => {
  try {
    // Get latest status from database if available
    try {
      const { data: dbStatus } = await supabase
        .from('n8n_workflow_status')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(10)
      
      if (dbStatus && dbStatus.length > 0) {
        // Merge database status with memory status
        dbStatus.forEach(item => {
          const key = Object.keys(workflowStatus).find(k => 
            workflowStatus[k].id === item.workflow_id
          )
          if (key) {
            workflowStatus[key] = {
              ...workflowStatus[key],
              status: item.status,
              lastRun: item.updated_at
            }
          }
        })
      }
    } catch (dbError) {
      console.log('Using memory status due to DB error:', dbError.message)
    }
    
    res.json({
      workflows: workflowStatus,
      analytics: socialAnalytics,
      lastUpdated: new Date().toISOString()
    })
  } catch (error) {
    console.error('Dashboard status error:', error)
    res.status(500).json({ error: 'Failed to get dashboard status' })
  }
})

// Get content calendar
router.get('/dashboard/calendar', async (req, res) => {
  try {
    const { date, platform } = req.query
    
    let calendar = [...contentCalendar]
    
    // Try to get from database too
    try {
      const { data: dbCalendar } = await supabase
        .from('social_content_calendar')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)
      
      if (dbCalendar && dbCalendar.length > 0) {
        // Merge and deduplicate
        const mergedIds = new Set(calendar.map(item => item.id))
        dbCalendar.forEach(item => {
          if (!mergedIds.has(item.id)) {
            calendar.push({
              id: item.id,
              date: item.date,
              platform: item.platform,
              content: item.content,
              imageUrl: item.imageUrl,
              scheduledTime: item.scheduledTime,
              status: item.status,
              createdAt: item.createdAt
            })
          }
        })
      }
    } catch (dbError) {
      console.log('Using memory calendar due to DB error:', dbError.message)
    }
    
    // Filter by date if provided
    if (date) {
      calendar = calendar.filter(item => item.date === date)
    }
    
    // Filter by platform if provided
    if (platform) {
      calendar = calendar.filter(item => item.platform === platform)
    }
    
    // Sort by scheduled time
    calendar.sort((a, b) => new Date(a.scheduledTime || a.createdAt).getTime() - new Date(b.scheduledTime || b.createdAt).getTime())
    
    res.json({
      calendar: calendar,
      totalItems: calendar.length,
      filters: { date, platform }
    })
  } catch (error) {
    console.error('Calendar error:', error)
    res.status(500).json({ error: 'Failed to get content calendar' })
  }
})

// Manual workflow trigger endpoint
router.post('/workflow/trigger', async (req, res) => {
  try {
    const { workflowType, platform, urgent } = req.body
    
    // N8N webhook URLs (these would be configured in your N8N instance)
    const n8nWebhooks = {
      contentGeneration: process.env.N8N_CONTENT_WEBHOOK || 'https://your-n8n-instance.com/webhook/content-generation',
      posting: process.env.N8N_POSTING_WEBHOOK || 'https://your-n8n-instance.com/webhook/posting',
      masterWorkflow: process.env.N8N_MASTER_WEBHOOK || 'https://your-n8n-instance.com/webhook/master-workflow'
    }
    
    const webhookUrl = n8nWebhooks[workflowType] || n8nWebhooks.masterWorkflow
    
    // Trigger N8N workflow
    const triggerData = {
      trigger: 'admin_manual',
      platform: platform,
      urgent: urgent || false,
      timestamp: new Date().toISOString(),
      source: 'blkout_admin_panel'
    }
    
    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(triggerData)
      })
      
      if (response.ok) {
        res.json({ 
          success: true, 
          message: `${workflowType} workflow triggered successfully`,
          workflowType,
          platform 
        })
      } else {
        throw new Error(`N8N responded with status ${response.status}`)
      }
    } catch (fetchError) {
      // If N8N is not accessible, simulate success for development
      console.log('N8N trigger failed, simulating success:', fetchError.message)
      res.json({ 
        success: true, 
        message: `${workflowType} workflow triggered (simulated)`,
        workflowType,
        platform,
        note: 'N8N instance not accessible - simulated response' 
      })
    }
  } catch (error) {
    console.error('Workflow trigger error:', error)
    res.status(500).json({ error: 'Failed to trigger workflow', details: error.message })
  }
})

// Emergency posting endpoint
router.post('/emergency/post', async (req, res) => {
  try {
    const { content, platforms, urgent } = req.body
    
    if (!content || !platforms || platforms.length === 0) {
      return res.status(400).json({ error: 'Content and platforms are required' })
    }
    
    const results = []
    
    for (const platform of platforms) {
      // Create emergency content item
      const emergencyContent = {
        id: `emergency_${platform}_${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        platform: platform,
        content: content,
        scheduledTime: new Date().toISOString(),
        status: 'posting',
        urgent: true,
        createdAt: new Date().toISOString()
      }
      
      contentCalendar.push(emergencyContent)
      
      // Trigger immediate posting workflow
      const postingWebhook = process.env.N8N_EMERGENCY_WEBHOOK || 'https://your-n8n-instance.com/webhook/emergency-post'
      
      try {
        await fetch(postingWebhook, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contentId: emergencyContent.id,
            platform: platform,
            content: content,
            urgent: true,
            source: 'admin_emergency'
          })
        })
        
        results.push({ platform, status: 'triggered', contentId: emergencyContent.id })
      } catch (postError) {
        console.log(`Emergency post failed for ${platform}:`, postError.message)
        results.push({ platform, status: 'failed', error: postError.message })
      }
    }
    
    res.json({
      success: true,
      message: 'Emergency posting initiated',
      results: results,
      contentIds: results.map(r => r.contentId).filter(Boolean)
    })
  } catch (error) {
    console.error('Emergency posting error:', error)
    res.status(500).json({ error: 'Failed to initiate emergency posting' })
  }
})

export default router