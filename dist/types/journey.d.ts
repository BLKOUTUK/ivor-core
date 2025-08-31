export type JourneyStage = 'crisis' | 'stabilization' | 'growth' | 'community_healing' | 'advocacy';
export type EmotionalState = 'calm' | 'stressed' | 'excited' | 'overwhelmed' | 'joyful' | 'uncertain' | 'crisis' | 'hopeful';
export type UrgencyLevel = 'emergency' | 'high' | 'medium' | 'low';
export type CommunityConnectionLevel = 'isolated' | 'exploring' | 'connected' | 'networked' | 'organizing';
export type UKLocation = 'london' | 'manchester' | 'birmingham' | 'leeds' | 'glasgow' | 'cardiff' | 'belfast' | 'bristol' | 'liverpool' | 'sheffield' | 'nottingham' | 'brighton' | 'other_urban' | 'rural' | 'unknown';
export interface JourneyContext {
    stage: JourneyStage;
    emotionalState: EmotionalState;
    urgencyLevel: UrgencyLevel;
    location: UKLocation;
    communityConnection: CommunityConnectionLevel;
    firstTime: boolean;
    returningUser: boolean;
    previousStages?: JourneyStage[];
    resourceAccessPreference: 'phone' | 'online' | 'in_person' | 'flexible';
}
export interface UKResource {
    id: string;
    title: string;
    description: string;
    category: string;
    journeyStages: JourneyStage[];
    phone?: string;
    website?: string;
    email?: string;
    locations: UKLocation[];
    specializations: string[];
    accessRequirements: string[];
    cost: 'free' | 'paid' | 'sliding_scale' | 'nhs_funded';
    culturalCompetency: {
        lgbtqSpecific: boolean;
        blackSpecific: boolean;
        transSpecific: boolean;
        disabilityAware: boolean;
    };
    emergency: boolean;
    availability: string;
    languages: string[];
}
export interface KnowledgeEntry {
    id: string;
    title: string;
    content: string;
    category: string;
    journeyStages: JourneyStage[];
    location: UKLocation[];
    tags: string[];
    sources: string[];
    lastUpdated: Date;
    verificationStatus: 'verified' | 'pending' | 'outdated';
    communityValidated: boolean;
}
export interface JourneyResponse {
    message: string;
    journeyStage: JourneyStage;
    nextStagePathway: string;
    resources: UKResource[];
    knowledge: KnowledgeEntry[];
    followUpRequired: boolean;
    culturallyAffirming: boolean;
    specificInformation: boolean;
    trustScore: number;
    trustLevel: 'high' | 'medium' | 'low' | 'very_low';
    trustDescription: string;
    sourceVerification: {
        verified: number;
        unverified: number;
        total: number;
    };
    requestFeedback: boolean;
    responseId: string;
}
export interface StageTransition {
    from: JourneyStage;
    to: JourneyStage;
    indicators: string[];
    supportNeeded: string[];
    typicalDuration: string;
    challenges: string[];
    successMarkers: string[];
}
export interface JourneyIndicators {
    crisis: {
        keywords: string[];
        emotionalMarkers: string[];
        urgencyWords: string[];
        supportNeeds: string[];
    };
    stabilization: {
        keywords: string[];
        emotionalMarkers: string[];
        supportNeeds: string[];
        progressMarkers: string[];
    };
    growth: {
        keywords: string[];
        emotionalMarkers: string[];
        learningMarkers: string[];
        skillBuilding: string[];
    };
    community_healing: {
        keywords: string[];
        emotionalMarkers: string[];
        communityMarkers: string[];
        healingMarkers: string[];
    };
    advocacy: {
        keywords: string[];
        emotionalMarkers: string[];
        organizingMarkers: string[];
        systemChangeMarkers: string[];
    };
}
export interface ResponseTemplate {
    stage: JourneyStage;
    urgency: UrgencyLevel;
    template: string;
    resourceTypes: string[];
    nextStepGuidance: string;
    culturalConsiderations: string[];
}
//# sourceMappingURL=journey.d.ts.map