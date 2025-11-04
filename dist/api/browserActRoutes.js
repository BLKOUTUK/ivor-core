"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const groq_sdk_1 = __importDefault(require("groq-sdk"));
const router = express_1.default.Router();
const BROWSERACT_SECRET = process.env.BROWSERACT_SECRET_TOKEN || '';
const GOOGLE_SHEET_ID = process.env.GOOGLE_SHEET_ID || '';
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || '';
// Initialize Groq client
const groq = new groq_sdk_1.default({
    apiKey: process.env.GROQ_API_KEY || ''
});
/**
 * BrowserAct Webhook Endpoint
 * Receives scraped events and sends them through IVOR moderation
 */
router.post('/webhook', async (req, res) => {
    const startTime = Date.now();
    try {
        // Validate authentication
        const authToken = req.headers['x-browseract-token'] || req.headers['X-BrowserAct-Token'];
        if (BROWSERACT_SECRET && authToken !== BROWSERACT_SECRET) {
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'Invalid BrowserAct token'
            });
        }
        // Parse incoming events
        const body = req.body;
        const events = Array.isArray(body.events) ? body.events : [body];
        if (events.length === 0) {
            return res.status(400).json({
                error: 'No events provided',
                received: body
            });
        }
        console.log(`[BrowserAct] Received ${events.length} events for processing`);
        // Process events through IVOR moderation
        const results = await Promise.all(events.map(async (eventData) => {
            try {
                // Build moderation request (reusing logic from moderationRoutes)
                const moderationResult = await moderateEventContent(eventData);
                // Determine moderation status
                let moderationStatus;
                if (moderationResult.recommendation === 'auto-approve' && moderationResult.confidence >= 0.90) {
                    moderationStatus = 'auto-approved';
                }
                else if (moderationResult.confidence >= 0.70) {
                    moderationStatus = 'review-quick';
                }
                else {
                    moderationStatus = 'review-deep';
                }
                // Enrich event data
                const enrichedEvent = {
                    ...eventData,
                    ivor_confidence: (moderationResult.confidence * 100).toFixed(0) + '%',
                    ivor_reasoning: moderationResult.reasoning,
                    liberation_score: (moderationResult.liberation_score * 100).toFixed(0) + '%',
                    moderation_status: moderationStatus,
                    relevance: moderationResult.relevance,
                    quality: moderationResult.quality,
                    submitted_by: 'browseract-automation',
                    submitted_at: new Date().toISOString(),
                    flags: moderationResult.flags?.join(', ') || ''
                };
                // Write to Google Sheets
                await writeToGoogleSheets(enrichedEvent, moderationStatus);
                return {
                    success: true,
                    title: eventData.title,
                    status: moderationStatus,
                    confidence: moderationResult.confidence,
                    recommendation: moderationResult.recommendation
                };
            }
            catch (error) {
                console.error(`[BrowserAct] Error processing event: ${eventData.title}`, error);
                // On error, send to manual review
                await writeToGoogleSheets({
                    ...eventData,
                    moderation_status: 'review-deep',
                    ivor_confidence: '0%',
                    ivor_reasoning: 'AI moderation failed - requires manual review',
                    submitted_by: 'browseract-automation',
                    submitted_at: new Date().toISOString(),
                    flags: 'error'
                }, 'review-deep');
                return {
                    success: false,
                    title: eventData.title,
                    error: error instanceof Error ? error.message : 'Unknown error'
                };
            }
        }));
        // Calculate statistics
        const stats = {
            total: results.length,
            auto_approved: results.filter(r => r.status === 'auto-approved').length,
            review_quick: results.filter(r => r.status === 'review-quick').length,
            review_deep: results.filter(r => r.status === 'review-deep').length,
            failed: results.filter(r => !r.success).length,
            processing_time_ms: Date.now() - startTime
        };
        console.log('[BrowserAct] Processing complete:', stats);
        res.json({
            success: true,
            message: 'Events processed successfully',
            stats,
            results: results.map(r => ({
                title: r.title,
                status: r.status,
                success: r.success
            }))
        });
    }
    catch (error) {
        console.error('[BrowserAct] Fatal error:', error);
        res.status(500).json({
            error: 'Processing failed',
            message: error instanceof Error ? error.message : 'Unknown error',
            processing_time_ms: Date.now() - startTime
        });
    }
});
/**
 * Moderate event content using IVOR AI
 */
async function moderateEventContent(content) {
    const prompt = buildModerationPrompt(content);
    try {
        const completion = await groq.chat.completions.create({
            model: 'llama-3.1-70b-versatile',
            messages: [
                {
                    role: 'system',
                    content: 'You are IVOR, an AI moderator for the BLKOUT Liberation Platform. You analyze content for relevance to Black queer and trans communities in the UK. Always respond with valid JSON only.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            temperature: 0.3,
            max_tokens: 600,
            response_format: { type: 'json_object' }
        });
        const aiResponse = completion.choices[0]?.message?.content;
        if (!aiResponse) {
            throw new Error('No response from AI model');
        }
        const parsed = JSON.parse(aiResponse);
        return {
            confidence: parsed.confidence || 0,
            relevance: parsed.relevance || 'low',
            quality: parsed.quality || 'low',
            liberation_score: parsed.liberation_score || 0,
            reasoning: parsed.reasoning || 'No reasoning provided',
            recommendation: parsed.recommendation || 'review',
            flags: parsed.flags || []
        };
    }
    catch (error) {
        console.error('[IVOR] Moderation failed:', error);
        // Return conservative fallback requiring manual review
        return {
            confidence: 0,
            relevance: 'low',
            quality: 'low',
            liberation_score: 0,
            reasoning: 'AI moderation failed - requires manual review',
            recommendation: 'review',
            flags: ['moderation-error']
        };
    }
}
/**
 * Build moderation prompt for event content
 */
function buildModerationPrompt(content) {
    return `
You are IVOR, the AI moderator for BLKOUT - a liberation platform for and by Black queer and trans people in the UK.

Your role: Analyze this ${content.type} to determine if it's relevant and valuable for Black QTIPOC+ communities.

Content to analyze:
- Title: "${content.title}"
- Description: "${content.description}"
- Organizer/Source: "${content.organizer_name || 'Unknown'}"
- Tags: ${content.tags?.join(', ') || 'None'}
- Location: "${content.location || 'Not specified'}"
- Source URL: "${content.source_url}"
${content.event_date ? `- Date: "${content.event_date}"` : ''}

Evaluation criteria:

1. **Relevance** (Is this specifically for Black QTIPOC+ people?):
   - HIGH: Explicitly mentions Black + LGBTQ+ (e.g., "Black Trans Liberation", "QTIPOC gathering", "African/Caribbean queer community")
   - MEDIUM: Mentions one but not both (e.g., "Black community event" or "LGBTQ+ gathering" but not specifically for Black people)
   - LOW: General diversity/inclusion with no specific focus on Black queer/trans people

2. **Quality** (Is this legitimate and safe?):
   - HIGH: Verified organization (LGBT Foundation, UK Black Pride, Stonewall, known community groups)
   - MEDIUM: Known local community group or grassroots organization
   - LOW: Unknown source, suspicious content, potential spam

3. **Liberation Focus** (Does this align with Black queer liberation values?):
   - HIGH: Explicitly anti-racist, anti-capitalist, community-led, mutual aid, activism, healing, grassroots organizing
   - MEDIUM: Generally progressive, inclusive, supportive but not explicitly liberation-focused
   - LOW: Corporate/commercial, apolitical, or potentially harmful to marginalized communities

4. **Red Flags** (Check for these issues):
   - Fetishization or exoticization of Black bodies
   - Corporate Pride-washing or rainbow capitalism
   - TERFs, SWERFs, or other exclusionary groups
   - "Diversity training" for corporations (not community-focused)
   - Events requiring high cost that exclude working-class people
   - Vague descriptions that could be spam

Based on your analysis, provide a confidence score (0-1) and recommendation:
- confidence ≥0.90 + HIGH relevance + HIGH quality = "auto-approve"
- confidence 0.70-0.89 + MEDIUM/HIGH relevance = "review" (curator quick check)
- confidence <0.70 or any red flags = "reject" or "review" (curator deep check)

RESPOND ONLY WITH THIS JSON FORMAT (no other text):
{
  "confidence": 0.95,
  "relevance": "high",
  "quality": "high",
  "liberation_score": 0.90,
  "reasoning": "This event is explicitly for Black trans people, organized by LGBT Foundation Manchester (trusted org with history of serving POC communities). Strong liberation focus on community organizing and self-care. No red flags detected.",
  "recommendation": "auto-approve",
  "flags": []
}
`;
}
/**
 * Write event to Google Sheets
 */
async function writeToGoogleSheets(eventData, status) {
    if (!GOOGLE_SHEET_ID || !GOOGLE_API_KEY) {
        console.warn('[Google Sheets] Not configured - skipping write');
        return;
    }
    try {
        const sheetName = status === 'auto-approved' ? 'Events_Published' : 'Events_PendingReview';
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_SHEET_ID}/values/${sheetName}:append?valueInputOption=RAW&key=${GOOGLE_API_KEY}`;
        const row = [
            eventData.submitted_at || new Date().toISOString(),
            eventData.submitted_by || 'browseract-automation',
            'events',
            eventData.title || '',
            eventData.event_date || '',
            eventData.event_time || '',
            eventData.location || '',
            eventData.organizer_name || '',
            eventData.description || '',
            eventData.source_url || '',
            eventData.tags?.join(', ') || '',
            eventData.price || '',
            eventData.image_url || '',
            eventData.ivor_confidence || '',
            eventData.ivor_reasoning || '',
            eventData.liberation_score || '',
            eventData.moderation_status || status,
            eventData.relevance || '',
            eventData.quality || '',
            eventData.flags || '',
            'pending_review',
            ''
        ];
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ values: [row] })
        });
        if (!response.ok) {
            throw new Error(`Google Sheets API error: ${response.status}`);
        }
        console.log(`[Google Sheets] Written to ${sheetName}: ${eventData.title}`);
    }
    catch (error) {
        console.error('[Google Sheets] Write failed:', error);
        // Don't throw - we don't want to fail the entire request
    }
}
exports.default = router;
//# sourceMappingURL=browserActRoutes.js.map