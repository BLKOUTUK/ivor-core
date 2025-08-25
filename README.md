# ivor-core

Personal AI Services domain providing AI assistance, wellness tracking, and community resources.

## Overview

This is part of the IVOR (Intelligent Virtual Organizing Resource) Community Liberation Technology Platform - a 4-domain system designed to serve Black queer communities with AI-powered services focused on liberation and collective empowerment.

## Architecture

- **Type**: backend
- **Framework**: Node.js + Express + TypeScript
- **Deployment**: Vercel
- **Database**: Supabase (PostgreSQL)
- **Cross-Domain**: Redis pub/sub coordination

## Environment Variables

Required environment variables for deployment:

```bash
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
GROQ_API_KEY=your_groq_api_key
REDIS_URL=your_redis_url
```

## Deployment

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Deploy to Vercel
vercel --prod
```

## API Endpoints

- `POST /api/chat` - AI chat interface
- `GET /api/wellness` - Wellness tracking
- `GET /api/resources` - Community resources

## Cross-Domain Coordination

This service coordinates with other IVOR platform domains through the API Gateway using Redis pub/sub messaging for real-time orchestrated responses.

## Community Values

Built with values of:
- ♿ Accessibility first
- 🌈 Queer liberation
- ✊🏿 Racial justice  
- 🤝 Cooperative ownership
- 🔒 Data sovereignty

---

Part of the [IVOR Platform](https://github.com/BLKOUTUK/ivorsolo) | Generated with [Claude Code](https://claude.ai/code)
