import { JourneyStage, JourneyContext } from './journey.js';
export interface LiberationValues {
    creatorSovereignty: number;
    antiOppressionValidation: boolean;
    blackQueerEmpowerment: number;
    communityProtection: number;
    culturalAuthenticity: number;
}
export interface LiberationValidationResult {
    isValid: boolean;
    violations: LiberationValueViolation[];
    empowermentScore: number;
    recommendations: string[];
}
export interface LiberationValueViolation {
    type: 'creator_sovereignty' | 'anti_oppression' | 'empowerment' | 'protection' | 'authenticity';
    severity: 'critical' | 'major' | 'minor';
    description: string;
    remedy: string;
}
export interface CommunityInteractionRule {
    id: string;
    name: string;
    description: string;
    applicableJourneyStages: JourneyStage[];
    liberationRequirements: LiberationValues;
    protectionMechanisms: string[];
    empowermentActions: string[];
}
export interface CommunityProtectionDecision {
    allow: boolean;
    reasoning: string;
    protectionMeasures: string[];
    empowermentOpportunities: string[];
    liberationImpact: number;
}
export interface JourneyProgressionRule {
    fromStage: JourneyStage;
    toStage: JourneyStage;
    liberationCriteria: LiberationValues;
    empowermentRequirements: string[];
    communityValidation: boolean;
}
export interface DemocraticParticipationValidation {
    isValid: boolean;
    participationScore: number;
    empowermentLevel: number;
    accessibilityMeasures: string[];
    liberationAlignment: number;
}
export interface CreatorSovereigntyCalculation {
    totalRevenue: number;
    creatorShare: number;
    creatorPercentage: number;
    platformShare: number;
    isCompliant: boolean;
    violations: string[];
}
export interface CreatorAttributionRights {
    creatorId: string;
    contentId: string;
    attributionRequired: boolean;
    narrativeControl: boolean;
    modificationRights: 'full' | 'limited' | 'none';
    economicRights: CreatorSovereigntyCalculation;
    culturalRights: string[];
}
export interface EconomicEmpowermentTracking {
    creatorId: string;
    totalEarnings: number;
    liberationImpact: number;
    communityBenefit: number;
    empowermentProgress: number;
    sovereigntyViolations: string[];
}
export interface AntiOppressionValidation {
    contentId: string;
    isValid: boolean;
    oppressionIndicators: OppressionIndicator[];
    culturalAuthenticity: number;
    communityConsent: boolean;
    liberationAlignment: number;
}
export interface OppressionIndicator {
    type: 'racism' | 'transphobia' | 'homophobia' | 'classism' | 'ableism' | 'sexism';
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    location: string;
    remedy: string;
}
export interface CulturalAuthenticityVerification {
    contentId: string;
    authenticityScore: number;
    culturalAppropriation: boolean;
    communityVoices: boolean;
    blackQueerRepresentation: number;
    stereotypeAnalysis: string[];
}
export interface CommunityConsentValidation {
    contentId: string;
    consentObtained: boolean;
    communityImpact: number;
    vulnerabilityAssessment: string[];
    protectionMeasures: string[];
}
export interface LiberationImpactMeasurement {
    contentId?: string;
    communityId?: string;
    creatorId?: string;
    overall: {
        empowermentScore: number;
        liberationProgress: number;
        communityBenefit: number;
        antiOppressionEffectiveness: number;
    };
    dimensions: {
        economic: number;
        social: number;
        political: number;
        cultural: number;
        spiritual: number;
    };
    outcomes: LiberationOutcome[];
}
export interface LiberationOutcome {
    type: 'economic_empowerment' | 'community_healing' | 'political_power' | 'cultural_celebration' | 'spiritual_growth';
    description: string;
    measurement: number;
    beneficiaries: number;
    sustainability: number;
}
export interface EmpowermentTracking {
    userId: string;
    journeyStage: JourneyStage;
    empowermentLevel: number;
    liberationProgress: number;
    communityContribution: number;
    sovereigntyScore: number;
    outcomes: LiberationOutcome[];
}
export interface ResourceAllocationOptimization {
    recommendedAllocations: ResourceAllocation[];
    liberationPriorities: string[];
    communityNeeds: CommunityNeed[];
    empowermentOpportunities: string[];
    totalImpact: number;
}
export interface ResourceAllocation {
    resourceType: string;
    amount: number;
    recipients: string[];
    liberationJustification: string;
    expectedImpact: number;
    communityBenefit: number;
}
export interface CommunityNeed {
    type: 'economic' | 'health' | 'housing' | 'legal' | 'social' | 'educational';
    urgency: 'low' | 'medium' | 'high' | 'critical';
    affectedPopulation: number;
    liberationAlignment: number;
    empowermentPotential: number;
}
export interface Layer2ToLayer3Request {
    operation: string;
    data: any;
    userId: string;
    sessionId: string;
    journeyContext?: JourneyContext;
}
export interface Layer2ToLayer3Response {
    success: boolean;
    data: any;
    liberationValidation: LiberationValidationResult;
    empowermentTracking: any;
    errors?: string[];
}
export interface Layer3ToLayer5Request {
    operation: 'read' | 'write' | 'update' | 'delete';
    dataType: string;
    query: any;
    liberationCriteria: LiberationValues;
}
export interface Layer3ToLayer5Response {
    success: boolean;
    data: any;
    liberationCompliance: boolean;
    errors?: string[];
}
export interface Layer4ToLayer3GovernanceInput {
    governanceRule: string;
    liberationRequirements: LiberationValues;
    communityDecision: boolean;
    democraticValidation: boolean;
}
export interface BusinessLogicOperationResult<T = any> {
    success: boolean;
    data: T;
    liberationValidation: LiberationValidationResult;
    empowermentImpact: number;
    communityBenefit: number;
    sovereigntyCompliance: boolean;
    recommendations: string[];
    violations: LiberationValueViolation[];
}
export interface BatchBusinessLogicResult<T = any> {
    results: BusinessLogicOperationResult<T>[];
    overallLiberationScore: number;
    aggregateEmpowerment: number;
    communityImpact: number;
    systemicRecommendations: string[];
}
export declare const LIBERATION_CONSTANTS: {
    readonly MINIMUM_CREATOR_SOVEREIGNTY: 0.75;
    readonly MAXIMUM_OPPRESSION_TOLERANCE: 0.1;
    readonly MINIMUM_EMPOWERMENT_SCORE: 0.6;
    readonly MINIMUM_COMMUNITY_PROTECTION: 0.7;
    readonly MINIMUM_CULTURAL_AUTHENTICITY: 0.65;
};
export declare const LIBERATION_WEIGHTS: {
    readonly CREATOR_SOVEREIGNTY: 0.25;
    readonly ANTI_OPPRESSION: 0.25;
    readonly BLACK_QUEER_EMPOWERMENT: 0.2;
    readonly COMMUNITY_PROTECTION: 0.15;
    readonly CULTURAL_AUTHENTICITY: 0.15;
};
//# sourceMappingURL=layer3-business-logic.d.ts.map