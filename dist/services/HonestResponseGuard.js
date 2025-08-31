"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HonestResponseGuard = void 0;
/**
 * Honest Response Guard
 * Ensures IVOR provides honest, humble responses about its limitations
 * rather than generic fallback statements
 */
class HonestResponseGuard {
    /**
     * Evaluate if IVOR has sufficient confidence to provide a response
     */
    static evaluateResponseConfidence(query, resources, knowledge, trustScore) {
        // Check if we have any relevant content
        const hasResources = resources.length >= this.MIN_RESOURCES_FOR_CONFIDENCE;
        const hasKnowledge = knowledge.length >= this.MIN_KNOWLEDGE_FOR_CONFIDENCE;
        const hasSufficientTrust = trustScore >= this.MIN_CONFIDENCE_THRESHOLD;
        // High confidence: Good resources, knowledge, and trust
        if (hasResources && hasKnowledge && hasSufficientTrust && trustScore >= 0.7) {
            return {
                shouldRespond: true,
                confidenceLevel: 'high',
                reason: 'Strong resource match with verified information'
            };
        }
        // Medium confidence: Some resources or knowledge with decent trust
        if ((hasResources || hasKnowledge) && hasSufficientTrust) {
            return {
                shouldRespond: true,
                confidenceLevel: 'medium',
                reason: 'Some relevant information available with acceptable trust level'
            };
        }
        // Low confidence: Minimal resources but emergency indicators
        if (this.containsEmergencyIndicators(query)) {
            return {
                shouldRespond: true,
                confidenceLevel: 'low',
                reason: 'Emergency situation detected - providing crisis resources'
            };
        }
        // Insufficient confidence: Better to be honest
        return {
            shouldRespond: false,
            confidenceLevel: 'insufficient',
            reason: 'Insufficient reliable information to provide helpful response'
        };
    }
    /**
     * Generate honest response when confidence is insufficient
     */
    static generateHonestLimitationResponse(query, attemptedResources, attemptedKnowledge) {
        const isEmergency = this.containsEmergencyIndicators(query);
        if (isEmergency) {
            return {
                message: `🚨 **This sounds urgent** - I want to make sure you get immediate, proper help:

**Emergency Services**: 999 (if in immediate danger)
**Crisis Support**: Samaritans 116 123 (free, 24/7)
**LGBTQ+ Crisis**: LGBT+ Switchboard 0300 330 0630

I'm designed to provide personalized support, but I don't have enough verified information to give you the specific guidance you need right now. Please contact these services directly - they have trained professionals who can help immediately.`,
                journeyStage: 'crisis',
                nextStagePathway: 'Please contact crisis services directly for immediate professional support',
                resources: this.getEmergencyResources(),
                knowledge: [],
                followUpRequired: true,
                culturallyAffirming: true,
                specificInformation: false,
                trustScore: 0.2,
                trustLevel: 'very_low',
                trustDescription: 'Limited system knowledge - seek direct professional support',
                sourceVerification: { verified: 0, unverified: 0, total: 0 },
                requestFeedback: false,
                responseId: crypto.randomUUID()
            };
        }
        // Non-emergency honest response
        const topicArea = this.identifyQueryTopic(query);
        const suggestedSources = this.getSuggestedSourcesForTopic(topicArea);
        return {
            message: `💜 I want to be honest - I don't have enough reliable, verified information to give you the specific guidance you're looking for about ${topicArea}.

Rather than guess or give you generic information that might not apply to your situation, I'd recommend going directly to these trusted sources:

${suggestedSources.map(source => `• **${source.name}**: ${source.description}`).join('\n')}

I'm designed to provide journey-aware, culturally affirming support for Black queer liberation, but I believe you deserve accurate, verified information rather than my best guess. These sources will give you the reliable information you need.

If this was urgent and I missed that, please call the emergency numbers above immediately.`,
            journeyStage: 'growth',
            nextStagePathway: 'Seek verified information from trusted sources listed above',
            resources: [],
            knowledge: [],
            followUpRequired: false,
            culturallyAffirming: true,
            specificInformation: false,
            trustScore: 0.1,
            trustLevel: 'very_low',
            trustDescription: 'Insufficient system knowledge - directing to trusted sources',
            sourceVerification: { verified: 0, unverified: 0, total: 0 },
            requestFeedback: true, // Ask for feedback to improve
            responseId: crypto.randomUUID()
        };
    }
    /**
     * Check if query contains emergency indicators
     */
    static containsEmergencyIndicators(query) {
        const emergencyKeywords = [
            'emergency', 'urgent', 'crisis', 'suicidal', 'kill myself', 'overdose',
            'danger', 'threat', 'abuse', 'violence', 'hospital', 'ambulance',
            'dying', 'hurt myself', 'can\'t cope', 'breaking down', 'end it all'
        ];
        const lowerQuery = query.toLowerCase();
        return emergencyKeywords.some(keyword => lowerQuery.includes(keyword));
    }
    /**
     * Identify the main topic area of a query
     */
    static identifyQueryTopic(query) {
        const lowerQuery = query.toLowerCase();
        if (['hiv', 'prep', 'pep', 'sti', 'sexual health'].some(term => lowerQuery.includes(term))) {
            return 'sexual health';
        }
        if (['mental health', 'therapy', 'depression', 'anxiety'].some(term => lowerQuery.includes(term))) {
            return 'mental health';
        }
        if (['housing', 'homeless', 'eviction'].some(term => lowerQuery.includes(term))) {
            return 'housing';
        }
        if (['legal', 'discrimination', 'rights', 'employment'].some(term => lowerQuery.includes(term))) {
            return 'legal rights';
        }
        if (['community', 'support group', 'events'].some(term => lowerQuery.includes(term))) {
            return 'community support';
        }
        return 'general support';
    }
    /**
     * Get suggested sources for a topic area
     */
    static getSuggestedSourcesForTopic(topic) {
        const sourceMap = {
            'sexual health': [
                { name: 'NHS Sexual Health Services', description: 'Free, confidential sexual health testing and treatment' },
                { name: 'menrus.co.uk', description: 'Sexual health resources specifically for Black gay men' },
                { name: 'Terrence Higgins Trust', description: 'HIV and sexual health support and information' }
            ],
            'mental health': [
                { name: 'NHS IAPT Services', description: 'Free NHS therapy for anxiety and depression - self-referral available' },
                { name: 'Mind.org.uk', description: 'Mental health information and local services directory' },
                { name: 'Your GP', description: 'First point of contact for NHS mental health services' }
            ],
            'housing': [
                { name: 'Shelter', description: 'Housing advice helpline: 0808 800 4444' },
                { name: 'Local Council Housing Team', description: 'Statutory housing support and emergency accommodation' },
                { name: 'Citizens Advice', description: 'Free housing and legal advice' }
            ],
            'legal rights': [
                { name: 'ACAS (Advisory, Conciliation & Arbitration Service)', description: 'Employment law advice: 0300 123 1100' },
                { name: 'Equality and Human Rights Commission', description: 'Discrimination and equality law guidance' },
                { name: 'Citizens Advice', description: 'Free legal advice and support' }
            ],
            'community support': [
                { name: 'UK Black Pride', description: 'Community events and support for LGBTQ+ people of color' },
                { name: 'Local LGBTQ+ Centers', description: 'Community support groups and services in your area' },
                { name: 'LGBT+ Switchboard', description: 'Information and support: 0300 330 0630' }
            ]
        };
        return sourceMap[topic] || [
            { name: 'NHS.uk', description: 'Verified health and social care information' },
            { name: 'Gov.UK', description: 'Official government services and information' },
            { name: 'Citizens Advice', description: 'Free, independent advice on your rights' }
        ];
    }
    /**
     * Get emergency resources for crisis situations
     */
    static getEmergencyResources() {
        return [
            {
                id: 'emergency-999',
                title: 'Emergency Services',
                description: 'Call 999 for immediate emergency assistance',
                category: 'Emergency',
                journeyStages: ['crisis'],
                phone: '999',
                locations: ['unknown'],
                specializations: ['emergency response'],
                accessRequirements: ['none'],
                cost: 'free',
                culturalCompetency: {
                    lgbtqSpecific: false,
                    blackSpecific: false,
                    transSpecific: false,
                    disabilityAware: false
                },
                emergency: true,
                availability: '24/7',
                languages: ['English']
            }
        ];
    }
}
exports.HonestResponseGuard = HonestResponseGuard;
HonestResponseGuard.MIN_CONFIDENCE_THRESHOLD = 0.3;
HonestResponseGuard.MIN_RESOURCES_FOR_CONFIDENCE = 1;
HonestResponseGuard.MIN_KNOWLEDGE_FOR_CONFIDENCE = 1;
exports.default = HonestResponseGuard;
//# sourceMappingURL=HonestResponseGuard.js.map