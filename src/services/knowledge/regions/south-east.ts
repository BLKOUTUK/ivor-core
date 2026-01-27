/**
 * South East England Region Resources
 * Black LGBTQ+ community resources for Brighton, Southampton, Canterbury, and surrounding areas
 */

import { BaseRegionalProvider } from '../base.js'
import { UKResource, KnowledgeEntry, UKRegion } from '../types.js'

export class SouthEastProvider extends BaseRegionalProvider {
  region: UKRegion = 'south_east'

  getResources(): UKResource[] {
    return [
      // TERRENCE HIGGINS TRUST - BRIGHTON
      {
        id: 'terrence-higgins-trust-brighton',
        title: 'Terrence Higgins Trust - Brighton',
        description: 'HIV and sexual health charity services in Brighton',
        category: 'HIV Support',
        journeyStages: ['crisis', 'stabilization', 'growth'],
        phone: '0808 802 1221',
        website: 'https://tht.org.uk',
        locations: ['brighton'],
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

      // BRIGHTON & HOVE LGBT SWITCHBOARD
      {
        id: 'brighton-lgbt-switchboard',
        title: 'Brighton & Hove LGBT Switchboard',
        description: 'Local LGBTQ+ helpline and community services for Brighton and the surrounding area.',
        category: 'Community Support',
        journeyStages: ['crisis', 'stabilization', 'growth'],
        phone: '01273 234009',
        website: 'https://switchboard.org.uk',
        locations: ['brighton'],
        specializations: [
          'helpline', 'counselling', 'peer support', 'information',
          'hate crime reporting', 'community groups', 'trans support'
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
        availability: 'Helpline available, various services throughout the week',
        languages: ['English']
      },

      // ALLSORTS YOUTH PROJECT
      {
        id: 'allsorts-brighton',
        title: 'Allsorts Youth Project',
        description: 'LGBTU+ youth support service for children and young people up to 26 in Brighton & Hove and West Sussex.',
        category: 'Youth Support',
        journeyStages: ['stabilization', 'growth', 'community_healing'],
        phone: '01273 721211',
        email: 'info@allsortsyouth.org.uk',
        website: 'https://www.allsortsyouth.org.uk',
        locations: ['brighton'],
        specializations: [
          'LGBTQ+ youth', 'mental health support', 'peer groups',
          'counselling', 'trans youth support', 'family support',
          'schools outreach', 'young adults 18-26'
        ],
        accessRequirements: ['age up to 26', 'LGBTQ+ identifying or questioning'],
        cost: 'free',
        culturalCompetency: {
          lgbtqSpecific: true,
          blackSpecific: false,
          transSpecific: true,
          disabilityAware: true
        },
        emergency: false,
        availability: 'Various youth groups and support services throughout the week',
        languages: ['English']
      }
    ]
  }

  getKnowledgeEntries(): KnowledgeEntry[] {
    return [
      {
        id: 'brighton-lgbtq-community',
        title: 'LGBTQ+ Community in Brighton',
        content: `Brighton has one of the UK's largest and most visible LGBTQ+ communities, often called the "gay capital" of the UK.

Key Resources:
- Brighton & Hove LGBT Switchboard: 01273 234009
- Terrence Higgins Trust Brighton: 0808 802 1221
- Allsorts Youth Project: 01273 721211

Brighton Pride:
- One of the UK's largest Pride events
- Annual celebration in August
- Year-round community activities

Sexual Health Services:
- THT Brighton for HIV/sexual health testing
- Local GUM clinics with LGBTQ+-friendly services

For QTIPOC Community Members:
- While Brighton has a large LGBTQ+ community, QTIPOC-specific services are more limited
- UK Black Pride (London) is accessible by train
- National services like Black Minds Matter available
- Local LGBTQ+ organizations can signpost to BPOC resources`,
        category: 'Community Support',
        journeyStages: ['stabilization', 'growth', 'community_healing'],
        location: ['brighton'],
        tags: ['Brighton', 'South East', 'community', 'Pride', 'LGBTQ+'],
        sources: ['switchboard.org.uk', 'tht.org.uk', 'allsortsyouth.org.uk'],
        lastUpdated: new Date('2025-01-15'),
        verificationStatus: 'verified',
        communityValidated: false
      }
    ]
  }
}

export const southEastProvider = new SouthEastProvider()
