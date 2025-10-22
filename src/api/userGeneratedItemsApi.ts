/**
 * User Generated Items API - RESTful endpoints for creating custom metaverse items
 * Handles item creation, templates, validation, and minting workflow
 */

import { Request, Response } from 'express';
import { nftAnimationGenerator } from '../core/NFTAnimationGenerator';

export interface ItemTemplate {
  id: string;
  name: string;
  category: 'avatar' | 'environment' | 'tool' | 'pet' | 'building' | 'vehicle' | 'art' | 'special';
  baseAttributes: Record<string, any>;
  customizableFields: string[];
  requiredFields: string[];
}

export class UserGeneratedItemsAPI {
  private templates: Map<string, ItemTemplate> = new Map();

  constructor() {
    this.initializeTemplates();
  }

  /**
   * Get all available item templates
   * GET /api/user-items/templates
   */
  async getTemplates(req: Request, res: Response): Promise<void> {
    try {
      const { category } = req.query;
      
      let templates = Array.from(this.templates.values());
      
      // Filter by category if specified
      if (category) {
        templates = templates.filter(template => template.category === category);
      }
      
      res.json({
        success: true,
        data: {
          templates,
          total: templates.length
        }
      });

    } catch (error) {
      console.error('Error fetching templates:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get a specific template by ID
   * GET /api/user-items/templates/:id
   */
  async getTemplate(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      const template = this.templates.get(id);
      
      if (!template) {
        res.status(404).json({
          error: 'Template not found',
          message: `No template found with ID: ${id}`
        });
        return;
      }
      
      res.json({
        success: true,
        data: template
      });

    } catch (error) {
      console.error('Error fetching template:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Validate item data
   * POST /api/user-items/validate
   */
  async validateItem(req: Request, res: Response): Promise<void> {
    try {
      const { templateId, itemData } = req.body;

      if (!templateId || !itemData) {
        res.status(400).json({
          error: 'Invalid request',
          message: 'Template ID and item data are required'
        });
        return;
      }

      const template = this.templates.get(templateId);
      
      if (!template) {
        res.status(404).json({
          error: 'Template not found',
          message: `No template found with ID: ${templateId}`
        });
        return;
      }

      // Validate required fields
      const validation = this.validateItemData(template, itemData);

      res.json({
        success: true,
        data: {
          valid: validation.valid,
          errors: validation.errors,
          warnings: validation.warnings
        }
      });

    } catch (error) {
      console.error('Error validating item:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Preview item animation
   * POST /api/user-items/preview
   */
  async previewItem(req: Request, res: Response): Promise<void> {
    try {
      const { templateId, itemData } = req.body;

      if (!templateId || !itemData) {
        res.status(400).json({
          error: 'Invalid request',
          message: 'Template ID and item data are required'
        });
        return;
      }

      const template = this.templates.get(templateId);
      
      if (!template) {
        res.status(404).json({
          error: 'Template not found',
          message: `No template found with ID: ${templateId}`
        });
        return;
      }

      // Generate preview animation
      const animation = nftAnimationGenerator.generateAnimation(
        itemData.name || 'Preview Item',
        {
          rarity: 'uncommon', // User items are always uncommon
          category: template.category,
          colors: itemData.colors || [],
          patterns: itemData.patterns || [],
          effects: itemData.effects || []
        }
      );

      res.json({
        success: true,
        data: {
          animation: animation.dataURI,
          metadata: animation.metadata
        }
      });

    } catch (error) {
      console.error('Error generating preview:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Create a new user-generated item
   * POST /api/user-items/create
   */
  async createItem(req: Request, res: Response): Promise<void> {
    try {
      const { templateId, itemData, userAddress } = req.body;

      if (!templateId || !itemData || !userAddress) {
        res.status(400).json({
          error: 'Invalid request',
          message: 'Template ID, item data, and user address are required'
        });
        return;
      }

      const template = this.templates.get(templateId);
      
      if (!template) {
        res.status(404).json({
          error: 'Template not found',
          message: `No template found with ID: ${templateId}`
        });
        return;
      }

      // Validate item data
      const validation = this.validateItemData(template, itemData);
      
      if (!validation.valid) {
        res.status(400).json({
          error: 'Validation failed',
          message: 'Item data validation failed',
          errors: validation.errors
        });
        return;
      }

      // Generate animation
      const animation = nftAnimationGenerator.generateAnimation(
        itemData.name,
        {
          rarity: 'uncommon',
          category: template.category,
          colors: itemData.colors || [],
          patterns: itemData.patterns || [],
          effects: itemData.effects || []
        }
      );

      // Generate metadata
      const metadata = nftAnimationGenerator.generateMetadata(
        itemData.name,
        itemData.description || '',
        {
          rarity: 'uncommon',
          category: template.category,
          colors: [],
          patterns: [],
          effects: []
        },
        animation.dataURI,
        {
          ...template.baseAttributes,
          ...itemData.attributes,
          creator: userAddress,
          userGenerated: true
        }
      );

      // In a real implementation, this would:
      // 1. Upload animation to IPFS
      // 2. Upload metadata to IPFS
      // 3. Call smart contract to mint NFT
      // 4. Store item data in database

      const itemId = `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      res.json({
        success: true,
        data: {
          itemId,
          animation: animation.dataURI,
          metadata: JSON.parse(metadata),
          message: 'Item created successfully'
        }
      });

    } catch (error) {
      console.error('Error creating item:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get user's created items
   * GET /api/user-items/user/:address
   */
  async getUserItems(req: Request, res: Response): Promise<void> {
    try {
      const { address } = req.params;
      const { limit = 50, offset = 0 } = req.query;

      // In a real implementation, this would query the database
      // For now, return mock data
      const userItems = [
        {
          itemId: 'item_123',
          name: 'Custom Avatar Helmet',
          category: 'avatar',
          createdAt: Date.now() - 86400000,
          mintCount: 5
        },
        {
          itemId: 'item_456',
          name: 'Neon Building',
          category: 'building',
          createdAt: Date.now() - 172800000,
          mintCount: 12
        }
      ];

      res.json({
        success: true,
        data: {
          items: userItems,
          total: userItems.length,
          limit: Number(limit),
          offset: Number(offset)
        }
      });

    } catch (error) {
      console.error('Error fetching user items:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get item statistics
   * GET /api/user-items/stats/:itemId
   */
  async getItemStats(req: Request, res: Response): Promise<void> {
    try {
      const { itemId } = req.params;

      // In a real implementation, this would query the blockchain and database
      const stats = {
        itemId,
        totalMinted: 25,
        uniqueOwners: 18,
        totalTrades: 8,
        averagePrice: '0.015 ETH',
        highestPrice: '0.025 ETH',
        lowestPrice: '0.010 ETH',
        views: 342,
        likes: 67
      };

      res.json({
        success: true,
        data: stats
      });

    } catch (error) {
      console.error('Error fetching item stats:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Validate item data against template
   */
  private validateItemData(
    template: ItemTemplate,
    itemData: any
  ): { valid: boolean; errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check required fields
    template.requiredFields.forEach(field => {
      if (!itemData[field]) {
        errors.push(`Missing required field: ${field}`);
      }
    });

    // Check field types
    if (itemData.name && typeof itemData.name !== 'string') {
      errors.push('Name must be a string');
    }

    if (itemData.description && typeof itemData.description !== 'string') {
      errors.push('Description must be a string');
    }

    // Check name length
    if (itemData.name && itemData.name.length > 50) {
      errors.push('Name must be 50 characters or less');
    }

    if (itemData.name && itemData.name.length < 3) {
      errors.push('Name must be at least 3 characters');
    }

    // Check description length
    if (itemData.description && itemData.description.length > 500) {
      errors.push('Description must be 500 characters or less');
    }

    // Check colors
    if (itemData.colors) {
      if (!Array.isArray(itemData.colors)) {
        errors.push('Colors must be an array');
      } else if (itemData.colors.length > 5) {
        warnings.push('Using more than 5 colors may reduce visual clarity');
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Initialize item templates
   */
  private initializeTemplates(): void {
    // Avatar template
    this.templates.set('avatar-basic', {
      id: 'avatar-basic',
      name: 'Basic Avatar Item',
      category: 'avatar',
      baseAttributes: {
        miningPowerBonus: 10,
        wearable: true
      },
      customizableFields: ['name', 'description', 'colors', 'patterns'],
      requiredFields: ['name']
    });

    // Tool template
    this.templates.set('tool-basic', {
      id: 'tool-basic',
      name: 'Basic Mining Tool',
      category: 'tool',
      baseAttributes: {
        miningPowerBonus: 15,
        durability: 100
      },
      customizableFields: ['name', 'description', 'colors', 'effects'],
      requiredFields: ['name']
    });

    // Pet template
    this.templates.set('pet-basic', {
      id: 'pet-basic',
      name: 'Basic Companion Pet',
      category: 'pet',
      baseAttributes: {
        miningPowerBonus: 20,
        animated: true,
        interactive: true
      },
      customizableFields: ['name', 'description', 'colors', 'patterns', 'effects'],
      requiredFields: ['name']
    });

    // Building template
    this.templates.set('building-basic', {
      id: 'building-basic',
      name: 'Basic Building',
      category: 'building',
      baseAttributes: {
        storageCapacity: 1000,
        dimensions: { width: 10, height: 10, depth: 10 }
      },
      customizableFields: ['name', 'description', 'colors', 'patterns'],
      requiredFields: ['name']
    });

    // Art template
    this.templates.set('art-basic', {
      id: 'art-basic',
      name: 'Basic Art Piece',
      category: 'art',
      baseAttributes: {
        decorative: true,
        animated: true
      },
      customizableFields: ['name', 'description', 'colors', 'patterns', 'effects'],
      requiredFields: ['name', 'description']
    });

    console.log(`✅ Initialized ${this.templates.size} item templates`);
  }
}

// Export singleton instance
export const userGeneratedItemsAPI = new UserGeneratedItemsAPI();
