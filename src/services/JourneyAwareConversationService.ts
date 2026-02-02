import { JourneyStageDetector } from './JourneyStageDetector.js'
import { UKKnowledgeBase } from './UKKnowledgeBase.js'
import { ContextualResponseGenerator } from './ContextualResponseGenerator.js'
import { TrustScoreService } from './TrustScoreService.js'
import ConversationService from '../conversationService.js'
import { DataContextService } from './DataContextService.js'
import { JourneyContext, JourneyResponse, JourneyStage } from '../types/journey.js'
import { randomUUID } from 'crypto'

/**
 * Journey-Aware Conversation Service
 * Orchestrates the complete journey-aware experience integrating all components
 */
export class JourneyAwareConversationService {
  private journeyDetector: JourneyStageDetector
  private knowledgeBase: UKKnowledgeBase
  private responseGenerator: ContextualResponseGenerator
  private trustScoreService: TrustScoreService
  private conversationService: ConversationService
  private dataContextService: DataContextService | null
  private userJourneyHistory: Map<string, JourneyStage[]>

  constructor(conversationService: ConversationService, dataContextService?: DataContextService) {
    this.journeyDetector = new JourneyStageDetector()
    this.knowledgeBase = new UKKnowledgeBase()
    this.responseGenerator = new ContextualResponseGenerator()
    this.trustScoreService = new TrustScoreService()
    this.conversationService = conversationService
    this.dataContextService = dataContextService || null
    this.userJourneyHistory = new Map()
  }

  /**
   * Generate journey-aware response with full context analysis
   */
  async generateJourneyAwareResponse(
    message: string,
    userContext: any = {},
    sessionId: string = 'default'
  ): Promise<JourneyResponse> {
    try {
      // Get user's journey history
      const userId = userContext.userId || 'anonymous'
      const previousStages = this.userJourneyHistory.get(userId) || []

      // Detect current journey stage and context
      const journeyContext = this.journeyDetector.detectJourneyStage(
        message,
        previousStages,
        userContext
      )

      // Update user journey history
      this.updateJourneyHistory(userId, journeyContext.stage)

      // Extract topic for better resource matching
      const topic = this.extractTopicFromMessage(message)

      // Get relevant UK resources for this topic/stage
      const location = userContext.location || 'unknown'
      const relevantResources = this.knowledgeBase.getResourcesByStageAndLocation(
        journeyContext.stage,
        location,
        journeyContext.emotionalState === 'overwhelmed' ? 'emergency' : undefined,
        topic
      )

      // Fetch live BLKOUT data for the prompt (non-blocking on failure)
      let liveDataPrompt = ''
      if (this.dataContextService) {
        try {
          const liveContext = await this.dataContextService.getContext(message, topic, location)
          liveDataPrompt = DataContextService.formatForPrompt(liveContext)
        } catch (error) {
          console.warn('[JourneyAware] Live data fetch failed, continuing without:', error)
        }
      }

      // Generate AI response if available, otherwise use pattern-matching
      let responseText: string
      if (this.conversationService.isAIAvailable()) {
        // Build conversation context for AI
        const conversationContext = {
          userId,
          conversationHistory: userContext.conversationHistory || [],
          userProfile: userContext,
          emotionalState: journeyContext.emotionalState,
          sessionId,
          currentTopic: topic,
          lastInteraction: new Date()
        }

        // Use GROQ AI with journey context + live data
        responseText = await this.conversationService.generateAIResponse(
          message,
          conversationContext,
          relevantResources,
          liveDataPrompt
        )
      } else {
        // Fallback to pattern-matching
        const baseResponse = this.responseGenerator.generateResponse(
          message,
          journeyContext,
          topic
        )
        responseText = baseResponse.response
      }

      // Build journey response with trust scores
      const baseResponse = {
        response: responseText,
        journeyContext,
        resources: relevantResources.slice(0, 5),
        knowledge: [],
        nextStageGuidance: '',
        followUpRequired: false,
        resourcesProvided: relevantResources.map(r => r.title)
      }

      const trustScores = await this.calculateTrustScores(baseResponse)
      const response = await this.enhanceResponseWithTrust(baseResponse, trustScores)

      // Store conversation context if AI is available
      if (this.conversationService.isAIAvailable()) {
        await this.storeJourneyContext(userId, sessionId, journeyContext, response)
      }

      // Log journey progression for community analytics (privacy-preserving)
      this.logJourneyProgression(journeyContext, response)

      return response

    } catch (error) {
      console.error('Error generating journey-aware response:', error)

      // Be honest about system limitations rather than providing generic responses
      console.log('🚨 System fallback triggered due to error - providing honest limitation response')
      return this.generateFallbackResponse(message, userContext)
    }
  }

  /**
   * Get user's journey progression over time
   */
  getUserJourneyProgression(userId: string): JourneyStage[] {
    return this.userJourneyHistory.get(userId) || []
  }

  /**
   * Check if user might be ready for next journey stage
   */
  assessNextStageReadiness(userId: string, currentContext: JourneyContext): boolean {
    const history = this.getUserJourneyProgression(userId)
    
    // Stability indicators
    if (currentContext.stage === 'crisis' && history.filter(s => s === 'crisis').length < 3) {
      return false // Need more crisis support first
    }

    if (currentContext.stage === 'stabilization' && history.includes('growth')) {
      return true // Has experienced growth before
    }

    // Community connection indicators
    if (currentContext.communityConnection === 'organizing') {
      return currentContext.stage !== 'advocacy' // Ready for advocacy if not already there
    }

    return true // Default to ready
  }

  /**
   * Get emergency response for crisis situations
   */
  async getEmergencyResponse(
    message: string,
    userContext: any = {},
    sessionId: string = 'default'
  ): Promise<JourneyResponse> {
    // Force crisis stage detection
    const crisisContext: JourneyContext = {
      stage: 'crisis',
      emotionalState: 'crisis',
      urgencyLevel: 'emergency',
      location: userContext.location || 'unknown',
      communityConnection: 'isolated',
      firstTime: true,
      returningUser: false,
      resourceAccessPreference: 'phone'
    }

    const baseResponse = this.responseGenerator.generateResponse(message, crisisContext, 'crisis')
    
    // Calculate trust scores for emergency response
    const trustScores = await this.calculateTrustScores(baseResponse)
    const response = await this.enhanceResponseWithTrust(baseResponse, trustScores)
    
    return response
  }

  /**
   * Update user journey history
   */
  private updateJourneyHistory(userId: string, currentStage: JourneyStage): void {
    if (!this.userJourneyHistory.has(userId)) {
      this.userJourneyHistory.set(userId, [])
    }

    const history = this.userJourneyHistory.get(userId)!
    
    // Only add if it's a different stage or been a while since last entry
    const lastStage = history[history.length - 1]
    if (lastStage !== currentStage) {
      history.push(currentStage)
      
      // Keep last 20 journey stages to prevent memory bloat
      if (history.length > 20) {
        history.shift()
      }
    }
  }

  /**
   * Store journey context for AI conversation service
   */
  private async storeJourneyContext(
    userId: string,
    sessionId: string,
    journeyContext: JourneyContext,
    response: JourneyResponse
  ): Promise<void> {
    try {
      // Store journey stage progression
      await this.conversationService.storeConversationMemory(
        userId,
        sessionId,
        'journey_stage',
        `stage_${Date.now()}`,
        {
          stage: journeyContext.stage,
          emotionalState: journeyContext.emotionalState,
          urgencyLevel: journeyContext.urgencyLevel,
          location: journeyContext.location,
          communityConnection: journeyContext.communityConnection
        },
        0.8 // High importance for journey tracking
      )

      // Store resource effectiveness tracking
      if (response.resources.length > 0) {
        await this.conversationService.storeConversationMemory(
          userId,
          sessionId,
          'resources_provided',
          `resources_${Date.now()}`,
          {
            resources: response.resources.map(r => ({
              id: r.id,
              title: r.title,
              category: r.category,
              stage: journeyContext.stage
            }))
          },
          0.6
        )
      }

    } catch (error) {
      console.error('Error storing journey context:', error)
    }
  }

  /**
   * Extract topic from message for better resource matching
   */
  private extractTopicFromMessage(message: string): string {
    const lowerMessage = message.toLowerCase()
    
    // Health-related topics
    const healthKeywords = ['hiv', 'prep', 'pep', 'sexual health', 'sti', 'testing', 'treatment', 'diagnosis']
    if (healthKeywords.some(keyword => lowerMessage.includes(keyword))) {
      return 'sexual health'
    }

    // Mental health topics
    const mentalHealthKeywords = ['therapy', 'counselling', 'depression', 'anxiety', 'mental health', 'suicidal']
    if (mentalHealthKeywords.some(keyword => lowerMessage.includes(keyword))) {
      return 'mental health'
    }

    // Housing topics
    const housingKeywords = ['evicted', 'housing', 'homeless', 'rent', 'landlord', 'accommodation']
    if (housingKeywords.some(keyword => lowerMessage.includes(keyword))) {
      return 'housing'
    }

    // Legal topics
    const legalKeywords = ['discrimination', 'rights', 'legal', 'employment', 'tribunal', 'harassment']
    if (legalKeywords.some(keyword => lowerMessage.includes(keyword))) {
      return 'legal'
    }

    // Community topics
    const communityKeywords = ['community', 'group', 'events', 'pride', 'support group', 'peers']
    if (communityKeywords.some(keyword => lowerMessage.includes(keyword))) {
      return 'community'
    }

    return 'general'
  }

  /**
   * Log journey progression for community analytics (privacy-preserving)
   */
  private logJourneyProgression(journeyContext: JourneyContext, response: JourneyResponse): void {
    // Only log aggregated, anonymous data for community insights
    const anonymizedData = {
      stage: journeyContext.stage,
      location_region: this.anonymizeLocation(journeyContext.location),
      resources_provided: response.resources.length,
      knowledge_provided: response.knowledge.length,
      follow_up_needed: response.followUpRequired,
      timestamp: new Date().toISOString()
    }

    console.log('Journey Analytics (Anonymous):', anonymizedData)
  }

  /**
   * Anonymize location for privacy-preserving analytics
   */
  private anonymizeLocation(location: string): string {
    // Convert specific locations to regions for privacy
    const cityToRegion: { [key: string]: string } = {
      'london': 'london',
      'manchester': 'north_england', 
      'birmingham': 'midlands',
      'leeds': 'north_england',
      'glasgow': 'scotland',
      'cardiff': 'wales',
      'belfast': 'northern_ireland',
      'bristol': 'south_west',
      'liverpool': 'north_west',
      'sheffield': 'north_england',
      'nottingham': 'midlands',
      'brighton': 'south_east',
      'other_urban': 'urban',
      'rural': 'rural',
      'unknown': 'unknown'
    }

    return cityToRegion[location] || 'unknown'
  }

  /**
   * Generate honest fallback response when journey system fails
   * Note: Uses 'response' key to match the runtime contract expected by server.ts,
   * even though JourneyResponse type uses 'message'. This should be unified in types.
   */
  private generateFallbackResponse(message: string, userContext: any): any {
    return {
      response: `I'll be straight with you — I'm having technical difficulties and can't give you the personalised response I should.

**If this is urgent:**
- Emergency: 999 or nearest A&E
- Samaritans: 116 123 (free, 24/7)
- Switchboard LGBT+: 0300 330 0630
- Text SHOUT to 85258

Rather than give you something generic, here are reliable places to start:
- **NHS.uk** for verified health information
- **menrus.co.uk** for Black gay men's sexual health
- **BLKOUT**: blkoutuk.com for community resources

I'd rather point you somewhere useful than pretend I can help when my systems aren't working properly.`,
      journeyContext: {
        stage: 'growth',
        emotionalState: 'uncertain',
        urgencyLevel: 'low',
        location: 'unknown',
        communityConnection: 'exploring',
        firstTime: false,
        returningUser: true,
        resourceAccessPreference: 'flexible'
      },
      nextStageGuidance: 'Please seek direct support from the resources above while I work to resolve technical issues.',
      resources: [],
      knowledge: [],
      followUpRequired: true,
      resourcesProvided: [],
      trustScore: 0.0,
      trustLevel: 'very_low',
      trustDescription: 'System experiencing technical difficulties - seek direct support',
      sourceVerification: { verified: 0, unverified: 0, total: 0 },
      requestFeedback: false,
      responseId: randomUUID()
    }
  }

  /**
   * Calculate trust scores for knowledge and resources in response
   */
  private async calculateTrustScores(response: JourneyResponse): Promise<{
    knowledgeScores: Map<string, number>
    resourceScores: Map<string, number>
    overallTrustScore: number
    sourceVerification: { verified: number; unverified: number; total: number }
  }> {
    const knowledgeScores = new Map<string, number>()
    const resourceScores = new Map<string, number>()
    let totalScore = 0
    let itemCount = 0
    let verifiedSources = 0
    let totalSources = 0

    // Calculate trust scores for knowledge entries
    for (const knowledge of response.knowledge) {
      const score = await this.trustScoreService.calculateKnowledgeTrustScore(knowledge)
      knowledgeScores.set(knowledge.id, score)
      totalScore += score
      itemCount++

      // Count verified sources
      for (const source of knowledge.sources) {
        totalSources++
        const isVerified = source.toLowerCase().includes('nhs.uk') || 
                          source.toLowerCase().includes('gov.uk') ||
                          source.toLowerCase().includes('menrus.co.uk')
        if (isVerified) verifiedSources++
      }
    }

    // Calculate trust scores for resources
    for (const resource of response.resources) {
      const score = await this.trustScoreService.calculateResourceTrustScore(resource)
      resourceScores.set(resource.id, score)
      totalScore += score
      itemCount++
    }

    const overallTrustScore = itemCount > 0 ? totalScore / itemCount : 0.5

    return {
      knowledgeScores,
      resourceScores,
      overallTrustScore,
      sourceVerification: {
        verified: verifiedSources,
        unverified: totalSources - verifiedSources,
        total: totalSources
      }
    }
  }

  /**
   * Enhance response with trust scoring information
   */
  private async enhanceResponseWithTrust(
    baseResponse: JourneyResponse, 
    trustScores: {
      knowledgeScores: Map<string, number>
      resourceScores: Map<string, number>
      overallTrustScore: number
      sourceVerification: { verified: number; unverified: number; total: number }
    }
  ): Promise<JourneyResponse> {
    const trustInterpretation = this.trustScoreService.getTrustScoreInterpretation(trustScores.overallTrustScore)
    
    return {
      ...baseResponse,
      trustScore: trustScores.overallTrustScore,
      trustLevel: trustInterpretation.level,
      trustDescription: trustInterpretation.description,
      sourceVerification: trustScores.sourceVerification,
      requestFeedback: true, // Always request feedback for learning
      responseId: randomUUID()
    }
  }

  /**
   * Store user feedback for improving trust scores
   */
  async storeFeedback(
    responseId: string,
    userId: string,
    rating: number,
    feedback?: string,
    helpful?: boolean
  ): Promise<void> {
    try {
      // In a real implementation, this would store to database
      console.log('Feedback received:', {
        responseId,
        userId: this.anonymizeUserId(userId),
        rating,
        feedback,
        helpful,
        timestamp: new Date().toISOString()
      })
      
      // TODO: Implement database storage
      // TODO: Update trust scores based on feedback
      // TODO: Trigger retraining of pattern weights
    } catch (error) {
      console.error('Error storing feedback:', error)
    }
  }

  /**
   * Anonymize user ID for privacy
   */
  private anonymizeUserId(userId: string): string {
    // Simple hash for demo - use proper hashing in production
    return Buffer.from(userId).toString('base64').substring(0, 8)
  }

  /**
   * Get system health for monitoring
   */
  getSystemHealth(): any {
    const trustSystemHealth = this.trustScoreService.getSystemHealth()
    
    return {
      journeyDetector: 'operational',
      knowledgeBase: 'operational',
      responseGenerator: 'operational',
      trustScoreService: 'operational',
      conversationService: this.conversationService.isAIAvailable() ? 'operational' : 'fallback_mode',
      userJourneyHistory: this.userJourneyHistory.size,
      trustScoring: {
        cacheSize: trustSystemHealth.cacheSize,
        lastValidation: trustSystemHealth.lastValidationRun
      },
      timestamp: new Date().toISOString()
    }
  }
}

export default JourneyAwareConversationService