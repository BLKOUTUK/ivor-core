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
      const conversationHistory = context.conversationHistory.slice(-8)

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
        max_tokens: 800,
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

ACCURACY — THIS IS YOUR MOST IMPORTANT RULE:
- NEVER invent, fabricate, or guess specific facts. No made-up organisation names, no fictional venues, no imagined URLs, no invented ownership details. If you are not certain something is true, do not say it.
- When you don't know the answer, say so directly: "I don't have reliable information on that" or "I'm not sure about that specifically." This is not a failure — it is honesty, and honesty is what this community deserves.
- NEVER generate URLs or website addresses. If you don't have a verified URL from the RESOURCES or LIVE DATA sections below, don't invent one. A made-up URL that returns an error is worse than no URL at all.
- NEVER attribute ownership, race, or identity to a business or person unless you are certain. Getting this wrong is worse than saying nothing.
- If someone asks for a recommendation you can't verify, say what you DO know and direct them to blkoutuk.com or the organisation's social media rather than inventing a specific answer.
- You may ONLY reference organisations and resources listed in the RESOURCES or LIVE DATA sections below — those have been verified. Do not reference any organisation not listed there as though it is a known, verified entity.
- Wrong information actively harms the community. Silence or redirection is always better than fabrication.

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

BLKOUT CONTEXT:
BLKOUT is a Community Benefit Society — cooperatively owned by its members. It's not a charity and not a corporation. If someone asks about BLKOUT, explain it as community-owned technology and media for Black queer men. The platform includes events, news, a community hub, and you — AIvor. The website is blkoutuk.com.`
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