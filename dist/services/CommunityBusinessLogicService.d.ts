/**
 * Layer 3: Community Business Logic Service
 * BLKOUT Community Liberation Platform
 *
 * CRITICAL: This service implements ONLY community business logic operations.
 * PERFECT SEPARATION OF CONCERNS:
 * - ONLY business logic for community interactions and liberation journey progression
 * - NO API Gateway operations (Layer 2)
 * - NO data persistence operations (Layer 5)
 * - NO infrastructure management (Layer 6)
 * - NO governance decisions (Layer 4)
 *
 * LIBERATION VALUES EMBEDDED:
 * - Community protection mechanisms in all operations
 * - Democratic participation validation
 * - Liberation journey progression logic
 * - Black queer empowerment prioritized
 * - Cultural authenticity preservation
 */
import { LiberationValues, CommunityProtectionDecision, JourneyProgressionRule, DemocraticParticipationValidation, BusinessLogicOperationResult } from '../types/layer3-business-logic.js';
import { JourneyStage, JourneyContext } from '../types/journey.js';
export declare class CommunityBusinessLogicService {
    private communityRules;
    private journeyProgressionRules;
    private protectionMechanisms;
    constructor();
    /**
     * Validate community interaction based on liberation values and community protection
     * BUSINESS LOGIC ONLY: Determines if interaction aligns with liberation goals
     */
    validateCommunityInteraction(memberId: string, targetCommunityId: string, interactionType: string, journeyContext: JourneyContext, liberationValues: LiberationValues): Promise<BusinessLogicOperationResult<CommunityProtectionDecision>>;
    /**
     * Progress user through liberation journey stages - BUSINESS LOGIC ONLY
     * Determines readiness and applies progression rules based on liberation criteria
     */
    processJourneyProgression(userId: string, currentStage: JourneyStage, targetStage: JourneyStage, journeyContext: JourneyContext, liberationValues: LiberationValues): Promise<BusinessLogicOperationResult<JourneyProgressionRule>>;
    /**
     * Validate democratic participation in community decisions - BUSINESS LOGIC ONLY
     * Ensures participation meets liberation and empowerment standards
     */
    validateDemocraticParticipation(participantId: string, participationType: string, communityContext: any, liberationValues: LiberationValues): Promise<BusinessLogicOperationResult<DemocraticParticipationValidation>>;
    private validateLiberationValues;
    private applyProtectionMechanisms;
    private findProgressionRule;
    private identifyEmpowermentOpportunities;
    private calculateInteractionLiberationImpact;
    private initializeCommunityLiberationRules;
    private generateProtectionReasoning;
    private generateInteractionRecommendations;
    private calculateCommunityBenefit;
    private assessLiberationReadiness;
    private validateCommunitySupport;
    private validateEmpowermentRequirements;
    private calculateProgressionEmpowermentImpact;
    private calculateProgressionCommunityBenefit;
    private generateProgressionRecommendations;
    private calculateDemocraticAccessibility;
    private assessParticipationQuality;
    private calculateParticipationEmpowermentLevel;
    private assessParticipationLiberationAlignment;
    private generateAccessibilityMeasures;
    private calculateParticipationCommunityBenefit;
    private generateParticipationRecommendations;
    private checkRuleViolation;
    private isVulnerableJourneyStage;
}
export default CommunityBusinessLogicService;
//# sourceMappingURL=CommunityBusinessLogicService.d.ts.map