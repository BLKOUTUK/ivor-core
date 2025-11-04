"use strict";
/**
 * Layer 3: Creator Business Logic Service
 * BLKOUT Community Liberation Platform
 *
 * CRITICAL: This service implements ONLY creator business logic operations.
 * PERFECT SEPARATION OF CONCERNS:
 * - ONLY business logic for creator sovereignty and economic empowerment
 * - NO API Gateway operations (Layer 2)
 * - NO data persistence operations (Layer 5)
 * - NO infrastructure management (Layer 6)
 * - NO governance decisions (Layer 4)
 *
 * LIBERATION VALUES EMBEDDED:
 * - 75% Creator Sovereignty: Enforced in ALL revenue calculations
 * - Creator Attribution Rights: Protected in all operations
 * - Economic Empowerment: Tracked and optimized
 * - Narrative Control: Preserved for creators
 * - Cultural Rights: Respected and enforced
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreatorBusinessLogicService = void 0;
const layer3_business_logic_js_1 = require("../types/layer3-business-logic.js");
// =====================================================================================
// CREATOR BUSINESS LOGIC SERVICE - Core Implementation
// =====================================================================================
class CreatorBusinessLogicService {
    constructor() {
        this.MINIMUM_CREATOR_SOVEREIGNTY = layer3_business_logic_js_1.LIBERATION_CONSTANTS.MINIMUM_CREATOR_SOVEREIGNTY; // 75%
        this.PLATFORM_MAXIMUM_SHARE = 1 - layer3_business_logic_js_1.LIBERATION_CONSTANTS.MINIMUM_CREATOR_SOVEREIGNTY; // 25%
        // Initialize with liberation values embedded
    }
    // =================================================================================
    // CREATOR SOVEREIGNTY BUSINESS LOGIC - 75% Enforcement
    // =================================================================================
    /**
     * Calculate creator sovereignty compliance - BUSINESS LOGIC ONLY
     * Enforces 75% minimum creator revenue share as liberation requirement
     */
    async calculateCreatorSovereignty(totalRevenue, creatorId, contentId, liberationValues) {
        // Liberation Values Validation
        const liberationValidation = await this.validateLiberationValues(liberationValues);
        // Creator Sovereignty Calculation - Core Business Logic
        const creatorShare = totalRevenue * liberationValues.creatorSovereignty;
        const platformShare = totalRevenue - creatorShare;
        const creatorPercentage = liberationValues.creatorSovereignty;
        // Sovereignty Compliance Validation - Business Logic
        const isCompliant = creatorPercentage >= this.MINIMUM_CREATOR_SOVEREIGNTY;
        const violations = [];
        if (!isCompliant) {
            violations.push(`Creator sovereignty ${(creatorPercentage * 100).toFixed(1)}% below required 75% minimum`);
            violations.push('Liberation values violated: Creator economic empowerment not met');
        }
        // Platform Share Validation - Business Logic
        if (platformShare > totalRevenue * this.PLATFORM_MAXIMUM_SHARE) {
            violations.push(`Platform share ${((platformShare / totalRevenue) * 100).toFixed(1)}% exceeds maximum 25%`);
        }
        // Economic Justice Validation - Business Logic
        if (totalRevenue > 0 && creatorShare < totalRevenue * 0.5) {
            violations.push('Economic justice violation: Creator receiving less than 50% of value created');
        }
        const calculation = {
            totalRevenue,
            creatorShare,
            creatorPercentage,
            platformShare,
            isCompliant,
            violations
        };
        // Empowerment Impact Calculation - Business Logic
        const empowermentImpact = this.calculateSovereigntyEmpowermentImpact(calculation, liberationValues);
        // Community Benefit Assessment - Business Logic
        const communityBenefit = this.calculateSovereigntyCommunityBenefit(calculation, isCompliant);
        return {
            success: isCompliant && liberationValidation.isValid,
            data: calculation,
            liberationValidation,
            empowermentImpact,
            communityBenefit,
            sovereigntyCompliance: isCompliant,
            recommendations: this.generateSovereigntyRecommendations(calculation, violations),
            violations: [...liberationValidation.violations, ...violations.map(v => ({
                    type: 'creator_sovereignty',
                    severity: 'critical',
                    description: v,
                    remedy: 'Increase creator revenue share to meet liberation standards'
                }))]
        };
    }
    /**
     * Enforce creator attribution rights - BUSINESS LOGIC ONLY
     * Protects creator narrative control and attribution requirements
     */
    async enforceCreatorAttributionRights(creatorId, contentId, modificationRequest, liberationValues) {
        // Liberation Values Validation
        const liberationValidation = await this.validateLiberationValues(liberationValues);
        // Attribution Rights Business Logic
        const attributionRequired = true; // Always required for liberation
        const narrativeControl = await this.validateNarrativeControl(modificationRequest, liberationValues);
        // Modification Rights Assessment - Business Logic
        const modificationRights = this.assessModificationRights(modificationRequest, liberationValues, narrativeControl);
        // Economic Rights Calculation - Business Logic
        const economicRights = await this.calculateModificationEconomicRights(modificationRequest, liberationValues);
        // Cultural Rights Validation - Business Logic
        const culturalRights = this.validateCulturalRights(modificationRequest, liberationValues);
        const attributionRights = {
            creatorId,
            contentId,
            attributionRequired,
            narrativeControl,
            modificationRights,
            economicRights,
            culturalRights
        };
        // Rights Compliance Assessment - Business Logic
        const rightsCompliant = attributionRequired &&
            narrativeControl &&
            economicRights.isCompliant;
        return {
            success: rightsCompliant && liberationValidation.isValid,
            data: attributionRights,
            liberationValidation,
            empowermentImpact: this.calculateAttributionEmpowermentImpact(attributionRights),
            communityBenefit: this.calculateAttributionCommunityBenefit(attributionRights),
            sovereigntyCompliance: economicRights.isCompliant,
            recommendations: this.generateAttributionRecommendations(attributionRights, rightsCompliant),
            violations: liberationValidation.violations
        };
    }
    /**
     * Track economic empowerment progress - BUSINESS LOGIC ONLY
     * Monitors creator liberation through economic indicators
     */
    async trackEconomicEmpowerment(creatorId, timeRange, liberationValues) {
        // Liberation Values Validation
        const liberationValidation = await this.validateLiberationValues(liberationValues);
        // Economic Empowerment Metrics Calculation - Business Logic
        const totalEarnings = await this.calculateTotalCreatorEarnings(creatorId, timeRange);
        // Liberation Impact Assessment - Business Logic
        const liberationImpact = this.calculateEconomicLiberationImpact(totalEarnings, liberationValues);
        // Community Benefit Calculation - Business Logic  
        const communityBenefit = this.calculateEconomicCommunityBenefit(totalEarnings, liberationValues);
        // Empowerment Progress Assessment - Business Logic
        const empowermentProgress = this.assessEmpowermentProgress(totalEarnings, liberationImpact, communityBenefit, liberationValues);
        // Sovereignty Violations Check - Business Logic
        const sovereigntyViolations = await this.identifySovereigntyViolations(creatorId, timeRange, liberationValues);
        const tracking = {
            creatorId,
            totalEarnings,
            liberationImpact,
            communityBenefit,
            empowermentProgress,
            sovereigntyViolations
        };
        return {
            success: sovereigntyViolations.length === 0 && liberationValidation.isValid,
            data: tracking,
            liberationValidation,
            empowermentImpact: empowermentProgress,
            communityBenefit,
            sovereigntyCompliance: sovereigntyViolations.length === 0,
            recommendations: this.generateEmpowermentRecommendations(tracking),
            violations: liberationValidation.violations
        };
    }
    // =================================================================================
    // LIBERATION VALUES VALIDATION - Core Business Logic
    // =================================================================================
    async validateLiberationValues(values) {
        const violations = [];
        let empowermentScore = 0;
        // Creator Sovereignty Validation (75% minimum) - CRITICAL
        if (values.creatorSovereignty < layer3_business_logic_js_1.LIBERATION_CONSTANTS.MINIMUM_CREATOR_SOVEREIGNTY) {
            violations.push({
                type: 'creator_sovereignty',
                severity: 'critical',
                description: `Creator sovereignty ${values.creatorSovereignty} below required 75% minimum`,
                remedy: 'Increase creator revenue share to meet liberation standards'
            });
        }
        else {
            empowermentScore += layer3_business_logic_js_1.LIBERATION_WEIGHTS.CREATOR_SOVEREIGNTY;
        }
        // Anti-Oppression Validation for Creator Protection
        if (!values.antiOppressionValidation) {
            violations.push({
                type: 'anti_oppression',
                severity: 'critical',
                description: 'Anti-oppression validation not enabled for creator protection',
                remedy: 'Enable anti-oppression validation to protect creator rights'
            });
        }
        else {
            empowermentScore += layer3_business_logic_js_1.LIBERATION_WEIGHTS.ANTI_OPPRESSION;
        }
        // Black Queer Empowerment Validation
        if (values.blackQueerEmpowerment < layer3_business_logic_js_1.LIBERATION_CONSTANTS.MINIMUM_EMPOWERMENT_SCORE) {
            violations.push({
                type: 'empowerment',
                severity: 'major',
                description: `Black queer empowerment score ${values.blackQueerEmpowerment} below required 60% minimum`,
                remedy: 'Enhance Black queer creator empowerment and representation'
            });
        }
        else {
            empowermentScore += layer3_business_logic_js_1.LIBERATION_WEIGHTS.BLACK_QUEER_EMPOWERMENT;
        }
        // Cultural Authenticity Validation for Creator Rights
        if (values.culturalAuthenticity < layer3_business_logic_js_1.LIBERATION_CONSTANTS.MINIMUM_CULTURAL_AUTHENTICITY) {
            violations.push({
                type: 'authenticity',
                severity: 'minor',
                description: `Cultural authenticity score ${values.culturalAuthenticity} below required 65% minimum`,
                remedy: 'Improve cultural authenticity in creator content and representation'
            });
        }
        else {
            empowermentScore += layer3_business_logic_js_1.LIBERATION_WEIGHTS.CULTURAL_AUTHENTICITY;
        }
        return {
            isValid: violations.filter(v => v.severity === 'critical').length === 0,
            violations,
            empowermentScore,
            recommendations: violations.map(v => v.remedy)
        };
    }
    // =================================================================================
    // CREATOR SOVEREIGNTY BUSINESS LOGIC METHODS
    // =================================================================================
    calculateSovereigntyEmpowermentImpact(calculation, values) {
        let impact = 0.5; // Base empowerment impact
        // Sovereignty compliance impact
        if (calculation.isCompliant) {
            impact += 0.3;
        }
        // Creator percentage impact (higher percentage = higher empowerment)
        impact += (calculation.creatorPercentage - 0.5) * 0.4; // Scale above 50%
        // Liberation values alignment impact  
        impact += values.blackQueerEmpowerment * 0.2;
        return Math.min(Math.max(impact, 0), 1.0);
    }
    calculateSovereigntyCommunityBenefit(calculation, isCompliant) {
        let benefit = 0.4; // Base community benefit
        // Compliance benefit
        if (isCompliant) {
            benefit += 0.4;
        }
        // Revenue sharing benefit (more to creators = more community benefit)
        benefit += calculation.creatorPercentage * 0.2;
        return Math.min(benefit, 1.0);
    }
    generateSovereigntyRecommendations(calculation, violations) {
        const recommendations = [];
        if (!calculation.isCompliant) {
            recommendations.push('Increase creator revenue share to minimum 75% to meet liberation standards');
            recommendations.push('Review platform fee structure to ensure creator economic empowerment');
        }
        if (violations.length > 0) {
            recommendations.push('Address sovereignty violations to align with liberation values');
        }
        if (calculation.creatorPercentage < 0.8) {
            recommendations.push('Consider increasing creator share above 80% for enhanced empowerment');
        }
        recommendations.push('Monitor creator sovereignty metrics regularly for liberation compliance');
        return recommendations;
    }
    // =================================================================================
    // ATTRIBUTION RIGHTS BUSINESS LOGIC METHODS
    // =================================================================================
    async validateNarrativeControl(modificationRequest, liberationValues) {
        // Business logic for narrative control validation
        // Cultural authenticity requirement
        if (liberationValues.culturalAuthenticity < 0.7) {
            return false; // Cannot maintain narrative control without cultural authenticity
        }
        // Anti-oppression requirement for narrative control
        if (!liberationValues.antiOppressionValidation) {
            return false; // Narrative control requires anti-oppression protection
        }
        // Modification type assessment
        const controlRequired = ['edit', 'remix', 'commercial_use'].includes(modificationRequest.type);
        return controlRequired ? liberationValues.blackQueerEmpowerment >= 0.7 : true;
    }
    assessModificationRights(modificationRequest, liberationValues, narrativeControl) {
        // Business logic for modification rights assessment
        if (!narrativeControl || !liberationValues.antiOppressionValidation) {
            return 'none';
        }
        if (liberationValues.creatorSovereignty >= 0.8 &&
            liberationValues.culturalAuthenticity >= 0.8) {
            return 'full';
        }
        if (liberationValues.creatorSovereignty >= 0.75) {
            return 'limited';
        }
        return 'none';
    }
    async calculateModificationEconomicRights(modificationRequest, liberationValues) {
        // Business logic for economic rights from modifications
        const baseRevenue = 1000; // Example calculation base
        const modificationRevenue = modificationRequest.type === 'commercial_use' ? baseRevenue * 2 : baseRevenue;
        return {
            totalRevenue: modificationRevenue,
            creatorShare: modificationRevenue * liberationValues.creatorSovereignty,
            creatorPercentage: liberationValues.creatorSovereignty,
            platformShare: modificationRevenue * (1 - liberationValues.creatorSovereignty),
            isCompliant: liberationValues.creatorSovereignty >= this.MINIMUM_CREATOR_SOVEREIGNTY,
            violations: liberationValues.creatorSovereignty < this.MINIMUM_CREATOR_SOVEREIGNTY ?
                ['Creator sovereignty below 75% minimum for modifications'] : []
        };
    }
    validateCulturalRights(modificationRequest, liberationValues) {
        const culturalRights = [];
        // Cultural authenticity protection
        if (liberationValues.culturalAuthenticity >= 0.7) {
            culturalRights.push('cultural_authenticity_protection');
            culturalRights.push('community_cultural_validation');
        }
        // Black queer cultural rights
        if (liberationValues.blackQueerEmpowerment >= 0.8) {
            culturalRights.push('black_queer_representation_rights');
            culturalRights.push('community_cultural_celebration');
        }
        // Anti-appropriation protection
        if (liberationValues.antiOppressionValidation) {
            culturalRights.push('cultural_appropriation_protection');
            culturalRights.push('community_cultural_sovereignty');
        }
        return culturalRights;
    }
    // =================================================================================
    // ECONOMIC EMPOWERMENT TRACKING METHODS
    // =================================================================================
    async calculateTotalCreatorEarnings(creatorId, timeRange) {
        // Business logic for total earnings calculation
        // This would integrate with earnings tracking systems
        return 5000; // Example calculation
    }
    calculateEconomicLiberationImpact(totalEarnings, liberationValues) {
        let impact = 0.5; // Base liberation impact
        // Earnings impact (higher earnings = higher liberation impact)
        if (totalEarnings > 1000) {
            impact += Math.min((totalEarnings / 10000), 0.3); // Scale with earnings
        }
        // Creator sovereignty impact
        impact += liberationValues.creatorSovereignty * 0.2;
        // Black queer empowerment impact
        impact += liberationValues.blackQueerEmpowerment * 0.2;
        return Math.min(impact, 1.0);
    }
    calculateEconomicCommunityBenefit(totalEarnings, liberationValues) {
        let benefit = 0.4; // Base community benefit
        // Earnings benefit to community
        if (totalEarnings > 500) {
            benefit += Math.min((totalEarnings / 5000), 0.3);
        }
        // Liberation values benefit
        benefit += liberationValues.blackQueerEmpowerment * 0.15;
        benefit += liberationValues.communityProtection * 0.15;
        return Math.min(benefit, 1.0);
    }
    assessEmpowermentProgress(totalEarnings, liberationImpact, communityBenefit, liberationValues) {
        // Business logic for empowerment progress assessment
        const earningsProgress = Math.min(totalEarnings / 10000, 1.0); // Scale to max expected earnings
        const valuesProgress = (liberationValues.creatorSovereignty +
            liberationValues.blackQueerEmpowerment +
            liberationValues.culturalAuthenticity) / 3;
        return (earningsProgress * 0.4) + (liberationImpact * 0.3) + (valuesProgress * 0.3);
    }
    async identifySovereigntyViolations(creatorId, timeRange, liberationValues) {
        const violations = [];
        // Creator sovereignty check
        if (liberationValues.creatorSovereignty < this.MINIMUM_CREATOR_SOVEREIGNTY) {
            violations.push(`Creator sovereignty ${(liberationValues.creatorSovereignty * 100).toFixed(1)}% below required 75%`);
        }
        // Anti-oppression check
        if (!liberationValues.antiOppressionValidation) {
            violations.push('Anti-oppression validation not enabled for creator protection');
        }
        // Empowerment threshold check
        if (liberationValues.blackQueerEmpowerment < 0.6) {
            violations.push('Black queer empowerment below minimum threshold for creator liberation');
        }
        return violations;
    }
    generateEmpowermentRecommendations(tracking) {
        const recommendations = [];
        if (tracking.sovereigntyViolations.length > 0) {
            recommendations.push('Address sovereignty violations to ensure creator liberation');
            recommendations.push('Increase creator revenue share to meet 75% minimum requirement');
        }
        if (tracking.empowermentProgress < 0.7) {
            recommendations.push('Focus on increasing empowerment progress through skills development');
            recommendations.push('Engage with community support and mentorship programs');
        }
        if (tracking.totalEarnings < 1000) {
            recommendations.push('Explore additional revenue streams and platform monetization');
            recommendations.push('Connect with community resources for economic development');
        }
        recommendations.push('Continue tracking liberation metrics for sustained empowerment');
        return recommendations;
    }
    calculateAttributionEmpowermentImpact(rights) {
        let impact = 0.5; // Base impact
        if (rights.attributionRequired)
            impact += 0.15;
        if (rights.narrativeControl)
            impact += 0.2;
        if (rights.modificationRights === 'full')
            impact += 0.15;
        if (rights.economicRights.isCompliant)
            impact += 0.1;
        return Math.min(impact, 1.0);
    }
    calculateAttributionCommunityBenefit(rights) {
        let benefit = 0.4; // Base benefit
        benefit += rights.culturalRights.length * 0.1;
        if (rights.economicRights.isCompliant)
            benefit += 0.2;
        if (rights.narrativeControl)
            benefit += 0.2;
        return Math.min(benefit, 1.0);
    }
    generateAttributionRecommendations(rights, compliant) {
        const recommendations = [];
        if (!compliant) {
            recommendations.push('Ensure creator attribution requirements are met');
            recommendations.push('Protect creator narrative control and cultural rights');
        }
        if (!rights.economicRights.isCompliant) {
            recommendations.push('Increase creator economic rights to meet sovereignty standards');
        }
        if (rights.modificationRights === 'none') {
            recommendations.push('Review modification rights to ensure creator empowerment');
        }
        recommendations.push('Maintain cultural authenticity and community validation');
        return recommendations;
    }
}
exports.CreatorBusinessLogicService = CreatorBusinessLogicService;
exports.default = CreatorBusinessLogicService;
//# sourceMappingURL=CreatorBusinessLogicService.js.map