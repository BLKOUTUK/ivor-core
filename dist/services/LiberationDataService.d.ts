/**
 * Liberation Data Service - Creator Sovereignty and Community Empowerment
 * Layer 5: Data Sovereignty with Liberation Principles Enforcement
 * BLKOUT Community Data Liberation Platform
 */
import { SupabaseClient } from '@supabase/supabase-js';
import { CommunityGovernanceService, DataOperation, LiberationPrinciples, RevenueSharing } from './CommunityGovernanceService.js';
export interface CreatorContent {
    id: string;
    creatorId: string;
    contentType: 'article' | 'post' | 'video' | 'podcast' | 'art' | 'music' | 'organizing_guide' | 'event';
    title: string;
    content: any;
    liberationPrinciples: LiberationPrinciples;
    revenueSharing: RevenueSharing;
    communityImpact: CommunityImpact;
    creatorControl: CreatorControl;
    metadata?: Record<string, any>;
}
export interface CommunityImpact {
    empowermentLevel: number;
    mutualAidContribution: number;
    organizingPotential: number;
    culturalRelevance: number;
    antiOppressionAlignment: number;
    democraticParticipationBoost: number;
    collectiveLiberationAdvancement: number;
}
export interface CreatorControl {
    editingPermissions: 'creator_only' | 'collaborative' | 'community_guided';
    monetizationControl: 'full_creator' | 'community_shared' | 'liberation_fund';
    distributionChannels: string[];
    accessLevel: 'public' | 'community_members' | 'supporters_only' | 'creator_circle';
    archivingPolicy: 'creator_controlled' | 'community_preserved' | 'liberation_archive';
    remixPermissions: 'allowed_with_attribution' | 'community_commons' | 'creator_approval_required';
}
export interface LiberationMetrics {
    totalCreators: number;
    activeCreators30Days: number;
    avgCreatorRevenueShare: number;
    totalContentPieces: number;
    liberationValidatedContent: number;
    communityEmpowermentScore: number;
    mutualAidFacilitated: number;
    organizingActionsSupported: number;
    antiOppressionResistance: number;
    democraticParticipationRate: number;
    creatorSovereigntyMaintained: number;
    collectiveLiberationProgress: number;
}
export interface CreatorAnalytics {
    creatorId: string;
    totalContent: number;
    liberationValidatedPieces: number;
    avgLiberationScore: number;
    revenueGeneratedTotal: number;
    revenueShareReceived: number;
    communityImpactScore: number;
    empowermentContributions: number;
    mutualAidSupported: number;
    organizingActivitiesCreated: number;
    sovereigntyMaintenanceRate: number;
    democraticParticipationLevel: number;
}
export declare class LiberationDataService {
    private supabase;
    private governance;
    constructor(supabase: SupabaseClient, governance: CommunityGovernanceService);
    /**
     * Store creator content with mandatory liberation validation and 75% revenue sovereignty
     */
    storeCreatorContent(content: CreatorContent): Promise<{
        contentId: string;
        governanceDecisionId: string;
        liberationScore: number;
    }>;
    /**
     * Validate creator revenue share compliance and sovereignty
     */
    validateCreatorRevenueSovereignty(creatorId: string, proposedRevenueShare: RevenueSharing): Promise<{
        compliant: boolean;
        issues: string[];
    }>;
    /**
     * Calculate comprehensive liberation metrics for the community
     */
    calculateCommunityLiberationMetrics(): Promise<LiberationMetrics>;
    /**
     * Get creator analytics with liberation and sovereignty focus
     */
    getCreatorAnalytics(creatorId: string): Promise<CreatorAnalytics>;
    /**
     * Enforce liberation principles across all data operations
     */
    enforceLiberationPrinciples(operation: DataOperation): Promise<{
        validated: boolean;
        score: number;
        issues: string[];
    }>;
    private validateLiberationPrinciplesCompleteness;
    private calculateComprehensiveLiberationScore;
    private storeCommunityImpactMetrics;
    private updateCreatorAnalytics;
    private createLiberationAuditTrail;
    private calculateAverageCreatorRevenue;
    private calculateCommunityEmpowermentScore;
    private calculateMutualAidMetrics;
    private calculateOrganizingMetrics;
    private calculateAntiOppressionMetrics;
    private calculateDemocracyMetrics;
    private calculateSovereigntyMetrics;
    private calculateCollectiveLiberationProgress;
    private storeLiberationMetricsSnapshot;
    private calculateCreatorCommunityImpact;
    private calculateCreatorMutualAidContribution;
    private calculateCreatorOrganizingContribution;
    private calculateCreatorDemocracyContribution;
    private estimateCreatorRevenue;
    private getDefaultCreatorAnalytics;
    private getCommunityId;
}
export default LiberationDataService;
//# sourceMappingURL=LiberationDataService.d.ts.map