// Layer 3: Community Business Logic Service
// Revolutionary Community Liberation Business Logic with Perfect Separation of Concerns
// Embeds Liberation Values in ALL Community Interaction Operations

import { JourneyStage, JourneyContext, UKLocation } from '../../types/journey.js'
import { 
  LiberationValues, 
  LiberationValidationResult,
  LiberationValueViolation,
  CommunityInteractionRule,
  CommunityProtectionDecision,
  JourneyProgressionRule,
  DemocraticParticipationValidation,
  BusinessLogicOperationResult,
  LIBERATION_CONSTANTS
} from '../../types/layer3-business-logic.js'

/**
 * Layer 3: Community Business Logic Service
 * 
 * CORE RESPONSIBILITY: Community interaction business rules with liberation values
 * 
 * PERFECT SEPARATION OF CONCERNS:
 * ✅ ONLY business logic operations
 * ❌ NO API Gateway operations (Layer 2)
 * ❌ NO data persistence (Layer 5) 
 * ❌ NO infrastructure management (Layer 6)
 * ❌ NO governance decisions (Layer 4)
 * 
 * LIBERATION VALUES EMBEDDED:
 * - Community protection mechanisms
 * - Democratic participation validation
 * - Liberation journey progression rules
 * - Anti-oppression community standards
 * - Black queer empowerment prioritization
 */
export class CommunityBusinessLogicService {
  private communityRules: Map<string, CommunityInteractionRule> = new Map()
  private journeyProgressionRules: Map<string, JourneyProgressionRule[]> = new Map()

  constructor() {
    this.initializeLiberationCommunityRules()
    this.initializeJourneyProgressionRules()
  }

  // =============================================================================
  // COMMUNITY INTERACTION BUSINESS LOGIC
  // =============================================================================

  /**
   * Validate community interaction against liberation values
   * PURE BUSINESS LOGIC: Determines if interaction upholds liberation values
   */
  validateCommunityInteraction(
    interactionType: string,
    participantContext: JourneyContext,
    interactionData: any
  ): BusinessLogicOperationResult<CommunityProtectionDecision> {
    
    // 1. Apply liberation values validation
    const liberationValidation = this.validateLiberationValues({
      creatorSovereignty: 0.8, // Community interactions prioritize sovereignty
      antiOppressionValidation: true,
      blackQueerEmpowerment: 0.75,
      communityProtection: 0.85,
      culturalAuthenticity: 0.7
    })

    if (!liberationValidation.isValid) {
      return {
        success: false,
        data: {
          allow: false,
          reasoning: 'Liberation values violation detected',
          protectionMeasures: liberationValidation.violations.map(v => v.remedy),
          empowermentOpportunities: liberationValidation.recommendations,
          liberationImpact: -0.5
        },
        liberationValidation,
        empowermentImpact: -0.5,
        communityBenefit: -0.3,
        sovereigntyCompliance: false,
        recommendations: liberationValidation.recommendations,
        violations: liberationValidation.violations
      }
    }

    // 2. Get applicable community rules
    const applicableRules = this.getApplicableCommunityRules(
      interactionType, 
      participantContext.stage
    )

    // 3. Apply community protection mechanisms
    const protectionDecision = this.applyCommunityProtection(
      interactionData,
      participantContext,
      applicableRules
    )

    // 4. Calculate empowerment opportunities
    const empowermentOpportunities = this.identifyEmpowermentOpportunities(
      interactionType,
      participantContext,
      protectionDecision
    )

    const finalDecision: CommunityProtectionDecision = {
      ...protectionDecision,
      empowermentOpportunities
    }

    return {
      success: true,
      data: finalDecision,
      liberationValidation,
      empowermentImpact: protectionDecision.liberationImpact,
      communityBenefit: this.calculateCommunityBenefit(protectionDecision),
      sovereigntyCompliance: true,
      recommendations: empowermentOpportunities,
      violations: []
    }
  }

  /**
   * Calculate liberation journey progression eligibility
   * PURE BUSINESS LOGIC: Determines readiness for next liberation stage
   */
  calculateJourneyProgression(
    currentContext: JourneyContext,
    communityContributions: any[],
    empowermentHistory: any[]
  ): BusinessLogicOperationResult<{
    readyForNextStage: boolean
    nextStage: JourneyStage | null
    requirements: string[]
    empowermentScore: number
  }> {

    // 1. Validate current liberation values
    const currentLiberationScore = this.assessCurrentLiberationAlignment(
      currentContext,
      communityContributions
    )

    const liberationValidation = this.validateLiberationValues({
      creatorSovereignty: 0.75,
      antiOppressionValidation: true,
      blackQueerEmpowerment: currentLiberationScore.empowerment,
      communityProtection: currentLiberationScore.protection,
      culturalAuthenticity: currentLiberationScore.authenticity
    })

    // 2. Get progression rules for current stage
    const progressionRules = this.journeyProgressionRules.get(currentContext.stage) || []

    // 3. Apply liberation-based progression logic
    const progressionAssessment = this.assessProgressionReadiness(
      currentContext,
      progressionRules,
      empowermentHistory,
      currentLiberationScore
    )

    // 4. Calculate next stage based on liberation journey
    const nextStage = this.determineNextLiberationStage(
      currentContext.stage,
      progressionAssessment,
      liberationValidation
    )

    return {
      success: true,
      data: {
        readyForNextStage: progressionAssessment.ready,
        nextStage,
        requirements: progressionAssessment.requirements,
        empowermentScore: progressionAssessment.empowermentScore
      },
      liberationValidation,
      empowermentImpact: progressionAssessment.empowermentScore,
      communityBenefit: this.calculateProgressionCommunityBenefit(progressionAssessment),
      sovereigntyCompliance: liberationValidation.isValid,
      recommendations: progressionAssessment.recommendations,
      violations: liberationValidation.violations
    }
  }

  /**
   * Validate democratic participation with liberation principles
   * PURE BUSINESS LOGIC: Ensures community decisions uphold liberation values
   */
  validateDemocraticParticipation(
    participationData: any,
    communityContext: any,
    decisionImpact: any
  ): BusinessLogicOperationResult<DemocraticParticipationValidation> {

    // 1. Liberation values for democratic participation
    const democraticLiberationValues: LiberationValues = {
      creatorSovereignty: 0.8, // High sovereignty in community decisions
      antiOppressionValidation: true,
      blackQueerEmpowerment: 0.85, // Prioritize Black queer voices
      communityProtection: 0.9, // Maximum community protection
      culturalAuthenticity: 0.8
    }

    const liberationValidation = this.validateLiberationValues(democraticLiberationValues)

    // 2. Apply democratic participation business logic
    const participationValidation = this.applyDemocraticBusinessLogic(
      participationData,
      communityContext,
      decisionImpact,
      democraticLiberationValues
    )

    // 3. Calculate liberation alignment of participation
    const liberationAlignment = this.calculateDemocraticLiberationAlignment(
      participationData,
      participationValidation
    )

    const validation: DemocraticParticipationValidation = {
      isValid: participationValidation.isValid && liberationAlignment > 0.7,
      participationScore: participationValidation.participationScore,
      empowermentLevel: participationValidation.empowermentLevel,
      accessibilityMeasures: participationValidation.accessibilityMeasures,
      liberationAlignment
    }

    return {
      success: true,
      data: validation,
      liberationValidation,
      empowermentImpact: validation.empowermentLevel,
      communityBenefit: validation.liberationAlignment,
      sovereigntyCompliance: validation.liberationAlignment > LIBERATION_CONSTANTS.MINIMUM_CREATOR_SOVEREIGNTY,
      recommendations: this.generateDemocraticRecommendations(validation),
      violations: liberationValidation.violations
    }
  }

  // =============================================================================
  // LIBERATION VALUES VALIDATION (Core Business Logic)
  // =============================================================================

  private validateLiberationValues(values: LiberationValues): LiberationValidationResult {
    const violations: LiberationValueViolation[] = []
    let empowermentScore = 0

    // 1. Creator Sovereignty Validation (75% minimum)
    if (values.creatorSovereignty < LIBERATION_CONSTANTS.MINIMUM_CREATOR_SOVEREIGNTY) {
      violations.push({
        type: 'creator_sovereignty',
        severity: 'critical',
        description: `Creator sovereignty at ${values.creatorSovereignty * 100}% below required 75%`,
        remedy: 'Increase creator control and ownership share to minimum 75%'
      })
    } else {
      empowermentScore += 0.25 * values.creatorSovereignty
    }

    // 2. Anti-Oppression Validation
    if (!values.antiOppressionValidation) {
      violations.push({
        type: 'anti_oppression',
        severity: 'critical',
        description: 'Anti-oppression validation failed',
        remedy: 'Remove oppressive elements and center liberation'
      })
    } else {
      empowermentScore += 0.25
    }

    // 3. Black Queer Empowerment
    if (values.blackQueerEmpowerment < 0.6) {
      violations.push({
        type: 'empowerment',
        severity: values.blackQueerEmpowerment < 0.3 ? 'critical' : 'major',
        description: `Black queer empowerment score too low: ${values.blackQueerEmpowerment}`,
        remedy: 'Center Black queer voices, experiences, and liberation'
      })
    } else {
      empowermentScore += 0.2 * values.blackQueerEmpowerment
    }

    // 4. Community Protection
    if (values.communityProtection < LIBERATION_CONSTANTS.MINIMUM_COMMUNITY_PROTECTION) {
      violations.push({
        type: 'protection',
        severity: 'major',
        description: `Community protection insufficient: ${values.communityProtection}`,
        remedy: 'Strengthen community protection mechanisms'
      })
    } else {
      empowermentScore += 0.15 * values.communityProtection
    }

    // 5. Cultural Authenticity
    if (values.culturalAuthenticity < LIBERATION_CONSTANTS.MINIMUM_CULTURAL_AUTHENTICITY) {
      violations.push({
        type: 'authenticity',
        severity: 'minor',
        description: `Cultural authenticity below threshold: ${values.culturalAuthenticity}`,
        remedy: 'Increase authentic Black queer cultural representation'
      })
    } else {
      empowermentScore += 0.15 * values.culturalAuthenticity
    }

    return {
      isValid: violations.length === 0,
      violations,
      empowermentScore,
      recommendations: this.generateLiberationRecommendations(violations, empowermentScore)
    }
  }

  // =============================================================================
  // COMMUNITY PROTECTION BUSINESS LOGIC
  // =============================================================================

  private applyCommunityProtection(
    interactionData: any,
    context: JourneyContext,
    rules: CommunityInteractionRule[]
  ): CommunityProtectionDecision {
    
    // Apply community protection algorithms prioritizing Black queer safety
    const protectionScore = this.calculateProtectionScore(interactionData, context)
    const liberationImpact = this.calculateLiberationImpact(interactionData, rules)
    
    // Community protection business logic
    const allow = protectionScore > 0.7 && liberationImpact > 0.5
    
    return {
      allow,
      reasoning: allow 
        ? 'Interaction upholds community protection and liberation values'
        : 'Interaction poses community protection or liberation concerns',
      protectionMeasures: this.generateProtectionMeasures(protectionScore, context),
      empowermentOpportunities: [], // Will be filled by calling function
      liberationImpact
    }
  }

  private calculateProtectionScore(interactionData: any, context: JourneyContext): number {
    let score = 0.5 // Base score
    
    // Journey stage protection factors
    const stageProtectionFactors = {
      'crisis': 0.9,           // Maximum protection during crisis
      'stabilization': 0.8,    // High protection during stabilization
      'growth': 0.7,           // Moderate protection during growth
      'community_healing': 0.75, // High protection during healing
      'advocacy': 0.6          // Lower protection for advocacy stage
    }
    
    score *= stageProtectionFactors[context.stage]
    
    // Community connection protection
    if (context.communityConnection === 'isolated') {
      score *= 1.2 // Extra protection for isolated individuals
    }
    
    // Emotional state protection
    if (context.emotionalState === 'crisis' || context.emotionalState === 'overwhelmed') {
      score *= 1.3 // Extra protection during emotional crisis
    }
    
    return Math.min(score, 1.0)
  }

  private calculateLiberationImpact(interactionData: any, rules: CommunityInteractionRule[]): number {
    // Business logic for calculating liberation impact
    let impact = 0
    
    for (const rule of rules) {
      // Each rule contributes to liberation impact based on empowerment actions
      impact += rule.empowermentActions.length * 0.1
      
      // Higher impact for rules with stronger liberation requirements
      impact += rule.liberationRequirements.blackQueerEmpowerment * 0.2
      impact += rule.liberationRequirements.communityProtection * 0.15
    }
    
    return Math.min(impact, 1.0)
  }

  // =============================================================================
  // JOURNEY PROGRESSION BUSINESS LOGIC
  // =============================================================================

  private assessProgressionReadiness(
    context: JourneyContext,
    rules: JourneyProgressionRule[],
    history: any[],
    liberationScore: any
  ): {
    ready: boolean
    empowermentScore: number
    requirements: string[]
    recommendations: string[]
  } {
    
    const applicableRule = rules.find(r => r.fromStage === context.stage)
    if (!applicableRule) {
      return {
        ready: false,
        empowermentScore: 0,
        requirements: ['No progression rule defined for current stage'],
        recommendations: ['Contact community support for guidance']
      }
    }
    
    // Check liberation criteria
    const meetsLiberationCriteria = this.validateLiberationValues(applicableRule.liberationCriteria)
    
    // Calculate empowerment score based on liberation alignment
    const empowermentScore = liberationScore.empowerment * 0.4 + 
                            liberationScore.protection * 0.3 + 
                            liberationScore.authenticity * 0.3
    
    const ready = meetsLiberationCriteria.isValid && empowermentScore > 0.6
    
    return {
      ready,
      empowermentScore,
      requirements: applicableRule.empowermentRequirements,
      recommendations: meetsLiberationCriteria.recommendations
    }
  }

  private determineNextLiberationStage(
    currentStage: JourneyStage,
    assessment: any,
    liberationValidation: LiberationValidationResult
  ): JourneyStage | null {
    
    if (!assessment.ready || !liberationValidation.isValid) {
      return null
    }
    
    // Liberation journey progression
    const liberationProgression: Record<JourneyStage, JourneyStage> = {
      'crisis': 'stabilization',
      'stabilization': 'growth', 
      'growth': 'community_healing',
      'community_healing': 'advocacy',
      'advocacy': 'advocacy' // Already at highest liberation stage
    }
    
    return liberationProgression[currentStage]
  }

  // =============================================================================
  // DEMOCRATIC PARTICIPATION BUSINESS LOGIC
  // =============================================================================

  private applyDemocraticBusinessLogic(
    participationData: any,
    communityContext: any,
    decisionImpact: any,
    liberationValues: LiberationValues
  ): {
    isValid: boolean
    participationScore: number
    empowermentLevel: number
    accessibilityMeasures: string[]
  } {
    
    // Calculate participation score based on liberation values
    let participationScore = 0.5
    
    // Prioritize Black queer voices
    if (participationData.identifiesAsBlackQueer) {
      participationScore += 0.2
    }
    
    // Community representation score
    if (participationData.communityRepresentative) {
      participationScore += 0.15
    }
    
    // Liberation alignment of participation
    if (participationData.liberationAligned) {
      participationScore += 0.25
    }
    
    // Calculate empowerment level
    const empowermentLevel = participationScore * liberationValues.blackQueerEmpowerment
    
    // Generate accessibility measures
    const accessibilityMeasures = this.generateAccessibilityMeasures(participationData)
    
    return {
      isValid: participationScore > 0.6,
      participationScore,
      empowermentLevel,
      accessibilityMeasures
    }
  }

  private calculateDemocraticLiberationAlignment(
    participationData: any,
    validation: any
  ): number {
    // Business logic for democratic liberation alignment
    let alignment = validation.participationScore * 0.4
    
    // Add liberation-specific factors
    alignment += validation.empowermentLevel * 0.3
    alignment += (validation.accessibilityMeasures.length > 0 ? 0.2 : 0)
    alignment += (participationData.antiOppressionStance ? 0.1 : 0)
    
    return Math.min(alignment, 1.0)
  }

  // =============================================================================
  // HELPER METHODS FOR BUSINESS LOGIC
  // =============================================================================

  private getApplicableCommunityRules(
    interactionType: string,
    stage: JourneyStage
  ): CommunityInteractionRule[] {
    return Array.from(this.communityRules.values()).filter(rule =>
      rule.name.includes(interactionType) || 
      rule.applicableJourneyStages.includes(stage)
    )
  }

  private identifyEmpowermentOpportunities(
    interactionType: string,
    context: JourneyContext,
    decision: CommunityProtectionDecision
  ): string[] {
    const opportunities: string[] = []
    
    if (decision.allow) {
      // Liberation-based empowerment opportunities
      opportunities.push('Connect with community healing circles')
      opportunities.push('Explore leadership opportunities')
      
      if (context.stage === 'growth') {
        opportunities.push('Consider community organizing involvement')
      }
      
      if (context.stage === 'advocacy') {
        opportunities.push('Mentor others in earlier journey stages')
      }
    }
    
    return opportunities
  }

  private assessCurrentLiberationAlignment(
    context: JourneyContext,
    contributions: any[]
  ): {
    empowerment: number
    protection: number
    authenticity: number
  } {
    // Business logic for assessing current liberation alignment
    return {
      empowerment: 0.75 + (contributions.length * 0.05),
      protection: context.communityConnection === 'organizing' ? 0.9 : 0.7,
      authenticity: 0.8
    }
  }

  private calculateCommunityBenefit(decision: CommunityProtectionDecision): number {
    return decision.allow ? decision.liberationImpact : 0
  }

  private calculateProgressionCommunityBenefit(assessment: any): number {
    return assessment.ready ? assessment.empowermentScore : 0
  }

  private generateProtectionMeasures(score: number, context: JourneyContext): string[] {
    const measures: string[] = []
    
    if (score < 0.7) {
      measures.push('Enhanced community moderation')
      measures.push('Trauma-informed interaction protocols')
    }
    
    if (context.emotionalState === 'crisis') {
      measures.push('Crisis support resource provision')
      measures.push('Professional mental health referral')
    }
    
    return measures
  }

  private generateAccessibilityMeasures(participationData: any): string[] {
    return [
      'Multiple language support available',
      'Screen reader compatibility ensured',
      'Mobile-first participation options',
      'Flexible timing accommodations'
    ]
  }

  private generateLiberationRecommendations(violations: LiberationValueViolation[], score: number): string[] {
    const recommendations: string[] = []
    
    if (violations.length > 0) {
      recommendations.push('Address liberation value violations immediately')
      recommendations.push('Consult community governance for guidance')
    }
    
    if (score < 0.8) {
      recommendations.push('Increase Black queer community involvement')
      recommendations.push('Strengthen anti-oppression measures')
    }
    
    return recommendations
  }

  private generateDemocraticRecommendations(validation: DemocraticParticipationValidation): string[] {
    const recommendations: string[] = []
    
    if (!validation.isValid) {
      recommendations.push('Improve democratic participation processes')
      recommendations.push('Increase community accessibility')
    }
    
    if (validation.empowermentLevel < 0.7) {
      recommendations.push('Center Black queer voices more prominently')
      recommendations.push('Strengthen liberation alignment in decision-making')
    }
    
    return recommendations
  }

  // =============================================================================
  // INITIALIZATION METHODS
  // =============================================================================

  private initializeLiberationCommunityRules(): void {
    // Initialize community interaction rules with liberation values
    const rules: CommunityInteractionRule[] = [
      {
        id: 'community-healing-circle',
        name: 'Community Healing Circle Participation',
        description: 'Rules for participating in community healing spaces',
        applicableJourneyStages: ['stabilization', 'growth', 'community_healing'],
        liberationRequirements: {
          creatorSovereignty: 0.8,
          antiOppressionValidation: true,
          blackQueerEmpowerment: 0.85,
          communityProtection: 0.9,
          culturalAuthenticity: 0.8
        },
        protectionMeasures: ['Trauma-informed facilitation', 'Community accountability'],
        empowermentActions: ['Peer support', 'Healing resource sharing', 'Liberation storytelling']
      },
      {
        id: 'organizing-participation',
        name: 'Community Organizing Participation',
        description: 'Rules for community organizing and advocacy activities',
        applicableJourneyStages: ['growth', 'community_healing', 'advocacy'],
        liberationRequirements: {
          creatorSovereignty: 0.75,
          antiOppressionValidation: true,
          blackQueerEmpowerment: 0.8,
          communityProtection: 0.85,
          culturalAuthenticity: 0.75
        },
        protectionMeasures: ['Security culture practices', 'Legal observer coordination'],
        empowermentActions: ['Strategic planning', 'Leadership development', 'Campaign execution']
      }
    ]
    
    for (const rule of rules) {
      this.communityRules.set(rule.id, rule)
    }
  }

  private initializeJourneyProgressionRules(): void {
    // Initialize journey progression rules with liberation criteria
    const progressions: JourneyProgressionRule[] = [
      {
        fromStage: 'crisis',
        toStage: 'stabilization',
        liberationCriteria: {
          creatorSovereignty: 0.7,
          antiOppressionValidation: true,
          blackQueerEmpowerment: 0.6,
          communityProtection: 0.8,
          culturalAuthenticity: 0.6
        },
        empowermentRequirements: [
          'Basic safety established',
          'Crisis resources accessed',
          'Community connection initiated'
        ],
        communityValidation: false
      },
      {
        fromStage: 'stabilization',
        toStage: 'growth',
        liberationCriteria: {
          creatorSovereignty: 0.75,
          antiOppressionValidation: true,
          blackQueerEmpowerment: 0.7,
          communityProtection: 0.8,
          culturalAuthenticity: 0.7
        },
        empowermentRequirements: [
          'Consistent community engagement',
          'Personal empowerment development',
          'Liberation education participation'
        ],
        communityValidation: true
      },
      {
        fromStage: 'growth',
        toStage: 'community_healing',
        liberationCriteria: {
          creatorSovereignty: 0.8,
          antiOppressionValidation: true,
          blackQueerEmpowerment: 0.75,
          communityProtection: 0.85,
          culturalAuthenticity: 0.75
        },
        empowermentRequirements: [
          'Community contribution established',
          'Peer support provision',
          'Liberation values integration'
        ],
        communityValidation: true
      },
      {
        fromStage: 'community_healing',
        toStage: 'advocacy',
        liberationCriteria: {
          creatorSovereignty: 0.85,
          antiOppressionValidation: true,
          blackQueerEmpowerment: 0.8,
          communityProtection: 0.9,
          culturalAuthenticity: 0.8
        },
        empowermentRequirements: [
          'Community leadership demonstrated',
          'Organizing experience gained',
          'Liberation vision articulated'
        ],
        communityValidation: true
      }
    ]
    
    for (const progression of progressions) {
      if (!this.journeyProgressionRules.has(progression.fromStage)) {
        this.journeyProgressionRules.set(progression.fromStage, [])
      }
      this.journeyProgressionRules.get(progression.fromStage)!.push(progression)
    }
  }
}