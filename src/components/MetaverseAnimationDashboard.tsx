import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Slider } from '../components/ui/slider';
import { Switch } from '../components/ui/switch';
import {
  Play,
  Pause,
  Square,
  RotateCcw,
  Settings,
  Eye,
  Zap,
  Sparkles,
  Palette,
  Camera,
  Layers,
  Activity,
  BarChart3,
  Globe,
  Cpu,
  Database,
  Bridge,
  Landmark
} from 'lucide-react';
import { MetaverseScene } from './MetaverseScene';
import { MetaverseAnimationService } from '../services/MetaverseAnimationService';
import {
  MetaverseScene as MetaverseSceneType,
  MetaverseAssetVisual,
  MetaverseBiome,
  AnimationPreset,
  ParticleSystem,
  VisualEffect,
  MetaverseAnimationConfig
} from '../types/MetaverseAnimationTypes';
import { metaverseAnimationConfig } from '../config/MetaverseAnimationPresets';

interface MetaverseAnimationDashboardProps {
  className?: string;
}

export const MetaverseAnimationDashboard: React.FC<MetaverseAnimationDashboardProps> = ({
  className = ''
}) => {
  const [animationService] = useState(() => new MetaverseAnimationService());
  const [currentScene, setCurrentScene] = useState<MetaverseSceneType | null>(null);
  const [selectedBiome, setSelectedBiome] = useState<MetaverseBiome>(metaverseAnimationConfig.biomes[0]);
  const [selectedPreset, setSelectedPreset] = useState<AnimationPreset | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [animationSpeed, setAnimationSpeed] = useState(1);
  const [particleDensity, setParticleDensity] = useState(50);
  const [showParticles, setShowParticles] = useState(true);
  const [showEffects, setShowEffects] = useState(true);
  const [performanceMode, setPerformanceMode] = useState<'low' | 'medium' | 'high' | 'ultra'>('high');
  const [selectedAssetType, setSelectedAssetType] = useState<'land' | 'ai_node' | 'storage_shard' | 'bridge'>('land');
  const [customAssets, setCustomAssets] = useState<MetaverseAssetVisual[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize animation service
  useEffect(() => {
    const initializeService = async () => {
      try {
        await animationService.initialize();
        createDemoScene();
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize animation service:', error);
      }
    };

    initializeService();
    return () => {
      animationService.cleanup();
    };
  }, []);

  // Create demo scene
  const createDemoScene = () => {
    const demoAssets: MetaverseAssetVisual[] = [
      {
        id: 'land-1',
        assetType: 'land',
        biomeType: selectedBiome.type,
        developmentLevel: 3,
        size: 500,
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        model: {
          type: 'primitive',
          geometry: { shape: 'cube', dimensions: [100, 20, 100] }
        },
        materials: [{
          type: 'gradient',
          color: selectedBiome.colorScheme.primary,
          opacity: 0.8,
          gradient: {
            type: 'linear',
            stops: [
              { color: selectedBiome.colorScheme.primary, position: 0 },
              { color: selectedBiome.colorScheme.secondary, position: 1 }
            ]
          }
        }],
        animations: [],
        effects: [{
          type: 'glow',
          intensity: 0.5,
          color: selectedBiome.colorScheme.accent,
          duration: 2000,
          frequency: 1,
          size: 10
        }],
        interactions: []
      },
      {
        id: 'ai-node-1',
        assetType: 'ai_node',
        biomeType: selectedBiome.type,
        developmentLevel: 5,
        size: 1000,
        position: [150, 0, 0],
        rotation: [0, 0, 0],
        scale: [1.2, 1.2, 1.2],
        model: {
          type: 'primitive',
          geometry: { shape: 'sphere', dimensions: [80, 80, 80] }
        },
        materials: [{
          type: 'emissive',
          color: selectedBiome.colorScheme.primary,
          opacity: 0.9,
          emissive: selectedBiome.colorScheme.accent,
          emissiveIntensity: 0.5
        }],
        animations: [],
        effects: [{
          type: 'energy',
          intensity: 0.8,
          color: selectedBiome.colorScheme.accent,
          duration: 1500,
          frequency: 1.5,
          size: 15
        }],
        interactions: []
      },
      {
        id: 'storage-shard-1',
        assetType: 'storage_shard',
        biomeType: selectedBiome.type,
        developmentLevel: 2,
        size: 300,
        position: [-150, 0, 0],
        rotation: [0, 0, 0],
        scale: [0.8, 0.8, 0.8],
        model: {
          type: 'primitive',
          geometry: { shape: 'cube', dimensions: [60, 60, 60] }
        },
        materials: [{
          type: 'metal',
          color: selectedBiome.colorScheme.secondary,
          opacity: 0.7,
          metallic: 0.8,
          roughness: 0.2
        }],
        animations: [],
        effects: [{
          type: 'data-flow',
          intensity: 0.6,
          color: selectedBiome.colorScheme.primary,
          duration: 3000,
          frequency: 0.5,
          size: 8
        }],
        interactions: []
      },
      {
        id: 'bridge-1',
        assetType: 'bridge',
        biomeType: selectedBiome.type,
        developmentLevel: 4,
        size: 800,
        position: [0, 0, 150],
        rotation: [0, 0, 0],
        scale: [1.5, 0.5, 1],
        model: {
          type: 'primitive',
          geometry: { shape: 'cube', dimensions: [150, 30, 30] }
        },
        materials: [{
          type: 'glass',
          color: selectedBiome.colorScheme.primary,
          opacity: 0.6
        }],
        animations: [],
        effects: [{
          type: 'connection-line',
          intensity: 0.7,
          color: selectedBiome.colorScheme.accent,
          duration: 2500,
          frequency: 1,
          size: 5,
          target: 'ai-node-1'
        }],
        interactions: []
      }
    ];

    const scene = animationService.createScene({
      name: `${selectedBiome.name} Demo Scene`,
      biome: selectedBiome,
      assets: demoAssets,
      camera: {
        position: [0, 100, 200],
        target: [0, 0, 0],
        fov: 60,
        near: 0.1,
        far: 1000,
        controls: 'orbit'
      },
      environment: {
        skybox: {
          type: 'gradient',
          gradient: [
            { color: selectedBiome.colorScheme.background, position: 0 },
            { color: selectedBiome.colorScheme.primary, position: 1 }
          ]
        },
        fog: {
          enabled: true,
          color: selectedBiome.colorScheme.primary,
          near: 50,
          far: 200,
          density: 0.1
        },
        ground: {
          type: 'plane',
          material: {
            type: 'solid',
            color: selectedBiome.colorScheme.surface,
            opacity: 0.8
          },
          size: [400, 400]
        }
      },
      lighting: selectedBiome.lighting,
      particles: showParticles ? selectedBiome.particles : [],
      animations: [],
      interactions: []
    });

    setCurrentScene(scene);
    setCustomAssets(demoAssets);
  };

  // Handle biome change
  const handleBiomeChange = (biomeId: string) => {
    const biome = metaverseAnimationConfig.biomes.find(b => b.id === biomeId);
    if (biome) {
      setSelectedBiome(biome);
      createDemoScene();
    }
  };

  // Handle asset type change
  const handleAssetTypeChange = (assetType: string) => {
    setSelectedAssetType(assetType as any);
  };

  // Add custom asset
  const addCustomAsset = () => {
    const newAsset: MetaverseAssetVisual = {
      id: `${selectedAssetType}-${Date.now()}`,
      assetType: selectedAssetType,
      biomeType: selectedBiome.type,
      developmentLevel: Math.floor(Math.random() * 5) + 1,
      size: Math.floor(Math.random() * 1000) + 100,
      position: [
        (Math.random() - 0.5) * 300,
        0,
        (Math.random() - 0.5) * 300
      ],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      model: {
        type: 'primitive',
        geometry: { shape: 'cube', dimensions: [50, 50, 50] }
      },
      materials: [{
        type: 'solid',
        color: selectedBiome.colorScheme.primary,
        opacity: 0.8
      }],
      animations: [],
      effects: [],
      interactions: []
    };

    setCustomAssets([...customAssets, newAsset]);
    if (currentScene) {
      animationService.addAssetToScene(currentScene.id, newAsset);
    }
  };

  // Apply animation preset
  const applyAnimationPreset = () => {
    if (selectedPreset && currentScene) {
      currentScene.assets.forEach(asset => {
        animationService.applyAnimationToAsset(asset.id, selectedPreset);
      });
    }
  };

  // Update performance settings
  const updatePerformanceSettings = () => {
    animationService.updatePerformanceSettings({
      quality: performanceMode,
      maxParticles: showParticles ? particleDensity : 0,
      maxAnimations: isPlaying ? 50 : 0
    });
  };

  // Get asset type icon
  const getAssetTypeIcon = (type: string) => {
    switch (type) {
      case 'land': return <Landmark className="h-4 w-4" />;
      case 'ai_node': return <Cpu className="h-4 w-4" />;
      case 'storage_shard': return <Database className="h-4 w-4" />;
      case 'bridge': return <Bridge className="h-4 w-4" />;
      default: return <Layers className="h-4 w-4" />;
    }
  };

  // Get biome color
  const getBiomeColor = (biome: MetaverseBiome) => {
    return biome.colorScheme.primary;
  };

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className={`metaverse-animation-dashboard ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center space-x-2">
            <Sparkles className="h-8 w-8 text-blue-600" />
            <span>Metaverse Animation Studio</span>
          </h1>
          <p className="text-gray-600 mt-2">Create and preview metaverse asset animations</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="flex items-center space-x-1">
            <Activity className="h-3 w-3" />
            <span>{animationService.getStatus().activeAnimations} animations</span>
          </Badge>
          <Badge variant="outline" className="flex items-center space-x-1">
            <Zap className="h-3 w-3" />
            <span>{animationService.getStatus().activeParticles} particles</span>
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Controls Panel */}
        <div className="lg:col-span-1 space-y-4">
          {/* Biome Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Globe className="h-5 w-5" />
                <span>Biome</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedBiome.id} onValueChange={handleBiomeChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {metaverseAnimationConfig.biomes.map((biome) => (
                    <SelectItem key={biome.id} value={biome.id}>
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: getBiomeColor(biome) }}
                        />
                        <span>{biome.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Animation Controls */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Play className="h-5 w-5" />
                <span>Animation</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Button
                  variant={isPlaying ? "default" : "outline"}
                  size="sm"
                  onClick={() => setIsPlaying(!isPlaying)}
                >
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
                <Button variant="outline" size="sm">
                  <Square className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>

              <div>
                <label className="text-sm font-medium">Speed</label>
                <Slider
                  value={[animationSpeed]}
                  onValueChange={(value) => setAnimationSpeed(value[0])}
                  min={0.1}
                  max={3}
                  step={0.1}
                  className="mt-2"
                />
                <div className="text-xs text-gray-500 mt-1">{animationSpeed}x</div>
              </div>

              <Select value={selectedPreset?.id || ''} onValueChange={(value) => {
                const preset = metaverseAnimationConfig.presets.find(p => p.id === value);
                setSelectedPreset(preset || null);
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select animation preset" />
                </SelectTrigger>
                <SelectContent>
                  {metaverseAnimationConfig.presets.map((preset) => (
                    <SelectItem key={preset.id} value={preset.id}>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-xs">
                          {preset.category}
                        </Badge>
                        <span>{preset.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                onClick={applyAnimationPreset}
                disabled={!selectedPreset}
                className="w-full"
              >
                Apply Animation
              </Button>
            </CardContent>
          </Card>

          {/* Asset Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Layers className="h-5 w-5" />
                <span>Assets</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select value={selectedAssetType} onValueChange={handleAssetTypeChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="land">
                    <div className="flex items-center space-x-2">
                      <Landmark className="h-4 w-4" />
                      <span>Land</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="ai_node">
                    <div className="flex items-center space-x-2">
                      <Cpu className="h-4 w-4" />
                      <span>AI Node</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="storage_shard">
                    <div className="flex items-center space-x-2">
                      <Database className="h-4 w-4" />
                      <span>Storage Shard</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="bridge">
                    <div className="flex items-center space-x-2">
                      <Bridge className="h-4 w-4" />
                      <span>Bridge</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>

              <Button onClick={addCustomAsset} className="w-full">
                Add Asset
              </Button>

              <div className="space-y-2">
                <div className="text-sm font-medium">Current Assets</div>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {customAssets.map((asset) => (
                    <div
                      key={asset.id}
                      className="flex items-center space-x-2 p-2 bg-gray-50 rounded text-xs"
                    >
                      {getAssetTypeIcon(asset.assetType)}
                      <span className="flex-1 truncate">{asset.assetType}</span>
                      <Badge variant="outline" className="text-xs">
                        Lv.{asset.developmentLevel}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Effects & Particles */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Sparkles className="h-5 w-5" />
                <span>Effects</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Particles</label>
                <Switch
                  checked={showParticles}
                  onCheckedChange={setShowParticles}
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Visual Effects</label>
                <Switch
                  checked={showEffects}
                  onCheckedChange={setShowEffects}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Particle Density</label>
                <Slider
                  value={[particleDensity]}
                  onValueChange={(value) => setParticleDensity(value[0])}
                  min={10}
                  max={100}
                  step={10}
                  className="mt-2"
                  disabled={!showParticles}
                />
                <div className="text-xs text-gray-500 mt-1">{particleDensity}%</div>
              </div>
            </CardContent>
          </Card>

          {/* Performance Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>Performance</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select value={performanceMode} onValueChange={(value: any) => setPerformanceMode(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="ultra">Ultra</SelectItem>
                </SelectContent>
              </Select>

              <Button onClick={updatePerformanceSettings} className="w-full">
                Apply Settings
              </Button>

              <div className="space-y-2">
                <div className="text-sm font-medium">Performance Metrics</div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span>Frame Rate:</span>
                    <span>{animationService.getPerformanceMetrics().frameRate} FPS</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Animations:</span>
                    <span>{animationService.getPerformanceMetrics().animationCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Particles:</span>
                    <span>{animationService.getPerformanceMetrics().particleCount}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Scene View */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <Camera className="h-5 w-5" />
                    <span>Scene Preview</span>
                  </CardTitle>
                  <CardDescription>
                    {currentScene?.name} - {selectedBiome.name} Biome
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">
                    {customAssets.length} assets
                  </Badge>
                  <Badge variant="outline">
                    {selectedBiome.particles.length} particle systems
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {currentScene && (
                <MetaverseScene
                  scene={currentScene}
                  onAssetInteraction={(assetId, interactionType) => {
                    console.log(`Asset ${assetId} interaction: ${interactionType}`);
                  }}
                  onBiomeTransition={(fromBiome, toBiome) => {
                    console.log(`Biome transition: ${fromBiome.name} → ${toBiome.name}`);
                  }}
                  className="w-full"
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MetaverseAnimationDashboard;