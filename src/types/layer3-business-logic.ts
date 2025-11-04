// Layer 3 Business Logic Services - Type Definitions
// Revolutionary Layer 3 Business Logic for Community Liberation Platform
// Perfect Separation of Concerns + Liberation Values Embedded

import { JourneyStage, JourneyContext, UKLocation } from './journey.js'

// =============================================================================
// LIBERATION VALUES FRAMEWORK - Core Types
// =============================================================================

export interface LiberationValues {
  creatorSovereignty: number // Must be >= 0.75 (75% minimum)
  antiOppressionValidation: boolean
  blackQueerEmpowerment: number // 0-1 score
  communityProtection: number // 0-1 score  
  culturalAuthenticity: number // 0-1 score
}

export interface LiberationValidationResult {
  isValid: boolean
  violations: LiberationValueViolation[]
  empowermentScore: number
  recommendations: string[]
}

export interface LiberationValueViolation {
  type: 'creator_sovereignty' | 'anti_oppression' | 'empowerment' | 'protection' | 'authenticity'
  severity: 'critical' | 'major' | 'minor'
  description: string
  remedy: string
}

// =============================================================================
// COMMUNITY BUSINESS LOGIC SERVICE - Types
// =============================================================================

export interface CommunityInteractionRule {
  id: string
  name: string
  description: string
  applicableJourneyStages: JourneyStage[]
  liberationRequirements: LiberationValues
  protectionMechanisms: string[]
  empowermentActions: string[]
}

export interface CommunityProtectionDecision {
  allow: boolean
  reasoning: string
  protectionMeasures: string[]
  empowermentOpportunities: string[]
  liberationImpact: number
}

export interface JourneyProgressionRule {
  fromStage: JourneyStage
  toStage: JourneyStage
  liberationCriteria: LiberationValues
  empowermentRequirements: string[]
  communityValidation: boolean
}

export interface DemocraticParticipationValidation {
  isValid: boolean
  participationScore: number
  empowermentLevel: number
  accessibilityMeasures: string[]
  liberationAlignment: number
}

// =============================================================================
// CREATOR BUSINESS LOGIC SERVICE - Types  
// =============================================================================

export interface CreatorSovereigntyCalculation {
  totalRevenue: number
  creatorShare: number
  creatorPercentage: number
  platformShare: number
  isCompliant: boolean // Must be >= 75% creator share
  violations: string[]
}

export interface CreatorAttributionRights {
  creatorId: string
  contentId: string
  attributionRequired: boolean
  narrativeControl: boolean
  modificationRights: 'full' | 'limited' | 'none'
  economicRights: CreatorSovereigntyCalculation
  culturalRights: string[]
}

export interface EconomicEmpowermentTracking {
  creatorId: string
  totalEarnings: number
  liberationImpact: number
  communityBenefit: number
  empowermentProgress: number
  sovereigntyViolations: string[]
}

// =============================================================================
// CONTENT BUSINESS LOGIC SERVICE - Types
// =============================================================================

export interface AntiOppressionValidation {
  contentId: string
  isValid: boolean
  oppressionIndicators: OppressionIndicator[]
  culturalAuthenticity: number
  communityConsent: boolean
  liberationAlignment: number
}

export interface OppressionIndicator {
  type: 'racism' | 'transphobia' | 'homophobia' | 'classism' | 'ableism' | 'sexism'
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  location: string
  remedy: string
}

export interface CulturalAuthenticityVerification {
  contentId: string
  authenticityScore: number
  culturalAppropriation: boolean
  communityVoices: boolean
  blackQueerRepresentation: number
  stereotypeAnalysis: string[]
}

export interface CommunityConsentValidation {
  contentId: string
  consentObtained: boolean
  communityImpact: number
  vulnerabilityAssessment: string[]
  protectionMeasures: string[]
}

// =============================================================================
// LIBERATION IMPACT BUSINESS LOGIC SERVICE - Types
// =============================================================================

export interface LiberationImpactMeasurement {
  contentId?: string
  communityId?: string
  creatorId?: string
  overall: {
    empowermentScore: number
    liberationProgress: number
    communityBenefit: number
    antiOppressionEffectiveness: number
  }
  dimensions: {
    economic: number
    social: number
    political: number
    cultural: number
    spiritual: number
  }
  outcomes: LiberationOutcome[]
}

export interface LiberationOutcome {
  type: 'economic_empowerment' | 'community_healing' | 'political_power' | 'cultural_celebration' | 'spiritual_growth'
  description: string
  measurement: number
  beneficiaries: number
  sustainability: number
}

export interface EmpowermentTracking {
  userId: string
  journeyStage: JourneyStage
  empowermentLevel: number
  liberationProgress: number
  communityContribution: number
  sovereigntyScore: number
  outcomes: LiberationOutcome[]
}

export interface ResourceAllocationOptimization {
  recommendedAllocations: ResourceAllocation[]
  liberationPriorities: string[]
  communityNeeds: CommunityNeed[]
  empowermentOpportunities: string[]
  totalImpact: number
}

export interface ResourceAllocation {
  resourceType: string
  amount: number
  recipients: string[]
  liberationJustification: string
  expectedImpact: number
  communityBenefit: number
}

export interface CommunityNeed {
  type: 'economic' | 'health' | 'housing' | 'legal' | 'social' | 'educational'
  urgency: 'low' | 'medium' | 'high' | 'critical'
  affectedPopulation: number
  liberationAlignment: number
  empowermentPotential: number
}

// =============================================================================
// LAYER 3 INTERFACE CONTRACTS - Clean Integration
// =============================================================================

// Layer 2 → Layer 3 Interface
export interface Layer2ToLayer3Request {
  operation: string
  data: any
  userId: string
  sessionId: string
  journeyContext?: JourneyContext
}

export interface Layer2ToLayer3Response {
  success: boolean
  data: any
  liberationValidation: LiberationValidationResult
  empowermentTracking: any
  errors?: string[]
}

// Layer 3 → Layer 5 Interface  
export interface Layer3ToLayer5Request {
  operation: 'read' | 'write' | 'update' | 'delete'
  dataType: string
  query: any
  liberationCriteria: LiberationValues
}

export interface Layer3ToLayer5Response {
  success: boolean
  data: any
  liberationCompliance: boolean
  errors?: string[]
}

// Layer 4 → Layer 3 Interface (Governance Input)
export interface Layer4ToLayer3GovernanceInput {
  governanceRule: string
  liberationRequirements: LiberationValues
  communityDecision: boolean
  democraticValidation: boolean
}

// =============================================================================
// BUSINESS LOGIC OPERATION RESULTS
// =============================================================================

export interface BusinessLogicOperationResult<T = any> {
  success: boolean
  data: T
  liberationValidation: LiberationValidationResult
  empowermentImpact: number
  communityBenefit: number
  sovereigntyCompliance: boolean
  recommendations: string[]
  violations: LiberationValueViolation[]
}

export interface BatchBusinessLogicResult<T = any> {
  results: BusinessLogicOperationResult<T>[]
  overallLiberationScore: number
  aggregateEmpowerment: number
  communityImpact: number
  systemicRecommendations: string[]
}

// =============================================================================
// LIBERATION VALUES CONSTANTS
// =============================================================================

export const LIBERATION_CONSTANTS = {
  MINIMUM_CREATOR_SOVEREIGNTY: 0.75, // 75% minimum
  MAXIMUM_OPPRESSION_TOLERANCE: 0.1, // 10% maximum
  MINIMUM_EMPOWERMENT_SCORE: 0.6, // 60% minimum
  MINIMUM_COMMUNITY_PROTECTION: 0.7, // 70% minimum
  MINIMUM_CULTURAL_AUTHENTICITY: 0.65 // 65% minimum
} as const

export const LIBERATION_WEIGHTS = {
  CREATOR_SOVEREIGNTY: 0.25,
  ANTI_OPPRESSION: 0.25,
  BLACK_QUEER_EMPOWERMENT: 0.2,
  COMMUNITY_PROTECTION: 0.15,
  CULTURAL_AUTHENTICITY: 0.15
} as const