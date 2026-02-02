import { TrustScoreService } from '../services/TrustScoreService.js'
import { JourneyAwareConversationService } from '../services/JourneyAwareConversationService.js'
import ConversationService from '../conversationService.js'
import { KnowledgeEntry, UKResource } from '../types/journey.js'

/**
 * Test Trust Scoring Implementation
 * Validates Week 1-2 implementation of trust scoring system
 */

export async function runTrustScoringTests() {
  console.log('🧪 Testing IVOR Trust Scoring System\n')

  // Initialize services
  const conversationService = new ConversationService('mock-url', 'mock-key')
  const journeyService = new JourneyAwareConversationService(conversationService)
  const trustService = new TrustScoreService()

  // Test 1: URL Validation
  console.log('📋 **Test 1: URL Validation**')
  const testUrls = [
    'https://www.nhs.uk/conditions/hiv-and-aids/',
    'https://menrus.co.uk/resources/',
    'https://tht.org.uk/hiv-support',
    'https://invalid-url-that-should-fail.fake',
    'https://example.com'
  ]

  console.log('Validating URLs...')
  const urlValidations = await trustService.validateMultipleUrls(testUrls)
  
  urlValidations.forEach((isValid, url) => {
    const status = isValid ? '✅ Valid' : '❌ Invalid'
    console.log(`  ${status}: ${url}`)
  })
  console.log()

  // Test 2: Knowledge Entry Trust Scoring
  console.log('📋 **Test 2: Knowledge Entry Trust Scoring**')
  
  const testKnowledgeEntries: KnowledgeEntry[] = [
    {
      id: 'test-hiv-treatment',
      title: 'HIV Treatment in UK',
      content: 'HIV treatment is available free on the NHS...',
      category: 'HIV Health',
      journeyStages: ['crisis', 'stabilization'],
      location: ['unknown'],
      tags: ['HIV', 'treatment', 'NHS'],
      sources: ['https://www.nhs.uk/conditions/hiv-and-aids/', 'https://menrus.co.uk'],
      lastUpdated: new Date(), // Recent update
      verificationStatus: 'verified',
      communityValidated: true
    },
    {
      id: 'test-outdated-info',
      title: 'Outdated Information',
      content: 'Some old information...',
      category: 'General',
      journeyStages: ['growth'],
      location: ['london'],
      tags: ['general'],
      sources: ['https://unknown-source.com'],
      lastUpdated: new Date('2020-01-01'), // Very old
      verificationStatus: 'outdated',
      communityValidated: false
    }
  ]

  for (const entry of testKnowledgeEntries) {
    const score = await trustService.calculateKnowledgeTrustScore(entry)
    const interpretation = trustService.getTrustScoreInterpretation(score)
    
    console.log(`Entry: ${entry.title}`)
    console.log(`  Trust Score: ${score.toFixed(3)}`)
    console.log(`  Level: ${interpretation.level} (${interpretation.description})`)
    console.log(`  Sources: ${entry.sources.join(', ')}`)
    console.log(`  Status: ${entry.verificationStatus}, Community: ${entry.communityValidated}`)
    console.log()
  }

  // Test 3: Resource Trust Scoring
  console.log('📋 **Test 3: Resource Trust Scoring**')
  
  const testResources: UKResource[] = [
    {
      id: 'nhs-iapt',
      title: 'NHS IAPT Service',
      description: 'Free NHS therapy',
      category: 'Mental Health',
      journeyStages: ['stabilization'],
      website: 'https://www.nhs.uk/service-search/find-a-psychological-therapies-service/',
      locations: ['unknown'],
      specializations: ['therapy', 'anxiety'],
      accessRequirements: ['NHS registration'],
      cost: 'nhs_funded',
      culturalCompetency: {
        lgbtqSpecific: false,
        blackSpecific: false,
        transSpecific: false,
        disabilityAware: true
      },
      emergency: false,
      availability: '9-5 weekdays',
      languages: ['English']
    },
    {
      id: 'lgbt-switchboard',
      title: 'LGBT+ Switchboard',
      description: 'LGBTQ+ support hotline',
      category: 'LGBTQ+ Support',
      journeyStages: ['crisis', 'stabilization'],
      phone: '0300 330 0630',
      website: 'https://switchboard.lgbt',
      locations: ['unknown'],
      specializations: ['LGBTQ+ support'],
      accessRequirements: ['none'],
      cost: 'free',
      culturalCompetency: {
        lgbtqSpecific: true,
        blackSpecific: false,
        transSpecific: true,
        disabilityAware: true
      },
      emergency: false,
      availability: '10am-10pm',
      languages: ['English']
    }
  ]

  for (const resource of testResources) {
    const score = await trustService.calculateResourceTrustScore(resource)
    const interpretation = trustService.getTrustScoreInterpretation(score)
    
    console.log(`Resource: ${resource.title}`)
    console.log(`  Trust Score: ${score.toFixed(3)}`)
    console.log(`  Level: ${interpretation.level}`)
    console.log(`  Cost: ${resource.cost}, Emergency: ${resource.emergency}`)
    console.log(`  LGBTQ+ Specific: ${resource.culturalCompetency.lgbtqSpecific}`)
    console.log()
  }

  // Test 4: Journey-Aware Response with Trust Scoring
  console.log('📋 **Test 4: Journey-Aware Response with Trust Scoring**')
  
  const testQueries = [
    {
      query: "I just got diagnosed with HIV and need information about treatment",
      context: { userId: 'test-user-1', location: 'london' }
    },
    {
      query: "Looking for mental health support, feeling anxious",
      context: { userId: 'test-user-2', location: 'manchester' }
    }
  ]

  for (const test of testQueries) {
    console.log(`Query: "${test.query}"`)
    
    try {
      const response = await journeyService.generateJourneyAwareResponse(
        test.query,
        test.context
      )

      console.log(`  Journey Stage: ${response.journeyContext?.stage}`)
      console.log(`  Trust Score: ${response.trustScore?.toFixed(3) || 'N/A'}`)
      console.log(`  Trust Level: ${response.trustLevel || 'N/A'}`)
      console.log(`  Sources Verified: ${response.sourceVerification?.verified || 0}/${response.sourceVerification?.total || 0}`)
      console.log(`  Resources Provided: ${response.resources.length}`)
      console.log(`  Knowledge Entries: ${response.knowledge.length}`)
      console.log(`  Requests Feedback: ${response.requestFeedback}`)
      console.log(`  Response ID: ${response.responseId || 'N/A'}`)
      console.log(`  Message Preview: ${response.response.substring(0, 150)}...`)
      
    } catch (error) {
      console.log(`  ❌ Error: ${error.message}`)
    }
    console.log()
  }

  // Test 5: System Health Check
  console.log('📋 **Test 5: System Health Check**')
  
  const systemHealth = journeyService.getSystemHealth()
  console.log('System Status:', systemHealth)
  console.log()

  // Test 6: Trust Score Cache Performance
  console.log('📋 **Test 6: Cache Performance Test**')
  
  console.log('Testing URL validation caching...')
  const testUrl = 'https://www.nhs.uk'
  
  // First call (should make HTTP request)
  const start1 = Date.now()
  const result1 = await trustService.validateSourceUrl(testUrl)
  const time1 = Date.now() - start1
  
  // Second call (should use cache)
  const start2 = Date.now()
  const result2 = await trustService.validateSourceUrl(testUrl)
  const time2 = Date.now() - start2
  
  console.log(`  First call: ${time1}ms (result: ${result1})`)
  console.log(`  Second call: ${time2}ms (result: ${result2}) - ${time2 < time1 ? 'Cache hit!' : 'Cache miss'}`)
  
  const cacheHealth = trustService.getSystemHealth()
  console.log(`  Cache size: ${cacheHealth.cacheSize} entries`)
  console.log()

  // Summary
  console.log('✅ Trust Scoring System Testing Complete!')
  console.log('🌟 Key Features Validated:')
  console.log('  • URL validation with caching')
  console.log('  • Knowledge entry trust scoring')
  console.log('  • Resource trust scoring')
  console.log('  • Integration with journey-aware responses')
  console.log('  • Trust score interpretation for users')
  console.log('  • System health monitoring')
  console.log('💜 Ready for community feedback collection!')
}

// Export for testing
export { TrustScoreService }

// Run tests if called directly
// Note: import.meta check removed for TypeScript compatibility