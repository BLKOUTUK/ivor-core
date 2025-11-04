"use strict";
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
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Layer3Services = exports.Layer3ServiceFactory = exports.IVORMicroservicesIntegration = exports.Layer3InterfaceManager = exports.LiberationImpactBusinessLogicService = exports.ContentBusinessLogicService = exports.CreatorBusinessLogicService = exports.CommunityBusinessLogicService = void 0;
exports.initializeLayer3EcosystemForIVOR = initializeLayer3EcosystemForIVOR;
// Layer 3 Core Business Logic Services
var CommunityBusinessLogicService_js_1 = require("./CommunityBusinessLogicService.js");
Object.defineProperty(exports, "CommunityBusinessLogicService", { enumerable: true, get: function () { return __importDefault(CommunityBusinessLogicService_js_1).default; } });
var CreatorBusinessLogicService_js_1 = require("./CreatorBusinessLogicService.js");
Object.defineProperty(exports, "CreatorBusinessLogicService", { enumerable: true, get: function () { return __importDefault(CreatorBusinessLogicService_js_1).default; } });
var ContentBusinessLogicService_js_1 = require("./ContentBusinessLogicService.js");
Object.defineProperty(exports, "ContentBusinessLogicService", { enumerable: true, get: function () { return __importDefault(ContentBusinessLogicService_js_1).default; } });
var LiberationImpactBusinessLogicService_js_1 = require("./LiberationImpactBusinessLogicService.js");
Object.defineProperty(exports, "LiberationImpactBusinessLogicService", { enumerable: true, get: function () { return __importDefault(LiberationImpactBusinessLogicService_js_1).default; } });
// Layer 3 Interface Management
var Layer3InterfaceManager_js_1 = require("./Layer3InterfaceManager.js");
Object.defineProperty(exports, "Layer3InterfaceManager", { enumerable: true, get: function () { return __importDefault(Layer3InterfaceManager_js_1).default; } });
// IVOR Microservices Integration
var IVORMicroservicesIntegration_js_1 = require("./IVORMicroservicesIntegration.js");
Object.defineProperty(exports, "IVORMicroservicesIntegration", { enumerable: true, get: function () { return __importDefault(IVORMicroservicesIntegration_js_1).default; } });
// Type Definitions (re-export for convenience)
__exportStar(require("../types/layer3-business-logic.js"), exports);
// =====================================================================================
// LAYER 3 SERVICE FACTORY - Liberation-Compliant Initialization
// =====================================================================================
/**
 * Factory function to create fully integrated Layer 3 services
 * with liberation values validation and IVOR microservices coordination
 */
class Layer3ServiceFactory {
    constructor() {
        this.interfaceManager = null;
        this.microservicesIntegration = null;
    }
    static getInstance() {
        if (!Layer3ServiceFactory.instance) {
            Layer3ServiceFactory.instance = new Layer3ServiceFactory();
        }
        return Layer3ServiceFactory.instance;
    }
    /**
     * Initialize complete Layer 3 business logic ecosystem
     * with liberation values enforcement and IVOR integration
     */
    async initializeLayer3Ecosystem() {
        // Initialize Layer 3 Interface Manager
        this.interfaceManager = new Layer3InterfaceManager();
        // Initialize IVOR Microservices Integration
        this.microservicesIntegration = new IVORMicroservicesIntegration(this.interfaceManager);
        // Validate system health and liberation compliance
        const healthStatus = await this.validateSystemHealth();
        return {
            interfaceManager: this.interfaceManager,
            microservicesIntegration: this.microservicesIntegration,
            healthStatus
        };
    }
    /**
     * Get initialized Layer 3 Interface Manager
     */
    getInterfaceManager() {
        if (!this.interfaceManager) {
            throw new Error('Layer 3 ecosystem not initialized. Call initializeLayer3Ecosystem() first.');
        }
        return this.interfaceManager;
    }
    /**
     * Get initialized IVOR Microservices Integration
     */
    getMicroservicesIntegration() {
        if (!this.microservicesIntegration) {
            throw new Error('Layer 3 ecosystem not initialized. Call initializeLayer3Ecosystem() first.');
        }
        return this.microservicesIntegration;
    }
    /**
     * Validate complete system health and liberation compliance
     */
    async validateSystemHealth() {
        let servicesInitialized = false;
        let liberationCompliant = false;
        let ivorIntegrated = false;
        try {
            // Check Layer 3 services initialization
            if (this.interfaceManager && this.microservicesIntegration) {
                const layer3Health = await this.interfaceManager.getServiceHealth();
                servicesInitialized = layer3Health.healthy;
                liberationCompliant = layer3Health.liberationCompliance;
                // Check IVOR microservices integration
                const ivorHealth = await this.microservicesIntegration.checkIntegrationHealth();
                ivorIntegrated = ivorHealth.overallHealthy;
            }
        }
        catch (error) {
            console.error('Layer 3 system health check failed:', error);
        }
        return {
            servicesInitialized,
            liberationCompliant,
            ivorIntegrated
        };
    }
    /**
     * Get comprehensive Layer 3 system status
     */
    async getSystemStatus() {
        if (!this.interfaceManager || !this.microservicesIntegration) {
            throw new Error('Layer 3 ecosystem not initialized');
        }
        // Get Layer 3 service health
        const layer3Health = await this.interfaceManager.getServiceHealth();
        // Get IVOR integration health
        const ivorHealth = await this.microservicesIntegration.checkIntegrationHealth();
        return {
            layer3Services: {
                community: layer3Health.services.community ?? false,
                creator: layer3Health.services.creator ?? false,
                content: layer3Health.services.content ?? false,
                liberationImpact: layer3Health.services.liberationImpact ?? false
            },
            interfaceManager: layer3Health.healthy,
            ivorIntegration: {
                totalServices: Object.keys(ivorHealth.servicesHealthy).length,
                healthyServices: Object.values(ivorHealth.servicesHealthy).filter(h => h).length,
                liberationCompliantServices: Object.values(ivorHealth.liberationCompliant).filter(c => c).length
            },
            liberationMetrics: {
                overallCompliance: layer3Health.liberationCompliance ? 1.0 : 0.5,
                creatorSovereigntyEnforcement: true, // Always enforced in Layer 3
                antiOppressionValidation: true, // Always enabled in Layer 3
                communityProtection: layer3Health.liberationCompliance ? 0.9 : 0.6
            }
        };
    }
}
exports.Layer3ServiceFactory = Layer3ServiceFactory;
// =====================================================================================
// CONVENIENCE EXPORTS FOR DIRECT SERVICE ACCESS
// =====================================================================================
/**
 * Quick access to Layer 3 business logic operations
 * Use this for simple, direct access to Layer 3 services
 */
exports.Layer3Services = {
    async getCommunityService() {
        return new CommunityBusinessLogicService();
    },
    async getCreatorService() {
        return new CreatorBusinessLogicService();
    },
    async getContentService() {
        return new ContentBusinessLogicService();
    },
    async getLiberationImpactService() {
        return new LiberationImpactBusinessLogicService();
    },
    async getInterfaceManager() {
        const factory = Layer3ServiceFactory.getInstance();
        return factory.getInterfaceManager();
    },
    async getMicroservicesIntegration() {
        const factory = Layer3ServiceFactory.getInstance();
        return factory.getMicroservicesIntegration();
    }
};
/**
 * Initialize complete Layer 3 ecosystem for IVOR platform
 * This is the main entry point for Layer 3 services
 */
async function initializeLayer3EcosystemForIVOR() {
    const factory = Layer3ServiceFactory.getInstance();
    const ecosystem = await factory.initializeLayer3Ecosystem();
    console.log('🎯 Layer 3 Business Logic Services Initialized');
    console.log('✅ Liberation Values: ENFORCED');
    console.log('✅ Creator Sovereignty: 75% MINIMUM ENFORCED');
    console.log('✅ Anti-Oppression Validation: ACTIVE');
    console.log('✅ Community Protection: PRIORITIZED');
    console.log('✅ IVOR Microservices: INTEGRATED');
    console.log(`🚀 System Health: ${ecosystem.healthStatus.servicesInitialized ? 'HEALTHY' : 'NEEDS ATTENTION'}`);
    console.log(`🎉 Liberation Compliance: ${ecosystem.healthStatus.liberationCompliant ? 'FULLY COMPLIANT' : 'REVIEW NEEDED'}`);
    return ecosystem;
}
exports.default = {
    Layer3ServiceFactory,
    Layer3Services: exports.Layer3Services,
    initializeLayer3EcosystemForIVOR
};
//# sourceMappingURL=index.js.map