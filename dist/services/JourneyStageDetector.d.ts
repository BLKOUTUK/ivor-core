import { JourneyStage, JourneyContext } from '../types/journey.js';
/**
 * Journey Stage Detection Engine
 * Recognizes where users are in their UK Black queer liberation journey
 */
export declare class JourneyStageDetector {
    private journeyIndicators;
    constructor();
    /**
     * Detect journey stage from user input and context
     */
    detectJourneyStage(userInput: string, previousStages?: JourneyStage[], userProfile?: any): JourneyContext;
    /**
     * Calculate score for a specific journey stage
     */
    private calculateStageScore;
    /**
     * Create comprehensive journey context
     */
    private createJourneyContext;
    /**
     * Detect emotional state from input
     */
    private detectEmotionalState;
    /**
     * Detect urgency level
     */
    private detectUrgencyLevel;
    /**
     * Detect UK location
     */
    private detectLocation;
    /**
     * Detect community connection level
     */
    private detectCommunityConnection;
    /**
     * Detect resource access preference
     */
    private detectResourcePreference;
}
export default JourneyStageDetector;
//# sourceMappingURL=JourneyStageDetector.d.ts.map