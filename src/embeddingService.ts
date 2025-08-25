// Embedding Service for AI Memory and Semantic Search
// Provides vector embeddings for conversation memory and content analysis

import OpenAI from 'openai'

class EmbeddingService {
  private openai: OpenAI | null = null
  private isAvailable: boolean = false

  constructor() {
    if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here') {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      })
      this.isAvailable = true
      console.log('🧠 EmbeddingService: AI embeddings enabled')
    } else {
      console.log('⚠️ EmbeddingService: AI disabled, using mock embeddings')
    }
  }

  /**
   * Generate embedding vector for text content
   */
  async generateEmbedding(text: string): Promise<number[]> {
    if (!this.isAvailable || !this.openai) {
      // Return mock embedding vector for development
      return this.generateMockEmbedding(text)
    }

    try {
      const response = await this.openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: text,
        encoding_format: 'float'
      })

      return response.data[0].embedding
    } catch (error) {
      console.error('Error generating embedding:', error)
      return this.generateMockEmbedding(text)
    }
  }

  /**
   * Generate multiple embeddings for batch processing
   */
  async generateBatchEmbeddings(texts: string[]): Promise<number[][]> {
    if (!this.isAvailable || !this.openai) {
      return texts.map(text => this.generateMockEmbedding(text))
    }

    try {
      const response = await this.openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: texts,
        encoding_format: 'float'
      })

      return response.data.map(item => item.embedding)
    } catch (error) {
      console.error('Error generating batch embeddings:', error)
      return texts.map(text => this.generateMockEmbedding(text))
    }
  }

  /**
   * Calculate cosine similarity between two embedding vectors
   */
  calculateSimilarity(embedding1: number[], embedding2: number[]): number {
    if (embedding1.length !== embedding2.length) {
      throw new Error('Embedding vectors must have the same dimension')
    }

    const dotProduct = embedding1.reduce((sum, a, i) => sum + a * embedding2[i], 0)
    const magnitude1 = Math.sqrt(embedding1.reduce((sum, a) => sum + a * a, 0))
    const magnitude2 = Math.sqrt(embedding2.reduce((sum, a) => sum + a * a, 0))

    if (magnitude1 === 0 || magnitude2 === 0) {
      return 0
    }

    return dotProduct / (magnitude1 * magnitude2)
  }

  /**
   * Find most similar embeddings from a collection
   */
  findMostSimilar(
    queryEmbedding: number[],
    candidateEmbeddings: { id: string; embedding: number[] }[],
    topK: number = 5
  ): { id: string; similarity: number }[] {
    const similarities = candidateEmbeddings.map(candidate => ({
      id: candidate.id,
      similarity: this.calculateSimilarity(queryEmbedding, candidate.embedding)
    }))

    return similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK)
  }

  /**
   * Generate mock embedding for development/testing
   */
  private generateMockEmbedding(text: string): number[] {
    // Create a deterministic but varied mock embedding based on text content
    const dimension = 1536 // Standard OpenAI embedding dimension
    const embedding = new Array(dimension)
    
    // Use text hash to create deterministic values
    let hash = 0
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }

    // Generate embedding values based on hash and position
    for (let i = 0; i < dimension; i++) {
      const seed = hash + i * 1234567
      // Create values between -1 and 1
      embedding[i] = (Math.sin(seed) * 0.5) + (Math.cos(seed * 2) * 0.3) + (Math.sin(seed * 3) * 0.2)
    }

    return embedding
  }

  /**
   * Check if embedding service is available
   */
  isEmbeddingAvailable(): boolean {
    return this.isAvailable
  }

  /**
   * Get embedding dimension
   */
  getEmbeddingDimension(): number {
    return 1536 // OpenAI text-embedding-3-small dimension
  }
}

export default EmbeddingService