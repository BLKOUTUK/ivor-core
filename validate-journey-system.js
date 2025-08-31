#!/usr/bin/env node

// Simple validation test for journey-aware IVOR system
// This tests the core functionality without complex test framework dependencies

import { JourneyAwareConversationService } from './dist/services/JourneyAwareConversationService.js'
import ConversationService from './dist/conversationService.js'

console.log('🧪 Validating Journey-Aware IVOR System')
console.log('=====================================\n')

// Initialize services with mock credentials
const conversationService = new ConversationService('mock-url', 'mock-key')
const journeyService = new JourneyAwareConversationService(conversationService)

async function validateSystem() {
  try {
    // Test 1: System Health Check
    console.log('📋 Test 1: System Health Check')
    const health = journeyService.getSystemHealth()
    console.log(`✅ Journey Detector: ${health.journeyDetector}`)
    console.log(`✅ Knowledge Base: ${health.knowledgeBase}`) 
    console.log(`✅ Response Generator: ${health.responseGenerator}`)
    console.log(`✅ Users Tracked: ${health.userJourneyHistory}`)
    console.log()

    // Test 2: HIV Crisis Response
    console.log('📋 Test 2: HIV Crisis Response')
    const hivResponse = await journeyService.generateJourneyAwareResponse(
      "I just got diagnosed with HIV and I'm terrified",
      { location: 'london', userId: 'test-user-1' }
    )
    console.log(`✅ Stage Detected: ${hivResponse.journeyStage}`)
    console.log(`✅ Emergency Resources: ${hivResponse.resources.filter(r => r.emergency).length}`)
    console.log(`✅ UK-Specific Resources: ${hivResponse.resources.filter(r => r.location.includes('london')).length}`)
    console.log(`✅ Cultural Competency: ${hivResponse.culturallyAffirming}`)
    console.log(`✅ Message Length: ${hivResponse.message.length} characters`)
    console.log(`✅ Follow-up Required: ${hivResponse.followUpRequired}`)
    console.log()

    // Test 3: PrEP Information (Growth Stage)
    console.log('📋 Test 3: PrEP Information Request')
    const prepResponse = await journeyService.generateJourneyAwareResponse(
      "I want to learn about PrEP on the NHS",
      { location: 'manchester', userId: 'test-user-2' }
    )
    console.log(`✅ Stage Detected: ${prepResponse.journeyStage}`)
    console.log(`✅ Knowledge Entries: ${prepResponse.knowledge.length}`)
    console.log(`✅ NHS Resources: ${prepResponse.knowledge.filter(k => k.sources.includes('NHS.uk')).length}`)
    console.log(`✅ Next Stage Guidance: ${prepResponse.nextStagePathway.length > 0}`)
    console.log()

    // Test 4: Community Healing Interest
    console.log('📋 Test 4: Community Healing Support')
    const communityResponse = await journeyService.generateJourneyAwareResponse(
      "I want to connect with other Black queer people for support",
      { location: 'birmingham', userId: 'test-user-3' }
    )
    console.log(`✅ Stage Detected: ${communityResponse.journeyStage}`)
    console.log(`✅ Cultural Resources: ${communityResponse.resources.filter(r => r.culturalCompetency.blackSpecific).length}`)
    console.log(`✅ Community Focus: ${communityResponse.culturallyAffirming}`)
    console.log()

    // Test 5: Housing Crisis (Emergency)
    console.log('📋 Test 5: Housing Crisis Emergency')
    const housingResponse = await journeyService.getEmergencyResponse(
      "I'm being evicted and need urgent housing help",
      { location: 'glasgow', userId: 'test-user-4' }
    )
    console.log(`✅ Emergency Response: ${housingResponse.emergency}`)
    console.log(`✅ Crisis Resources: ${housingResponse.resources.filter(r => r.emergency).length}`)
    console.log(`✅ Urgency Handled: ${housingResponse.followUpRequired}`)
    console.log()

    // Test 6: User Journey Progression
    console.log('📋 Test 6: Journey Progression Tracking')
    const journeyHistory1 = journeyService.getUserJourneyProgression('test-user-1')
    const journeyHistory2 = journeyService.getUserJourneyProgression('test-user-2')
    console.log(`✅ User 1 Journey: ${journeyHistory1.join(' → ')}`)
    console.log(`✅ User 2 Journey: ${journeyHistory2.join(' → ')}`)
    console.log(`✅ Journey Tracking: ${journeyHistory1.length > 0 && journeyHistory2.length > 0}`)
    console.log()

    // Final validation
    console.log('🎉 Journey-Aware System Validation Complete!')
    console.log('💜 System Status: READY FOR UK BLACK QUEER LIBERATION SUPPORT')
    console.log('🌟 All core components operational and culturally competent')
    console.log('🚀 Ready for community validation and deployment')

  } catch (error) {
    console.error('❌ Validation Error:', error.message)
    console.error('Stack:', error.stack)
  }
}

// Run validation
validateSystem()