/**
 * Community Governance Service Interface - Layer 4 Integration
 * BLKOUT Community Data Liberation Platform
 *
 * This service provides the interface for Layer 5 (Data Sovereignty) to call
 * Layer 4 (Community Governance) for all data operation validation
 */
import { SupabaseClient } from '@supabase/supabase-js';
export interface DataOperation {
    type: 'COMMUNITY_DATA_STORAGE' | 'CREATOR_CONTENT_STORAGE' | 'COMMUNITY_DATA_BACKUP' | 'COMMUNITY_DATA_EXPORT' | 'COMMUNITY_DATA_DELETION' | 'PLATFORM_INTEGRATION' | 'ANALYTICS_COLLECTION';
    operation: string;
    data?: any;
    sovereignty?: SovereigntyRules;
    revenueSharing?: RevenueSharing;
    liberationPrinciples?: LiberationPrinciples;
    backupConfig?: CommunityBackupConfig;
}
export interface SovereigntyRules {
    communityControlRequired: boolean;
    democraticApprovalRequired: boolean;
    transparencyLevel: 'full' | 'summary' | 'private';
    dataResidencyRequirements: string[];
    encryptionRequired: boolean;
    auditTrailRequired: boolean;
}
export interface RevenueSharing {
    creatorPercentage: number;
    communityPercentage: number;
    platformPercentage?: number;
    transparentAccounting: boolean;
}
export interface LiberationPrinciples {
    empowersBlackQueerness: boolean;
    maintainsCreatorSovereignty: boolean;
    advancesCommunityLiberation: boolean;
    resistsOppressionSystems: boolean;
    supportsMutualAid: boolean;
    enablesDemocraticParticipation: boolean;
}
export interface CommunityBackupConfig {
    backupType: 'full' | 'incremental' | 'schema_only' | 'data_only';
    retentionDays: number;
    encryptionEnabled: boolean;
    communityApprovalRequired: boolean;
    crossRegionReplication: boolean;
    sovereigntyCompliant: boolean;
}
export interface GovernanceDecision {
    decisionId: string;
    approved: boolean;
    reasons: string[];
    liberationPrinciples: {
        validated: boolean;
        issues: string[];
        score: number;
    };
    creatorSovereignty: {
        validated: boolean;
        revenueShareCompliant: boolean;
        controlMaintained: boolean;
    };
    communityConsent: {
        obtained: boolean;
        participationRate: number;
        democraticProcess: boolean;
    };
    dataProtection: {
        sovereigntyMaintained: boolean;
        encryptionApplied: boolean;
        auditTrailCreated: boolean;
    };
    timestamp: string;
    implementationInstructions?: string[];
}
export interface ConsentResult {
    consentObtained: boolean;
    participationRate: number;
    consentMechanism: 'democratic_vote' | 'consensus' | 'delegated' | 'emergency_override';
    transparencyLevel: 'full' | 'summary' | 'private';
    auditTrailId: string;
}
export interface SovereigntyResult {
    sovereigntyMaintained: boolean;
    creatorControlPreserved: boolean;
    revenueShareCompliant: boolean;
    dataResidencyCompliant: boolean;
    democraticOversightApplied: boolean;
}
export interface LiberationResult {
    liberationValidated: boolean;
    empowermentScore: number;
    oppressionResistanceScore: number;
    communityBenefitScore: number;
    mutualAidSupported: boolean;
    democraticParticipationEnabled: boolean;
    issues: string[];
}
export interface CommunityGovernanceService {
    validateDataOperation(operation: DataOperation): Promise<GovernanceDecision>;
    validateCommunityConsent(data: any): Promise<ConsentResult>;
    validateCreatorSovereignty(data: any): Promise<SovereigntyResult>;
    enforceLiberationPrinciples(operation: DataOperation): Promise<LiberationResult>;
}
export declare class CommunityGovernanceServiceImpl implements CommunityGovernanceService {
    private supabase;
    constructor(supabase: SupabaseClient);
    /**
     * Validates data operations against community governance principles
     */
    validateDataOperation(operation: DataOperation): Promise<GovernanceDecision>;
    /**
     * Validates community consent for data operations
     */
    validateCommunityConsent(data: any): Promise<ConsentResult>;
    /**
     * Validates creator sovereignty requirements
     */
    validateCreatorSovereignty(data: any): Promise<SovereigntyResult>;
    /**
     * Enforces liberation principles for all operations
     */
    enforceLiberationPrinciples(operation: DataOperation): Promise<LiberationResult>;
    private determineApproval;
    private generateReasons;
    private generateImplementationInstructions;
    private requiresCommunityVote;
    private validateCreatorControl;
    private validateDataResidency;
    private calculateEmpowermentScore;
    private calculateOppressionResistanceScore;
    private calculateCommunityBenefitScore;
    private storeGovernanceDecision;
    private determineSovereigntyImpact;
}
export declare class CommunityGovernanceError extends Error {
    constructor(message: string);
}
export declare class CommunityGovernanceRejectionError extends Error {
    constructor(message: string);
}
export declare class LiberationValidationError extends Error {
    constructor(message: string);
}
export declare class BackupRejectedError extends Error {
    constructor(message: string);
}
export declare function createCommunityGovernanceService(supabase: SupabaseClient): CommunityGovernanceService;
export default CommunityGovernanceServiceImpl;
//# sourceMappingURL=CommunityGovernanceService.d.ts.map