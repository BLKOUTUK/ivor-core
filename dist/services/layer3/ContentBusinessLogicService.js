"use strict";
// Layer 3: Content Business Logic Service  
// Revolutionary Content Liberation Business Logic with Anti-Oppression Validation
// Perfect Separation of Concerns + Cultural Authenticity Embedded
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContentBusinessLogicService = void 0;
const layer3_business_logic_js_1 = require("../../types/layer3-business-logic.js");
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
class ContentBusinessLogicService {
    constructor() {
        this.oppressionPatterns = new Map();
        this.culturalAuthenticityCriteria = new Map();
        this.communityVoiceIndicators = [];
        this.initializeOppressionPatterns();
        this.initializeCulturalAuthenticityCriteria();
        this.initializeCommunityVoiceIndicators();
    }
    // =============================================================================
    // ANTI-OPPRESSION CONTENT VALIDATION BUSINESS LOGIC
    // =============================================================================
    /**
     * Validate content against anti-oppression standards with liberation values
     * PURE BUSINESS LOGIC: Identifies and prevents oppressive content patterns
     */
    validateAntiOppression(contentId, contentData, liberationContext) {
        // 1. Apply liberation values framework to content validation
        const contentLiberationValues = {
            creatorSovereignty: 0.8, // High sovereignty for content creators
            antiOppressionValidation: true,
            blackQueerEmpowerment: this.assessBlackQueerEmpowermentInContent(contentData),
            communityProtection: 0.9, // Maximum protection from oppressive content
            culturalAuthenticity: this.assessContentCulturalAuthenticity(contentData)
        };
        const liberationValidation = this.validateContentLiberationValues(contentLiberationValues);
        // 2. Detect oppression indicators using liberation-centered analysis
        const oppressionIndicators = this.detectOppressionIndicators(contentData);
        // 3. Calculate liberation alignment score
        const liberationAlignment = this.calculateContentLiberationAlignment(contentData, oppressionIndicators, liberationContext);
        // 4. Validate community consent for content
        const communityConsent = this.validateCommunityContentConsent(contentData, liberationContext);
        // 5. Determine overall validity with liberation standards
        const isValid = liberationValidation.isValid &&
            oppressionIndicators.length === 0 &&
            liberationAlignment >= 0.7 &&
            communityConsent;
        const validation = {
            contentId,
            isValid,
            oppressionIndicators,
            culturalAuthenticity: contentLiberationValues.culturalAuthenticity,
            communityConsent,
            liberationAlignment
        };
        return {
            success: isValid,
            data: validation,
            liberationValidation,
            empowermentImpact: liberationAlignment,
            communityBenefit: this.calculateContentCommunityBenefit(validation),
            sovereigntyCompliance: true, // Content validation doesn't directly impact sovereignty
            recommendations: this.generateAntiOppressionRecommendations(validation, liberationValidation),
            violations: liberationValidation.violations
        };
    }
    /**
     * Verify cultural authenticity with Black queer liberation standards
     * PURE BUSINESS LOGIC: Ensures authentic cultural representation and prevents appropriation
     */
    verifyCulturalAuthenticity(contentId, contentData, creatorProfile, communityContext) {
        // 1. Calculate cultural authenticity score using liberation criteria
        const authenticityScore = this.calculateCulturalAuthenticityScore(contentData, creatorProfile, communityContext);
        // 2. Detect cultural appropriation patterns
        const appropriationDetected = this.detectCulturalAppropriation(contentData, creatorProfile);
        // 3. Validate community voices and representation
        const communityVoices = this.validateCommunityVoices(contentData);
        // 4. Assess Black queer representation quality
        const blackQueerRepresentation = this.assessBlackQueerRepresentation(contentData);
        // 5. Analyze stereotype patterns for liberation impact
        const stereotypeAnalysis = this.analyzeStereotypePatterns(contentData);
        // 6. Liberation values validation for cultural authenticity
        const liberationValidation = this.validateCulturalLiberationValues({
            creatorSovereignty: 0.8,
            antiOppressionValidation: !appropriationDetected,
            blackQueerEmpowerment: blackQueerRepresentation,
            communityProtection: communityVoices ? 0.9 : 0.6,
            culturalAuthenticity: authenticityScore
        });
        const verification = {
            contentId,
            authenticityScore,
            culturalAppropriation: appropriationDetected,
            communityVoices,
            blackQueerRepresentation,
            stereotypeAnalysis
        };
        return {
            success: liberationValidation.isValid && authenticityScore >= layer3_business_logic_js_1.LIBERATION_CONSTANTS.MINIMUM_CULTURAL_AUTHENTICITY,
            data: verification,
            liberationValidation,
            empowermentImpact: blackQueerRepresentation,
            communityBenefit: this.calculateAuthenticityCommunityBenefit(verification),
            sovereigntyCompliance: !appropriationDetected,
            recommendations: this.generateAuthenticityRecommendations(verification, liberationValidation),
            violations: liberationValidation.violations
        };
    }
    /**
     * Validate community consent with liberation principles
     * PURE BUSINESS LOGIC: Ensures content respects community autonomy and consent
     */
    validateCommunityConsent(contentId, contentData, communityData, potentialImpacts) {
        // 1. Assess community consent based on liberation principles
        const consentObtained = this.assessCommunityConsent(contentData, communityData);
        // 2. Calculate community impact score with liberation focus
        const communityImpact = this.calculateCommunityImpact(contentData, potentialImpacts, communityData);
        // 3. Assess vulnerability and protection needs
        const vulnerabilityAssessment = this.assessCommunityVulnerability(contentData, communityData, potentialImpacts);
        // 4. Generate protection measures based on liberation values
        const protectionMeasures = this.generateCommunityProtectionMeasures(vulnerabilityAssessment, communityImpact, contentData);
        // 5. Liberation values validation for community consent
        const liberationValidation = this.validateConsentLiberationValues({
            creatorSovereignty: 0.8,
            antiOppressionValidation: communityImpact >= 0,
            blackQueerEmpowerment: this.assessContentEmpowermentImpact(contentData, communityData),
            communityProtection: protectionMeasures.length > 0 ? 0.9 : 0.7,
            culturalAuthenticity: 0.8
        });
        const validation = {
            contentId,
            consentObtained,
            communityImpact,
            vulnerabilityAssessment,
            protectionMeasures
        };
        return {
            success: liberationValidation.isValid && consentObtained && communityImpact >= 0,
            data: validation,
            liberationValidation,
            empowermentImpact: Math.max(communityImpact, 0),
            communityBenefit: communityImpact,
            sovereigntyCompliance: consentObtained,
            recommendations: this.generateConsentRecommendations(validation, liberationValidation),
            violations: liberationValidation.violations
        };
    }
    /**
     * Apply comprehensive content quality assessment with liberation lens
     * PURE BUSINESS LOGIC: Holistic content evaluation through liberation framework
     */
    assessContentQuality(contentId, contentData, creatorProfile, communityContext) {
        // 1. Run all validation components
        const antiOppressionResult = this.validateAntiOppression(contentId, contentData, communityContext);
        const authenticityResult = this.verifyCulturalAuthenticity(contentId, contentData, creatorProfile, communityContext);
        const consentResult = this.validateCommunityConsent(contentId, contentData, communityContext, []);
        // 2. Calculate weighted liberation scores
        const liberationAlignment = (antiOppressionResult.data.liberationAlignment * 0.4 +
            authenticityResult.data.authenticityScore * 0.3 +
            (consentResult.data.consentObtained ? 1.0 : 0.0) * 0.3);
        // 3. Assess empowerment potential
        const empowermentPotential = this.calculateContentEmpowermentPotential(contentData, antiOppressionResult.data, authenticityResult.data);
        // 4. Calculate community value
        const communityValue = this.calculateOverallCommunityValue(antiOppressionResult.communityBenefit, authenticityResult.communityBenefit, consentResult.communityBenefit);
        // 5. Generate holistic recommendations
        const recommendations = this.generateHolisticContentRecommendations(antiOppressionResult, authenticityResult, consentResult, liberationAlignment, empowermentPotential);
        const overallScore = (liberationAlignment + empowermentPotential + communityValue) / 3;
        // 6. Overall liberation values validation
        const overallLiberationValidation = this.validateContentLiberationValues({
            creatorSovereignty: 0.8,
            antiOppressionValidation: antiOppressionResult.success,
            blackQueerEmpowerment: empowermentPotential,
            communityProtection: communityValue,
            culturalAuthenticity: authenticityResult.data.authenticityScore
        });
        const assessment = {
            overallScore,
            liberationAlignment,
            empowermentPotential,
            communityValue,
            recommendations
        };
        return {
            success: overallLiberationValidation.isValid && overallScore >= 0.7,
            data: assessment,
            liberationValidation: overallLiberationValidation,
            empowermentImpact: empowermentPotential,
            communityBenefit: communityValue,
            sovereigntyCompliance: authenticityResult.data.culturalAppropriation === false,
            recommendations,
            violations: overallLiberationValidation.violations
        };
    }
    // =============================================================================
    // OPPRESSION DETECTION BUSINESS LOGIC
    // =============================================================================
    detectOppressionIndicators(contentData) {
        const indicators = [];
        const text = contentData.text?.toLowerCase() || '';
        // Check each oppression type against patterns
        for (const [oppressionType, patterns] of this.oppressionPatterns) {
            for (const pattern of patterns) {
                if (text.includes(pattern.toLowerCase())) {
                    indicators.push({
                        type: oppressionType,
                        severity: this.assessOppressionSeverity(pattern, text, oppressionType),
                        description: `Detected ${oppressionType} pattern: "${pattern}"`,
                        location: this.findPatternLocation(pattern, text),
                        remedy: this.generateOppressionRemedy(oppressionType, pattern)
                    });
                }
            }
        }
        return indicators;
    }
    assessOppressionSeverity(pattern, text, oppressionType) {
        // High severity oppression patterns
        const highSeverityTypes = ['racism', 'transphobia', 'homophobia'];
        const criticalPatterns = ['slur', 'violence', 'threat', 'dehumanizing'];
        if (criticalPatterns.some(critical => pattern.includes(critical))) {
            return 'critical';
        }
        if (highSeverityTypes.includes(oppressionType)) {
            return 'high';
        }
        // Count occurrences for severity assessment
        const occurrences = (text.match(new RegExp(pattern.toLowerCase(), 'g')) || []).length;
        if (occurrences > 3)
            return 'high';
        if (occurrences > 1)
            return 'medium';
        return 'low';
    }
    findPatternLocation(pattern, text) {
        const index = text.toLowerCase().indexOf(pattern.toLowerCase());
        const contextStart = Math.max(0, index - 50);
        const contextEnd = Math.min(text.length, index + pattern.length + 50);
        return text.substring(contextStart, contextEnd);
    }
    generateOppressionRemedy(oppressionType, pattern) {
        const remedies = {
            racism: 'Remove racist language and replace with respectful, anti-racist alternatives',
            transphobia: 'Remove transphobic content and center trans-affirming language',
            homophobia: 'Replace homophobic content with LGBTQ+-affirming messaging',
            classism: 'Remove classist assumptions and include class-diverse perspectives',
            ableism: 'Replace ableist language with disability-inclusive alternatives',
            sexism: 'Remove sexist content and promote gender equity'
        };
        return remedies[oppressionType] || 'Remove oppressive content and center liberation values';
    }
    // =============================================================================
    // CULTURAL AUTHENTICITY BUSINESS LOGIC  
    // =============================================================================
    calculateCulturalAuthenticityScore(contentData, creatorProfile, communityContext) {
        let score = 0.5; // Base score
        // Creator identity alignment
        if (creatorProfile?.identifiesAsBlackQueer) {
            score += 0.3; // High weight for authentic identity
        }
        // Community validation
        if (communityContext?.communityValidated) {
            score += 0.2;
        }
        // Cultural elements analysis
        score += this.assessCulturalElements(contentData) * 0.3;
        // Language authenticity
        if (this.assessLanguageAuthenticity(contentData)) {
            score += 0.1;
        }
        // Liberation messaging
        if (this.containsLiberationMessaging(contentData)) {
            score += 0.1;
        }
        return Math.min(score, 1.0);
    }
    detectCulturalAppropriation(contentData, creatorProfile) {
        // Cultural appropriation detection logic
        const culturalElements = this.extractCulturalElements(contentData);
        const creatorIdentity = creatorProfile?.culturalBackground || [];
        // Check if cultural elements match creator identity or community consent
        for (const element of culturalElements) {
            if (!this.isElementAppropriate(element, creatorIdentity, creatorProfile)) {
                return true; // Appropriation detected
            }
        }
        return false;
    }
    validateCommunityVoices(contentData) {
        const text = contentData.text || '';
        // Check for community voice indicators
        return this.communityVoiceIndicators.some(indicator => text.toLowerCase().includes(indicator));
    }
    assessBlackQueerRepresentation(contentData) {
        let score = 0;
        const text = contentData.text?.toLowerCase() || '';
        // Positive representation indicators
        const positiveIndicators = [
            'black queer', 'black lgbtq', 'liberation', 'empowerment',
            'authentic', 'community', 'healing', 'joy', 'celebration'
        ];
        const foundPositive = positiveIndicators.filter(indicator => text.includes(indicator)).length;
        score += foundPositive * 0.1;
        // Negative representation check
        const negativeIndicators = ['stereotype', 'tokenism', 'fetishization'];
        const foundNegative = negativeIndicators.filter(indicator => text.includes(indicator)).length;
        score -= foundNegative * 0.2;
        return Math.max(0, Math.min(score, 1.0));
    }
    analyzeStereotypePatterns(contentData) {
        const stereotypes = [];
        const text = contentData.text?.toLowerCase() || '';
        // Common stereotype patterns to detect and avoid
        const stereotypePatterns = [
            'angry black woman',
            'sassy gay friend',
            'tragic queer',
            'hypersexualized',
            'one-dimensional representation'
        ];
        for (const pattern of stereotypePatterns) {
            if (text.includes(pattern)) {
                stereotypes.push(`Detected stereotype pattern: ${pattern}`);
            }
        }
        return stereotypes;
    }
    // =============================================================================
    // COMMUNITY CONSENT BUSINESS LOGIC
    // =============================================================================
    assessCommunityConsent(contentData, communityData) {
        // Community consent assessment logic
        if (communityData?.explicitConsent) {
            return true;
        }
        // Implicit consent indicators
        if (communityData?.communityCreated || communityData?.communityValidated) {
            return true;
        }
        // Check if content impacts community without consent
        if (this.impactsCommunityWithoutConsent(contentData, communityData)) {
            return false;
        }
        return true; // Default to consent if no concerns detected
    }
    calculateCommunityImpact(contentData, potentialImpacts, communityData) {
        let impact = 0;
        // Positive impact factors
        if (this.promotesLiberationValues(contentData))
            impact += 0.4;
        if (this.strengthensCommunityBonds(contentData))
            impact += 0.3;
        if (this.providesEmpowermentResources(contentData))
            impact += 0.2;
        if (this.celebratesCommunityJoy(contentData))
            impact += 0.1;
        // Negative impact factors
        if (this.risksCommunityHarm(contentData, communityData))
            impact -= 0.5;
        if (this.perpetuatesStereotypes(contentData))
            impact -= 0.3;
        if (this.extractsFromCommunity(contentData))
            impact -= 0.2;
        return impact;
    }
    assessCommunityVulnerability(contentData, communityData, potentialImpacts) {
        const vulnerabilities = [];
        // High-risk vulnerability factors
        if (communityData?.facesSystemicOppression) {
            vulnerabilities.push('Community faces ongoing systemic oppression');
        }
        if (communityData?.experiencesViolence) {
            vulnerabilities.push('Community experiences targeted violence');
        }
        if (this.containsSensitiveInformation(contentData)) {
            vulnerabilities.push('Content contains sensitive community information');
        }
        if (this.risksMisrepresentation(contentData)) {
            vulnerabilities.push('Risk of community misrepresentation');
        }
        return vulnerabilities;
    }
    generateCommunityProtectionMeasures(vulnerabilities, impact, contentData) {
        const measures = [];
        if (vulnerabilities.length > 0) {
            measures.push('Enhanced community review process');
            measures.push('Trauma-informed content guidelines application');
        }
        if (impact < 0) {
            measures.push('Community harm mitigation protocols');
            measures.push('Liberation-centered content revision required');
        }
        if (this.requiresCommunityOversight(contentData)) {
            measures.push('Ongoing community oversight and feedback');
        }
        return measures;
    }
    // =============================================================================
    // LIBERATION VALUES VALIDATION
    // =============================================================================
    validateContentLiberationValues(values) {
        const violations = [];
        let empowermentScore = 0;
        // 1. Creator Sovereignty (lower weight for content, focused on cultural sovereignty)
        if (values.creatorSovereignty < 0.7) {
            violations.push({
                type: 'creator_sovereignty',
                severity: 'minor',
                description: `Content creator sovereignty below recommended 70%: ${values.creatorSovereignty}`,
                remedy: 'Ensure creator maintains narrative control and attribution rights'
            });
        }
        else {
            empowermentScore += 0.2 * values.creatorSovereignty;
        }
        // 2. Anti-Oppression Validation (CRITICAL for content)
        if (!values.antiOppressionValidation) {
            violations.push({
                type: 'anti_oppression',
                severity: 'critical',
                description: 'Content failed anti-oppression validation',
                remedy: 'Remove all oppressive elements and center liberation messaging'
            });
        }
        else {
            empowermentScore += 0.3; // High weight for content anti-oppression
        }
        // 3. Black Queer Empowerment (HIGH WEIGHT for content)
        if (values.blackQueerEmpowerment < 0.6) {
            violations.push({
                type: 'empowerment',
                severity: values.blackQueerEmpowerment < 0.3 ? 'critical' : 'major',
                description: `Content Black queer empowerment score too low: ${values.blackQueerEmpowerment}`,
                remedy: 'Center Black queer voices, experiences, and liberation in content'
            });
        }
        else {
            empowermentScore += 0.3 * values.blackQueerEmpowerment;
        }
        // 4. Community Protection (HIGH WEIGHT for content impact)
        if (values.communityProtection < 0.8) {
            violations.push({
                type: 'protection',
                severity: 'major',
                description: `Content community protection insufficient: ${values.communityProtection}`,
                remedy: 'Strengthen community protection measures and consent protocols'
            });
        }
        else {
            empowermentScore += 0.15 * values.communityProtection;
        }
        // 5. Cultural Authenticity (CRITICAL for content)
        if (values.culturalAuthenticity < layer3_business_logic_js_1.LIBERATION_CONSTANTS.MINIMUM_CULTURAL_AUTHENTICITY) {
            violations.push({
                type: 'authenticity',
                severity: 'major',
                description: `Content cultural authenticity below threshold: ${values.culturalAuthenticity}`,
                remedy: 'Increase authentic Black queer cultural representation and community voice'
            });
        }
        else {
            empowermentScore += 0.05 * values.culturalAuthenticity;
        }
        return {
            isValid: violations.length === 0,
            violations,
            empowermentScore,
            recommendations: this.generateContentLiberationRecommendations(violations, empowermentScore)
        };
    }
    validateCulturalLiberationValues(values) {
        return this.validateContentLiberationValues(values); // Same validation for cultural context
    }
    validateConsentLiberationValues(values) {
        return this.validateContentLiberationValues(values); // Same validation for consent context
    }
    // =============================================================================
    // HELPER METHODS AND CALCULATIONS
    // =============================================================================
    assessBlackQueerEmpowermentInContent(contentData) {
        return this.assessBlackQueerRepresentation(contentData);
    }
    assessContentCulturalAuthenticity(contentData) {
        return this.calculateCulturalAuthenticityScore(contentData, {}, {});
    }
    validateCommunityContentConsent(contentData, context) {
        return this.assessCommunityConsent(contentData, context || {});
    }
    calculateContentLiberationAlignment(contentData, oppressionIndicators, context) {
        let alignment = 0.7; // Base alignment score
        // Reduce alignment for oppression indicators
        alignment -= oppressionIndicators.length * 0.2;
        // Increase alignment for liberation elements
        if (this.promotesLiberationValues(contentData))
            alignment += 0.2;
        if (this.centersCommunityVoices(contentData))
            alignment += 0.1;
        return Math.max(0, Math.min(alignment, 1.0));
    }
    calculateContentEmpowermentPotential(contentData, antiOppressionData, authenticityData) {
        let potential = 0.5;
        if (antiOppressionData.isValid)
            potential += 0.2;
        potential += authenticityData.blackQueerRepresentation * 0.2;
        if (authenticityData.communityVoices)
            potential += 0.1;
        return Math.min(potential, 1.0);
    }
    calculateOverallCommunityValue(antiOppressionBenefit, authenticityBenefit, consentBenefit) {
        return (antiOppressionBenefit + authenticityBenefit + consentBenefit) / 3;
    }
    // Content assessment helper methods
    promotesLiberationValues(contentData) {
        const liberationTerms = ['liberation', 'freedom', 'empowerment', 'justice', 'equity'];
        const text = contentData.text?.toLowerCase() || '';
        return liberationTerms.some(term => text.includes(term));
    }
    strengthensCommunityBonds(contentData) {
        const communityTerms = ['community', 'solidarity', 'support', 'together', 'collective'];
        const text = contentData.text?.toLowerCase() || '';
        return communityTerms.some(term => text.includes(term));
    }
    providesEmpowermentResources(contentData) {
        const resourceTerms = ['resources', 'tools', 'support', 'help', 'guidance'];
        const text = contentData.text?.toLowerCase() || '';
        return resourceTerms.some(term => text.includes(term));
    }
    celebratesCommunityJoy(contentData) {
        const joyTerms = ['joy', 'celebration', 'pride', 'love', 'beautiful', 'amazing'];
        const text = contentData.text?.toLowerCase() || '';
        return joyTerms.some(term => text.includes(term));
    }
    risksCommunityHarm(contentData, communityData) {
        const harmRiskIndicators = ['expose', 'out', 'private information', 'vulnerable'];
        const text = contentData.text?.toLowerCase() || '';
        return harmRiskIndicators.some(indicator => text.includes(indicator));
    }
    perpetuatesStereotypes(contentData) {
        return this.analyzeStereotypePatterns(contentData).length > 0;
    }
    extractsFromCommunity(contentData) {
        const extractionIndicators = ['profit', 'monetize', 'exploit', 'use'];
        const text = contentData.text?.toLowerCase() || '';
        return extractionIndicators.some(indicator => text.includes(indicator)) &&
            !this.promotesLiberationValues(contentData);
    }
    centersCommunityVoices(contentData) {
        return this.validateCommunityVoices(contentData);
    }
    containsSensitiveInformation(contentData) {
        const sensitiveIndicators = ['location', 'real name', 'workplace', 'family'];
        const text = contentData.text?.toLowerCase() || '';
        return sensitiveIndicators.some(indicator => text.includes(indicator));
    }
    risksMisrepresentation(contentData) {
        const misrepresentationRisks = ['generalization', 'all', 'always', 'never'];
        const text = contentData.text?.toLowerCase() || '';
        return misrepresentationRisks.some(risk => text.includes(risk));
    }
    requiresCommunityOversight(contentData) {
        return this.impactsCommunityWithoutConsent(contentData, {}) ||
            this.containsSensitiveInformation(contentData);
    }
    impactsCommunityWithoutConsent(contentData, communityData) {
        return this.risksCommunityHarm(contentData, communityData) &&
            !communityData?.explicitConsent;
    }
    assessCulturalElements(contentData) {
        // Simplified cultural elements assessment
        return 0.7; // Placeholder for cultural elements analysis
    }
    assessLanguageAuthenticity(contentData) {
        // Language authenticity assessment
        return true; // Placeholder for language analysis
    }
    containsLiberationMessaging(contentData) {
        return this.promotesLiberationValues(contentData);
    }
    extractCulturalElements(contentData) {
        // Extract cultural elements for appropriation analysis
        return []; // Placeholder for cultural element extraction
    }
    isElementAppropriate(element, creatorIdentity, creatorProfile) {
        // Check if cultural element is appropriate for creator
        return true; // Placeholder for appropriation analysis
    }
    assessContentEmpowermentImpact(contentData, communityData) {
        return this.assessBlackQueerEmpowermentInContent(contentData);
    }
    // Community benefit calculations
    calculateContentCommunityBenefit(validation) {
        let benefit = validation.liberationAlignment * 0.5;
        if (validation.communityConsent)
            benefit += 0.3;
        if (validation.culturalAuthenticity > 0.7)
            benefit += 0.2;
        return Math.min(benefit, 1.0);
    }
    calculateAuthenticityCommunityBenefit(verification) {
        let benefit = verification.authenticityScore * 0.4;
        benefit += verification.blackQueerRepresentation * 0.3;
        if (verification.communityVoices)
            benefit += 0.2;
        if (!verification.culturalAppropriation)
            benefit += 0.1;
        return Math.min(benefit, 1.0);
    }
    // Recommendation generation
    generateAntiOppressionRecommendations(validation, liberationValidation) {
        const recommendations = [];
        if (!validation.isValid) {
            recommendations.push('Remove all oppressive content elements immediately');
            recommendations.push('Center liberation values in content messaging');
        }
        if (validation.oppressionIndicators.length > 0) {
            recommendations.push('Address specific oppression indicators identified');
        }
        if (!validation.communityConsent) {
            recommendations.push('Obtain explicit community consent before publication');
        }
        return [...recommendations, ...liberationValidation.recommendations];
    }
    generateAuthenticityRecommendations(verification, liberationValidation) {
        const recommendations = [];
        if (verification.culturalAppropriation) {
            recommendations.push('Remove culturally appropriative elements immediately');
            recommendations.push('Consult community members from affected cultures');
        }
        if (!verification.communityVoices) {
            recommendations.push('Include authentic community voices and perspectives');
        }
        if (verification.blackQueerRepresentation < 0.7) {
            recommendations.push('Strengthen Black queer representation and avoid stereotypes');
        }
        return [...recommendations, ...liberationValidation.recommendations];
    }
    generateConsentRecommendations(validation, liberationValidation) {
        const recommendations = [];
        if (!validation.consentObtained) {
            recommendations.push('Obtain explicit community consent before proceeding');
            recommendations.push('Implement community consultation process');
        }
        if (validation.communityImpact < 0) {
            recommendations.push('Mitigate negative community impacts');
            recommendations.push('Redesign content to benefit rather than harm community');
        }
        if (validation.vulnerabilityAssessment.length > 0) {
            recommendations.push('Address community vulnerabilities with enhanced protection');
        }
        return [...recommendations, ...liberationValidation.recommendations];
    }
    generateHolisticContentRecommendations(antiOppressionResult, authenticityResult, consentResult, liberationAlignment, empowermentPotential) {
        const recommendations = [];
        if (!antiOppressionResult.success) {
            recommendations.push('Priority: Address anti-oppression validation failures');
        }
        if (!authenticityResult.success) {
            recommendations.push('Priority: Improve cultural authenticity and representation');
        }
        if (!consentResult.success) {
            recommendations.push('Priority: Secure proper community consent and protection');
        }
        if (liberationAlignment < 0.8) {
            recommendations.push('Strengthen overall liberation alignment in content');
        }
        if (empowermentPotential < 0.7) {
            recommendations.push('Increase empowerment potential through community-centered content');
        }
        return recommendations;
    }
    generateContentLiberationRecommendations(violations, score) {
        const recommendations = [];
        if (violations.some(v => v.type === 'anti_oppression')) {
            recommendations.push('Remove all oppressive content elements immediately');
        }
        if (violations.some(v => v.type === 'authenticity')) {
            recommendations.push('Increase authentic Black queer cultural representation');
        }
        if (violations.some(v => v.type === 'empowerment')) {
            recommendations.push('Center Black queer empowerment in content messaging');
        }
        if (score < 0.8) {
            recommendations.push('Strengthen overall liberation alignment in content strategy');
        }
        return recommendations;
    }
    // =============================================================================
    // INITIALIZATION METHODS
    // =============================================================================
    initializeOppressionPatterns() {
        this.oppressionPatterns.set('racism', [
            'racial slur', 'colorblind', 'reverse racism', 'race card',
            'ghetto', 'thug', 'urban', 'articulate (when racially coded)',
            'all lives matter', 'post-racial'
        ]);
        this.oppressionPatterns.set('transphobia', [
            'biological sex', 'real woman', 'real man', 'transgenderism',
            'gender ideology', 'mutilation', 'confused', 'phase',
            'bathroom predator', 'rapid onset'
        ]);
        this.oppressionPatterns.set('homophobia', [
            'lifestyle choice', 'homosexual agenda', 'unnatural',
            'sin', 'deviant', 'recruiting', 'special rights'
        ]);
        this.oppressionPatterns.set('classism', [
            'lazy poor', 'welfare queen', 'bootstraps', 'deserving poor',
            'ghetto culture', 'poverty mindset'
        ]);
        this.oppressionPatterns.set('ableism', [
            'crazy', 'insane', 'lame', 'dumb', 'retarded',
            'wheelchair bound', 'suffering from', 'victim of'
        ]);
        this.oppressionPatterns.set('sexism', [
            'bossy', 'hysterical', 'emotional', 'shrill',
            'gold digger', 'asking for it'
        ]);
    }
    initializeCulturalAuthenticityCriteria() {
        this.culturalAuthenticityCriteria.set('community_voice', 0.3);
        this.culturalAuthenticityCriteria.set('lived_experience', 0.25);
        this.culturalAuthenticityCriteria.set('cultural_accuracy', 0.2);
        this.culturalAuthenticityCriteria.set('liberation_focus', 0.15);
        this.culturalAuthenticityCriteria.set('community_benefit', 0.1);
    }
    initializeCommunityVoiceIndicators() {
        this.communityVoiceIndicators.push('community says', 'our experience', 'we believe', 'from our perspective', 'in our community', 'as a member of', 'our voices', 'we deserve');
    }
}
exports.ContentBusinessLogicService = ContentBusinessLogicService;
//# sourceMappingURL=ContentBusinessLogicService.js.map