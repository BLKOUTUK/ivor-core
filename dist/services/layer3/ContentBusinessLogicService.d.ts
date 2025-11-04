import { AntiOppressionValidation, CulturalAuthenticityVerification, CommunityConsentValidation, BusinessLogicOperationResult } from '../../types/layer3-business-logic.js';
/**
 * Layer 3: Content Business Logic Service
 *
 * CORE RESPONSIBILITY: Content validation and cultural authenticity business logic
 *
 * PERFECT SEPARATION OF CONCERNS:
 * ✅ ONLY business logic operations
 * ❌ NO API Gateway operations (Layer 2)
 * ❌ NO data persistence (Layer 5)
 * ❌ NO infrastructure management (Layer 6)
 * ❌ NO governance decisions (Layer 4)
 *
 * LIBERATION VALUES EMBEDDED:
 * - Anti-oppression content validation
 * - Cultural authenticity verification
 * - Community consent requirement validation
 * - Black queer empowerment through content
 * - Liberation narrative prioritization
 */
export declare class ContentBusinessLogicService {
    private readonly oppressionPatterns;
    private readonly culturalAuthenticityCriteria;
    private readonly communityVoiceIndicators;
    constructor();
    /**
     * Validate content against anti-oppression standards with liberation values
     * PURE BUSINESS LOGIC: Identifies and prevents oppressive content patterns
     */
    validateAntiOppression(contentId: string, contentData: {
        text?: string;
        metadata?: any;
        tags?: string[];
        creatorContext?: any;
    }, liberationContext?: any): BusinessLogicOperationResult<AntiOppressionValidation>;
    /**
     * Verify cultural authenticity with Black queer liberation standards
     * PURE BUSINESS LOGIC: Ensures authentic cultural representation and prevents appropriation
     */
    verifyCulturalAuthenticity(contentId: string, contentData: any, creatorProfile: any, communityContext?: any): BusinessLogicOperationResult<CulturalAuthenticityVerification>;
    /**
     * Validate community consent with liberation principles
     * PURE BUSINESS LOGIC: Ensures content respects community autonomy and consent
     */
    validateCommunityConsent(contentId: string, contentData: any, communityData: any, potentialImpacts: any[]): BusinessLogicOperationResult<CommunityConsentValidation>;
    /**
     * Apply comprehensive content quality assessment with liberation lens
     * PURE BUSINESS LOGIC: Holistic content evaluation through liberation framework
     */
    assessContentQuality(contentId: string, contentData: any, creatorProfile: any, communityContext?: any): BusinessLogicOperationResult<{
        overallScore: number;
        liberationAlignment: number;
        empowermentPotential: number;
        communityValue: number;
        recommendations: string[];
    }>;
    private detectOppressionIndicators;
    private assessOppressionSeverity;
    private findPatternLocation;
    private generateOppressionRemedy;
    private calculateCulturalAuthenticityScore;
    private detectCulturalAppropriation;
    private validateCommunityVoices;
    private assessBlackQueerRepresentation;
    private analyzeStereotypePatterns;
    private assessCommunityConsent;
    private calculateCommunityImpact;
    private assessCommunityVulnerability;
    private generateCommunityProtectionMeasures;
    private validateContentLiberationValues;
    private validateCulturalLiberationValues;
    private validateConsentLiberationValues;
    private assessBlackQueerEmpowermentInContent;
    private assessContentCulturalAuthenticity;
    private validateCommunityContentConsent;
    private calculateContentLiberationAlignment;
    private calculateContentEmpowermentPotential;
    private calculateOverallCommunityValue;
    private promotesLiberationValues;
    private strengthensCommunityBonds;
    private providesEmpowermentResources;
    private celebratesCommunityJoy;
    private risksCommunityHarm;
    private perpetuatesStereotypes;
    private extractsFromCommunity;
    private centersCommunityVoices;
    private containsSensitiveInformation;
    private risksMisrepresentation;
    private requiresCommunityOversight;
    private impactsCommunityWithoutConsent;
    private assessCulturalElements;
    private assessLanguageAuthenticity;
    private containsLiberationMessaging;
    private extractCulturalElements;
    private isElementAppropriate;
    private assessContentEmpowermentImpact;
    private calculateContentCommunityBenefit;
    private calculateAuthenticityCommunityBenefit;
    private generateAntiOppressionRecommendations;
    private generateAuthenticityRecommendations;
    private generateConsentRecommendations;
    private generateHolisticContentRecommendations;
    private generateContentLiberationRecommendations;
    private initializeOppressionPatterns;
    private initializeCulturalAuthenticityCriteria;
    private initializeCommunityVoiceIndicators;
}
//# sourceMappingURL=ContentBusinessLogicService.d.ts.map