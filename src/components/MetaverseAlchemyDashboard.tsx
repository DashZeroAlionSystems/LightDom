/**
 * Metaverse Alchemy Dashboard - Little Alchemy-inspired combination interface
 * Visual interface for combining metaverse elements and enhancing mining scores
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Zap, 
  Brain, 
  Database, 
  Network, 
  Globe, 
  Star, 
  Award, 
  Coins, 
  Battery, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Plus, 
  Minus, 
  RotateCcw, 
  Search, 
  Filter, 
  TrendingUp, 
  Target, 
  Flame, 
  Droplets, 
  Mountain, 
  Wind, 
  Cpu, 
  Cloud, 
  Gear, 
  Robot, 
  Atom, 
  Sparkles,
  Crown,
  Gem,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  BookOpen,
  Trophy,
  Users,
  Settings
} from 'lucide-react';

interface MetaverseElement {
  id: string;
  name: string;
  type: 'basic' | 'compound' | 'legendary' | 'mythical';
  category: 'algorithm' | 'data' | 'biome' | 'upgrade' | 'tool' | 'resource' | 'energy' | 'catalyst';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythical';
  description: string;
  icon: string;
  color: string;
  properties: {
    miningPower: number;
    discoveryRate: number;
    optimizationBoost: number;
    authorityMultiplier: number;
    energyEfficiency: number;
    combinationPotential: number;
  };
  combinations: {
    canCombine: boolean;
    combinations: string[];
    results: string[];
    successRate: number;
  };
  requirements: {
    level: number;
    miningScore: number;
    achievements: string[];
    biomeAccess: string[];
  };
  rewards: {
    miningScoreBonus: number;
    tokenReward: number;
    experiencePoints: number;
    specialUnlocks: string[];
  };
}

interface CombinationRecipe {
  id: string;
  name: string;
  description: string;
  ingredients: string[];
  result: string;
  successRate: number;
  failureResults: string[];
  energyCost: number;
  timeRequired: number;
  category: 'fusion' | 'transmutation' | 'synthesis' | 'evolution' | 'transformation';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythical';
  unlocks: string[];
}

interface UserInventory {
  elements: Map<string, number>;
  combinations: string[];
  achievements: string[];
  miningScore: number;
  level: number;
  experience: number;
  energy: number;
  maxEnergy: number;
  biomeAccess: string[];
  specialUnlocks: string[];
}

interface MiningScoreSystem {
  baseScore: number;
  multipliers: {
    elementBonuses: number;
    combinationBonuses: number;
    achievementBonuses: number;
    biomeBonuses: number;
    streakBonuses: number;
  };
  totalScore: number;
  rank: string;
  nextRankThreshold: number;
}

const MetaverseAlchemyDashboard: React.FC = () => {
  const [elements, setElements] = useState<MetaverseElement[]>([]);
  const [recipes, setRecipes] = useState<CombinationRecipe[]>([]);
  const [userInventory, setUserInventory] = useState<UserInventory | null>(null);
  const [miningScoreSystem, setMiningScoreSystem] = useState<MiningScoreSystem | null>(null);
  const [selectedElements, setSelectedElements] = useState<string[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<string | null>(null);
  const [isCombining, setIsCombining] = useState(false);
  const [combinationResult, setCombinationResult] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'inventory' | 'combinations' | 'recipes' | 'achievements'>('inventory');
  const [filterRarity, setFilterRarity] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showElementDetails, setShowElementDetails] = useState<string | null>(null);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load initial data
  useEffect(() => {
    loadAlchemyData();
  }, []);

  // Auto-refresh data
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      loadAlchemyData();
    }, 5000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const loadAlchemyData = async () => {
    try {
      const response = await fetch('/api/metaverse/alchemy-data');
      const data = await response.json();
      if (data.success) {
        setElements(data.data.elements);
        setRecipes(data.data.recipes);
        setUserInventory(data.data.userInventory);
        setMiningScoreSystem(data.data.miningScoreSystem);
      }
    } catch (error) {
      console.error('Error loading alchemy data:', error);
    }
  };

  const attemptCombination = async (recipeId: string) => {
    if (isCombining) return;

    setIsCombining(true);
    try {
      const response = await fetch('/api/metaverse/attempt-combination', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipeId })
      });

      const data = await response.json();
      if (data.success) {
        setCombinationResult(data.data);
        // Refresh data after combination
        setTimeout(() => {
          loadAlchemyData();
          setCombinationResult(null);
        }, 3000);
      }
    } catch (error) {
      console.error('Error attempting combination:', error);
    } finally {
      setIsCombining(false);
    }
  };

  const getElementIcon = (element: MetaverseElement) => {
    const iconMap: { [key: string]: React.ReactNode } = {
      'fire': <Flame className="text-red-400" size={20} />,
      'water': <Droplets className="text-blue-400" size={20} />,
      'earth': <Mountain className="text-yellow-600" size={20} />,
      'air': <Wind className="text-cyan-400" size={20} />,
      'code': <Cpu className="text-green-400" size={20} />,
      'steam': <Cloud className="text-gray-400" size={20} />,
      'algorithm': <Gear className="text-yellow-400" size={20} />,
      'data_lake': <Database className="text-blue-600" size={20} />,
      'ai_optimizer': <Robot className="text-pink-400" size={20} />,
      'quantum_algorithm': <Atom className="text-purple-400" size={20} />,
      'reality_optimizer': <Sparkles className="text-pink-600" size={20} />
    };

    return iconMap[element.id] || <Star className="text-gray-400" size={20} />;
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
      'algorithm': <Cpu className="text-blue-400" size={16} />,
      'data': <Database className="text-green-400" size={16} />,
      'biome': <Globe className="text-yellow-400" size={16} />,
      'upgrade': <TrendingUp className="text-purple-400" size={16} />,
      'tool': <Gear className="text-gray-400" size={16} />,
      'resource': <Coins className="text-yellow-600" size={16} />,
      'energy': <Zap className="text-red-400" size={16} />,
      'catalyst': <Target className="text-pink-400" size={16} />
    };
    return icons[category as keyof typeof icons] || <Star size={16} />;
  };

  const filteredElements = elements.filter(element => {
    const matchesRarity = filterRarity === 'all' || element.rarity === filterRarity;
    const matchesCategory = filterCategory === 'all' || element.category === filterCategory;
    const matchesSearch = searchQuery === '' || 
      element.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      element.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesRarity && matchesCategory && matchesSearch;
  });

  const availableRecipes = recipes.filter(recipe => {
    if (!userInventory) return false;
    
    // Check if user has all ingredients
    return recipe.ingredients.every(ingredient => 
      userInventory.elements.has(ingredient) && 
      userInventory.elements.get(ingredient)! > 0
    );
  });

  const getUserElementQuantity = (elementId: string): number => {
    return userInventory?.elements.get(elementId) || 0;
  };

  const getEnergyPercentage = (): number => {
    if (!userInventory) return 0;
    return (userInventory.energy / userInventory.maxEnergy) * 100;
  };

  const getExperiencePercentage = (): number => {
    if (!userInventory) return 0;
    const experienceNeeded = userInventory.level * 100;
    return (userInventory.experience / experienceNeeded) * 100;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
            Metaverse Alchemy Lab
          </h1>
          <p className="text-slate-300 text-lg">Combine elements to create powerful tools and enhance your mining score</p>
        </div>

        {/* User Stats */}
        {userInventory && miningScoreSystem && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <Trophy className="text-yellow-400" size={24} />
                <span className="text-2xl">🏆</span>
              </div>
              <div className="text-3xl font-bold text-yellow-400 mb-1">
                {miningScoreSystem.rank}
              </div>
              <div className="text-slate-400 text-sm">Current Rank</div>
              <div className="mt-2 text-xs text-slate-500">
                {miningScoreSystem.totalScore.toFixed(0)} / {miningScoreSystem.nextRankThreshold} score
              </div>
            </div>

            <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <Star className="text-blue-400" size={24} />
                <span className="text-2xl">⭐</span>
              </div>
              <div className="text-3xl font-bold text-blue-400 mb-1">
                Level {userInventory.level}
              </div>
              <div className="text-slate-400 text-sm">Current Level</div>
              <div className="mt-2">
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div 
                    className="bg-blue-400 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${getExperiencePercentage()}%` }}
                  ></div>
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  {userInventory.experience} / {userInventory.level * 100} XP
                </div>
              </div>
            </div>

            <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <Battery className="text-green-400" size={24} />
                <span className="text-2xl">⚡</span>
              </div>
              <div className="text-3xl font-bold text-green-400 mb-1">
                {userInventory.energy} / {userInventory.maxEnergy}
              </div>
              <div className="text-slate-400 text-sm">Energy</div>
              <div className="mt-2">
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div 
                    className="bg-green-400 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${getEnergyPercentage()}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <Coins className="text-purple-400" size={24} />
                <span className="text-2xl">💰</span>
              </div>
              <div className="text-3xl font-bold text-purple-400 mb-1">
                {userInventory.miningScore.toFixed(0)}
              </div>
              <div className="text-slate-400 text-sm">Mining Score</div>
              <div className="mt-2 text-xs text-slate-500">
                {miningScoreSystem.multipliers.elementBonuses.toFixed(2)}x element bonus
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex justify-center gap-2 mb-8">
          {[
            { id: 'inventory', label: 'Inventory', icon: <Database size={16} /> },
            { id: 'combinations', label: 'Combinations', icon: <Plus size={16} /> },
            { id: 'recipes', label: 'Recipes', icon: <BookOpen size={16} /> },
            { id: 'achievements', label: 'Achievements', icon: <Award size={16} /> }
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
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm"
            >
              <option value="all">All Categories</option>
              <option value="algorithm">Algorithm</option>
              <option value="data">Data</option>
              <option value="biome">Biome</option>
              <option value="upgrade">Upgrade</option>
              <option value="tool">Tool</option>
              <option value="resource">Resource</option>
              <option value="energy">Energy</option>
              <option value="catalyst">Catalyst</option>
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <Search size={20} />
            <input
              type="text"
              placeholder="Search elements..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm w-64"
            />
          </div>
        </div>

        {/* Content */}
        <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
          {activeTab === 'inventory' && (
            <div>
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Database className="text-blue-400" />
                Element Inventory ({filteredElements.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-h-96 overflow-y-auto">
                {filteredElements.map(element => {
                  const quantity = getUserElementQuantity(element.id);
                  const canUse = quantity > 0;
                  
                  return (
                    <div 
                      key={element.id} 
                      className={`bg-gradient-to-r from-slate-700/50 to-slate-600/30 rounded-lg p-4 border ${getRarityColor(element.rarity)} ${
                        !canUse ? 'opacity-50' : 'hover:scale-105'
                      } transition-all duration-200 cursor-pointer`}
                      onClick={() => setShowElementDetails(showElementDetails === element.id ? null : element.id)}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                          {getElementIcon(element)}
                          <div>
                            <div className="font-semibold">{element.name}</div>
                            <div className="text-sm text-slate-400 capitalize">{element.category}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {getRarityIcon(element.rarity)}
                          <span className="text-sm font-mono">{quantity}</span>
                        </div>
                      </div>
                      
                      <div className="text-sm text-slate-300 mb-3">
                        {element.description}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                        <div>
                          <span className="text-slate-400">Mining:</span>
                          <span className="ml-1 font-mono">{element.properties.miningPower}</span>
                        </div>
                        <div>
                          <span className="text-slate-400">Discovery:</span>
                          <span className="ml-1 font-mono">{element.properties.discoveryRate}%</span>
                        </div>
                        <div>
                          <span className="text-slate-400">Optimization:</span>
                          <span className="ml-1 font-mono">{element.properties.optimizationBoost}%</span>
                        </div>
                        <div>
                          <span className="text-slate-400">Authority:</span>
                          <span className="ml-1 font-mono">{element.properties.authorityMultiplier.toFixed(1)}x</span>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-500">
                          Level {element.requirements.level}
                        </span>
                        <div className="flex gap-2">
                          <span className="text-yellow-400">
                            +{element.rewards.miningScoreBonus} score
                          </span>
                          <button className="px-2 py-1 bg-slate-600 hover:bg-slate-500 rounded text-xs">
                            Details
                          </button>
                        </div>
                      </div>
                      
                      {showElementDetails === element.id && (
                        <div className="mt-3 p-3 bg-slate-800/50 rounded border border-slate-600">
                          <div className="text-sm">
                            <div className="mb-2">
                              <span className="text-slate-400">Type:</span>
                              <span className="ml-2 capitalize">{element.type}</span>
                            </div>
                            <div className="mb-2">
                              <span className="text-slate-400">Rarity:</span>
                              <span className="ml-2 capitalize">{element.rarity}</span>
                            </div>
                            <div className="mb-2">
                              <span className="text-slate-400">Energy Efficiency:</span>
                              <span className="ml-2">{element.properties.energyEfficiency}%</span>
                            </div>
                            <div className="mb-2">
                              <span className="text-slate-400">Combination Potential:</span>
                              <span className="ml-2">{element.properties.combinationPotential}%</span>
                            </div>
                            {element.combinations.canCombine && (
                              <div className="mb-2">
                                <span className="text-slate-400">Can combine with:</span>
                                <span className="ml-2">{element.combinations.combinations.length} elements</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'combinations' && (
            <div>
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Plus className="text-green-400" />
                Available Combinations ({availableRecipes.length})
              </h3>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {availableRecipes.length === 0 ? (
                  <div className="text-center text-slate-400 py-8">
                    <Plus size={48} className="mx-auto mb-4 opacity-50" />
                    <p>No combinations available</p>
                    <p className="text-sm">Collect more elements to unlock combinations</p>
                  </div>
                ) : (
                  availableRecipes.map(recipe => {
                    const resultElement = elements.find(e => e.id === recipe.result);
                    const energySufficient = userInventory && userInventory.energy >= recipe.energyCost;
                    
                    return (
                      <div key={recipe.id} className="bg-gradient-to-r from-slate-700/50 to-slate-600/30 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <div className="font-semibold">{recipe.name}</div>
                            <div className="text-sm text-slate-400">{recipe.description}</div>
                          </div>
                          <div className={`text-xs px-2 py-1 rounded ${
                            recipe.rarity === 'mythical' ? 'bg-pink-600' :
                            recipe.rarity === 'legendary' ? 'bg-orange-600' :
                            recipe.rarity === 'epic' ? 'bg-purple-600' :
                            recipe.rarity === 'rare' ? 'bg-blue-600' :
                            recipe.rarity === 'uncommon' ? 'bg-green-600' : 'bg-gray-600'
                          }`}>
                            {recipe.rarity}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4 mb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-slate-400">Ingredients:</span>
                            <div className="flex gap-1">
                              {recipe.ingredients.map(ingredientId => {
                                const element = elements.find(e => e.id === ingredientId);
                                return element ? (
                                  <div key={ingredientId} className="flex items-center gap-1 bg-slate-800 rounded px-2 py-1">
                                    {getElementIcon(element)}
                                    <span className="text-xs">{getUserElementQuantity(ingredientId)}</span>
                                  </div>
                                ) : null;
                              })}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-slate-400">→</span>
                            {resultElement && (
                              <div className="flex items-center gap-1 bg-slate-800 rounded px-2 py-1">
                                {getElementIcon(resultElement)}
                                <span className="text-xs">{resultElement.name}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-3 text-sm mb-3">
                          <div>
                            <span className="text-slate-400">Success Rate:</span>
                            <span className="ml-1 font-mono">{recipe.successRate}%</span>
                          </div>
                          <div>
                            <span className="text-slate-400">Energy Cost:</span>
                            <span className="ml-1 font-mono">{recipe.energyCost}</span>
                          </div>
                          <div>
                            <span className="text-slate-400">Time:</span>
                            <span className="ml-1 font-mono">{recipe.timeRequired}s</span>
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-slate-500">
                            Category: {recipe.category} • Unlocks: {recipe.unlocks.length} features
                          </span>
                          <button
                            onClick={() => attemptCombination(recipe.id)}
                            disabled={!energySufficient || isCombining}
                            className={`px-4 py-2 rounded font-semibold transition-all duration-200 flex items-center gap-2 ${
                              energySufficient && !isCombining
                                ? 'bg-green-600 hover:bg-green-700'
                                : 'bg-gray-600 cursor-not-allowed'
                            }`}
                          >
                            {isCombining ? (
                              <>
                                <RotateCcw className="animate-spin" size={16} />
                                Combining...
                              </>
                            ) : (
                              <>
                                <Plus size={16} />
                                Combine
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {activeTab === 'recipes' && (
            <div>
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <BookOpen className="text-purple-400" />
                All Recipes ({recipes.length})
              </h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {recipes.map(recipe => {
                  const resultElement = elements.find(e => e.id === recipe.result);
                  const canAttempt = userInventory && recipe.ingredients.every(ingredient => 
                    userInventory.elements.has(ingredient) && 
                    userInventory.elements.get(ingredient)! > 0
                  );
                  
                  return (
                    <div key={recipe.id} className="bg-gradient-to-r from-slate-700/50 to-slate-600/30 rounded-lg p-3">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="font-semibold">{recipe.name}</div>
                          <div className="text-sm text-slate-400">{recipe.description}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getRarityIcon(recipe.rarity)}
                          <span className={`text-xs px-2 py-1 rounded ${
                            canAttempt ? 'bg-green-600' : 'bg-gray-600'
                          }`}>
                            {canAttempt ? 'Available' : 'Locked'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-400">Ingredients:</span>
                          <div className="flex gap-1">
                            {recipe.ingredients.map(ingredientId => {
                              const element = elements.find(e => e.id === ingredientId);
                              return element ? (
                                <div key={ingredientId} className="flex items-center gap-1 bg-slate-800 rounded px-2 py-1">
                                  {getElementIcon(element)}
                                  <span className="text-xs">{element.name}</span>
                                </div>
                              ) : null;
                            })}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <span className="text-slate-400">→</span>
                          {resultElement && (
                            <div className="flex items-center gap-1 bg-slate-800 rounded px-2 py-1">
                              {getElementIcon(resultElement)}
                              <span className="text-xs">{resultElement.name}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-500">
                          {recipe.successRate}% success • {recipe.energyCost} energy • {recipe.timeRequired}s
                        </span>
                        <span className="text-slate-500">
                          Unlocks: {recipe.unlocks.length} features
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'achievements' && (
            <div>
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Award className="text-yellow-400" />
                Achievements ({userInventory?.achievements.length || 0})
              </h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {userInventory?.achievements.length === 0 ? (
                  <div className="text-center text-slate-400 py-8">
                    <Award size={48} className="mx-auto mb-4 opacity-50" />
                    <p>No achievements yet</p>
                    <p className="text-sm">Complete combinations and reach milestones to earn achievements</p>
                  </div>
                ) : (
                  userInventory?.achievements.map(achievement => (
                    <div key={achievement} className="bg-gradient-to-r from-slate-700/50 to-slate-600/30 rounded-lg p-3">
                      <div className="flex items-center gap-3">
                        <Award className="text-yellow-400" size={20} />
                        <div>
                          <div className="font-semibold capitalize">{achievement.replace('_', ' ')}</div>
                          <div className="text-sm text-slate-400">Achievement unlocked</div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Combination Result Modal */}
        {combinationResult && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 max-w-md w-full mx-4">
              <div className="text-center">
                {combinationResult.success ? (
                  <>
                    <CheckCircle className="text-green-400 mx-auto mb-4" size={48} />
                    <h3 className="text-xl font-bold text-green-400 mb-2">Combination Successful!</h3>
                    <p className="text-slate-300 mb-4">
                      You successfully created: <span className="font-semibold">{combinationResult.result}</span>
                    </p>
                    <div className="bg-slate-700 rounded p-3 mb-4">
                      <div className="text-sm text-slate-400 mb-2">Rewards:</div>
                      <div className="text-yellow-400">+{combinationResult.experienceGained} XP</div>
                      <div className="text-blue-400">+{combinationResult.miningScoreBonus} Mining Score</div>
                    </div>
                  </>
                ) : (
                  <>
                    <XCircle className="text-red-400 mx-auto mb-4" size={48} />
                    <h3 className="text-xl font-bold text-red-400 mb-2">Combination Failed</h3>
                    <p className="text-slate-300 mb-4">
                      The combination failed and created: <span className="font-semibold">{combinationResult.failureResult}</span>
                    </p>
                    <div className="bg-slate-700 rounded p-3 mb-4">
                      <div className="text-sm text-slate-400 mb-2">Partial Rewards:</div>
                      <div className="text-yellow-400">+{combinationResult.experienceGained} XP</div>
                    </div>
                  </>
                )}
                <div className="text-sm text-slate-400">
                  Energy used: {combinationResult.energyUsed}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MetaverseAlchemyDashboard;