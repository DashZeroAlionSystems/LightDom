/**
 * Blockchain Model Storage API
 * RESTful endpoints for secure model training data storage
 * Accessible only to admin addresses
 */

import { Request, Response } from 'express';
import { blockchainModelStorage } from '../core/BlockchainModelStorage';
import { ethers } from 'ethers';

export class BlockchainModelStorageAPI {
  /**
   * Store model training data
   * POST /api/blockchain-models/store
   */
  async storeModelData(req: Request, res: Response): Promise<void> {
    try {
      const { modelId, modelName, version, metadata, schema, connections, adminAddress } = req.body;

      // Validate required fields
      if (
        !modelId ||
        !modelName ||
        !version ||
        !metadata ||
        !schema ||
        !connections ||
        !adminAddress
      ) {
        res.status(400).json({
          error: 'Invalid request data',
          message:
            'modelId, modelName, version, metadata, schema, connections, and adminAddress are required',
        });
        return;
      }

      // Verify admin access
      const isAdmin = await blockchainModelStorage.isAdmin(adminAddress);
      if (!isAdmin) {
        res.status(403).json({
          error: 'Access denied',
          message: 'Admin privileges required',
        });
        return;
      }

      // Store model data
      const modelData = await blockchainModelStorage.storeModelData(
        {
          modelId,
          modelName,
          version,
          dataHash: '', // Will be set by the storage system
          metadata,
          schema,
          connections,
          access: {
            adminAddresses: [adminAddress],
            readPermissions: [],
            writePermissions: [],
            encrypted: false,
          },
        },
        adminAddress
      );

      res.status(201).json({
        success: true,
        data: { modelData },
        message: 'Model training data stored successfully on blockchain',
      });
    } catch (error) {
      console.error('Error storing model data:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Get model training data
   * GET /api/blockchain-models/:modelId
   */
  async getModelData(req: Request, res: Response): Promise<void> {
    try {
      const { modelId } = req.params;
      const { adminAddress } = req.query;

      if (!adminAddress) {
        res.status(400).json({
          error: 'Invalid request',
          message: 'adminAddress query parameter is required',
        });
        return;
      }

      // Verify admin access
      const isAdmin = await blockchainModelStorage.isAdmin(adminAddress as string);
      if (!isAdmin) {
        res.status(403).json({
          error: 'Access denied',
          message: 'Admin privileges required',
        });
        return;
      }

      // Get model data
      const modelData = await blockchainModelStorage.getModelData(modelId, adminAddress as string);

      if (!modelData) {
        res.status(404).json({
          error: 'Model not found',
          message: `No model found with ID: ${modelId}`,
        });
        return;
      }

      res.json({
        success: true,
        data: { modelData },
      });
    } catch (error) {
      console.error('Error getting model data:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Update model training data
   * PUT /api/blockchain-models/:modelId
   */
  async updateModelData(req: Request, res: Response): Promise<void> {
    try {
      const { modelId } = req.params;
      const { updates, adminAddress } = req.body;

      if (!adminAddress) {
        res.status(400).json({
          error: 'Invalid request',
          message: 'adminAddress is required',
        });
        return;
      }

      // Verify admin access
      const isAdmin = await blockchainModelStorage.isAdmin(adminAddress);
      if (!isAdmin) {
        res.status(403).json({
          error: 'Access denied',
          message: 'Admin privileges required',
        });
        return;
      }

      // Update model data
      const success = await blockchainModelStorage.updateModelData(modelId, updates, adminAddress);

      if (!success) {
        res.status(400).json({
          error: 'Update failed',
          message: 'Unable to update model data',
        });
        return;
      }

      res.json({
        success: true,
        message: 'Model training data updated successfully',
      });
    } catch (error) {
      console.error('Error updating model data:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Delete model training data
   * DELETE /api/blockchain-models/:modelId
   */
  async deleteModelData(req: Request, res: Response): Promise<void> {
    try {
      const { modelId } = req.params;
      const { adminAddress } = req.body;

      if (!adminAddress) {
        res.status(400).json({
          error: 'Invalid request',
          message: 'adminAddress is required',
        });
        return;
      }

      // Verify admin access
      const isAdmin = await blockchainModelStorage.isAdmin(adminAddress);
      if (!isAdmin) {
        res.status(403).json({
          error: 'Access denied',
          message: 'Admin privileges required',
        });
        return;
      }

      // Delete model data
      const success = await blockchainModelStorage.deleteModelData(modelId, adminAddress);

      if (!success) {
        res.status(400).json({
          error: 'Delete failed',
          message: 'Unable to delete model data',
        });
        return;
      }

      res.json({
        success: true,
        message: 'Model training data deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting model data:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Get all model IDs
   * GET /api/blockchain-models/ids
   */
  async getAllModelIds(req: Request, res: Response): Promise<void> {
    try {
      const { adminAddress } = req.query;

      if (!adminAddress) {
        res.status(400).json({
          error: 'Invalid request',
          message: 'adminAddress query parameter is required',
        });
        return;
      }

      // Verify admin access
      const isAdmin = await blockchainModelStorage.isAdmin(adminAddress as string);
      if (!isAdmin) {
        res.status(403).json({
          error: 'Access denied',
          message: 'Admin privileges required',
        });
        return;
      }

      // Get all model IDs
      const modelIds = await blockchainModelStorage.getAllModelIds(adminAddress as string);

      res.json({
        success: true,
        data: { modelIds },
      });
    } catch (error) {
      console.error('Error getting model IDs:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Get model count
   * GET /api/blockchain-models/count
   */
  async getModelCount(req: Request, res: Response): Promise<void> {
    try {
      const { adminAddress } = req.query;

      if (!adminAddress) {
        res.status(400).json({
          error: 'Invalid request',
          message: 'adminAddress query parameter is required',
        });
        return;
      }

      // Verify admin access
      const isAdmin = await blockchainModelStorage.isAdmin(adminAddress as string);
      if (!isAdmin) {
        res.status(403).json({
          error: 'Access denied',
          message: 'Admin privileges required',
        });
        return;
      }

      // Get model count
      const count = await blockchainModelStorage.getModelCount(adminAddress as string);

      res.json({
        success: true,
        data: { count },
      });
    } catch (error) {
      console.error('Error getting model count:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Search models
   * POST /api/blockchain-models/search
   */
  async searchModels(req: Request, res: Response): Promise<void> {
    try {
      const { criteria, adminAddress } = req.body;

      if (!adminAddress) {
        res.status(400).json({
          error: 'Invalid request',
          message: 'adminAddress is required',
        });
        return;
      }

      // Verify admin access
      const isAdmin = await blockchainModelStorage.isAdmin(adminAddress);
      if (!isAdmin) {
        res.status(403).json({
          error: 'Access denied',
          message: 'Admin privileges required',
        });
        return;
      }

      // Search models
      const models = await blockchainModelStorage.searchModels(criteria, adminAddress);

      res.json({
        success: true,
        data: { models, count: models.length },
      });
    } catch (error) {
      console.error('Error searching models:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Get model statistics
   * GET /api/blockchain-models/statistics
   */
  async getModelStatistics(req: Request, res: Response): Promise<void> {
    try {
      const { adminAddress } = req.query;

      if (!adminAddress) {
        res.status(400).json({
          error: 'Invalid request',
          message: 'adminAddress query parameter is required',
        });
        return;
      }

      // Verify admin access
      const isAdmin = await blockchainModelStorage.isAdmin(adminAddress as string);
      if (!isAdmin) {
        res.status(403).json({
          error: 'Access denied',
          message: 'Admin privileges required',
        });
        return;
      }

      // Get model statistics
      const statistics = await blockchainModelStorage.getModelStatistics(adminAddress as string);

      res.json({
        success: true,
        data: { statistics },
      });
    } catch (error) {
      console.error('Error getting model statistics:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Add admin address
   * POST /api/blockchain-models/admin/add
   */
  async addAdmin(req: Request, res: Response): Promise<void> {
    try {
      const { adminAddress, role, requesterAddress } = req.body;

      if (!adminAddress || !role || !requesterAddress) {
        res.status(400).json({
          error: 'Invalid request',
          message: 'adminAddress, role, and requesterAddress are required',
        });
        return;
      }

      // Verify requester is super admin
      const isAdmin = await blockchainModelStorage.isAdmin(requesterAddress);
      if (!isAdmin) {
        res.status(403).json({
          error: 'Access denied',
          message: 'Super admin privileges required',
        });
        return;
      }

      // Add admin
      const success = await blockchainModelStorage.addAdmin(adminAddress, role);

      if (!success) {
        res.status(400).json({
          error: 'Add admin failed',
          message: 'Unable to add admin address',
        });
        return;
      }

      res.json({
        success: true,
        message: `Admin ${adminAddress} added successfully with role ${role}`,
      });
    } catch (error) {
      console.error('Error adding admin:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Remove admin address
   * DELETE /api/blockchain-models/admin/remove
   */
  async removeAdmin(req: Request, res: Response): Promise<void> {
    try {
      const { adminAddress, requesterAddress } = req.body;

      if (!adminAddress || !requesterAddress) {
        res.status(400).json({
          error: 'Invalid request',
          message: 'adminAddress and requesterAddress are required',
        });
        return;
      }

      // Verify requester is super admin
      const isAdmin = await blockchainModelStorage.isAdmin(requesterAddress);
      if (!isAdmin) {
        res.status(403).json({
          error: 'Access denied',
          message: 'Super admin privileges required',
        });
        return;
      }

      // Remove admin
      const success = await blockchainModelStorage.removeAdmin(adminAddress);

      if (!success) {
        res.status(400).json({
          error: 'Remove admin failed',
          message: 'Unable to remove admin address',
        });
        return;
      }

      res.json({
        success: true,
        message: `Admin ${adminAddress} removed successfully`,
      });
    } catch (error) {
      console.error('Error removing admin:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Get admin access list
   * GET /api/blockchain-models/admin/list
   */
  async getAdminAccess(req: Request, res: Response): Promise<void> {
    try {
      const { adminAddress } = req.query;

      if (!adminAddress) {
        res.status(400).json({
          error: 'Invalid request',
          message: 'adminAddress query parameter is required',
        });
        return;
      }

      // Verify admin access
      const isAdmin = await blockchainModelStorage.isAdmin(adminAddress as string);
      if (!isAdmin) {
        res.status(403).json({
          error: 'Access denied',
          message: 'Admin privileges required',
        });
        return;
      }

      // Get admin access list
      const adminAccess = blockchainModelStorage.getAdminAccess();

      res.json({
        success: true,
        data: { adminAccess },
      });
    } catch (error) {
      console.error('Error getting admin access:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Get all models
   * GET /api/blockchain-models/all
   */
  async getAllModels(req: Request, res: Response): Promise<void> {
    try {
      const { adminAddress } = req.query;

      if (!adminAddress) {
        res.status(400).json({
          error: 'Invalid request',
          message: 'adminAddress query parameter is required',
        });
        return;
      }

      // Verify admin access
      const isAdmin = await blockchainModelStorage.isAdmin(adminAddress as string);
      if (!isAdmin) {
        res.status(403).json({
          error: 'Access denied',
          message: 'Admin privileges required',
        });
        return;
      }

      // Get all models
      const models = blockchainModelStorage.getAllModels();

      res.json({
        success: true,
        data: { models, count: models.length },
      });
    } catch (error) {
      console.error('Error getting all models:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Verify admin access
   * GET /api/blockchain-models/admin/verify
   */
  async verifyAdminAccess(req: Request, res: Response): Promise<void> {
    try {
      const { adminAddress } = req.query;

      if (!adminAddress) {
        res.status(400).json({
          error: 'Invalid request',
          message: 'adminAddress query parameter is required',
        });
        return;
      }

      // Verify admin access
      const isAdmin = await blockchainModelStorage.isAdmin(adminAddress as string);

      res.json({
        success: true,
        data: { isAdmin },
      });
    } catch (error) {
      console.error('Error verifying admin access:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}

// Export singleton instance
export const blockchainModelStorageAPI = new BlockchainModelStorageAPI();
