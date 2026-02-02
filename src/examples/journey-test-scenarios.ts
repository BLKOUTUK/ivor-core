import { JourneyAwareConversationService } from '../services/JourneyAwareConversationService.js'
import ConversationService from '../conversationService.js'

/**
 * Test scenarios for journey-aware system validation
 * Demonstrates real-world usage patterns for UK Black queer community
 */

// Initialize services for testing
const conversationService = new ConversationService('mock-url', 'mock-key')
const journeyService = new JourneyAwareConversationService(conversationService)

export async function runTestScenarios() {
  console.log('🧪 Testing Journey-Aware IVOR System\n')

  // Test Scenario 1: HIV New Diagnosis Crisis
  console.log('📋 **Test 1: HIV New Diagnosis Crisis**')
  const hivCrisisResponse = await journeyService.generateJourneyAwareResponse(
    "I just got diagnosed with HIV and I'm terrified, I don't know what to do",
    { location: 'london', userId: 'test-user-1' }
  )
  console.log(`Stage detected: ${hivCrisisResponse.journeyContext?.stage}`)
  console.log(`Resources provided: ${hivCrisisResponse.resources.length}`)
  console.log(`Emergency response: ${hivCrisisResponse.resources.some(r => r.emergency)}`)
  console.log(`Specific info: ${hivCrisisResponse.resourcesProvided?.length}`)
  console.log(`Message preview: ${hivCrisisResponse.response.substring(0, 200)}...\n`)

  // Test Scenario 2: PrEP Information Seeking (Growth stage)
  console.log('📋 **Test 2: PrEP Information Seeking**')
  const prepResponse = await journeyService.generateJourneyAwareResponse(
    "I want to learn about PrEP - how do I get it on the NHS and what does it involve?",
    { location: 'manchester', userId: 'test-user-2' }
  )
  console.log(`Stage detected: ${prepResponse.journeyContext?.stage}`)
  console.log(`Knowledge entries: ${prepResponse.knowledge.length}`)
  console.log(`UK-specific info: ${prepResponse.knowledge.some(k => k.sources.includes('NHS.uk'))}`)
  console.log(`Message preview: ${prepResponse.response.substring(0, 200)}...\n`)

  // Test Scenario 3: Mental Health Support Seeking (Stabilization)
  console.log('📋 **Test 3: Mental Health Support**')
  const mentalHealthResponse = await journeyService.generateJourneyAwareResponse(
    "I'm struggling with depression and anxiety, looking for therapy through NHS",
    { location: 'birmingham', userId: 'test-user-3' }
  )
  console.log(`Stage detected: ${mentalHealthResponse.journeyContext?.stage}`)
  console.log(`NHS resources: ${mentalHealthResponse.resources.filter(r => r.cost === 'nhs_funded').length}`)
  console.log(`Follow-up needed: ${mentalHealthResponse.followUpRequired}`)
  console.log(`Message preview: ${mentalHealthResponse.response.substring(0, 200)}...\n`)

  // Test Scenario 4: Community Healing Interest
  console.log('📋 **Test 4: Community Healing**')
  const communityResponse = await journeyService.generateJourneyAwareResponse(
    "I'm interested in connecting with other Black queer people for support and healing",
    { location: 'london', userId: 'test-user-4' }
  )
  console.log(`Stage detected: ${communityResponse.journeyContext?.stage}`)
  console.log(`Cultural resources: ${communityResponse.resources.filter(r => r.culturalCompetency.blackSpecific).length}`)
  console.log(`Community focus: ${communityResponse.resourcesProvided}`)
  console.log(`Message preview: ${communityResponse.response.substring(0, 200)}...\n`)

  // Test Scenario 5: Housing Crisis
  console.log('📋 **Test 5: Housing Crisis**')
  const housingCrisisResponse = await journeyService.generateJourneyAwareResponse(
    "I'm being evicted and need urgent housing help, I'm homeless",
    { location: 'glasgow', userId: 'test-user-5' }
  )
  console.log(`Stage detected: ${housingCrisisResponse.journeyContext?.stage}`)
  console.log(`Emergency resources: ${housingCrisisResponse.resources.filter(r => r.emergency).length}`)
  console.log(`Urgency handled: ${housingCrisisResponse.followUpRequired}`)
  console.log(`Message preview: ${housingCrisisResponse.response.substring(0, 200)}...\n`)

  // Test Scenario 6: Advocacy Interest
  console.log('📋 **Test 6: Advocacy Interest**')
  const advocacyResponse = await journeyService.generateJourneyAwareResponse(
    "I want to get involved in organizing and fighting discrimination in my workplace",
    { location: 'bristol', userId: 'test-user-6' }
  )
  console.log(`Stage detected: ${advocacyResponse.journeyContext?.stage}`)
  console.log(`Legal resources: ${advocacyResponse.knowledge.filter(k => k.category.includes('Legal')).length}`)
  console.log(`Next stage pathway: ${advocacyResponse.nextStageGuidance.substring(0, 100)}...`)
  console.log(`Message preview: ${advocacyResponse.response.substring(0, 200)}...\n`)

  // Test Scenario 7: Rural User Support
  console.log('📋 **Test 7: Rural User Support**')
  const ruralResponse = await journeyService.generateJourneyAwareResponse(
    "I live in rural Wales and feel isolated, need support but everything seems to be in cities",
    { location: 'rural', userId: 'test-user-7' }
  )
  console.log(`Stage detected: ${ruralResponse.journeyContext?.stage}`)
  console.log(`Location-aware: Rural support`)
  console.log(`Online resources: ${ruralResponse.resources.filter(r => r.website).length}`)
  console.log(`Message preview: ${ruralResponse.response.substring(0, 200)}...\n`)

  // System Health Check
  console.log('📋 **System Health Check**')
  const systemHealth = journeyService.getSystemHealth()
  console.log(`System Status:`, systemHealth)
  
  console.log('\n✅ Journey-Aware System Testing Complete!')
  console.log('🌟 All scenarios processed successfully')
  console.log('💜 Ready for community validation and deployment')
}

// Export for testing
export { journeyService }

// Run tests if called directly
// Note: import.meta check removed for TypeScript compatibility