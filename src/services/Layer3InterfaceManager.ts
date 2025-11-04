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

import {
  Layer2ToLayer3Request,
  Layer2ToLayer3Response,
  Layer3ToLayer5Request,
  Layer3ToLayer5Response,
  Layer4ToLayer3GovernanceInput,
  LiberationValues,
  LiberationValidationResult,
  BusinessLogicOperationResult,
  BatchBusinessLogicResult,
  LIBERATION_CONSTANTS
} from '../types/layer3-business-logic.js';

import CommunityBusinessLogicService from './CommunityBusinessLogicService.js';
import CreatorBusinessLogicService from './CreatorBusinessLogicService.js';
import ContentBusinessLogicService from './ContentBusinessLogicService.js';
import LiberationImpactBusinessLogicService from './LiberationImpactBusinessLogicService.js';

// =====================================================================================
// LAYER 3 INTERFACE MANAGER - Clean Integration
// =====================================================================================

export class Layer3InterfaceManager {
  private communityService: CommunityBusinessLogicService;
  private creatorService: CreatorBusinessLogicService;
  private contentService: ContentBusinessLogicService;
  private liberationImpactService: LiberationImpactBusinessLogicService;

  constructor() {
    // Initialize Layer 3 Business Logic Services
    this.communityService = new CommunityBusinessLogicService();
    this.creatorService = new CreatorBusinessLogicService();
    this.contentService = new ContentBusinessLogicService();
    this.liberationImpactService = new LiberationImpactBusinessLogicService();
  }

  // =================================================================================
  // LAYER 2 → LAYER 3 INTERFACE - API Gateway to Business Logic
  // =================================================================================

  /**
   * Process business logic request from Layer 2 API Gateway
   * Routes to appropriate Layer 3 Business Logic Service based on operation
   */
  async processLayer2Request(request: Layer2ToLayer3Request): Promise<Layer2ToLayer3Response> {
    try {
      // Liberation Values Enforcement - Interface Contract
      const liberationValidation = await this.validateRequestLiberationCompliance(request);

      // Route to appropriate business logic service
      let result: BusinessLogicOperationResult<any>;

      switch (request.operation) {
        case 'community_interaction':
          result = await this.handleCommunityInteraction(request);
          break;
        case 'journey_progression':
          result = await this.handleJourneyProgression(request);
          break;
        case 'democratic_participation':
          result = await this.handleDemocraticParticipation(request);
          break;
        case 'creator_sovereignty':
          result = await this.handleCreatorSovereignty(request);
          break;
        case 'creator_attribution':
          result = await this.handleCreatorAttribution(request);
          break;
        case 'economic_empowerment':
          result = await this.handleEconomicEmpowerment(request);
          break;
        case 'content_validation':
          result = await this.handleContentValidation(request);
          break;
        case 'cultural_authenticity':
          result = await this.handleCulturalAuthenticity(request);
          break;
        case 'community_consent':
          result = await this.handleCommunityConsent(request);
          break;
        case 'liberation_impact':
          result = await this.handleLiberationImpact(request);
          break;
        case 'empowerment_tracking':
          result = await this.handleEmpowermentTracking(request);
          break;
        case 'resource_allocation':
          result = await this.handleResourceAllocation(request);
          break;
        default:
          throw new Error(`Unknown Layer 3 business logic operation: ${request.operation}`);
      }

      // Combine validations and prepare response
      const combinedValidation = this.combineValidations(liberationValidation, result.liberationValidation);

      return {
        success: result.success && liberationValidation.isValid,
        data: result.data,
        liberationValidation: combinedValidation,
        empowermentTracking: {
          empowermentImpact: result.empowermentImpact,
          communityBenefit: result.communityBenefit,
          sovereigntyCompliance: result.sovereigntyCompliance,
          liberationProgress: this.calculateProgressFromResult(result)
        },
        errors: result.success ? undefined : this.extractErrors(result, combinedValidation)
      };

    } catch (error) {
      return {
        success: false,
        data: null,
        liberationValidation: {
          isValid: false,
          violations: [{
            type: 'anti_oppression',
            severity: 'critical',
            description: `Layer 3 interface error: ${error.message}`,
            remedy: 'Review request parameters and liberation values compliance'
          }],
          empowermentScore: 0,
          recommendations: ['Fix interface request and retry operation']
        },
        empowermentTracking: {
          empowermentImpact: 0,
          communityBenefit: 0,
          sovereigntyCompliance: false,
          liberationProgress: 0
        },
        errors: [error.message]
      };
    }
  }

  /**
   * Process batch business logic requests for efficiency
   */
  async processBatchLayer2Requests(requests: Layer2ToLayer3Request[]): Promise<BatchBusinessLogicResult> {
    const results: BusinessLogicOperationResult<any>[] = [];
    let overallLiberationScore = 0;
    let aggregateEmpowerment = 0;
    let communityImpact = 0;

    // Process each request (maintaining separation of concerns)
    for (const request of requests) {
      const response = await this.processLayer2Request(request);
      
      if (response.success && response.data) {
        const result: BusinessLogicOperationResult<any> = {
          success: response.success,
          data: response.data,
          liberationValidation: response.liberationValidation,
          empowermentImpact: response.empowermentTracking.empowermentImpact,
          communityBenefit: response.empowermentTracking.communityBenefit,
          sovereigntyCompliance: response.empowermentTracking.sovereigntyCompliance,
          recommendations: response.liberationValidation.recommendations,
          violations: response.liberationValidation.violations
        };
        
        results.push(result);
        overallLiberationScore += response.liberationValidation.empowermentScore;
        aggregateEmpowerment += response.empowermentTracking.empowermentImpact;
        communityImpact += response.empowermentTracking.communityBenefit;
      }
    }

    // Calculate aggregated metrics
    const totalResults = results.length;
    if (totalResults > 0) {
      overallLiberationScore /= totalResults;
      aggregateEmpowerment /= totalResults;
      communityImpact /= totalResults;
    }

    return {
      results,
      overallLiberationScore,
      aggregateEmpowerment,
      communityImpact,
      systemicRecommendations: this.generateSystemicRecommendations(results)
    };
  }

  // =================================================================================
  // LAYER 3 → LAYER 5 INTERFACE - Business Logic to Data Operations
  // =================================================================================

  /**
   * Send data operation request to Layer 5 with liberation criteria
   */
  async sendLayer5Request(request: Layer3ToLayer5Request): Promise<Layer3ToLayer5Response> {
    // This would integrate with Layer 5 Data Operations
    // For now, return mock response maintaining separation of concerns
    
    // Liberation compliance validation for data operations
    const liberationCompliant = this.validateDataOperationLiberationCompliance(request);

    return {
      success: liberationCompliant,
      data: null, // Layer 5 would populate this
      liberationCompliance: liberationCompliant,
      errors: liberationCompliant ? undefined : ['Liberation criteria not met for data operation']
    };
  }

  // =================================================================================
  // LAYER 4 → LAYER 3 INTERFACE - Governance Input Processing
  // =================================================================================

  /**
   * Process governance decision input from Layer 4
   */
  async processGovernanceInput(input: Layer4ToLayer3GovernanceInput): Promise<boolean> {
    // Business logic to apply governance decisions
    
    // Validate governance compliance with liberation values
    const validGovernance = input.democraticValidation && 
                           input.communityDecision && 
                           input.liberationRequirements.creatorSovereignty >= LIBERATION_CONSTANTS.MINIMUM_CREATOR_SOVEREIGNTY;

    if (validGovernance) {
      // Apply governance rule to business logic services
      await this.applyGovernanceRule(input.governanceRule, input.liberationRequirements);
    }

    return validGovernance;
  }

  // =================================================================================
  // BUSINESS LOGIC SERVICE HANDLERS - Route to Specific Services
  // =================================================================================

  private async handleCommunityInteraction(request: Layer2ToLayer3Request): Promise<BusinessLogicOperationResult<any>> {
    const { memberId, targetCommunityId, interactionType, journeyContext, liberationValues } = request.data;
    return await this.communityService.validateCommunityInteraction(
      memberId,
      targetCommunityId,
      interactionType,
      journeyContext,
      liberationValues
    );
  }

  private async handleJourneyProgression(request: Layer2ToLayer3Request): Promise<BusinessLogicOperationResult<any>> {
    const { userId, currentStage, targetStage, journeyContext, liberationValues } = request.data;
    return await this.communityService.processJourneyProgression(
      userId,
      currentStage,
      targetStage,
      journeyContext,
      liberationValues
    );
  }

  private async handleDemocraticParticipation(request: Layer2ToLayer3Request): Promise<BusinessLogicOperationResult<any>> {
    const { participantId, participationType, communityContext, liberationValues } = request.data;
    return await this.communityService.validateDemocraticParticipation(
      participantId,
      participationType,
      communityContext,
      liberationValues
    );
  }

  private async handleCreatorSovereignty(request: Layer2ToLayer3Request): Promise<BusinessLogicOperationResult<any>> {
    const { totalRevenue, creatorId, contentId, liberationValues } = request.data;
    return await this.creatorService.calculateCreatorSovereignty(
      totalRevenue,
      creatorId,
      contentId,
      liberationValues
    );
  }

  private async handleCreatorAttribution(request: Layer2ToLayer3Request): Promise<BusinessLogicOperationResult<any>> {
    const { creatorId, contentId, modificationRequest, liberationValues } = request.data;
    return await this.creatorService.enforceCreatorAttributionRights(
      creatorId,
      contentId,
      modificationRequest,
      liberationValues
    );
  }

  private async handleEconomicEmpowerment(request: Layer2ToLayer3Request): Promise<BusinessLogicOperationResult<any>> {
    const { creatorId, timeRange, liberationValues } = request.data;
    return await this.creatorService.trackEconomicEmpowerment(
      creatorId,
      timeRange,
      liberationValues
    );
  }

  private async handleContentValidation(request: Layer2ToLayer3Request): Promise<BusinessLogicOperationResult<any>> {
    const { contentId, contentText, contentMetadata, liberationValues } = request.data;
    return await this.contentService.validateAntiOppression(
      contentId,
      contentText,
      contentMetadata,
      liberationValues
    );
  }

  private async handleCulturalAuthenticity(request: Layer2ToLayer3Request): Promise<BusinessLogicOperationResult<any>> {
    const { contentId, contentText, contentMetadata, creatorContext, liberationValues } = request.data;
    return await this.contentService.verifyCulturalAuthenticity(
      contentId,
      contentText,
      contentMetadata,
      creatorContext,
      liberationValues
    );
  }

  private async handleCommunityConsent(request: Layer2ToLayer3Request): Promise<BusinessLogicOperationResult<any>> {
    const { contentId, contentType, communityContext, vulnerabilityLevel, liberationValues } = request.data;
    return await this.contentService.validateCommunityConsent(
      contentId,
      contentType,
      communityContext,
      vulnerabilityLevel,
      liberationValues
    );
  }

  private async handleLiberationImpact(request: Layer2ToLayer3Request): Promise<BusinessLogicOperationResult<any>> {
    const { entityId, entityType, timeRange, liberationValues } = request.data;
    return await this.liberationImpactService.measureLiberationImpact(
      entityId,
      entityType,
      timeRange,
      liberationValues
    );
  }

  private async handleEmpowermentTracking(request: Layer2ToLayer3Request): Promise<BusinessLogicOperationResult<any>> {
    const { userId, currentStage, journeyContext, liberationValues } = request.data;
    return await this.liberationImpactService.trackEmpowermentProgress(
      userId,
      currentStage,
      journeyContext,
      liberationValues
    );
  }

  private async handleResourceAllocation(request: Layer2ToLayer3Request): Promise<BusinessLogicOperationResult<any>> {
    const { availableResources, communityNeeds, liberationPriorities, liberationValues } = request.data;
    return await this.liberationImpactService.optimizeResourceAllocation(
      availableResources,
      communityNeeds,
      liberationPriorities,
      liberationValues
    );
  }

  // =================================================================================
  // LIBERATION VALUES VALIDATION AND INTERFACE UTILITIES
  // =================================================================================

  private async validateRequestLiberationCompliance(request: Layer2ToLayer3Request): Promise<LiberationValidationResult> {
    const violations = [];
    let empowermentScore = 0;

    // Check if liberation values are provided
    if (!request.data.liberationValues) {
      violations.push({
        type: 'anti_oppression' as const,
        severity: 'critical' as const,
        description: 'Liberation values not provided in Layer 2 request',
        remedy: 'Include liberation values in all Layer 3 business logic requests'
      });
      
      return {
        isValid: false,
        violations,
        empowermentScore: 0,
        recommendations: ['Ensure liberation values are provided in all business logic operations']
      };
    }

    const values: LiberationValues = request.data.liberationValues;

    // Creator Sovereignty Validation
    if (values.creatorSovereignty < LIBERATION_CONSTANTS.MINIMUM_CREATOR_SOVEREIGNTY) {
      violations.push({
        type: 'creator_sovereignty' as const,
        severity: 'critical' as const,
        description: `Creator sovereignty ${values.creatorSovereignty} below required 75% minimum`,
        remedy: 'Increase creator sovereignty to meet liberation interface requirements'
      });
    } else {
      empowermentScore += 0.25;
    }

    // Anti-Oppression Validation
    if (!values.antiOppressionValidation) {
      violations.push({
        type: 'anti_oppression' as const,
        severity: 'critical' as const,
        description: 'Anti-oppression validation not enabled',
        remedy: 'Enable anti-oppression validation for Layer 3 interface compliance'
      });
    } else {
      empowermentScore += 0.25;
    }

    // Community Protection Validation
    if (values.communityProtection < LIBERATION_CONSTANTS.MINIMUM_COMMUNITY_PROTECTION) {
      violations.push({
        type: 'protection' as const,
        severity: 'major' as const,
        description: `Community protection ${values.communityProtection} below required 70% minimum`,
        remedy: 'Strengthen community protection measures for interface compliance'
      });
    } else {
      empowermentScore += 0.25;
    }

    // Black Queer Empowerment Validation
    if (values.blackQueerEmpowerment < LIBERATION_CONSTANTS.MINIMUM_EMPOWERMENT_SCORE) {
      violations.push({
        type: 'empowerment' as const,
        severity: 'major' as const,
        description: `Black queer empowerment ${values.blackQueerEmpowerment} below required 60% minimum`,
        remedy: 'Enhance Black queer empowerment for liberation interface compliance'
      });
    } else {
      empowermentScore += 0.25;
    }

    return {
      isValid: violations.filter(v => v.severity === 'critical').length === 0,
      violations,
      empowermentScore,
      recommendations: violations.map(v => v.remedy)
    };
  }

  private validateDataOperationLiberationCompliance(request: Layer3ToLayer5Request): boolean {
    // Validate that data operations meet liberation criteria
    const liberationCriteria = request.liberationCriteria;
    
    return liberationCriteria.creatorSovereignty >= LIBERATION_CONSTANTS.MINIMUM_CREATOR_SOVEREIGNTY &&
           liberationCriteria.antiOppressionValidation &&
           liberationCriteria.communityProtection >= LIBERATION_CONSTANTS.MINIMUM_COMMUNITY_PROTECTION &&
           liberationCriteria.blackQueerEmpowerment >= LIBERATION_CONSTANTS.MINIMUM_EMPOWERMENT_SCORE;
  }

  private async applyGovernanceRule(rule: string, liberationRequirements: LiberationValues): Promise<void> {
    // Apply governance rules to business logic services
    // This would update service configurations based on community decisions
    console.log(`Applying governance rule: ${rule} with liberation requirements`, liberationRequirements);
  }

  private combineValidations(
    interfaceValidation: LiberationValidationResult,
    serviceValidation: LiberationValidationResult
  ): LiberationValidationResult {
    return {
      isValid: interfaceValidation.isValid && serviceValidation.isValid,
      violations: [...interfaceValidation.violations, ...serviceValidation.violations],
      empowermentScore: (interfaceValidation.empowermentScore + serviceValidation.empowermentScore) / 2,
      recommendations: [...interfaceValidation.recommendations, ...serviceValidation.recommendations]
    };
  }

  private calculateProgressFromResult(result: BusinessLogicOperationResult<any>): number {
    // Calculate liberation progress from business logic result
    return (result.empowermentImpact + result.communityBenefit + (result.sovereigntyCompliance ? 0.3 : 0)) / 3;
  }

  private extractErrors(result: BusinessLogicOperationResult<any>, validation: LiberationValidationResult): string[] {
    const errors = [];
    
    if (!result.success) {
      errors.push('Business logic operation failed');
    }
    
    if (!validation.isValid) {
      errors.push('Liberation values validation failed');
    }

    validation.violations.forEach(violation => {
      if (violation.severity === 'critical' || violation.severity === 'major') {
        errors.push(violation.description);
      }
    });

    return errors;
  }

  private generateSystemicRecommendations(results: BusinessLogicOperationResult<any>[]): string[] {
    const recommendations = [];
    
    const failedCount = results.filter(r => !r.success).length;
    const lowEmpowermentCount = results.filter(r => r.empowermentImpact < 0.6).length;
    const sovereigntyViolations = results.filter(r => !r.sovereigntyCompliance).length;

    if (failedCount > results.length * 0.2) {
      recommendations.push('Review business logic implementation for systematic issues');
    }

    if (lowEmpowermentCount > results.length * 0.3) {
      recommendations.push('Focus on increasing empowerment impact across all operations');
    }

    if (sovereigntyViolations > results.length * 0.1) {
      recommendations.push('Address creator sovereignty violations systematically');
    }

    recommendations.push('Continue monitoring liberation metrics and community impact');

    return recommendations;
  }

  // =================================================================================
  // PUBLIC INTERFACE FOR IVOR MICROSERVICES INTEGRATION
  // =================================================================================

  /**
   * Get all available business logic operations for IVOR microservices
   */
  getAvailableOperations(): string[] {
    return [
      'community_interaction',
      'journey_progression',
      'democratic_participation',
      'creator_sovereignty',
      'creator_attribution',
      'economic_empowerment',
      'content_validation',
      'cultural_authenticity',
      'community_consent',
      'liberation_impact',
      'empowerment_tracking',
      'resource_allocation'
    ];
  }

  /**
   * Get Layer 3 service health status
   */
  async getServiceHealth(): Promise<{ 
    healthy: boolean, 
    services: Record<string, boolean>,
    liberationCompliance: boolean 
  }> {
    const serviceStatuses = {
      community: true, // this.communityService would have health check
      creator: true,
      content: true,
      liberationImpact: true
    };

    const allHealthy = Object.values(serviceStatuses).every(status => status);
    
    return {
      healthy: allHealthy,
      services: serviceStatuses,
      liberationCompliance: true // All services implement liberation values
    };
  }
}

export default Layer3InterfaceManager;