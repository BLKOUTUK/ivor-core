import { JourneyContext, JourneyResponse } from '../types/journey.js';
/**
 * Contextual Response Generator
 * Creates culturally affirming, stage-appropriate responses with specific information
 */
export declare class ContextualResponseGenerator {
    private knowledgeBase;
    constructor();
    /**
     * Generate journey-aware response with specific resources and information
     */
    generateResponse(userInput: string, journeyContext: JourneyContext, topic?: string): JourneyResponse;
    /**
     * Get relevant resources based on journey context
     */
    private getRelevantResources;
    /**
     * Get relevant knowledge entries
     */
    private getRelevantKnowledge;
    /**
     * Generate contextual message based on journey stage and resources
     */
    private generateContextualMessage;
    /**
     * Generate crisis-focused response with immediate safety resources
     */
    private generateCrisisResponse;
    /**
     * Generate stabilization-focused response with ongoing support resources
     */
    private generateStabilizationResponse;
    /**
     * Generate growth-focused response with development opportunities
     */
    private generateGrowthResponse;
    /**
     * Generate community healing-focused response
     */
    private generateCommunityHealingResponse;
    /**
     * Generate advocacy-focused response with organizing resources
     */
    private generateAdvocacyResponse;
    /**
     * Generate default response for unclear contexts
     */
    private generateDefaultResponse;
    /**
     * Generate next stage guidance
     */
    private generateNextStageGuidance;
    /**
     * Determine if follow-up is required
     */
    private requiresFollowUp;
    /**
     * Extract topic from user input for knowledge search
     */
    private extractTopicFromInput;
}
export default ContextualResponseGenerator;
//# sourceMappingURL=ContextualResponseGenerator.d.ts.map