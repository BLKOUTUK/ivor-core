/**
 * East of England Region Resources
 * Black LGBTQ+ community resources for Cambridge, Norwich, Ipswich, and surrounding areas
 */

import { BaseRegionalProvider } from '../base.js'
import { UKResource, KnowledgeEntry, UKRegion } from '../types.js'

export class EastEnglandProvider extends BaseRegionalProvider {
  region: UKRegion = 'east_england'

  getResources(): UKResource[] {
    return [
      // KITE TRUST - CAMBRIDGE
      {
        id: 'kite-trust-cambridge',
        title: 'The Kite Trust',
        description: 'LGBTQ+ youth charity supporting young people across Cambridgeshire and Peterborough.',
        category: 'Youth Support',
        journeyStages: ['stabilization', 'growth', 'community_healing'],
        email: 'info@thekitetrust.org.uk',
        website: 'https://thekitetrust.org.uk',
        locations: ['other_urban'],
        specializations: [
          'LGBTQ+ youth', 'peer support groups', 'counselling',
          'schools outreach', 'trans youth support', 'parent support'
        ],
        accessRequirements: ['age up to 25', 'LGBTQ+ identifying or questioning'],
        cost: 'free',
        culturalCompetency: {
          lgbtqSpecific: true,
          blackSpecific: false,
          transSpecific: true,
          disabilityAware: true
        },
        emergency: false,
        availability: 'Youth groups and support services across Cambridgeshire',
        languages: ['English']
      },

      // NORWICH PRIDE
      {
        id: 'norwich-pride',
        title: 'Norwich Pride',
        description: 'Annual LGBTQ+ Pride celebration and community organization for Norfolk.',
        category: 'Community Events',
        journeyStages: ['growth', 'community_healing'],
        website: 'https://www.norwichpride.org.uk',
        locations: ['other_urban'],
        specializations: [
          'Pride events', 'community celebration', 'LGBTQ+ visibility'
        ],
        accessRequirements: ['none'],
        cost: 'free',
        culturalCompetency: {
          lgbtqSpecific: true,
          blackSpecific: false,
          transSpecific: true,
          disabilityAware: true
        },
        emergency: false,
        availability: 'Annual Pride event and year-round activities',
        languages: ['English']
      }
    ]
  }

  getKnowledgeEntries(): KnowledgeEntry[] {
    return [
      {
        id: 'east-england-lgbtq-resources',
        title: 'LGBTQ+ Resources in East of England',
        content: `The East of England region has developing LGBTQ+ support services, though more rural areas may have limited local options.

Cambridge Area:
- The Kite Trust: LGBTQ+ youth support across Cambridgeshire
- Cambridge has an active LGBTQ+ community

Norwich/Norfolk:
- Norwich Pride: Annual celebration and community events
- Growing LGBTQ+ visibility in the region

For QTIPOC Community Members:
- QTIPOC-specific services are limited in this region
- National services like Black Minds Matter, LGBT+ Switchboard available
- UK Black Pride (London) accessible by train
- Online communities and remote support options
- Contact national organizations for signposting to local BPOC resources

General Support:
- LGBT+ Switchboard: 0300 330 0630 (national)
- Local GUM clinics for sexual health services
- NHS IAPT for mental health support (self-referral)`,
        category: 'Community Support',
        journeyStages: ['stabilization', 'growth', 'community_healing'],
        location: ['other_urban', 'rural'],
        tags: ['East of England', 'Cambridge', 'Norwich', 'rural', 'community'],
        sources: ['thekitetrust.org.uk', 'norwichpride.org.uk'],
        lastUpdated: new Date('2025-01-15'),
        verificationStatus: 'verified',
        communityValidated: false
      }
    ]
  }
}

export const eastEnglandProvider = new EastEnglandProvider()
