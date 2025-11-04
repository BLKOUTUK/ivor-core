/**
 * Data Sovereignty Orchestrator - Main Service Coordinator
 * Layer 5: Data Sovereignty with Layer 4: Community Governance Integration
 * BLKOUT Community Data Liberation Platform
 *
 * This orchestrator coordinates all data sovereignty services and ensures
 * ALL operations go through Community Governance Layer validation first
 */
import { SupabaseClient } from '@supabase/supabase-js';
import { CommunityGovernanceService } from './CommunityGovernanceService.js';
import { DataSovereigntyService } from './DataSovereigntyService.js';
import { CommunityBackupService } from './CommunityBackupService.js';
import { LiberationDataService } from './LiberationDataService.js';
import { TransparencyDashboardService } from './TransparencyDashboardService.js';
export interface DataSovereigntyOrchestrator {
    governance: CommunityGovernanceService;
    dataSovereignty: DataSovereigntyService;
    backup: CommunityBackupService;
    liberation: LiberationDataService;
    transparency: TransparencyDashboardService;
    initialize(): Promise<void>;
    validateSystemIntegrity(): Promise<SystemIntegrityReport>;
    generateComprehensiveReport(): Promise<ComprehensiveSystemReport>;
    executeEmergencyBackup(): Promise<{
        backupId: string;
        governanceDecisionId: string;
    }>;
    emergencyDataRecovery(backupId: string): Promise<{
        recoveryId: string;
        success: boolean;
    }>;
}
export interface SystemIntegrityReport {
    overallIntegrity: number;
    governanceIntegrity: number;
    sovereigntyIntegrity: number;
    liberationIntegrity: number;
    backupIntegrity: number;
    transparencyIntegrity: number;
    issues: SystemIssue[];
    recommendations: string[];
    lastValidated: string;
}
export interface SystemIssue {
    severity: 'low' | 'medium' | 'high' | 'critical';
    component: string;
    description: string;
    impact: string;
    resolution: string;
    governanceRequired: boolean;
}
export interface ComprehensiveSystemReport {
    communityDashboard: any;
    liberationMetrics: any;
    sovereigntyStatus: any;
    governanceHealth: any;
    backupStatus: any;
    systemIntegrity: SystemIntegrityReport;
    operationalRecommendations: string[];
    liberationOpportunities: string[];
    emergencyPreparedness: EmergencyPreparednessReport;
    generatedAt: string;
}
export interface EmergencyPreparednessReport {
    backupReadiness: number;
    recoveryCapability: number;
    governanceResponsiveness: number;
    communityNotificationSystems: number;
    emergencyDecisionMaking: number;
    overallPreparedness: number;
    criticalGaps: string[];
    recommendedActions: string[];
}
export declare class DataSovereigntyOrchestratorImpl implements DataSovereigntyOrchestrator {
    governance: CommunityGovernanceService;
    dataSovereignty: DataSovereigntyService;
    backup: CommunityBackupService;
    liberation: LiberationDataService;
    transparency: TransparencyDashboardService;
    private supabase;
    private initialized;
    constructor(supabase: SupabaseClient);
    /**
     * Initialize the complete data sovereignty system
     */
    initialize(): Promise<void>;
    /**
     * Validate complete system integrity with liberation principles
     */
    validateSystemIntegrity(): Promise<SystemIntegrityReport>;
    /**
     * Generate comprehensive system report for community oversight
     */
    generateComprehensiveReport(): Promise<ComprehensiveSystemReport>;
    /**
     * Execute emergency backup with community governance validation
     */
    executeEmergencyBackup(): Promise<{
        backupId: string;
        governanceDecisionId: string;
    }>;
    /**
     * Execute emergency data recovery with community authorization
     */
    emergencyDataRecovery(backupId: string): Promise<{
        recoveryId: string;
        success: boolean;
    }>;
    private validateDatabaseIntegrity;
    private initializeGovernanceSystem;
    private initializeDataSovereigntyServices;
    private initializeBackupSystems;
    private initializeLiberationSystems;
    private initializeTransparencySystems;
    private validateGovernanceIntegrity;
    private validateSovereigntyIntegrity;
    private validateLiberationIntegrity;
    private validateBackupIntegrity;
    private validateTransparencyIntegrity;
    private generateSystemRecommendations;
    private generateOperationalRecommendations;
    private identifyLiberationOpportunities;
    private assessEmergencyPreparedness;
    private generateSovereigntyStatus;
    private generateGovernanceHealth;
    private getDisasterRecoveryScenarios;
    private storeIntegrityReport;
    private storeComprehensiveReport;
}
/**
 * Create Data Sovereignty Orchestrator instance
 */
export declare function createDataSovereigntyOrchestrator(supabase: SupabaseClient): DataSovereigntyOrchestrator;
export default DataSovereigntyOrchestratorImpl;
//# sourceMappingURL=DataSovereigntyOrchestrator.d.ts.map