import React, { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  TextArea,
} from '@/components/ui';
import {
  Boxes,
  Brush,
  Copy,
  Globe,
  Image as ImageIcon,
  LayoutDashboard,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Wand2,
  Wallet,
} from 'lucide-react';

interface NftItem {
  id: string;
  name: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  category: 'avatar' | 'tool' | 'pet' | 'structure' | 'artifact';
  description: string;
  miningBoost: number;
}

interface MarketplaceListing {
  id: string;
  item: NftItem;
  priceEth: number;
  seller: string;
  listedAt: string;
}

const rarityTokens: Record<NftItem['rarity'], { label: string; variant: 'outline' | 'primary' | 'secondary' | 'warning' }> = {
  common: { label: 'Common', variant: 'outline' },
  rare: { label: 'Rare', variant: 'secondary' },
  epic: { label: 'Epic', variant: 'primary' },
  legendary: { label: 'Legendary', variant: 'warning' },
};

const catalogue: NftItem[] = [
  {
    id: 'nft-aurora-suit',
    name: 'Aurora Exo Suit',
    rarity: 'epic',
    category: 'avatar',
    description: 'Procedurally generated explorer suit shimmering with aurora lighting layers.',
    miningBoost: 22,
  },
  {
    id: 'nft-celestial-companion',
    name: 'Celestial Codex Companion',
    rarity: 'legendary',
    category: 'artifact',
    description: 'Sentient codex that reveals hidden LightDom schematics and slot mutations.',
    miningBoost: 34,
  },
  {
    id: 'nft-plasma-harvester',
    name: 'Plasma Harvester',
    rarity: 'rare',
    category: 'tool',
    description: 'Automation-grade harvesting arm that increases slot throughput and reduces burn-in.',
    miningBoost: 16,
  },
];

const initialMarketplace: MarketplaceListing[] = [
  {
    id: 'market-1',
    item: catalogue[0],
    priceEth: 1.2,
    seller: 'vault.lightdom.eth',
    listedAt: '2h ago',
  },
  {
    id: 'market-2',
    item: catalogue[2],
    priceEth: 0.68,
    seller: 'ops.guild.eth',
    listedAt: '35m ago',
  },
];

const bridgeTargets = [
  {
    id: 'bridge-ui',
    label: 'UI Pilots',
    status: 'Streaming prompts',
    latency: '41ms',
  },
  {
    id: 'bridge-mining',
    label: 'Mining Automation',
    status: 'Ready to sync',
    latency: '–',
  },
  {
    id: 'bridge-governance',
    label: 'Governance Council',
    status: 'Awaiting invite',
    latency: '–',
  },
];

const MetaverseNftDemoPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [mintedItems, setMintedItems] = useState<NftItem[]>([]);
  const [marketplace, setMarketplace] = useState<MarketplaceListing[]>(initialMarketplace);
  const [bridgeStates, setBridgeStates] = useState<Record<string, boolean>>({});

  const [formState, setFormState] = useState({
    name: 'Nebula Aurora Companion',
    rarity: 'epic' as NftItem['rarity'],
    category: 'pet' as NftItem['category'],
    description: 'Procedurally generated pet that guides explorers through LightDom slot mazes.',
    miningBoost: 18,
  });

  const collectionMetrics = useMemo(
    () => [
      {
        label: 'Catalogue items',
        value: catalogue.length,
        icon: <Boxes className='h-4 w-4' />,
      },
      {
        label: 'Minted in session',
        value: mintedItems.length,
        icon: <Sparkles className='h-4 w-4' />,
      },
      {
        label: 'Marketplace listings',
        value: marketplace.length,
        icon: <ShoppingBag className='h-4 w-4' />,
      },
      {
        label: 'Active bridges',
        value: Object.values(bridgeStates).filter(Boolean).length,
        icon: <Globe className='h-4 w-4' />,
      },
    ],
    [mintedItems.length, marketplace.length, bridgeStates],
  );

  const handleMint = (item: NftItem) => {
    setMintedItems((current) => {
      if (current.some((existing) => existing.id === item.id)) {
        toast('Already minted in this session.');
        return current;
      }
      toast.success(`Minted ${item.name}`);
      return [item, ...current];
    });
  };

  const handleCreateSubmit = () => {
    if (!formState.name.trim()) {
      toast.error('Provide a name to mint the item.');
      return;
    }

    const newItem: NftItem = {
      id: `custom-${Date.now()}`,
      name: formState.name,
      rarity: formState.rarity,
      category: formState.category,
      description: formState.description,
      miningBoost: formState.miningBoost,
    };

    setMintedItems((current) => [newItem, ...current]);
    toast.success('Custom NFT minted to session inventory');
  };

  const handleListForSale = (item: NftItem) => {
    setMarketplace((current) => [{
      id: `market-${Date.now()}`,
      item,
      priceEth: Number((Math.random() + 0.5).toFixed(2)),
      seller: 'demo.user.eth',
      listedAt: 'Just now',
    }, ...current]);
    toast.success('Item listed on marketplace');
  };

  const handlePurchase = (listing: MarketplaceListing) => {
    setMarketplace((current) => current.filter((entry) => entry.id !== listing.id));
    toast.success(`Purchased ${listing.item.name} for ${listing.priceEth} ETH`);
  };

  const toggleBridge = (targetId: string) => {
    setBridgeStates((current) => {
      const nextState = !current[targetId];
      if (nextState) {
        toast.success('Bridge activated');
      } else {
        toast('Bridge deactivated');
      }
      return { ...current, [targetId]: nextState };
    });
  };

  return (
    <div className='space-y-6 p-6'>
      <header className='rounded-3xl border border-outline/10 bg-gradient-to-br from-[#0f172a] via-surface-container-high to-surface p-6 shadow-level-2 text-on-surface'>
        <div className='flex flex-wrap items-start justify-between gap-6'>
          <div className='space-y-3'>
            <div className='inline-flex items-center gap-2 rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary'>
              <Sparkles className='h-4 w-4' />
              Metaverse NFT system
            </div>
            <div>
              <h1 className='text-3xl font-semibold md:text-4xl'>Launch LightDom-ready metaverse assets</h1>
              <p className='mt-2 max-w-3xl text-sm text-on-surface-variant'>
                Mint procedurally generated NFTs, manage marketplace listings, and orchestrate chat bridges feeding automation squads.
              </p>
            </div>
          </div>
          <div className='grid gap-3 sm:grid-cols-2'>
            {collectionMetrics.map((metric) => (
              <Card key={metric.label} className='border-outline/20 bg-surface-container-low min-w-[140px]'>
                <CardContent className='flex items-center justify-between gap-3 py-4'>
                  <div>
                    <span className='text-xs uppercase tracking-wide text-on-surface-variant/70'>{metric.label}</span>
                    <p className='text-2xl font-semibold text-on-surface'>{metric.value}</p>
                  </div>
                  <div className='rounded-full bg-primary/10 p-2 text-primary'>{metric.icon}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </header>

      <Tabs value={activeTab} onValueChange={setActiveTab} className='space-y-4'>
        <TabsList className='flex flex-wrap gap-2 rounded-full border border-outline/10 bg-surface-container-high p-1 shadow-level-1'>
          <TabsTrigger value='overview' className='gap-2'>
            <LayoutDashboard className='h-4 w-4' /> Overview
          </TabsTrigger>
          <TabsTrigger value='nfts' className='gap-2'>
            <ImageIcon className='h-4 w-4' /> Browse NFTs
          </TabsTrigger>
          <TabsTrigger value='create' className='gap-2'>
            <Wand2 className='h-4 w-4' /> Create item
          </TabsTrigger>
          <TabsTrigger value='marketplace' className='gap-2'>
            <ShoppingBag className='h-4 w-4' /> Marketplace
          </TabsTrigger>
          <TabsTrigger value='bridge' className='gap-2'>
            <Wallet className='h-4 w-4' /> Chat bridge
          </TabsTrigger>
          <TabsTrigger value='technical' className='gap-2'>
            <ShieldCheck className='h-4 w-4' /> Technical
          </TabsTrigger>
        </TabsList>

        <TabsContent value='overview' className='space-y-4'>
          <Card className='border-outline/15 bg-surface'>
            <CardHeader>
              <CardTitle className='text-on-surface'>Metaverse charter</CardTitle>
            </CardHeader>
            <CardContent className='grid gap-4 md:grid-cols-3'>
              <Card className='border-outline/15 bg-surface-container-low'>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2 text-on-surface'>
                    <Sparkles className='h-5 w-5 text-primary' /> NFT Capabilities
                  </CardTitle>
                </CardHeader>
                <CardContent className='text-sm text-on-surface-variant space-y-2'>
                  <p>ERC1155 multi-token blueprints with animated SVG renders and LightDom metadata.</p>
                  <ul className='space-y-1'>
                    <li>• 8 item categories</li>
                    <li>• Rarity-driven mining boosts</li>
                    <li>• Watcher-backed provenance logs</li>
                  </ul>
                </CardContent>
              </Card>
              <Card className='border-outline/15 bg-surface-container-low'>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2 text-on-surface'>
                    <ShoppingBag className='h-5 w-5 text-primary' /> Marketplace
                  </CardTitle>
                </CardHeader>
                <CardContent className='text-sm text-on-surface-variant space-y-2'>
                  <p>Fee-capped marketplace supporting auctions, offers, and bundle drops with programmatic APIs.</p>
                  <ul className='space-y-1'>
                    <li>• 2.5% platform fee</li>
                    <li>• Automated royalties per creator</li>
                    <li>• Real-time event stream via Socket.IO</li>
                  </ul>
                </CardContent>
              </Card>
              <Card className='border-outline/15 bg-surface-container-low'>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2 text-on-surface'>
                    <Globe className='h-5 w-5 text-primary' /> Chat Bridges
                  </CardTitle>
                </CardHeader>
                <CardContent className='text-sm text-on-surface-variant space-y-2'>
                  <p>Bridge NFTs into DeepSeek chat flows so squads can request slots, metadata exports, and analytics.</p>
                  <ul className='space-y-1'>
                    <li>• Structured intent routing</li>
                    <li>• Watcher-led sync confirmations</li>
                    <li>• Ready for multi-tenant deployments</li>
                  </ul>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='nfts' className='space-y-4'>
          <Card className='border-outline/15 bg-surface'>
            <CardHeader>
              <CardTitle className='flex items-center gap-2 text-on-surface'>
                <ImageIcon className='h-5 w-5 text-primary' /> Catalogue
              </CardTitle>
            </CardHeader>
            <CardContent className='grid gap-4 md:grid-cols-3'>
              {catalogue.map((item) => (
                <Card key={item.id} className='border-outline/15 bg-surface-container-low'>
                  <CardContent className='space-y-3 py-5'>
                    <div className='space-y-1'>
                      <div className='flex items-center gap-2'>
                        <CardTitle className='text-on-surface text-lg'>{item.name}</CardTitle>
                        <Badge variant={rarityTokens[item.rarity].variant}>{rarityTokens[item.rarity].label}</Badge>
                      </div>
                      <p className='text-xs uppercase tracking-wide text-on-surface-variant/60'>Category · {item.category}</p>
                    </div>
                    <p className='text-sm text-on-surface-variant'>{item.description}</p>
                    <Badge variant='outline'>Mining boost · +{item.miningBoost}%</Badge>
                    <Button onClick={() => handleMint(item)} leftIcon={<Sparkles className='h-4 w-4' />}>
                      Mint to wallet
                    </Button>
                    <Button variant='outlined' onClick={() => handleListForSale(item)} leftIcon={<ShoppingBag className='h-4 w-4' />}>
                      List for sale
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>

          <Card className='border-outline/15 bg-surface'>
            <CardHeader>
              <CardTitle className='text-on-surface'>Session inventory</CardTitle>
            </CardHeader>
            <CardContent className='space-y-3'>
              {mintedItems.length === 0 ? (
                <p className='text-sm text-on-surface-variant'>Mint an item to view the session inventory.</p>
              ) : (
                mintedItems.map((item) => (
                  <Card key={item.id} className='border-outline/10 bg-surface-container-low'>
                    <CardContent className='flex flex-wrap items-center justify-between gap-3 py-4'>
                      <div>
                        <p className='text-sm font-semibold text-on-surface'>{item.name}</p>
                        <p className='text-xs text-on-surface-variant/70'>Category · {item.category}</p>
                      </div>
                      <div className='flex items-center gap-2'>
                        <Badge variant='outline'>Boost +{item.miningBoost}%</Badge>
                        <Button variant='text' size='sm' leftIcon={<Copy className='h-4 w-4' />} onClick={() => toast.success('Metadata copied to clipboard')}>
                          Copy metadata
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='create' className='space-y-4'>
          <Card className='border-outline/15 bg-surface'>
            <CardHeader>
              <CardTitle className='flex items-center gap-2 text-on-surface'>
                <Brush className='h-5 w-5 text-primary' /> Create a custom asset
              </CardTitle>
            </CardHeader>
            <CardContent className='grid gap-4 md:grid-cols-2'>
              <div className='space-y-4'>
                <Input
                  label='Item name'
                  value={formState.name}
                  onChange={(event) => setFormState((current) => ({ ...current, name: event.target.value }))}
                  placeholder='Orbital Cartographer Drone'
                />
                <div className='grid gap-4 sm:grid-cols-2'>
                  <div className='space-y-2'>
                    <label className='text-xs uppercase tracking-wide text-on-surface-variant/70'>Rarity</label>
                    <select
                      className='rounded-2xl border border-outline/20 bg-surface-container-low p-3 text-sm text-on-surface'
                      value={formState.rarity}
                      onChange={(event) =>
                        setFormState((current) => ({
                          ...current,
                          rarity: event.target.value as NftItem['rarity'],
                        }))
                      }
                    >
                      <option value='common'>Common</option>
                      <option value='rare'>Rare</option>
                      <option value='epic'>Epic</option>
                      <option value='legendary'>Legendary</option>
                    </select>
                  </div>
                  <div className='space-y-2'>
                    <label className='text-xs uppercase tracking-wide text-on-surface-variant/70'>Category</label>
                    <select
                      className='rounded-2xl border border-outline/20 bg-surface-container-low p-3 text-sm text-on-surface'
                      value={formState.category}
                      onChange={(event) =>
                        setFormState((current) => ({
                          ...current,
                          category: event.target.value as NftItem['category'],
                        }))
                      }
                    >
                      <option value='avatar'>Avatar</option>
                      <option value='tool'>Tool</option>
                      <option value='pet'>Pet</option>
                      <option value='structure'>Structure</option>
                      <option value='artifact'>Artifact</option>
                    </select>
                  </div>
                </div>
                <TextArea
                  label='Description'
                  rows={4}
                  value={formState.description}
                  onChange={(event) => setFormState((current) => ({ ...current, description: event.target.value }))}
                />
                <Input
                  label='Mining boost (%)'
                  type='number'
                  value={formState.miningBoost}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      miningBoost: Number(event.target.value),
                    }))
                  }
                />
                <Button leftIcon={<Sparkles className='h-4 w-4' />} onClick={handleCreateSubmit}>
                  Mint custom NFT
                </Button>
              </div>
              <Card className='border-outline/10 bg-surface-container-low'>
                <CardHeader>
                  <CardTitle className='text-on-surface'>Preview</CardTitle>
                </CardHeader>
                <CardContent className='space-y-3 text-sm text-on-surface-variant'>
                  <div className='rounded-3xl bg-gradient-to-br from-primary/40 to-purple-500/40 p-6 text-on-primary shadow-level-2'>
                    <p className='text-xs uppercase tracking-wide opacity-70'>Procedural render</p>
                    <h3 className='mt-2 text-lg font-semibold'>{formState.name}</h3>
                    <p className='mt-3 text-sm text-white/80'>{formState.description}</p>
                    <div className='mt-4 flex flex-wrap items-center gap-2 text-xs'>
                      <Badge variant={rarityTokens[formState.rarity].variant}>{rarityTokens[formState.rarity].label}</Badge>
                      <Badge variant='outline'>Category · {formState.category}</Badge>
                      <Badge variant='outline'>Boost +{formState.miningBoost}%</Badge>
                    </div>
                  </div>
                  <p>
                    Each mint generates layered SVG animations and registers provenance to the LightDom slot registry. Move this data into the marketplace or bridge tabs to exercise end-to-end flows.
                  </p>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='marketplace' className='space-y-4'>
          <Card className='border-outline/15 bg-surface'>
            <CardHeader>
              <CardTitle className='flex items-center gap-2 text-on-surface'>
                <ShoppingBag className='h-5 w-5 text-primary' /> Listings
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-3'>
              {marketplace.length === 0 ? (
                <p className='text-sm text-on-surface-variant'>No listings available. Mint and list an item to populate the marketplace.</p>
              ) : (
                marketplace.map((listing) => (
                  <Card key={listing.id} className='border-outline/10 bg-surface-container-low'>
                    <CardContent className='flex flex-wrap items-center justify-between gap-3 py-4'>
                      <div>
                        <p className='text-sm font-semibold text-on-surface'>{listing.item.name}</p>
                        <p className='text-xs text-on-surface-variant/70'>Seller · {listing.seller} · {listing.listedAt}</p>
                      </div>
                      <div className='flex flex-wrap items-center gap-3'>
                        <Badge variant='outline'>{listing.priceEth} ETH</Badge>
                        <Button size='sm' onClick={() => handlePurchase(listing)} leftIcon={<ShoppingBag className='h-4 w-4' />}>
                          Purchase
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='bridge' className='space-y-4'>
          <Card className='border-outline/15 bg-surface'>
            <CardHeader>
              <CardTitle className='flex items-center gap-2 text-on-surface'>
                <Wallet className='h-5 w-5 text-primary' /> Chat bridge orchestration
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-3'>
              {bridgeTargets.map((target) => {
                const active = bridgeStates[target.id];
                return (
                  <Card key={target.id} className='border-outline/10 bg-surface-container-low'>
                    <CardContent className='flex flex-wrap items-center justify-between gap-3 py-4'>
                      <div>
                        <p className='text-sm font-semibold text-on-surface'>{target.label}</p>
                        <p className='text-xs text-on-surface-variant/70'>Status · {active ? 'Bridge active' : target.status}</p>
                        <p className='text-xs text-on-surface-variant/60'>Latency · {active ? `${Math.floor(Math.random() * 40) + 20}ms` : target.latency}</p>
                      </div>
                      <div className='flex items-center gap-2'>
                        <Badge variant={active ? 'success' : 'outline'}>{active ? 'Active' : 'Idle'}</Badge>
                        <Button variant={active ? 'outlined' : 'filled'} size='sm' onClick={() => toggleBridge(target.id)}>
                          {active ? 'Stop bridge' : 'Start bridge'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='technical' className='space-y-4'>
          <Card className='border-outline/15 bg-surface'>
            <CardHeader>
              <CardTitle className='flex items-center gap-2 text-on-surface'>
                <ShieldCheck className='h-5 w-5 text-primary' /> Technical notes
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-3 text-sm text-on-surface-variant'>
              <p>Paste this snippet into the backend workflow registry to seed the NFT minting pipeline:</p>
              <pre className='rounded-2xl bg-surface-container-low p-4 font-mono text-xs text-on-surface overflow-auto'>
{`POST /api/nft/mint
{
  "name": "${formState.name}",
  "rarity": "${formState.rarity}",
  "category": "${formState.category}",
  "miningBoost": ${formState.miningBoost},
  "metadata": {
    "description": "${formState.description}",
    "bridge": "deepseek"
  }
}`}
              </pre>
              <p>Use the bridge tab to stream intents into the DeepSeek console. Watcher updates surface via Socket.IO and keep the LightDom slot registry accurate across fleets.</p>
              <Button variant='text' leftIcon={<Copy className='h-4 w-4' />} onClick={() => toast.success('Snippet copied to clipboard')}>
                Copy snippet
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MetaverseNftDemoPage;
