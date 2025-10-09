import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Button,
  Input,
  Select,
  Modal,
  Form,
  message,
  Space,
  Typography,
  Tabs,
  List,
  Avatar,
  Tag,
  Badge,
  Progress,
  Statistic,
  Divider,
  Tooltip,
  Image,
  Spin,
  Empty
} from 'antd';
import {
  ShoppingCartOutlined,
  WalletOutlined,
  TrophyOutlined,
  StarOutlined,
  FireOutlined,
  CrownOutlined,
  GemOutlined,
  RocketOutlined,
  HeartOutlined,
  ThunderboltOutlined,
  SearchOutlined,
  FilterOutlined,
  PlusOutlined,
  EyeOutlined,
  ShoppingOutlined,
  GiftOutlined,
  CoinsOutlined,
  GlobalOutlined,
  SettingOutlined
} from '@ant-design/icons';
import { useAuth } from '../hooks/useAuth';
import { useBlockchain } from '../hooks/useBlockchain';
import './MetaverseMarketplace.css';

const { Title, Text, Paragraph } = Typography;
const { Search } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

interface MetaverseItem {
  id: string;
  name: string;
  description: string;
  type: 'land' | 'building' | 'vehicle' | 'avatar' | 'tool' | 'decoration' | 'powerup';
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';
  price: number;
  currency: 'LDOM' | 'ETH' | 'DSH';
  image: string;
  icon: string;
  stats: {
    power: number;
    speed: number;
    durability: number;
    special: number;
  };
  effects: string[];
  biome: string;
  requirements: {
    level: number;
    tokens: number;
    achievements: string[];
  };
  owner?: string;
  forSale: boolean;
  createdAt: string;
  metadata: {
    dimensions: { width: number; height: number; depth: number };
    weight: number;
    materials: string[];
    origin: string;
  };
}

interface MetaverseInventory {
  items: MetaverseItem[];
  totalValue: number;
  categories: {
    land: number;
    buildings: number;
    vehicles: number;
    avatars: number;
    tools: number;
    decorations: number;
    powerups: number;
  };
}

const MetaverseMarketplace: React.FC = () => {
  const { user } = useAuth();
  const { tokenBalance, submitOptimization } = useBlockchain();
  const [items, setItems] = useState<MetaverseItem[]>([]);
  const [inventory, setInventory] = useState<MetaverseInventory | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState('marketplace');
  const [searchText, setSearchText] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterRarity, setFilterRarity] = useState('all');
  const [sortBy, setSortBy] = useState('price');
  const [selectedItem, setSelectedItem] = useState<MetaverseItem | null>(null);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [showItemModal, setShowItemModal] = useState(false);

  useEffect(() => {
    loadMarketplaceData();
    loadInventory();
  }, []);

  const loadMarketplaceData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/metaverse/marketplace');
      const data = await response.json();
      if (data.success) {
        setItems(data.items);
      }
    } catch (error) {
      console.error('Failed to load marketplace data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadInventory = async () => {
    try {
      const response = await fetch('/api/metaverse/inventory');
      const data = await response.json();
      if (data.success) {
        setInventory(data.inventory);
      }
    } catch (error) {
      console.error('Failed to load inventory:', error);
    }
  };

  const handlePurchase = async (item: MetaverseItem) => {
    try {
      setLoading(true);
      const response = await fetch('/api/metaverse/purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          itemId: item.id,
          price: item.price,
          currency: item.currency
        }),
      });

      const data = await response.json();
      if (data.success) {
        message.success(`Successfully purchased ${item.name}!`);
        setShowPurchaseModal(false);
        loadInventory();
        loadMarketplaceData();
      } else {
        message.error(data.error || 'Purchase failed');
      }
    } catch (error) {
      message.error('Purchase failed');
    } finally {
      setLoading(false);
    }
  };

  const handleMineForItems = async () => {
    try {
      setLoading(true);
      message.loading('Mining for metaverse items...', 0);
      
      // Simulate mining process
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const response = await fetch('/api/metaverse/mine-items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          miningType: 'metaverse_items',
          duration: 3000
        }),
      });

      const data = await response.json();
      if (data.success) {
        message.destroy();
        message.success(`Mining complete! Found ${data.itemsFound} items and earned ${data.tokensEarned} tokens!`);
        loadInventory();
      } else {
        message.destroy();
        message.error('Mining failed');
      }
    } catch (error) {
      message.destroy();
      message.error('Mining failed');
    } finally {
      setLoading(false);
    }
  };

  const getRarityColor = (rarity: string) => {
    const colors = {
      common: '#95a5a6',
      rare: '#3498db',
      epic: '#9b59b6',
      legendary: '#f39c12',
      mythic: '#e74c3c'
    };
    return colors[rarity as keyof typeof colors] || '#95a5a6';
  };

  const getRarityIcon = (rarity: string) => {
    const icons = {
      common: <StarOutlined />,
      rare: <GemOutlined />,
      epic: <CrownOutlined />,
      legendary: <TrophyOutlined />,
      mythic: <FireOutlined />
    };
    return icons[rarity as keyof typeof icons] || <StarOutlined />;
  };

  const getTypeIcon = (type: string) => {
    const icons = {
      land: <GlobalOutlined />,
      building: <SettingOutlined />,
      vehicle: <RocketOutlined />,
      avatar: <HeartOutlined />,
      tool: <ThunderboltOutlined />,
      decoration: <GiftOutlined />,
      powerup: <CoinsOutlined />
    };
    return icons[type as keyof typeof icons] || <StarOutlined />;
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchText.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchText.toLowerCase());
    const matchesType = filterType === 'all' || item.type === filterType;
    const matchesRarity = filterRarity === 'all' || item.rarity === filterRarity;
    
    return matchesSearch && matchesType && matchesRarity;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'price':
        return a.price - b.price;
      case 'rarity':
        const rarityOrder = { common: 1, rare: 2, epic: 3, legendary: 4, mythic: 5 };
        return rarityOrder[b.rarity as keyof typeof rarityOrder] - rarityOrder[a.rarity as keyof typeof rarityOrder];
      case 'power':
        return b.stats.power - a.stats.power;
      default:
        return 0;
    }
  });

  const mockItems: MetaverseItem[] = [
    {
      id: 'land_1',
      name: 'Crystal Forest Plot',
      description: 'A mystical forest land with crystal formations and magical properties',
      type: 'land',
      rarity: 'epic',
      price: 1500,
      currency: 'LDOM',
      image: '/api/placeholder/300/200',
      icon: '🌲',
      stats: { power: 85, speed: 20, durability: 100, special: 90 },
      effects: ['+20% mining efficiency', '+15% token generation', 'Crystal resonance'],
      biome: 'forest',
      requirements: { level: 5, tokens: 1000, achievements: ['forest_explorer'] },
      forSale: true,
      createdAt: new Date().toISOString(),
      metadata: {
        dimensions: { width: 100, height: 100, depth: 50 },
        weight: 1000,
        materials: ['crystal', 'wood', 'magic'],
        origin: 'metaverse_forest'
      }
    },
    {
      id: 'building_1',
      name: 'Quantum Lab',
      description: 'Advanced research facility for algorithm development and optimization',
      type: 'building',
      rarity: 'legendary',
      price: 5000,
      currency: 'LDOM',
      image: '/api/placeholder/300/200',
      icon: '🏗️',
      stats: { power: 95, speed: 60, durability: 80, special: 100 },
      effects: ['+50% algorithm discovery', '+30% research speed', 'Quantum processing'],
      biome: 'tech',
      requirements: { level: 10, tokens: 3000, achievements: ['researcher', 'quantum_master'] },
      forSale: true,
      createdAt: new Date().toISOString(),
      metadata: {
        dimensions: { width: 200, height: 150, depth: 100 },
        weight: 5000,
        materials: ['quantum_crystal', 'tech_metal', 'energy_core'],
        origin: 'metaverse_tech'
      }
    },
    {
      id: 'vehicle_1',
      name: 'Lightning Speeder',
      description: 'High-speed vehicle for rapid DOM traversal and optimization',
      type: 'vehicle',
      rarity: 'rare',
      price: 800,
      currency: 'LDOM',
      image: '/api/placeholder/300/200',
      icon: '⚡',
      stats: { power: 70, speed: 95, durability: 60, special: 75 },
      effects: ['+40% traversal speed', '+25% optimization range', 'Lightning boost'],
      biome: 'speed',
      requirements: { level: 3, tokens: 500, achievements: ['speed_demon'] },
      forSale: true,
      createdAt: new Date().toISOString(),
      metadata: {
        dimensions: { width: 50, height: 30, depth: 20 },
        weight: 200,
        materials: ['lightning_crystal', 'speed_metal', 'energy_core'],
        origin: 'metaverse_speed'
      }
    },
    {
      id: 'avatar_1',
      name: 'DOM Guardian',
      description: 'Powerful avatar with enhanced optimization abilities',
      type: 'avatar',
      rarity: 'mythic',
      price: 10000,
      currency: 'LDOM',
      image: '/api/placeholder/300/200',
      icon: '🛡️',
      stats: { power: 100, speed: 50, durability: 100, special: 100 },
      effects: ['+100% optimization power', '+50% damage resistance', 'Guardian aura'],
      biome: 'guardian',
      requirements: { level: 15, tokens: 8000, achievements: ['guardian', 'optimization_master'] },
      forSale: true,
      createdAt: new Date().toISOString(),
      metadata: {
        dimensions: { width: 40, height: 80, depth: 30 },
        weight: 100,
        materials: ['guardian_crystal', 'divine_metal', 'power_core'],
        origin: 'metaverse_guardian'
      }
    },
    {
      id: 'tool_1',
      name: 'Optimization Hammer',
      description: 'Powerful tool for DOM optimization and space mining',
      type: 'tool',
      rarity: 'epic',
      price: 1200,
      currency: 'LDOM',
      image: '/api/placeholder/300/200',
      icon: '🔨',
      stats: { power: 80, speed: 40, durability: 90, special: 85 },
      effects: ['+35% optimization efficiency', '+20% space savings', 'Hammer strike'],
      biome: 'tools',
      requirements: { level: 7, tokens: 800, achievements: ['craftsman'] },
      forSale: true,
      createdAt: new Date().toISOString(),
      metadata: {
        dimensions: { width: 30, height: 60, depth: 15 },
        weight: 300,
        materials: ['optimization_crystal', 'heavy_metal', 'power_core'],
        origin: 'metaverse_tools'
      }
    }
  ];

  // Use mock data if API fails
  const displayItems = items.length > 0 ? filteredItems : mockItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchText.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchText.toLowerCase());
    const matchesType = filterType === 'all' || item.type === filterType;
    const matchesRarity = filterRarity === 'all' || item.rarity === filterRarity;
    
    return matchesSearch && matchesType && matchesRarity;
  });

  return (
    <div className="metaverse-marketplace">
      <div className="marketplace-header">
        <Title level={2} className="marketplace-title">
          🌌 Metaverse Marketplace
        </Title>
        <Paragraph className="marketplace-subtitle">
          Discover, purchase, and trade metaverse items. Mine for rare items and build your virtual empire!
        </Paragraph>
      </div>

      <Tabs activeKey={selectedTab} onChange={setSelectedTab} className="marketplace-tabs">
        <TabPane tab="🛒 Marketplace" key="marketplace">
          <div className="marketplace-content">
            {/* Filters and Search */}
            <Card className="filters-card">
              <Row gutter={[16, 16]} align="middle">
                <Col xs={24} sm={8} md={6}>
                  <Search
                    placeholder="Search items..."
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    enterButton={<SearchOutlined />}
                  />
                </Col>
                <Col xs={24} sm={8} md={4}>
                  <Select
                    placeholder="Type"
                    value={filterType}
                    onChange={setFilterType}
                    style={{ width: '100%' }}
                  >
                    <Option value="all">All Types</Option>
                    <Option value="land">Land</Option>
                    <Option value="building">Buildings</Option>
                    <Option value="vehicle">Vehicles</Option>
                    <Option value="avatar">Avatars</Option>
                    <Option value="tool">Tools</Option>
                    <Option value="decoration">Decorations</Option>
                    <Option value="powerup">Powerups</Option>
                  </Select>
                </Col>
                <Col xs={24} sm={8} md={4}>
                  <Select
                    placeholder="Rarity"
                    value={filterRarity}
                    onChange={setFilterRarity}
                    style={{ width: '100%' }}
                  >
                    <Option value="all">All Rarities</Option>
                    <Option value="common">Common</Option>
                    <Option value="rare">Rare</Option>
                    <Option value="epic">Epic</Option>
                    <Option value="legendary">Legendary</Option>
                    <Option value="mythic">Mythic</Option>
                  </Select>
                </Col>
                <Col xs={24} sm={8} md={4}>
                  <Select
                    placeholder="Sort by"
                    value={sortBy}
                    onChange={setSortBy}
                    style={{ width: '100%' }}
                  >
                    <Option value="price">Price</Option>
                    <Option value="rarity">Rarity</Option>
                    <Option value="power">Power</Option>
                  </Select>
                </Col>
                <Col xs={24} sm={8} md={6}>
                  <Button
                    type="primary"
                    icon={<ThunderboltOutlined />}
                    onClick={handleMineForItems}
                    loading={loading}
                    block
                  >
                    Mine for Items
                  </Button>
                </Col>
              </Row>
            </Card>

            {/* Items Grid */}
            <Row gutter={[24, 24]} className="items-grid">
              {displayItems.map((item) => (
                <Col xs={24} sm={12} md={8} lg={6} key={item.id}>
                  <Card
                    className={`item-card rarity-${item.rarity}`}
                    hoverable
                    cover={
                      <div className="item-image">
                        <div className="item-icon">{item.icon}</div>
                        <div className="item-overlay">
                          <Button
                            type="primary"
                            icon={<EyeOutlined />}
                            onClick={() => {
                              setSelectedItem(item);
                              setShowItemModal(true);
                            }}
                          >
                            View Details
                          </Button>
                        </div>
                      </div>
                    }
                    actions={[
                      <Tooltip title="View Details">
                        <EyeOutlined
                          onClick={() => {
                            setSelectedItem(item);
                            setShowItemModal(true);
                          }}
                        />
                      </Tooltip>,
                      <Tooltip title="Purchase">
                        <ShoppingCartOutlined
                          onClick={() => {
                            setSelectedItem(item);
                            setShowPurchaseModal(true);
                          }}
                        />
                      </Tooltip>
                    ]}
                  >
                    <Card.Meta
                      title={
                        <div className="item-title">
                          <span className="item-name">{item.name}</span>
                          <Tag
                            color={getRarityColor(item.rarity)}
                            icon={getRarityIcon(item.rarity)}
                            className="rarity-tag"
                          >
                            {item.rarity.toUpperCase()}
                          </Tag>
                        </div>
                      }
                      description={
                        <div className="item-description">
                          <Paragraph ellipsis={{ rows: 2 }}>
                            {item.description}
                          </Paragraph>
                          <div className="item-stats">
                            <div className="stat-item">
                              <ThunderboltOutlined /> {item.stats.power}
                            </div>
                            <div className="stat-item">
                              <RocketOutlined /> {item.stats.speed}
                            </div>
                            <div className="stat-item">
                              <ShieldOutlined /> {item.stats.durability}
                            </div>
                          </div>
                          <div className="item-price">
                            <Text strong className="price-text">
                              {item.price} {item.currency}
                            </Text>
                          </div>
                        </div>
                      }
                    />
                  </Card>
                </Col>
              ))}
            </Row>

            {displayItems.length === 0 && (
              <Empty
                description="No items found"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )}
          </div>
        </TabPane>

        <TabPane tab="🎒 Inventory" key="inventory">
          <div className="inventory-content">
            <Card title="Your Metaverse Inventory" className="inventory-card">
              <Row gutter={[24, 24]}>
                <Col xs={24} md={8}>
                  <Statistic
                    title="Total Items"
                    value={inventory?.items.length || 0}
                    prefix={<GiftOutlined />}
                  />
                </Col>
                <Col xs={24} md={8}>
                  <Statistic
                    title="Total Value"
                    value={inventory?.totalValue || 0}
                    prefix={<WalletOutlined />}
                    suffix="LDOM"
                  />
                </Col>
                <Col xs={24} md={8}>
                  <Statistic
                    title="Rare Items"
                    value={inventory?.items.filter(item => item.rarity !== 'common').length || 0}
                    prefix={<TrophyOutlined />}
                  />
                </Col>
              </Row>
            </Card>

            <Card title="Item Categories" className="categories-card">
              <Row gutter={[16, 16]}>
                {Object.entries(inventory?.categories || {}).map(([category, count]) => (
                  <Col xs={12} sm={8} md={4} key={category}>
                    <Card size="small" className="category-card">
                      <div className="category-icon">
                        {getTypeIcon(category)}
                      </div>
                      <div className="category-name">
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </div>
                      <div className="category-count">
                        {count} items
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Card>
          </div>
        </TabPane>

        <TabPane tab="⚡ Mining" key="mining">
          <div className="mining-content">
            <Card title="Metaverse Item Mining" className="mining-card">
              <Row gutter={[24, 24]}>
                <Col xs={24} md={12}>
                  <div className="mining-info">
                    <Title level={4}>Mine for Metaverse Items</Title>
                    <Paragraph>
                      Use your mining power to discover rare metaverse items. The more you mine,
                      the better items you can find!
                    </Paragraph>
                    <div className="mining-stats">
                      <div className="stat-item">
                        <Text strong>Mining Power:</Text> {user?.stats?.miningPower || 100}
                      </div>
                      <div className="stat-item">
                        <Text strong>Tokens Available:</Text> {tokenBalance || 0} LDOM
                      </div>
                    </div>
                  </div>
                </Col>
                <Col xs={24} md={12}>
                  <div className="mining-actions">
                    <Button
                      type="primary"
                      size="large"
                      icon={<ThunderboltOutlined />}
                      onClick={handleMineForItems}
                      loading={loading}
                      block
                    >
                      Start Mining Session
                    </Button>
                    <Button
                      size="large"
                      icon={<SettingOutlined />}
                      block
                      style={{ marginTop: 16 }}
                    >
                      Configure Mining
                    </Button>
                  </div>
                </Col>
              </Row>
            </Card>
          </div>
        </TabPane>
      </Tabs>

      {/* Item Details Modal */}
      <Modal
        title="Item Details"
        open={showItemModal}
        onCancel={() => setShowItemModal(false)}
        footer={null}
        width={600}
      >
        {selectedItem && (
          <div className="item-details">
            <Row gutter={[24, 24]}>
              <Col xs={24} md={12}>
                <div className="item-image-large">
                  <div className="item-icon-large">{selectedItem.icon}</div>
                </div>
              </Col>
              <Col xs={24} md={12}>
                <div className="item-info">
                  <Title level={3}>{selectedItem.name}</Title>
                  <Tag
                    color={getRarityColor(selectedItem.rarity)}
                    icon={getRarityIcon(selectedItem.rarity)}
                    className="rarity-tag-large"
                  >
                    {selectedItem.rarity.toUpperCase()}
                  </Tag>
                  <Paragraph>{selectedItem.description}</Paragraph>
                  
                  <Divider />
                  
                  <Title level={5}>Stats</Title>
                  <div className="stats-grid">
                    <div className="stat-item">
                      <ThunderboltOutlined /> Power: {selectedItem.stats.power}
                    </div>
                    <div className="stat-item">
                      <RocketOutlined /> Speed: {selectedItem.stats.speed}
                    </div>
                    <div className="stat-item">
                      <ShieldOutlined /> Durability: {selectedItem.stats.durability}
                    </div>
                    <div className="stat-item">
                      <StarOutlined /> Special: {selectedItem.stats.special}
                    </div>
                  </div>
                  
                  <Divider />
                  
                  <Title level={5}>Effects</Title>
                  <ul className="effects-list">
                    {selectedItem.effects.map((effect, index) => (
                      <li key={index}>{effect}</li>
                    ))}
                  </ul>
                  
                  <Divider />
                  
                  <div className="item-price-large">
                    <Text strong className="price-text-large">
                      {selectedItem.price} {selectedItem.currency}
                    </Text>
                  </div>
                </div>
              </Col>
            </Row>
          </div>
        )}
      </Modal>

      {/* Purchase Confirmation Modal */}
      <Modal
        title="Confirm Purchase"
        open={showPurchaseModal}
        onOk={() => selectedItem && handlePurchase(selectedItem)}
        onCancel={() => setShowPurchaseModal(false)}
        confirmLoading={loading}
      >
        {selectedItem && (
          <div className="purchase-confirmation">
            <div className="purchase-item">
              <div className="item-icon">{selectedItem.icon}</div>
              <div className="item-details">
                <Title level={4}>{selectedItem.name}</Title>
                <Text type="secondary">{selectedItem.description}</Text>
              </div>
            </div>
            <Divider />
            <div className="purchase-summary">
              <div className="summary-row">
                <Text>Price:</Text>
                <Text strong>{selectedItem.price} {selectedItem.currency}</Text>
              </div>
              <div className="summary-row">
                <Text>Your Balance:</Text>
                <Text strong>{tokenBalance || 0} LDOM</Text>
              </div>
              <Divider />
              <div className="summary-row total">
                <Text strong>Total:</Text>
                <Text strong>{selectedItem.price} {selectedItem.currency}</Text>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MetaverseMarketplace;