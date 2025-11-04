/**
 * Layer 4: Community Data Sovereignty - Interface Contracts
 * BLKOUT Community Data Liberation Platform
 * 
 * CRITICAL: This file defines ONLY Layer 4 boundaries and contracts.
 * Layer 4 is responsible EXCLUSIVELY for:
 * - Community data storage and retrieval with sovereignty protection
 * - Database schema management and community-controlled evolution
 * - Data backup and recovery with community ownership principles
 * - Community data analytics and liberation metrics storage  
 * - Democratic data governance and transparency implementation
 */

// =====================================================================================
// LAYER 4 CORE TYPES AND INTERFACES
// =====================================================================================

/**
 * Community sovereignty levels defining data control and governance requirements
 */
export type SovereigntyLevel = 'full' | 'partial' | 'shared' | 'external';

/**
 * Democratic governance models for community data decisions
 */
export type GovernanceModel = 'democratic' | 'consensus' | 'delegated' | 'cooperative';

/**
 * Data sovereignty compliance status
 */
export interface SovereigntyCompliance {
  compliant: boolean;
  sovereignty_level: SovereigntyLevel;
  governance_approval: boolean;
  community_consent: boolean;
  encryption_enabled: boolean;
  audit_trail_complete: boolean;
  violations: string[];
  last_verified: Date;
}

/**
 * Community data permissions with democratic oversight
 */
export interface DataPermissions {
  community_id: string;
  member_access_level: 'admin' | 'member' | 'visitor' | 'anonymous';
  data_categories_allowed: string[];
  sovereignty_override: boolean;
  governance_decision_id?: string;
  expiry_date?: Date;
  liberation_principles_adherence: boolean;
}

/**
 * Community ownership validation result
 */
export interface OwnershipStatus {
  is_owner: boolean;
  ownership_type: 'individual' | 'collective' | 'community' | 'cooperative';
  governance_approval_required: boolean;
  democratic_oversight_active: boolean;
  community_consent_verified: boolean;
  liberation_values_respected: boolean;
}

/**
 * Community governance decision for data operations
 */
export interface GovernanceCompliance {
  decision_required: boolean;
  decision_id?: string;
  voting_complete: boolean;
  community_approval: boolean;
  quorum_met: boolean;
  democratic_process_followed: boolean;
  transparency_maintained: boolean;
  values_alignment: boolean;
}

// =====================================================================================
// DATA SOVEREIGNTY INTERFACE (Layer 4 → Layer 3)
// =====================================================================================

/**
 * Primary interface that Layer 4 provides to Layer 3 Business Logic Services
 * Handles community data with full sovereignty protection and democratic governance
 */
export interface DataSovereigntyInterface {
  /**
   * Store community data with sovereignty protection and democratic oversight
   * @param data Community data to store
   * @param sovereignty_rules Community-defined sovereignty requirements
   * @param governance_approval Community governance decision if required
   * @returns Promise<StorageResult> Storage confirmation with sovereignty compliance
   */
  storeCommunityData(
    data: CommunityData,
    sovereignty_rules: SovereigntyRules,
    governance_approval?: GovernanceDecision
  ): Promise<StorageResult>;

  /**
   * Retrieve community data with permission validation and sovereignty compliance
   * @param query Data retrieval query with community context
   * @param permissions Community-validated data access permissions
   * @returns Promise<CommunityData> Retrieved data with sovereignty metadata
   */
  retrieveWithPermissions(
    query: CommunityQuery,
    permissions: DataPermissions
  ): Promise<CommunityData>;

  /**
   * Enforce data sovereignty compliance for all operations
   * @param operation Proposed data operation
   * @returns Promise<SovereigntyCompliance> Compliance validation result
   */
  enforceDataSovereignty(operation: DataOperation): Promise<SovereigntyCompliance>;

  /**
   * Execute community-approved backup operations with democratic oversight
   * @param backup_config Community-approved backup configuration
   * @returns Promise<BackupResult> Backup operation result with community verification
   */
  executeBackupWithCommunityApproval(
    backup_config: CommunityBackupConfig
  ): Promise<BackupResult>;

  /**
   * Retrieve liberation metrics and community analytics with transparency
   * @param community_id Community identifier
   * @param metrics_query Analytics query parameters
   * @returns Promise<LiberationMetrics> Community analytics with sovereignty metadata
   */
  getLiberationMetrics(
    community_id: string,
    metrics_query: MetricsQuery
  ): Promise<LiberationMetrics>;

  /**
   * Validate democratic governance requirements for data operations
   * @param operation Data operation requiring governance validation
   * @param community_context Community governance context
   * @returns Promise<GovernanceCompliance> Democratic process validation result
   */
  validateDemocraticGovernance(
    operation: DataOperation,
    community_context: CommunityGovernanceContext
  ): Promise<GovernanceCompliance>;
}

// =====================================================================================
// BUSINESS LOGIC INTERFACE (Layer 3 → Layer 4)
// =====================================================================================

/**
 * Interface that Layer 4 expects from Layer 3 Business Logic Services
 * Provides community ownership validation and governance decision application
 */
export interface BusinessLogicInterface {
  /**
   * Validate community ownership and member permissions for data operations
   * @param member_id Community member identifier
   * @param data_id Data resource identifier
   * @param operation_type Type of data operation requested
   * @returns Promise<OwnershipStatus> Community ownership validation result
   */
  validateCommunityOwnership(
    member_id: string,
    data_id: string,
    operation_type: DataOperationType
  ): Promise<OwnershipStatus>;

  /**
   * Apply community governance decisions to data operations
   * @param data Community data to validate
   * @param governance_context Current governance decision context
   * @returns Promise<GovernanceCompliance> Governance compliance validation
   */
  applyCommunityGovernance(
    data: CommunityData,
    governance_context: CommunityGovernanceContext
  ): Promise<GovernanceCompliance>;

  /**
   * Validate liberation principles adherence in data operations
   * @param operation Data operation to validate
   * @param community_values Community-defined liberation values
   * @returns Promise<LiberationCompliance> Liberation principles validation result
   */
  validateLiberationPrinciples(
    operation: DataOperation,
    community_values: CommunityValues
  ): Promise<LiberationCompliance>;

  /**
   * Calculate liberation impact scores for community analytics
   * @param data_operation Completed data operation
   * @param community_context Community context for impact assessment
   * @returns Promise<LiberationImpactScore> Liberation impact measurement
   */
  calculateLiberationImpact(
    data_operation: CompletedDataOperation,
    community_context: CommunityContext
  ): Promise<LiberationImpactScore>;
}

// =====================================================================================
// CORE DATA TYPES AND STRUCTURES
// =====================================================================================

/**
 * Community data with sovereignty and liberation metadata
 */
export interface CommunityData {
  id: string;
  community_id: string;
  data_type: string;
  content: Record<string, any>;
  
  // Sovereignty metadata
  sovereignty_level: SovereigntyLevel;
  encryption_enabled: boolean;
  community_owned: boolean;
  governance_approved: boolean;
  
  // Liberation principles tracking
  liberation_impact_score: number; // 0.0 to 1.0
  community_empowerment_level: number; // 0.0 to 1.0
  democratic_participation_enabled: boolean;
  values_alignment_verified: boolean;
  
  // Temporal tracking
  created_at: Date;
  updated_at: Date;
  community_last_reviewed: Date;
  
  // Audit metadata
  audit_trail: AuditEntry[];
  transparency_level: 'full' | 'summary' | 'private';
}

/**
 * Community-defined sovereignty rules for data operations
 */
export interface SovereigntyRules {
  community_id: string;
  encryption_required: boolean;
  local_storage_only: boolean;
  community_approval_required: boolean;
  third_party_sharing_prohibited: boolean;
  retention_period_days: number;
  deletion_policy: 'community_controlled' | 'automatic' | 'never';
  governance_oversight_required: boolean;
  liberation_principles_enforcement: boolean;
}

/**
 * Data operation with community context and sovereignty requirements
 */
export interface DataOperation {
  operation_id: string;
  operation_type: DataOperationType;
  community_id: string;
  data_category: string;
  sovereignty_required: boolean;
  governance_approval_needed: boolean;
  liberation_impact_expected: number;
  community_consent_verified: boolean;
  democratic_oversight_enabled: boolean;
  timestamp: Date;
}

/**
 * Types of data operations requiring sovereignty validation
 */
export type DataOperationType = 
  | 'create' | 'read' | 'update' | 'delete'
  | 'backup' | 'restore' | 'export' | 'share'
  | 'migrate' | 'replicate' | 'archive' | 'analyze';

/**
 * Community query with sovereignty and permission context
 */
export interface CommunityQuery {
  community_id: string;
  query_type: 'select' | 'aggregate' | 'analytics' | 'liberation_metrics';
  data_categories: string[];
  sovereignty_compliance_required: boolean;
  governance_approval_verified: boolean;
  member_permissions: DataPermissions;
  transparency_level_requested: 'full' | 'summary' | 'private';
  liberation_focus: boolean;
}

/**
 * Storage result with sovereignty compliance verification
 */
export interface StorageResult {
  success: boolean;
  data_id: string;
  community_id: string;
  sovereignty_compliant: boolean;
  governance_approved: boolean;
  encryption_applied: boolean;
  audit_trail_created: boolean;
  liberation_impact_recorded: boolean;
  storage_location: string;
  community_notification_sent: boolean;
  errors: string[];
}

/**
 * Community backup configuration with democratic oversight
 */
export interface CommunityBackupConfig {
  community_id: string;
  backup_type: 'full' | 'incremental' | 'schema_only' | 'data_only';
  community_approved: boolean;
  governance_decision_id: string;
  sovereignty_compliant: boolean;
  encryption_enabled: boolean;
  retention_days: number;
  multi_region_replication: boolean;
  democratic_oversight_required: boolean;
  transparency_level: 'full' | 'summary' | 'private';
}

/**
 * Backup operation result with community verification
 */
export interface BackupResult {
  backup_id: string;
  community_id: string;
  status: 'completed' | 'failed' | 'partial';
  sovereignty_maintained: boolean;
  community_verified: boolean;
  governance_compliant: boolean;
  data_integrity_verified: boolean;
  liberation_principles_followed: boolean;
  backup_size_bytes: number;
  verification_checksum: string;
  community_notification_sent: boolean;
  transparency_report_available: boolean;
  errors: string[];
}

/**
 * Liberation metrics for community analytics and empowerment tracking
 */
export interface LiberationMetrics {
  community_id: string;
  measurement_period: string;
  
  // Core liberation indicators
  liberation_impact_score: number; // 0.0 to 1.0
  community_empowerment_level: number; // 0.0 to 1.0
  democratic_participation_rate: number; // 0.0 to 1.0
  
  // Data sovereignty metrics
  sovereignty_compliance_rate: number;
  community_controlled_data_percentage: number;
  democratic_decisions_count: number;
  governance_participation_count: number;
  
  // Community engagement
  active_members_count: number;
  collaborative_contributions: number;
  mutual_aid_interactions: number;
  
  // Values alignment
  cooperative_ownership_adherence: number;
  anti_oppression_measures_active: number;
  transparency_score: number;
  
  // Technical empowerment
  community_controlled_infrastructure_percentage: number;
  data_portability_enabled: boolean;
  encryption_coverage_percentage: number;
  
  timestamp: Date;
  transparency_level: 'full' | 'summary';
}

/**
 * Analytics query for liberation metrics with community context
 */
export interface MetricsQuery {
  community_id: string;
  time_range: TimeRange;
  metric_categories: string[];
  aggregation_level: 'hourly' | 'daily' | 'weekly' | 'monthly';
  include_liberation_impact: boolean;
  include_sovereignty_metrics: boolean;
  include_democratic_participation: boolean;
  transparency_level: 'full' | 'summary' | 'private';
}

/**
 * Time range for analytics queries
 */
export interface TimeRange {
  start_date: Date;
  end_date: Date;
  timezone?: string;
}

/**
 * Community governance context for democratic decision-making
 */
export interface CommunityGovernanceContext {
  community_id: string;
  governance_model: GovernanceModel;
  active_members_count: number;
  quorum_percentage: number;
  voting_threshold: number;
  decision_timeframe_hours: number;
  current_decisions: GovernanceDecision[];
  liberation_principles_active: boolean;
  democratic_oversight_enabled: boolean;
}

/**
 * Democratic governance decision with community participation
 */
export interface GovernanceDecision {
  decision_id: string;
  community_id: string;
  proposal_title: string;
  decision_type: string;
  voting_status: 'open' | 'closed' | 'implemented';
  votes_for: number;
  votes_against: number;
  votes_abstain: number;
  quorum_met: boolean;
  community_approved: boolean;
  liberation_principles_considered: boolean;
  transparency_maintained: boolean;
  created_at: Date;
  voting_deadline: Date;
}

/**
 * Community values and liberation principles
 */
export interface CommunityValues {
  community_id: string;
  cooperative_ownership: boolean;
  democratic_governance: boolean;
  community_data_sovereignty: boolean;
  liberation_first_approach: boolean;
  mutual_aid_commitment: boolean;
  anti_oppression_practices: boolean;
  values_first_development: boolean;
  transparent_decision_making: boolean;
  collective_liberation_focus: boolean;
  updated_at: Date;
}

/**
 * Liberation principles compliance validation
 */
export interface LiberationCompliance {
  compliant: boolean;
  principles_followed: string[];
  principles_violated: string[];
  community_values_respected: boolean;
  democratic_process_followed: boolean;
  cooperative_ownership_maintained: boolean;
  anti_oppression_measures_active: boolean;
  mutual_aid_supported: boolean;
  transparency_maintained: boolean;
  collective_liberation_advanced: boolean;
  compliance_score: number; // 0.0 to 1.0
  last_validated: Date;
}

/**
 * Liberation impact score for community empowerment measurement
 */
export interface LiberationImpactScore {
  operation_id: string;
  community_id: string;
  impact_category: 'empowerment' | 'sovereignty' | 'democracy' | 'cooperation' | 'liberation';
  impact_score: number; // 0.0 to 1.0
  measurement_criteria: string[];
  community_feedback_included: boolean;
  democratic_validation: boolean;
  values_alignment_score: number; // 0.0 to 1.0
  calculated_at: Date;
  transparency_level: 'full' | 'summary';
}

/**
 * Completed data operation with impact assessment
 */
export interface CompletedDataOperation extends DataOperation {
  completion_status: 'success' | 'failed' | 'partial';
  sovereignty_maintained: boolean;
  governance_complied: boolean;
  community_notification_sent: boolean;
  liberation_impact_measured: boolean;
  democratic_oversight_completed: boolean;
  audit_trail_complete: boolean;
  completed_at: Date;
}

/**
 * Community context for liberation impact assessment
 */
export interface CommunityContext {
  community_id: string;
  community_name: string;
  governance_model: GovernanceModel;
  sovereignty_level: SovereigntyLevel;
  liberation_principles: CommunityValues;
  active_members_count: number;
  empowerment_goals: string[];
  current_challenges: string[];
  mutual_aid_active: boolean;
  democratic_participation_rate: number;
}

/**
 * Audit trail entry for transparency and accountability
 */
export interface AuditEntry {
  audit_id: string;
  operation_type: DataOperationType;
  actor_type: 'community_member' | 'system_process' | 'governance_decision';
  sovereignty_compliance_verified: boolean;
  community_consent_documented: boolean;
  liberation_principles_followed: boolean;
  democratic_oversight_completed: boolean;
  transparency_level: 'public' | 'community' | 'admin';
  timestamp: Date;
}

// =====================================================================================
// LAYER 4 BOUNDARY ENFORCEMENT
// =====================================================================================

/**
 * CRITICAL LAYER BOUNDARIES - DO NOT CROSS
 * 
 * ✅ Layer 4 OWNS (Data Sovereignty Layer):
 * - Community data storage and retrieval with sovereignty protection
 * - Database schema management and community-controlled evolution
 * - Data backup and recovery with community ownership principles  
 * - Community data analytics and liberation metrics storage
 * - Democratic data governance and transparency implementation
 * 
 * ❌ Layer 4 DOES NOT OWN:
 * - Business logic or data processing → Layer 3 Business Logic Services
 * - Community authentication or authorization → Layer 2 API Gateway  
 * - Data presentation or user interface → Layer 1 Presentation Layer
 * - Cross-service communication or orchestration → Layer 2 API Gateway
 * - Liberation policy decisions → Layer 3 Business Logic Services
 * - Infrastructure management → Layer 5 Infrastructure Services
 * 
 * COMMUNITY LIBERATION VALUES EMBEDDED:
 * ✅ Democratic governance required for all data decisions
 * ✅ Transparency through public audit logs and community dashboards
 * ✅ Community sovereignty through local control and democratic oversight  
 * ✅ Liberation metrics tracking for continuous community empowerment
 * ✅ Cooperative ownership reflected in governance structures
 * ✅ Mutual aid supported through community data sharing protocols
 * ✅ Anti-oppression measures through equitable access and protection
 */

// Export all interfaces for use by other layers
export * from './layer4-interface-contracts';