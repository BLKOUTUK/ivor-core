/**
 * UK Knowledge Base - Modular Regional Organization
 *
 * This module aggregates resources and knowledge from all UK regions:
 * - 9 English regions (ONS classification)
 * - 3 Devolved nations (Scotland, Wales, Northern Ireland)
 * - Nationwide UK-wide resources
 *
 * Supporting Black LGBTQ+ community liberation across the UK
 */

import { UKResource, KnowledgeEntry, JourneyStage, UKLocation, UKRegion, cityToRegion, RegionalResourceProvider } from './types.js'

// Import regional providers
import { nationwideProvider } from './national/nationwide.js'
import { londonProvider } from './regions/london.js'
import { northWestProvider } from './regions/north-west.js'
import { westMidlandsProvider } from './regions/west-midlands.js'
import { yorkshireProvider } from './regions/yorkshire.js'
import { southEastProvider } from './regions/south-east.js'
import { southWestProvider } from './regions/south-west.js'
import { eastEnglandProvider } from './regions/east-england.js'
import { eastMidlandsProvider } from './regions/east-midlands.js'
import { northEastProvider } from './regions/north-east.js'
import { scotlandProvider } from './nations/scotland.js'
import { walesProvider } from './nations/wales.js'
import { northernIrelandProvider } from './nations/northern-ireland.js'

// All regional providers
const providers: RegionalResourceProvider[] = [
  nationwideProvider,
  londonProvider,
  northWestProvider,
  westMidlandsProvider,
  yorkshireProvider,
  southEastProvider,
  southWestProvider,
  eastEnglandProvider,
  eastMidlandsProvider,
  northEastProvider,
  scotlandProvider,
  walesProvider,
  northernIrelandProvider
]

// Provider lookup by region
const providersByRegion: Record<UKRegion, RegionalResourceProvider> = {
  nationwide: nationwideProvider,
  london: londonProvider,
  north_west: northWestProvider,
  west_midlands: westMidlandsProvider,
  yorkshire: yorkshireProvider,
  south_east: southEastProvider,
  south_west: southWestProvider,
  east_england: eastEnglandProvider,
  east_midlands: eastMidlandsProvider,
  north_east: northEastProvider,
  scotland: scotlandProvider,
  wales: walesProvider,
  northern_ireland: northernIrelandProvider
}

/**
 * UK Knowledge Base for Black Queer Community Resources
 * Integrates regional modules with menrus.co.uk, NHS, and community-specific resources
 */
export class UKKnowledgeBase {
  private allResources: UKResource[]
  private allKnowledgeEntries: KnowledgeEntry[]

  constructor() {
    this.allResources = this.aggregateResources()
    this.allKnowledgeEntries = this.aggregateKnowledgeEntries()
  }

  /**
   * Aggregate all resources from all providers
   */
  private aggregateResources(): UKResource[] {
    return providers.flatMap(provider => provider.getResources())
  }

  /**
   * Aggregate all knowledge entries from all providers
   */
  private aggregateKnowledgeEntries(): KnowledgeEntry[] {
    return providers.flatMap(provider => provider.getKnowledgeEntries())
  }

  /**
   * Get the region for a given city/location
   */
  getRegionForLocation(location: UKLocation): UKRegion {
    return cityToRegion[location]
  }

  /**
   * Get resources filtered by journey stage and location
   */
  getResourcesByStageAndLocation(
    stage: JourneyStage,
    location: UKLocation,
    urgency?: string,
    category?: string
  ): UKResource[] {
    const region = this.getRegionForLocation(location)

    // Get resources from the specific region + nationwide
    let filteredResources = this.allResources.filter(resource =>
      resource.journeyStages.includes(stage) &&
      (resource.locations.includes(location) ||
       resource.locations.includes('unknown') ||
       resource.locations.some(loc => cityToRegion[loc] === region))
    )

    // Emergency resources take priority
    if (urgency === 'emergency') {
      filteredResources = filteredResources.filter(r => r.emergency)
    }

    // Filter by category if specified
    if (category) {
      filteredResources = filteredResources.filter(r =>
        r.category.toLowerCase().includes(category.toLowerCase())
      )
    }

    // Sort by relevance: emergency first, then free/NHS, then specific to community
    return filteredResources.sort((a, b) => {
      if (a.emergency && !b.emergency) return -1
      if (!a.emergency && b.emergency) return 1

      if ((a.cost === 'free' || a.cost === 'nhs_funded') &&
          (b.cost !== 'free' && b.cost !== 'nhs_funded')) return -1
      if ((b.cost === 'free' || b.cost === 'nhs_funded') &&
          (a.cost !== 'free' && a.cost !== 'nhs_funded')) return 1

      const aSpecific = a.culturalCompetency.blackSpecific || a.culturalCompetency.lgbtqSpecific
      const bSpecific = b.culturalCompetency.blackSpecific || b.culturalCompetency.lgbtqSpecific
      if (aSpecific && !bSpecific) return -1
      if (!aSpecific && bSpecific) return 1

      return 0
    })
  }

  /**
   * Get knowledge entries by topic and journey stage
   */
  getKnowledgeByTopic(
    topic: string,
    stage: JourneyStage,
    location: UKLocation
  ): KnowledgeEntry[] {
    const region = this.getRegionForLocation(location)

    return this.allKnowledgeEntries.filter(entry =>
      entry.journeyStages.includes(stage) &&
      (entry.location.includes(location) ||
       entry.location.includes('unknown') ||
       entry.location.some(loc => cityToRegion[loc] === region)) &&
      (entry.category.toLowerCase().includes(topic.toLowerCase()) ||
       entry.tags.some(tag => tag.toLowerCase().includes(topic.toLowerCase())))
    ).sort((a, b) => {
      // Prioritize community-validated and recently updated content
      if (a.communityValidated && !b.communityValidated) return -1
      if (!a.communityValidated && b.communityValidated) return 1
      return b.lastUpdated.getTime() - a.lastUpdated.getTime()
    })
  }

  /**
   * Search for specific health information from menrus.co.uk integration
   */
  getMenrusHealthInfo(query: string, stage: JourneyStage): KnowledgeEntry[] {
    const healthKeywords = ['hiv', 'prep', 'pep', 'sexual health', 'sti', 'testing', 'treatment']
    const isHealthQuery = healthKeywords.some(keyword =>
      query.toLowerCase().includes(keyword)
    )

    if (!isHealthQuery) return []

    return this.allKnowledgeEntries.filter(entry =>
      entry.sources.includes('menrus.co.uk') &&
      entry.journeyStages.includes(stage) &&
      healthKeywords.some(keyword =>
        entry.content.toLowerCase().includes(keyword) ||
        entry.tags.some(tag => tag.toLowerCase().includes(keyword))
      )
    )
  }

  /**
   * Get emergency resources immediately
   */
  getEmergencyResources(location: UKLocation): UKResource[] {
    return this.allResources
      .filter(r => r.emergency)
      .filter(r => r.locations.includes(location) || r.locations.includes('unknown'))
      .sort((a, b) => {
        // Prioritize 24/7 availability
        if (a.availability.includes('24/7') && !b.availability.includes('24/7')) return -1
        if (!a.availability.includes('24/7') && b.availability.includes('24/7')) return 1
        return 0
      })
  }

  /**
   * Get culturally specific resources for Black queer community
   */
  getCulturallySpecificResources(stage: JourneyStage, location: UKLocation): UKResource[] {
    return this.allResources.filter(resource =>
      (resource.culturalCompetency.blackSpecific || resource.culturalCompetency.lgbtqSpecific) &&
      resource.journeyStages.includes(stage) &&
      (resource.locations.includes(location) || resource.locations.includes('unknown'))
    )
  }

  /**
   * Get resources by region
   */
  getResourcesByRegion(region: UKRegion): UKResource[] {
    const provider = providersByRegion[region]
    return provider ? provider.getResources() : []
  }

  /**
   * Get knowledge entries by region
   */
  getKnowledgeByRegion(region: UKRegion): KnowledgeEntry[] {
    const provider = providersByRegion[region]
    return provider ? provider.getKnowledgeEntries() : []
  }

  /**
   * Get all available regions
   */
  getAvailableRegions(): UKRegion[] {
    return Object.keys(providersByRegion) as UKRegion[]
  }

  /**
   * Update resource with community feedback
   */
  updateResourceWithFeedback(resourceId: string, feedback: any): void {
    // In a real implementation, this would update the database
    console.log(`Community feedback received for resource ${resourceId}:`, feedback)
  }

  /**
   * Add new community-contributed resource
   */
  addCommunityResource(resource: Partial<UKResource>): void {
    // In a real implementation, this would add to database with community validation
    console.log('New community resource submitted for validation:', resource)
  }
}

// Export everything
export {
  UKResource,
  KnowledgeEntry,
  JourneyStage,
  UKLocation,
  UKRegion,
  cityToRegion,
  RegionalResourceProvider
}

// Export providers for direct access if needed
export {
  nationwideProvider,
  londonProvider,
  northWestProvider,
  westMidlandsProvider,
  yorkshireProvider,
  southEastProvider,
  southWestProvider,
  eastEnglandProvider,
  eastMidlandsProvider,
  northEastProvider,
  scotlandProvider,
  walesProvider,
  northernIrelandProvider
}

export default UKKnowledgeBase
