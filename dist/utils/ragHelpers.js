"use strict";
// RAG Helper functions for enhanced conversation analysis
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserCommunicationStyle = getUserCommunicationStyle;
exports.getUserSupportNeeds = getUserSupportNeeds;
exports.extractCurrentTopic = extractCurrentTopic;
exports.detectEmotionalState = detectEmotionalState;
exports.detectFormality = detectFormality;
function getUserCommunicationStyle(conversationMemory) {
    const styles = conversationMemory
        .filter(mem => mem.memory_type === 'communication_style')
        .sort((a, b) => new Date(b.last_accessed).getTime() - new Date(a.last_accessed).getTime());
    return styles[0]?.memory_value?.style || 'adaptive';
}
function getUserSupportNeeds(conversationMemory) {
    const supportEntries = conversationMemory
        .filter(mem => mem.memory_type === 'preference' && mem.memory_key === 'support_needs')
        .map(mem => mem.memory_value?.needs || [])
        .flat();
    return [...new Set(supportEntries)];
}
function extractCurrentTopic(message) {
    const lowerMessage = message.toLowerCase();
    if (lowerMessage.includes('mental health') || lowerMessage.includes('therapy') || lowerMessage.includes('depression') || lowerMessage.includes('anxiety')) {
        return 'mental_health';
    }
    if (lowerMessage.includes('housing') || lowerMessage.includes('accommodation') || lowerMessage.includes('rent')) {
        return 'housing';
    }
    if (lowerMessage.includes('legal') || lowerMessage.includes('discrimination') || lowerMessage.includes('rights')) {
        return 'legal';
    }
    if (lowerMessage.includes('community') || lowerMessage.includes('events') || lowerMessage.includes('friends')) {
        return 'community';
    }
    if (lowerMessage.includes('career') || lowerMessage.includes('job') || lowerMessage.includes('work')) {
        return 'career';
    }
    if (lowerMessage.includes('health') || lowerMessage.includes('medical') || lowerMessage.includes('doctor')) {
        return 'health';
    }
    if (lowerMessage.includes('crisis') || lowerMessage.includes('emergency') || lowerMessage.includes('urgent')) {
        return 'crisis';
    }
    return 'general';
}
function detectEmotionalState(message) {
    const lowerMessage = message.toLowerCase();
    // Stress indicators
    if (lowerMessage.includes('stressed') || lowerMessage.includes('anxiety') ||
        lowerMessage.includes('worry') || lowerMessage.includes('panic') ||
        lowerMessage.includes('overwhelmed') || lowerMessage.includes('can\'t cope')) {
        return 'stressed';
    }
    // Overwhelm indicators  
    if (lowerMessage.includes('too much') || lowerMessage.includes('everything at once') ||
        lowerMessage.includes('drowning') || lowerMessage.includes('can\'t handle')) {
        return 'overwhelmed';
    }
    // Joy indicators
    if (lowerMessage.includes('happy') || lowerMessage.includes('excited') ||
        lowerMessage.includes('great') || lowerMessage.includes('amazing') ||
        lowerMessage.includes('wonderful') || lowerMessage.includes('😊') || lowerMessage.includes('🎉')) {
        return 'joyful';
    }
    // Excitement indicators
    if (lowerMessage.includes('excited') || lowerMessage.includes('pumped') ||
        lowerMessage.includes('ready') || lowerMessage.includes('let\'s do this')) {
        return 'excited';
    }
    // Uncertainty indicators
    if (lowerMessage.includes('unsure') || lowerMessage.includes('don\'t know') ||
        lowerMessage.includes('confused') || lowerMessage.includes('not sure') ||
        message.includes('?') && message.split('?').length > 2) {
        return 'uncertain';
    }
    return 'calm';
}
function detectFormality(message) {
    const formalIndicators = [
        'please', 'thank you', 'i would like', 'could you', 'would you mind',
        'i am writing', 'i hope this', 'sincerely', 'regards'
    ];
    const casualIndicators = [
        'hey', 'yo', 'sup', 'what\'s up', 'gonna', 'wanna', 'yeah', 'nah',
        'lol', 'haha', 'omg', 'btw', 'tbh'
    ];
    const lowerMessage = message.toLowerCase();
    const formalCount = formalIndicators.filter(indicator => lowerMessage.includes(indicator)).length;
    const casualCount = casualIndicators.filter(indicator => lowerMessage.includes(indicator)).length;
    if (formalCount > casualCount && formalCount > 0)
        return 'formal';
    if (casualCount > formalCount && casualCount > 0)
        return 'casual';
    return 'mixed';
}
//# sourceMappingURL=ragHelpers.js.map