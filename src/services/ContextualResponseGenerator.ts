import { JourneyContext, JourneyResponse, UKResource, KnowledgeEntry, JourneyStage, UrgencyLevel } from '../types/journey.js'
import UKKnowledgeBase from './UKKnowledgeBase.js'

/**
 * Contextual Response Generator
 * Creates culturally affirming, stage-appropriate responses with specific information
 */
export class ContextualResponseGenerator {
  private knowledgeBase: UKKnowledgeBase

  constructor() {
    this.knowledgeBase = new UKKnowledgeBase()
  }

  /**
   * Generate journey-aware response with specific resources and information
   * Note: Returns object with 'response' key to match runtime contract expected by JourneyAwareConversationService,
   * even though JourneyResponse type uses 'message'. This should be unified in types.
   */
  generateResponse(
    userInput: string,
    journeyContext: JourneyContext,
    topic?: string
  ): any {
    // Get relevant resources and knowledge
    const resources = this.getRelevantResources(journeyContext, topic)
    const knowledge = this.getRelevantKnowledge(userInput, journeyContext, topic)

    // Generate stage-appropriate message
    const responseText = this.generateContextualMessage(userInput, journeyContext, resources, knowledge)

    // Generate next stage pathway guidance
    const nextStageGuidance = this.generateNextStageGuidance(journeyContext)

    return {
      response: responseText,
      journeyContext: journeyContext,
      nextStageGuidance,
      resources: resources.slice(0, 5), // Limit to top 5 most relevant
      knowledge: knowledge.slice(0, 3), // Limit to top 3 most relevant
      followUpRequired: this.requiresFollowUp(journeyContext),
      resourcesProvided: resources.slice(0, 5).map(r => r.title),
      // Default trust scoring values - will be overridden by JourneyAwareConversationService
      trustScore: 0.5,
      trustLevel: 'medium',
      trustDescription: 'Trust score pending calculation',
      sourceVerification: { verified: 0, unverified: 0, total: 0 },
      requestFeedback: true,
      responseId: 'pending'
    }
  }

  /**
   * Get relevant resources based on journey context
   */
  private getRelevantResources(journeyContext: JourneyContext, topic?: string): UKResource[] {
    const { stage, location, urgencyLevel } = journeyContext

    // Emergency resources for crisis situations
    if (urgencyLevel === 'emergency') {
      return this.knowledgeBase.getEmergencyResources(location)
    }

    // Get stage and location appropriate resources
    const resources = this.knowledgeBase.getResourcesByStageAndLocation(
      stage,
      location,
      urgencyLevel,
      topic
    )

    // Add culturally specific resources
    const culturalResources = this.knowledgeBase.getCulturallySpecificResources(stage, location)
    
    // Combine and deduplicate
    const combined = [...resources, ...culturalResources]
    const unique = combined.filter((resource, index, array) => 
      array.findIndex(r => r.id === resource.id) === index
    )

    return unique
  }

  /**
   * Get relevant knowledge entries
   */
  private getRelevantKnowledge(
    userInput: string, 
    journeyContext: JourneyContext, 
    topic?: string
  ): KnowledgeEntry[] {
    const { stage, location } = journeyContext
    
    // Check for health-related queries
    const healthKeywords = ['hiv', 'prep', 'pep', 'sexual health', 'sti', 'testing']
    const isHealthQuery = healthKeywords.some(keyword => 
      userInput.toLowerCase().includes(keyword)
    )

    if (isHealthQuery) {
      const healthKnowledge = this.knowledgeBase.getMenrusHealthInfo(userInput, stage)
      if (healthKnowledge.length > 0) {
        return healthKnowledge
      }
    }

    // General knowledge lookup
    const searchTerm = topic || this.extractTopicFromInput(userInput)
    return this.knowledgeBase.getKnowledgeByTopic(searchTerm, stage, location)
  }

  /**
   * Generate contextual message based on journey stage and resources
   */
  private generateContextualMessage(
    userInput: string,
    journeyContext: JourneyContext,
    resources: UKResource[],
    knowledge: KnowledgeEntry[]
  ): string {
    const { stage, emotionalState, urgencyLevel, communityConnection } = journeyContext

    // Emergency crisis response
    if (urgencyLevel === 'emergency' || stage === 'crisis') {
      return this.generateCrisisResponse(userInput, journeyContext, resources, knowledge)
    }

    // Stage-specific responses
    switch (stage) {
      case 'stabilization':
        return this.generateStabilizationResponse(userInput, journeyContext, resources, knowledge)
      case 'growth':
        return this.generateGrowthResponse(userInput, journeyContext, resources, knowledge)
      case 'community_healing':
        return this.generateCommunityHealingResponse(userInput, journeyContext, resources, knowledge)
      case 'advocacy':
        return this.generateAdvocacyResponse(userInput, journeyContext, resources, knowledge)
      default:
        return this.generateDefaultResponse(userInput, journeyContext, resources, knowledge)
    }
  }

  /**
   * Generate crisis-focused response with immediate safety resources
   */
  private generateCrisisResponse(
    userInput: string,
    journeyContext: JourneyContext,
    resources: UKResource[],
    knowledge: KnowledgeEntry[]
  ): string {
    let response = `💜 **I hear you, and I want you to know that you're not alone.** Your safety and wellbeing matter deeply.\n\n`

    // Immediate safety resources
    const emergencyResources = resources.filter(r => r.emergency)
    if (emergencyResources.length > 0) {
      response += `🚨 **Immediate Support Available:**\n`
      emergencyResources.slice(0, 3).forEach(resource => {
        response += `• **${resource.title}**: ${resource.phone ? `📞 ${resource.phone}` : '🌐 ' + resource.website}\n`
        response += `  ${resource.description}\n`
      })
      response += `\n`
    }

    // Specific crisis information
    if (knowledge.length > 0) {
      const crisisKnowledge = knowledge[0]
      response += `📋 **Specific Information:**\n${crisisKnowledge.content.substring(0, 200)}...\n\n`
    }

    // Affirming message
    response += `**You are valued in this community.** Crisis doesn't define you, and there are people who understand what you're going through.\n\n`

    // Next steps
    response += `🌱 **When you're ready**, stabilization support will help you build ongoing safety and support systems. You don't have to figure this out alone.`

    return response
  }

  /**
   * Generate stabilization-focused response with ongoing support resources
   */
  private generateStabilizationResponse(
    userInput: string,
    journeyContext: JourneyContext,
    resources: UKResource[],
    knowledge: KnowledgeEntry[]
  ): string {
    let response = `🌟 **You're taking important steps toward stability - that shows real strength.**\n\n`

    // Ongoing support resources
    if (resources.length > 0) {
      response += `🤝 **Ongoing Support Available:**\n`
      resources.slice(0, 3).forEach(resource => {
        response += `• **${resource.title}**\n`
        response += `  ${resource.description}\n`
        if (resource.phone) response += `  📞 ${resource.phone}\n`
        if (resource.website) response += `  🌐 ${resource.website}\n`
        if (resource.cost === 'nhs_funded' || resource.cost === 'free') {
          response += `  ✅ ${resource.cost === 'nhs_funded' ? 'NHS funded' : 'Free service'}\n`
        }
        response += `\n`
      })
    }

    // Specific stabilization information
    if (knowledge.length > 0) {
      const stabilizationInfo = knowledge[0]
      response += `📚 **Key Information:**\n${stabilizationInfo.content.substring(0, 300)}...\n\n`
    }

    // Progress acknowledgment
    response += `💪 **Building stability takes courage**, and you're already showing that. Regular support, whether through therapy, peer groups, or community connections, can make a real difference.\n\n`

    // Next stage guidance
    response += `🚀 **Looking ahead**: As stability grows, you might find yourself interested in personal growth opportunities - skill building, education, or exploring new interests. There's no rush; you're exactly where you need to be.`

    return response
  }

  /**
   * Generate growth-focused response with development opportunities
   */
  private generateGrowthResponse(
    userInput: string,
    journeyContext: JourneyContext,
    resources: UKResource[],
    knowledge: KnowledgeEntry[]
  ): string {
    let response = `✨ **Love seeing you focused on growth and development! This is where things get exciting.**\n\n`

    // Growth resources
    if (resources.length > 0) {
      response += `🎯 **Growth Opportunities:**\n`
      resources.slice(0, 3).forEach(resource => {
        response += `• **${resource.title}**\n`
        response += `  ${resource.description}\n`
        if (resource.specializations.length > 0) {
          response += `  🔧 Specializes in: ${resource.specializations.join(', ')}\n`
        }
        if (resource.website) response += `  🌐 ${resource.website}\n`
        response += `\n`
      })
    }

    // Specific growth information
    if (knowledge.length > 0) {
      const growthInfo = knowledge[0]
      response += `📈 **Here's what you need to know:**\n${growthInfo.content.substring(0, 350)}...\n\n`
    }

    // Encouragement for growth mindset
    response += `🌟 **Your growth journey is powerful** - you're building skills, knowledge, and confidence that serve both you and your community.\n\n`

    // Community connection hint
    response += `💫 **Something beautiful happens** when personal growth connects with community healing. Keep growing - your authentic self and unique gifts are needed in this world.`

    return response
  }

  /**
   * Generate community healing-focused response
   */
  private generateCommunityHealingResponse(
    userInput: string,
    journeyContext: JourneyContext,
    resources: UKResource[],
    knowledge: KnowledgeEntry[]
  ): string {
    let response = `🫂 **Beautiful - community healing is where the real magic happens. You're ready to heal together.**\n\n`

    // Community resources
    if (resources.length > 0) {
      response += `🌈 **Community Healing Spaces:**\n`
      resources.slice(0, 3).forEach(resource => {
        response += `• **${resource.title}**\n`
        response += `  ${resource.description}\n`
        if (resource.culturalCompetency.blackSpecific || resource.culturalCompetency.lgbtqSpecific) {
          response += `  ✊🏿 Culturally specific support\n`
        }
        if (resource.website) response += `  🌐 ${resource.website}\n`
        response += `\n`
      })
    }

    // Community healing information
    if (knowledge.length > 0) {
      const healingInfo = knowledge[0]
      response += `🌱 **Community Wisdom:**\n${healingInfo.content.substring(0, 300)}...\n\n`
    }

    // Community healing affirmation
    response += `💜 **Healing in community is different** - it's where your individual journey connects with collective liberation. You're not just healing yourself; you're contributing to healing for all of us.\n\n`

    // Advocacy connection
    response += `🔥 **When you're ready**, community healing often naturally flows into advocacy and organizing - using your healing journey to support systemic change. The world needs your voice and experience.`

    return response
  }

  /**
   * Generate advocacy-focused response with organizing resources
   */
  private generateAdvocacyResponse(
    userInput: string,
    journeyContext: JourneyContext,
    resources: UKResource[],
    knowledge: KnowledgeEntry[]
  ): string {
    let response = `🔥 **YES! Ready to turn your power into action for the community. This is liberation work.**\n\n`

    // Advocacy resources
    if (resources.length > 0) {
      response += `✊🏿 **Organizing & Advocacy:**\n`
      resources.slice(0, 3).forEach(resource => {
        response += `• **${resource.title}**\n`
        response += `  ${resource.description}\n`
        if (resource.specializations.includes('organizing') || resource.specializations.includes('advocacy')) {
          response += `  📢 Organizing focused\n`
        }
        if (resource.website) response += `  🌐 ${resource.website}\n`
        response += `\n`
      })
    }

    // Advocacy information
    if (knowledge.length > 0) {
      const advocacyInfo = knowledge[0]
      response += `⚖️ **Know Your Power:**\n${advocacyInfo.content.substring(0, 350)}...\n\n`
    }

    // Advocacy empowerment
    response += `🌟 **Your advocacy is rooted in your journey** - the challenges you've faced, the healing you've done, the community connections you've built. That's what makes your voice so powerful.\n\n`

    // Systems change focus
    response += `🏛️ **Systems change happens** when people like you decide their liberation is worth fighting for. Whether it's policy change, community organizing, or cultural transformation - you're part of the movement.`

    return response
  }

  /**
   * Generate default response for unclear contexts
   */
  private generateDefaultResponse(
    userInput: string,
    journeyContext: JourneyContext,
    resources: UKResource[],
    knowledge: KnowledgeEntry[]
  ): string {
    let response = `💜 **I'm here to support you on your liberation journey!**\n\n`

    if (resources.length > 0) {
      response += `🌟 **Here are some resources that might help:**\n`
      resources.slice(0, 3).forEach(resource => {
        response += `• **${resource.title}**: ${resource.description}\n`
        if (resource.phone) response += `  📞 ${resource.phone}\n`
        if (resource.website) response += `  🌐 ${resource.website}\n`
      })
      response += `\n`
    }

    response += `✨ **Whatever you're exploring**, remember that your journey toward liberation and authenticity matters. You deserve support, community, and resources that affirm who you are.\n\n`
    response += `🤝 **What specific support are you looking for today?** I'm here to help with mental health resources, HIV/sexual health information, housing support, legal guidance, community connections, or anything else on your mind.`

    return response
  }

  /**
   * Generate next stage guidance
   */
  private generateNextStageGuidance(journeyContext: JourneyContext): string {
    const { stage } = journeyContext

    switch (stage) {
      case 'crisis':
        return `🌱 **Next: Stabilization** - Building ongoing safety, regular support systems, and beginning to process what happened at your own pace. You don't have to do this alone.`
      
      case 'stabilization':
        return `🚀 **Next: Growth** - As stability strengthens, exploring personal development, skill building, and new opportunities becomes possible. No rush - you'll know when you're ready.`
      
      case 'growth':
        return `🫂 **Next: Community Healing** - Connecting your personal growth with community healing spaces, sharing your journey, and supporting others in theirs.`
      
      case 'community_healing':
        return `✊🏿 **Next: Advocacy** - Using your healing journey and community connections to work for systemic change and liberation for all Black queer people.`
      
      case 'advocacy':
        return `♻️ **Continuing: Full-Circle Liberation** - Your advocacy work often deepens all previous stages - continued healing, growth, community connection, and supporting others through their journeys.`
      
      default:
        return `🌟 **Your journey is unique** - these stages aren't linear, and you might move between them. Trust yourself to know what you need right now.`
    }
  }

  /**
   * Determine if follow-up is required
   */
  private requiresFollowUp(journeyContext: JourneyContext): boolean {
    const { stage, urgencyLevel, communityConnection } = journeyContext
    
    // Crisis always requires follow-up
    if (stage === 'crisis' || urgencyLevel === 'emergency') {
      return true
    }

    // Isolated individuals may benefit from follow-up
    if (communityConnection === 'isolated') {
      return true
    }

    // First-time users in stabilization may need follow-up
    if (stage === 'stabilization' && journeyContext.firstTime) {
      return true
    }

    return false
  }

  /**
   * Extract topic from user input for knowledge search
   */
  private extractTopicFromInput(input: string): string {
    const lowerInput = input.toLowerCase()
    
    // Health topics
    if (['hiv', 'prep', 'pep', 'sexual health', 'sti'].some(term => lowerInput.includes(term))) {
      return 'sexual health'
    }
    
    // Mental health topics
    if (['mental health', 'therapy', 'counselling', 'depression', 'anxiety'].some(term => lowerInput.includes(term))) {
      return 'mental health'
    }
    
    // Housing topics
    if (['housing', 'eviction', 'homeless', 'rent'].some(term => lowerInput.includes(term))) {
      return 'housing'
    }
    
    // Legal topics
    if (['discrimination', 'legal', 'rights', 'employment'].some(term => lowerInput.includes(term))) {
      return 'legal rights'
    }
    
    return 'general support'
  }
}

export default ContextualResponseGenerator