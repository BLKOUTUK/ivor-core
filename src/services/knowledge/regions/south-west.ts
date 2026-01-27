/**
 * South West England Region Resources
 * Black LGBTQ+ community resources for Bristol, Bath, Exeter, Plymouth, and surrounding areas
 */

import { BaseRegionalProvider } from '../base.js'
import { UKResource, KnowledgeEntry, UKRegion } from '../types.js'

export class SouthWestProvider extends BaseRegionalProvider {
  region: UKRegion = 'south_west'

  getResources(): UKResource[] {
    return [
      // AKT BRISTOL
      {
        id: 'akt-bristol',
        title: 'akt (Albert Kennedy Trust) - Bristol',
        description: 'Bristol office of national LGBTQ+ youth homelessness charity supporting young people aged 16-25.',
        category: 'Youth Housing',
        journeyStages: ['crisis', 'stabilization', 'growth'],
        phone: '020 7831 6562',
        email: 'contact@akt.org.uk',
        website: 'https://www.akt.org.uk',
        locations: ['bristol'],
        specializations: [
          'youth homelessness', 'LGBTQ+ youth 16-25', 'emergency accommodation',
          'housing support', 'caseworker support', 'mental health support'
        ],
        accessRequirements: ['age 16-25', 'LGBTQ+ identifying', 'at risk of or experiencing homelessness'],
        cost: 'free',
        culturalCompetency: {
          lgbtqSpecific: true,
          blackSpecific: true,
          transSpecific: true,
          disabilityAware: true
        },
        emergency: true,
        availability: 'Bristol office available, online chat and phone support UK-wide',
        languages: ['English']
      },

      // BRISTOL PRIDE
      {
        id: 'bristol-pride',
        title: 'Bristol Pride',
        description: 'Annual LGBTQ+ Pride celebration and year-round community organization.',
        category: 'Community Events',
        journeyStages: ['growth', 'community_healing'],
        website: 'https://bristolpride.co.uk',
        locations: ['bristol'],
        specializations: [
          'Pride events', 'community celebration', 'LGBTQ+ visibility',
          'community groups'
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
        availability: 'Annual Pride event plus year-round activities',
        languages: ['English']
      },

      // OFF THE RECORD BRISTOL
      {
        id: 'off-the-record-bristol',
        title: 'Off The Record Bristol',
        description: 'Mental health support for young people including LGBTQ+ specific services.',
        category: 'Youth Mental Health',
        journeyStages: ['crisis', 'stabilization', 'growth'],
        phone: '0808 808 9120',
        website: 'https://otrbristol.org.uk',
        locations: ['bristol'],
        specializations: [
          'youth mental health', 'counselling', 'LGBTQ+ support',
          'gender identity support', 'peer support', 'crisis support'
        ],
        accessRequirements: ['age 11-25'],
        cost: 'free',
        culturalCompetency: {
          lgbtqSpecific: true,
          blackSpecific: false,
          transSpecific: true,
          disabilityAware: true
        },
        emergency: false,
        availability: 'Various support services for young people',
        languages: ['English']
      }
    ]
  }

  getKnowledgeEntries(): KnowledgeEntry[] {
    return [
      {
        id: 'bristol-lgbtq-resources',
        title: 'LGBTQ+ Resources in Bristol and the South West',
        content: `Bristol has an active LGBTQ+ community with various support services available.

Youth Housing Support:
- akt Bristol office provides specialist LGBTQ+ youth homelessness support
- For ages 16-25 at risk of or experiencing homelessness
- 47% of akt's clients are Black, Brown, or People of Colour

Mental Health Support:
- Off The Record Bristol: Free mental health support for ages 11-25
- Includes LGBTQ+ specific services and gender identity support

Community:
- Bristol Pride: Annual celebration and year-round community activities
- Growing LGBTQ+ scene with various social venues and groups

For QTIPOC Community Members:
- akt Bristol has strong QTIPOC engagement (47% of clients nationally)
- National services like Black Minds Matter available
- UK Black Pride (London) accessible by train
- Contact local organizations for BPOC-specific groups and events`,
        category: 'Community Support',
        journeyStages: ['stabilization', 'growth', 'community_healing'],
        location: ['bristol'],
        tags: ['Bristol', 'South West', 'youth', 'housing', 'mental health'],
        sources: ['akt.org.uk', 'otrbristol.org.uk', 'bristolpride.co.uk'],
        lastUpdated: new Date('2025-01-15'),
        verificationStatus: 'verified',
        communityValidated: false
      }
    ]
  }
}

export const southWestProvider = new SouthWestProvider()
