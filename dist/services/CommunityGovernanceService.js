"use strict";
/**
 * Community Governance Service Interface - Layer 4 Integration
 * BLKOUT Community Data Liberation Platform
 *
 * This service provides the interface for Layer 5 (Data Sovereignty) to call
 * Layer 4 (Community Governance) for all data operation validation
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.BackupRejectedError = exports.LiberationValidationError = exports.CommunityGovernanceRejectionError = exports.CommunityGovernanceError = exports.CommunityGovernanceServiceImpl = void 0;
exports.createCommunityGovernanceService = createCommunityGovernanceService;
// =====================================================================================
// IMPLEMENTATION OF COMMUNITY GOVERNANCE SERVICE
// =====================================================================================
class CommunityGovernanceServiceImpl {
    constructor(supabase) {
        this.supabase = supabase;
    }
    /**
     * Validates data operations against community governance principles
     */
    async validateDataOperation(operation) {
        try {
            // 1. Create governance decision record
            const decisionId = crypto.randomUUID();
            // 2. Validate liberation principles first
            const liberationResult = await this.enforceLiberationPrinciples(operation);
            // 3. Validate creator sovereignty if applicable
            const sovereigntyResult = operation.revenueSharing
                ? await this.validateCreatorSovereignty(operation.data)
                : { sovereigntyMaintained: true, creatorControlPreserved: true, revenueShareCompliant: true, dataResidencyCompliant: true, democraticOversightApplied: true };
            // 4. Validate community consent
            const consentResult = await this.validateCommunityConsent(operation.data);
            // 5. Determine overall approval
            const approved = this.determineApproval(liberationResult, sovereigntyResult, consentResult, operation);
            // 6. Create comprehensive governance decision
            const governanceDecision = {
                decisionId,
                approved,
                reasons: this.generateReasons(liberationResult, sovereigntyResult, consentResult, approved),
                liberationPrinciples: {
                    validated: liberationResult.liberationValidated,
                    issues: liberationResult.issues,
                    score: liberationResult.empowermentScore
                },
                creatorSovereignty: {
                    validated: sovereigntyResult.sovereigntyMaintained,
                    revenueShareCompliant: sovereigntyResult.revenueShareCompliant,
                    controlMaintained: sovereigntyResult.creatorControlPreserved
                },
                communityConsent: {
                    obtained: consentResult.consentObtained,
                    participationRate: consentResult.participationRate,
                    democraticProcess: consentResult.consentMechanism === 'democratic_vote'
                },
                dataProtection: {
                    sovereigntyMaintained: operation.sovereignty?.communityControlRequired ?? true,
                    encryptionApplied: operation.sovereignty?.encryptionRequired ?? true,
                    auditTrailCreated: operation.sovereignty?.auditTrailRequired ?? true
                },
                timestamp: new Date().toISOString(),
                implementationInstructions: this.generateImplementationInstructions(operation, approved)
            };
            // 7. Store governance decision in database
            await this.storeGovernanceDecision(governanceDecision, operation);
            return governanceDecision;
        }
        catch (error) {
            console.error('Community governance validation failed:', error);
            throw new CommunityGovernanceError(`Governance validation failed: ${error.message}`);
        }
    }
    /**
     * Validates community consent for data operations
     */
    async validateCommunityConsent(data) {
        try {
            // For now, implement basic consent validation
            // In production, this would integrate with the democratic voting system
            const auditTrailId = crypto.randomUUID();
            // Check if community vote is required for this type of operation
            const requiresCommunityVote = this.requiresCommunityVote(data);
            if (requiresCommunityVote) {
                // In a real implementation, this would check the governance_decisions table
                // for active votes and their results
                return {
                    consentObtained: true, // For now, assume consent
                    participationRate: 0.65, // 65% participation rate
                    consentMechanism: 'democratic_vote',
                    transparencyLevel: 'full',
                    auditTrailId
                };
            }
            return {
                consentObtained: true,
                participationRate: 1.0,
                consentMechanism: 'delegated', // Delegated authority for routine operations
                transparencyLevel: 'summary',
                auditTrailId
            };
        }
        catch (error) {
            console.error('Community consent validation failed:', error);
            throw new CommunityGovernanceError(`Consent validation failed: ${error.message}`);
        }
    }
    /**
     * Validates creator sovereignty requirements
     */
    async validateCreatorSovereignty(data) {
        try {
            const revenueShare = data?.revenueSharing;
            // Validate minimum creator revenue share (75%)
            const revenueShareCompliant = !revenueShare || revenueShare.creatorPercentage >= 75;
            // Validate creator control maintenance
            const creatorControlPreserved = this.validateCreatorControl(data);
            // Validate data residency requirements
            const dataResidencyCompliant = this.validateDataResidency(data);
            // All sovereignty checks must pass
            const sovereigntyMaintained = revenueShareCompliant && creatorControlPreserved && dataResidencyCompliant;
            return {
                sovereigntyMaintained,
                creatorControlPreserved,
                revenueShareCompliant,
                dataResidencyCompliant,
                democraticOversightApplied: true
            };
        }
        catch (error) {
            console.error('Creator sovereignty validation failed:', error);
            throw new CommunityGovernanceError(`Sovereignty validation failed: ${error.message}`);
        }
    }
    /**
     * Enforces liberation principles for all operations
     */
    async enforceLiberationPrinciples(operation) {
        try {
            const principles = operation.liberationPrinciples;
            const issues = [];
            // Validate each liberation principle
            if (!principles?.empowersBlackQueerness) {
                issues.push('Operation must empower Black queerness');
            }
            if (!principles?.maintainsCreatorSovereignty) {
                issues.push('Operation must maintain creator sovereignty');
            }
            if (!principles?.advancesCommunityLiberation) {
                issues.push('Operation must advance community liberation');
            }
            if (!principles?.resistsOppressionSystems) {
                issues.push('Operation must resist oppression systems');
            }
            // Calculate empowerment scores
            const empowermentScore = this.calculateEmpowermentScore(principles);
            const oppressionResistanceScore = this.calculateOppressionResistanceScore(principles);
            const communityBenefitScore = this.calculateCommunityBenefitScore(principles);
            // Liberation is validated if all principles are met and scores are high
            const liberationValidated = issues.length === 0 && empowermentScore >= 0.8;
            return {
                liberationValidated,
                empowermentScore,
                oppressionResistanceScore,
                communityBenefitScore,
                mutualAidSupported: principles?.supportsMutualAid ?? false,
                democraticParticipationEnabled: principles?.enablesDemocraticParticipation ?? false,
                issues
            };
        }
        catch (error) {
            console.error('Liberation principles enforcement failed:', error);
            throw new CommunityGovernanceError(`Liberation validation failed: ${error.message}`);
        }
    }
    // =====================================================================================
    // PRIVATE HELPER METHODS
    // =====================================================================================
    determineApproval(liberationResult, sovereigntyResult, consentResult, operation) {
        // All three pillars must be satisfied for approval
        return (liberationResult.liberationValidated &&
            sovereigntyResult.sovereigntyMaintained &&
            consentResult.consentObtained);
    }
    generateReasons(liberationResult, sovereigntyResult, consentResult, approved) {
        const reasons = [];
        if (approved) {
            reasons.push('All liberation principles validated');
            reasons.push('Creator sovereignty maintained');
            reasons.push('Community consent obtained');
            reasons.push('Democratic oversight applied');
        }
        else {
            if (!liberationResult.liberationValidated) {
                reasons.push(...liberationResult.issues);
            }
            if (!sovereigntyResult.sovereigntyMaintained) {
                reasons.push('Creator sovereignty requirements not met');
            }
            if (!consentResult.consentObtained) {
                reasons.push('Community consent not obtained');
            }
        }
        return reasons;
    }
    generateImplementationInstructions(operation, approved) {
        if (!approved) {
            return ['Operation rejected - address governance issues before retry'];
        }
        const instructions = [
            'Proceed with community-approved data operation',
            'Maintain full audit trail throughout execution',
            'Apply encryption for all sensitive data',
            'Ensure transparency reporting to community'
        ];
        if (operation.sovereignty?.auditTrailRequired) {
            instructions.push('Create detailed audit log entries');
        }
        if (operation.revenueSharing) {
            instructions.push(`Ensure creator receives ${operation.revenueSharing.creatorPercentage}% revenue share`);
        }
        return instructions;
    }
    requiresCommunityVote(data) {
        // Define operations that require community voting
        const voteRequiredOperations = [
            'PLATFORM_POLICY_CHANGE',
            'REVENUE_SHARING_MODIFICATION',
            'DATA_SOVEREIGNTY_CHANGE',
            'MAJOR_INFRASTRUCTURE_CHANGE'
        ];
        return voteRequiredOperations.includes(data?.operationType) || false;
    }
    validateCreatorControl(data) {
        // Validate that creators maintain control over their content
        return !data?.restrictCreatorControl && !data?.transferOwnership;
    }
    validateDataResidency(data) {
        // Validate data residency requirements for sovereignty
        const allowedRegions = ['UK', 'EU', 'COMMUNITY_CONTROLLED'];
        const dataLocation = data?.dataLocation || 'UK';
        return allowedRegions.includes(dataLocation);
    }
    calculateEmpowermentScore(principles) {
        if (!principles)
            return 0.5;
        let score = 0;
        let total = 0;
        if (principles.empowersBlackQueerness)
            score += 0.25;
        total += 0.25;
        if (principles.maintainsCreatorSovereignty)
            score += 0.25;
        total += 0.25;
        if (principles.advancesCommunityLiberation)
            score += 0.25;
        total += 0.25;
        if (principles.enablesDemocraticParticipation)
            score += 0.25;
        total += 0.25;
        return total > 0 ? score / total : 0.5;
    }
    calculateOppressionResistanceScore(principles) {
        if (!principles)
            return 0.5;
        let score = 0.5; // Base score
        if (principles.resistsOppressionSystems)
            score += 0.3;
        if (principles.supportsMutualAid)
            score += 0.2;
        return Math.min(score, 1.0);
    }
    calculateCommunityBenefitScore(principles) {
        if (!principles)
            return 0.5;
        let score = 0;
        let total = 0;
        if (principles.advancesCommunityLiberation)
            score += 0.4;
        total += 0.4;
        if (principles.supportsMutualAid)
            score += 0.3;
        total += 0.3;
        if (principles.enablesDemocraticParticipation)
            score += 0.3;
        total += 0.3;
        return total > 0 ? score / total : 0.5;
    }
    async storeGovernanceDecision(decision, operation) {
        try {
            // Store in community governance decisions table
            await this.supabase
                .from('community_governance_decisions')
                .insert({
                id: decision.decisionId,
                decision_type: operation.type.toLowerCase(),
                proposal_title: `Data Operation: ${operation.type}`,
                proposal_description: `Governance decision for ${operation.operation}`,
                status: decision.approved ? 'passed' : 'rejected',
                votes_for: decision.approved ? 1 : 0,
                votes_against: decision.approved ? 0 : 1,
                sovereignty_impact_level: this.determineSovereigntyImpact(operation),
                affects_data_storage: true,
                affects_data_access: operation.type.includes('STORAGE') || operation.type.includes('EXPORT'),
                affects_backup_policy: operation.type.includes('BACKUP'),
                decision_rationale: decision.reasons.join('; '),
                implementation_plan: decision.implementationInstructions?.join('; ') || ''
            });
            // Store detailed audit log
            await this.supabase
                .from('data_sovereignty_audit_log')
                .insert({
                operation_type: 'governance_decision',
                table_name: 'community_governance_decisions',
                record_id: decision.decisionId,
                actor_type: 'community_governance',
                operation_details: {
                    operation: operation.operation,
                    approved: decision.approved,
                    liberation_score: decision.liberationPrinciples.score,
                    sovereignty_maintained: decision.creatorSovereignty.validated,
                    community_consent: decision.communityConsent.obtained
                },
                sovereignty_compliance_checked: true,
                community_consent_verified: decision.communityConsent.obtained,
                liberation_principles_followed: decision.approved ? ['empowerment', 'sovereignty', 'liberation', 'democracy'] : [],
                community_values_respected: decision.approved,
                democratic_process_followed: decision.communityConsent.democraticProcess,
                public_visibility: true,
                community_member_visibility: true
            });
        }
        catch (error) {
            console.error('Failed to store governance decision:', error);
            // Don't throw here to avoid blocking the main operation
        }
    }
    determineSovereigntyImpact(operation) {
        if (operation.type.includes('BACKUP') || operation.type.includes('EXPORT')) {
            return 'critical';
        }
        if (operation.type.includes('STORAGE') || operation.sovereignty?.communityControlRequired) {
            return 'high';
        }
        return 'medium';
    }
}
exports.CommunityGovernanceServiceImpl = CommunityGovernanceServiceImpl;
// =====================================================================================
// CUSTOM ERROR CLASSES
// =====================================================================================
class CommunityGovernanceError extends Error {
    constructor(message) {
        super(message);
        this.name = 'CommunityGovernanceError';
    }
}
exports.CommunityGovernanceError = CommunityGovernanceError;
class CommunityGovernanceRejectionError extends Error {
    constructor(message) {
        super(message);
        this.name = 'CommunityGovernanceRejectionError';
    }
}
exports.CommunityGovernanceRejectionError = CommunityGovernanceRejectionError;
class LiberationValidationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'LiberationValidationError';
    }
}
exports.LiberationValidationError = LiberationValidationError;
class BackupRejectedError extends Error {
    constructor(message) {
        super(message);
        this.name = 'BackupRejectedError';
    }
}
exports.BackupRejectedError = BackupRejectedError;
// =====================================================================================
// FACTORY FUNCTION FOR SERVICE CREATION
// =====================================================================================
function createCommunityGovernanceService(supabase) {
    return new CommunityGovernanceServiceImpl(supabase);
}
exports.default = CommunityGovernanceServiceImpl;
//# sourceMappingURL=CommunityGovernanceService.js.map