/**
 * Scotland Resources
 * Black LGBTQ+ community resources for Glasgow, Edinburgh, Aberdeen, and across Scotland
 */

import { BaseRegionalProvider } from '../base.js'
import { UKResource, KnowledgeEntry, UKRegion } from '../types.js'

export class ScotlandProvider extends BaseRegionalProvider {
  region: UKRegion = 'scotland'

  getResources(): UKResource[] {
    return [
      // LGBT HEALTH AND WELLBEING SCOTLAND
      {
        id: 'lgbt-health-wellbeing-scotland',
        title: 'LGBT Health and Wellbeing',
        description: 'Scotland\'s national charity promoting the health, wellbeing and equality of LGBT people.',
        category: 'Health & Wellbeing',
        journeyStages: ['crisis', 'stabilization', 'growth', 'community_healing'],
        phone: '0300 123 2523',
        email: 'admin@lgbthealth.org.uk',
        website: 'https://www.lgbthealth.org.uk',
        locations: ['glasgow', 'unknown'],
        specializations: [
          'mental health support', 'helpline', 'counselling',
          'sexual health', 'trans support', 'community groups',
          'youth support', 'older adults support'
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
        availability: 'Helpline and various services across Scotland',
        languages: ['English']
      },

      // SCOTTISH TRANS ALLIANCE
      {
        id: 'scottish-trans-alliance',
        title: 'Scottish Trans Alliance',
        description: 'National alliance working to improve gender identity and gender reassignment equality, rights and inclusion in Scotland.',
        category: 'Trans Support',
        journeyStages: ['stabilization', 'growth', 'advocacy'],
        email: 'info@scottishtrans.org',
        website: 'https://www.scottishtrans.org',
        locations: ['unknown'],
        specializations: [
          'trans rights', 'policy advocacy', 'information resources',
          'signposting to services', 'non-binary support'
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
        availability: 'Online resources and advocacy',
        languages: ['English']
      },

      // GLASGOW LGBT CENTRE
      {
        id: 'glasgow-lgbt-centre',
        title: 'Glasgow LGBT Centre',
        description: 'Community centre providing support, social activities, and resources for LGBTQ+ people in Glasgow.',
        category: 'Community Centre',
        journeyStages: ['stabilization', 'growth', 'community_healing'],
        phone: '0141 552 4958',
        website: 'https://www.lgbtcentre.org.uk',
        locations: ['glasgow'],
        specializations: [
          'community space', 'support groups', 'social events',
          'youth groups', 'information and signposting'
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

      // WAVERLEY CARE (HIV)
      {
        id: 'waverley-care-scotland',
        title: 'Waverley Care',
        description: 'Scotland\'s leading HIV and hepatitis C charity providing support, prevention, and testing services.',
        category: 'HIV Support',
        journeyStages: ['crisis', 'stabilization', 'growth'],
        phone: '0131 556 9710',
        website: 'https://www.waverleycare.org',
        locations: ['glasgow', 'unknown'],
        specializations: [
          'HIV support', 'hepatitis C support', 'testing',
          'prevention', 'peer support', 'counselling'
        ],
        accessRequirements: ['none'],
        cost: 'free',
        culturalCompetency: {
          lgbtqSpecific: true,
          blackSpecific: false,
          transSpecific: false,
          disabilityAware: true
        },
        emergency: false,
        availability: 'Services across Scotland',
        languages: ['English']
      }
    ]
  }

  getKnowledgeEntries(): KnowledgeEntry[] {
    return [
      {
        id: 'scotland-lgbtq-resources',
        title: 'LGBTQ+ Resources in Scotland',
        content: `Scotland has its own distinct LGBTQ+ support infrastructure, separate from the rest of the UK.

National Scottish Services:
- LGBT Health and Wellbeing: 0300 123 2523 (national helpline)
- Scottish Trans Alliance: Trans rights and information
- Waverley Care: HIV and hepatitis C support across Scotland

Glasgow:
- Glasgow LGBT Centre: 0141 552 4958
- Community space with support groups and social events
- Pride Glasgow: Annual celebration

Edinburgh:
- Edinburgh Pride
- Various LGBTQ+ community groups
- Access to LGBT Health and Wellbeing services

Sexual Health in Scotland:
- PrEP available free through NHS Scotland sexual health clinics
- Sexual Health Scotland: www.sexualhealthscotland.co.uk
- Waverley Care for HIV support and testing

For QTIPOC Community Members:
- QTIPOC-specific services are developing in Scotland
- National services like Black Minds Matter UK available
- UK Black Pride (London) accessible by train/plane
- Online communities and remote support options
- LGBT Health and Wellbeing can signpost to BPOC resources

Legal Rights:
- Scotland has its own equality legislation and protections
- Same-sex marriage legal since 2014
- Strong anti-discrimination protections for LGBTQ+ people`,
        category: 'Community Support',
        journeyStages: ['stabilization', 'growth', 'community_healing'],
        location: ['glasgow', 'unknown'],
        tags: ['Scotland', 'Glasgow', 'Edinburgh', 'community', 'health'],
        sources: ['lgbthealth.org.uk', 'scottishtrans.org', 'waverleycare.org'],
        lastUpdated: new Date('2025-01-15'),
        verificationStatus: 'verified',
        communityValidated: false
      }
    ]
  }
}

export const scotlandProvider = new ScotlandProvider()
