/**
 * Organizer Management Routes
 * Dashboard and analytics for event organizers
 *
 * Liberation Feature: Empowering Black queer event creators
 */

import { Router } from 'express'

const router = Router()

// In-memory store for demo mode
const organizers = new Map<string, any>()
const collaborators = new Map<string, any[]>()
const analytics = new Map<string, any[]>()

// ============================================
// Organizer Profile Endpoints
// ============================================

/**
 * GET /api/organizer/profile/:userId
 * Get organizer profile
 */
router.get('/profile/:userId', async (req, res) => {
  try {
    const { userId } = req.params

    let organizer = organizers.get(userId)

    if (!organizer) {
      // Return default profile for new organizers
      organizer = {
        id: `org_${Date.now()}`,
        user_id: userId,
        display_name: 'New Organizer',
        bio: null,
        is_verified: false,
        can_create_events: true,
        can_feature_events: false,
        can_moderate: false,
        max_events_per_month: 10,
        total_events: 0,
        total_attendees: 0,
        average_rating: 0,
        liberation_score: 50,
        community_impact_score: 50,
        created_at: new Date().toISOString()
      }
    }

    res.json({
      success: true,
      organizer
    })
  } catch (error) {
    console.error('[Organizer] Profile error:', error)
    res.status(500).json({ success: false, error: 'Failed to fetch profile' })
  }
})

/**
 * PUT /api/organizer/profile/:userId
 * Update organizer profile
 */
router.put('/profile/:userId', async (req, res) => {
  try {
    const { userId } = req.params
    const updates = req.body

    let organizer = organizers.get(userId) || {
      id: `org_${Date.now()}`,
      user_id: userId,
      created_at: new Date().toISOString()
    }

    organizer = {
      ...organizer,
      ...updates,
      updated_at: new Date().toISOString()
    }

    organizers.set(userId, organizer)

    console.log(`📝 [Organizer] Profile updated: ${userId}`)

    res.json({
      success: true,
      message: 'Profile updated',
      organizer
    })
  } catch (error) {
    console.error('[Organizer] Update error:', error)
    res.status(500).json({ success: false, error: 'Failed to update profile' })
  }
})

/**
 * POST /api/organizer/verify/:userId
 * Request organizer verification
 */
router.post('/verify/:userId', async (req, res) => {
  try {
    const { userId } = req.params
    const { evidence, notes } = req.body

    // In production, this would create a verification request
    console.log(`🔍 [Organizer] Verification requested: ${userId}`)

    res.json({
      success: true,
      message: 'Verification request submitted',
      status: 'pending',
      estimatedReviewTime: '2-3 business days'
    })
  } catch (error) {
    console.error('[Organizer] Verify error:', error)
    res.status(500).json({ success: false, error: 'Failed to submit verification' })
  }
})

// ============================================
// Dashboard Endpoints
// ============================================

/**
 * GET /api/organizer/dashboard/:userId
 * Get organizer dashboard summary
 */
router.get('/dashboard/:userId', async (req, res) => {
  try {
    const { userId } = req.params

    // Get organizer profile
    const organizer = organizers.get(userId)

    // Get user's events (mock data for demo)
    const upcomingEvents = [
      {
        id: 'evt_1',
        name: 'Liberation Gathering',
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        rsvp_count: 45,
        capacity: 100,
        status: 'published'
      },
      {
        id: 'evt_2',
        name: 'Community Mixer',
        date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        rsvp_count: 28,
        capacity: 50,
        status: 'published'
      }
    ]

    const recentActivity = [
      { type: 'rsvp', message: '3 new RSVPs for Liberation Gathering', time: '2 hours ago' },
      { type: 'check_in', message: '15 attendees checked in to Workshop', time: '1 day ago' },
      { type: 'review', message: 'New 5-star review received', time: '2 days ago' }
    ]

    const stats = {
      totalEvents: organizer?.total_events || 5,
      totalAttendees: organizer?.total_attendees || 234,
      upcomingEvents: upcomingEvents.length,
      averageRating: organizer?.average_rating || 4.8,
      liberationScore: organizer?.liberation_score || 75,
      thisMonth: {
        events: 2,
        rsvps: 73,
        checkIns: 58,
        revenue: 0 // Community events are typically free
      }
    }

    res.json({
      success: true,
      dashboard: {
        organizer,
        stats,
        upcomingEvents,
        recentActivity,
        quickActions: [
          { id: 'create', label: 'Create Event', icon: 'plus' },
          { id: 'analytics', label: 'View Analytics', icon: 'chart' },
          { id: 'attendees', label: 'Manage Attendees', icon: 'users' },
          { id: 'promote', label: 'Promote Events', icon: 'megaphone' }
        ]
      }
    })
  } catch (error) {
    console.error('[Organizer] Dashboard error:', error)
    res.status(500).json({ success: false, error: 'Failed to load dashboard' })
  }
})

/**
 * GET /api/organizer/events/:userId
 * Get organizer's events
 */
router.get('/events/:userId', async (req, res) => {
  try {
    const { userId } = req.params
    const { status, page = 1, limit = 20 } = req.query

    // Mock events for demo
    const events = [
      {
        id: 'evt_1',
        name: 'Liberation Gathering',
        description: 'A celebration of Black queer joy',
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        location: 'London, UK',
        status: 'published',
        rsvp_count: 45,
        check_in_count: 0,
        capacity: 100,
        created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'evt_2',
        name: 'Community Mixer',
        description: 'Networking and connection',
        date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        location: 'Manchester, UK',
        status: 'published',
        rsvp_count: 28,
        check_in_count: 0,
        capacity: 50,
        created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'evt_3',
        name: 'Past Workshop',
        description: 'Skills building session',
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        location: 'Birmingham, UK',
        status: 'completed',
        rsvp_count: 35,
        check_in_count: 31,
        capacity: 40,
        created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()
      }
    ]

    res.json({
      success: true,
      events,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: events.length,
        hasMore: false
      }
    })
  } catch (error) {
    console.error('[Organizer] Events error:', error)
    res.status(500).json({ success: false, error: 'Failed to fetch events' })
  }
})

// ============================================
// Analytics Endpoints
// ============================================

/**
 * GET /api/organizer/analytics/:userId
 * Get organizer analytics overview
 */
router.get('/analytics/:userId', async (req, res) => {
  try {
    const { userId } = req.params
    const { period = '30d' } = req.query

    // Generate mock analytics
    const periodDays = period === '7d' ? 7 : period === '30d' ? 30 : 90

    const dailyData = Array.from({ length: periodDays }, (_, i) => {
      const date = new Date(Date.now() - (periodDays - i - 1) * 24 * 60 * 60 * 1000)
      return {
        date: date.toISOString().split('T')[0],
        views: Math.floor(Math.random() * 50) + 10,
        rsvps: Math.floor(Math.random() * 10),
        checkIns: Math.floor(Math.random() * 8)
      }
    })

    const totals = dailyData.reduce((acc, day) => ({
      views: acc.views + day.views,
      rsvps: acc.rsvps + day.rsvps,
      checkIns: acc.checkIns + day.checkIns
    }), { views: 0, rsvps: 0, checkIns: 0 })

    const topEvents = [
      { id: 'evt_1', name: 'Liberation Gathering', views: 234, rsvps: 45 },
      { id: 'evt_2', name: 'Community Mixer', views: 156, rsvps: 28 },
      { id: 'evt_3', name: 'Past Workshop', views: 189, rsvps: 35 }
    ]

    const demographics = {
      ageGroups: [
        { range: '18-24', percentage: 15 },
        { range: '25-34', percentage: 45 },
        { range: '35-44', percentage: 28 },
        { range: '45+', percentage: 12 }
      ],
      locations: [
        { city: 'London', percentage: 55 },
        { city: 'Manchester', percentage: 20 },
        { city: 'Birmingham', percentage: 15 },
        { city: 'Other', percentage: 10 }
      ]
    }

    const liberationImpact = {
      score: 78,
      trend: '+5',
      metrics: {
        communityReach: 456,
        engagementRate: 0.72,
        returnAttendees: 0.45,
        diversityScore: 0.85
      }
    }

    res.json({
      success: true,
      analytics: {
        period,
        totals,
        dailyData,
        topEvents,
        demographics,
        liberationImpact,
        insights: [
          { type: 'success', message: 'Your events have 23% higher attendance than average' },
          { type: 'tip', message: 'Events on Saturdays tend to get more RSVPs' },
          { type: 'growth', message: 'Liberation impact score increased by 5 points this month' }
        ]
      }
    })
  } catch (error) {
    console.error('[Organizer] Analytics error:', error)
    res.status(500).json({ success: false, error: 'Failed to fetch analytics' })
  }
})

/**
 * GET /api/organizer/analytics/event/:eventId
 * Get analytics for a specific event
 */
router.get('/analytics/event/:eventId', async (req, res) => {
  try {
    const { eventId } = req.params

    const eventAnalytics = {
      eventId,
      overview: {
        views: 234,
        uniqueVisitors: 189,
        rsvps: 45,
        waitlist: 5,
        checkIns: 0,
        cancellations: 3,
        conversionRate: 0.19
      },
      timeline: [
        { date: '2025-12-10', views: 45, rsvps: 12 },
        { date: '2025-12-11', views: 67, rsvps: 15 },
        { date: '2025-12-12', views: 89, rsvps: 10 },
        { date: '2025-12-13', views: 33, rsvps: 8 }
      ],
      sources: [
        { source: 'direct', count: 89, percentage: 38 },
        { source: 'social', count: 78, percentage: 33 },
        { source: 'search', count: 45, percentage: 19 },
        { source: 'referral', count: 22, percentage: 10 }
      ],
      engagement: {
        calendarAdds: 38,
        shares: 12,
        saves: 23,
        comments: 5
      }
    }

    res.json({
      success: true,
      analytics: eventAnalytics
    })
  } catch (error) {
    console.error('[Organizer] Event analytics error:', error)
    res.status(500).json({ success: false, error: 'Failed to fetch event analytics' })
  }
})

// ============================================
// Collaborator Endpoints
// ============================================

/**
 * GET /api/organizer/collaborators/:eventId
 * Get event collaborators
 */
router.get('/collaborators/:eventId', async (req, res) => {
  try {
    const { eventId } = req.params

    const eventCollaborators = collaborators.get(eventId) || []

    res.json({
      success: true,
      collaborators: eventCollaborators
    })
  } catch (error) {
    console.error('[Organizer] Collaborators error:', error)
    res.status(500).json({ success: false, error: 'Failed to fetch collaborators' })
  }
})

/**
 * POST /api/organizer/collaborators/:eventId
 * Add a collaborator to an event
 */
router.post('/collaborators/:eventId', async (req, res) => {
  try {
    const { eventId } = req.params
    const { userId, email, role = 'collaborator', permissions } = req.body

    const collaborator = {
      id: `collab_${Date.now()}`,
      event_id: eventId,
      user_id: userId,
      email,
      role,
      can_edit: permissions?.canEdit ?? false,
      can_manage_rsvps: permissions?.canManageRsvps ?? false,
      can_check_in: permissions?.canCheckIn ?? true,
      can_view_analytics: permissions?.canViewAnalytics ?? false,
      status: 'pending',
      invited_at: new Date().toISOString()
    }

    const eventCollaborators = collaborators.get(eventId) || []
    eventCollaborators.push(collaborator)
    collaborators.set(eventId, eventCollaborators)

    console.log(`👥 [Organizer] Collaborator added: ${email} to ${eventId}`)

    res.json({
      success: true,
      message: 'Collaborator invited',
      collaborator
    })
  } catch (error) {
    console.error('[Organizer] Add collaborator error:', error)
    res.status(500).json({ success: false, error: 'Failed to add collaborator' })
  }
})

/**
 * DELETE /api/organizer/collaborators/:eventId/:collaboratorId
 * Remove a collaborator
 */
router.delete('/collaborators/:eventId/:collaboratorId', async (req, res) => {
  try {
    const { eventId, collaboratorId } = req.params

    const eventCollaborators = collaborators.get(eventId) || []
    const filtered = eventCollaborators.filter(c => c.id !== collaboratorId)
    collaborators.set(eventId, filtered)

    console.log(`👥 [Organizer] Collaborator removed: ${collaboratorId} from ${eventId}`)

    res.json({
      success: true,
      message: 'Collaborator removed'
    })
  } catch (error) {
    console.error('[Organizer] Remove collaborator error:', error)
    res.status(500).json({ success: false, error: 'Failed to remove collaborator' })
  }
})

export default router
