/**
 * Layer 3: Interface Manager for Clean Layer Integration
 * BLKOUT Community Liberation Platform
 *
 * CRITICAL: This manager coordinates ONLY Layer 3 business logic interfaces.
 * PERFECT SEPARATION OF CONCERNS:
 * - ONLY manages interfaces between Layer 2 ↔ Layer 3 ↔ Layer 5
 * - NO business logic implementation (delegated to services)
 * - NO API Gateway operations (Layer 2)
 * - NO data persistence operations (Layer 5)
 * - NO infrastructure management (Layer 6)
 * - NO governance decisions (Layer 4)
 *
 * LIBERATION VALUES EMBEDDED:
 * - All operations validated through liberation lens
 * - 75% Creator Sovereignty enforced in interface contracts
 * - Community protection prioritized in all interactions
 * - Liberation impact tracked across all business operations
 */
import { Layer2ToLayer3Request, Layer2ToLayer3Response, Layer3ToLayer5Request, Layer3ToLayer5Response, Layer4ToLayer3GovernanceInput, BatchBusinessLogicResult } from '../types/layer3-business-logic.js';
export declare class Layer3InterfaceManager {
    private communityService;
    private creatorService;
    private contentService;
    private liberationImpactService;
    constructor();
    /**
     * Process business logic request from Layer 2 API Gateway
     * Routes to appropriate Layer 3 Business Logic Service based on operation
     */
    processLayer2Request(request: Layer2ToLayer3Request): Promise<Layer2ToLayer3Response>;
    /**
     * Process batch business logic requests for efficiency
     */
    processBatchLayer2Requests(requests: Layer2ToLayer3Request[]): Promise<BatchBusinessLogicResult>;
    /**
     * Send data operation request to Layer 5 with liberation criteria
     */
    sendLayer5Request(request: Layer3ToLayer5Request): Promise<Layer3ToLayer5Response>;
    /**
     * Process governance decision input from Layer 4
     */
    processGovernanceInput(input: Layer4ToLayer3GovernanceInput): Promise<boolean>;
    private handleCommunityInteraction;
    private handleJourneyProgression;
    private handleDemocraticParticipation;
    private handleCreatorSovereignty;
    private handleCreatorAttribution;
    private handleEconomicEmpowerment;
    private handleContentValidation;
    private handleCulturalAuthenticity;
    private handleCommunityConsent;
    private handleLiberationImpact;
    private handleEmpowermentTracking;
    private handleResourceAllocation;
    private validateRequestLiberationCompliance;
    private validateDataOperationLiberationCompliance;
    private applyGovernanceRule;
    private combineValidations;
    private calculateProgressFromResult;
    private extractErrors;
    private generateSystemicRecommendations;
    /**
     * Get all available business logic operations for IVOR microservices
     */
    getAvailableOperations(): string[];
    /**
     * Get Layer 3 service health status
     */
    getServiceHealth(): Promise<{
        healthy: boolean;
        services: Record<string, boolean>;
        liberationCompliance: boolean;
    }>;
}
export default Layer3InterfaceManager;
//# sourceMappingURL=Layer3InterfaceManager.d.ts.map