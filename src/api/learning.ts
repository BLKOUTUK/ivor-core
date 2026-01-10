/**
 * IVOR Learning API Endpoints
 * Exposes learning functionality through REST API
 */

import { Router, Request, Response } from 'express';
import learningService from '../services/learningService';

const router = Router();

/**
 * GET /api/learning/modules
 * Get all available learning modules
 */
router.get('/modules', async (req: Request, res: Response) => {
  try {
    const { category, difficulty } = req.query;

    const modules = await learningService.getAvailableModules(
      category as string,
      difficulty as string
    );

    res.json({
      success: true,
      count: modules.length,
      modules
    });
  } catch (error) {
    console.error('Error fetching modules:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch learning modules'
    });
  }
});

/**
 * GET /api/learning/modules/:id
 * Get specific learning module
 */
router.get('/modules/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const module = await learningService.getModule(id);

    if (!module) {
      return res.status(404).json({
        success: false,
        error: 'Module not found'
      });
    }

    res.json({
      success: true,
      module
    });
  } catch (error) {
    console.error('Error fetching module:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch module'
    });
  }
});

/**
 * POST /api/learning/enroll
 * Enroll user in a learning module
 */
router.post('/enroll', async (req: Request, res: Response) => {
  try {
    const { userId, moduleId } = req.body;

    if (!userId || !moduleId) {
      return res.status(400).json({
        success: false,
        error: 'userId and moduleId are required'
      });
    }

    const progressId = await learningService.enrollInModule(moduleId);

    if (!progressId) {
      return res.status(500).json({
        success: false,
        error: 'Failed to enroll in module'
      });
    }

    res.json({
      success: true,
      progressId,
      message: 'Successfully enrolled in module'
    });
  } catch (error) {
    console.error('Error enrolling in module:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to enroll in module'
    });
  }
});

/**
 * GET /api/learning/progress/:userId
 * Get all learning progress for user
 */
router.get('/progress/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const progress = await learningService.getUserProgress(userId);

    res.json({
      success: true,
      count: progress.length,
      progress
    });
  } catch (error) {
    console.error('Error fetching progress:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch progress'
    });
  }
});

/**
 * GET /api/learning/progress/:userId/:moduleId
 * Get specific module progress
 */
router.get('/progress/:userId/:moduleId', async (req: Request, res: Response) => {
  try {
    const { userId, moduleId } = req.params;
    const progress = await learningService.getProgress(userId, moduleId);

    if (!progress) {
      return res.status(404).json({
        success: false,
        error: 'Progress not found'
      });
    }

    res.json({
      success: true,
      progress
    });
  } catch (error) {
    console.error('Error fetching progress:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch progress'
    });
  }
});

/**
 * PUT /api/learning/progress
 * Update learning progress
 */
router.put('/progress', async (req: Request, res: Response) => {
  try {
    const { userId, moduleId, progressPercentage, timeSpentMinutes } = req.body;

    if (!userId || !moduleId || progressPercentage === undefined) {
      return res.status(400).json({
        success: false,
        error: 'userId, moduleId, and progressPercentage are required'
      });
    }

    const success = await learningService.updateProgress(
      moduleId,
      progressPercentage,
      timeSpentMinutes || 0
    );

    if (!success) {
      return res.status(500).json({
        success: false,
        error: 'Failed to update progress'
      });
    }

    res.json({
      success: true,
      message: 'Progress updated successfully'
    });
  } catch (error) {
    console.error('Error updating progress:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update progress'
    });
  }
});

/**
 * POST /api/learning/quiz/submit
 * Submit quiz results
 */
router.post('/quiz/submit', async (req: Request, res: Response) => {
  try {
    const { userId, moduleId, score, passingScore } = req.body;

    if (!userId || !moduleId || score === undefined) {
      return res.status(400).json({
        success: false,
        error: 'userId, moduleId, and score are required'
      });
    }

    const passed = await learningService.submitQuizResults(
      moduleId,
      score,
      passingScore || 70
    );

    res.json({
      success: true,
      passed,
      score,
      message: passed ? 'Congratulations! You passed!' : 'Keep learning, you\'ll get it!'
    });
  } catch (error) {
    console.error('Error submitting quiz:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit quiz results'
    });
  }
});

/**
 * POST /api/learning/certificate/generate
 * Generate completion certificate
 */
router.post('/certificate/generate', async (req: Request, res: Response) => {
  try {
    const { userId, moduleId } = req.body;

    if (!userId || !moduleId) {
      return res.status(400).json({
        success: false,
        error: 'userId and moduleId are required'
      });
    }

    const certificateId = await learningService.generateCertificate(moduleId);

    if (!certificateId) {
      return res.status(400).json({
        success: false,
        error: 'Certificate generation failed. Module may not be completed or quiz not passed.'
      });
    }

    res.json({
      success: true,
      certificateId,
      message: 'Certificate generated successfully!'
    });
  } catch (error) {
    console.error('Error generating certificate:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate certificate'
    });
  }
});

/**
 * GET /api/learning/recommendations/:userId
 * Get personalized learning recommendations
 */
router.get('/recommendations/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { category } = req.query;

    const recommendations = await learningService.getRecommendations(
      userId,
      category as string
    );

    res.json({
      success: true,
      count: recommendations.length,
      recommendations
    });
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch recommendations'
    });
  }
});

/**
 * POST /api/learning/chat/lesson
 * Get conversational lesson delivery
 */
router.post('/chat/lesson', async (req: Request, res: Response) => {
  try {
    const { moduleId, sectionIndex, userId } = req.body;

    if (!moduleId || sectionIndex === undefined) {
      return res.status(400).json({
        success: false,
        error: 'moduleId and sectionIndex are required'
      });
    }

    const module = await learningService.getModule(moduleId);
    if (!module) {
      return res.status(404).json({
        success: false,
        error: 'Module not found'
      });
    }

    const progress = userId ? await learningService.getProgress(userId, moduleId) : null;
    const lessonContent = learningService.formatLessonForConversation(module, sectionIndex);
    const context = learningService.createLearningContext(module, progress, 'lesson');

    res.json({
      success: true,
      lesson: lessonContent,
      context,
      sectionIndex,
      totalSections: module.content.sections?.length || 0
    });
  } catch (error) {
    console.error('Error delivering lesson:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to deliver lesson'
    });
  }
});

/**
 * POST /api/learning/chat/quiz
 * Get quiz question in conversational format
 */
router.post('/chat/quiz', async (req: Request, res: Response) => {
  try {
    const { moduleId, questionIndex } = req.body;

    if (!moduleId || questionIndex === undefined) {
      return res.status(400).json({
        success: false,
        error: 'moduleId and questionIndex are required'
      });
    }

    const module = await learningService.getModule(moduleId);
    if (!module) {
      return res.status(404).json({
        success: false,
        error: 'Module not found'
      });
    }

    const questionText = learningService.formatQuizQuestion(module, questionIndex);
    const totalQuestions = module.quiz_questions?.length || 0;

    res.json({
      success: true,
      question: questionText,
      questionIndex,
      totalQuestions
    });
  } catch (error) {
    console.error('Error delivering quiz question:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to deliver quiz question'
    });
  }
});

/**
 * POST /api/learning/chat/quiz/check
 * Check quiz answer
 */
router.post('/chat/quiz/check', async (req: Request, res: Response) => {
  try {
    const { moduleId, questionIndex, answer } = req.body;

    if (!moduleId || questionIndex === undefined || !answer) {
      return res.status(400).json({
        success: false,
        error: 'moduleId, questionIndex, and answer are required'
      });
    }

    const module = await learningService.getModule(moduleId);
    if (!module) {
      return res.status(404).json({
        success: false,
        error: 'Module not found'
      });
    }

    const result = learningService.checkQuizAnswer(module, questionIndex, answer);

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Error checking answer:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check answer'
    });
  }
});

export default router;
