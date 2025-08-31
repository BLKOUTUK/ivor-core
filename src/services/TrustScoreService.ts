import { KnowledgeEntry, UKResource } from '../types/journey.js'

/**
 * Trust Score Service
 * Validates sources and calculates trust scores for knowledge entries and resources
 */
export class TrustScoreService {
  private urlCache: Map<string, { isValid: boolean; checkedAt: Date }> = new Map()
  private cacheExpiryHours = 24 // Cache URL validation for 24 hours

  /**
   * Validate a source URL by checking if it's accessible
   */
  async validateSourceUrl(url: string): Promise<boolean> {
    try {
      // Check cache first
      const cached = this.urlCache.get(url)
      if (cached && this.isCacheValid(cached.checkedAt)) {
        return cached.isValid
      }

      // Validate URL format
      const urlObj = new URL(url)
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        return false
      }

      // Check if URL is accessible
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout

      const response = await fetch(url, { 
        method: 'HEAD',
        signal: controller.signal,
        headers: {
          'User-Agent': 'IVOR-Health-Bot/1.0'
        }
      })

      clearTimeout(timeoutId)
      const isValid = response.ok

      // Cache the result
      this.urlCache.set(url, { isValid, checkedAt: new Date() })
      
      return isValid
    } catch (error) {
      // Cache failed attempts too
      this.urlCache.set(url, { isValid: false, checkedAt: new Date() })
      return false
    }
  }

  /**
   * Calculate basic trust score for a knowledge entry
   */
  async calculateKnowledgeTrustScore(entry: KnowledgeEntry): Promise<number> {
    let score = 0.3 // Base score

    // Source credibility scoring (40% weight)
    let sourceScore = 0.3 // Default for unknown sources
    
    for (const source of entry.sources) {
      const lowerSource = source.toLowerCase()
      
      // Official UK government sources get highest score
      if (lowerSource.includes('nhs.uk') || lowerSource.includes('gov.uk')) {
        sourceScore = Math.max(sourceScore, 1.0)
      }
      // Verified health organizations get high score
      else if (lowerSource.includes('menrus.co.uk') || 
               lowerSource.includes('tht.org.uk') ||
               lowerSource.includes('stonewall.org.uk')) {
        sourceScore = Math.max(sourceScore, 0.8)
      }
      // Educational institutions get good score
      else if (lowerSource.includes('.edu') || lowerSource.includes('.ac.uk')) {
        sourceScore = Math.max(sourceScore, 0.7)
      }
      // Check if URL is accessible
      else {
        const isValid = await this.validateSourceUrl(source)
        if (isValid) {
          sourceScore = Math.max(sourceScore, 0.6)
        }
      }
    }

    score += sourceScore * 0.4

    // Recency scoring (30% weight)
    const daysSinceUpdate = (Date.now() - entry.lastUpdated.getTime()) / (1000 * 60 * 60 * 24)
    let recencyScore = 1.0
    
    if (daysSinceUpdate <= 30) {
      recencyScore = 1.0
    } else if (daysSinceUpdate <= 90) {
      recencyScore = 0.8
    } else if (daysSinceUpdate <= 180) {
      recencyScore = 0.5
    } else if (daysSinceUpdate <= 365) {
      recencyScore = 0.3
    } else {
      recencyScore = 0.1
    }

    score += recencyScore * 0.3

    // Verification status (30% weight)
    let verificationScore = 0.5 // Default
    
    switch (entry.verificationStatus) {
      case 'verified':
        verificationScore = 1.0
        break
      case 'pending':
        verificationScore = 0.5
        break
      case 'outdated':
        verificationScore = 0.2
        break
    }

    // Community validation bonus
    if (entry.communityValidated) {
      verificationScore = Math.min(verificationScore + 0.2, 1.0)
    }

    score += verificationScore * 0.3

    return Math.min(Math.max(score, 0.0), 1.0)
  }

  /**
   * Calculate trust score for a UK resource
   */
  async calculateResourceTrustScore(resource: UKResource): Promise<number> {
    let score = 0.4 // Base score

    // Official services get high trust
    if (resource.cost === 'nhs_funded' || resource.cost === 'free') {
      score += 0.3
    }

    // Emergency services get maximum trust
    if (resource.emergency) {
      score += 0.4
    }

    // Cultural competency adds trust for community-specific needs
    const culturalScore = (
      (resource.culturalCompetency.blackSpecific ? 0.1 : 0) +
      (resource.culturalCompetency.lgbtqSpecific ? 0.1 : 0) +
      (resource.culturalCompetency.transSpecific ? 0.05 : 0)
    )
    score += culturalScore

    // Validate website if provided
    if (resource.website) {
      const isValid = await this.validateSourceUrl(resource.website)
      if (isValid) {
        score += 0.1
      } else {
        score -= 0.1
      }
    }

    return Math.min(Math.max(score, 0.0), 1.0)
  }

  /**
   * Get trust score interpretation for users
   */
  getTrustScoreInterpretation(score: number): {
    level: 'high' | 'medium' | 'low' | 'very_low'
    description: string
    color: string
  } {
    if (score >= 0.8) {
      return {
        level: 'high',
        description: 'Highly trusted - verified official sources',
        color: 'green'
      }
    } else if (score >= 0.6) {
      return {
        level: 'medium',
        description: 'Good trust - reliable sources with recent updates',
        color: 'blue'
      }
    } else if (score >= 0.4) {
      return {
        level: 'low',
        description: 'Limited trust - older information or unverified sources',
        color: 'orange'
      }
    } else {
      return {
        level: 'very_low',
        description: 'Low trust - outdated or unverified information',
        color: 'red'
      }
    }
  }

  /**
   * Batch validate multiple URLs
   */
  async validateMultipleUrls(urls: string[]): Promise<Map<string, boolean>> {
    const results = new Map<string, boolean>()
    
    // Process URLs in parallel with concurrency limit
    const concurrency = 5
    for (let i = 0; i < urls.length; i += concurrency) {
      const batch = urls.slice(i, i + concurrency)
      const promises = batch.map(async url => {
        const isValid = await this.validateSourceUrl(url)
        return { url, isValid }
      })
      
      const batchResults = await Promise.all(promises)
      batchResults.forEach(({ url, isValid }) => {
        results.set(url, isValid)
      })
    }
    
    return results
  }

  /**
   * Get system health metrics for trust scoring
   */
  getSystemHealth(): {
    cacheSize: number
    cacheHitRate: number
    lastValidationRun: Date | null
  } {
    return {
      cacheSize: this.urlCache.size,
      cacheHitRate: 0, // TODO: Implement cache hit tracking
      lastValidationRun: new Date() // TODO: Track actual last run
    }
  }

  /**
   * Clear expired cache entries
   */
  clearExpiredCache(): void {
    const now = new Date()
    for (const [url, data] of this.urlCache.entries()) {
      if (!this.isCacheValid(data.checkedAt, now)) {
        this.urlCache.delete(url)
      }
    }
  }

  /**
   * Check if cached data is still valid
   */
  private isCacheValid(checkedAt: Date, now: Date = new Date()): boolean {
    const hoursAgo = (now.getTime() - checkedAt.getTime()) / (1000 * 60 * 60)
    return hoursAgo < this.cacheExpiryHours
  }
}

export default TrustScoreService