"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const crypto_1 = __importDefault(require("crypto"));
const router = express_1.default.Router();
/**
 * Create anonymous user hash for privacy-preserving feedback
 */
function createUserHash(ip, userAgent = '') {
    const hash = crypto_1.default.createHash('sha256');
    hash.update(ip + userAgent + process.env.HASH_SALT || 'default-salt');
    return hash.digest('hex').substring(0, 16);
}
/**
 * POST /api/feedback - Submit feedback for IVOR response
 */
router.post('/feedback', async (req, res) => {
    try {
        const { responseId, rating, feedback, helpful, userAgent, sessionId } = req.body;
        // Validation
        if (!responseId || !rating) {
            return res.status(400).json({
                error: 'Missing required fields: responseId and rating'
            });
        }
        if (rating < 1 || rating > 5 || !Number.isInteger(rating)) {
            return res.status(400).json({
                error: 'Rating must be an integer between 1 and 5'
            });
        }
        // Create anonymous user identifier
        const userHash = createUserHash(req.ip || req.connection.remoteAddress || 'unknown', userAgent || req.get('User-Agent') || '');
        // Store feedback (in production, this would go to Supabase)
        const feedbackData = {
            id: crypto_1.default.randomUUID(),
            responseId,
            userHash,
            rating,
            feedback: feedback?.substring(0, 1000), // Limit feedback length
            helpful,
            sessionId,
            userAgent: userAgent?.substring(0, 200), // Limit UA length
            ipHash: crypto_1.default.createHash('md5').update(req.ip || 'unknown').digest('hex'),
            createdAt: new Date().toISOString()
        };
        // TODO: Store in Supabase database
        console.log('📝 IVOR Feedback Received:', {
            responseId: feedbackData.responseId,
            rating: feedbackData.rating,
            helpful: feedbackData.helpful,
            hasText: !!feedbackData.feedback,
            userHash: feedbackData.userHash.substring(0, 8) + '...',
            timestamp: feedbackData.createdAt
        });
        // TODO: Trigger trust score updates based on feedback
        // TODO: Update ML pattern weights if rating is very high/low
        res.json({
            success: true,
            message: 'Thank you for your feedback! This helps IVOR learn and improve.',
            feedbackId: feedbackData.id
        });
    }
    catch (error) {
        console.error('Error processing feedback:', error);
        res.status(500).json({
            error: 'Internal server error processing feedback'
        });
    }
});
/**
 * POST /api/rate-knowledge - Rate a specific knowledge entry
 */
router.post('/rate-knowledge', async (req, res) => {
    try {
        const { knowledgeEntryId, rating, feedback, userAgent } = req.body;
        // Validation
        if (!knowledgeEntryId || !rating) {
            return res.status(400).json({
                error: 'Missing required fields: knowledgeEntryId and rating'
            });
        }
        if (rating < 1 || rating > 5 || !Number.isInteger(rating)) {
            return res.status(400).json({
                error: 'Rating must be an integer between 1 and 5'
            });
        }
        // Create anonymous user identifier
        const userHash = createUserHash(req.ip || req.connection.remoteAddress || 'unknown', userAgent || req.get('User-Agent') || '');
        // Check for duplicate rating (same user, same entry, within 24 hours)
        // TODO: Implement duplicate check with database
        const ratingData = {
            id: crypto_1.default.randomUUID(),
            knowledgeEntryId,
            userHash,
            rating,
            feedback: feedback?.substring(0, 1000),
            createdAt: new Date().toISOString()
        };
        // TODO: Store in knowledge_ratings table
        console.log('⭐ Knowledge Rating Received:', {
            knowledgeEntryId: ratingData.knowledgeEntryId,
            rating: ratingData.rating,
            hasText: !!ratingData.feedback,
            userHash: ratingData.userHash.substring(0, 8) + '...',
            timestamp: ratingData.createdAt
        });
        // TODO: Trigger trust score recalculation for this knowledge entry
        res.json({
            success: true,
            message: 'Thank you for rating this information! Your input helps improve accuracy.',
            ratingId: ratingData.id
        });
    }
    catch (error) {
        console.error('Error processing knowledge rating:', error);
        res.status(500).json({
            error: 'Internal server error processing rating'
        });
    }
});
/**
 * GET /api/feedback/stats - Get anonymous feedback statistics
 */
router.get('/stats', async (req, res) => {
    try {
        // TODO: Query database for aggregated stats
        const stats = {
            totalFeedback: 0, // Count from ivor_feedback table
            averageRating: 0, // Average rating from ivor_feedback
            totalKnowledgeRatings: 0, // Count from knowledge_ratings table
            averageKnowledgeRating: 0, // Average from knowledge_ratings
            highTrustEntries: 0, // Count of entries with trust_score >= 0.8
            lowTrustEntries: 0, // Count of entries with trust_score < 0.4
            lastUpdated: new Date().toISOString()
        };
        res.json({
            success: true,
            stats,
            message: 'Anonymous feedback statistics - no personal data included'
        });
    }
    catch (error) {
        console.error('Error fetching feedback stats:', error);
        res.status(500).json({
            error: 'Internal server error fetching statistics'
        });
    }
});
/**
 * POST /api/feedback/helpful - Quick helpful/not helpful rating
 */
router.post('/helpful', async (req, res) => {
    try {
        const { responseId, helpful } = req.body;
        if (!responseId || typeof helpful !== 'boolean') {
            return res.status(400).json({
                error: 'Missing required fields: responseId and helpful (boolean)'
            });
        }
        const userHash = createUserHash(req.ip || req.connection.remoteAddress || 'unknown', req.get('User-Agent') || '');
        // Store quick feedback
        const quickFeedback = {
            id: crypto_1.default.randomUUID(),
            responseId,
            userHash,
            helpful,
            rating: helpful ? 5 : 2, // Convert to rating scale
            feedbackType: 'quick',
            createdAt: new Date().toISOString()
        };
        console.log('👍 Quick Feedback:', {
            responseId: quickFeedback.responseId,
            helpful: quickFeedback.helpful,
            userHash: quickFeedback.userHash.substring(0, 8) + '...',
            timestamp: quickFeedback.createdAt
        });
        res.json({
            success: true,
            message: helpful ? 'Thanks! Glad this was helpful.' : 'Thanks for the feedback - we\'ll work to improve.'
        });
    }
    catch (error) {
        console.error('Error processing quick feedback:', error);
        res.status(500).json({
            error: 'Internal server error'
        });
    }
});
/**
 * Health check endpoint
 */
router.get('/health', (req, res) => {
    res.json({
        status: 'operational',
        service: 'feedback-api',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});
exports.default = router;
//# sourceMappingURL=feedbackRoutes.js.map