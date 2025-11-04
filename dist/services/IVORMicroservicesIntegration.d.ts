/**
 * IVOR Microservices Integration Hub for Layer 3 Business Logic
 * BLKOUT Community Liberation Platform
 *
 * CRITICAL: This hub integrates Layer 3 business logic with 7 operational IVOR microservices.
 * PERFECT SEPARATION OF CONCERNS:
 * - ONLY coordinates business logic integration across IVOR microservices
 * - NO API Gateway operations (Layer 2)
 * - NO data persistence operations (Layer 5)
 * - NO infrastructure management (Layer 6)
 * - NO governance decisions (Layer 4)
 *
 * IVOR MICROSERVICES INTEGRATION:
 * - ivor-core: Central business logic coordination
 * - ivor-community: Community interaction and support
 * - ivor-organizing: Community organizing and mobilization
 * - ivor-social: Social media and platform growth
 * - ivor-api-gateway: API routing and authentication
 * - ivor-frontend: User interface and experience
 * - ivor-monitoring: System health and performance
 *
 * LIBERATION VALUES EMBEDDED:
 * - All integrations validated through liberation lens
 * - Community empowerment prioritized in all microservice interactions
 * - Creator sovereignty enforced across service boundaries
 * - Anti-oppression validation applied to all integration points
 */
import { Layer3InterfaceManager } from './Layer3InterfaceManager.js';
import { LiberationValues, BatchBusinessLogicResult } from '../types/layer3-business-logic.js';
interface IVORServiceEndpoint {
    serviceId: string;
    serviceName: string;
    healthEndpoint: string;
    businessLogicEndpoint: string;
    liberationValuesRequired: boolean;
    supportedOperations: string[];
}
interface CrossServiceOperation {
    operation: string;
    primaryService: string;
    coordinatedServices: string[];
    liberationRequirements: LiberationValues;
    empowermentGoals: string[];
}
export declare class IVORMicroservicesIntegration {
    private layer3Manager;
    private serviceEndpoints;
    private serviceHealthStatus;
    private liberationComplianceStatus;
    constructor(layer3Manager: Layer3InterfaceManager);
    private initializeIVORServiceEndpoints;
    /**
     * Execute coordinated business logic operation across multiple IVOR services
     */
    executeCoordinatedOperation(operation: CrossServiceOperation): Promise<BatchBusinessLogicResult>;
    /**
     * Execute business logic operation on specific IVOR service
     */
    private executeServiceOperation;
    private executeServiceSpecificOperation;
    private executeCoreServiceOperation;
    private executeCommunityServiceOperation;
    private executeOrganizingServiceOperation;
    private executeSocialServiceOperation;
    private executeGatewayServiceOperation;
    private executeFrontendServiceOperation;
    private executeMonitoringServiceOperation;
    private validateCrossServiceLiberationCompliance;
    private validateServiceLiberationCompliance;
    /**
     * Check health of all IVOR microservices and liberation compliance
     */
    checkIntegrationHealth(): Promise<{
        overallHealthy: boolean;
        servicesHealthy: Record<string, boolean>;
        liberationCompliant: Record<string, boolean>;
        recommendations: string[];
    }>;
    private checkServiceHealth;
    private generateCrossServiceRecommendations;
    /**
     * Get all registered IVOR services and their capabilities
     */
    getRegisteredServices(): IVORServiceEndpoint[];
    /**
     * Register new IVOR service for integration
     */
    registerService(endpoint: IVORServiceEndpoint): void;
    /**
     * Get recommended cross-service operations for liberation goals
     */
    getRecommendedCrossServiceOperations(): CrossServiceOperation[];
}
export default IVORMicroservicesIntegration;
//# sourceMappingURL=IVORMicroservicesIntegration.d.ts.map