import { JourneyResponse, KnowledgeEntry, UKResource } from '../types/journey.js';
/**
 * Honest Response Guard
 * Ensures IVOR provides honest, humble responses about its limitations
 * rather than generic fallback statements
 */
export declare class HonestResponseGuard {
    private static readonly MIN_CONFIDENCE_THRESHOLD;
    private static readonly MIN_RESOURCES_FOR_CONFIDENCE;
    private static readonly MIN_KNOWLEDGE_FOR_CONFIDENCE;
    /**
     * Evaluate if IVOR has sufficient confidence to provide a response
     */
    static evaluateResponseConfidence(query: string, resources: UKResource[], knowledge: KnowledgeEntry[], trustScore: number): {
        shouldRespond: boolean;
        confidenceLevel: 'high' | 'medium' | 'low' | 'insufficient';
        reason: string;
    };
    /**
     * Generate honest response when confidence is insufficient
     */
    static generateHonestLimitationResponse(query: string, attemptedResources: UKResource[], attemptedKnowledge: KnowledgeEntry[]): JourneyResponse;
    /**
     * Check if query contains emergency indicators
     */
    private static containsEmergencyIndicators;
    /**
     * Identify the main topic area of a query
     */
    private static identifyQueryTopic;
    /**
     * Get suggested sources for a topic area
     */
    private static getSuggestedSourcesForTopic;
    /**
     * Get emergency resources for crisis situations
     */
    private static getEmergencyResources;
}
export default HonestResponseGuard;
//# sourceMappingURL=HonestResponseGuard.d.ts.map