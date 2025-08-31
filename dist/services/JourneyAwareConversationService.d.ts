import ConversationService from '../conversationService.js';
import { JourneyContext, JourneyResponse, JourneyStage } from '../types/journey.js';
/**
 * Journey-Aware Conversation Service
 * Orchestrates the complete journey-aware experience integrating all components
 */
export declare class JourneyAwareConversationService {
    private journeyDetector;
    private knowledgeBase;
    private responseGenerator;
    private trustScoreService;
    private conversationService;
    private userJourneyHistory;
    constructor(conversationService: ConversationService);
    /**
     * Generate journey-aware response with full context analysis
     */
    generateJourneyAwareResponse(message: string, userContext?: any, sessionId?: string): Promise<JourneyResponse>;
    /**
     * Get user's journey progression over time
     */
    getUserJourneyProgression(userId: string): JourneyStage[];
    /**
     * Check if user might be ready for next journey stage
     */
    assessNextStageReadiness(userId: string, currentContext: JourneyContext): boolean;
    /**
     * Get emergency response for crisis situations
     */
    getEmergencyResponse(message: string, userContext?: any, sessionId?: string): Promise<JourneyResponse>;
    /**
     * Update user journey history
     */
    private updateJourneyHistory;
    /**
     * Store journey context for AI conversation service
     */
    private storeJourneyContext;
    /**
     * Extract topic from message for better resource matching
     */
    private extractTopicFromMessage;
    /**
     * Log journey progression for community analytics (privacy-preserving)
     */
    private logJourneyProgression;
    /**
     * Anonymize location for privacy-preserving analytics
     */
    private anonymizeLocation;
    /**
     * Generate honest fallback response when journey system fails
     */
    private generateFallbackResponse;
    /**
     * Calculate trust scores for knowledge and resources in response
     */
    private calculateTrustScores;
    /**
     * Enhance response with trust scoring information
     */
    private enhanceResponseWithTrust;
    /**
     * Store user feedback for improving trust scores
     */
    storeFeedback(responseId: string, userId: string, rating: number, feedback?: string, helpful?: boolean): Promise<void>;
    /**
     * Anonymize user ID for privacy
     */
    private anonymizeUserId;
    /**
     * Get system health for monitoring
     */
    getSystemHealth(): any;
}
export default JourneyAwareConversationService;
//# sourceMappingURL=JourneyAwareConversationService.d.ts.map