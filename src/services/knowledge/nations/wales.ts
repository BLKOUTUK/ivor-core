/**
 * Wales Resources
 * Black LGBTQ+ community resources for Cardiff, Swansea, Newport, and across Wales
 */

import { BaseRegionalProvider } from '../base.js'
import { UKResource, KnowledgeEntry, UKRegion } from '../types.js'

export class WalesProvider extends BaseRegionalProvider {
  region: UKRegion = 'wales'

  getResources(): UKResource[] {
    return [
      // PRIDE CYMRU
      {
        id: 'pride-cymru',
        title: 'Pride Cymru',
        description: 'Wales\' largest LGBTQ+ Pride celebration and year-round community organization based in Cardiff.',
        category: 'Community Events',
        journeyStages: ['growth', 'community_healing'],
        website: 'https://www.pridecymru.com',
        locations: ['cardiff'],
        specializations: [
          'Pride events', 'community celebration', 'LGBTQ+ visibility',
          'year-round community activities'
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
        languages: ['English', 'Welsh']
      },

      // LGBT+ CYMRU HELPLINE
      {
        id: 'lgbt-cymru-helpline',
        title: 'LGBT+ Cymru Helpline',
        description: 'Welsh LGBTQ+ helpline providing support and information.',
        category: 'Support Helpline',
        journeyStages: ['crisis', 'stabilization', 'growth'],
        phone: '0800 977 4444',
        website: 'https://www.lgbtcymru.org.uk',
        locations: ['cardiff', 'unknown'],
        specializations: [
          'helpline', 'emotional support', 'information',
          'signposting', 'Welsh language support'
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
        availability: 'Helpline hours - check website',
        languages: ['English', 'Welsh']
      },

      // UMBRELLA CYMRU
      {
        id: 'umbrella-cymru',
        title: 'Umbrella Cymru',
        description: 'Trans support organization in Wales providing peer support, information, and advocacy.',
        category: 'Trans Support',
        journeyStages: ['stabilization', 'growth', 'community_healing'],
        website: 'https://www.umbrellacymru.co.uk',
        locations: ['cardiff', 'unknown'],
        specializations: [
          'trans support', 'non-binary support', 'peer groups',
          'information resources', 'advocacy'
        ],
        accessRequirements: ['trans or non-binary identifying or questioning'],
        cost: 'free',
        culturalCompetency: {
          lgbtqSpecific: true,
          blackSpecific: false,
          transSpecific: true,
          disabilityAware: true
        },
        emergency: false,
        availability: 'Support groups and services across Wales',
        languages: ['English', 'Welsh']
      },

      // FAST TRACK CYMRU (HIV)
      {
        id: 'fast-track-cymru',
        title: 'Fast Track Cymru',
        description: 'HIV prevention and sexual health initiative for Wales.',
        category: 'Sexual Health',
        journeyStages: ['stabilization', 'growth'],
        website: 'https://www.fasttrackcymru.com',
        locations: ['cardiff', 'unknown'],
        specializations: [
          'HIV prevention', 'PrEP access', 'sexual health testing',
          'education', 'stigma reduction'
        ],
        accessRequirements: ['none'],
        cost: 'nhs_funded',
        culturalCompetency: {
          lgbtqSpecific: true,
          blackSpecific: false,
          transSpecific: false,
          disabilityAware: true
        },
        emergency: false,
        availability: 'Information and services across Wales',
        languages: ['English', 'Welsh']
      }
    ]
  }

  getKnowledgeEntries(): KnowledgeEntry[] {
    return [
      {
        id: 'wales-lgbtq-resources',
        title: 'LGBTQ+ Resources in Wales',
        content: `Wales has its own LGBTQ+ support services, with many offering Welsh language support.

Welsh National Services:
- LGBT+ Cymru Helpline: 0800 977 4444
- Umbrella Cymru: Trans and non-binary support
- Fast Track Cymru: HIV prevention and sexual health

Cardiff:
- Pride Cymru: Wales' largest Pride celebration
- Various LGBTQ+ community groups
- Access to Welsh NHS sexual health services

Swansea & Newport:
- Local LGBTQ+ community groups
- NHS sexual health clinics with LGBTQ+-friendly services

Welsh Language Support:
- Many Welsh LGBTQ+ services offer support in Welsh
- Samaritans: 116 123 (Welsh language option available)
- NHS Wales services available in Welsh

Sexual Health in Wales:
- PrEP available free through NHS Wales sexual health clinics
- Fast Track Cymru for HIV prevention information
- Local GUM clinics for testing and treatment

For QTIPOC Community Members:
- QTIPOC-specific services are limited in Wales
- National services like Black Minds Matter UK available
- UK Black Pride (London) accessible by train
- Online communities and remote support options
- Cardiff has a growing diverse LGBTQ+ community

Legal Rights:
- Wales follows UK equality legislation
- Welsh Government has strong LGBTQ+ equality commitments
- Trans rights protected under Equality Act 2010`,
        category: 'Community Support',
        journeyStages: ['stabilization', 'growth', 'community_healing'],
        location: ['cardiff', 'unknown'],
        tags: ['Wales', 'Cardiff', 'Cymru', 'Welsh language', 'community'],
        sources: ['lgbtcymru.org.uk', 'pridecymru.com', 'umbrellacymru.co.uk'],
        lastUpdated: new Date('2025-01-15'),
        verificationStatus: 'verified',
        communityValidated: false
      }
    ]
  }
}

export const walesProvider = new WalesProvider()
