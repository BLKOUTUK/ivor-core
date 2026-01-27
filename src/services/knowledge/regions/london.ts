/**
 * London Region Resources
 * Black LGBTQ+ community resources specific to Greater London
 */

import { BaseRegionalProvider } from '../base.js'
import { UKResource, KnowledgeEntry, UKRegion } from '../types.js'

export class LondonProvider extends BaseRegionalProvider {
  region: UKRegion = 'london'

  getResources(): UKResource[] {
    return [
      // HIV SUPPORT
      {
        id: 'terrence-higgins-trust-london',
        title: 'Terrence Higgins Trust - London',
        description: 'Leading HIV and sexual health charity with specialist support in London',
        category: 'HIV Support',
        journeyStages: ['crisis', 'stabilization', 'growth'],
        phone: '0808 802 1221',
        website: 'https://tht.org.uk',
        locations: ['london'],
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

      // BLACK TRANS SUPPORT
      {
        id: 'black-trans-alliance',
        title: 'Black Trans Alliance',
        description: 'Black queer and trans-led nonprofit supporting Black trans and non-binary people through peer support, counseling, advocacy, and safe spaces. Free confidential services.',
        category: 'Trans Support',
        journeyStages: ['crisis', 'stabilization', 'growth', 'community_healing'],
        email: 'admin@blacktransalliance.org',
        website: 'https://www.blacktransalliance.org',
        locations: ['london', 'unknown'],
        specializations: [
          'Black trans support', 'non-binary support', 'peer-to-peer support',
          'trans counseling', 'mental health', 'gender identity exploration',
          'coming out support', 'gender-affirming care navigation', 'advocacy',
          'safe spaces', 'community ally program', 'legal support'
        ],
        accessRequirements: ['trans, non-binary, or questioning identity'],
        cost: 'free',
        culturalCompetency: {
          lgbtqSpecific: true,
          blackSpecific: true,
          transSpecific: true,
          disabilityAware: false
        },
        emergency: false,
        availability: 'Online peer support groups and one-to-one sessions, helpline available',
        languages: ['English']
      },

      // ASYLUM AND REFUGEE SUPPORT
      {
        id: 'rainbow-migration',
        title: 'Rainbow Migration',
        description: 'UK\'s leading LGBTQI+ asylum and immigration support organization. Provides free legal advice, emotional support, and advocacy.',
        category: 'Asylum & Immigration',
        journeyStages: ['crisis', 'stabilization', 'growth', 'advocacy'],
        phone: '0203 752 5801',
        email: 'hello@rainbowmigration.org.uk',
        website: 'https://www.rainbowmigration.org.uk',
        locations: ['london', 'unknown'],
        specializations: [
          'LGBTQI+ asylum claims', 'immigration legal advice', 'partner/spouse visas',
          'emotional support during asylum process', 'housing access support',
          'health services navigation', 'anti-detention campaigns', 'trans asylum support',
          'lawyer referrals', 'training for legal professionals'
        ],
        accessRequirements: ['LGBTQI+ identifying', 'seeking asylum or immigration support'],
        cost: 'free',
        culturalCompetency: {
          lgbtqSpecific: true,
          blackSpecific: true,
          transSpecific: true,
          disabilityAware: true
        },
        emergency: true,
        availability: 'Email and phone support, office in London',
        languages: ['English']
      },
      {
        id: 'out-and-proud-lgbti',
        title: 'Out and Proud African LGBTI (OPAL)',
        description: 'Grassroots organization by and for LGBTIQ refugees and asylum seekers from Africa. Weekly social events, legal workshops, and peer support.',
        category: 'African LGBTQ+ Asylum',
        journeyStages: ['crisis', 'stabilization', 'growth', 'community_healing'],
        phone: '+44 7537 968154',
        email: 'info@africanlgbti.org',
        website: 'https://africanlgbti.org',
        locations: ['london'],
        specializations: [
          'African LGBTQ+ asylum seekers', 'peer support', 'weekly socials',
          'legal workshops with lawyers', 'podcast storytelling platform',
          'creative socials (dance, music, art)', 'community building',
          'anti-persecution support', 'anti-detention advocacy'
        ],
        accessRequirements: ['LGBTIQ identifying', 'African heritage', 'asylum seeker or refugee status'],
        cost: 'free',
        culturalCompetency: {
          lgbtqSpecific: true,
          blackSpecific: true,
          transSpecific: true,
          disabilityAware: false
        },
        emergency: false,
        availability: 'Saturday Socials 5-10pm at G-A-Y Pub, monthly asylum meetings last Saturday 1-4pm at 56 Dean Street',
        languages: ['English']
      },
      {
        id: 'africa-rainbow-family-london',
        title: 'African Rainbow Family - London',
        description: 'London branch supporting LGBTIQ+ people of African heritage and refugees/asylum seekers.',
        category: 'African LGBTQ+ Support',
        journeyStages: ['crisis', 'stabilization', 'growth', 'community_healing'],
        phone: '07711285567',
        email: 'info@africanrainbowfamily.org',
        website: 'https://africanrainbowfamily.org',
        locations: ['london'],
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
        availability: 'Contact for London branch meetings',
        languages: ['English']
      },

      // COMMUNITY EVENTS
      {
        id: 'uk-black-pride',
        title: 'UK Black Pride',
        description: 'Community events and support for LGBTQ+ people of African, Asian, Caribbean, Middle Eastern and Latin American descent',
        category: 'Community Events',
        journeyStages: ['growth', 'community_healing', 'advocacy'],
        website: 'https://ukblackpride.org.uk',
        locations: ['london'],
        specializations: ['community building', 'events', 'pride', 'cultural celebration'],
        accessRequirements: ['none'],
        cost: 'free',
        culturalCompetency: {
          lgbtqSpecific: true,
          blackSpecific: true,
          transSpecific: true,
          disabilityAware: true
        },
        emergency: false,
        availability: 'annual events and year-round activities',
        languages: ['English']
      },

      // COMMUNITY CENTRE
      {
        id: 'london-lgbtq-centre',
        title: 'London LGBTQ+ Community Centre',
        description: 'Sober, intersectional community centre and café providing wellbeing support, workshops, and community programming including Melanin Vybz for LGBTQ+ BPOC over 50',
        category: 'Community Centre',
        journeyStages: ['stabilization', 'growth', 'community_healing'],
        email: 'hello@londonlgbtqcentre.org',
        website: 'https://londonlgbtqcentre.org',
        locations: ['london'],
        specializations: [
          'mental health support', 'wellbeing sessions', 'older adults 50+',
          'BPOC community groups', 'creative workshops', 'sober spaces',
          'community café', 'signposting services', 'therapy', 'health outreach'
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
        availability: 'Wed-Sun 12pm-8pm (Wed opens 9:30am, closed Mon-Tue for bookings)',
        languages: ['English']
      },

      // OLDER ADULTS HOUSING
      {
        id: 'tonic-housing-london',
        title: 'Tonic Housing - London',
        description: 'UK\'s first LGBTQ+ affirming retirement housing provider. Creates vibrant, inclusive retirement communities for LGBTQ+ older adults.',
        category: 'Older Adults Housing',
        journeyStages: ['growth', 'community_healing'],
        phone: '0207 971 1091',
        email: 'info@tonichousing.org.uk',
        website: 'https://www.tonichousing.org.uk',
        locations: ['london'],
        specializations: [
          'LGBTQ+ retirement housing', 'older adults 55+', 'shared ownership',
          'affordable housing', 'social housing', 'community living',
          'anti-isolation support', 'culturally affirming services'
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
        availability: 'Tonic@Bankhouse in Vauxhall',
        languages: ['English']
      }
    ]
  }

  getKnowledgeEntries(): KnowledgeEntry[] {
    return [
      {
        id: 'black-trans-support-uk',
        title: 'Support for Black Trans and Non-Binary People in the UK',
        content: `Black trans and non-binary people face compounded discrimination at the intersection of transphobia and racism. Finding affirming, culturally competent support is critical for wellbeing and survival.

The Reality for Black Trans People:
- 41% of trans people have experienced hate crimes
- Black trans women face highest rates of violence and murder globally
- NHS Gender Identity Clinics have 2-5 year waiting lists

Black Trans Alliance - Community-Led Support:
- Founded 2020 by Black queer and trans leaders
- Based in London, serves wider UK community
- FREE confidential services

What Black Trans Alliance offers:
- Peer-to-peer support (one-to-one and closed groups)
- Trans counseling with identity-affirming therapists
- Mental health support for anxiety, depression
- Gender identity exploration support
- Help accessing gender-affirming care
- Advocacy and legal support

How to access:
- Email: admin@blacktransalliance.org
- Website: blacktransalliance.org/peer-to-peer-support
- Free of charge, confidential and non-judgmental`,
        category: 'Trans Support',
        journeyStages: ['crisis', 'stabilization', 'growth', 'community_healing', 'advocacy'],
        location: ['london', 'unknown'],
        tags: ['trans', 'non-binary', 'Black trans', 'transgender', 'gender identity', 'Black Trans Alliance'],
        sources: ['blacktransalliance.org', 'Stonewall', 'NHS', 'Galop'],
        lastUpdated: new Date('2025-01-15'),
        verificationStatus: 'verified',
        communityValidated: false
      },
      {
        id: 'london-lgbtq-centre-community',
        title: 'Community Spaces and Support for LGBTQ+ BPOC in London',
        content: `The London LGBTQ+ Community Centre offers a welcoming, sober, intersectional space for all LGBTQ+ people with specific programming for Black people and people of colour.

Location:
- 60-62 Hopton Street, Blackfriars, London SE1 9JH
- Near Blackfriars Station
- Open Wed-Sun 12pm-8pm (Wednesday opens 9:30am)

Programs for BPOC community:
- Melanin Vybz: Monthly meetup for LGBTQ+ Black people and people of colour over 50 (organized by Opening Doors)
- Titan Trims: QTPOC barber service (every two weeks)
- LGBTQ+ Health Outreach Drop-in with mini health checks

Mental health services:
- E.H. Counselling: LGBTQIA+ and polyamory-focused therapy
- NA Queer to Stay: Weekly Narcotics Anonymous meetings (Wednesdays 7-8pm)

How to access:
- Just drop in during opening hours - no referral needed
- Email: hello@londonlgbtqcentre.org
- Website: londonlgbtqcentre.org`,
        category: 'Community Support',
        journeyStages: ['stabilization', 'growth', 'community_healing'],
        location: ['london'],
        tags: ['community centre', 'BPOC', 'older adults', 'mental health', 'sober space', 'Melanin Vybz'],
        sources: ['londonlgbtqcentre.org', 'Opening Doors London'],
        lastUpdated: new Date('2025-01-15'),
        verificationStatus: 'verified',
        communityValidated: false
      },
      {
        id: 'lgbtq-asylum-refugee-support-uk',
        title: 'LGBTQ+ Asylum and Refugee Support in the UK',
        content: `LGBTQ+ people fleeing persecution face life-threatening situations and need specialized support navigating the UK asylum system.

Key Organizations in London:

Rainbow Migration:
- Phone: 0203 752 5801
- Email: hello@rainbowmigration.org.uk
- Address: 7-14 Great Dover St, London SE1 4YR
- FREE legal advice on asylum claims

Out and Proud African LGBTI (OPAL):
- Phone: +44 7537 968154
- Saturday Socials 5-10pm at G-A-Y Pub
- Monthly Asylum Support Meetings (last Saturday of month)
- Address: 198 Railton Road, London SE24 0JT

Emergency Contacts:
- Rainbow Migration: 0203 752 5801 (legal advice)
- OPAL: +44 7537 968154 (peer support)
- If detained: BID (Bail for Immigration Detainees)`,
        category: 'Asylum & Immigration',
        journeyStages: ['crisis', 'stabilization', 'growth', 'advocacy'],
        location: ['london'],
        tags: ['asylum', 'refugee', 'immigration', 'Rainbow Migration', 'OPAL', 'African LGBTQ+'],
        sources: ['rainbowmigration.org.uk', 'africanlgbti.org'],
        lastUpdated: new Date('2025-01-15'),
        verificationStatus: 'verified',
        communityValidated: false
      },
      {
        id: 'lgbtq-older-adults-housing-support',
        title: 'Housing and Community Support for LGBTQ+ Older Adults',
        content: `LGBTQ+ older adults face unique challenges including isolation, discrimination in care settings, and lack of affirming housing options.

Tonic Housing - LGBTQ+ Affirming Retirement:
- UK's first LGBTQ+ affirming retirement housing provider (est. 2014)
- Tonic@Bankhouse: 84 apartments in Vauxhall, London with Thames views
- Phone: 0207 971 1091
- Email: info@tonichousing.org.uk

Free Community Support for Older LGBTQ+ BPOC:
- Melanin Vybz at London LGBTQ+ Community Centre
- Monthly meetup for LGBTQ+ Black people and people of colour over 50
- 60-62 Hopton Street, Blackfriars, London
- Organized by Opening Doors London

Other resources:
- Opening Doors London: Social groups for LGBT+ people over 50
- Age UK: General support for older people`,
        category: 'Older Adults',
        journeyStages: ['growth', 'community_healing'],
        location: ['london'],
        tags: ['older adults', 'retirement', 'housing', 'Tonic Housing', 'Melanin Vybz', 'isolation'],
        sources: ['tonichousing.org.uk', 'Opening Doors London', 'Age UK'],
        lastUpdated: new Date('2025-01-15'),
        verificationStatus: 'verified',
        communityValidated: false
      }
    ]
  }
}

export const londonProvider = new LondonProvider()
