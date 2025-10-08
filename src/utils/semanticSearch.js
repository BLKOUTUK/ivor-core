/**
 * Semantic Search Client for IVOR
 * Communicates with Python semantic search API
 *
 * @module semanticSearch
 */

const SEMANTIC_SEARCH_URL = process.env.SEMANTIC_SEARCH_URL || 'http://localhost:8000';

/**
 * Search community resources using semantic search
 *
 * @param {string} query - Natural language search query
 * @param {number} limit - Maximum results (default 3)
 * @param {number} minScore - Minimum relevance score (default 0.5)
 * @param {Object} filters - Optional filters (e.g., {type: "event", location: "London"})
 * @returns {Promise<Array>} Search results
 *
 * @example
 * const results = await searchResources("Where can I get PrEP in London?", 3);
 * console.log(results); // [{ name: "Prepster", score: 0.72, ... }]
 */
async function searchResources(query, limit = 3, minScore = 0.5, filters = null) {
  try {
    const response = await fetch(`${SEMANTIC_SEARCH_URL}/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query,
        limit,
        min_score: minScore,
        filters
      }),
      signal: AbortSignal.timeout(2000)  // 2s timeout
    });

    if (!response.ok) {
      throw new Error(`Search API returned ${response.status}`);
    }

    const data = await response.json();
    return data.results || [];

  } catch (error) {
    console.error('Semantic search failed:', error.message);
    // Graceful degradation - return empty results
    return [];
  }
}

/**
 * Check if semantic search service is available
 *
 * @returns {Promise<boolean>} True if service is healthy
 */
async function isSemanticSearchAvailable() {
  try {
    const response = await fetch(`${SEMANTIC_SEARCH_URL}/health`, {
      signal: AbortSignal.timeout(1000)
    });

    if (!response.ok) {
      return false;
    }

    const data = await response.json();
    return data.status === 'healthy';

  } catch (error) {
    console.warn('Semantic search health check failed:', error.message);
    return false;
  }
}

/**
 * Get semantic search statistics
 *
 * @returns {Promise<Object>} Collection statistics
 */
async function getSearchStats() {
  try {
    const response = await fetch(`${SEMANTIC_SEARCH_URL}/stats`, {
      signal: AbortSignal.timeout(1000)
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.stats;

  } catch (error) {
    console.error('Failed to get search stats:', error.message);
    return null;
  }
}

module.exports = {
  searchResources,
  isSemanticSearchAvailable,
  getSearchStats
};
