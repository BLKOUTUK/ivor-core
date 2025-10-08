/**
 * Resource Intent and Crisis Detection for IVOR
 *
 * @module resourceDetection
 */

/**
 * Detect if user message relates to resource discovery
 *
 * @param {string} message - User message
 * @returns {boolean} True if resource intent detected
 *
 * @example
 * detectResourceIntent("Where can I get PrEP?"); // true
 * detectResourceIntent("What is PrEP?"); // false (educational, not resource query)
 */
function detectResourceIntent(message) {
  if (!message || typeof message !== 'string') {
    return false;
  }

  const msg = message.toLowerCase();

  // Explicit resource keywords
  const resourceKeywords = [
    'where can i', 'how do i find', 'i need', 'looking for',
    'support', 'services', 'help with', 'access', 'clinic',
    'counselling', 'counseling', 'therapy', 'therapist',
    'event', 'organization', 'charity', 'helpline',
    'prep', 'hiv', 'sexual health', 'mental health',
    'near me', 'in my area', 'available'
  ];

  // Check for explicit keywords
  for (const keyword of resourceKeywords) {
    if (msg.includes(keyword)) {
      return true;
    }
  }

  // Check for question patterns + health/support context
  const questionWords = ['where', 'how', 'what', 'who', 'which', 'when'];
  const contextWords = ['support', 'help', 'service', 'clinic', 'counselling', 'resource'];

  const hasQuestion = questionWords.some(q => msg.includes(q));
  const hasContext = contextWords.some(c => msg.includes(c));

  return hasQuestion && hasContext;
}

/**
 * Detect crisis keywords in message
 *
 * @param {string} message - User message
 * @returns {Object} { isCrisis: boolean, severity: 'explicit'|'implicit'|'none' }
 *
 * @example
 * detectCrisis("I want to end it all"); // { isCrisis: true, severity: 'explicit' }
 * detectCrisis("I'm struggling to cope"); // { isCrisis: true, severity: 'implicit' }
 * detectCrisis("How can I cope with stress?"); // { isCrisis: false, severity: 'none' }
 */
function detectCrisis(message) {
  if (!message || typeof message !== 'string') {
    return { isCrisis: false, severity: 'none' };
  }

  const msg = message.toLowerCase();

  // Explicit crisis keywords (highest priority)
  const explicitKeywords = [
    'suicide', 'suicidal', 'kill myself', 'end it all',
    "can't go on", 'no reason to live', 'want to die',
    'better off dead', 'end my life', 'harm myself'
  ];

  for (const keyword of explicitKeywords) {
    if (msg.includes(keyword)) {
      console.warn(`[CRISIS DETECTION] Explicit crisis keyword detected: "${keyword}"`);
      return { isCrisis: true, severity: 'explicit' };
    }
  }

  // Implicit distress signals
  const implicitKeywords = [
    "can't cope", "can't take it anymore", 'breaking down',
    'falling apart', 'no way out', 'losing hope',
    'really struggling', 'desperate', "can't do this",
    'give up', 'no point'
  ];

  for (const keyword of implicitKeywords) {
    if (msg.includes(keyword)) {
      console.info(`[CRISIS DETECTION] Implicit distress signal detected: "${keyword}"`);
      return { isCrisis: true, severity: 'implicit' };
    }
  }

  return { isCrisis: false, severity: 'none' };
}

/**
 * Detect if message is about specific health topic
 *
 * @param {string} message - User message
 * @param {string} topic - Health topic ('sexual_health', 'mental_health', 'hiv', 'prep')
 * @returns {boolean} True if message relates to topic
 */
function detectHealthTopic(message, topic) {
  if (!message || typeof message !== 'string') {
    return false;
  }

  const msg = message.toLowerCase();

  const topicKeywords = {
    sexual_health: ['sexual health', 'sti', 'std', 'prep', 'pep', 'hiv', 'test', 'clinic'],
    mental_health: ['mental health', 'anxiety', 'depression', 'therapy', 'counselling', 'stress'],
    hiv: ['hiv', 'aids', 'antiretroviral', 'viral load', 'cd4', 'u=u'],
    prep: ['prep', 'pre-exposure prophylaxis', 'prevent hiv', 'truvada', 'descovy']
  };

  const keywords = topicKeywords[topic] || [];
  return keywords.some(keyword => msg.includes(keyword));
}

module.exports = {
  detectResourceIntent,
  detectCrisis,
  detectHealthTopic
};
