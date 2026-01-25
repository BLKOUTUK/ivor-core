// Voice API Endpoint Tests
// Tests for MeloTTS integration and Supabase storage

const { describe, test, expect, beforeEach, afterEach, jest } = require('@jest/globals');

// Mock dependencies
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    storage: {
      from: jest.fn(() => ({
        list: jest.fn(),
        upload: jest.fn(),
        createSignedUrl: jest.fn()
      }))
    }
  }))
}));

// Mock fetch
global.fetch = jest.fn();

const handler = require('../voice');

describe('Voice API Endpoint', () => {
  let mockReq;
  let mockRes;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Mock request
    mockReq = {
      method: 'POST',
      body: {
        text: 'Hello, I am IVOR.',
        sessionId: 'test-session-123',
        userId: 'test-user-456'
      }
    };

    // Mock response
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      setHeader: jest.fn(),
      send: jest.fn()
    };

    // Set environment variables
    process.env.MELOTTS_URL = 'http://localhost:8101';
    process.env.SUPABASE_URL = 'https://test.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-key';
  });

  afterEach(() => {
    // Clean up environment
    delete process.env.MELOTTS_URL;
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  });

  describe('Request Validation', () => {
    test('should reject non-POST requests', async () => {
      mockReq.method = 'GET';

      await handler(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(405);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'Method not allowed'
        })
      );
    });

    test('should handle CORS preflight', async () => {
      mockReq.method = 'OPTIONS';

      await handler(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.setHeader).toHaveBeenCalledWith(
        'Access-Control-Allow-Origin',
        '*'
      );
    });

    test('should reject empty text', async () => {
      mockReq.body.text = '';

      await handler(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'Invalid request'
        })
      );
    });

    test('should reject text over 5000 characters', async () => {
      mockReq.body.text = 'a'.repeat(5001);

      await handler(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'Text too long',
          maxLength: 5000
        })
      );
    });

    test('should accept valid text', async () => {
      // Mock MeloTTS response
      global.fetch.mockResolvedValueOnce({
        ok: true,
        arrayBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(1024))
      });

      await handler(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true
        })
      );
    });
  });

  describe('MeloTTS Integration', () => {
    test('should call MeloTTS API with correct parameters', async () => {
      // Mock MeloTTS response
      global.fetch.mockResolvedValueOnce({
        ok: true,
        arrayBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(1024))
      });

      await handler(mockReq, mockRes);

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:8101/synthesize',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: expect.stringContaining('EN-BR')
        })
      );
    });

    test('should handle MeloTTS API errors', async () => {
      // Mock MeloTTS error
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      });

      await handler(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'Voice synthesis failed'
        })
      );
    });

    test('should generate audio with British accent', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        arrayBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(1024))
      });

      await handler(mockReq, mockRes);

      const fetchCall = global.fetch.mock.calls[0];
      const requestBody = JSON.parse(fetchCall[1].body);

      expect(requestBody.accent).toBe('EN-BR');
      expect(requestBody.language).toBe('EN');
    });
  });

  describe('Supabase Storage Integration', () => {
    test('should check cache before generating audio', async () => {
      const { createClient } = require('@supabase/supabase-js');
      const mockSupabase = createClient();

      // Mock cache hit
      mockSupabase.storage.from().list.mockResolvedValueOnce({
        data: [{ name: 'cached-audio.mp3' }]
      });

      mockSupabase.storage.from().createSignedUrl.mockResolvedValueOnce({
        data: { signedUrl: 'https://cached-url.com/audio.mp3' }
      });

      await handler(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          source: 'cache',
          cached: true
        })
      );
    });

    test('should upload to storage when not cached', async () => {
      const { createClient } = require('@supabase/supabase-js');
      const mockSupabase = createClient();

      // Mock cache miss
      mockSupabase.storage.from().list.mockResolvedValueOnce({
        data: []
      });

      // Mock MeloTTS response
      global.fetch.mockResolvedValueOnce({
        ok: true,
        arrayBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(1024))
      });

      // Mock upload success
      mockSupabase.storage.from().upload.mockResolvedValueOnce({
        data: { path: 'cache/audio.mp3' },
        error: null
      });

      mockSupabase.storage.from().createSignedUrl.mockResolvedValueOnce({
        data: { signedUrl: 'https://new-url.com/audio.mp3' }
      });

      await handler(mockReq, mockRes);

      expect(mockSupabase.storage.from().upload).toHaveBeenCalledWith(
        expect.stringContaining('cache/'),
        expect.any(ArrayBuffer),
        expect.objectContaining({
          contentType: 'audio/mpeg',
          cacheControl: '604800'
        })
      );
    });

    test('should handle storage upload errors gracefully', async () => {
      const { createClient } = require('@supabase/supabase-js');
      const mockSupabase = createClient();

      // Mock cache miss
      mockSupabase.storage.from().list.mockResolvedValueOnce({
        data: []
      });

      // Mock MeloTTS response
      global.fetch.mockResolvedValueOnce({
        ok: true,
        arrayBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(1024))
      });

      // Mock upload error
      mockSupabase.storage.from().upload.mockResolvedValueOnce({
        data: null,
        error: { message: 'Upload failed' }
      });

      await handler(mockReq, mockRes);

      // Should still return audio directly
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });
  });

  describe('Response Format', () => {
    test('should return correct response structure', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        arrayBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(1024))
      });

      await handler(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          audioUrl: expect.any(String),
          source: expect.any(String),
          service: 'ivor-voice',
          sessionId: 'test-session-123',
          userId: 'test-user-456',
          timestamp: expect.any(String)
        })
      );
    });

    test('should include audio metadata', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        arrayBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(1024))
      });

      await handler(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          textLength: expect.any(Number),
          audioSize: expect.any(Number),
          expiresIn: 604800
        })
      );
    });
  });

  describe('Error Handling', () => {
    test('should handle network errors', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network error'));

      await handler(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'Voice synthesis failed'
        })
      );
    });

    test('should provide fallback message on error', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Service unavailable'));

      await handler(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          fallback: 'Text-only mode available'
        })
      );
    });
  });
});
