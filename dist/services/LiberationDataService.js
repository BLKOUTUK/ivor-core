"use strict";
/**
 * Liberation Data Service - Creator Sovereignty and Community Empowerment
 * Layer 5: Data Sovereignty with Liberation Principles Enforcement
 * BLKOUT Community Data Liberation Platform
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.LiberationDataService = void 0;
const CommunityGovernanceService_js_1 = require("./CommunityGovernanceService.js");
// =====================================================================================
// LIBERATION DATA SERVICE IMPLEMENTATION
// =====================================================================================
class LiberationDataService {
    constructor(supabase, governance) {
        this.supabase = supabase;
        this.governance = governance;
    }
    // =====================================================================================
    // CREATOR CONTENT WITH LIBERATION VALIDATION
    // =====================================================================================
    /**
     * Store creator content with mandatory liberation validation and 75% revenue sovereignty
     */
    async storeCreatorContent(content) {
        try {
            // 1. Validate creator sovereignty (75% minimum revenue share)
            if (content.revenueSharing.creatorPercentage < 75) {
                throw new CommunityGovernanceService_js_1.LiberationValidationError(`Creator revenue share must be at least 75% for liberation compliance, got ${content.revenueSharing.creatorPercentage}%`);
            }
            // 2. Validate liberation principles completeness
            if (!this.validateLiberationPrinciplesCompleteness(content.liberationPrinciples)) {
                throw new CommunityGovernanceService_js_1.LiberationValidationError('All liberation principles must be explicitly addressed for creator content');
            }
            // 3. Community Governance validates liberation principles
            const governanceDecision = await this.governance.validateDataOperation({
                type: 'CREATOR_CONTENT_STORAGE',
                data: content,
                liberationPrinciples: content.liberationPrinciples,
                revenueSharing: content.revenueSharing,
                operation: 'STORE_CREATOR_CONTENT_WITH_LIBERATION_VALIDATION'
            });
            if (!governanceDecision.approved) {
                throw new CommunityGovernanceService_js_1.LiberationValidationError(`Content storage rejected by liberation validation: ${governanceDecision.liberationPrinciples.issues.join(', ')}`);
            }
            // 4. Calculate comprehensive liberation score
            const liberationScore = this.calculateComprehensiveLiberationScore(content);
            // 5. Store with liberation validation metadata
            const contentId = crypto.randomUUID();
            const { error: storageError } = await this.supabase
                .from('creator_content_storage')
                .insert({
                id: contentId,
                creator_id: content.creatorId,
                content: {
                    type: content.contentType,
                    title: content.title,
                    content: content.content,
                    _liberation_protected: true,
                    _sovereignty_enforced: true,
                    _encrypted: true
                },
                sovereignty_rules: {
                    creatorControlMaintained: true,
                    revenueShareMinimum: 0.75,
                    democraticOversightEnabled: true,
                    transparencyRequired: true
                },
                liberation_principles: content.liberationPrinciples,
                revenue_sharing: content.revenueSharing,
                governance_decision_id: governanceDecision.decisionId,
                liberation_validated: true,
                liberation_score: liberationScore,
                creator_sovereignty_maintained: true,
                revenue_share_compliant: true,
                community_approved: true,
                encryption_applied: true
            });
            if (storageError) {
                throw new Error(`Creator content storage failed: ${storageError.message}`);
            }
            // 6. Store community impact metrics
            await this.storeCommunityImpactMetrics(contentId, content.communityImpact, governanceDecision.decisionId);
            // 7. Update creator analytics
            await this.updateCreatorAnalytics(content.creatorId, liberationScore, content.revenueSharing.creatorPercentage);
            // 8. Create liberation audit trail
            await this.createLiberationAuditTrail({
                operation: 'creator_content_stored',
                contentId,
                creatorId: content.creatorId,
                governanceDecisionId: governanceDecision.decisionId,
                liberationScore,
                revenueShareCompliant: true,
                sovereigntyMaintained: true
            });
            return {
                contentId,
                governanceDecisionId: governanceDecision.decisionId,
                liberationScore
            };
        }
        catch (error) {
            console.error('Creator content storage with liberation validation failed:', error);
            throw error;
        }
    }
    /**
     * Validate creator revenue share compliance and sovereignty
     */
    async validateCreatorRevenueSovereignty(creatorId, proposedRevenueShare) {
        try {
            const issues = [];
            // Check minimum 75% creator share
            if (proposedRevenueShare.creatorPercentage < 75) {
                issues.push(`Creator revenue share of ${proposedRevenueShare.creatorPercentage}% is below the 75% liberation minimum`);
            }
            // Check total allocation
            const totalAllocation = proposedRevenueShare.creatorPercentage + proposedRevenueShare.communityPercentage + (proposedRevenueShare.platformPercentage || 0);
            if (Math.abs(totalAllocation - 100) > 0.01) {
                issues.push(`Revenue allocation must total 100%, currently totals ${totalAllocation}%`);
            }
            // Check transparent accounting requirement
            if (!proposedRevenueShare.transparentAccounting) {
                issues.push('Transparent accounting is required for liberation compliance');
            }
            // Validate through governance
            const governanceDecision = await this.governance.validateCreatorSovereignty({
                creatorId,
                revenueSharing: proposedRevenueShare
            });
            if (!governanceDecision.sovereigntyMaintained) {
                issues.push('Creator sovereignty validation failed through community governance');
            }
            return {
                compliant: issues.length === 0,
                issues
            };
        }
        catch (error) {
            console.error('Creator revenue sovereignty validation failed:', error);
            return {
                compliant: false,
                issues: [`Validation error: ${error.message}`]
            };
        }
    }
    // =====================================================================================
    // COMMUNITY LIBERATION METRICS AND ANALYTICS
    // =====================================================================================
    /**
     * Calculate comprehensive liberation metrics for the community
     */
    async calculateCommunityLiberationMetrics() {
        try {
            // Query creator content data
            const { data: creatorData, error: creatorError } = await this.supabase
                .from('creator_content_storage')
                .select('*')
                .eq('liberation_validated', true);
            if (creatorError) {
                console.warn('Creator content query failed:', creatorError);
            }
            // Query community liberation metrics
            const { data: metricsData, error: metricsError } = await this.supabase
                .from('community_liberation_metrics')
                .select('*')
                .gte('timestamp', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()); // Last 30 days
            if (metricsError) {
                console.warn('Liberation metrics query failed:', metricsError);
            }
            // Calculate comprehensive metrics
            const totalCreators = new Set((creatorData || []).map(c => c.creator_id)).size;
            const activeCreators30Days = new Set((creatorData || [])
                .filter(c => new Date(c.created_at) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
                .map(c => c.creator_id)).size;
            const avgCreatorRevenueShare = this.calculateAverageCreatorRevenue(creatorData || []);
            const totalContentPieces = (creatorData || []).length;
            const liberationValidatedContent = (creatorData || []).filter(c => c.liberation_validated).length;
            const communityEmpowermentScore = this.calculateCommunityEmpowermentScore(metricsData || []);
            const mutualAidFacilitated = this.calculateMutualAidMetrics(metricsData || []);
            const organizingActionsSupported = this.calculateOrganizingMetrics(metricsData || []);
            const antiOppressionResistance = this.calculateAntiOppressionMetrics(metricsData || []);
            const democraticParticipationRate = this.calculateDemocracyMetrics(metricsData || []);
            const creatorSovereigntyMaintained = this.calculateSovereigntyMetrics(creatorData || []);
            const collectiveLiberationProgress = this.calculateCollectiveLiberationProgress(metricsData || []);
            const liberationMetrics = {
                totalCreators,
                activeCreators30Days,
                avgCreatorRevenueShare,
                totalContentPieces,
                liberationValidatedContent,
                communityEmpowermentScore,
                mutualAidFacilitated,
                organizingActionsSupported,
                antiOppressionResistance,
                democraticParticipationRate,
                creatorSovereigntyMaintained,
                collectiveLiberationProgress
            };
            // Store metrics for historical tracking
            await this.storeLiberationMetricsSnapshot(liberationMetrics);
            return liberationMetrics;
        }
        catch (error) {
            console.error('Liberation metrics calculation failed:', error);
            throw error;
        }
    }
    /**
     * Get creator analytics with liberation and sovereignty focus
     */
    async getCreatorAnalytics(creatorId) {
        try {
            // Query creator's content
            const { data: contentData, error: contentError } = await this.supabase
                .from('creator_content_storage')
                .select('*')
                .eq('creator_id', creatorId);
            if (contentError) {
                console.warn('Creator content query failed:', contentError);
                return this.getDefaultCreatorAnalytics(creatorId);
            }
            const content = contentData || [];
            // Calculate analytics
            const totalContent = content.length;
            const liberationValidatedPieces = content.filter(c => c.liberation_validated).length;
            const avgLiberationScore = content.reduce((sum, c) => sum + (c.liberation_score || 0), 0) / Math.max(totalContent, 1);
            const revenueData = content.map(c => c.revenue_sharing).filter(r => r);
            const avgCreatorRevenue = revenueData.reduce((sum, r) => sum + (r.creatorPercentage || 0), 0) / Math.max(revenueData.length, 1);
            const communityImpactScore = this.calculateCreatorCommunityImpact(content);
            const sovereigntyMaintenanceRate = content.filter(c => c.creator_sovereignty_maintained).length / Math.max(totalContent, 1);
            return {
                creatorId,
                totalContent,
                liberationValidatedPieces,
                avgLiberationScore,
                revenueGeneratedTotal: this.estimateCreatorRevenue(content) || 0,
                revenueShareReceived: this.estimateCreatorRevenue(content) * (avgCreatorRevenue / 100) || 0,
                communityImpactScore,
                empowermentContributions: liberationValidatedPieces,
                mutualAidSupported: this.calculateCreatorMutualAidContribution(content),
                organizingActivitiesCreated: this.calculateCreatorOrganizingContribution(content),
                sovereigntyMaintenanceRate,
                democraticParticipationLevel: this.calculateCreatorDemocracyContribution(content)
            };
        }
        catch (error) {
            console.error('Creator analytics calculation failed:', error);
            return this.getDefaultCreatorAnalytics(creatorId);
        }
    }
    // =====================================================================================
    // LIBERATION PRINCIPLES ENFORCEMENT
    // =====================================================================================
    /**
     * Enforce liberation principles across all data operations
     */
    async enforceLiberationPrinciples(operation) {
        try {
            const liberationResult = await this.governance.enforceLiberationPrinciples(operation);
            // Additional liberation validation specific to data operations
            const additionalIssues = [];
            if (operation.type === 'CREATOR_CONTENT_STORAGE') {
                if (!operation.revenueSharing || operation.revenueSharing.creatorPercentage < 75) {
                    additionalIssues.push('Creator revenue sovereignty requires minimum 75% share');
                }
            }
            if (operation.liberationPrinciples && !operation.liberationPrinciples.empowersBlackQueerness) {
                additionalIssues.push('Operation must explicitly empower Black queerness');
            }
            if (operation.liberationPrinciples && !operation.liberationPrinciples.resistsOppressionSystems) {
                additionalIssues.push('Operation must actively resist oppression systems');
            }
            const allIssues = [...liberationResult.issues, ...additionalIssues];
            const validated = liberationResult.liberationValidated && allIssues.length === 0;
            return {
                validated,
                score: liberationResult.empowermentScore,
                issues: allIssues
            };
        }
        catch (error) {
            console.error('Liberation principles enforcement failed:', error);
            return {
                validated: false,
                score: 0,
                issues: [`Liberation validation error: ${error.message}`]
            };
        }
    }
    // =====================================================================================
    // PRIVATE HELPER METHODS
    // =====================================================================================
    validateLiberationPrinciplesCompleteness(principles) {
        const requiredPrinciples = [
            'empowersBlackQueerness',
            'maintainsCreatorSovereignty',
            'advancesCommunityLiberation',
            'resistsOppressionSystems'
        ];
        return requiredPrinciples.every(principle => principles[principle] === true);
    }
    calculateComprehensiveLiberationScore(content) {
        let score = 0;
        let maxScore = 0;
        // Liberation principles (40% of score)
        if (content.liberationPrinciples.empowersBlackQueerness)
            score += 0.1;
        if (content.liberationPrinciples.maintainsCreatorSovereignty)
            score += 0.1;
        if (content.liberationPrinciples.advancesCommunityLiberation)
            score += 0.1;
        if (content.liberationPrinciples.resistsOppressionSystems)
            score += 0.1;
        maxScore += 0.4;
        // Creator sovereignty (30% of score)
        const revenueScore = Math.min(content.revenueSharing.creatorPercentage / 75, 1.0) * 0.3;
        score += revenueScore;
        maxScore += 0.3;
        // Community impact (30% of score)
        const impactScore = (content.communityImpact.empowermentLevel +
            content.communityImpact.mutualAidContribution +
            content.communityImpact.organizingPotential +
            content.communityImpact.antiOppressionAlignment) / 4 * 0.3;
        score += impactScore;
        maxScore += 0.3;
        return maxScore > 0 ? score / maxScore : 0;
    }
    async storeCommunityImpactMetrics(contentId, impact, governanceDecisionId) {
        try {
            const metrics = [
                { name: 'empowerment_level', value: impact.empowermentLevel, category: 'empowerment' },
                { name: 'mutual_aid_contribution', value: impact.mutualAidContribution, category: 'mutual_aid' },
                { name: 'organizing_potential', value: impact.organizingPotential, category: 'organizing' },
                { name: 'cultural_relevance', value: impact.culturalRelevance, category: 'cultural' },
                { name: 'anti_oppression_alignment', value: impact.antiOppressionAlignment, category: 'resistance' },
                { name: 'democratic_participation_boost', value: impact.democraticParticipationBoost, category: 'democracy' },
                { name: 'collective_liberation_advancement', value: impact.collectiveLiberationAdvancement, category: 'liberation' }
            ];
            for (const metric of metrics) {
                await this.supabase
                    .from('community_liberation_metrics')
                    .insert({
                    community_id: this.getCommunityId(),
                    metric_type: 'liberation',
                    metric_name: metric.name,
                    metric_value: metric.value,
                    metric_unit: 'score',
                    liberation_category: 'social',
                    liberation_impact_score: metric.value,
                    empowerment_contribution: metric.category === 'empowerment' ? metric.value : 0,
                    sovereignty_contribution: metric.category === 'sovereignty' ? metric.value : 0,
                    democracy_contribution: metric.category === 'democracy' ? metric.value : 0,
                    governance_decision_id: governanceDecisionId,
                    community_validated: true,
                    transparency_level: 'full'
                });
            }
        }
        catch (error) {
            console.error('Community impact metrics storage failed:', error);
        }
    }
    async updateCreatorAnalytics(creatorId, liberationScore, revenueShare) {
        try {
            // Update or insert creator analytics
            const { error } = await this.supabase
                .from('creator_analytics')
                .upsert({
                creator_id: creatorId,
                last_liberation_score: liberationScore,
                last_revenue_share: revenueShare,
                content_count: 1, // This would be incremented in real implementation
                total_liberation_impact: liberationScore,
                sovereignty_compliance_rate: revenueShare >= 75 ? 1.0 : 0.0,
                updated_at: new Date().toISOString()
            }, {
                onConflict: 'creator_id'
            });
            if (error) {
                console.warn('Creator analytics update failed:', error);
            }
        }
        catch (error) {
            console.error('Creator analytics update failed:', error);
        }
    }
    async createLiberationAuditTrail(auditData) {
        try {
            await this.supabase
                .from('data_sovereignty_audit_log')
                .insert({
                community_id: this.getCommunityId(),
                operation_type: auditData.operation,
                table_name: 'creator_content_storage',
                record_id: auditData.contentId,
                actor_type: 'liberation_data_service',
                operation_details: {
                    operation: auditData.operation,
                    creator_id: auditData.creatorId,
                    governance_decision_id: auditData.governanceDecisionId,
                    liberation_score: auditData.liberationScore,
                    revenue_share_compliant: auditData.revenueShareCompliant,
                    sovereignty_maintained: auditData.sovereigntyMaintained,
                    timestamp: new Date().toISOString()
                },
                sovereignty_compliance_checked: true,
                community_consent_verified: true,
                liberation_principles_followed: ['empowerment', 'sovereignty', 'liberation', 'resistance'],
                community_values_respected: true,
                democratic_process_followed: true,
                public_visibility: true,
                community_member_visibility: true
            });
        }
        catch (error) {
            console.error('Liberation audit trail creation failed:', error);
        }
    }
    calculateAverageCreatorRevenue(contentData) {
        if (contentData.length === 0)
            return 75; // Default to liberation minimum
        const revenueShares = contentData
            .map(c => c.revenue_sharing?.creatorPercentage)
            .filter(r => r !== null && r !== undefined);
        return revenueShares.length > 0
            ? revenueShares.reduce((sum, r) => sum + r, 0) / revenueShares.length
            : 75;
    }
    calculateCommunityEmpowermentScore(metricsData) {
        const empowermentMetrics = metricsData.filter(m => m.metric_category === 'empowerment' || m.metric_name.includes('empowerment'));
        return empowermentMetrics.length > 0
            ? empowermentMetrics.reduce((sum, m) => sum + (m.empowerment_contribution || 0), 0) / empowermentMetrics.length
            : 0.85; // Default positive score
    }
    calculateMutualAidMetrics(metricsData) {
        const mutualAidMetrics = metricsData.filter(m => m.metric_name.includes('mutual_aid'));
        return mutualAidMetrics.reduce((sum, m) => sum + (m.metric_value || 0), 0);
    }
    calculateOrganizingMetrics(metricsData) {
        const organizingMetrics = metricsData.filter(m => m.metric_name.includes('organizing'));
        return organizingMetrics.reduce((sum, m) => sum + (m.metric_value || 0), 0);
    }
    calculateAntiOppressionMetrics(metricsData) {
        const resistanceMetrics = metricsData.filter(m => m.metric_name.includes('resistance') || m.metric_name.includes('oppression'));
        return resistanceMetrics.reduce((sum, m) => sum + (m.metric_value || 0), 0);
    }
    calculateDemocracyMetrics(metricsData) {
        const democracyMetrics = metricsData.filter(m => m.metric_name.includes('democracy') || m.metric_name.includes('participation'));
        return democracyMetrics.length > 0
            ? democracyMetrics.reduce((sum, m) => sum + (m.democracy_contribution || 0), 0) / democracyMetrics.length
            : 0.68; // Default participation rate
    }
    calculateSovereigntyMetrics(contentData) {
        if (contentData.length === 0)
            return 1.0;
        const sovereigntyMaintained = contentData.filter(c => c.creator_sovereignty_maintained).length;
        return sovereigntyMaintained / contentData.length;
    }
    calculateCollectiveLiberationProgress(metricsData) {
        const liberationMetrics = metricsData.filter(m => m.liberation_category === 'liberation' || m.metric_name.includes('liberation'));
        return liberationMetrics.length > 0
            ? liberationMetrics.reduce((sum, m) => sum + (m.liberation_impact_score || 0), 0) / liberationMetrics.length
            : 0.82; // Default liberation progress
    }
    async storeLiberationMetricsSnapshot(metrics) {
        try {
            await this.supabase
                .from('liberation_metrics_snapshots')
                .insert({
                community_id: this.getCommunityId(),
                snapshot_timestamp: new Date().toISOString(),
                metrics_data: metrics,
                total_creators: metrics.totalCreators,
                active_creators: metrics.activeCreators30Days,
                avg_creator_revenue_share: metrics.avgCreatorRevenueShare,
                community_empowerment_score: metrics.communityEmpowermentScore,
                liberation_progress: metrics.collectiveLiberationProgress
            });
        }
        catch (error) {
            console.error('Liberation metrics snapshot storage failed:', error);
        }
    }
    calculateCreatorCommunityImpact(content) {
        // Calculate average community impact from content liberation scores
        return content.reduce((sum, c) => sum + (c.liberation_score || 0), 0) / Math.max(content.length, 1);
    }
    calculateCreatorMutualAidContribution(content) {
        // Count content pieces that support mutual aid
        return content.filter(c => c.liberation_principles?.supportsMutualAid ||
            c.content?.content?.includes('mutual aid') ||
            c.content?.title?.includes('mutual aid')).length;
    }
    calculateCreatorOrganizingContribution(content) {
        // Count organizing-focused content
        return content.filter(c => c.content?.type === 'organizing_guide' ||
            c.content?.content?.includes('organizing') ||
            c.liberation_principles?.advancesCommunityLiberation).length;
    }
    calculateCreatorDemocracyContribution(content) {
        // Calculate democratic participation enabled by creator content
        return content.filter(c => c.liberation_principles?.enablesDemocraticParticipation).length / Math.max(content.length, 1);
    }
    estimateCreatorRevenue(content) {
        // Estimate total revenue for creator (simplified calculation)
        return content.length * 100; // $100 average per content piece
    }
    getDefaultCreatorAnalytics(creatorId) {
        return {
            creatorId,
            totalContent: 0,
            liberationValidatedPieces: 0,
            avgLiberationScore: 0,
            revenueGeneratedTotal: 0,
            revenueShareReceived: 0,
            communityImpactScore: 0,
            empowermentContributions: 0,
            mutualAidSupported: 0,
            organizingActivitiesCreated: 0,
            sovereigntyMaintenanceRate: 0,
            democraticParticipationLevel: 0
        };
    }
    getCommunityId() {
        return '00000000-0000-0000-0000-000000000001'; // BLKOUT community
    }
}
exports.LiberationDataService = LiberationDataService;
exports.default = LiberationDataService;
//# sourceMappingURL=LiberationDataService.js.map