/**
 * Client Zone - Dashboard for viewing mining statistics and purchasing metaverse items
 * Shows real-time mining data, coin earnings, and marketplace for chat room items
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Coins,
  TrendingUp,
  Activity,
  ShoppingCart,
  Clock,
  BarChart3,
  Zap,
  Award,
  Package,
  Plus,
  Check,
  X,
  RefreshCw,
  History,
  Wallet,
  Database,
  Star,
  Sparkles
} from 'lucide-react';

interface MiningStats {
  totalCoins: number;
  miningRate: number; // coins per hour
  spaceSaved: number; // bytes
  optimizationsCount: number;
  currentSession: {
    startTime: number;
    coinsEarned: number;
    timeElapsed: number;
  };
  history: {
    daily: number;
    weekly: number;
    monthly: number;
  };
}

interface MetaverseItem {
  id: string;
  name: string;
  description: string;
  category: 'furniture' | 'decoration' | 'effect' | 'avatar' | 'background';
  price: number; // in DSH tokens
  image?: string;
  features: string[];
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface PurchasedItem {
  id: string;
  itemId: string;
  item: MetaverseItem;
  purchasedAt: number;
  status: 'active' | 'inactive';
}

const ClientZone: React.FC = () => {
  const [miningStats, setMiningStats] = useState<MiningStats | null>(null);
  const [availableItems, setAvailableItems] = useState<MetaverseItem[]>([]);
  const [inventory, setInventory] = useState<PurchasedItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MetaverseItem | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load initial data
  useEffect(() => {
    loadClientData();
  }, []);

  // Auto-refresh mining stats
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      loadMiningStats();
    }, 5000); // Refresh every 5 seconds

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const loadClientData = async () => {
    await Promise.all([
      loadMiningStats(),
      loadAvailableItems(),
      loadInventory()
    ]);
  };

  const loadMiningStats = async () => {
    try {
      const response = await fetch('/api/client/mining-stats');
      const data = await response.json();
      if (data.success) {
        setMiningStats(data.data);
      }
    } catch (error) {
      console.error('Failed to load mining stats:', error);
    }
  };

  const loadAvailableItems = async () => {
    try {
      const response = await fetch('/api/client/marketplace-items');
      const data = await response.json();
      if (data.success) {
        setAvailableItems(data.data);
      }
    } catch (error) {
      console.error('Failed to load marketplace items:', error);
    }
  };

  const loadInventory = async () => {
    try {
      const response = await fetch('/api/client/inventory');
      const data = await response.json();
      if (data.success) {
        setInventory(data.data);
      }
    } catch (error) {
      console.error('Failed to load inventory:', error);
    }
  };

  const handlePurchaseItem = async (item: MetaverseItem) => {
    if (!miningStats || miningStats.totalCoins < item.price) {
      alert('Insufficient funds!');
      return;
    }

    setIsPurchasing(true);
    try {
      const response = await fetch('/api/client/purchase-item', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId: item.id })
      });

      const data = await response.json();
      if (data.success) {
        // Update local state
        await loadClientData();
        setSelectedItem(null);
        
        // Notify Chrome extension about the purchase
        if (window.chrome && window.chrome.runtime) {
          window.chrome.runtime.sendMessage({
            type: 'ITEM_PURCHASED',
            data: { item: data.data.item }
          });
        }
        
        alert('Item purchased successfully!');
      } else {
        alert('Purchase failed: ' + data.message);
      }
    } catch (error) {
      console.error('Failed to purchase item:', error);
      alert('Purchase failed. Please try again.');
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadClientData();
    setTimeout(() => setRefreshing(false), 500);
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return '#6B7280';
      case 'rare': return '#3B82F6';
      case 'epic': return '#8B5CF6';
      case 'legendary': return '#F59E0B';
      default: return '#6B7280';
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(2) + 'K';
    return num.toFixed(2);
  };

  const formatBytes = (bytes: number) => {
    if (bytes >= 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    if (bytes >= 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return bytes + ' bytes';
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hours}h ${minutes}m ${secs}s`;
  };

  const filteredItems = selectedCategory === 'all' 
    ? availableItems 
    : availableItems.filter(item => item.category === selectedCategory);

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ 
          background: 'white',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '24px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 style={{ 
                fontSize: '32px',
                fontWeight: 'bold',
                margin: '0 0 8px 0',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                Client Zone
              </h1>
              <p style={{ color: '#6B7280', margin: 0 }}>
                Track your mining progress and purchase metaverse items
              </p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              style={{
                padding: '12px 24px',
                background: '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: refreshing ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px',
                fontWeight: '600',
                opacity: refreshing ? 0.6 : 1
              }}
            >
              <RefreshCw size={16} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
              Refresh
            </button>
          </div>
        </div>

        {/* Mining Statistics */}
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ color: 'white', marginBottom: '16px', fontSize: '24px', fontWeight: 'bold' }}>
            ⛏️ Mining Statistics
          </h2>
          
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '16px',
            marginBottom: '16px'
          }}>
            {/* Total Coins */}
            <div style={{
              background: 'white',
              borderRadius: '12px',
              padding: '20px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div style={{ 
                  background: 'linear-gradient(135deg, #F59E0B, #D97706)',
                  borderRadius: '8px',
                  padding: '8px',
                  display: 'flex'
                }}>
                  <Coins size={24} color="white" />
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#6B7280', fontWeight: '500' }}>Total Coins</div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1F2937' }}>
                    {miningStats ? formatNumber(miningStats.totalCoins) : '0'} DSH
                  </div>
                </div>
              </div>
              <div style={{ fontSize: '12px', color: '#6B7280' }}>
                Available balance for purchases
              </div>
            </div>

            {/* Mining Rate */}
            <div style={{
              background: 'white',
              borderRadius: '12px',
              padding: '20px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div style={{ 
                  background: 'linear-gradient(135deg, #10B981, #059669)',
                  borderRadius: '8px',
                  padding: '8px',
                  display: 'flex'
                }}>
                  <TrendingUp size={24} color="white" />
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#6B7280', fontWeight: '500' }}>Mining Rate</div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1F2937' }}>
                    {miningStats ? formatNumber(miningStats.miningRate) : '0'}/hr
                  </div>
                </div>
              </div>
              <div style={{ fontSize: '12px', color: '#6B7280' }}>
                Current earning rate
              </div>
            </div>

            {/* Space Saved */}
            <div style={{
              background: 'white',
              borderRadius: '12px',
              padding: '20px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div style={{ 
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  borderRadius: '8px',
                  padding: '8px',
                  display: 'flex'
                }}>
                  <Database size={24} color="white" />
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#6B7280', fontWeight: '500' }}>Space Saved</div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1F2937' }}>
                    {miningStats ? formatBytes(miningStats.spaceSaved) : '0'}
                  </div>
                </div>
              </div>
              <div style={{ fontSize: '12px', color: '#6B7280' }}>
                Total optimization savings
              </div>
            </div>

            {/* Optimizations */}
            <div style={{
              background: 'white',
              borderRadius: '12px',
              padding: '20px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div style={{ 
                  background: 'linear-gradient(135deg, #3B82F6, #2563EB)',
                  borderRadius: '8px',
                  padding: '8px',
                  display: 'flex'
                }}>
                  <Zap size={24} color="white" />
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#6B7280', fontWeight: '500' }}>Optimizations</div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1F2937' }}>
                    {miningStats?.optimizationsCount || 0}
                  </div>
                </div>
              </div>
              <div style={{ fontSize: '12px', color: '#6B7280' }}>
                Total completed optimizations
              </div>
            </div>
          </div>

          {/* Current Session & History */}
          {miningStats && (
            <div style={{ 
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '16px'
            }}>
              {/* Current Session */}
              <div style={{
                background: 'white',
                borderRadius: '12px',
                padding: '20px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <Activity size={20} color="#667eea" />
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>Current Session</h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#6B7280' }}>Time Elapsed:</span>
                    <span style={{ fontWeight: '600' }}>{formatTime(miningStats.currentSession.timeElapsed)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#6B7280' }}>Coins Earned:</span>
                    <span style={{ fontWeight: '600', color: '#F59E0B' }}>
                      {formatNumber(miningStats.currentSession.coinsEarned)} DSH
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#6B7280' }}>Started:</span>
                    <span style={{ fontWeight: '600' }}>
                      {new Date(miningStats.currentSession.startTime).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Mining History */}
              <div style={{
                background: 'white',
                borderRadius: '12px',
                padding: '20px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <History size={20} color="#667eea" />
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>Mining History</h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#6B7280' }}>Today:</span>
                    <span style={{ fontWeight: '600' }}>{formatNumber(miningStats.history.daily)} DSH</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#6B7280' }}>This Week:</span>
                    <span style={{ fontWeight: '600' }}>{formatNumber(miningStats.history.weekly)} DSH</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#6B7280' }}>This Month:</span>
                    <span style={{ fontWeight: '600' }}>{formatNumber(miningStats.history.monthly)} DSH</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Metaverse Marketplace */}
        <div>
          <h2 style={{ color: 'white', marginBottom: '16px', fontSize: '24px', fontWeight: 'bold' }}>
            🛒 Metaverse Item Marketplace
          </h2>

          {/* Category Filter */}
          <div style={{ 
            background: 'white',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '16px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {['all', 'furniture', 'decoration', 'effect', 'avatar', 'background'].map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  style={{
                    padding: '8px 16px',
                    background: selectedCategory === category ? '#667eea' : '#F3F4F6',
                    color: selectedCategory === category ? 'white' : '#4B5563',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    textTransform: 'capitalize'
                  }}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Items Grid */}
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '16px'
          }}>
            {filteredItems.map(item => (
              <div
                key={item.id}
                style={{
                  background: 'white',
                  borderRadius: '12px',
                  padding: '20px',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                  border: `2px solid ${getRarityColor(item.rarity)}`,
                  transition: 'transform 0.2s',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                {/* Item Header */}
                <div style={{ marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>{item.name}</h3>
                    <span style={{ 
                      padding: '4px 8px',
                      background: getRarityColor(item.rarity),
                      color: 'white',
                      borderRadius: '4px',
                      fontSize: '10px',
                      fontWeight: '600',
                      textTransform: 'uppercase'
                    }}>
                      {item.rarity}
                    </span>
                  </div>
                  <p style={{ color: '#6B7280', fontSize: '14px', margin: '0 0 8px 0' }}>
                    {item.description}
                  </p>
                  <div style={{ 
                    padding: '4px 8px',
                    background: '#F3F4F6',
                    borderRadius: '4px',
                    display: 'inline-block',
                    fontSize: '12px',
                    color: '#4B5563',
                    textTransform: 'capitalize'
                  }}>
                    {item.category}
                  </div>
                </div>

                {/* Features */}
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '12px', fontWeight: '600', color: '#6B7280', marginBottom: '8px' }}>
                    Features:
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {item.features.map((feature, index) => (
                      <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Sparkles size={12} color="#667eea" />
                        <span style={{ fontSize: '12px', color: '#4B5563' }}>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Price and Purchase */}
                <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '4px' }}>Price</div>
                      <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#F59E0B', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Coins size={20} />
                        {item.price} DSH
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedItem(item);
                        if (window.confirm(`Purchase ${item.name} for ${item.price} DSH?`)) {
                          handlePurchaseItem(item);
                        }
                      }}
                      disabled={isPurchasing || !miningStats || miningStats.totalCoins < item.price}
                      style={{
                        padding: '10px 20px',
                        background: (!miningStats || miningStats.totalCoins < item.price) ? '#D1D5DB' : 'linear-gradient(135deg, #667eea, #764ba2)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: (!miningStats || miningStats.totalCoins < item.price) ? 'not-allowed' : 'pointer',
                        fontSize: '14px',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <ShoppingCart size={16} />
                      Buy
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* No items message */}
          {filteredItems.length === 0 && (
            <div style={{
              background: 'white',
              borderRadius: '12px',
              padding: '40px',
              textAlign: 'center',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}>
              <Package size={48} color="#D1D5DB" style={{ margin: '0 auto 16px' }} />
              <p style={{ color: '#6B7280', fontSize: '16px' }}>No items available in this category</p>
            </div>
          )}
        </div>

        {/* My Inventory */}
        {inventory.length > 0 && (
          <div style={{ marginTop: '24px' }}>
            <h2 style={{ color: 'white', marginBottom: '16px', fontSize: '24px', fontWeight: 'bold' }}>
              📦 My Inventory
            </h2>
            <div style={{ 
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '16px'
            }}>
              {inventory.map(purchase => (
                <div
                  key={purchase.id}
                  style={{
                    background: 'white',
                    borderRadius: '12px',
                    padding: '16px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                    border: `2px solid ${getRarityColor(purchase.item.rarity)}`
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                    <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>{purchase.item.name}</h4>
                    <Check size={16} color="#10B981" />
                  </div>
                  <p style={{ color: '#6B7280', fontSize: '12px', margin: '0 0 8px 0' }}>
                    {purchase.item.category}
                  </p>
                  <div style={{ fontSize: '11px', color: '#9CA3AF' }}>
                    Purchased: {new Date(purchase.purchasedAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ClientZone;
