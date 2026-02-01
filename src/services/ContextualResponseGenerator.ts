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
    let response = `I hear you. What you're going through matters, and you don't have to sit with it alone.\n\n`

    // Immediate safety resources
    const emergencyResources = resources.filter(r => r.emergency)
    if (emergencyResources.length > 0) {
      response += `**Immediate support — right now:**\n`
      emergencyResources.slice(0, 3).forEach(resource => {
        response += `- **${resource.title}**: ${resource.phone || resource.website}\n`
        response += `  ${resource.description}\n`
      })
      response += `\n`
    }

    // Specific crisis information
    if (knowledge.length > 0) {
      const crisisKnowledge = knowledge[0]
      response += `${crisisKnowledge.content.substring(0, 200)}...\n\n`
    }

    // Direct, grounded message
    response += `You are part of this community. What you're facing right now is not the whole of who you are.\n\n`

    // Next steps
    response += `When you're ready — and only then — there's stabilisation support to help you build something steadier. No rush. No performance required.`

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
    let response = `Stability isn't glamorous, but it's the foundation everything else gets built on. The fact you're here, working on it, says something.\n\n`

    // Ongoing support resources
    if (resources.length > 0) {
      response += `**Support worth knowing about:**\n`
      resources.slice(0, 3).forEach(resource => {
        response += `- **${resource.title}** — ${resource.description}\n`
        if (resource.phone) response += `  Phone: ${resource.phone}\n`
        if (resource.website) response += `  ${resource.website}\n`
        if (resource.cost === 'nhs_funded' || resource.cost === 'free') {
          response += `  ${resource.cost === 'nhs_funded' ? 'NHS funded' : 'Free'}\n`
        }
        response += `\n`
      })
    }

    // Specific stabilization information
    if (knowledge.length > 0) {
      const stabilizationInfo = knowledge[0]
      response += `${stabilizationInfo.content.substring(0, 300)}...\n\n`
    }

    // Honest encouragement
    response += `Regular support — therapy, peer groups, community connections — makes a real difference. Not because it fixes everything overnight, but because it means you're not carrying it alone.\n\n`

    // Next stage
    response += `As things steady, you might find yourself drawn to growth — new skills, education, exploring interests you'd shelved. No rush. You'll know when.`

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
    let response = `Right then — growth mode. This is where it gets interesting.\n\n`

    // Growth resources
    if (resources.length > 0) {
      response += `**Worth looking into:**\n`
      resources.slice(0, 3).forEach(resource => {
        response += `- **${resource.title}** — ${resource.description}\n`
        if (resource.specializations.length > 0) {
          response += `  Focus: ${resource.specializations.join(', ')}\n`
        }
        if (resource.website) response += `  ${resource.website}\n`
        response += `\n`
      })
    }

    // Specific growth information
    if (knowledge.length > 0) {
      const growthInfo = knowledge[0]
      response += `${growthInfo.content.substring(0, 350)}...\n\n`
    }

    // Grounded encouragement
    response += `The skills and confidence you're building here serve you first — and the community benefits from that too. Personal growth and collective power aren't separate things.`

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
    let response = `Community healing. This is where individual work starts to connect with something bigger.\n\n`

    // Community resources
    if (resources.length > 0) {
      response += `**Spaces doing this work:**\n`
      resources.slice(0, 3).forEach(resource => {
        response += `- **${resource.title}** — ${resource.description}\n`
        if (resource.culturalCompetency.blackSpecific || resource.culturalCompetency.lgbtqSpecific) {
          response += `  Culturally specific support\n`
        }
        if (resource.website) response += `  ${resource.website}\n`
        response += `\n`
      })
    }

    // Community healing information
    if (knowledge.length > 0) {
      const healingInfo = knowledge[0]
      response += `${healingInfo.content.substring(0, 300)}...\n\n`
    }

    // Honest reflection
    response += `Healing in community is a different thing to healing alone. Your journey connects with collective liberation — you're not just sorting yourself out, you're contributing to something that outlasts any one of us.\n\n`

    // Advocacy connection
    response += `For many people, community healing flows naturally into organising and advocacy. That's not a requirement — just something to notice if it starts pulling at you.`

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
    let response = `Advocacy. This is where it gets real — turning lived experience into systemic change.\n\n`

    // Advocacy resources
    if (resources.length > 0) {
      response += `**Organising and advocacy:**\n`
      resources.slice(0, 3).forEach(resource => {
        response += `- **${resource.title}** — ${resource.description}\n`
        if (resource.specializations.includes('organizing') || resource.specializations.includes('advocacy')) {
          response += `  Organising focused\n`
        }
        if (resource.website) response += `  ${resource.website}\n`
        response += `\n`
      })
    }

    // Advocacy information
    if (knowledge.length > 0) {
      const advocacyInfo = knowledge[0]
      response += `${advocacyInfo.content.substring(0, 350)}...\n\n`
    }

    // Direct empowerment
    response += `Your advocacy is rooted in your journey — the challenges, the healing, the community you've built around you. That's not abstract power. That's lived authority.\n\n`

    // Systems change
    response += `Systems change happens when people decide their liberation is worth the fight. Policy, community organising, cultural transformation — whatever form yours takes, you're part of something that matters.`

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
    let response = `AIvor here. Let me see what I can do for you.\n\n`

    if (resources.length > 0) {
      response += `**Some places worth knowing about:**\n`
      resources.slice(0, 3).forEach(resource => {
        response += `- **${resource.title}** — ${resource.description}\n`
        if (resource.phone) response += `  Phone: ${resource.phone}\n`
        if (resource.website) response += `  ${resource.website}\n`
      })
      response += `\n`
    }

    response += `I can help with mental health resources, sexual health information, housing support, legal guidance, community connections, or whatever else is on your mind. What do you need?`

    return response
  }

  /**
   * Generate next stage guidance
   */
  private generateNextStageGuidance(journeyContext: JourneyContext): string {
    const { stage } = journeyContext

    switch (stage) {
      case 'crisis':
        return `**Next: Stabilisation** — Building ongoing safety, regular support, and space to process at your own pace. You don't have to do this alone.`

      case 'stabilization':
        return `**Next: Growth** — As stability strengthens, personal development, skill building, and new opportunities open up. No rush — you'll know when you're ready.`

      case 'growth':
        return `**Next: Community Healing** — Connecting your personal growth with community spaces, sharing your journey, and supporting others through theirs.`

      case 'community_healing':
        return `**Next: Advocacy** — Using your healing journey and community connections to work for systemic change and liberation for all Black queer people.`

      case 'advocacy':
        return `**Full-Circle Liberation** — Advocacy often deepens everything that came before — continued healing, growth, community connection, and supporting others through their journeys.`

      default:
        return `These stages aren't linear — you might move between them, and that's how it should be. Trust yourself to know what you need right now.`
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