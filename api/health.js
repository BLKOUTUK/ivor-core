// IVOR Core Health Check Endpoint
// Community-focused health monitoring

module.exports = async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    return res.status(200).json({
      status: 'healthy',
      service: 'ivor-core',
      name: 'IVOR Core - Personal AI Services',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'production',
      capabilities: [
        'community-focused-responses',
        'liberation-centered',
        'culturally-affirming',
        'groq-ai-powered',
        'rag-enhanced'
      ],
      communityImpact: 'serving Black queer communities with AI-powered support',
      endpoints: {
        health: '/api/health',
        status: '/api/status',
        chat: '/api/chat'
      },
      version: '2.0.0',
      groqAI: process.env.GROQ_API_KEY ? 'configured' : 'missing',
      supabase: process.env.SUPABASE_URL ? 'configured' : 'missing'
    });
  } catch (error) {
    console.error('Health check error:', error);
    return res.status(500).json({
      status: 'unhealthy',
      error: error.message,
      service: 'ivor-core',
      timestamp: new Date().toISOString()
    });
  }
};
