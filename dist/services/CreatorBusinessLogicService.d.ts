/**
 * Layer 3: Creator Business Logic Service
 * BLKOUT Community Liberation Platform
 *
 * CRITICAL: This service implements ONLY creator business logic operations.
 * PERFECT SEPARATION OF CONCERNS:
 * - ONLY business logic for creator sovereignty and economic empowerment
 * - NO API Gateway operations (Layer 2)
 * - NO data persistence operations (Layer 5)
 * - NO infrastructure management (Layer 6)
 * - NO governance decisions (Layer 4)
 *
 * LIBERATION VALUES EMBEDDED:
 * - 75% Creator Sovereignty: Enforced in ALL revenue calculations
 * - Creator Attribution Rights: Protected in all operations
 * - Economic Empowerment: Tracked and optimized
 * - Narrative Control: Preserved for creators
 * - Cultural Rights: Respected and enforced
 */
import { LiberationValues, CreatorSovereigntyCalculation, CreatorAttributionRights, EconomicEmpowermentTracking, BusinessLogicOperationResult } from '../types/layer3-business-logic.js';
export declare class CreatorBusinessLogicService {
    private readonly MINIMUM_CREATOR_SOVEREIGNTY;
    private readonly PLATFORM_MAXIMUM_SHARE;
    constructor();
    /**
     * Calculate creator sovereignty compliance - BUSINESS LOGIC ONLY
     * Enforces 75% minimum creator revenue share as liberation requirement
     */
    calculateCreatorSovereignty(totalRevenue: number, creatorId: string, contentId: string, liberationValues: LiberationValues): Promise<BusinessLogicOperationResult<CreatorSovereigntyCalculation>>;
    /**
     * Enforce creator attribution rights - BUSINESS LOGIC ONLY
     * Protects creator narrative control and attribution requirements
     */
    enforceCreatorAttributionRights(creatorId: string, contentId: string, modificationRequest: {
        type: 'edit' | 'remix' | 'derivative' | 'commercial_use';
        requesterId: string;
        purpose: string;
        modifications: string[];
    }, liberationValues: LiberationValues): Promise<BusinessLogicOperationResult<CreatorAttributionRights>>;
    /**
     * Track economic empowerment progress - BUSINESS LOGIC ONLY
     * Monitors creator liberation through economic indicators
     */
    trackEconomicEmpowerment(creatorId: string, timeRange: {
        start: Date;
        end: Date;
    }, liberationValues: LiberationValues): Promise<BusinessLogicOperationResult<EconomicEmpowermentTracking>>;
    private validateLiberationValues;
    private calculateSovereigntyEmpowermentImpact;
    private calculateSovereigntyCommunityBenefit;
    private generateSovereigntyRecommendations;
    private validateNarrativeControl;
    private assessModificationRights;
    private calculateModificationEconomicRights;
    private validateCulturalRights;
    private calculateTotalCreatorEarnings;
    private calculateEconomicLiberationImpact;
    private calculateEconomicCommunityBenefit;
    private assessEmpowermentProgress;
    private identifySovereigntyViolations;
    private generateEmpowermentRecommendations;
    private calculateAttributionEmpowermentImpact;
    private calculateAttributionCommunityBenefit;
    private generateAttributionRecommendations;
}
export default CreatorBusinessLogicService;
//# sourceMappingURL=CreatorBusinessLogicService.d.ts.map