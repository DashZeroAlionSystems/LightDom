/**
 * LightDom Wallet Service - Handles wallet operations and API integration
 */

export interface WalletBalance {
  lightdom: number;
  usd: number;
  btc: number;
  eth: number;
  lastUpdated: string;
}

export interface Transaction {
  id: string;
  type: 'purchase' | 'sale' | 'transfer' | 'mining' | 'reward';
  amount: number;
  currency: 'LDC' | 'USD' | 'BTC' | 'ETH';
  description: string;
  status: 'completed' | 'pending' | 'failed';
  timestamp: string;
  hash?: string;
  from?: string;
  to?: string;
}

export interface PurchaseItem {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: 'LDC' | 'USD';
  category: 'space' | 'tools' | 'upgrades' | 'cosmetics';
  image: string;
  discount?: number;
  featured?: boolean;
}

export interface PurchaseRequest {
  itemId: string;
  quantity?: number;
  paymentMethod?: 'lightdom' | 'crypto' | 'fiat';
}

export interface TransferRequest {
  to: string;
  amount: number;
  currency: 'LDC' | 'USD' | 'BTC' | 'ETH';
  description?: string;
}

class WalletService {
  private baseUrl = '/api/wallet';

  /**
   * Get wallet balance for the current user
   */
  async getBalance(): Promise<WalletBalance> {
    try {
      const response = await fetch(`${this.baseUrl}/balance`);
      if (!response.ok) {
        throw new Error('Failed to fetch wallet balance');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching wallet balance:', error);
      throw error;
    }
  }

  /**
   * Get transaction history
   */
  async getTransactions(limit = 50, offset = 0): Promise<Transaction[]> {
    try {
      const response = await fetch(`${this.baseUrl}/transactions?limit=${limit}&offset=${offset}`);
      if (!response.ok) {
        throw new Error('Failed to fetch transactions');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching transactions:', error);
      throw error;
    }
  }

  /**
   * Get available purchase items
   */
  async getPurchaseItems(category?: string): Promise<PurchaseItem[]> {
    try {
      const url = category ? `${this.baseUrl}/items?category=${category}` : `${this.baseUrl}/items`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch purchase items');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching purchase items:', error);
      throw error;
    }
  }

  /**
   * Purchase an item
   */
  async purchaseItem(request: PurchaseRequest): Promise<Transaction> {
    try {
      const response = await fetch(`${this.baseUrl}/purchase`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Purchase failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Error purchasing item:', error);
      throw error;
    }
  }

  /**
   * Transfer funds to another wallet
   */
  async transferFunds(request: TransferRequest): Promise<Transaction> {
    try {
      const response = await fetch(`${this.baseUrl}/transfer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Transfer failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Error transferring funds:', error);
      throw error;
    }
  }

  /**
   * Get wallet address for receiving funds
   */
  async getWalletAddress(): Promise<{ address: string; qrCode: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/address`);
      if (!response.ok) {
        throw new Error('Failed to fetch wallet address');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching wallet address:', error);
      throw error;
    }
  }

  /**
   * Get exchange rates
   */
  async getExchangeRates(): Promise<{ [key: string]: number }> {
    try {
      const response = await fetch(`${this.baseUrl}/exchange-rates`);
      if (!response.ok) {
        throw new Error('Failed to fetch exchange rates');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching exchange rates:', error);
      throw error;
    }
  }

  /**
   * Validate wallet address
   */
  async validateAddress(address: string): Promise<{ valid: boolean; type?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/validate-address`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ address }),
      });

      if (!response.ok) {
        throw new Error('Failed to validate address');
      }

      return await response.json();
    } catch (error) {
      console.error('Error validating address:', error);
      throw error;
    }
  }

  /**
   * Get wallet security settings
   */
  async getSecuritySettings(): Promise<{
    twoFactorEnabled: boolean;
    biometricEnabled: boolean;
    autoLock: number;
    notifications: boolean;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/security`);
      if (!response.ok) {
        throw new Error('Failed to fetch security settings');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching security settings:', error);
      throw error;
    }
  }

  /**
   * Update security settings
   */
  async updateSecuritySettings(settings: {
    twoFactorEnabled?: boolean;
    biometricEnabled?: boolean;
    autoLock?: number;
    notifications?: boolean;
  }): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/security`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        throw new Error('Failed to update security settings');
      }
    } catch (error) {
      console.error('Error updating security settings:', error);
      throw error;
    }
  }

  /**
   * Export wallet data
   */
  async exportWalletData(): Promise<Blob> {
    try {
      const response = await fetch(`${this.baseUrl}/export`);
      if (!response.ok) {
        throw new Error('Failed to export wallet data');
      }
      return await response.blob();
    } catch (error) {
      console.error('Error exporting wallet data:', error);
      throw error;
    }
  }

  /**
   * Get wallet statistics
   */
  async getWalletStats(): Promise<{
    totalTransactions: number;
    totalSpent: number;
    totalReceived: number;
    averageTransaction: number;
    mostUsedCategory: string;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/stats`);
      if (!response.ok) {
        throw new Error('Failed to fetch wallet statistics');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching wallet statistics:', error);
      throw error;
    }
  }
}

export const walletService = new WalletService();
export default walletService;
