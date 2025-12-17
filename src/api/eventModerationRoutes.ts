/**
 * Event Moderation Routes
 * Community safety and content moderation for events
 *
 * Liberation Feature: Protecting community spaces
 */

import { Router } from 'express'

const router = Router()

// In-memory stores for demo mode
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
    const { status, resolutionNotes, actionTaken, moderatorId } = req.body

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
    report.resolved_by = moderatorId
    report.resolved_at = new Date().toISOString()

    reports.set(reportId, report)

    console.log(`✅ [Event Moderation] Report ${reportId} ${status}`)

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
    const { eventId, action, reason, notes, moderatorId, moderatorName } = req.body

    if (!eventId || !action || !moderatorId) {
      return res.status(400).json({
        success: false,
        error: 'Event ID, action, and moderator ID are required'
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
      moderator_name: moderatorName || 'Moderator',
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
    const allReports = Array.from(reports.values())
    const allActions = Array.from(moderationLog.values()).flat()

    const stats = {
      pendingReports: allReports.filter(r => r.status === 'pending').length,
      flaggedEvents: flaggedEvents.size,
      actionsToday: allActions.filter(a => {
        const actionDate = new Date(a.created_at)
        const today = new Date()
        return actionDate.toDateString() === today.toDateString()
      }).length,
      reportsThisWeek: allReports.filter(r => {
        const reportDate = new Date(r.created_at)
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        return reportDate > weekAgo
      }).length
    }

    const recentActivity = allActions
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 10)
      .map(a => ({
        type: 'action',
        action: a.action,
        eventId: a.event_id,
        moderator: a.moderator_name,
        time: a.created_at
      }))

    const reasonsBreakdown = allReports.reduce((acc: Record<string, number>, report) => {
      acc[report.reason] = (acc[report.reason] || 0) + 1
      return acc
    }, {})

    res.json({
      success: true,
      dashboard: {
        stats,
        recentActivity,
        reasonsBreakdown,
        quickActions: [
          { id: 'review', label: 'Review Reports', count: stats.pendingReports },
          { id: 'flagged', label: 'Flagged Events', count: stats.flaggedEvents }
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
