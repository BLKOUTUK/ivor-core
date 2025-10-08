// IVOR Core - GROQ AI Chat Endpoint
// Liberation-centered AI responses for Black queer communities

const Groq = require('groq-sdk');

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization'
};

// Liberation-centered system prompt for IVOR
const IVOR_SYSTEM_PROMPT = `You are IVOR (Intelligent Virtual Organizing Resource), an AI assistant built specifically for Black queer communities in the UK. You are part of the BLKOUT Liberation Platform, a community-owned technology cooperative.

## Core Principles:
1. **Liberation-Centered**: All responses should center Black queer liberation, community care, and collective action
2. **Trauma-Informed**: Be gentle, affirming, and aware of systemic trauma
3. **Community Knowledge**: Value community wisdom alongside academic knowledge
4. **Mutual Aid**: Promote solidarity, not charity
5. **Intersectional**: Recognize overlapping systems of oppression
6. **Culturally Responsive**: Use language and examples relevant to Black queer culture in the UK

## Response Guidelines:
- Use "we" and "our community" language to build solidarity
- Acknowledge systemic oppression when relevant (NHS, housing, policing, immigration)
- Offer practical, community-centered solutions
- Validate emotions and experiences
- Provide UK-specific resources when appropriate
- Use trauma-informed language
- Celebrate community resilience and joy
- Never pathologize or individualize systemic issues

## UK-Specific Context:
- Reference NHS services and sexual health clinics (CliniQ, 56 Dean Street, etc.)
- Understand UK housing crisis and social care systems
- Be aware of UK immigration and asylum challenges
- Know UK LGBTQ+ organizations (UK Black Pride, Kaleidoscope Trust, etc.)
- Reference menrus.co.uk for Black queer men's sexual health

## Topics You Support:
- Problem-solving and organizing
- Emotional support and wellness
- Learning and education
- Creative expression
- Resource navigation
- Conflict resolution
- Liberation principles and history
- Community building
- Sexual health (refer to menrus.co.uk and NHS services)
- Housing justice
- Immigration support
- Mental health (NHS and community resources)

## Crisis Support:
- **National Suicide Prevention Lifeline**: 116 123 (Samaritans)
- **Crisis Text Line**: Text SHOUT to 85258
- **LGBT+ Switchboard**: 0300 330 0630
- **Galop (LGBT+ anti-violence charity)**: 0800 999 5428
- **The Trevor Project** (international): +1-866-488-7386
- **Mindline Trans+**: 0300 330 5468

## Boundaries:
- You are NOT a replacement for professional therapy, medical care, or legal advice
- Encourage community support AND professional help when needed
- Recognize the limits of AI and center human connection
- Always remind users that community healing happens together

Remember: You are here to support liberation, not to replace community connection.`;

module.exports = async function handler(req, res) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    Object.entries(corsHeaders).forEach(([key, value]) => {
      res.setHeader(key, value);
    });
    return res.status(200).json({});
  }

  // Set CORS headers
  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  // Only support POST
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
      message: 'IVOR chat endpoint only supports POST requests',
      service: 'ivor-core'
    });
  }

  try {
    // Vercel automatically parses JSON body, but handle edge cases
    const { message, conversationHistory = [], category, sessionId, userId } = req.body || {};

    // Validate request
    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request',
        message: 'Message is required and must be a non-empty string',
        service: 'ivor-core'
      });
    }

    // Check for GROQ API key (server-side only)
    const groqApiKey = process.env.GROQ_API_KEY;

    if (!groqApiKey || groqApiKey === 'gsk_test_key_placeholder') {
      console.error('GROQ API key not configured');

      // Fallback to pattern-matching if no API key
      const fallbackResponse = getFallbackResponse(message);

      return res.status(200).json({
        success: true,
        response: fallbackResponse,
        source: 'fallback',
        message: 'Using pattern-matching (AI not configured)',
        service: 'ivor-core',
        sessionId: sessionId || `session-${Date.now()}`,
        communityFocused: true
      });
    }

    // Initialize GROQ client
    const groq = new Groq({
      apiKey: groqApiKey
    });

    // Build conversation messages for GROQ
    const messages = [
      { role: 'system', content: IVOR_SYSTEM_PROMPT },
      ...conversationHistory.slice(-10), // Keep last 10 messages for context
      { role: 'user', content: message }
    ];

    // Call GROQ API
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile', // Updated model (llama-3.1 decommissioned)
      messages: messages,
      temperature: 0.7,
      max_tokens: 1000,
      top_p: 0.9
    });

    const aiResponse = completion.choices[0]?.message?.content;

    if (!aiResponse) {
      throw new Error('No response from GROQ API');
    }

    return res.status(200).json({
      success: true,
      response: aiResponse,
      source: 'groq-ai',
      model: 'llama-3.3-70b-versatile',
      service: 'ivor-core',
      serviceName: 'IVOR Core - Personal AI Services',
      sessionId: sessionId || `session-${Date.now()}`,
      userId: userId || 'anonymous',
      category: category,
      communityFocused: true,
      culturallyAffirming: true,
      liberation: '✊🏾 Powered by community-owned AI',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('IVOR chat error:', error);

    // Fallback response on any error
    const fallbackMessage = `I apologize, but I'm having trouble responding right now.

Here's what you can do:
- Try rephrasing your message
- Check back in a few moments
- Reach out to community members for support

Remember: technology supports us, but community connection is what sustains us. ✊🏾`;

    return res.status(200).json({
      success: true,
      response: fallbackMessage,
      source: 'fallback-error',
      message: 'Error occurred, using fallback response',
      service: 'ivor-core',
      error: error.message
    });
  }
}

// Fallback pattern-matching for when AI is unavailable
function getFallbackResponse(message) {
  const msg = message.toLowerCase();

  // Crisis intervention (highest priority)
  if (msg.includes('crisis') || msg.includes('suicide') || msg.includes('self-harm') || msg.includes('kill myself') || msg.includes('end it all')) {
    return `I hear you're in crisis. First - you are valued, you belong, and this community needs you.

**Immediate UK Crisis Support:**
- **Samaritans**: 116 123 (24/7)
- **Crisis Text Line**: Text SHOUT to 85258
- **LGBT+ Switchboard**: 0300 330 0630
- **Galop** (LGBT+ anti-violence): 0800 999 5428
- **Mindline Trans+**: 0300 330 5468

**Community Resources:**
- Black Mental Health Alliance
- UK Black Pride community support
- Local LGBTQ+ centers

You matter to this community. Please reach out to one of these services now. ✊🏾`;
  }

  // Greetings
  if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey')) {
    return `Hello! I'm IVOR, your community AI assistant for Black queer liberation in the UK. I'm here to support you with learning, problem-solving, wellness, and community wisdom. How can I help you today? ✊🏾`;
  }

  // Help/Support
  if (msg.includes('help') || msg.includes('support')) {
    return `I'm here to support you! I can help with:

- Problem-solving and working through challenges
- Mental wellness and emotional support
- Sexual health resources (NHS, menrus.co.uk)
- Learning and studying together
- Finding community resources
- Liberation wisdom and organizing
- Creative inspiration
- And more!

What would feel most helpful for you right now?`;
  }

  // Health & Wellness
  if (msg.includes('health') || msg.includes('wellness') || msg.includes('hiv') || msg.includes('prep') || msg.includes('sexual health')) {
    return `Your health matters deeply.

**Sexual Health Resources:**
- **menrus.co.uk** - Comprehensive sexual health for Black queer men
- **NHS Sexual Health Services** - Free and confidential
- **CliniQ** (London) - QTIPOC+ friendly, Wednesdays 6-8pm
- **56 Dean Street** - Walk-in sexual health clinic
- **PrEP** - Available free on NHS

**Mental Wellness:**
- NHS therapy services (free)
- Mind UK - Mental health support
- UK Black Pride community resources

Healthcare is a human right, and you deserve culturally competent care. What aspect of health can I support you with?`;
  }

  // Anxiety/Mental Health
  if (msg.includes('anxiety') || msg.includes('depression') || msg.includes('mental') || msg.includes('stress')) {
    return `I see you're dealing with mental health challenges - this is incredibly common in our community due to systemic stressors.

**Grounding Technique (5-4-3-2-1):**
Can you name:
- 5 things you can see
- 4 things you can touch
- 3 things you can hear
- 2 things you can smell
- 1 thing you can taste

**UK Mental Health Resources:**
- **NHS Talking Therapies** - Free counseling
- **Mind UK**: 0300 123 3393
- **LGBT+ Switchboard**: 0300 330 0630
- **Black Mental Health UK**

Your feelings are valid. How can I support you today?`;
  }

  // Default fallback
  return `Thank you for reaching out. I'm experiencing some technical difficulties right now, but I want you to know:

- Your message matters
- Community support is available
- You deserve care and resources
- We're stronger together

Please try again in a moment, or reach out to:
- **LGBT+ Switchboard**: 0300 330 0630
- **UK Black Pride** community networks
- Your local LGBTQ+ community center

✊🏾 Liberation through community`;
}
