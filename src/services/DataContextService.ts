/**
 * DataContextService
 * Queries Supabase for live BLKOUT data and formats it for injection
 * into the AI system prompt, so AIvor can answer with real facts.
 */

import { SupabaseClient } from '@supabase/supabase-js'

export interface LiveContext {
  events: string
  news: string
  learning: string
  groups: string
  shop: string
}

type TopicHint =
  | 'events'
  | 'news'
  | 'learning'
  | 'groups'
  | 'shop'
  | 'general'

export class DataContextService {
  private supabase: SupabaseClient | null

  constructor(supabase: SupabaseClient | null) {
    this.supabase = supabase
    if (!supabase) {
      console.log('[DataContext] No Supabase client — live data disabled')
    } else {
      console.log('[DataContext] Initialized with Supabase connection')
    }
  }

  /**
   * Main entry point — returns formatted live data for the system prompt.
   * Selects which data to fetch based on detected topic.
   */
  async getContext(message: string, topic?: string, location?: string): Promise<LiveContext> {
    if (!this.supabase) {
      return this.emptyContext()
    }

    const hint = this.detectTopicHint(message, topic)
    const dateRange = this.extractDateRange(message)

    try {
      // Fetch data in parallel, scoped by topic relevance
      const [events, news, learning, groups, shop] = await Promise.all([
        this.shouldFetch(hint, 'events') ? this.getUpcomingEvents(hint === 'events' ? 25 : 5, location, dateRange) : Promise.resolve(''),
        this.shouldFetch(hint, 'news') ? this.getRecentNews(hint === 'news' ? 5 : 3) : Promise.resolve(''),
        this.shouldFetch(hint, 'learning') ? this.getLearningModules(hint === 'learning' ? 10 : 3) : Promise.resolve(''),
        this.shouldFetch(hint, 'groups') ? this.getCommunityGroups(hint === 'groups' ? 10 : 3, location) : Promise.resolve(''),
        this.shouldFetch(hint, 'shop') ? this.getShopHighlights(5) : Promise.resolve('')
      ])

      console.log(`[DataContext] Fetched context for hint="${hint}": events=${!!events}, news=${!!news}, learning=${!!learning}, groups=${!!groups}, shop=${!!shop}`)

      return { events, news, learning, groups, shop }
    } catch (error) {
      console.error('[DataContext] Error fetching context:', error)
      return this.emptyContext()
    }
  }

  // --- Individual query methods ---

  private async getUpcomingEvents(limit: number, location?: string, dateRange?: { from: string, to: string } | null): Promise<string> {
    try {
      const today = new Date().toISOString().split('T')[0]

      let query = this.supabase!
        .from('events')
        .select('title, date, start_time, end_time, location, organizer, description, cost, url, tags')
        .eq('status', 'approved')
        .gte('date', dateRange?.from || today)
        .order('date', { ascending: true })
        .limit(limit)

      // If the user asked about a specific date/period, also cap the end date
      if (dateRange?.to) {
        query = query.lte('date', dateRange.to)
      }

      if (location && location !== 'unknown') {
        query = query.ilike('location', `%${location}%`)
      }

      const { data, error } = await query

      if (error || !data || data.length === 0) {
        if (error) console.warn('[DataContext] Events query error:', error.message)
        return ''
      }

      return data.map(e => {
        const date = e.date ? new Date(e.date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : 'TBC'
        const time = e.start_time ? ` at ${e.start_time}` : ''
        const loc = e.location ? ` — ${e.location}` : ''
        const org = e.organizer ? ` (${e.organizer})` : ''
        const cost = e.cost ? ` [${e.cost}]` : ' [Free]'
        const link = e.url ? ` | ${e.url}` : ''
        return `- ${e.title} — ${date}${time}${loc}${org}${cost}${link}`
      }).join('\n')
    } catch (error) {
      console.warn('[DataContext] Events fetch failed:', error)
      return ''
    }
  }

  private async getRecentNews(limit: number): Promise<string> {
    try {
      const { data, error } = await this.supabase!
        .from('news_articles')
        .select('title, excerpt, category, published_at')
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(limit)

      if (error || !data || data.length === 0) {
        if (error) console.warn('[DataContext] News query error:', error.message)
        return ''
      }

      return data.map(n => {
        const date = n.published_at ? new Date(n.published_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : ''
        const excerpt = n.excerpt ? ` — ${n.excerpt.substring(0, 80)}` : ''
        const cat = n.category ? ` [${n.category}]` : ''
        return `- ${n.title}${excerpt}${cat} (${date})`
      }).join('\n')
    } catch (error) {
      console.warn('[DataContext] News fetch failed:', error)
      return ''
    }
  }

  private async getLearningModules(limit: number, category?: string): Promise<string> {
    try {
      let query = this.supabase!
        .from('learning_modules')
        .select('title, description, category, difficulty_level, estimated_duration_minutes')
        .eq('is_published', true)
        .order('published_at', { ascending: false })
        .limit(limit)

      if (category) {
        query = query.eq('category', category)
      }

      const { data, error } = await query

      if (error || !data || data.length === 0) {
        if (error) console.warn('[DataContext] Learning query error:', error.message)
        return ''
      }

      return data.map(m => {
        const desc = m.description ? ` — ${m.description.substring(0, 60)}` : ''
        const diff = m.difficulty_level ? ` (${m.difficulty_level})` : ''
        const dur = m.estimated_duration_minutes ? ` [${m.estimated_duration_minutes}min]` : ''
        return `- ${m.title}${desc}${diff}${dur}`
      }).join('\n')
    } catch (error) {
      console.warn('[DataContext] Learning fetch failed:', error)
      return ''
    }
  }

  private async getCommunityGroups(limit: number, location?: string): Promise<string> {
    try {
      let query = this.supabase!
        .from('community_groups')
        .select('name, description, category, location_focus, member_count, visibility')
        .eq('visibility', 'public')
        .order('member_count', { ascending: false })
        .limit(limit)

      if (location && location !== 'unknown') {
        query = query.ilike('location_focus', `%${location}%`)
      }

      const { data, error } = await query

      if (error || !data || data.length === 0) {
        if (error) console.warn('[DataContext] Groups query error:', error.message)
        return ''
      }

      return data.map(g => {
        const desc = g.description ? ` — ${g.description.substring(0, 60)}` : ''
        const loc = g.location_focus ? ` [${g.location_focus}]` : ''
        const members = g.member_count ? ` (${g.member_count} members)` : ''
        return `- ${g.name}${desc}${loc}${members}`
      }).join('\n')
    } catch (error) {
      console.warn('[DataContext] Groups fetch failed:', error)
      return ''
    }
  }

  private async getShopHighlights(limit: number): Promise<string> {
    try {
      const { data, error } = await this.supabase!
        .from('shop_products')
        .select('name, short_description, price_gbp, type, category')
        .eq('status', 'active')
        .eq('featured', true)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error || !data || data.length === 0) {
        if (error) console.warn('[DataContext] Shop query error:', error.message)
        return ''
      }

      return data.map(p => {
        const desc = p.short_description ? ` — ${p.short_description.substring(0, 60)}` : ''
        const price = p.price_gbp ? ` £${p.price_gbp}` : ''
        return `- ${p.name}${desc}${price}`
      }).join('\n')
    } catch (error) {
      console.warn('[DataContext] Shop fetch failed:', error)
      return ''
    }
  }

  // --- Helpers ---

  /**
   * Extract a date range from the user's message for targeted event queries.
   * Returns { from, to } ISO date strings, or null if no date reference found.
   */
  private extractDateRange(message: string): { from: string, to: string } | null {
    const lower = (message || '').toLowerCase()
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    const toISO = (d: Date) => d.toISOString().split('T')[0]

    // "valentine's day" / "valentines" / "feb 14" / "14th feb"
    if (/valentine|feb(?:ruary)?\s*14|14(?:th)?\s*(?:of\s+)?feb/i.test(lower)) {
      const year = now.getMonth() > 1 ? now.getFullYear() + 1 : now.getFullYear()
      const vday = new Date(year, 1, 14)
      return { from: toISO(vday), to: toISO(vday) }
    }

    // "this weekend"
    if (/this\s+weekend/.test(lower)) {
      const dayOfWeek = today.getDay()
      const daysUntilSat = (6 - dayOfWeek + 7) % 7 || (dayOfWeek === 0 ? 6 : 0)
      const sat = new Date(today)
      sat.setDate(today.getDate() + daysUntilSat)
      // If it's already Saturday or Sunday, use today as start
      const from = dayOfWeek === 0 || dayOfWeek === 6 ? today : sat
      const sun = new Date(sat)
      sun.setDate(sat.getDate() + 1)
      return { from: toISO(from), to: toISO(sun) }
    }

    // "next weekend"
    if (/next\s+weekend/.test(lower)) {
      const dayOfWeek = today.getDay()
      const daysUntilNextSat = ((6 - dayOfWeek + 7) % 7) + 7
      const sat = new Date(today)
      sat.setDate(today.getDate() + (dayOfWeek === 6 ? 7 : daysUntilNextSat))
      const sun = new Date(sat)
      sun.setDate(sat.getDate() + 1)
      return { from: toISO(sat), to: toISO(sun) }
    }

    // "next week"
    if (/next\s+week/.test(lower)) {
      const dayOfWeek = today.getDay()
      const daysUntilMon = ((1 - dayOfWeek + 7) % 7) + 7
      const mon = new Date(today)
      mon.setDate(today.getDate() + (dayOfWeek === 1 ? 7 : daysUntilMon))
      const sun = new Date(mon)
      sun.setDate(mon.getDate() + 6)
      return { from: toISO(mon), to: toISO(sun) }
    }

    // "this week"
    if (/this\s+week/.test(lower)) {
      const dayOfWeek = today.getDay()
      const sun = new Date(today)
      sun.setDate(today.getDate() + (7 - dayOfWeek))
      return { from: toISO(today), to: toISO(sun) }
    }

    return null
  }

  /**
   * Detect which data categories are most relevant to the user's message.
   */
  private detectTopicHint(message: string, topic?: string): TopicHint {
    const lower = (message || '').toLowerCase()

    // Events (including date references that imply event queries)
    if (/\b(event|what'?s on|this weekend|next weekend|this week|next week|calendar|gig|party|night out|social|meetup|gathering|valentine|friday|saturday|sunday|dance|rave|club night)\b/.test(lower)) return 'events'

    // News
    if (/\b(news|what'?s happening|article|headline|update|announcement|latest)\b/.test(lower)) return 'news'

    // Learning
    if (/\b(learn|course|module|skill|training|workshop|class|develop|education|study)\b/.test(lower)) return 'learning'

    // Groups
    if (/\b(group|join|connect|local|community group|network|chapter|belong)\b/.test(lower)) return 'groups'

    // Shop
    if (/\b(shop|buy|merch|merchandise|product|support business|store|tee|hoodie)\b/.test(lower)) return 'shop'

    // Topic-based fallback
    if (topic === 'community') return 'events'

    return 'general'
  }

  /**
   * Decide whether to fetch a data category based on the detected topic hint.
   */
  private shouldFetch(hint: TopicHint, category: 'events' | 'news' | 'learning' | 'groups' | 'shop'): boolean {
    if (hint === category) return true
    if (hint === 'general') {
      // For general queries, fetch events + news + learning (the most broadly useful)
      return category !== 'shop'
    }
    // For specific queries, always also include events as secondary context
    if (category === 'events') return true
    return false
  }

  private emptyContext(): LiveContext {
    return { events: '', news: '', learning: '', groups: '', shop: '' }
  }

  /**
   * Format the LiveContext into a single string block for the system prompt.
   */
  static formatForPrompt(ctx: LiveContext): string {
    const sections: string[] = []

    if (ctx.events) {
      sections.push(`UPCOMING EVENTS:\n${ctx.events}`)
    }
    if (ctx.news) {
      sections.push(`RECENT NEWS:\n${ctx.news}`)
    }
    if (ctx.learning) {
      sections.push(`LEARNING MODULES:\n${ctx.learning}`)
    }
    if (ctx.groups) {
      sections.push(`COMMUNITY GROUPS:\n${ctx.groups}`)
    }
    if (ctx.shop) {
      sections.push(`FEATURED IN THE SHOP:\n${ctx.shop}`)
    }

    if (sections.length === 0) return ''

    return `LIVE DATA FROM BLKOUT (verified, current — use this to answer questions):

${sections.join('\n\n')}

IMPORTANT: Use this data to give specific, real answers. Reference actual events, modules, and groups listed above — never say "check the website" or "visit blkoutuk.com" when you have real data right here. The user is ALREADY ON blkoutuk.com talking to you. If they want to browse events, tell them to click the Events tab on this site. If they want news, tell them to check the News section. Never send them away from where they already are.`
  }
}

export default DataContextService
