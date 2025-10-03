// Cross-Chain Bridge Types for LightDom Platform

export interface ChainInfo {
  chainId: number;
  name: string;
  symbol: string;
  rpcUrl: string;
  bridgeAddress: string;
  tokenAddress: string;
  explorerUrl: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  blockTime: number; // Average block time in seconds
  isTestnet: boolean;
}

export interface BridgeTransaction {
  id: string;
  fromChainId: number;
  toChainId: number;
  amount: string;
  recipientAddress: string;
  senderAddress: string;
  status: BridgeStatus;
  txHash?: string;
  bridgeFee: BridgeFee;
  useFastBridge: boolean;
  createdAt: string;
  updatedAt: string;
  confirmedAt?: string;
  completedAt?: string;
  error?: string;
  metadata: Record<string, any>;
}

export type BridgeStatus = 
  | 'pending'
  | 'locked'
  | 'confirmed'
  | 'completed'
  | 'failed'
  | 'timeout'
  | 'cancelled';

export interface BridgeFee {
  amount: string;
  currency: string;
  useFastBridge: boolean;
  estimatedTime: string;
}

export interface BridgeConfig {
  supportedChains: ChainInfo[];
  unlockTimeout: number; // Timeout in milliseconds
  statusCheckInterval: number; // Check interval in milliseconds
  maxRetries: number;
  retryDelay: number;
  defaultGasLimit: string;
  defaultGasPrice: string;
}

export interface BridgeStats {
  chainId: number;
  totalValidators: number;
  requiredSignatures: number;
  bridgeFee: string;
  minTransferAmount: string;
  maxTransferAmount: string;
  nonceCounter: number;
  fastBridgeEnabled: boolean;
}

export interface BridgeValidator {
  address: string;
  chainId: number;
  isActive: boolean;
  reputation: number;
  totalSignatures: number;
  lastActive: string;
  metadata: Record<string, any>;
}

export interface BridgeEvent {
  type: 'transferInitiated' | 'transferConfirmed' | 'transferCompleted' | 'transferFailed' | 'transferTimeout';
  transaction: BridgeTransaction;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface BridgeError {
  code: string;
  message: string;
  type: 'validation' | 'network' | 'bridge' | 'contract' | 'system';
  details?: Record<string, any>;
  timestamp: string;
}

export interface BridgeLimits {
  minTransferAmount: string;
  maxTransferAmount: string;
  dailyLimit: string;
  monthlyLimit: string;
  maxTransactionsPerDay: number;
  maxTransactionsPerMonth: number;
}

export interface BridgeSecurity {
  requiredSignatures: number;
  validatorThreshold: number;
  timeLock: number; // Time lock in seconds
  maxSlippage: number; // Maximum slippage percentage
  emergencyPause: boolean;
  upgradeDelay: number; // Upgrade delay in seconds
}

export interface BridgeAnalytics {
  totalTransactions: number;
  totalVolume: string;
  averageTransactionSize: string;
  successRate: number;
  averageConfirmationTime: number;
  topSourceChains: Array<{
    chainId: number;
    chainName: string;
    transactionCount: number;
    volume: string;
  }>;
  topDestinationChains: Array<{
    chainId: number;
    chainName: string;
    transactionCount: number;
    volume: string;
  }>;
  dailyStats: Array<{
    date: string;
    transactions: number;
    volume: string;
    fees: string;
  }>;
}

export interface BridgeNotification {
  id: string;
  userId: string;
  transactionId: string;
  type: 'status_update' | 'completion' | 'failure' | 'fee_update';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  metadata?: Record<string, any>;
}

export interface BridgeRoute {
  fromChainId: number;
  toChainId: number;
  intermediateChains?: number[];
  estimatedTime: number; // Estimated time in minutes
  totalFee: string;
  gasEstimate: string;
  isAvailable: boolean;
  reason?: string;
}

export interface BridgeQuote {
  fromChainId: number;
  toChainId: number;
  amount: string;
  recipientAddress: string;
  useFastBridge: boolean;
  estimatedFee: BridgeFee;
  estimatedTime: string;
  route: BridgeRoute;
  slippage: number;
  expiresAt: string;
}

export interface BridgeHealth {
  chainId: number;
  status: 'healthy' | 'degraded' | 'down';
  lastBlock: number;
  blockTime: number;
  validatorCount: number;
  activeValidators: number;
  lastHealthCheck: string;
  issues: string[];
}

export interface BridgeGovernance {
  proposalId: string;
  title: string;
  description: string;
  proposer: string;
  startTime: string;
  endTime: string;
  status: 'active' | 'passed' | 'failed' | 'executed';
  votes: {
    for: number;
    against: number;
    abstain: number;
  };
  quorum: number;
  threshold: number;
}

// Event types
export interface BridgeEvents {
  'transferInitiated': (transaction: BridgeTransaction) => void;
  'transferConfirmed': (transaction: BridgeTransaction) => void;
  'transferCompleted': (transaction: BridgeTransaction) => void;
  'transferFailed': (transaction: BridgeTransaction) => void;
  'transferTimeout': (transaction: BridgeTransaction) => void;
  'validatorAdded': (validator: BridgeValidator) => void;
  'validatorRemoved': (validator: BridgeValidator) => void;
  'bridgeFeeUpdated': (chainId: number, newFee: string) => void;
  'chainAdded': (chain: ChainInfo) => void;
  'chainRemoved': (chainId: number) => void;
  'healthCheck': (health: BridgeHealth[]) => void;
  'error': (error: BridgeError) => void;
}

// Utility types
export type BridgeEventType = keyof BridgeEvents;
export type SupportedChainType = 'ethereum' | 'polygon' | 'bsc' | 'arbitrum' | 'optimism';
export type BridgeFeeType = 'standard' | 'fast' | 'priority';
export type BridgeSecurityLevel = 'low' | 'medium' | 'high' | 'maximum';