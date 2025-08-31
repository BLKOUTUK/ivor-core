"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WeeklyContentReviewService = void 0;
const UKKnowledgeBase_js_1 = require("./UKKnowledgeBase.js");
const TrustScoreService_js_1 = require("./TrustScoreService.js");
const supabase_js_1 = require("@supabase/supabase-js");
/**
 * Weekly Content Review Service
 * Reviews new newsroom articles and events submissions to update IVOR's knowledge base
 */
class WeeklyContentReviewService {
    constructor() {
        this.isEnabled = false;
        this.knowledgeBase = new UKKnowledgeBase_js_1.UKKnowledgeBase();
        this.trustScoreService = new TrustScoreService_js_1.TrustScoreService();
        // Initialize Supabase if credentials are available
        if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
            this.supabase = (0, supabase_js_1.createClient)(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
            this.isEnabled = true;
            console.log('📚 WeeklyContentReviewService: Supabase connection established');
        }
        else {
            console.log('⚠️ WeeklyContentReviewService: Disabled - no Supabase credentials');
        }
    }
    /**
     * Main weekly review process
     */
    async performWeeklyReview() {
        if (!this.isEnabled) {
            console.log('📚 Weekly review skipped - service disabled');
            return {
                articlesReviewed: 0,
                eventsReviewed: 0,
                knowledgeEntriesCreated: 0,
                resourcesCreated: 0,
                summary: 'Service disabled - no database connection'
            };
        }
        console.log('📚 Starting weekly content review...');
        const reviewStart = Date.now();
        try {
            // Get new content from past week
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            const [newArticles, newEvents] = await Promise.all([
                this.getNewNewsArticles(weekAgo),
                this.getNewEvents(weekAgo)
            ]);
            console.log(`📰 Found ${newArticles.length} new articles, ${newEvents.length} new events`);
            // Process articles for knowledge extraction
            const knowledgeEntries = await this.extractKnowledgeFromArticles(newArticles);
            // Process events for resource creation
            const eventResources = await this.createResourcesFromEvents(newEvents);
            // Validate and score new content
            const validatedKnowledge = await this.validateAndScoreKnowledge(knowledgeEntries);
            const validatedResources = await this.validateAndScoreResources(eventResources);
            // Store validated content
            const storedKnowledge = await this.storeKnowledgeEntries(validatedKnowledge);
            const storedResources = await this.storeResources(validatedResources);
            const reviewTime = Date.now() - reviewStart;
            const summary = `Weekly review completed in ${reviewTime}ms. Processed ${newArticles.length} articles and ${newEvents.length} events, creating ${storedKnowledge} knowledge entries and ${storedResources} resources.`;
            console.log(`✅ ${summary}`);
            return {
                articlesReviewed: newArticles.length,
                eventsReviewed: newEvents.length,
                knowledgeEntriesCreated: storedKnowledge,
                resourcesCreated: storedResources,
                summary
            };
        }
        catch (error) {
            console.error('❌ Error during weekly review:', error);
            throw error;
        }
    }
    /**
     * Get new newsroom articles from past week
     */
    async getNewNewsArticles(since) {
        try {
            const { data, error } = await this.supabase
                .from('newsroom_articles')
                .select('*')
                .gte('created_at', since.toISOString())
                .eq('status', 'published')
                .order('created_at', { ascending: false });
            if (error)
                throw error;
            return data || [];
        }
        catch (error) {
            console.error('Error fetching new articles:', error);
            return [];
        }
    }
    /**
     * Get new events from past week
     */
    async getNewEvents(since) {
        try {
            // Assuming events are stored in a separate table
            const { data, error } = await this.supabase
                .from('community_events')
                .select('*')
                .gte('created_at', since.toISOString())
                .eq('status', 'approved')
                .order('created_at', { ascending: false });
            if (error)
                throw error;
            return data || [];
        }
        catch (error) {
            console.error('Error fetching new events:', error);
            return [];
        }
    }
    /**
     * Extract knowledge entries from articles using AI analysis
     */
    async extractKnowledgeFromArticles(articles) {
        const knowledgeEntries = [];
        for (const article of articles) {
            try {
                // Analyze article content for relevant health/community information
                const relevantTopics = this.identifyRelevantTopics(article.content);
                if (relevantTopics.length === 0) {
                    console.log(`📰 Article "${article.title}" - no relevant topics found`);
                    continue;
                }
                // Create knowledge entry
                const knowledgeEntry = {
                    id: `article-${article.id}-${Date.now()}`,
                    title: this.generateKnowledgeTitle(article.title, relevantTopics),
                    content: this.extractRelevantContent(article.content, relevantTopics),
                    category: this.categorizeContent(relevantTopics),
                    journeyStages: this.mapToJourneyStages(relevantTopics),
                    location: this.extractLocation(article.content),
                    tags: [...relevantTopics, 'community-article', article.category?.toLowerCase()].filter(Boolean),
                    sources: [article.source_url || `newsroom-article-${article.id}`],
                    lastUpdated: new Date(article.updated_at || article.created_at),
                    verificationStatus: 'pending', // Requires manual verification
                    communityValidated: false // New content not yet validated
                };
                knowledgeEntries.push(knowledgeEntry);
                console.log(`📝 Created knowledge entry: "${knowledgeEntry.title}"`);
            }
            catch (error) {
                console.error(`Error processing article ${article.id}:`, error);
            }
        }
        return knowledgeEntries;
    }
    /**
     * Create resources from community events
     */
    async createResourcesFromEvents(events) {
        const resources = [];
        for (const event of events) {
            try {
                const resource = {
                    id: `event-${event.id}`,
                    title: event.title,
                    description: event.description || 'Community event',
                    category: 'Community Events',
                    journeyStages: this.determineEventJourneyStages(event),
                    website: event.website || event.registration_url,
                    email: event.contact_email,
                    locations: this.parseEventLocations(event.location),
                    specializations: this.extractEventSpecializations(event),
                    accessRequirements: this.parseAccessRequirements(event),
                    cost: this.determineEventCost(event),
                    culturalCompetency: {
                        lgbtqSpecific: this.isLGBTQEvent(event),
                        blackSpecific: this.isBlackSpecificEvent(event),
                        transSpecific: this.isTransSpecificEvent(event),
                        disabilityAware: this.isAccessibleEvent(event)
                    },
                    emergency: false, // Events are not emergency resources
                    availability: this.formatEventSchedule(event),
                    languages: ['English'] // Default, could be enhanced
                };
                resources.push(resource);
                console.log(`🎉 Created event resource: "${resource.title}"`);
            }
            catch (error) {
                console.error(`Error processing event ${event.id}:`, error);
            }
        }
        return resources;
    }
    /**
     * Identify relevant topics in article content
     */
    identifyRelevantTopics(content) {
        const topicKeywords = {
            'hiv': ['hiv', 'aids', 'antiretroviral', 'viral load', 'cd4'],
            'prep': ['prep', 'pre-exposure prophylaxis', 'hiv prevention'],
            'mental-health': ['mental health', 'therapy', 'depression', 'anxiety', 'wellbeing'],
            'discrimination': ['discrimination', 'harassment', 'equality', 'rights', 'prejudice'],
            'housing': ['housing', 'homelessness', 'accommodation', 'eviction', 'rent'],
            'employment': ['employment', 'workplace', 'job', 'career', 'work'],
            'legal': ['legal', 'law', 'court', 'tribunal', 'solicitor'],
            'community': ['community', 'support group', 'peer support', 'networking'],
            'healthcare': ['healthcare', 'gp', 'nhs', 'hospital', 'clinic'],
            'education': ['education', 'training', 'course', 'workshop', 'learning']
        };
        const lowerContent = content.toLowerCase();
        const relevantTopics = [];
        for (const [topic, keywords] of Object.entries(topicKeywords)) {
            if (keywords.some(keyword => lowerContent.includes(keyword))) {
                relevantTopics.push(topic);
            }
        }
        return relevantTopics;
    }
    /**
     * Validate and score new knowledge entries
     */
    async validateAndScoreKnowledge(entries) {
        const validated = [];
        for (const entry of entries) {
            try {
                // Calculate trust score
                const trustScore = await this.trustScoreService.calculateKnowledgeTrustScore(entry);
                // Only include entries with reasonable trust scores
                if (trustScore >= 0.3) {
                    validated.push(entry);
                    console.log(`✅ Validated knowledge entry: "${entry.title}" (trust: ${trustScore.toFixed(3)})`);
                }
                else {
                    console.log(`❌ Rejected knowledge entry: "${entry.title}" (trust: ${trustScore.toFixed(3)})`);
                }
            }
            catch (error) {
                console.error(`Error validating knowledge entry ${entry.id}:`, error);
            }
        }
        return validated;
    }
    /**
     * Validate and score new resources
     */
    async validateAndScoreResources(resources) {
        const validated = [];
        for (const resource of resources) {
            try {
                // Calculate trust score
                const trustScore = await this.trustScoreService.calculateResourceTrustScore(resource);
                // Resources from community events should generally be included
                if (trustScore >= 0.2) {
                    validated.push(resource);
                    console.log(`✅ Validated resource: "${resource.title}" (trust: ${trustScore.toFixed(3)})`);
                }
                else {
                    console.log(`❌ Rejected resource: "${resource.title}" (trust: ${trustScore.toFixed(3)})`);
                }
            }
            catch (error) {
                console.error(`Error validating resource ${resource.id}:`, error);
            }
        }
        return validated;
    }
    /**
     * Store knowledge entries to database
     */
    async storeKnowledgeEntries(entries) {
        let stored = 0;
        for (const entry of entries) {
            try {
                const { error } = await this.supabase
                    .from('knowledge_entries')
                    .insert({
                    id: entry.id,
                    title: entry.title,
                    content: entry.content,
                    category: entry.category,
                    journey_stages: entry.journeyStages,
                    location: entry.location,
                    tags: entry.tags,
                    sources: entry.sources,
                    last_updated: entry.lastUpdated.toISOString(),
                    verification_status: entry.verificationStatus,
                    community_validated: entry.communityValidated,
                    trust_score: 0.5 // Will be calculated by TrustScoreService
                });
                if (error) {
                    console.error(`Error storing knowledge entry ${entry.id}:`, error);
                }
                else {
                    stored++;
                }
            }
            catch (error) {
                console.error(`Error storing knowledge entry ${entry.id}:`, error);
            }
        }
        return stored;
    }
    /**
     * Store resources to database or update in-memory store
     */
    async storeResources(resources) {
        // For now, log resources (in production, these would be stored in database)
        resources.forEach(resource => {
            console.log(`📦 Storing resource: ${resource.title}`);
            // TODO: Store in resources table or update UKKnowledgeBase
        });
        return resources.length;
    }
    // Helper methods for content analysis
    generateKnowledgeTitle(articleTitle, topics) {
        return `${articleTitle} - ${topics.join(', ')}`;
    }
    extractRelevantContent(content, topics) {
        // Extract most relevant paragraphs (simplified)
        return content.substring(0, 1000) + (content.length > 1000 ? '...' : '');
    }
    categorizeContent(topics) {
        const categoryMap = {
            'hiv': 'HIV Health',
            'prep': 'HIV Prevention',
            'mental-health': 'Mental Health',
            'discrimination': 'Legal Rights',
            'housing': 'Housing Support',
            'community': 'Community Support'
        };
        return categoryMap[topics[0]] || 'General';
    }
    mapToJourneyStages(topics) {
        const stageMap = {
            'hiv': ['crisis', 'stabilization'],
            'mental-health': ['crisis', 'stabilization', 'growth'],
            'community': ['community_healing', 'advocacy'],
            'discrimination': ['advocacy']
        };
        const stages = new Set();
        topics.forEach(topic => {
            const topicStages = stageMap[topic] || ['growth'];
            topicStages.forEach(stage => stages.add(stage));
        });
        return Array.from(stages);
    }
    extractLocation(content) {
        // Simple location extraction (could be enhanced with NLP)
        const locations = ['london', 'manchester', 'birmingham', 'glasgow'];
        const found = locations.filter(loc => content.toLowerCase().includes(loc));
        return found.length > 0 ? found : ['unknown'];
    }
    // Event processing helper methods
    determineEventJourneyStages(event) {
        const eventType = event.event_type?.toLowerCase() || '';
        const description = event.description?.toLowerCase() || '';
        if (eventType.includes('support') || description.includes('support')) {
            return ['stabilization', 'community_healing'];
        }
        if (eventType.includes('advocacy') || description.includes('campaign')) {
            return ['advocacy'];
        }
        return ['growth', 'community_healing'];
    }
    parseEventLocations(location) {
        if (!location)
            return ['unknown'];
        const lowerLocation = location.toLowerCase();
        const ukLocations = ['london', 'manchester', 'birmingham', 'glasgow', 'cardiff', 'belfast', 'bristol'];
        const found = ukLocations.filter(loc => lowerLocation.includes(loc));
        if (found.length > 0)
            return found;
        if (lowerLocation.includes('online'))
            return ['unknown']; // Online events
        return ['other_urban'];
    }
    extractEventSpecializations(event) {
        const specializations = [];
        const eventType = event.event_type?.toLowerCase() || '';
        const tags = event.tags || [];
        if (eventType.includes('workshop'))
            specializations.push('workshop');
        if (eventType.includes('support'))
            specializations.push('peer support');
        if (tags.includes('networking'))
            specializations.push('networking');
        return specializations.length > 0 ? specializations : ['community event'];
    }
    parseAccessRequirements(event) {
        const requirements = [];
        if (event.requires_registration)
            requirements.push('registration required');
        if (event.age_restriction)
            requirements.push(`age ${event.age_restriction}+`);
        if (event.membership_required)
            requirements.push('membership required');
        return requirements.length > 0 ? requirements : ['none'];
    }
    determineEventCost(event) {
        if (event.is_free || event.cost === 0)
            return 'free';
        if (event.sliding_scale)
            return 'sliding_scale';
        return 'paid';
    }
    isLGBTQEvent(event) {
        const content = `${event.title} ${event.description} ${event.tags?.join(' ')}`.toLowerCase();
        return ['lgbtq', 'lgbt', 'queer', 'gay', 'lesbian', 'bisexual', 'trans', 'pride'].some(term => content.includes(term));
    }
    isBlackSpecificEvent(event) {
        const content = `${event.title} ${event.description} ${event.tags?.join(' ')}`.toLowerCase();
        return ['black', 'african', 'caribbean', 'bme', 'poc'].some(term => content.includes(term));
    }
    isTransSpecificEvent(event) {
        const content = `${event.title} ${event.description} ${event.tags?.join(' ')}`.toLowerCase();
        return ['trans', 'transgender', 'non-binary', 'gender'].some(term => content.includes(term));
    }
    isAccessibleEvent(event) {
        return event.wheelchair_accessible || event.accessibility_info != null;
    }
    formatEventSchedule(event) {
        if (event.start_date) {
            const startDate = new Date(event.start_date).toLocaleDateString();
            const startTime = event.start_time || '';
            return `${startDate} ${startTime}`.trim();
        }
        return 'Check event details';
    }
    /**
     * Schedule weekly cron job
     */
    static scheduleWeeklyReview() {
        const service = new WeeklyContentReviewService();
        // Run every Sunday at 2 AM
        const cronExpression = '0 2 * * 0';
        console.log(`📅 Scheduling weekly content review: ${cronExpression}`);
        // In production, use a proper cron library like node-cron
        // For now, just log the schedule
        console.log('🔄 To enable weekly reviews, implement cron scheduling in production');
        console.log('💡 Suggested implementation: node-cron or GitHub Actions scheduled workflow');
    }
    /**
     * Get service health status
     */
    getHealthStatus() {
        return {
            enabled: this.isEnabled,
            lastRun: null, // TODO: Track last run time
            nextRun: null, // TODO: Calculate next Sunday 2 AM
            dbConnection: !!this.supabase
        };
    }
}
exports.WeeklyContentReviewService = WeeklyContentReviewService;
exports.default = WeeklyContentReviewService;
//# sourceMappingURL=WeeklyContentReviewService.js.map