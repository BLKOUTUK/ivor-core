/**
 * Transparency Dashboard Service - Democratic Oversight and Community Accountability
 * Layer 5: Data Sovereignty with Community Transparency and Liberation Metrics
 * BLKOUT Community Data Liberation Platform
 */
import { SupabaseClient } from '@supabase/supabase-js';
import { CommunityGovernanceService } from './CommunityGovernanceService.js';
export interface CommunityDashboardData {
    community: CommunityOverview;
    liberation: LiberationDashboard;
    sovereignty: SovereigntyDashboard;
    governance: GovernanceDashboard;
    creators: CreatorsDashboard;
    operations: OperationsDashboard;
    transparency: TransparencyMetrics;
    lastUpdated: string;
}
export interface CommunityOverview {
    communityName: string;
    communityId: string;
    governanceModel: string;
    sovereigntyLevel: string;
    totalMembers: number;
    activeMembersLast30Days: number;
    communityHealth: number;
    democraticParticipationRate: number;
    liberationProgress: number;
}
export interface LiberationDashboard {
    overallLiberationScore: number;
    empowermentLevel: number;
    mutualAidActivities: number;
    organizingInitiatives: number;
    antiOppressionActions: number;
    collectiveBenefitMeasure: number;
    liberationTrends: TimeTrendData[];
    liberationByCategory: CategoryBreakdown[];
}
export interface SovereigntyDashboard {
    dataSovereigntyScore: number;
    creatorSovereigntyRate: number;
    avgCreatorRevenueShare: number;
    communityControlLevel: number;
    encryptionCoverage: number;
    auditTransparency: number;
    sovereigntyViolations: number;
    sovereigntyTrends: TimeTrendData[];
}
export interface GovernanceDashboard {
    activeDecisions: number;
    decisionsLast30Days: number;
    avgVotingParticipation: number;
    consensusAchievementRate: number;
    governanceTransparency: number;
    quorumMeetingRate: number;
    communityApprovalRate: number;
    recentDecisions: GovernanceDecisionSummary[];
}
export interface CreatorsDashboard {
    totalCreators: number;
    activeCreatorsLast30Days: number;
    avgLiberationScore: number;
    avgRevenueShare: number;
    sovereigntyComplianceRate: number;
    totalContentValidated: number;
    creatorEmpowermentLevel: number;
    topCreatorsByLiberation: CreatorSummary[];
}
export interface OperationsDashboard {
    totalDataOperations: number;
    operationsLast24Hours: number;
    governanceValidationRate: number;
    operationSuccessRate: number;
    backupSystemHealth: number;
    systemUptime: number;
    securityIncidents: number;
    recentOperations: OperationSummary[];
}
export interface TransparencyMetrics {
    publiclyVisibleData: number;
    auditTrailCompleteness: number;
    communityOversightLevel: number;
    democraticAccountability: number;
    informationAccessibility: number;
    governanceOpenness: number;
    financialTransparency: number;
    transparencyScore: number;
}
export interface TimeTrendData {
    date: string;
    value: number;
    category?: string;
}
export interface CategoryBreakdown {
    category: string;
    value: number;
    percentage: number;
    trend: 'up' | 'down' | 'stable';
}
export interface GovernanceDecisionSummary {
    id: string;
    title: string;
    type: string;
    status: string;
    votesFor: number;
    votesAgainst: number;
    participationRate: number;
    createdAt: string;
    transparencyLevel: string;
}
export interface CreatorSummary {
    creatorId: string;
    totalContent: number;
    avgLiberationScore: number;
    revenueShareCompliance: number;
    communityImpact: number;
    sovereigntyMaintained: boolean;
}
export interface OperationSummary {
    id: string;
    type: string;
    status: string;
    governanceApproved: boolean;
    liberationValidated: boolean;
    sovereigntyCompliant: boolean;
    timestamp: string;
    transparencyLevel: string;
}
export declare class TransparencyDashboardService {
    private supabase;
    private governance;
    constructor(supabase: SupabaseClient, governance: CommunityGovernanceService);
    /**
     * Generate comprehensive community transparency dashboard
     */
    generateCommunityDashboard(communityId?: string): Promise<CommunityDashboardData>;
    /**
     * Generate real-time liberation metrics dashboard
     */
    generateLiberationRealtimeDashboard(): Promise<LiberationDashboard>;
    /**
     * Generate creator sovereignty transparency dashboard
     */
    generateCreatorSovereigntyDashboard(): Promise<CreatorsDashboard>;
    private generateCommunityOverview;
    private generateLiberationDashboard;
    private generateSovereigntyDashboard;
    private generateGovernanceDashboard;
    private generateCreatorsDashboard;
    private generateOperationsDashboard;
    private generateTransparencyMetrics;
    private getLiberationTrends;
    private getLiberationCategoryBreakdown;
    private getSovereigntyTrends;
    private storeDashboardSnapshot;
    private getDefaultCommunityOverview;
    private getDefaultLiberationDashboard;
    private getDefaultSovereigntyDashboard;
    private getDefaultGovernanceDashboard;
    private getDefaultCreatorsDashboard;
    private getDefaultOperationsDashboard;
    private getDefaultTransparencyMetrics;
    private getDefaultLiberationTrends;
    private getDefaultCategoryBreakdown;
    private getDefaultCommunityId;
}
export default TransparencyDashboardService;
//# sourceMappingURL=TransparencyDashboardService.d.ts.map