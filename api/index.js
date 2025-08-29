// Community-Focused AI Assistant for ivor-core
export default async function handler(req, res) {
  const { method, url } = req;
  
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Health check endpoint
    if (url.includes('/health')) {
      return res.status(200).json({
        status: 'healthy',
        service: 'ivor-core',
        name: 'IVOR Core - Personal AI Services',
        timestamp: new Date().toISOString(),
        environment: 'production',
        capabilities: ['community-focused-responses', 'liberation-centered', 'culturally-affirming'],
        communityImpact: 'serving Black queer communities with AI-powered support'
      });
    }

    // Status endpoint
    if (url.includes('/status')) {
      return res.status(200).json({
        service: 'ivor-core',
        name: 'IVOR Core - Personal AI Services',
        status: 'operational',
        version: '1.0.0',
        uptime: process.uptime(),
        communityFocus: 'Black queer liberation',
        endpoints: ['/api/health', '/api/status', '/api/chat']
      });
    }

    // Enhanced community-focused chat endpoint
    if (url.includes('/chat') && method === 'POST') {
      const { message, userId, sessionId } = req.body || {};
      
      if (!message) {
        return res.status(400).json({
          error: 'Message is required',
          service: 'ivor-core'
        });
      }

      const messageLower = message.toLowerCase();
      let response = '';
      let responseCategory = 'general';

      // Intelligent community-focused response selection
      
      if (messageLower.includes('anxiety') || messageLower.includes('depression') || messageLower.includes('mental health') || messageLower.includes('wellness') || messageLower.includes('stress') || messageLower.includes('therapy') || messageLower.includes('counseling') || messageLower.includes('self-care')) {
        const responses = [
        "I see you're dealing with anxiety - this is incredibly common in our community due to systemic stressors. Let's start with some grounding: Can you name 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, and 1 you can taste? This 5-4-3-2-1 technique helps with anxiety.",
        "Mental wellness for Black queer men requires both individual and community support. I recommend: 1) National Queer and Trans Therapists of Color Network for culturally affirming therapy, 2) Mindfulness practices that honor your identity, 3) The Steve Fund's crisis resources. What feels most urgent right now?",
        "Your wellness matters deeply to our community. For immediate support: Crisis Text Line (Text HOME to 741741), The Trevor Project (1-866-488-7386), or Trans Lifeline (877-565-8860). For ongoing wellness: meditation apps like Liberate Meditation (made for BIPOC communities), and community healing circles. How can I support you today?"
];
        response = responses[Math.floor(Math.random() * responses.length)];
        responseCategory = 'wellness';
      }
      if (messageLower.includes('hiv') || messageLower.includes('sexual health') || messageLower.includes('prep') || messageLower.includes('pep') || messageLower.includes('testing') || messageLower.includes('std') || messageLower.includes('sti') || messageLower.includes('clinic') || messageLower.includes('health services') || messageLower.includes('south london') || messageLower.includes('london') || messageLower.includes('medical') || messageLower.includes('doctor') || messageLower.includes('healthcare') || messageLower.includes('vaccination') || messageLower.includes('vaccine') || messageLower.includes('gonorrhea') || messageLower.includes('gonorrhoea') || messageLower.includes('syphilis') || messageLower.includes('chlamydia') || messageLower.includes('hepatitis') || messageLower.includes('nhs') || messageLower.includes('gum clinic') || messageLower.includes('sexual health clinic')) {
        const responses = [
        "**BREAKING**: Gonorrhea vaccination is now available on the NHS (as of August 2025)! You can get this vaccine at: **Sexual health clinics**, **NHS GUM clinics**, or through your GP. **London**: CliniQ (QTIPOC+ Wednesdays 6-8pm, 56 Dean Street), Dean Street Express, Mortimer Market Centre. **Manchester**: LGBT Foundation sexual health service. **Birmingham**: Birmingham LGBT Centre. Call ahead to confirm vaccine availability. Also visit menrus.co.uk for comprehensive UK sexual health resources and culturally affirming provider connections.",
        "**Yes - gonorrhea vaccination is now available on the NHS!** This major breakthrough just became available in August 2025. **How to access**: Contact your local sexual health clinic or NHS GUM clinic to book. **QTIPOC+ friendly services**: CliniQ London (Wednesdays), LGBT Foundation Manchester, Birmingham LGBT Centre. **Free on NHS** like all sexual health services. **Also available**: Hepatitis A/B vaccines, Mpox vaccination if eligible, PrEP. Visit menrus.co.uk for complete UK health directory and community-specific provider recommendations.",
        "Great news - **gonorrhea vaccination is newly available on NHS** (August 2025)! **Book through**: Local sexual health clinics, NHS GUM clinics, or GP practice. **Community-friendly locations**: CliniQ (London QTIPOC+ service), LGBT Foundation (Manchester), LGBT Centre (Birmingham). **All free and confidential**. This is a huge development for our community's sexual health. Visit menrus.co.uk for detailed UK health resources, clinic finder, and culturally competent provider connections across Britain.",
        "**Update: Gonorrhea vaccine now on NHS!** This just became available in August 2025 - major breakthrough for sexual health. **Access**: NHS sexual health clinics nationwide, many GUM clinics, some GP practices. **QTIPOC+ affirming services**: CliniQ London, LGBT Foundation Manchester, Birmingham LGBT Centre health services. **Completely free** through NHS. **Also consider**: Regular STI screening, PrEP if eligible. Visit menrus.co.uk for comprehensive UK health directory with Black queer friendly providers and current health updates."
];
        response = responses[Math.floor(Math.random() * responses.length)];
        responseCategory = 'health';
      }
      if (messageLower.includes('decision') || messageLower.includes('choice') || messageLower.includes('stuck') || messageLower.includes('confused') || messageLower.includes('direction') || messageLower.includes('guidance') || messageLower.includes('advice') || messageLower.includes('help me decide')) {
        const responses = [
        "Let's work through this together with a framework designed for our community. I'm going to guide you through the BLKOUT Decision Framework: 1) What are your Boundaries? 2) What brings you Liberation? 3) How does this align with your Knowledge? 4) What's your Organizing potential? 5) What's your Unique contribution? 6) What's the Timeline? Let's start with boundaries - what are your non-negotiables here?"
];
        response = responses[Math.floor(Math.random() * responses.length)];
        responseCategory = 'coaching';
      }
      if (messageLower.includes('crisis') || messageLower.includes('emergency') || messageLower.includes('suicide') || messageLower.includes('self-harm') || messageLower.includes('urgent') || messageLower.includes('immediate help') || messageLower.includes('danger')) {
        const responses = [
        "I hear you're in crisis. First - you are valued, you belong, and this community needs you. Immediate resources: National Suicide Prevention Lifeline (988), Crisis Text Line (741741), The Trevor Project (1-866-488-7386). Local support: Black Mental Health Alliance, Fireweed Collective, Audre Lorde Project. Can you tell me what city you're in so I can connect you with local Black queer resources?"
];
        response = responses[Math.floor(Math.random() * responses.length)];
        responseCategory = 'crisis';
      }
      
      // Default community-centered response if no specific category matches
      if (!response) {
        const generalResponses = [
          "I'm here to support you and our community. Can you tell me more about what you're looking for - whether it's wellness support, organizing resources, community insights, or help amplifying your voice?",
          "As part of the IVOR platform serving Black queer communities, I want to make sure I give you the most helpful response. Are you looking for personal support, organizing help, community data, or social media strategy?",
          "Our community's liberation and wellness are interconnected. Whether you need individual support or want to contribute to collective action, I'm here to help. What's most important to you right now?"
        ];
        response = generalResponses[Math.floor(Math.random() * generalResponses.length)];
        responseCategory = 'general';
      }

      return res.status(200).json({
        response,
        service: 'ivor-core',
        serviceName: 'IVOR Core - Personal AI Services',
        responseCategory,
        communityFocused: true,
        culturallyAffirming: true,
        timestamp: new Date().toISOString(),
        sessionId: sessionId || 'default',
        userId: userId || 'anonymous',
        communityImpact: 'Serving Black queer liberation with AI-powered support'
      });
    }

    // Default response
    return res.status(200).json({
      message: 'IVOR Core - Personal AI Services is ready to serve the community',
      service: 'ivor-core',
      name: 'IVOR Core - Personal AI Services',
      communityFocus: 'Black queer liberation',
      endpoints: ['/api/health', '/api/status', '/api/chat'],
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Community service error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      service: 'ivor-core',
      message: error.message,
      communitySupport: 'We are committed to serving our community - please try again'
    });
  }
}