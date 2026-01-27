/**
 * North East England Region Resources
 * Black LGBTQ+ community resources for Newcastle, Sunderland, Durham, and surrounding areas
 */

import { BaseRegionalProvider } from '../base.js'
import { UKResource, KnowledgeEntry, UKRegion } from '../types.js'

export class NorthEastProvider extends BaseRegionalProvider {
  region: UKRegion = 'north_east'

  getResources(): UKResource[] {
    return [
      // AKT NEWCASTLE
      {
        id: 'akt-newcastle',
        title: 'akt (Albert Kennedy Trust) - Newcastle',
        description: 'Newcastle office of national LGBTQ+ youth homelessness charity supporting young people aged 16-25.',
        category: 'Youth Housing',
        journeyStages: ['crisis', 'stabilization', 'growth'],
        phone: '020 7831 6562',
        email: 'contact@akt.org.uk',
        website: 'https://www.akt.org.uk',
        locations: ['other_urban'],
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
        availability: 'Newcastle office available, online chat and phone support UK-wide',
        languages: ['English']
      },

      // NORTHERN PRIDE
      {
        id: 'northern-pride',
        title: 'Northern Pride',
        description: 'Newcastle\'s annual LGBTQ+ Pride celebration and year-round community organization.',
        category: 'Community Events',
        journeyStages: ['growth', 'community_healing'],
        website: 'https://www.northern-pride.com',
        locations: ['other_urban'],
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
        availability: 'Annual Pride event in July, year-round activities',
        languages: ['English']
      },

      // MESMAC NORTH EAST
      {
        id: 'mesmac-north-east',
        title: 'MESMAC North East',
        description: 'Sexual health and HIV support services for gay, bisexual, and other men who have sex with men in the North East.',
        category: 'Sexual Health',
        journeyStages: ['stabilization', 'growth'],
        website: 'https://mesmac.co.uk',
        locations: ['other_urban'],
        specializations: [
          'sexual health', 'HIV support', 'PrEP advice', 'testing',
          'support groups', 'outreach', 'gay and bisexual men'
        ],
        accessRequirements: ['men who have sex with men'],
        cost: 'free',
        culturalCompetency: {
          lgbtqSpecific: true,
          blackSpecific: false,
          transSpecific: false,
          disabilityAware: true
        },
        emergency: false,
        availability: 'Various services and outreach across the North East',
        languages: ['English']
      }
    ]
  }

  getKnowledgeEntries(): KnowledgeEntry[] {
    return [
      {
        id: 'north-east-lgbtq-resources',
        title: 'LGBTQ+ Resources in North East England',
        content: `The North East has growing LGBTQ+ support services, particularly in Newcastle and the Tyneside area.

Newcastle Area:
- akt Newcastle: LGBTQ+ youth homelessness support (ages 16-25)
- Northern Pride: Annual celebration and year-round community activities
- MESMAC North East: Sexual health services for gay and bisexual men

Youth Housing Support:
- akt Newcastle provides specialist LGBTQ+ youth homelessness support
- 47% of akt's clients nationally are Black, Brown, or People of Colour

Sexual Health:
- MESMAC North East: Specialist services for gay and bisexual men
- Local GUM clinics with LGBTQ+-friendly services
- PrEP available through NHS sexual health clinics

For QTIPOC Community Members:
- QTIPOC-specific services are limited in this region
- National services like Black Minds Matter, LGBT+ Switchboard available
- UK Black Pride (London) accessible by train
- Online communities and remote support options

General Support:
- LGBT+ Switchboard: 0300 330 0630 (national)
- NHS IAPT for mental health support (self-referral)`,
        category: 'Community Support',
        journeyStages: ['stabilization', 'growth', 'community_healing'],
        location: ['other_urban'],
        tags: ['North East', 'Newcastle', 'Tyneside', 'community', 'youth'],
        sources: ['akt.org.uk', 'northern-pride.com', 'mesmac.co.uk'],
        lastUpdated: new Date('2025-01-15'),
        verificationStatus: 'verified',
        communityValidated: false
      }
    ]
  }
}

export const northEastProvider = new NorthEastProvider()
