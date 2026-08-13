import OpenAI from 'openai'
import { createClient } from '@supabase/supabase-js'
import EmbeddingService from './embeddingService.js'

interface ConversationContext {
  userId: string
  conversationHistory: Array<{
    role: 'user' | 'assistant' | 'system',
    content: string,
    timestamp: Date
  }>
  userProfile: {
    pronouns?: string
    location?: string
    supportNeeds?: string[]
    culturalContext?: string
    accessibilityNeeds?: string[]
    communicationStyle?: string
  }
  currentTopic?: string
  emotionalState?: 'calm' | 'stressed' | 'excited' | 'overwhelmed' | 'joyful' | 'uncertain' | 'crisis' | 'hopeful'
  lastInteraction?: Date
  sessionId: string
}

// Enhanced Conversation Service with AI and Memory
class ConversationService {
  private ai: OpenAI | null = null
  private aiModel: string = 'qwen-max'
  private supabase: any
  private embeddingService: EmbeddingService
  private isAIEnabled: boolean = false

  constructor(supabaseUrl: string, supabaseKey: string) {
    // Handle mock/development mode
    if (supabaseUrl === 'mock-url' || !supabaseUrl.startsWith('http')) {
      this.supabase = null
      console.log('ConversationService: Running in mock mode - no Supabase connection')
    } else {
      this.supabase = createClient(supabaseUrl, supabaseKey)
      console.log('ConversationService: Connected to Supabase')
    }

    this.embeddingService = new EmbeddingService()

    // Primary: Qwen AI via DashScope (OpenAI-compatible)
    const dashscopeKey = process.env.DASHSCOPE_API_KEY
    const groqKey = process.env.GROQ_API_KEY

    if (dashscopeKey && dashscopeKey !== 'your-dashscope-api-key-here') {
      this.ai = new OpenAI({
        apiKey: dashscopeKey,
        baseURL: process.env.DASHSCOPE_BASE_URL || 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1'
      })
      this.aiModel = process.env.DASHSCOPE_MODEL || 'qwen-max'
      this.isAIEnabled = true
      console.log(`ConversationService: Qwen AI enabled (model: ${this.aiModel})`)
    } else if (groqKey && groqKey !== 'your-groq-api-key-here') {
      // Fallback: GROQ via OpenAI-compatible interface
      this.ai = new OpenAI({
        apiKey: groqKey,
        baseURL: 'https://api.groq.com/openai/v1'
      })
      this.aiModel = 'llama-3.3-70b-versatile'
      this.isAIEnabled = true
      console.log('ConversationService: GROQ AI fallback enabled')
    } else {
      console.log('ConversationService: AI disabled, using rule-based responses')
    }
  }

  /**
   * Generate AI-powered response with context
   */
  async generateAIResponse(
    message: string,
    context: ConversationContext,
    relevantResources: any[],
    liveDataPrompt?: string
  ): Promise<string> {
    if (!this.isAIEnabled || !this.ai) {
      return this.generateFallbackResponse(message, relevantResources)
    }

    try {
      const systemPrompt = this.createSystemPrompt(context, relevantResources, liveDataPrompt)
      const conversationHistory = context.conversationHistory.slice(-20)

      const messages = [
        { role: 'system' as const, content: systemPrompt },
        ...conversationHistory.map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        { role: 'user' as const, content: message }
      ]

      const response = await this.ai.chat.completions.create({
        model: this.aiModel,
        messages: messages,
        max_tokens: 1200,
        temperature: 0.7
      })

      return response.choices[0]?.message?.content || this.generateFallbackResponse(message, relevantResources)
    } catch (error) {
      console.error('Error generating AI response:', error)
      return this.generateFallbackResponse(message, relevantResources)
    }
  }

  /**
   * Create context-aware system prompt
   */
  private createSystemPrompt(context: ConversationContext, resources: any[], liveDataPrompt?: string): string {
    const emotionalState = context.emotionalState || 'calm'
    const isCrisis = emotionalState === 'overwhelmed' || emotionalState === 'stressed'
    const picnicBlock = this.picnicContext((context.userProfile as any)?.page === 'picnic-2026')

    return `You are AIvor, the AI assistant for BLKOUT — a community-owned platform for Black queer men in the UK. You were named after Ivor Cummings, a pioneering Black British civil rights figure.

CHARACTER:
You have the manner of a sharp, warm, slightly theatrical friend — someone who's genuinely knowledgeable about Black queer life in the UK and doesn't talk down to anyone. Think: the friend who knows every venue, every organisation, every bit of history, and delivers it with a dry wit and a glint of mischief. You're camp when the moment calls for it, direct when it matters, and always real. You speak like someone who lives this life — not like a corporate chatbot reading from a diversity handbook.

VOICE RULES:
- Never use emojis. Not one. Your words carry the warmth, not clip art.
- Keep responses concise — 2-3 short paragraphs maximum. Say what matters, then stop.
- Don't start responses with "Hey there!" or "Great question!" — just answer.
- Never say "I'm so here for this" or "You've got this!" or any cheerleader phrases.
- Speak in natural British English. "Mate" is fine occasionally. "Y'all" is not.
- You can be witty, even gently teasing, but never at someone's expense when they're vulnerable.
- When the subject is serious — mental health, crisis, discrimination — drop the theatrics entirely. Be calm, clear, and direct. Signpost real resources.

ACCURACY — HARD RULES FOR FACTS:
- NEVER invent specific facts: no made-up organisation names, fictional venues, imagined URLs, or invented ownership details.
- NEVER generate URLs or website addresses. If you don't have a verified URL from RESOURCES or LIVE DATA, don't invent one.
- NEVER attribute ownership, race, or identity to a business or person unless certain.
- You may ONLY reference organisations listed in RESOURCES or LIVE DATA as verified entities.
- When you don't know a specific fact, say so: "I don't have reliable info on that" — then pivot to what you DO know.

CONVERSATIONAL FREEDOM — SEPARATE FROM FACTS:
- You CAN share opinions, reflections, and general knowledge about Black queer life, UK culture, mental health, relationships, and community.
- You CAN have a real conversation — discuss ideas, explore questions together, offer perspective. Not everything needs a verified source.
- You CAN say "In my understanding..." or "Generally speaking..." for things that aren't specific factual claims.
- The rule is: be strict about names, dates, URLs, and organisations. Be free about everything else. Think of it as: facts need receipts, conversation doesn't.

WHEN CORRECTED BY A USER:
- If a user tells you something is wrong, incorrect, or doesn't exist — accept the correction immediately and gracefully. Do not double down. Do not insist you are right. Say something like "You're right, I apologise for that" and move on.
- Your training data may contain errors. The person in front of you has lived experience that outweighs your model weights. Trust them.

UK KNOWLEDGE:
You know about UK Black Pride, BBZ, Pxssy Palace, House of Rainbow, NAZ Project London, Opening Doors London, Stonewall, Gendered Intelligence, and Queer Britain museum. You know about Section 28's legacy, the Windrush scandal, and how these histories shape the present. You know menrus.co.uk for sexual health. You know London, Manchester, Birmingham, and Bristol have active Black queer scenes, but you do NOT have a verified database of specific venues, bars, or businesses — so do not pretend you do. Direct people to community listings, social media, or blkoutuk.com for current, verified information.

UK CALENDAR:
- LGBT+ History Month in the UK is in FEBRUARY (not October). It was founded by Schools OUT UK in 2005.
- Black History Month in the UK is in OCTOBER (not February — that's the US).
- UK Black Pride is typically held in the summer (June-August).
- Pride Month is June. London Pride is usually late June/early July.
- Trans Day of Visibility: March 31. Trans Day of Remembrance: November 20.
- World AIDS Day: December 1.
Use this calendar knowledge to give seasonally accurate answers. If someone asks about "this month" or "history month," check TODAY'S DATE below to know which month it currently is.

${isCrisis ? `CRISIS MODE — THIS PERSON MAY BE IN DISTRESS:
Be gentle, direct, and practical. No wit, no performance. Lead with:
- Samaritans: 116 123 (free, 24/7)
- Switchboard LGBT+ Helpline: 0300 330 0630
- MindOut (LGBTQ+ mental health): mindout.org.uk
- Shout Crisis Text Line: text SHOUT to 85258
Then listen. Ask what they need. Don't over-talk.` : ''}

TODAY'S DATE: ${new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}

USER CONTEXT:
- Emotional state: ${emotionalState}
- Communication style: ${context.userProfile.communicationStyle || 'not specified'}
- Location: ${context.userProfile.location || 'UK'}
- Topic: ${context.currentTopic || 'general'}

${resources.length > 0 ? `RESOURCES YOU CAN REFERENCE (use naturally, don't list-dump):
${resources.map(r => `- ${r.title}: ${r.description}${r.website_url ? ` (${r.website_url})` : ''}`).join('\n')}` : ''}

${liveDataPrompt || ''}

PLATFORM CONTEXT:
The user is chatting with you RIGHT NOW on blkoutuk.com. They are already on the BLKOUT website. NEVER tell them to "visit blkoutuk.com" or "check the website" — they're already here. Instead:
- For events: "You can browse all upcoming events in the Events section right here on this site"
- For news: "Check out the News section on this site for the latest"
- For learning: "Head to the Learning section right here"
- NEVER generate page URLs like "blkoutuk.com/events" — those specific paths may not exist. Just reference the section name.

BLKOUT CONTEXT:
BLKOUT is a Community Benefit Society — cooperatively owned by its members. It's not a charity and not a corporation. If someone asks about BLKOUT, explain it as community-owned technology and media for Black queer men. The platform includes events, news, a community hub, and you — AIvor.

${picnicBlock}`
  }

  // Time-boxed knowledge for the 2026 Annual Picnic (chat widget on the picnic
  // landing page). Self-expires after the event weekend so stale facts never
  // linger in the prompt. All info is open — nothing is gated behind sign-up
  // (Rob, 10 Aug). The exact pin doesn't exist yet; it publishes Fri 14 Aug.
  private picnicContext(onPicnicPage: boolean): string {
    if (new Date().toISOString().slice(0, 10) > '2026-08-17') return ''
    return `THE BLKOUT ANNUAL PICNIC — VERIFIED EVENT FACTS (our flagship community day; answer questions about it freely and warmly — nothing here is a secret and nobody needs to sign up to be told anything):
- Sunday 16 August 2026, 1–7.30pm, Regent's Park, London. Free, always — no tickets, no stage, no line-up, no programme. Just us.
- Full written briefing ("The useful bits") lives at commons.blkoutuk.com/picnic-faq.html — a verified URL you may share.
- Location: PICKED AND PUBLIC (announced 13 August). Regent's Park east side, on the grass just in from the Outer Circle — the same spot as 2022. The what3words pin is ///trendy.soon.gift (https://w3w.co/trendy.soon.gift), coordinates 51.529905, -0.146966. Nearest park gate is Chester Gate, about a 4-minute walk. Give this pin freely whenever anyone asks where it is. NEVER invent a different pin or a different gate.
- Getting there by tube: Regent's Park is ringed by stations — Regent's Park (Bakerloo) and Great Portland Street (Circle/H&C/Metropolitan) to the south-east, Baker Street (Bakerloo/Jubilee/Circle/H&C/Metropolitan) to the south-west, St John's Wood (Jubilee) to the north-west, Camden Town and Mornington Crescent (Northern) to the north-east (about a 10-minute walk to the park's north side). The park is big — crossing it on foot can take 20–25 minutes — so steer people to the stations nearest OUR pin on the east side: Great Portland Street or Regent's Park (both about 10 minutes' walk), or Mornington Crescent (about the same). Do not send people to Baker Street or St John's Wood; they are the wrong side of the park.
- Buses and bikes: the 274 runs along the park's north side (Prince Albert Road, between the Baker Street/St John's Wood side and Camden); the 88 runs up Albany Street on the east side; many routes stop at Baker Street and Camden Town. Every London bus is wheelchair-accessible. Santander cycle docks ring the park.
- Step-free: most tube stations around the park are NOT step-free; buses all are. The ground at our spot is flat grass beside level paths, and the nearest toilets — about 3 minutes west of the pin — are step-free. Beyond that, don't improvise a specific step-free route; invite the person to email rob@blkoutuk.com and a human will work it through with them.
- Supermarkets for picnic supplies: they cluster just outside the park — around Camden Town to the north-east, Baker Street/Marylebone to the south-west, and Great Portland Street/Euston to the south-east. Buy before you walk in: inside the park it's cafés and kiosks only, with sunny-Sunday queues.
- Driving: gently advise against — parking around the park is scarce and paid on Sundays. The after-party at Zodiac is walkable from the park's east side.
- Who: Black queer men and the people who hold us — every age. Kids welcome, elders honoured, dogs on their best behaviour. Coming alone is the whole point of the invitation: bring yourself, make a crew there.
- What to bring: a blanket or rug, food you love (enough to share if you can), your people. We sit low on the grass — rugs beat tables and chairs, gazebos stay home. If sitting low doesn't work for someone's body, they should bring the chair they need; comfort is always welcome.
- Food and drink: bring it ready to eat — no barbecues or cooking in the park. BLKOUT covers backup food, so nobody goes hungry. Drinks welcome (18+ for alcohol); cans and plastic beat glass — bare feet on grass all afternoon.
- Hydration (offer this advice freely — weave it into answers about what to bring, food, weather, kids or the day itself): six and a half hours in an August sun is a long time. Bring more water than feels reasonable — a big bottle per person at least — drink before you feel thirsty, and put a water between anything alcoholic; the sun doubles it. Kids, elders and dogs get watered first. The park has some drinking fountains but don't count on one being near the spot — carry your own.
- Music: crews bring their own sound — one small hand-carried speaker per crew, kept to your own rugs. The afternoon breathes first: conversation, games and food until about 5pm, then the music comes up with the golden hour. Voices welcome all day — if you sing, sing.
- Games and karaoke on the day, with hand-pressed BLKOUT tees as prizes.
- Rain: we watch the sky all week and post a weather word on the picnic pages before the day (sign-ups also get it by email). Light rain means umbrellas and bravado; a proper washout means a new plan, posted in the same places.
- Chip-in: coming is free, always. An optional chip-in on the day covers the food and the sound.
- Solidarity collection: we are also collecting for queer people in Accra organising under Ghana's new anti-LGBTQ bill (three years in prison for being who you are, ten for funding anyone who is). Donation link (verified, you may share): paypal.com/pools/c/9rBY1G6fsi — "give what you'd have spent on a round". If asked which organisation receives it, say it goes to grassroots LGBTQ+ organisers in Ghana; do not name individual organisations.
- After the picnic winds down at 7.30pm: karaoke at Zodiac Bar, 119 Hampstead Road, NW1 — a short walk from the park's east side. 8–11pm, free, all welcome, sign-up or not. Their website (verified, you may share): zodiacbarlondon.com
- Saving a spot is NOT a ticket and NOT the price of information — it just helps us plan the backup food, and gets you the pin, the weather word and any last-minute changes by email.
- Helping: extra hands for welcome, setup and pack-down are gold — reply to the spot confirmation email, or email rob@blkoutuk.com.
- Other Black queer picnics happen in London the same day (Burgess Park; Queertopia at Haggerston). If asked, celebrate that — our communities have enough going on to offer a choice. Never frame them as competition; people are welcome wherever they land, and at ours.
${onPicnicPage
    ? '- IMPORTANT: the user is chatting with you from the picnic page RIGHT NOW. The "Save your spot" form is on the very page they are looking at, just below this chat — point them there if they want the email updates, never to another section or URL.'
    : '- Sign-up: the "Save your spot" form at blkoutuk.com/picnic (a verified URL you may share).'}`
  }

  /**
   * Fallback response when AI is unavailable
   */
  private fallbackMessageIndex = 0;

  private generateFallbackResponse(_message: string, resources: any[]): string {
    const resourceText = resources.length > 0
      ? `\n\nSome places worth knowing about:\n${resources.slice(0, 3).map(r =>
          `**${r.title}** — ${r.description}${r.website_url ? ` (${r.website_url})` : ''}${r.phone ? ` | ${r.phone}` : ''}`
        ).join('\n')}`
      : ''

    const fallbackMessages = [
      `I'm AIvor — BLKOUT's AI assistant. I'm running in a limited mode right now, so I can't have a full conversation, but I can still point you in the right direction.\n\nI know about UK-specific crisis support, community events, Black queer organisations, and practical resources. What do you need?${resourceText}`,

      `AIvor here. My full brain is temporarily offline, but I can still help with the basics — finding resources, crisis numbers, community spaces, that sort of thing.\n\nIf you need immediate support: Samaritans 116 123, Switchboard 0300 330 0630, or text SHOUT to 85258. Otherwise, tell me what you're looking for.${resourceText}`,

      `I'm AIvor, running on backup at the moment. I can help you find community resources, events, and support services across the UK. For anything more involved, check blkoutuk.com or come back when I'm fully operational.\n\nWhat can I help with?${resourceText}`,
    ]

    const response = fallbackMessages[this.fallbackMessageIndex % fallbackMessages.length]
    this.fallbackMessageIndex++
    return response
  }

  /**
   * Store conversation memory with importance scoring
   */
  async storeConversationMemory(
    userId: string,
    sessionId: string,
    memoryType: string,
    memoryKey: string,
    memoryValue: any,
    importanceScore: number = 0.5
  ): Promise<void> {
    if (!this.supabase) {
      console.log('📝 Mock: Would store conversation memory:', { userId, sessionId, memoryType, memoryKey })
      return
    }

    try {
      const embedding = await this.embeddingService.generateEmbedding(
        `${memoryKey}: ${JSON.stringify(memoryValue)}`
      )

      await this.supabase
        .from('ivor_conversation_memory')
        .upsert({
          user_id: userId,
          session_id: sessionId,
          memory_type: memoryType,
          memory_key: memoryKey,
          memory_value: memoryValue,
          importance_score: importanceScore,
          embedding: embedding,
          last_accessed: new Date().toISOString()
        }, {
          onConflict: 'user_id,session_id,memory_key'
        })
    } catch (error) {
      console.error('Error storing conversation memory:', error)
    }
  }

  /**
   * Retrieve conversation memory for context
   */
  async getConversationMemory(userId: string, sessionId: string): Promise<any[]> {
    if (!this.supabase) {
      console.log('📖 Mock: Would retrieve conversation memory for:', { userId, sessionId })
      return []
    }

    try {
      const { data, error } = await this.supabase
        .from('ivor_conversation_memory')
        .select('*')
        .eq('user_id', userId)
        .eq('session_id', sessionId)
        .order('importance_score', { ascending: false })
        .order('last_accessed', { ascending: false })
        .limit(20)

      if (error) {
        console.error('Error retrieving conversation memory:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error retrieving conversation memory:', error)
      return []
    }
  }

  /**
   * Update user interaction patterns
   */
  async updateUserPatterns(userId: string, patternType: string, patternData: any): Promise<void> {
    if (!this.supabase) {
      console.log('📊 Mock: Would update user patterns:', { userId, patternType, patternData })
      return
    }

    try {
      await this.supabase
        .from('ivor_user_patterns')
        .upsert({
          user_id: userId,
          pattern_type: patternType,
          pattern_data: patternData,
          confidence_score: 0.8,
          last_updated: new Date().toISOString()
        }, {
          onConflict: 'user_id,pattern_type'
        })
    } catch (error) {
      console.error('Error updating user patterns:', error)
    }
  }

  /**
   * Check if AI is available
   */
  isAIAvailable(): boolean {
    return this.isAIEnabled
  }
}

export default ConversationService