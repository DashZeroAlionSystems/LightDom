import { EventEmitter } from 'events';
import { Logger } from '../../utils/Logger';
import { ethers } from 'ethers';
import {
  BridgeTransaction,
  BridgeStatus,
  BridgeConfig,
  ChainInfo,
  BridgeFee,
  BridgeStats,
  BridgeError
} from '../types/CrossChainTypes';

export class CrossChainService extends EventEmitter {
  private logger: Logger;
  private config: BridgeConfig;
  private providers: Map<number, ethers.Provider> = new Map();
  private contracts: Map<number, ethers.Contract> = new Map();
  private isInitialized = false;
  private transactionQueue: Map<string, BridgeTransaction> = new Map();
  private statusCheckInterval: NodeJS.Timeout | null = null;

  constructor(config: BridgeConfig) {
    super();
    this.config = config;
    this.logger = new Logger('CrossChainService');
  }

  /**
   * Initialize the cross-chain service
   */
  async initialize(): Promise<void> {
    try {
      this.logger.info('Initializing CrossChainService');

      // Initialize providers for each supported chain
      for (const chain of this.config.supportedChains) {
        const provider = new ethers.JsonRpcProvider(chain.rpcUrl);
        this.providers.set(chain.chainId, provider);

        // Initialize bridge contract
        const contract = new ethers.Contract(
          chain.bridgeAddress,
          this.getBridgeABI(),
          provider
        );
        this.contracts.set(chain.chainId, contract);

        this.logger.info(`Initialized provider for chain ${chain.chainId} (${chain.name})`);
      }

      // Start status monitoring
      this.startStatusMonitoring();

      this.isInitialized = true;
      this.logger.info('CrossChainService initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize CrossChainService:', error);
      throw error;
    }
  }

  /**
   * Transfer tokens across chains
   */
  async transferTokens(
    fromChainId: number,
    toChainId: number,
    amount: string,
    recipientAddress: string,
    useFastBridge: boolean = false,
    signer: ethers.Signer
  ): Promise<BridgeTransaction> {
    try {
      if (!this.isInitialized) {
        throw new Error('CrossChainService not initialized');
      }

      const fromChain = this.config.supportedChains.find(c => c.chainId === fromChainId);
      const toChain = this.config.supportedChains.find(c => c.chainId === toChainId);

      if (!fromChain || !toChain) {
        throw new Error('Unsupported chain');
      }

      // Calculate bridge fee
      const bridgeFee = await this.calculateBridgeFee(fromChainId, toChainId, useFastBridge);

      // Create transaction
      const transaction: BridgeTransaction = {
        id: this.generateTransactionId(),
        fromChainId,
        toChainId,
        amount,
        recipientAddress,
        senderAddress: await signer.getAddress(),
        status: 'pending',
        bridgeFee,
        useFastBridge,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        metadata: {}
      };

      // Get contract and provider
      const contract = this.contracts.get(fromChainId);
      const provider = this.providers.get(fromChainId);

      if (!contract || !provider) {
        throw new Error(`Contract or provider not found for chain ${fromChainId}`);
      }

      // Connect signer to contract
      const contractWithSigner = contract.connect(signer);

      // Estimate gas
      const gasEstimate = await contractWithSigner.lockTokens.estimateGas(
        amount,
        toChainId,
        recipientAddress,
        useFastBridge,
        { value: bridgeFee }
      );

      // Execute transaction
      const tx = await contractWithSigner.lockTokens(
        amount,
        toChainId,
        recipientAddress,
        useFastBridge,
        { 
          value: bridgeFee,
          gasLimit: gasEstimate * 120n / 100n // Add 20% buffer
        }
      );

      // Update transaction with tx hash
      transaction.txHash = tx.hash;
      transaction.status = 'locked';
      transaction.updatedAt = new Date().toISOString();

      // Store transaction
      this.transactionQueue.set(transaction.id, transaction);

      this.logger.info(`Token transfer initiated: ${transaction.id}`, {
        txHash: tx.hash,
        fromChain: fromChain.name,
        toChain: toChain.name,
        amount
      });

      this.emit('transferInitiated', transaction);

      // Wait for confirmation
      const receipt = await tx.wait();
      if (receipt.status === 1) {
        transaction.status = 'confirmed';
        transaction.confirmedAt = new Date().toISOString();
        transaction.updatedAt = new Date().toISOString();

        this.logger.info(`Token transfer confirmed: ${transaction.id}`);
        this.emit('transferConfirmed', transaction);

        // Start monitoring for unlock on destination chain
        this.monitorUnlockTransaction(transaction);
      } else {
        transaction.status = 'failed';
        transaction.error = 'Transaction failed';
        transaction.updatedAt = new Date().toISOString();

        this.logger.error(`Token transfer failed: ${transaction.id}`);
        this.emit('transferFailed', transaction);
      }

      return transaction;
    } catch (error) {
      this.logger.error('Failed to transfer tokens:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Monitor unlock transaction on destination chain
   */
  private async monitorUnlockTransaction(transaction: BridgeTransaction): Promise<void> {
    try {
      const toChain = this.config.supportedChains.find(c => c.chainId === transaction.toChainId);
      if (!toChain) {
        throw new Error(`Chain ${transaction.toChainId} not supported`);
      }

      const contract = this.contracts.get(transaction.toChainId);
      if (!contract) {
        throw new Error(`Contract not found for chain ${transaction.toChainId}`);
      }

      // Monitor for unlock events
      const filter = contract.filters.TokensUnlocked(
        transaction.recipientAddress,
        transaction.amount,
        transaction.id
      );

      contract.on(filter, async (user, amount, nonce, sourceTxHash, event) => {
        if (sourceTxHash === transaction.txHash) {
          transaction.status = 'completed';
          transaction.completedAt = new Date().toISOString();
          transaction.updatedAt = new Date().toISOString();

          this.logger.info(`Token transfer completed: ${transaction.id}`);
          this.emit('transferCompleted', transaction);
        }
      });

      // Set timeout for monitoring
      setTimeout(() => {
        if (transaction.status === 'confirmed') {
          transaction.status = 'timeout';
          transaction.error = 'Unlock transaction timeout';
          transaction.updatedAt = new Date().toISOString();

          this.logger.warn(`Token transfer timeout: ${transaction.id}`);
          this.emit('transferTimeout', transaction);
        }
      }, this.config.unlockTimeout);

    } catch (error) {
      this.logger.error(`Failed to monitor unlock transaction ${transaction.id}:`, error);
    }
  }

  /**
   * Calculate bridge fee
   */
  async calculateBridgeFee(
    fromChainId: number,
    toChainId: number,
    useFastBridge: boolean = false
  ): Promise<BridgeFee> {
    try {
      const contract = this.contracts.get(fromChainId);
      if (!contract) {
        throw new Error(`Contract not found for chain ${fromChainId}`);
      }

      let fee: bigint;
      if (useFastBridge && contract.calculateBridgeFee) {
        fee = await contract.calculateBridgeFee(useFastBridge);
      } else {
        fee = await contract.bridgeFee();
      }

      return {
        amount: fee.toString(),
        currency: 'ETH', // or MATIC for Polygon
        useFastBridge,
        estimatedTime: useFastBridge ? '5-10 minutes' : '15-30 minutes'
      };
    } catch (error) {
      this.logger.error('Failed to calculate bridge fee:', error);
      throw error;
    }
  }

  /**
   * Get bridge statistics
   */
  async getBridgeStats(chainId: number): Promise<BridgeStats> {
    try {
      const contract = this.contracts.get(chainId);
      if (!contract) {
        throw new Error(`Contract not found for chain ${chainId}`);
      }

      const stats = await contract.getBridgeStats();
      
      return {
        chainId,
        totalValidators: Number(stats[0]),
        requiredSignatures: Number(stats[1]),
        bridgeFee: stats[2].toString(),
        minTransferAmount: stats[3].toString(),
        maxTransferAmount: stats[4].toString(),
        nonceCounter: Number(stats[5]),
        fastBridgeEnabled: stats[6] || false
      };
    } catch (error) {
      this.logger.error(`Failed to get bridge stats for chain ${chainId}:`, error);
      throw error;
    }
  }

  /**
   * Get transaction status
   */
  async getTransactionStatus(transactionId: string): Promise<BridgeTransaction | null> {
    return this.transactionQueue.get(transactionId) || null;
  }

  /**
   * Get all transactions for a user
   */
  async getUserTransactions(userAddress: string): Promise<BridgeTransaction[]> {
    const userTransactions: BridgeTransaction[] = [];
    
    for (const transaction of this.transactionQueue.values()) {
      if (transaction.senderAddress === userAddress || transaction.recipientAddress === userAddress) {
        userTransactions.push(transaction);
      }
    }

    return userTransactions.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  /**
   * Get supported chains
   */
  getSupportedChains(): ChainInfo[] {
    return this.config.supportedChains;
  }

  /**
   * Check if chain is supported
   */
  isChainSupported(chainId: number): boolean {
    return this.config.supportedChains.some(chain => chain.chainId === chainId);
  }

  /**
   * Get chain info
   */
  getChainInfo(chainId: number): ChainInfo | null {
    return this.config.supportedChains.find(chain => chain.chainId === chainId) || null;
  }

  /**
   * Start status monitoring
   */
  private startStatusMonitoring(): void {
    this.statusCheckInterval = setInterval(async () => {
      try {
        await this.checkPendingTransactions();
      } catch (error) {
        this.logger.error('Error in status monitoring:', error);
      }
    }, this.config.statusCheckInterval);
  }

  /**
   * Check pending transactions
   */
  private async checkPendingTransactions(): Promise<void> {
    for (const [id, transaction] of this.transactionQueue) {
      if (transaction.status === 'confirmed') {
        try {
          // Check if unlock transaction has occurred
          const toChain = this.config.supportedChains.find(c => c.chainId === transaction.toChainId);
          if (toChain) {
            const contract = this.contracts.get(transaction.toChainId);
            if (contract && transaction.txHash) {
              const isProcessed = await contract.isTransactionProcessed(transaction.txHash);
              if (isProcessed && transaction.status !== 'completed') {
                transaction.status = 'completed';
                transaction.completedAt = new Date().toISOString();
                transaction.updatedAt = new Date().toISOString();

                this.logger.info(`Transaction ${id} completed`);
                this.emit('transferCompleted', transaction);
              }
            }
          }
        } catch (error) {
          this.logger.error(`Error checking transaction ${id}:`, error);
        }
      }
    }
  }

  /**
   * Generate transaction ID
   */
  private generateTransactionId(): string {
    return `bridge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get bridge ABI
   */
  private getBridgeABI(): any[] {
    // This would contain the actual ABI for the bridge contracts
    // For now, returning a simplified version
    return [
      {
        "inputs": [
          {"name": "amount", "type": "uint256"},
          {"name": "targetChainId", "type": "uint256"},
          {"name": "targetAddress", "type": "address"},
          {"name": "useFastBridge", "type": "bool"}
        ],
        "name": "lockTokens",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "bridgeFee",
        "outputs": [{"name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [{"name": "useFastBridge", "type": "bool"}],
        "name": "calculateBridgeFee",
        "outputs": [{"name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "getBridgeStats",
        "outputs": [
          {"name": "", "type": "uint256"},
          {"name": "", "type": "uint256"},
          {"name": "", "type": "uint256"},
          {"name": "", "type": "uint256"},
          {"name": "", "type": "uint256"},
          {"name": "", "type": "uint256"},
          {"name": "", "type": "bool"}
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [{"name": "txHash", "type": "bytes32"}],
        "name": "isTransactionProcessed",
        "outputs": [{"name": "", "type": "bool"}],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "anonymous": false,
        "inputs": [
          {"indexed": true, "name": "user", "type": "address"},
          {"indexed": false, "name": "amount", "type": "uint256"},
          {"indexed": true, "name": "nonce", "type": "uint256"},
          {"indexed": true, "name": "sourceTxHash", "type": "bytes32"}
        ],
        "name": "TokensUnlocked",
        "type": "event"
      }
    ];
  }

  /**
   * Handle errors
   */
  private handleError(error: any): BridgeError {
    const bridgeError: BridgeError = {
      code: error.code || 'bridge_error',
      message: error.message || 'Unknown bridge error',
      type: 'bridge',
      details: {
        error: error.message,
        stack: error.stack
      },
      timestamp: new Date().toISOString()
    };

    this.emit('error', bridgeError);
    return bridgeError;
  }

  /**
   * Get service status
   */
  getStatus(): any {
    return {
      isInitialized: this.isInitialized,
      supportedChains: this.config.supportedChains.length,
      activeTransactions: this.transactionQueue.size,
      providers: Array.from(this.providers.keys()),
      contracts: Array.from(this.contracts.keys())
    };
  }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    try {
      if (this.statusCheckInterval) {
        clearInterval(this.statusCheckInterval);
        this.statusCheckInterval = null;
      }

      // Clear transaction queue
      this.transactionQueue.clear();

      // Clear providers and contracts
      this.providers.clear();
      this.contracts.clear();

      this.isInitialized = false;
      this.logger.info('CrossChainService cleaned up');
    } catch (error) {
      this.logger.error('Error during cleanup:', error);
      throw error;
    }
  }
}

export default CrossChainService;