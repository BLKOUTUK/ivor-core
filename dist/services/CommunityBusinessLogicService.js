"use strict";
/**
 * Layer 3: Community Business Logic Service
 * BLKOUT Community Liberation Platform
 *
 * CRITICAL: This service implements ONLY community business logic operations.
 * PERFECT SEPARATION OF CONCERNS:
 * - ONLY business logic for community interactions and liberation journey progression
 * - NO API Gateway operations (Layer 2)
 * - NO data persistence operations (Layer 5)
 * - NO infrastructure management (Layer 6)
 * - NO governance decisions (Layer 4)
 *
 * LIBERATION VALUES EMBEDDED:
 * - Community protection mechanisms in all operations
 * - Democratic participation validation
 * - Liberation journey progression logic
 * - Black queer empowerment prioritized
 * - Cultural authenticity preservation
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommunityBusinessLogicService = void 0;
const layer3_business_logic_js_1 = require("../types/layer3-business-logic.js");
// =====================================================================================
// COMMUNITY BUSINESS LOGIC SERVICE - Core Implementation
// =====================================================================================
class CommunityBusinessLogicService {
    constructor() {
        this.communityRules = new Map();
        this.journeyProgressionRules = new Map();
        this.protectionMechanisms = new Map();
        this.initializeCommunityLiberationRules();
    }
    // =================================================================================
    // COMMUNITY INTERACTION BUSINESS LOGIC
    // =================================================================================
    /**
     * Validate community interaction based on liberation values and community protection
     * BUSINESS LOGIC ONLY: Determines if interaction aligns with liberation goals
     */
    async validateCommunityInteraction(memberId, targetCommunityId, interactionType, journeyContext, liberationValues) {
        // Liberation Values Validation - Business Logic
        const liberationValidation = await this.validateLiberationValues(liberationValues);
        // Community Protection Business Logic
        const protectionDecision = await this.applyProtectionMechanisms(memberId, targetCommunityId, interactionType, journeyContext);
        // Empowerment Opportunity Identification - Business Logic  
        const empowermentOpportunities = this.identifyEmpowermentOpportunities(interactionType, journeyContext.currentStage, liberationValues);
        // Liberation Impact Calculation - Business Logic
        const liberationImpact = this.calculateInteractionLiberationImpact(interactionType, journeyContext, liberationValues, protectionDecision.allow);
        const result = {
            allow: protectionDecision.allow && liberationValidation.isValid,
            reasoning: this.generateProtectionReasoning(protectionDecision, liberationValidation),
            protectionMeasures: protectionDecision.protectionMeasures,
            empowermentOpportunities,
            liberationImpact
        };
        return {
            success: true,
            data: result,
            liberationValidation,
            empowermentImpact: liberationImpact,
            communityBenefit: this.calculateCommunityBenefit(result),
            sovereigntyCompliance: liberationValues.creatorSovereignty >= layer3_business_logic_js_1.LIBERATION_CONSTANTS.MINIMUM_CREATOR_SOVEREIGNTY,
            recommendations: this.generateInteractionRecommendations(result),
            violations: liberationValidation.violations
        };
    }
    /**
     * Progress user through liberation journey stages - BUSINESS LOGIC ONLY
     * Determines readiness and applies progression rules based on liberation criteria
     */
    async processJourneyProgression(userId, currentStage, targetStage, journeyContext, liberationValues) {
        // Liberation Values Validation
        const liberationValidation = await this.validateLiberationValues(liberationValues);
        // Journey Progression Business Logic
        const progressionRule = this.findProgressionRule(currentStage, targetStage);
        if (!progressionRule) {
            throw new Error(`No liberation journey progression rule found: ${currentStage} -> ${targetStage}`);
        }
        // Liberation Readiness Assessment - Business Logic
        const liberationReadiness = await this.assessLiberationReadiness(userId, progressionRule, journeyContext, liberationValues);
        // Community Validation Business Logic (if required)
        let communityValidationResult = true;
        if (progressionRule.communityValidation) {
            communityValidationResult = await this.validateCommunitySupport(userId, progressionRule, journeyContext);
        }
        // Empowerment Requirements Check - Business Logic
        const empowermentMet = this.validateEmpowermentRequirements(progressionRule.empowermentRequirements, journeyContext, liberationValues);
        const progressionAllowed = liberationReadiness &&
            communityValidationResult &&
            empowermentMet &&
            liberationValidation.isValid;
        return {
            success: progressionAllowed,
            data: progressionRule,
            liberationValidation,
            empowermentImpact: this.calculateProgressionEmpowermentImpact(progressionRule, liberationValues),
            communityBenefit: this.calculateProgressionCommunityBenefit(progressionRule, journeyContext),
            sovereigntyCompliance: liberationValues.creatorSovereignty >= layer3_business_logic_js_1.LIBERATION_CONSTANTS.MINIMUM_CREATOR_SOVEREIGNTY,
            recommendations: this.generateProgressionRecommendations(progressionRule, liberationReadiness, empowermentMet),
            violations: liberationValidation.violations
        };
    }
    /**
     * Validate democratic participation in community decisions - BUSINESS LOGIC ONLY
     * Ensures participation meets liberation and empowerment standards
     */
    async validateDemocraticParticipation(participantId, participationType, communityContext, liberationValues) {
        // Liberation Values Validation
        const liberationValidation = await this.validateLiberationValues(liberationValues);
        // Democratic Access Business Logic
        const accessibilityScore = this.calculateDemocraticAccessibility(participationType, communityContext);
        // Participation Quality Assessment - Business Logic
        const participationScore = this.assessParticipationQuality(participantId, participationType, communityContext, liberationValues);
        // Empowerment Level Calculation - Business Logic  
        const empowermentLevel = this.calculateParticipationEmpowermentLevel(participationType, participationScore, liberationValues);
        // Liberation Alignment Assessment - Business Logic
        const liberationAlignment = this.assessParticipationLiberationAlignment(participationType, communityContext, liberationValues);
        // Accessibility Measures Generation - Business Logic
        const accessibilityMeasures = this.generateAccessibilityMeasures(participationType, accessibilityScore, communityContext);
        const validation = {
            isValid: participationScore >= 0.6 && liberationAlignment >= 0.7 && liberationValidation.isValid,
            participationScore,
            empowermentLevel,
            accessibilityMeasures,
            liberationAlignment
        };
        return {
            success: validation.isValid,
            data: validation,
            liberationValidation,
            empowermentImpact: empowermentLevel,
            communityBenefit: this.calculateParticipationCommunityBenefit(validation),
            sovereigntyCompliance: liberationValues.creatorSovereignty >= layer3_business_logic_js_1.LIBERATION_CONSTANTS.MINIMUM_CREATOR_SOVEREIGNTY,
            recommendations: this.generateParticipationRecommendations(validation),
            violations: liberationValidation.violations
        };
    }
    // =================================================================================
    // LIBERATION VALUES VALIDATION - Core Business Logic
    // =================================================================================
    async validateLiberationValues(values) {
        const violations = [];
        let empowermentScore = 0;
        // Creator Sovereignty Validation (75% minimum)
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
        // Anti-Oppression Validation
        if (!values.antiOppressionValidation) {
            violations.push({
                type: 'anti_oppression',
                severity: 'critical',
                description: 'Anti-oppression validation not enabled',
                remedy: 'Enable anti-oppression validation for community protection'
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
                remedy: 'Enhance Black queer empowerment features and representation'
            });
        }
        else {
            empowermentScore += layer3_business_logic_js_1.LIBERATION_WEIGHTS.BLACK_QUEER_EMPOWERMENT;
        }
        // Community Protection Validation
        if (values.communityProtection < layer3_business_logic_js_1.LIBERATION_CONSTANTS.MINIMUM_COMMUNITY_PROTECTION) {
            violations.push({
                type: 'protection',
                severity: 'major',
                description: `Community protection score ${values.communityProtection} below required 70% minimum`,
                remedy: 'Strengthen community protection mechanisms'
            });
        }
        else {
            empowermentScore += layer3_business_logic_js_1.LIBERATION_WEIGHTS.COMMUNITY_PROTECTION;
        }
        // Cultural Authenticity Validation
        if (values.culturalAuthenticity < layer3_business_logic_js_1.LIBERATION_CONSTANTS.MINIMUM_CULTURAL_AUTHENTICITY) {
            violations.push({
                type: 'authenticity',
                severity: 'minor',
                description: `Cultural authenticity score ${values.culturalAuthenticity} below required 65% minimum`,
                remedy: 'Improve cultural authenticity through community validation'
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
    // COMMUNITY PROTECTION MECHANISMS - Business Logic
    // =================================================================================
    async applyProtectionMechanisms(memberId, targetCommunityId, interactionType, journeyContext) {
        const communityRules = this.communityRules.get(targetCommunityId) || [];
        const applicableRules = communityRules.filter(rule => rule.applicableJourneyStages.includes(journeyContext.currentStage));
        // Protection Assessment Business Logic
        let allow = true;
        const protectionMeasures = [];
        const reasoning = [];
        for (const rule of applicableRules) {
            if (rule.protectionMechanisms.length > 0) {
                protectionMeasures.push(...rule.protectionMechanisms);
            }
            // Liberation Values Check
            const ruleViolation = await this.checkRuleViolation(rule, interactionType, journeyContext);
            if (ruleViolation) {
                allow = false;
                reasoning.push(`Violated community rule: ${rule.name} - ${ruleViolation}`);
            }
        }
        // Default Protection for Vulnerable Stages
        if (this.isVulnerableJourneyStage(journeyContext.currentStage)) {
            protectionMeasures.push('vulnerable_stage_extra_protection');
            protectionMeasures.push('community_support_notification');
        }
        // Empowerment Opportunities Generation
        const empowermentOpportunities = this.identifyEmpowermentOpportunities(interactionType, journeyContext.currentStage, {
            creatorSovereignty: 0.75,
            antiOppressionValidation: true,
            blackQueerEmpowerment: 0.8,
            communityProtection: 0.9,
            culturalAuthenticity: 0.85
        });
        return {
            allow,
            reasoning: reasoning.join('; '),
            protectionMeasures,
            empowermentOpportunities,
            liberationImpact: allow ? 0.7 : 0.2
        };
    }
    // =================================================================================
    // LIBERATION JOURNEY PROGRESSION - Business Logic
    // =================================================================================
    findProgressionRule(from, to) {
        // Core liberation journey progression rules
        const coreProgressionRules = [
            {
                fromStage: 'crisis',
                toStage: 'stabilization',
                liberationCriteria: {
                    creatorSovereignty: 0.65,
                    antiOppressionValidation: true,
                    blackQueerEmpowerment: 0.6,
                    communityProtection: 0.8,
                    culturalAuthenticity: 0.7
                },
                empowermentRequirements: ['safety_planning', 'resource_connection', 'community_support'],
                communityValidation: true
            },
            {
                fromStage: 'stabilization',
                toStage: 'growth',
                liberationCriteria: {
                    creatorSovereignty: 0.7,
                    antiOppressionValidation: true,
                    blackQueerEmpowerment: 0.7,
                    communityProtection: 0.75,
                    culturalAuthenticity: 0.75
                },
                empowermentRequirements: ['skill_development', 'peer_connection', 'resource_stability'],
                communityValidation: false
            },
            {
                fromStage: 'growth',
                toStage: 'community_healing',
                liberationCriteria: {
                    creatorSovereignty: 0.75,
                    antiOppressionValidation: true,
                    blackQueerEmpowerment: 0.8,
                    communityProtection: 0.8,
                    culturalAuthenticity: 0.8
                },
                empowermentRequirements: ['peer_support_capacity', 'healing_knowledge', 'community_trust'],
                communityValidation: true
            },
            {
                fromStage: 'community_healing',
                toStage: 'advocacy',
                liberationCriteria: {
                    creatorSovereignty: 0.8,
                    antiOppressionValidation: true,
                    blackQueerEmpowerment: 0.9,
                    communityProtection: 0.85,
                    culturalAuthenticity: 0.85
                },
                empowermentRequirements: ['leadership_skills', 'system_analysis', 'movement_connection'],
                communityValidation: true
            }
        ];
        return coreProgressionRules.find(rule => rule.fromStage === from && rule.toStage === to) || null;
    }
    // =================================================================================
    // EMPOWERMENT AND LIBERATION CALCULATIONS - Business Logic
    // =================================================================================
    identifyEmpowermentOpportunities(interactionType, currentStage, liberationValues) {
        const opportunities = [];
        // Stage-specific empowerment opportunities
        switch (currentStage) {
            case 'crisis':
                opportunities.push('peer_support_connection', 'resource_navigation', 'safety_planning');
                break;
            case 'stabilization':
                opportunities.push('skill_building', 'community_integration', 'resource_development');
                break;
            case 'growth':
                opportunities.push('leadership_development', 'peer_mentoring', 'advocacy_training');
                break;
            case 'community_healing':
                opportunities.push('healing_facilitation', 'community_support', 'knowledge_sharing');
                break;
            case 'advocacy':
                opportunities.push('movement_leadership', 'system_change', 'community_organizing');
                break;
        }
        // Liberation values-based opportunities
        if (liberationValues.blackQueerEmpowerment >= 0.8) {
            opportunities.push('cultural_celebration', 'visibility_amplification');
        }
        if (liberationValues.creatorSovereignty >= 0.8) {
            opportunities.push('economic_empowerment', 'revenue_sharing_optimization');
        }
        return opportunities;
    }
    calculateInteractionLiberationImpact(interactionType, journeyContext, liberationValues, allowed) {
        if (!allowed)
            return 0.2; // Minimal impact if blocked
        let impact = 0.5; // Base impact
        // Liberation values impact
        impact += liberationValues.blackQueerEmpowerment * 0.3;
        impact += liberationValues.communityProtection * 0.2;
        // Journey stage impact multiplier
        const stageMultipliers = {
            crisis: 0.8, // High impact for crisis support
            stabilization: 0.7,
            growth: 0.9, // High impact for growth
            community_healing: 1.0, // Maximum impact for healing
            advocacy: 1.0 // Maximum impact for advocacy
        };
        impact *= stageMultipliers[journeyContext.currentStage] || 0.6;
        return Math.min(impact, 1.0);
    }
    // =================================================================================
    // INITIALIZATION AND UTILITY METHODS
    // =================================================================================
    initializeCommunityLiberationRules() {
        // Initialize community protection rules based on liberation values
        const defaultRules = [
            {
                id: 'anti_oppression_protection',
                name: 'Anti-Oppression Community Protection',
                description: 'Prevents interactions that perpetuate oppression',
                applicableJourneyStages: ['crisis', 'stabilization', 'growth', 'community_healing', 'advocacy'],
                liberationRequirements: {
                    creatorSovereignty: 0.75,
                    antiOppressionValidation: true,
                    blackQueerEmpowerment: 0.6,
                    communityProtection: 0.8,
                    culturalAuthenticity: 0.7
                },
                protectionMechanisms: ['content_review', 'community_notification', 'support_escalation'],
                empowermentActions: ['peer_support', 'resource_connection', 'healing_space_access']
            },
            {
                id: 'creator_sovereignty_protection',
                name: 'Creator Sovereignty Protection',
                description: 'Ensures creator rights and economic empowerment',
                applicableJourneyStages: ['growth', 'community_healing', 'advocacy'],
                liberationRequirements: {
                    creatorSovereignty: 0.75,
                    antiOppressionValidation: true,
                    blackQueerEmpowerment: 0.7,
                    communityProtection: 0.75,
                    culturalAuthenticity: 0.75
                },
                protectionMechanisms: ['attribution_verification', 'revenue_protection', 'rights_enforcement'],
                empowermentActions: ['revenue_sharing', 'attribution_amplification', 'platform_promotion']
            }
        ];
        this.communityRules.set('default', defaultRules);
    }
    // Utility methods for business logic calculations
    generateProtectionReasoning(decision, validation) {
        const reasons = [];
        if (!decision.allow)
            reasons.push('Community protection mechanisms activated');
        if (!validation.isValid)
            reasons.push('Liberation values validation failed');
        if (validation.violations.length > 0)
            reasons.push(`Liberation violations: ${validation.violations.length}`);
        return reasons.join('; ') || 'Liberation values aligned, community protection satisfied';
    }
    generateInteractionRecommendations(decision) {
        const recommendations = [];
        if (!decision.allow) {
            recommendations.push('Review community guidelines and liberation principles');
            recommendations.push('Engage with community support resources');
        }
        if (decision.empowermentOpportunities.length > 0) {
            recommendations.push(`Explore empowerment opportunities: ${decision.empowermentOpportunities.slice(0, 2).join(', ')}`);
        }
        recommendations.push('Connect with peer support and community resources');
        return recommendations;
    }
    calculateCommunityBenefit(decision) {
        let benefit = 0.5; // Base community benefit
        if (decision.allow)
            benefit += 0.3;
        benefit += decision.empowermentOpportunities.length * 0.1;
        benefit += decision.liberationImpact * 0.2;
        return Math.min(benefit, 1.0);
    }
    // Additional utility methods would continue here following the same pattern...
    async assessLiberationReadiness(userId, rule, context, values) {
        // Business logic to assess if user meets liberation criteria for progression
        const criteriaValidation = await this.validateLiberationValues(rule.liberationCriteria);
        const userValuesValidation = await this.validateLiberationValues(values);
        return criteriaValidation.empowermentScore >= 0.7 &&
            userValuesValidation.empowermentScore >= 0.6;
    }
    async validateCommunitySupport(userId, rule, context) {
        // Business logic for community validation requirement
        // This would integrate with community feedback systems
        return true; // Simplified for implementation
    }
    validateEmpowermentRequirements(requirements, context, values) {
        // Business logic to validate empowerment requirements are met
        // This would check against user's empowerment progress
        return values.blackQueerEmpowerment >= 0.6 && values.communityProtection >= 0.7;
    }
    calculateProgressionEmpowermentImpact(rule, values) {
        return values.blackQueerEmpowerment * 0.4 + values.communityProtection * 0.3 + values.culturalAuthenticity * 0.3;
    }
    calculateProgressionCommunityBenefit(rule, context) {
        // Higher community benefit for progression to healing and advocacy stages
        const stageBenefits = {
            'community_healing': 0.9,
            'advocacy': 1.0,
            'growth': 0.7,
            'stabilization': 0.6
        };
        return stageBenefits[rule.toStage] || 0.5;
    }
    generateProgressionRecommendations(rule, readiness, empowermentMet) {
        const recommendations = [];
        if (!readiness) {
            recommendations.push('Build liberation values alignment through community engagement');
        }
        if (!empowermentMet) {
            recommendations.push(`Develop empowerment requirements: ${rule.empowermentRequirements.slice(0, 2).join(', ')}`);
        }
        if (rule.communityValidation) {
            recommendations.push('Engage with community for validation and support');
        }
        recommendations.push('Continue community participation and peer support');
        return recommendations;
    }
    calculateDemocraticAccessibility(participationType, communityContext) {
        // Business logic for accessibility assessment
        return 0.8; // Simplified implementation
    }
    assessParticipationQuality(participantId, type, context, values) {
        return values.blackQueerEmpowerment * 0.4 + values.communityProtection * 0.3 + values.culturalAuthenticity * 0.3;
    }
    calculateParticipationEmpowermentLevel(type, score, values) {
        return score * values.blackQueerEmpowerment;
    }
    assessParticipationLiberationAlignment(type, context, values) {
        return (values.blackQueerEmpowerment + values.communityProtection + values.culturalAuthenticity) / 3;
    }
    generateAccessibilityMeasures(type, score, context) {
        return ['screen_reader_support', 'multiple_language_options', 'flexible_participation_formats'];
    }
    calculateParticipationCommunityBenefit(validation) {
        return validation.empowermentLevel * validation.liberationAlignment;
    }
    generateParticipationRecommendations(validation) {
        const recommendations = [];
        if (validation.participationScore < 0.7) {
            recommendations.push('Enhance participation quality through community engagement');
        }
        if (validation.liberationAlignment < 0.8) {
            recommendations.push('Align participation with liberation values and community goals');
        }
        recommendations.push('Utilize accessibility measures for inclusive participation');
        return recommendations;
    }
    async checkRuleViolation(rule, type, context) {
        const ruleValidation = await this.validateLiberationValues(rule.liberationRequirements);
        return ruleValidation.isValid ? null : 'Liberation requirements not met';
    }
    isVulnerableJourneyStage(stage) {
        return stage === 'crisis' || stage === 'stabilization';
    }
}
exports.CommunityBusinessLogicService = CommunityBusinessLogicService;
exports.default = CommunityBusinessLogicService;
//# sourceMappingURL=CommunityBusinessLogicService.js.map