"use strict";
// Layer 3: Creator Business Logic Service
// Revolutionary Creator Sovereignty Business Logic with 75% Minimum Enforcement
// Perfect Separation of Concerns + Creator Liberation Values Embedded
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreatorBusinessLogicService = void 0;
const layer3_business_logic_js_1 = require("../../types/layer3-business-logic.js");
/**
 * Layer 3: Creator Business Logic Service
 *
 * CORE RESPONSIBILITY: Creator sovereignty and economic empowerment business logic
 *
 * PERFECT SEPARATION OF CONCERNS:
 * ✅ ONLY business logic operations
 * ❌ NO API Gateway operations (Layer 2)
 * ❌ NO data persistence (Layer 5)
 * ❌ NO infrastructure management (Layer 6)
 * ❌ NO governance decisions (Layer 4)
 *
 * LIBERATION VALUES EMBEDDED:
 * - 75% Creator Sovereignty ENFORCED in ALL calculations
 * - Creator attribution rights protection
 * - Narrative control preservation
 * - Economic empowerment tracking
 * - Anti-exploitation validation
 */
class CreatorBusinessLogicService {
    constructor() {
        this.MINIMUM_CREATOR_SHARE = layer3_business_logic_js_1.LIBERATION_CONSTANTS.MINIMUM_CREATOR_SOVEREIGNTY; // 75%
        this.PLATFORM_MAXIMUM_SHARE = 0.25; // 25% maximum for platform
    }
    // =============================================================================
    // CREATOR SOVEREIGNTY BUSINESS LOGIC (75% ENFORCEMENT)
    // =============================================================================
    /**
     * Calculate creator sovereignty with 75% minimum enforcement
     * PURE BUSINESS LOGIC: Enforces 75% creator share in ALL revenue calculations
     */
    calculateCreatorSovereignty(totalRevenue, proposedCreatorShare, creatorId, contentId) {
        // 1. Apply 75% minimum creator sovereignty rule (REVOLUTIONARY STANDARD)
        const enforcedCreatorShare = Math.max(proposedCreatorShare, totalRevenue * this.MINIMUM_CREATOR_SHARE);
        const creatorPercentage = enforcedCreatorShare / totalRevenue;
        const platformShare = totalRevenue - enforcedCreatorShare;
        const platformPercentage = platformShare / totalRevenue;
        // 2. Sovereignty compliance validation
        const isCompliant = creatorPercentage >= this.MINIMUM_CREATOR_SHARE;
        const violations = [];
        if (!isCompliant) {
            violations.push(`Creator sovereignty violation: ${Math.round(creatorPercentage * 100)}% below required 75%`);
        }
        if (platformPercentage > this.PLATFORM_MAXIMUM_SHARE) {
            violations.push(`Platform extraction violation: ${Math.round(platformPercentage * 100)}% exceeds maximum 25%`);
        }
        // 3. Liberation values validation for creator sovereignty
        const liberationValidation = this.validateCreatorSovereigntyLiberationValues({
            creatorSovereignty: creatorPercentage,
            antiOppressionValidation: isCompliant,
            blackQueerEmpowerment: creatorPercentage >= 0.8 ? 0.9 : 0.7, // Higher empowerment for higher sovereignty
            communityProtection: 0.8,
            culturalAuthenticity: 0.75
        });
        const calculation = {
            totalRevenue,
            creatorShare: enforcedCreatorShare,
            creatorPercentage,
            platformShare,
            isCompliant: isCompliant && liberationValidation.isValid,
            violations: [...violations, ...liberationValidation.violations.map(v => v.description)]
        };
        return {
            success: calculation.isCompliant,
            data: calculation,
            liberationValidation,
            empowermentImpact: creatorPercentage,
            communityBenefit: this.calculateSovereigntyCommunityBenefit(calculation),
            sovereigntyCompliance: isCompliant,
            recommendations: this.generateSovereigntyRecommendations(calculation, liberationValidation),
            violations: liberationValidation.violations
        };
    }
    /**
     * Enforce creator attribution rights with liberation values
     * PURE BUSINESS LOGIC: Protects creator narrative control and attribution
     */
    enforceCreatorAttributionRights(creatorId, contentId, attributionData, modificationRequest) {
        // 1. Calculate economic rights with 75% sovereignty
        const economicRights = this.calculateCreatorSovereignty(attributionData.totalRevenue || 0, attributionData.proposedCreatorShare || 0, creatorId, contentId);
        // 2. Determine narrative control rights (ALWAYS preserve creator control)
        const narrativeControl = this.validateNarrativeControl(attributionData, modificationRequest);
        // 3. Set modification rights based on liberation values
        const modificationRights = this.determineModificationRights(attributionData, narrativeControl, economicRights.data);
        // 4. Generate cultural rights based on Black queer empowerment
        const culturalRights = this.generateCulturalRights(creatorId, contentId);
        // 5. Liberation values validation for attribution rights
        const liberationValidation = this.validateAttributionLiberationValues({
            creatorSovereignty: economicRights.data.creatorPercentage,
            antiOppressionValidation: narrativeControl,
            blackQueerEmpowerment: culturalRights.length > 0 ? 0.85 : 0.7,
            communityProtection: 0.8,
            culturalAuthenticity: this.assessContentCulturalAuthenticity(contentId)
        });
        const attributionRights = {
            creatorId,
            contentId,
            attributionRequired: true, // ALWAYS required for liberation
            narrativeControl,
            modificationRights,
            economicRights: economicRights.data,
            culturalRights
        };
        return {
            success: liberationValidation.isValid && economicRights.data.isCompliant,
            data: attributionRights,
            liberationValidation,
            empowermentImpact: this.calculateAttributionEmpowermentImpact(attributionRights),
            communityBenefit: this.calculateAttributionCommunityBenefit(attributionRights),
            sovereigntyCompliance: economicRights.data.isCompliant,
            recommendations: this.generateAttributionRecommendations(attributionRights, liberationValidation),
            violations: liberationValidation.violations
        };
    }
    /**
     * Track economic empowerment with liberation impact measurement
     * PURE BUSINESS LOGIC: Measures creator empowerment progress and community benefit
     */
    trackEconomicEmpowerment(creatorId, earningsData, communityContributions, liberationActivities) {
        // 1. Calculate total earnings with sovereignty validation
        const totalEarnings = earningsData.reduce((sum, earning) => sum + earning.amount, 0);
        const averageSovereigntyPercentage = this.calculateAverageSovereignty(earningsData);
        // 2. Calculate liberation impact score
        const liberationImpact = this.calculateCreatorLiberationImpact(liberationActivities, communityContributions, averageSovereigntyPercentage);
        // 3. Calculate community benefit from creator empowerment
        const communityBenefit = this.calculateCreatorCommunityBenefit(totalEarnings, communityContributions, liberationImpact);
        // 4. Assess empowerment progress
        const empowermentProgress = this.assessEmpowermentProgress(totalEarnings, liberationImpact, communityBenefit);
        // 5. Identify sovereignty violations
        const sovereigntyViolations = earningsData
            .filter(earning => (earning.creatorShare / earning.totalRevenue) < this.MINIMUM_CREATOR_SHARE)
            .map(earning => `Revenue event ${earning.id}: Creator share ${Math.round((earning.creatorShare / earning.totalRevenue) * 100)}% below 75%`);
        // 6. Liberation values validation for empowerment tracking
        const liberationValidation = this.validateEmpowermentLiberationValues({
            creatorSovereignty: averageSovereigntyPercentage,
            antiOppressionValidation: sovereigntyViolations.length === 0,
            blackQueerEmpowerment: liberationImpact,
            communityProtection: communityBenefit,
            culturalAuthenticity: 0.8 // Assume high authenticity for empowerment tracking
        });
        const tracking = {
            creatorId,
            totalEarnings,
            liberationImpact,
            communityBenefit,
            empowermentProgress,
            sovereigntyViolations
        };
        return {
            success: liberationValidation.isValid && sovereigntyViolations.length === 0,
            data: tracking,
            liberationValidation,
            empowermentImpact,
            communityBenefit,
            sovereigntyCompliance: sovereigntyViolations.length === 0,
            recommendations: this.generateEmpowermentRecommendations(tracking, liberationValidation),
            violations: liberationValidation.violations
        };
    }
    /**
     * Validate creator revenue sharing against liberation values
     * PURE BUSINESS LOGIC: Ensures all revenue sharing upholds 75% creator sovereignty
     */
    validateCreatorRevenueSharing(revenueDistribution, creatorId, contractTerms) {
        // 1. Apply 75% minimum creator sovereignty to distribution
        const adjustedDistribution = this.applyMinimumSovereignty(revenueDistribution);
        // 2. Validate against liberation values
        const creatorPercentage = adjustedDistribution.creatorShare / adjustedDistribution.totalRevenue;
        const liberationCompliance = creatorPercentage >= this.MINIMUM_CREATOR_SHARE;
        // 3. Calculate empowerment score
        const empowermentScore = this.calculateRevenueEmpowermentScore(adjustedDistribution, contractTerms, liberationCompliance);
        // 4. Liberation values validation
        const liberationValidation = this.validateRevenueLiberationValues({
            creatorSovereignty: creatorPercentage,
            antiOppressionValidation: liberationCompliance,
            blackQueerEmpowerment: empowermentScore,
            communityProtection: 0.8,
            culturalAuthenticity: 0.75
        });
        const validation = {
            isValid: liberationValidation.isValid && liberationCompliance,
            adjustedDistribution,
            liberationCompliance,
            empowermentScore
        };
        return {
            success: validation.isValid,
            data: validation,
            liberationValidation,
            empowermentImpact: empowermentScore,
            communityBenefit: this.calculateRevenueCommunitBenefit(adjustedDistribution),
            sovereigntyCompliance: liberationCompliance,
            recommendations: this.generateRevenueRecommendations(validation, liberationValidation),
            violations: liberationValidation.violations
        };
    }
    // =============================================================================
    // LIBERATION VALUES VALIDATION FOR CREATOR SERVICES
    // =============================================================================
    validateCreatorSovereigntyLiberationValues(values) {
        return this.validateLiberationValues(values, 'creator_sovereignty');
    }
    validateAttributionLiberationValues(values) {
        return this.validateLiberationValues(values, 'attribution_rights');
    }
    validateEmpowermentLiberationValues(values) {
        return this.validateLiberationValues(values, 'economic_empowerment');
    }
    validateRevenueLiberationValues(values) {
        return this.validateLiberationValues(values, 'revenue_sharing');
    }
    validateLiberationValues(values, context) {
        const violations = [];
        let empowermentScore = 0;
        // 1. Creator Sovereignty Validation (75% minimum - CRITICAL)
        if (values.creatorSovereignty < this.MINIMUM_CREATOR_SHARE) {
            violations.push({
                type: 'creator_sovereignty',
                severity: 'critical',
                description: `${context}: Creator sovereignty ${Math.round(values.creatorSovereignty * 100)}% below required 75%`,
                remedy: 'Increase creator control and revenue share to minimum 75%'
            });
        }
        else {
            empowermentScore += 0.4 * values.creatorSovereignty; // Higher weight for creator sovereignty
        }
        // 2. Anti-Oppression Validation
        if (!values.antiOppressionValidation) {
            violations.push({
                type: 'anti_oppression',
                severity: 'critical',
                description: `${context}: Anti-oppression validation failed`,
                remedy: 'Remove exploitative elements and center creator liberation'
            });
        }
        else {
            empowermentScore += 0.25;
        }
        // 3. Black Queer Empowerment
        if (values.blackQueerEmpowerment < 0.7) {
            violations.push({
                type: 'empowerment',
                severity: 'major',
                description: `${context}: Black queer empowerment score too low: ${values.blackQueerEmpowerment}`,
                remedy: 'Center Black queer creators and increase empowerment opportunities'
            });
        }
        else {
            empowermentScore += 0.2 * values.blackQueerEmpowerment;
        }
        // 4. Community Protection
        if (values.communityProtection < 0.8) {
            violations.push({
                type: 'protection',
                severity: 'major',
                description: `${context}: Creator protection insufficient: ${values.communityProtection}`,
                remedy: 'Strengthen creator protection and community support mechanisms'
            });
        }
        else {
            empowermentScore += 0.1 * values.communityProtection;
        }
        // 5. Cultural Authenticity
        if (values.culturalAuthenticity < 0.75) {
            violations.push({
                type: 'authenticity',
                severity: 'minor',
                description: `${context}: Cultural authenticity below threshold: ${values.culturalAuthenticity}`,
                remedy: 'Increase authentic Black queer cultural representation and creator voice'
            });
        }
        else {
            empowermentScore += 0.05 * values.culturalAuthenticity;
        }
        return {
            isValid: violations.length === 0,
            violations,
            empowermentScore,
            recommendations: this.generateCreatorLiberationRecommendations(violations, empowermentScore, context)
        };
    }
    // =============================================================================
    // CREATOR BUSINESS LOGIC CALCULATIONS
    // =============================================================================
    validateNarrativeControl(attributionData, modificationRequest) {
        // ALWAYS preserve creator narrative control for liberation
        if (modificationRequest && !modificationRequest.creatorApproval) {
            return false; // No modifications without creator approval
        }
        // Check for narrative authenticity preservation
        return attributionData.preservesCreatorVoice !== false;
    }
    determineModificationRights(attributionData, narrativeControl, economicRights) {
        // Liberation-based modification rights
        if (!narrativeControl || !economicRights.isCompliant) {
            return 'none'; // No modification rights if sovereignty/narrative violated
        }
        if (economicRights.creatorPercentage >= 0.9) {
            return 'full'; // Full rights for 90%+ sovereignty
        }
        if (economicRights.creatorPercentage >= this.MINIMUM_CREATOR_SHARE) {
            return 'limited'; // Limited rights for 75-89% sovereignty
        }
        return 'none';
    }
    generateCulturalRights(creatorId, contentId) {
        // Liberation-based cultural rights for Black queer creators
        return [
            'Authentic cultural representation preservation',
            'Community cultural validation rights',
            'Anti-appropriation protection',
            'Liberation narrative control',
            'Community benefit sharing rights'
        ];
    }
    assessContentCulturalAuthenticity(contentId) {
        // Business logic for cultural authenticity assessment
        // In real implementation, would analyze content against cultural authenticity criteria
        return 0.8; // Default high authenticity assumption
    }
    calculateAverageSovereignty(earningsData) {
        if (earningsData.length === 0)
            return 0;
        const totalSovereignty = earningsData.reduce((sum, earning) => {
            return sum + (earning.creatorShare / earning.totalRevenue);
        }, 0);
        return totalSovereignty / earningsData.length;
    }
    calculateCreatorLiberationImpact(liberationActivities, communityContributions, sovereigntyPercentage) {
        let impact = sovereigntyPercentage * 0.4; // Base impact from sovereignty
        // Add liberation activities impact
        impact += liberationActivities.length * 0.1;
        // Add community contributions impact
        impact += communityContributions.reduce((sum, contrib) => sum + (contrib.liberationScore || 0), 0) * 0.1;
        return Math.min(impact, 1.0);
    }
    calculateCreatorCommunityBenefit(totalEarnings, communityContributions, liberationImpact) {
        // Business logic for community benefit calculation
        let benefit = liberationImpact * 0.5;
        // Higher earnings enable more community contribution
        benefit += Math.min(totalEarnings / 100000, 0.3); // Cap at 30k earnings for max benefit
        // Direct community contributions
        benefit += communityContributions.length * 0.05;
        return Math.min(benefit, 1.0);
    }
    assessEmpowermentProgress(totalEarnings, liberationImpact, communityBenefit) {
        // Weighted empowerment progress calculation
        return (totalEarnings / 50000) * 0.3 + // Economic progress (capped at 50k)
            liberationImpact * 0.4 + // Liberation impact 
            communityBenefit * 0.3; // Community benefit
    }
    applyMinimumSovereignty(distribution) {
        // Apply 75% minimum creator sovereignty
        const requiredCreatorShare = distribution.totalRevenue * this.MINIMUM_CREATOR_SHARE;
        return {
            ...distribution,
            creatorShare: Math.max(distribution.creatorShare, requiredCreatorShare),
            platformShare: Math.min(distribution.platformShare, distribution.totalRevenue * this.PLATFORM_MAXIMUM_SHARE)
        };
    }
    calculateRevenueEmpowermentScore(distribution, contractTerms, liberationCompliance) {
        let score = liberationCompliance ? 0.7 : 0.3;
        // Additional empowerment factors
        if (contractTerms.creatorControlled)
            score += 0.1;
        if (contractTerms.communityBenefitClause)
            score += 0.1;
        if (distribution.creatorShare / distribution.totalRevenue >= 0.9)
            score += 0.1;
        return Math.min(score, 1.0);
    }
    // =============================================================================
    // COMMUNITY BENEFIT CALCULATIONS
    // =============================================================================
    calculateSovereigntyCommunityBenefit(calculation) {
        // Higher creator sovereignty benefits entire community
        return calculation.creatorPercentage * 0.8 + (calculation.isCompliant ? 0.2 : 0);
    }
    calculateAttributionEmpowermentImpact(rights) {
        let impact = rights.economicRights.creatorPercentage * 0.4;
        if (rights.narrativeControl)
            impact += 0.3;
        if (rights.modificationRights === 'full')
            impact += 0.2;
        else if (rights.modificationRights === 'limited')
            impact += 0.1;
        impact += rights.culturalRights.length * 0.02;
        return Math.min(impact, 1.0);
    }
    calculateAttributionCommunityBenefit(rights) {
        let benefit = rights.economicRights.creatorPercentage * 0.5;
        if (rights.narrativeControl)
            benefit += 0.2; // Preserved authentic voices benefit community
        benefit += rights.culturalRights.length * 0.05; // Cultural rights benefit community
        return Math.min(benefit, 1.0);
    }
    calculateRevenueCommunitBenefit(distribution) {
        const creatorPercentage = distribution.creatorShare / distribution.totalRevenue;
        return creatorPercentage >= this.MINIMUM_CREATOR_SHARE ? creatorPercentage * 0.8 : creatorPercentage * 0.4;
    }
    // =============================================================================
    // RECOMMENDATION GENERATION
    // =============================================================================
    generateSovereigntyRecommendations(calculation, validation) {
        const recommendations = [];
        if (!calculation.isCompliant) {
            recommendations.push(`Increase creator share to minimum ${Math.round(this.MINIMUM_CREATOR_SHARE * 100)}%`);
            recommendations.push('Restructure revenue distribution to prioritize creator sovereignty');
        }
        if (calculation.creatorPercentage < 0.9) {
            recommendations.push('Consider increasing creator sovereignty above minimum for enhanced liberation impact');
        }
        return [...recommendations, ...validation.recommendations];
    }
    generateAttributionRecommendations(rights, validation) {
        const recommendations = [];
        if (!rights.narrativeControl) {
            recommendations.push('Restore creator narrative control for authentic representation');
        }
        if (rights.modificationRights === 'none') {
            recommendations.push('Improve creator sovereignty to enable modification rights');
        }
        if (!rights.economicRights.isCompliant) {
            recommendations.push('Address economic rights violations to ensure fair attribution');
        }
        return [...recommendations, ...validation.recommendations];
    }
    generateEmpowermentRecommendations(tracking, validation) {
        const recommendations = [];
        if (tracking.sovereigntyViolations.length > 0) {
            recommendations.push('Address sovereignty violations to improve empowerment tracking');
        }
        if (tracking.liberationImpact < 0.7) {
            recommendations.push('Increase liberation activities and community contributions');
        }
        if (tracking.empowermentProgress < 0.6) {
            recommendations.push('Focus on sustainable economic empowerment strategies');
        }
        return [...recommendations, ...validation.recommendations];
    }
    generateRevenueRecommendations(validation, liberationValidation) {
        const recommendations = [];
        if (!validation.liberationCompliance) {
            recommendations.push('Restructure revenue sharing to meet 75% creator sovereignty minimum');
        }
        if (validation.empowermentScore < 0.8) {
            recommendations.push('Enhance creator empowerment mechanisms in revenue model');
        }
        return [...recommendations, ...liberationValidation.recommendations];
    }
    generateCreatorLiberationRecommendations(violations, score, context) {
        const recommendations = [];
        if (violations.some(v => v.type === 'creator_sovereignty')) {
            recommendations.push(`${context}: Immediately address creator sovereignty violations`);
            recommendations.push('Implement 75% minimum creator share policy');
        }
        if (violations.some(v => v.type === 'anti_oppression')) {
            recommendations.push(`${context}: Remove exploitative elements from creator relationships`);
        }
        if (score < 0.8) {
            recommendations.push(`${context}: Strengthen overall liberation alignment for creators`);
            recommendations.push('Increase Black queer creator empowerment initiatives');
        }
        return recommendations;
    }
}
exports.CreatorBusinessLogicService = CreatorBusinessLogicService;
//# sourceMappingURL=CreatorBusinessLogicService.js.map