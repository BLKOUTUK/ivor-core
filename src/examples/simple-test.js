// Simple JavaScript test to validate journey-aware system
// Run with: node dist/examples/simple-test.js

import ConversationService from '../conversationService.js'
import { JourneyAwareConversationService } from '../services/JourneyAwareConversationService.js'

async function testJourneySystem() {
  console.log('🧪 Testing Journey-Aware IVOR System')
  console.log('=====================================\n')

  // Initialize services
  const conversationService = new ConversationService('mock-url', 'mock-key')
  const journeyService = new JourneyAwareConversationService(conversationService)

  // Test 1: HIV Crisis
  console.log('📋 Test 1: HIV New Diagnosis Crisis')
  const hivResponse = await journeyService.generateJourneyAwareResponse(
    "I just got diagnosed with HIV and I'm terrified",
    { location: 'london', userId: 'test-1' }
  )
  console.log(`✅ Stage: ${hivResponse.journeyStage}`)
  console.log(`✅ Resources: ${hivResponse.resources.length}`)
  console.log(`✅ Emergency support: ${hivResponse.resources.some(r => r.emergency)}`)
  console.log(`✅ Message: ${hivResponse.message.substring(0, 150)}...`)
  console.log()

  // Test 2: PrEP Information
  console.log('📋 Test 2: PrEP Information Seeking')
  const prepResponse = await journeyService.generateJourneyAwareResponse(
    "I want to learn about PrEP on the NHS",
    { location: 'manchester', userId: 'test-2' }
  )
  console.log(`✅ Stage: ${prepResponse.journeyStage}`)
  console.log(`✅ Knowledge: ${prepResponse.knowledge.length}`)
  console.log(`✅ UK-specific: ${prepResponse.knowledge.some(k => k.sources.includes('NHS.uk'))}`)
  console.log(`✅ Message: ${prepResponse.message.substring(0, 150)}...`)
  console.log()

  // Test 3: Community Healing
  console.log('📋 Test 3: Community Healing Interest')
  const communityResponse = await journeyService.generateJourneyAwareResponse(
    "I want to connect with other Black queer people for healing",
    { location: 'london', userId: 'test-3' }
  )
  console.log(`✅ Stage: ${communityResponse.journeyStage}`)
  console.log(`✅ Cultural resources: ${communityResponse.resources.filter(r => r.culturalCompetency.blackSpecific).length}`)
  console.log(`✅ Next stage: ${communityResponse.nextStagePathway.substring(0, 100)}...`)
  console.log(`✅ Message: ${communityResponse.message.substring(0, 150)}...`)
  console.log()

  // System Health
  console.log('📋 System Health Check')
  const health = journeyService.getSystemHealth()
  console.log(`✅ Journey Detector: ${health.journeyDetector}`)
  console.log(`✅ Knowledge Base: ${health.knowledgeBase}`)
  console.log(`✅ Response Generator: ${health.responseGenerator}`)
  console.log(`✅ Users Tracked: ${health.userJourneyHistory}`)
  console.log()

  console.log('🎉 Journey-Aware System Test Complete!')
  console.log('💜 Ready for UK Black queer liberation support')
}

// Run test
testJourneySystem().catch(console.error)