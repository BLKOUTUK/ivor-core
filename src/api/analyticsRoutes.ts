/**
 * Analytics Routes
 * Comprehensive analytics API for the BLKOUT Liberation Platform
 *
 * Liberation Feature: Data-driven insights for community empowerment
 */

import { Router, Request, Response } from 'express';

const router = Router();

// In-memory stores for demo mode
const platformAnalytics = new Map<string, any>();
const eventAnalytics = new Map<string, any>();
const userAnalytics = new Map<string, any>();
const geographicAnalytics = new Map<string, any>();
const categoryAnalytics = new Map<string, any>();
const liberationMetrics = new Map<string, any>();
const savedReports = new Map<string, any>();

// Helper to generate date keys
function getDateKey(date: Date = new Date()): string {
  return date.toISOString().split('T')[0];
}

// Helper to generate historical data
function generateHistoricalData(days: number = 30) {
  const data = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    data.push({
      date: getDateKey(date),
      value: Math.floor(Math.random() * 100) + 20
    });
  }
  return data;
}

// Initialize demo data
function initializeDemoData() {
  const today = getDateKey();

  // Platform analytics
  platformAnalytics.set(today, {
    date: today,
    totalUsers: 1247,
    activeUsers: 423,
    newUsers: 28,
    totalEvents: 156,
    newEvents: 8,
    totalRsvps: 3892,
    totalCheckIns: 2841,
    totalGroups: 24,
    activeGroups: 18,
    liberationScore: 87.5,
    communityReach: 15420,
    engagementRate: 0.68
  });

  // Geographic analytics
  const regions = [
    { region: 'London', eventCount: 78, attendeeCount: 1240, groupCount: 12, liberationScore: 89 },
    { region: 'Manchester', eventCount: 34, attendeeCount: 520, groupCount: 5, liberationScore: 85 },
    { region: 'Birmingham', eventCount: 22, attendeeCount: 380, groupCount: 4, liberationScore: 82 },
    { region: 'Bristol', eventCount: 12, attendeeCount: 190, groupCount: 2, liberationScore: 88 },
    { region: 'Leeds', eventCount: 10, attendeeCount: 145, groupCount: 1, liberationScore: 80 }
  ];
  regions.forEach(r => geographicAnalytics.set(`${r.region}-${today}`, { ...r, date: today }));

  // Category analytics
  const categories = [
    { category: 'Social', eventCount: 45, totalRsvps: 890, attendance: 720, rating: 4.5, liberationAlignment: 85 },
    { category: 'Wellness', eventCount: 28, totalRsvps: 420, attendance: 380, rating: 4.8, liberationAlignment: 92 },
    { category: 'Cultural', eventCount: 35, totalRsvps: 680, attendance: 590, rating: 4.6, liberationAlignment: 90 },
    { category: 'Educational', eventCount: 22, totalRsvps: 340, attendance: 310, rating: 4.7, liberationAlignment: 95 },
    { category: 'Advocacy', eventCount: 15, totalRsvps: 280, attendance: 250, rating: 4.9, liberationAlignment: 98 },
    { category: 'Nightlife', eventCount: 11, totalRsvps: 560, attendance: 480, rating: 4.3, liberationAlignment: 78 }
  ];
  categories.forEach(c => categoryAnalytics.set(`${c.category}-${today}`, { ...c, date: today }));

  // Liberation metrics
  liberationMetrics.set(today, {
    date: today,
    communityConnections: 2847,
    safeSpacesCreated: 156,
    blackQueerEvents: 142,
    accessibilityScore: 78.5,
    inclusionIndex: 92.3,
    mutualAidEvents: 18,
    educationalEvents: 22,
    wellnessEvents: 28,
    culturalEvents: 35,
    advocacyEvents: 15,
    overallLiberationScore: 87.5
  });
}

initializeDemoData();

// ============================================
// Platform Analytics Endpoints
// ============================================

/**
 * GET /api/analytics/platform
 * Get platform-wide analytics overview
 */
router.get('/platform', async (req: Request, res: Response) => {
  try {
    const period = req.query.period as string || '30d';
    const today = getDateKey();
    const current = platformAnalytics.get(today) || {};

    // Generate trend data
    const days = period === '7d' ? 7 : period === '90d' ? 90 : 30;

    const analytics = {
      current: {
        totalUsers: current.totalUsers || 1247,
        activeUsers: current.activeUsers || 423,
        newUsers: current.newUsers || 28,
        totalEvents: current.totalEvents || 156,
        totalRsvps: current.totalRsvps || 3892,
        totalCheckIns: current.totalCheckIns || 2841,
        totalGroups: current.totalGroups || 24,
        liberationScore: current.liberationScore || 87.5,
        engagementRate: current.engagementRate || 0.68
      },
      trends: {
        users: generateHistoricalData(days),
        events: generateHistoricalData(days),
        rsvps: generateHistoricalData(days),
        engagement: generateHistoricalData(days).map(d => ({ ...d, value: (d.value / 100).toFixed(2) }))
      },
      growth: {
        usersGrowth: 12.5,
        eventsGrowth: 8.3,
        rsvpsGrowth: 15.2,
        engagementGrowth: 5.8
      },
      period
    };

    res.json({ success: true, analytics });
  } catch (error) {
    console.error('[Analytics] Platform error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch platform analytics' });
  }
});

/**
 * GET /api/analytics/platform/summary
 * Get quick summary stats
 */
router.get('/platform/summary', async (req: Request, res: Response) => {
  try {
    const today = getDateKey();
    const current = platformAnalytics.get(today) || {};

    const summary = {
      totalUsers: current.totalUsers || 1247,
      activeToday: current.activeUsers || 423,
      eventsThisMonth: current.newEvents || 8,
      liberationScore: current.liberationScore || 87.5,
      topRegion: 'London',
      topCategory: 'Social'
    };

    res.json({ success: true, summary });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch summary' });
  }
});

// ============================================
// Event Analytics Endpoints
// ============================================

/**
 * GET /api/analytics/event/:eventId
 * Get analytics for a specific event
 */
router.get('/event/:eventId', async (req: Request, res: Response) => {
  try {
    const { eventId } = req.params;
    const period = req.query.period as string || '7d';
    const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;

    // Generate demo event analytics
    const analytics = {
      eventId,
      overview: {
        totalViews: Math.floor(Math.random() * 500) + 100,
        uniqueViews: Math.floor(Math.random() * 300) + 50,
        totalRsvps: Math.floor(Math.random() * 100) + 20,
        checkIns: Math.floor(Math.random() * 80) + 15,
        shares: Math.floor(Math.random() * 50) + 5,
        saves: Math.floor(Math.random() * 30) + 3,
        conversionRate: (Math.random() * 0.3 + 0.1).toFixed(2),
        liberationImpact: (Math.random() * 20 + 75).toFixed(1)
      },
      trends: {
        views: generateHistoricalData(days),
        rsvps: generateHistoricalData(days).map(d => ({ ...d, value: Math.floor(d.value / 10) })),
        engagement: generateHistoricalData(days).map(d => ({ ...d, value: (d.value / 100).toFixed(2) }))
      },
      demographics: {
        regions: [
          { name: 'London', percentage: 45 },
          { name: 'Manchester', percentage: 20 },
          { name: 'Birmingham', percentage: 15 },
          { name: 'Other', percentage: 20 }
        ],
        referrals: [
          { source: 'Direct', percentage: 35 },
          { source: 'Social Media', percentage: 30 },
          { source: 'Email', percentage: 20 },
          { source: 'Partner Sites', percentage: 15 }
        ]
      },
      period
    };

    res.json({ success: true, analytics });
  } catch (error) {
    console.error('[Analytics] Event error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch event analytics' });
  }
});

/**
 * POST /api/analytics/event/:eventId/track
 * Track an event interaction (view, share, save)
 */
router.post('/event/:eventId/track', async (req: Request, res: Response) => {
  try {
    const { eventId } = req.params;
    const { action, userId } = req.body;

    if (!['view', 'share', 'save', 'click'].includes(action)) {
      return res.status(400).json({ success: false, error: 'Invalid action' });
    }

    const key = `${eventId}-${getDateKey()}`;
    const existing = eventAnalytics.get(key) || {
      eventId,
      date: getDateKey(),
      views: 0,
      shares: 0,
      saves: 0,
      clicks: 0
    };

    existing[`${action}s`] = (existing[`${action}s`] || 0) + 1;
    eventAnalytics.set(key, existing);

    res.json({ success: true, tracked: { eventId, action, timestamp: new Date().toISOString() } });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to track event' });
  }
});

// ============================================
// Geographic Analytics Endpoints
// ============================================

/**
 * GET /api/analytics/geographic
 * Get analytics by region
 */
router.get('/geographic', async (req: Request, res: Response) => {
  try {
    const today = getDateKey();
    const regions: any[] = [];

    geographicAnalytics.forEach((value, key) => {
      if (key.endsWith(today)) {
        regions.push(value);
      }
    });

    // Sort by event count
    regions.sort((a, b) => b.eventCount - a.eventCount);

    const analytics = {
      regions,
      totals: {
        totalRegions: regions.length,
        totalEvents: regions.reduce((sum, r) => sum + r.eventCount, 0),
        totalAttendees: regions.reduce((sum, r) => sum + r.attendeeCount, 0),
        averageLiberationScore: (regions.reduce((sum, r) => sum + r.liberationScore, 0) / regions.length).toFixed(1)
      },
      topRegion: regions[0]?.region || 'London',
      growth: {
        london: 15.2,
        manchester: 22.8,
        birmingham: 18.5,
        bristol: 12.0,
        leeds: 25.3
      }
    };

    res.json({ success: true, analytics });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch geographic analytics' });
  }
});

/**
 * GET /api/analytics/geographic/:region
 * Get detailed analytics for a specific region
 */
router.get('/geographic/:region', async (req: Request, res: Response) => {
  try {
    const { region } = req.params;
    const period = req.query.period as string || '30d';
    const days = period === '7d' ? 7 : period === '90d' ? 90 : 30;

    const analytics = {
      region,
      current: {
        eventCount: Math.floor(Math.random() * 50) + 20,
        attendeeCount: Math.floor(Math.random() * 500) + 200,
        groupCount: Math.floor(Math.random() * 10) + 2,
        activeOrganizers: Math.floor(Math.random() * 20) + 5,
        liberationScore: (Math.random() * 15 + 80).toFixed(1)
      },
      trends: {
        events: generateHistoricalData(days).map(d => ({ ...d, value: Math.floor(d.value / 20) })),
        attendees: generateHistoricalData(days),
        engagement: generateHistoricalData(days).map(d => ({ ...d, value: (d.value / 100).toFixed(2) }))
      },
      topCategories: [
        { category: 'Social', count: 15 },
        { category: 'Cultural', count: 12 },
        { category: 'Wellness', count: 8 }
      ],
      period
    };

    res.json({ success: true, analytics });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch region analytics' });
  }
});

// ============================================
// Category Analytics Endpoints
// ============================================

/**
 * GET /api/analytics/categories
 * Get analytics by event category
 */
router.get('/categories', async (req: Request, res: Response) => {
  try {
    const today = getDateKey();
    const categories: any[] = [];

    categoryAnalytics.forEach((value, key) => {
      if (key.endsWith(today)) {
        categories.push(value);
      }
    });

    // Sort by event count
    categories.sort((a, b) => b.eventCount - a.eventCount);

    const analytics = {
      categories,
      totals: {
        totalCategories: categories.length,
        totalEvents: categories.reduce((sum, c) => sum + c.eventCount, 0),
        totalRsvps: categories.reduce((sum, c) => sum + c.totalRsvps, 0),
        averageRating: (categories.reduce((sum, c) => sum + c.rating, 0) / categories.length).toFixed(1),
        averageLiberationAlignment: (categories.reduce((sum, c) => sum + c.liberationAlignment, 0) / categories.length).toFixed(1)
      },
      topCategory: categories[0]?.category || 'Social',
      mostAligned: categories.sort((a, b) => b.liberationAlignment - a.liberationAlignment)[0]?.category || 'Advocacy'
    };

    res.json({ success: true, analytics });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch category analytics' });
  }
});

// ============================================
// Liberation Metrics Endpoints
// ============================================

/**
 * GET /api/analytics/liberation
 * Get liberation impact metrics
 */
router.get('/liberation', async (req: Request, res: Response) => {
  try {
    const today = getDateKey();
    const period = req.query.period as string || '30d';
    const days = period === '7d' ? 7 : period === '90d' ? 90 : 30;
    const current = liberationMetrics.get(today) || {};

    const analytics = {
      current: {
        overallScore: current.overallLiberationScore || 87.5,
        communityConnections: current.communityConnections || 2847,
        safeSpacesCreated: current.safeSpacesCreated || 156,
        blackQueerEvents: current.blackQueerEvents || 142,
        accessibilityScore: current.accessibilityScore || 78.5,
        inclusionIndex: current.inclusionIndex || 92.3
      },
      breakdown: {
        mutualAid: { count: current.mutualAidEvents || 18, score: 95 },
        educational: { count: current.educationalEvents || 22, score: 92 },
        wellness: { count: current.wellnessEvents || 28, score: 88 },
        cultural: { count: current.culturalEvents || 35, score: 85 },
        advocacy: { count: current.advocacyEvents || 15, score: 98 }
      },
      trends: {
        liberationScore: generateHistoricalData(days).map(d => ({ ...d, value: (d.value / 100 * 20 + 75).toFixed(1) })),
        connections: generateHistoricalData(days),
        safeSpaces: generateHistoricalData(days).map(d => ({ ...d, value: Math.floor(d.value / 20) }))
      },
      impact: {
        livesImpacted: 15420,
        communitiesServed: 24,
        partnerOrganizations: 12,
        volunteerHours: 2840
      },
      period
    };

    res.json({ success: true, analytics });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch liberation metrics' });
  }
});

/**
 * GET /api/analytics/liberation/impact
 * Get detailed liberation impact report
 */
router.get('/liberation/impact', async (req: Request, res: Response) => {
  try {
    const impact = {
      summary: {
        totalImpactScore: 87.5,
        trend: 'increasing',
        percentageChange: 5.2
      },
      pillars: [
        {
          name: 'Community Building',
          score: 92,
          description: 'Creating spaces for Black queer connection',
          metrics: {
            eventsHosted: 156,
            uniqueAttendees: 2847,
            repeatAttendees: 1892,
            newConnections: 4521
          }
        },
        {
          name: 'Safe Spaces',
          score: 88,
          description: 'Ensuring safety and inclusion at all events',
          metrics: {
            safeSpacePolicies: 142,
            incidentReports: 3,
            resolutionRate: 100,
            satisfactionScore: 4.8
          }
        },
        {
          name: 'Accessibility',
          score: 78,
          description: 'Making events accessible to all',
          metrics: {
            accessibleVenues: 89,
            signLanguage: 12,
            captioning: 45,
            slidingScale: 67
          }
        },
        {
          name: 'Mutual Aid',
          score: 95,
          description: 'Supporting community through solidarity',
          metrics: {
            aidEvents: 18,
            resourcesShared: 2450,
            volunteersEngaged: 234,
            beneficiaries: 890
          }
        },
        {
          name: 'Education & Advocacy',
          score: 90,
          description: 'Empowering through knowledge and action',
          metrics: {
            workshops: 22,
            advocacyEvents: 15,
            participantsReached: 1240,
            skillsShared: 156
          }
        }
      ],
      recommendations: [
        { priority: 'high', area: 'Accessibility', suggestion: 'Increase venues with step-free access' },
        { priority: 'medium', area: 'Education', suggestion: 'Add more financial literacy workshops' },
        { priority: 'low', area: 'Mutual Aid', suggestion: 'Expand sliding scale to more events' }
      ]
    };

    res.json({ success: true, impact });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch impact report' });
  }
});

// ============================================
// User Analytics Endpoints
// ============================================

/**
 * GET /api/analytics/user/:userId
 * Get analytics for a specific user
 */
router.get('/user/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const period = req.query.period as string || '30d';
    const days = period === '7d' ? 7 : period === '90d' ? 90 : 30;

    const analytics = {
      userId,
      engagement: {
        eventsViewed: Math.floor(Math.random() * 50) + 10,
        eventsRsvped: Math.floor(Math.random() * 15) + 3,
        eventsAttended: Math.floor(Math.random() * 10) + 2,
        groupsJoined: Math.floor(Math.random() * 5) + 1,
        totalInteractions: Math.floor(Math.random() * 100) + 20,
        liberationContributions: Math.floor(Math.random() * 20) + 5
      },
      trends: {
        activity: generateHistoricalData(days).map(d => ({ ...d, value: Math.floor(d.value / 20) })),
        attendance: generateHistoricalData(days).map(d => ({ ...d, value: Math.floor(d.value / 50) }))
      },
      preferences: {
        topCategories: ['Social', 'Wellness', 'Cultural'],
        preferredRegions: ['London', 'Manchester'],
        averageSessionDuration: '12 mins'
      },
      liberationProfile: {
        contributionScore: 78,
        eventsSupported: 8,
        communityImpact: 'Active Participant'
      },
      period
    };

    res.json({ success: true, analytics });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch user analytics' });
  }
});

// ============================================
// Reports Endpoints
// ============================================

/**
 * GET /api/analytics/reports
 * List saved reports for a user
 */
router.get('/reports', async (req: Request, res: Response) => {
  try {
    const userId = req.query.userId as string;
    const reports: any[] = [];

    savedReports.forEach((report, id) => {
      if (!userId || report.userId === userId) {
        reports.push({ id, ...report });
      }
    });

    // Sort by creation date
    reports.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    res.json({ success: true, reports });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch reports' });
  }
});

/**
 * POST /api/analytics/reports
 * Create a new analytics report
 */
router.post('/reports', async (req: Request, res: Response) => {
  try {
    const { userId, reportType, title, dateRangeStart, dateRangeEnd, filters, format } = req.body;

    if (!userId || !reportType || !title) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    const reportId = `report-${Date.now()}`;
    const report = {
      userId,
      reportType,
      title,
      dateRangeStart: dateRangeStart || getDateKey(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)),
      dateRangeEnd: dateRangeEnd || getDateKey(),
      filters: filters || {},
      format: format || 'json',
      status: 'completed',
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      data: {
        generated: true,
        summary: 'Report generated successfully',
        metrics: {
          totalRecords: Math.floor(Math.random() * 1000) + 100,
          averageEngagement: (Math.random() * 0.5 + 0.3).toFixed(2),
          liberationScore: (Math.random() * 20 + 75).toFixed(1)
        }
      }
    };

    savedReports.set(reportId, report);

    res.status(201).json({ success: true, report: { id: reportId, ...report } });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to create report' });
  }
});

/**
 * GET /api/analytics/reports/:reportId
 * Get a specific report
 */
router.get('/reports/:reportId', async (req: Request, res: Response) => {
  try {
    const { reportId } = req.params;
    const report = savedReports.get(reportId);

    if (!report) {
      return res.status(404).json({ success: false, error: 'Report not found' });
    }

    res.json({ success: true, report: { id: reportId, ...report } });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch report' });
  }
});

/**
 * DELETE /api/analytics/reports/:reportId
 * Delete a report
 */
router.delete('/reports/:reportId', async (req: Request, res: Response) => {
  try {
    const { reportId } = req.params;

    if (!savedReports.has(reportId)) {
      return res.status(404).json({ success: false, error: 'Report not found' });
    }

    savedReports.delete(reportId);

    res.json({ success: true, message: 'Report deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to delete report' });
  }
});

// ============================================
// Export Endpoints
// ============================================

/**
 * GET /api/analytics/export
 * Export analytics data
 */
router.get('/export', async (req: Request, res: Response) => {
  try {
    const { type, format, period } = req.query;
    const days = period === '7d' ? 7 : period === '90d' ? 90 : 30;

    // Generate export data based on type
    let data: any = {};

    switch (type) {
      case 'platform':
        data = {
          type: 'platform',
          period: `${days} days`,
          exportedAt: new Date().toISOString(),
          metrics: platformAnalytics.get(getDateKey()) || {},
          trends: generateHistoricalData(days)
        };
        break;
      case 'liberation':
        data = {
          type: 'liberation',
          period: `${days} days`,
          exportedAt: new Date().toISOString(),
          metrics: liberationMetrics.get(getDateKey()) || {},
          trends: generateHistoricalData(days)
        };
        break;
      case 'geographic':
        const regions: any[] = [];
        geographicAnalytics.forEach(v => regions.push(v));
        data = {
          type: 'geographic',
          exportedAt: new Date().toISOString(),
          regions
        };
        break;
      case 'categories':
        const cats: any[] = [];
        categoryAnalytics.forEach(v => cats.push(v));
        data = {
          type: 'categories',
          exportedAt: new Date().toISOString(),
          categories: cats
        };
        break;
      default:
        return res.status(400).json({ success: false, error: 'Invalid export type' });
    }

    if (format === 'csv') {
      // Simple CSV conversion for demo
      const csvData = JSON.stringify(data, null, 2);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${type}-analytics.csv"`);
      return res.send(csvData);
    }

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to export data' });
  }
});

export default router;
