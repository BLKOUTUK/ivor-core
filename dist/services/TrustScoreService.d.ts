import { KnowledgeEntry, UKResource } from '../types/journey.js';
/**
 * Trust Score Service
 * Validates sources and calculates trust scores for knowledge entries and resources
 */
export declare class TrustScoreService {
    private urlCache;
    private cacheExpiryHours;
    /**
     * Validate a source URL by checking if it's accessible
     */
    validateSourceUrl(url: string): Promise<boolean>;
    /**
     * Calculate basic trust score for a knowledge entry
     */
    calculateKnowledgeTrustScore(entry: KnowledgeEntry): Promise<number>;
    /**
     * Calculate trust score for a UK resource
     */
    calculateResourceTrustScore(resource: UKResource): Promise<number>;
    /**
     * Get trust score interpretation for users
     */
    getTrustScoreInterpretation(score: number): {
        level: 'high' | 'medium' | 'low' | 'very_low';
        description: string;
        color: string;
    };
    /**
     * Batch validate multiple URLs
     */
    validateMultipleUrls(urls: string[]): Promise<Map<string, boolean>>;
    /**
     * Get system health metrics for trust scoring
     */
    getSystemHealth(): {
        cacheSize: number;
        cacheHitRate: number;
        lastValidationRun: Date | null;
    };
    /**
     * Clear expired cache entries
     */
    clearExpiredCache(): void;
    /**
     * Check if cached data is still valid
     */
    private isCacheValid;
}
export default TrustScoreService;
//# sourceMappingURL=TrustScoreService.d.ts.map