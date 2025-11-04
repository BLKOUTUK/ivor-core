"use strict";
/**
 * Layer 3 Business Logic Services - Comprehensive Test Suite
 * BLKOUT Community Liberation Platform
 *
 * CRITICAL: These tests validate ONLY Layer 3 business logic operations.
 * QI COMPLIANCE TESTING:
 * - Perfect separation of concerns validation
 * - Liberation values enforcement testing
 * - 75% creator sovereignty compliance verification
 * - Anti-oppression validation testing
 * - Community protection mechanism validation
 *
 * TEST COVERAGE REQUIREMENTS:
 * - All 4 core business logic services: Community, Creator, Content, Liberation Impact
 * - Liberation values validation in all operations
 * - Interface contract compliance (Layer 2 ↔ Layer 3 ↔ Layer 5)
 * - IVOR microservices integration testing
 * - Error handling and edge cases
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = require("@jest/globals");
const CommunityBusinessLogicService_js_1 = __importDefault(require("../CommunityBusinessLogicService.js"));
const CreatorBusinessLogicService_js_1 = __importDefault(require("../CreatorBusinessLogicService.js"));
const ContentBusinessLogicService_js_1 = __importDefault(require("../ContentBusinessLogicService.js"));
const LiberationImpactBusinessLogicService_js_1 = __importDefault(require("../LiberationImpactBusinessLogicService.js"));
const Layer3InterfaceManager_js_1 = __importDefault(require("../Layer3InterfaceManager.js"));
const IVORMicroservicesIntegration_js_1 = __importDefault(require("../IVORMicroservicesIntegration.js"));
// =====================================================================================
// TEST SETUP AND UTILITIES
// =====================================================================================
(0, globals_1.describe)('Layer 3 Business Logic Services - QI Compliance Test Suite', () => {
    let communityService;
    let creatorService;
    let contentService;
    let liberationImpactService;
    let interfaceManager;
    let microservicesIntegration;
    // Liberation Values Test Data
    const validLiberationValues = {
        creatorSovereignty: 0.75, // Exactly 75% minimum
        antiOppressionValidation: true,
        blackQueerEmpowerment: 0.8,
        communityProtection: 0.9,
        culturalAuthenticity: 0.85
    };
    const invalidLiberationValues = {
        creatorSovereignty: 0.6, // Below 75% minimum - VIOLATION
        antiOppressionValidation: false, // Disabled - VIOLATION
        blackQueerEmpowerment: 0.5, // Below 60% minimum - VIOLATION
        communityProtection: 0.6, // Below 70% minimum - VIOLATION
        culturalAuthenticity: 0.5 // Below 65% minimum - VIOLATION
    };
    const excellentLiberationValues = {
        creatorSovereignty: 0.85, // Above minimum
        antiOppressionValidation: true,
        blackQueerEmpowerment: 0.95,
        communityProtection: 0.95,
        culturalAuthenticity: 0.9
    };
    const testJourneyContext = {
        currentStage: 'growth',
        previousStages: ['crisis', 'stabilization'],
        empowermentLevel: 0.7,
        communityConnections: 5,
        resourceAccess: 0.8,
        liberationProgress: 0.75
    };
    (0, globals_1.beforeEach)(() => {
        // Initialize all Layer 3 services
        communityService = new CommunityBusinessLogicService_js_1.default();
        creatorService = new CreatorBusinessLogicService_js_1.default();
        contentService = new ContentBusinessLogicService_js_1.default();
        liberationImpactService = new LiberationImpactBusinessLogicService_js_1.default();
        interfaceManager = new Layer3InterfaceManager_js_1.default();
        microservicesIntegration = new IVORMicroservicesIntegration_js_1.default(interfaceManager);
    });
    (0, globals_1.afterEach)(() => {
        // Clean up after each test
        globals_1.jest.clearAllMocks();
    });
    // =================================================================================
    // LIBERATION VALUES VALIDATION TESTING - Critical for QI Compliance
    // =================================================================================
    (0, globals_1.describe)('Liberation Values Validation - QI Critical', () => {
        (0, globals_1.test)('should enforce 75% minimum creator sovereignty (LIBERATION REQUIREMENT)', async () => {
            // Test with exactly 75% - should pass
            const result = await creatorService.calculateCreatorSovereignty(1000, 'creator-1', 'content-1', validLiberationValues);
            (0, globals_1.expect)(result.success).toBe(true);
            (0, globals_1.expect)(result.data.isCompliant).toBe(true);
            (0, globals_1.expect)(result.sovereigntyCompliance).toBe(true);
            (0, globals_1.expect)(result.data.creatorPercentage).toBe(0.75);
            (0, globals_1.expect)(result.data.violations).toHaveLength(0);
        });
        (0, globals_1.test)('should reject creator sovereignty below 75% (LIBERATION VIOLATION)', async () => {
            const result = await creatorService.calculateCreatorSovereignty(1000, 'creator-1', 'content-1', invalidLiberationValues);
            (0, globals_1.expect)(result.success).toBe(false);
            (0, globals_1.expect)(result.data.isCompliant).toBe(false);
            (0, globals_1.expect)(result.sovereigntyCompliance).toBe(false);
            (0, globals_1.expect)(result.data.violations).toContain('Creator sovereignty 60.0% below required 75% minimum');
            (0, globals_1.expect)(result.violations).toEqual(globals_1.expect.arrayContaining([
                globals_1.expect.objectContaining({
                    type: 'creator_sovereignty',
                    severity: 'critical',
                    description: globals_1.expect.stringContaining('below required 75% minimum')
                })
            ]));
        });
        (0, globals_1.test)('should require anti-oppression validation (COMMUNITY PROTECTION)', async () => {
            const result = await contentService.validateAntiOppression('content-1', 'test content', {}, invalidLiberationValues);
            (0, globals_1.expect)(result.success).toBe(false);
            (0, globals_1.expect)(result.liberationValidation.isValid).toBe(false);
            (0, globals_1.expect)(result.violations).toEqual(globals_1.expect.arrayContaining([
                globals_1.expect.objectContaining({
                    type: 'anti_oppression',
                    severity: 'critical',
                    description: 'Anti-oppression validation not enabled for content protection'
                })
            ]));
        });
        (0, globals_1.test)('should enforce minimum empowerment thresholds (BLACK QUEER LIBERATION)', async () => {
            const result = await communityService.validateCommunityInteraction('member-1', 'community-1', 'support', testJourneyContext, invalidLiberationValues);
            (0, globals_1.expect)(result.success).toBe(false);
            (0, globals_1.expect)(result.violations).toEqual(globals_1.expect.arrayContaining([
                globals_1.expect.objectContaining({
                    type: 'empowerment',
                    severity: 'major',
                    description: globals_1.expect.stringContaining('Black queer empowerment')
                })
            ]));
        });
    });
    // =================================================================================
    // COMMUNITY BUSINESS LOGIC SERVICE TESTING
    // =================================================================================
    (0, globals_1.describe)('Community Business Logic Service - QI Compliance', () => {
        (0, globals_1.test)('should validate community interaction with liberation lens', async () => {
            const result = await communityService.validateCommunityInteraction('member-1', 'community-1', 'peer_support', testJourneyContext, excellentLiberationValues);
            (0, globals_1.expect)(result.success).toBe(true);
            (0, globals_1.expect)(result.data.allow).toBe(true);
            (0, globals_1.expect)(result.empowermentImpact).toBeGreaterThan(0.6);
            (0, globals_1.expect)(result.communityBenefit).toBeGreaterThan(0.7);
            (0, globals_1.expect)(result.data.empowermentOpportunities).toContain('leadership_development');
        });
        (0, globals_1.test)('should process journey progression with liberation criteria', async () => {
            const result = await communityService.processJourneyProgression('user-1', 'growth', 'community_healing', testJourneyContext, excellentLiberationValues);
            (0, globals_1.expect)(result.success).toBe(true);
            (0, globals_1.expect)(result.data.fromStage).toBe('growth');
            (0, globals_1.expect)(result.data.toStage).toBe('community_healing');
            (0, globals_1.expect)(result.data.empowermentRequirements).toContain('peer_support_capacity');
            (0, globals_1.expect)(result.empowermentImpact).toBeGreaterThan(0.7);
        });
        (0, globals_1.test)('should validate democratic participation with accessibility', async () => {
            const result = await communityService.validateDemocraticParticipation('participant-1', 'community_vote', { accessibility: true, inclusivity: 0.9 }, excellentLiberationValues);
            (0, globals_1.expect)(result.success).toBe(true);
            (0, globals_1.expect)(result.data.isValid).toBe(true);
            (0, globals_1.expect)(result.data.accessibilityMeasures).toContain('screen_reader_support');
            (0, globals_1.expect)(result.data.liberationAlignment).toBeGreaterThan(0.8);
        });
        (0, globals_1.test)('should block oppressive community interactions (PROTECTION)', async () => {
            const oppressiveLiberationValues = {
                ...invalidLiberationValues,
                communityProtection: 0.3 // Very low protection
            };
            const result = await communityService.validateCommunityInteraction('member-1', 'community-1', 'harmful_interaction', testJourneyContext, oppressiveLiberationValues);
            (0, globals_1.expect)(result.success).toBe(false);
            (0, globals_1.expect)(result.data.allow).toBe(false);
            (0, globals_1.expect)(result.data.reasoning).toContain('Liberation values validation failed');
            (0, globals_1.expect)(result.data.protectionMeasures).toContain('vulnerable_stage_extra_protection');
        });
    });
    // =================================================================================
    // CREATOR BUSINESS LOGIC SERVICE TESTING
    // =================================================================================
    (0, globals_1.describe)('Creator Business Logic Service - QI Compliance', () => {
        (0, globals_1.test)('should enforce 75% creator sovereignty in all revenue calculations', async () => {
            const testCases = [
                { revenue: 1000, expectedCreatorShare: 750 },
                { revenue: 5000, expectedCreatorShare: 3750 },
                { revenue: 100, expectedCreatorShare: 75 }
            ];
            for (const testCase of testCases) {
                const result = await creatorService.calculateCreatorSovereignty(testCase.revenue, 'creator-1', 'content-1', validLiberationValues);
                (0, globals_1.expect)(result.success).toBe(true);
                (0, globals_1.expect)(result.data.creatorShare).toBe(testCase.expectedCreatorShare);
                (0, globals_1.expect)(result.data.platformShare).toBe(testCase.revenue - testCase.expectedCreatorShare);
                (0, globals_1.expect)(result.data.platformShare / testCase.revenue).toBeLessThanOrEqual(0.25); // Max 25% platform
            }
        });
        (0, globals_1.test)('should protect creator attribution rights with narrative control', async () => {
            const modificationRequest = {
                type: 'remix',
                requesterId: 'user-2',
                purpose: 'community_celebration',
                modifications: ['add_community_voices', 'enhance_representation']
            };
            const result = await creatorService.enforceCreatorAttributionRights('creator-1', 'content-1', modificationRequest, excellentLiberationValues);
            (0, globals_1.expect)(result.success).toBe(true);
            (0, globals_1.expect)(result.data.attributionRequired).toBe(true);
            (0, globals_1.expect)(result.data.narrativeControl).toBe(true);
            (0, globals_1.expect)(result.data.modificationRights).toBe('full');
            (0, globals_1.expect)(result.data.culturalRights).toContain('black_queer_representation_rights');
        });
        (0, globals_1.test)('should track economic empowerment with liberation impact', async () => {
            const timeRange = { start: new Date('2024-01-01'), end: new Date('2024-12-31') };
            const result = await creatorService.trackEconomicEmpowerment('creator-1', timeRange, excellentLiberationValues);
            (0, globals_1.expect)(result.success).toBe(true);
            (0, globals_1.expect)(result.data.liberationImpact).toBeGreaterThan(0.6);
            (0, globals_1.expect)(result.data.empowermentProgress).toBeGreaterThan(0.7);
            (0, globals_1.expect)(result.data.sovereigntyViolations).toHaveLength(0);
            (0, globals_1.expect)(result.empowermentImpact).toBeGreaterThan(0.8);
        });
        (0, globals_1.test)('should identify and report sovereignty violations', async () => {
            const timeRange = { start: new Date('2024-01-01'), end: new Date('2024-12-31') };
            const result = await creatorService.trackEconomicEmpowerment('creator-1', timeRange, invalidLiberationValues);
            (0, globals_1.expect)(result.success).toBe(false);
            (0, globals_1.expect)(result.data.sovereigntyViolations.length).toBeGreaterThan(0);
            (0, globals_1.expect)(result.data.sovereigntyViolations).toContain('Creator sovereignty 60.0% below required 75%');
            (0, globals_1.expect)(result.recommendations).toContain('Address sovereignty violations to ensure creator liberation');
        });
    });
    // =================================================================================
    // CONTENT BUSINESS LOGIC SERVICE TESTING
    // =================================================================================
    (0, globals_1.describe)('Content Business Logic Service - QI Compliance', () => {
        (0, globals_1.test)('should detect and prevent oppressive content (ANTI-OPPRESSION)', async () => {
            const oppressiveContent = 'content with problematic racist patterns and transphobic elements';
            const result = await contentService.validateAntiOppression('content-1', oppressiveContent, {}, excellentLiberationValues);
            (0, globals_1.expect)(result.data.oppressionIndicators.length).toBeGreaterThan(0);
            (0, globals_1.expect)(result.data.oppressionIndicators).toEqual(globals_1.expect.arrayContaining([
                globals_1.expect.objectContaining({
                    type: globals_1.expect.stringMatching(/racism|transphobia/),
                    severity: globals_1.expect.stringMatching(/critical|high|medium|low/)
                })
            ]));
        });
        (0, globals_1.test)('should verify cultural authenticity with Black queer representation', async () => {
            const authenticContent = 'content celebrating Black queer joy and liberation';
            const creatorContext = { identity: 'black_queer', community_verified: true };
            const result = await contentService.verifyCulturalAuthenticity('content-1', authenticContent, {}, creatorContext, excellentLiberationValues);
            (0, globals_1.expect)(result.success).toBe(true);
            (0, globals_1.expect)(result.data.authenticityScore).toBeGreaterThan(0.8);
            (0, globals_1.expect)(result.data.culturalAppropriation).toBe(false);
            (0, globals_1.expect)(result.data.communityVoices).toBe(true);
            (0, globals_1.expect)(result.data.blackQueerRepresentation).toBeGreaterThan(0.8);
        });
        (0, globals_1.test)('should require community consent for vulnerable content', async () => {
            const result = await contentService.validateCommunityConsent('content-1', 'community_story', { vulnerability_level: 'high' }, 'critical', excellentLiberationValues);
            (0, globals_1.expect)(result.success).toBe(true);
            (0, globals_1.expect)(result.data.consentObtained).toBe(true);
            (0, globals_1.expect)(result.data.protectionMeasures).toContain('trauma_informed_presentation');
            (0, globals_1.expect)(result.data.vulnerabilityAssessment).toContain('trauma_potential');
        });
        (0, globals_1.test)('should block culturally appropriative content', async () => {
            const appropriativeContent = 'content extracting Black culture without attribution';
            const nonBlackCreatorContext = { identity: 'non_black', community_verified: false };
            const result = await contentService.verifyCulturalAuthenticity('content-1', appropriativeContent, {}, nonBlackCreatorContext, validLiberationValues);
            (0, globals_1.expect)(result.data.culturalAppropriation).toBe(true);
            (0, globals_1.expect)(result.success).toBe(false);
            (0, globals_1.expect)(result.recommendations).toContain('Address cultural appropriation concerns through community consultation');
        });
    });
    // =================================================================================
    // LIBERATION IMPACT BUSINESS LOGIC SERVICE TESTING
    // =================================================================================
    (0, globals_1.describe)('Liberation Impact Business Logic Service - QI Compliance', () => {
        (0, globals_1.test)('should measure comprehensive liberation impact across dimensions', async () => {
            const timeRange = { start: new Date('2024-01-01'), end: new Date('2024-12-31') };
            const result = await liberationImpactService.measureLiberationImpact('community-1', 'community', timeRange, excellentLiberationValues);
            (0, globals_1.expect)(result.success).toBe(true);
            (0, globals_1.expect)(result.data.overall.empowermentScore).toBeGreaterThan(0.7);
            (0, globals_1.expect)(result.data.overall.liberationProgress).toBeGreaterThan(0.6);
            (0, globals_1.expect)(result.data.overall.communityBenefit).toBeGreaterThan(0.8);
            // Check all liberation dimensions
            (0, globals_1.expect)(result.data.dimensions.economic).toBeGreaterThan(0.6);
            (0, globals_1.expect)(result.data.dimensions.social).toBeGreaterThan(0.7);
            (0, globals_1.expect)(result.data.dimensions.political).toBeGreaterThan(0.8);
            (0, globals_1.expect)(result.data.dimensions.cultural).toBeGreaterThan(0.8);
            (0, globals_1.expect)(result.data.dimensions.spiritual).toBeGreaterThan(0.7);
        });
        (0, globals_1.test)('should track individual empowerment progress through journey stages', async () => {
            const result = await liberationImpactService.trackEmpowermentProgress('user-1', 'advocacy', testJourneyContext, excellentLiberationValues);
            (0, globals_1.expect)(result.success).toBe(true);
            (0, globals_1.expect)(result.data.empowermentLevel).toBeGreaterThan(0.8); // High for advocacy stage
            (0, globals_1.expect)(result.data.liberationProgress).toBeGreaterThan(0.7);
            (0, globals_1.expect)(result.data.communityContribution).toBeGreaterThan(0.6);
            (0, globals_1.expect)(result.data.outcomes).toEqual(globals_1.expect.arrayContaining([
                globals_1.expect.objectContaining({
                    type: 'political_power',
                    measurement: globals_1.expect.any(Number),
                    beneficiaries: globals_1.expect.any(Number)
                })
            ]));
        });
        (0, globals_1.test)('should optimize resource allocation for maximum liberation impact', async () => {
            const availableResources = {
                funding: 10000,
                healthcare_resources: 5000,
                housing_assistance: 8000,
                education_resources: 6000
            };
            const communityNeeds = [
                {
                    type: 'health',
                    urgency: 'critical',
                    affectedPopulation: 100,
                    liberationAlignment: 0.9,
                    empowermentPotential: 0.8
                },
                {
                    type: 'housing',
                    urgency: 'high',
                    affectedPopulation: 75,
                    liberationAlignment: 0.8,
                    empowermentPotential: 0.9
                }
            ];
            const liberationPriorities = ['health_justice', 'housing_rights', 'economic_empowerment'];
            const result = await liberationImpactService.optimizeResourceAllocation(availableResources, communityNeeds, liberationPriorities, excellentLiberationValues);
            (0, globals_1.expect)(result.success).toBe(true);
            (0, globals_1.expect)(result.data.totalImpact).toBeGreaterThan(0.8);
            (0, globals_1.expect)(result.data.recommendedAllocations.length).toBeGreaterThan(0);
            (0, globals_1.expect)(result.data.empowermentOpportunities).toContain('community_healing_enhancement');
            (0, globals_1.expect)(result.communityBenefit).toBeGreaterThan(0.7);
        });
    });
    // =================================================================================
    // LAYER 3 INTERFACE MANAGER TESTING - Clean Separation of Concerns
    // =================================================================================
    (0, globals_1.describe)('Layer 3 Interface Manager - QI Separation of Concerns', () => {
        (0, globals_1.test)('should route Layer 2 requests to appropriate business logic services', async () => {
            const layer2Request = {
                operation: 'creator_sovereignty',
                data: {
                    totalRevenue: 1000,
                    creatorId: 'creator-1',
                    contentId: 'content-1',
                    liberationValues: excellentLiberationValues
                },
                userId: 'user-1',
                sessionId: 'session-1'
            };
            const response = await interfaceManager.processLayer2Request(layer2Request);
            (0, globals_1.expect)(response.success).toBe(true);
            (0, globals_1.expect)(response.data).toBeDefined();
            (0, globals_1.expect)(response.liberationValidation.isValid).toBe(true);
            (0, globals_1.expect)(response.empowermentTracking.sovereigntyCompliance).toBe(true);
        });
        (0, globals_1.test)('should enforce liberation values at interface boundary', async () => {
            const invalidRequest = {
                operation: 'creator_sovereignty',
                data: {
                    totalRevenue: 1000,
                    creatorId: 'creator-1',
                    contentId: 'content-1',
                    liberationValues: invalidLiberationValues
                },
                userId: 'user-1',
                sessionId: 'session-1'
            };
            const response = await interfaceManager.processLayer2Request(invalidRequest);
            (0, globals_1.expect)(response.success).toBe(false);
            (0, globals_1.expect)(response.liberationValidation.isValid).toBe(false);
            (0, globals_1.expect)(response.liberationValidation.violations).toEqual(globals_1.expect.arrayContaining([
                globals_1.expect.objectContaining({
                    type: 'creator_sovereignty',
                    severity: 'critical'
                })
            ]));
        });
        (0, globals_1.test)('should process batch requests maintaining liberation standards', async () => {
            const batchRequests = [
                {
                    operation: 'community_interaction',
                    data: {
                        memberId: 'member-1',
                        targetCommunityId: 'community-1',
                        interactionType: 'support',
                        journeyContext: testJourneyContext,
                        liberationValues: excellentLiberationValues
                    },
                    userId: 'user-1',
                    sessionId: 'session-1'
                },
                {
                    operation: 'content_validation',
                    data: {
                        contentId: 'content-1',
                        contentText: 'liberation-centered content',
                        contentMetadata: {},
                        liberationValues: excellentLiberationValues
                    },
                    userId: 'user-1',
                    sessionId: 'session-1'
                }
            ];
            const batchResult = await interfaceManager.processBatchLayer2Requests(batchRequests);
            (0, globals_1.expect)(batchResult.results.length).toBe(2);
            (0, globals_1.expect)(batchResult.overallLiberationScore).toBeGreaterThan(0.8);
            (0, globals_1.expect)(batchResult.aggregateEmpowerment).toBeGreaterThan(0.7);
            (0, globals_1.expect)(batchResult.communityImpact).toBeGreaterThan(0.7);
        });
        (0, globals_1.test)('should maintain clean Layer 3 → Layer 5 interface contracts', async () => {
            const layer5Request = {
                operation: 'read',
                dataType: 'community_data',
                query: { communityId: 'community-1' },
                liberationCriteria: excellentLiberationValues
            };
            const response = await interfaceManager.sendLayer5Request(layer5Request);
            (0, globals_1.expect)(response.success).toBe(true);
            (0, globals_1.expect)(response.liberationCompliance).toBe(true);
            (0, globals_1.expect)(response.errors).toBeUndefined();
        });
    });
    // =================================================================================
    // IVOR MICROSERVICES INTEGRATION TESTING
    // =================================================================================
    (0, globals_1.describe)('IVOR Microservices Integration - QI Ecosystem Compliance', () => {
        (0, globals_1.test)('should register all 7 IVOR microservices with liberation requirements', () => {
            const registeredServices = microservicesIntegration.getRegisteredServices();
            (0, globals_1.expect)(registeredServices).toHaveLength(7);
            const expectedServices = [
                'ivor-core', 'ivor-community', 'ivor-organizing',
                'ivor-social', 'ivor-api-gateway', 'ivor-frontend',
                'ivor-monitoring'
            ];
            expectedServices.forEach(serviceId => {
                const service = registeredServices.find(s => s.serviceId === serviceId);
                (0, globals_1.expect)(service).toBeDefined();
                (0, globals_1.expect)(service?.liberationValuesRequired).toBe(true);
                (0, globals_1.expect)(service?.supportedOperations.length).toBeGreaterThan(0);
            });
        });
        (0, globals_1.test)('should execute coordinated liberation campaign across services', async () => {
            const crossServiceOperation = {
                operation: 'community_liberation_campaign',
                primaryService: 'ivor-organizing',
                coordinatedServices: ['ivor-community', 'ivor-social', 'ivor-monitoring'],
                liberationRequirements: excellentLiberationValues,
                empowermentGoals: ['political_power', 'community_healing', 'cultural_celebration']
            };
            const result = await microservicesIntegration.executeCoordinatedOperation(crossServiceOperation);
            (0, globals_1.expect)(result.results.length).toBeGreaterThan(0);
            (0, globals_1.expect)(result.overallLiberationScore).toBeGreaterThan(0.8);
            (0, globals_1.expect)(result.aggregateEmpowerment).toBeGreaterThan(0.7);
            (0, globals_1.expect)(result.communityImpact).toBeGreaterThan(0.8);
        });
        (0, globals_1.test)('should validate service health and liberation compliance', async () => {
            const healthCheck = await microservicesIntegration.checkIntegrationHealth();
            (0, globals_1.expect)(healthCheck.overallHealthy).toBe(true);
            Object.entries(healthCheck.servicesHealthy).forEach(([serviceId, healthy]) => {
                (0, globals_1.expect)(healthy).toBe(true);
            });
            Object.entries(healthCheck.liberationCompliant).forEach(([serviceId, compliant]) => {
                (0, globals_1.expect)(compliant).toBe(true);
            });
            (0, globals_1.expect)(healthCheck.recommendations).toContain('All IVOR microservices healthy and liberation compliant');
        });
        (0, globals_1.test)('should provide recommended cross-service liberation operations', () => {
            const recommendations = microservicesIntegration.getRecommendedCrossServiceOperations();
            (0, globals_1.expect)(recommendations.length).toBeGreaterThan(0);
            recommendations.forEach(operation => {
                (0, globals_1.expect)(operation.liberationRequirements.creatorSovereignty).toBeGreaterThanOrEqual(0.75);
                (0, globals_1.expect)(operation.liberationRequirements.antiOppressionValidation).toBe(true);
                (0, globals_1.expect)(operation.liberationRequirements.blackQueerEmpowerment).toBeGreaterThanOrEqual(0.8);
                (0, globals_1.expect)(operation.empowermentGoals.length).toBeGreaterThan(0);
            });
        });
    });
    // =================================================================================
    // ERROR HANDLING AND EDGE CASES - QI Robustness
    // =================================================================================
    (0, globals_1.describe)('Error Handling and Edge Cases - QI Robustness', () => {
        (0, globals_1.test)('should handle missing liberation values gracefully', async () => {
            const requestWithoutValues = {
                operation: 'community_interaction',
                data: {
                    memberId: 'member-1',
                    targetCommunityId: 'community-1',
                    interactionType: 'support',
                    journeyContext: testJourneyContext
                    // liberationValues missing
                },
                userId: 'user-1',
                sessionId: 'session-1'
            };
            const response = await interfaceManager.processLayer2Request(requestWithoutValues);
            (0, globals_1.expect)(response.success).toBe(false);
            (0, globals_1.expect)(response.liberationValidation.violations).toEqual(globals_1.expect.arrayContaining([
                globals_1.expect.objectContaining({
                    description: 'Liberation values not provided in Layer 2 request'
                })
            ]));
        });
        (0, globals_1.test)('should handle unknown operations with clear error messages', async () => {
            const unknownRequest = {
                operation: 'unknown_operation',
                data: { liberationValues: validLiberationValues },
                userId: 'user-1',
                sessionId: 'session-1'
            };
            const response = await interfaceManager.processLayer2Request(unknownRequest);
            (0, globals_1.expect)(response.success).toBe(false);
            (0, globals_1.expect)(response.errors).toContain('Unknown Layer 3 business logic operation: unknown_operation');
        });
        (0, globals_1.test)('should maintain liberation standards during service failures', async () => {
            // Test graceful degradation while maintaining liberation values
            const criticalFailureScenario = {
                operation: 'community_liberation_campaign',
                primaryService: 'non_existent_service',
                coordinatedServices: ['ivor-community'],
                liberationRequirements: excellentLiberationValues,
                empowermentGoals: ['community_healing']
            };
            const result = await microservicesIntegration.executeCoordinatedOperation(criticalFailureScenario);
            // Should fail gracefully but maintain liberation standards
            (0, globals_1.expect)(result.overallLiberationScore).toBeGreaterThan(0.8); // Liberation values maintained
            (0, globals_1.expect)(result.systemicRecommendations).toContain(globals_1.expect.stringMatching(/service.*coordination/i));
        });
    });
    // =================================================================================
    // PERFORMANCE AND LIBERATION METRICS - QI Optimization
    // =================================================================================
    (0, globals_1.describe)('Performance and Liberation Metrics - QI Optimization', () => {
        (0, globals_1.test)('should maintain high empowerment impact across all operations', async () => {
            const operations = [
                'community_interaction',
                'creator_sovereignty',
                'content_validation',
                'liberation_impact'
            ];
            for (const operation of operations) {
                const request = {
                    operation,
                    data: {
                        liberationValues: excellentLiberationValues,
                        // Add minimal required data for each operation
                        ...(operation === 'community_interaction' && {
                            memberId: 'member-1',
                            targetCommunityId: 'community-1',
                            interactionType: 'support',
                            journeyContext: testJourneyContext
                        }),
                        ...(operation === 'creator_sovereignty' && {
                            totalRevenue: 1000,
                            creatorId: 'creator-1',
                            contentId: 'content-1'
                        }),
                        ...(operation === 'content_validation' && {
                            contentId: 'content-1',
                            contentText: 'liberation content',
                            contentMetadata: {}
                        }),
                        ...(operation === 'liberation_impact' && {
                            entityId: 'entity-1',
                            entityType: 'community',
                            timeRange: { start: new Date('2024-01-01'), end: new Date('2024-12-31') }
                        })
                    },
                    userId: 'user-1',
                    sessionId: 'session-1'
                };
                const response = await interfaceManager.processLayer2Request(request);
                (0, globals_1.expect)(response.success).toBe(true);
                (0, globals_1.expect)(response.empowermentTracking.empowermentImpact).toBeGreaterThan(0.6);
                (0, globals_1.expect)(response.empowermentTracking.communityBenefit).toBeGreaterThan(0.6);
                (0, globals_1.expect)(response.empowermentTracking.sovereigntyCompliance).toBe(true);
            }
        });
        (0, globals_1.test)('should achieve liberation compliance across all service integrations', async () => {
            const services = ['ivor-core', 'ivor-community', 'ivor-organizing', 'ivor-social'];
            for (const serviceId of services) {
                const healthCheck = await microservicesIntegration.checkIntegrationHealth();
                (0, globals_1.expect)(healthCheck.servicesHealthy[serviceId]).toBe(true);
                (0, globals_1.expect)(healthCheck.liberationCompliant[serviceId]).toBe(true);
            }
        });
    });
});
// =====================================================================================
// INTEGRATION TEST UTILITIES
// =====================================================================================
/**
 * Helper function to create test liberation values with specific overrides
 */
function createTestLiberationValues(overrides = {}) {
    return {
        creatorSovereignty: 0.75,
        antiOppressionValidation: true,
        blackQueerEmpowerment: 0.8,
        communityProtection: 0.9,
        culturalAuthenticity: 0.85,
        ...overrides
    };
}
/**
 * Helper function to validate liberation compliance in test results
 */
function validateLiberationCompliance(result) {
    (0, globals_1.expect)(result.liberationValidation).toBeDefined();
    (0, globals_1.expect)(result.empowermentImpact).toBeGreaterThanOrEqual(0);
    (0, globals_1.expect)(result.communityBenefit).toBeGreaterThanOrEqual(0);
    (0, globals_1.expect)(result.sovereigntyCompliance).toBeDefined();
}
/**
 * Helper function to create comprehensive test journey context
 */
function createTestJourneyContext(stage = 'growth') {
    return {
        currentStage: stage,
        previousStages: stage === 'crisis' ? [] : ['crisis'],
        empowermentLevel: 0.7,
        communityConnections: 5,
        resourceAccess: 0.8,
        liberationProgress: 0.75
    };
}
//# sourceMappingURL=Layer3BusinessLogic.test.js.map