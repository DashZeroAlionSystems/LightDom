/**
 * Metaverse Alchemy API - RESTful endpoints for the Little Alchemy-inspired combination system
 * Handles element combinations, inventory management, and mining score enhancement
 */

import { Request, Response } from 'express';
import { metaverseAlchemyEngine } from '../core/MetaverseAlchemyEngine';

export class MetaverseAlchemyAPI {
  
  /**
   * Get all alchemy data
   * GET /api/metaverse/alchemy-data
   */
  async getAlchemyData(req: Request, res: Response): Promise<void> {
    try {
      const elements = metaverseAlchemyEngine.getAllElements();
      const recipes = metaverseAlchemyEngine.getAllRecipes();
      const userInventory = metaverseAlchemyEngine.getUserInventory();
      const miningScoreSystem = metaverseAlchemyEngine.getMiningScoreSystem();

      res.json({
        success: true,
        data: {
          elements,
          recipes,
          userInventory,
          miningScoreSystem
        }
      });

    } catch (error) {
      console.error('Error fetching alchemy data:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Attempt element combination
   * POST /api/metaverse/attempt-combination
   */
  async attemptCombination(req: Request, res: Response): Promise<void> {
    try {
      const { recipeId } = req.body;

      if (!recipeId) {
        res.status(400).json({
          error: 'Invalid request',
          message: 'Recipe ID is required'
        });
        return;
      }

      const result = await metaverseAlchemyEngine.attemptCombination(recipeId);

      res.json({
        success: true,
        data: result
      });

    } catch (error) {
      console.error('Error attempting combination:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get user inventory
   * GET /api/metaverse/inventory
   */
  async getUserInventory(req: Request, res: Response): Promise<void> {
    try {
      const inventory = metaverseAlchemyEngine.getUserInventory();

      res.json({
        success: true,
        data: inventory
      });

    } catch (error) {
      console.error('Error fetching user inventory:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get mining score system
   * GET /api/metaverse/mining-score
   */
  async getMiningScoreSystem(req: Request, res: Response): Promise<void> {
    try {
      const miningScoreSystem = metaverseAlchemyEngine.getMiningScoreSystem();

      res.json({
        success: true,
        data: miningScoreSystem
      });

    } catch (error) {
      console.error('Error fetching mining score system:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get all elements
   * GET /api/metaverse/elements
   */
  async getAllElements(req: Request, res: Response): Promise<void> {
    try {
      const { rarity, category, type, limit = 50, offset = 0 } = req.query;
      
      let elements = metaverseAlchemyEngine.getAllElements();
      
      // Filter by rarity if specified
      if (rarity) {
        elements = elements.filter(element => element.rarity === rarity);
      }
      
      // Filter by category if specified
      if (category) {
        elements = elements.filter(element => element.category === category);
      }
      
      // Filter by type if specified
      if (type) {
        elements = elements.filter(element => element.type === type);
      }
      
      // Sort by rarity and mining power
      elements.sort((a, b) => {
        const rarityOrder = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythical'];
        const rarityDiff = rarityOrder.indexOf(a.rarity) - rarityOrder.indexOf(b.rarity);
        if (rarityDiff !== 0) return rarityDiff;
        return b.properties.miningPower - a.properties.miningPower;
      });
      
      // Apply pagination
      const start = Number(offset);
      const end = start + Number(limit);
      const paginatedElements = elements.slice(start, end);
      
      res.json({
        success: true,
        data: {
          elements: paginatedElements,
          total: elements.length,
          limit: Number(limit),
          offset: Number(offset)
        }
      });

    } catch (error) {
      console.error('Error fetching elements:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get all recipes
   * GET /api/metaverse/recipes
   */
  async getAllRecipes(req: Request, res: Response): Promise<void> {
    try {
      const { rarity, category, available, limit = 50, offset = 0 } = req.query;
      
      let recipes = metaverseAlchemyEngine.getAllRecipes();
      
      // Filter by rarity if specified
      if (rarity) {
        recipes = recipes.filter(recipe => recipe.rarity === rarity);
      }
      
      // Filter by category if specified
      if (category) {
        recipes = recipes.filter(recipe => recipe.category === category);
      }
      
      // Filter by availability if specified
      if (available === 'true') {
        const availableRecipes = metaverseAlchemyEngine.getAvailableRecipes();
        recipes = recipes.filter(recipe => availableRecipes.includes(recipe));
      }
      
      // Sort by rarity and success rate
      recipes.sort((a, b) => {
        const rarityOrder = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythical'];
        const rarityDiff = rarityOrder.indexOf(a.rarity) - rarityOrder.indexOf(b.rarity);
        if (rarityDiff !== 0) return rarityDiff;
        return b.successRate - a.successRate;
      });
      
      // Apply pagination
      const start = Number(offset);
      const end = start + Number(limit);
      const paginatedRecipes = recipes.slice(start, end);
      
      res.json({
        success: true,
        data: {
          recipes: paginatedRecipes,
          total: recipes.length,
          limit: Number(limit),
          offset: Number(offset)
        }
      });

    } catch (error) {
      console.error('Error fetching recipes:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get available recipes for user
   * GET /api/metaverse/available-recipes
   */
  async getAvailableRecipes(req: Request, res: Response): Promise<void> {
    try {
      const availableRecipes = metaverseAlchemyEngine.getAvailableRecipes();
      
      res.json({
        success: true,
        data: {
          recipes: availableRecipes,
          total: availableRecipes.length
        }
      });

    } catch (error) {
      console.error('Error fetching available recipes:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get element by ID
   * GET /api/metaverse/element/:id
   */
  async getElement(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      const element = metaverseAlchemyEngine.getElement(id);
      
      if (!element) {
        res.status(404).json({
          error: 'Element not found',
          message: `No element found with ID: ${id}`
        });
        return;
      }
      
      res.json({
        success: true,
        data: element
      });

    } catch (error) {
      console.error('Error fetching element:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get recipe by ID
   * GET /api/metaverse/recipe/:id
   */
  async getRecipe(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      const recipe = metaverseAlchemyEngine.getRecipe(id);
      
      if (!recipe) {
        res.status(404).json({
          error: 'Recipe not found',
          message: `No recipe found with ID: ${id}`
        });
        return;
      }
      
      res.json({
        success: true,
        data: recipe
      });

    } catch (error) {
      console.error('Error fetching recipe:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get combination history
   * GET /api/metaverse/combination-history
   */
  async getCombinationHistory(req: Request, res: Response): Promise<void> {
    try {
      const { limit = 50, offset = 0 } = req.query;
      
      const history = metaverseAlchemyEngine.getCombinationHistory();
      
      // Sort by timestamp (newest first)
      history.sort((a, b) => b.timestamp - a.timestamp);
      
      // Apply pagination
      const start = Number(offset);
      const end = start + Number(limit);
      const paginatedHistory = history.slice(start, end);
      
      res.json({
        success: true,
        data: {
          history: paginatedHistory,
          total: history.length,
          limit: Number(limit),
          offset: Number(offset)
        }
      });

    } catch (error) {
      console.error('Error fetching combination history:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Add element to inventory (for testing or rewards)
   * POST /api/metaverse/add-element
   */
  async addElement(req: Request, res: Response): Promise<void> {
    try {
      const { elementId, quantity = 1 } = req.body;

      if (!elementId) {
        res.status(400).json({
          error: 'Invalid request',
          message: 'Element ID is required'
        });
        return;
      }

      const element = metaverseAlchemyEngine.getElement(elementId);
      if (!element) {
        res.status(404).json({
          error: 'Element not found',
          message: `No element found with ID: ${elementId}`
        });
        return;
      }

      metaverseAlchemyEngine.addElement(elementId, quantity);

      res.json({
        success: true,
        message: `Added ${quantity} ${element.name} to inventory`
      });

    } catch (error) {
      console.error('Error adding element:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Restore energy
   * POST /api/metaverse/restore-energy
   */
  async restoreEnergy(req: Request, res: Response): Promise<void> {
    try {
      const { amount = 50 } = req.body;

      metaverseAlchemyEngine.restoreEnergy(amount);

      res.json({
        success: true,
        message: `Restored ${amount} energy`
      });

    } catch (error) {
      console.error('Error restoring energy:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get element combinations for a specific element
   * GET /api/metaverse/element/:id/combinations
   */
  async getElementCombinations(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      const element = metaverseAlchemyEngine.getElement(id);
      
      if (!element) {
        res.status(404).json({
          error: 'Element not found',
          message: `No element found with ID: ${id}`
        });
        return;
      }

      // Find all recipes that use this element
      const allRecipes = metaverseAlchemyEngine.getAllRecipes();
      const combinations = allRecipes.filter(recipe => 
        recipe.ingredients.includes(id)
      );

      res.json({
        success: true,
        data: {
          element,
          combinations
        }
      });

    } catch (error) {
      console.error('Error fetching element combinations:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get mining score leaderboard
   * GET /api/metaverse/leaderboard
   */
  async getLeaderboard(req: Request, res: Response): Promise<void> {
    try {
      const { type = 'mining_score', limit = 10 } = req.query;
      
      // Mock leaderboard data - in real implementation, this would come from database
      const leaderboard = [
        { rank: 1, username: 'RealityBender', score: 15420, level: 25, tier: 'Reality Bender' },
        { rank: 2, username: 'QuantumMaster', score: 12350, level: 22, tier: 'Mythical' },
        { rank: 3, username: 'AlchemyLegend', score: 9870, level: 20, tier: 'Legend' },
        { rank: 4, username: 'ElementFusion', score: 8450, level: 18, tier: 'Legend' },
        { rank: 5, username: 'MiningExpert', score: 7230, level: 16, tier: 'Grandmaster' },
        { rank: 6, username: 'CodeOptimizer', score: 6540, level: 15, tier: 'Grandmaster' },
        { rank: 7, username: 'DataMiner', score: 5890, level: 14, tier: 'Master' },
        { rank: 8, username: 'AlgorithmCrafter', score: 5230, level: 13, tier: 'Master' },
        { rank: 9, username: 'BiomeExplorer', score: 4670, level: 12, tier: 'Expert' },
        { rank: 10, username: 'ElementSeeker', score: 4120, level: 11, tier: 'Expert' }
      ];
      
      res.json({
        success: true,
        data: {
          leaderboard: leaderboard.slice(0, Number(limit)),
          total: leaderboard.length,
          type
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
   * Get user statistics
   * GET /api/metaverse/user-stats
   */
  async getUserStats(req: Request, res: Response): Promise<void> {
    try {
      const inventory = metaverseAlchemyEngine.getUserInventory();
      const miningScoreSystem = metaverseAlchemyEngine.getMiningScoreSystem();
      const history = metaverseAlchemyEngine.getCombinationHistory();
      
      const stats = {
        level: inventory.level,
        experience: inventory.experience,
        miningScore: inventory.miningScore,
        rank: miningScoreSystem.rank,
        totalElements: Array.from(inventory.elements.values()).reduce((sum, qty) => sum + qty, 0),
        uniqueElements: inventory.elements.size,
        totalCombinations: history.length,
        successfulCombinations: history.filter(c => c.success).length,
        successRate: history.length > 0 ? (history.filter(c => c.success).length / history.length) * 100 : 0,
        achievements: inventory.achievements.length,
        biomeAccess: inventory.biomeAccess.length,
        specialUnlocks: inventory.specialUnlocks.length,
        energy: inventory.energy,
        maxEnergy: inventory.maxEnergy
      };
      
      res.json({
        success: true,
        data: stats
      });

    } catch (error) {
      console.error('Error fetching user stats:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}

// Export singleton instance
export const metaverseAlchemyAPI = new MetaverseAlchemyAPI();