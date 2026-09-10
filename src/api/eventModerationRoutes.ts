/**
 * Event Moderation Routes
 * Community safety and content moderation for events
 *
 * Liberation Feature: Protecting community spaces
 *
 * AUTH: the whole router is mounted behind requireSessionMiddleware in
 * server.ts. req.sessionUser is a Supabase-verified user; client-supplied
 * moderatorId / moderatorName are ignored wherever a moderator is recorded.
 */

import { Router } from 'express'
import { getSupabaseClient } from '../lib/supabaseClient.js'

const router = Router()

// In-memory stores for demo mode (fallback if Supabase unavailable)
const reports = new Map<string, any>()
const moderationLog = new Map<string, any[]>()
const flaggedEvents = new Set<string>()

// ============================================
// Reporting Endpoints
// ============================================

/**
 * POST /api/event-moderation/report
 * Report an event
 */
router.post('/report', async (req, res) => {
  try {
    const { eventId, reporterId, reason, description, evidenceUrls } = req.body

    if (!eventId || !reporterId || !reason) {
      return res.status(400).json({
        success: false,
        error: 'Event ID, reporter ID, and reason are required'
      })
    }

    const validReasons = [
      'spam', 'inappropriate', 'misleading', 'harassment',
      'safety', 'scam', 'duplicate', 'other'
    ]

    if (!validReasons.includes(reason)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid report reason'
      })
    }

    const report = {
      id: `report_${Date.now()}`,
      event_id: eventId,
      reporter_id: reporterId,
      reason,
      description: description || null,
      evidence_urls: evidenceUrls || [],
      status: 'pending',
      created_at: new Date().toISOString()
    }

    reports.set(report.id, report)

    console.log(`🚨 [Event Moderation] Report submitted: ${eventId} - ${reason}`)

    res.json({
      success: true,
      message: 'Report submitted successfully',
      reportId: report.id,
      status: 'pending'
    })
  } catch (error) {
    console.error('[Event Moderation] Report error:', error)
    res.status(500).json({ success: false, error: 'Failed to submit report' })
  }
})

/**
 * GET /api/event-moderation/reports
 * Get all reports (moderator only)
 */
router.get('/reports', async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query

    let allReports = Array.from(reports.values())

    if (status) {
      allReports = allReports.filter(r => r.status === status)
    }

    allReports.sort((a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )

    const start = (Number(page) - 1) * Number(limit)
    const paginatedReports = allReports.slice(start, start + Number(limit))

    res.json({
      success: true,
      reports: paginatedReports,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: allReports.length,
        hasMore: start + Number(limit) < allReports.length
      },
      stats: {
        pending: allReports.filter(r => r.status === 'pending').length,
        reviewing: allReports.filter(r => r.status === 'reviewing').length,
        resolved: allReports.filter(r => r.status === 'resolved').length,
        dismissed: allReports.filter(r => r.status === 'dismissed').length
      }
    })
  } catch (error) {
    console.error('[Event Moderation] Reports error:', error)
    res.status(500).json({ success: false, error: 'Failed to fetch reports' })
  }
})

/**
 * PUT /api/event-moderation/reports/:reportId
 * Update report status (moderator only)
 */
router.put('/reports/:reportId', async (req, res) => {
  try {
    const { reportId } = req.params
    const { status, resolutionNotes, actionTaken } = req.body
    // Was: resolved_by = req.body.moderatorId (client-supplied, unverified).
    const moderator = req.sessionUser?.identity || 'unknown'

    const report = reports.get(reportId)
    if (!report) {
      return res.status(404).json({
        success: false,
        error: 'Report not found'
      })
    }

    report.status = status
    report.resolution_notes = resolutionNotes
    report.action_taken = actionTaken
    report.resolved_by = moderator
    report.resolved_at = new Date().toISOString()

    reports.set(reportId, report)

    console.log(`✅ [Event Moderation] Report ${reportId} ${status} by ${moderator}`)

    res.json({
      success: true,
      message: `Report ${status}`,
      report
    })
  } catch (error) {
    console.error('[Event Moderation] Update report error:', error)
    res.status(500).json({ success: false, error: 'Failed to update report' })
  }
})

// ============================================
// Moderation Action Endpoints
// ============================================

/**
 * POST /api/event-moderation/action
 * Take moderation action on an event
 */
router.post('/action', async (req, res) => {
  try {
    const { eventId, action, reason, notes } = req.body
    // Was: moderator_id = req.body.moderatorId and moderator_name =
    // req.body.moderatorName, both client-supplied. moderatorId is no longer a
    // required field — the session supplies it, so it can never be absent.
    const moderatorId = req.sessionUser?.id || 'unknown'
    const moderatorName = req.sessionUser?.identity || 'unknown'

    if (!eventId || !action) {
      return res.status(400).json({
        success: false,
        error: 'Event ID and action are required'
      })
    }

    const validActions = [
      'approve', 'reject', 'flag', 'unflag',
      'feature', 'unfeature', 'suspend', 'restore', 'delete'
    ]

    if (!validActions.includes(action)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid moderation action'
      })
    }

    const logEntry = {
      id: `mod_${Date.now()}`,
      event_id: eventId,
      action,
      reason: reason || null,
      notes: notes || null,
      moderator_id: moderatorId,
      moderator_name: moderatorName,
      created_at: new Date().toISOString()
    }

    const eventLog = moderationLog.get(eventId) || []
    eventLog.push(logEntry)
    moderationLog.set(eventId, eventLog)

    if (action === 'flag') {
      flaggedEvents.add(eventId)
    } else if (action === 'unflag' || action === 'approve') {
      flaggedEvents.delete(eventId)
    }

    console.log(`⚖️ [Event Moderation] Action: ${action} on ${eventId} by ${moderatorName}`)

    res.json({
      success: true,
      message: `Event ${action}ed successfully`,
      action: logEntry
    })
  } catch (error) {
    console.error('[Event Moderation] Action error:', error)
    res.status(500).json({ success: false, error: 'Failed to take action' })
  }
})

/**
 * GET /api/event-moderation/log/:eventId
 * Get moderation history for an event
 */
router.get('/log/:eventId', async (req, res) => {
  try {
    const { eventId } = req.params

    const log = moderationLog.get(eventId) || []

    res.json({
      success: true,
      eventId,
      log: log.sort((a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ),
      isFlagged: flaggedEvents.has(eventId)
    })
  } catch (error) {
    console.error('[Event Moderation] Log error:', error)
    res.status(500).json({ success: false, error: 'Failed to fetch moderation log' })
  }
})

/**
 * GET /api/event-moderation/flagged
 * Get all flagged events
 */
router.get('/flagged', async (req, res) => {
  try {
    const flaggedList = Array.from(flaggedEvents).map(eventId => ({
      eventId,
      flaggedAt: moderationLog.get(eventId)?.find(l => l.action === 'flag')?.created_at,
      reason: moderationLog.get(eventId)?.find(l => l.action === 'flag')?.reason
    }))

    res.json({
      success: true,
      flagged: flaggedList,
      count: flaggedList.length
    })
  } catch (error) {
    console.error('[Event Moderation] Flagged error:', error)
    res.status(500).json({ success: false, error: 'Failed to fetch flagged events' })
  }
})

/**
 * GET /api/event-moderation/dashboard
 * Get moderation dashboard overview
 */
router.get('/dashboard', async (req, res) => {
  try {
    const supabase = getSupabaseClient()

    if (!supabase) {
      // Fallback to in-memory demo data if Supabase unavailable
      const allReports = Array.from(reports.values())
      const allActions = Array.from(moderationLog.values()).flat()

      const stats = {
        pendingReports: allReports.filter(r => r.status === 'pending').length,
        flaggedEvents: flaggedEvents.size,
        actionsToday: 0,
        reportsThisWeek: allReports.length
      }

      return res.json({
        success: true,
        dashboard: {
          stats,
          recentActivity: [],
          reasonsBreakdown: {},
          quickActions: [
            { id: 'review', label: 'Review Reports', count: stats.pendingReports },
            { id: 'flagged', label: 'Flagged Events', count: stats.flaggedEvents }
          ]
        }
      })
    }

    // Query real Supabase events table
    const { data: pendingEvents, error: pendingError } = await supabase
      .from('events')
      .select('id, title, status')
      .eq('status', 'pending')

    const { data: approvedEvents, error: approvedError } = await supabase
      .from('events')
      .select('id')
      .eq('status', 'approved')

    if (pendingError) {
      console.error('[Event Moderation] Pending events error:', pendingError)
    }

    if (approvedError) {
      console.error('[Event Moderation] Approved events error:', approvedError)
    }

    const stats = {
      pendingReports: pendingEvents?.length || 0,
      flaggedEvents: 0, // TODO: Add flagged status tracking
      actionsToday: 0, // TODO: Track approval actions
      reportsThisWeek: 0 // TODO: Track reports
    }

    res.json({
      success: true,
      dashboard: {
        stats,
        pendingEvents: pendingEvents || [],
        approvedCount: approvedEvents?.length || 0,
        recentActivity: [],
        reasonsBreakdown: {},
        quickActions: [
          { id: 'review', label: 'Pending Events', count: stats.pendingReports },
          { id: 'approved', label: 'Approved Events', count: approvedEvents?.length || 0 }
        ]
      }
    })
  } catch (error) {
    console.error('[Event Moderation] Dashboard error:', error)
    res.status(500).json({ success: false, error: 'Failed to load dashboard' })
  }
})

/**
 * GET /api/event-moderation/guidelines
 * Get community guidelines
 */
router.get('/guidelines', async (req, res) => {
  try {
    res.json({
      success: true,
      guidelines: {
        title: 'BLKOUT Community Guidelines',
        lastUpdated: '2025-01-01',
        sections: [
          {
            title: 'Liberation Values',
            content: 'All events must align with our mission of Black queer liberation and empowerment.'
          },
          {
            title: 'Safe Spaces',
            content: 'Events must provide safe, inclusive environments for Black queer people.'
          },
          {
            title: 'No Discrimination',
            content: 'Discrimination based on race, gender identity, sexuality, disability, or any other factor is prohibited.'
          },
          {
            title: 'Authentic Representation',
            content: 'Events should be organized by or in partnership with Black queer community members.'
          },
          {
            title: 'Transparency',
            content: 'Event details including costs, accessibility, and content warnings must be clearly stated.'
          }
        ],
        reportingInfo: {
          message: 'If you see something that violates these guidelines, please report it.',
          responseTime: 'Reports are typically reviewed within 24-48 hours.'
        }
      }
    })
  } catch (error) {
    console.error('[Event Moderation] Guidelines error:', error)
    res.status(500).json({ success: false, error: 'Failed to fetch guidelines' })
  }
})

export default router
