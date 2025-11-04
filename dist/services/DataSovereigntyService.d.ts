/**
 * Data Sovereignty Service - Layer 5 Implementation
 * BLKOUT Community Data Liberation Platform
 *
 * This service implements Layer 5 (Data Sovereignty) that calls Layer 4 (Community Governance)
 * for all validation before performing data operations with sovereignty protection
 */
import { SupabaseClient } from '@supabase/supabase-js';
import { CommunityGovernanceService, CommunityBackupConfig, SovereigntyRules, RevenueSharing, LiberationPrinciples } from './CommunityGovernanceService.js';
export interface CommunityData {
    id: string;
    type: 'user_content' | 'creator_content' | 'community_posts' | 'organizing_data' | 'analytics' | 'governance_data';
    content: any;
    creatorId?: string;
    communityId: string;
    sovereigntyRules: SovereigntyRules;
    liberationPrinciples: LiberationPrinciples;
    revenueSharing?: RevenueSharing;
    metadata?: Record<string, any>;
}
export interface CreatorData {
    id: string;
    creatorId: string;
    content: any;
    revenueSharing: RevenueSharing;
    sovereigntyRules: SovereigntyRules;
    liberationPrinciples: LiberationPrinciples;
    metadata?: Record<string, any>;
}
export interface StorageResult {
    success: boolean;
    dataId: string;
    governanceDecisionId: string;
    communityApproved: boolean;
    liberationValidated: boolean;
    creatorSovereigntyMaintained: boolean;
    auditTrailId: string;
    encryptionApplied: boolean;
    timestamp: string;
    message?: string;
}
export interface BackupResult {
    success: boolean;
    backupId: string;
    governanceDecisionId: string;
    communityApproved: boolean;
    sovereigntyCompliant: boolean;
    encryptionApplied: boolean;
    backupLocation: string;
    retentionUntil: string;
    auditTrailId: string;
    timestamp: string;
    message?: string;
}
export interface RetrievalResult {
    success: boolean;
    data?: any;
    governanceDecisionId: string;
    communityAuthorized: boolean;
    liberationValidated: boolean;
    auditTrailId: string;
    timestamp: string;
    message?: string;
}
export interface AnalyticsResult {
    success: boolean;
    analyticsId: string;
    governanceDecisionId: string;
    communityConsent: boolean;
    liberationMetrics: LiberationMetrics;
    privacyProtected: boolean;
    auditTrailId: string;
    timestamp: string;
}
export interface LiberationMetrics {
    empowermentScore: number;
    sovereigntyScore: number;
    democraticParticipationRate: number;
    mutualAidActivities: number;
    oppressionResistanceActions: number;
    communityBenefitMeasure: number;
    creatorRevenueSovereignty: number;
    transparencyLevel: number;
}
export declare class DataSovereigntyService {
    private supabase;
    private governance;
    constructor(supabase: SupabaseClient, governance: CommunityGovernanceService);
    /**
     * Store community data with sovereignty protection and governance validation
     */
    storeCommunityData(data: CommunityData, sovereigntyRules: SovereigntyRules): Promise<StorageResult>;
    /**
     * Store creator content with liberation validation and sovereignty protection
     */
    storeCreatorContent(content: CreatorData): Promise<StorageResult>;
    /**
     * Retrieve community data with governance authorization
     */
    retrieveCommunityData(dataId: string, requestingUser: string): Promise<RetrievalResult>;
    /**
     * Create community backup with governance approval
     */
    createCommunityBackup(backupConfig: CommunityBackupConfig): Promise<BackupResult>;
    /**
     * Execute backup with sovereignty protection
     */
    private executeBackupWithSovereigntyProtection;
    /**
     * Collect liberation metrics with community consent
     */
    collectLiberationMetrics(communityId: string): Promise<AnalyticsResult>;
    /**
     * Store data with sovereignty protection
     */
    private storeWithSovereigntyProtection;
    /**
     * Store creator content with liberation protection
     */
    private storeWithLiberationProtection;
    /**
     * Calculate liberation metrics for community
     */
    private calculateLiberationMetrics;
    /**
     * Store liberation metrics with governance approval
     */
    private storeLiberationMetrics;
    /**
     * Create comprehensive audit trail
     */
    private createAuditTrail;
    private encryptSensitiveData;
    private generateKeyFingerprint;
    private getCommunityId;
    private getTableNameFromOperation;
    private calculateAverageMetric;
    private calculateSumMetric;
    private calculateLiberationImpact;
}
export default DataSovereigntyService;
//# sourceMappingURL=DataSovereigntyService.d.ts.map