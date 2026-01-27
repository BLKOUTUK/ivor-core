/**
 * North West England Region Resources
 * Black LGBTQ+ community resources for Manchester, Liverpool, and surrounding areas
 */

import { BaseRegionalProvider } from '../base.js'
import { UKResource, KnowledgeEntry, UKRegion } from '../types.js'

export class NorthWestProvider extends BaseRegionalProvider {
  region: UKRegion = 'north_west'

  getResources(): UKResource[] {
    return [
      // LGBT FOUNDATION - MAIN RESOURCE
      {
        id: 'lgbt-foundation',
        title: 'LGBT Foundation',
        description: 'National LGBTQ+ health and wellbeing charity based in Manchester. Comprehensive services including sexual health testing, talking therapies, domestic abuse support, trans advocacy, and QTIPOC programs.',
        category: 'Health & Wellbeing',
        journeyStages: ['crisis', 'stabilization', 'growth', 'community_healing'],
        phone: '0345 3 30 30 30',
        email: 'groups@lgbt.foundation',
        website: 'https://lgbt.foundation',
        locations: ['manchester', 'liverpool', 'unknown'],
        specializations: [
          'sexual health testing', 'talking therapies', 'domestic abuse support',
          'sexual violence support', 'trans advocacy', 'QTIPOC programs',
          'recovery programmes', 'Pride in Ageing (over 50s)', 'veterans support',
          'smoking cessation', 'mental health', 'community safety', 'helpline support'
        ],
        accessRequirements: ['none'],
        cost: 'free',
        culturalCompetency: {
          lgbtqSpecific: true,
          blackSpecific: true,
          transSpecific: true,
          disabilityAware: true
        },
        emergency: false,
        availability: 'Helpline available, office at 72 Sackville Street Manchester, services in Liverpool',
        languages: ['English']
      },

      // AFRICAN RAINBOW FAMILY - MANCHESTER
      {
        id: 'africa-rainbow-family-manchester',
        title: 'African Rainbow Family - Manchester',
        description: 'Manchester headquarters of national network supporting LGBTIQ+ people of African heritage and LGBTIQ+ refugees/asylum seekers.',
        category: 'African LGBTQ+ Support',
        journeyStages: ['crisis', 'stabilization', 'growth', 'community_healing'],
        phone: '07711285567',
        email: 'info@africanrainbowfamily.org',
        website: 'https://africanrainbowfamily.org',
        locations: ['manchester'],
        specializations: [
          'African heritage LGBTIQ+ support', 'asylum seeker support',
          'refugee support', 'peer support network', 'counseling services',
          'advocacy', 'housing support', 'financial assistance',
          'training and guidance', 'navigating asylum system', 'community empowerment'
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
        availability: 'Office at The Monastery, 89 Gorton Lane, Manchester M12 5WF',
        languages: ['English']
      },

      // TONIC HOUSING - MANCHESTER EXPANSION
      {
        id: 'tonic-housing-manchester',
        title: 'Tonic Housing - Manchester',
        description: 'LGBTQ+ affirming retirement housing provider expanding to Manchester.',
        category: 'Older Adults Housing',
        journeyStages: ['growth', 'community_healing'],
        phone: '0207 971 1091',
        email: 'info@tonichousing.org.uk',
        website: 'https://www.tonichousing.org.uk',
        locations: ['manchester'],
        specializations: [
          'LGBTQ+ retirement housing', 'older adults 55+', 'shared ownership',
          'affordable housing', 'community living', 'anti-isolation support'
        ],
        accessRequirements: ['LGBTQ+ identifying', 'older adult (typically 55+)'],
        cost: 'paid',
        culturalCompetency: {
          lgbtqSpecific: true,
          blackSpecific: false,
          transSpecific: true,
          disabilityAware: true
        },
        emergency: false,
        availability: 'Expanding from London to Manchester',
        languages: ['English']
      },

      // TERRENCE HIGGINS TRUST - MANCHESTER
      {
        id: 'terrence-higgins-trust-manchester',
        title: 'Terrence Higgins Trust - Manchester',
        description: 'HIV and sexual health charity services in Manchester',
        category: 'HIV Support',
        journeyStages: ['crisis', 'stabilization', 'growth'],
        phone: '0808 802 1221',
        website: 'https://tht.org.uk',
        locations: ['manchester'],
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
      }
    ]
  }

  getKnowledgeEntries(): KnowledgeEntry[] {
    return [
      {
        id: 'lgbt-foundation-manchester',
        title: 'LGBT Foundation Manchester - Comprehensive LGBTQ+ Health and Support Services',
        content: `LGBT Foundation is a national charity based in Manchester with LGBTQ+ health and wellbeing at the heart of everything they do.

Overview:
- Based at Fairbairn House, 72 Sackville Street, Manchester M1 3NJ
- Also operates services in Liverpool
- Helpline: 0345 3 30 30 30
- All services free and confidential

Sexual Health Services:
- Free sexual health testing (clinic-based and home delivery)
- PrEP advice and support
- HIV support and testing

Mental Health and Wellbeing:
- Talking therapies and counseling
- Life admin and co-working support group (Wednesdays 12-2pm)
- Recovery programs for substance misuse

Trans-Specific Support:
- Trans Advocacy Service
- Support navigating healthcare systems
- Trans and non-binary support groups

QTIPOC (Queer, Trans, Intersex People of Colour) Programs:
- Developing dedicated QTIPOC programme with paid staff lead
- QTIPOC support groups for safe space and peer support
- Part of Greater Manchester LGBTQ+ Equality Panel

Support Groups:
- Recovery groups (Tuesdays 6pm at Manchester office)
- Liverpool LGBTQ+ wellbeing groups
- Pride in Ageing social groups (over 50s)

Contact:
- Helpline: 0345 3 30 30 30
- Groups Email: groups@lgbt.foundation
- Address: Fairbairn House (2nd Floor), 72 Sackville Street, Manchester M1 3NJ`,
        category: 'Health Services',
        journeyStages: ['crisis', 'stabilization', 'growth', 'community_healing'],
        location: ['manchester', 'liverpool', 'unknown'],
        tags: ['LGBT Foundation', 'Manchester', 'sexual health', 'mental health', 'talking therapies', 'trans support', 'QTIPOC'],
        sources: ['lgbt.foundation', 'Manchester Pride', 'Greater Manchester LGBTQ+ Equality Panel'],
        lastUpdated: new Date('2025-01-15'),
        verificationStatus: 'verified',
        communityValidated: false
      },
      {
        id: 'manchester-qtipoc-ecosystem',
        title: 'Manchester QTIPOC Community Ecosystem',
        content: `Manchester has a growing network of organizations serving QTIPOC (Queer, Trans, Intersex People of Colour) communities.

LGBT Foundation QTIPOC Programs:
- Developing dedicated QTIPOC programme with paid staff lead
- QTIPOC support groups for safe space and peer support
- Collaboration with Rainbow Noir and other organizations

African Rainbow Family - Manchester HQ:
- The Monastery, 89 Gorton Lane, Manchester M12 5WF
- Phone: 07711285567
- National network (500+ members) with Manchester headquarters

Rainbow Noir:
- Social group for LGBTQI+ people of colour in Manchester
- Regular events and community gatherings

Greater Manchester LGBTQ+ Equality Panel:
- Part of regional strategy centering marginalized communities
- LGBT Foundation participates actively

Manchester Pride's Impact Fund:
- Supports QTIPOC organizations
- Annual funding for community projects`,
        category: 'Community Support',
        journeyStages: ['growth', 'community_healing'],
        location: ['manchester'],
        tags: ['QTIPOC', 'Manchester', 'community', 'Rainbow Noir', 'African Rainbow Family'],
        sources: ['lgbt.foundation', 'africanrainbowfamily.org', 'Manchester Pride'],
        lastUpdated: new Date('2025-01-15'),
        verificationStatus: 'verified',
        communityValidated: false
      }
    ]
  }
}

export const northWestProvider = new NorthWestProvider()
