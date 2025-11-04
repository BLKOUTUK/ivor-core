/**
 * Layer 3 Business Logic Services - Central Export
 * BLKOUT Community Liberation Platform
 *
 * CRITICAL: This file exports ONLY Layer 3 business logic services.
 * PERFECT SEPARATION OF CONCERNS:
 * - Centralizes Layer 3 business logic service exports
 * - Maintains clean interface boundaries
 * - Enables easy integration across IVOR microservices
 *
 * LIBERATION VALUES EMBEDDED:
 * - All services implement 75% creator sovereignty
 * - Anti-oppression validation in all operations
 * - Black queer empowerment prioritized
 * - Community protection mechanisms built-in
 * - Cultural authenticity preserved
 */
export { default as CommunityBusinessLogicService } from './CommunityBusinessLogicService.js';
export { default as CreatorBusinessLogicService } from './CreatorBusinessLogicService.js';
export { default as ContentBusinessLogicService } from './ContentBusinessLogicService.js';
export { default as LiberationImpactBusinessLogicService } from './LiberationImpactBusinessLogicService.js';
export { default as Layer3InterfaceManager } from './Layer3InterfaceManager.js';
export { default as IVORMicroservicesIntegration } from './IVORMicroservicesIntegration.js';
export * from '../types/layer3-business-logic.js';
/**
 * Factory function to create fully integrated Layer 3 services
 * with liberation values validation and IVOR microservices coordination
 */
export declare class Layer3ServiceFactory {
    private static instance;
    private interfaceManager;
    private microservicesIntegration;
    private constructor();
    static getInstance(): Layer3ServiceFactory;
    /**
     * Initialize complete Layer 3 business logic ecosystem
     * with liberation values enforcement and IVOR integration
     */
    initializeLayer3Ecosystem(): Promise<{
        interfaceManager: Layer3InterfaceManager;
        microservicesIntegration: IVORMicroservicesIntegration;
        healthStatus: {
            servicesInitialized: boolean;
            liberationCompliant: boolean;
            ivorIntegrated: boolean;
        };
    }>;
    /**
     * Get initialized Layer 3 Interface Manager
     */
    getInterfaceManager(): Layer3InterfaceManager;
    /**
     * Get initialized IVOR Microservices Integration
     */
    getMicroservicesIntegration(): IVORMicroservicesIntegration;
    /**
     * Validate complete system health and liberation compliance
     */
    private validateSystemHealth;
    /**
     * Get comprehensive Layer 3 system status
     */
    getSystemStatus(): Promise<{
        layer3Services: {
            community: boolean;
            creator: boolean;
            content: boolean;
            liberationImpact: boolean;
        };
        interfaceManager: boolean;
        ivorIntegration: {
            totalServices: number;
            healthyServices: number;
            liberationCompliantServices: number;
        };
        liberationMetrics: {
            overallCompliance: number;
            creatorSovereigntyEnforcement: boolean;
            antiOppressionValidation: boolean;
            communityProtection: number;
        };
    }>;
}
/**
 * Quick access to Layer 3 business logic operations
 * Use this for simple, direct access to Layer 3 services
 */
export declare const Layer3Services: {
    getCommunityService(): Promise<CommunityBusinessLogicService>;
    getCreatorService(): Promise<CreatorBusinessLogicService>;
    getContentService(): Promise<ContentBusinessLogicService>;
    getLiberationImpactService(): Promise<LiberationImpactBusinessLogicService>;
    getInterfaceManager(): Promise<Layer3InterfaceManager>;
    getMicroservicesIntegration(): Promise<IVORMicroservicesIntegration>;
};
/**
 * Initialize complete Layer 3 ecosystem for IVOR platform
 * This is the main entry point for Layer 3 services
 */
export declare function initializeLayer3EcosystemForIVOR(): Promise<{
    interfaceManager: Layer3InterfaceManager;
    microservicesIntegration: IVORMicroservicesIntegration;
    healthStatus: {
        servicesInitialized: boolean;
        liberationCompliant: boolean;
        ivorIntegrated: boolean;
    };
}>;
declare const _default: {
    Layer3ServiceFactory: typeof Layer3ServiceFactory;
    Layer3Services: {
        getCommunityService(): Promise<CommunityBusinessLogicService>;
        getCreatorService(): Promise<CreatorBusinessLogicService>;
        getContentService(): Promise<ContentBusinessLogicService>;
        getLiberationImpactService(): Promise<LiberationImpactBusinessLogicService>;
        getInterfaceManager(): Promise<Layer3InterfaceManager>;
        getMicroservicesIntegration(): Promise<IVORMicroservicesIntegration>;
    };
    initializeLayer3EcosystemForIVOR: typeof initializeLayer3EcosystemForIVOR;
};
export default _default;
//# sourceMappingURL=index.d.ts.map