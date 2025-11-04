/**
 * Layer 3: Liberation Impact Business Logic Service
 * BLKOUT Community Liberation Platform
 *
 * CRITICAL: This service implements ONLY liberation impact business logic operations.
 * PERFECT SEPARATION OF CONCERNS:
 * - ONLY business logic for liberation impact measurement and optimization
 * - NO API Gateway operations (Layer 2)
 * - NO data persistence operations (Layer 5)
 * - NO infrastructure management (Layer 6)
 * - NO governance decisions (Layer 4)
 *
 * LIBERATION VALUES EMBEDDED:
 * - Community Benefit Scoring: Algorithms prioritize community empowerment
 * - Liberation Impact Measurement: Tracks progress toward collective liberation
 * - Resource Allocation Optimization: Centers community needs and empowerment
 * - Empowerment Outcome Tracking: Measures liberation progress across dimensions
 * - Anti-Oppression Effectiveness: Validates liberation strategies
 */
import { LiberationValues, LiberationImpactMeasurement, EmpowermentTracking, ResourceAllocationOptimization, CommunityNeed, BusinessLogicOperationResult } from '../types/layer3-business-logic.js';
import { JourneyStage, JourneyContext } from '../types/journey.js';
export declare class LiberationImpactBusinessLogicService {
    private readonly LIBERATION_DIMENSIONS;
    private readonly LIBERATION_OUTCOME_TYPES;
    constructor();
    /**
     * Measure liberation impact across all dimensions - BUSINESS LOGIC ONLY
     * Calculates comprehensive empowerment and liberation progress metrics
     */
    measureLiberationImpact(entityId: string, entityType: 'content' | 'community' | 'creator' | 'platform', timeRange: {
        start: Date;
        end: Date;
    }, liberationValues: LiberationValues): Promise<BusinessLogicOperationResult<LiberationImpactMeasurement>>;
    /**
     * Track individual empowerment progress - BUSINESS LOGIC ONLY
     * Monitors liberation journey advancement and empowerment outcomes
     */
    trackEmpowermentProgress(userId: string, currentStage: JourneyStage, journeyContext: JourneyContext, liberationValues: LiberationValues): Promise<BusinessLogicOperationResult<EmpowermentTracking>>;
    /**
     * Optimize resource allocation for liberation - BUSINESS LOGIC ONLY
     * Determines optimal resource distribution to maximize community empowerment
     */
    optimizeResourceAllocation(availableResources: {
        [resourceType: string]: number;
    }, communityNeeds: CommunityNeed[], liberationPriorities: string[], liberationValues: LiberationValues): Promise<BusinessLogicOperationResult<ResourceAllocationOptimization>>;
    private validateLiberationValues;
    private calculateOverallLiberationMetrics;
    private assessDimensionalImpact;
    private analyzeLiberationOutcomes;
    private calculateEmpowermentLevel;
    private assessLiberationProgress;
    private analyzeCommunityContribution;
    private calculateSovereigntyScore;
    private generateEmpowermentOutcomes;
    private prioritizeCommunityNeeds;
    private calculateOptimalAllocations;
    private identifyEmpowermentOpportunities;
    private calculateTotalAllocationImpact;
    private calculateEmpowermentScore;
    private calculateLiberationProgress;
    private calculateCommunityBenefit;
    private calculateAntiOppressionEffectiveness;
    private calculateEconomicDimensionImpact;
    private calculateSocialDimensionImpact;
    private calculatePoliticalDimensionImpact;
    private calculateCulturalDimensionImpact;
    private calculateSpiritualDimensionImpact;
    private estimateBeneficiaries;
    private assessSustainability;
    private mapNeedToResourceType;
    private calculateRequiredAmount;
    private identifyRecipients;
    private generateLiberationJustification;
    private generateImpactRecommendations;
    private generateEmpowermentRecommendations;
    private generateAllocationRecommendations;
    private calculateAllocationCommunityBenefit;
}
export default LiberationImpactBusinessLogicService;
//# sourceMappingURL=LiberationImpactBusinessLogicService.d.ts.map