/**
 * Conversation Intelligence Service
 * Extracts themes and insights from IVOR conversations
 * Feeds community intelligence to ivor_intelligence table
 * Tracks resource effectiveness
 *
 * Part of BLKOUT Self-Improving System (Phase 1.3)
 */

import Groq from 'groq-sdk';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

export interface ConversationMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export interface ExtractedThemes {
  primaryThemes: string[];
  emotionalTone: string;
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
  topicCategories: string[];
  communityNeeds: string[];
  sentimentScore: number;
}

export interface ResourceRecommendation {
  resourceId: string;
  resourceTitle: string;
  resourceCategory: string;
  recommendedAt: Date;
  wasHelpful?: boolean;
  feedbackReceived?: boolean;
}

export interface ConversationSummary {
  conversationId: string;
  sessionId: string;
  userId: string;
  themes: ExtractedThemes;
  resourcesRecommended: ResourceRecommendation[];
  journeyStage: string;
  duration: number; // in seconds
  messageCount: number;
  startedAt: Date;
  endedAt: Date;
}

export class ConversationIntelligenceService {
  private groq: Groq | null = null;
  private supabase: SupabaseClient | null = null;
  private isAIEnabled: boolean = false;
  private pendingConversations: Map<string, ConversationMessage[]> = new Map();
  private pendingResources: Map<string, ResourceRecommendation[]> = new Map();
  private conversationStartTimes: Map<string, Date> = new Map();

  constructor() {
    // Initialize Supabase
    const supabaseUrl = process.env.SUPABASE_URL || '';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';

    if (supabaseUrl && supabaseKey && supabaseUrl.startsWith('http')) {
      this.supabase = createClient(supabaseUrl, supabaseKey);
      console.log('ConversationIntelligenceService: Connected to Supabase');
    } else {
      console.log('ConversationIntelligenceService: Running without Supabase (mock mode)');
    }

    // Initialize GROQ
    if (process.env.GROQ_API_KEY && process.env.GROQ_API_KEY !== 'your-groq-api-key-here') {
      this.groq = new Groq({
        apiKey: process.env.GROQ_API_KEY
      });
      this.isAIEnabled = true;
      console.log('ConversationIntelligenceService: GROQ AI enabled for theme extraction');
    } else {
      console.log('ConversationIntelligenceService: AI disabled, using keyword-based extraction');
    }
  }

  /**
   * Track start of a conversation
   */
  startConversation(sessionId: string, userId: string = 'anonymous'): void {
    this.conversationStartTimes.set(sessionId, new Date());
    this.pendingConversations.set(sessionId, []);
    this.pendingResources.set(sessionId, []);
    console.log(`Conversation started: ${sessionId}`);
  }

  /**
   * Add a message to the pending conversation
   */
  addMessage(sessionId: string, message: ConversationMessage): void {
    if (!this.pendingConversations.has(sessionId)) {
      this.startConversation(sessionId);
    }
    const messages = this.pendingConversations.get(sessionId)!;
    messages.push(message);
  }

  /**
   * Track resource recommendations made during conversation
   */
  trackResourceRecommendation(
    sessionId: string,
    resourceId: string,
    resourceTitle: string,
    resourceCategory: string
  ): void {
    if (!this.pendingResources.has(sessionId)) {
      this.pendingResources.set(sessionId, []);
    }
    const resources = this.pendingResources.get(sessionId)!;
    resources.push({
      resourceId,
      resourceTitle,
      resourceCategory,
      recommendedAt: new Date(),
      wasHelpful: undefined,
      feedbackReceived: false
    });
    console.log(`Resource tracked for ${sessionId}: ${resourceTitle}`);
  }

  /**
   * Record feedback on a recommended resource
   */
  async recordResourceFeedback(
    sessionId: string,
    resourceId: string,
    wasHelpful: boolean
  ): Promise<void> {
    const resources = this.pendingResources.get(sessionId);
    if (resources) {
      const resource = resources.find(r => r.resourceId === resourceId);
      if (resource) {
        resource.wasHelpful = wasHelpful;
        resource.feedbackReceived = true;
      }
    }

    // Store feedback to database for effectiveness tracking
    if (this.supabase) {
      try {
        await this.supabase.from('ivor_resource_effectiveness').upsert({
          resource_id: resourceId,
          session_id: sessionId,
          was_helpful: wasHelpful,
          feedback_at: new Date().toISOString()
        }, {
          onConflict: 'resource_id,session_id'
        });
      } catch (error) {
        console.error('Error storing resource feedback:', error);
      }
    }
  }

  /**
   * Extract themes from conversation using GROQ AI
   */
  async extractThemes(messages: ConversationMessage[]): Promise<ExtractedThemes> {
    if (!this.isAIEnabled || !this.groq || messages.length === 0) {
      return this.extractThemesKeywordBased(messages);
    }

    try {
      // Prepare conversation text for analysis
      const conversationText = messages
        .filter(m => m.role !== 'system')
        .map(m => `${m.role === 'user' ? 'User' : 'IVOR'}: ${m.content}`)
        .join('\n');

      const response = await this.groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: `You are an AI analyst extracting themes from IVOR conversations with Black queer community members.
Analyze the conversation and extract:
1. Primary themes (2-5 main topics discussed)
2. Emotional tone (calm, stressed, hopeful, uncertain, joyful, crisis)
3. Urgency level (low, medium, high, critical)
4. Topic categories from: [sexual_health, mental_health, housing, legal_rights, employment, community, identity, relationships, wellness, crisis, general_support]
5. Community needs addressed
6. Sentiment score (-1 to 1, where -1 is very negative, 0 is neutral, 1 is very positive)

Respond in valid JSON format only:
{
  "primaryThemes": ["theme1", "theme2"],
  "emotionalTone": "tone",
  "urgencyLevel": "level",
  "topicCategories": ["category1"],
  "communityNeeds": ["need1"],
  "sentimentScore": 0.5
}`
          },
          {
            role: 'user',
            content: `Analyze this IVOR conversation:\n\n${conversationText}`
          }
        ],
        max_tokens: 500,
        temperature: 0.3
      });

      const responseText = response.choices[0]?.message?.content || '';

      // Parse JSON response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          primaryThemes: parsed.primaryThemes || [],
          emotionalTone: parsed.emotionalTone || 'neutral',
          urgencyLevel: parsed.urgencyLevel || 'low',
          topicCategories: parsed.topicCategories || ['general_support'],
          communityNeeds: parsed.communityNeeds || [],
          sentimentScore: parsed.sentimentScore || 0
        };
      }

      return this.extractThemesKeywordBased(messages);
    } catch (error) {
      console.error('Error extracting themes with AI:', error);
      return this.extractThemesKeywordBased(messages);
    }
  }

  /**
   * Fallback keyword-based theme extraction
   */
  private extractThemesKeywordBased(messages: ConversationMessage[]): ExtractedThemes {
    const allText = messages
      .filter(m => m.role === 'user')
      .map(m => m.content.toLowerCase())
      .join(' ');

    const themes: string[] = [];
    const categories: string[] = [];

    // Keyword-based detection
    const keywordMap: Record<string, { theme: string; category: string }> = {
      'hiv|prep|pep|sexual health|sti|testing': { theme: 'Sexual Health Concerns', category: 'sexual_health' },
      'therapy|counselling|depression|anxiety|mental health': { theme: 'Mental Health Support', category: 'mental_health' },
      'housing|evicted|homeless|rent': { theme: 'Housing Needs', category: 'housing' },
      'discrimination|rights|legal|employment|tribunal': { theme: 'Legal/Rights Issues', category: 'legal_rights' },
      'job|work|career|employment': { theme: 'Employment', category: 'employment' },
      'community|group|events|pride|support group': { theme: 'Community Connection', category: 'community' },
      'identity|coming out|transition|queer|lgbtq': { theme: 'Identity Exploration', category: 'identity' },
      'relationship|partner|dating|family': { theme: 'Relationships', category: 'relationships' },
      'wellness|health|fitness|self-care': { theme: 'Wellness', category: 'wellness' },
      'crisis|emergency|suicidal|urgent': { theme: 'Crisis Support', category: 'crisis' }
    };

    for (const [pattern, value] of Object.entries(keywordMap)) {
      if (new RegExp(pattern).test(allText)) {
        if (!themes.includes(value.theme)) themes.push(value.theme);
        if (!categories.includes(value.category)) categories.push(value.category);
      }
    }

    // Default if no themes detected
    if (themes.length === 0) {
      themes.push('General Support');
      categories.push('general_support');
    }

    // Detect emotional tone
    let emotionalTone = 'calm';
    if (/stress|overwhelm|panic|anxious/.test(allText)) emotionalTone = 'stressed';
    else if (/crisis|emergency|desperate|suicidal/.test(allText)) emotionalTone = 'crisis';
    else if (/happy|excited|amazing|wonderful/.test(allText)) emotionalTone = 'joyful';
    else if (/confused|lost|unsure/.test(allText)) emotionalTone = 'uncertain';
    else if (/hopeful|optimistic|better/.test(allText)) emotionalTone = 'hopeful';

    // Detect urgency
    let urgencyLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
    if (/crisis|emergency|suicidal|immediate/.test(allText)) urgencyLevel = 'critical';
    else if (/urgent|asap|quickly|soon/.test(allText)) urgencyLevel = 'high';
    else if (/need|help|support/.test(allText)) urgencyLevel = 'medium';

    // Calculate sentiment
    const positiveWords = ['grateful', 'happy', 'excited', 'love', 'amazing', 'wonderful', 'great', 'good', 'thank'];
    const negativeWords = ['difficult', 'hard', 'struggle', 'stress', 'anxiety', 'worry', 'sad', 'bad', 'hate'];

    let positiveCount = 0;
    let negativeCount = 0;
    for (const word of positiveWords) {
      if (allText.includes(word)) positiveCount++;
    }
    for (const word of negativeWords) {
      if (allText.includes(word)) negativeCount++;
    }

    const sentimentScore = (positiveCount - negativeCount) / Math.max(1, positiveCount + negativeCount);

    return {
      primaryThemes: themes,
      emotionalTone,
      urgencyLevel,
      topicCategories: categories,
      communityNeeds: themes, // Same as themes for keyword-based
      sentimentScore
    };
  }

  /**
   * Store conversation intelligence to ivor_intelligence table
   */
  async storeConversationIntelligence(
    conversationId: string,
    sessionId: string,
    userId: string,
    journeyStage: string = 'growth'
  ): Promise<void> {
    const messages = this.pendingConversations.get(sessionId) || [];
    const resources = this.pendingResources.get(sessionId) || [];
    const startTime = this.conversationStartTimes.get(sessionId) || new Date();
    const endTime = new Date();

    if (messages.length === 0) {
      console.log(`No messages to store for session ${sessionId}`);
      return;
    }

    // Extract themes
    const themes = await this.extractThemes(messages);

    // Calculate conversation duration
    const duration = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);

    // Create summary
    const summary: ConversationSummary = {
      conversationId,
      sessionId,
      userId,
      themes,
      resourcesRecommended: resources,
      journeyStage,
      duration,
      messageCount: messages.length,
      startedAt: startTime,
      endedAt: endTime
    };

    // Store to database
    if (this.supabase) {
      try {
        // Store conversation themes to ivor_intelligence
        await this.supabase.from('ivor_intelligence').insert({
          id: uuidv4(),
          intelligence_type: 'conversation_themes',
          ivor_service: 'ivor-core',
          ivor_endpoint: '/api/chat',
          intelligence_data: {
            conversation_id: conversationId,
            session_id: sessionId,
            themes: themes.primaryThemes,
            topic_categories: themes.topicCategories,
            emotional_tone: themes.emotionalTone,
            sentiment_score: themes.sentimentScore,
            resources_recommended: resources.map(r => ({
              id: r.resourceId,
              title: r.resourceTitle,
              category: r.resourceCategory
            })),
            journey_stage: journeyStage,
            message_count: messages.length,
            duration_seconds: duration
          },
          summary: `Conversation about ${themes.primaryThemes.join(', ')} with ${themes.emotionalTone} tone`,
          key_insights: themes.communityNeeds,
          actionable_items: this.generateActionableItems(themes, resources),
          relevance_score: this.calculateRelevanceScore(themes, messages.length),
          priority: this.calculatePriority(themes.urgencyLevel),
          urgency: themes.urgencyLevel === 'critical' ? 'critical' :
                   themes.urgencyLevel === 'high' ? 'high' : 'normal',
          data_timestamp: endTime.toISOString(),
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
          is_stale: false,
          times_used: 0,
          tags: [...themes.topicCategories, themes.emotionalTone, journeyStage],
          metadata: {
            user_id_hash: this.hashUserId(userId),
            is_anonymous: userId === 'anonymous'
          }
        });

        console.log(`Stored conversation intelligence for ${conversationId}`);

        // Store resource effectiveness data
        if (resources.length > 0) {
          for (const resource of resources) {
            await this.supabase.from('ivor_resource_recommendations').upsert({
              id: uuidv4(),
              conversation_id: conversationId,
              resource_id: resource.resourceId,
              resource_title: resource.resourceTitle,
              resource_category: resource.resourceCategory,
              journey_stage: journeyStage,
              topic_categories: themes.topicCategories,
              was_helpful: resource.wasHelpful,
              recommended_at: resource.recommendedAt.toISOString()
            });
          }
          console.log(`Stored ${resources.length} resource recommendations`);
        }

        // Update trending topics aggregation
        await this.updateTrendingTopics(themes);

      } catch (error) {
        console.error('Error storing conversation intelligence:', error);
      }
    } else {
      console.log('Mock: Would store conversation intelligence:', summary);
    }

    // Clean up
    this.pendingConversations.delete(sessionId);
    this.pendingResources.delete(sessionId);
    this.conversationStartTimes.delete(sessionId);
  }

  /**
   * Update trending topics based on conversation themes
   */
  private async updateTrendingTopics(themes: ExtractedThemes): Promise<void> {
    if (!this.supabase) return;

    try {
      // Check if we have a recent trending topics entry (last hour)
      const { data: existing } = await this.supabase
        .from('ivor_intelligence')
        .select('id, intelligence_data')
        .eq('intelligence_type', 'trending_topics')
        .gte('data_timestamp', new Date(Date.now() - 60 * 60 * 1000).toISOString())
        .order('data_timestamp', { ascending: false })
        .limit(1);

      if (existing && existing.length > 0) {
        // Update existing entry
        const current = existing[0];
        const currentData = current.intelligence_data as Record<string, any>;
        const topicCounts = currentData.topic_counts || {};

        // Increment counts for each theme
        for (const theme of themes.primaryThemes) {
          topicCounts[theme] = (topicCounts[theme] || 0) + 1;
        }
        for (const category of themes.topicCategories) {
          topicCounts[`category:${category}`] = (topicCounts[`category:${category}`] || 0) + 1;
        }

        await this.supabase
          .from('ivor_intelligence')
          .update({
            intelligence_data: {
              ...currentData,
              topic_counts: topicCounts,
              last_updated: new Date().toISOString(),
              total_conversations: (currentData.total_conversations || 0) + 1
            },
            summary: this.generateTrendingSummary(topicCounts),
            updated_at: new Date().toISOString()
          })
          .eq('id', current.id);
      } else {
        // Create new trending topics entry
        const topicCounts: Record<string, number> = {};
        for (const theme of themes.primaryThemes) {
          topicCounts[theme] = 1;
        }
        for (const category of themes.topicCategories) {
          topicCounts[`category:${category}`] = 1;
        }

        await this.supabase.from('ivor_intelligence').insert({
          id: uuidv4(),
          intelligence_type: 'trending_topics',
          ivor_service: 'ivor-core',
          ivor_endpoint: '/api/chat',
          intelligence_data: {
            topic_counts: topicCounts,
            total_conversations: 1,
            window_start: new Date().toISOString(),
            last_updated: new Date().toISOString()
          },
          summary: this.generateTrendingSummary(topicCounts),
          key_insights: themes.primaryThemes,
          actionable_items: ['Review trending topics for content opportunities'],
          relevance_score: 0.7,
          priority: 'medium',
          urgency: 'normal',
          data_timestamp: new Date().toISOString(),
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
          is_stale: false,
          times_used: 0,
          tags: ['trending', 'community_questions']
        });
      }
    } catch (error) {
      console.error('Error updating trending topics:', error);
    }
  }

  /**
   * Generate trending summary from topic counts
   */
  private generateTrendingSummary(topicCounts: Record<string, number>): string {
    const sorted = Object.entries(topicCounts)
      .filter(([key]) => !key.startsWith('category:'))
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3);

    if (sorted.length === 0) return 'No trending topics yet';

    return `Community asking about: ${sorted.map(([topic, count]) => `${topic} (${count})`).join(', ')}`;
  }

  /**
   * Generate actionable items from conversation analysis
   */
  private generateActionableItems(themes: ExtractedThemes, resources: ResourceRecommendation[]): string[] {
    const items: string[] = [];

    // Based on themes
    if (themes.primaryThemes.some(t => t.includes('Sexual Health'))) {
      items.push('Herald: Include sexual health resources in next newsletter');
    }
    if (themes.primaryThemes.some(t => t.includes('Mental Health'))) {
      items.push('Griot: Feature mental health support story');
    }
    if (themes.primaryThemes.some(t => t.includes('Community'))) {
      items.push('Weaver: Highlight upcoming community events');
    }
    if (themes.urgencyLevel === 'critical' || themes.urgencyLevel === 'high') {
      items.push('Alert: High urgency conversation - review crisis response resources');
    }

    // Based on resources
    if (resources.length > 0) {
      const categories = Array.from(new Set(resources.map(r => r.resourceCategory)));
      items.push(`Track resource effectiveness for: ${categories.join(', ')}`);
    }

    if (items.length === 0) {
      items.push('General engagement - continue building community trust');
    }

    return items;
  }

  /**
   * Calculate relevance score based on conversation characteristics
   */
  private calculateRelevanceScore(themes: ExtractedThemes, messageCount: number): number {
    let score = 0.5; // Base score

    // More messages = more engaged conversation
    if (messageCount > 5) score += 0.1;
    if (messageCount > 10) score += 0.1;

    // High urgency increases relevance
    if (themes.urgencyLevel === 'critical') score += 0.2;
    else if (themes.urgencyLevel === 'high') score += 0.1;

    // Multiple themes indicate rich conversation
    if (themes.primaryThemes.length > 2) score += 0.1;

    // Cap at 1.0
    return Math.min(score, 1.0);
  }

  /**
   * Calculate priority from urgency level
   */
  private calculatePriority(urgency: string): 'low' | 'medium' | 'high' | 'critical' {
    switch (urgency) {
      case 'critical': return 'critical';
      case 'high': return 'high';
      case 'medium': return 'medium';
      default: return 'low';
    }
  }

  /**
   * Hash user ID for privacy
   */
  private hashUserId(userId: string): string {
    // Simple hash for demo - use proper hashing in production
    return Buffer.from(userId).toString('base64').substring(0, 12);
  }

  /**
   * Get community insights dashboard data
   */
  async getCommunityInsights(): Promise<{
    trendingTopics: { topic: string; count: number }[];
    topThemes: { theme: string; percentage: number }[];
    emotionalToneBreakdown: Record<string, number>;
    resourceEffectiveness: { resourceId: string; title: string; helpfulRate: number }[];
  } | null> {
    if (!this.supabase) {
      console.log('Mock: Would return community insights');
      return null;
    }

    try {
      // Get trending topics
      const { data: trendingData } = await this.supabase
        .from('ivor_intelligence')
        .select('intelligence_data')
        .eq('intelligence_type', 'trending_topics')
        .order('data_timestamp', { ascending: false })
        .limit(1);

      let trendingTopics: { topic: string; count: number }[] = [];
      if (trendingData && trendingData.length > 0) {
        const topicCounts = (trendingData[0].intelligence_data as Record<string, any>).topic_counts || {};
        trendingTopics = Object.entries(topicCounts)
          .filter(([key]) => !key.startsWith('category:'))
          .map(([topic, count]) => ({ topic, count: count as number }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10);
      }

      // Get conversation themes from last 7 days
      const { data: conversationData } = await this.supabase
        .from('ivor_intelligence')
        .select('intelligence_data')
        .eq('intelligence_type', 'conversation_themes')
        .gte('data_timestamp', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      // Aggregate themes
      const themeCounts: Record<string, number> = {};
      const emotionalTones: Record<string, number> = {};
      let totalConversations = 0;

      if (conversationData) {
        for (const row of conversationData) {
          const data = row.intelligence_data as Record<string, any>;
          totalConversations++;

          // Count themes
          for (const theme of (data.themes || [])) {
            themeCounts[theme] = (themeCounts[theme] || 0) + 1;
          }

          // Count emotional tones
          const tone = data.emotional_tone || 'unknown';
          emotionalTones[tone] = (emotionalTones[tone] || 0) + 1;
        }
      }

      const topThemes = Object.entries(themeCounts)
        .map(([theme, count]) => ({
          theme,
          percentage: Math.round((count / Math.max(totalConversations, 1)) * 100)
        }))
        .sort((a, b) => b.percentage - a.percentage)
        .slice(0, 5);

      // Get resource effectiveness (mock for now - would need actual feedback data)
      const resourceEffectiveness: { resourceId: string; title: string; helpfulRate: number }[] = [];

      return {
        trendingTopics,
        topThemes,
        emotionalToneBreakdown: emotionalTones,
        resourceEffectiveness
      };
    } catch (error) {
      console.error('Error fetching community insights:', error);
      return null;
    }
  }

  /**
   * Check if service is properly initialized
   */
  isInitialized(): boolean {
    return this.supabase !== null;
  }

  /**
   * Check if AI theme extraction is available
   */
  isAIExtractEnabled(): boolean {
    return this.isAIEnabled;
  }
}

export const conversationIntelligenceService = new ConversationIntelligenceService();
export default conversationIntelligenceService;
