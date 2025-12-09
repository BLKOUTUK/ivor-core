import { UKResource, KnowledgeEntry, JourneyStage, UKLocation } from '../types/journey.js'

/**
 * UK Knowledge Base for Black Queer Community Resources
 * Integrates menrus.co.uk, NHS, and community-specific resources
 */
export class UKKnowledgeBase {
  private resources: UKResource[]
  private knowledgeEntries: KnowledgeEntry[]

  constructor() {
    this.resources = this.initializeResources()
    this.knowledgeEntries = this.initializeKnowledgeEntries()
  }

  /**
   * Get resources filtered by journey stage and location
   */
  getResourcesByStageAndLocation(
    stage: JourneyStage, 
    location: UKLocation, 
    urgency?: string,
    category?: string
  ): UKResource[] {
    let filteredResources = this.resources.filter(resource => 
      resource.journeyStages.includes(stage) &&
      (resource.locations.includes(location) || resource.locations.includes('unknown'))
    )

    // Emergency resources take priority
    if (urgency === 'emergency') {
      filteredResources = filteredResources.filter(r => r.emergency)
    }

    // Filter by category if specified
    if (category) {
      filteredResources = filteredResources.filter(r => 
        r.category.toLowerCase().includes(category.toLowerCase())
      )
    }

    // Sort by relevance: emergency first, then free/NHS, then specific to community
    return filteredResources.sort((a, b) => {
      if (a.emergency && !b.emergency) return -1
      if (!a.emergency && b.emergency) return 1
      
      if ((a.cost === 'free' || a.cost === 'nhs_funded') && 
          (b.cost !== 'free' && b.cost !== 'nhs_funded')) return -1
      if ((b.cost === 'free' || b.cost === 'nhs_funded') && 
          (a.cost !== 'free' && a.cost !== 'nhs_funded')) return 1
      
      const aSpecific = a.culturalCompetency.blackSpecific || a.culturalCompetency.lgbtqSpecific
      const bSpecific = b.culturalCompetency.blackSpecific || b.culturalCompetency.lgbtqSpecific
      if (aSpecific && !bSpecific) return -1
      if (!aSpecific && bSpecific) return 1
      
      return 0
    })
  }

  /**
   * Get knowledge entries by topic and journey stage
   */
  getKnowledgeByTopic(
    topic: string,
    stage: JourneyStage,
    location: UKLocation
  ): KnowledgeEntry[] {
    return this.knowledgeEntries.filter(entry =>
      entry.journeyStages.includes(stage) &&
      entry.location.includes(location) &&
      (entry.category.toLowerCase().includes(topic.toLowerCase()) ||
       entry.tags.some(tag => tag.toLowerCase().includes(topic.toLowerCase())))
    ).sort((a, b) => {
      // Prioritize community-validated and recently updated content
      if (a.communityValidated && !b.communityValidated) return -1
      if (!a.communityValidated && b.communityValidated) return 1
      return b.lastUpdated.getTime() - a.lastUpdated.getTime()
    })
  }

  /**
   * Search for specific health information from menrus.co.uk integration
   */
  getMenrusHealthInfo(query: string, stage: JourneyStage): KnowledgeEntry[] {
    const healthKeywords = ['hiv', 'prep', 'pep', 'sexual health', 'sti', 'testing', 'treatment']
    const isHealthQuery = healthKeywords.some(keyword => 
      query.toLowerCase().includes(keyword)
    )

    if (!isHealthQuery) return []

    return this.knowledgeEntries.filter(entry => 
      entry.sources.includes('menrus.co.uk') &&
      entry.journeyStages.includes(stage) &&
      healthKeywords.some(keyword => 
        entry.content.toLowerCase().includes(keyword) ||
        entry.tags.some(tag => tag.toLowerCase().includes(keyword))
      )
    )
  }

  /**
   * Get emergency resources immediately
   */
  getEmergencyResources(location: UKLocation): UKResource[] {
    return this.resources
      .filter(r => r.emergency)
      .filter(r => r.locations.includes(location) || r.locations.includes('unknown'))
      .sort((a, b) => {
        // Prioritize 24/7 availability
        if (a.availability.includes('24/7') && !b.availability.includes('24/7')) return -1
        if (!a.availability.includes('24/7') && b.availability.includes('24/7')) return 1
        return 0
      })
  }

  /**
   * Initialize comprehensive UK resource database
   */
  private initializeResources(): UKResource[] {
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
        locations: ['unknown'], // Available everywhere
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
      {
        id: 'terrence-higgins-trust',
        title: 'Terrence Higgins Trust',
        description: 'Leading HIV and sexual health charity with specialist support',
        category: 'HIV Support',
        journeyStages: ['crisis', 'stabilization', 'growth'],
        phone: '0808 802 1221',
        website: 'https://tht.org.uk',
        locations: ['london', 'manchester', 'birmingham', 'brighton'],
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
          'youth homelessness',
          'LGBTQ+ youth 16-25',
          'emergency accommodation',
          'housing support',
          'caseworker support',
          'mental health support',
          'financial advice',
          'identity and cultural guidance',
          'employment and training',
          'QTIPOC resources'
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
      {
        id: 'stonewall-housing',
        title: 'Stonewall Housing',
        description: 'Leading national LGBTQ+ housing charity providing specialist housing advice, advocacy and support. Helped over 45,000 LGBTQ+ people since 1983. Specialisms in domestic abuse, mental health, and substance misuse.',
        category: 'Housing Support',
        journeyStages: ['crisis', 'stabilization', 'growth'],
        phone: '0800 6 404 404',
        email: 'info@stonewallhousing.org',
        website: 'https://stonewallhousing.org',
        locations: ['london', 'unknown'],
        specializations: [
          'housing advice',
          'domestic abuse support',
          'mental health advocacy',
          'substance misuse support',
          'supported accommodation',
          'housing advocacy',
          'domestic abuse resettlement',
          'BAME LGBTQ+ empowerment',
          'trauma-informed support',
          'all ages LGBTQ+'
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
      {
        id: 'tonic-housing',
        title: 'Tonic Housing',
        description: 'UK\'s first LGBTQ+ affirming retirement housing provider and Registered Housing Association. Creates vibrant, inclusive retirement communities for LGBTQ+ older adults to combat isolation and enjoy later life.',
        category: 'Older Adults Housing',
        journeyStages: ['growth', 'community_healing'],
        phone: '0207 971 1091',
        email: 'info@tonichousing.org.uk',
        website: 'https://www.tonichousing.org.uk',
        locations: ['london', 'manchester'],
        specializations: [
          'LGBTQ+ retirement housing',
          'older adults 55+',
          'shared ownership',
          'affordable housing',
          'social housing',
          'community living',
          'anti-isolation support',
          'culturally affirming services',
          'intergenerational connection',
          'community activities'
        ],
        accessRequirements: ['LGBTQ+ identifying', 'older adult (typically 55+)', 'interest in community living'],
        cost: 'paid',
        culturalCompetency: {
          lgbtqSpecific: true,
          blackSpecific: false,
          transSpecific: true,
          disabilityAware: true
        },
        emergency: false,
        availability: 'Contact for housing interest registration, expanding from London to Manchester',
        languages: ['English']
      },

      // TRANS-SPECIFIC SUPPORT
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
          'Black trans support',
          'non-binary support',
          'peer-to-peer support',
          'trans counseling',
          'mental health',
          'gender identity exploration',
          'coming out support',
          'gender-affirming care navigation',
          'advocacy',
          'safe spaces',
          'community ally program',
          'legal support'
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

      // REGIONAL QTIPOC COMMUNITY SUPPORT
      {
        id: 'unmuted-birmingham',
        title: 'UNMUTED Birmingham',
        description: 'Raising voices and representation of LGBTQI+ people of colour in Birmingham and West Midlands. Provides safe spaces for QTIPOC to connect, grow, and explore identity through meet-ups, events, and ongoing support.',
        category: 'QTIPOC Community',
        journeyStages: ['stabilization', 'growth', 'community_healing', 'advocacy'],
        email: 'contactunmuted@gmail.com',
        website: 'https://www.unmutedbrum.com',
        locations: ['birmingham'],
        specializations: [
          'QTIPOC community',
          'people of colour support',
          'social groups',
          'peer support',
          'identity exploration',
          'safe spaces',
          'educational programs',
          'family support',
          'sexual health',
          'housing advice',
          'faith and sexuality',
          'workplace rights',
          'community organizing',
          'book clubs',
          'monthly meet-ups'
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
          'sexual health testing',
          'talking therapies',
          'domestic abuse support',
          'sexual violence support',
          'trans advocacy',
          'QTIPOC programs',
          'recovery programmes',
          'Pride in Ageing (over 50s)',
          'veterans support',
          'smoking cessation',
          'mental health',
          'community safety',
          'helpline support',
          'life admin support'
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

      // ASYLUM AND REFUGEE SUPPORT
      {
        id: 'rainbow-migration',
        title: 'Rainbow Migration',
        description: 'UK\'s leading LGBTQI+ asylum and immigration support organization. Provides free legal advice, emotional support, and advocacy for LGBTQI+ people seeking asylum or living in the UK with partners.',
        category: 'Asylum & Immigration',
        journeyStages: ['crisis', 'stabilization', 'growth', 'advocacy'],
        phone: '0203 752 5801',
        email: 'hello@rainbowmigration.org.uk',
        website: 'https://www.rainbowmigration.org.uk',
        locations: ['london', 'unknown'],
        specializations: [
          'LGBTQI+ asylum claims',
          'immigration legal advice',
          'partner/spouse visas',
          'emotional support during asylum process',
          'housing access support',
          'health services navigation',
          'anti-detention campaigns',
          'trans asylum support',
          'lesbian and gay women support',
          'bisexual support',
          'intersex support',
          'disabled LGBTQI+ asylum seekers',
          'lawyer referrals',
          'training for legal professionals'
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
        description: 'Grassroots organization set up by, for, and run by LGBTIQ refugees and asylum seekers from Africa. Weekly social events, legal workshops, and peer support for African LGBTQ+ people seeking asylum in UK, France, and Netherlands.',
        category: 'African LGBTQ+ Asylum',
        journeyStages: ['crisis', 'stabilization', 'growth', 'community_healing'],
        phone: '+44 7537 968154',
        email: 'info@africanlgbti.org',
        website: 'https://africanlgbti.org',
        locations: ['london'],
        specializations: [
          'African LGBTQ+ asylum seekers',
          'peer support',
          'weekly socials',
          'legal workshops with lawyers',
          'podcast storytelling platform',
          'creative socials (dance, music, art)',
          'community building',
          'anti-persecution support',
          'anti-detention advocacy',
          'mental health peer support',
          'cultural connection for African diaspora'
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
        availability: 'Saturday Socials 5-10pm at G-A-Y Pub, monthly asylum meetings last Saturday 1-4pm at 56 Dean Street, Wednesday creative socials 4-8pm, Friday podcast 4-10pm',
        languages: ['English']
      },
      {
        id: 'africa-rainbow-family',
        title: 'African Rainbow Family',
        description: 'National network supporting LGBTIQ+ people of African heritage and LGBTIQ+ refugees/asylum seekers fleeing persecution. Branches in Manchester, Birmingham, London, and Leeds providing peer support, advocacy, counseling, and housing support.',
        category: 'African LGBTQ+ Support',
        journeyStages: ['crisis', 'stabilization', 'growth', 'community_healing'],
        phone: '07711285567',
        email: 'info@africanrainbowfamily.org',
        website: 'https://africanrainbowfamily.org',
        locations: ['manchester', 'birmingham', 'london', 'leeds'],
        specializations: [
          'African heritage LGBTIQ+ support',
          'asylum seeker support',
          'refugee support',
          'peer support network',
          'counseling services',
          'advocacy',
          'housing support',
          'financial assistance',
          'training and guidance',
          'Black and Asian Minority Ethnic LGBTQ+',
          'navigating asylum system',
          'community empowerment',
          'national network (500+ members)'
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
        availability: 'National network with branches in 4 cities, office in Manchester',
        languages: ['English']
      },
      {
        id: 'black-minds-matter',
        title: 'Black Minds Matter UK',
        description: 'National charity providing free 1-to-1 talking therapy with qualified, accredited Black therapists for Black individuals and families. Addresses mental health disparities and racism in therapy services.',
        category: 'Mental Health',
        journeyStages: ['crisis', 'stabilization', 'growth', 'community_healing'],
        website: 'https://www.blackmindsmatteruk.com',
        locations: ['unknown'],
        specializations: [
          'free talking therapy',
          'Black therapists',
          'culturally appropriate mental health support',
          'anxiety support',
          'depression support',
          'trauma therapy',
          'PTSD support',
          'family therapy',
          'individual counseling',
          'culturally competent care',
          'mental health education',
          'systems change advocacy',
          'LGBTQ+ affirming therapy'
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
      },

      // COMMUNITY HEALING RESOURCES
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
          'mental health support',
          'wellbeing sessions',
          'older adults 50+',
          'BPOC community groups',
          'creative workshops',
          'sober spaces',
          'community café',
          'signposting services',
          'therapy',
          'health outreach'
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
      }
    ]
  }

  /**
   * Initialize knowledge entries with UK-specific information
   */
  private initializeKnowledgeEntries(): KnowledgeEntry[] {
    return [
      {
        id: 'hiv-treatment-uk',
        title: 'HIV Treatment in the UK',
        content: `HIV treatment in the UK is free through the NHS and highly effective. Modern antiretroviral therapy (ART) can make HIV undetectable and untransmittable (U=U). 

Key facts:
• Treatment is free on NHS regardless of immigration status
• Most people start treatment immediately after diagnosis
• Modern medications have fewer side effects
• Regular monitoring every 3-6 months
• Undetectable viral load means HIV cannot be transmitted sexually

Getting treatment:
• Diagnosed at GUM clinic or GP - automatic referral to specialist
• HIV clinics in all major hospitals
• Specialist nurses provide ongoing support
• Treatment typically starts within 2 weeks of diagnosis`,
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
• Free prescription through GUM clinics
• Regular monitoring required (every 3 months)
• Available to anyone at high risk of HIV
• No restrictions based on sexuality or identity

Getting PrEP:
• Contact local GUM/sexual health clinic
• Online booking available in most areas
• Private prescriptions available (£30-50/month)
• Generic versions significantly cheaper than branded

Who can get PrEP:
• Men who have sex with men
• Trans people at risk
• Anyone with HIV+ partner not on effective treatment
• People who inject drugs
• Sex workers`,
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
• IAPT (Improving Access to Psychological Therapies) - anxiety/depression
• Crisis teams - for mental health emergencies  
• Community mental health teams - ongoing support

How to access:
1. Self-refer online to local IAPT service
2. Contact GP for referral to specialist services
3. Call 111 for urgent but non-emergency support
4. A&E or 999 for mental health emergencies

What's available:
• Counselling and therapy (CBT, counselling)
• Medication through GP
• Support groups
• Crisis intervention
• Inpatient treatment if needed

Waiting times:
• IAPT: typically 2-8 weeks
• Specialist services: 4-18 weeks depending on area
• Crisis support: immediate`,
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
• Sexual orientation
• Gender reassignment (trans protection)
• Marriage and civil partnership

What's covered:
• Employment discrimination
• Service discrimination (shops, healthcare, housing)
• Education discrimination
• Public function discrimination

Types of discrimination illegal:
• Direct discrimination
• Indirect discrimination
• Harassment
• Victimisation

Getting help:
• ACAS (employment): 0300 123 1100
• Equality and Human Rights Commission
• Citizens Advice Bureau
• Employment tribunals (within 3 months)
• Legal aid may be available

Evidence to keep:
• Written communications
• Witness statements
• Records of incidents with dates/times`,
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
        id: 'black-trans-support-uk',
        title: 'Support for Black Trans and Non-Binary People in the UK',
        content: `Black trans and non-binary people face compounded discrimination at the intersection of transphobia and racism. Finding affirming, culturally competent support is critical for wellbeing and survival.

The Reality for Black Trans People:
• 41% of trans people have experienced hate crimes
• 12% of trans employees have been physically attacked by colleagues or customers
• 11% of trans people aren't supported by family members
• 62% of Black, Asian and minority ethnic LGBT people more likely to experience depression
• Black trans women face highest rates of violence and murder globally
• NHS Gender Identity Clinics have 2-5 year waiting lists
• Trans healthcare under constant political attack in UK

Specific Challenges for Black Trans People:
• Double discrimination: transphobia + racism
• Less likely to have family support due to cultural/religious factors
• Higher rates of unemployment and poverty
• More likely to experience police violence and discrimination
• Lack of culturally competent healthcare providers
• Erasure and invisibility in both Black and LGBTQ+ spaces
• Higher barriers to accessing gender-affirming care

Black Trans Alliance - Community-Led Support:
• Founded 2020 by Black queer and trans leaders
• Based in London, serves wider UK community
• FREE confidential services
• "We cannot let black trans people be pushed further beyond the boundaries of marginalisation"

What Black Trans Alliance offers:
• Peer-to-peer support (one-to-one and closed groups)
• Online group sessions and individual sessions
• Trans counseling with identity-affirming therapists (UKCP/BACP registered)
• Mental health support for anxiety, depression
• Gender identity exploration support
• Coming out guidance
• Help accessing gender-affirming care
• Advocacy and legal support
• Safe spaces and community ally program
• Helpline

How to access:
• Email: admin@blacktransalliance.org
• Website: blacktransalliance.org/peer-to-peer-support
• Register online for group sessions
• Email for one-to-one sessions
• Free of charge
• Confidential and non-judgmental
• For anyone trans, non-binary, or questioning

Peer support benefits:
• Meet others with shared experiences
• Reduce isolation
• Share knowledge from lived experience
• Give and receive mutual support
• Safe space to explore identity
• Connection to community

NHS Gender Identity Services:
• Long waiting lists (2-5 years in some areas)
• Can self-refer to Gender Identity Clinic
• GP referral also possible
• While waiting: GP can prescribe hormones with GIC agreement
• Private options available but expensive (£100-300 per appointment)

Other trans support resources:
• LGBT+ Switchboard: 0300 330 0630
• Mermaids (youth): 0808 801 0400
• Gendered Intelligence
• Spectra (London)
• TransActual

Gender-affirming care basics:
• Social transition (name, pronouns, presentation) - no medical involvement needed
• Hormone therapy (via NHS GIC or private)
• Speech and voice therapy
• Surgery options (top surgery, bottom surgery, facial feminization, etc.)
• Legal name and gender marker change (Gender Recognition Certificate)

Your rights:
• Equality Act 2010 protects gender reassignment as protected characteristic
• Cannot be discriminated against in employment, services, housing
• Don't need Gender Recognition Certificate for discrimination protection
• Right to use facilities matching your gender identity
• Right to privacy - don't have to disclose trans status
• Schools/employers must respect your identity

Dealing with transphobia:
• Report hate crimes to police (101 or online)
• Emergency: 999
• Document incidents (dates, witnesses, evidence)
• Galop LGBT+ hate crime helpline: 0800 999 5428
• True Vision online hate crime reporting: report-it.org.uk

Why Black-specific trans support matters:
• Understanding of intersectional discrimination
• Culturally competent care
• Recognition of specific barriers Black trans people face
• Safe space free from racism within LGBTQ+ spaces
• Connection to Black trans community
• Shared lived experiences
• Advocacy addressing both racism and transphobia

Mental health support:
• Black Trans Alliance counseling (free or low-cost)
• Black Minds Matter (free therapy by Black therapists)
• NHS IAPT (free therapy for anxiety/depression)
• LGBT+ Switchboard can signpost to trans-friendly therapists
• Some GPs have trans-friendly counselors

Community and connection:
• Black Trans Alliance peer groups
• UK Black Pride (annual event)
• Local trans support groups (check TransUnite.co.uk)
• Online communities on social media
• London LGBTQ+ Community Centre

Remember: You deserve support, affirmation, and safety. Your identity is valid. You are not alone.`,
        category: 'Trans Support',
        journeyStages: ['crisis', 'stabilization', 'growth', 'community_healing', 'advocacy'],
        location: ['london', 'unknown'],
        tags: ['trans', 'non-binary', 'Black trans', 'transgender', 'gender identity', 'transphobia', 'hate crimes', 'gender-affirming care', 'peer support', 'mental health', 'Black Trans Alliance'],
        sources: ['blacktransalliance.org', 'Stonewall', 'NHS', 'Galop', 'TransActual'],
        lastUpdated: new Date('2025-01-15'),
        verificationStatus: 'verified',
        communityValidated: false
      },
      {
        id: 'lgbtq-older-adults-housing-support',
        title: 'Housing and Community Support for LGBTQ+ Older Adults',
        content: `LGBTQ+ older adults face unique challenges including isolation, discrimination in care settings, and lack of affirming housing options. Many lived through times when being LGBTQ+ was criminalized and face specific barriers to aging well.

The Challenges:
• Many LGBTQ+ older adults are socially isolated (1 in 10 have no one to turn to)
• Fear of discrimination in care homes leads many to go back "in the closet"
• Lack of family support due to estrangement or rejection
• Historic trauma from living through Section 28, AIDS crisis, criminalization
• Black LGBTQ+ elders face intersectional discrimination and isolation
• Limited housing options that understand and affirm LGBTQ+ lives

Tonic Housing - LGBTQ+ Affirming Retirement:
• UK's first LGBTQ+ affirming retirement housing provider (est. 2014)
• First LGBTQ+ Registered Housing Association (2025)
• Creates vibrant, inclusive retirement communities
• Tonic@Bankhouse: 84 apartments in Vauxhall, London with Thames views
• Expanding to Manchester and other UK cities

What Tonic offers:
• Shared ownership homes (1 and 2 bedroom)
• Affordable and social housing options
• Some rental options for LGBTQ+ people experiencing homelessness
• On-site restaurant and community lounge
• Roof terrace with London views
• Floating garden
• Community activities and events co-created with residents
• Actively LGBTQ+ affirming (not just "friendly")
• Cultural understanding and appropriate services

Philosophy:
• "Being connected to others is fundamental to a happy later life"
• Celebrates LGBTQ+ identities and histories
• Enables mutual support and community
• "THIS IS HOW WE LIVE OUR LIVES OUT"

How to access Tonic Housing:
• Phone: 0207 971 1091
• Email: info@tonichousing.org.uk
• Register interest on website: tonichousing.org.uk
• Typically for adults 55+ interested in community living
• Based in London, expanding to Manchester

Free Community Support for Older LGBTQ+ BPOC:
• Melanin Vybz at London LGBTQ+ Community Centre
• Monthly meetup for LGBTQ+ Black people and people of colour over 50
• Free to attend, no booking required
• 60-62 Hopton Street, Blackfriars, London
• Organized by Opening Doors London
• Safe space for intergenerational connection

Other resources for older LGBTQ+ people:
• Opening Doors London: Social groups for LGBT+ people over 50
• Age UK: General support for older people
• LGBT+ Switchboard: 0300 330 0630 (can signpost to local groups)
• Local LGBT+ community centers often have older adults groups

Financial support:
• Pension Credit if low income
• Housing Benefit to help with rent
• Attendance Allowance if need care
• Council Tax reduction (some areas)
• Free bus pass at state pension age

Rights and protections:
• Equality Act 2010 protects from discrimination based on sexual orientation
• Cannot be discriminated against in housing or care
• Right to live openly as LGBTQ+ person
• Right to culturally appropriate care and support
• Can challenge discrimination in care homes

Why affirming housing matters:
• Safety to be fully yourself in later life
• Community with shared experiences and understanding
• No fear of discrimination or having to hide identity
• Celebration of LGBTQ+ lives and histories
• Mutual support and reduced isolation
• Better mental and physical health outcomes

The difference between "friendly" and "affirming":
• Friendly: tolerates LGBTQ+ people, doesn't actively discriminate
• Affirming: celebrates LGBTQ+ identities, understands specific needs, creates space for community, acknowledges historic trauma, provides culturally appropriate support`,
        category: 'Older Adults',
        journeyStages: ['growth', 'community_healing'],
        location: ['london', 'manchester', 'unknown'],
        tags: ['older adults', 'retirement', 'housing', 'Tonic Housing', 'Melanin Vybz', 'isolation', 'community', 'LGBTQ+ affirming', 'BPOC elders', '55+'],
        sources: ['tonichousing.org.uk', 'Opening Doors London', 'Age UK', 'Stonewall Housing'],
        lastUpdated: new Date('2025-01-15'),
        verificationStatus: 'verified',
        communityValidated: false
      },
      {
        id: 'london-lgbtq-centre-community',
        title: 'Community Spaces and Support for LGBTQ+ BPOC in London',
        content: `The London LGBTQ+ Community Centre offers a welcoming, sober, intersectional space for all LGBTQ+ people with specific programming for Black people and people of colour.

Location:
• 60-62 Hopton Street, Blackfriars, London SE1 9JH
• Near Blackfriars Station
• Open Wed-Sun 12pm-8pm (Wednesday opens 9:30am)

What's available:
• Free community café space
• Library with LGBTQ+ resources
• Wellbeing and mental health support
• Creative workshops and skills sharing
• Book and film clubs
• Board games, fidget toys, weighted blankets
• Signposting to other London services

Programs for BPOC community:
• Melanin Vybz: Monthly meetup for LGBTQ+ Black people and people of colour over 50 (organized by Opening Doors)
• Titan Trims: QTPOC barber service (every two weeks)
• LGBTQ+ Health Outreach Drop-in with mini health checks, gender-affirming care advice, sexual health guidance

Mental health services:
• E.H. Counselling: LGBTQIA+ and polyamory-focused therapy
• Tension and Trauma Release Exercises (TRE)
• NA Queer to Stay: Weekly Narcotics Anonymous meetings (Wednesdays 7-8pm)
• Thai Yoga Massage

How to access:
• Just drop in during opening hours - no referral needed
• Email: hello@londonlgbtqcentre.org
• Website: londonlgbtqcentre.org
• All services are free
• COVID-safe environment with masks available and hand sanitizer

Why it's special:
• Sober space - alcohol-free environment
• Intersectional approach welcoming all identities
• Community-led with over 2,000 events hosted since 2021
• Safe space for older LGBTQ+ BPOC adults through Melanin Vybz
• Acts as hub for discovering other London services`,
        category: 'Community Support',
        journeyStages: ['stabilization', 'growth', 'community_healing'],
        location: ['london'],
        tags: ['community centre', 'BPOC', 'older adults', 'mental health', 'sober space', 'Melanin Vybz', 'wellbeing', 'London'],
        sources: ['londonlgbtqcentre.org', 'Opening Doors London'],
        lastUpdated: new Date('2025-01-15'),
        verificationStatus: 'verified',
        communityValidated: false
      },
      {
        id: 'stonewall-housing-domestic-abuse',
        title: 'Domestic Abuse Support for LGBTQ+ People',
        content: `Domestic abuse affects LGBTQ+ people at similar or higher rates than the general population, but specific barriers exist in seeking help. Stonewall Housing provides specialist support understanding LGBTQ+ experiences of abuse.

The Reality:
• 78% increase in domestic abuse referrals to Stonewall Housing since 2019
• Many LGBTQ+ survivors face unique barriers: fear of not being believed, lack of LGBTQ+-specific services, concerns about outing
• Black LGBTQ+ people may face additional barriers due to racism in services
• Domestic abuse in LGBTQ+ relationships is often minimized or not recognized

Stonewall Housing - Specialist Support:
• Founded in 1983, helped over 45,000 LGBTQ+ people
• Free and confidential services
• 97% of service users value caseworkers who understand LGBTQ+ experiences
• Specialisms in domestic abuse, mental health, and substance misuse
• On track to support 3,700+ LGBTQ+ people in 2025

Domestic Abuse Resettlement Service (DARS):
• Funded under London's Police and Crime Plan 2022-2025
• Advice, advocacy and resettlement support for LGBTQ+ domestic abuse survivors
• Helps survivors who have fled abuse and are in intermediate safe accommodation
• Supports getting settled and established in new homes
• Trauma-informed approach

What Stonewall Housing offers:
• Specialist housing advice and advocacy
• Support navigating housing systems
• Mental health advocacy
• Substance misuse support
• Supported accommodation (limited spaces)
• Connection to other LGBTQ+ services
• Understanding of intersectional identities
• BAME LGBTQ+ empowerment programs

How to access:
• Helpline: 0800 6 404 404 (Mon-Fri 10am-1pm)
• Email: info@stonewallhousing.org
• Website: stonewallhousing.org
• Self-referral form available online
• Agency referrals accepted
• National UK coverage

Important note:
• Stonewall Housing is NOT an emergency accommodation provider
• They cannot provide emergency housing directly
• They provide advice and support to access accommodation

Other domestic abuse resources:
• National Domestic Abuse Helpline: 0808 2000 247 (24/7)
• Galop (LGBT+ domestic abuse): 0800 999 5428
• LGBT+ Switchboard: 0300 330 0630 (can signpost)
• Emergency: Call 999 if in immediate danger

Types of abuse recognized:
• Physical violence
• Emotional/psychological abuse
• Financial control
• Sexual abuse
• Coercive control
• Technology-facilitated abuse
• Threats of outing (specific to LGBTQ+ people)
• Controlling access to LGBTQ+ community

Your rights:
• Same legal protections as anyone else
• Police must take LGBTQ+ domestic abuse seriously
• Cannot be discriminated against for being LGBTQ+
• Right to safe housing
• Right to support services

Why specialist LGBTQ+ support matters:
• Understanding of LGBTQ+ relationship dynamics
• Recognition of unique forms of abuse (outing threats, identity invalidation)
• Safe to be open about sexuality/gender identity
• Experience with barriers LGBTQ+ people face
• Trauma-informed, intersectional approach`,
        category: 'Domestic Abuse',
        journeyStages: ['crisis', 'stabilization', 'growth'],
        location: ['unknown'],
        tags: ['domestic abuse', 'domestic violence', 'DARS', 'housing', 'Stonewall Housing', 'LGBTQ+ abuse', 'trauma support', 'resettlement', 'safe accommodation'],
        sources: ['stonewallhousing.org', 'Galop', 'MOPAC'],
        lastUpdated: new Date('2025-01-15'),
        verificationStatus: 'verified',
        communityValidated: false
      },
      {
        id: 'lgbt-foundation-manchester',
        title: 'LGBT Foundation Manchester - Comprehensive LGBTQ+ Health and Support Services',
        content: `LGBT Foundation is a national charity based in Manchester with LGBTQ+ health and wellbeing at the heart of everything they do. They provide comprehensive services including sexual health, mental health, domestic abuse support, trans advocacy, and developing QTIPOC programs.

Overview:
• Founded as Manchester's LGBTQ+ charity, now national reach
• Based at Fairbairn House, 72 Sackville Street, Manchester M1 3NJ
• Also operates services in Liverpool
• Registered Charity Number: 1070904
• Helpline: 0345 3 30 30 30
• All services free and confidential

Comprehensive Services Offered:

Sexual Health Services:
• Free sexual health testing (clinic-based and home delivery)
• Sexual health advice and counseling
• PrEP advice and support
• HIV support and testing
• Specialist LGBTQ+ sexual health expertise

Mental Health and Wellbeing:
• Talking therapies and counseling
• Mental health support groups
• Life admin and co-working support group (Wednesdays 12-2pm)
• Wellbeing programs
• Recovery programs for substance misuse

Crisis and Safety Support:
• Domestic abuse support program
• Sexual violence support
• Independent Sexual Violence Advisor
• Community safety services
• Hate crime reporting and support

Trans-Specific Support:
• Trans Advocacy Service
• Support navigating healthcare systems
• Trans and non-binary support groups
• Working to improve access for trans POC through QTIPOC working group

QTIPOC (Queer, Trans, Intersex People of Colour) Programs:
• Developing dedicated QTIPOC programme with paid staff lead
• QTIPOC support groups for safe space and peer support
• Working to address barriers for trans and non-binary POC
• Colleagues of Colour Network (internal staff support)
• Part of Greater Manchester LGBTQ+ Equality Panel centering marginalized communities
• Internal equalities audits to improve POC engagement

Specialized Programs:
• Pride in Ageing: Support for LGBTQ+ people over 50
• Veterans and Armed Forces support
• Smoking cessation programs
• Community Action Network
• Greater Manchester LGBTQ+ Equality Panel

Support Groups:
• Recovery groups (Tuesdays 6pm at Manchester office)
• Life admin support (Wednesdays 12-2pm)
• Liverpool LGBTQ+ wellbeing groups
• QTIPOC social and peer support groups
• Pride in Ageing social groups (over 50s)
• Trans and non-binary groups

How to Access Services:
• Call helpline: 0345 3 30 30 30
• Email for groups: groups@lgbt.foundation
• Visit Manchester office: 72 Sackville Street (2nd floor)
• Website: lgbt.foundation
• Self-referral available for most services
• Drop-in options for some programs

Training and Organizational Support:
• Diversity and inclusion workshops
• Corporate partnerships and training
• Helping other organizations become LGBTQ+ inclusive
• Educational programs

Why LGBT Foundation Matters:
• Comprehensive one-stop-shop for LGBTQ+ health and wellbeing
• Specialist understanding of LGBTQ+ health needs
• Free services removing financial barriers
• Manchester's main LGBTQ+ health provider
• National reach beyond Manchester
• Committed to improving access for marginalized communities including QTIPOC
• Evidence-based practice with community input

For QTIPOC Community Members:
• Active work to improve trans POC representation in services
• QTIPOC-specific groups being developed
• Staff networks supporting colleagues of colour
• Participation in Greater Manchester LGBTQ+ Equality Panel
• Collaboration with other Manchester QTIPOC organizations like Rainbow Noir
• Safe spaces to voice concerns and inform service delivery

Manchester QTIPOC Ecosystem:
LGBT Foundation works alongside other Manchester organizations serving QTIPOC communities:
• Rainbow Noir (social group for LGBTQI+ people of colour)
• African Rainbow Family
• Black Gold Arts
• Manchester Pride's Impact Fund supporting QTIPOC organizations

Contact and Location:
• Helpline: 0345 3 30 30 30
• Groups Email: groups@lgbt.foundation
• Address: Fairbairn House (2nd Floor), 72 Sackville Street, Manchester M1 3NJ
• Liverpool services also available
• Website: lgbt.foundation

What Makes Them Different:
• Specialist LGBTQ+ health expertise
• Comprehensive range of services under one roof
• Both crisis and long-term support
• Free services for all
• Trans-specific expertise and advocacy
• Working actively on QTIPOC inclusion
• Evidence-based, community-informed approach
• National charity with local Manchester roots`,
        category: 'Health Services',
        journeyStages: ['crisis', 'stabilization', 'growth', 'community_healing'],
        location: ['manchester', 'liverpool', 'unknown'],
        tags: ['LGBT Foundation', 'Manchester', 'sexual health', 'mental health', 'talking therapies', 'trans support', 'QTIPOC', 'domestic abuse', 'helpline', 'Pride in Ageing', 'veterans', 'health services', 'community support'],
        sources: ['lgbt.foundation', 'Manchester Pride', 'Greater Manchester LGBTQ+ Equality Panel'],
        lastUpdated: new Date('2025-01-15'),
        verificationStatus: 'verified',
        communityValidated: false
      },
      {
        id: 'lgbtq-asylum-refugee-support-uk',
        title: 'LGBTQ+ Asylum and Refugee Support in the UK',
        content: `LGBTQ+ people fleeing persecution face life-threatening situations and need specialized support navigating the UK asylum system. Three key organizations provide life-saving legal, emotional, and community support.

The Life-or-Death Reality:
• 69 countries criminalize being LGBTQ+
• 11 countries have death penalty for homosexuality (Iran, Saudi Arabia, Nigeria, Somalia, Mauritania, etc.)
• LGBTQ+ asylum seekers face persecution, torture, honor killings, state violence
• Black LGBTQ+ asylum seekers face compounded discrimination
• Hostile environment immigration policies make claiming asylum harder
• Detention centers can be dangerous for LGBTQ+ people
• Without asylum, deportation can mean death

Why UK Asylum System is Difficult for LGBTQ+ People:
• Must prove sexual orientation/gender identity to immigration officers
• "Prove you're gay" interviews can be traumatic and invasive
• Disbelief and skepticism from case workers
• Long waiting times (months to years) in uncertainty
• No recourse to public funds during asylum process
• Risk of detention
• Lack of LGBTQ+-competent legal representation
• Cultural barriers and language issues

Rainbow Migration - THE UK Specialist:
• UK's leading LGBTQ+ asylum and immigration organization
• Founded to support LGBTQ+ people through asylum process
• Charity Number: 1158228
• IAA Number: N201700019

What Rainbow Migration Offers:
• FREE legal advice and information on asylum claims
• Help finding specialist LGBTQ+ immigration lawyers
• Emotional support throughout asylum process
• Support accessing housing and health services
• Partner/spouse visa guidance for LGBTQ+ couples
• Training for legal professionals on LGBTQ+ asylum
• Research and advocacy to improve system
• Anti-detention campaigns
• Support for all LGBTQ+ identities: trans, lesbian, gay, bisexual, intersex, non-binary, disabled

How to Access Rainbow Migration:
• Phone: 0203 752 5801
• Email: hello@rainbowmigration.org.uk
• Address: 7-14 Great Dover St, London SE1 4YR
• Website: rainbowmigration.org.uk
• Free and confidential services
• Can help at any stage of asylum process

Out and Proud African LGBTI (OPAL) - Community-Led Asylum Support:
• Grassroots organization BY and FOR African LGBTQ+ asylum seekers and refugees
• Operating in UK, France, and Netherlands
• Charity Number: 1169497
• "We extend vital support to LGBTI+ asylum seekers and refugees"

What OPAL Offers:
• Weekly Saturday Socials (5-10pm at G-A-Y Pub, 30 Old Compton St, London) - no registration needed, just show up
• Monthly Asylum Support Meetings (last Saturday of month, 1-4pm at 56 Dean Street) - legal workshops with lawyers, members only
• Wednesday Creative Socials (4-8pm, 198 Railton Road) - gallery, dance, music, drawing
• Friday Podcast Sessions (4-10pm, 198 Railton Road) - share your story, African LGBTQ+ voices
• Peer-to-peer support from others who understand
• Educational workshops
• Community connection for African diaspora

How to Access OPAL:
• Phone: +44 7537 968154
• Email: info@africanlgbti.org
• Address: 198 Railton Road, London SE24 0JT
• Website: africanlgbti.org
• Free services
• Saturday Socials open to all from 5pm onwards

African Rainbow Family - National Network:
• National organization (500+ members)
• Branches in Manchester, Birmingham, London, and Leeds
• Supports LGBTIQ+ people of African heritage AND asylum seekers/refugees
• Founded 2014, now national network
• Charity Number: 1185902

What African Rainbow Family Offers:
• Peer support across 4 cities
• Counseling services
• Advocacy and legal guidance
• Housing support
• Financial assistance
• Training and empowerment programs
• Help navigating asylum system
• Community connection
• Support for Black, Asian, Minority Ethnic LGBTQ+ people

How to Access African Rainbow Family:
• Phone: 07711285567
• Email: info@africanrainbowfamily.org
• Address: The Monastery, 89 Gorton Lane, Manchester M12 5WF
• Website: africanrainbowfamily.org
• Contact for branch information (Manchester, Birmingham, London, Leeds)

The Asylum Process:
1. Claim asylum as soon as you arrive in UK or realize you can't return home
2. Screening interview with Home Office
3. Substantive asylum interview (need to explain why you're fleeing)
4. Wait for decision (can be months or years)
5. If refused, can appeal

Evidence for LGBTQ+ Asylum Claims:
• Personal statement explaining your experiences
• Evidence of persecution (if safe to obtain)
• Country information showing LGBTQ+ people are persecuted
• Medical evidence of torture/trauma
• Witness statements
• Photos, messages, social media (if safe)
• Expert reports

Your Rights During Asylum Process:
• Right to claim asylum in UK
• Right to interpreter
• Right to legal representation
• Right to healthcare (though limited)
• Right not to be returned to country where you face persecution (non-refoulement)
• Right to appeal refusal

Support Available:
• Section 95 support (housing and cash) if destitute
• Limited healthcare access via NHS
• No recourse to public funds (can't access benefits)
• Charities can provide emergency support

Why African-Specific LGBTQ+ Support Matters:
• Understanding of specific persecution in African countries
• Cultural connection and community
• Shared experiences of racism + homophobia
• Many African countries criminalize homosexuality (32 African countries)
• Family and community rejection often tied to cultural/religious factors
• Peer support from others who understand

Mental Health Support:
• Asylum process is traumatic
• Many have PTSD from persecution
• Uncertainty and waiting causes anxiety/depression
• Isolation from family and community
• Rainbow Migration can signpost to mental health services
• OPAL and African Rainbow Family provide peer support
• Some NHS services available

If You're Facing Deportation:
• Contact Rainbow Migration IMMEDIATELY
• Find immigration lawyer specializing in LGBTQ+ asylum
• Appeal the decision
• Provide additional evidence
• Contact MP for help
• Document any new threats in home country

Emergency Contacts:
• Rainbow Migration: 0203 752 5801 (legal advice)
• OPAL: +44 7537 968154 (peer support)
• African Rainbow Family: 07711285567 (national network)
• Immigration Advice Service: Free initial advice
• BID (Bail for Immigration Detainees): If detained
• Medical Justice: Medical evidence for torture survivors

Remember: You are not alone. Thousands of LGBTQ+ people have successfully claimed asylum in UK. These organizations exist specifically to help you survive and thrive.`,
        category: 'Asylum & Immigration',
        journeyStages: ['crisis', 'stabilization', 'growth', 'advocacy'],
        location: ['london', 'manchester', 'birmingham', 'leeds', 'unknown'],
        tags: ['asylum', 'refugee', 'immigration', 'Rainbow Migration', 'OPAL', 'African Rainbow Family', 'deportation', 'persecution', 'legal support', 'African LGBTQ+', 'life-threatening', 'death penalty countries', 'hostile environment'],
        sources: ['rainbowmigration.org.uk', 'africanlgbti.org', 'africanrainbowfamily.org', 'UNHCR', 'UK Home Office'],
        lastUpdated: new Date('2025-01-15'),
        verificationStatus: 'verified',
        communityValidated: false
      },
      {
        id: 'qtipoc-community-birmingham',
        title: 'QTIPOC Community Support in Birmingham and the West Midlands',
        content: `UNMUTED Birmingham exists to raise the voices and representation of LGBTQI+ people of colour in Birmingham and the West Midlands. They nurture and grow community for Queer, Trans, and Intersex People of Colour (QTIPOC) through safe spaces, events, and ongoing support.

The Need for QTIPOC-Specific Support:
• Black and minoritized LGBTQ+ people face double discrimination
• Often feel isolated from both LGBTQ+ spaces (due to racism) and communities of colour (due to homophobia/transphobia)
• Need for culturally affirming spaces that understand intersectional identities
• Birmingham's QTIPOC community historically underserved
• Representation matters - seeing other QTIPOC people thriving is powerful

What UNMUTED Offers:
• QTIPOC-only safe spaces for connection and exploration
• Regular monthly meet-ups in Birmingham
• Social groups led by community members with experienced facilitators
• Educational programs addressing community-identified needs
• Book clubs (reading works by QTIPOC authors)
• Events and community activities
• Online resources, blogs, and signposting
• Discussions that impact change to mainstream Birmingham services

Topics Covered:
• Family relationships and acceptance
• Sexual health and wellbeing
• Housing advice and support
• Faith and sexuality/gender identity
• Rights within the workplace
• Identity exploration and coming out
• Community building and organizing
• Any needs identified by the community

How to Access:
• Email: contactunmuted@gmail.com
• Website: www.unmutedbrum.com
• Follow on social media for event updates
• Based in Birmingham, West Midlands
• All services free
• Open to all QTIPOC people

Community-Led Approach:
• Decisions made by QTIPOC community members
• Programming based on what community actually needs
• Use outcomes of discussions to advocate for better mainstream services
• Creates ripple effect of change beyond just UNMUTED spaces
• Building sustainable QTIPOC community in Birmingham

Why QTIPOC-Only Spaces Matter:
• Freedom to be fully yourself without code-switching
• Shared lived experiences of racism + homophobia/transphobia
• No need to explain intersectional discrimination
• Build solidarity and mutual support
• Celebrate both cultural heritage and LGBTQ+ identity
• Counter isolation with community connection
• Space to process unique challenges
• Collective healing and resistance

Support Available:
• Peer-to-peer support from others who understand
• Connection to wider Birmingham LGBTQ+ services
• Signposting to housing, health, legal resources
• Community knowledge sharing
• Advocacy support
• Networking and professional connections

Beyond Birmingham:
While UNMUTED is Birmingham-based, their online resources and events sometimes welcome QTIPOC people from across the West Midlands and UK. They're part of a growing network of QTIPOC organizations including UK Black Pride, Colours Youth Network, and local groups.

The Power of Representation:
• Seeing other QTIPOC people living openly
• Learning from shared experiences
• Building intergenerational connections
• Creating visibility for QTIPOC lives
• Challenging erasure in both LGBTQ+ and communities of colour

Getting Involved:
• Attend monthly meet-ups
• Join book clubs and educational sessions
• Follow on social media for updates
• Volunteer or contribute ideas
• Bring your whole self - all identities welcomed

Related Organizations:
• Birmingham LGBT (Birmingham's main LGBTQ+ center)
• UK Black Pride (London-based, annual event)
• Colours Youth Network (youth-focused QTIPOC)
• Opening Doors (older LGBTQ+ people of colour)

Remember: You belong. Your identities are not in conflict. QTIPOC community exists and is growing. You don't have to choose between your racial/cultural identity and your LGBTQ+ identity.`,
        category: 'QTIPOC Support',
        journeyStages: ['stabilization', 'growth', 'community_healing', 'advocacy'],
        location: ['birmingham'],
        tags: ['QTIPOC', 'people of colour', 'Birmingham', 'West Midlands', 'community', 'safe spaces', 'intersectional', 'UNMUTED', 'representation', 'peer support', 'Black LGBTQ+', 'book club', 'advocacy'],
        sources: ['unmutedbrum.com', 'Birmingham LGBT'],
        lastUpdated: new Date('2025-01-15'),
        verificationStatus: 'verified',
        communityValidated: false
      },
      {
        id: 'lgbtq-youth-homelessness-support',
        title: 'Support for LGBTQ+ Youth Experiencing Homelessness',
        content: `LGBTQ+ young people are significantly overrepresented in youth homelessness, with 24% of homeless young people identifying as LGBTQ+. For Black LGBTQ+ youth, the intersection of racism and homophobia creates additional barriers.

The Crisis:
• 24% of homeless young people identify as LGBTQ+
• 77% believe coming out to parents was the main factor
• Family rejection is the leading cause
• LGBTQ+ youth face higher risk of exploitation and violence when homeless
• Black LGBTQ+ youth face compounded discrimination

akt (Albert Kennedy Trust) - National Support:
• UK's leading LGBTQ+ youth homelessness charity
• Serves young people aged 16-25
• 47% of those supported are Black, Brown, or People of Colour
• 27% specifically identify as Black

What akt offers:
• Emergency accommodation referrals
• Assigned caseworkers for 1-1 support
• Housing advice and advocacy
• Financial information and support
• Mental health support
• Identity and cultural guidance
• Employment and training assistance
• QTIPOC-specific resources and community connections

Locations and access:
• Offices in London, Manchester, Newcastle, and Bristol
• Online chat support available UK-wide
• Phone: 020 7831 6562
• Email: contact@akt.org.uk
• Self-referral available on website
• Agency referrals accepted

Immediate steps if homeless or at risk:
1. Contact akt via phone, email, or online chat
2. Fill out self-referral form on their website
3. You'll be assigned a caseworker
4. Access emergency accommodation if needed
5. Get personalized support plan

Other housing resources:
• Shelter: 0808 800 4444 (general housing advice)
• Local council housing department (duty to assist under 25s)
• LGBT+ Switchboard: 0300 330 0630 (can signpost to local services)

Why akt is different:
• Understands LGBTQ+ specific issues
• Culturally competent with BPOC youth (47% of clients)
• No judgment about sexuality or gender identity
• Long-term support, not just emergency help
• Connects you to LGBTQ+ community
• Founded in 1989 - over 30 years experience

Your rights:
• Under 18: Local authority has legal duty to accommodate you
• 16-17: Cannot be left without accommodation
• 18-25: Priority for social housing if vulnerable
• Can't be discriminated against for being LGBTQ+`,
        category: 'Housing Crisis',
        journeyStages: ['crisis', 'stabilization', 'growth'],
        location: ['unknown'],
        tags: ['youth homelessness', 'LGBTQ+ youth', 'housing crisis', 'akt', 'emergency accommodation', 'QTIPOC', 'family rejection', 'Black youth'],
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
• Black people are 4x more likely to be sectioned under the Mental Health Act
• Black people less likely to receive talking therapies, more likely to be offered medication only
• Underrepresentation of Black therapists in mental health services
• Racism and microaggressions from white therapists harm rather than help
• Cultural misunderstandings lead to misdiagnosis
• Lack of trust in mental health services due to historic and ongoing discrimination
• Black men particularly underserved in mental health support
• Mental health stigma in many Black communities due to cultural/religious factors

For Black LGBTQ+ People Specifically:
• Triple jeopardy: racism + homophobia + mental health stigma
• Higher rates of depression and anxiety due to minority stress
• Family/community rejection compounded by cultural factors
• Isolation from both Black communities (homophobia) and LGBTQ+ spaces (racism)
• Lack of culturally competent AND LGBTQ+-affirming therapy
• Need therapists who understand BOTH experiences without having to explain
• Historic medical abuse of Black bodies creates distrust
• "Strong Black woman/man" stereotypes prevent seeking help

Black Minds Matter UK - Free Therapy by Black Therapists:
• National registered charity providing FREE talking therapy
• All therapists are Black, qualified, and accredited
• Open to ALL Black individuals and families (including LGBTQ+ people)
• Founded to address mental health disparities in Black communities
• Three pillars: therapy provision, awareness raising/education, systems change advocacy

What Black Minds Matter Offers:
• Free 1-to-1 talking therapy (typically 6-12 sessions)
• Qualified, accredited Black therapists (UKCP, BACP registered)
• Culturally appropriate support understanding Black experiences
• Therapy for anxiety, depression, trauma, PTSD, stress, relationship issues
• Individual and family therapy
• Understanding of racism and its mental health impact
• Safe space to discuss experiences without having to explain racism
• No need to code-switch or minimize experiences
• Therapists trained in various modalities (CBT, psychodynamic, person-centered, etc.)

How to Access Black Minds Matter:
1. Visit www.blackmindsmatteruk.com/accessourtherapyservice
2. Fill out online referral form
3. Complete mini-assessment to determine eligibility
4. Join waitlist
5. When space available, comprehensive assessment
6. Matched with appropriate Black therapist
7. Begin therapy sessions (typically online via video)

Eligibility:
• Self-identify as Black (any Black heritage)
• Live in UK
• Experiencing mental health difficulties
• Open to all ages, genders, sexual orientations, disabilities
• Families welcome
• LGBTQ+ affirming services

Waiting Time Reality:
• High demand means waitlists can be several months
• Submit referral as early as possible
• Meanwhile, use crisis services if needed
• Worth the wait for culturally appropriate therapy

Why Black-Specific Mental Health Support Matters:
• Therapists understand racism without needing it explained
• Cultural understanding of family dynamics, community, spirituality
• Recognition of strengths and resilience in Black communities
• Validation of experiences often minimized by white therapists
• Trust and safety with therapist of shared heritage
• No microaggressions or "color-blind" approaches that erase racism
• Understanding of specific mental health impacts of racism and discrimination
• Research shows culturally matched therapy has better outcomes

For Black LGBTQ+ People:
• Can discuss both racism AND homophobia/transphobia
• Therapists understand intersectional identities
• Safe to explore family rejection tied to cultural factors
• Recognition of isolation from both Black and LGBTQ+ communities
• Support navigating multiple marginalized identities
• Culturally appropriate support for coming out processes
• Understanding of Black queer joy and resilience
• No need to choose between identities or educate therapist

Other Mental Health Resources for Black LGBTQ+ People:
• NHS IAPT: Self-refer to local service (can request Black therapist though not guaranteed)
• Black Trans Alliance: Trans-specific counseling by Black therapists
• LGBT Foundation: LGBTQ+-specific mental health support (Manchester)
• Opening Doors London: For Black LGBTQ+ people over 50
• London LGBTQ+ Community Centre: Wellbeing support
• Mind Out: LGBTQ+ mental health charity (can signpost)
• UK Black Pride: Community connection and support

Crisis Support:
• Samaritans: 116 123 (24/7, emotional support)
• Shout: Text "SHOUT" to 85258 (24/7 crisis text line)
• NHS 111: Select mental health option for urgent support
• LGBT+ Switchboard: 0300 330 0630 (10am-10pm daily)
• 999 or A&E: If immediate danger to self or others

Self-Care While Waiting:
• Connect with Black LGBTQ+ community (UK Black Pride, local groups)
• Peer support can be powerful
• Online mental health resources (NHS Every Mind Matters)
• Self-help resources from Mind.org.uk
• Exercise, sleep, routine where possible
• Journaling or creative expression
• Trusted friends/chosen family
• Faith/spiritual support if that's meaningful to you

Advocacy and Systems Change:
• Black Minds Matter also works to change mental health services
• Training professionals to be culturally competent
• Raising awareness of racism in mental health system
• Advocating for more Black therapists in NHS
• Research on mental health disparities
• Your experience matters - can share feedback

What to Expect in Therapy:
• First session: Building relationship with therapist, discussing concerns
• Therapist will ask questions to understand your experiences
• You control what you share and when
• Safe, confidential space
• Different therapeutic approaches depending on your needs
• Can discuss racism, homophobia, family issues, trauma, daily stress
• Goals set collaboratively
• Typically weekly or fortnightly sessions
• You can request different therapist if not a good match

Your Rights:
• Right to culturally appropriate mental health care
• Right to request therapist matching your identity
• Right to confidentiality (exceptions: risk to self/others, child protection)
• Right to complain if experiencing discrimination
• Right to access NHS mental health services regardless of therapy choice
• Right to second opinion
• Right to be treated with dignity and respect

Remember: Seeking mental health support is strength, not weakness. Your mental health matters. You deserve support that understands ALL of who you are. Black Minds Matter exists because the system has failed Black communities - you are not the problem, the system is.`,
        category: 'Mental Health',
        journeyStages: ['crisis', 'stabilization', 'growth', 'community_healing'],
        location: ['unknown'],
        tags: ['mental health', 'Black Minds Matter', 'therapy', 'Black therapists', 'culturally appropriate care', 'free therapy', 'anxiety', 'depression', 'trauma', 'PTSD', 'racism in healthcare', 'LGBTQ+ mental health', 'intersectional support', 'family therapy'],
        sources: ['blackmindsmatteruk.com', 'Mind', 'Mental Health Foundation', 'Race Equality Foundation'],
        lastUpdated: new Date('2025-01-15'),
        verificationStatus: 'verified',
        communityValidated: false
      }
    ]
  }

  /**
   * Get culturally specific resources for Black queer community
   */
  getCulturallySpecificResources(stage: JourneyStage, location: UKLocation): UKResource[] {
    return this.resources.filter(resource => 
      (resource.culturalCompetency.blackSpecific || resource.culturalCompetency.lgbtqSpecific) &&
      resource.journeyStages.includes(stage) &&
      (resource.locations.includes(location) || resource.locations.includes('unknown'))
    )
  }

  /**
   * Update resource with community feedback
   */
  updateResourceWithFeedback(resourceId: string, feedback: any): void {
    // In a real implementation, this would update the database
    console.log(`Community feedback received for resource ${resourceId}:`, feedback)
  }

  /**
   * Add new community-contributed resource
   */
  addCommunityResource(resource: Partial<UKResource>): void {
    // In a real implementation, this would add to database with community validation
    console.log('New community resource submitted for validation:', resource)
  }
}

export default UKKnowledgeBase