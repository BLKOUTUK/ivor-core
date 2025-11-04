/**
 * Community Backup Service with Democratic Governance
 * Layer 5: Data Sovereignty - Community-Controlled Backup Operations
 * BLKOUT Community Data Liberation Platform
 */
import { SupabaseClient } from '@supabase/supabase-js';
import { CommunityGovernanceService } from './CommunityGovernanceService.js';
export interface BackupScheduleConfig {
    scheduleName: string;
    scheduleDescription?: string;
    cronExpression: string;
    backupType: 'full' | 'incremental' | 'schema_only' | 'data_only';
    retentionDays: number;
    communityApprovalRequired: boolean;
    includedTables?: string[];
    excludedTables?: string[];
    includeSensitiveData: boolean;
    encryptBackup: boolean;
    primaryBackupLocation: string;
    replicaLocations?: string[];
    crossRegionReplication: boolean;
}
export interface BackupOperation {
    id: string;
    scheduleId?: string;
    communityId: string;
    operationType: 'backup' | 'restore' | 'verify' | 'migrate';
    backupScope: 'full' | 'incremental' | 'schema_only' | 'data_only';
    governanceDecisionId: string;
    communityApproved: boolean;
    sovereigntyCompliant: boolean;
    democraticOversight: boolean;
    status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled';
    backupLocation: string;
    encryptionApplied: boolean;
    auditTrailId: string;
    timestamp: string;
}
export interface RecoveryScenario {
    id: string;
    scenarioName: string;
    scenarioDescription: string;
    disasterType: 'data_corruption' | 'hardware_failure' | 'cyber_attack' | 'natural_disaster';
    severityLevel: 'low' | 'medium' | 'high' | 'critical';
    recoveryTimeObjectiveHours: number;
    recoveryPointObjectiveHours: number;
    communityApprovalRequired: boolean;
    recoverySteps: RecoveryStep[];
    lastTested?: string;
    testSuccessRate?: number;
}
export interface RecoveryStep {
    step: number;
    action: string;
    responsibility: 'technical_team' | 'community_admin' | 'community_council' | 'community_members' | 'monitoring_system';
    estimatedTimeMinutes: number;
    requiresCommunityApproval?: boolean;
}
export interface BackupVerificationResult {
    verificationId: string;
    backupOperationId: string;
    verificationType: 'checksum' | 'restore_test' | 'data_integrity' | 'community_audit';
    verificationStatus: 'pending' | 'running' | 'passed' | 'failed' | 'cancelled';
    dataIntegrityScore?: number;
    checksumMatches?: boolean;
    restoreTestSuccessful?: boolean;
    verificationErrors: string[];
    communityAuditable: boolean;
    sovereigntyVerificationPassed?: boolean;
    democraticOversightCompleted?: boolean;
}
export declare class CommunityBackupService {
    private supabase;
    private governance;
    constructor(supabase: SupabaseClient, governance: CommunityGovernanceService);
    /**
     * Create backup schedule with community governance approval
     */
    createBackupSchedule(config: BackupScheduleConfig): Promise<{
        scheduleId: string;
        governanceDecisionId: string;
    }>;
    /**
     * Execute backup operation with community oversight
     */
    executeBackupOperation(scheduleId: string | null, operationType: 'backup' | 'restore' | 'verify' | 'migrate', backupScope: 'full' | 'incremental' | 'schema_only' | 'data_only'): Promise<BackupOperation>;
    /**
     * Verify backup integrity with community audit trail
     */
    verifyBackupIntegrity(backupOperationId: string): Promise<BackupVerificationResult>;
    /**
     * Create disaster recovery scenario with community approval
     */
    createRecoveryScenario(scenario: Omit<RecoveryScenario, 'id'>): Promise<RecoveryScenario>;
    /**
     * Execute recovery operation with emergency community authorization
     */
    executeRecoveryOperation(scenarioId: string, backupOperationId: string, recoveryTrigger: 'scheduled_test' | 'actual_disaster' | 'community_request' | 'security_incident', emergencyAuthorization?: boolean): Promise<{
        recoveryId: string;
        governanceDecisionId: string;
    }>;
    /**
     * Get backup system health for community dashboard
     */
    getBackupSystemHealth(): Promise<any>;
    /**
     * Get recovery operations transparency data
     */
    getRecoveryTransparency(): Promise<any[]>;
    /**
     * Get backup schedules with community approval status
     */
    getCommunityBackupSchedules(): Promise<any[]>;
    private registerCommunityBackup;
    private createAuditTrail;
    private generateBackupLocation;
    private estimateBackupSize;
    private generateKeyFingerprint;
    private generateChecksum;
    private getCommunityId;
    private getTableNameFromOperation;
    private getDefaultHealthMetrics;
}
export default CommunityBackupService;
//# sourceMappingURL=CommunityBackupService.d.ts.map