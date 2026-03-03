/**
 * Campaign API Routes
 *
 * Exposes campaign health, progress, and tracking endpoints.
 * Part of the "Meet AIvor" campaign self-improvement loop.
 */

import { Router, Request, Response } from 'express'
import campaignTrackingService from '../services/CampaignTrackingService.js'

const router = Router()

/**
 * GET /api/campaign/health
 * Get current campaign health score and metrics
 */
router.get('/health', async (req: Request, res: Response) => {
  try {
    const health = await campaignTrackingService.getCampaignHealth()
    res.json({
      success: true,
      health,
      checkedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Campaign health check error:', error)
    res.status(500).json({ success: false, error: 'Failed to check campaign health' })
  }
})

/**
 * GET /api/campaign/progress
 * Get progress toward 100% increase targets
 */
router.get('/progress', async (req: Request, res: Response) => {
  try {
    const progress = await campaignTrackingService.getCampaignProgress()
    res.json({
      success: true,
      progress,
      target: '100% increase in chatbot, news, and events usage',
      checkedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Campaign progress check error:', error)
    res.status(500).json({ success: false, error: 'Failed to check campaign progress' })
  }
})

/**
 * POST /api/campaign/track/widget-open
 * Track when the IVOR widget is opened (called from frontend)
 */
router.post('/track/widget-open', async (req: Request, res: Response) => {
  try {
    const { sessionId, utmSource, utmCampaign, utmContent } = req.body
    await campaignTrackingService.trackWidgetOpen({
      sessionId: sessionId || `widget-${Date.now()}`,
      utmSource,
      utmCampaign,
      utmContent,
    })
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ success: false })
  }
})

/**
 * POST /api/campaign/track/social-click
 * Track social media click-throughs (called via UTM redirect)
 */
router.post('/track/social-click', async (req: Request, res: Response) => {
  try {
    const { utmSource, utmCampaign, utmContent, metadata } = req.body
    await campaignTrackingService.trackSocialClick({
      utmSource: utmSource || 'unknown',
      utmCampaign: utmCampaign || 'meet-aivor',
      utmContent: utmContent || 'unknown',
      metadata,
    })
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ success: false })
  }
})

/**
 * POST /api/campaign/snapshot
 * Trigger manual health snapshot (also runs weekly via cron)
 */
router.post('/snapshot', async (req: Request, res: Response) => {
  try {
    await campaignTrackingService.snapshotHealth()
    res.json({ success: true, message: 'Health snapshot saved' })
  } catch (error) {
    console.error('Campaign snapshot error:', error)
    res.status(500).json({ success: false, error: 'Failed to save snapshot' })
  }
})

export default router
