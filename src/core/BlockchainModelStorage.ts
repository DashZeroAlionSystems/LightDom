/**
 * Blockchain Model Storage System
 * Secure storage of model training data with metadata, schema, and connections
 * Accessible only to admin addresses
 */

import { ethers } from 'ethers';

export interface ModelTrainingData {
  id: string;
  modelId: string;
  modelName: string;
  version: string;
  dataHash: string; // IPFS hash of the actual training data
  metadata: {
    algorithm: string;
    framework: string;
    dataset: string;
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
    trainingTime: number;
    epochs: number;
    batchSize: number;
    learningRate: number;
    optimizer: string;
    lossFunction: string;
    validationSplit: number;
    features: string[];
    targetVariable: string;
    dataSize: number;
    preprocessing: string[];
    augmentation: string[];
    hyperparameters: Record<string, any>;
  };
  schema: {
    inputSchema: Record<string, any>;
    outputSchema: Record<string, any>;
    dataTypes: Record<string, string>;
    constraints: Record<string, any>;
    validationRules: string[];
  };
  connections: {
    parentModels: string[];
    childModels: string[];
    dependencies: string[];
    integrations: string[];
    apis: string[];
  };
  access: {
    adminAddresses: string[];
    readPermissions: string[];
    writePermissions: string[];
    encrypted: boolean;
    encryptionKey?: string;
  };
  blockchain: {
    transactionHash: string;
    blockNumber: number;
    gasUsed: number;
    timestamp: number;
    contractAddress: string;
  };
  ipfs: {
    dataCID: string;
    metadataCID: string;
    schemaCID: string;
    connectionsCID: string;
  };
  lifecycle: {
    created: number;
    lastUpdated: number;
    status: 'active' | 'deprecated' | 'archived' | 'deleted';
    versionHistory: string[];
  };
}

export interface ModelConnection {
  id: string;
  sourceModelId: string;
  targetModelId: string;
  connectionType: 'parent' | 'child' | 'dependency' | 'integration' | 'api';
  weight: number;
  description: string;
  metadata: Record<string, any>;
  createdAt: number;
  updatedAt: number;
}

export interface ModelSchema {
  id: string;
  modelId: string;
  schemaType: 'input' | 'output' | 'intermediate' | 'validation';
  schema: Record<string, any>;
  version: string;
  createdAt: number;
  updatedAt: number;
}

export interface AdminAccess {
  address: string;
  role: 'super_admin' | 'admin' | 'data_admin' | 'model_admin';
  permissions: {
    read: boolean;
    write: boolean;
    delete: boolean;
    manageAccess: boolean;
    deployModels: boolean;
    accessTrainingData: boolean;
  };
  createdAt: number;
  lastActive: number;
  isActive: boolean;
}

export class BlockchainModelStorage {
  private provider: ethers.Provider;
  private wallet: ethers.Wallet;
  private contract: ethers.Contract;
  private adminAddresses: Set<string> = new Set();
  private modelData: Map<string, ModelTrainingData> = new Map();
  private connections: Map<string, ModelConnection> = new Map();
  private schemas: Map<string, ModelSchema> = new Map();
  private adminAccess: Map<string, AdminAccess> = new Map();

  constructor(provider: ethers.Provider, wallet: ethers.Wallet, contractAddress: string) {
    this.provider = provider;
    this.wallet = wallet;

    // Initialize contract with ABI
    this.contract = new ethers.Contract(contractAddress, this.getContractABI(), wallet);

    this.initializeAdminAccess();
  }

  /**
   * Get the smart contract ABI for model storage
   */
  private getContractABI(): any[] {
    return [
      'function storeModelData(bytes32 modelId, string memory dataHash, string memory metadataHash, string memory schemaHash, string memory connectionsHash, address[] memory adminAddresses) external',
      'function getModelData(bytes32 modelId) external view returns (string memory, string memory, string memory, string memory, address[] memory)',
      'function updateModelData(bytes32 modelId, string memory dataHash, string memory metadataHash, string memory schemaHash, string memory connectionsHash) external',
      'function deleteModelData(bytes32 modelId) external',
      'function addAdmin(address adminAddress, uint8 role) external',
      'function removeAdmin(address adminAddress) external',
      'function isAdmin(address adminAddress) external view returns (bool)',
      'function getAdminRole(address adminAddress) external view returns (uint8)',
      'function getModelCount() external view returns (uint256)',
      'function getModelIds() external view returns (bytes32[])',
      'function getModelByIndex(uint256 index) external view returns (bytes32, string memory, string memory, string memory, string memory, address[] memory)',
      'event ModelDataStored(bytes32 indexed modelId, address indexed admin, uint256 timestamp)',
      'event ModelDataUpdated(bytes32 indexed modelId, address indexed admin, uint256 timestamp)',
      'event ModelDataDeleted(bytes32 indexed modelId, address indexed admin, uint256 timestamp)',
      'event AdminAdded(address indexed adminAddress, uint8 role, address indexed addedBy)',
      'event AdminRemoved(address indexed adminAddress, address indexed removedBy)',
    ];
  }

  /**
   * Initialize admin access
   */
  private initializeAdminAccess(): void {
    // Add the wallet address as super admin
    this.adminAddresses.add(this.wallet.address);
    this.adminAccess.set(this.wallet.address, {
      address: this.wallet.address,
      role: 'super_admin',
      permissions: {
        read: true,
        write: true,
        delete: true,
        manageAccess: true,
        deployModels: true,
        accessTrainingData: true,
      },
      createdAt: Date.now(),
      lastActive: Date.now(),
      isActive: true,
    });
  }

  /**
   * Check if address is admin
   */
  public async isAdmin(address: string): Promise<boolean> {
    try {
      const isAdmin = await this.contract.isAdmin(address);
      return isAdmin;
    } catch (error) {
      console.error('Error checking admin status:', error);
      return this.adminAddresses.has(address);
    }
  }

  /**
   * Add admin address
   */
  public async addAdmin(
    address: string,
    role: 'super_admin' | 'admin' | 'data_admin' | 'model_admin'
  ): Promise<boolean> {
    try {
      const roleMap = {
        super_admin: 0,
        admin: 1,
        data_admin: 2,
        model_admin: 3,
      };

      const tx = await this.contract.addAdmin(address, roleMap[role]);
      await tx.wait();

      this.adminAddresses.add(address);
      this.adminAccess.set(address, {
        address,
        role,
        permissions: this.getPermissionsForRole(role),
        createdAt: Date.now(),
        lastActive: Date.now(),
        isActive: true,
      });

      return true;
    } catch (error) {
      console.error('Error adding admin:', error);
      return false;
    }
  }

  /**
   * Remove admin address
   */
  public async removeAdmin(address: string): Promise<boolean> {
    try {
      const tx = await this.contract.removeAdmin(address);
      await tx.wait();

      this.adminAddresses.delete(address);
      this.adminAccess.delete(address);

      return true;
    } catch (error) {
      console.error('Error removing admin:', error);
      return false;
    }
  }

  /**
   * Get permissions for role
   */
  private getPermissionsForRole(role: string): AdminAccess['permissions'] {
    const permissions = {
      super_admin: {
        read: true,
        write: true,
        delete: true,
        manageAccess: true,
        deployModels: true,
        accessTrainingData: true,
      },
      admin: {
        read: true,
        write: true,
        delete: true,
        manageAccess: false,
        deployModels: true,
        accessTrainingData: true,
      },
      data_admin: {
        read: true,
        write: true,
        delete: false,
        manageAccess: false,
        deployModels: false,
        accessTrainingData: true,
      },
      model_admin: {
        read: true,
        write: true,
        delete: false,
        manageAccess: false,
        deployModels: true,
        accessTrainingData: false,
      },
    };

    return permissions[role as keyof typeof permissions] || permissions.data_admin;
  }

  /**
   * Store model training data on blockchain
   */
  public async storeModelData(
    modelData: Omit<ModelTrainingData, 'id' | 'blockchain' | 'ipfs' | 'lifecycle'>,
    adminAddress: string
  ): Promise<ModelTrainingData> {
    // Verify admin access
    if (!(await this.isAdmin(adminAddress))) {
      throw new Error('Access denied: Admin privileges required');
    }

    const modelId = ethers.keccak256(
      ethers.toUtf8Bytes(`${modelData.modelName}_${modelData.version}_${Date.now()}`)
    );

    // Upload data to IPFS (simulated)
    const ipfsData = await this.uploadToIPFS(modelData);

    // Prepare data for blockchain storage
    const dataHash = ipfsData.dataCID;
    const metadataHash = ipfsData.metadataCID;
    const schemaHash = ipfsData.schemaCID;
    const connectionsHash = ipfsData.connectionsCID;
    const adminAddresses = Array.from(this.adminAddresses);

    // Store on blockchain
    const tx = await this.contract.storeModelData(
      modelId,
      dataHash,
      metadataHash,
      schemaHash,
      connectionsHash,
      adminAddresses
    );

    const receipt = await tx.wait();
    const blockNumber = receipt.blockNumber;
    const gasUsed = receipt.gasUsed;

    // Create complete model data object
    const completeModelData: ModelTrainingData = {
      ...modelData,
      id: modelId,
      blockchain: {
        transactionHash: tx.hash,
        blockNumber,
        gasUsed: Number(gasUsed),
        timestamp: Date.now(),
        contractAddress: await this.contract.getAddress(),
      },
      ipfs: ipfsData,
      lifecycle: {
        created: Date.now(),
        lastUpdated: Date.now(),
        status: 'active',
        versionHistory: [modelData.version],
      },
    };

    // Store locally
    this.modelData.set(modelId, completeModelData);

    return completeModelData;
  }

  /**
   * Get model training data from blockchain
   */
  public async getModelData(
    modelId: string,
    requesterAddress: string
  ): Promise<ModelTrainingData | null> {
    // Verify admin access
    if (!(await this.isAdmin(requesterAddress))) {
      throw new Error('Access denied: Admin privileges required');
    }

    try {
      // Get from blockchain
      const [dataHash, metadataHash, schemaHash, connectionsHash, adminAddresses] =
        await this.contract.getModelData(modelId);

      // Download from IPFS (simulated)
      const ipfsData = await this.downloadFromIPFS({
        dataCID: dataHash,
        metadataCID: metadataHash,
        schemaCID: schemaHash,
        connectionsCID: connectionsHash,
      });

      // Create model data object
      const modelData: ModelTrainingData = {
        id: modelId,
        modelId: ipfsData.metadata.modelId,
        modelName: ipfsData.metadata.modelName,
        version: ipfsData.metadata.version,
        dataHash: dataHash,
        metadata: ipfsData.metadata,
        schema: ipfsData.schema,
        connections: ipfsData.connections,
        access: {
          adminAddresses: adminAddresses,
          readPermissions: [],
          writePermissions: [],
          encrypted: false,
        },
        blockchain: {
          transactionHash: '', // Would need to get from transaction
          blockNumber: 0, // Would need to get from transaction
          gasUsed: 0,
          timestamp: Date.now(),
          contractAddress: await this.contract.getAddress(),
        },
        ipfs: {
          dataCID: dataHash,
          metadataCID: metadataHash,
          schemaCID: schemaHash,
          connectionsCID: connectionsHash,
        },
        lifecycle: {
          created: Date.now(),
          lastUpdated: Date.now(),
          status: 'active',
          versionHistory: [ipfsData.metadata.version],
        },
      };

      return modelData;
    } catch (error) {
      console.error('Error getting model data:', error);
      return null;
    }
  }

  /**
   * Update model training data
   */
  public async updateModelData(
    modelId: string,
    updates: Partial<ModelTrainingData>,
    adminAddress: string
  ): Promise<boolean> {
    // Verify admin access
    if (!(await this.isAdmin(adminAddress))) {
      throw new Error('Access denied: Admin privileges required');
    }

    try {
      const existingData = this.modelData.get(modelId);
      if (!existingData) {
        throw new Error('Model data not found');
      }

      // Update local data
      const updatedData = { ...existingData, ...updates };
      updatedData.lifecycle.lastUpdated = Date.now();
      updatedData.lifecycle.versionHistory.push(updates.version || existingData.version);

      // Upload updated data to IPFS
      const ipfsData = await this.uploadToIPFS(updatedData);

      // Update on blockchain
      const tx = await this.contract.updateModelData(
        modelId,
        ipfsData.dataCID,
        ipfsData.metadataCID,
        ipfsData.schemaCID,
        ipfsData.connectionsCID
      );

      await tx.wait();

      // Update local storage
      this.modelData.set(modelId, updatedData);

      return true;
    } catch (error) {
      console.error('Error updating model data:', error);
      return false;
    }
  }

  /**
   * Delete model training data
   */
  public async deleteModelData(modelId: string, adminAddress: string): Promise<boolean> {
    // Verify admin access
    if (!(await this.isAdmin(adminAddress))) {
      throw new Error('Access denied: Admin privileges required');
    }

    try {
      // Delete from blockchain
      const tx = await this.contract.deleteModelData(modelId);
      await tx.wait();

      // Update local data status
      const existingData = this.modelData.get(modelId);
      if (existingData) {
        existingData.lifecycle.status = 'deleted';
        existingData.lifecycle.lastUpdated = Date.now();
        this.modelData.set(modelId, existingData);
      }

      return true;
    } catch (error) {
      console.error('Error deleting model data:', error);
      return false;
    }
  }

  /**
   * Get all model IDs
   */
  public async getAllModelIds(requesterAddress: string): Promise<string[]> {
    // Verify admin access
    if (!(await this.isAdmin(requesterAddress))) {
      throw new Error('Access denied: Admin privileges required');
    }

    try {
      const modelIds = await this.contract.getModelIds();
      return modelIds;
    } catch (error) {
      console.error('Error getting model IDs:', error);
      return [];
    }
  }

  /**
   * Get model count
   */
  public async getModelCount(requesterAddress: string): Promise<number> {
    // Verify admin access
    if (!(await this.isAdmin(requesterAddress))) {
      throw new Error('Access denied: Admin privileges required');
    }

    try {
      const count = await this.contract.getModelCount();
      return Number(count);
    } catch (error) {
      console.error('Error getting model count:', error);
      return 0;
    }
  }

  /**
   * Search models by criteria
   */
  public async searchModels(
    criteria: {
      modelName?: string;
      algorithm?: string;
      framework?: string;
      status?: string;
      dateRange?: { start: number; end: number };
    },
    requesterAddress: string
  ): Promise<ModelTrainingData[]> {
    // Verify admin access
    if (!(await this.isAdmin(requesterAddress))) {
      throw new Error('Access denied: Admin privileges required');
    }

    const results: ModelTrainingData[] = [];

    for (const [modelId, modelData] of this.modelData) {
      let matches = true;

      if (
        criteria.modelName &&
        !modelData.modelName.toLowerCase().includes(criteria.modelName.toLowerCase())
      ) {
        matches = false;
      }

      if (criteria.algorithm && modelData.metadata.algorithm !== criteria.algorithm) {
        matches = false;
      }

      if (criteria.framework && modelData.metadata.framework !== criteria.framework) {
        matches = false;
      }

      if (criteria.status && modelData.lifecycle.status !== criteria.status) {
        matches = false;
      }

      if (criteria.dateRange) {
        const created = modelData.lifecycle.created;
        if (created < criteria.dateRange.start || created > criteria.dateRange.end) {
          matches = false;
        }
      }

      if (matches) {
        results.push(modelData);
      }
    }

    return results;
  }

  /**
   * Get model statistics
   */
  public async getModelStatistics(requesterAddress: string): Promise<any> {
    // Verify admin access
    if (!(await this.isAdmin(requesterAddress))) {
      throw new Error('Access denied: Admin privileges required');
    }

    const models = Array.from(this.modelData.values());
    const algorithms = [...new Set(models.map(m => m.metadata.algorithm))];
    const frameworks = [...new Set(models.map(m => m.metadata.framework))];
    const statuses = [...new Set(models.map(m => m.lifecycle.status))];

    return {
      totalModels: models.length,
      algorithms: algorithms.length,
      frameworks: frameworks.length,
      statusDistribution: statuses.reduce(
        (acc, status) => {
          acc[status] = models.filter(m => m.lifecycle.status === status).length;
          return acc;
        },
        {} as Record<string, number>
      ),
      averageAccuracy: models.reduce((sum, m) => sum + m.metadata.accuracy, 0) / models.length,
      totalDataSize: models.reduce((sum, m) => sum + m.metadata.dataSize, 0),
      averageTrainingTime:
        models.reduce((sum, m) => sum + m.metadata.trainingTime, 0) / models.length,
    };
  }

  /**
   * Upload data to IPFS (simulated)
   */
  private async uploadToIPFS(modelData: any): Promise<{
    dataCID: string;
    metadataCID: string;
    schemaCID: string;
    connectionsCID: string;
  }> {
    // Simulate IPFS upload
    const dataCID = `Qm${Math.random().toString(36).substr(2, 44)}`;
    const metadataCID = `Qm${Math.random().toString(36).substr(2, 44)}`;
    const schemaCID = `Qm${Math.random().toString(36).substr(2, 44)}`;
    const connectionsCID = `Qm${Math.random().toString(36).substr(2, 44)}`;

    return { dataCID, metadataCID, schemaCID, connectionsCID };
  }

  /**
   * Download data from IPFS (simulated)
   */
  private async downloadFromIPFS(ipfsHashes: {
    dataCID: string;
    metadataCID: string;
    schemaCID: string;
    connectionsCID: string;
  }): Promise<{
    metadata: any;
    schema: any;
    connections: any;
  }> {
    // Simulate IPFS download
    return {
      metadata: {
        modelId: 'model_123',
        modelName: 'Sample Model',
        version: '1.0.0',
        algorithm: 'neural_network',
        framework: 'tensorflow',
        accuracy: 0.95,
        precision: 0.94,
        recall: 0.93,
        f1Score: 0.935,
        trainingTime: 3600,
        epochs: 100,
        batchSize: 32,
        learningRate: 0.001,
        optimizer: 'adam',
        lossFunction: 'categorical_crossentropy',
        validationSplit: 0.2,
        features: ['feature1', 'feature2', 'feature3'],
        targetVariable: 'target',
        dataSize: 1000000,
        preprocessing: ['normalization', 'scaling'],
        augmentation: ['rotation', 'flip'],
        hyperparameters: {
          hidden_layers: 3,
          neurons_per_layer: 128,
          dropout_rate: 0.2,
        },
      },
      schema: {
        inputSchema: {
          type: 'object',
          properties: {
            feature1: { type: 'number' },
            feature2: { type: 'number' },
            feature3: { type: 'number' },
          },
        },
        outputSchema: {
          type: 'object',
          properties: {
            prediction: { type: 'number' },
            confidence: { type: 'number' },
          },
        },
        dataTypes: {
          feature1: 'float32',
          feature2: 'float32',
          feature3: 'float32',
          target: 'int32',
        },
        constraints: {
          feature1: { min: 0, max: 1 },
          feature2: { min: -1, max: 1 },
          feature3: { min: 0, max: 100 },
        },
        validationRules: [
          'feature1 must be between 0 and 1',
          'feature2 must be between -1 and 1',
          'feature3 must be between 0 and 100',
        ],
      },
      connections: {
        parentModels: ['parent_model_1', 'parent_model_2'],
        childModels: ['child_model_1'],
        dependencies: ['tensorflow', 'numpy', 'pandas'],
        integrations: ['api_1', 'api_2'],
        apis: ['rest_api', 'graphql_api'],
      },
    };
  }

  /**
   * Get admin access list
   */
  public getAdminAccess(): AdminAccess[] {
    return Array.from(this.adminAccess.values());
  }

  /**
   * Get all stored models
   */
  public getAllModels(): ModelTrainingData[] {
    return Array.from(this.modelData.values());
  }
}

// Export singleton instance
export const blockchainModelStorage = new BlockchainModelStorage(
  new ethers.JsonRpcProvider(process.env.ETHEREUM_RPC_URL || 'http://localhost:8545'),
  new ethers.Wallet(process.env.ADMIN_PRIVATE_KEY || '0x' + '0'.repeat(64)),
  process.env.MODEL_STORAGE_CONTRACT_ADDRESS || '0x' + '0'.repeat(40)
);
