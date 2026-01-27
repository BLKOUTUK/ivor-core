/**
 * Yorkshire and the Humber Region Resources
 * Black LGBTQ+ community resources for Leeds, Sheffield, Bradford, and surrounding areas
 */

import { BaseRegionalProvider } from '../base.js'
import { UKResource, KnowledgeEntry, UKRegion } from '../types.js'

export class YorkshireProvider extends BaseRegionalProvider {
  region: UKRegion = 'yorkshire'

  getResources(): UKResource[] {
    return [
      // AFRICAN RAINBOW FAMILY - LEEDS
      {
        id: 'africa-rainbow-family-leeds',
        title: 'African Rainbow Family - Leeds',
        description: 'Leeds branch supporting LGBTIQ+ people of African heritage and refugees/asylum seekers.',
        category: 'African LGBTQ+ Support',
        journeyStages: ['crisis', 'stabilization', 'growth', 'community_healing'],
        phone: '07711285567',
        email: 'info@africanrainbowfamily.org',
        website: 'https://africanrainbowfamily.org',
        locations: ['leeds'],
        specializations: [
          'African heritage LGBTIQ+ support', 'asylum seeker support',
          'refugee support', 'peer support network', 'counseling services',
          'advocacy', 'housing support', 'financial assistance'
        ],
        accessRequirements: ['LGBTIQ identifying', 'African heritage or asylum seeker/refugee'],
        cost: 'free',
        culturalCompetency: {
          lgbtqSpecific: true,
          blackSpecific: true,
          transSpecific: true,
          disabilityAware: false
        },
        emergency: false,
        availability: 'Contact for Leeds branch meetings',
        languages: ['English']
      },

      // LEEDS LGBT+ HUB
      {
        id: 'leeds-lgbt-hub',
        title: 'Leeds LGBT+ Hub',
        description: 'Community space for LGBTQ+ people in Leeds providing peer support, social events, and wellbeing services.',
        category: 'Community Support',
        journeyStages: ['stabilization', 'growth', 'community_healing'],
        website: 'https://www.leedslgbtplus.org.uk',
        locations: ['leeds'],
        specializations: [
          'community events', 'peer support', 'wellbeing services',
          'social activities', 'youth groups', 'older adults groups'
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
        availability: 'Various events and services throughout the week',
        languages: ['English']
      },

      // SHEFFIELD LGBTQ+ SERVICES
      {
        id: 'sah-sheffield',
        title: 'SAYiT Sheffield',
        description: 'Sheffield-based LGBTQ+ youth organization providing support, advocacy, and community services for young people.',
        category: 'Youth Support',
        journeyStages: ['stabilization', 'growth', 'community_healing'],
        website: 'https://www.sayit.org.uk',
        locations: ['sheffield'],
        specializations: [
          'LGBTQ+ youth support', 'counseling', 'peer support',
          'schools work', 'community groups', 'trans youth support'
        ],
        accessRequirements: ['age 13-25', 'LGBTQ+ identifying or questioning'],
        cost: 'free',
        culturalCompetency: {
          lgbtqSpecific: true,
          blackSpecific: false,
          transSpecific: true,
          disabilityAware: true
        },
        emergency: false,
        availability: 'Various youth groups and support services',
        languages: ['English']
      }
    ]
  }

  getKnowledgeEntries(): KnowledgeEntry[] {
    return [
      {
        id: 'yorkshire-lgbtq-resources',
        title: 'LGBTQ+ Resources in Yorkshire',
        content: `Yorkshire has growing LGBTQ+ support services across Leeds, Sheffield, and other cities in the region.

Leeds Resources:
- African Rainbow Family - Leeds branch
- Leeds LGBT+ Hub - community space and support services

Sheffield Resources:
- SAYiT Sheffield - LGBTQ+ youth support (ages 13-25)
- Various community groups and social events

Key Contacts:
- African Rainbow Family: 07711285567
- Leeds LGBT+ Hub: www.leedslgbtplus.org.uk
- SAYiT Sheffield: www.sayit.org.uk

For QTIPOC Community Members:
- African Rainbow Family provides culturally specific support for LGBTIQ+ people of African heritage
- Leeds and Sheffield both have active LGBTQ+ communities with regular events
- Contact local organizations for information about QTIPOC-specific programming`,
        category: 'Community Support',
        journeyStages: ['stabilization', 'growth', 'community_healing'],
        location: ['leeds', 'sheffield'],
        tags: ['Yorkshire', 'Leeds', 'Sheffield', 'community', 'LGBTQ+ support'],
        sources: ['africanrainbowfamily.org', 'leedslgbtplus.org.uk', 'sayit.org.uk'],
        lastUpdated: new Date('2025-01-15'),
        verificationStatus: 'verified',
        communityValidated: false
      }
    ]
  }
}

export const yorkshireProvider = new YorkshireProvider()
