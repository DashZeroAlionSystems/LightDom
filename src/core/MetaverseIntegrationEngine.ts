/**
 * Metaverse Integration Engine - Connects all metaverse systems together
 * Integrates Mining, Alchemy, Gamification, and Virtual Land systems
 */

import { metaverseMiningEngine } from './MetaverseMiningEngine';
import { metaverseAlchemyEngine } from './MetaverseAlchemyEngine';
import { gamificationEngine } from './GamificationEngine';

export interface MetaverseUser {
  id: string;
  username: string;
  level: number;
  experience: number;
  miningScore: number;
  rank: string;
  avatar: string;
  joinDate: number;
  lastActive: number;
  totalPlayTime: number;
  sessionsCount: number;
}

export interface MetaverseSession {
  id: string;
  userId: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  activities: {
    miningOperations: number;
    combinationsAttempted: number;
    combinationsSuccessful: number;
    discoveries: number;
    achievementsUnlocked: number;
    questsCompleted: number;
  };
  rewards: {
    miningScoreGained: number;
    tokensEarned: number;
    experienceGained: number;
    elementsGained: Array<{elementId: string, quantity: number}>;
  };
}

export interface MetaverseEvent {
  id: string;
  type: 'mining_discovery' | 'combination_success' | 'achievement_unlock' | 'quest_complete' | 'level_up' | 'rank_up' | 'special_event';
  userId: string;
  timestamp: number;
  data: any;
  rewards?: {
    miningScoreBonus: number;
    tokenReward: number;
    experiencePoints: number;
    specialUnlocks: string[];
  };
}

export interface MetaverseReward {
  id: string;
  type: 'mining_score' | 'tokens' | 'experience' | 'elements' | 'special_unlock' | 'title' | 'badge';
  amount: number;
  elementId?: string;
  elementQuantity?: number;
  specialUnlock?: string;
  title?: string;
  badge?: string;
  description: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythical';
}

export class MetaverseIntegrationEngine {
  private users: Map<string, MetaverseUser> = new Map();
  private sessions: Map<string, MetaverseSession> = new Map();
  private events: MetaverseEvent[] = [];
  private rewards: Map<string, MetaverseReward> = new Map();
  private currentSession: MetaverseSession | null = null;
  private eventListeners: Map<string, Array<(event: MetaverseEvent) => void>> = new Map();

  constructor() {
    this.initializeDefaultUser();
    this.initializeRewards();
    this.setupEventListeners();
  }

  /**
   * Initialize default user for testing
   */
  private initializeDefaultUser(): void {
    const defaultUser: MetaverseUser = {
      id: 'user_001',
      username: 'MetaverseExplorer',
      level: 1,
      experience: 0,
      miningScore: 0,
      rank: 'Novice',
      avatar: '🧙‍♂️',
      joinDate: Date.now(),
      lastActive: Date.now(),
      totalPlayTime: 0,
      sessionsCount: 0
    };

    this.users.set(defaultUser.id, defaultUser);
  }

  /**
   * Initialize reward system
   */
  private initializeRewards(): void {
    const rewardTypes: MetaverseReward[] = [
      {
        id: 'mining_bonus_small',
        type: 'mining_score',
        amount: 10,
        description: 'Small mining score bonus',
        rarity: 'common'
      },
      {
        id: 'mining_bonus_medium',
        type: 'mining_score',
        amount: 50,
        description: 'Medium mining score bonus',
        rarity: 'uncommon'
      },
      {
        id: 'mining_bonus_large',
        type: 'mining_score',
        amount: 200,
        description: 'Large mining score bonus',
        rarity: 'rare'
      },
      {
        id: 'token_reward_small',
        type: 'tokens',
        amount: 5,
        description: 'Small token reward',
        rarity: 'common'
      },
      {
        id: 'token_reward_medium',
        type: 'tokens',
        amount: 25,
        description: 'Medium token reward',
        rarity: 'uncommon'
      },
      {
        id: 'token_reward_large',
        type: 'tokens',
        amount: 100,
        description: 'Large token reward',
        rarity: 'rare'
      },
      {
        id: 'xp_bonus_small',
        type: 'experience',
        amount: 25,
        description: 'Small experience bonus',
        rarity: 'common'
      },
      {
        id: 'xp_bonus_medium',
        type: 'experience',
        amount: 100,
        description: 'Medium experience bonus',
        rarity: 'uncommon'
      },
      {
        id: 'xp_bonus_large',
        type: 'experience',
        amount: 500,
        description: 'Large experience bonus',
        rarity: 'rare'
      },
      {
        id: 'element_fire',
        type: 'elements',
        amount: 1,
        elementId: 'fire',
        elementQuantity: 1,
        description: 'Fire element reward',
        rarity: 'common'
      },
      {
        id: 'element_water',
        type: 'elements',
        amount: 1,
        elementId: 'water',
        elementQuantity: 1,
        description: 'Water element reward',
        rarity: 'common'
      },
      {
        id: 'element_earth',
        type: 'elements',
        amount: 1,
        elementId: 'earth',
        elementQuantity: 1,
        description: 'Earth element reward',
        rarity: 'common'
      },
      {
        id: 'element_air',
        type: 'elements',
        amount: 1,
        elementId: 'air',
        elementQuantity: 1,
        description: 'Air element reward',
        rarity: 'common'
      },
      {
        id: 'special_unlock_advanced_mining',
        type: 'special_unlock',
        amount: 1,
        specialUnlock: 'advanced_mining',
        description: 'Advanced mining techniques unlocked',
        rarity: 'rare'
      },
      {
        id: 'title_mining_master',
        type: 'title',
        amount: 1,
        title: 'Mining Master',
        description: 'Mining Master title earned',
        rarity: 'epic'
      },
      {
        id: 'badge_first_discovery',
        type: 'badge',
        amount: 1,
        badge: 'first_discovery',
        description: 'First Discovery badge earned',
        rarity: 'uncommon'
      }
    ];

    rewardTypes.forEach(reward => this.rewards.set(reward.id, reward));
  }

  /**
   * Setup event listeners for system integration
   */
  private setupEventListeners(): void {
    // Listen for mining discoveries
    this.addEventListener('mining_discovery', (event) => {
      this.handleMiningDiscovery(event);
    });

    // Listen for combination successes
    this.addEventListener('combination_success', (event) => {
      this.handleCombinationSuccess(event);
    });

    // Listen for achievement unlocks
    this.addEventListener('achievement_unlock', (event) => {
      this.handleAchievementUnlock(event);
    });

    // Listen for quest completions
    this.addEventListener('quest_complete', (event) => {
      this.handleQuestComplete(event);
    });
  }

  /**
   * Start a new metaverse session
   */
  public startSession(userId: string): MetaverseSession {
    const user = this.users.get(userId);
    if (!user) {
      throw new Error(`User ${userId} not found`);
    }

    const session: MetaverseSession = {
      id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      startTime: Date.now(),
      activities: {
        miningOperations: 0,
        combinationsAttempted: 0,
        combinationsSuccessful: 0,
        discoveries: 0,
        achievementsUnlocked: 0,
        questsCompleted: 0
      },
      rewards: {
        miningScoreGained: 0,
        tokensEarned: 0,
        experienceGained: 0,
        elementsGained: []
      }
    };

    this.sessions.set(session.id, session);
    this.currentSession = session;
    user.sessionsCount++;
    user.lastActive = Date.now();

    // Record login activity
    gamificationEngine.recordLoginActivity();

    return session;
  }

  /**
   * End current session
   */
  public endSession(): MetaverseSession | null {
    if (!this.currentSession) return null;

    const session = this.currentSession;
    session.endTime = Date.now();
    session.duration = session.endTime - session.startTime;

    const user = this.users.get(session.userId);
    if (user) {
      user.totalPlayTime += session.duration;
      user.lastActive = Date.now();
    }

    this.currentSession = null;
    return session;
  }

  /**
   * Record mining operation
   */
  public recordMiningOperation(): void {
    if (!this.currentSession) return;

    this.currentSession.activities.miningOperations++;
    
    // Record in gamification engine
    gamificationEngine.recordMiningActivity();

    // Emit mining event
    this.emitEvent({
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'mining_discovery',
      userId: this.currentSession.userId,
      timestamp: Date.now(),
      data: {
        operation: 'mining',
        sessionId: this.currentSession.id
      }
    });
  }

  /**
   * Record combination attempt
   */
  public recordCombinationAttempt(success: boolean, elementRarity?: string): void {
    if (!this.currentSession) return;

    this.currentSession.activities.combinationsAttempted++;
    
    if (success) {
      this.currentSession.activities.combinationsSuccessful++;
      
      // Record in gamification engine
      gamificationEngine.recordCombinationActivity(success, elementRarity);

      // Emit combination success event
      this.emitEvent({
        id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'combination_success',
        userId: this.currentSession.userId,
        timestamp: Date.now(),
        data: {
          success,
          elementRarity,
          sessionId: this.currentSession.id
        }
      });
    }
  }

  /**
   * Record discovery
   */
  public recordDiscovery(): void {
    if (!this.currentSession) return;

    this.currentSession.activities.discoveries++;
    
    // Record in gamification engine
    gamificationEngine.recordDiscoveryActivity();

    // Emit discovery event
    this.emitEvent({
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'mining_discovery',
      userId: this.currentSession.userId,
      timestamp: Date.now(),
      data: {
        type: 'discovery',
        sessionId: this.currentSession.id
      }
    });
  }

  /**
   * Handle mining discovery event
   */
  private handleMiningDiscovery(event: MetaverseEvent): void {
    // Award mining score bonus
    const reward = this.calculateReward('mining_discovery');
    this.applyReward(event.userId, reward);

    // Update session rewards
    if (this.currentSession && this.currentSession.userId === event.userId) {
      this.currentSession.rewards.miningScoreGained += reward.amount;
    }
  }

  /**
   * Handle combination success event
   */
  private handleCombinationSuccess(event: MetaverseEvent): void {
    // Award combination rewards
    const reward = this.calculateReward('combination_success');
    this.applyReward(event.userId, reward);

    // Update session rewards
    if (this.currentSession && this.currentSession.userId === event.userId) {
      this.currentSession.rewards.miningScoreGained += reward.amount;
      this.currentSession.rewards.tokensEarned += reward.amount;
    }
  }

  /**
   * Handle achievement unlock event
   */
  private handleAchievementUnlock(event: MetaverseEvent): void {
    if (!this.currentSession) return;

    this.currentSession.activities.achievementsUnlocked++;
    
    // Award achievement rewards
    const reward = this.calculateReward('achievement_unlock');
    this.applyReward(event.userId, reward);

    // Update session rewards
    this.currentSession.rewards.miningScoreGained += reward.amount;
    this.currentSession.rewards.tokensEarned += reward.amount;
    this.currentSession.rewards.experienceGained += reward.amount;
  }

  /**
   * Handle quest complete event
   */
  private handleQuestComplete(event: MetaverseEvent): void {
    if (!this.currentSession) return;

    this.currentSession.activities.questsCompleted++;
    
    // Award quest rewards
    const reward = this.calculateReward('quest_complete');
    this.applyReward(event.userId, reward);

    // Update session rewards
    this.currentSession.rewards.miningScoreGained += reward.amount;
    this.currentSession.rewards.tokensEarned += reward.amount;
    this.currentSession.rewards.experienceGained += reward.amount;
  }

  /**
   * Calculate reward based on event type
   */
  private calculateReward(eventType: string): MetaverseReward {
    const rewardMap: { [key: string]: string } = {
      'mining_discovery': 'mining_bonus_small',
      'combination_success': 'token_reward_small',
      'achievement_unlock': 'xp_bonus_medium',
      'quest_complete': 'xp_bonus_large'
    };

    const rewardId = rewardMap[eventType] || 'mining_bonus_small';
    return this.rewards.get(rewardId) || this.rewards.get('mining_bonus_small')!;
  }

  /**
   * Apply reward to user
   */
  private applyReward(userId: string, reward: MetaverseReward): void {
    const user = this.users.get(userId);
    if (!user) return;

    switch (reward.type) {
      case 'mining_score':
        user.miningScore += reward.amount;
        break;
      case 'tokens':
        // In real implementation, update token balance
        break;
      case 'experience':
        user.experience += reward.amount;
        this.checkLevelUp(user);
        break;
      case 'elements':
        if (reward.elementId && reward.elementQuantity) {
          metaverseAlchemyEngine.addElement(reward.elementId, reward.elementQuantity);
        }
        break;
      case 'special_unlock':
        if (reward.specialUnlock) {
          // In real implementation, unlock special features
        }
        break;
      case 'title':
        if (reward.title) {
          // In real implementation, assign title
        }
        break;
      case 'badge':
        if (reward.badge) {
          // In real implementation, assign badge
        }
        break;
    }
  }

  /**
   * Check for level up
   */
  private checkLevelUp(user: MetaverseUser): void {
    const experienceNeeded = user.level * 100;
    if (user.experience >= experienceNeeded) {
      user.level++;
      user.experience -= experienceNeeded;
      user.rank = gamificationEngine.getUserRank(user.miningScore);

      // Emit level up event
      this.emitEvent({
        id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'level_up',
        userId: user.id,
        timestamp: Date.now(),
        data: {
          newLevel: user.level,
          experienceNeeded: experienceNeeded
        }
      });
    }
  }

  /**
   * Add event listener
   */
  public addEventListener(eventType: string, callback: (event: MetaverseEvent) => void): void {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, []);
    }
    this.eventListeners.get(eventType)!.push(callback);
  }

  /**
   * Remove event listener
   */
  public removeEventListener(eventType: string, callback: (event: MetaverseEvent) => void): void {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  /**
   * Emit event to all listeners
   */
  private emitEvent(event: MetaverseEvent): void {
    this.events.push(event);
    
    // Keep only last 1000 events
    if (this.events.length > 1000) {
      this.events = this.events.slice(-1000);
    }

    const listeners = this.eventListeners.get(event.type);
    if (listeners) {
      listeners.forEach(callback => callback(event));
    }
  }

  /**
   * Get user by ID
   */
  public getUser(userId: string): MetaverseUser | undefined {
    return this.users.get(userId);
  }

  /**
   * Get current session
   */
  public getCurrentSession(): MetaverseSession | null {
    return this.currentSession;
  }

  /**
   * Get all users
   */
  public getAllUsers(): MetaverseUser[] {
    return Array.from(this.users.values());
  }

  /**
   * Get all sessions
   */
  public getAllSessions(): MetaverseSession[] {
    return Array.from(this.sessions.values());
  }

  /**
   * Get recent events
   */
  public getRecentEvents(limit: number = 50): MetaverseEvent[] {
    return this.events.slice(-limit).reverse();
  }

  /**
   * Get events by type
   */
  public getEventsByType(eventType: string, limit: number = 50): MetaverseEvent[] {
    return this.events
      .filter(event => event.type === eventType)
      .slice(-limit)
      .reverse();
  }

  /**
   * Get user events
   */
  public getUserEvents(userId: string, limit: number = 50): MetaverseEvent[] {
    return this.events
      .filter(event => event.userId === userId)
      .slice(-limit)
      .reverse();
  }

  /**
   * Get metaverse statistics
   */
  public getMetaverseStats(): any {
    const users = this.getAllUsers();
    const sessions = this.getAllSessions();
    const events = this.events;

    return {
      users: {
        total: users.length,
        active: users.filter(u => Date.now() - u.lastActive < 24 * 60 * 60 * 1000).length,
        averageLevel: users.reduce((sum, u) => sum + u.level, 0) / users.length,
        averageMiningScore: users.reduce((sum, u) => sum + u.miningScore, 0) / users.length
      },
      sessions: {
        total: sessions.length,
        averageDuration: sessions.reduce((sum, s) => sum + (s.duration || 0), 0) / sessions.length,
        totalPlayTime: sessions.reduce((sum, s) => sum + (s.duration || 0), 0)
      },
      events: {
        total: events.length,
        byType: events.reduce((acc, event) => {
          acc[event.type] = (acc[event.type] || 0) + 1;
          return acc;
        }, {} as { [key: string]: number })
      },
      activities: {
        totalMiningOperations: sessions.reduce((sum, s) => sum + s.activities.miningOperations, 0),
        totalCombinations: sessions.reduce((sum, s) => sum + s.activities.combinationsAttempted, 0),
        totalDiscoveries: sessions.reduce((sum, s) => sum + s.activities.discoveries, 0),
        totalAchievements: sessions.reduce((sum, s) => sum + s.activities.achievementsUnlocked, 0),
        totalQuests: sessions.reduce((sum, s) => sum + s.activities.questsCompleted, 0)
      },
      rewards: {
        totalMiningScore: sessions.reduce((sum, s) => sum + s.rewards.miningScoreGained, 0),
        totalTokens: sessions.reduce((sum, s) => sum + s.rewards.tokensEarned, 0),
        totalExperience: sessions.reduce((sum, s) => sum + s.rewards.experienceGained, 0),
        totalElements: sessions.reduce((sum, s) => sum + s.rewards.elementsGained.length, 0)
      }
    };
  }

  /**
   * Create new user
   */
  public createUser(username: string, avatar: string = '🧙‍♂️'): MetaverseUser {
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const user: MetaverseUser = {
      id: userId,
      username,
      level: 1,
      experience: 0,
      miningScore: 0,
      rank: 'Novice',
      avatar,
      joinDate: Date.now(),
      lastActive: Date.now(),
      totalPlayTime: 0,
      sessionsCount: 0
    };

    this.users.set(userId, user);
    return user;
  }

  /**
   * Update user data
   */
  public updateUser(userId: string, updates: Partial<MetaverseUser>): boolean {
    const user = this.users.get(userId);
    if (!user) return false;

    Object.assign(user, updates);
    user.lastActive = Date.now();
    return true;
  }
}

// Export singleton instance
export const metaverseIntegrationEngine = new MetaverseIntegrationEngine();