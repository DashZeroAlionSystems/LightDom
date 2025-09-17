import { useState, useEffect } from 'react';

interface Token {
  id: string;
  name: string;
  symbol: string;
  balance: number;
  price: number;
  value: number;
  change24h: number;
  icon?: string;
}

interface Transaction {
  id: string;
  type: 'sent' | 'received' | 'reward' | 'swap' | 'stake';
  amount: number;
  token: string;
  price: number;
  address: string;
  hash: string;
  status: 'pending' | 'confirmed' | 'failed';
  date: string;
  gasUsed?: number;
  gasPrice?: number;
}

interface Wallet {
  address: string;
  balance: number;
  totalValue: number;
  pendingRewards: number;
  totalEarned: number;
  rewardHistory: Array<{
    type: string;
    amount: number;
    date: string;
  }>;
}

interface SendTokensData {
  recipient: string;
  amount: number;
  token: string;
  gasPrice?: number;
}

export const useWallet = () => {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWalletData();
  }, []);

  const fetchWalletData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/wallet', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setWallet(data.wallet);
        setTokens(data.tokens);
        setTransactions(data.transactions);
      }
    } catch (error) {
      console.error('Failed to fetch wallet data:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendTokens = async (data: SendTokensData) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/wallet/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const result = await response.json();
        // Add transaction to local state
        setTransactions(prev => [result.transaction, ...prev]);
        // Update token balance
        setTokens(prev =>
          prev.map(t =>
            t.symbol === data.token
              ? { ...t, balance: t.balance - data.amount }
              : t
          )
        );
        return result;
      } else {
        throw new Error('Failed to send tokens');
      }
    } catch (error) {
      console.error('Failed to send tokens:', error);
      throw error;
    }
  };

  const receiveTokens = async (amount: number, token: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/wallet/receive', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ amount, token }),
      });

      if (response.ok) {
        const result = await response.json();
        // Add transaction to local state
        setTransactions(prev => [result.transaction, ...prev]);
        // Update token balance
        setTokens(prev =>
          prev.map(t =>
            t.symbol === token
              ? { ...t, balance: t.balance + amount }
              : t
          )
        );
        return result;
      } else {
        throw new Error('Failed to receive tokens');
      }
    } catch (error) {
      console.error('Failed to receive tokens:', error);
      throw error;
    }
  };

  const claimRewards = async (amount: number) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/wallet/claim-rewards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ amount }),
      });

      if (response.ok) {
        const result = await response.json();
        // Update wallet state
        setWallet(prev => prev ? {
          ...prev,
          pendingRewards: prev.pendingRewards - amount,
          totalEarned: prev.totalEarned + amount,
          rewardHistory: [
            ...prev.rewardHistory,
            {
              type: 'Claimed Rewards',
              amount,
              date: new Date().toISOString(),
            }
          ]
        } : null);
        // Add transaction to local state
        setTransactions(prev => [result.transaction, ...prev]);
        return result;
      } else {
        throw new Error('Failed to claim rewards');
      }
    } catch (error) {
      console.error('Failed to claim rewards:', error);
      throw error;
    }
  };

  const swapTokens = async (fromToken: string, toToken: string, amount: number) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/wallet/swap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ fromToken, toToken, amount }),
      });

      if (response.ok) {
        const result = await response.json();
        // Update token balances
        setTokens(prev =>
          prev.map(t => {
            if (t.symbol === fromToken) {
              return { ...t, balance: t.balance - amount };
            } else if (t.symbol === toToken) {
              return { ...t, balance: t.balance + result.amountReceived };
            }
            return t;
          })
        );
        // Add transaction to local state
        setTransactions(prev => [result.transaction, ...prev]);
        return result;
      } else {
        throw new Error('Failed to swap tokens');
      }
    } catch (error) {
      console.error('Failed to swap tokens:', error);
      throw error;
    }
  };

  const stakeTokens = async (amount: number, token: string, duration: number) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/wallet/stake', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ amount, token, duration }),
      });

      if (response.ok) {
        const result = await response.json();
        // Update token balance
        setTokens(prev =>
          prev.map(t =>
            t.symbol === token
              ? { ...t, balance: t.balance - amount }
              : t
          )
        );
        // Add transaction to local state
        setTransactions(prev => [result.transaction, ...prev]);
        return result;
      } else {
        throw new Error('Failed to stake tokens');
      }
    } catch (error) {
      console.error('Failed to stake tokens:', error);
      throw error;
    }
  };

  const getTransactionHistory = async (page = 1, limit = 20) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/wallet/transactions?page=${page}&limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        return data;
      } else {
        throw new Error('Failed to get transaction history');
      }
    } catch (error) {
      console.error('Failed to get transaction history:', error);
      throw error;
    }
  };

  const getTokenPrice = async (symbol: string) => {
    try {
      const response = await fetch(`/api/wallet/price/${symbol}`);
      if (response.ok) {
        const data = await response.json();
        return data.price;
      } else {
        throw new Error('Failed to get token price');
      }
    } catch (error) {
      console.error('Failed to get token price:', error);
      throw error;
    }
  };

  const refreshWalletData = () => {
    fetchWalletData();
  };

  return {
    wallet,
    tokens,
    transactions,
    loading,
    sendTokens,
    receiveTokens,
    claimRewards,
    swapTokens,
    stakeTokens,
    getTransactionHistory,
    getTokenPrice,
    refreshWalletData,
  };
};
