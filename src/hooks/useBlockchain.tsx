import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { BlockchainService, BlockchainConfig, HarvesterStats, MetaverseStats, OptimizationData } from '../services/BlockchainService';

interface BlockchainContextType {
  blockchainService: BlockchainService | null;
  userAddress: string | null;
  isConnected: boolean;
  loading: boolean;
  error: string | null;
  
  // Stats
  harvesterStats: HarvesterStats | null;
  metaverseStats: MetaverseStats | null;
  tokenBalance: string;
  stakingRewards: string;
  networkInfo: any;
  
  // Actions
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  submitOptimization: (data: OptimizationData) => Promise<string>;
  stakeTokens: (amount: string) => Promise<string>;
  unstakeTokens: (amount: string) => Promise<string>;
  claimStakingRewards: () => Promise<string>;
  refreshData: () => Promise<void>;
}

const BlockchainContext = createContext<BlockchainContextType | undefined>(undefined);

export const useBlockchain = () => {
  const context = useContext(BlockchainContext);
  if (!context) {
    throw new Error('useBlockchain must be used within a BlockchainProvider');
  }
  return context;
};

export const BlockchainProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [blockchainService, setBlockchainService] = useState<BlockchainService | null>(null);
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Stats state
  const [harvesterStats, setHarvesterStats] = useState<HarvesterStats | null>(null);
  const [metaverseStats, setMetaverseStats] = useState<MetaverseStats | null>(null);
  const [tokenBalance, setTokenBalance] = useState<string>('0');
  const [stakingRewards, setStakingRewards] = useState<string>('0');
  const [networkInfo, setNetworkInfo] = useState<any>(null);

  // Initialize blockchain service
  useEffect(() => {
    const initializeBlockchain = async () => {
      try {
        const config: BlockchainConfig = {
          rpcUrl: import.meta.env.VITE_RPC_URL || 'http://localhost:8545',
          contractAddresses: {
            token: import.meta.env.VITE_TOKEN_CONTRACT_ADDRESS || '',
            registry: import.meta.env.VITE_REGISTRY_CONTRACT_ADDRESS || '',
            nft: import.meta.env.VITE_NFT_CONTRACT_ADDRESS || ''
          },
          networkId: parseInt(import.meta.env.VITE_CHAIN_ID || '1337')
        };

        const service = new BlockchainService(config);
        await service.initializeContracts();
        
        setBlockchainService(service);
        
        // Check if wallet is already connected
        const savedAddress = localStorage.getItem('wallet_address');
        if (savedAddress) {
          setUserAddress(savedAddress);
          setIsConnected(true);
          await loadUserData(savedAddress, service);
        }
      } catch (error) {
        console.error('Failed to initialize blockchain:', error);
        setError('Failed to initialize blockchain service');
      }
    };

    initializeBlockchain();
  }, []);

  // Load user data
  const loadUserData = async (address: string, service: BlockchainService) => {
    try {
      setLoading(true);
      setError(null);

      // Use API endpoints for now (mock data)
      const [statsResponse, metaverseResponse, networkResponse, balanceResponse, rewardsResponse] = await Promise.all([
        fetch(`/api/blockchain/harvester-stats/${address}`).then(res => res.json()).catch(() => ({ success: false })),
        fetch('/api/blockchain/metaverse-stats').then(res => res.json()).catch(() => ({ success: false })),
        fetch('/api/blockchain/network-info').then(res => res.json()).catch(() => ({ success: false })),
        fetch(`/api/blockchain/token-balance/${address}`).then(res => res.json()).catch(() => ({ success: false })),
        fetch(`/api/blockchain/staking-rewards/${address}`).then(res => res.json()).catch(() => ({ success: false }))
      ]);

      if (statsResponse.success) setHarvesterStats(statsResponse.data);
      if (metaverseResponse.success) setMetaverseStats(metaverseResponse.data);
      if (networkResponse.success) setNetworkInfo(networkResponse.data);
      if (balanceResponse.success) setTokenBalance(balanceResponse.data.balance);
      if (rewardsResponse.success) setStakingRewards(rewardsResponse.data.rewards);
    } catch (error) {
      console.error('Failed to load user data:', error);
      setError('Failed to load blockchain data');
    } finally {
      setLoading(false);
    }
  };

  // Connect wallet
  const connectWallet = useCallback(async () => {
    if (!blockchainService) {
      setError('Blockchain service not initialized');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Check if MetaMask is available
      if (typeof window.ethereum !== 'undefined') {
        // Request account access
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts'
        });

        if (accounts.length > 0) {
          const address = accounts[0];
          setUserAddress(address);
          setIsConnected(true);
          localStorage.setItem('wallet_address', address);
          
          await loadUserData(address, blockchainService);
        }
      } else {
        throw new Error('MetaMask not detected. Please install MetaMask.');
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      setError(error instanceof Error ? error.message : 'Failed to connect wallet');
    } finally {
      setLoading(false);
    }
  }, [blockchainService]);

  // Disconnect wallet
  const disconnectWallet = useCallback(() => {
    setUserAddress(null);
    setIsConnected(false);
    setHarvesterStats(null);
    setMetaverseStats(null);
    setTokenBalance('0');
    setStakingRewards('0');
    setNetworkInfo(null);
    localStorage.removeItem('wallet_address');
  }, []);

  // Submit optimization
  const submitOptimization = useCallback(async (data: OptimizationData): Promise<string> => {
    if (!userAddress) {
      throw new Error('Wallet not connected');
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/blockchain/submit-optimization', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to submit optimization');
      }
      
      // Refresh data after successful submission
      await loadUserData(userAddress, blockchainService!);
      
      return result.data.txHash;
    } catch (error) {
      console.error('Failed to submit optimization:', error);
      setError(error instanceof Error ? error.message : 'Failed to submit optimization');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [userAddress, blockchainService]);

  // Stake tokens
  const stakeTokens = useCallback(async (amount: string): Promise<string> => {
    if (!blockchainService || !userAddress) {
      throw new Error('Wallet not connected');
    }

    try {
      setLoading(true);
      setError(null);

      const txHash = await blockchainService.stakeTokens(amount);
      
      // Refresh data after successful staking
      await loadUserData(userAddress, blockchainService);
      
      return txHash;
    } catch (error) {
      console.error('Failed to stake tokens:', error);
      setError(error instanceof Error ? error.message : 'Failed to stake tokens');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [blockchainService, userAddress]);

  // Unstake tokens
  const unstakeTokens = useCallback(async (amount: string): Promise<string> => {
    if (!blockchainService || !userAddress) {
      throw new Error('Wallet not connected');
    }

    try {
      setLoading(true);
      setError(null);

      const txHash = await blockchainService.unstakeTokens(amount);
      
      // Refresh data after successful unstaking
      await loadUserData(userAddress, blockchainService);
      
      return txHash;
    } catch (error) {
      console.error('Failed to unstake tokens:', error);
      setError(error instanceof Error ? error.message : 'Failed to unstake tokens');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [blockchainService, userAddress]);

  // Claim staking rewards
  const claimStakingRewards = useCallback(async (): Promise<string> => {
    if (!blockchainService || !userAddress) {
      throw new Error('Wallet not connected');
    }

    try {
      setLoading(true);
      setError(null);

      const txHash = await blockchainService.claimStakingRewards();
      
      // Refresh data after successful claim
      await loadUserData(userAddress, blockchainService);
      
      return txHash;
    } catch (error) {
      console.error('Failed to claim rewards:', error);
      setError(error instanceof Error ? error.message : 'Failed to claim rewards');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [blockchainService, userAddress]);

  // Refresh data
  const refreshData = useCallback(async () => {
    if (userAddress && blockchainService) {
      await loadUserData(userAddress, blockchainService);
    }
  }, [userAddress, blockchainService]);

  // Auto-refresh data every 30 seconds
  useEffect(() => {
    if (isConnected && userAddress && blockchainService) {
      const interval = setInterval(refreshData, 30000);
      return () => clearInterval(interval);
    }
  }, [isConnected, userAddress, blockchainService, refreshData]);

  const value: BlockchainContextType = {
    blockchainService,
    userAddress,
    isConnected,
    loading,
    error,
    harvesterStats,
    metaverseStats,
    tokenBalance,
    stakingRewards,
    networkInfo,
    connectWallet,
    disconnectWallet,
    submitOptimization,
    stakeTokens,
    unstakeTokens,
    claimStakingRewards,
    refreshData
  };

  return (
    <BlockchainContext.Provider value={value}>
      {children}
    </BlockchainContext.Provider>
  );
};

// Extend Window interface for MetaMask
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, callback: (accounts: string[]) => void) => void;
      removeListener: (event: string, callback: (accounts: string[]) => void) => void;
    };
  }
}