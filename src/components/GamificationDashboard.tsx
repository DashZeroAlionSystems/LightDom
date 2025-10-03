/**
 * Gamification Dashboard - Comprehensive user engagement and progression interface
 * Integrates achievements, quests, streaks, leaderboards, and progression systems
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Trophy, 
  Target, 
  Award, 
  Star, 
  Flame, 
  Calendar, 
  Clock, 
  Users, 
  TrendingUp, 
  Zap, 
  Crown, 
  Gem, 
  Lock, 
  Unlock, 
  CheckCircle, 
  XCircle, 
  Play, 
  Pause, 
  RotateCcw, 
  Search, 
  Filter, 
  BarChart3, 
  Activity, 
  Coins, 
  Brain, 
  Database, 
  Network, 
  Globe, 
  Settings,
  BookOpen,
  Eye,
  EyeOff,
  ChevronRight,
  ChevronDown,
  Gift,
  Sparkles,
  Rocket,
  Shield,
  Heart,
  MessageCircle,
  Share2,
  Download,
  Upload
} from 'lucide-react';

interface Achievement {
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

interface Quest {
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
  timeLimit?: number;
  expiresAt?: number;
  startedAt?: number;
  completedAt?: number;
}

interface Streak {
  type: 'daily_login' | 'daily_mining' | 'daily_combination' | 'weekly_quest';
  current: number;
  max: number;
  lastActivity: number;
  bonus: number;
}

interface LeaderboardEntry {
  rank: number;
  username: string;
  score: number;
  level: number;
  rankTitle: string;
  avatar: string;
  achievements: number;
  lastActive: number;
}

interface GamificationStats {
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

const GamificationDashboard: React.FC = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [dailyQuests, setDailyQuests] = useState<Quest[]>([]);
  const [weeklyQuests, setWeeklyQuests] = useState<Quest[]>([]);
  const [streaks, setStreaks] = useState<Streak[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [stats, setStats] = useState<GamificationStats | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'achievements' | 'quests' | 'streaks' | 'leaderboard' | 'stats'>('overview');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterRarity, setFilterRarity] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showDetails, setShowDetails] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['overview']));

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load initial data
  useEffect(() => {
    loadGamificationData();
  }, []);

  // Auto-refresh data
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      loadGamificationData();
    }, 10000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const loadGamificationData = async () => {
    try {
      const response = await fetch('/api/gamification/data');
      const data = await response.json();
      if (data.success) {
        setAchievements(data.data.achievements);
        setQuests(data.data.quests);
        setDailyQuests(data.data.dailyQuests);
        setWeeklyQuests(data.data.weeklyQuests);
        setStreaks(data.data.streaks);
        setLeaderboard(data.data.leaderboard);
        setStats(data.data.stats);
      }
    } catch (error) {
      console.error('Error loading gamification data:', error);
    }
  };

  const startQuest = async (questId: string) => {
    try {
      const response = await fetch('/api/gamification/start-quest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questId })
      });

      const data = await response.json();
      if (data.success) {
        loadGamificationData();
      }
    } catch (error) {
      console.error('Error starting quest:', error);
    }
  };

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const getRarityColor = (rarity: string) => {
    const colors = {
      'common': 'border-gray-500/30 bg-gray-500/10',
      'uncommon': 'border-green-500/30 bg-green-500/10',
      'rare': 'border-blue-500/30 bg-blue-500/10',
      'epic': 'border-purple-500/30 bg-purple-500/10',
      'legendary': 'border-orange-500/30 bg-orange-500/10',
      'mythical': 'border-pink-500/30 bg-pink-500/10'
    };
    return colors[rarity as keyof typeof colors] || colors.common;
  };

  const getRarityIcon = (rarity: string) => {
    const icons = {
      'common': <Star className="text-gray-400" size={16} />,
      'uncommon': <Star className="text-green-400" size={16} />,
      'rare': <Star className="text-blue-400" size={16} />,
      'epic': <Gem className="text-purple-400" size={16} />,
      'legendary': <Crown className="text-orange-400" size={16} />,
      'mythical': <Sparkles className="text-pink-400" size={16} />
    };
    return icons[rarity as keyof typeof icons] || icons.common;
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      'mining': <Target className="text-blue-400" size={16} />,
      'alchemy': <Brain className="text-purple-400" size={16} />,
      'exploration': <Globe className="text-green-400" size={16} />,
      'social': <Users className="text-pink-400" size={16} />,
      'mastery': <Trophy className="text-yellow-400" size={16} />,
      'special': <Gift className="text-red-400" size={16} />
    };
    return icons[category as keyof typeof icons] || <Star size={16} />;
  };

  const getDifficultyColor = (difficulty: string) => {
    const colors = {
      'easy': 'text-green-400',
      'medium': 'text-yellow-400',
      'hard': 'text-orange-400',
      'expert': 'text-red-400',
      'legendary': 'text-purple-400'
    };
    return colors[difficulty as keyof typeof colors] || colors.easy;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'available': 'text-blue-400',
      'active': 'text-green-400',
      'completed': 'text-purple-400',
      'expired': 'text-red-400'
    };
    return colors[status as keyof typeof colors] || colors.available;
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      'available': <Play className="text-blue-400" size={16} />,
      'active': <Activity className="text-green-400" size={16} />,
      'completed': <CheckCircle className="text-purple-400" size={16} />,
      'expired': <XCircle className="text-red-400" size={16} />
    };
    return icons[status as keyof typeof icons] || icons.available;
  };

  const filteredAchievements = achievements.filter(achievement => {
    const matchesCategory = filterCategory === 'all' || achievement.category === filterCategory;
    const matchesRarity = filterRarity === 'all' || achievement.rarity === filterRarity;
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'unlocked' && achievement.unlocked) ||
      (filterStatus === 'locked' && !achievement.unlocked);
    const matchesSearch = searchQuery === '' || 
      achievement.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      achievement.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesCategory && matchesRarity && matchesStatus && matchesSearch;
  });

  const filteredQuests = quests.filter(quest => {
    const matchesCategory = filterCategory === 'all' || quest.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || quest.status === filterStatus;
    const matchesSearch = searchQuery === '' || 
      quest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quest.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesCategory && matchesStatus && matchesSearch;
  });

  const getProgressPercentage = (current: number, max: number): number => {
    return max > 0 ? (current / max) * 100 : 0;
  };

  const formatTime = (timestamp: number): string => {
    return new Date(timestamp).toLocaleString();
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) return `${hours}h ${minutes}m ${secs}s`;
    if (minutes > 0) return `${minutes}m ${secs}s`;
    return `${secs}s`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
            Gamification Center
          </h1>
          <p className="text-slate-300 text-lg">Track your progress, unlock achievements, and compete with others</p>
        </div>

        {/* Overview Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <Trophy className="text-yellow-400" size={24} />
                <span className="text-2xl">🏆</span>
              </div>
              <div className="text-3xl font-bold text-yellow-400 mb-1">
                {stats.achievementsUnlocked}
              </div>
              <div className="text-slate-400 text-sm">Achievements Unlocked</div>
              <div className="mt-2 text-xs text-slate-500">
                {achievements.length} total available
              </div>
            </div>

            <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <Target className="text-blue-400" size={24} />
                <span className="text-2xl">🎯</span>
              </div>
              <div className="text-3xl font-bold text-blue-400 mb-1">
                {stats.questsCompleted}
              </div>
              <div className="text-slate-400 text-sm">Quests Completed</div>
              <div className="mt-2 text-xs text-slate-500">
                {quests.filter(q => q.status === 'active').length} active
              </div>
            </div>

            <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <Flame className="text-orange-400" size={24} />
                <span className="text-2xl">🔥</span>
              </div>
              <div className="text-3xl font-bold text-orange-400 mb-1">
                {Math.max(...streaks.map(s => s.current), 0)}
              </div>
              <div className="text-slate-400 text-sm">Current Streak</div>
              <div className="mt-2 text-xs text-slate-500">
                {stats.longestStreak} longest streak
              </div>
            </div>

            <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <Coins className="text-purple-400" size={24} />
                <span className="text-2xl">💰</span>
              </div>
              <div className="text-3xl font-bold text-purple-400 mb-1">
                {stats.totalMiningScore.toFixed(0)}
              </div>
              <div className="text-slate-400 text-sm">Total Mining Score</div>
              <div className="mt-2 text-xs text-slate-500">
                {stats.totalCombinations} combinations
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex justify-center gap-2 mb-8">
          {[
            { id: 'overview', label: 'Overview', icon: <BarChart3 size={16} /> },
            { id: 'achievements', label: 'Achievements', icon: <Trophy size={16} /> },
            { id: 'quests', label: 'Quests', icon: <Target size={16} /> },
            { id: 'streaks', label: 'Streaks', icon: <Flame size={16} /> },
            { id: 'leaderboard', label: 'Leaderboard', icon: <Users size={16} /> },
            { id: 'stats', label: 'Statistics', icon: <Activity size={16} /> }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 ${
                activeTab === tab.id 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="flex justify-center gap-4 mb-8">
          <div className="flex items-center gap-2">
            <Filter size={20} />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm"
            >
              <option value="all">All Categories</option>
              <option value="mining">Mining</option>
              <option value="alchemy">Alchemy</option>
              <option value="exploration">Exploration</option>
              <option value="social">Social</option>
              <option value="mastery">Mastery</option>
              <option value="special">Special</option>
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <select
              value={filterRarity}
              onChange={(e) => setFilterRarity(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm"
            >
              <option value="all">All Rarities</option>
              <option value="common">Common</option>
              <option value="uncommon">Uncommon</option>
              <option value="rare">Rare</option>
              <option value="epic">Epic</option>
              <option value="legendary">Legendary</option>
              <option value="mythical">Mythical</option>
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm"
            >
              <option value="all">All Status</option>
              <option value="unlocked">Unlocked</option>
              <option value="locked">Locked</option>
              <option value="available">Available</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <Search size={20} />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm w-64"
            />
          </div>
        </div>

        {/* Content */}
        <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Recent Achievements */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <Trophy className="text-yellow-400" />
                    Recent Achievements
                  </h3>
                  <button
                    onClick={() => toggleSection('achievements')}
                    className="text-slate-400 hover:text-white"
                  >
                    {expandedSections.has('achievements') ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                  </button>
                </div>
                {expandedSections.has('achievements') && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {achievements.filter(a => a.unlocked).slice(0, 6).map(achievement => (
                      <div key={achievement.id} className={`bg-gradient-to-r from-slate-700/50 to-slate-600/30 rounded-lg p-4 border ${getRarityColor(achievement.rarity)}`}>
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-2xl">{achievement.icon}</span>
                          <div>
                            <div className="font-semibold">{achievement.name}</div>
                            <div className="text-sm text-slate-400">{achievement.description}</div>
                          </div>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-500">
                            {achievement.unlockedAt ? formatTime(achievement.unlockedAt) : 'Recently unlocked'}
                          </span>
                          <span className="text-yellow-400">
                            +{achievement.rewards.miningScoreBonus} score
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Active Quests */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <Target className="text-blue-400" />
                    Active Quests
                  </h3>
                  <button
                    onClick={() => toggleSection('quests')}
                    className="text-slate-400 hover:text-white"
                  >
                    {expandedSections.has('quests') ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                  </button>
                </div>
                {expandedSections.has('quests') && (
                  <div className="space-y-3">
                    {quests.filter(q => q.status === 'active').slice(0, 3).map(quest => (
                      <div key={quest.id} className="bg-gradient-to-r from-slate-700/50 to-slate-600/30 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <div className="font-semibold">{quest.name}</div>
                            <div className="text-sm text-slate-400">{quest.description}</div>
                          </div>
                          <div className={`text-xs px-2 py-1 rounded ${getDifficultyColor(quest.difficulty)}`}>
                            {quest.difficulty}
                          </div>
                        </div>
                        <div className="space-y-2">
                          {quest.objectives.map(objective => (
                            <div key={objective.id} className="flex items-center justify-between text-sm">
                              <span className="text-slate-300">{objective.description}</span>
                              <div className="flex items-center gap-2">
                                <div className="w-24 bg-slate-700 rounded-full h-2">
                                  <div 
                                    className="bg-blue-400 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${getProgressPercentage(objective.current, objective.target)}%` }}
                                  ></div>
                                </div>
                                <span className="text-xs text-slate-400">
                                  {objective.current}/{objective.target}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Current Streaks */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <Flame className="text-orange-400" />
                    Current Streaks
                  </h3>
                  <button
                    onClick={() => toggleSection('streaks')}
                    className="text-slate-400 hover:text-white"
                  >
                    {expandedSections.has('streaks') ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                  </button>
                </div>
                {expandedSections.has('streaks') && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {streaks.map(streak => (
                      <div key={streak.type} className="bg-gradient-to-r from-slate-700/50 to-slate-600/30 rounded-lg p-4">
                        <div className="flex items-center gap-3 mb-2">
                          <Flame className="text-orange-400" size={20} />
                          <div>
                            <div className="font-semibold capitalize">
                              {streak.type.replace('_', ' ')}
                            </div>
                            <div className="text-sm text-slate-400">
                              {streak.current} days
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-500">
                            Best: {streak.max} days
                          </span>
                          <span className="text-green-400">
                            +{(streak.bonus * 100).toFixed(0)}% bonus
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'achievements' && (
            <div>
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Trophy className="text-yellow-400" />
                Achievements ({filteredAchievements.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                {filteredAchievements.map(achievement => (
                  <div 
                    key={achievement.id} 
                    className={`bg-gradient-to-r from-slate-700/50 to-slate-600/30 rounded-lg p-4 border ${getRarityColor(achievement.rarity)} ${
                      !achievement.unlocked ? 'opacity-60' : ''
                    }`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{achievement.icon}</span>
                        <div>
                          <div className="font-semibold">{achievement.name}</div>
                          <div className="text-sm text-slate-400">{achievement.description}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {achievement.unlocked ? <Unlock className="text-green-400" size={16} /> : <Lock className="text-gray-400" size={16} />}
                        {getRarityIcon(achievement.rarity)}
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <div className="flex justify-between text-xs text-slate-400 mb-1">
                        <span>Progress</span>
                        <span>{achievement.progress}/{achievement.maxProgress}</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${
                            achievement.unlocked ? 'bg-green-400' : 'bg-blue-400'
                          }`}
                          style={{ width: `${getProgressPercentage(achievement.progress, achievement.maxProgress)}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500">
                        {getCategoryIcon(achievement.category)}
                        <span className="ml-1 capitalize">{achievement.category}</span>
                      </span>
                      <div className="flex gap-2">
                        <span className="text-yellow-400">
                          +{achievement.rewards.miningScoreBonus} score
                        </span>
                        <button
                          onClick={() => setShowDetails(showDetails === achievement.id ? null : achievement.id)}
                          className="px-2 py-1 bg-slate-600 hover:bg-slate-500 rounded text-xs"
                        >
                          Details
                        </button>
                      </div>
                    </div>
                    
                    {showDetails === achievement.id && (
                      <div className="mt-3 p-3 bg-slate-800/50 rounded border border-slate-600">
                        <div className="text-sm">
                          <div className="mb-2">
                            <span className="text-slate-400">Requirement:</span>
                            <span className="ml-2">{achievement.requirements.description}</span>
                          </div>
                          <div className="mb-2">
                            <span className="text-slate-400">Rewards:</span>
                            <div className="ml-2">
                              <div>+{achievement.rewards.experiencePoints} XP</div>
                              <div>+{achievement.rewards.tokenReward} tokens</div>
                              {achievement.rewards.title && (
                                <div>Title: {achievement.rewards.title}</div>
                              )}
                            </div>
                          </div>
                          {achievement.unlockedAt && (
                            <div className="mb-2">
                              <span className="text-slate-400">Unlocked:</span>
                              <span className="ml-2">{formatTime(achievement.unlockedAt)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'quests' && (
            <div className="space-y-6">
              {/* Daily Quests */}
              <div>
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Calendar className="text-blue-400" />
                  Daily Quests ({dailyQuests.length})
                </h3>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {dailyQuests.map(quest => (
                    <div key={quest.id} className="bg-gradient-to-r from-slate-700/50 to-slate-600/30 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="font-semibold">{quest.name}</div>
                          <div className="text-sm text-slate-400">{quest.description}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(quest.status)}
                          <span className={`text-xs px-2 py-1 rounded ${getDifficultyColor(quest.difficulty)}`}>
                            {quest.difficulty}
                          </span>
                        </div>
                      </div>
                      
                      <div className="space-y-2 mb-3">
                        {quest.objectives.map(objective => (
                          <div key={objective.id} className="flex items-center justify-between text-sm">
                            <span className="text-slate-300">{objective.description}</span>
                            <div className="flex items-center gap-2">
                              <div className="w-24 bg-slate-700 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full transition-all duration-300 ${
                                    objective.completed ? 'bg-green-400' : 'bg-blue-400'
                                  }`}
                                  style={{ width: `${getProgressPercentage(objective.current, objective.target)}%` }}
                                ></div>
                              </div>
                              <span className="text-xs text-slate-400">
                                {objective.current}/{objective.target}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-500">
                          Rewards: +{quest.rewards.miningScoreBonus} score, +{quest.rewards.tokenReward} tokens
                        </span>
                        <button
                          onClick={() => startQuest(quest.id)}
                          disabled={quest.status !== 'available'}
                          className={`px-3 py-1 rounded font-semibold transition-all duration-200 ${
                            quest.status === 'available'
                              ? 'bg-green-600 hover:bg-green-700'
                              : 'bg-gray-600 cursor-not-allowed'
                          }`}
                        >
                          {quest.status === 'available' ? 'Start Quest' : quest.status}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Weekly Quests */}
              <div>
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Calendar className="text-purple-400" />
                  Weekly Quests ({weeklyQuests.length})
                </h3>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {weeklyQuests.map(quest => (
                    <div key={quest.id} className="bg-gradient-to-r from-slate-700/50 to-slate-600/30 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="font-semibold">{quest.name}</div>
                          <div className="text-sm text-slate-400">{quest.description}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(quest.status)}
                          <span className={`text-xs px-2 py-1 rounded ${getDifficultyColor(quest.difficulty)}`}>
                            {quest.difficulty}
                          </span>
                        </div>
                      </div>
                      
                      <div className="space-y-2 mb-3">
                        {quest.objectives.map(objective => (
                          <div key={objective.id} className="flex items-center justify-between text-sm">
                            <span className="text-slate-300">{objective.description}</span>
                            <div className="flex items-center gap-2">
                              <div className="w-24 bg-slate-700 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full transition-all duration-300 ${
                                    objective.completed ? 'bg-green-400' : 'bg-purple-400'
                                  }`}
                                  style={{ width: `${getProgressPercentage(objective.current, objective.target)}%` }}
                                ></div>
                              </div>
                              <span className="text-xs text-slate-400">
                                {objective.current}/{objective.target}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-500">
                          Rewards: +{quest.rewards.miningScoreBonus} score, +{quest.rewards.tokenReward} tokens
                        </span>
                        <button
                          onClick={() => startQuest(quest.id)}
                          disabled={quest.status !== 'available'}
                          className={`px-3 py-1 rounded font-semibold transition-all duration-200 ${
                            quest.status === 'available'
                              ? 'bg-purple-600 hover:bg-purple-700'
                              : 'bg-gray-600 cursor-not-allowed'
                          }`}
                        >
                          {quest.status === 'available' ? 'Start Quest' : quest.status}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'leaderboard' && (
            <div>
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Users className="text-green-400" />
                Leaderboard ({leaderboard.length})
              </h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {leaderboard.map((entry, index) => (
                  <div key={entry.rank} className="bg-gradient-to-r from-slate-700/50 to-slate-600/30 rounded-lg p-4">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-yellow-400">#{entry.rank}</span>
                        {entry.rank <= 3 && (
                          <span className="text-2xl">
                            {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : '🥉'}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold">{entry.username[0].toUpperCase()}</span>
                        </div>
                        <div>
                          <div className="font-semibold">{entry.username}</div>
                          <div className="text-sm text-slate-400">{entry.rankTitle}</div>
                        </div>
                      </div>
                      
                      <div className="ml-auto text-right">
                        <div className="text-lg font-bold text-green-400">{entry.score.toLocaleString()}</div>
                        <div className="text-sm text-slate-400">Level {entry.level}</div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-sm text-slate-400">{entry.achievements} achievements</div>
                        <div className="text-xs text-slate-500">
                          {formatTime(entry.lastActive)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'stats' && stats && (
            <div>
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Activity className="text-blue-400" />
                Statistics
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <h4 className="font-semibold mb-3 text-blue-400">Activity</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Total Play Time:</span>
                      <span className="text-white">{formatDuration(stats.totalPlayTime)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Sessions:</span>
                      <span className="text-white">{stats.sessionsCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Avg Session:</span>
                      <span className="text-white">{formatDuration(stats.averageSessionLength)}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-700/50 rounded-lg p-4">
                  <h4 className="font-semibold mb-3 text-green-400">Progress</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Mining Score:</span>
                      <span className="text-white">{stats.totalMiningScore.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Combinations:</span>
                      <span className="text-white">{stats.totalCombinations}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Discoveries:</span>
                      <span className="text-white">{stats.totalDiscoveries}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-700/50 rounded-lg p-4">
                  <h4 className="font-semibold mb-3 text-purple-400">Favorites</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Favorite Biome:</span>
                      <span className="text-white capitalize">{stats.favoriteBiome}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Most Used Element:</span>
                      <span className="text-white capitalize">{stats.mostUsedElement}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Rarest Element:</span>
                      <span className="text-white capitalize">{stats.rarestElement}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GamificationDashboard;