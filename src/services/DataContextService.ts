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
  openings: string
  places: string
  doors: string
}

type TopicHint =
  | 'openings'
  | 'places'
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
      const [events, news, learning, groups, shop, openings, places, doors] = await Promise.all([
        this.shouldFetch(hint, 'events') ? this.getUpcomingEvents(hint === 'events' ? 25 : 5, location, dateRange) : Promise.resolve(''),
        this.shouldFetch(hint, 'news') ? this.getRecentNews(hint === 'news' ? 5 : 3) : Promise.resolve(''),
        this.shouldFetch(hint, 'learning') ? this.getLearningModules(hint === 'learning' ? 10 : 3) : Promise.resolve(''),
        this.shouldFetch(hint, 'groups') ? this.getCommunityGroups(hint === 'groups' ? 10 : 3, location) : Promise.resolve(''),
        this.shouldFetch(hint, 'shop') ? this.getShopHighlights(5) : Promise.resolve(''),
        this.shouldFetch(hint, 'openings') ? this.getOpenings(hint === 'openings' ? 25 : 6) : Promise.resolve(''),
        this.shouldFetch(hint, 'places') ? this.getPlaces(location, hint === 'places' ? 45 : 12) : Promise.resolve(''),
        this.getDoors(message, location)
      ])

      console.log(`[DataContext] Fetched context for hint="${hint}": events=${!!events}, news=${!!news}, learning=${!!learning}, groups=${!!groups}, shop=${!!shop}`)

      return { events, news, learning, groups, shop, openings, places, doors }
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
        .from('gatherings_live') // the same completeness-gated view events.blkoutuk.com shows
        .select('title, date, start_time, end_time, location, organizer, description, cost, url, tags')
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

  /** Things to go after — openings_live on events.blkoutuk.com (jobs, commissions, bursaries, funds, calls). */
  private async getOpenings(limit: number): Promise<string> {
    try {
      const { data, error } = await this.supabase!
        .from('openings_live')
        .select('title, organisation, kind, beat, summary, open_to, pay, location, url, deadline')
        .order('deadline', { ascending: true, nullsFirst: false })
        .limit(limit)
      if (error || !data || data.length === 0) {
        if (error) console.warn('[DataContext] Openings query error:', error.message)
        return ''
      }
      return data.map(o => {
        const closes = o.deadline ? `closes ${new Date(o.deadline).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}` : 'rolling'
        const pay = o.pay ? ` [${o.pay}]` : ''
        const openTo = o.open_to ? ` — open to: ${o.open_to}` : ''
        return `- ${o.title} — ${o.organisation} (${o.kind}, ${closes})${pay}${openTo} | ${o.url}`
      }).join('\n')
    } catch (error) {
      console.warn('[DataContext] Openings fetch failed:', error)
      return ''
    }
  }

  private placesCache: { at: number; places: any[] } | null = null

  /** Where we are — the checked Places directory published by events.blkoutuk.com/places.json (1h cache). */
  private async getPlaces(location?: string, limit = 12): Promise<string> {
    try {
      if (!this.placesCache || Date.now() - this.placesCache.at > 60 * 60 * 1000) {
        const res = await fetch('https://events.blkoutuk.com/places.json')
        if (!res.ok) { console.warn('[DataContext] places.json HTTP', res.status); return this.placesCache ? this.formatPlaces(this.placesCache.places, location, limit) : '' }
        const json: any = await res.json()
        this.placesCache = { at: Date.now(), places: Array.isArray(json?.places) ? json.places : [] }
      }
      return this.formatPlaces(this.placesCache.places, location, limit)
    } catch (error) {
      console.warn('[DataContext] Places fetch failed:', error)
      return ''
    }
  }

  private formatPlaces(all: any[], location: string | undefined, limit: number): string {
    let list = all
    if (location && location !== 'unknown') {
      const loc = location.toLowerCase()
      const near = all.filter(p => [p.where, p.borough, p.region, p.name].filter(Boolean).some((f: string) => f.toLowerCase().includes(loc)))
      if (near.length) list = [...near, ...all.filter(p => !near.includes(p))]
    }
    return list.slice(0, limit).map(p => {
      const where = [p.where, p.borough ? `${p.borough}` : null].filter(Boolean).join(', ')
      const reg = p.regular ? ` (${p.regular})` : ''
      const link = p.url ? ` | ${p.url}` : ''
      return `- ${p.name} — ${p.what}${reg} — ${where}${link}`
    }).join('\n')
  }

  private doorsCache: { at: number; doors: any[] } | null = null

  /** Neighbourhoods people actually name, mapped to the borough whose local page covers them. */
  private static AREA_TO_BOROUGH: Record<string, string> = {
    brixton: 'Lambeth', stockwell: 'Lambeth', vauxhall: 'Lambeth', clapham: 'Lambeth', streatham: 'Lambeth', 'west norwood': 'Lambeth', kennington: 'Lambeth', 'herne hill': 'Lambeth',
    peckham: 'Southwark', camberwell: 'Southwark', 'elephant and castle': 'Southwark', 'elephant & castle': 'Southwark', bermondsey: 'Southwark', 'east dulwich': 'Southwark', dulwich: 'Southwark', walworth: 'Southwark', 'london bridge': 'Southwark', bankside: 'Southwark',
    deptford: 'Lewisham', catford: 'Lewisham', 'new cross': 'Lewisham', 'forest hill': 'Lewisham', brockley: 'Lewisham', sydenham: 'Lewisham',
    'thornton heath': 'Croydon', 'south norwood': 'Croydon', norbury: 'Croydon', purley: 'Croydon', 'east croydon': 'Croydon',
    soho: 'Westminster', 'covent garden': 'Westminster', marylebone: 'Westminster', paddington: 'Westminster', pimlico: 'Westminster', 'west end': 'Westminster', mayfair: 'Westminster', 'maida vale': 'Westminster',
    'camden town': 'Camden', 'kentish town': 'Camden', "king's cross": 'Camden', 'kings cross': 'Camden', holborn: 'Camden', bloomsbury: 'Camden', kilburn: 'Camden', hampstead: 'Camden',
    highbury: 'Islington', holloway: 'Islington', archway: 'Islington', angel: 'Islington', 'upper street': 'Islington', 'finsbury park': 'Islington', clerkenwell: 'Islington',
    dalston: 'Hackney', shoreditch: 'Hackney', 'stoke newington': 'Hackney', homerton: 'Hackney', 'hackney wick': 'Hackney', clapton: 'Hackney', 'london fields': 'Hackney',
    tottenham: 'Haringey', 'wood green': 'Haringey', 'crouch end': 'Haringey', 'seven sisters': 'Haringey', 'muswell hill': 'Haringey', hornsey: 'Haringey',
    'bethnal green': 'Tower Hamlets', bow: 'Tower Hamlets', whitechapel: 'Tower Hamlets', limehouse: 'Tower Hamlets', poplar: 'Tower Hamlets', 'mile end': 'Tower Hamlets', 'canary wharf': 'Tower Hamlets', 'brick lane': 'Tower Hamlets', spitalfields: 'Tower Hamlets', stepney: 'Tower Hamlets',
    stratford: 'Newham', 'east ham': 'Newham', 'west ham': 'Newham', 'forest gate': 'Newham', 'canning town': 'Newham', plaistow: 'Newham',
    walthamstow: 'Waltham Forest', leyton: 'Waltham Forest', leytonstone: 'Waltham Forest', chingford: 'Waltham Forest',
    edmonton: 'Enfield', 'ponders end': 'Enfield', southgate: 'Enfield',
    wembley: 'Brent', harlesden: 'Brent', willesden: 'Brent', 'kensal green': 'Brent', neasden: 'Brent', 'kensal rise': 'Brent'
  }

  /** Borough doors — what each door page on events.blkoutuk.com says, from /doors.json (1h cache).
   *  Returns the full door for any borough named in the message or location; for a general
   *  "door/borough" question, the list of open doors. Empty otherwise. */
  private async getDoors(message: string, location?: string): Promise<string> {
    try {
      if (!this.doorsCache || Date.now() - this.doorsCache.at > 60 * 60 * 1000) {
        const res = await fetch('https://events.blkoutuk.com/doors.json')
        if (!res.ok) { console.warn('[DataContext] doors.json HTTP', res.status); if (!this.doorsCache) return '' }
        else {
          const json: any = await res.json()
          this.doorsCache = { at: Date.now(), doors: Array.isArray(json?.doors) ? json.doors : [] }
        }
      }
      const all = this.doorsCache!.doors
      const text = `${message || ''} ${location && location !== 'unknown' ? location : ''}`.toLowerCase()
      const has = (term: string) => new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`).test(text)
      const wanted = new Set<string>()
      for (const d of all) if (has(String(d.borough).toLowerCase())) wanted.add(d.borough)
      for (const [area, borough] of Object.entries(DataContextService.AREA_TO_BOROUGH)) if (has(area)) wanted.add(borough)
      const named = all.filter(d => wanted.has(d.borough)).slice(0, 2)
      if (named.length) return named.map(d => this.formatDoor(d)).join('\n\n')
      if (/\b(london|near me|nearby|in my area|around here|local|locally|my borough|north london|south london|east london|west london)\b/.test(text))
        return `BLKOUT has a local page for these London boroughs — ask which area they're in, then use it: ${all.map(d => `${d.borough} (${d.url})`).join(', ')}`
      return ''
    } catch (error) {
      console.warn('[DataContext] Doors fetch failed:', error)
      return ''
    }
  }

  private formatDoor(d: any): string {
    const list = (title: string, entries: any[]) => entries?.length
      ? `${title}:\n${entries.map(e => `- ${e.name} — ${e.note ?? ''}${e.url ? ` | ${e.url}` : ''}`).join('\n')}` : ''
    return [
      `BLKOUT in ${d.borough} — local page ${d.url} (checked ${d.lastChecked})`,
      d.history ? `History, as the page tells it:\n${String(d.history).slice(0, 1800)}` : '',
      list('Here in the borough', d.here),
      d.here?.length ? '' : (d.quietNote ? `Here in the borough: ${d.quietNote}` : ''),
      list('Beside us (allies and neighbours)', d.besideUs),
      list('Worth the journey', d.worthTheJourney),
      list('Look after yourself (services)', d.services)
    ].filter(Boolean).join('\n')
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

    // Openings — things to go after
    if (/\b(apply|application|job|jobs|vacanc|bursar|grant|fund|funding|commission|residenc|fellowship|opportunit|deadline|call for|open call|trustee|internship)\w*\b/.test(lower)) return 'openings'

    // Places — where we are (standing organisations, groups, venues)
    if (/\b(where (do|can|to)|organisation|organization|directory|venue|club night|meet ?up|places?|near me|in my area|around here|regular|monthly group|peer support)\b/.test(lower)) return 'places'

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
  private shouldFetch(hint: TopicHint, category: 'events' | 'news' | 'learning' | 'groups' | 'shop' | 'openings' | 'places'): boolean {
    if (hint === category) return true
    // Places ride along with events/groups questions; openings ride along with learning questions.
    if (category === 'places' && (hint === 'events' || hint === 'groups')) return true
    if (category === 'openings' && hint === 'learning') return true
    if (category === 'places' || category === 'openings') return false
    if (hint === 'general') {
      // For general queries, fetch events + news + learning (the most broadly useful)
      return category !== 'shop'
    }
    // For specific queries, always also include events as secondary context
    if (category === 'events') return true
    return false
  }

  private emptyContext(): LiveContext {
    return { events: '', news: '', learning: '', groups: '', shop: '', openings: '', places: '', doors: '' }
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
    if (ctx.openings) {
      sections.push(`OPENINGS — things to go after (jobs, commissions, bursaries, funds, calls; from events.blkoutuk.com/openings):\n${ctx.openings}`)
    }
    if (ctx.places) {
      sections.push(`PLACES — organisations, groups and venues for Black queer people, each checked for activity in the last year (from events.blkoutuk.com/places):\n${ctx.places}`)
    }

    if (ctx.doors) {
      sections.push(`LOCAL — BLKOUT's own local page for the area asked about (events.blkoutuk.com). Answer from it, and share the page link:\n${ctx.doors}`)
    }

    if (sections.length === 0) return ''

    return `LIVE DATA FROM BLKOUT (verified, current — use this to answer questions):

${sections.join('\n\n')}

IMPORTANT: Use this data to give specific, real answers. Reference actual events, modules, and groups listed above — never say "check the website" or "visit blkoutuk.com" when you have real data right here. The user is ALREADY ON blkoutuk.com talking to you. If they want to browse events, tell them to click the Events tab on this site. If they want news, tell them to check the News section. Never send them away from where they already are.`
  }
}

export default DataContextService
