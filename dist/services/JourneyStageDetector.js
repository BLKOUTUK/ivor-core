"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JourneyStageDetector = void 0;
/**
 * Journey Stage Detection Engine
 * Recognizes where users are in their UK Black queer liberation journey
 */
class JourneyStageDetector {
    constructor() {
        this.journeyIndicators = {
            crisis: {
                keywords: [
                    'emergency', 'urgent', 'crisis', 'need help now', 'immediate', 'desperate',
                    'suicidal', 'self-harm', 'cant cope', 'breaking down', 'emergency room',
                    'hospital', 'police', 'ambulance', 'danger', 'unsafe', 'threat',
                    'diagnosed', 'positive', 'evicted', 'kicked out', 'homeless',
                    'overdose', 'cutting', 'pills', 'jump', 'end it all'
                ],
                emotionalMarkers: [
                    'terrified', 'panicking', 'overwhelmed', 'hopeless', 'desperate',
                    'scared', 'alone', 'trapped', 'numb', 'breaking', 'lost'
                ],
                urgencyWords: [
                    'now', 'today', 'immediately', 'asap', 'right now', 'this minute',
                    'cant wait', 'emergency', 'urgent', 'help me'
                ],
                supportNeeds: [
                    'immediate help', 'crisis support', 'emergency services',
                    'safety planning', 'urgent resources', 'immediate safety'
                ]
            },
            stabilization: {
                keywords: [
                    'getting support', 'finding resources', 'need information',
                    'looking for help', 'therapist', 'counselling', 'support group',
                    'medication', 'treatment', 'regular support', 'ongoing help',
                    'housing support', 'benefits', 'social services', 'gp',
                    'recovery', 'healing', 'stable', 'routine', 'structure'
                ],
                emotionalMarkers: [
                    'anxious but coping', 'cautiously hopeful', 'tired but trying',
                    'overwhelmed but managing', 'seeking stability', 'need routine'
                ],
                supportNeeds: [
                    'ongoing support', 'regular check-ins', 'therapy', 'medication',
                    'housing stability', 'financial support', 'peer support'
                ],
                progressMarkers: [
                    'feeling a bit better', 'getting through each day', 'have support',
                    'following treatment', 'stable housing', 'regular routine'
                ]
            },
            growth: {
                keywords: [
                    'want to learn', 'how can I', 'planning to', 'interested in',
                    'developing', 'improving', 'skill building', 'education',
                    'career', 'goals', 'future', 'next steps', 'opportunities',
                    'workshops', 'training', 'courses', 'mentor', 'coaching'
                ],
                emotionalMarkers: [
                    'motivated', 'curious', 'hopeful', 'ambitious', 'ready to grow',
                    'excited about future', 'confident', 'determined'
                ],
                learningMarkers: [
                    'want to understand', 'learn more', 'develop skills',
                    'take course', 'get training', 'find mentor'
                ],
                skillBuilding: [
                    'communication', 'leadership', 'technical skills', 'emotional intelligence',
                    'financial literacy', 'career development', 'education'
                ]
            },
            community_healing: {
                keywords: [
                    'community support', 'group therapy', 'healing space', 'peer support',
                    'support group', 'healing circle', 'community healing', 'collective',
                    'together', 'shared experience', 'mentoring', 'giving back',
                    'healing trauma', 'community care', 'mutual aid'
                ],
                emotionalMarkers: [
                    'ready to connect', 'wanting community', 'healing together',
                    'sharing experience', 'supporting others', 'feeling connected'
                ],
                communityMarkers: [
                    'community', 'together', 'collective', 'shared', 'group',
                    'peers', 'fellowship', 'belonging', 'family'
                ],
                healingMarkers: [
                    'healing', 'recovery', 'trauma work', 'therapy', 'growth',
                    'transformation', 'resilience', 'strength'
                ]
            },
            advocacy: {
                keywords: [
                    'want to help others', 'organize', 'campaign', 'change',
                    'activism', 'advocacy', 'policy', 'system change', 'justice',
                    'rights', 'discrimination', 'inequality', 'reform', 'movement',
                    'protest', 'petition', 'lobby', 'volunteer', 'lead'
                ],
                emotionalMarkers: [
                    'empowered', 'determined', 'passionate', 'committed',
                    'ready to fight', 'angry at injustice', 'motivated to change'
                ],
                organizingMarkers: [
                    'organize', 'mobilize', 'campaign', 'coalition', 'movement',
                    'protest', 'petition', 'lobby', 'advocate'
                ],
                systemChangeMarkers: [
                    'policy', 'law', 'system', 'institution', 'government',
                    'reform', 'justice', 'rights', 'equality'
                ]
            }
        };
    }
    /**
     * Detect journey stage from user input and context
     */
    detectJourneyStage(userInput, previousStages = [], userProfile = {}) {
        const lowerInput = userInput.toLowerCase();
        const words = lowerInput.split(/\s+/);
        // Score each journey stage
        const stageScores = {
            crisis: this.calculateStageScore(lowerInput, words, this.journeyIndicators.crisis),
            stabilization: this.calculateStageScore(lowerInput, words, this.journeyIndicators.stabilization),
            growth: this.calculateStageScore(lowerInput, words, this.journeyIndicators.growth),
            community_healing: this.calculateStageScore(lowerInput, words, this.journeyIndicators.community_healing),
            advocacy: this.calculateStageScore(lowerInput, words, this.journeyIndicators.advocacy)
        };
        // Emergency override - crisis indicators take precedence
        const emergencyKeywords = ['suicide', 'kill myself', 'end it all', 'overdose', 'emergency', '999', '911'];
        const hasEmergency = emergencyKeywords.some(keyword => lowerInput.includes(keyword));
        if (hasEmergency || stageScores.crisis > 0.7) {
            return this.createJourneyContext('crisis', lowerInput, userProfile, previousStages);
        }
        // Find highest scoring stage
        const topStage = Object.entries(stageScores)
            .reduce((a, b) => stageScores[a[0]] > stageScores[b[0]] ? a : b)[0];
        // Default to growth if no clear indicators
        const finalStage = stageScores[topStage] < 0.3 ? 'growth' : topStage;
        return this.createJourneyContext(finalStage, lowerInput, userProfile, previousStages);
    }
    /**
     * Calculate score for a specific journey stage
     */
    calculateStageScore(input, words, indicators) {
        let score = 0;
        let totalPossible = 0;
        // Check keywords
        const keywordMatches = indicators.keywords?.filter((keyword) => input.includes(keyword.toLowerCase())).length || 0;
        score += keywordMatches * 2;
        totalPossible += indicators.keywords?.length * 2 || 0;
        // Check emotional markers
        const emotionalMatches = indicators.emotionalMarkers?.filter((marker) => input.includes(marker.toLowerCase())).length || 0;
        score += emotionalMatches * 1.5;
        totalPossible += indicators.emotionalMarkers?.length * 1.5 || 0;
        // Check urgency words (crisis specific)
        if (indicators.urgencyWords) {
            const urgencyMatches = indicators.urgencyWords.filter((word) => input.includes(word.toLowerCase())).length;
            score += urgencyMatches * 3; // High weight for urgency
            totalPossible += indicators.urgencyWords.length * 3;
        }
        return totalPossible > 0 ? Math.min(score / totalPossible, 1) : 0;
    }
    /**
     * Create comprehensive journey context
     */
    createJourneyContext(stage, input, userProfile, previousStages) {
        return {
            stage,
            emotionalState: this.detectEmotionalState(input),
            urgencyLevel: this.detectUrgencyLevel(input, stage),
            location: this.detectLocation(userProfile.location),
            communityConnection: this.detectCommunityConnection(input, userProfile),
            firstTime: previousStages.length === 0,
            returningUser: previousStages.length > 0,
            previousStages,
            resourceAccessPreference: this.detectResourcePreference(input, userProfile)
        };
    }
    /**
     * Detect emotional state from input
     */
    detectEmotionalState(input) {
        const lowerInput = input.toLowerCase();
        // Crisis emotions
        if (['suicidal', 'desperate', 'hopeless', 'breaking'].some(word => lowerInput.includes(word))) {
            return 'crisis';
        }
        // Stress emotions
        if (['stressed', 'anxious', 'overwhelmed', 'panic', 'worried'].some(word => lowerInput.includes(word))) {
            return 'stressed';
        }
        // Positive emotions
        if (['excited', 'happy', 'motivated', 'determined', 'hopeful'].some(word => lowerInput.includes(word))) {
            return 'excited';
        }
        // Joy emotions
        if (['joy', 'celebration', 'amazing', 'wonderful', 'fantastic'].some(word => lowerInput.includes(word))) {
            return 'joyful';
        }
        // Uncertain emotions
        if (['unsure', 'confused', 'lost', 'dont know', 'uncertain'].some(word => lowerInput.includes(word))) {
            return 'uncertain';
        }
        return 'calm'; // default
    }
    /**
     * Detect urgency level
     */
    detectUrgencyLevel(input, stage) {
        const lowerInput = input.toLowerCase();
        // Emergency words override everything
        if (['emergency', '999', 'ambulance', 'suicide', 'overdose'].some(word => lowerInput.includes(word))) {
            return 'emergency';
        }
        // Crisis stage defaults to high urgency
        if (stage === 'crisis') {
            return 'high';
        }
        // High urgency indicators
        if (['urgent', 'asap', 'immediately', 'right now', 'today'].some(word => lowerInput.includes(word))) {
            return 'high';
        }
        // Medium urgency indicators
        if (['soon', 'this week', 'within days', 'quickly'].some(word => lowerInput.includes(word))) {
            return 'medium';
        }
        return 'low'; // default
    }
    /**
     * Detect UK location
     */
    detectLocation(locationHint) {
        if (!locationHint)
            return 'unknown';
        const location = locationHint.toLowerCase();
        if (location.includes('london'))
            return 'london';
        if (location.includes('manchester'))
            return 'manchester';
        if (location.includes('birmingham'))
            return 'birmingham';
        if (location.includes('leeds'))
            return 'leeds';
        if (location.includes('glasgow'))
            return 'glasgow';
        if (location.includes('cardiff'))
            return 'cardiff';
        if (location.includes('belfast'))
            return 'belfast';
        if (location.includes('bristol'))
            return 'bristol';
        if (location.includes('liverpool'))
            return 'liverpool';
        if (location.includes('sheffield'))
            return 'sheffield';
        if (location.includes('nottingham'))
            return 'nottingham';
        if (location.includes('brighton'))
            return 'brighton';
        // Check for rural indicators
        if (['rural', 'countryside', 'village', 'small town'].some(word => location.includes(word))) {
            return 'rural';
        }
        return 'other_urban'; // default for other cities
    }
    /**
     * Detect community connection level
     */
    detectCommunityConnection(input, userProfile) {
        const lowerInput = input.toLowerCase();
        // Organizing indicators
        if (['organizing', 'leading', 'campaign', 'activist', 'advocate'].some(word => lowerInput.includes(word))) {
            return 'organizing';
        }
        // Well-connected indicators
        if (['community', 'friends', 'network', 'support group', 'involved'].some(word => lowerInput.includes(word))) {
            return 'networked';
        }
        // Some connection indicators
        if (['some friends', 'few people', 'getting involved', 'meeting people'].some(phrase => lowerInput.includes(phrase))) {
            return 'connected';
        }
        // Exploring indicators
        if (['looking for', 'want to meet', 'finding community', 'new here'].some(phrase => lowerInput.includes(phrase))) {
            return 'exploring';
        }
        // Isolation indicators
        if (['alone', 'isolated', 'no one', 'by myself', 'no friends'].some(phrase => lowerInput.includes(phrase))) {
            return 'isolated';
        }
        return 'exploring'; // default assumption
    }
    /**
     * Detect resource access preference
     */
    detectResourcePreference(input, userProfile) {
        const lowerInput = input.toLowerCase();
        if (['call', 'phone', 'talk to someone', 'speak'].some(word => lowerInput.includes(word))) {
            return 'phone';
        }
        if (['online', 'website', 'digital', 'app', 'chat'].some(word => lowerInput.includes(word))) {
            return 'online';
        }
        if (['in person', 'face to face', 'meet', 'visit', 'go to'].some(phrase => lowerInput.includes(phrase))) {
            return 'in_person';
        }
        return 'flexible'; // default
    }
}
exports.JourneyStageDetector = JourneyStageDetector;
exports.default = JourneyStageDetector;
//# sourceMappingURL=JourneyStageDetector.js.map