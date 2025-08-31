"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JourneyAwareConversationService = void 0;
const JourneyStageDetector_js_1 = require("./JourneyStageDetector.js");
const UKKnowledgeBase_js_1 = require("./UKKnowledgeBase.js");
const ContextualResponseGenerator_js_1 = require("./ContextualResponseGenerator.js");
const TrustScoreService_js_1 = require("./TrustScoreService.js");
const crypto_1 = require("crypto");
/**
 * Journey-Aware Conversation Service
 * Orchestrates the complete journey-aware experience integrating all components
 */
class JourneyAwareConversationService {
    constructor(conversationService) {
        this.journeyDetector = new JourneyStageDetector_js_1.JourneyStageDetector();
        this.knowledgeBase = new UKKnowledgeBase_js_1.UKKnowledgeBase();
        this.responseGenerator = new ContextualResponseGenerator_js_1.ContextualResponseGenerator();
        this.trustScoreService = new TrustScoreService_js_1.TrustScoreService();
        this.conversationService = conversationService;
        this.userJourneyHistory = new Map();
    }
    /**
     * Generate journey-aware response with full context analysis
     */
    async generateJourneyAwareResponse(message, userContext = {}, sessionId = 'default') {
        try {
            // Get user's journey history
            const userId = userContext.userId || 'anonymous';
            const previousStages = this.userJourneyHistory.get(userId) || [];
            // Detect current journey stage and context
            const journeyContext = this.journeyDetector.detectJourneyStage(message, previousStages, userContext);
            // Update user journey history
            this.updateJourneyHistory(userId, journeyContext.stage);
            // Extract topic for better resource matching
            const topic = this.extractTopicFromMessage(message);
            // Generate contextual response
            const baseResponse = this.responseGenerator.generateResponse(message, journeyContext, topic);
            // Calculate trust scores for knowledge and resources
            const trustScores = await this.calculateTrustScores(baseResponse);
            // Create enhanced response with trust information
            const response = await this.enhanceResponseWithTrust(baseResponse, trustScores);
            // Store conversation context if AI is available
            if (this.conversationService.isAIAvailable()) {
                await this.storeJourneyContext(userId, sessionId, journeyContext, response);
            }
            // Log journey progression for community analytics (privacy-preserving)
            this.logJourneyProgression(journeyContext, response);
            return response;
        }
        catch (error) {
            console.error('Error generating journey-aware response:', error);
            // Be honest about system limitations rather than providing generic responses
            console.log('🚨 System fallback triggered due to error - providing honest limitation response');
            return this.generateFallbackResponse(message, userContext);
        }
    }
    /**
     * Get user's journey progression over time
     */
    getUserJourneyProgression(userId) {
        return this.userJourneyHistory.get(userId) || [];
    }
    /**
     * Check if user might be ready for next journey stage
     */
    assessNextStageReadiness(userId, currentContext) {
        const history = this.getUserJourneyProgression(userId);
        // Stability indicators
        if (currentContext.stage === 'crisis' && history.filter(s => s === 'crisis').length < 3) {
            return false; // Need more crisis support first
        }
        if (currentContext.stage === 'stabilization' && history.includes('growth')) {
            return true; // Has experienced growth before
        }
        // Community connection indicators
        if (currentContext.communityConnection === 'organizing') {
            return currentContext.stage !== 'advocacy'; // Ready for advocacy if not already there
        }
        return true; // Default to ready
    }
    /**
     * Get emergency response for crisis situations
     */
    async getEmergencyResponse(message, userContext = {}, sessionId = 'default') {
        // Force crisis stage detection
        const crisisContext = {
            stage: 'crisis',
            emotionalState: 'crisis',
            urgencyLevel: 'emergency',
            location: userContext.location || 'unknown',
            communityConnection: 'isolated',
            firstTime: true,
            returningUser: false,
            resourceAccessPreference: 'phone'
        };
        const baseResponse = this.responseGenerator.generateResponse(message, crisisContext, 'crisis');
        // Calculate trust scores for emergency response
        const trustScores = await this.calculateTrustScores(baseResponse);
        const response = await this.enhanceResponseWithTrust(baseResponse, trustScores);
        return response;
    }
    /**
     * Update user journey history
     */
    updateJourneyHistory(userId, currentStage) {
        if (!this.userJourneyHistory.has(userId)) {
            this.userJourneyHistory.set(userId, []);
        }
        const history = this.userJourneyHistory.get(userId);
        // Only add if it's a different stage or been a while since last entry
        const lastStage = history[history.length - 1];
        if (lastStage !== currentStage) {
            history.push(currentStage);
            // Keep last 20 journey stages to prevent memory bloat
            if (history.length > 20) {
                history.shift();
            }
        }
    }
    /**
     * Store journey context for AI conversation service
     */
    async storeJourneyContext(userId, sessionId, journeyContext, response) {
        try {
            // Store journey stage progression
            await this.conversationService.storeConversationMemory(userId, sessionId, 'journey_stage', `stage_${Date.now()}`, {
                stage: journeyContext.stage,
                emotionalState: journeyContext.emotionalState,
                urgencyLevel: journeyContext.urgencyLevel,
                location: journeyContext.location,
                communityConnection: journeyContext.communityConnection
            }, 0.8 // High importance for journey tracking
            );
            // Store resource effectiveness tracking
            if (response.resources.length > 0) {
                await this.conversationService.storeConversationMemory(userId, sessionId, 'resources_provided', `resources_${Date.now()}`, {
                    resources: response.resources.map(r => ({
                        id: r.id,
                        title: r.title,
                        category: r.category,
                        stage: journeyContext.stage
                    }))
                }, 0.6);
            }
        }
        catch (error) {
            console.error('Error storing journey context:', error);
        }
    }
    /**
     * Extract topic from message for better resource matching
     */
    extractTopicFromMessage(message) {
        const lowerMessage = message.toLowerCase();
        // Health-related topics
        const healthKeywords = ['hiv', 'prep', 'pep', 'sexual health', 'sti', 'testing', 'treatment', 'diagnosis'];
        if (healthKeywords.some(keyword => lowerMessage.includes(keyword))) {
            return 'sexual health';
        }
        // Mental health topics
        const mentalHealthKeywords = ['therapy', 'counselling', 'depression', 'anxiety', 'mental health', 'suicidal'];
        if (mentalHealthKeywords.some(keyword => lowerMessage.includes(keyword))) {
            return 'mental health';
        }
        // Housing topics
        const housingKeywords = ['evicted', 'housing', 'homeless', 'rent', 'landlord', 'accommodation'];
        if (housingKeywords.some(keyword => lowerMessage.includes(keyword))) {
            return 'housing';
        }
        // Legal topics
        const legalKeywords = ['discrimination', 'rights', 'legal', 'employment', 'tribunal', 'harassment'];
        if (legalKeywords.some(keyword => lowerMessage.includes(keyword))) {
            return 'legal';
        }
        // Community topics
        const communityKeywords = ['community', 'group', 'events', 'pride', 'support group', 'peers'];
        if (communityKeywords.some(keyword => lowerMessage.includes(keyword))) {
            return 'community';
        }
        return 'general';
    }
    /**
     * Log journey progression for community analytics (privacy-preserving)
     */
    logJourneyProgression(journeyContext, response) {
        // Only log aggregated, anonymous data for community insights
        const anonymizedData = {
            stage: journeyContext.stage,
            location_region: this.anonymizeLocation(journeyContext.location),
            resources_provided: response.resources.length,
            knowledge_provided: response.knowledge.length,
            follow_up_needed: response.followUpRequired,
            timestamp: new Date().toISOString()
        };
        console.log('Journey Analytics (Anonymous):', anonymizedData);
    }
    /**
     * Anonymize location for privacy-preserving analytics
     */
    anonymizeLocation(location) {
        // Convert specific locations to regions for privacy
        const cityToRegion = {
            'london': 'london',
            'manchester': 'north_england',
            'birmingham': 'midlands',
            'leeds': 'north_england',
            'glasgow': 'scotland',
            'cardiff': 'wales',
            'belfast': 'northern_ireland',
            'bristol': 'south_west',
            'liverpool': 'north_west',
            'sheffield': 'north_england',
            'nottingham': 'midlands',
            'brighton': 'south_east',
            'other_urban': 'urban',
            'rural': 'rural',
            'unknown': 'unknown'
        };
        return cityToRegion[location] || 'unknown';
    }
    /**
     * Generate honest fallback response when journey system fails
     */
    generateFallbackResponse(message, userContext) {
        return {
            message: `💜 I want to be honest with you - I'm experiencing technical difficulties and cannot currently provide the personalized, journey-aware support I'm designed to offer.

🚨 **If this is an emergency**: Please call 999 or go to your nearest A&E immediately
📞 **Crisis support**: Samaritans 116 123 (free, 24/7, confidential)
🏳️‍🌈 **LGBTQ+ support**: LGBT+ Switchboard 0300 330 0630

Rather than give you generic information that might not match your specific situation, I'd prefer to direct you to these reliable resources where you can get proper support:

• **NHS.uk** for verified health information
• **menrus.co.uk** for Black gay men's sexual health
• **Local LGBTQ+ organizations** in your area

I don't want to pretend I can help when my systems aren't working properly. Please reach out to the appropriate services above, and I hope to serve you better when my technical issues are resolved.`,
            journeyStage: 'growth',
            nextStagePathway: 'Please seek direct support from the resources above while I work to resolve technical issues.',
            resources: [],
            knowledge: [],
            followUpRequired: true,
            culturallyAffirming: true,
            specificInformation: false,
            trustScore: 0.0, // Low trust when in fallback mode
            trustLevel: 'very_low',
            trustDescription: 'System experiencing technical difficulties - seek direct support',
            sourceVerification: { verified: 0, unverified: 0, total: 0 },
            requestFeedback: false, // Don't request feedback when system is broken
            responseId: (0, crypto_1.randomUUID)()
        };
    }
    /**
     * Calculate trust scores for knowledge and resources in response
     */
    async calculateTrustScores(response) {
        const knowledgeScores = new Map();
        const resourceScores = new Map();
        let totalScore = 0;
        let itemCount = 0;
        let verifiedSources = 0;
        let totalSources = 0;
        // Calculate trust scores for knowledge entries
        for (const knowledge of response.knowledge) {
            const score = await this.trustScoreService.calculateKnowledgeTrustScore(knowledge);
            knowledgeScores.set(knowledge.id, score);
            totalScore += score;
            itemCount++;
            // Count verified sources
            for (const source of knowledge.sources) {
                totalSources++;
                const isVerified = source.toLowerCase().includes('nhs.uk') ||
                    source.toLowerCase().includes('gov.uk') ||
                    source.toLowerCase().includes('menrus.co.uk');
                if (isVerified)
                    verifiedSources++;
            }
        }
        // Calculate trust scores for resources
        for (const resource of response.resources) {
            const score = await this.trustScoreService.calculateResourceTrustScore(resource);
            resourceScores.set(resource.id, score);
            totalScore += score;
            itemCount++;
        }
        const overallTrustScore = itemCount > 0 ? totalScore / itemCount : 0.5;
        return {
            knowledgeScores,
            resourceScores,
            overallTrustScore,
            sourceVerification: {
                verified: verifiedSources,
                unverified: totalSources - verifiedSources,
                total: totalSources
            }
        };
    }
    /**
     * Enhance response with trust scoring information
     */
    async enhanceResponseWithTrust(baseResponse, trustScores) {
        const trustInterpretation = this.trustScoreService.getTrustScoreInterpretation(trustScores.overallTrustScore);
        return {
            ...baseResponse,
            trustScore: trustScores.overallTrustScore,
            trustLevel: trustInterpretation.level,
            trustDescription: trustInterpretation.description,
            sourceVerification: trustScores.sourceVerification,
            requestFeedback: true, // Always request feedback for learning
            responseId: (0, crypto_1.randomUUID)()
        };
    }
    /**
     * Store user feedback for improving trust scores
     */
    async storeFeedback(responseId, userId, rating, feedback, helpful) {
        try {
            // In a real implementation, this would store to database
            console.log('Feedback received:', {
                responseId,
                userId: this.anonymizeUserId(userId),
                rating,
                feedback,
                helpful,
                timestamp: new Date().toISOString()
            });
            // TODO: Implement database storage
            // TODO: Update trust scores based on feedback
            // TODO: Trigger retraining of pattern weights
        }
        catch (error) {
            console.error('Error storing feedback:', error);
        }
    }
    /**
     * Anonymize user ID for privacy
     */
    anonymizeUserId(userId) {
        // Simple hash for demo - use proper hashing in production
        return Buffer.from(userId).toString('base64').substring(0, 8);
    }
    /**
     * Get system health for monitoring
     */
    getSystemHealth() {
        const trustSystemHealth = this.trustScoreService.getSystemHealth();
        return {
            journeyDetector: 'operational',
            knowledgeBase: 'operational',
            responseGenerator: 'operational',
            trustScoreService: 'operational',
            conversationService: this.conversationService.isAIAvailable() ? 'operational' : 'fallback_mode',
            userJourneyHistory: this.userJourneyHistory.size,
            trustScoring: {
                cacheSize: trustSystemHealth.cacheSize,
                lastValidation: trustSystemHealth.lastValidationRun
            },
            timestamp: new Date().toISOString()
        };
    }
}
exports.JourneyAwareConversationService = JourneyAwareConversationService;
exports.default = JourneyAwareConversationService;
//# sourceMappingURL=JourneyAwareConversationService.js.map