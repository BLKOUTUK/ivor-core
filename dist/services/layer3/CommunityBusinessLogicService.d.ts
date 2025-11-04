import { JourneyStage, JourneyContext } from '../../types/journey.js';
import { CommunityProtectionDecision, DemocraticParticipationValidation, BusinessLogicOperationResult } from '../../types/layer3-business-logic.js';
/**
 * Layer 3: Community Business Logic Service
 *
 * CORE RESPONSIBILITY: Community interaction business rules with liberation values
 *
 * PERFECT SEPARATION OF CONCERNS:
 * ✅ ONLY business logic operations
 * ❌ NO API Gateway operations (Layer 2)
 * ❌ NO data persistence (Layer 5)
 * ❌ NO infrastructure management (Layer 6)
 * ❌ NO governance decisions (Layer 4)
 *
 * LIBERATION VALUES EMBEDDED:
 * - Community protection mechanisms
 * - Democratic participation validation
 * - Liberation journey progression rules
 * - Anti-oppression community standards
 * - Black queer empowerment prioritization
 */
export declare class CommunityBusinessLogicService {
    private communityRules;
    private journeyProgressionRules;
    constructor();
    /**
     * Validate community interaction against liberation values
     * PURE BUSINESS LOGIC: Determines if interaction upholds liberation values
     */
    validateCommunityInteraction(interactionType: string, participantContext: JourneyContext, interactionData: any): BusinessLogicOperationResult<CommunityProtectionDecision>;
    /**
     * Calculate liberation journey progression eligibility
     * PURE BUSINESS LOGIC: Determines readiness for next liberation stage
     */
    calculateJourneyProgression(currentContext: JourneyContext, communityContributions: any[], empowermentHistory: any[]): BusinessLogicOperationResult<{
        readyForNextStage: boolean;
        nextStage: JourneyStage | null;
        requirements: string[];
        empowermentScore: number;
    }>;
    /**
     * Validate democratic participation with liberation principles
     * PURE BUSINESS LOGIC: Ensures community decisions uphold liberation values
     */
    validateDemocraticParticipation(participationData: any, communityContext: any, decisionImpact: any): BusinessLogicOperationResult<DemocraticParticipationValidation>;
    private validateLiberationValues;
    private applyCommunityProtection;
    private calculateProtectionScore;
    private calculateLiberationImpact;
    private assessProgressionReadiness;
    private determineNextLiberationStage;
    private applyDemocraticBusinessLogic;
    private calculateDemocraticLiberationAlignment;
    private getApplicableCommunityRules;
    private identifyEmpowermentOpportunities;
    private assessCurrentLiberationAlignment;
    private calculateCommunityBenefit;
    private calculateProgressionCommunityBenefit;
    private generateProtectionMeasures;
    private generateAccessibilityMeasures;
    private generateLiberationRecommendations;
    private generateDemocraticRecommendations;
    private initializeLiberationCommunityRules;
    private initializeJourneyProgressionRules;
}
//# sourceMappingURL=CommunityBusinessLogicService.d.ts.map