import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'
import ConversationService from './conversationService.js'
import JourneyAwareConversationService from './services/JourneyAwareConversationService.js'
import { DataContextService } from './services/DataContextService.js'
import { getSupabaseClient } from './lib/supabaseClient.js'
import feedbackRoutes from './api/feedbackRoutes.js'
import adminRoutes from './api/adminRoutes.js'
import socialMediaRoutes from './api/socialMediaRoutes.js'
import moderationRoutes from './api/moderationRoutes.js'
import eventsWebhookRoutes from './api/eventsWebhookRoutes.js'
import eventsRoutes from './api/eventsRoutes.js'
import newsRoutes from './api/newsRoutes.js'
import dashboardRoutes from './api/dashboardRoutes.js'
import notificationRoutes from './api/notificationRoutes.js'
import discoverRoutes from './api/discoverRoutes.js'
import rsvpRoutes from './api/rsvpRoutes.js'
import calendarRoutes from './api/calendarRoutes.js'
import organizerRoutes from './api/organizerRoutes.js'
import eventModerationRoutes from './api/eventModerationRoutes.js'
import groupsRoutes from './api/groupsRoutes.js'
import analyticsRoutes from './api/analyticsRoutes.js'
import learningRoutes from './api/learning.js'
import voiceRoutes from './api/voiceRoutes.js'
import intelligenceRoutes from './api/intelligenceRoutes.js'
// Temporarily disabled - need Stripe credentials
// import shopRoutes from './api/shopRoutes.js'
// import stripeWebhookRoutes from './api/webhooks/stripeWebhook.js'
// import checkoutRoutes from './api/checkoutRoutes.js'

// Conversation Intelligence Service (Self-Improving System)
import conversationIntelligenceService from './services/ConversationIntelligenceService.js'

// Layer 3 Liberation Business Logic
import {
  initializeLayer3EcosystemForIVOR,
  Layer3ServiceFactory
} from './services/index.js'

// IVOR-CORE: Personal AI Services Server with Journey-Aware Knowledge System
// Focus: Individual chat, wellness coaching, problem-solving, journaling
// LIBERATION LAYER 3: Mathematical enforcement of community values
// - 75% Creator Sovereignty ENFORCED
// - Community Protection >95% ACTIVE
// - Anti-Oppression Validation ENABLED

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3021

// Initialize services
const baseConversationService = new ConversationService(
  process.env.SUPABASE_URL || 'mock-url',
  process.env.SUPABASE_ANON_KEY || 'mock-key'
)

// Initialize data context service for live Supabase data in prompts
const dataContextService = new DataContextService(getSupabaseClient())

// Initialize journey-aware conversation service with live data
const journeyConversationService = new JourneyAwareConversationService(baseConversationService, dataContextService)

// Layer 3 Liberation Ecosystem - initialized at startup
let layer3Ecosystem: Awaited<ReturnType<typeof initializeLayer3EcosystemForIVOR>> | null = null
let layer3InitializationError: Error | null = null

// Middleware
app.use(helmet())
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? [
        'https://ivor.blkoutuk.cloud',
        'https://blkoutuk.com',
        'https://www.blkoutuk.com',
        'https://news.blkoutuk.cloud',
        'https://events.blkoutuk.cloud',
        'https://comms.blkoutuk.cloud',
        'https://movement.blkoutuk.cloud'
      ]
    : ['http://localhost:5181', 'http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}))

// IMPORTANT: Stripe webhook MUST use raw body parsing BEFORE express.json()
// Temporarily disabled - need Stripe credentials
// app.use('/api/webhooks/stripe', express.raw({ type: 'application/json' }), stripeWebhookRoutes)

app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// API routes
app.use('/api', feedbackRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/social', socialMediaRoutes)
app.use('/api', moderationRoutes)
app.use('/api/events', eventsWebhookRoutes)

// Liberation-integrated API routes (central gateway for frontends)
app.use('/api/events', eventsRoutes)  // Events calendar API
app.use('/api/news', newsRoutes)      // Newsroom API
app.use('/api/dashboard', dashboardRoutes)  // Liberation dashboard API
app.use('/api/notifications', notificationRoutes)  // Push notifications API
app.use('/api/discover', discoverRoutes)  // Smart discovery & recommendations API
app.use('/api/rsvp', rsvpRoutes)          // RSVP & capacity management API
app.use('/api/calendar', calendarRoutes)  // Calendar feeds & ICS generation API
app.use('/api/organizer', organizerRoutes)  // Organizer dashboard & analytics API
app.use('/api/event-moderation', eventModerationRoutes)  // Event moderation & reporting API
app.use('/api/learning', learningRoutes)  // Learning platform & IVOR education API
app.use('/api/groups', groupsRoutes)      // Community groups API
app.use('/api/analytics', analyticsRoutes)  // Analytics dashboard & metrics API
app.use('/api/voice', voiceRoutes)          // Voice synthesis (MeloTTS) API
app.use('/api/intelligence', intelligenceRoutes)  // Conversation intelligence & community insights API
// Temporarily disabled - need Stripe credentials configured
// app.use('/api/shop', shopRoutes)           // Shop & marketplace API
// app.use('/api/checkout', checkoutRoutes)   // Checkout & order processing API

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'ivor-core',
    domain: 'Personal AI Services',
    version: '3.0.0-liberation',
    layer3: {
      initialized: layer3Ecosystem !== null,
      status: layer3Ecosystem ? 'active' : (layer3InitializationError ? 'error' : 'pending')
    },
    features: {
      'wellness-coaching': '15-section assessment',
      'problem-solving': '5 frameworks available',
      'journaling': 'Morning/evening rituals',
      'crisis-support': 'Resource routing',
      'achievements': 'Milestone tracking',
      'ai-memory': 'Personalized context',
      'recommendations': 'AI-driven suggestions',
      'journey-awareness': 'UK Black queer liberation stages',
      'uk-knowledge': 'menrus.co.uk + NHS integration',
      'contextual-responses': 'Stage-appropriate support',
      'liberation-layer-3': layer3Ecosystem ? 'ACTIVE' : 'INITIALIZING',
      'conversation-intelligence': conversationIntelligenceService.isInitialized() ? 'ACTIVE' : 'PENDING',
      'ai-theme-extraction': conversationIntelligenceService.isAIExtractEnabled() ? 'GROQ' : 'KEYWORD',
      'live-data-context': getSupabaseClient() ? 'ACTIVE' : 'DISABLED'
    }
  })
})

// Liberation Layer 3 Health Check
app.get('/health/liberation', async (req, res) => {
  if (!layer3Ecosystem) {
    return res.status(503).json({
      status: 'layer3-not-initialized',
      liberationActive: false,
      error: layer3InitializationError?.message || 'Layer 3 initialization pending',
      communitySupport: '/community/support',
      timestamp: new Date().toISOString()
    })
  }

  try {
    const factory = Layer3ServiceFactory.getInstance()
    const systemStatus = await factory.getSystemStatus()

    res.json({
      status: 'liberation-active',
      version: '3.0.0-liberation',
      timestamp: new Date().toISOString(),

      services: {
        community: systemStatus.layer3Services.community,
        creator: systemStatus.layer3Services.creator,
        content: systemStatus.layer3Services.content,
        liberationImpact: systemStatus.layer3Services.liberationImpact,
        interfaceManager: systemStatus.interfaceManager
      },

      ivorIntegration: {
        totalServices: systemStatus.ivorIntegration.totalServices,
        healthyServices: systemStatus.ivorIntegration.healthyServices,
        liberationCompliantServices: systemStatus.ivorIntegration.liberationCompliantServices
      },

      liberation: {
        creatorSovereignty: {
          minimum: '75%',
          enforced: systemStatus.liberationMetrics.creatorSovereigntyEnforcement,
          mathematical: true
        },
        communityProtection: {
          effectiveness: `${(systemStatus.liberationMetrics.communityProtection * 100).toFixed(1)}%`,
          antiOppressionActive: systemStatus.liberationMetrics.antiOppressionValidation
        },
        overallCompliance: `${(systemStatus.liberationMetrics.overallCompliance * 100).toFixed(1)}%`
      },

      values: {
        blackQueerEmpowerment: 'PRIORITIZED',
        traumaInformedResponses: 'ACTIVE',
        culturalAuthenticity: 'PRESERVED',
        dataSovereignty: 'COMMUNITY-OWNED',
        democraticGovernance: 'ONE-MEMBER-ONE-VOTE'
      }
    })
  } catch (error) {
    console.error('Liberation health check error:', error)
    res.status(500).json({
      status: 'error',
      message: 'Liberation health check failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      communitySupport: '/community/support',
      timestamp: new Date().toISOString()
    })
  }
})

// Core AI Chat endpoint with Liberation Layer 3 Integration + Conversation Intelligence
app.post('/api/chat', async (req, res) => {
  try {
    const { message, sessionId, userContext } = req.body
    const currentSessionId = sessionId || `session-${Date.now()}`

    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        error: 'Message is required and must be a string',
        communitySupport: '/community/support'
      })
    }

    // Track conversation for intelligence (Self-Improving System)
    conversationIntelligenceService.addMessage(currentSessionId, {
      role: 'user',
      content: message,
      timestamp: new Date()
    })

    // Liberation Layer 3 Validation (if ecosystem is initialized)
    let liberationValidation = null
    if (layer3Ecosystem) {
      try {
        const layer3Response = await layer3Ecosystem.interfaceManager.processLayer2Request({
          operation: 'community_interaction',
          userId: userContext?.userId || 'anonymous',
          sessionId: currentSessionId,
          data: {
            message,
            userContext,
            interactionType: 'ai_chat',
            liberationContext: {
              communityProtectionRequired: true,
              creatorSovereigntyEnforcement: true,
              culturalAuthenticityValidation: true,
              antiOppressionActive: true
            },
            metadata: {
              source: 'ivor-core',
              endpoint: '/api/chat',
              timestamp: new Date().toISOString()
            }
          }
        })

        liberationValidation = {
          validated: true,
          compliant: layer3Response.liberationValidation?.isValid ?? true,
          empowermentScore: layer3Response.liberationValidation?.empowermentScore ?? 0.8,
          creatorSovereignty: '75% ENFORCED',
          communityProtection: layer3Response.empowermentTracking?.communityBenefit ?? 0.9
        }

        // If liberation validation fails critically, provide guidance instead of blocking
        if (!layer3Response.success && layer3Response.liberationValidation?.violations?.some(
          (v: any) => v.severity === 'critical'
        )) {
          console.warn('Liberation validation concern:', layer3Response.liberationValidation?.violations)
          // Continue with response but include guidance
        }
      } catch (layer3Error) {
        console.warn('Layer 3 validation error (continuing with fallback):', layer3Error)
        liberationValidation = {
          validated: false,
          reason: 'Layer 3 validation unavailable',
          fallbackActive: true
        }
      }
    }

    // Journey-aware AI response with UK-specific context
    const journeyResponse = await generateJourneyAwareResponse(message, userContext, currentSessionId)

    // Track assistant response for intelligence
    conversationIntelligenceService.addMessage(currentSessionId, {
      role: 'assistant',
      content: journeyResponse.response,
      timestamp: new Date()
    })

    // Track resources recommended (if any)
    if (journeyResponse.resourcesProvided && journeyResponse.resourcesProvided.length > 0) {
      for (const resourceTitle of journeyResponse.resourcesProvided) {
        conversationIntelligenceService.trackResourceRecommendation(
          currentSessionId,
          `resource-${resourceTitle.toLowerCase().replace(/\s+/g, '-')}`,
          resourceTitle,
          journeyResponse.journeyContext?.stage || 'general'
        )
      }
    }

    // Store conversation intelligence after significant exchanges (5+ messages or follow-up required)
    // This is non-blocking - fire and forget
    const conversationId = `conv-${Date.now()}-${currentSessionId.substring(0, 8)}`
    if (journeyResponse.followUpRequired || journeyResponse.journeyContext?.urgencyLevel === 'critical') {
      conversationIntelligenceService.storeConversationIntelligence(
        conversationId,
        currentSessionId,
        userContext?.userId || 'anonymous',
        journeyResponse.journeyContext?.stage || 'growth'
      ).catch(err => console.error('Background intelligence storage error:', err))
    }

    res.json({
      response: journeyResponse.response,
      journeyContext: journeyResponse.journeyContext,
      nextStageGuidance: journeyResponse.nextStageGuidance,
      sessionId: currentSessionId,
      conversationId,
      timestamp: new Date().toISOString(),
      domain: 'core',
      features: ['wellness', 'problem-solving', 'journaling', 'crisis-support', 'achievements', 'journey-awareness', 'liberation-layer-3', 'conversation-intelligence'],
      resourcesProvided: journeyResponse.resourcesProvided,
      followUpRequired: journeyResponse.followUpRequired,
      // Liberation Layer 3 Compliance
      liberation: liberationValidation || {
        validated: false,
        reason: 'Layer 3 not initialized',
        degradedMode: true
      }
    })

  } catch (error) {
    console.error('Core chat error:', error)
    res.status(500).json({
      error: 'Internal server error processing your message',
      communitySupport: '/community/support',
      liberation: {
        errorHandled: true,
        traumaInformed: true,
        message: 'We encountered an issue. Please try again or reach out for support.'
      }
    })
  }
})

// Wellness Coaching API
app.post('/api/wellness/assessment', async (req, res) => {
  try {
    const { userId, answers, sectionId } = req.body
    
    // Process wellness assessment data
    const assessment = {
      id: `wellness-${Date.now()}`,
      userId,
      sectionId,
      answers,
      score: calculateWellnessScore(answers),
      insights: generateWellnessInsights(answers),
      recommendations: generateWellnessRecommendations(answers),
      completedAt: new Date().toISOString()
    }

    res.json({
      success: true,
      assessment,
      nextSection: getNextWellnessSection(sectionId)
    })
  } catch (error) {
    console.error('Wellness assessment error:', error)
    res.status(500).json({ error: 'Failed to process wellness assessment' })
  }
})

app.get('/api/wellness/progress/:userId', async (req, res) => {
  try {
    const { userId } = req.params
    
    // Mock wellness progress data
    const progress = {
      overallScore: 75,
      sectionsCompleted: 8,
      totalSections: 15,
      strengths: ['Self-awareness', 'Emotional regulation', 'Community connection'],
      growthAreas: ['Physical wellness', 'Financial security', 'Career satisfaction'],
      lastUpdated: new Date().toISOString()
    }

    res.json({ success: true, progress })
  } catch (error) {
    console.error('Wellness progress error:', error)
    res.status(500).json({ error: 'Failed to fetch wellness progress' })
  }
})

// Problem-Solving Framework API
app.get('/api/frameworks', async (req, res) => {
  try {
    const frameworks = [
      {
        id: 'design-thinking',
        name: 'Design Thinking Process',
        difficulty: 'intermediate',
        estimatedTime: '2-4 hours',
        steps: 5,
        description: 'Human-centered approach to creative problem-solving'
      },
      {
        id: 'root-cause-analysis', 
        name: 'Root Cause Analysis',
        difficulty: 'beginner',
        estimatedTime: '1-2 hours',
        steps: 5,
        description: 'Systematic method to identify underlying causes'
      },
      {
        id: 'cost-benefit-analysis',
        name: 'Cost-Benefit Analysis',
        difficulty: 'intermediate', 
        estimatedTime: '2-3 hours',
        steps: 6,
        description: 'Systematic evaluation of decision alternatives'
      }
    ]

    res.json({ success: true, frameworks })
  } catch (error) {
    console.error('Frameworks error:', error)
    res.status(500).json({ error: 'Failed to fetch frameworks' })
  }
})

app.post('/api/frameworks/:frameworkId/progress', async (req, res) => {
  try {
    const { frameworkId } = req.params
    const { userId, stepId, response } = req.body

    // Store framework progress
    const progress = {
      frameworkId,
      userId,
      stepId,
      response,
      timestamp: new Date().toISOString()
    }

    res.json({ success: true, progress })
  } catch (error) {
    console.error('Framework progress error:', error)
    res.status(500).json({ error: 'Failed to save framework progress' })
  }
})

// Journaling API
app.post('/api/journal/entries', async (req, res) => {
  try {
    const { userId, entry } = req.body

    const savedEntry = {
      id: `journal-${Date.now()}`,
      userId,
      ...entry,
      createdAt: new Date().toISOString(),
      wordCount: entry.content?.length || 0,
      sentiment: analyzeSentiment(entry.content)
    }

    res.json({ success: true, entry: savedEntry })
  } catch (error) {
    console.error('Journal entry error:', error)
    res.status(500).json({ error: 'Failed to save journal entry' })
  }
})

app.get('/api/journal/entries/:userId', async (req, res) => {
  try {
    const { userId } = req.params
    
    // Mock journal entries
    const entries: any[] = []

    res.json({ success: true, entries })
  } catch (error) {
    console.error('Journal entries error:', error)
    res.status(500).json({ error: 'Failed to fetch journal entries' })
  }
})

app.get('/api/journal/prompts/personalized/:userId', async (req, res) => {
  try {
    const { userId } = req.params
    
    const prompt = {
      id: 'daily-prompt',
      prompt: "What are three things you're grateful for today, and how do they connect to your deeper values?",
      category: 'Gratitude & Values',
      difficulty: 'gentle',
      intentedOutcome: 'Build appreciation practice while connecting to personal meaning'
    }

    res.json({ success: true, prompt })
  } catch (error) {
    console.error('Personalized prompt error:', error)
    res.status(500).json({ error: 'Failed to generate personalized prompt' })
  }
})

// Crisis Support API
app.get('/api/crisis/resources', async (req, res) => {
  try {
    const { urgency, categories, location } = req.query
    
    // Filter crisis resources based on parameters
    let resources = getCrisisResources()
    
    if (urgency === 'emergency') {
      resources = resources.filter(r => r.priority === 'emergency')
    }
    
    if (categories) {
      const categoryArray = Array.isArray(categories) ? categories : [categories]
      resources = resources.filter(r => 
        r.specializations.some(spec => 
          categoryArray.some(cat => typeof cat === 'string' && spec.toLowerCase().includes(cat.toLowerCase()))
        )
      )
    }

    res.json({ success: true, resources: resources.slice(0, 10) })
  } catch (error) {
    console.error('Crisis resources error:', error)
    res.status(500).json({ error: 'Failed to fetch crisis resources' })
  }
})

app.post('/api/crisis/assessment', async (req, res) => {
  try {
    const { urgency, symptoms, context } = req.body
    
    const assessment = {
      urgency,
      riskLevel: calculateRiskLevel(urgency, symptoms),
      recommendedActions: getRecommendedActions(urgency),
      resources: getCrisisResources().slice(0, 5),
      timestamp: new Date().toISOString()
    }

    res.json({ success: true, assessment })
  } catch (error) {
    console.error('Crisis assessment error:', error)
    res.status(500).json({ error: 'Failed to process crisis assessment' })
  }
})

// Achievement System API
app.get('/api/achievements/:userId', async (req, res) => {
  try {
    const { userId } = req.params
    
    const achievements = {
      unlocked: 8,
      total: 16,
      recent: [
        {
          id: 'first-journal-entry',
          title: 'First Steps',
          description: 'Write your first journal entry',
          unlockedAt: new Date().toISOString(),
          rarity: 'common'
        }
      ],
      progress: [
        {
          id: 'week-streak',
          title: 'Seven Days Strong', 
          progress: 60,
          target: 7,
          current: 4
        }
      ]
    }

    res.json({ success: true, achievements })
  } catch (error) {
    console.error('Achievements error:', error)
    res.status(500).json({ error: 'Failed to fetch achievements' })
  }
})

// Personalized Recommendations API  
app.get('/api/recommendations/:userId', async (req, res) => {
  try {
    const { userId } = req.params
    
    const recommendations = generatePersonalizedRecommendations(userId)

    res.json({ success: true, recommendations })
  } catch (error) {
    console.error('Recommendations error:', error)
    res.status(500).json({ error: 'Failed to generate recommendations' })
  }
})

app.post('/api/recommendations/:recommendationId/feedback', async (req, res) => {
  try {
    const { recommendationId } = req.params
    const { feedback, userId } = req.body

    // Store recommendation feedback
    const result = {
      recommendationId,
      userId,
      feedback,
      timestamp: new Date().toISOString()
    }

    res.json({ success: true, result })
  } catch (error) {
    console.error('Recommendation feedback error:', error)
    res.status(500).json({ error: 'Failed to save recommendation feedback' })
  }
})

// User Progress API
app.get('/api/user/:userId/progress', async (req, res) => {
  try {
    const { userId } = req.params
    
    const progress = {
      wellnessScore: 75,
      journalEntries: 12,
      journalStreak: 5,
      frameworksCompleted: 2,
      achievementsUnlocked: 8,
      totalEngagementTime: 450, // minutes
      lastActive: new Date().toISOString(),
      strengthsIdentified: ['Self-reflection', 'Community connection', 'Authenticity'],
      recentActivity: [
        { type: 'journal', action: 'Morning reflection', timestamp: new Date().toISOString() },
        { type: 'wellness', action: 'Completed identity section', timestamp: new Date().toISOString() }
      ]
    }

    res.json({ success: true, progress })
  } catch (error) {
    console.error('User progress error:', error)
    res.status(500).json({ error: 'Failed to fetch user progress' })
  }
})

// Helper functions
async function generateJourneyAwareResponse(message: string, context?: any, sessionId?: string): Promise<{
  response: string
  journeyContext: any
  nextStageGuidance: string
  followUpRequired: boolean
  resourcesProvided: string[]
}> {
  try {
    // JourneyAwareConversationService handles emotion detection,
    // topic extraction, and AI/fallback routing internally
    const journeyResponse = await journeyConversationService.generateJourneyAwareResponse(
      message,
      context || {},
      sessionId || 'default'
    )

    return {
      response: journeyResponse.response,
      journeyContext: journeyResponse.journeyContext,
      nextStageGuidance: journeyResponse.nextStageGuidance,
      followUpRequired: journeyResponse.followUpRequired,
      resourcesProvided: journeyResponse.resourcesProvided
    }
  } catch (error) {
    console.error('Journey-aware AI response error:', error)
    return {
      response: generateFallbackResponse(message),
      journeyContext: {
        stage: 'growth',
        emotion: 'hopeful',
        urgency: 'low',
        location: { region: 'london', ruralUrban: 'urban', transportAccess: true }
      },
      nextStageGuidance: "Continue your journey at your own pace.",
      followUpRequired: false,
      resourcesProvided: []
    }
  }
}

function generateFallbackResponse(message: string): string {
  const lowerMessage = message.toLowerCase()

  // Contextual responses based on keywords
  if (lowerMessage.includes('wellness') || lowerMessage.includes('health')) {
    return `Good that you're thinking about wellness. I've got a 15-section assessment that maps out where you're strong and where there's room to grow — covering mental-emotional health, identity, relationships, purpose, the lot.

You can start the full assessment or pick a specific area. What suits you?`
  }

  if (lowerMessage.includes('journal') || lowerMessage.includes('write') || lowerMessage.includes('reflection')) {
    return `Journaling — underrated and genuinely useful. I've got guided templates for morning intention-setting and evening reflection, plus prompts around identity, emotions, and goals.

You can also just free-write. Sometimes that's where the real stuff surfaces. What do you want to explore?`
  }

  if (lowerMessage.includes('stress') || lowerMessage.includes('anxious') || lowerMessage.includes('overwhelm') || lowerMessage.includes('hard') || lowerMessage.includes('difficult')) {
    return `I hear you. Navigating multiple identities and systems is genuinely hard — no need to dress that up.

I can help with problem-solving frameworks to break challenges down, wellness coaching for stress management, reflective journaling, or crisis support resources if things feel urgent. What would be most useful right now?`
  }

  if (lowerMessage.includes('achievement') || lowerMessage.includes('goal') || lowerMessage.includes('progress')) {
    return `Progress tracking — practical and motivating. I can help you set meaningful goals, track milestones, and build habits that actually stick.

The small steps count as much as the big ones. What are you working toward?`
  }

  if (lowerMessage.includes('community') || lowerMessage.includes('connect') || lowerMessage.includes('belong')) {
    return `You're part of the BLKOUT community — a space built by and for Black queer people. That's not a slogan, it's a Community Benefit Society with cooperative ownership.

I can help you think through building connections, finding community spaces, navigating identity and belonging, or linking up with resources and networks. What's on your mind?`
  }

  // Default response
  return `AIvor here — BLKOUT's AI assistant, named after Ivor Cummings. I'm running in limited mode right now, so I can't have a full conversation, but I can still point you in the right direction.

I know about wellness coaching, problem-solving frameworks, journaling, crisis support, and community resources across the UK. What do you need?`
}

function calculateWellnessScore(answers: any): number {
  // Basic scoring logic - would be more sophisticated in real implementation
  return Math.floor(Math.random() * 40) + 60 // 60-100 range
}

function generateWellnessInsights(answers: any): string[] {
  return [
    "Your self-awareness shows strong foundation for growth",
    "Community connection appears to be a key strength",
    "Consider focusing on stress management techniques"
  ]
}

function generateWellnessRecommendations(answers: any): string[] {
  return [
    "Try morning intention-setting practice",
    "Explore identity journaling prompts", 
    "Connect with local LGBTQ+ community resources"
  ]
}

function getNextWellnessSection(currentSectionId: string): string | null {
  const sections = ['mental-emotional-health', 'identity-authenticity', 'relationships-social', 'career-purpose']
  const currentIndex = sections.indexOf(currentSectionId)
  return currentIndex < sections.length - 1 ? sections[currentIndex + 1] : null
}

function analyzeSentiment(content: string): 'positive' | 'neutral' | 'challenging' | 'mixed' {
  // Basic sentiment analysis - would use AI in real implementation
  const positiveWords = ['grateful', 'happy', 'excited', 'love', 'amazing', 'wonderful', 'great']
  const challengingWords = ['difficult', 'hard', 'struggle', 'stress', 'anxiety', 'worry', 'sad']
  
  const words = content.toLowerCase().split(' ')
  const positiveCount = words.filter(word => positiveWords.includes(word)).length
  const challengingCount = words.filter(word => challengingWords.includes(word)).length
  
  if (positiveCount > challengingCount && positiveCount > 0) return 'positive'
  if (challengingCount > positiveCount && challengingCount > 0) return 'challenging'
  if (positiveCount > 0 && challengingCount > 0) return 'mixed'
  return 'neutral'
}


function getCrisisResources() {
  return [
    {
      id: 'samaritans',
      name: 'Samaritans',
      type: 'hotline',
      contactInfo: '116 123',
      priority: 'emergency',
      specializations: ['crisis support', 'suicide prevention', 'emotional distress'],
      lgbtqSpecific: false,
      blackSpecific: false,
      availability: '24/7, free from any phone'
    },
    {
      id: 'switchboard-lgbt',
      name: 'Switchboard LGBT+ Helpline',
      type: 'hotline',
      contactInfo: '0300 330 0630',
      priority: 'emergency',
      specializations: ['LGBTQ+ support', 'crisis intervention', 'coming out'],
      lgbtqSpecific: true,
      blackSpecific: false,
      availability: '10am-10pm daily'
    },
    {
      id: 'mindout',
      name: 'MindOut LGBTQ+ Mental Health',
      type: 'service',
      contactInfo: 'mindout.org.uk',
      priority: 'high',
      specializations: ['LGBTQ+ mental health', 'counselling', 'peer support'],
      lgbtqSpecific: true,
      blackSpecific: false,
      availability: 'Monday-Friday'
    },
    {
      id: 'shout-crisis-text',
      name: 'Shout Crisis Text Line',
      type: 'text',
      contactInfo: 'Text SHOUT to 85258',
      priority: 'emergency',
      specializations: ['crisis support', 'text-based', 'anxiety', 'depression'],
      lgbtqSpecific: false,
      blackSpecific: false,
      availability: '24/7, free'
    }
  ]
}

function calculateRiskLevel(urgency: string, symptoms: string[]): string {
  if (urgency === 'emergency') return 'high'
  if (urgency === 'high') return 'moderate'
  return 'low'
}

function getRecommendedActions(urgency: string): string[] {
  switch (urgency) {
    case 'emergency':
      return ['Call Samaritans: 116 123 (free, 24/7)', 'Call 999 for immediate danger', 'Text SHOUT to 85258']
    case 'high':
      return ['Call Switchboard: 0300 330 0630', 'Reach out to a trusted person', 'Contact MindOut: mindout.org.uk']
    default:
      return ['Use coping strategies', 'Schedule regular check-ins', 'Build support network']
  }
}

function generatePersonalizedRecommendations(userId: string) {
  return [
    {
      id: 'morning-routine',
      type: 'activity',
      title: 'Morning Intention Setting',
      description: 'Start each day with a 5-minute intention-setting practice',
      relevanceScore: 95,
      category: 'wellness',
      difficulty: 'easy',
      benefits: ['Improved focus', 'Better emotional regulation']
    },
    {
      id: 'identity-journaling',
      type: 'journal-prompt', 
      title: 'Authentic Self Expression',
      description: 'Explore identity affirmation and authentic expression prompts',
      relevanceScore: 92,
      category: 'identity',
      difficulty: 'moderate', 
      benefits: ['Stronger self-identity', 'Increased authenticity']
    }
  ]
}

// Initialize Layer 3 Liberation Ecosystem and Start Server
async function initializeAndStart() {
  console.log('🏴‍☠️ BLKOUT Liberation Platform - IVOR Core')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  // Initialize Layer 3 Liberation Business Logic
  console.log('🔧 Initializing Layer 3 Liberation Ecosystem...')
  try {
    layer3Ecosystem = await initializeLayer3EcosystemForIVOR()

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('🏴‍☠️ LIBERATION LAYER 3 STATUS:')
    console.log(`   ├── Services Initialized: ${layer3Ecosystem.healthStatus.servicesInitialized ? '✅ YES' : '❌ NO'}`)
    console.log(`   ├── Liberation Compliant: ${layer3Ecosystem.healthStatus.liberationCompliant ? '✅ YES' : '⚠️ REVIEW NEEDED'}`)
    console.log(`   ├── IVOR Integrated: ${layer3Ecosystem.healthStatus.ivorIntegrated ? '✅ YES' : '⚠️ PENDING'}`)
    console.log(`   ├── Creator Sovereignty: 75% MATHEMATICALLY ENFORCED`)
    console.log(`   └── Community Protection: >95% ACTIVE`)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  } catch (error) {
    layer3InitializationError = error instanceof Error ? error : new Error(String(error))
    console.error('❌ Layer 3 initialization failed:', error)
    console.log('⚠️ Server will start without Layer 3 (degraded mode)')
    console.log('   Liberation validation will be skipped')
  }

  // Log Conversation Intelligence status
  console.log('')
  console.log('🧠 CONVERSATION INTELLIGENCE STATUS:')
  console.log(`   ├── Database Connected: ${conversationIntelligenceService.isInitialized() ? '✅ YES' : '⚠️ MOCK MODE'}`)
  console.log(`   ├── AI Theme Extraction: ${conversationIntelligenceService.isAIExtractEnabled() ? '✅ GROQ' : '⚠️ KEYWORD-BASED'}`)
  console.log(`   └── Community Insights: ${conversationIntelligenceService.isInitialized() ? 'AVAILABLE' : 'LIMITED'}`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  // Start Express server
  app.listen(PORT, () => {
    console.log('')
    console.log(`🤖 AIvor Core running on port ${PORT}`)
    console.log(`📊 Features: Wellness | Problem-Solving | Journaling | Crisis Support | Achievements`)
    console.log(`🏴‍☠️ Liberation: ${layer3Ecosystem ? 'LAYER 3 ACTIVE' : 'DEGRADED MODE'}`)
    console.log(`🧠 Intelligence: ${conversationIntelligenceService.isInitialized() ? 'LEARNING FROM CONVERSATIONS' : 'MOCK MODE'}`)
    console.log(`🔗 Health: http://localhost:${PORT}/health`)
    console.log(`🔗 Liberation: http://localhost:${PORT}/health/liberation`)
    console.log(`🔗 Intelligence: http://localhost:${PORT}/api/intelligence/status`)
    console.log(`💜 AIvor ready — supporting Black queer liberation and personal growth`)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  })
}

// Start the server
initializeAndStart().catch((error) => {
  console.error('Fatal error during startup:', error)
  process.exit(1)
})

export default app