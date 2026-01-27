/**
 * Northern Ireland Resources
 * Black LGBTQ+ community resources for Belfast, Derry/Londonderry, and across Northern Ireland
 */

import { BaseRegionalProvider } from '../base.js'
import { UKResource, KnowledgeEntry, UKRegion } from '../types.js'

export class NorthernIrelandProvider extends BaseRegionalProvider {
  region: UKRegion = 'northern_ireland'

  getResources(): UKResource[] {
    return [
      // THE RAINBOW PROJECT
      {
        id: 'rainbow-project-ni',
        title: 'The Rainbow Project',
        description: 'Northern Ireland\'s largest LGBTQ+ health and wellbeing organization providing comprehensive support services.',
        category: 'Health & Wellbeing',
        journeyStages: ['crisis', 'stabilization', 'growth', 'community_healing'],
        phone: '028 9031 9030',
        email: 'info@rainbow-project.org',
        website: 'https://www.rainbow-project.org',
        locations: ['belfast', 'unknown'],
        specializations: [
          'sexual health', 'mental health', 'counselling',
          'youth support', 'trans support', 'community groups',
          'HIV testing', 'PrEP support'
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
        availability: 'Offices in Belfast and Derry, various services across NI',
        languages: ['English']
      },

      // CARA-FRIEND
      {
        id: 'cara-friend-ni',
        title: 'Cara-Friend',
        description: 'LGBTQ+ support and advocacy organization in Northern Ireland providing helpline, youth support, and community services.',
        category: 'Support Services',
        journeyStages: ['crisis', 'stabilization', 'growth'],
        phone: '0808 8000 390',
        email: 'info@cara-friend.org.uk',
        website: 'https://cara-friend.org.uk',
        locations: ['belfast', 'unknown'],
        specializations: [
          'helpline', 'youth groups', 'peer support',
          'schools outreach', 'advocacy', 'befriending'
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
        availability: 'Helpline and services throughout Northern Ireland',
        languages: ['English']
      },

      // BELFAST PRIDE
      {
        id: 'belfast-pride',
        title: 'Belfast Pride',
        description: 'Northern Ireland\'s largest LGBTQ+ Pride celebration and year-round community organization.',
        category: 'Community Events',
        journeyStages: ['growth', 'community_healing'],
        website: 'https://www.belfastpride.com',
        locations: ['belfast'],
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
        availability: 'Annual Pride week in August, year-round events',
        languages: ['English']
      },

      // SAIL BELFAST (TRANS)
      {
        id: 'sail-belfast',
        title: 'SAIL Belfast',
        description: 'Support group for trans and non-binary people in Northern Ireland.',
        category: 'Trans Support',
        journeyStages: ['stabilization', 'growth', 'community_healing'],
        website: 'https://www.sailni.com',
        locations: ['belfast', 'unknown'],
        specializations: [
          'trans support', 'non-binary support', 'peer groups',
          'family support', 'information resources'
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
        availability: 'Support groups and services',
        languages: ['English']
      }
    ]
  }

  getKnowledgeEntries(): KnowledgeEntry[] {
    return [
      {
        id: 'northern-ireland-lgbtq-resources',
        title: 'LGBTQ+ Resources in Northern Ireland',
        content: `Northern Ireland has made significant progress on LGBTQ+ rights and has growing support services.

Key Northern Ireland Services:
- The Rainbow Project: 028 9031 9030 (Belfast and Derry offices)
- Cara-Friend Helpline: 0808 8000 390
- SAIL Belfast: Trans and non-binary support

Belfast:
- Belfast Pride: Annual celebration in August
- The Rainbow Project: Comprehensive LGBTQ+ health services
- Various LGBTQ+ community groups and social venues

Derry/Londonderry:
- The Rainbow Project has a Derry office
- Foyle Pride: Local Pride celebration

Sexual Health in Northern Ireland:
- PrEP available free through NHS NI (since 2018)
- The Rainbow Project offers HIV testing and sexual health services
- GUM clinics across Northern Ireland

For QTIPOC Community Members:
- QTIPOC-specific services are limited in Northern Ireland
- National services like Black Minds Matter UK available
- UK Black Pride (London) accessible by plane
- Online communities and remote support options
- Belfast has a small but growing diverse community

Legal Context:
- Same-sex marriage legal since January 2020
- Abortion rights extended in 2020
- Equality Act 2010 does not fully apply in NI - separate legislation
- LGBTQ+ protections exist but some differences from rest of UK

Historical Note:
- Northern Ireland was last part of UK to legalize same-sex marriage
- Community has been resilient despite historical challenges
- Growing acceptance and visibility in recent years`,
        category: 'Community Support',
        journeyStages: ['stabilization', 'growth', 'community_healing'],
        location: ['belfast', 'unknown'],
        tags: ['Northern Ireland', 'Belfast', 'Derry', 'community', 'health'],
        sources: ['rainbow-project.org', 'cara-friend.org.uk', 'belfastpride.com'],
        lastUpdated: new Date('2025-01-15'),
        verificationStatus: 'verified',
        communityValidated: false
      }
    ]
  }
}

export const northernIrelandProvider = new NorthernIrelandProvider()
