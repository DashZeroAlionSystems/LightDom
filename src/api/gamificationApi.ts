/**
 * Gamification API - RESTful endpoints for the comprehensive gamification system
 * Handles achievements, quests, streaks, leaderboards, and user progression
 */

import { Request, Response } from 'express';
import { gamificationEngine } from '../core/GamificationEngine';

export class GamificationAPI {
  
  /**
   * Get all gamification data
   * GET /api/gamification/data
   */
  async getGamificationData(req: Request, res: Response): Promise<void> {
    try {
      const achievements = gamificationEngine.getAllAchievements();
      const quests = gamificationEngine.getAvailableQuests();
      const dailyQuests = gamificationEngine.getDailyQuests();
      const weeklyQuests = gamificationEngine.getWeeklyQuests();
      const streaks = gamificationEngine.getStreaks();
      const leaderboard = gamificationEngine.getLeaderboard();
      const stats = gamificationEngine.getStats();

      res.json({
        success: true,
        data: {
          achievements,
          quests,
          dailyQuests,
          weeklyQuests,
          streaks,
          leaderboard,
          stats
        }
      });

    } catch (error) {
      console.error('Error fetching gamification data:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get achievements
   * GET /api/gamification/achievements
   */
  async getAchievements(req: Request, res: Response): Promise<void> {
    try {
      const { category, rarity, unlocked, limit = 50, offset = 0 } = req.query;
      
      let achievements = gamificationEngine.getAllAchievements();
      
      // Filter by category if specified
      if (category) {
        achievements = achievements.filter(achievement => achievement.category === category);
      }
      
      // Filter by rarity if specified
      if (rarity) {
        achievements = achievements.filter(achievement => achievement.rarity === rarity);
      }
      
      // Filter by unlocked status if specified
      if (unlocked === 'true') {
        achievements = achievements.filter(achievement => achievement.unlocked);
      } else if (unlocked === 'false') {
        achievements = achievements.filter(achievement => !achievement.unlocked);
      }
      
      // Sort by rarity and progress
      achievements.sort((a, b) => {
        const rarityOrder = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythical'];
        const rarityDiff = rarityOrder.indexOf(a.rarity) - rarityOrder.indexOf(b.rarity);
        if (rarityDiff !== 0) return rarityDiff;
        return b.progress - a.progress;
      });
      
      // Apply pagination
      const start = Number(offset);
      const end = start + Number(limit);
      const paginatedAchievements = achievements.slice(start, end);
      
      res.json({
        success: true,
        data: {
          achievements: paginatedAchievements,
          total: achievements.length,
          limit: Number(limit),
          offset: Number(offset)
        }
      });

    } catch (error) {
      console.error('Error fetching achievements:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get unlocked achievements
   * GET /api/gamification/achievements/unlocked
   */
  async getUnlockedAchievements(req: Request, res: Response): Promise<void> {
    try {
      const achievements = gamificationEngine.getUnlockedAchievements();
      
      res.json({
        success: true,
        data: {
          achievements,
          total: achievements.length
        }
      });

    } catch (error) {
      console.error('Error fetching unlocked achievements:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get quests
   * GET /api/gamification/quests
   */
  async getQuests(req: Request, res: Response): Promise<void> {
    try {
      const { category, status, difficulty, limit = 50, offset = 0 } = req.query;
      
      let quests = gamificationEngine.getAvailableQuests();
      
      // Filter by category if specified
      if (category) {
        quests = quests.filter(quest => quest.category === category);
      }
      
      // Filter by status if specified
      if (status) {
        quests = quests.filter(quest => quest.status === status);
      }
      
      // Filter by difficulty if specified
      if (difficulty) {
        quests = quests.filter(quest => quest.difficulty === difficulty);
      }
      
      // Sort by difficulty and rewards
      quests.sort((a, b) => {
        const difficultyOrder = ['easy', 'medium', 'hard', 'expert', 'legendary'];
        const difficultyDiff = difficultyOrder.indexOf(a.difficulty) - difficultyOrder.indexOf(b.difficulty);
        if (difficultyDiff !== 0) return difficultyDiff;
        return b.rewards.miningScoreBonus - a.rewards.miningScoreBonus;
      });
      
      // Apply pagination
      const start = Number(offset);
      const end = start + Number(limit);
      const paginatedQuests = quests.slice(start, end);
      
      res.json({
        success: true,
        data: {
          quests: paginatedQuests,
          total: quests.length,
          limit: Number(limit),
          offset: Number(offset)
        }
      });

    } catch (error) {
      console.error('Error fetching quests:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get active quests
   * GET /api/gamification/quests/active
   */
  async getActiveQuests(req: Request, res: Response): Promise<void> {
    try {
      const quests = gamificationEngine.getActiveQuests();
      
      res.json({
        success: true,
        data: {
          quests,
          total: quests.length
        }
      });

    } catch (error) {
      console.error('Error fetching active quests:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get daily quests
   * GET /api/gamification/quests/daily
   */
  async getDailyQuests(req: Request, res: Response): Promise<void> {
    try {
      const quests = gamificationEngine.getDailyQuests();
      
      res.json({
        success: true,
        data: {
          quests,
          total: quests.length
        }
      });

    } catch (error) {
      console.error('Error fetching daily quests:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get weekly quests
   * GET /api/gamification/quests/weekly
   */
  async getWeeklyQuests(req: Request, res: Response): Promise<void> {
    try {
      const quests = gamificationEngine.getWeeklyQuests();
      
      res.json({
        success: true,
        data: {
          quests,
          total: quests.length
        }
      });

    } catch (error) {
      console.error('Error fetching weekly quests:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Start quest
   * POST /api/gamification/start-quest
   */
  async startQuest(req: Request, res: Response): Promise<void> {
    try {
      const { questId } = req.body;

      if (!questId) {
        res.status(400).json({
          error: 'Invalid request',
          message: 'Quest ID is required'
        });
        return;
      }

      const success = gamificationEngine.startQuest(questId);

      if (success) {
        res.json({
          success: true,
          message: `Quest ${questId} started successfully`
        });
      } else {
        res.status(400).json({
          error: 'Quest not available',
          message: `Quest ${questId} is not available to start`
        });
      }

    } catch (error) {
      console.error('Error starting quest:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Update quest progress
   * POST /api/gamification/update-quest-progress
   */
  async updateQuestProgress(req: Request, res: Response): Promise<void> {
    try {
      const { questId, objectiveId, progress } = req.body;

      if (!questId || !objectiveId || progress === undefined) {
        res.status(400).json({
          error: 'Invalid request',
          message: 'Quest ID, objective ID, and progress are required'
        });
        return;
      }

      gamificationEngine.updateQuestProgress(questId, objectiveId, progress);

      res.json({
        success: true,
        message: `Quest progress updated for ${questId}`
      });

    } catch (error) {
      console.error('Error updating quest progress:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get streaks
   * GET /api/gamification/streaks
   */
  async getStreaks(req: Request, res: Response): Promise<void> {
    try {
      const streaks = gamificationEngine.getStreaks();
      
      res.json({
        success: true,
        data: {
          streaks,
          total: streaks.length
        }
      });

    } catch (error) {
      console.error('Error fetching streaks:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Update streak
   * POST /api/gamification/update-streak
   */
  async updateStreak(req: Request, res: Response): Promise<void> {
    try {
      const { streakType, activity = true } = req.body;

      if (!streakType) {
        res.status(400).json({
          error: 'Invalid request',
          message: 'Streak type is required'
        });
        return;
      }

      gamificationEngine.updateStreak(streakType, activity);

      res.json({
        success: true,
        message: `Streak updated for ${streakType}`
      });

    } catch (error) {
      console.error('Error updating streak:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get leaderboard
   * GET /api/gamification/leaderboard
   */
  async getLeaderboard(req: Request, res: Response): Promise<void> {
    try {
      const { limit = 10, offset = 0 } = req.query;
      
      const leaderboard = gamificationEngine.getLeaderboard();
      
      // Apply pagination
      const start = Number(offset);
      const end = start + Number(limit);
      const paginatedLeaderboard = leaderboard.slice(start, end);
      
      res.json({
        success: true,
        data: {
          leaderboard: paginatedLeaderboard,
          total: leaderboard.length,
          limit: Number(limit),
          offset: Number(offset)
        }
      });

    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get gamification stats
   * GET /api/gamification/stats
   */
  async getStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = gamificationEngine.getStats();
      
      res.json({
        success: true,
        data: stats
      });

    } catch (error) {
      console.error('Error fetching gamification stats:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Record mining activity
   * POST /api/gamification/record-mining
   */
  async recordMiningActivity(req: Request, res: Response): Promise<void> {
    try {
      gamificationEngine.recordMiningActivity();

      res.json({
        success: true,
        message: 'Mining activity recorded'
      });

    } catch (error) {
      console.error('Error recording mining activity:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Record combination activity
   * POST /api/gamification/record-combination
   */
  async recordCombinationActivity(req: Request, res: Response): Promise<void> {
    try {
      const { success, elementRarity } = req.body;

      gamificationEngine.recordCombinationActivity(success, elementRarity);

      res.json({
        success: true,
        message: 'Combination activity recorded'
      });

    } catch (error) {
      console.error('Error recording combination activity:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Record discovery activity
   * POST /api/gamification/record-discovery
   */
  async recordDiscoveryActivity(req: Request, res: Response): Promise<void> {
    try {
      gamificationEngine.recordDiscoveryActivity();

      res.json({
        success: true,
        message: 'Discovery activity recorded'
      });

    } catch (error) {
      console.error('Error recording discovery activity:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Record login activity
   * POST /api/gamification/record-login
   */
  async recordLoginActivity(req: Request, res: Response): Promise<void> {
    try {
      gamificationEngine.recordLoginActivity();

      res.json({
        success: true,
        message: 'Login activity recorded'
      });

    } catch (error) {
      console.error('Error recording login activity:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get user rank
   * GET /api/gamification/rank/:score
   */
  async getUserRank(req: Request, res: Response): Promise<void> {
    try {
      const { score } = req.params;
      const miningScore = Number(score);

      if (isNaN(miningScore)) {
        res.status(400).json({
          error: 'Invalid score',
          message: 'Score must be a number'
        });
        return;
      }

      const rank = gamificationEngine.getUserRank(miningScore);

      res.json({
        success: true,
        data: {
          score: miningScore,
          rank
        }
      });

    } catch (error) {
      console.error('Error getting user rank:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Calculate mining score bonus
   * GET /api/gamification/mining-score-bonus
   */
  async getMiningScoreBonus(req: Request, res: Response): Promise<void> {
    try {
      const bonus = gamificationEngine.calculateMiningScoreBonus();

      res.json({
        success: true,
        data: {
          bonus
        }
      });

    } catch (error) {
      console.error('Error calculating mining score bonus:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Update achievement progress
   * POST /api/gamification/update-achievement-progress
   */
  async updateAchievementProgress(req: Request, res: Response): Promise<void> {
    try {
      const { achievementId, progress } = req.body;

      if (!achievementId || progress === undefined) {
        res.status(400).json({
          error: 'Invalid request',
          message: 'Achievement ID and progress are required'
        });
        return;
      }

      gamificationEngine.updateAchievementProgress(achievementId, progress);

      res.json({
        success: true,
        message: `Achievement progress updated for ${achievementId}`
      });

    } catch (error) {
      console.error('Error updating achievement progress:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get achievement by ID
   * GET /api/gamification/achievement/:id
   */
  async getAchievement(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      const achievements = gamificationEngine.getAllAchievements();
      const achievement = achievements.find(a => a.id === id);
      
      if (!achievement) {
        res.status(404).json({
          error: 'Achievement not found',
          message: `No achievement found with ID: ${id}`
        });
        return;
      }
      
      res.json({
        success: true,
        data: achievement
      });

    } catch (error) {
      console.error('Error fetching achievement:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get quest by ID
   * GET /api/gamification/quest/:id
   */
  async getQuest(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      const quests = gamificationEngine.getAvailableQuests();
      const quest = quests.find(q => q.id === id);
      
      if (!quest) {
        res.status(404).json({
          error: 'Quest not found',
          message: `No quest found with ID: ${id}`
        });
        return;
      }
      
      res.json({
        success: true,
        data: quest
      });

    } catch (error) {
      console.error('Error fetching quest:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}

// Export singleton instance
export const gamificationAPI = new GamificationAPI();