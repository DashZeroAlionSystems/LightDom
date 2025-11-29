import React, { useMemo, useState } from 'react';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  TextArea,
} from '@/components/ui';
import { Rocket, Hammer, Orbit, SatelliteDish, Sparkles, Layers, Copy, ExternalLink } from 'lucide-react';

const TAB_OPTIONS = [
  { id: 'mine', label: 'Mine Space', icon: <Hammer className='h-4 w-4' /> },
  { id: 'structures', label: 'Spatial Structures', icon: <Layers className='h-4 w-4' /> },
  { id: 'isolated', label: 'Isolated DOMs', icon: <Orbit className='h-4 w-4' /> },
  { id: 'bridges', label: 'Metaverse Bridges', icon: <SatelliteDish className='h-4 w-4' /> },
] as const;

type TabId = (typeof TAB_OPTIONS)[number]['id'];

const structures = [
  {
    id: 'structure-nav',
    title: 'navigation',
    url: 'https://example.com',
    path: '/nav[0]',
    biome: 'digital',
    metrics: {
      dimensions: '1200×80×10',
      volume: '960,000 cubic units',
      savings: '25.8 KB',
    },
    candidate: true,
  },
  {
    id: 'structure-content',
    title: 'content',
    url: 'https://example.com',
    path: '/main[0]',
    biome: 'knowledge',
    metrics: {
      dimensions: '800×600×20',
      volume: '9,600,000 cubic units',
      savings: '42.1 KB',
    },
    candidate: true,
  },
];

const isolatedComponents = [
  {
    id: 'space_abc123_1736774400',
    source: 'space_def456_1736774395',
    originalSize: '125.6 KB',
    optimisedSize: '42.3 KB',
    compression: '66.3%',
    quality: '92/100',
    bridgeActive: true,
  },
  {
    id: 'space_xyz789_1736774412',
    source: 'space_qrs333_1736774384',
    originalSize: '84.2 KB',
    optimisedSize: '28.6 KB',
    compression: '65.9%',
    quality: '88/100',
    bridgeActive: false,
  },
];

const bridgeTargets = [
  {
    id: 'bridge-1',
    name: 'LightDom Digital Hub',
    state: 'Active',
    target: '/bridge/lightdom-digital/space_abc123_1736774400',
    transfers: 128,
    latency: '42ms',
  },
  {
    id: 'bridge-2',
    name: 'Knowledge Cavern',
    state: 'Provisioning',
    target: '/bridge/knowledge/space_xyz789_1736774412',
    transfers: 48,
    latency: '–',
  },
];

const SpaceMiningDemoPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('mine');
  const [miningUrl, setMiningUrl] = useState('https://example.com/galactic-catalogue');
  const [notes, setNotes] = useState('Track metaverse bridge readiness and identify high-value DOM clusters for isolation.');

  const metrics = useMemo(
    () => [
      { label: 'Spatial structures', value: 12, variant: 'primary' as const },
      { label: 'Isolated DOMs', value: 8, variant: 'secondary' as const },
      { label: 'Active bridges', value: 5, variant: 'success' as const },
      { label: 'Queue length', value: 3, variant: 'warning' as const },
    ],
    [],
  );

  return (
    <div className='space-y-6 p-6'>
      <header className='rounded-3xl border border-outline/10 bg-gradient-to-br from-[#16213e] via-surface-container-high to-surface p-6 shadow-level-1 text-on-surface'>
        <div className='flex flex-wrap items-start justify-between gap-6'>
          <div className='space-y-3'>
            <div className='inline-flex items-center gap-2 rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary'>
              <Rocket className='h-4 w-4' />
              Space mining dashboard
            </div>
            <div>
              <h1 className='text-3xl font-semibold md:text-4xl'>Extract LightDom structures from the metaverse</h1>
              <p className='mt-2 max-w-3xl text-sm text-on-surface-variant'>
                Run spatial mining against arbitrary URLs, isolate LightDom candidates, and publish metaverse bridges using the automation pipeline.
              </p>
            </div>
          </div>
          <div className='grid gap-3 sm:grid-cols-2'>
            {metrics.map((metric) => (
              <Card key={metric.label} className='border-outline/20 bg-surface-container-low min-w-[140px]'>
                <CardContent className='flex flex-col gap-1 py-4'>
                  <span className='text-xs uppercase tracking-wide text-on-surface-variant/70'>{metric.label}</span>
                  <span className='text-2xl font-semibold text-on-surface'>{metric.value}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </header>

      <nav className='flex flex-wrap items-center gap-2 rounded-full border border-outline/15 bg-surface-container-high px-3 py-2 shadow-level-1'>
        {TAB_OPTIONS.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <Button
              key={tab.id}
              variant={isActive ? 'filled' : 'text'}
              size='sm'
              onClick={() => setActiveTab(tab.id)}
            >
              <span className='flex items-center gap-2'>
                {tab.icon}
                {tab.label}
              </span>
            </Button>
          );
        })}
      </nav>

      {activeTab === 'mine' && (
        <Card className='border-outline/15 bg-surface'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-on-surface'>
              <Sparkles className='h-5 w-5 text-primary' />
              Start space mining
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <Input
              label='Target URL'
              placeholder='https://example.com'
              value={miningUrl}
              onChange={(event) => setMiningUrl(event.target.value)}
              helperText='Crawler fetches DOM, computes 3D volume, and identifies LightDom candidates.'
            />
            <div className='flex flex-wrap gap-2'>
              <Button variant='filled'>🚀 Start mining</Button>
              <Button variant='outlined'>🧪 Dry run</Button>
              <Button variant='text'>View pipeline definition</Button>
            </div>
            <Card className='border-outline/15 bg-surface-container-low'>
              <CardHeader>
                <CardTitle className='text-on-surface'>How it works</CardTitle>
              </CardHeader>
              <CardContent className='grid gap-3 md:grid-cols-2 text-sm text-on-surface-variant'>
                <div>
                  <p className='font-semibold text-on-surface'>Spatial analysis</p>
                  <p>Extracts 3D spatial structures and calculates cubic volume for DOM clusters.</p>
                </div>
                <div>
                  <p className='font-semibold text-on-surface'>LightDom isolation</p>
                  <p>Detects components suitable for optimisation and prepares watcher snapshots.</p>
                </div>
                <div>
                  <p className='font-semibold text-on-surface'>Metaverse mapping</p>
                  <p>Assigns biome signatures and coordinate positions for navigation.</p>
                </div>
                <div>
                  <p className='font-semibold text-on-surface'>Bridge generation</p>
                  <p>Creates bidirectional bridges so explorers can load isolated LightDom views.</p>
                </div>
              </CardContent>
            </Card>
            <TextArea
              label='Mission notes'
              rows={4}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              helperText='Document why the scan is being run and which teams are on standby.'
            />
          </CardContent>
        </Card>
      )}

      {activeTab === 'structures' && (
        <Card className='border-outline/15 bg-surface'>
          <CardHeader>
            <CardTitle className='text-on-surface'>Spatial structures ({structures.length})</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            {structures.map((structure) => (
              <Card key={structure.id} className='border-outline/15 bg-surface-container-low'>
                <CardHeader className='flex flex-wrap items-start justify-between gap-3'>
                  <div>
                    <CardTitle className='text-on-surface'>{structure.title}</CardTitle>
                    <p className='text-sm text-on-surface-variant/80'>{structure.url}</p>
                    <p className='text-xs text-on-surface-variant/60'>{structure.path}</p>
                  </div>
                  <div className='flex items-center gap-2'>
                    {structure.candidate ? (
                      <Badge variant='success'>LightDom candidate</Badge>
                    ) : (
                      <Badge variant='outline'>Reference</Badge>
                    )}
                    <Badge variant='outline'>Biome · {structure.biome}</Badge>
                  </div>
                </CardHeader>
                <CardContent className='grid gap-3 md:grid-cols-2 lg:grid-cols-4 text-sm text-on-surface'>
                  <div>
                    <p className='text-on-surface-variant/70'>Dimensions</p>
                    <p>{structure.metrics.dimensions}</p>
                  </div>
                  <div>
                    <p className='text-on-surface-variant/70'>Volume</p>
                    <p>{structure.metrics.volume}</p>
                  </div>
                  <div>
                    <p className='text-on-surface-variant/70'>Potential savings</p>
                    <p>{structure.metrics.savings}</p>
                  </div>
                  <div>
                    <p className='text-on-surface-variant/70'>Watcher stream</p>
                    <p>space-miner/{structure.id}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>
      )}

      {activeTab === 'isolated' && (
        <Card className='border-outline/15 bg-surface'>
          <CardHeader>
            <CardTitle className='text-on-surface'>Isolated DOM components ({isolatedComponents.length})</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            {isolatedComponents.map((component) => (
              <Card key={component.id} className='border-outline/15 bg-surface-container-low'>
                <CardHeader className='flex flex-wrap items-start justify-between gap-3'>
                  <div>
                    <CardTitle className='text-on-surface'>Isolated component</CardTitle>
                    <p className='text-sm text-on-surface-variant/80'>ID: {component.id}</p>
                    <p className='text-xs text-on-surface-variant/60'>Source: {component.source}</p>
                  </div>
                  <Badge variant={component.bridgeActive ? 'success' : 'outline'}>
                    {component.bridgeActive ? 'Bridge active' : 'Bridge idle'}
                  </Badge>
                </CardHeader>
                <CardContent className='grid gap-3 md:grid-cols-4 text-sm text-on-surface'>
                  <div>
                    <p className='text-on-surface-variant/70'>Original size</p>
                    <p>{component.originalSize}</p>
                  </div>
                  <div>
                    <p className='text-on-surface-variant/70'>Optimised size</p>
                    <p>{component.optimisedSize}</p>
                  </div>
                  <div>
                    <p className='text-on-surface-variant/70'>Compression</p>
                    <p>{component.compression}</p>
                  </div>
                  <div>
                    <p className='text-on-surface-variant/70'>Quality score</p>
                    <p>{component.quality}</p>
                  </div>
                </CardContent>
                <CardContent className='flex flex-wrap gap-2 border-t border-outline/10 pt-3 text-sm'>
                  <Button variant='filled' size='sm' leftIcon={<ExternalLink className='h-4 w-4' />}>
                    Open bridge
                  </Button>
                  <Button variant='outlined' size='sm' leftIcon={<Copy className='h-4 w-4' />}>
                    Copy URL
                  </Button>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>
      )}

      {activeTab === 'bridges' && (
        <Card className='border-outline/15 bg-surface'>
          <CardHeader>
            <CardTitle className='text-on-surface'>Metaverse bridges</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            {bridgeTargets.map((bridge) => (
              <Card key={bridge.id} className='border-outline/15 bg-surface-container-low'>
                <CardHeader className='flex flex-wrap items-start justify-between gap-3'>
                  <div>
                    <CardTitle className='text-on-surface'>{bridge.name}</CardTitle>
                    <p className='text-sm text-on-surface-variant/80'>{bridge.target}</p>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Badge variant={bridge.state === 'Active' ? 'success' : 'warning'}>{bridge.state}</Badge>
                    <Badge variant='outline'>Transfers · {bridge.transfers}</Badge>
                    <Badge variant='outline'>Latency · {bridge.latency}</Badge>
                  </div>
                </CardHeader>
                <CardContent className='flex flex-wrap gap-2 text-sm'>
                  <Button variant='outlined' size='sm'>Inspect tunnel</Button>
                  <Button variant='text' size='sm'>Promote to production</Button>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SpaceMiningDemoPage;
