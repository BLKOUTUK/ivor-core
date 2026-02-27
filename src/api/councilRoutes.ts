/**
 * Council API Routes
 * Manual trigger + session history for admin dashboard
 */

import express from 'express'
import { Request, Response } from 'express'
import { CouncilService } from '../services/CouncilService.js'
import { getSupabaseClient } from '../lib/supabaseClient.js'

const router = express.Router()
const council = new CouncilService()

/**
 * POST /api/council/convene — Manually trigger a council session
 */
router.post('/convene', async (req: Request, res: Response) => {
  try {
    const { useCase = 'newsletter' } = req.body
    const verdict = await council.convene(useCase, 'manual')

    if (!verdict) {
      return res.status(503).json({ error: 'Council unavailable — no AI configured' })
    }

    res.json({ success: true, verdict })
  } catch (error: any) {
    console.error('[Council] Manual convene failed:', error)
    res.status(500).json({ error: 'Council session failed' })
  }
})

/**
 * GET /api/council/sessions — List recent council sessions
 */
router.get('/sessions', async (req: Request, res: Response) => {
  try {
    const supabase = getSupabaseClient()
    if (!supabase) {
      return res.json({ sessions: [] })
    }

    const limit = parseInt(req.query.limit as string) || 10
    const { data, error } = await supabase
      .from('council_sessions')
      .select('id, trigger, use_case, status, verdict, dissent, liberation_score, rankings, duration_ms, created_at, completed_at, reviewed_by')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      return res.status(500).json({ error: error.message })
    }

    res.json({ sessions: data || [] })
  } catch (error: any) {
    console.error('[Council] Sessions fetch failed:', error)
    res.status(500).json({ error: 'Failed to fetch sessions' })
  }
})

/**
 * GET /api/council/sessions/:id — Get full session detail
 */
router.get('/sessions/:id', async (req: Request, res: Response) => {
  try {
    const supabase = getSupabaseClient()
    if (!supabase) {
      return res.status(404).json({ error: 'Not found' })
    }

    const { data, error } = await supabase
      .from('council_sessions')
      .select('*')
      .eq('id', req.params.id)
      .single()

    if (error || !data) {
      return res.status(404).json({ error: 'Session not found' })
    }

    res.json({ session: data })
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch session' })
  }
})

/**
 * POST /api/council/sessions/:id/review — Admin approves/rejects a session
 */
router.post('/sessions/:id/review', async (req: Request, res: Response) => {
  try {
    const supabase = getSupabaseClient()
    if (!supabase) {
      return res.status(503).json({ error: 'Database unavailable' })
    }

    const { reviewer, approved } = req.body
    const { error } = await supabase
      .from('council_sessions')
      .update({
        reviewed_by: reviewer || 'admin',
        reviewed_at: new Date().toISOString(),
        status: approved ? 'completed' : 'rejected'
      })
      .eq('id', req.params.id)

    if (error) {
      return res.status(500).json({ error: error.message })
    }

    res.json({ success: true })
  } catch (error: any) {
    res.status(500).json({ error: 'Review failed' })
  }
})

/**
 * GET /api/compliance — Public compliance assessments
 */
router.get('/compliance', async (req: Request, res: Response) => {
  try {
    const supabase = getSupabaseClient()
    if (!supabase) {
      return res.json({ assessments: [], lastReviewed: null })
    }

    const { data, error } = await supabase
      .from('compliance_assessments')
      .select('id, framework, framework_display, category, principle, principle_display, principle_description, status, met_count, total_count, evidence, gaps, action_plan, target_date, assessed_by, reviewed_by, reviewed_at, sort_order')
      .order('category')
      .order('sort_order')

    if (error) {
      return res.status(500).json({ error: error.message })
    }

    // Group by category
    const grouped: Record<string, any[]> = {}
    for (const row of (data || [])) {
      if (!grouped[row.category]) grouped[row.category] = []
      grouped[row.category].push(row)
    }

    // Find most recent review date
    const reviewed = (data || []).filter(d => d.reviewed_at).sort((a, b) =>
      new Date(b.reviewed_at).getTime() - new Date(a.reviewed_at).getTime()
    )

    res.json({
      assessments: grouped,
      lastReviewed: reviewed[0]?.reviewed_at || null,
      totalPrinciples: data?.length || 0,
      metCount: data?.filter(d => d.status === 'met').length || 0,
      partialCount: data?.filter(d => d.status === 'partially_met').length || 0
    })
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch compliance data' })
  }
})

export default router
