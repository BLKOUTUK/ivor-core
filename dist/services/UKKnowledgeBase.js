"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UKKnowledgeBase = void 0;
/**
 * UK Knowledge Base for Black Queer Community Resources
 * Integrates menrus.co.uk, NHS, and community-specific resources
 */
class UKKnowledgeBase {
    constructor() {
        this.resources = this.initializeResources();
        this.knowledgeEntries = this.initializeKnowledgeEntries();
    }
    /**
     * Get resources filtered by journey stage and location
     */
    getResourcesByStageAndLocation(stage, location, urgency, category) {
        let filteredResources = this.resources.filter(resource => resource.journeyStages.includes(stage) &&
            (resource.locations.includes(location) || resource.locations.includes('unknown')));
        // Emergency resources take priority
        if (urgency === 'emergency') {
            filteredResources = filteredResources.filter(r => r.emergency);
        }
        // Filter by category if specified
        if (category) {
            filteredResources = filteredResources.filter(r => r.category.toLowerCase().includes(category.toLowerCase()));
        }
        // Sort by relevance: emergency first, then free/NHS, then specific to community
        return filteredResources.sort((a, b) => {
            if (a.emergency && !b.emergency)
                return -1;
            if (!a.emergency && b.emergency)
                return 1;
            if ((a.cost === 'free' || a.cost === 'nhs_funded') &&
                (b.cost !== 'free' && b.cost !== 'nhs_funded'))
                return -1;
            if ((b.cost === 'free' || b.cost === 'nhs_funded') &&
                (a.cost !== 'free' && a.cost !== 'nhs_funded'))
                return 1;
            const aSpecific = a.culturalCompetency.blackSpecific || a.culturalCompetency.lgbtqSpecific;
            const bSpecific = b.culturalCompetency.blackSpecific || b.culturalCompetency.lgbtqSpecific;
            if (aSpecific && !bSpecific)
                return -1;
            if (!aSpecific && bSpecific)
                return 1;
            return 0;
        });
    }
    /**
     * Get knowledge entries by topic and journey stage
     */
    getKnowledgeByTopic(topic, stage, location) {
        return this.knowledgeEntries.filter(entry => entry.journeyStages.includes(stage) &&
            entry.location.includes(location) &&
            (entry.category.toLowerCase().includes(topic.toLowerCase()) ||
                entry.tags.some(tag => tag.toLowerCase().includes(topic.toLowerCase())))).sort((a, b) => {
            // Prioritize community-validated and recently updated content
            if (a.communityValidated && !b.communityValidated)
                return -1;
            if (!a.communityValidated && b.communityValidated)
                return 1;
            return b.lastUpdated.getTime() - a.lastUpdated.getTime();
        });
    }
    /**
     * Search for specific health information from menrus.co.uk integration
     */
    getMenrusHealthInfo(query, stage) {
        const healthKeywords = ['hiv', 'prep', 'pep', 'sexual health', 'sti', 'testing', 'treatment'];
        const isHealthQuery = healthKeywords.some(keyword => query.toLowerCase().includes(keyword));
        if (!isHealthQuery)
            return [];
        return this.knowledgeEntries.filter(entry => entry.sources.includes('menrus.co.uk') &&
            entry.journeyStages.includes(stage) &&
            healthKeywords.some(keyword => entry.content.toLowerCase().includes(keyword) ||
                entry.tags.some(tag => tag.toLowerCase().includes(keyword))));
    }
    /**
     * Get emergency resources immediately
     */
    getEmergencyResources(location) {
        return this.resources
            .filter(r => r.emergency)
            .filter(r => r.locations.includes(location) || r.locations.includes('unknown'))
            .sort((a, b) => {
            // Prioritize 24/7 availability
            if (a.availability.includes('24/7') && !b.availability.includes('24/7'))
                return -1;
            if (!a.availability.includes('24/7') && b.availability.includes('24/7'))
                return 1;
            return 0;
        });
    }
    /**
     * Initialize comprehensive UK resource database
     */
    initializeResources() {
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
            }
        ];
    }
    /**
     * Initialize knowledge entries with UK-specific information
     */
    initializeKnowledgeEntries() {
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
            }
        ];
    }
    /**
     * Get culturally specific resources for Black queer community
     */
    getCulturallySpecificResources(stage, location) {
        return this.resources.filter(resource => (resource.culturalCompetency.blackSpecific || resource.culturalCompetency.lgbtqSpecific) &&
            resource.journeyStages.includes(stage) &&
            (resource.locations.includes(location) || resource.locations.includes('unknown')));
    }
    /**
     * Update resource with community feedback
     */
    updateResourceWithFeedback(resourceId, feedback) {
        // In a real implementation, this would update the database
        console.log(`Community feedback received for resource ${resourceId}:`, feedback);
    }
    /**
     * Add new community-contributed resource
     */
    addCommunityResource(resource) {
        // In a real implementation, this would add to database with community validation
        console.log('New community resource submitted for validation:', resource);
    }
}
exports.UKKnowledgeBase = UKKnowledgeBase;
exports.default = UKKnowledgeBase;
//# sourceMappingURL=UKKnowledgeBase.js.map