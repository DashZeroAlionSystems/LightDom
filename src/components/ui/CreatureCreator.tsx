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
  Slider,
  Upload,
  Tooltip,
  Badge,
  Statistic,
  Divider,
  Tag,
  Switch,
  Progress,
  Alert,
  List,
  Avatar,
  Spin
} from 'antd';
import {
  PlusOutlined,
  RocketOutlined,
  HeartOutlined,
  ThunderboltOutlined,
  CrownOutlined,
  StarOutlined,
  FireOutlined,
  BulbOutlined,
  EyeOutlined,
  GiftOutlined,
  WalletOutlined,
  SaveOutlined,
  ReloadOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
  FileImageOutlined,
  VideoCameraOutlined
} from '@ant-design/icons';
import { MetaverseLoreGenerator, CreatureLore, ObjectLore } from '../../services/MetaverseLoreGenerator';
import './CreatureCreator.css';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

interface CreatureCreatorProps {
  onCreated?: (tokenId: string) => void;
  userWallet?: string;
}

const CreatureCreator: React.FC<CreatureCreatorProps> = ({ onCreated, userWallet }) => {
  const [form] = Form.useForm();
  const [loreGenerator] = useState(() => new MetaverseLoreGenerator());
  const [loading, setLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [entityType, setEntityType] = useState<'creature' | 'object'>('creature');
  const [generatedLore, setGeneratedLore] = useState<CreatureLore | ObjectLore | null>(null);
  const [autoGenerateLore, setAutoGenerateLore] = useState(true);
  const [estimatedCost, setEstimatedCost] = useState(0.02);
  const [selectedRarity, setSelectedRarity] = useState<string>('Common');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [animationFile, setAnimationFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const rarityMultipliers: Record<string, number> = {
    Common: 1,
    Uncommon: 1.5,
    Rare: 2,
    Epic: 3,
    Legendary: 5,
    Mythical: 10
  };

  const creatureCategories = [
    { value: 'Companion', label: 'Companion', icon: '🐾', description: 'Loyal pet that accompanies you' },
    { value: 'Mount', label: 'Mount', icon: '🐉', description: 'Rideable creature for travel' },
    { value: 'Guardian', label: 'Guardian', icon: '🛡️', description: 'Protective companion' },
    { value: 'Harvester', label: 'Harvester', icon: '⛏️', description: 'Mining assistant' },
    { value: 'Mystical', label: 'Mystical', icon: '✨', description: 'Magical being' },
    { value: 'Mechanical', label: 'Mechanical', icon: '🤖', description: 'Robotic entity' }
  ];

  const objectCategories = [
    { value: 'Tool', label: 'Tool', icon: '🔧', description: 'Useful implement' },
    { value: 'Weapon', label: 'Weapon', icon: '⚔️', description: 'Combat weapon' },
    { value: 'Armor', label: 'Armor', icon: '🛡️', description: 'Protective gear' },
    { value: 'Artifact', label: 'Artifact', icon: '📿', description: 'Mystical relic' },
    { value: 'Vehicle', label: 'Vehicle', icon: '🚀', description: 'Transportation' },
    { value: 'Building', label: 'Building', icon: '🏰', description: 'Structure' }
  ];

  const attributes = [
    { value: 'Mining', label: 'Mining Power', icon: <ThunderboltOutlined />, color: '#faad14' },
    { value: 'Speed', label: 'Speed', icon: <RocketOutlined />, color: '#1890ff' },
    { value: 'Defense', label: 'Defense', icon: <StarOutlined />, color: '#52c41a' },
    { value: 'Magic', label: 'Magic', icon: <FireOutlined />, color: '#9254de' },
    { value: 'Intelligence', label: 'Intelligence', icon: <BulbOutlined />, color: '#13c2c2' },
    { value: 'Charm', label: 'Charm', icon: <HeartOutlined />, color: '#eb2f96' }
  ];

  const rarities = [
    { value: 'Common', color: '#8c8c8c', glow: false },
    { value: 'Uncommon', color: '#52c41a', glow: false },
    { value: 'Rare', color: '#1890ff', glow: true },
    { value: 'Epic', color: '#9254de', glow: true },
    { value: 'Legendary', color: '#faad14', glow: true },
    { value: 'Mythical', color: '#ff4d4f', glow: true }
  ];

  useEffect(() => {
    calculateCost();
  }, [selectedRarity, entityType]);

  const calculateCost = () => {
    const baseCost = entityType === 'creature' ? 0.02 : 0.015;
    const multiplier = rarityMultipliers[selectedRarity] || 1;
    setEstimatedCost(baseCost * multiplier);
  };

  const handleGenerateLore = () => {
    const category = form.getFieldValue('category');
    const rarity = form.getFieldValue('rarity') || 'Common';
    const primaryAttribute = form.getFieldValue('primaryAttribute') || 'Mining';
    const customName = form.getFieldValue('name');

    if (!category) {
      message.warning('Please select a category first');
      return;
    }

    let lore: CreatureLore | ObjectLore;

    if (entityType === 'creature') {
      lore = loreGenerator.generateCreatureLore({
        category: category,
        rarity: rarity,
        primaryAttribute: primaryAttribute,
        customName: customName || undefined
      });
    } else {
      lore = loreGenerator.generateObjectLore({
        category: category,
        rarity: rarity,
        primaryPower: primaryAttribute,
        customName: customName || undefined
      });
    }

    setGeneratedLore(lore);

    // Auto-fill form fields
    form.setFieldsValue({
      name: lore.name,
      origin: lore.origin,
      backstory: lore.backstory,
      flavorText: lore.flavorText,
      metaverseRole: lore.metaverseRole
    });

    if ('species' in lore) {
      form.setFieldsValue({ species: lore.species });
    } else if ('type' in lore) {
      form.setFieldsValue({ objectType: lore.type });
    }

    message.success('Lore generated successfully!');
  };

  const handleImageUpload = async (file: File) => {
    setImageFile(file);
    // In a real implementation, upload to IPFS or server
    message.success('Image uploaded successfully');
    return false; // Prevent auto upload
  };

  const handleAnimationUpload = async (file: File) => {
    setAnimationFile(file);
    // In a real implementation, upload to IPFS or server
    message.success('Animation uploaded successfully');
    return false;
  };

  const handleSubmit = async (values: any) => {
    if (!userWallet) {
      message.error('Please connect your wallet first');
      return;
    }

    setLoading(true);

    try {
      // In a real implementation:
      // 1. Upload image and animation to IPFS
      // 2. Create metadata JSON and upload to IPFS
      // 3. Call smart contract to mint NFT
      // 4. Wait for transaction confirmation

      // Simulated blockchain transaction
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock token ID
      const tokenId = `${Date.now()}`;

      message.success(`${entityType === 'creature' ? 'Creature' : 'Object'} created successfully! Token ID: ${tokenId}`);

      if (onCreated) {
        onCreated(tokenId);
      }

      // Reset form
      form.resetFields();
      setGeneratedLore(null);
      setImageFile(null);
      setAnimationFile(null);
    } catch (error: any) {
      message.error(`Failed to create ${entityType}: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const renderLorePreview = () => {
    if (!generatedLore) return null;

    return (
      <Card
        className="lore-preview-card"
        title={
          <Space>
            <BookOutlined />
            <Text strong>Generated Lore</Text>
          </Space>
        }
        extra={
          <Button size="small" icon={<ReloadOutlined />} onClick={handleGenerateLore}>
            Regenerate
          </Button>
        }
      >
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <div>
            <Text strong>Name:</Text>
            <Title level={4} style={{ margin: '8px 0' }}>{generatedLore.name}</Title>
          </div>

          {'species' in generatedLore && (
            <div>
              <Text strong>Species:</Text>
              <Paragraph>{generatedLore.species}</Paragraph>
            </div>
          )}

          {'type' in generatedLore && (
            <div>
              <Text strong>Type:</Text>
              <Paragraph>{generatedLore.type}</Paragraph>
            </div>
          )}

          <div>
            <Text strong>Origin:</Text>
            <Paragraph>{generatedLore.origin}</Paragraph>
          </div>

          <div>
            <Text strong>Backstory:</Text>
            <Paragraph>{generatedLore.backstory}</Paragraph>
          </div>

          <div>
            <Text strong>Flavor Text:</Text>
            <Paragraph italic style={{ borderLeft: '3px solid #1890ff', paddingLeft: 12, margin: '8px 0' }}>
              {generatedLore.flavorText}
            </Paragraph>
          </div>

          <div>
            <Text strong>Metaverse Role:</Text>
            <Paragraph>{generatedLore.metaverseRole}</Paragraph>
          </div>

          <div>
            <Text strong>Connections:</Text>
            <div style={{ marginTop: 8 }}>
              {generatedLore.connections.map((conn, idx) => (
                <Tag key={idx} color="blue">{conn}</Tag>
              ))}
            </div>
          </div>

          {'abilities' in generatedLore && (
            <div>
              <Text strong>Abilities:</Text>
              <List
                size="small"
                dataSource={generatedLore.abilities}
                renderItem={(ability) => (
                  <List.Item>
                    <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                    {ability}
                  </List.Item>
                )}
              />
            </div>
          )}

          {'powers' in generatedLore && (
            <div>
              <Text strong>Powers:</Text>
              <List
                size="small"
                dataSource={generatedLore.powers}
                renderItem={(power) => (
                  <List.Item>
                    <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                    {power}
                  </List.Item>
                )}
              />
            </div>
          )}
        </Space>
      </Card>
    );
  };

  const renderMetaverseWorld = () => {
    const world = loreGenerator.getWorld();

    return (
      <Card title="Metaverse World: LightDom" className="world-info-card">
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <div>
            <Text strong>Theme:</Text>
            <Paragraph>{world.theme.name} - {world.theme.description}</Paragraph>
            <div>
              {world.theme.elements.map((element, idx) => (
                <Tag key={idx} color="purple">{element}</Tag>
              ))}
            </div>
          </div>

          <Divider />

          <div>
            <Text strong>Factions:</Text>
            <Row gutter={[16, 16]} style={{ marginTop: 12 }}>
              {world.factions.map((faction, idx) => (
                <Col span={12} key={idx}>
                  <Card size="small" hoverable>
                    <Title level={5}>{faction.name}</Title>
                    <Paragraph style={{ fontSize: 12 }}>{faction.description}</Paragraph>
                    <Tag color={faction.alignment === 'Order' ? 'blue' : faction.alignment === 'Chaos' ? 'red' : 'gold'}>
                      {faction.alignment}
                    </Tag>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>

          <Divider />

          <div>
            <Text strong>Legendary Locations:</Text>
            <Row gutter={[16, 16]} style={{ marginTop: 12 }}>
              {world.locations.slice(0, 4).map((location, idx) => (
                <Col span={12} key={idx}>
                  <Card size="small" hoverable>
                    <Title level={5}>{location.name}</Title>
                    <Paragraph style={{ fontSize: 12 }}>{location.description}</Paragraph>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        </Space>
      </Card>
    );
  };

  return (
    <div className="creature-creator-container">
      <Card className="creator-card">
        <Row gutter={24}>
          <Col span={16}>
            <Title level={2}>
              <CrownOutlined /> Create Metaverse {entityType === 'creature' ? 'Creature' : 'Object'}
            </Title>
            <Paragraph>
              Design and mint unique animated creatures and objects with AI-generated backstories
              that seamlessly integrate into the LightDom metaverse.
            </Paragraph>

            <Alert
              message="Coherent Lore System"
              description="All entities are automatically connected to the metaverse's history, factions, and locations, ensuring a unified narrative experience."
              type="info"
              icon={<InfoCircleOutlined />}
              showIcon
              style={{ marginBottom: 24 }}
            />

            <Tabs activeKey={entityType} onChange={(key) => setEntityType(key as 'creature' | 'object')}>
              <TabPane tab={<span><HeartOutlined /> Creature</span>} key="creature" />
              <TabPane tab={<span><GiftOutlined /> Object</span>} key="object" />
            </Tabs>

            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              initialValues={{
                rarity: 'Common',
                primaryAttribute: 'Mining',
                autoGenerate: true
              }}
            >
              {/* Auto-generate toggle */}
              <Form.Item label="Auto-generate Lore" name="autoGenerate" valuePropName="checked">
                <Switch
                  checked={autoGenerateLore}
                  onChange={setAutoGenerateLore}
                  checkedChildren="AI Enabled"
                  unCheckedChildren="Manual"
                />
              </Form.Item>

              {autoGenerateLore && (
                <Button
                  type="dashed"
                  icon={<BulbOutlined />}
                  onClick={handleGenerateLore}
                  block
                  style={{ marginBottom: 16 }}
                >
                  Generate Lore with AI
                </Button>
              )}

              {/* Basic Info */}
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="Name"
                    name="name"
                    rules={[{ required: true, message: 'Please enter a name' }]}
                  >
                    <Input placeholder="Enter unique name" maxLength={50} showCount />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Category"
                    name="category"
                    rules={[{ required: true, message: 'Please select a category' }]}
                  >
                    <Select placeholder="Select category">
                      {(entityType === 'creature' ? creatureCategories : objectCategories).map(cat => (
                        <Option key={cat.value} value={cat.value}>
                          <Space>
                            <span>{cat.icon}</span>
                            <span>{cat.label}</span>
                          </Space>
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="Rarity"
                    name="rarity"
                    rules={[{ required: true }]}
                  >
                    <Select
                      placeholder="Select rarity"
                      onChange={setSelectedRarity}
                    >
                      {rarities.map(r => (
                        <Option key={r.value} value={r.value}>
                          <Tag color={r.color}>{r.value}</Tag>
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Primary Attribute"
                    name="primaryAttribute"
                    rules={[{ required: true }]}
                  >
                    <Select placeholder="Select primary attribute">
                      {attributes.map(attr => (
                        <Option key={attr.value} value={attr.value}>
                          <Space>
                            {attr.icon}
                            <span>{attr.label}</span>
                          </Space>
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              {/* Lore fields */}
              {entityType === 'creature' ? (
                <Form.Item label="Species" name="species">
                  <Input placeholder="e.g., Digital Familiar, Cyber Beast" />
                </Form.Item>
              ) : (
                <Form.Item label="Object Type" name="objectType">
                  <Input placeholder="e.g., Legendary Tool, Ancient Artifact" />
                </Form.Item>
              )}

              <Form.Item label="Origin" name="origin">
                <Input placeholder="Where this entity came from" />
              </Form.Item>

              <Form.Item label="Backstory" name="backstory">
                <TextArea rows={4} placeholder="The entity's history and journey" maxLength={500} showCount />
              </Form.Item>

              <Form.Item label="Flavor Text" name="flavorText">
                <TextArea rows={2} placeholder="A memorable quote or description" maxLength={200} showCount />
              </Form.Item>

              <Form.Item label="Metaverse Role" name="metaverseRole">
                <Input placeholder="Purpose in the metaverse" />
              </Form.Item>

              {/* Visual assets */}
              <Divider>Visual Assets</Divider>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="Image">
                    <Upload
                      listType="picture-card"
                      maxCount={1}
                      beforeUpload={handleImageUpload}
                      accept="image/*"
                    >
                      <div>
                        <FileImageOutlined />
                        <div style={{ marginTop: 8 }}>Upload Image</div>
                      </div>
                    </Upload>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Animation (GIF/Video)">
                    <Upload
                      listType="picture-card"
                      maxCount={1}
                      beforeUpload={handleAnimationUpload}
                      accept="image/gif,video/*"
                    >
                      <div>
                        <VideoCameraOutlined />
                        <div style={{ marginTop: 8 }}>Upload Animation</div>
                      </div>
                    </Upload>
                  </Form.Item>
                </Col>
              </Row>

              {/* Cost and submit */}
              <Card size="small" style={{ marginTop: 16, backgroundColor: '#f0f2f5' }}>
                <Row gutter={16} align="middle">
                  <Col span={12}>
                    <Statistic
                      title="Estimated Cost"
                      value={estimatedCost}
                      suffix="ETH"
                      prefix={<WalletOutlined />}
                    />
                  </Col>
                  <Col span={12}>
                    <Button
                      type="primary"
                      size="large"
                      icon={<PlusOutlined />}
                      htmlType="submit"
                      loading={loading}
                      block
                    >
                      Create & Mint NFT
                    </Button>
                  </Col>
                </Row>
              </Card>
            </Form>
          </Col>

          {/* Right sidebar */}
          <Col span={8}>
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              {generatedLore && renderLorePreview()}
              {renderMetaverseWorld()}

              <Card title="Benefits of NFT Entities" size="small">
                <List
                  size="small"
                  dataSource={[
                    { icon: <ThunderboltOutlined />, text: 'Boost mining efficiency', color: '#faad14' },
                    { icon: <RocketOutlined />, text: 'Faster optimization tasks', color: '#1890ff' },
                    { icon: <StarOutlined />, text: 'Earn prestige points', color: '#52c41a' },
                    { icon: <FireOutlined />, text: 'Trade on marketplace', color: '#ff4d4f' },
                    { icon: <CrownOutlined />, text: 'Level up and evolve', color: '#9254de' },
                    { icon: <GiftOutlined />, text: 'Rent to other users', color: '#13c2c2' }
                  ]}
                  renderItem={(item) => (
                    <List.Item>
                      <Space>
                        {React.cloneElement(item.icon, { style: { color: item.color } })}
                        <Text>{item.text}</Text>
                      </Space>
                    </List.Item>
                  )}
                />
              </Card>
            </Space>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

const BookOutlined = () => <span>📖</span>;

export default CreatureCreator;
