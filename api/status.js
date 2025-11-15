// IVOR Core Status Endpoint
// Detailed service status for monitoring

module.exports = async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const startTime = process.hrtime();

    // Check environment variables
    const envStatus = {
      groqAI: !!process.env.GROQ_API_KEY,
      supabase: !!process.env.SUPABASE_URL && !!process.env.SUPABASE_ANON_KEY,
      nodeEnv: process.env.NODE_ENV || 'production'
    };

    const [seconds, nanoseconds] = process.hrtime(startTime);
    const responseTime = (seconds * 1000 + nanoseconds / 1000000).toFixed(2);

    return res.status(200).json({
      service: 'ivor-core',
      name: 'IVOR Core - Personal AI Services',
      status: 'operational',
      version: '2.0.0',
      uptime: process.uptime(),
      responseTime: `${responseTime}ms`,
      communityFocus: 'Black queer liberation',
      platform: 'BLKOUT Liberation Platform',
      deployment: {
        platform: 'Vercel',
        region: process.env.VERCEL_REGION || 'unknown',
        environment: envStatus.nodeEnv
      },
      services: {
        groqAI: envStatus.groqAI ? 'available' : 'not configured',
        supabase: envStatus.supabase ? 'available' : 'not configured',
        ragSearch: 'available'
      },
      endpoints: {
        health: '/api/health',
        status: '/api/status',
        chat: '/api/chat (POST)'
      },
      capabilities: [
        'groq-ai-powered-responses',
        'semantic-search-rag',
        'community-resource-discovery',
        'crisis-intervention',
        'culturally-affirming-support'
      ],
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Status check error:', error);
    return res.status(500).json({
      status: 'error',
      error: error.message,
      service: 'ivor-core',
      timestamp: new Date().toISOString()
    });
  }
};
