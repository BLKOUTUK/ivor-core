/**
 * West Midlands Region Resources
 * Black LGBTQ+ community resources for Birmingham, Coventry, and surrounding areas
 */

import { BaseRegionalProvider } from '../base.js'
import { UKResource, KnowledgeEntry, UKRegion } from '../types.js'

export class WestMidlandsProvider extends BaseRegionalProvider {
  region: UKRegion = 'west_midlands'

  getResources(): UKResource[] {
    return [
      // UNMUTED BIRMINGHAM
      {
        id: 'unmuted-birmingham',
        title: 'UNMUTED Birmingham',
        description: 'Raising voices and representation of LGBTQI+ people of colour in Birmingham and West Midlands. Provides safe spaces for QTIPOC to connect, grow, and explore identity.',
        category: 'QTIPOC Community',
        journeyStages: ['stabilization', 'growth', 'community_healing', 'advocacy'],
        email: 'contactunmuted@gmail.com',
        website: 'https://www.unmutedbrum.com',
        locations: ['birmingham'],
        specializations: [
          'QTIPOC community', 'people of colour support', 'social groups',
          'peer support', 'identity exploration', 'safe spaces',
          'educational programs', 'family support', 'sexual health',
          'housing advice', 'faith and sexuality', 'workplace rights',
          'community organizing', 'book clubs', 'monthly meet-ups'
        ],
        accessRequirements: ['QTIPOC identifying (Queer, Trans, Intersex People of Colour)'],
        cost: 'free',
        culturalCompetency: {
          lgbtqSpecific: true,
          blackSpecific: true,
          transSpecific: true,
          disabilityAware: false
        },
        emergency: false,
        availability: 'Regular monthly meet-ups and events, community-led programming',
        languages: ['English']
      },

      // AFRICAN RAINBOW FAMILY - BIRMINGHAM
      {
        id: 'africa-rainbow-family-birmingham',
        title: 'African Rainbow Family - Birmingham',
        description: 'Birmingham branch supporting LGBTIQ+ people of African heritage and refugees/asylum seekers.',
        category: 'African LGBTQ+ Support',
        journeyStages: ['crisis', 'stabilization', 'growth', 'community_healing'],
        phone: '07711285567',
        email: 'info@africanrainbowfamily.org',
        website: 'https://africanrainbowfamily.org',
        locations: ['birmingham'],
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
        availability: 'Contact for Birmingham branch meetings',
        languages: ['English']
      },

      // TERRENCE HIGGINS TRUST - BIRMINGHAM
      {
        id: 'terrence-higgins-trust-birmingham',
        title: 'Terrence Higgins Trust - Birmingham',
        description: 'HIV and sexual health charity services in Birmingham',
        category: 'HIV Support',
        journeyStages: ['crisis', 'stabilization', 'growth'],
        phone: '0808 802 1221',
        website: 'https://tht.org.uk',
        locations: ['birmingham'],
        specializations: ['HIV', 'sexual health', 'testing', 'support groups'],
        accessRequirements: ['none'],
        cost: 'free',
        culturalCompetency: {
          lgbtqSpecific: true,
          blackSpecific: false,
          transSpecific: false,
          disabilityAware: true
        },
        emergency: false,
        availability: 'Mon-Fri 10am-8pm',
        languages: ['English']
      },

      // BIRMINGHAM LGBT
      {
        id: 'birmingham-lgbt',
        title: 'Birmingham LGBT',
        description: 'Birmingham\'s main LGBTQ+ community organization providing support, advocacy, and social events.',
        category: 'Community Support',
        journeyStages: ['stabilization', 'growth', 'community_healing'],
        website: 'https://blgbt.org',
        locations: ['birmingham'],
        specializations: [
          'community events', 'support groups', 'advocacy',
          'social activities', 'information and signposting'
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
      }
    ]
  }

  getKnowledgeEntries(): KnowledgeEntry[] {
    return [
      {
        id: 'qtipoc-community-birmingham',
        title: 'QTIPOC Community Support in Birmingham and the West Midlands',
        content: `UNMUTED Birmingham exists to raise the voices and representation of LGBTQI+ people of colour in Birmingham and the West Midlands.

The Need for QTIPOC-Specific Support:
- Black and minoritized LGBTQ+ people face double discrimination
- Often feel isolated from both LGBTQ+ spaces (due to racism) and communities of colour (due to homophobia/transphobia)
- Need for culturally affirming spaces that understand intersectional identities

What UNMUTED Offers:
- QTIPOC-only safe spaces for connection and exploration
- Regular monthly meet-ups in Birmingham
- Social groups led by community members with experienced facilitators
- Educational programs addressing community-identified needs
- Book clubs (reading works by QTIPOC authors)

Topics Covered:
- Family relationships and acceptance
- Sexual health and wellbeing
- Housing advice and support
- Faith and sexuality/gender identity
- Rights within the workplace
- Identity exploration and coming out

How to Access:
- Email: contactunmuted@gmail.com
- Website: www.unmutedbrum.com
- Based in Birmingham, West Midlands
- All services free

Why QTIPOC-Only Spaces Matter:
- Freedom to be fully yourself without code-switching
- Shared lived experiences of racism + homophobia/transphobia
- Build solidarity and mutual support
- Celebrate both cultural heritage and LGBTQ+ identity

Related Organizations:
- Birmingham LGBT (Birmingham's main LGBTQ+ center)
- UK Black Pride (London-based, annual event)
- Colours Youth Network (youth-focused QTIPOC)`,
        category: 'QTIPOC Support',
        journeyStages: ['stabilization', 'growth', 'community_healing', 'advocacy'],
        location: ['birmingham'],
        tags: ['QTIPOC', 'people of colour', 'Birmingham', 'West Midlands', 'community', 'safe spaces', 'UNMUTED'],
        sources: ['unmutedbrum.com', 'Birmingham LGBT'],
        lastUpdated: new Date('2025-01-15'),
        verificationStatus: 'verified',
        communityValidated: false
      }
    ]
  }
}

export const westMidlandsProvider = new WestMidlandsProvider()
