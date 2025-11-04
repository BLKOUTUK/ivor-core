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

import { describe, beforeEach, afterEach, test, expect, jest } from '@jest/globals';
import CommunityBusinessLogicService from '../CommunityBusinessLogicService.js';
import CreatorBusinessLogicService from '../CreatorBusinessLogicService.js';
import ContentBusinessLogicService from '../ContentBusinessLogicService.js';
import LiberationImpactBusinessLogicService from '../LiberationImpactBusinessLogicService.js';
import Layer3InterfaceManager from '../Layer3InterfaceManager.js';
import IVORMicroservicesIntegration from '../IVORMicroservicesIntegration.js';

import {
  LiberationValues,
  LiberationValidationResult,
  LIBERATION_CONSTANTS,
  LIBERATION_WEIGHTS
} from '../../types/layer3-business-logic.js';

import { JourneyStage, JourneyContext } from '../../types/journey.js';

// =====================================================================================
// TEST SETUP AND UTILITIES
// =====================================================================================

describe('Layer 3 Business Logic Services - QI Compliance Test Suite', () => {
  let communityService: CommunityBusinessLogicService;
  let creatorService: CreatorBusinessLogicService;
  let contentService: ContentBusinessLogicService;
  let liberationImpactService: LiberationImpactBusinessLogicService;
  let interfaceManager: Layer3InterfaceManager;
  let microservicesIntegration: IVORMicroservicesIntegration;

  // Liberation Values Test Data
  const validLiberationValues: LiberationValues = {
    creatorSovereignty: 0.75, // Exactly 75% minimum
    antiOppressionValidation: true,
    blackQueerEmpowerment: 0.8,
    communityProtection: 0.9,
    culturalAuthenticity: 0.85
  };

  const invalidLiberationValues: LiberationValues = {
    creatorSovereignty: 0.6, // Below 75% minimum - VIOLATION
    antiOppressionValidation: false, // Disabled - VIOLATION
    blackQueerEmpowerment: 0.5, // Below 60% minimum - VIOLATION
    communityProtection: 0.6, // Below 70% minimum - VIOLATION
    culturalAuthenticity: 0.5 // Below 65% minimum - VIOLATION
  };

  const excellentLiberationValues: LiberationValues = {
    creatorSovereignty: 0.85, // Above minimum
    antiOppressionValidation: true,
    blackQueerEmpowerment: 0.95,
    communityProtection: 0.95,
    culturalAuthenticity: 0.9
  };

  const testJourneyContext: JourneyContext = {
    currentStage: 'growth' as JourneyStage,
    previousStages: ['crisis', 'stabilization'],
    empowermentLevel: 0.7,
    communityConnections: 5,
    resourceAccess: 0.8,
    liberationProgress: 0.75
  };

  beforeEach(() => {
    // Initialize all Layer 3 services
    communityService = new CommunityBusinessLogicService();
    creatorService = new CreatorBusinessLogicService();
    contentService = new ContentBusinessLogicService();
    liberationImpactService = new LiberationImpactBusinessLogicService();
    interfaceManager = new Layer3InterfaceManager();
    microservicesIntegration = new IVORMicroservicesIntegration(interfaceManager);
  });

  afterEach(() => {
    // Clean up after each test
    jest.clearAllMocks();
  });

  // =================================================================================
  // LIBERATION VALUES VALIDATION TESTING - Critical for QI Compliance
  // =================================================================================

  describe('Liberation Values Validation - QI Critical', () => {
    test('should enforce 75% minimum creator sovereignty (LIBERATION REQUIREMENT)', async () => {
      // Test with exactly 75% - should pass
      const result = await creatorService.calculateCreatorSovereignty(
        1000, 'creator-1', 'content-1', validLiberationValues
      );
      
      expect(result.success).toBe(true);
      expect(result.data.isCompliant).toBe(true);
      expect(result.sovereigntyCompliance).toBe(true);
      expect(result.data.creatorPercentage).toBe(0.75);
      expect(result.data.violations).toHaveLength(0);
    });

    test('should reject creator sovereignty below 75% (LIBERATION VIOLATION)', async () => {
      const result = await creatorService.calculateCreatorSovereignty(
        1000, 'creator-1', 'content-1', invalidLiberationValues
      );
      
      expect(result.success).toBe(false);
      expect(result.data.isCompliant).toBe(false);
      expect(result.sovereigntyCompliance).toBe(false);
      expect(result.data.violations).toContain('Creator sovereignty 60.0% below required 75% minimum');
      expect(result.violations).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'creator_sovereignty',
            severity: 'critical',
            description: expect.stringContaining('below required 75% minimum')
          })
        ])
      );
    });

    test('should require anti-oppression validation (COMMUNITY PROTECTION)', async () => {
      const result = await contentService.validateAntiOppression(
        'content-1', 'test content', {}, invalidLiberationValues
      );
      
      expect(result.success).toBe(false);
      expect(result.liberationValidation.isValid).toBe(false);
      expect(result.violations).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'anti_oppression',
            severity: 'critical',
            description: 'Anti-oppression validation not enabled for content protection'
          })
        ])
      );
    });

    test('should enforce minimum empowerment thresholds (BLACK QUEER LIBERATION)', async () => {
      const result = await communityService.validateCommunityInteraction(
        'member-1', 'community-1', 'support', testJourneyContext, invalidLiberationValues
      );

      expect(result.success).toBe(false);
      expect(result.violations).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'empowerment',
            severity: 'major',
            description: expect.stringContaining('Black queer empowerment')
          })
        ])
      );
    });
  });

  // =================================================================================
  // COMMUNITY BUSINESS LOGIC SERVICE TESTING
  // =================================================================================

  describe('Community Business Logic Service - QI Compliance', () => {
    test('should validate community interaction with liberation lens', async () => {
      const result = await communityService.validateCommunityInteraction(
        'member-1', 
        'community-1', 
        'peer_support', 
        testJourneyContext, 
        excellentLiberationValues
      );

      expect(result.success).toBe(true);
      expect(result.data.allow).toBe(true);
      expect(result.empowermentImpact).toBeGreaterThan(0.6);
      expect(result.communityBenefit).toBeGreaterThan(0.7);
      expect(result.data.empowermentOpportunities).toContain('leadership_development');
    });

    test('should process journey progression with liberation criteria', async () => {
      const result = await communityService.processJourneyProgression(
        'user-1',
        'growth' as JourneyStage,
        'community_healing' as JourneyStage,
        testJourneyContext,
        excellentLiberationValues
      );

      expect(result.success).toBe(true);
      expect(result.data.fromStage).toBe('growth');
      expect(result.data.toStage).toBe('community_healing');
      expect(result.data.empowermentRequirements).toContain('peer_support_capacity');
      expect(result.empowermentImpact).toBeGreaterThan(0.7);
    });

    test('should validate democratic participation with accessibility', async () => {
      const result = await communityService.validateDemocraticParticipation(
        'participant-1',
        'community_vote',
        { accessibility: true, inclusivity: 0.9 },
        excellentLiberationValues
      );

      expect(result.success).toBe(true);
      expect(result.data.isValid).toBe(true);
      expect(result.data.accessibilityMeasures).toContain('screen_reader_support');
      expect(result.data.liberationAlignment).toBeGreaterThan(0.8);
    });

    test('should block oppressive community interactions (PROTECTION)', async () => {
      const oppressiveLiberationValues: LiberationValues = {
        ...invalidLiberationValues,
        communityProtection: 0.3 // Very low protection
      };

      const result = await communityService.validateCommunityInteraction(
        'member-1', 
        'community-1', 
        'harmful_interaction',
        testJourneyContext,
        oppressiveLiberationValues
      );

      expect(result.success).toBe(false);
      expect(result.data.allow).toBe(false);
      expect(result.data.reasoning).toContain('Liberation values validation failed');
      expect(result.data.protectionMeasures).toContain('vulnerable_stage_extra_protection');
    });
  });

  // =================================================================================
  // CREATOR BUSINESS LOGIC SERVICE TESTING
  // =================================================================================

  describe('Creator Business Logic Service - QI Compliance', () => {
    test('should enforce 75% creator sovereignty in all revenue calculations', async () => {
      const testCases = [
        { revenue: 1000, expectedCreatorShare: 750 },
        { revenue: 5000, expectedCreatorShare: 3750 },
        { revenue: 100, expectedCreatorShare: 75 }
      ];

      for (const testCase of testCases) {
        const result = await creatorService.calculateCreatorSovereignty(
          testCase.revenue, 'creator-1', 'content-1', validLiberationValues
        );

        expect(result.success).toBe(true);
        expect(result.data.creatorShare).toBe(testCase.expectedCreatorShare);
        expect(result.data.platformShare).toBe(testCase.revenue - testCase.expectedCreatorShare);
        expect(result.data.platformShare / testCase.revenue).toBeLessThanOrEqual(0.25); // Max 25% platform
      }
    });

    test('should protect creator attribution rights with narrative control', async () => {
      const modificationRequest = {
        type: 'remix' as const,
        requesterId: 'user-2',
        purpose: 'community_celebration',
        modifications: ['add_community_voices', 'enhance_representation']
      };

      const result = await creatorService.enforceCreatorAttributionRights(
        'creator-1', 'content-1', modificationRequest, excellentLiberationValues
      );

      expect(result.success).toBe(true);
      expect(result.data.attributionRequired).toBe(true);
      expect(result.data.narrativeControl).toBe(true);
      expect(result.data.modificationRights).toBe('full');
      expect(result.data.culturalRights).toContain('black_queer_representation_rights');
    });

    test('should track economic empowerment with liberation impact', async () => {
      const timeRange = { start: new Date('2024-01-01'), end: new Date('2024-12-31') };
      
      const result = await creatorService.trackEconomicEmpowerment(
        'creator-1', timeRange, excellentLiberationValues
      );

      expect(result.success).toBe(true);
      expect(result.data.liberationImpact).toBeGreaterThan(0.6);
      expect(result.data.empowermentProgress).toBeGreaterThan(0.7);
      expect(result.data.sovereigntyViolations).toHaveLength(0);
      expect(result.empowermentImpact).toBeGreaterThan(0.8);
    });

    test('should identify and report sovereignty violations', async () => {
      const timeRange = { start: new Date('2024-01-01'), end: new Date('2024-12-31') };
      
      const result = await creatorService.trackEconomicEmpowerment(
        'creator-1', timeRange, invalidLiberationValues
      );

      expect(result.success).toBe(false);
      expect(result.data.sovereigntyViolations.length).toBeGreaterThan(0);
      expect(result.data.sovereigntyViolations).toContain('Creator sovereignty 60.0% below required 75%');
      expect(result.recommendations).toContain('Address sovereignty violations to ensure creator liberation');
    });
  });

  // =================================================================================
  // CONTENT BUSINESS LOGIC SERVICE TESTING
  // =================================================================================

  describe('Content Business Logic Service - QI Compliance', () => {
    test('should detect and prevent oppressive content (ANTI-OPPRESSION)', async () => {
      const oppressiveContent = 'content with problematic racist patterns and transphobic elements';
      
      const result = await contentService.validateAntiOppression(
        'content-1', oppressiveContent, {}, excellentLiberationValues
      );

      expect(result.data.oppressionIndicators.length).toBeGreaterThan(0);
      expect(result.data.oppressionIndicators).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: expect.stringMatching(/racism|transphobia/),
            severity: expect.stringMatching(/critical|high|medium|low/)
          })
        ])
      );
    });

    test('should verify cultural authenticity with Black queer representation', async () => {
      const authenticContent = 'content celebrating Black queer joy and liberation';
      const creatorContext = { identity: 'black_queer', community_verified: true };

      const result = await contentService.verifyCulturalAuthenticity(
        'content-1', authenticContent, {}, creatorContext, excellentLiberationValues
      );

      expect(result.success).toBe(true);
      expect(result.data.authenticityScore).toBeGreaterThan(0.8);
      expect(result.data.culturalAppropriation).toBe(false);
      expect(result.data.communityVoices).toBe(true);
      expect(result.data.blackQueerRepresentation).toBeGreaterThan(0.8);
    });

    test('should require community consent for vulnerable content', async () => {
      const result = await contentService.validateCommunityConsent(
        'content-1', 
        'community_story', 
        { vulnerability_level: 'high' }, 
        'critical',
        excellentLiberationValues
      );

      expect(result.success).toBe(true);
      expect(result.data.consentObtained).toBe(true);
      expect(result.data.protectionMeasures).toContain('trauma_informed_presentation');
      expect(result.data.vulnerabilityAssessment).toContain('trauma_potential');
    });

    test('should block culturally appropriative content', async () => {
      const appropriativeContent = 'content extracting Black culture without attribution';
      const nonBlackCreatorContext = { identity: 'non_black', community_verified: false };

      const result = await contentService.verifyCulturalAuthenticity(
        'content-1', appropriativeContent, {}, nonBlackCreatorContext, validLiberationValues
      );

      expect(result.data.culturalAppropriation).toBe(true);
      expect(result.success).toBe(false);
      expect(result.recommendations).toContain('Address cultural appropriation concerns through community consultation');
    });
  });

  // =================================================================================
  // LIBERATION IMPACT BUSINESS LOGIC SERVICE TESTING
  // =================================================================================

  describe('Liberation Impact Business Logic Service - QI Compliance', () => {
    test('should measure comprehensive liberation impact across dimensions', async () => {
      const timeRange = { start: new Date('2024-01-01'), end: new Date('2024-12-31') };
      
      const result = await liberationImpactService.measureLiberationImpact(
        'community-1', 'community', timeRange, excellentLiberationValues
      );

      expect(result.success).toBe(true);
      expect(result.data.overall.empowermentScore).toBeGreaterThan(0.7);
      expect(result.data.overall.liberationProgress).toBeGreaterThan(0.6);
      expect(result.data.overall.communityBenefit).toBeGreaterThan(0.8);
      
      // Check all liberation dimensions
      expect(result.data.dimensions.economic).toBeGreaterThan(0.6);
      expect(result.data.dimensions.social).toBeGreaterThan(0.7);
      expect(result.data.dimensions.political).toBeGreaterThan(0.8);
      expect(result.data.dimensions.cultural).toBeGreaterThan(0.8);
      expect(result.data.dimensions.spiritual).toBeGreaterThan(0.7);
    });

    test('should track individual empowerment progress through journey stages', async () => {
      const result = await liberationImpactService.trackEmpowermentProgress(
        'user-1', 'advocacy' as JourneyStage, testJourneyContext, excellentLiberationValues
      );

      expect(result.success).toBe(true);
      expect(result.data.empowermentLevel).toBeGreaterThan(0.8); // High for advocacy stage
      expect(result.data.liberationProgress).toBeGreaterThan(0.7);
      expect(result.data.communityContribution).toBeGreaterThan(0.6);
      expect(result.data.outcomes).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'political_power',
            measurement: expect.any(Number),
            beneficiaries: expect.any(Number)
          })
        ])
      );
    });

    test('should optimize resource allocation for maximum liberation impact', async () => {
      const availableResources = {
        funding: 10000,
        healthcare_resources: 5000,
        housing_assistance: 8000,
        education_resources: 6000
      };

      const communityNeeds = [
        {
          type: 'health' as const,
          urgency: 'critical' as const,
          affectedPopulation: 100,
          liberationAlignment: 0.9,
          empowermentPotential: 0.8
        },
        {
          type: 'housing' as const,
          urgency: 'high' as const,
          affectedPopulation: 75,
          liberationAlignment: 0.8,
          empowermentPotential: 0.9
        }
      ];

      const liberationPriorities = ['health_justice', 'housing_rights', 'economic_empowerment'];

      const result = await liberationImpactService.optimizeResourceAllocation(
        availableResources, communityNeeds, liberationPriorities, excellentLiberationValues
      );

      expect(result.success).toBe(true);
      expect(result.data.totalImpact).toBeGreaterThan(0.8);
      expect(result.data.recommendedAllocations.length).toBeGreaterThan(0);
      expect(result.data.empowermentOpportunities).toContain('community_healing_enhancement');
      expect(result.communityBenefit).toBeGreaterThan(0.7);
    });
  });

  // =================================================================================
  // LAYER 3 INTERFACE MANAGER TESTING - Clean Separation of Concerns
  // =================================================================================

  describe('Layer 3 Interface Manager - QI Separation of Concerns', () => {
    test('should route Layer 2 requests to appropriate business logic services', async () => {
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

      expect(response.success).toBe(true);
      expect(response.data).toBeDefined();
      expect(response.liberationValidation.isValid).toBe(true);
      expect(response.empowermentTracking.sovereigntyCompliance).toBe(true);
    });

    test('should enforce liberation values at interface boundary', async () => {
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

      expect(response.success).toBe(false);
      expect(response.liberationValidation.isValid).toBe(false);
      expect(response.liberationValidation.violations).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'creator_sovereignty',
            severity: 'critical'
          })
        ])
      );
    });

    test('should process batch requests maintaining liberation standards', async () => {
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

      expect(batchResult.results.length).toBe(2);
      expect(batchResult.overallLiberationScore).toBeGreaterThan(0.8);
      expect(batchResult.aggregateEmpowerment).toBeGreaterThan(0.7);
      expect(batchResult.communityImpact).toBeGreaterThan(0.7);
    });

    test('should maintain clean Layer 3 → Layer 5 interface contracts', async () => {
      const layer5Request = {
        operation: 'read' as const,
        dataType: 'community_data',
        query: { communityId: 'community-1' },
        liberationCriteria: excellentLiberationValues
      };

      const response = await interfaceManager.sendLayer5Request(layer5Request);

      expect(response.success).toBe(true);
      expect(response.liberationCompliance).toBe(true);
      expect(response.errors).toBeUndefined();
    });
  });

  // =================================================================================
  // IVOR MICROSERVICES INTEGRATION TESTING
  // =================================================================================

  describe('IVOR Microservices Integration - QI Ecosystem Compliance', () => {
    test('should register all 7 IVOR microservices with liberation requirements', () => {
      const registeredServices = microservicesIntegration.getRegisteredServices();

      expect(registeredServices).toHaveLength(7);
      
      const expectedServices = [
        'ivor-core', 'ivor-community', 'ivor-organizing', 
        'ivor-social', 'ivor-api-gateway', 'ivor-frontend', 
        'ivor-monitoring'
      ];

      expectedServices.forEach(serviceId => {
        const service = registeredServices.find(s => s.serviceId === serviceId);
        expect(service).toBeDefined();
        expect(service?.liberationValuesRequired).toBe(true);
        expect(service?.supportedOperations.length).toBeGreaterThan(0);
      });
    });

    test('should execute coordinated liberation campaign across services', async () => {
      const crossServiceOperation = {
        operation: 'community_liberation_campaign',
        primaryService: 'ivor-organizing',
        coordinatedServices: ['ivor-community', 'ivor-social', 'ivor-monitoring'],
        liberationRequirements: excellentLiberationValues,
        empowermentGoals: ['political_power', 'community_healing', 'cultural_celebration']
      };

      const result = await microservicesIntegration.executeCoordinatedOperation(crossServiceOperation);

      expect(result.results.length).toBeGreaterThan(0);
      expect(result.overallLiberationScore).toBeGreaterThan(0.8);
      expect(result.aggregateEmpowerment).toBeGreaterThan(0.7);
      expect(result.communityImpact).toBeGreaterThan(0.8);
    });

    test('should validate service health and liberation compliance', async () => {
      const healthCheck = await microservicesIntegration.checkIntegrationHealth();

      expect(healthCheck.overallHealthy).toBe(true);
      
      Object.entries(healthCheck.servicesHealthy).forEach(([serviceId, healthy]) => {
        expect(healthy).toBe(true);
      });

      Object.entries(healthCheck.liberationCompliant).forEach(([serviceId, compliant]) => {
        expect(compliant).toBe(true);
      });

      expect(healthCheck.recommendations).toContain('All IVOR microservices healthy and liberation compliant');
    });

    test('should provide recommended cross-service liberation operations', () => {
      const recommendations = microservicesIntegration.getRecommendedCrossServiceOperations();

      expect(recommendations.length).toBeGreaterThan(0);
      
      recommendations.forEach(operation => {
        expect(operation.liberationRequirements.creatorSovereignty).toBeGreaterThanOrEqual(0.75);
        expect(operation.liberationRequirements.antiOppressionValidation).toBe(true);
        expect(operation.liberationRequirements.blackQueerEmpowerment).toBeGreaterThanOrEqual(0.8);
        expect(operation.empowermentGoals.length).toBeGreaterThan(0);
      });
    });
  });

  // =================================================================================
  // ERROR HANDLING AND EDGE CASES - QI Robustness
  // =================================================================================

  describe('Error Handling and Edge Cases - QI Robustness', () => {
    test('should handle missing liberation values gracefully', async () => {
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

      expect(response.success).toBe(false);
      expect(response.liberationValidation.violations).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            description: 'Liberation values not provided in Layer 2 request'
          })
        ])
      );
    });

    test('should handle unknown operations with clear error messages', async () => {
      const unknownRequest = {
        operation: 'unknown_operation',
        data: { liberationValues: validLiberationValues },
        userId: 'user-1',
        sessionId: 'session-1'
      };

      const response = await interfaceManager.processLayer2Request(unknownRequest);

      expect(response.success).toBe(false);
      expect(response.errors).toContain('Unknown Layer 3 business logic operation: unknown_operation');
    });

    test('should maintain liberation standards during service failures', async () => {
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
      expect(result.overallLiberationScore).toBeGreaterThan(0.8); // Liberation values maintained
      expect(result.systemicRecommendations).toContain(
        expect.stringMatching(/service.*coordination/i)
      );
    });
  });

  // =================================================================================
  // PERFORMANCE AND LIBERATION METRICS - QI Optimization
  // =================================================================================

  describe('Performance and Liberation Metrics - QI Optimization', () => {
    test('should maintain high empowerment impact across all operations', async () => {
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

        expect(response.success).toBe(true);
        expect(response.empowermentTracking.empowermentImpact).toBeGreaterThan(0.6);
        expect(response.empowermentTracking.communityBenefit).toBeGreaterThan(0.6);
        expect(response.empowermentTracking.sovereigntyCompliance).toBe(true);
      }
    });

    test('should achieve liberation compliance across all service integrations', async () => {
      const services = ['ivor-core', 'ivor-community', 'ivor-organizing', 'ivor-social'];
      
      for (const serviceId of services) {
        const healthCheck = await microservicesIntegration.checkIntegrationHealth();
        
        expect(healthCheck.servicesHealthy[serviceId]).toBe(true);
        expect(healthCheck.liberationCompliant[serviceId]).toBe(true);
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
function createTestLiberationValues(overrides: Partial<LiberationValues> = {}): LiberationValues {
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
function validateLiberationCompliance(result: any): void {
  expect(result.liberationValidation).toBeDefined();
  expect(result.empowermentImpact).toBeGreaterThanOrEqual(0);
  expect(result.communityBenefit).toBeGreaterThanOrEqual(0);
  expect(result.sovereigntyCompliance).toBeDefined();
}

/**
 * Helper function to create comprehensive test journey context
 */
function createTestJourneyContext(stage: JourneyStage = 'growth'): JourneyContext {
  return {
    currentStage: stage,
    previousStages: stage === 'crisis' ? [] : ['crisis'],
    empowermentLevel: 0.7,
    communityConnections: 5,
    resourceAccess: 0.8,
    liberationProgress: 0.75
  };
}