interface ConversationContext {
    userId: string;
    conversationHistory: Array<{
        role: 'user' | 'assistant' | 'system';
        content: string;
        timestamp: Date;
    }>;
    userProfile: {
        pronouns?: string;
        location?: string;
        supportNeeds?: string[];
        culturalContext?: string;
        accessibilityNeeds?: string[];
        communicationStyle?: string;
    };
    currentTopic?: string;
    emotionalState?: 'calm' | 'stressed' | 'excited' | 'overwhelmed' | 'joyful' | 'uncertain';
    lastInteraction?: Date;
    sessionId: string;
}
declare class ConversationService {
    private openai;
    private supabase;
    private embeddingService;
    private isAIEnabled;
    constructor(supabaseUrl: string, supabaseKey: string);
    /**
     * Generate AI-powered response with context
     */
    generateAIResponse(message: string, context: ConversationContext, relevantResources: any[]): Promise<string>;
    /**
     * Create context-aware system prompt
     */
    private createSystemPrompt;
    /**
     * Fallback response when AI is unavailable
     */
    private generateFallbackResponse;
    /**
     * Store conversation memory with importance scoring
     */
    storeConversationMemory(userId: string, sessionId: string, memoryType: string, memoryKey: string, memoryValue: any, importanceScore?: number): Promise<void>;
    /**
     * Retrieve conversation memory for context
     */
    getConversationMemory(userId: string, sessionId: string): Promise<any[]>;
    /**
     * Update user interaction patterns
     */
    updateUserPatterns(userId: string, patternType: string, patternData: any): Promise<void>;
    /**
     * Check if AI is available
     */
    isAIAvailable(): boolean;
}
export default ConversationService;
//# sourceMappingURL=conversationService.d.ts.map