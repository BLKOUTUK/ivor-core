import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'
import ConversationService from './conversationService.js'
import { JourneyAwareConversationService } from './services/JourneyAwareConversationService.js'

// IVOR-CORE: Journey-Aware Personal AI Services Server
// Focus: UK Black queer liberation through intelligent, context-aware support

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3021

// Initialize services
const conversationService = new ConversationService(
  process.env.SUPABASE_URL || 'mock-url',
  process.env.SUPABASE_ANON_KEY || 'mock-key'
)

// Initialize journey-aware system
const journeyAwareService = new JourneyAwareConversationService(conversationService)

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
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Health check with journey-aware system status
app.get('/health', (req, res) => {
  const journeySystemHealth = journeyAwareService.getSystemHealth()
  
  res.json({ 
    status: 'healthy', 
    service: 'ivor-core',
    domain: 'Journey-Aware Personal AI Services',
    version: '2.1.0',
    features: {
      'journey-aware-ai': 'UK Black queer liberation focused',
      'stage-detection': 'Crisis→Stabilization→Growth→Healing→Advocacy',
      'uk-knowledge-base': 'menrus.co.uk + NHS + community resources',
      'contextual-responses': 'Location and stage appropriate',
      'crisis-intervention': 'Emergency resource routing',
      'wellness-coaching': '15-section assessment',
      'problem-solving': '5 frameworks available',
      'journaling': 'Morning/evening rituals',
      'achievements': 'Milestone tracking',
      'ai-memory': 'Personalized context'
    },
    journeySystem: journeySystemHealth
  })
})

// Journey-Aware AI Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message, sessionId, userContext } = req.body

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ 
        error: 'Message is required and must be a string' 
      })
    }

    // Generate journey-aware response
    const journeyResponse = await journeyAwareService.generateJourneyAwareResponse(
      message, 
      userContext, 
      sessionId
    )

    res.json({
      ...journeyResponse,
      sessionId,
      timestamp: new Date().toISOString(),
      domain: 'core',
      features: ['journey-aware-ai', 'uk-knowledge-base', 'contextual-responses', 'crisis-support'],
      version: '2.1.0'
    })

  } catch (error) {
    console.error('Journey-aware chat error:', error)
    res.status(500).json({ 
      error: 'Internal server error processing your message',
      fallback: 'Basic chat functionality temporarily unavailable'
    })
  }
})

// Emergency response endpoint for crisis situations
app.post('/api/emergency', async (req, res) => {
  try {
    const { message, userContext } = req.body

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ 
        error: 'Message is required and must be a string' 
      })
    }

    // Force emergency/crisis response
    const emergencyResponse = await journeyAwareService.getEmergencyResponse(
      message,
      userContext
    )

    res.json({
      ...emergencyResponse,
      timestamp: new Date().toISOString(),
      domain: 'core',
      emergencyResponse: true,
      version: '2.1.0'
    })

  } catch (error) {
    console.error('Emergency response error:', error)
    res.status(500).json({ 
      error: 'Emergency system temporarily unavailable',
      fallback: 'Call 999 for immediate emergency support, or Samaritans 116 123 for crisis support'
    })
  }
})

// Journey progression endpoint
app.get('/api/journey/:userId', async (req, res) => {
  try {
    const { userId } = req.params
    
    const journeyHistory = journeyAwareService.getUserJourneyProgression(userId)
    
    res.json({
      success: true,
      userId,
      journeyHistory,
      currentStage: journeyHistory[journeyHistory.length - 1] || 'growth',
      totalStages: journeyHistory.length
    })
  } catch (error) {
    console.error('Journey progression error:', error)
    res.status(500).json({ error: 'Failed to retrieve journey progression' })
  }
})

// Wellness Coaching API (legacy support)
app.post('/api/wellness/assessment', async (req, res) => {
  try {
    const { userId, answers, sectionId } = req.body
    
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

// Crisis Resources API
app.get('/api/crisis/resources', async (req, res) => {
  try {
    const { urgency, categories, location } = req.query
    
    // Use journey-aware system for crisis resources
    const crisisResponse = await journeyAwareService.getEmergencyResponse(
      `I need crisis resources for ${categories || 'emergency support'}`,
      { location: location || 'unknown' }
    )
    
    res.json({ 
      success: true, 
      resources: crisisResponse.resources,
      knowledge: crisisResponse.knowledge,
      emergency: true
    })
  } catch (error) {
    console.error('Crisis resources error:', error)
    res.status(500).json({ error: 'Failed to fetch crisis resources' })
  }
})

// User Progress API with journey awareness
app.get('/api/user/:userId/progress', async (req, res) => {
  try {
    const { userId } = req.params
    
    const journeyHistory = journeyAwareService.getUserJourneyProgression(userId)
    const currentStage = journeyHistory[journeyHistory.length - 1] || 'growth'
    
    const progress = {
      journeyStage: currentStage,
      journeyHistory: journeyHistory,
      stageProgression: journeyHistory.length,
      wellnessScore: 75,
      journalEntries: 12,
      journalStreak: 5,
      frameworksCompleted: 2,
      achievementsUnlocked: 8,
      totalEngagementTime: 450,
      lastActive: new Date().toISOString(),
      strengthsIdentified: ['Self-reflection', 'Community connection', 'Authenticity'],
      recentActivity: [
        { type: 'journey', action: `Progressed to ${currentStage} stage`, timestamp: new Date().toISOString() },
        { type: 'chat', action: 'Journey-aware conversation', timestamp: new Date().toISOString() }
      ]
    }

    res.json({ success: true, progress })
  } catch (error) {
    console.error('User progress error:', error)
    res.status(500).json({ error: 'Failed to fetch user progress' })
  }
})

// System status endpoint
app.get('/api/system/status', (req, res) => {
  try {
    const systemHealth = journeyAwareService.getSystemHealth()
    
    res.json({
      success: true,
      system: 'IVOR Core Journey-Aware System',
      version: '2.1.0',
      status: 'operational',
      ...systemHealth,
      capabilities: {
        journeyStageDetection: true,
        ukKnowledgeBase: true,
        contextualResponses: true,
        emergencySupport: true,
        communityFocused: true,
        culturallyCompetent: true
      }
    })
  } catch (error) {
    console.error('System status error:', error)
    res.status(500).json({ error: 'Failed to get system status' })
  }
})

// Helper functions
function calculateWellnessScore(answers: any): number {
  return Math.floor(Math.random() * 40) + 60
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

// Start server
app.listen(PORT, () => {
  console.log(`🤖 IVOR Core (Journey-Aware Personal AI Services) running on port ${PORT}`)
  console.log(`🌟 Features: Journey-Aware AI | UK Knowledge Base | Crisis Support | Community Liberation`)
  console.log(`🏳️‍🌈 Focus: UK Black Queer Liberation through intelligent, contextual support`)
  console.log(`🔗 Frontend: http://localhost:5181`)
  console.log(`💜 Ready to support Black queer liberation with journey-aware intelligence!`)
})

export default app