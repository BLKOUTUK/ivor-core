// Test script for RAG-enhanced chat API
// Simulates Vercel serverless environment

// Load environment variables
require('dotenv').config();

const chatHandler = require('./api/chat.js');

// Mock request object
const mockRequest = {
  method: 'POST',
  body: {
    message: 'Where can I get PrEP in London?',
    conversationHistory: [],
    sessionId: 'test-prep-001'
  }
};

// Mock response object
const mockResponse = {
  _status: 200,
  _headers: {},
  _body: null,

  status(code) {
    this._status = code;
    return this;
  },

  setHeader(key, value) {
    this._headers[key] = value;
    return this;
  },

  json(data) {
    this._body = data;
    console.log('\n=== RESPONSE ===');
    console.log(`Status: ${this._status}`);
    console.log('Body:', JSON.stringify(data, null, 2));

    // Check for RAG enhancement
    if (data.resources) {
      console.log(`\n✅ RAG ENHANCED: ${data.resources.length} resources found`);
      data.resources.forEach((resource, index) => {
        console.log(`\n${index + 1}. ${resource.name}`);
        if (resource.description) console.log(`   Description: ${resource.description.substring(0, 100)}...`);
        if (resource.location) console.log(`   Location: ${resource.location}`);
        if (resource.phone) console.log(`   Phone: ${resource.phone}`);
        if (resource.url) console.log(`   URL: ${resource.url}`);
        console.log(`   Relevance: ${(resource.score * 100).toFixed(0)}%`);
      });
    } else {
      console.log('\n⚠️  NO RESOURCES: RAG not triggered or search unavailable');
    }

    return this;
  }
};

// Run the test
console.log('=== Testing RAG-Enhanced Chat API ===');
console.log('Query: "Where can I get PrEP in London?"');
console.log('\nExpected: Prepster + Metro Charity resources');
console.log('---\n');

chatHandler(mockRequest, mockResponse)
  .then(() => {
    console.log('\n=== Test Complete ===');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n=== ERROR ===');
    console.error(error);
    process.exit(1);
  });
