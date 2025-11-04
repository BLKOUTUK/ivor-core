# IVOR Core - Personal Wellness & Crisis Intervention

AI-powered personal wellness support with community-focused crisis intervention for Black queer communities.

## 🎯 What This Service Does

**IVOR Core** provides personal wellness support that:

- **Crisis Intervention**: Immediate resources for mental health crises (988, Trevor Project, Crisis Text Line)
- **Anxiety Support**: 5-4-3-2-1 grounding techniques contextualized for systemic oppression
- **Mental Wellness**: Culturally affirming therapy connections and community support
- **HIV Health Resources**: Integration with menrus.co.uk for comprehensive sexual health support
- **Community-Centered Decision Making**: BLKOUT Decision Framework for empowerment choices

## 🏗️ Architecture Overview

**IVOR Platform (6 Services):**
1. **IVOR Frontend** - React chat interface  
2. **IVOR API Gateway** - Cross-service orchestration
3. **IVOR Core** ← You are here (Personal Wellness Hub)
4. **IVOR Organizing** - Housing justice & mobilization
5. **IVOR Community** - Intelligence & analytics  
6. **IVOR Social** - Black trans visibility & viral strategy

## 🛠️ Technical Implementation

**Framework**: Node.js serverless function on Vercel
**AI Integration**: **GROQ AI (Llama 3.3 70B)** - Real AI-powered liberation-centered responses
**Fallback System**: Pattern-matching when AI unavailable
**Health Resources**: Direct integration with menrus.co.uk health platform
**Crisis Support**: UK-specific crisis hotlines (Samaritans, LGBT+ Switchboard, Galop, Mindline Trans+)
**Deployment**: ✅ Live in production with GROQ_API_KEY configured in Vercel

## 📦 Dependencies

```json
{
  "dependencies": {
    "groq-sdk": "^0.30.0",
    "@supabase/supabase-js": "^2.53.1",
    "@vercel/node": "^3.x"
  }
}
```

**Services:**
- ✅ **GROQ AI** - Fast, high-quality AI responses with Llama 3.1 70B
- ✅ **Supabase** - Database integration for conversation storage
- ✅ **Fallback System** - Pattern-matching when AI unavailable
- ✅ Integration with established health resources (menrus.co.uk)

**Setup Required:**
- GROQ API key (get from [console.groq.com](https://console.groq.com))
- See [GROQ_SETUP.md](./GROQ_SETUP.md) for complete setup instructions

## 🚀 API Endpoints (Current Implementation)

### **Health Check**
```
GET /api/health
```
Returns: IVOR Core service status and wellness capabilities

### **AI-Powered Community Chat**
```
POST /api/chat
Content-Type: application/json

{
  "message": "your wellness query here",
  "conversationHistory": [],
  "userId": "optional",
  "sessionId": "optional",
  "category": "optional"
}
```

**AI Response Types (GROQ AI):**
- **Crisis Intervention**: Immediate UK crisis resources + culturally affirming support
- **Sexual Health**: NHS services, PrEP, menrus.co.uk resources
- **Mental Wellness**: Therapy, grounding techniques, UK support services
- **Community Support**: Organizing, liberation principles, mutual aid
- **Decision Support**: BLKOUT framework for community-centered choices

**Response Format:**
```json
{
  "success": true,
  "response": "AI-generated liberation-centered response...",
  "source": "groq-ai",
  "model": "llama-3.1-70b-versatile",
  "service": "ivor-core",
  "communityFocused": true,
  "culturallyAffirming": true,
  "liberation": "✊🏾 Powered by community-owned AI"
}
```

**Fallback**: If GROQ AI unavailable, uses pattern-matching responses

## 🌐 Live Deployment

**Production URL**: https://ivor-core-r2dq6g1cc-robs-projects-54d653d3.vercel.app
**Status**: ✅ OPERATIONAL - GROQ AI integration with liberation-centered responses
**Fallback**: Pattern-matching crisis support and wellness guidance when AI unavailable

## 💜 Crisis Support Resources (Currently Active)

**Immediate Crisis Support:**
- **National Suicide Prevention Lifeline**: 988
- **Crisis Text Line**: Text HOME to 741741  
- **The Trevor Project** (LGBTQ+ crisis support): 1-866-488-7386
- **Trans Lifeline**: 877-565-8860

**Black Mental Health Resources:**
- **Black Mental Health Alliance**: Community-specific support
- **Fireweed Collective**: Healing justice resources
- **Audre Lorde Project**: Community organizing + wellness

## 🤝 Community Collaboration

**We are stronger together!** This wellness service needs community voices to remain authentic and effective.

### How to Contribute

1. **Test Crisis Responses**: Share feedback on crisis intervention quality and cultural authenticity
2. **Mental Health Professionals**: Review and improve wellness guidance and resource connections  
3. **Community Members**: Test responses for cultural authenticity and liberation focus
4. **Accessibility Experts**: Ensure wellness support is accessible to disabled community members

### Current Priorities  
- **Crisis Response Quality**: Ensuring immediate support is culturally affirming and effective
- **Resource Accuracy**: Keeping mental health and HIV resources current and accessible
- **Cultural Authenticity**: Maintaining Black queer liberation focus in all responses
- **Community Validation**: Regular community review of wellness guidance and crisis support

### Areas Needing Community Support
- **Local Resource Mapping**: Connecting to community-specific mental health resources
- **Peer Support Networks**: Integration with community support groups and healing circles
- **Language Accessibility**: Multi-language support for broader community access
- **Crisis Intervention Training**: Community feedback on crisis response effectiveness

## 🐛 Known Issues & Areas for Improvement

**Current Limitations:**
- Limited local resource knowledge (focuses on national resources)
- No persistent wellness tracking between sessions
- Could benefit from peer support network integration
- Crisis responses could include more community-specific resources

**Community Help Wanted:**
- **Mental Health Professionals**: Review crisis intervention protocols and resource lists
- **Community Organizers**: Connect wellness support to broader liberation organizing
- **Accessibility Advocates**: Ensure wellness support serves disabled community members
- **Local Community Leaders**: Help map region-specific mental health and crisis resources

## 🚀 Setup Instructions  

### Prerequisites
- Node.js 18+
- Vercel CLI

### Installation
```bash
# Clone repository
git clone [repository-url] 
cd ivor-core

# Install Vercel CLI if needed
npm install -g vercel

# Deploy to Vercel (no build step needed)
vercel --prod
```

## 📊 Response Examples

**Crisis Intervention Response:**
```json
{
  "response": "I hear you're in crisis. First - you are valued, you belong, and this community needs you. Immediate resources: National Suicide Prevention Lifeline (988), Crisis Text Line (741741), The Trevor Project (1-866-488-7386). Local support: Black Mental Health Alliance, Fireweed Collective, Audre Lorde Project...",
  "service": "ivor-core", 
  "responseCategory": "crisis_intervention",
  "communityFocused": true,
  "culturallyAffirming": true
}
```

**HIV Services Response:**
```json
{
  "response": "HIV and sexual health support for Black queer communities: Our health resources platform at menrus.co.uk offers comprehensive information including PrEP access, regular testing guidance, post-exposure prophylaxis (PEP) information, and connections to culturally competent healthcare providers...",
  "service": "ivor-core",
  "responseCategory": "health",
  "knowledgeSource": "menrus.co.uk",
  "communityFocused": true
}
```

**Anxiety Support Response:**
```json
{
  "response": "I see you're dealing with anxiety - this is incredibly common in our community due to systemic stressors. Let's start with some grounding: Can you name 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, and 1 you can taste? This 5-4-3-2-1 technique helps with anxiety...",
  "service": "ivor-core",
  "responseCategory": "anxiety_support", 
  "technique": "5-4-3-2-1_grounding",
  "contextualizedFor": "systemic_oppression"
}
```

## 🏳️‍🌈 Community Values

This wellness service is built with values of:
- ♿ **Accessible Wellness**: Mental health support for all community members
- 🌈 **Queer-Affirming Care**: LGBTQ+ specific resources and understanding
- ✊🏿 **Liberation-Focused**: Connecting individual wellness to community empowerment  
- 🤝 **Collective Healing**: Community-based approaches to mental health
- 🔒 **Community Safety**: Culturally safe and affirming crisis intervention

## 📞 Community Support

**Need Help?** Connect with the community:
- Share feedback on crisis response quality and cultural authenticity
- Report issues with resource accuracy or accessibility
- Suggest improvements to wellness guidance and community connections
- Test responses with real community scenarios and mental health needs

---

**Part of the [IVOR Community Liberation Platform](/) | Healing in community | We are stronger together** 💜✊🏿🏳️‍🌈