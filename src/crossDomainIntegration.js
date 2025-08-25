import { createDomainIntegration } from '../../../infrastructure/shared/domainIntegration.js'

/**
 * Cross-Domain Integration for IVOR-CORE
 * Enables enhanced responses by coordinating with other domains
 */
class CoreDomainIntegration {
  constructor() {
    this.integration = createDomainIntegration('ivor-core')
    this.initialized = false
  }

  async initialize() {
    try {
      this.initialized = await this.integration.initialize()
      
      if (this.initialized) {
        // Listen for relevant cross-domain events
        this.setupEventListeners()
        console.log('✅ Core domain integration initialized')
      }
      
      return this.initialized
    } catch (error) {
      console.error('❌ Core domain integration failed:', error)
      this.initialized = false
      return false
    }
  }

  setupEventListeners() {
    // Listen for achievements from other domains
    this.integration.onEvent('achievement.unlocked', (event) => {
      console.log(`🏆 Cross-domain achievement: ${event.data.achievement.title}`)
      // Could trigger notifications or update user profile
    })

    // Listen for community events that might affect wellness recommendations
    this.integration.onEvent('community.event.created', (event) => {
      console.log(`🏛️ New community event: ${event.data.title}`)
      // Could suggest community engagement for wellness
    })

    // Listen for organizing activities that might inspire users
    this.integration.onEvent('organizing.project.created', (event) => {
      console.log(`🏃‍♀️ New organizing project: ${event.data.title}`)
      // Could suggest purpose-driven activities for mental health
    })
  }

  /**
   * Enhanced chat response with cross-domain data
   */
  async generateEnhancedResponse(message, context, sessionId) {
    if (!this.initialized) {
      return null // Fall back to regular responses
    }

    try {
      // Use the orchestrated chat for cross-domain coordination
      const response = await this.integration.orchestratedChat(
        message, 
        context.userId || 'anonymous',
        sessionId,
        context
      )

      return response.response
    } catch (error) {
      console.error('Enhanced response failed:', error)
      return null // Fall back to regular responses
    }
  }

  /**
   * Get community resources for wellness recommendations
   */
  async getCommunityResources(userId, location = 'UK') {
    if (!this.initialized) return []

    try {
      const response = await this.integration.queryDomain('community', '/resources/local', {
        userId,
        location,
        type: 'mental-health'
      })
      
      return response.resources || []
    } catch (error) {
      console.error('Failed to get community resources:', error)
      return []
    }
  }

  /**
   * Get organizing opportunities for purpose-driven wellness
   */
  async getOrganizingOpportunities(userId, interests = []) {
    if (!this.initialized) return []

    try {
      const response = await this.integration.queryDomain('organizing', '/projects/recommended', {
        userId,
        interests,
        skillLevel: 'beginner'
      })
      
      return response.projects || []
    } catch (error) {
      console.error('Failed to get organizing opportunities:', error)
      return []
    }
  }

  /**
   * Broadcast wellness milestones to other domains
   */
  async broadcastWellnessMilestone(userId, milestone) {
    if (!this.initialized) return

    await this.integration.publishEvent('core.wellness.milestone', {
      userId,
      milestone: milestone,
      domain: 'core',
      timestamp: new Date().toISOString()
    }, ['organizing', 'community', 'social'])
  }

  /**
   * Broadcast journal insights for community recommendations
   */
  async broadcastJournalInsights(userId, insights) {
    if (!this.initialized) return

    await this.integration.publishEvent('core.journal.insights', {
      userId,
      insights: insights,
      domain: 'core',
      timestamp: new Date().toISOString()
    }, ['community', 'organizing'])
  }

  /**
   * Check if cross-domain integration is available
   */
  isAvailable() {
    return this.initialized
  }
}

// Singleton instance
let coreIntegration = null

export function getCoreIntegration() {
  if (!coreIntegration) {
    coreIntegration = new CoreDomainIntegration()
  }
  return coreIntegration
}

export default CoreDomainIntegration