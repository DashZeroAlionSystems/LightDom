/**
 * LDOM Economy Service
 * Manages the LightDOM token economy for the metaverse
 * Handles pricing, rewards, staking, and transactions
 */

import { serviceHub } from './ServiceHub';
import { databaseIntegration } from './DatabaseIntegration';
import { crawlerPersistence } from './CrawlerPersistenceService';
import { metaverseChatService } from './MetaverseChatService';

export interface TokenomicsConfig {
  totalSupply: string; // 1,000,000 LDOM
  circulatingSupply: string;
  stakingPool: string;
  rewardsPool: string;
  treasuryPool: string;
  burnedTokens: string;
}

export interface PricingModel {
  baseOptimizationReward: number; // LDOM per KB saved
  seoMultiplier: number; // 1.0 - 2.0 based on SEO score
  stakingAPY: number; // Annual percentage yield
  chatRoomBasePrice: number; // LDOM per KB of space
  portalFee: number; // LDOM for portal travel
  transactionFee: number; // Percentage
}

export interface UserEconomy {
  walletAddress: string;
  balance: string;
  stakedBalance: string;
  stakingRewards: string;
  totalEarned: string;
  totalSpent: string;
  transactionHistory: Transaction[];
  stakingHistory: StakingEvent[];
}

export interface Transaction {
  id: string;
  type: 'reward' | 'purchase' | 'transfer' | 'stake' | 'unstake' | 'fee';
  from: string;
  to: string;
  amount: string;
  description: string;
  metadata?: any;
  timestamp: Date;
  status: 'pending' | 'completed' | 'failed';
}

export interface StakingEvent {
  id: string;
  type: 'stake' | 'unstake' | 'reward';
  amount: string;
  timestamp: Date;
  lockPeriod?: number; // days
  apy: number;
}

export interface MarketplaceItem {
  id: string;
  type: 'chatroom' | 'slot' | 'portal' | 'nft';
  seller: string;
  price: string;
  description: string;
  metadata: any;
  listed: Date;
  sold?: Date;
  buyer?: string;
}

export class LDOMEconomyService {
  private tokenomics: TokenomicsConfig;
  private pricing: PricingModel;
  private userBalances: Map<string, UserEconomy> = new Map();
  private marketplace: Map<string, MarketplaceItem> = new Map();
  private stakingPool: Map<string, StakingEvent> = new Map();

  constructor() {
    this.tokenomics = {
      totalSupply: '1000000',
      circulatingSupply: '250000',
      stakingPool: '100000',
      rewardsPool: '400000',
      treasuryPool: '250000',
      burnedTokens: '0'
    };

    this.pricing = {
      baseOptimizationReward: 0.1, // 0.1 LDOM per KB
      seoMultiplier: 1.5,
      stakingAPY: 15, // 15% APY
      chatRoomBasePrice: 1, // 1 LDOM per KB
      portalFee: 10, // 10 LDOM
      transactionFee: 0.01 // 1%
    };

    this.loadPersistedData();
    this.startRewardDistribution();
  }

  /**
   * Load persisted economy data
   */
  private async loadPersistedData() {
    try {
      await databaseIntegration.initialize();
      
      // Load user balances
      const balances = await databaseIntegration.query(
        'SELECT * FROM user_economy',
        []
      );

      balances.rows.forEach(balance => {
        this.userBalances.set(balance.wallet_address, {
          walletAddress: balance.wallet_address,
          balance: balance.balance,
          stakedBalance: balance.staked_balance,
          stakingRewards: balance.staking_rewards,
          totalEarned: balance.total_earned,
          totalSpent: balance.total_spent,
          transactionHistory: JSON.parse(balance.transaction_history || '[]'),
          stakingHistory: JSON.parse(balance.staking_history || '[]')
        });
      });

      // Load marketplace
      const items = await databaseIntegration.query(
        'SELECT * FROM marketplace_items WHERE sold IS NULL',
        []
      );

      items.rows.forEach(item => {
        this.marketplace.set(item.id, {
          ...item,
          metadata: JSON.parse(item.metadata || '{}'),
          listed: new Date(item.listed)
        });
      });

      console.log(`💰 Loaded economy data for ${this.userBalances.size} users`);
    } catch (error) {
      console.error('Failed to load economy data:', error);
    }
  }

  /**
   * Calculate optimization reward
   */
  calculateOptimizationReward(spaceSaved: number, seoScore: number): number {
    const baseReward = (spaceSaved / 1024) * this.pricing.baseOptimizationReward;
    const seoBonus = 1 + (seoScore / 100) * (this.pricing.seoMultiplier - 1);
    return baseReward * seoBonus;
  }

  /**
   * Reward user for optimization
   */
  async rewardOptimization(
    walletAddress: string,
    spaceSaved: number,
    seoScore: number,
    url: string
  ): Promise<Transaction> {
    const reward = this.calculateOptimizationReward(spaceSaved, seoScore);
    
    // Check rewards pool
    if (parseFloat(this.tokenomics.rewardsPool) < reward) {
      throw new Error('Insufficient rewards pool');
    }

    // Create transaction
    const transaction: Transaction = {
      id: this.generateTransactionId(),
      type: 'reward',
      from: 'rewards_pool',
      to: walletAddress,
      amount: reward.toFixed(4),
      description: `Optimization reward for ${url}`,
      metadata: { spaceSaved, seoScore, url },
      timestamp: new Date(),
      status: 'pending'
    };

    try {
      // Update balances
      await this.updateBalance(walletAddress, reward, 'add');
      
      // Update tokenomics
      this.tokenomics.rewardsPool = (
        parseFloat(this.tokenomics.rewardsPool) - reward
      ).toFixed(4);
      this.tokenomics.circulatingSupply = (
        parseFloat(this.tokenomics.circulatingSupply) + reward
      ).toFixed(4);

      // Record transaction
      transaction.status = 'completed';
      await this.recordTransaction(transaction);

      // Emit event
      this.emitEconomyEvent('reward', {
        user: walletAddress,
        amount: reward,
        reason: 'optimization'
      });

      return transaction;
    } catch (error) {
      transaction.status = 'failed';
      throw error;
    }
  }

  /**
   * Purchase chatroom space
   */
  async purchaseChatRoomSpace(
    buyer: string,
    spaceKB: number,
    roomId: string
  ): Promise<Transaction> {
    const price = spaceKB * this.pricing.chatRoomBasePrice;
    const fee = price * this.pricing.transactionFee;
    const total = price + fee;

    // Check balance
    const userEconomy = await this.getUserEconomy(buyer);
    if (parseFloat(userEconomy.balance) < total) {
      throw new Error('Insufficient balance');
    }

    // Create transaction
    const transaction: Transaction = {
      id: this.generateTransactionId(),
      type: 'purchase',
      from: buyer,
      to: 'treasury_pool',
      amount: total.toFixed(4),
      description: `Chatroom space purchase: ${spaceKB}KB`,
      metadata: { roomId, spaceKB, price, fee },
      timestamp: new Date(),
      status: 'pending'
    };

    try {
      // Deduct from buyer
      await this.updateBalance(buyer, total, 'subtract');
      
      // Add to treasury (minus fee)
      this.tokenomics.treasuryPool = (
        parseFloat(this.tokenomics.treasuryPool) + price
      ).toFixed(4);

      // Burn transaction fee
      this.tokenomics.burnedTokens = (
        parseFloat(this.tokenomics.burnedTokens) + fee
      ).toFixed(4);
      this.tokenomics.circulatingSupply = (
        parseFloat(this.tokenomics.circulatingSupply) - fee
      ).toFixed(4);

      transaction.status = 'completed';
      await this.recordTransaction(transaction);

      return transaction;
    } catch (error) {
      transaction.status = 'failed';
      throw error;
    }
  }

  /**
   * Stake LDOM tokens
   */
  async stakeTokens(
    walletAddress: string,
    amount: number,
    lockPeriod: number = 30 // days
  ): Promise<StakingEvent> {
    const userEconomy = await this.getUserEconomy(walletAddress);
    
    if (parseFloat(userEconomy.balance) < amount) {
      throw new Error('Insufficient balance');
    }

    // Calculate APY based on lock period
    const apy = this.pricing.stakingAPY * (1 + lockPeriod / 365);

    const stakingEvent: StakingEvent = {
      id: this.generateStakingId(),
      type: 'stake',
      amount: amount.toFixed(4),
      timestamp: new Date(),
      lockPeriod,
      apy
    };

    // Move tokens to staking
    await this.updateBalance(walletAddress, amount, 'subtract');
    userEconomy.stakedBalance = (
      parseFloat(userEconomy.stakedBalance) + amount
    ).toFixed(4);
    
    // Update staking pool
    this.tokenomics.stakingPool = (
      parseFloat(this.tokenomics.stakingPool) + amount
    ).toFixed(4);
    this.tokenomics.circulatingSupply = (
      parseFloat(this.tokenomics.circulatingSupply) - amount
    ).toFixed(4);

    // Record staking event
    userEconomy.stakingHistory.push(stakingEvent);
    await this.persistUserEconomy(userEconomy);

    // Set up reward distribution
    this.scheduleStakingRewards(walletAddress, stakingEvent);

    return stakingEvent;
  }

  /**
   * List item on marketplace
   */
  async listOnMarketplace(
    seller: string,
    itemType: MarketplaceItem['type'],
    price: number,
    description: string,
    metadata: any
  ): Promise<MarketplaceItem> {
    const item: MarketplaceItem = {
      id: this.generateMarketplaceId(),
      type: itemType,
      seller,
      price: price.toFixed(4),
      description,
      metadata,
      listed: new Date()
    };

    // Validate ownership
    if (itemType === 'chatroom') {
      const room = metaverseChatService['chatRooms'].get(metadata.roomId);
      if (!room || room.owner !== seller) {
        throw new Error('Not the owner of this chatroom');
      }
    }

    // Add to marketplace
    this.marketplace.set(item.id, item);
    await this.persistMarketplaceItem(item);

    // Emit event
    this.emitEconomyEvent('listing', {
      seller,
      item
    });

    return item;
  }

  /**
   * Purchase from marketplace
   */
  async purchaseFromMarketplace(
    buyer: string,
    itemId: string
  ): Promise<Transaction> {
    const item = this.marketplace.get(itemId);
    if (!item) throw new Error('Item not found');
    if (item.sold) throw new Error('Item already sold');

    const price = parseFloat(item.price);
    const fee = price * this.pricing.transactionFee;
    const sellerAmount = price - fee;

    // Check buyer balance
    const buyerEconomy = await this.getUserEconomy(buyer);
    if (parseFloat(buyerEconomy.balance) < price) {
      throw new Error('Insufficient balance');
    }

    // Create transaction
    const transaction: Transaction = {
      id: this.generateTransactionId(),
      type: 'purchase',
      from: buyer,
      to: item.seller,
      amount: price.toFixed(4),
      description: `Marketplace purchase: ${item.description}`,
      metadata: { itemId, itemType: item.type, fee },
      timestamp: new Date(),
      status: 'pending'
    };

    try {
      // Transfer funds
      await this.updateBalance(buyer, price, 'subtract');
      await this.updateBalance(item.seller, sellerAmount, 'add');
      
      // Burn fee
      this.tokenomics.burnedTokens = (
        parseFloat(this.tokenomics.burnedTokens) + fee
      ).toFixed(4);
      this.tokenomics.circulatingSupply = (
        parseFloat(this.tokenomics.circulatingSupply) - fee
      ).toFixed(4);

      // Transfer ownership
      await this.transferOwnership(item, buyer);

      // Mark as sold
      item.sold = new Date();
      item.buyer = buyer;
      this.marketplace.delete(itemId);
      await this.persistMarketplaceItem(item);

      transaction.status = 'completed';
      await this.recordTransaction(transaction);

      return transaction;
    } catch (error) {
      transaction.status = 'failed';
      throw error;
    }
  }

  /**
   * Get user economy data
   */
  async getUserEconomy(walletAddress: string): Promise<UserEconomy> {
    let economy = this.userBalances.get(walletAddress);
    
    if (!economy) {
      economy = {
        walletAddress,
        balance: '0',
        stakedBalance: '0',
        stakingRewards: '0',
        totalEarned: '0',
        totalSpent: '0',
        transactionHistory: [],
        stakingHistory: []
      };
      
      this.userBalances.set(walletAddress, economy);
      await this.persistUserEconomy(economy);
    }

    return economy;
  }

  /**
   * Get tokenomics data
   */
  getTokenomics(): TokenomicsConfig {
    return { ...this.tokenomics };
  }

  /**
   * Get marketplace listings
   */
  getMarketplaceListings(filter?: {
    type?: MarketplaceItem['type'];
    maxPrice?: number;
    seller?: string;
  }): MarketplaceItem[] {
    let items = Array.from(this.marketplace.values());

    if (filter) {
      if (filter.type) {
        items = items.filter(item => item.type === filter.type);
      }
      if (filter.maxPrice !== undefined) {
        items = items.filter(item => parseFloat(item.price) <= filter.maxPrice);
      }
      if (filter.seller) {
        items = items.filter(item => item.seller === filter.seller);
      }
    }

    return items.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
  }

  /**
   * Calculate staking rewards
   */
  private calculateStakingReward(
    amount: number,
    apy: number,
    days: number
  ): number {
    const dailyRate = apy / 365 / 100;
    return amount * dailyRate * days;
  }

  /**
   * Schedule staking rewards
   */
  private scheduleStakingRewards(walletAddress: string, stakingEvent: StakingEvent) {
    // Calculate daily rewards
    const dailyReward = this.calculateStakingReward(
      parseFloat(stakingEvent.amount),
      stakingEvent.apy,
      1
    );

    // Add to pending rewards (distributed daily)
    const rewardJob = setInterval(async () => {
      try {
        const userEconomy = await this.getUserEconomy(walletAddress);
        userEconomy.stakingRewards = (
          parseFloat(userEconomy.stakingRewards) + dailyReward
        ).toFixed(4);
        
        await this.persistUserEconomy(userEconomy);
      } catch (error) {
        console.error('Failed to distribute staking reward:', error);
      }
    }, 24 * 60 * 60 * 1000); // Daily

    // Clear interval after lock period
    if (stakingEvent.lockPeriod) {
      setTimeout(() => {
        clearInterval(rewardJob);
      }, stakingEvent.lockPeriod * 24 * 60 * 60 * 1000);
    }
  }

  /**
   * Update user balance
   */
  private async updateBalance(
    walletAddress: string,
    amount: number,
    operation: 'add' | 'subtract'
  ) {
    const economy = await this.getUserEconomy(walletAddress);
    
    if (operation === 'add') {
      economy.balance = (parseFloat(economy.balance) + amount).toFixed(4);
      economy.totalEarned = (parseFloat(economy.totalEarned) + amount).toFixed(4);
    } else {
      const newBalance = parseFloat(economy.balance) - amount;
      if (newBalance < 0) throw new Error('Insufficient balance');
      
      economy.balance = newBalance.toFixed(4);
      economy.totalSpent = (parseFloat(economy.totalSpent) + amount).toFixed(4);
    }

    await this.persistUserEconomy(economy);
  }

  /**
   * Transfer ownership of marketplace item
   */
  private async transferOwnership(item: MarketplaceItem, newOwner: string) {
    if (item.type === 'chatroom') {
      // Update chatroom owner
      const room = metaverseChatService['chatRooms'].get(item.metadata.roomId);
      if (room) {
        room.owner = newOwner;
        // Persist chatroom update
      }
    } else if (item.type === 'slot') {
      // Update slot owner
      // TODO: Implement slot ownership transfer
    }
  }

  /**
   * Record transaction
   */
  private async recordTransaction(transaction: Transaction) {
    // Add to user history
    if (transaction.from !== 'rewards_pool' && transaction.from !== 'treasury_pool') {
      const fromEconomy = await this.getUserEconomy(transaction.from);
      fromEconomy.transactionHistory.push(transaction);
      await this.persistUserEconomy(fromEconomy);
    }

    if (transaction.to !== 'treasury_pool' && transaction.to !== 'burn') {
      const toEconomy = await this.getUserEconomy(transaction.to);
      toEconomy.transactionHistory.push(transaction);
      await this.persistUserEconomy(toEconomy);
    }

    // Persist to database
    await databaseIntegration.query(
      `INSERT INTO transactions (
        id, type, from_address, to_address, amount,
        description, metadata, timestamp, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        transaction.id, transaction.type, transaction.from,
        transaction.to, transaction.amount, transaction.description,
        JSON.stringify(transaction.metadata), transaction.timestamp,
        transaction.status
      ]
    );
  }

  /**
   * Persist user economy data
   */
  private async persistUserEconomy(economy: UserEconomy) {
    await databaseIntegration.query(
      `INSERT INTO user_economy (
        wallet_address, balance, staked_balance, staking_rewards,
        total_earned, total_spent, transaction_history, staking_history
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (wallet_address) DO UPDATE SET
        balance = $2, staked_balance = $3, staking_rewards = $4,
        total_earned = $5, total_spent = $6,
        transaction_history = $7, staking_history = $8`,
      [
        economy.walletAddress, economy.balance, economy.stakedBalance,
        economy.stakingRewards, economy.totalEarned, economy.totalSpent,
        JSON.stringify(economy.transactionHistory),
        JSON.stringify(economy.stakingHistory)
      ]
    );
  }

  /**
   * Persist marketplace item
   */
  private async persistMarketplaceItem(item: MarketplaceItem) {
    await databaseIntegration.query(
      `INSERT INTO marketplace_items (
        id, type, seller, price, description,
        metadata, listed, sold, buyer
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (id) DO UPDATE SET
        sold = $8, buyer = $9`,
      [
        item.id, item.type, item.seller, item.price,
        item.description, JSON.stringify(item.metadata),
        item.listed, item.sold, item.buyer
      ]
    );
  }

  /**
   * Emit economy event
   */
  private emitEconomyEvent(type: string, data: any) {
    // Integrate with event system
    console.log(`💰 Economy Event: ${type}`, data);
  }

  /**
   * Start reward distribution system
   */
  private startRewardDistribution() {
    // Distribute unclaimed staking rewards daily
    setInterval(async () => {
      for (const [walletAddress, economy] of this.userBalances) {
        if (parseFloat(economy.stakingRewards) > 0) {
          try {
            // Claim rewards automatically
            const rewards = parseFloat(economy.stakingRewards);
            economy.balance = (parseFloat(economy.balance) + rewards).toFixed(4);
            economy.stakingRewards = '0';
            
            await this.persistUserEconomy(economy);
            
            await this.recordTransaction({
              id: this.generateTransactionId(),
              type: 'reward',
              from: 'staking_pool',
              to: walletAddress,
              amount: rewards.toFixed(4),
              description: 'Staking rewards distribution',
              timestamp: new Date(),
              status: 'completed'
            });
          } catch (error) {
            console.error(`Failed to distribute rewards to ${walletAddress}:`, error);
          }
        }
      }
    }, 24 * 60 * 60 * 1000); // Daily
  }

  /**
   * Generate unique IDs
   */
  private generateTransactionId(): string {
    return `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateStakingId(): string {
    return `stake_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateMarketplaceId(): string {
    return `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export singleton
export const ldomEconomy = new LDOMEconomyService();


