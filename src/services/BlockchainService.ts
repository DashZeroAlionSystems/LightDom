import { ethers } from 'ethers';
import { Contract } from 'ethers';
import { getContractABI } from './ContractABIs';

export interface BlockchainConfig {
  rpcUrl: string;
  privateKey?: string;
  contractAddresses: {
    token: string;
    registry: string;
    nft: string;
  };
  networkId: number;
}

export interface OptimizationData {
  url: string;
  spaceBytes: number;
  proofHash: string;
  biomeType: string;
  metadata?: string;
}

export interface HarvesterStats {
  reputation: number;
  spaceHarvested: number;
  optimizations: number;
  successfulOptimizations: number;
  streak: number;
  tokensEarned: string;
  stakedAmount: string;
  stakingRewards: string;
}

export interface MetaverseStats {
  land: number;
  nodes: number;
  shards: number;
  bridges: number;
}

export class BlockchainService {
  private provider: ethers.Provider;
  private wallet: ethers.Wallet | null = null;
  private tokenContract: Contract | null = null;
  private registryContract: Contract | null = null;
  private nftContract: Contract | null = null;
  private config: BlockchainConfig;

  constructor(config: BlockchainConfig) {
    this.config = config;
    this.provider = new ethers.JsonRpcProvider(config.rpcUrl);
    
    if (config.privateKey) {
      this.wallet = new ethers.Wallet(config.privateKey, this.provider);
    }
  }

  /**
   * Initialize contracts with ABIs
   */
  async initializeContracts() {
    try {
      // Load contract ABIs (you'll need to add these)
      const tokenABI = await this.loadABI('LightDomToken');
      const registryABI = await this.loadABI('OptimizationRegistry');
      const nftABI = await this.loadABI('VirtualLandNFT');

      if (this.wallet) {
        this.tokenContract = new ethers.Contract(
          this.config.contractAddresses.token,
          tokenABI,
          this.wallet
        );

        this.registryContract = new ethers.Contract(
          this.config.contractAddresses.registry,
          registryABI,
          this.wallet
        );

        this.nftContract = new ethers.Contract(
          this.config.contractAddresses.nft,
          nftABI,
          this.wallet
        );
      } else {
        // Read-only contracts
        this.tokenContract = new ethers.Contract(
          this.config.contractAddresses.token,
          tokenABI,
          this.provider
        );

        this.registryContract = new ethers.Contract(
          this.config.contractAddresses.registry,
          registryABI,
          this.provider
        );

        this.nftContract = new ethers.Contract(
          this.config.contractAddresses.nft,
          nftABI,
          this.provider
        );
      }

      console.log('✅ Blockchain contracts initialized');
    } catch (error) {
      console.error('❌ Failed to initialize contracts:', error);
      throw error;
    }
  }

  /**
   * Submit optimization to blockchain
   */
  async submitOptimization(data: OptimizationData): Promise<string> {
    if (!this.tokenContract || !this.wallet) {
      throw new Error('Wallet not initialized');
    }

    try {
      // First register the optimization
      const registerTx = await this.registryContract!.registerOptimization(
        data.url,
        data.spaceBytes,
        data.proofHash,
        data.biomeType,
        data.metadata || ''
      );

      await registerTx.wait();

      // Then submit to token contract for rewards
      const submitTx = await this.tokenContract.submitOptimization(
        data.url,
        data.spaceBytes,
        data.proofHash,
        data.biomeType
      );

      const receipt = await submitTx.wait();
      return receipt.hash;
    } catch (error) {
      console.error('❌ Failed to submit optimization:', error);
      throw error;
    }
  }

  /**
   * Get harvester statistics
   */
  async getHarvesterStats(address: string): Promise<HarvesterStats> {
    if (!this.tokenContract) {
      throw new Error('Token contract not initialized');
    }

    try {
      const stats = await this.tokenContract.getHarvesterStats(address);
      
      return {
        reputation: Number(stats.reputation),
        spaceHarvested: Number(stats.spaceHarvested),
        optimizations: Number(stats.optimizations),
        successfulOptimizations: Number(stats.successfulOptimizations),
        streak: Number(stats.streak),
        tokensEarned: ethers.formatEther(stats.tokensEarned),
        stakedAmount: ethers.formatEther(stats.stakedAmount),
        stakingRewards: ethers.formatEther(stats.stakingRewards)
      };
    } catch (error) {
      console.error('❌ Failed to get harvester stats:', error);
      throw error;
    }
  }

  /**
   * Get metaverse statistics
   */
  async getMetaverseStats(): Promise<MetaverseStats> {
    if (!this.tokenContract) {
      throw new Error('Token contract not initialized');
    }

    try {
      const stats = await this.tokenContract.getMetaverseStats();
      
      return {
        land: Number(stats.land),
        nodes: Number(stats.nodes),
        shards: Number(stats.shards),
        bridges: Number(stats.bridges)
      };
    } catch (error) {
      console.error('❌ Failed to get metaverse stats:', error);
      throw error;
    }
  }

  /**
   * Stake tokens
   */
  async stakeTokens(amount: string): Promise<string> {
    if (!this.tokenContract || !this.wallet) {
      throw new Error('Wallet not initialized');
    }

    try {
      const tx = await this.tokenContract.stakeTokens(
        ethers.parseEther(amount)
      );
      
      const receipt = await tx.wait();
      return receipt.hash;
    } catch (error) {
      console.error('❌ Failed to stake tokens:', error);
      throw error;
    }
  }

  /**
   * Unstake tokens
   */
  async unstakeTokens(amount: string): Promise<string> {
    if (!this.tokenContract || !this.wallet) {
      throw new Error('Wallet not initialized');
    }

    try {
      const tx = await this.tokenContract.unstakeTokens(
        ethers.parseEther(amount)
      );
      
      const receipt = await tx.wait();
      return receipt.hash;
    } catch (error) {
      console.error('❌ Failed to unstake tokens:', error);
      throw error;
    }
  }

  /**
   * Claim staking rewards
   */
  async claimStakingRewards(): Promise<string> {
    if (!this.tokenContract || !this.wallet) {
      throw new Error('Wallet not initialized');
    }

    try {
      const tx = await this.tokenContract.claimStakingRewards();
      const receipt = await tx.wait();
      return receipt.hash;
    } catch (error) {
      console.error('❌ Failed to claim staking rewards:', error);
      throw error;
    }
  }

  /**
   * Get token balance
   */
  async getTokenBalance(address: string): Promise<string> {
    if (!this.tokenContract) {
      throw new Error('Token contract not initialized');
    }

    try {
      const balance = await this.tokenContract.balanceOf(address);
      return ethers.formatEther(balance);
    } catch (error) {
      console.error('❌ Failed to get token balance:', error);
      throw error;
    }
  }

  /**
   * Get staking rewards
   */
  async getStakingRewards(address: string): Promise<string> {
    if (!this.tokenContract) {
      throw new Error('Token contract not initialized');
    }

    try {
      const rewards = await this.tokenContract.calculateStakingRewards(address);
      return ethers.formatEther(rewards);
    } catch (error) {
      console.error('❌ Failed to get staking rewards:', error);
      throw error;
    }
  }

  /**
   * Get network information
   */
  async getNetworkInfo() {
    try {
      const network = await this.provider.getNetwork();
      const blockNumber = await this.provider.getBlockNumber();
      const gasPrice = await this.provider.getFeeData();

      return {
        chainId: Number(network.chainId),
        name: network.name,
        blockNumber,
        gasPrice: gasPrice.gasPrice ? ethers.formatUnits(gasPrice.gasPrice, 'gwei') : '0'
      };
    } catch (error) {
      console.error('❌ Failed to get network info:', error);
      throw error;
    }
  }

  /**
   * Estimate gas for transaction
   */
  async estimateGas(method: string, ...args: any[]): Promise<string> {
    if (!this.tokenContract) {
      throw new Error('Token contract not initialized');
    }

    try {
      const gasEstimate = await this.tokenContract[method].estimateGas(...args);
      return gasEstimate.toString();
    } catch (error) {
      console.error('❌ Failed to estimate gas:', error);
      throw error;
    }
  }

  /**
   * Load contract ABI from file
   */
  private async loadABI(contractName: string): Promise<any[]> {
    try {
      return getContractABI(contractName);
    } catch (error) {
      console.error(`❌ Failed to load ABI for ${contractName}:`, error);
      throw error;
    }
  }

  /**
   * Create a new wallet
   */
  static createWallet(): ethers.Wallet {
    return ethers.Wallet.createRandom();
  }

  /**
   * Import wallet from private key
   */
  static importWallet(privateKey: string, provider: ethers.Provider): ethers.Wallet {
    return new ethers.Wallet(privateKey, provider);
  }

  /**
   * Validate Ethereum address
   */
  static isValidAddress(address: string): boolean {
    return ethers.isAddress(address);
  }

  /**
   * Format token amount
   */
  static formatTokenAmount(amount: string, decimals: number = 18): string {
    return ethers.formatUnits(amount, decimals);
  }

  /**
   * Parse token amount
   */
  static parseTokenAmount(amount: string, decimals: number = 18): string {
    return ethers.parseUnits(amount, decimals).toString();
  }
}