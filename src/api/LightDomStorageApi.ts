/**
 * Light DOM Persistent Storage API
 * Handles file uploads with Chrome size limits and persistent storage
 * Provides user-friendly interface for managing storage settings
 */

import { Request, Response } from 'express';
import { persistentBlockchainStorage, UserSettings } from '../core/PersistentBlockchainStorage';
import { browserRefreshHandler } from '../scripts/BrowserRefreshHandler';

export interface FileUploadRequest {
  file: Express.Multer.File;
  metadata?: {
    description?: string;
    tags?: string[];
    category?: string;
    isPublic?: boolean;
  };
  storageType: 'optimization' | 'model' | 'asset' | 'general';
}

export interface FileUploadResponse {
  success: boolean;
  fileId: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  storagePath: string;
  blockchainHash?: string;
  message: string;
}

export interface StorageSettings {
  maxFileUploadSize: number;
  allowedFileTypes: string[];
  compressionEnabled: boolean;
  encryptionEnabled: boolean;
  autoBackup: boolean;
  retentionDays: number;
}

export class LightDomStorageAPI {
  private readonly CHROME_MAX_FILE_SIZE = 2 * 1024 * 1024 * 1024; // 2GB
  private readonly DEFAULT_MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
  private readonly ALLOWED_FILE_TYPES = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'text/plain',
    'text/html',
    'text/css',
    'text/javascript',
    'application/json',
    'application/xml',
    'application/pdf',
    'application/zip',
    'application/x-tar',
    'application/gzip'
  ];

  /**
   * Get current storage settings
   * GET /api/storage/settings
   */
  async getStorageSettings(req: Request, res: Response): Promise<void> {
    try {
      const userSettings = persistentBlockchainStorage.getUserSettings();
      
      const settings: StorageSettings = {
        maxFileUploadSize: userSettings.maxFileUploadSize,
        allowedFileTypes: this.ALLOWED_FILE_TYPES,
        compressionEnabled: true,
        encryptionEnabled: false,
        autoBackup: userSettings.autoSync,
        retentionDays: 365
      };

      res.json({
        success: true,
        data: settings
      });
    } catch (error) {
      console.error('Error getting storage settings:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Update storage settings
   * PUT /api/storage/settings
   */
  async updateStorageSettings(req: Request, res: Response): Promise<void> {
    try {
      const { maxFileUploadSize, autoBackup } = req.body;

      // Validate max file upload size
      if (maxFileUploadSize && typeof maxFileUploadSize === 'number') {
        if (maxFileUploadSize > this.CHROME_MAX_FILE_SIZE) {
          res.status(400).json({
            error: 'Invalid file size',
            message: `Maximum file size cannot exceed ${this.formatBytes(this.CHROME_MAX_FILE_SIZE)}`
          });
          return;
        }

        if (maxFileUploadSize < 1024) { // Minimum 1KB
          res.status(400).json({
            error: 'Invalid file size',
            message: 'Minimum file size is 1KB'
          });
          return;
        }

        // Update user settings
        persistentBlockchainStorage.updateUserSettings({
          maxFileUploadSize,
          autoSync: autoBackup
        });
      }

      res.json({
        success: true,
        message: 'Storage settings updated successfully'
      });
    } catch (error) {
      console.error('Error updating storage settings:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Upload file with size validation
   * POST /api/storage/upload
   */
  async uploadFile(req: Request, res: Response): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({
          error: 'No file provided',
          message: 'Please select a file to upload'
        });
        return;
      }

      const file = req.file;
      const { storageType = 'general', metadata = {} } = req.body;

      // Get current user settings
      const userSettings = persistentBlockchainStorage.getUserSettings();

      // Validate file size
      if (file.size > userSettings.maxFileUploadSize) {
        res.status(400).json({
          error: 'File too large',
          message: `File size (${this.formatBytes(file.size)}) exceeds maximum allowed size (${this.formatBytes(userSettings.maxFileUploadSize)})`
        });
        return;
      }

      // Validate file type
      if (!this.ALLOWED_FILE_TYPES.includes(file.mimetype)) {
        res.status(400).json({
          error: 'File type not allowed',
          message: `File type ${file.mimetype} is not supported`
        });
        return;
      }

      // Generate unique file ID
      const fileId = this.generateFileId();
      const storagePath = this.generateStoragePath(fileId, file.originalname);

      // Process file based on storage type
      let blockchainHash: string | undefined;
      switch (storageType) {
        case 'optimization':
          blockchainHash = await this.processOptimizationFile(file, fileId, metadata);
          break;
        case 'model':
          blockchainHash = await this.processModelFile(file, fileId, metadata);
          break;
        case 'asset':
          blockchainHash = await this.processAssetFile(file, fileId, metadata);
          break;
        default:
          blockchainHash = await this.processGeneralFile(file, fileId, metadata);
      }

      // Save file metadata to persistent storage
      await this.saveFileMetadata({
        fileId,
        fileName: file.originalname,
        fileSize: file.size,
        fileType: file.mimetype,
        storagePath,
        storageType,
        metadata,
        blockchainHash,
        uploadedAt: Date.now()
      });

      const response: FileUploadResponse = {
        success: true,
        fileId,
        fileName: file.originalname,
        fileSize: file.size,
        fileType: file.mimetype,
        storagePath,
        blockchainHash,
        message: `File uploaded successfully. Size: ${this.formatBytes(file.size)}`
      };

      res.json({
        success: true,
        data: response
      });

    } catch (error) {
      console.error('Error uploading file:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Process optimization file
   */
  private async processOptimizationFile(file: Express.Multer.File, fileId: string, metadata: any): Promise<string> {
    // Simulate optimization processing
    const optimizationData = {
      url: metadata.url || 'unknown',
      spaceSavedBytes: file.size,
      optimizationType: 'file-upload',
      biomeType: metadata.biomeType || 'digital',
      harvesterAddress: metadata.harvesterAddress || '0x0000000000000000000000000000000000000000',
      beforeHash: '',
      afterHash: this.generateHash(file.buffer)
    };

    const result = await spaceOptimizationEngine.processOptimization(optimizationData);
    return result.proofHash;
  }

  /**
   * Process model file
   */
  private async processModelFile(file: Express.Multer.File, fileId: string, metadata: any): Promise<string> {
    // Simulate model processing
    const modelData = {
      modelId: fileId,
      modelName: metadata.modelName || file.originalname,
      version: metadata.version || '1.0.0',
      dataHash: this.generateHash(file.buffer),
      metadata: {
        algorithm: metadata.algorithm || 'unknown',
        framework: metadata.framework || 'unknown',
        dataset: metadata.dataset || 'unknown',
        accuracy: metadata.accuracy || 0,
        precision: metadata.precision || 0,
        recall: metadata.recall || 0,
        f1Score: metadata.f1Score || 0,
        trainingTime: metadata.trainingTime || 0,
        epochs: metadata.epochs || 0,
        batchSize: metadata.batchSize || 0,
        learningRate: metadata.learningRate || 0,
        optimizer: metadata.optimizer || 'unknown',
        lossFunction: metadata.lossFunction || 'unknown',
        validationSplit: metadata.validationSplit || 0,
        features: metadata.features || [],
        targetVariable: metadata.targetVariable || 'unknown',
        dataSize: file.size,
        preprocessing: metadata.preprocessing || [],
        augmentation: metadata.augmentation || [],
        hyperparameters: metadata.hyperparameters || {}
      },
      schema: {
        inputSchema: metadata.inputSchema || {},
        outputSchema: metadata.outputSchema || {},
        dataTypes: metadata.dataTypes || {},
        constraints: metadata.constraints || {},
        validationRules: metadata.validationRules || []
      },
      connections: {
        parentModels: metadata.parentModels || [],
        childModels: metadata.childModels || [],
        dependencies: metadata.dependencies || [],
        integrations: metadata.integrations || [],
        apis: metadata.apis || []
      },
      access: {
        adminAddresses: [metadata.adminAddress || '0x0000000000000000000000000000000000000000'],
        readPermissions: [],
        writePermissions: [],
        encrypted: false
      }
    };

    const result = await blockchainModelStorage.storeModelData(modelData, metadata.adminAddress || '0x0000000000000000000000000000000000000000');
    return result.blockchain.transactionHash;
  }

  /**
   * Process asset file
   */
  private async processAssetFile(file: Express.Multer.File, fileId: string, metadata: any): Promise<string> {
    // Simulate asset processing
    const assetData = {
      id: fileId,
      type: metadata.assetType || 'general',
      biomeType: metadata.biomeType || 'digital',
      size: file.size,
      stakingRewards: metadata.stakingRewards || 0,
      developmentLevel: metadata.developmentLevel || 1,
      sourceUrl: metadata.sourceUrl || 'unknown'
    };

    // Save to persistent storage
    await persistentBlockchainStorage.saveMetaverseAsset(assetData);
    return this.generateHash(file.buffer);
  }

  /**
   * Process general file
   */
  private async processGeneralFile(file: Express.Multer.File, fileId: string, metadata: any): Promise<string> {
    // For general files, just generate a hash
    return this.generateHash(file.buffer);
  }

  /**
   * Save file metadata to persistent storage
   */
  private async saveFileMetadata(metadata: any): Promise<void> {
    // This would typically save to a database
    // For now, we'll save to localStorage as a backup
    const existingFiles = JSON.parse(localStorage.getItem('lightdom_uploaded_files') || '[]');
    existingFiles.push(metadata);
    localStorage.setItem('lightdom_uploaded_files', JSON.stringify(existingFiles));
  }

  /**
   * Get uploaded files
   * GET /api/storage/files
   */
  async getUploadedFiles(req: Request, res: Response): Promise<void> {
    try {
      const { storageType, limit = 50, offset = 0 } = req.query;
      
      const files = JSON.parse(localStorage.getItem('lightdom_uploaded_files') || '[]');
      
      let filteredFiles = files;
      if (storageType) {
        filteredFiles = files.filter((file: any) => file.storageType === storageType);
      }

      // Apply pagination
      const start = Number(offset);
      const end = start + Number(limit);
      const paginatedFiles = filteredFiles.slice(start, end);

      res.json({
        success: true,
        data: {
          files: paginatedFiles,
          total: filteredFiles.length,
          limit: Number(limit),
          offset: Number(offset)
        }
      });
    } catch (error) {
      console.error('Error getting uploaded files:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Delete uploaded file
   * DELETE /api/storage/files/:fileId
   */
  async deleteUploadedFile(req: Request, res: Response): Promise<void> {
    try {
      const { fileId } = req.params;
      
      const files = JSON.parse(localStorage.getItem('lightdom_uploaded_files') || '[]');
      const filteredFiles = files.filter((file: any) => file.fileId !== fileId);
      
      if (filteredFiles.length === files.length) {
        res.status(404).json({
          error: 'File not found',
          message: `File with ID ${fileId} not found`
        });
        return;
      }

      localStorage.setItem('lightdom_uploaded_files', JSON.stringify(filteredFiles));

      res.json({
        success: true,
        message: 'File deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting file:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get storage statistics
   * GET /api/storage/stats
   */
  async getStorageStats(req: Request, res: Response): Promise<void> {
    try {
      const files = JSON.parse(localStorage.getItem('lightdom_uploaded_files') || '[]');
      const userSettings = persistentBlockchainStorage.getUserSettings();
      
      const totalFiles = files.length;
      const totalSize = files.reduce((sum: number, file: any) => sum + file.fileSize, 0);
      const storageTypes = files.reduce((acc: any, file: any) => {
        acc[file.storageType] = (acc[file.storageType] || 0) + 1;
        return acc;
      }, {});

      const stats = {
        totalFiles,
        totalSize,
        totalSizeFormatted: this.formatBytes(totalSize),
        maxFileSize: userSettings.maxFileUploadSize,
        maxFileSizeFormatted: this.formatBytes(userSettings.maxFileSize),
        storageTypes,
        availableSpace: userSettings.maxFileUploadSize - totalSize,
        availableSpaceFormatted: this.formatBytes(userSettings.maxFileUploadSize - totalSize),
        usagePercentage: (totalSize / userSettings.maxFileUploadSize) * 100
      };

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Error getting storage stats:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get Chrome file upload limits
   * GET /api/storage/limits
   */
  async getFileUploadLimits(req: Request, res: Response): Promise<void> {
    try {
      const limits = {
        chromeMaxFileSize: this.CHROME_MAX_FILE_SIZE,
        chromeMaxFileSizeFormatted: this.formatBytes(this.CHROME_MAX_FILE_SIZE),
        defaultMaxFileSize: this.DEFAULT_MAX_FILE_SIZE,
        defaultMaxFileSizeFormatted: this.formatBytes(this.DEFAULT_MAX_FILE_SIZE),
        allowedFileTypes: this.ALLOWED_FILE_TYPES,
        recommendations: {
          imageFiles: 'Use WebP format for better compression',
          textFiles: 'Compress large text files before upload',
          modelFiles: 'Consider splitting large models into chunks',
          generalFiles: 'Use compression for files over 10MB'
        }
      };

      res.json({
        success: true,
        data: limits
      });
    } catch (error) {
      console.error('Error getting file upload limits:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Convenience method for scripts to read Chrome limits directly from storage
   */
  public getChromeLimits(): { chromeMaxFileSize: number; chromeMaxFileSizeFormatted: string; defaultMaxFileSize: number; defaultMaxFileSizeFormatted: string; allowedFileTypes: string[] } {
    return {
      chromeMaxFileSize: this.CHROME_MAX_FILE_SIZE,
      chromeMaxFileSizeFormatted: this.formatBytes(this.CHROME_MAX_FILE_SIZE),
      defaultMaxFileSize: this.DEFAULT_MAX_FILE_SIZE,
      defaultMaxFileSizeFormatted: this.formatBytes(this.DEFAULT_MAX_FILE_SIZE),
      allowedFileTypes: this.ALLOWED_FILE_TYPES
    };
  }

  /**
   * Generate unique file ID
   */
  private generateFileId(): string {
    return `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate storage path
   */
  private generateStoragePath(fileId: string, originalName: string): string {
    const extension = originalName.split('.').pop() || 'bin';
    return `uploads/${fileId}.${extension}`;
  }

  /**
   * Generate hash for file content
   */
  private generateHash(buffer: Buffer): string {
    // Simple hash function (in production, use crypto.subtle.digest)
    let hash = 0;
    for (let i = 0; i < buffer.length; i++) {
      const char = buffer[i];
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
  }

  /**
   * Format bytes to human readable format
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

// Export singleton instance
export const lightDomStorageAPI = new LightDomStorageAPI();
