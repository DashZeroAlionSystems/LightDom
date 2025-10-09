/**
 * LightDom Wallet Dashboard - Comprehensive wallet interface for LightDom coins
 * Features: Balance display, transaction history, purchase flow, and security
 */

import React, { useState, useEffect } from 'react';
import { 
  Wallet, 
  Coins, 
  CreditCard, 
  History, 
  Send, 
  Download as Receive, 
  Shield, 
  Eye, 
  EyeOff,
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  Star,
  Zap,
  Lock,
  Unlock,
  RefreshCw,
  Download,
  Upload,
  Settings,
  AlertCircle,
  CheckCircle,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  Plus,
  Minus,
  DollarSign,
  Coins as Bitcoin,
  Circle as Ethereum,
  CreditCard as CardIcon,
  Square as QrCode,
  Copy,
  ExternalLink as ExternalLink
} from 'lucide-react';
import { cn } from '@/utils/validation/cn';
import PurchaseModal from './PurchaseModal';
import { dataIntegrationService, IntegratedDashboardData } from '@/services/DataIntegrationService';

interface WalletBalance {
  lightdom: number;
  usd: number;
  btc: number;
  eth: number;
  lastUpdated: string;
}

interface Transaction {
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

interface PurchaseItem {
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

const WalletDashboard: React.FC = () => {
  // State management
  const [balance, setBalance] = useState<WalletBalance>({
    lightdom: 1250.75,
    usd: 125.08,
    btc: 0.0023,
    eth: 0.045,
    lastUpdated: new Date().toISOString()
  });
  
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: '1',
      type: 'purchase',
      amount: -50.25,
      currency: 'LDC',
      description: 'Space Bridge Upgrade',
      status: 'completed',
      timestamp: '2024-01-15T10:30:00Z',
      hash: '0x1234...5678'
    },
    {
      id: '2',
      type: 'mining',
      amount: 25.50,
      currency: 'LDC',
      description: 'Optimization Mining Reward',
      status: 'completed',
      timestamp: '2024-01-15T08:15:00Z',
      hash: '0xabcd...efgh'
    },
    {
      id: '3',
      type: 'purchase',
      amount: -15.00,
      currency: 'LDC',
      description: 'Premium Chat Room Access',
      status: 'completed',
      timestamp: '2024-01-14T16:45:00Z'
    },
    {
      id: '4',
      type: 'transfer',
      amount: -100.00,
      currency: 'LDC',
      description: 'Transfer to @alice_wallet',
      status: 'pending',
      timestamp: '2024-01-14T14:20:00Z',
      to: '0x9876...5432'
    }
  ]);

  const [purchaseItems, setPurchaseItems] = useState<PurchaseItem[]>([
    {
      id: '1',
      name: 'Space Bridge Pro',
      description: 'Advanced space bridge with 10x capacity',
      price: 150.00,
      currency: 'LDC',
      category: 'space',
      image: '🌉',
      featured: true
    },
    {
      id: '2',
      name: 'Optimization Boost',
      description: 'Temporary 2x optimization speed boost',
      price: 25.00,
      currency: 'LDC',
      category: 'tools',
      image: '⚡',
      discount: 20
    },
    {
      id: '3',
      name: 'Premium Chat Theme',
      description: 'Exclusive dark theme for chat rooms',
      price: 10.00,
      currency: 'LDC',
      category: 'cosmetics',
      image: '🎨'
    },
    {
      id: '4',
      name: 'Mining Rig Upgrade',
      description: 'Upgrade your mining efficiency by 50%',
      price: 200.00,
      currency: 'LDC',
      category: 'upgrades',
      image: '⛏️'
    }
  ]);

  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'purchase' | 'settings'>('overview');
  const [showBalance, setShowBalance] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState<PurchaseItem | null>(null);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [integratedData, setIntegratedData] = useState<IntegratedDashboardData | null>(null);
  const [miningRewards, setMiningRewards] = useState({
    totalEarned: 0,
    todayEarned: 0,
    pendingRewards: 0,
    miningPower: 0
  });
  const [optimizationStats, setOptimizationStats] = useState({
    totalOptimizations: 0,
    successRate: 0,
    averageTime: 0,
    spaceSaved: 0,
    efficiency: 0
  });

  // Load wallet data
  useEffect(() => {
    loadWalletData();
    loadIntegratedData();
    
    // Start real-time updates
    dataIntegrationService.startRealTimeUpdates(10000); // Update every 10 seconds
    
    // Subscribe to real-time data updates
    const unsubscribe = dataIntegrationService.subscribe((data) => {
      setIntegratedData(data);
    });
    
    return () => {
      dataIntegrationService.stopRealTimeUpdates();
      unsubscribe();
    };
  }, []);

  const loadWalletData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [balanceData, transactionsData, itemsData] = await Promise.all([
        WalletService.getBalance(),
        WalletService.getTransactions(),
        WalletService.getPurchaseItems()
      ]);
      
      setBalance(balanceData);
      setTransactions(transactionsData);
      setPurchaseItems(itemsData);
    } catch (e) {
      setError('Failed to load wallet data.');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const loadIntegratedData = async () => {
    try {
      const [integrated, mining, optimization] = await Promise.all([
        dataIntegrationService.getIntegratedData(),
        dataIntegrationService.getMiningRewards('current-user'),
        dataIntegrationService.getOptimizationPerformance()
      ]);
      
      setIntegratedData(integrated);
      setMiningRewards(mining);
      setOptimizationStats(optimization);
    } catch (e) {
      console.error('Failed to load integrated data:', e);
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    const symbols = {
      'LDC': 'LDC',
      'USD': '$',
      'BTC': '₿',
      'ETH': 'Ξ'
    };
    return `${symbols[currency as keyof typeof symbols]}${amount.toFixed(2)}`;
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'purchase': return <ShoppingCart className="w-4 h-4" />;
      case 'sale': return <TrendingUp className="w-4 h-4" />;
      case 'transfer': return <Send className="w-4 h-4" />;
      case 'mining': return <Zap className="w-4 h-4" />;
      case 'reward': return <Star className="w-4 h-4" />;
      default: return <ArrowUpRight className="w-4 h-4" />;
    }
  };

  const getTransactionColor = (type: string, amount: number) => {
    if (amount > 0) return 'ld-text-success';
    return 'ld-text-danger';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'ld-text-success';
      case 'pending': return 'ld-text-warning';
      case 'failed': return 'ld-text-danger';
      default: return 'ld-text-muted';
    }
  };

  const handlePurchase = async (item: PurchaseItem) => {
    setSelectedItem(item);
    setShowPurchaseModal(true);
  };

  const confirmPurchase = async (item: PurchaseItem, quantity: number, paymentMethod: string) => {
    setIsLoading(true);
    try {
      // Simulate purchase API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const totalPrice = item.price * quantity;
      
      // Update balance
      setBalance(prev => ({
        ...prev,
        lightdom: prev.lightdom - totalPrice,
        lastUpdated: new Date().toISOString()
      }));

      // Add transaction
      const newTransaction: Transaction = {
        id: Date.now().toString(),
        type: 'purchase',
        amount: -totalPrice,
        currency: 'LDC',
        description: `${item.name} (${quantity}x)`,
        status: 'completed',
        timestamp: new Date().toISOString(),
        hash: `0x${Math.random().toString(16).substr(2, 8)}`
      };

      setTransactions(prev => [newTransaction, ...prev]);
      setShowPurchaseModal(false);
      setSelectedItem(null);
    } catch (error) {
      console.error('Purchase failed:', error);
      throw error; // Re-throw to let the modal handle the error
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="ld-container ld-container--xl ld-py-4 ld-animate-fade-in" style={{ marginLeft: 'var(--ld-space-2)' }}>
      {/* Header */}
      <div className="ld-card ld-card--elevated ld-animate-slide-down" style={{ borderRadius: 0, borderLeft: 'none', borderRight: 'none', borderTop: 'none', margin: 0, marginBottom: 'var(--ld-space-4)' }}>
        <div className="ld-container ld-container--2xl" style={{ padding: 'var(--ld-space-4) var(--ld-space-6)' }}>
          <div className="ld-flex ld-flex--between ld-flex--center">
            <div className="ld-flex ld-flex--center" style={{ gap: 'var(--ld-space-6)' }}>
              <div className="ld-flex ld-flex--center" style={{ gap: 'var(--ld-space-3)' }}>
                <div className="ld-flex ld-flex--center" style={{ 
                  width: '2.5rem', 
                  height: '2.5rem', 
                  borderRadius: 'var(--ld-radius-lg)', 
                  background: 'var(--ld-gradient-primary)' 
                }}>
                  <Wallet className="h-6 w-6" style={{ color: 'var(--ld-text-primary)' }} />
                </div>
                <div>
                  <h1 className="ld-text-2xl ld-font-bold ld-text-primary ld-mb-1">LightDom Wallet</h1>
                  <div className="ld-text-sm ld-text-secondary">
                    Secure • Fast • Decentralized
                  </div>
                </div>
              </div>
            </div>
            <div className="ld-flex ld-flex--center" style={{ gap: 'var(--ld-space-3)' }}>
              <button
                onClick={() => setShowBalance(!showBalance)}
                className="ld-btn ld-btn--ghost ld-btn--sm ld-hover-scale"
                style={{ padding: 'var(--ld-space-2) var(--ld-space-3)' }}
              >
                {showBalance ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                <span className="ld-ml-1">{showBalance ? 'Hide' : 'Show'} Balance</span>
              </button>
              <button
                onClick={loadWalletData}
                disabled={isLoading}
                className="ld-btn ld-btn--primary ld-btn--md ld-hover-glow"
                style={{ padding: 'var(--ld-space-3) var(--ld-space-4)' }}
              >
                <RefreshCw className={cn("h-4 w-4", isLoading && "ld-animate-spin")} />
                <span className="ld-ml-2">Refresh</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="ld-container ld-container--2xl" style={{ marginBottom: 'var(--ld-space-6)' }}>
        <div className="ld-card ld-card--elevated ld-flex ld-animate-slide-up" style={{ gap: 'var(--ld-space-2)', padding: 'var(--ld-space-2)' }}>
          {[
            { id: 'overview', label: 'Overview', icon: Wallet },
            { id: 'transactions', label: 'Transactions', icon: History },
            { id: 'purchase', label: 'Purchase', icon: ShoppingCart },
            { id: 'settings', label: 'Settings', icon: Settings }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`ld-btn ld-btn--md ld-flex ld-flex--center ld-hover-scale ${
                activeTab === tab.id 
                  ? 'ld-btn--primary'
                  : 'ld-btn--ghost'
              }`}
              style={{ gap: 'var(--ld-space-2)', padding: 'var(--ld-space-2) var(--ld-space-4)' }}
            >
              <tab.icon className="h-4 w-4" />
              <span className="ld-text-sm ld-font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="ld-container ld-container--2xl ld-pb-8">
        {activeTab === 'overview' && (
          <div className="ld-grid ld-grid--gap-lg">
            {/* System Health Status */}
            {integratedData && (
              <div className="ld-card ld-card--elevated ld-animate-slide-down">
                <div className="ld-card__header">
                  <h3 className="ld-card__title ld-flex ld-items--center ld-gap-2">
                    <Activity className="h-5 w-5" />
                    System Status
                  </h3>
                </div>
                <div className="ld-card__content">
                  <div className="ld-grid ld-grid--cols-4 ld-grid--gap-4">
                    <div className="ld-text-center">
                      <div className={`ld-text-sm ld-font-medium ld-mb-1 ${
                        integratedData.blockchain.networkStatus === 'healthy' ? 'ld-text-success' : 'ld-text-danger'
                      }`}>
                        Blockchain
                      </div>
                      <div className="ld-text-xs ld-text-secondary">
                        {integratedData.blockchain.activeMiners} miners
                      </div>
                    </div>
                    <div className="ld-text-center">
                      <div className={`ld-text-sm ld-font-medium ld-mb-1 ${
                        integratedData.crawler.crawlStatus === 'running' ? 'ld-text-success' : 'ld-text-danger'
                      }`}>
                        Crawler
                      </div>
                      <div className="ld-text-xs ld-text-secondary">
                        {integratedData.crawler.totalSitesCrawled} sites
                      </div>
                    </div>
                    <div className="ld-text-center">
                      <div className={`ld-text-sm ld-font-medium ld-mb-1 ${
                        integratedData.lightdom.optimizationStatus === 'active' ? 'ld-text-success' : 'ld-text-danger'
                      }`}>
                        LightDom
                      </div>
                      <div className="ld-text-xs ld-text-secondary">
                        {integratedData.lightdom.optimizationEfficiency.toFixed(1)}% efficiency
                      </div>
                    </div>
                    <div className="ld-text-center">
                      <div className={`ld-text-sm ld-font-medium ld-mb-1 ${
                        integratedData.metaverse.metaverseStatus === 'online' ? 'ld-text-success' : 'ld-text-danger'
                      }`}>
                        Metaverse
                      </div>
                      <div className="ld-text-xs ld-text-secondary">
                        {integratedData.metaverse.activeUsers} users
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Balance Cards */}
            <div className="ld-grid ld-grid--cols-1 ld-grid--cols-2 lg:ld-grid--cols-4 ld-grid--gap-lg">
              <div className="ld-card ld-card--interactive ld-animate-scale-in ld-hover-lift">
                <div className="ld-flex ld-flex--between ld-mb-4">
                  <Coins className="ld-text-primary" size={24} />
                  <span className="ld-text-2xl">🪙</span>
                </div>
                <div className="ld-text-3xl ld-font-bold ld-text-primary ld-mb-1">
                  {showBalance ? formatCurrency(balance.lightdom, 'LDC') : '••••••'}
                </div>
                <div className="ld-text-secondary ld-text-sm">LightDom Coins</div>
                <div className="ld-mt-2 ld-text-xs ld-text-muted">
                  ≈ {showBalance ? formatCurrency(balance.usd, 'USD') : '••••'} USD
                </div>
              </div>

              <div className="ld-card ld-card--interactive ld-animate-scale-in ld-hover-lift">
                <div className="ld-flex ld-flex--between ld-mb-4">
                  <DollarSign className="ld-text-success" size={24} />
                  <span className="ld-text-2xl">💵</span>
                </div>
                <div className="ld-text-3xl ld-font-bold ld-text-success ld-mb-1">
                  {showBalance ? formatCurrency(balance.usd, 'USD') : '••••••'}
                </div>
                <div className="ld-text-secondary ld-text-sm">USD Value</div>
                <div className="ld-mt-2 ld-text-xs ld-text-muted">
                  Last updated: {formatDate(balance.lastUpdated)}
                </div>
              </div>

              <div className="ld-card ld-card--interactive ld-animate-scale-in ld-hover-lift">
                <div className="ld-flex ld-flex--between ld-mb-4">
                  <Bitcoin className="ld-text-warning" size={24} />
                  <span className="ld-text-2xl">₿</span>
                </div>
                <div className="ld-text-3xl ld-font-bold ld-text-warning ld-mb-1">
                  {showBalance ? formatCurrency(balance.btc, 'BTC') : '••••••'}
                </div>
                <div className="ld-text-secondary ld-text-sm">Bitcoin</div>
                <div className="ld-mt-2 ld-text-xs ld-text-muted">
                  Crypto equivalent
                </div>
              </div>

              <div className="ld-card ld-card--interactive ld-animate-scale-in ld-hover-lift">
                <div className="ld-flex ld-flex--between ld-mb-4">
                  <Ethereum className="ld-text-info" size={24} />
                  <span className="ld-text-2xl">Ξ</span>
                </div>
                <div className="ld-text-3xl ld-font-bold ld-text-info ld-mb-1">
                  {showBalance ? formatCurrency(balance.eth, 'ETH') : '••••••'}
                </div>
                <div className="ld-text-secondary ld-text-sm">Ethereum</div>
                <div className="ld-mt-2 ld-text-xs ld-text-muted">
                  Crypto equivalent
                </div>
              </div>
            </div>

            {/* Mining & Optimization Stats */}
            <div className="ld-grid ld-grid--cols-1 ld-grid--cols-2 ld-grid--gap-lg">
              <div className="ld-card ld-card--elevated ld-animate-scale-in">
                <div className="ld-card__content">
                  <div className="ld-flex ld-flex--between ld-items--center ld-mb-4">
                    <h3 className="ld-text-lg ld-font-semibold ld-text-primary">Mining Rewards</h3>
                    <ThunderboltOutlined className="h-6 w-6 ld-text-primary" />
                  </div>
                  <div className="ld-space-y-2">
                    <div className="ld-flex ld-flex--between">
                      <span className="ld-text-sm ld-text-secondary">Total Earned:</span>
                      <span className="ld-text-sm ld-font-medium ld-text-primary">
                        {formatCurrency(miningRewards.totalEarned, 'LDC')}
                      </span>
                    </div>
                    <div className="ld-flex ld-flex--between">
                      <span className="ld-text-sm ld-text-secondary">Mining Power:</span>
                      <span className="ld-text-sm ld-font-medium ld-text-primary">
                        {miningRewards.miningPower} TH/s
                      </span>
                    </div>
                    <div className="ld-flex ld-flex--between">
                      <span className="ld-text-sm ld-text-secondary">Pending:</span>
                      <span className="ld-text-sm ld-font-medium ld-text-warning">
                        {formatCurrency(miningRewards.pendingRewards, 'LDC')}
                      </span>
                    </div>
                    {miningRewards.todayEarned > 0 && (
                      <div className="ld-flex ld-flex--between">
                        <span className="ld-text-sm ld-text-secondary">Today:</span>
                        <span className="ld-text-sm ld-font-medium ld-text-success">
                          +{formatCurrency(miningRewards.todayEarned, 'LDC')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="ld-card ld-card--elevated ld-animate-scale-in">
                <div className="ld-card__content">
                  <div className="ld-flex ld-flex--between ld-items--center ld-mb-4">
                    <h3 className="ld-text-lg ld-font-semibold ld-text-primary">Optimization</h3>
                    <ThunderboltOutlined className="h-6 w-6 ld-text-primary" />
                  </div>
                  <div className="ld-space-y-2">
                    <div className="ld-flex ld-flex--between">
                      <span className="ld-text-sm ld-text-secondary">Efficiency:</span>
                      <span className="ld-text-sm ld-font-medium ld-text-primary">
                        {optimizationStats.efficiency.toFixed(1)}%
                      </span>
                    </div>
                    <div className="ld-flex ld-flex--between">
                      <span className="ld-text-sm ld-text-secondary">Space Saved:</span>
                      <span className="ld-text-sm ld-font-medium ld-text-primary">
                        {optimizationStats.spaceSaved.toFixed(1)} MB
                      </span>
                    </div>
                    <div className="ld-flex ld-flex--between">
                      <span className="ld-text-sm ld-text-secondary">Success Rate:</span>
                      <span className="ld-text-sm ld-font-medium ld-text-success">
                        {optimizationStats.successRate.toFixed(1)}%
                      </span>
                    </div>
                    <div className="ld-flex ld-flex--between">
                      <span className="ld-text-sm ld-text-secondary">Total Optimizations:</span>
                      <span className="ld-text-sm ld-font-medium ld-text-primary">
                        {optimizationStats.totalOptimizations.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="ld-card ld-card--elevated ld-animate-slide-up">
              <div className="ld-card__header">
                <h3 className="ld-card__title">Quick Actions</h3>
              </div>
              <div className="ld-card__content">
                <div className="ld-grid ld-grid--cols-2 lg:ld-grid--cols-4 ld-grid--gap-md">
                  <button className="ld-btn ld-btn--primary ld-btn--lg ld-hover-glow ld-flex ld-flex--col ld-items--center" style={{ gap: 'var(--ld-space-2)' }}>
                    <Send className="h-6 w-6" />
                    <span>Send</span>
                  </button>
                  <button className="ld-btn ld-btn--secondary ld-btn--lg ld-hover-lift ld-flex ld-flex--col ld-items--center" style={{ gap: 'var(--ld-space-2)' }}>
                    <Receive className="h-6 w-6" />
                    <span>Receive</span>
                  </button>
                  <button className="ld-btn ld-btn--success ld-btn--lg ld-hover-scale ld-flex ld-flex--col ld-items--center" style={{ gap: 'var(--ld-space-2)' }}>
                    <ShoppingCart className="h-6 w-6" />
                    <span>Purchase</span>
                  </button>
                  <button className="ld-btn ld-btn--ghost ld-btn--lg ld-hover-rotate ld-flex ld-flex--col ld-items--center" style={{ gap: 'var(--ld-space-2)' }}>
                    <QrCode className="h-6 w-6" />
                    <span>QR Code</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'transactions' && (
          <div className="ld-card ld-card--elevated ld-animate-slide-up">
            <div className="ld-card__header">
              <h3 className="ld-card__title">Transaction History</h3>
              <div className="ld-flex ld-flex--center" style={{ gap: 'var(--ld-space-2)' }}>
                <button className="ld-btn ld-btn--ghost ld-btn--sm">
                  <Download className="h-4 w-4" />
                  Export
                </button>
              </div>
            </div>
            <div className="ld-card__content">
              <div className="ld-space-y-4">
                {transactions.map((tx) => (
                  <div key={tx.id} className="ld-flex ld-flex--between ld-items--center ld-p-4 ld-card ld-hover-lift" style={{ borderRadius: 'var(--ld-radius-md)' }}>
                    <div className="ld-flex ld-flex--center" style={{ gap: 'var(--ld-space-3)' }}>
                      <div className="ld-flex ld-flex--center" style={{ 
                        width: '2.5rem', 
                        height: '2.5rem', 
                        borderRadius: 'var(--ld-radius-full)',
                        background: 'var(--ld-color-tertiary)'
                      }}>
                        {getTransactionIcon(tx.type)}
                      </div>
                      <div>
                        <div className="ld-text-sm ld-font-medium ld-text-primary">{tx.description}</div>
                        <div className="ld-text-xs ld-text-muted">{formatDate(tx.timestamp)}</div>
                        {tx.hash && (
                          <div className="ld-text-xs ld-text-muted" style={{ fontFamily: 'monospace' }}>
                            {tx.hash}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="ld-flex ld-flex--center" style={{ gap: 'var(--ld-space-2)' }}>
                      <div className="ld-text-right">
                        <div className={cn("ld-text-sm ld-font-bold", getTransactionColor(tx.type, tx.amount))}>
                          {tx.amount > 0 ? '+' : ''}{formatCurrency(tx.amount, tx.currency)}
                        </div>
                        <div className={cn("ld-text-xs", getStatusColor(tx.status))}>
                          {tx.status}
                        </div>
                      </div>
                      <div className="ld-flex ld-flex--center" style={{ 
                        width: '1.5rem', 
                        height: '1.5rem', 
                        borderRadius: 'var(--ld-radius-full)',
                        background: tx.status === 'completed' ? 'var(--ld-color-success)' : 
                                   tx.status === 'pending' ? 'var(--ld-color-warning)' : 'var(--ld-color-danger)'
                      }}>
                        {tx.status === 'completed' ? <CheckCircle className="h-3 w-3 ld-text-primary" /> :
                         tx.status === 'pending' ? <Clock className="h-3 w-3 ld-text-primary" /> :
                         <AlertCircle className="h-3 w-3 ld-text-primary" />}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'purchase' && (
          <div className="ld-grid ld-grid--gap-lg">
            <div className="ld-card ld-card--elevated ld-animate-slide-up">
              <div className="ld-card__header">
                <h3 className="ld-card__title">Marketplace</h3>
                <div className="ld-text-sm ld-text-secondary">
                  Buy upgrades and items with LightDom coins
                </div>
              </div>
              <div className="ld-card__content">
                <div className="ld-grid ld-grid--cols-1 md:ld-grid--cols-2 lg:ld-grid--cols-3 ld-grid--gap-lg">
                  {purchaseItems.map((item) => (
                    <div key={item.id} className="ld-card ld-card--interactive ld-animate-scale-in ld-hover-lift">
                      <div className="ld-flex ld-flex--between ld-mb-4">
                        <span className="ld-text-3xl">{item.image}</span>
                        {item.featured && (
                          <div className="ld-flex ld-flex--center" style={{ 
                            background: 'var(--ld-gradient-primary)',
                            borderRadius: 'var(--ld-radius-sm)',
                            padding: 'var(--ld-space-1) var(--ld-space-2)'
                          }}>
                            <Star className="h-3 w-3 ld-text-primary" />
                            <span className="ld-text-xs ld-font-bold ld-text-primary ml-1">Featured</span>
                          </div>
                        )}
                      </div>
                      <h4 className="ld-text-lg ld-font-semibold ld-text-primary ld-mb-2">{item.name}</h4>
                      <p className="ld-text-sm ld-text-secondary ld-mb-4">{item.description}</p>
                      <div className="ld-flex ld-flex--between ld-items--center ld-mb-4">
                        <div className="ld-flex ld-flex--center" style={{ gap: 'var(--ld-space-1)' }}>
                          <span className="ld-text-xl ld-font-bold ld-text-primary">
                            {formatCurrency(item.price, item.currency)}
                          </span>
                          {item.discount && (
                            <span className="ld-text-sm ld-text-success ld-font-medium">
                              -{item.discount}%
                            </span>
                          )}
                        </div>
                        <div className="ld-text-xs ld-text-muted" style={{ 
                          background: 'var(--ld-color-tertiary)',
                          padding: 'var(--ld-space-1) var(--ld-space-2)',
                          borderRadius: 'var(--ld-radius-sm)'
                        }}>
                          {item.category}
                        </div>
                      </div>
                      <button
                        onClick={() => handlePurchase(item)}
                        disabled={balance.lightdom < item.price}
                        className="ld-btn ld-btn--primary ld-btn--md ld-hover-glow ld-w-full"
                      >
                        <ShoppingCart className="h-4 w-4" />
                        {balance.lightdom < item.price ? 'Insufficient Funds' : 'Purchase'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="ld-card ld-card--elevated ld-animate-slide-up">
            <div className="ld-card__header" style={{ padding: 'var(--ld-space-6) var(--ld-space-6) var(--ld-space-4)' }}>
              <h3 className="ld-card__title">Wallet Settings</h3>
            </div>
            <div className="ld-card__content" style={{ padding: '0 var(--ld-space-6) var(--ld-space-6)' }}>
              <div className="ld-space-y-8">
                <div className="ld-flex ld-flex--between ld-items--center ld-p-4 ld-card" style={{ borderRadius: 'var(--ld-radius-md)', background: 'var(--ld-color-tertiary)' }}>
                  <div className="ld-flex--grow">
                    <h4 className="ld-text-lg ld-font-semibold ld-text-primary ld-mb-2">Security</h4>
                    <p className="ld-text-sm ld-text-secondary">Advanced security features and monitoring</p>
                  </div>
                  <button 
                    onClick={() => window.location.href = '/wallet/security'}
                    className="ld-btn ld-btn--primary ld-hover-glow"
                    style={{ padding: 'var(--ld-space-3) var(--ld-space-5)' }}
                  >
                    <Shield className="h-4 w-4" />
                    <span className="ld-ml-2">Security Center</span>
                  </button>
                </div>
                <div className="ld-flex ld-flex--between ld-items--center ld-p-4 ld-card" style={{ borderRadius: 'var(--ld-radius-md)', background: 'var(--ld-color-tertiary)' }}>
                  <div className="ld-flex--grow">
                    <h4 className="ld-text-lg ld-font-semibold ld-text-primary ld-mb-2">Backup</h4>
                    <p className="ld-text-sm ld-text-secondary">Backup your wallet data and recovery codes</p>
                  </div>
                  <button 
                    onClick={() => window.location.href = '/wallet/security#backup'}
                    className="ld-btn ld-btn--secondary ld-hover-lift"
                    style={{ padding: 'var(--ld-space-3) var(--ld-space-5)' }}
                  >
                    <Download className="h-4 w-4" />
                    <span className="ld-ml-2">Backup & Recovery</span>
                  </button>
                </div>
                <div className="ld-flex ld-flex--between ld-items--center ld-p-4 ld-card" style={{ borderRadius: 'var(--ld-radius-md)', background: 'var(--ld-color-tertiary)' }}>
                  <div className="ld-flex--grow">
                    <h4 className="ld-text-lg ld-font-semibold ld-text-primary ld-mb-2">Marketplace</h4>
                    <p className="ld-text-sm ld-text-secondary">Browse and purchase items with LightDom coins</p>
                  </div>
                  <button 
                    onClick={() => window.location.href = '/wallet/marketplace'}
                    className="ld-btn ld-btn--secondary ld-hover-lift"
                    style={{ padding: 'var(--ld-space-3) var(--ld-space-5)' }}
                  >
                    <ShoppingCart className="h-4 w-4" />
                    <span className="ld-ml-2">Marketplace</span>
                  </button>
                </div>
                <div className="ld-flex ld-flex--between ld-items--center ld-p-4 ld-card" style={{ borderRadius: 'var(--ld-radius-md)', background: 'var(--ld-color-tertiary)' }}>
                  <div className="ld-flex--grow">
                    <h4 className="ld-text-lg ld-font-semibold ld-text-primary ld-mb-2">Notifications</h4>
                    <p className="ld-text-sm ld-text-secondary">Manage transaction and security notifications</p>
                  </div>
                  <button className="ld-btn ld-btn--secondary ld-hover-lift" style={{ padding: 'var(--ld-space-3) var(--ld-space-5)' }}>
                    <Settings className="h-4 w-4" />
                    <span className="ld-ml-2">Configure</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Purchase Modal */}
      <PurchaseModal
        isOpen={showPurchaseModal}
        onClose={() => setShowPurchaseModal(false)}
        item={selectedItem}
        userBalance={balance.lightdom}
        onConfirm={confirmPurchase}
        isLoading={isLoading}
      />
    </div>
  );
};

export default WalletDashboard;
