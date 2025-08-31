import { UKResource, KnowledgeEntry, JourneyStage, UKLocation } from '../types/journey.js';
/**
 * UK Knowledge Base for Black Queer Community Resources
 * Integrates menrus.co.uk, NHS, and community-specific resources
 */
export declare class UKKnowledgeBase {
    private resources;
    private knowledgeEntries;
    constructor();
    /**
     * Get resources filtered by journey stage and location
     */
    getResourcesByStageAndLocation(stage: JourneyStage, location: UKLocation, urgency?: string, category?: string): UKResource[];
    /**
     * Get knowledge entries by topic and journey stage
     */
    getKnowledgeByTopic(topic: string, stage: JourneyStage, location: UKLocation): KnowledgeEntry[];
    /**
     * Search for specific health information from menrus.co.uk integration
     */
    getMenrusHealthInfo(query: string, stage: JourneyStage): KnowledgeEntry[];
    /**
     * Get emergency resources immediately
     */
    getEmergencyResources(location: UKLocation): UKResource[];
    /**
     * Initialize comprehensive UK resource database
     */
    private initializeResources;
    /**
     * Initialize knowledge entries with UK-specific information
     */
    private initializeKnowledgeEntries;
    /**
     * Get culturally specific resources for Black queer community
     */
    getCulturallySpecificResources(stage: JourneyStage, location: UKLocation): UKResource[];
    /**
     * Update resource with community feedback
     */
    updateResourceWithFeedback(resourceId: string, feedback: any): void;
    /**
     * Add new community-contributed resource
     */
    addCommunityResource(resource: Partial<UKResource>): void;
}
export default UKKnowledgeBase;
//# sourceMappingURL=UKKnowledgeBase.d.ts.map