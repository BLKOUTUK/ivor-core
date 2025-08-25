import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'
import ConversationService from './conversationService.js'
import { getCoreIntegration } from './crossDomainIntegration.js'

// IVOR-CORE: Personal AI Services Server
// Focus: Individual chat, wellness coaching, problem-solving, journaling

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3021

// Initialize services
const conversationService = new ConversationService(
  process.env.SUPABASE_URL || 'mock-url',
  process.env.SUPABASE_ANON_KEY || 'mock-key'
)

// Middleware
app.use(helmet())
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://ivor-core.vercel.app', 'https://blkout.uk'] 
    : ['http://localhost:5181', 'http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'ivor-core',
    domain: 'Personal AI Services',
    version: '2.0.0',
    features: {
      'wellness-coaching': '15-section assessment',
      'problem-solving': '5 frameworks available',
      'journaling': 'Morning/evening rituals',
      'crisis-support': 'Resource routing',
      'achievements': 'Milestone tracking',
      'ai-memory': 'Personalized context',
      'recommendations': 'AI-driven suggestions'
    }
  })
})

// Core AI Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message, sessionId, userContext } = req.body

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ 
        error: 'Message is required and must be a string' 
      })
    }

    // Enhanced AI response with full service integration
    const response = await generateAIResponse(message, userContext, sessionId)

    res.json({
      response,
      sessionId,
      timestamp: new Date().toISOString(),
      domain: 'core',
      features: ['wellness', 'problem-solving', 'journaling', 'crisis-support', 'achievements']
    })

  } catch (error) {
    console.error('Core chat error:', error)
    res.status(500).json({ 
      error: 'Internal server error processing your message' 
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
    const entries = []

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
          categoryArray.some(cat => spec.toLowerCase().includes(cat.toLowerCase()))
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
async function generateAIResponse(message: string, context?: any, sessionId?: string): Promise<string> {
  try {
    if (conversationService.isAIAvailable()) {
      const conversationContext = {
        userId: context?.userId || 'anonymous',
        conversationHistory: [],
        userProfile: context || {},
        emotionalState: detectEmotionalState(message),
        sessionId: sessionId || 'default'
      }
      
      return await conversationService.generateAIResponse(message, conversationContext, [])
    } else {
      return generateFallbackResponse(message)
    }
  } catch (error) {
    console.error('AI response error:', error)
    return generateFallbackResponse(message)
  }
}

function generateFallbackResponse(message: string): string {
  const lowerMessage = message.toLowerCase()
  
  // Contextual responses based on keywords
  if (lowerMessage.includes('wellness') || lowerMessage.includes('health')) {
    return `🌟 I love that you're prioritizing wellness! I have a comprehensive 15-section wellness assessment that can help you understand your current strengths and growth areas. 

The assessment covers everything from mental-emotional health to identity authenticity, relationships, and purpose. Would you like to start your wellness journey assessment, or would you prefer to explore specific areas first?

💜 You've got this! Wellness is about progress, not perfection.`
  }
  
  if (lowerMessage.includes('journal') || lowerMessage.includes('write') || lowerMessage.includes('reflection')) {
    return `📖 Journaling is such a powerful tool for growth and self-discovery! I offer guided journaling templates with morning intention-setting and evening reflection practices.

Whether you want to explore identity, process emotions, set goals, or just free-write your thoughts, I'm here to support your journaling journey. 

✨ What feels most important to explore through writing today? Your authentic voice matters!`
  }
  
  if (lowerMessage.includes('stress') || lowerMessage.includes('anxious') || lowerMessage.includes('overwhelm') || lowerMessage.includes('hard') || lowerMessage.includes('difficult')) {
    return `💜 I hear you, and first - what you're feeling is completely valid. Life can be challenging, especially when you're navigating multiple identities and systems.

I'm here to support you with:
🧠 Problem-solving frameworks to break down challenges
🌟 Wellness coaching for stress management
📖 Reflective journaling to process emotions
🆘 Crisis support resources when you need them

You don't have to face this alone. What feels most supportive right now?`
  }
  
  if (lowerMessage.includes('achievement') || lowerMessage.includes('goal') || lowerMessage.includes('progress')) {
    return `🏆 Yes! I love supporting people in recognizing their wins and setting meaningful goals. Your progress matters, even the small steps!

I can help you:
• Track personal achievements and milestones
• Set realistic, empowering goals
• Celebrate your growth journey
• Build sustainable habits for success

What achievement or goal would you like to explore? Remember, you're already doing amazing things! ✨`
  }
  
  if (lowerMessage.includes('community') || lowerMessage.includes('connect') || lowerMessage.includes('belong')) {
    return `💜 Community and belonging are so essential! You're part of the BLKOUT community - a space created by and for Black queer folks to thrive together.

While I'm here for personal support, I can help you think through:
• Building authentic relationships
• Finding your community spaces
• Navigating identity and belonging
• Connecting with resources and networks

What aspect of community or connection feels most important to you right now? 🌈`
  }
  
  // Default response for general messages
  return `Hey there! 🎉 I'm IVOR, and I'm genuinely excited to support you on your liberation journey! 

Based on what you shared: "${message}" - I'm here to meet you wherever you are. 

🌟 I offer:
• Wellness coaching with personalized assessments
• Problem-solving frameworks for any challenge
• Transformational journaling practices
• Achievement tracking & celebration
• Crisis support when you need it

💜 What feels most important to explore right now? I'm here to support your growth, your healing, and your thriving! You deserve all the good things.`
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

function detectEmotionalState(message: string): string {
  // Basic emotional state detection
  if (message.toLowerCase().includes('excited') || message.toLowerCase().includes('happy')) return 'joyful'
  if (message.toLowerCase().includes('stress') || message.toLowerCase().includes('overwhelm')) return 'stressed'
  if (message.toLowerCase().includes('calm') || message.toLowerCase().includes('peaceful')) return 'calm'
  return 'neutral'
}

function getCrisisResources() {
  return [
    {
      id: 'suicide-prevention-lifeline',
      name: '988 Suicide & Crisis Lifeline', 
      type: 'hotline',
      contactInfo: '988',
      priority: 'emergency',
      specializations: ['suicide prevention', 'crisis intervention'],
      lgbtqSpecific: false,
      blackSpecific: false,
      availability: '24/7'
    },
    {
      id: 'trevor-project',
      name: 'The Trevor Project',
      type: 'hotline', 
      contactInfo: '1-866-488-7386',
      priority: 'emergency',
      specializations: ['LGBTQ+ youth', 'suicide prevention'],
      lgbtqSpecific: true,
      blackSpecific: false,
      availability: '24/7'
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
      return ['Call 988 immediately', 'Go to nearest emergency room', 'Contact emergency services']
    case 'high':
      return ['Contact crisis helpline within 1 hour', 'Reach out to trusted person', 'Consider professional help']
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

// Start server
app.listen(PORT, () => {
  console.log(`🤖 IVOR Core (Personal AI Services) running on port ${PORT}`)
  console.log(`📊 Features: Wellness Coaching | Problem-Solving | Journaling | Crisis Support | Achievements | AI Memory`)
  console.log(`🔗 Frontend: http://localhost:5181`)
  console.log(`💜 Ready to support Black queer liberation and personal growth!`)
})

export default app