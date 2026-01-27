/**
 * Base Knowledge Provider
 * Shared functionality for all regional knowledge modules
 */

import { UKResource, KnowledgeEntry, JourneyStage, UKLocation, UKRegion, RegionalResourceProvider } from './types.js'

/**
 * Abstract base class for regional resource providers
 */
export abstract class BaseRegionalProvider implements RegionalResourceProvider {
  abstract region: UKRegion

  abstract getResources(): UKResource[]
  abstract getKnowledgeEntries(): KnowledgeEntry[]

  /**
   * Filter resources by journey stage
   */
  getResourcesByStage(stage: JourneyStage): UKResource[] {
    return this.getResources().filter(r => r.journeyStages.includes(stage))
  }

  /**
   * Get emergency resources only
   */
  getEmergencyResources(): UKResource[] {
    return this.getResources().filter(r => r.emergency)
  }

  /**
   * Get culturally specific resources
   */
  getCulturallySpecificResources(): UKResource[] {
    return this.getResources().filter(r =>
      r.culturalCompetency.blackSpecific || r.culturalCompetency.lgbtqSpecific
    )
  }

  /**
   * Get resources by category
   */
  getResourcesByCategory(category: string): UKResource[] {
    return this.getResources().filter(r =>
      r.category.toLowerCase().includes(category.toLowerCase())
    )
  }

  /**
   * Get knowledge entries by topic
   */
  getKnowledgeByTopic(topic: string): KnowledgeEntry[] {
    return this.getKnowledgeEntries().filter(entry =>
      entry.category.toLowerCase().includes(topic.toLowerCase()) ||
      entry.tags.some(tag => tag.toLowerCase().includes(topic.toLowerCase()))
    )
  }
}

/**
 * Helper to create a standard resource with defaults
 */
export function createResource(partial: Partial<UKResource> & {
  id: string
  title: string
  description: string
  category: string
  journeyStages: JourneyStage[]
  locations: UKLocation[]
}): UKResource {
  return {
    specializations: [],
    accessRequirements: ['none'],
    cost: 'free',
    culturalCompetency: {
      lgbtqSpecific: false,
      blackSpecific: false,
      transSpecific: false,
      disabilityAware: false
    },
    emergency: false,
    availability: 'weekdays',
    languages: ['English'],
    ...partial
  }
}

/**
 * Helper to create a knowledge entry with defaults
 */
export function createKnowledgeEntry(partial: Partial<KnowledgeEntry> & {
  id: string
  title: string
  content: string
  category: string
  journeyStages: JourneyStage[]
  location: UKLocation[]
  tags: string[]
}): KnowledgeEntry {
  return {
    sources: [],
    lastUpdated: new Date(),
    verificationStatus: 'pending',
    communityValidated: false,
    ...partial
  }
}
