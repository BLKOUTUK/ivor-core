import Groq from 'groq-sdk'
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
  emotionalState?: 'calm' | 'stressed' | 'excited' | 'overwhelmed' | 'joyful' | 'uncertain'
  lastInteraction?: Date
  sessionId: string
}

// Enhanced Conversation Service with AI and Memory
class ConversationService {
  private groq: Groq | null = null
  private supabase: any
  private embeddingService: EmbeddingService
  private isAIEnabled: boolean = false

  constructor(supabaseUrl: string, supabaseKey: string) {
    // Handle mock/development mode
    if (supabaseUrl === 'mock-url' || !supabaseUrl.startsWith('http')) {
      this.supabase = null
      console.log('⚠️ ConversationService: Running in mock mode - no Supabase connection')
    } else {
      this.supabase = createClient(supabaseUrl, supabaseKey)
      console.log('✅ ConversationService: Connected to Supabase')
    }

    this.embeddingService = new EmbeddingService()

    if (process.env.GROQ_API_KEY && process.env.GROQ_API_KEY !== 'your-groq-api-key-here') {
      this.groq = new Groq({
        apiKey: process.env.GROQ_API_KEY
      })
      this.isAIEnabled = true
      console.log('🤖 ConversationService: GROQ AI integration enabled')
    } else {
      console.log('⚠️ ConversationService: AI disabled, using rule-based responses')
    }
  }

  /**
   * Generate AI-powered response with context
   */
  async generateAIResponse(
    message: string,
    context: ConversationContext,
    relevantResources: any[]
  ): Promise<string> {
    if (!this.isAIEnabled || !this.groq) {
      return this.generateFallbackResponse(message, relevantResources)
    }

    try {
      const systemPrompt = this.createSystemPrompt(context, relevantResources)
      const conversationHistory = context.conversationHistory.slice(-8) // Last 8 messages

      const messages = [
        { role: 'system' as const, content: systemPrompt },
        ...conversationHistory.map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        { role: 'user' as const, content: message }
      ]

      const response = await this.groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',  // GROQ's latest model
        messages: messages,
        max_tokens: 800,
        temperature: 0.7
      })

      return response.choices[0]?.message?.content || this.generateFallbackResponse(message, relevantResources)
    } catch (error) {
      console.error('Error generating GROQ AI response:', error)
      return this.generateFallbackResponse(message, relevantResources)
    }
  }

  /**
   * Create context-aware system prompt
   */
  private createSystemPrompt(context: ConversationContext, resources: any[]): string {
    return `You are IVOR (Intelligent Virtual Organizing Resource), a joyful, culturally competent AI assistant specifically designed to support Black queer liberation and community empowerment. You're part of the BLKOUT family! ✨

CORE VALUES & APPROACH:
- Center Black queer JOY, resilience, and liberation with infectious enthusiasm! 🎉
- Provide culturally competent, intersectional support with genuine warmth
- Be celebratory, affirming, and understanding of unique challenges while highlighting strength
- Focus on practical resources AND community connections with excitement
- Acknowledge systemic barriers while EMPOWERING individual action with hope and energy
- Use inclusive, enthusiastic language that respects all identities and expressions

YOUR PERSONALITY:
- You're the supportive friend who genuinely believes in everyone's potential! 🌟
- You bring JOY and optimism to every interaction - coaching should feel inspiring, not heavy
- You celebrate small wins with genuine enthusiasm ("That's amazing progress!")
- You're encouraging, playful, and authentically excited about supporting growth
- You use emojis naturally and speak with warmth and energy
- You make wellness and personal development feel achievable and FUN
- You're the hype friend who sees beauty and potential in everyone

USER CONTEXT:
- Current emotional state: ${context.emotionalState || 'ready to thrive'} 
- Communication style: ${context.userProfile.communicationStyle || 'adaptive'}
- Location: ${context.userProfile.location || 'UK'}
- Current topic: ${context.currentTopic || 'general support'}

AVAILABLE RESOURCES TO SHARE WITH EXCITEMENT:
${resources.map(r => `• ${r.title}: ${r.description} (${r.website_url || 'Contact available'})`).join('\n')}

JOYFUL RESPONSE GUIDELINES:
1. Be warm, encouraging, and genuinely excited to help (2-3 paragraphs max)
2. Include relevant community resources with enthusiasm when appropriate
3. Use celebratory, affirming language that validates experiences with joy
4. Provide practical next steps while making them feel achievable and exciting
5. Reference BLKOUT community connections with pride and excitement
6. Celebrate the person's courage in reaching out and their inherent worth
7. End with an encouraging question that invites continued connection
8. Use encouraging phrases like "You've got this!", "I'm so here for this!", "That's powerful!"

COACHING ENERGY:
- Make personal growth feel like a celebration, not a chore
- Be the cheerleader who sees potential and authenticity
- Balance practical advice with emotional support and genuine encouragement  
- Help people see their own strength while providing concrete next steps
- Infuse hope, possibility, and joy into every interaction

Remember: You're not just providing information - you're building community, supporting liberation, AND bringing JOY to the journey. Make people feel seen, celebrated, and excited about their potential! 🌟💜`
  }

  /**
   * Fallback response when AI is unavailable
   */
  private generateFallbackResponse(message: string, resources: any[]): string {
    const resourceText = resources.length > 0 
      ? `\n\n✨ **Here are some amazing resources I found for you:**\n${resources.slice(0, 3).map(r => 
          `🌟 **${r.title}**: ${r.description}\n  ${r.website_url ? `🌐 ${r.website_url}` : ''}${r.phone ? ` | 📞 ${r.phone}` : ''}`
        ).join('\n')}`
      : ''

    return `Hey there! 🎉 I'm IVOR, and I'm absolutely here to support you with resources and guidance for Black queer liberation and wellbeing. You've come to the right place! ${resourceText}

💜 **What specific support are you looking for today?** I'm excited to help connect you with:
🧠 Mental health resources | 🏠 Housing support | 🌈 Community events | ⚖️ Legal guidance | 🚀 Career development | 💕 Relationship support

**You've got this, and we've got you!** What feels most important to explore right now?`
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