/**
 * Gamification Engine - Comprehensive user engagement and progression system
 * Integrates with Metaverse Mining and Alchemy systems to enhance user experience
 */

export interface Achievement {
  id: string;
  name: string;
  description: string;
  category: 'mining' | 'alchemy' | 'exploration' | 'social' | 'mastery' | 'special';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythical';
  icon: string;
  color: string;
  requirements: {
    type: 'threshold' | 'streak' | 'combination' | 'discovery' | 'milestone' | 'special';
    value: number;
    description: string;
    conditions?: any;
  };
  rewards: {
    miningScoreBonus: number;
    tokenReward: number;
    experiencePoints: number;
    specialUnlocks: string[];
    title?: string;
  };
  unlocked: boolean;
  unlockedAt?: number;
  progress: number;
  maxProgress: number;
}

export interface Quest {
  id: string;
  name: string;
  description: string;
  category: 'daily' | 'weekly' | 'monthly' | 'story' | 'event' | 'special';
  difficulty: 'easy' | 'medium' | 'hard' | 'expert' | 'legendary';
  status: 'available' | 'active' | 'completed' | 'expired';
  objectives: Array<{
    id: string;
    description: string;
    type: 'mining' | 'combination' | 'discovery' | 'exploration' | 'social';
    target: number;
    current: number;
    completed: boolean;
  }>;
  rewards: {
    miningScoreBonus: number;
    tokenReward: number;
    experiencePoints: number;
    elements: Array<{elementId: string, quantity: number}>;
    specialUnlocks: string[];
  };
  timeLimit?: number; // in seconds
  expiresAt?: number;
  startedAt?: number;
  completedAt?: number;
}

export interface Streak {
  type: 'daily_login' | 'daily_mining' | 'daily_combination' | 'weekly_quest';
  current: number;
  max: number;
  lastActivity: number;
  bonus: number; // multiplier bonus
}

export interface LeaderboardEntry {
  rank: number;
  username: string;
  score: number;
  level: number;
  rankTitle: string;
  avatar: string;
  achievements: number;
  lastActive: number;
}

export interface GamificationStats {
  totalPlayTime: number;
  sessionsCount: number;
  averageSessionLength: number;
  totalMiningScore: number;
  totalCombinations: number;
  totalDiscoveries: number;
  achievementsUnlocked: number;
  questsCompleted: number;
  currentStreaks: Streak[];
  favoriteBiome: string;
  mostUsedElement: string;
  rarestElement: string;
  longestStreak: number;
  bestCombination: string;
}

export class GamificationEngine {
  private achievements: Map<string, Achievement> = new Map();
  private quests: Map<string, Quest> = new Map();
  private streaks: Map<string, Streak> = new Map();
  private stats: GamificationStats;
  private leaderboard: LeaderboardEntry[] = [];
  private dailyQuests: Quest[] = [];
  private weeklyQuests: Quest[] = [];
  private eventQuests: Quest[] = [];

  constructor() {
    this.initializeAchievements();
    this.initializeQuests();
    this.initializeStreaks();
    this.initializeStats();
    this.generateDailyQuests();
    this.generateWeeklyQuests();
  }

  /**
   * Initialize all achievements
   */
  private initializeAchievements(): void {
    const achievements: Achievement[] = [
      // Mining Achievements
      {
        id: 'first_mining',
        name: 'First Steps',
        description: 'Complete your first mining operation',
        category: 'mining',
        rarity: 'common',
        icon: '⛏️',
        color: '#8B4513',
        requirements: {
          type: 'threshold',
          value: 1,
          description: 'Complete 1 mining operation'
        },
        rewards: {
          miningScoreBonus: 10,
          tokenReward: 5,
          experiencePoints: 25,
          specialUnlocks: ['mining_tutorial']
        },
        unlocked: false,
        progress: 0,
        maxProgress: 1
      },
      {
        id: 'mining_master',
        name: 'Mining Master',
        description: 'Complete 1000 mining operations',
        category: 'mining',
        rarity: 'epic',
        icon: '🏆',
        color: '#FFD700',
        requirements: {
          type: 'threshold',
          value: 1000,
          description: 'Complete 1000 mining operations'
        },
        rewards: {
          miningScoreBonus: 500,
          tokenReward: 100,
          experiencePoints: 1000,
          specialUnlocks: ['advanced_mining', 'mining_master_title'],
          title: 'Mining Master'
        },
        unlocked: false,
        progress: 0,
        maxProgress: 1000
      },
      {
        id: 'algorithm_discoverer',
        name: 'Algorithm Discoverer',
        description: 'Discover your first algorithm',
        category: 'mining',
        rarity: 'uncommon',
        icon: '🧠',
        color: '#4169E1',
        requirements: {
          type: 'discovery',
          value: 1,
          description: 'Discover 1 algorithm'
        },
        rewards: {
          miningScoreBonus: 50,
          tokenReward: 20,
          experiencePoints: 100,
          specialUnlocks: ['algorithm_lab']
        },
        unlocked: false,
        progress: 0,
        maxProgress: 1
      },

      // Alchemy Achievements
      {
        id: 'first_combination',
        name: 'Alchemy Novice',
        description: 'Complete your first element combination',
        category: 'alchemy',
        rarity: 'common',
        icon: '⚗️',
        color: '#9370DB',
        requirements: {
          type: 'combination',
          value: 1,
          description: 'Complete 1 element combination'
        },
        rewards: {
          miningScoreBonus: 25,
          tokenReward: 10,
          experiencePoints: 50,
          specialUnlocks: ['combination_tutorial']
        },
        unlocked: false,
        progress: 0,
        maxProgress: 1
      },
      {
        id: 'element_collector',
        name: 'Element Collector',
        description: 'Collect 50 different elements',
        category: 'alchemy',
        rarity: 'rare',
        icon: '💎',
        color: '#FF69B4',
        requirements: {
          type: 'threshold',
          value: 50,
          description: 'Collect 50 different elements'
        },
        rewards: {
          miningScoreBonus: 200,
          tokenReward: 75,
          experiencePoints: 500,
          specialUnlocks: ['element_vault', 'collector_title'],
          title: 'Element Collector'
        },
        unlocked: false,
        progress: 0,
        maxProgress: 50
      },
      {
        id: 'legendary_creator',
        name: 'Legendary Creator',
        description: 'Create your first legendary element',
        category: 'alchemy',
        rarity: 'legendary',
        icon: '👑',
        color: '#FF4500',
        requirements: {
          type: 'combination',
          value: 1,
          description: 'Create 1 legendary element',
          conditions: { rarity: 'legendary' }
        },
        rewards: {
          miningScoreBonus: 1000,
          tokenReward: 500,
          experiencePoints: 2000,
          specialUnlocks: ['legendary_lab', 'legendary_creator_title'],
          title: 'Legendary Creator'
        },
        unlocked: false,
        progress: 0,
        maxProgress: 1
      },

      // Exploration Achievements
      {
        id: 'biome_explorer',
        name: 'Biome Explorer',
        description: 'Explore all available biomes',
        category: 'exploration',
        rarity: 'rare',
        icon: '🌍',
        color: '#32CD32',
        requirements: {
          type: 'threshold',
          value: 7,
          description: 'Explore 7 different biomes'
        },
        rewards: {
          miningScoreBonus: 300,
          tokenReward: 150,
          experiencePoints: 750,
          specialUnlocks: ['biome_master', 'explorer_title'],
          title: 'Biome Explorer'
        },
        unlocked: false,
        progress: 0,
        maxProgress: 7
      },
      {
        id: 'reality_bender',
        name: 'Reality Bender',
        description: 'Create the ultimate Reality Optimization Matrix',
        category: 'exploration',
        rarity: 'mythical',
        icon: '🌌',
        color: '#FF1493',
        requirements: {
          type: 'combination',
          value: 1,
          description: 'Create 1 mythical element',
          conditions: { rarity: 'mythical' }
        },
        rewards: {
          miningScoreBonus: 5000,
          tokenReward: 2500,
          experiencePoints: 10000,
          specialUnlocks: ['reality_editor', 'dimension_portal', 'reality_bender_title'],
          title: 'Reality Bender'
        },
        unlocked: false,
        progress: 0,
        maxProgress: 1
      },

      // Social Achievements
      {
        id: 'community_helper',
        name: 'Community Helper',
        description: 'Help other users with their combinations',
        category: 'social',
        rarity: 'uncommon',
        icon: '🤝',
        color: '#FF6347',
        requirements: {
          type: 'threshold',
          value: 10,
          description: 'Help 10 other users'
        },
        rewards: {
          miningScoreBonus: 100,
          tokenReward: 50,
          experiencePoints: 250,
          specialUnlocks: ['helper_badge']
        },
        unlocked: false,
        progress: 0,
        maxProgress: 10
      },

      // Mastery Achievements
      {
        id: 'perfectionist',
        name: 'Perfectionist',
        description: 'Achieve 100% success rate in 50 consecutive combinations',
        category: 'mastery',
        rarity: 'epic',
        icon: '🎯',
        color: '#FFD700',
        requirements: {
          type: 'streak',
          value: 50,
          description: 'Achieve 100% success rate in 50 consecutive combinations'
        },
        rewards: {
          miningScoreBonus: 750,
          tokenReward: 300,
          experiencePoints: 1500,
          specialUnlocks: ['perfectionist_title', 'lucky_charm'],
          title: 'Perfectionist'
        },
        unlocked: false,
        progress: 0,
        maxProgress: 50
      },

      // Special Achievements
      {
        id: 'early_bird',
        name: 'Early Bird',
        description: 'Login for 7 consecutive days',
        category: 'special',
        rarity: 'uncommon',
        icon: '🐦',
        color: '#FFA500',
        requirements: {
          type: 'streak',
          value: 7,
          description: 'Login for 7 consecutive days'
        },
        rewards: {
          miningScoreBonus: 150,
          tokenReward: 75,
          experiencePoints: 350,
          specialUnlocks: ['early_bird_badge']
        },
        unlocked: false,
        progress: 0,
        maxProgress: 7
      }
    ];

    achievements.forEach(achievement => this.achievements.set(achievement.id, achievement));
  }

  /**
   * Initialize quests
   */
  private initializeQuests(): void {
    // Story quests
    const storyQuests: Quest[] = [
      {
        id: 'tutorial_complete',
        name: 'Welcome to the Metaverse',
        description: 'Complete the tutorial and learn the basics of mining and alchemy',
        category: 'story',
        difficulty: 'easy',
        status: 'available',
        objectives: [
          {
            id: 'mining_tutorial',
            description: 'Complete mining tutorial',
            type: 'mining',
            target: 1,
            current: 0,
            completed: false
          },
          {
            id: 'combination_tutorial',
            description: 'Complete combination tutorial',
            type: 'combination',
            target: 1,
            current: 0,
            completed: false
          }
        ],
        rewards: {
          miningScoreBonus: 100,
          tokenReward: 50,
          experiencePoints: 200,
          elements: [
            { elementId: 'fire', quantity: 2 },
            { elementId: 'water', quantity: 2 },
            { elementId: 'earth', quantity: 2 },
            { elementId: 'air', quantity: 2 }
          ],
          specialUnlocks: ['tutorial_complete']
        }
      }
    ];

    storyQuests.forEach(quest => this.quests.set(quest.id, quest));
  }

  /**
   * Initialize streaks
   */
  private initializeStreaks(): void {
    const streakTypes = [
      { type: 'daily_login', current: 0, max: 0, lastActivity: 0, bonus: 0 },
      { type: 'daily_mining', current: 0, max: 0, lastActivity: 0, bonus: 0 },
      { type: 'daily_combination', current: 0, max: 0, lastActivity: 0, bonus: 0 },
      { type: 'weekly_quest', current: 0, max: 0, lastActivity: 0, bonus: 0 }
    ];

    streakTypes.forEach(streak => this.streaks.set(streak.type, streak));
  }

  /**
   * Initialize stats
   */
  private initializeStats(): void {
    this.stats = {
      totalPlayTime: 0,
      sessionsCount: 0,
      averageSessionLength: 0,
      totalMiningScore: 0,
      totalCombinations: 0,
      totalDiscoveries: 0,
      achievementsUnlocked: 0,
      questsCompleted: 0,
      currentStreaks: [],
      favoriteBiome: 'digital',
      mostUsedElement: 'fire',
      rarestElement: 'fire',
      longestStreak: 0,
      bestCombination: 'fire_water'
    };
  }

  /**
   * Generate daily quests
   */
  private generateDailyQuests(): void {
    const dailyQuestTemplates = [
      {
        id: 'daily_mining',
        name: 'Daily Mining',
        description: 'Complete 10 mining operations today',
        objectives: [{ type: 'mining', target: 10 }],
        rewards: { miningScoreBonus: 50, tokenReward: 25, experiencePoints: 100 }
      },
      {
        id: 'daily_combination',
        name: 'Daily Alchemy',
        description: 'Complete 5 element combinations today',
        objectives: [{ type: 'combination', target: 5 }],
        rewards: { miningScoreBonus: 75, tokenReward: 35, experiencePoints: 150 }
      },
      {
        id: 'daily_exploration',
        name: 'Daily Exploration',
        description: 'Explore 3 different biomes today',
        objectives: [{ type: 'exploration', target: 3 }],
        rewards: { miningScoreBonus: 100, tokenReward: 50, experiencePoints: 200 }
      }
    ];

    this.dailyQuests = dailyQuestTemplates.map(template => ({
      id: `daily_${Date.now()}_${template.id}`,
      name: template.name,
      description: template.description,
      category: 'daily' as const,
      difficulty: 'easy' as const,
      status: 'available' as const,
      objectives: template.objectives.map(obj => ({
        id: `${template.id}_${obj.type}`,
        description: `${obj.type} objective`,
        type: obj.type as any,
        target: obj.target,
        current: 0,
        completed: false
      })),
      rewards: {
        ...template.rewards,
        elements: [],
        specialUnlocks: []
      },
      timeLimit: 24 * 60 * 60, // 24 hours
      expiresAt: Date.now() + (24 * 60 * 60 * 1000)
    }));
  }

  /**
   * Generate weekly quests
   */
  private generateWeeklyQuests(): void {
    const weeklyQuestTemplates = [
      {
        id: 'weekly_mastery',
        name: 'Weekly Mastery',
        description: 'Complete 100 mining operations this week',
        objectives: [{ type: 'mining', target: 100 }],
        rewards: { miningScoreBonus: 500, tokenReward: 250, experiencePoints: 1000 }
      },
      {
        id: 'weekly_alchemy',
        name: 'Weekly Alchemy',
        description: 'Complete 50 element combinations this week',
        objectives: [{ type: 'combination', target: 50 }],
        rewards: { miningScoreBonus: 750, tokenReward: 375, experiencePoints: 1500 }
      }
    ];

    this.weeklyQuests = weeklyQuestTemplates.map(template => ({
      id: `weekly_${Date.now()}_${template.id}`,
      name: template.name,
      description: template.description,
      category: 'weekly' as const,
      difficulty: 'medium' as const,
      status: 'available' as const,
      objectives: template.objectives.map(obj => ({
        id: `${template.id}_${obj.type}`,
        description: `${obj.type} objective`,
        type: obj.type as any,
        target: obj.target,
        current: 0,
        completed: false
      })),
      rewards: {
        ...template.rewards,
        elements: [],
        specialUnlocks: []
      },
      timeLimit: 7 * 24 * 60 * 60, // 7 days
      expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000)
    }));
  }

  /**
   * Update achievement progress
   */
  public updateAchievementProgress(achievementId: string, progress: number): void {
    const achievement = this.achievements.get(achievementId);
    if (!achievement || achievement.unlocked) return;

    achievement.progress = Math.min(progress, achievement.maxProgress);

    if (achievement.progress >= achievement.maxProgress) {
      this.unlockAchievement(achievementId);
    }
  }

  /**
   * Unlock achievement
   */
  private unlockAchievement(achievementId: string): void {
    const achievement = this.achievements.get(achievementId);
    if (!achievement || achievement.unlocked) return;

    achievement.unlocked = true;
    achievement.unlockedAt = Date.now();
    this.stats.achievementsUnlocked++;

    // Apply rewards
    this.stats.totalMiningScore += achievement.rewards.miningScoreBonus;
  }

  /**
   * Update quest progress
   */
  public updateQuestProgress(questId: string, objectiveId: string, progress: number): void {
    const quest = this.quests.get(questId);
    if (!quest || quest.status !== 'active') return;

    const objective = quest.objectives.find(obj => obj.id === objectiveId);
    if (!objective) return;

    objective.current = Math.min(progress, objective.target);
    objective.completed = objective.current >= objective.target;

    // Check if quest is completed
    if (quest.objectives.every(obj => obj.completed)) {
      this.completeQuest(questId);
    }
  }

  /**
   * Complete quest
   */
  private completeQuest(questId: string): void {
    const quest = this.quests.get(questId);
    if (!quest) return;

    quest.status = 'completed';
    quest.completedAt = Date.now();
    this.stats.questsCompleted++;

    // Apply rewards
    this.stats.totalMiningScore += quest.rewards.miningScoreBonus;
  }

  /**
   * Update streak
   */
  public updateStreak(streakType: string, activity: boolean = true): void {
    const streak = this.streaks.get(streakType);
    if (!streak) return;

    const now = Date.now();
    const timeSinceLastActivity = now - streak.lastActivity;
    const oneDay = 24 * 60 * 60 * 1000;

    if (activity) {
      if (timeSinceLastActivity <= oneDay * 2) { // Within 2 days
        if (timeSinceLastActivity > oneDay) { // More than 1 day, reset streak
          streak.current = 1;
        } else { // Within 1 day, continue streak
          streak.current++;
        }
        streak.max = Math.max(streak.max, streak.current);
        streak.lastActivity = now;
        streak.bonus = Math.min(streak.current * 0.1, 2.0); // Max 2x bonus
      } else { // More than 2 days, reset streak
        streak.current = 1;
        streak.lastActivity = now;
        streak.bonus = 0.1;
      }
    }
  }

  /**
   * Get all achievements
   */
  public getAllAchievements(): Achievement[] {
    return Array.from(this.achievements.values());
  }

  /**
   * Get unlocked achievements
   */
  public getUnlockedAchievements(): Achievement[] {
    return Array.from(this.achievements.values()).filter(a => a.unlocked);
  }

  /**
   * Get available quests
   */
  public getAvailableQuests(): Quest[] {
    return Array.from(this.quests.values()).filter(q => q.status === 'available');
  }

  /**
   * Get active quests
   */
  public getActiveQuests(): Quest[] {
    return Array.from(this.quests.values()).filter(q => q.status === 'active');
  }

  /**
   * Get daily quests
   */
  public getDailyQuests(): Quest[] {
    return this.dailyQuests;
  }

  /**
   * Get weekly quests
   */
  public getWeeklyQuests(): Quest[] {
    return this.weeklyQuests;
  }

  /**
   * Get streaks
   */
  public getStreaks(): Streak[] {
    return Array.from(this.streaks.values());
  }

  /**
   * Get gamification stats
   */
  public getStats(): GamificationStats {
    return { ...this.stats };
  }

  /**
   * Get leaderboard
   */
  public getLeaderboard(): LeaderboardEntry[] {
    return [...this.leaderboard];
  }

  /**
   * Start quest
   */
  public startQuest(questId: string): boolean {
    const quest = this.quests.get(questId);
    if (!quest || quest.status !== 'available') return false;

    quest.status = 'active';
    quest.startedAt = Date.now();
    return true;
  }

  /**
   * Record mining activity
   */
  public recordMiningActivity(): void {
    this.stats.totalMiningScore += 10; // Base mining score
    this.updateStreak('daily_mining');
    this.updateAchievementProgress('first_mining', 1);
    this.updateAchievementProgress('mining_master', 1);
  }

  /**
   * Record combination activity
   */
  public recordCombinationActivity(success: boolean, elementRarity?: string): void {
    if (success) {
      this.stats.totalCombinations++;
      this.updateStreak('daily_combination');
      this.updateAchievementProgress('first_combination', 1);
      
      if (elementRarity === 'legendary') {
        this.updateAchievementProgress('legendary_creator', 1);
      }
      if (elementRarity === 'mythical') {
        this.updateAchievementProgress('reality_bender', 1);
      }
    }
  }

  /**
   * Record discovery activity
   */
  public recordDiscoveryActivity(): void {
    this.stats.totalDiscoveries++;
    this.updateAchievementProgress('algorithm_discoverer', 1);
  }

  /**
   * Record login activity
   */
  public recordLoginActivity(): void {
    this.updateStreak('daily_login');
    this.updateAchievementProgress('early_bird', 1);
  }

  /**
   * Get user rank based on mining score
   */
  public getUserRank(miningScore: number): string {
    if (miningScore >= 15000) return 'Reality Bender';
    if (miningScore >= 8000) return 'Mythical';
    if (miningScore >= 4000) return 'Legend';
    if (miningScore >= 2000) return 'Grandmaster';
    if (miningScore >= 1000) return 'Master';
    if (miningScore >= 600) return 'Expert';
    if (miningScore >= 300) return 'Explorer';
    if (miningScore >= 100) return 'Apprentice';
    return 'Novice';
  }

  /**
   * Calculate total mining score bonus from all sources
   */
  public calculateMiningScoreBonus(): number {
    const achievementBonus = this.getUnlockedAchievements()
      .reduce((sum, achievement) => sum + achievement.rewards.miningScoreBonus, 0);
    
    const streakBonus = Array.from(this.streaks.values())
      .reduce((sum, streak) => sum + streak.bonus, 0);
    
    return achievementBonus + streakBonus;
  }

  /**
   * Get user statistics
   */
  public getUserStats(userId: string): any {
    // Mock implementation - would track real user stats in production
    const level = Math.floor(Math.random() * 50) + 1;
    const miningScore = Math.floor(Math.random() * 10000);
    
    return {
      level,
      experiencePoints: level * 1000 + Math.floor(Math.random() * 1000),
      achievementsUnlocked: Math.floor(Math.random() * 50),
      questsCompleted: Math.floor(Math.random() * 100),
      currentStreak: Math.floor(Math.random() * 30),
      rank: this.calculateRank(miningScore)
    };
  }
}

// Export singleton instance
export const gamificationEngine = new GamificationEngine();