/**
 * IVOR Learning Service
 * Delivers learning content through conversational AI
 * Centers liberation pedagogy and trauma-informed teaching
 */

import { getSupabaseClient } from '../lib/supabaseClient.js';

const supabase = getSupabaseClient();

export interface LearningModule {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  content: any;
  learning_objectives: string[];
  difficulty_level: string;
  estimated_duration_minutes: number;
  liberation_values: Record<string, number>;
  ivor_lesson_plan: any;
  quiz_questions: any[];
}

export interface LearningProgress {
  id: string;
  user_id: string;
  module_id: string;
  status: string;
  progress_percentage: number;
  quiz_score?: number;
  quiz_passed: boolean;
  certificate_issued: boolean;
  ivor_conversation_id?: string;
}

export class LearningService {
  /**
   * Get all available learning modules
   */
  async getAvailableModules(category?: string, difficulty?: string): Promise<LearningModule[]> {
    let query = supabase
      .from('learning_modules')
      .select('*')
      .eq('is_published', true);

    if (category) {
      query = query.eq('category', category);
    }

    if (difficulty) {
      query = query.eq('difficulty_level', difficulty);
    }

    const { data, error } = await query.order('published_at', { ascending: false });

    if (error) {
      console.error('Error fetching learning modules:', error);
      return [];
    }

    return data as LearningModule[];
  }

  /**
   * Get a specific learning module
   */
  async getModule(moduleId: string): Promise<LearningModule | null> {
    const { data, error } = await supabase
      .from('learning_modules')
      .select('*')
      .eq('id', moduleId)
      .single();

    if (error) {
      console.error('Error fetching module:', error);
      return null;
    }

    return data as LearningModule;
  }

  /**
   * Enroll user in a learning module
   * Note: userId handled by Supabase RPC via authenticated session
   */
  async enrollInModule(moduleId: string): Promise<string | null> {
    const { data, error } = await supabase.rpc('enroll_in_module', {
      p_module_id: moduleId
    });

    if (error) {
      console.error('Error enrolling in module:', error);
      return null;
    }

    return data as string;
  }

  /**
   * Get user's learning progress for a module
   */
  async getProgress(userId: string, moduleId: string): Promise<LearningProgress | null> {
    const { data, error } = await supabase
      .from('learning_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('module_id', moduleId)
      .single();

    if (error) {
      console.error('Error fetching progress:', error);
      return null;
    }

    return data as LearningProgress;
  }

  /**
   * Get all user's learning progress
   */
  async getUserProgress(userId: string): Promise<LearningProgress[]> {
    const { data, error } = await supabase
      .from('learning_progress')
      .select('*')
      .eq('user_id', userId)
      .order('last_accessed_at', { ascending: false });

    if (error) {
      console.error('Error fetching user progress:', error);
      return [];
    }

    return data as LearningProgress[];
  }

  /**
   * Update learning progress
   * Note: userId handled by Supabase RPC via authenticated session
   */
  async updateProgress(
    moduleId: string,
    progressPercentage: number,
    timeSpentMinutes: number = 0
  ): Promise<boolean> {
    const { data, error } = await supabase.rpc('update_learning_progress', {
      p_module_id: moduleId,
      p_progress_percentage: progressPercentage,
      p_time_spent_minutes: timeSpentMinutes
    });

    if (error) {
      console.error('Error updating progress:', error);
      return false;
    }

    return data as boolean;
  }

  /**
   * Submit quiz results
   * Note: userId handled by Supabase RPC via authenticated session
   */
  async submitQuizResults(
    moduleId: string,
    score: number,
    passingScore: number = 70
  ): Promise<boolean> {
    const { data, error } = await supabase.rpc('submit_quiz_results', {
      p_module_id: moduleId,
      p_score: score,
      p_passing_score: passingScore
    });

    if (error) {
      console.error('Error submitting quiz results:', error);
      return false;
    }

    return data as boolean;
  }

  /**
   * Generate certificate for completed module
   * Note: userId handled by Supabase RPC via authenticated session
   */
  async generateCertificate(moduleId: string): Promise<string | null> {
    const { data, error } = await supabase.rpc('generate_learning_certificate', {
      p_module_id: moduleId
    });

    if (error) {
      console.error('Error generating certificate:', error);
      return null;
    }

    return data as string;
  }

  /**
   * Get conversational lesson plan for IVOR delivery
   */
  async getLessonPlan(moduleId: string): Promise<any> {
    const module = await this.getModule(moduleId);
    if (!module || !module.ivor_lesson_plan) {
      return null;
    }

    return module.ivor_lesson_plan;
  }

  /**
   * Format module content for conversational delivery
   */
  formatLessonForConversation(module: LearningModule, sectionIndex: number = 0): string {
    const content = module.content;
    const sections = content.sections || [];

    if (sectionIndex >= sections.length) {
      return "You've completed all sections! Ready for the quiz?";
    }

    const section = sections[sectionIndex];
    const lessonPlan = module.ivor_lesson_plan || {};

    // Build conversational introduction
    let response = `\n**${section.title}**\n\n`;
    response += `${section.content}\n\n`;

    // Add conversational prompts if available
    if (lessonPlan.sections && lessonPlan.sections[sectionIndex]) {
      const sectionPlan = lessonPlan.sections[sectionIndex];
      if (sectionPlan.conversational_points) {
        response += `💭 **Reflect on this:**\n`;
        sectionPlan.conversational_points.forEach((point: string) => {
          response += `  • ${point}\n`;
        });
      }
    }

    // Progress indicator
    const progress = ((sectionIndex + 1) / sections.length) * 100;
    response += `\n📊 **Progress:** ${Math.round(progress)}% complete\n`;
    response += `⏱️ **Estimated time:** ${section.duration_minutes || 10} minutes\n\n`;

    // Next steps
    if (sectionIndex < sections.length - 1) {
      response += `Ready to continue to the next section? Just say "next" or "continue".\n`;
    } else {
      response += `You've completed all sections! Say "quiz" when you're ready to test your knowledge.\n`;
    }

    return response;
  }

  /**
   * Format quiz question for conversational delivery
   */
  formatQuizQuestion(module: LearningModule, questionIndex: number = 0): string {
    const questions = module.quiz_questions || [];

    if (questionIndex >= questions.length) {
      return "No more quiz questions!";
    }

    const q = questions[questionIndex];

    let response = `\n**Quiz Question ${questionIndex + 1} of ${questions.length}**\n\n`;
    response += `${q.question}\n\n`;

    q.options.forEach((option: string, index: number) => {
      const letter = String.fromCharCode(65 + index); // A, B, C, D
      response += `${letter}. ${option}\n`;
    });

    response += `\nReply with the letter of your answer (A, B, C, or D).\n`;

    return response;
  }

  /**
   * Check quiz answer
   */
  checkQuizAnswer(
    module: LearningModule,
    questionIndex: number,
    userAnswer: string
  ): { correct: boolean; explanation: string; correctAnswer: string } {
    const questions = module.quiz_questions || [];
    const q = questions[questionIndex];

    // Convert letter answer to index
    const answerIndex = userAnswer.toUpperCase().charCodeAt(0) - 65; // A=0, B=1, etc.
    const correct = answerIndex === q.correct;

    return {
      correct,
      explanation: q.explanation || '',
      correctAnswer: String.fromCharCode(65 + q.correct)
    };
  }

  /**
   * Calculate quiz score
   */
  calculateQuizScore(totalQuestions: number, correctAnswers: number): number {
    if (totalQuestions === 0) return 0;
    return Math.round((correctAnswers / totalQuestions) * 100);
  }

  /**
   * Get learning recommendations based on user interests
   */
  async getRecommendations(userId: string, category?: string): Promise<LearningModule[]> {
    // Get user's completed modules
    const progress = await this.getUserProgress(userId);
    const completedModuleIds = progress
      .filter(p => p.status === 'completed')
      .map(p => p.module_id);

    // Get modules user hasn't started
    let query = supabase
      .from('learning_modules')
      .select('*')
      .eq('is_published', true)
      .not('id', 'in', completedModuleIds.length > 0 ? `(${completedModuleIds.join(',')})` : '()');

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query
      .order('enrollment_count', { ascending: false })
      .limit(5);

    if (error) {
      console.error('Error fetching recommendations:', error);
      return [];
    }

    return data as LearningModule[];
  }

  /**
   * Create IVOR conversation context for learning mode
   */
  createLearningContext(
    module: LearningModule,
    progress: LearningProgress | null,
    mode: 'lesson' | 'quiz' = 'lesson'
  ): string {
    const context = `
You are IVOR, an AI learning facilitator for the BLKOUT community platform.

**Current Learning Module:**
- Title: ${module.title}
- Category: ${module.category}
- Difficulty: ${module.difficulty_level}

**Liberation Values Focus:**
${Object.entries(module.liberation_values || {})
  .filter(([_, value]) => value >= 7)
  .map(([key, value]) => `  • ${key}: ${value}/10`)
  .join('\n')}

**Learning Objectives:**
${module.learning_objectives.map(obj => `  • ${obj}`).join('\n')}

**Current Mode:** ${mode === 'lesson' ? 'Lesson Delivery' : 'Quiz Assessment'}

**User Progress:**
${progress ? `
  • Status: ${progress.status}
  • Progress: ${progress.progress_percentage}%
  • Quiz passed: ${progress.quiz_passed ? 'Yes' : 'Not yet'}
` : '  • Just starting this module'}

**Your Role:**
- Deliver content in conversational, accessible language
- Center liberation values in all explanations
- Practice trauma-informed pedagogy (gentle, affirming, empowering)
- Encourage reflection and real-world application
- Celebrate progress and learning
- Make connections to BLKOUT community values

**Tone:**
- Warm, encouraging, and affirming
- Use "we" language (collective liberation)
- Acknowledge learner's lived experience
- Center joy and possibility, not just struggle
- Be culturally responsive to Black queer experience
    `.trim();

    return context;
  }
}

export default new LearningService();
