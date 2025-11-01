// Cross-chain bridge types for blockchain interoperability
export interface BridgeTransaction {
  id: string;
  fromChainId: number;
  toChainId: number;
  amount: string;
  recipientAddress: string;
  senderAddress: string;
  status: BridgeStatus;
  // Bridge fee may be represented as a numeric value, BN, or a detailed
  // BridgeFee object depending on implementation. Allow any here during
  // triage.
  bridgeFee: any;
  useFastBridge: boolean;
  txHash?: string;
  unlockTxHash?: string;
  confirmedAt?: string;
  completedAt?: string;
  error?: string;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, any>;
}

export type BridgeStatus = 'pending' | 'locked' | 'confirmed' | 'unlocking' | 'completed' | 'failed' | 'timeout';

export interface BridgeConfig {
  enabled: boolean;
  supportedChains: ChainInfo[];
  bridgeContractAddresses: Record<number, string>;
  fastBridgeEnabled: boolean;
  gasMultiplier: number;
  monitoringInterval: number;
  unlockTimeout: number;
  statusCheckInterval: number;
}

export interface ChainInfo {
  id: number;
  name: string;
  rpcUrl: string;
  nativeCurrency: string;
  blockExplorerUrl: string;
  isTestnet: boolean;
  // Optional aliases used by some runtime code
  chainId?: number;
  bridgeAddress?: string;
}

export interface BridgeFee {
  amount: string;
  currency: string;
  estimatedGas: string;
  useFastBridge?: boolean;
  estimatedTime?: string;
}

export interface BridgeStats {
  totalTransactions: number;
  successfulTransactions: number;
  failedTransactions: number;
  totalVolume: string;
  averageBridgeTime: number;
  chainId?: number;
  totalValidators?: number;
  requiredSignatures?: number;
  bridgeFee?: string;
  minTransferAmount?: string;
  maxTransferAmount?: string;
  nonceCounter?: number;
  fastBridgeEnabled?: boolean;
}

export interface BridgeError {
  code: string;
  message: string;
  transactionId?: string;
  details?: any;
}