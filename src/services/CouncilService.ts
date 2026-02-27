/**
 * LLM Council Service
 * 3-stage deliberation: Propose → Peer Review → Synthesise
 *
 * Architecture: Karpathy-style council adapted for community platform.
 * Uses GROQ (Llama 3.3 70B) via OpenAI-compatible API.
 * ~6 API calls per session, well within free tier.
 */

import OpenAI from 'openai'
import { getSupabaseClient } from '../lib/supabaseClient.js'

// ── Types ──

export interface CouncilProposal {
  agentRole: string
  proposal: string
  reasoning: string
  sources: string[]  // ivor_intelligence IDs referenced
}

interface PeerReview {
  reviewerRole: string
  scores: Record<string, {
    relevance: number    // 1-5
    joyQuotient: number  // 1-5
    communityNeed: number // 1-5
    liberationAlignment: number // 1-5
    total: number
    feedback: string
  }>
}

export interface CouncilVerdict {
  sessionId: string
  synthesised: string
  rankings: Record<string, number>
  dissent: string | null
  liberationScore: number
  proposals: CouncilProposal[]
  useCase: string
}

interface IntelligenceContext {
  id: string
  intelligence_type: string
  summary: string
  key_insights: string[]
  relevance_score: number
  data_timestamp: string
}

// ── Agent Prompts ──

const AGENT_PROMPTS: Record<string, string> = {
  herald: `You are the Herald, BLKOUT's newsletter curator.
Your role: Select and frame the most engaging, relevant content for the community.
Priorities: 75% Black queer joy and celebration, 25% calls to action and resources.
You draw from events, articles, community achievements, and upcoming opportunities.
Output: A structured newsletter section proposal with headline, body, and call to action.`,

  listener: `You are the Listener, BLKOUT's community intelligence agent.
Your role: Surface unmet community needs, trending concerns, and emerging topics.
You read conversation themes, feedback patterns, and engagement signals.
You advocate for what the community is *asking for* that isn't being addressed.
Output: 2-3 priority community needs with evidence and suggested responses.`,

  griot: `You are the Griot, BLKOUT's storytelling agent.
Your role: Find the compelling narrative angle that centres Black queer experience.
You transform data and events into stories that resonate emotionally.
You ensure the community's own voice and language is reflected.
Output: A story angle or narrative frame that could wrap around the Herald's content.`,
}

const CHAIR_PROMPT = `You are the Strategist, chairing the BLKOUT Council.
You have received proposals from three agents (Herald, Listener, Griot) and their peer reviews.
Your role: Synthesise the best elements into a cohesive output.
Rules:
- Honour the highest-scored elements from peer review
- Note any dissenting view worth preserving
- Ensure 75% joy quotient (celebration > deficit framing)
- Flag anything that needs human review
- Be concise — the output goes to an admin for approval, not directly to members

Output JSON:
{
  "synthesised": "The combined output text",
  "dissent": "Any minority view worth noting, or null",
  "liberationScore": 0.0-1.0 (how well this centres liberation values)
}`

const REVIEW_PROMPT = `You are reviewing proposals from BLKOUT Council agents.
Score each proposal on four criteria (1-5 each):
- relevance: How relevant is this to what the community needs right now?
- joyQuotient: Does this centre joy, celebration, and empowerment (not deficit)?
- communityNeed: Does this address something the community is actually asking for?
- liberationAlignment: Does this advance cooperative values and Black queer liberation?

Output JSON (one entry per proposal):
{
  "agent_name": {
    "relevance": N, "joyQuotient": N, "communityNeed": N, "liberationAlignment": N,
    "total": N, "feedback": "brief note"
  }
}`

// ── Service ──

export class CouncilService {
  private ai: OpenAI | null = null
  private model: string = 'llama-3.3-70b-versatile'

  constructor() {
    const groqKey = process.env.GROQ_API_KEY
    if (groqKey && groqKey !== 'your-groq-api-key-here') {
      this.ai = new OpenAI({
        apiKey: groqKey,
        baseURL: 'https://api.groq.com/openai/v1'
      })
      console.log('[Council] GROQ AI enabled')
    } else {
      console.log('[Council] No GROQ key — council disabled')
    }
  }

  /**
   * Full council session: propose → review → synthesise
   */
  async convene(useCase: string = 'newsletter', trigger: string = 'manual'): Promise<CouncilVerdict | null> {
    if (!this.ai) {
      console.error('[Council] Cannot convene — no AI configured')
      return null
    }

    const supabase = getSupabaseClient()
    const startTime = Date.now()

    // Create session record
    let sessionId: string | null = null
    if (supabase) {
      const { data } = await supabase.from('council_sessions').insert({
        trigger,
        use_case: useCase,
        status: 'in_progress'
      }).select('id').single()
      sessionId = data?.id || null
    }

    try {
      // Gather intelligence context
      const context = await this.gatherIntelligence()

      // Stage 1: Proposals (parallel)
      console.log('[Council] Stage 1: Gathering proposals...')
      const proposals = await this.propose(context, useCase)

      // Stage 2: Peer review (parallel)
      console.log('[Council] Stage 2: Peer review...')
      const reviews = await this.review(proposals)

      // Stage 3: Chair synthesis
      console.log('[Council] Stage 3: Synthesis...')
      const verdict = await this.synthesise(proposals, reviews)

      // Calculate rankings from reviews
      const rankings: Record<string, number> = {}
      for (const review of reviews) {
        for (const [agent, scores] of Object.entries(review.scores)) {
          rankings[agent] = (rankings[agent] || 0) + scores.total
        }
      }

      const result: CouncilVerdict = {
        sessionId: sessionId || 'no-db',
        synthesised: verdict.synthesised,
        rankings,
        dissent: verdict.dissent,
        liberationScore: verdict.liberationScore,
        proposals,
        useCase
      }

      // Persist result
      if (supabase && sessionId) {
        await supabase.from('council_sessions').update({
          status: 'completed',
          proposals: proposals,
          rankings: rankings,
          verdict: verdict.synthesised,
          dissent: verdict.dissent,
          liberation_score: verdict.liberationScore,
          intelligence_ids: context.map(c => c.id),
          duration_ms: Date.now() - startTime,
          completed_at: new Date().toISOString()
        }).eq('id', sessionId)
      }

      console.log(`[Council] Session complete in ${Date.now() - startTime}ms, liberation score: ${verdict.liberationScore}`)
      return result

    } catch (error: any) {
      console.error('[Council] Session failed:', error.message)
      if (supabase && sessionId) {
        await supabase.from('council_sessions').update({
          status: 'failed',
          error: error.message,
          duration_ms: Date.now() - startTime
        }).eq('id', sessionId)
      }
      return null
    }
  }

  /**
   * Stage 1: Each agent proposes based on shared intelligence context
   */
  private async propose(context: IntelligenceContext[], useCase: string): Promise<CouncilProposal[]> {
    const contextSummary = context.map(c =>
      `[${c.intelligence_type}] (relevance: ${c.relevance_score}) ${c.summary}\nInsights: ${(c.key_insights || []).join('; ')}`
    ).join('\n\n')

    const useCaseInstruction = useCase === 'newsletter'
      ? 'Propose content for this week\'s BLKOUT community newsletter.'
      : useCase === 'compliance'
        ? 'Assess BLKOUT\'s compliance with cooperative and governance best practices based on the intelligence data.'
        : 'Review and evaluate the content quality based on the intelligence data.'

    const agentRoles = Object.keys(AGENT_PROMPTS)
    const proposals = await Promise.all(
      agentRoles.map(async (role) => {
        try {
          const response = await this.ai!.chat.completions.create({
            model: this.model,
            temperature: 0.7,
            max_tokens: 800,
            messages: [
              { role: 'system', content: AGENT_PROMPTS[role] },
              { role: 'user', content: `${useCaseInstruction}\n\nCurrent community intelligence:\n${contextSummary}` }
            ]
          })

          return {
            agentRole: role,
            proposal: response.choices[0]?.message?.content || '',
            reasoning: `Based on ${context.length} intelligence signals`,
            sources: context.map(c => c.id)
          }
        } catch (err: any) {
          console.error(`[Council] ${role} proposal failed:`, err.message)
          return {
            agentRole: role,
            proposal: `[${role} unavailable this session]`,
            reasoning: `Error: ${err.message}`,
            sources: []
          }
        }
      })
    )

    return proposals
  }

  /**
   * Stage 2: Anonymised peer review — each agent scores the others
   */
  private async review(proposals: CouncilProposal[]): Promise<PeerReview[]> {
    const proposalText = proposals.map((p, i) =>
      `--- Proposal ${i + 1} (Agent: ${p.agentRole}) ---\n${p.proposal}`
    ).join('\n\n')

    // Two reviewers (not three — the chair doesn't review, they synthesise)
    const reviewerRoles = ['herald', 'listener']
    const reviews = await Promise.all(
      reviewerRoles.map(async (role) => {
        try {
          const response = await this.ai!.chat.completions.create({
            model: this.model,
            temperature: 0.3, // Lower temp for more consistent scoring
            max_tokens: 600,
            messages: [
              { role: 'system', content: REVIEW_PROMPT },
              { role: 'user', content: `Review these proposals:\n\n${proposalText}` }
            ]
          })

          const content = response.choices[0]?.message?.content || '{}'
          const scores = this.parseJSON(content)

          return {
            reviewerRole: role,
            scores: scores as PeerReview['scores']
          }
        } catch (err: any) {
          console.error(`[Council] ${role} review failed:`, err.message)
          return { reviewerRole: role, scores: {} }
        }
      })
    )

    return reviews
  }

  /**
   * Stage 3: Chair synthesises proposals informed by peer review rankings
   */
  private async synthesise(
    proposals: CouncilProposal[],
    reviews: PeerReview[]
  ): Promise<{ synthesised: string; dissent: string | null; liberationScore: number }> {
    const proposalText = proposals.map(p =>
      `--- ${p.agentRole.toUpperCase()} ---\n${p.proposal}`
    ).join('\n\n')

    const reviewSummary = reviews.map(r => {
      const entries = Object.entries(r.scores).map(([agent, s]) =>
        `${agent}: ${s.total}/20 — "${s.feedback}"`
      ).join('\n')
      return `Reviewer ${r.reviewerRole}:\n${entries}`
    }).join('\n\n')

    try {
      const response = await this.ai!.chat.completions.create({
        model: this.model,
        temperature: 0.5,
        max_tokens: 1200,
        messages: [
          { role: 'system', content: CHAIR_PROMPT },
          { role: 'user', content: `Proposals:\n\n${proposalText}\n\nPeer Reviews:\n\n${reviewSummary}` }
        ]
      })

      const content = response.choices[0]?.message?.content || '{}'
      const result = this.parseJSON(content)

      return {
        synthesised: result.synthesised || content,
        dissent: result.dissent || null,
        liberationScore: Math.min(1, Math.max(0, parseFloat(result.liberationScore) || 0.5))
      }
    } catch (err: any) {
      console.error('[Council] Synthesis failed:', err.message)
      return {
        synthesised: proposals.map(p => p.proposal).join('\n\n---\n\n'),
        dissent: 'Chair synthesis failed — raw proposals returned',
        liberationScore: 0.5
      }
    }
  }

  /**
   * Gather recent intelligence from ivor_intelligence table
   */
  private async gatherIntelligence(): Promise<IntelligenceContext[]> {
    const supabase = getSupabaseClient()
    if (!supabase) return []

    const { data, error } = await supabase
      .from('ivor_intelligence')
      .select('id, intelligence_type, summary, key_insights, relevance_score, data_timestamp')
      .eq('is_active', true)
      .order('relevance_score', { ascending: false })
      .limit(15)

    if (error || !data) {
      console.error('[Council] Intelligence fetch failed:', error?.message)
      return []
    }

    return data as IntelligenceContext[]
  }

  /**
   * Parse JSON from LLM output (handles markdown code blocks)
   */
  private parseJSON(text: string): any {
    try {
      // Strip markdown code fences if present
      const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      return JSON.parse(cleaned)
    } catch {
      // Try to find JSON object in the text
      const match = text.match(/\{[\s\S]*\}/)
      if (match) {
        try { return JSON.parse(match[0]) } catch { /* fall through */ }
      }
      return {}
    }
  }
}

export default CouncilService
