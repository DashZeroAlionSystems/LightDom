import React, { useState, useEffect } from 'react';
import { Card, Button, Input, Select, Badge, Modal, message, Tabs, Statistic, Row, Col, Progress } from 'antd';
import {
  ShoppingCartOutlined,
  WalletOutlined,
  TrophyOutlined,
  RocketOutlined,
  PlusOutlined,
  HeartOutlined,
  HeartFilled,
  FireOutlined,
  StarOutlined,
  CrownOutlined,
  ThunderboltOutlined
} from '@ant-design/icons';

const { TextArea } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

// NFT Interface
interface NFT {
  id: string;
  name: string;
  description: string;
  price: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  category: 'space' | 'bridge' | 'structure' | 'collectible';
  image: string;
  owner: string;
  forSale: boolean;
  likes: number;
  views: number;
  minted: string;
}

// Sample NFT Data
const sampleNFTs: NFT[] = [
  {
    id: '1',
    name: 'Cosmic Gateway #42',
    description: 'A rare metaverse bridge connecting dimensions',
    price: 2.5,
    rarity: 'legendary',
    category: 'bridge',
    image: '🌌',
    owner: '0x7a3f...9d2c',
    forSale: true,
    likes: 142,
    views: 1205,
    minted: '2024-01-15'
  },
  {
    id: '2',
    name: 'DOM Space Station',
    description: 'Optimized spatial structure with premium features',
    price: 1.8,
    rarity: 'epic',
    category: 'structure',
    image: '🏗️',
    owner: '0x4b2e...6f1a',
    forSale: true,
    likes: 89,
    views: 763,
    minted: '2024-01-20'
  },
  {
    id: '3',
    name: 'Digital Artifact',
    description: 'Unique collectible from the early metaverse',
    price: 0.5,
    rarity: 'rare',
    category: 'collectible',
    image: '💎',
    owner: '0x9c8d...3e5f',
    forSale: true,
    likes: 45,
    views: 320,
    minted: '2024-02-01'
  },
  {
    id: '4',
    name: 'Quantum Space #7',
    description: 'Optimized quantum space with advanced algorithms',
    price: 3.2,
    rarity: 'legendary',
    category: 'space',
    image: '🚀',
    owner: '0x1f7a...8b4d',
    forSale: true,
    likes: 256,
    views: 2103,
    minted: '2024-01-10'
  },
  {
    id: '5',
    name: 'Metaverse Bridge Pro',
    description: 'High-performance bridge with zero latency',
    price: 1.2,
    rarity: 'epic',
    category: 'bridge',
    image: '🌉',
    owner: '0x5e3c...2a9f',
    forSale: true,
    likes: 178,
    views: 1542,
    minted: '2024-01-25'
  },
  {
    id: '6',
    name: 'Crystal Structure',
    description: 'Beautiful crystalline spatial architecture',
    price: 0.8,
    rarity: 'rare',
    category: 'structure',
    image: '💠',
    owner: '0x6d4e...7c1b',
    forSale: true,
    likes: 67,
    views: 521,
    minted: '2024-02-05'
  }
];

const MetaverseNFTMarketplace: React.FC = () => {
  const [nfts, setNfts] = useState<NFT[]>(sampleNFTs);
  const [filteredNFTs, setFilteredNFTs] = useState<NFT[]>(sampleNFTs);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [wallet, setWallet] = useState<number>(10.0);
  const [totalSales, setTotalSales] = useState<number>(24);
  const [totalVolume, setTotalVolume] = useState<number>(47.3);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedRarity, setSelectedRarity] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [isPurchaseModalVisible, setIsPurchaseModalVisible] = useState(false);
  const [selectedNFT, setSelectedNFT] = useState<NFT | null>(null);
  
  // Create NFT Form State
  const [newNFT, setNewNFT] = useState({
    name: '',
    description: '',
    price: 1.0,
    rarity: 'common' as 'common' | 'rare' | 'epic' | 'legendary',
    category: 'collectible' as 'space' | 'bridge' | 'structure' | 'collectible',
    image: '🎨'
  });

  // Filter and sort NFTs
  useEffect(() => {
    let filtered = [...nfts];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(nft =>
        nft.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        nft.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Rarity filter
    if (selectedRarity !== 'all') {
      filtered = filtered.filter(nft => nft.rarity === selectedRarity);
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(nft => nft.category === selectedCategory);
    }

    // Sort
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'popular':
        filtered.sort((a, b) => b.likes - a.likes);
        break;
      case 'newest':
      default:
        filtered.sort((a, b) => new Date(b.minted).getTime() - new Date(a.minted).getTime());
        break;
    }

    setFilteredNFTs(filtered);
  }, [nfts, searchTerm, selectedRarity, selectedCategory, sortBy]);

  // Toggle favorite
  const toggleFavorite = (nftId: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(nftId)) {
      newFavorites.delete(nftId);
      message.info('Removed from favorites');
    } else {
      newFavorites.add(nftId);
      message.success('Added to favorites');
    }
    setFavorites(newFavorites);
  };

  // Purchase NFT
  const purchaseNFT = (nft: NFT) => {
    if (wallet >= nft.price) {
      setWallet(prev => prev - nft.price);
      setTotalSales(prev => prev + 1);
      setTotalVolume(prev => prev + nft.price);
      
      // Update NFT status
      setNfts(prev => prev.map(n => 
        n.id === nft.id ? { ...n, forSale: false, owner: '0x0000...you' } : n
      ));
      
      message.success(`Successfully purchased "${nft.name}" for ${nft.price} ETH!`);
      setIsPurchaseModalVisible(false);
      setSelectedNFT(null);
    } else {
      message.error('Insufficient wallet balance!');
    }
  };

  // Create new NFT
  const createNFT = () => {
    if (!newNFT.name || !newNFT.description) {
      message.error('Please fill in all required fields');
      return;
    }

    const mintingCost = 0.05;
    if (wallet < mintingCost) {
      message.error('Insufficient funds for minting (0.05 ETH required)');
      return;
    }

    const newNFTData: NFT = {
      id: String(nfts.length + 1),
      name: newNFT.name,
      description: newNFT.description,
      price: newNFT.price,
      rarity: newNFT.rarity,
      category: newNFT.category,
      image: newNFT.image,
      owner: '0x0000...you',
      forSale: true,
      likes: 0,
      views: 0,
      minted: new Date().toISOString().split('T')[0]
    };

    setNfts(prev => [newNFTData, ...prev]);
    setWallet(prev => prev - mintingCost);
    message.success(`Successfully minted "${newNFT.name}"!`);
    
    // Reset form
    setNewNFT({
      name: '',
      description: '',
      price: 1.0,
      rarity: 'common',
      category: 'collectible',
      image: '🎨'
    });
    setIsCreateModalVisible(false);
  };

  // Rarity badge color
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'gold';
      case 'epic': return 'orange';
      case 'rare': return 'purple';
      case 'common': return 'blue';
      default: return 'default';
    }
  };

  // Rarity icon
  const getRarityIcon = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return <CrownOutlined />;
      case 'epic': return <FireOutlined />;
      case 'rare': return <StarOutlined />;
      default: return <ThunderboltOutlined />;
    }
  };

  // Available emoji icons
  const emojiOptions = ['🎨', '🚀', '🌌', '💎', '🏗️', '🌉', '💠', '🔮', '⚡', '🎯', '🎪', '🎭'];

  return (
    <div style={{ padding: '24px', background: '#0f172a', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ 
            fontSize: '2.5rem', 
            marginBottom: '8px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            🎭 Metaverse NFT Marketplace
          </h1>
          <p style={{ fontSize: '1.125rem', color: '#94a3b8' }}>
            Trade unique DOM spaces, bridges, and structures in the LightDom metaverse
          </p>
        </div>

        {/* Statistics */}
        <Row gutter={16} style={{ marginBottom: '24px' }}>
          <Col xs={24} sm={8}>
            <Card style={{ background: '#1e293b', border: '1px solid #334155' }}>
              <Statistic
                title={<span style={{ color: '#94a3b8' }}>Your Wallet</span>}
                value={wallet.toFixed(2)}
                suffix="ETH"
                valueStyle={{ color: '#10b981' }}
                prefix={<WalletOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card style={{ background: '#1e293b', border: '1px solid #334155' }}>
              <Statistic
                title={<span style={{ color: '#94a3b8' }}>Total Sales</span>}
                value={totalSales}
                valueStyle={{ color: '#3b82f6' }}
                prefix={<ShoppingCartOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card style={{ background: '#1e293b', border: '1px solid #334155' }}>
              <Statistic
                title={<span style={{ color: '#94a3b8' }}>Trading Volume</span>}
                value={totalVolume.toFixed(1)}
                suffix="ETH"
                valueStyle={{ color: '#a855f7' }}
                prefix={<TrophyOutlined />}
              />
            </Card>
          </Col>
        </Row>

        {/* Filters and Controls */}
        <Card style={{ background: '#1e293b', border: '1px solid #334155', marginBottom: '24px' }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={8}>
              <Input
                placeholder="Search NFTs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ background: '#334155', border: '1px solid #475569', color: '#fff' }}
              />
            </Col>
            <Col xs={12} sm={4}>
              <Select
                value={selectedRarity}
                onChange={setSelectedRarity}
                style={{ width: '100%' }}
              >
                <Option value="all">All Rarities</Option>
                <Option value="common">Common</Option>
                <Option value="rare">Rare</Option>
                <Option value="epic">Epic</Option>
                <Option value="legendary">Legendary</Option>
              </Select>
            </Col>
            <Col xs={12} sm={4}>
              <Select
                value={selectedCategory}
                onChange={setSelectedCategory}
                style={{ width: '100%' }}
              >
                <Option value="all">All Categories</Option>
                <Option value="space">Space</Option>
                <Option value="bridge">Bridge</Option>
                <Option value="structure">Structure</Option>
                <Option value="collectible">Collectible</Option>
              </Select>
            </Col>
            <Col xs={12} sm={4}>
              <Select
                value={sortBy}
                onChange={setSortBy}
                style={{ width: '100%' }}
              >
                <Option value="newest">Newest</Option>
                <Option value="price-low">Price: Low to High</Option>
                <Option value="price-high">Price: High to Low</Option>
                <Option value="popular">Most Popular</Option>
              </Select>
            </Col>
            <Col xs={12} sm={4}>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setIsCreateModalVisible(true)}
                style={{ width: '100%' }}
              >
                Create NFT
              </Button>
            </Col>
          </Row>
        </Card>

        {/* NFT Grid */}
        <Row gutter={[16, 16]}>
          {filteredNFTs.map((nft) => (
            <Col xs={24} sm={12} md={8} key={nft.id}>
              <Card
                hoverable
                style={{ 
                  background: '#1e293b', 
                  border: '1px solid #334155',
                  height: '100%'
                }}
                cover={
                  <div style={{ 
                    height: '200px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    background: '#334155',
                    fontSize: '4rem'
                  }}>
                    {nft.image}
                  </div>
                }
                actions={[
                  <Button
                    type="text"
                    icon={favorites.has(nft.id) ? <HeartFilled style={{ color: '#ef4444' }} /> : <HeartOutlined />}
                    onClick={() => toggleFavorite(nft.id)}
                  >
                    {nft.likes}
                  </Button>,
                  nft.forSale && nft.owner !== '0x0000...you' ? (
                    <Button
                      type="primary"
                      icon={<ShoppingCartOutlined />}
                      onClick={() => {
                        setSelectedNFT(nft);
                        setIsPurchaseModalVisible(true);
                      }}
                    >
                      Buy
                    </Button>
                  ) : (
                    <Button disabled>
                      {nft.owner === '0x0000...you' ? 'Owned' : 'Not for Sale'}
                    </Button>
                  )
                ]}
              >
                <Card.Meta
                  title={
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: '#f8fafc' }}>{nft.name}</span>
                      <Badge count={getRarityIcon(nft.rarity)} style={{ backgroundColor: getRarityColor(nft.rarity) }} />
                    </div>
                  }
                  description={
                    <div>
                      <p style={{ color: '#94a3b8', marginBottom: '12px' }}>{nft.description}</p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                        <Badge color={getRarityColor(nft.rarity)} text={<span style={{ color: '#cbd5e1' }}>{nft.rarity}</span>} />
                        <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#10b981' }}>{nft.price} ETH</span>
                      </div>
                      <div style={{ marginTop: '8px', fontSize: '0.75rem', color: '#64748b' }}>
                        Owner: {nft.owner} | Views: {nft.views}
                      </div>
                    </div>
                  }
                />
              </Card>
            </Col>
          ))}
        </Row>

        {/* Empty State */}
        {filteredNFTs.length === 0 && (
          <Card style={{ background: '#1e293b', border: '1px solid #334155', textAlign: 'center', padding: '48px' }}>
            <RocketOutlined style={{ fontSize: '4rem', color: '#64748b', marginBottom: '16px' }} />
            <h3 style={{ color: '#cbd5e1', marginBottom: '8px' }}>No NFTs Found</h3>
            <p style={{ color: '#94a3b8' }}>Try adjusting your filters or create a new NFT</p>
          </Card>
        )}

        {/* Create NFT Modal */}
        <Modal
          title="Create New NFT"
          open={isCreateModalVisible}
          onOk={createNFT}
          onCancel={() => setIsCreateModalVisible(false)}
          okText="Mint NFT (0.05 ETH)"
        >
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Name *</label>
            <Input
              value={newNFT.name}
              onChange={(e) => setNewNFT({ ...newNFT, name: e.target.value })}
              placeholder="Enter NFT name"
            />
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Description *</label>
            <TextArea
              value={newNFT.description}
              onChange={(e) => setNewNFT({ ...newNFT, description: e.target.value })}
              placeholder="Describe your NFT"
              rows={3}
            />
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Price (ETH)</label>
            <Input
              type="number"
              value={newNFT.price}
              onChange={(e) => setNewNFT({ ...newNFT, price: parseFloat(e.target.value) || 1.0 })}
              min={0.1}
              step={0.1}
            />
          </div>
          <Row gutter={16}>
            <Col span={12}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Rarity</label>
              <Select
                value={newNFT.rarity}
                onChange={(value) => setNewNFT({ ...newNFT, rarity: value })}
                style={{ width: '100%' }}
              >
                <Option value="common">Common</Option>
                <Option value="rare">Rare</Option>
                <Option value="epic">Epic</Option>
                <Option value="legendary">Legendary</Option>
              </Select>
            </Col>
            <Col span={12}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Category</label>
              <Select
                value={newNFT.category}
                onChange={(value) => setNewNFT({ ...newNFT, category: value })}
                style={{ width: '100%' }}
              >
                <Option value="space">Space</Option>
                <Option value="bridge">Bridge</Option>
                <Option value="structure">Structure</Option>
                <Option value="collectible">Collectible</Option>
              </Select>
            </Col>
          </Row>
          <div style={{ marginTop: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Icon</label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {emojiOptions.map(emoji => (
                <Button
                  key={emoji}
                  type={newNFT.image === emoji ? 'primary' : 'default'}
                  onClick={() => setNewNFT({ ...newNFT, image: emoji })}
                  style={{ fontSize: '1.5rem', padding: '4px 12px' }}
                >
                  {emoji}
                </Button>
              ))}
            </div>
          </div>
        </Modal>

        {/* Purchase Confirmation Modal */}
        <Modal
          title="Purchase NFT"
          open={isPurchaseModalVisible}
          onOk={() => selectedNFT && purchaseNFT(selectedNFT)}
          onCancel={() => {
            setIsPurchaseModalVisible(false);
            setSelectedNFT(null);
          }}
          okText="Confirm Purchase"
        >
          {selectedNFT && (
            <div>
              <div style={{ textAlign: 'center', fontSize: '4rem', marginBottom: '16px' }}>
                {selectedNFT.image}
              </div>
              <h3 style={{ marginBottom: '8px' }}>{selectedNFT.name}</h3>
              <p style={{ color: '#64748b', marginBottom: '16px' }}>{selectedNFT.description}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span>Price:</span>
                <span style={{ fontWeight: 'bold', color: '#10b981' }}>{selectedNFT.price} ETH</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span>Your Balance:</span>
                <span style={{ fontWeight: 'bold' }}>{wallet.toFixed(2)} ETH</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                <span>After Purchase:</span>
                <span style={{ fontWeight: 'bold', color: wallet - selectedNFT.price >= 0 ? '#10b981' : '#ef4444' }}>
                  {(wallet - selectedNFT.price).toFixed(2)} ETH
                </span>
              </div>
              {wallet < selectedNFT.price && (
                <div style={{ padding: '12px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '4px', color: '#991b1b' }}>
                  ⚠️ Insufficient funds! You need {(selectedNFT.price - wallet).toFixed(2)} more ETH.
                </div>
              )}
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default MetaverseNFTMarketplace;
