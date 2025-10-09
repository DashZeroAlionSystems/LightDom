/**
 * Wallet Integration - Connects wallet with existing marketplace and economy systems
 */

import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, 
  Coins, 
  TrendingUp, 
  Users, 
  Zap, 
  Globe,
  Database,
  Activity,
  Star,
  Award,
  Target,
  Layers,
  Sparkles,
  RefreshCw,
  ExternalLink as ExternalLink,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/utils/validation/cn';

interface MarketplaceItem {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: 'LDC' | 'USD';
  category: 'space' | 'tools' | 'upgrades' | 'cosmetics' | 'mining' | 'blockchain';
  image: string;
  discount?: number;
  featured?: boolean;
  popularity?: number;
  rating?: number;
}

interface EconomyStats {
  totalValue: number;
  activeUsers: number;
  transactionsToday: number;
  topCategory: string;
  averageSpend: number;
}

const WalletIntegration: React.FC = () => {
  const [marketplaceItems, setMarketplaceItems] = useState<MarketplaceItem[]>([]);
  const [economyStats, setEconomyStats] = useState<EconomyStats>({
    totalValue: 0,
    activeUsers: 0,
    transactionsToday: 0,
    topCategory: 'space',
    averageSpend: 0
  });
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);

  const categories = [
    { id: 'all', label: 'All Items', icon: Globe },
    { id: 'space', label: 'Space Tools', icon: Globe },
    { id: 'tools', label: 'Optimization', icon: Zap },
    { id: 'upgrades', label: 'Upgrades', icon: TrendingUp },
    { id: 'cosmetics', label: 'Cosmetics', icon: Star },
    { id: 'mining', label: 'Mining', icon: Target },
    { id: 'blockchain', label: 'Blockchain', icon: Database }
  ];

  useEffect(() => {
    loadMarketplaceData();
    loadEconomyStats();
  }, []);

  const loadMarketplaceData = async () => {
    setIsLoading(true);
    try {
      // Simulate API call to get marketplace items
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockItems: MarketplaceItem[] = [
        {
          id: '1',
          name: 'Space Bridge Pro',
          description: 'Advanced space bridge with 10x capacity and enhanced security',
          price: 150.00,
          currency: 'LDC',
          category: 'space',
          image: '🌉',
          featured: true,
          popularity: 95,
          rating: 4.8
        },
        {
          id: '2',
          name: 'Optimization Boost',
          description: 'Temporary 2x optimization speed boost for 24 hours',
          price: 25.00,
          currency: 'LDC',
          category: 'tools',
          image: '⚡',
          discount: 20,
          popularity: 88,
          rating: 4.6
        },
        {
          id: '3',
          name: 'Premium Chat Theme',
          description: 'Exclusive dark theme with custom animations for chat rooms',
          price: 10.00,
          currency: 'LDC',
          category: 'cosmetics',
          image: '🎨',
          popularity: 72,
          rating: 4.4
        },
        {
          id: '4',
          name: 'Mining Rig Upgrade',
          description: 'Upgrade your mining efficiency by 50% permanently',
          price: 200.00,
          currency: 'LDC',
          category: 'mining',
          image: '⛏️',
          featured: true,
          popularity: 91,
          rating: 4.9
        },
        {
          id: '5',
          name: 'Blockchain Analytics',
          description: 'Advanced analytics dashboard for blockchain transactions',
          price: 75.00,
          currency: 'LDC',
          category: 'blockchain',
          image: '📊',
          popularity: 67,
          rating: 4.3
        },
        {
          id: '6',
          name: 'Space Allocation Tool',
          description: 'Smart tool for optimizing space allocation across bridges',
          price: 50.00,
          currency: 'LDC',
          category: 'upgrades',
          image: '🔧',
          popularity: 79,
          rating: 4.5
        }
      ];

      setMarketplaceItems(mockItems);
    } catch (error) {
      console.error('Failed to load marketplace data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadEconomyStats = async () => {
    try {
      // Simulate API call to get economy stats
      const mockStats: EconomyStats = {
        totalValue: 125000.50,
        activeUsers: 2847,
        transactionsToday: 156,
        topCategory: 'space',
        averageSpend: 45.75
      };
      setEconomyStats(mockStats);
    } catch (error) {
      console.error('Failed to load economy stats:', error);
    }
  };

  const filteredItems = selectedCategory === 'all' 
    ? marketplaceItems 
    : marketplaceItems.filter(item => item.category === selectedCategory);

  const formatCurrency = (amount: number, currency: string) => {
    const symbols = {
      'LDC': 'LDC',
      'USD': '$',
      'BTC': '₿',
      'ETH': 'Ξ'
    };
    return `${symbols[currency as keyof typeof symbols]}${amount.toFixed(2)}`;
  };

  const getCategoryIcon = (category: string) => {
    const categoryData = categories.find(cat => cat.id === category);
    return categoryData?.icon || Globe;
  };

  return (
    <div className="ld-container ld-container--xl ld-py-8 ld-animate-fade-in">
      {/* Header */}
      <div className="ld-card ld-card--elevated ld-animate-slide-down" style={{ borderRadius: 0, borderLeft: 'none', borderRight: 'none', borderTop: 'none', margin: 0 }}>
        <div className="ld-container ld-container--2xl">
          <div className="ld-flex ld-flex--between ld-flex--center">
            <div className="ld-flex ld-flex--center" style={{ gap: 'var(--ld-space-4)' }}>
              <div className="ld-flex ld-flex--center" style={{ gap: 'var(--ld-space-2)' }}>
                <div className="ld-flex ld-flex--center" style={{ 
                  width: '2rem', 
                  height: '2rem', 
                  borderRadius: 'var(--ld-radius-lg)', 
                  background: 'var(--ld-gradient-primary)' 
                }}>
                  <ShoppingCart className="h-5 w-5" style={{ color: 'var(--ld-text-primary)' }} />
                </div>
                <h1 className="ld-text-2xl ld-font-bold ld-text-primary">Marketplace Integration</h1>
              </div>
              <div className="ld-text-sm ld-text-secondary">
                Buy with LightDom coins • Secure • Fast
              </div>
            </div>
            <div className="ld-flex ld-flex--center" style={{ gap: 'var(--ld-space-4)' }}>
              <button
                onClick={loadMarketplaceData}
                disabled={isLoading}
                className="ld-btn ld-btn--primary ld-btn--md ld-hover-glow"
              >
                <RefreshCw className={cn("h-4 w-4", isLoading && "ld-animate-spin")} />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Economy Stats */}
      <div className="ld-container ld-container--2xl ld-py-4">
        <div className="ld-card ld-card--elevated ld-animate-slide-up">
          <div className="ld-card__header">
            <h3 className="ld-card__title">Economy Overview</h3>
            <div className="ld-text-sm ld-text-secondary">
              Real-time marketplace statistics
            </div>
          </div>
          <div className="ld-card__content">
            <div className="ld-grid ld-grid--cols-2 lg:ld-grid--cols-5 ld-grid--gap-lg">
              <div className="ld-flex ld-flex--col ld-items--center ld-text-center">
                <div className="ld-text-2xl ld-font-bold ld-text-primary ld-mb-1">
                  {formatCurrency(economyStats.totalValue, 'LDC')}
                </div>
                <div className="ld-text-sm ld-text-secondary">Total Value</div>
              </div>
              <div className="ld-flex ld-flex--col ld-items--center ld-text-center">
                <div className="ld-text-2xl ld-font-bold ld-text-success ld-mb-1">
                  {economyStats.activeUsers.toLocaleString()}
                </div>
                <div className="ld-text-sm ld-text-secondary">Active Users</div>
              </div>
              <div className="ld-flex ld-flex--col ld-items--center ld-text-center">
                <div className="ld-text-2xl ld-font-bold ld-text-warning ld-mb-1">
                  {economyStats.transactionsToday}
                </div>
                <div className="ld-text-sm ld-text-secondary">Today's Transactions</div>
              </div>
              <div className="ld-flex ld-flex--col ld-items--center ld-text-center">
                <div className="ld-text-2xl ld-font-bold ld-text-info ld-mb-1">
                  {economyStats.topCategory}
                </div>
                <div className="ld-text-sm ld-text-secondary">Top Category</div>
              </div>
              <div className="ld-flex ld-flex--col ld-items--center ld-text-center">
                <div className="ld-text-2xl ld-font-bold ld-text-primary ld-mb-1">
                  {formatCurrency(economyStats.averageSpend, 'LDC')}
                </div>
                <div className="ld-text-sm ld-text-secondary">Avg. Spend</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="ld-container ld-container--2xl ld-py-4">
        <div className="ld-card ld-card--elevated ld-animate-slide-up">
          <div className="ld-card__content">
            <div className="ld-flex ld-flex--wrap ld-grid--gap-md">
              {categories.map(category => {
                const Icon = category.icon;
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={cn(
                      "ld-btn ld-btn--md ld-flex ld-flex--center ld-hover-scale",
                      selectedCategory === category.id ? 'ld-btn--primary' : 'ld-btn--ghost'
                    )}
                    style={{ gap: 'var(--ld-space-2)' }}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="ld-text-sm ld-font-medium">{category.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Marketplace Items */}
      <div className="ld-container ld-container--2xl ld-pb-8">
        <div className="ld-card ld-card--elevated ld-animate-slide-up">
          <div className="ld-card__header">
            <h3 className="ld-card__title">
              {selectedCategory === 'all' ? 'All Items' : categories.find(c => c.id === selectedCategory)?.label}
            </h3>
            <div className="ld-text-sm ld-text-secondary">
              {filteredItems.length} items available
            </div>
          </div>
          <div className="ld-card__content">
            {isLoading ? (
              <div className="ld-flex ld-flex--center ld-py-8">
                <RefreshCw className="h-6 w-6 ld-animate-spin ld-text-primary" />
                <span className="ld-text-sm ld-text-secondary ld-ml-2">Loading items...</span>
              </div>
            ) : (
              <div className="ld-grid ld-grid--cols-1 md:ld-grid--cols-2 lg:ld-grid--cols-3 ld-grid--gap-lg">
                {filteredItems.map((item) => {
                  const CategoryIcon = getCategoryIcon(item.category);
                  return (
                    <div key={item.id} className="ld-card ld-card--interactive ld-animate-scale-in ld-hover-lift">
                      <div className="ld-flex ld-flex--between ld-mb-4">
                        <div className="ld-flex ld-flex--center" style={{ gap: 'var(--ld-space-2)' }}>
                          <span className="ld-text-3xl">{item.image}</span>
                          <div>
                            <div className="ld-text-xs ld-text-muted">{item.category}</div>
                            <div className="ld-flex ld-flex--center" style={{ gap: 'var(--ld-space-1)' }}>
                              <Star className="h-3 w-3 ld-text-warning" />
                              <span className="ld-text-xs ld-text-secondary">{item.rating}</span>
                            </div>
                          </div>
                        </div>
                        <div className="ld-flex ld-flex--col ld-items--end" style={{ gap: 'var(--ld-space-1)' }}>
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
                          <div className="ld-text-xs ld-text-muted">
                            {item.popularity}% popular
                          </div>
                        </div>
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
                        <div className="ld-flex ld-flex--center" style={{ gap: 'var(--ld-space-1)' }}>
                          <CategoryIcon className="h-4 w-4 ld-text-muted" />
                          <span className="ld-text-xs ld-text-muted" style={{ 
                            background: 'var(--ld-color-tertiary)',
                            padding: 'var(--ld-space-1) var(--ld-space-2)',
                            borderRadius: 'var(--ld-radius-sm)'
                          }}>
                            {item.category}
                          </span>
                        </div>
                      </div>
                      
                      <button className="ld-btn ld-btn--primary ld-btn--md ld-hover-glow ld-w-full">
                        <ShoppingCart className="h-4 w-4" />
                        Buy with LightDom
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletIntegration;
