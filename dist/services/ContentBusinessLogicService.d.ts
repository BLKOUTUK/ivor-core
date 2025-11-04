/**
 * Layer 3: Content Business Logic Service
 * BLKOUT Community Liberation Platform
 *
 * CRITICAL: This service implements ONLY content business logic operations.
 * PERFECT SEPARATION OF CONCERNS:
 * - ONLY business logic for content validation and liberation assessment
 * - NO API Gateway operations (Layer 2)
 * - NO data persistence operations (Layer 5)
 * - NO infrastructure management (Layer 6)
 * - NO governance decisions (Layer 4)
 *
 * LIBERATION VALUES EMBEDDED:
 * - Anti-Oppression Validation: Every content operation validated for oppressive impacts
 * - Cultural Authenticity Verification: Black queer culture and joy centered
 * - Community Consent Requirement: Community protection prioritized
 * - Content Quality Assessment: Liberation lens applied to all evaluations
 * - Community Protection: Built into every content business rule
 */
import { LiberationValues, AntiOppressionValidation, CulturalAuthenticityVerification, CommunityConsentValidation, BusinessLogicOperationResult } from '../types/layer3-business-logic.js';
export declare class ContentBusinessLogicService {
    private readonly OPPRESSION_TYPES;
    private readonly CULTURAL_AUTHENTICITY_INDICATORS;
    constructor();
    /**
     * Validate content for anti-oppression compliance - BUSINESS LOGIC ONLY
     * Analyzes content through liberation lens for oppressive patterns and impacts
     */
    validateAntiOppression(contentId: string, contentText: string, contentMetadata: any, liberationValues: LiberationValues): Promise<BusinessLogicOperationResult<AntiOppressionValidation>>;
    /**
     * Verify cultural authenticity of content - BUSINESS LOGIC ONLY
     * Ensures content authentically represents Black queer experiences and joy
     */
    verifyCulturalAuthenticity(contentId: string, contentText: string, contentMetadata: any, creatorContext: any, liberationValues: LiberationValues): Promise<BusinessLogicOperationResult<CulturalAuthenticityVerification>>;
    /**
     * Validate community consent for content - BUSINESS LOGIC ONLY
     * Ensures content respects community boundaries and consent requirements
     */
    validateCommunityConsent(contentId: string, contentType: string, communityContext: any, vulnerabilityLevel: 'low' | 'medium' | 'high' | 'critical', liberationValues: LiberationValues): Promise<BusinessLogicOperationResult<CommunityConsentValidation>>;
    private validateLiberationValues;
    private detectOppressionIndicators;
    private detectRacism;
    private detectTransphobia;
    private detectHomophobia;
    private detectClassism;
    private detectAbleism;
    private detectSexism;
    private calculateAuthenticityScore;
    private detectCulturalAppropriation;
    private assessConsentRequirement;
    private verifyConsentObtained;
    private assessCommunityImpact;
    private containsOppressionPattern;
    private assessOppressionSeverity;
    private findPatternLocation;
    private mapOppressionToViolations;
    private calculateContentLiberationAlignment;
    private calculateContentEmpowermentImpact;
    private calculateContentCommunityBenefit;
    private generateContentRecommendations;
    private containsBlackQueerVoices;
    private hasCommunityRepresentation;
    private celebratesCulture;
    private containsLiberationThemes;
    private creatorHasCulturalConnection;
    private containsProtectedCulturalElements;
    private isExtractiveCulturalUsage;
    private isCommunityCentric;
    private conductVulnerabilityAssessment;
    private generateProtectionMeasures;
    private calculateAuthenticityEmpowermentImpact;
    private calculateAuthenticityCommunityBenefit;
    private generateAuthenticityRecommendations;
    private calculateConsentEmpowermentImpact;
    private generateConsentRecommendations;
    private analyzeBlackQueerRepresentation;
    private analyzeStereotypes;
    private assessCommunityVoices;
}
export default ContentBusinessLogicService;
//# sourceMappingURL=ContentBusinessLogicService.d.ts.map