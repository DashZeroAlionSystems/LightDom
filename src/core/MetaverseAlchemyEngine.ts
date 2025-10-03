/**
 * Metaverse Alchemy Engine - Little Alchemy-inspired combination system for LightDom
 * Combines metaverse items to create new, more powerful items and enhance mining scores
 */

export interface MetaverseElement {
  id: string;
  name: string;
  type: 'basic' | 'compound' | 'legendary' | 'mythical';
  category: 'algorithm' | 'data' | 'biome' | 'upgrade' | 'tool' | 'resource' | 'energy' | 'catalyst';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythical';
  description: string;
  icon: string;
  color: string;
  properties: {
    miningPower: number;        // Increases mining efficiency
    discoveryRate: number;       // Increases algorithm discovery rate
    optimizationBoost: number;   // Increases optimization potential
    authorityMultiplier: number; // Multiplies authority scores
    energyEfficiency: number;    // Reduces energy consumption
    combinationPotential: number; // Affects combination success rate
  };
  combinations: {
    canCombine: boolean;
    combinations: string[];      // Element IDs that can combine with this
    results: string[];           // Possible results from combinations
    successRate: number;         // Base success rate for combinations
  };
  requirements: {
    level: number;               // Minimum user level required
    miningScore: number;         // Minimum mining score required
    achievements: string[];      // Required achievements
    biomeAccess: string[];       // Required biome access
  };
  rewards: {
    miningScoreBonus: number;     // Bonus to mining score
    tokenReward: number;         // DSH token reward
    experiencePoints: number;    // XP gained
    specialUnlocks: string[];    // Special features unlocked
  };
}

export interface CombinationRecipe {
  id: string;
  name: string;
  description: string;
  ingredients: string[];         // Element IDs required
  result: string;                // Resulting element ID
  successRate: number;           // Base success rate
  failureResults: string[];      // Possible results on failure
  energyCost: number;            // Energy required
  timeRequired: number;          // Time in seconds
  category: 'fusion' | 'transmutation' | 'synthesis' | 'evolution' | 'transformation';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythical';
  unlocks: string[];             // What this combination unlocks
}

export interface UserInventory {
  elements: Map<string, number>; // Element ID -> quantity
  combinations: string[];        // Unlocked combination recipes
  achievements: string[];        // Unlocked achievements
  miningScore: number;           // Current mining score
  level: number;                 // Current user level
  experience: number;            // Current XP
  energy: number;                // Current energy
  maxEnergy: number;             // Maximum energy
  biomeAccess: string[];         // Accessible biomes
  specialUnlocks: string[];      // Special features unlocked
}

export interface MiningScoreSystem {
  baseScore: number;
  multipliers: {
    elementBonuses: number;      // Bonuses from equipped elements
    combinationBonuses: number; // Bonuses from successful combinations
    achievementBonuses: number; // Bonuses from achievements
    biomeBonuses: number;        // Bonuses from biome access
    streakBonuses: number;       // Bonuses from daily streaks
  };
  totalScore: number;
  rank: string;                  // Current rank (Novice, Expert, Master, etc.)
  nextRankThreshold: number;     // Score needed for next rank
}

export class MetaverseAlchemyEngine {
  private elements: Map<string, MetaverseElement> = new Map();
  private recipes: Map<string, CombinationRecipe> = new Map();
  private userInventory: UserInventory;
  private miningScoreSystem: MiningScoreSystem;
  private combinationHistory: Array<{timestamp: number, recipe: string, success: boolean, result: string}> = [];

  constructor() {
    this.initializeElements();
    this.initializeRecipes();
    this.initializeUserInventory();
    this.initializeMiningScoreSystem();
  }

  /**
   * Initialize all metaverse elements
   */
  private initializeElements(): void {
    // Basic Elements (Starting elements)
    const basicElements: MetaverseElement[] = [
      {
        id: 'fire',
        name: 'Digital Fire',
        type: 'basic',
        category: 'energy',
        rarity: 'common',
        description: 'Pure digital energy that powers the metaverse',
        icon: '🔥',
        color: '#ff4444',
        properties: {
          miningPower: 10,
          discoveryRate: 5,
          optimizationBoost: 0,
          authorityMultiplier: 1.0,
          energyEfficiency: 80,
          combinationPotential: 90
        },
        combinations: {
          canCombine: true,
          combinations: ['water', 'earth', 'air', 'code'],
          results: ['steam', 'lava', 'lightning', 'digital_flame'],
          successRate: 85
        },
        requirements: {
          level: 1,
          miningScore: 0,
          achievements: [],
          biomeAccess: ['digital']
        },
        rewards: {
          miningScoreBonus: 5,
          tokenReward: 1,
          experiencePoints: 10,
          specialUnlocks: []
        }
      },
      {
        id: 'water',
        name: 'Data Stream',
        type: 'basic',
        category: 'data',
        rarity: 'common',
        description: 'Flowing streams of data that carry information',
        icon: '💧',
        color: '#4444ff',
        properties: {
          miningPower: 8,
          discoveryRate: 15,
          optimizationBoost: 10,
          authorityMultiplier: 1.0,
          energyEfficiency: 90,
          combinationPotential: 85
        },
        combinations: {
          canCombine: true,
          combinations: ['fire', 'earth', 'air', 'algorithm'],
          results: ['steam', 'mud', 'rain', 'data_lake'],
          successRate: 80
        },
        requirements: {
          level: 1,
          miningScore: 0,
          achievements: [],
          biomeAccess: ['digital']
        },
        rewards: {
          miningScoreBonus: 3,
          tokenReward: 1,
          experiencePoints: 8,
          specialUnlocks: []
        }
      },
      {
        id: 'earth',
        name: 'Virtual Ground',
        type: 'basic',
        category: 'biome',
        rarity: 'common',
        description: 'The foundational ground of the digital realm',
        icon: '🌍',
        color: '#8B4513',
        properties: {
          miningPower: 12,
          discoveryRate: 8,
          optimizationBoost: 5,
          authorityMultiplier: 1.0,
          energyEfficiency: 75,
          combinationPotential: 80
        },
        combinations: {
          canCombine: true,
          combinations: ['fire', 'water', 'air', 'seed'],
          results: ['lava', 'mud', 'dust', 'garden'],
          successRate: 75
        },
        requirements: {
          level: 1,
          miningScore: 0,
          achievements: [],
          biomeAccess: ['digital']
        },
        rewards: {
          miningScoreBonus: 4,
          tokenReward: 1,
          experiencePoints: 12,
          specialUnlocks: []
        }
      },
      {
        id: 'air',
        name: 'Network Breeze',
        type: 'basic',
        category: 'energy',
        rarity: 'common',
        description: 'Invisible currents that carry signals across the network',
        icon: '💨',
        color: '#87CEEB',
        properties: {
          miningPower: 6,
          discoveryRate: 20,
          optimizationBoost: 15,
          authorityMultiplier: 1.0,
          energyEfficiency: 95,
          combinationPotential: 95
        },
        combinations: {
          canCombine: true,
          combinations: ['fire', 'water', 'earth', 'signal'],
          results: ['lightning', 'rain', 'dust', 'storm'],
          successRate: 90
        },
        requirements: {
          level: 1,
          miningScore: 0,
          achievements: [],
          biomeAccess: ['digital']
        },
        rewards: {
          miningScoreBonus: 2,
          tokenReward: 1,
          experiencePoints: 6,
          specialUnlocks: []
        }
      },
      {
        id: 'code',
        name: 'Source Code',
        type: 'basic',
        category: 'algorithm',
        rarity: 'uncommon',
        description: 'The fundamental building blocks of digital reality',
        icon: '💻',
        color: '#00ff00',
        properties: {
          miningPower: 15,
          discoveryRate: 25,
          optimizationBoost: 20,
          authorityMultiplier: 1.2,
          energyEfficiency: 70,
          combinationPotential: 85
        },
        combinations: {
          canCombine: true,
          combinations: ['fire', 'water', 'earth', 'air', 'data'],
          results: ['digital_flame', 'data_lake', 'garden', 'storm', 'algorithm'],
          successRate: 75
        },
        requirements: {
          level: 2,
          miningScore: 50,
          achievements: ['first_optimization'],
          biomeAccess: ['digital', 'knowledge']
        },
        rewards: {
          miningScoreBonus: 8,
          tokenReward: 3,
          experiencePoints: 20,
          specialUnlocks: ['code_editor']
        }
      }
    ];

    // Compound Elements (Created through combinations)
    const compoundElements: MetaverseElement[] = [
      {
        id: 'steam',
        name: 'Cloud Computing',
        type: 'compound',
        category: 'energy',
        rarity: 'uncommon',
        description: 'Powerful cloud energy that enhances processing capabilities',
        icon: '☁️',
        color: '#C0C0C0',
        properties: {
          miningPower: 25,
          discoveryRate: 30,
          optimizationBoost: 25,
          authorityMultiplier: 1.5,
          energyEfficiency: 85,
          combinationPotential: 80
        },
        combinations: {
          canCombine: true,
          combinations: ['fire', 'water', 'earth', 'air'],
          results: ['storm', 'rain', 'cloud_server', 'digital_weather'],
          successRate: 70
        },
        requirements: {
          level: 3,
          miningScore: 100,
          achievements: ['first_combination'],
          biomeAccess: ['digital', 'commercial']
        },
        rewards: {
          miningScoreBonus: 15,
          tokenReward: 5,
          experiencePoints: 30,
          specialUnlocks: ['cloud_mining']
        }
      },
      {
        id: 'algorithm',
        name: 'Optimization Algorithm',
        type: 'compound',
        category: 'algorithm',
        rarity: 'rare',
        description: 'A sophisticated algorithm that optimizes web performance',
        icon: '⚙️',
        color: '#FFD700',
        properties: {
          miningPower: 40,
          discoveryRate: 50,
          optimizationBoost: 60,
          authorityMultiplier: 2.0,
          energyEfficiency: 60,
          combinationPotential: 70
        },
        combinations: {
          canCombine: true,
          combinations: ['code', 'data', 'energy', 'catalyst'],
          results: ['ai_optimizer', 'quantum_algorithm', 'neural_network', 'blockchain_upgrade'],
          successRate: 60
        },
        requirements: {
          level: 5,
          miningScore: 250,
          achievements: ['algorithm_master', 'optimization_expert'],
          biomeAccess: ['digital', 'knowledge', 'professional']
        },
        rewards: {
          miningScoreBonus: 25,
          tokenReward: 10,
          experiencePoints: 50,
          specialUnlocks: ['algorithm_lab', 'performance_analyzer']
        }
      },
      {
        id: 'data_lake',
        name: 'Information Reservoir',
        type: 'compound',
        category: 'data',
        rarity: 'rare',
        description: 'A vast repository of structured data and patterns',
        icon: '🏞️',
        color: '#4169E1',
        properties: {
          miningPower: 35,
          discoveryRate: 45,
          optimizationBoost: 40,
          authorityMultiplier: 1.8,
          energyEfficiency: 80,
          combinationPotential: 75
        },
        combinations: {
          canCombine: true,
          combinations: ['water', 'earth', 'data', 'storage'],
          results: ['ocean', 'database', 'warehouse', 'archive'],
          successRate: 65
        },
        requirements: {
          level: 4,
          miningScore: 200,
          achievements: ['data_collector', 'pattern_finder'],
          biomeAccess: ['digital', 'knowledge', 'commercial']
        },
        rewards: {
          miningScoreBonus: 20,
          tokenReward: 8,
          experiencePoints: 40,
          specialUnlocks: ['data_visualizer', 'pattern_recognition']
        }
      }
    ];

    // Legendary Elements (High-tier combinations)
    const legendaryElements: MetaverseElement[] = [
      {
        id: 'ai_optimizer',
        name: 'AI Performance Optimizer',
        type: 'legendary',
        category: 'algorithm',
        rarity: 'legendary',
        description: 'An artificial intelligence that continuously optimizes web performance',
        icon: '🤖',
        color: '#FF69B4',
        properties: {
          miningPower: 80,
          discoveryRate: 90,
          optimizationBoost: 95,
          authorityMultiplier: 3.0,
          energyEfficiency: 50,
          combinationPotential: 60
        },
        combinations: {
          canCombine: true,
          combinations: ['algorithm', 'ai', 'energy', 'catalyst'],
          results: ['quantum_ai', 'neural_optimizer', 'blockchain_ai'],
          successRate: 40
        },
        requirements: {
          level: 10,
          miningScore: 1000,
          achievements: ['ai_researcher', 'optimization_master', 'legendary_creator'],
          biomeAccess: ['digital', 'knowledge', 'professional', 'production']
        },
        rewards: {
          miningScoreBonus: 50,
          tokenReward: 25,
          experiencePoints: 100,
          specialUnlocks: ['ai_lab', 'autonomous_mining', 'predictive_optimization']
        }
      },
      {
        id: 'quantum_algorithm',
        name: 'Quantum Optimization Engine',
        type: 'legendary',
        category: 'algorithm',
        rarity: 'legendary',
        description: 'A quantum-powered algorithm that transcends classical optimization',
        icon: '⚛️',
        color: '#9370DB',
        properties: {
          miningPower: 100,
          discoveryRate: 95,
          optimizationBoost: 100,
          authorityMultiplier: 4.0,
          energyEfficiency: 30,
          combinationPotential: 50
        },
        combinations: {
          canCombine: true,
          combinations: ['algorithm', 'quantum', 'energy', 'catalyst'],
          results: ['quantum_ai', 'quantum_blockchain', 'reality_optimizer'],
          successRate: 25
        },
        requirements: {
          level: 15,
          miningScore: 2000,
          achievements: ['quantum_researcher', 'reality_bender', 'legendary_creator'],
          biomeAccess: ['digital', 'knowledge', 'professional', 'production']
        },
        rewards: {
          miningScoreBonus: 75,
          tokenReward: 50,
          experiencePoints: 200,
          specialUnlocks: ['quantum_lab', 'reality_simulation', 'dimension_travel']
        }
      }
    ];

    // Mythical Elements (Ultimate tier)
    const mythicalElements: MetaverseElement[] = [
      {
        id: 'reality_optimizer',
        name: 'Reality Optimization Matrix',
        type: 'mythical',
        category: 'upgrade',
        rarity: 'mythical',
        description: 'The ultimate optimization tool that transcends digital reality itself',
        icon: '🌌',
        color: '#FF1493',
        properties: {
          miningPower: 200,
          discoveryRate: 100,
          optimizationBoost: 150,
          authorityMultiplier: 10.0,
          energyEfficiency: 20,
          combinationPotential: 30
        },
        combinations: {
          canCombine: false,
          combinations: [],
          results: [],
          successRate: 0
        },
        requirements: {
          level: 25,
          miningScore: 5000,
          achievements: ['reality_master', 'dimension_traveler', 'mythical_creator'],
          biomeAccess: ['digital', 'knowledge', 'professional', 'production', 'entertainment', 'social', 'community']
        },
        rewards: {
          miningScoreBonus: 150,
          tokenReward: 100,
          experiencePoints: 500,
          specialUnlocks: ['reality_editor', 'dimension_portal', 'universal_optimization']
        }
      }
    ];

    // Add all elements to the map
    [...basicElements, ...compoundElements, ...legendaryElements, ...mythicalElements]
      .forEach(element => this.elements.set(element.id, element));
  }

  /**
   * Initialize combination recipes
   */
  private initializeRecipes(): void {
    const recipes: CombinationRecipe[] = [
      {
        id: 'fire_water',
        name: 'Digital Steam Creation',
        description: 'Combine Digital Fire with Data Stream to create Cloud Computing',
        ingredients: ['fire', 'water'],
        result: 'steam',
        successRate: 85,
        failureResults: ['smoke', 'mist'],
        energyCost: 20,
        timeRequired: 30,
        category: 'fusion',
        rarity: 'common',
        unlocks: ['steam_mining', 'cloud_access']
      },
      {
        id: 'code_data',
        name: 'Algorithm Synthesis',
        description: 'Combine Source Code with Data Stream to create Optimization Algorithm',
        ingredients: ['code', 'water'],
        result: 'algorithm',
        successRate: 75,
        failureResults: ['bug', 'error'],
        energyCost: 50,
        timeRequired: 60,
        category: 'synthesis',
        rarity: 'uncommon',
        unlocks: ['algorithm_lab', 'performance_analyzer']
      },
      {
        id: 'algorithm_ai',
        name: 'AI Integration',
        description: 'Combine Optimization Algorithm with AI to create AI Performance Optimizer',
        ingredients: ['algorithm', 'ai'],
        result: 'ai_optimizer',
        successRate: 60,
        failureResults: ['broken_ai', 'dumb_algorithm'],
        energyCost: 100,
        timeRequired: 120,
        category: 'evolution',
        rarity: 'rare',
        unlocks: ['ai_lab', 'autonomous_mining']
      },
      {
        id: 'quantum_algorithm',
        name: 'Quantum Enhancement',
        description: 'Combine Algorithm with Quantum Energy to create Quantum Optimization Engine',
        ingredients: ['algorithm', 'quantum'],
        result: 'quantum_algorithm',
        successRate: 40,
        failureResults: ['quantum_error', 'reality_glitch'],
        energyCost: 200,
        timeRequired: 300,
        category: 'transformation',
        rarity: 'legendary',
        unlocks: ['quantum_lab', 'reality_simulation']
      },
      {
        id: 'reality_matrix',
        name: 'Reality Optimization',
        description: 'Combine Quantum Algorithm with Reality Catalyst to create Reality Optimization Matrix',
        ingredients: ['quantum_algorithm', 'reality_catalyst'],
        result: 'reality_optimizer',
        successRate: 25,
        failureResults: ['dimension_rift', 'reality_crash'],
        energyCost: 500,
        timeRequired: 600,
        category: 'transformation',
        rarity: 'mythical',
        unlocks: ['reality_editor', 'dimension_portal']
      }
    ];

    recipes.forEach(recipe => this.recipes.set(recipe.id, recipe));
  }

  /**
   * Initialize user inventory
   */
  private initializeUserInventory(): void {
    this.userInventory = {
      elements: new Map([
        ['fire', 3],
        ['water', 3],
        ['earth', 3],
        ['air', 3]
      ]),
      combinations: [],
      achievements: ['first_login'],
      miningScore: 0,
      level: 1,
      experience: 0,
      energy: 100,
      maxEnergy: 100,
      biomeAccess: ['digital'],
      specialUnlocks: []
    };
  }

  /**
   * Initialize mining score system
   */
  private initializeMiningScoreSystem(): void {
    this.miningScoreSystem = {
      baseScore: 0,
      multipliers: {
        elementBonuses: 1.0,
        combinationBonuses: 1.0,
        achievementBonuses: 1.0,
        biomeBonuses: 1.0,
        streakBonuses: 1.0
      },
      totalScore: 0,
      rank: 'Novice',
      nextRankThreshold: 100
    };
  }

  /**
   * Attempt to combine elements
   */
  public async attemptCombination(recipeId: string): Promise<{
    success: boolean;
    result?: string;
    failureResult?: string;
    energyUsed: number;
    experienceGained: number;
    miningScoreBonus: number;
  }> {
    const recipe = this.recipes.get(recipeId);
    if (!recipe) {
      throw new Error(`Recipe ${recipeId} not found`);
    }

    // Check if user has required elements
    for (const ingredient of recipe.ingredients) {
      if (!this.userInventory.elements.has(ingredient) || this.userInventory.elements.get(ingredient)! <= 0) {
        throw new Error(`Missing required element: ${ingredient}`);
      }
    }

    // Check energy requirements
    if (this.userInventory.energy < recipe.energyCost) {
      throw new Error('Insufficient energy');
    }

    // Check level requirements
    const resultElement = this.elements.get(recipe.result);
    if (resultElement && this.userInventory.level < resultElement.requirements.level) {
      throw new Error(`Level ${resultElement.requirements.level} required`);
    }

    // Consume energy
    this.userInventory.energy -= recipe.energyCost;

    // Consume ingredients
    for (const ingredient of recipe.ingredients) {
      const currentAmount = this.userInventory.elements.get(ingredient)!;
      this.userInventory.elements.set(ingredient, currentAmount - 1);
    }

    // Calculate success probability
    const successProbability = this.calculateSuccessProbability(recipe);
    const success = Math.random() < successProbability;

    let result: string;
    let experienceGained: number;
    let miningScoreBonus: number;

    if (success) {
      result = recipe.result;
      
      // Add result to inventory
      const currentAmount = this.userInventory.elements.get(result) || 0;
      this.userInventory.elements.set(result, currentAmount + 1);

      // Calculate rewards
      const resultElement = this.elements.get(result)!;
      experienceGained = resultElement.rewards.experiencePoints;
      miningScoreBonus = resultElement.rewards.miningScoreBonus;

      // Add experience
      this.userInventory.experience += experienceGained;
      this.userInventory.miningScore += miningScoreBonus;

      // Unlock special features
      this.userInventory.specialUnlocks.push(...resultElement.rewards.specialUnlocks);

      // Check for level up
      this.checkLevelUp();

      // Record successful combination
      this.combinationHistory.push({
        timestamp: Date.now(),
        recipe: recipeId,
        success: true,
        result: result
      });

    } else {
      // Failed combination - get failure result
      const failureResult = recipe.failureResults[Math.floor(Math.random() * recipe.failureResults.length)];
      result = failureResult;

      // Add failure result to inventory (if it exists as an element)
      if (this.elements.has(failureResult)) {
        const currentAmount = this.userInventory.elements.get(failureResult) || 0;
        this.userInventory.elements.set(failureResult, currentAmount + 1);
      }

      experienceGained = Math.floor(recipe.energyCost * 0.1); // Small XP for attempt
      miningScoreBonus = 0;

      // Add small experience for attempt
      this.userInventory.experience += experienceGained;

      // Record failed combination
      this.combinationHistory.push({
        timestamp: Date.now(),
        recipe: recipeId,
        success: false,
        result: failureResult
      });
    }

    // Update mining score system
    this.updateMiningScoreSystem();

    return {
      success,
      result: success ? result : undefined,
      failureResult: success ? undefined : result,
      energyUsed: recipe.energyCost,
      experienceGained,
      miningScoreBonus
    };
  }

  /**
   * Calculate success probability for a combination
   */
  private calculateSuccessProbability(recipe: CombinationRecipe): number {
    let baseProbability = recipe.successRate;

    // Apply element bonuses
    const elementBonuses = Array.from(this.userInventory.elements.entries())
      .map(([elementId, quantity]) => {
        const element = this.elements.get(elementId);
        return element ? element.properties.combinationPotential * quantity * 0.01 : 0;
      })
      .reduce((sum, bonus) => sum + bonus, 0);

    // Apply level bonus
    const levelBonus = this.userInventory.level * 0.5;

    // Apply achievement bonus
    const achievementBonus = this.userInventory.achievements.length * 0.2;

    // Apply mining score bonus
    const miningScoreBonus = Math.min(this.userInventory.miningScore * 0.001, 10);

    const totalBonus = elementBonuses + levelBonus + achievementBonus + miningScoreBonus;
    return Math.min(baseProbability + totalBonus, 95); // Cap at 95%
  }

  /**
   * Check for level up
   */
  private checkLevelUp(): void {
    const experienceNeeded = this.userInventory.level * 100;
    if (this.userInventory.experience >= experienceNeeded) {
      this.userInventory.level++;
      this.userInventory.experience -= experienceNeeded;
      this.userInventory.maxEnergy += 10; // Increase max energy
      this.userInventory.energy = this.userInventory.maxEnergy; // Restore energy

      // Unlock new biomes based on level
      this.unlockBiomesForLevel();

      // Add level up achievement
      this.userInventory.achievements.push(`level_${this.userInventory.level}`);
    }
  }

  /**
   * Unlock biomes based on level
   */
  private unlockBiomesForLevel(): void {
    const biomeUnlocks = {
      3: ['commercial'],
      5: ['knowledge'],
      7: ['professional'],
      10: ['entertainment'],
      12: ['social'],
      15: ['community'],
      20: ['production']
    };

    const biomesToUnlock = biomeUnlocks[this.userInventory.level as keyof typeof biomeUnlocks];
    if (biomesToUnlock) {
      biomesToUnlock.forEach(biome => {
        if (!this.userInventory.biomeAccess.includes(biome)) {
          this.userInventory.biomeAccess.push(biome);
        }
      });
    }
  }

  /**
   * Update mining score system
   */
  private updateMiningScoreSystem(): void {
    // Calculate element bonuses
    const elementBonuses = Array.from(this.userInventory.elements.entries())
      .map(([elementId, quantity]) => {
        const element = this.elements.get(elementId);
        return element ? element.properties.miningPower * quantity : 0;
      })
      .reduce((sum, bonus) => sum + bonus, 0);

    // Calculate combination bonuses
    const successfulCombinations = this.combinationHistory.filter(c => c.success).length;
    const combinationBonuses = successfulCombinations * 5;

    // Calculate achievement bonuses
    const achievementBonuses = this.userInventory.achievements.length * 10;

    // Calculate biome bonuses
    const biomeBonuses = this.userInventory.biomeAccess.length * 15;

    // Calculate streak bonuses (simplified)
    const streakBonuses = this.calculateStreakBonus();

    this.miningScoreSystem.multipliers.elementBonuses = 1 + (elementBonuses * 0.01);
    this.miningScoreSystem.multipliers.combinationBonuses = 1 + (combinationBonuses * 0.01);
    this.miningScoreSystem.multipliers.achievementBonuses = 1 + (achievementBonuses * 0.01);
    this.miningScoreSystem.multipliers.biomeBonuses = 1 + (biomeBonuses * 0.01);
    this.miningScoreSystem.multipliers.streakBonuses = 1 + (streakBonuses * 0.01);

    this.miningScoreSystem.baseScore = this.userInventory.miningScore;
    this.miningScoreSystem.totalScore = this.userInventory.miningScore * 
      Object.values(this.miningScoreSystem.multipliers).reduce((product, multiplier) => product * multiplier, 1);

    // Update rank
    this.updateRank();
  }

  /**
   * Calculate streak bonus
   */
  private calculateStreakBonus(): number {
    // Simplified streak calculation - in real implementation, track daily activity
    const recentCombinations = this.combinationHistory.filter(
      c => Date.now() - c.timestamp < 24 * 60 * 60 * 1000 // Last 24 hours
    );
    return Math.min(recentCombinations.length * 2, 20); // Max 20 bonus
  }

  /**
   * Update user rank
   */
  private updateRank(): void {
    const score = this.miningScoreSystem.totalScore;
    const ranks = [
      { name: 'Novice', threshold: 0 },
      { name: 'Apprentice', threshold: 100 },
      { name: 'Explorer', threshold: 300 },
      { name: 'Expert', threshold: 600 },
      { name: 'Master', threshold: 1000 },
      { name: 'Grandmaster', threshold: 2000 },
      { name: 'Legend', threshold: 4000 },
      { name: 'Mythical', threshold: 8000 },
      { name: 'Reality Bender', threshold: 15000 }
    ];

    let currentRank = ranks[0];
    let nextRank = ranks[1];

    for (let i = 0; i < ranks.length - 1; i++) {
      if (score >= ranks[i].threshold && score < ranks[i + 1].threshold) {
        currentRank = ranks[i];
        nextRank = ranks[i + 1];
        break;
      }
    }

    this.miningScoreSystem.rank = currentRank.name;
    this.miningScoreSystem.nextRankThreshold = nextRank.threshold;
  }

  /**
   * Get user inventory
   */
  public getUserInventory(): UserInventory {
    return { ...this.userInventory };
  }

  /**
   * Get mining score system
   */
  public getMiningScoreSystem(): MiningScoreSystem {
    return { ...this.miningScoreSystem };
  }

  /**
   * Get all elements
   */
  public getAllElements(): MetaverseElement[] {
    return Array.from(this.elements.values());
  }

  /**
   * Get all recipes
   */
  public getAllRecipes(): CombinationRecipe[] {
    return Array.from(this.recipes.values());
  }

  /**
   * Get available recipes for user
   */
  public getAvailableRecipes(): CombinationRecipe[] {
    return this.getAllRecipes().filter(recipe => {
      // Check if user has all ingredients
      return recipe.ingredients.every(ingredient => 
        this.userInventory.elements.has(ingredient) && 
        this.userInventory.elements.get(ingredient)! > 0
      );
    });
  }

  /**
   * Get combination history
   */
  public getCombinationHistory(): Array<{timestamp: number, recipe: string, success: boolean, result: string}> {
    return [...this.combinationHistory];
  }

  /**
   * Add element to inventory (for testing or rewards)
   */
  public addElement(elementId: string, quantity: number = 1): void {
    const currentAmount = this.userInventory.elements.get(elementId) || 0;
    this.userInventory.elements.set(elementId, currentAmount + quantity);
  }

  /**
   * Restore energy
   */
  public restoreEnergy(amount: number): void {
    this.userInventory.energy = Math.min(this.userInventory.energy + amount, this.userInventory.maxEnergy);
  }

  /**
   * Get element by ID
   */
  public getElement(elementId: string): MetaverseElement | undefined {
    return this.elements.get(elementId);
  }

  /**
   * Get recipe by ID
   */
  public getRecipe(recipeId: string): CombinationRecipe | undefined {
    return this.recipes.get(recipeId);
  }
}

// Export singleton instance
export const metaverseAlchemyEngine = new MetaverseAlchemyEngine();