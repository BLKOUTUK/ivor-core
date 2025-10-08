/**
 * Resource Formatting Utilities for IVOR
 * Format semantic search results for LLM context and frontend display
 *
 * @module resourceFormatter
 */

/**
 * Format search results for GROQ LLM context injection
 *
 * @param {Array} resources - Search results from semantic search
 * @returns {string} Formatted context for LLM prompt
 *
 * @example
 * const context = formatResourcesForLLM([
 *   { name: "Prepster", type: "resource", location: "UK-wide", score: 0.72, ... }
 * ]);
 * // Returns formatted string for LLM context
 */
function formatResourcesForLLM(resources) {
  if (!resources || resources.length === 0) {
    return "No specific resources found in our database.";
  }

  let formatted = "## REAL-TIME COMMUNITY RESOURCES\n\n";
  formatted += "Based on the user's query, I found these relevant community resources:\n\n";

  resources.forEach((resource, index) => {
    formatted += `${index + 1}. **${resource.name}** (${resource.type})\n`;

    if (resource.location) {
      formatted += `   📍 Location: ${resource.location}\n`;
    }

    if (resource.description) {
      // Truncate long descriptions for LLM context
      const desc = resource.description.length > 200
        ? resource.description.substring(0, 200) + "..."
        : resource.description;
      formatted += `   Description: ${desc}\n`;
    }

    // Contact information from metadata
    const metadata = resource.metadata || {};

    if (metadata.phone) {
      formatted += `   📞 Phone: ${metadata.phone}\n`;
    }

    if (metadata.email) {
      formatted += `   ✉️ Email: ${metadata.email}\n`;
    }

    if (metadata.url || metadata.website) {
      const url = metadata.url || metadata.website;
      formatted += `   🌐 Website: ${url}\n`;
    }

    // Include relevance score
    const relevancePercent = (resource.score * 100).toFixed(0);
    formatted += `   ✅ Relevance: ${relevancePercent}%\n\n`;
  });

  formatted += "\n**IMPORTANT INSTRUCTIONS:**\n";
  formatted += "- Use these REAL resources in your response\n";
  formatted += "- Cite specific names, contact information, and URLs\n";
  formatted += "- Be warm, supportive, and culturally affirming\n";
  formatted += "- Prioritize resources with higher relevance scores\n";
  formatted += "- If user is in crisis, emphasize immediate contact options (phone numbers)\n";

  return formatted;
}

/**
 * Format resources for frontend display (resource cards)
 *
 * @param {Array} resources - Search results from semantic search
 * @returns {Array} Simplified resource objects for frontend
 *
 * @example
 * const frontendResources = formatResourcesForFrontend(searchResults);
 * // Returns: [{ id, name, description, type, location, phone, email, url }]
 */
function formatResourcesForFrontend(resources) {
  if (!resources || resources.length === 0) {
    return [];
  }

  return resources.map(resource => {
    const metadata = resource.metadata || {};

    return {
      id: resource.id,
      name: resource.name,
      description: resource.description || '',
      type: resource.type || 'resource',
      location: resource.location || '',
      phone: metadata.phone || null,
      email: metadata.email || null,
      url: metadata.url || metadata.website || null,
      score: resource.score,
      // Additional metadata for frontend use
      category: metadata.category || null,
      tags: metadata.tags || [],
      organization: metadata.organization || null
    };
  });
}

/**
 * Create crisis-specific resource context
 *
 * @param {Array} resources - Crisis resources from search
 * @param {string} severity - Crisis severity ('explicit' or 'implicit')
 * @returns {string} Crisis-appropriate context for LLM
 */
function formatCrisisContext(resources, severity) {
  let formatted = "## 🆘 IMMEDIATE CRISIS SUPPORT RESOURCES\n\n";

  if (severity === 'explicit') {
    formatted += "**CRITICAL**: User expressed explicit suicidal ideation or self-harm intent.\n\n";
  } else {
    formatted += "**ALERT**: User showing signs of significant distress.\n\n";
  }

  if (resources && resources.length > 0) {
    formatted += "**Community Crisis Resources Found:**\n\n";

    resources.forEach((resource, index) => {
      formatted += `${index + 1}. **${resource.name}**\n`;

      const metadata = resource.metadata || {};

      // Prioritize immediate contact methods
      if (metadata.phone) {
        formatted += `   📞 **CALL NOW**: ${metadata.phone}\n`;
      }

      if (metadata.crisis_text) {
        formatted += `   💬 **TEXT**: ${metadata.crisis_text}\n`;
      }

      if (metadata.url) {
        formatted += `   🌐 ${metadata.url}\n`;
      }

      if (resource.description) {
        formatted += `   ${resource.description.substring(0, 100)}...\n`;
      }

      formatted += "\n";
    });
  }

  // Always include UK crisis lines
  formatted += "\n**UK National Crisis Support:**\n";
  formatted += "- 🆘 **Samaritans**: 116 123 (24/7, free)\n";
  formatted += "- 💬 **Crisis Text Line**: Text SHOUT to 85258\n";
  formatted += "- 🏳️‍🌈 **LGBT+ Switchboard**: 0300 330 0630\n";
  formatted += "- 🏳️‍⚧️ **Mindline Trans+**: 0300 330 5468\n";
  formatted += "- 🚨 **Emergency**: 999 or 112\n\n";

  formatted += "**RESPONSE GUIDELINES:**\n";
  formatted += "- Express genuine concern and compassion\n";
  formatted += "- Validate their feelings without judgment\n";
  formatted += "- Emphasize that help is available RIGHT NOW\n";
  formatted += "- Encourage them to call one of these numbers immediately\n";
  formatted += "- Remind them they are valued and the community needs them\n";
  formatted += "- Use trauma-informed, culturally affirming language\n";

  return formatted;
}

/**
 * Truncate description to specified length
 *
 * @param {string} description - Full description text
 * @param {number} maxLength - Maximum character length
 * @returns {string} Truncated description
 */
function truncateDescription(description, maxLength = 150) {
  if (!description || description.length <= maxLength) {
    return description || '';
  }

  return description.substring(0, maxLength).trim() + '...';
}

module.exports = {
  formatResourcesForLLM,
  formatResourcesForFrontend,
  formatCrisisContext,
  truncateDescription
};
