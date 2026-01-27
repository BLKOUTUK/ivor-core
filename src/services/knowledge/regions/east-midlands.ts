/**
 * East Midlands Region Resources
 * Black LGBTQ+ community resources for Nottingham, Leicester, Derby, and surrounding areas
 */

import { BaseRegionalProvider } from '../base.js'
import { UKResource, KnowledgeEntry, UKRegion } from '../types.js'

export class EastMidlandsProvider extends BaseRegionalProvider {
  region: UKRegion = 'east_midlands'

  getResources(): UKResource[] {
    return [
      // NOTTINGHAM LGBT NETWORK
      {
        id: 'nottingham-lgbt-network',
        title: 'Nottingham LGBT+ Network',
        description: 'Community organization supporting LGBTQ+ people in Nottingham and the surrounding area.',
        category: 'Community Support',
        journeyStages: ['stabilization', 'growth', 'community_healing'],
        website: 'https://www.nottslgbtqnetwork.org.uk',
        locations: ['nottingham'],
        specializations: [
          'community events', 'support groups', 'advocacy',
          'information and signposting', 'social activities'
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
        availability: 'Various events and services',
        languages: ['English']
      },

      // LEICESTER LGBT CENTRE
      {
        id: 'leicester-lgbt-centre',
        title: 'Leicester LGBT Centre',
        description: 'Community center providing support, social activities, and resources for LGBTQ+ people in Leicester.',
        category: 'Community Centre',
        journeyStages: ['stabilization', 'growth', 'community_healing'],
        phone: '0116 254 7412',
        website: 'https://leicesterlgbtcentre.org',
        locations: ['other_urban'],
        specializations: [
          'community space', 'support groups', 'social events',
          'youth groups', 'older adults groups', 'trans support'
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
        availability: 'Open various days, check website for hours',
        languages: ['English']
      },

      // NOTTS SEXUAL HEALTH
      {
        id: 'notts-sexual-health',
        title: 'Nottinghamshire Sexual Health',
        description: 'NHS sexual health services including LGBTQ+-friendly testing and support.',
        category: 'Sexual Health',
        journeyStages: ['stabilization', 'growth'],
        website: 'https://www.nottinghamshiresexualhealth.nhs.uk',
        locations: ['nottingham'],
        specializations: [
          'sexual health testing', 'HIV testing', 'PrEP', 'STI treatment',
          'contraception', 'LGBTQ+ friendly services'
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
        availability: 'NHS clinic hours, online booking available',
        languages: ['English', 'interpreters available']
      }
    ]
  }

  getKnowledgeEntries(): KnowledgeEntry[] {
    return [
      {
        id: 'east-midlands-lgbtq-resources',
        title: 'LGBTQ+ Resources in the East Midlands',
        content: `The East Midlands has LGBTQ+ support services in major cities including Nottingham, Leicester, and Derby.

Nottingham:
- Nottingham LGBT+ Network: Community support and events
- Nottinghamshire Sexual Health: NHS sexual health services with LGBTQ+-friendly care

Leicester:
- Leicester LGBT Centre: 0116 254 7412
- Community space with support groups and social events

Derby:
- Derbyshire LGBT+: Local community organization
- Various support groups and events

For QTIPOC Community Members:
- QTIPOC-specific services are developing in this region
- National services like Black Minds Matter, LGBT+ Switchboard available
- African Rainbow Family has branches in nearby cities (Manchester, Birmingham, Leeds)
- UK Black Pride (London) accessible by train

Sexual Health:
- Local GUM clinics offer PrEP and HIV testing
- menrus.co.uk for Black gay men's sexual health information
- THT national helpline: 0808 802 1221`,
        category: 'Community Support',
        journeyStages: ['stabilization', 'growth', 'community_healing'],
        location: ['nottingham', 'other_urban'],
        tags: ['East Midlands', 'Nottingham', 'Leicester', 'Derby', 'community'],
        sources: ['nottslgbtqnetwork.org.uk', 'leicesterlgbtcentre.org'],
        lastUpdated: new Date('2025-01-15'),
        verificationStatus: 'verified',
        communityValidated: false
      }
    ]
  }
}

export const eastMidlandsProvider = new EastMidlandsProvider()
