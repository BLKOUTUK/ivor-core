declare class EmbeddingService {
    private openai;
    private isAvailable;
    constructor();
    /**
     * Generate embedding vector for text content
     */
    generateEmbedding(text: string): Promise<number[]>;
    /**
     * Generate multiple embeddings for batch processing
     */
    generateBatchEmbeddings(texts: string[]): Promise<number[][]>;
    /**
     * Calculate cosine similarity between two embedding vectors
     */
    calculateSimilarity(embedding1: number[], embedding2: number[]): number;
    /**
     * Find most similar embeddings from a collection
     */
    findMostSimilar(queryEmbedding: number[], candidateEmbeddings: {
        id: string;
        embedding: number[];
    }[], topK?: number): {
        id: string;
        similarity: number;
    }[];
    /**
     * Generate mock embedding for development/testing
     */
    private generateMockEmbedding;
    /**
     * Check if embedding service is available
     */
    isEmbeddingAvailable(): boolean;
    /**
     * Get embedding dimension
     */
    getEmbeddingDimension(): number;
}
export default EmbeddingService;
//# sourceMappingURL=embeddingService.d.ts.map