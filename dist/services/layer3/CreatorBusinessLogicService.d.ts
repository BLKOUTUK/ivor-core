import { CreatorSovereigntyCalculation, CreatorAttributionRights, EconomicEmpowermentTracking, BusinessLogicOperationResult } from '../../types/layer3-business-logic.js';
/**
 * Layer 3: Creator Business Logic Service
 *
 * CORE RESPONSIBILITY: Creator sovereignty and economic empowerment business logic
 *
 * PERFECT SEPARATION OF CONCERNS:
 * ✅ ONLY business logic operations
 * ❌ NO API Gateway operations (Layer 2)
 * ❌ NO data persistence (Layer 5)
 * ❌ NO infrastructure management (Layer 6)
 * ❌ NO governance decisions (Layer 4)
 *
 * LIBERATION VALUES EMBEDDED:
 * - 75% Creator Sovereignty ENFORCED in ALL calculations
 * - Creator attribution rights protection
 * - Narrative control preservation
 * - Economic empowerment tracking
 * - Anti-exploitation validation
 */
export declare class CreatorBusinessLogicService {
    private readonly MINIMUM_CREATOR_SHARE;
    private readonly PLATFORM_MAXIMUM_SHARE;
    /**
     * Calculate creator sovereignty with 75% minimum enforcement
     * PURE BUSINESS LOGIC: Enforces 75% creator share in ALL revenue calculations
     */
    calculateCreatorSovereignty(totalRevenue: number, proposedCreatorShare: number, creatorId: string, contentId: string): BusinessLogicOperationResult<CreatorSovereigntyCalculation>;
    /**
     * Enforce creator attribution rights with liberation values
     * PURE BUSINESS LOGIC: Protects creator narrative control and attribution
     */
    enforceCreatorAttributionRights(creatorId: string, contentId: string, attributionData: any, modificationRequest?: any): BusinessLogicOperationResult<CreatorAttributionRights>;
    /**
     * Track economic empowerment with liberation impact measurement
     * PURE BUSINESS LOGIC: Measures creator empowerment progress and community benefit
     */
    trackEconomicEmpowerment(creatorId: string, earningsData: any[], communityContributions: any[], liberationActivities: any[]): BusinessLogicOperationResult<EconomicEmpowermentTracking>;
    /**
     * Validate creator revenue sharing against liberation values
     * PURE BUSINESS LOGIC: Ensures all revenue sharing upholds 75% creator sovereignty
     */
    validateCreatorRevenueSharing(revenueDistribution: any, creatorId: string, contractTerms: any): BusinessLogicOperationResult<{
        isValid: boolean;
        adjustedDistribution: any;
        liberationCompliance: boolean;
        empowermentScore: number;
    }>;
    private validateCreatorSovereigntyLiberationValues;
    private validateAttributionLiberationValues;
    private validateEmpowermentLiberationValues;
    private validateRevenueLiberationValues;
    private validateLiberationValues;
    private validateNarrativeControl;
    private determineModificationRights;
    private generateCulturalRights;
    private assessContentCulturalAuthenticity;
    private calculateAverageSovereignty;
    private calculateCreatorLiberationImpact;
    private calculateCreatorCommunityBenefit;
    private assessEmpowermentProgress;
    private applyMinimumSovereignty;
    private calculateRevenueEmpowermentScore;
    private calculateSovereigntyCommunityBenefit;
    private calculateAttributionEmpowermentImpact;
    private calculateAttributionCommunityBenefit;
    private calculateRevenueCommunitBenefit;
    private generateSovereigntyRecommendations;
    private generateAttributionRecommendations;
    private generateEmpowermentRecommendations;
    private generateRevenueRecommendations;
    private generateCreatorLiberationRecommendations;
}
//# sourceMappingURL=CreatorBusinessLogicService.d.ts.map