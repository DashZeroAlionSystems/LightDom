import React, { useState, useEffect } from 'react';
import { Card, Button, Tabs, Badge, Progress, Tag, Input, message, Modal, Statistic, Timeline } from 'antd';
import {
  RocketOutlined,
  ShoppingCartOutlined,
  SearchOutlined,
  TeamOutlined,
  CodeOutlined,
  SafetyCertificateOutlined,
  MessageOutlined,
  DollarOutlined,
  ThunderboltOutlined,
  StarOutlined,
  CheckCircleOutlined,
  LinkOutlined
} from '@ant-design/icons';

const { TabPane } = Tabs;
const { TextArea } = Input;

/**
 * BridgeUseCasesShowcase - Interactive demonstration of bridge use cases
 * Based on BRIDGE_USECASES_AND_COMMERCE_INTEGRATION_RESEARCH.md
 */
const BridgeUseCasesShowcase: React.FC = () => {
  const [activeTab, setActiveTab] = useState('1');

  return (
    <div style={{ padding: '24px', backgroundColor: '#0f172a', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px', textAlign: 'center' }}>
        <h1 style={{ 
          color: '#fff', 
          fontSize: '2.5rem',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '16px'
        }}>
          🌉 Bridge Use Cases Showcase
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '1.1rem', maxWidth: '800px', margin: '0 auto' }}>
          Innovative commerce and communication solutions powered by LightDom's bridge infrastructure
        </p>
      </div>

      {/* Statistics Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        <Card style={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}>
          <Statistic 
            title={<span style={{ color: '#94a3b8' }}>Active Bridges</span>}
            value={5}
            suffix="live"
            valueStyle={{ color: '#10b981' }}
            prefix={<LinkOutlined />}
          />
        </Card>
        <Card style={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}>
          <Statistic 
            title={<span style={{ color: '#94a3b8' }}>Hash Rate</span>}
            value={179.11}
            suffix="H/s"
            valueStyle={{ color: '#3b82f6' }}
            prefix={<ThunderboltOutlined />}
          />
        </Card>
        <Card style={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}>
          <Statistic 
            title={<span style={{ color: '#94a3b8' }}>Products Discovered</span>}
            value={847}
            valueStyle={{ color: '#f59e0b' }}
            prefix={<SearchOutlined />}
          />
        </Card>
        <Card style={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}>
          <Statistic 
            title={<span style={{ color: '#94a3b8' }}>Revenue Generated</span>}
            value={12.4}
            prefix="$"
            suffix="K"
            valueStyle={{ color: '#8b5cf6' }}
            prefix={<DollarOutlined />}
          />
        </Card>
      </div>

      {/* Main Content - Tabs for Each Use Case */}
      <Tabs activeKey={activeTab} onChange={setActiveTab} type="card">
        
        {/* Use Case 1: Search Result Store Injection */}
        <TabPane 
          tab={<span><SearchOutlined /> Search Store Injection</span>} 
          key="1"
        >
          <SearchStoreInjectionDemo />
        </TabPane>

        {/* Use Case 2: Bridge Chat Commerce */}
        <TabPane 
          tab={<span><MessageOutlined /> Chat Commerce</span>} 
          key="2"
        >
          <ChatCommerceDemo />
        </TabPane>

        {/* Use Case 3: Mining-Powered Discovery */}
        <TabPane 
          tab={<span><RocketOutlined /> Mining Discovery</span>} 
          key="3"
        >
          <MiningDiscoveryDemo />
        </TabPane>

        {/* Use Case 4: Client Site Injection */}
        <TabPane 
          tab={<span><CodeOutlined /> Site Injection</span>} 
          key="4"
        >
          <SiteInjectionDemo />
        </TabPane>

        {/* Use Case 5: Collaborative Mining */}
        <TabPane 
          tab={<span><TeamOutlined /> Collaborative Mining</span>} 
          key="5"
        >
          <CollaborativeMiningDemo />
        </TabPane>

        {/* Use Case 6: Smart Contract Marketplace */}
        <TabPane 
          tab={<span><SafetyCertificateOutlined /> Smart Marketplace</span>} 
          key="6"
        >
          <SmartMarketplaceDemo />
        </TabPane>

      </Tabs>
    </div>
  );
};

/**
 * Use Case 1: Search Result Store Injection
 */
const SearchStoreInjectionDemo: React.FC = () => {
  const [isBot, setIsBot] = useState(false);
  const [injecting, setInjecting] = useState(false);
  const [injected, setInjected] = useState(false);
  const [revenue, setRevenue] = useState(0);

  const simulateBotDetection = () => {
    setIsBot(true);
    setInjecting(true);
    
    setTimeout(() => {
      setInjecting(false);
      setInjected(true);
      message.success('Product store injected successfully!');
      
      // Simulate revenue generation
      const revenueInterval = setInterval(() => {
        setRevenue(prev => prev + Math.random() * 5);
      }, 1000);
      
      return () => clearInterval(revenueInterval);
    }, 2000);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
      {/* Left: Configuration */}
      <Card title="Bot Detection & Injection" style={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}>
        <div style={{ marginBottom: '24px' }}>
          <h4 style={{ color: '#fff', marginBottom: '16px' }}>User Agent Detection</h4>
          <Tag color={isBot ? 'green' : 'blue'} style={{ marginBottom: '16px' }}>
            {isBot ? '🤖 Search Bot Detected (Googlebot)' : '👤 Human Visitor'}
          </Tag>
          
          <Button 
            type="primary" 
            onClick={simulateBotDetection}
            disabled={isBot}
            style={{ width: '100%', marginBottom: '16px' }}
          >
            Simulate Search Bot Visit
          </Button>
        </div>

        {injecting && (
          <div style={{ marginBottom: '24px' }}>
            <h4 style={{ color: '#fff', marginBottom: '8px' }}>Injecting Route...</h4>
            <Progress percent={100} status="active" showInfo={false} />
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '8px' }}>
              Creating /lightdom-store route with product catalog
            </p>
          </div>
        )}

        {injected && (
          <>
            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ color: '#10b981', marginBottom: '8px' }}>
                <CheckCircleOutlined /> Store Injected Successfully
              </h4>
              <div style={{ backgroundColor: '#0f172a', padding: '12px', borderRadius: '8px' }}>
                <code style={{ color: '#3b82f6' }}>
                  GET /lightdom-store?q=products<br/>
                  Status: 200 OK<br/>
                  Products: 23 items<br/>
                  SEO: Optimized with rich snippets
                </code>
              </div>
            </div>

            <div>
              <h4 style={{ color: '#fff', marginBottom: '16px' }}>Revenue Tracking</h4>
              <Statistic 
                title="Generated Revenue"
                value={revenue.toFixed(2)}
                prefix="$"
                valueStyle={{ color: '#10b981' }}
              />
              <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '8px' }}>
                10% commission on organic sales through injected store
              </p>
            </div>
          </>
        )}
      </Card>

      {/* Right: Preview */}
      <Card title="Injected Store Preview" style={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}>
        {!injected ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
            <ShoppingCartOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />
            <p>Store will appear here after injection</p>
          </div>
        ) : (
          <div>
            <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#0f172a', borderRadius: '8px' }}>
              <h3 style={{ color: '#fff', marginBottom: '8px' }}>🛍️ Product Store</h3>
              <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>23 products discovered from client site</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {[
                { name: 'Cosmic Gateway NFT', price: 2.5, category: 'Space' },
                { name: 'DOM Space Station', price: 1.8, category: 'Structure' },
                { name: 'Digital Artifact', price: 0.5, category: 'Collectible' },
                { name: 'Quantum Space #7', price: 3.2, category: 'Space' }
              ].map((product, idx) => (
                <div 
                  key={idx} 
                  style={{ 
                    padding: '12px', 
                    backgroundColor: '#0f172a', 
                    borderRadius: '8px',
                    border: '1px solid #334155'
                  }}
                >
                  <h4 style={{ color: '#fff', fontSize: '0.9rem', marginBottom: '4px' }}>{product.name}</h4>
                  <Tag color="purple" style={{ fontSize: '0.75rem', marginBottom: '8px' }}>{product.category}</Tag>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#10b981', fontWeight: 'bold' }}>{product.price} ETH</span>
                    <Button size="small" type="primary">Buy</Button>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#0f172a', borderRadius: '8px', border: '1px solid #334155' }}>
              <h4 style={{ color: '#fff', fontSize: '0.9rem', marginBottom: '8px' }}>SEO Rich Snippet Generated</h4>
              <code style={{ color: '#64748b', fontSize: '0.75rem' }}>
                &lt;script type="application/ld+json"&gt;<br/>
                {'{'}@context: "https://schema.org", @type: "Product"{'}'}<br/>
                &lt;/script&gt;
              </code>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

/**
 * Use Case 2: Bridge Chat Commerce
 */
const ChatCommerceDemo: React.FC = () => {
  const [messages, setMessages] = useState([
    { user: 'SpaceMiner_001', message: 'Check out this new NFT!', type: 'user', timestamp: Date.now() - 120000 },
    { user: 'System', message: 'Product card shared', type: 'system', timestamp: Date.now() - 110000 },
    { user: 'MetaverseBot', message: '15% off today!', type: 'bot', timestamp: Date.now() - 90000 },
    { user: 'User_042', message: 'Added to wishlist ✓', type: 'user', timestamp: Date.now() - 60000 }
  ]);
  const [inputValue, setInputValue] = useState('');

  const sendMessage = () => {
    if (inputValue.trim()) {
      setMessages(prev => [...prev, {
        user: 'You',
        message: inputValue,
        type: 'user',
        timestamp: Date.now()
      }]);
      setInputValue('');
      message.success('Message sent!');
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
      {/* Left: Chat Interface */}
      <Card title="🌉 Bridge: DOM Space Store" extra={<Badge count="3 online" style={{ backgroundColor: '#10b981' }} />} style={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}>
        <div style={{ height: '500px', display: 'flex', flexDirection: 'column' }}>
          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', marginBottom: '16px', padding: '12px', backgroundColor: '#0f172a', borderRadius: '8px' }}>
            {messages.map((msg, idx) => (
              <div key={idx} style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', marginBottom: '4px' }}>
                  <span style={{ color: msg.type === 'bot' ? '#3b82f6' : '#f59e0b', fontWeight: 'bold', marginRight: '8px' }}>
                    {msg.user}:
                  </span>
                  <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>{msg.message}</span>
                </div>
                
                {idx === 1 && (
                  <div style={{ 
                    padding: '12px', 
                    backgroundColor: '#1e293b', 
                    border: '1px solid #334155', 
                    borderRadius: '8px',
                    marginTop: '8px'
                  }}>
                    <h4 style={{ color: '#fff', fontSize: '0.9rem', marginBottom: '8px' }}>📦 Cosmic Gateway NFT</h4>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: '#10b981', fontWeight: 'bold' }}>💰 2.5 ETH</span>
                      <div>
                        <Button size="small" type="primary" style={{ marginRight: '8px' }}>Buy</Button>
                        <Button size="small">Share</Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Input */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <Input 
              placeholder="Type a message..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onPressEnter={sendMessage}
              style={{ backgroundColor: '#0f172a', border: '1px solid #334155', color: '#fff' }}
            />
            <Button type="primary" onClick={sendMessage}>Send</Button>
          </div>
        </div>
      </Card>

      {/* Right: Features */}
      <Card title="Chat Commerce Features" style={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}>
        <div style={{ marginBottom: '24px' }}>
          <h4 style={{ color: '#fff', marginBottom: '12px' }}>Active Features</h4>
          <Tag color="green" style={{ marginBottom: '8px', width: '100%' }}>✓ Product Cards</Tag>
          <Tag color="green" style={{ marginBottom: '8px', width: '100%' }}>✓ Group Purchasing</Tag>
          <Tag color="green" style={{ marginBottom: '8px', width: '100%' }}>✓ Live Q&A</Tag>
          <Tag color="green" style={{ marginBottom: '8px', width: '100%' }}>✓ Wishlists</Tag>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <h4 style={{ color: '#fff', marginBottom: '12px' }}>Statistics</h4>
          <Statistic 
            title={<span style={{ color: '#94a3b8' }}>Messages Today</span>}
            value={247}
            valueStyle={{ color: '#3b82f6', fontSize: '1.5rem' }}
          />
          <Statistic 
            title={<span style={{ color: '#94a3b8' }}>Products Shared</span>}
            value={12}
            valueStyle={{ color: '#f59e0b', fontSize: '1.5rem' }}
            style={{ marginTop: '16px' }}
          />
          <Statistic 
            title={<span style={{ color: '#94a3b8' }}>Sales via Chat</span>}
            value={3.4}
            prefix="$"
            suffix="K"
            valueStyle={{ color: '#10b981', fontSize: '1.5rem' }}
            style={{ marginTop: '16px' }}
          />
        </div>

        <div>
          <h4 style={{ color: '#fff', marginBottom: '12px' }}>Revenue Model</h4>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
            • 3% transaction fee<br/>
            • $49/month hosting<br/>
            • Group discounts enabled
          </p>
        </div>
      </Card>
    </div>
  );
};

/**
 * Use Case 3: Mining-Powered Discovery
 */
const MiningDiscoveryDemo: React.FC = () => {
  const [mining, setMining] = useState(false);
  const [discoveries, setDiscoveries] = useState(12);
  const [operations, setOperations] = useState([
    { url: 'fashion-store.com', status: 'mining', products: 0, score: 0 },
    { url: 'tech-gadgets.io', status: 'analyzing', products: 15, score: 0.73 },
    { url: 'home-decor.net', status: 'completed', products: 23, score: 0.89 },
    { url: 'beauty-products.com', status: 'creating-bridge', products: 31, score: 0.91 },
    { url: 'sports-gear.co', status: 'completed', products: 19, score: 0.78 }
  ]);

  useEffect(() => {
    if (mining) {
      const interval = setInterval(() => {
        setDiscoveries(prev => prev + 1);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [mining]);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
      {/* Left: Mining Operations */}
      <Card title="⛏️ Active Mining Operations" extra={<Button type="primary" onClick={() => setMining(!mining)}>{mining ? 'Pause' : 'Start'} Mining</Button>} style={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}>
        {operations.map((op, idx) => (
          <div key={idx} style={{ 
            padding: '12px', 
            backgroundColor: '#0f172a', 
            borderRadius: '8px', 
            marginBottom: '12px',
            border: '1px solid #334155'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ color: '#fff', fontWeight: 'bold' }}>{op.url}</span>
              <Tag color={op.status === 'completed' ? 'green' : op.status === 'creating-bridge' ? 'purple' : 'blue'}>
                {op.status}
              </Tag>
            </div>
            
            <div style={{ marginBottom: '8px' }}>
              <span style={{ color: '#94a3b8', fontSize: '0.85rem', marginRight: '16px' }}>
                Products: {op.products}
              </span>
              {op.score > 0 && (
                <span style={{ color: '#10b981', fontSize: '0.85rem' }}>
                  Score: {(op.score * 100).toFixed(0)}%
                </span>
              )}
            </div>

            {op.status === 'mining' || op.status === 'analyzing' ? (
              <Progress percent={mining ? 75 : 50} status="active" showInfo={false} />
            ) : op.score > 0.7 && (
              <Button size="small" type="primary" style={{ width: '100%' }}>
                {op.status === 'creating-bridge' ? 'Creating Bridge...' : 'View Bridge'}
              </Button>
            )}
          </div>
        ))}
      </Card>

      {/* Right: Discovery Feed */}
      <Card title="📊 Discovery Analytics" style={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}>
        <div style={{ marginBottom: '24px' }}>
          <Statistic 
            title={<span style={{ color: '#94a3b8' }}>Total Discoveries</span>}
            value={discoveries}
            valueStyle={{ color: '#f59e0b', fontSize: '2rem' }}
            suffix="products"
          />
        </div>

        <div style={{ marginBottom: '24px' }}>
          <h4 style={{ color: '#fff', marginBottom: '12px' }}>Market Analysis</h4>
          <div style={{ marginBottom: '12px' }}>
            <span style={{ color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Demand Level</span>
            <Progress percent={85} strokeColor="#10b981" />
          </div>
          <div style={{ marginBottom: '12px' }}>
            <span style={{ color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Competition</span>
            <Progress percent={60} strokeColor="#f59e0b" />
          </div>
          <div>
            <span style={{ color: '#94a3b8', display: 'block', marginBottom: '4px' }}>SEO Opportunity</span>
            <Progress percent={92} strokeColor="#3b82f6" />
          </div>
        </div>

        <div style={{ padding: '12px', backgroundColor: '#0f172a', borderRadius: '8px', border: '1px solid #334155' }}>
          <h4 style={{ color: '#fff', fontSize: '0.9rem', marginBottom: '8px' }}>Recommended Actions</h4>
          <ul style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0, paddingLeft: '20px' }}>
            <li>Create bridge-specific landing pages</li>
            <li>Enable fast bridge for urgent orders</li>
            <li>Implement chat-based customer service</li>
            <li>Set up automated inventory sync</li>
          </ul>
        </div>
      </Card>
    </div>
  );
};

/**
 * Use Case 4: Client Site Injection
 */
const SiteInjectionDemo: React.FC = () => {
  const [method, setMethod] = useState<'tag' | 'proxy' | 'dns'>('tag');
  const [generated, setGenerated] = useState(false);

  const injectionCode = {
    tag: `<script src="https://lightdom.io/bridge/widget.js" data-client-id="your-client-id"></script>`,
    proxy: `# Nginx Configuration\nlocation / {\n  proxy_pass http://client-origin;\n  sub_filter '</body>' '<script src="https://lightdom.io/inject.js"></script></body>';\n}`,
    dns: `# DNS Configuration\nstore.yourclient.com CNAME bridge.lightdom.io`
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
      {/* Left: Configuration */}
      <Card title="💉 Injection Configuration" style={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}>
        <div style={{ marginBottom: '24px' }}>
          <h4 style={{ color: '#fff', marginBottom: '12px' }}>Injection Method</h4>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            <Button type={method === 'tag' ? 'primary' : 'default'} onClick={() => setMethod('tag')}>
              Tag
            </Button>
            <Button type={method === 'proxy' ? 'primary' : 'default'} onClick={() => setMethod('proxy')}>
              Proxy
            </Button>
            <Button type={method === 'dns' ? 'primary' : 'default'} onClick={() => setMethod('dns')}>
              DNS
            </Button>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <Tag color="blue" style={{ marginBottom: '8px' }}>
              {method === 'tag' && '✓ Easiest - Just add to HTML'}
              {method === 'proxy' && '✓ Transparent - No client code changes'}
              {method === 'dns' && '✓ Subdomain - Fully hosted'}
            </Tag>
          </div>

          <Button 
            type="primary" 
            onClick={() => setGenerated(true)}
            style={{ width: '100%' }}
          >
            Generate Code
          </Button>
        </div>

        {generated && (
          <>
            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ color: '#fff', marginBottom: '12px' }}>Installation Code</h4>
              <div style={{ 
                padding: '12px', 
                backgroundColor: '#0f172a', 
                borderRadius: '8px',
                border: '1px solid #334155',
                fontFamily: 'monospace',
                fontSize: '0.85rem'
              }}>
                <pre style={{ color: '#3b82f6', margin: 0, whiteSpace: 'pre-wrap' }}>
                  {injectionCode[method]}
                </pre>
              </div>
              <Button 
                size="small" 
                style={{ marginTop: '8px' }}
                onClick={() => {
                  navigator.clipboard.writeText(injectionCode[method]);
                  message.success('Copied to clipboard!');
                }}
              >
                Copy Code
              </Button>
            </div>

            <div>
              <h4 style={{ color: '#fff', marginBottom: '12px' }}>Expected Results</h4>
              <Timeline>
                <Timeline.Item color="green">Widget loaded in 250ms</Timeline.Item>
                <Timeline.Item color="green">Products synced from bridge</Timeline.Item>
                <Timeline.Item color="blue">Store UI rendered</Timeline.Item>
                <Timeline.Item color="purple">Analytics tracking enabled</Timeline.Item>
              </Timeline>
            </div>
          </>
        )}
      </Card>

      {/* Right: Preview */}
      <Card title="🎨 Widget Preview" style={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}>
        <div style={{ 
          padding: '16px', 
          backgroundColor: '#0f172a', 
          borderRadius: '8px',
          border: '2px dashed #334155',
          minHeight: '400px'
        }}>
          <div style={{ 
            position: 'absolute', 
            bottom: '20px', 
            right: '20px',
            width: '280px',
            backgroundColor: '#1e293b',
            borderRadius: '12px',
            padding: '16px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
            border: '1px solid #334155'
          }}>
            <h3 style={{ color: '#fff', marginBottom: '12px', fontSize: '1rem' }}>🛒 LightDom Store</h3>
            <div style={{ marginBottom: '12px' }}>
              <h4 style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '8px' }}>Featured Products</h4>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                • Cosmic NFT - 2.5 ETH<br/>
                • Space Token - 1.2 ETH<br/>
                • Bridge Pass - 0.5 ETH
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <Button size="small" type="primary" style={{ flex: 1 }}>View All</Button>
              <Button size="small" style={{ flex: 1 }}>Cart (3)</Button>
            </div>
          </div>
          
          <div style={{ textAlign: 'center', color: '#64748b', marginTop: '150px' }}>
            <p>Your client's website</p>
            <p style={{ fontSize: '0.85rem' }}>Widget appears as floating button (bottom-right)</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

/**
 * Use Case 5: Collaborative Mining
 */
const CollaborativeMiningDemo: React.FC = () => {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
      {/* Left: Mining Room */}
      <Card title="👥 Mining Room: Tech Products" extra={<Badge count="4 active" style={{ backgroundColor: '#10b981' }} />} style={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}>
        <div style={{ marginBottom: '24px' }}>
          <h4 style={{ color: '#fff', marginBottom: '12px' }}>Participants</h4>
          {['SpaceMiner_001', 'TechExplorer_42', 'ProductScout_99', 'DOMHunter_23'].map((name, idx) => (
            <Tag key={idx} color="blue" style={{ marginBottom: '8px', marginRight: '8px' }}>
              {name}
            </Tag>
          ))}
        </div>

        <div style={{ marginBottom: '24px' }}>
          <h4 style={{ color: '#fff', marginBottom: '12px' }}>Task Queue</h4>
          {[
            { url: 'gadget-hub.com', assigned: 'SpaceMiner_001', reward: 0.3 },
            { url: 'tech-store.io', assigned: 'TechExplorer_42', reward: 0.4 },
            { url: 'device-shop.net', assigned: 'Unassigned', reward: 0.2 }
          ].map((task, idx) => (
            <div key={idx} style={{ 
              padding: '12px', 
              backgroundColor: '#0f172a', 
              borderRadius: '8px',
              marginBottom: '8px',
              border: '1px solid #334155'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ color: '#fff', fontSize: '0.9rem' }}>{task.url}</span>
                <Tag color={task.assigned === 'Unassigned' ? 'orange' : 'green'} style={{ fontSize: '0.75rem' }}>
                  {task.assigned}
                </Tag>
              </div>
              <span style={{ color: '#f59e0b', fontSize: '0.85rem' }}>
                Reward: {task.reward} LIGHTDOM
              </span>
            </div>
          ))}
        </div>

        <div>
          <h4 style={{ color: '#fff', marginBottom: '12px' }}>Shared Discoveries</h4>
          <Statistic 
            title={<span style={{ color: '#94a3b8' }}>Products Found</span>}
            value={47}
            valueStyle={{ color: '#10b981' }}
          />
          <Statistic 
            title={<span style={{ color: '#94a3b8' }}>Bridges Created</span>}
            value={12}
            valueStyle={{ color: '#3b82f6' }}
            style={{ marginTop: '12px' }}
          />
        </div>
      </Card>

      {/* Right: Rewards & Stats */}
      <Card title="💰 Rewards & Statistics" style={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}>
        <div style={{ marginBottom: '24px' }}>
          <h4 style={{ color: '#fff', marginBottom: '12px' }}>Room Earnings</h4>
          <Statistic 
            title={<span style={{ color: '#94a3b8' }}>Total Pool</span>}
            value={3.4}
            suffix="LIGHTDOM"
            valueStyle={{ color: '#f59e0b', fontSize: '2rem' }}
          />
        </div>

        <div style={{ marginBottom: '24px' }}>
          <h4 style={{ color: '#fff', marginBottom: '12px' }}>Your Share</h4>
          <Progress percent={35} strokeColor="#10b981" />
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '8px' }}>
            1.19 LIGHTDOM earned (12 discoveries, 3 bridges)
          </p>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <h4 style={{ color: '#fff', marginBottom: '12px' }}>Reward Breakdown</h4>
          <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
            • Product discovery: 0.1 per product<br/>
            • Quality validation: 0.05 per vote<br/>
            • Store creation: 10% of first sale<br/>
            • Referrals: 5% commission
          </div>
        </div>

        <div style={{ padding: '12px', backgroundColor: '#0f172a', borderRadius: '8px', border: '1px solid #334155' }}>
          <h4 style={{ color: '#fff', fontSize: '0.9rem', marginBottom: '8px' }}>Recent Activity</h4>
          <Timeline>
            <Timeline.Item color="green">+0.3 LIGHTDOM - Found 3 products</Timeline.Item>
            <Timeline.Item color="blue">Vote recorded on Laptop listing</Timeline.Item>
            <Timeline.Item color="purple">Bridge created: tech-hub</Timeline.Item>
            <Timeline.Item color="green">+0.15 LIGHTDOM - First sale bonus</Timeline.Item>
          </Timeline>
        </div>
      </Card>
    </div>
  );
};

/**
 * Use Case 6: Smart Contract Marketplace
 */
const SmartMarketplaceDemo: React.FC = () => {
  const [listing, setListing] = useState(false);
  const [orders, setOrders] = useState([
    { id: 1, product: 'Cosmic Gateway NFT', buyer: '0x7a3f...9d2c', amount: 2.5, status: 'escrowed' },
    { id: 2, product: 'Space Station Token', buyer: '0x4b2e...8c1a', amount: 1.8, status: 'fulfilled' }
  ]);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
      {/* Left: List Product */}
      <Card title="📜 Smart Contract Marketplace" style={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}>
        <div style={{ marginBottom: '24px' }}>
          <h4 style={{ color: '#fff', marginBottom: '12px' }}>List New Product</h4>
          <Input placeholder="Product Name" style={{ marginBottom: '12px', backgroundColor: '#0f172a', border: '1px solid #334155', color: '#fff' }} />
          <Input placeholder="Bridge ID" style={{ marginBottom: '12px', backgroundColor: '#0f172a', border: '1px solid #334155', color: '#fff' }} />
          <Input placeholder="Price (ETH)" style={{ marginBottom: '12px', backgroundColor: '#0f172a', border: '1px solid #334155', color: '#fff' }} />
          
          <Button 
            type="primary" 
            onClick={() => {
              setListing(true);
              setTimeout(() => {
                setListing(false);
                message.success('Product listed on smart contract!');
              }, 2000);
            }}
            loading={listing}
            style={{ width: '100%' }}
          >
            List Product (0.01 ETH fee)
          </Button>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <h4 style={{ color: '#fff', marginBottom: '12px' }}>Active Orders</h4>
          {orders.map(order => (
            <div key={order.id} style={{ 
              padding: '12px', 
              backgroundColor: '#0f172a', 
              borderRadius: '8px',
              marginBottom: '12px',
              border: '1px solid #334155'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: '#fff', fontWeight: 'bold' }}>{order.product}</span>
                <Tag color={order.status === 'fulfilled' ? 'green' : 'blue'}>
                  {order.status}
                </Tag>
              </div>
              <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '8px' }}>
                Buyer: {order.buyer}<br/>
                Amount: {order.amount} ETH
              </div>
              {order.status === 'escrowed' && (
                <Button size="small" type="primary" style={{ width: '100%' }}>
                  Fulfill Order
                </Button>
              )}
            </div>
          ))}
        </div>

        <div style={{ padding: '12px', backgroundColor: '#0f172a', borderRadius: '8px', border: '1px solid #334155' }}>
          <h4 style={{ color: '#fff', fontSize: '0.9rem', marginBottom: '8px' }}>Contract Benefits</h4>
          <ul style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0, paddingLeft: '20px' }}>
            <li>No centralized escrow</li>
            <li>Automated settlement</li>
            <li>Transparent transactions</li>
            <li>2.5% fee (gas only)</li>
          </ul>
        </div>
      </Card>

      {/* Right: Transaction Log */}
      <Card title="📊 Transaction Log" style={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}>
        <div style={{ marginBottom: '24px' }}>
          <Statistic 
            title={<span style={{ color: '#94a3b8' }}>Total Volume</span>}
            value={47.3}
            prefix="$"
            suffix="K"
            valueStyle={{ color: '#10b981', fontSize: '2rem' }}
          />
        </div>

        <div style={{ marginBottom: '24px' }}>
          <h4 style={{ color: '#fff', marginBottom: '12px' }}>Recent Transactions</h4>
          <Timeline>
            <Timeline.Item color="green">
              <div style={{ fontSize: '0.85rem' }}>
                <div style={{ color: '#fff' }}>Product Listed</div>
                <div style={{ color: '#64748b' }}>Cosmic Gateway NFT - 2.5 ETH</div>
              </div>
            </Timeline.Item>
            <Timeline.Item color="blue">
              <div style={{ fontSize: '0.85rem' }}>
                <div style={{ color: '#fff' }}>Order Created</div>
                <div style={{ color: '#64748b' }}>Buyer: 0x7a3f...9d2c</div>
              </div>
            </Timeline.Item>
            <Timeline.Item color="purple">
              <div style={{ fontSize: '0.85rem' }}>
                <div style={{ color: '#fff' }}>Escrow Locked</div>
                <div style={{ color: '#64748b' }}>2.5 ETH in smart contract</div>
              </div>
            </Timeline.Item>
            <Timeline.Item color="green">
              <div style={{ fontSize: '0.85rem' }}>
                <div style={{ color: '#fff' }}>Order Fulfilled</div>
                <div style={{ color: '#64748b' }}>Space Station - 1.8 ETH released</div>
              </div>
            </Timeline.Item>
          </Timeline>
        </div>

        <div style={{ padding: '12px', backgroundColor: '#0f172a', borderRadius: '8px', border: '1px solid #334155' }}>
          <h4 style={{ color: '#fff', fontSize: '0.9rem', marginBottom: '8px' }}>Smart Contract Info</h4>
          <div style={{ fontSize: '0.75rem', color: '#64748b', fontFamily: 'monospace' }}>
            Contract: 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb<br/>
            Network: Polygon<br/>
            Validators: 5 active<br/>
            Gas Optimization: 32% savings
          </div>
        </div>
      </Card>
    </div>
  );
};

export default BridgeUseCasesShowcase;
