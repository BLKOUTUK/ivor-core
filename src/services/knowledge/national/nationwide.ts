/**
 * Nationwide UK Resources
 * Resources available across the entire UK
 */

import { BaseRegionalProvider } from '../base.js'
import { UKResource, KnowledgeEntry, UKRegion } from '../types.js'

export class NationwideProvider extends BaseRegionalProvider {
  region: UKRegion = 'nationwide'

  getResources(): UKResource[] {
    return [
      // EMERGENCY CRISIS RESOURCES
      {
        id: 'samaritans',
        title: 'Samaritans',
        description: '24/7 emotional support for anyone in crisis',
        category: 'Crisis Support',
        journeyStages: ['crisis'],
        phone: '116 123',
        website: 'https://samaritans.org',
        locations: ['unknown'],
        specializations: ['suicide prevention', 'crisis support', 'emotional support'],
        accessRequirements: ['none'],
        cost: 'free',
        culturalCompetency: {
          lgbtqSpecific: false,
          blackSpecific: false,
          transSpecific: false,
          disabilityAware: true
        },
        emergency: true,
        availability: '24/7',
        languages: ['English', 'Welsh']
      },
      {
        id: 'trevor-project-uk',
        title: 'The Trevor Project UK',
        description: 'Crisis intervention for LGBTQ+ young people',
        category: 'LGBTQ+ Crisis Support',
        journeyStages: ['crisis'],
        phone: '1-866-488-7386',
        website: 'https://thetrevorproject.org/get-help-now/',
        locations: ['unknown'],
        specializations: ['LGBTQ+ youth', 'suicide prevention', 'crisis intervention'],
        accessRequirements: ['age under 25'],
        cost: 'free',
        culturalCompetency: {
          lgbtqSpecific: true,
          blackSpecific: false,
          transSpecific: true,
          disabilityAware: true
        },
        emergency: true,
        availability: '24/7',
        languages: ['English']
      },
      {
        id: 'lgbt-switchboard',
        title: 'LGBT+ Switchboard',
        description: 'Support and information for LGBT+ people',
        category: 'LGBTQ+ Support',
        journeyStages: ['crisis', 'stabilization', 'growth'],
        phone: '0300 330 0630',
        website: 'https://switchboard.lgbt',
        locations: ['unknown'],
        specializations: ['LGBT+ support', 'information', 'referrals'],
        accessRequirements: ['none'],
        cost: 'free',
        culturalCompetency: {
          lgbtqSpecific: true,
          blackSpecific: false,
          transSpecific: true,
          disabilityAware: true
        },
        emergency: false,
        availability: '10am-10pm daily',
        languages: ['English']
      },

      // NHS MENTAL HEALTH SERVICES
      {
        id: 'nhs-iapt',
        title: 'NHS IAPT (Improving Access to Psychological Therapies)',
        description: 'Free NHS therapy for anxiety and depression - self-referral available',
        category: 'Mental Health',
        journeyStages: ['stabilization', 'growth'],
        website: 'https://www.nhs.uk/service-search/find-a-psychological-therapies-service/',
        locations: ['unknown'],
        specializations: ['anxiety', 'depression', 'PTSD', 'therapy'],
        accessRequirements: ['NHS registration', 'GP referral or self-referral'],
        cost: 'nhs_funded',
        culturalCompetency: {
          lgbtqSpecific: false,
          blackSpecific: false,
          transSpecific: false,
          disabilityAware: true
        },
        emergency: false,
        availability: 'weekdays 9-5',
        languages: ['English', 'interpreters available']
      },

      // HIV/SEXUAL HEALTH RESOURCES
      {
        id: 'menrus-platform',
        title: 'menrus.co.uk',
        description: 'Comprehensive sexual health platform for Black queer men',
        category: 'Sexual Health',
        journeyStages: ['crisis', 'stabilization', 'growth', 'community_healing'],
        website: 'https://menrus.co.uk',
        locations: ['unknown'],
        specializations: ['HIV', 'PrEP', 'PEP', 'sexual health', 'Black gay men'],
        accessRequirements: ['none'],
        cost: 'free',
        culturalCompetency: {
          lgbtqSpecific: true,
          blackSpecific: true,
          transSpecific: false,
          disabilityAware: false
        },
        emergency: false,
        availability: '24/7 online',
        languages: ['English']
      },

      // HOUSING SUPPORT
      {
        id: 'shelter-housing',
        title: 'Shelter',
        description: 'Emergency housing advice and support',
        category: 'Housing',
        journeyStages: ['crisis', 'stabilization'],
        phone: '0808 800 4444',
        website: 'https://shelter.org.uk',
        locations: ['unknown'],
        specializations: ['housing', 'eviction', 'homelessness', 'legal advice'],
        accessRequirements: ['none'],
        cost: 'free',
        culturalCompetency: {
          lgbtqSpecific: false,
          blackSpecific: false,
          transSpecific: false,
          disabilityAware: true
        },
        emergency: true,
        availability: '8am-8pm weekdays, 8am-5pm weekends',
        languages: ['English', 'Welsh']
      },
      {
        id: 'stonewall-housing',
        title: 'Stonewall Housing',
        description: 'Leading national LGBTQ+ housing charity providing specialist housing advice, advocacy and support. Helped over 45,000 LGBTQ+ people since 1983.',
        category: 'Housing Support',
        journeyStages: ['crisis', 'stabilization', 'growth'],
        phone: '0800 6 404 404',
        email: 'info@stonewallhousing.org',
        website: 'https://stonewallhousing.org',
        locations: ['london', 'unknown'],
        specializations: [
          'housing advice', 'domestic abuse support', 'mental health advocacy',
          'substance misuse support', 'supported accommodation', 'housing advocacy',
          'domestic abuse resettlement', 'BAME LGBTQ+ empowerment', 'trauma-informed support'
        ],
        accessRequirements: ['LGBTQ+ identifying', 'experiencing housing issues or homelessness risk'],
        cost: 'free',
        culturalCompetency: {
          lgbtqSpecific: true,
          blackSpecific: true,
          transSpecific: true,
          disabilityAware: true
        },
        emergency: false,
        availability: 'Helpline Mon-Fri 10am-1pm, national coverage',
        languages: ['English']
      },

      // YOUTH HOUSING
      {
        id: 'akt-youth-housing',
        title: 'akt (Albert Kennedy Trust)',
        description: 'National LGBTQ+ youth homelessness charity supporting young people aged 16-25 at risk of or experiencing homelessness. 47% of youth supported are Black, Brown, or People of Colour.',
        category: 'Youth Housing',
        journeyStages: ['crisis', 'stabilization', 'growth'],
        phone: '020 7831 6562',
        email: 'contact@akt.org.uk',
        website: 'https://www.akt.org.uk',
        locations: ['london', 'manchester', 'bristol', 'other_urban', 'unknown'],
        specializations: [
          'youth homelessness', 'LGBTQ+ youth 16-25', 'emergency accommodation',
          'housing support', 'caseworker support', 'mental health support',
          'financial advice', 'identity and cultural guidance', 'employment and training', 'QTIPOC resources'
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
        availability: 'online chat and phone support, offices in 4 cities',
        languages: ['English']
      },

      // BLACK-SPECIFIC MENTAL HEALTH
      {
        id: 'black-minds-matter',
        title: 'Black Minds Matter UK',
        description: 'National charity providing free 1-to-1 talking therapy with qualified, accredited Black therapists for Black individuals and families.',
        category: 'Mental Health',
        journeyStages: ['crisis', 'stabilization', 'growth', 'community_healing'],
        website: 'https://www.blackmindsmatteruk.com',
        locations: ['unknown'],
        specializations: [
          'free talking therapy', 'Black therapists', 'culturally appropriate mental health support',
          'anxiety support', 'depression support', 'trauma therapy', 'PTSD support',
          'family therapy', 'individual counseling', 'culturally competent care',
          'mental health education', 'systems change advocacy', 'LGBTQ+ affirming therapy'
        ],
        accessRequirements: ['Black individuals and families'],
        cost: 'free',
        culturalCompetency: {
          lgbtqSpecific: false,
          blackSpecific: true,
          transSpecific: false,
          disabilityAware: false
        },
        emergency: false,
        availability: 'Online referral form, waitlist-based matching to therapist',
        languages: ['English']
      }
    ]
  }

  getKnowledgeEntries(): KnowledgeEntry[] {
    return [
      {
        id: 'hiv-treatment-uk',
        title: 'HIV Treatment in the UK',
        content: `HIV treatment in the UK is free through the NHS and highly effective. Modern antiretroviral therapy (ART) can make HIV undetectable and untransmittable (U=U).

Key facts:
- Treatment is free on NHS regardless of immigration status
- Most people start treatment immediately after diagnosis
- Modern medications have fewer side effects
- Regular monitoring every 3-6 months
- Undetectable viral load means HIV cannot be transmitted sexually

Getting treatment:
- Diagnosed at GUM clinic or GP - automatic referral to specialist
- HIV clinics in all major hospitals
- Specialist nurses provide ongoing support
- Treatment typically starts within 2 weeks of diagnosis`,
        category: 'HIV Health',
        journeyStages: ['crisis', 'stabilization', 'growth'],
        location: ['unknown'],
        tags: ['HIV', 'treatment', 'NHS', 'antiretroviral', 'U=U'],
        sources: ['NHS.uk', 'menrus.co.uk', 'Terrence Higgins Trust'],
        lastUpdated: new Date('2024-01-15'),
        verificationStatus: 'verified',
        communityValidated: true
      },
      {
        id: 'prep-access-uk',
        title: 'PrEP Access in the UK',
        content: `Pre-exposure prophylaxis (PrEP) prevents HIV infection and is available free on the NHS in England, Wales, Scotland and Northern Ireland.

NHS PrEP:
- Free prescription through GUM clinics
- Regular monitoring required (every 3 months)
- Available to anyone at high risk of HIV
- No restrictions based on sexuality or identity

Getting PrEP:
- Contact local GUM/sexual health clinic
- Online booking available in most areas
- Private prescriptions available (£30-50/month)
- Generic versions significantly cheaper than branded

Who can get PrEP:
- Men who have sex with men
- Trans people at risk
- Anyone with HIV+ partner not on effective treatment
- People who inject drugs
- Sex workers`,
        category: 'HIV Prevention',
        journeyStages: ['growth', 'stabilization'],
        location: ['unknown'],
        tags: ['PrEP', 'prevention', 'NHS', 'sexual health'],
        sources: ['NHS.uk', 'menrus.co.uk'],
        lastUpdated: new Date('2024-02-01'),
        verificationStatus: 'verified',
        communityValidated: true
      },
      {
        id: 'nhs-mental-health-access',
        title: 'Accessing NHS Mental Health Services',
        content: `Mental health support through the NHS is free and available to everyone registered with a GP.

Self-referral options:
- IAPT (Improving Access to Psychological Therapies) - anxiety/depression
- Crisis teams - for mental health emergencies
- Community mental health teams - ongoing support

How to access:
1. Self-refer online to local IAPT service
2. Contact GP for referral to specialist services
3. Call 111 for urgent but non-emergency support
4. A&E or 999 for mental health emergencies

What's available:
- Counselling and therapy (CBT, counselling)
- Medication through GP
- Support groups
- Crisis intervention
- Inpatient treatment if needed

Waiting times:
- IAPT: typically 2-8 weeks
- Specialist services: 4-18 weeks depending on area
- Crisis support: immediate`,
        category: 'Mental Health',
        journeyStages: ['crisis', 'stabilization', 'growth'],
        location: ['unknown'],
        tags: ['NHS', 'mental health', 'therapy', 'IAPT', 'counselling'],
        sources: ['NHS.uk', 'Mind.org.uk'],
        lastUpdated: new Date('2024-01-20'),
        verificationStatus: 'verified',
        communityValidated: true
      },
      {
        id: 'uk-discrimination-law',
        title: 'UK Discrimination Law and LGBTQ+ Rights',
        content: `The Equality Act 2010 protects LGBTQ+ people from discrimination in employment, services, and public functions.

Protected characteristics:
- Sexual orientation
- Gender reassignment (trans protection)
- Marriage and civil partnership

What's covered:
- Employment discrimination
- Service discrimination (shops, healthcare, housing)
- Education discrimination
- Public function discrimination

Types of discrimination illegal:
- Direct discrimination
- Indirect discrimination
- Harassment
- Victimisation

Getting help:
- ACAS (employment): 0300 123 1100
- Equality and Human Rights Commission
- Citizens Advice Bureau
- Employment tribunals (within 3 months)
- Legal aid may be available

Evidence to keep:
- Written communications
- Witness statements
- Records of incidents with dates/times`,
        category: 'Legal Rights',
        journeyStages: ['stabilization', 'growth', 'advocacy'],
        location: ['unknown'],
        tags: ['discrimination', 'legal rights', 'employment', 'Equality Act'],
        sources: ['Gov.UK', 'EHRC', 'Stonewall'],
        lastUpdated: new Date('2024-01-10'),
        verificationStatus: 'verified',
        communityValidated: true
      },
      {
        id: 'stonewall-housing-domestic-abuse',
        title: 'Domestic Abuse Support for LGBTQ+ People',
        content: `Domestic abuse affects LGBTQ+ people at similar or higher rates than the general population, but specific barriers exist in seeking help. Stonewall Housing provides specialist support understanding LGBTQ+ experiences of abuse.

The Reality:
- 78% increase in domestic abuse referrals to Stonewall Housing since 2019
- Many LGBTQ+ survivors face unique barriers: fear of not being believed, lack of LGBTQ+-specific services, concerns about outing
- Black LGBTQ+ people may face additional barriers due to racism in services

What Stonewall Housing offers:
- Specialist housing advice and advocacy
- Support navigating housing systems
- Mental health advocacy
- Substance misuse support
- Connection to other LGBTQ+ services

Other domestic abuse resources:
- National Domestic Abuse Helpline: 0808 2000 247 (24/7)
- Galop (LGBT+ domestic abuse): 0800 999 5428
- LGBT+ Switchboard: 0300 330 0630 (can signpost)
- Emergency: Call 999 if in immediate danger`,
        category: 'Domestic Abuse',
        journeyStages: ['crisis', 'stabilization', 'growth'],
        location: ['unknown'],
        tags: ['domestic abuse', 'domestic violence', 'housing', 'Stonewall Housing', 'LGBTQ+ abuse'],
        sources: ['stonewallhousing.org', 'Galop', 'MOPAC'],
        lastUpdated: new Date('2025-01-15'),
        verificationStatus: 'verified',
        communityValidated: false
      },
      {
        id: 'lgbtq-youth-homelessness-support',
        title: 'Support for LGBTQ+ Youth Experiencing Homelessness',
        content: `LGBTQ+ young people are significantly overrepresented in youth homelessness, with 24% of homeless young people identifying as LGBTQ+. For Black LGBTQ+ youth, the intersection of racism and homophobia creates additional barriers.

The Crisis:
- 24% of homeless young people identify as LGBTQ+
- 77% believe coming out to parents was the main factor
- Family rejection is the leading cause
- LGBTQ+ youth face higher risk of exploitation and violence when homeless

akt (Albert Kennedy Trust) - National Support:
- UK's leading LGBTQ+ youth homelessness charity
- Serves young people aged 16-25
- 47% of those supported are Black, Brown, or People of Colour

What akt offers:
- Emergency accommodation referrals
- Assigned caseworkers for 1-1 support
- Housing advice and advocacy
- Financial information and support
- Mental health support
- Identity and cultural guidance
- Employment and training assistance`,
        category: 'Housing Crisis',
        journeyStages: ['crisis', 'stabilization', 'growth'],
        location: ['unknown'],
        tags: ['youth homelessness', 'LGBTQ+ youth', 'housing crisis', 'akt', 'emergency accommodation'],
        sources: ['akt.org.uk', 'Stonewall Housing Research'],
        lastUpdated: new Date('2025-01-15'),
        verificationStatus: 'verified',
        communityValidated: false
      },
      {
        id: 'black-specific-mental-health-support',
        title: 'Mental Health Support for Black LGBTQ+ People in the UK',
        content: `Mental health support for Black LGBTQ+ people requires addressing both racism in therapy services and understanding of LGBTQ+ experiences. Black Minds Matter provides free therapy by Black therapists specifically addressing these intersectional needs.

The Mental Health Crisis for Black Communities:
- Black people are 4x more likely to be sectioned under the Mental Health Act
- Black people less likely to receive talking therapies, more likely to be offered medication only
- Underrepresentation of Black therapists in mental health services

For Black LGBTQ+ People Specifically:
- Triple jeopardy: racism + homophobia + mental health stigma
- Higher rates of depression and anxiety due to minority stress
- Family/community rejection compounded by cultural factors

Black Minds Matter UK - Free Therapy by Black Therapists:
- National registered charity providing FREE talking therapy
- All therapists are Black, qualified, and accredited
- Open to ALL Black individuals and families (including LGBTQ+ people)

How to access:
1. Visit www.blackmindsmatteruk.com/accessourtherapyservice
2. Fill out online referral form
3. Join waitlist and get matched with Black therapist`,
        category: 'Mental Health',
        journeyStages: ['crisis', 'stabilization', 'growth', 'community_healing'],
        location: ['unknown'],
        tags: ['mental health', 'Black Minds Matter', 'therapy', 'Black therapists', 'culturally appropriate care'],
        sources: ['blackmindsmatteruk.com', 'Mind', 'Mental Health Foundation'],
        lastUpdated: new Date('2025-01-15'),
        verificationStatus: 'verified',
        communityValidated: false
      }
    ]
  }
}

export const nationwideProvider = new NationwideProvider()
