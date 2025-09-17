import { useState, useCallback } from 'react';

interface NetworkInfo {
  chainId: number;
  name: string;
}

export const useBlockchain = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [networkInfo, setNetworkInfo] = useState<NetworkInfo | null>(null);

  const connectWallet = useCallback(async () => {
    // Minimal stub; integrate real provider later
    setIsConnected(true);
    setNetworkInfo({ chainId: 1, name: 'Ethereum' });
  }, []);

  const disconnectWallet = useCallback(() => {
    setIsConnected(false);
    setNetworkInfo(null);
  }, []);

  return {
    connectWallet,
    disconnectWallet,
    isConnected,
    networkInfo,
  };
};

export type { NetworkInfo };


