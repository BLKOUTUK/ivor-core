/**
 * Weekly Content Review Service
 * Reviews new newsroom articles and events submissions to update IVOR's knowledge base
 */
export declare class WeeklyContentReviewService {
    private knowledgeBase;
    private trustScoreService;
    private supabase;
    private isEnabled;
    constructor();
    /**
     * Main weekly review process
     */
    performWeeklyReview(): Promise<{
        articlesReviewed: number;
        eventsReviewed: number;
        knowledgeEntriesCreated: number;
        resourcesCreated: number;
        summary: string;
    }>;
    /**
     * Get new newsroom articles from past week
     */
    private getNewNewsArticles;
    /**
     * Get new events from past week
     */
    private getNewEvents;
    /**
     * Extract knowledge entries from articles using AI analysis
     */
    private extractKnowledgeFromArticles;
    /**
     * Create resources from community events
     */
    private createResourcesFromEvents;
    /**
     * Identify relevant topics in article content
     */
    private identifyRelevantTopics;
    /**
     * Validate and score new knowledge entries
     */
    private validateAndScoreKnowledge;
    /**
     * Validate and score new resources
     */
    private validateAndScoreResources;
    /**
     * Store knowledge entries to database
     */
    private storeKnowledgeEntries;
    /**
     * Store resources to database or update in-memory store
     */
    private storeResources;
    private generateKnowledgeTitle;
    private extractRelevantContent;
    private categorizeContent;
    private mapToJourneyStages;
    private extractLocation;
    private determineEventJourneyStages;
    private parseEventLocations;
    private extractEventSpecializations;
    private parseAccessRequirements;
    private determineEventCost;
    private isLGBTQEvent;
    private isBlackSpecificEvent;
    private isTransSpecificEvent;
    private isAccessibleEvent;
    private formatEventSchedule;
    /**
     * Schedule weekly cron job
     */
    static scheduleWeeklyReview(): void;
    /**
     * Get service health status
     */
    getHealthStatus(): {
        enabled: boolean;
        lastRun: Date | null;
        nextRun: Date | null;
        dbConnection: boolean;
    };
}
export default WeeklyContentReviewService;
//# sourceMappingURL=WeeklyContentReviewService.d.ts.map