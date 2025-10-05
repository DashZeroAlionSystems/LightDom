import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MetaverseAssetVisual,
  MetaverseBiome,
  VisualEffect,
  ParticleSystem,
  MetaverseAssetAnimation
} from '../types/MetaverseAnimationTypes';

interface MetaverseCombinationProps {
  assets: MetaverseAssetVisual[];
  biome: MetaverseBiome;
  combinationType: 'land-ai' | 'ai-storage' | 'storage-bridge' | 'land-bridge' | 'ai-bridge' | 'full-network';
  onCombinationComplete?: (combinationType: string) => void;
  className?: string;
}

export const MetaverseCombinationAnimations: React.FC<MetaverseCombinationProps> = ({
  assets,
  biome,
  combinationType,
  onCombinationComplete,
  className = ''
}) => {
  const [isActive, setIsActive] = useState(false);
  const [combinationProgress, setCombinationProgress] = useState(0);
  const [activeEffects, setActiveEffects] = useState<VisualEffect[]>([]);
  const [connectionLines, setConnectionLines] = useState<Array<{
    from: string;
    to: string;
    progress: number;
  }>>([]);

  // Combination configurations
  const combinationConfigs = {
    'land-ai': {
      name: 'Land-AI Synergy',
      description: 'Land parcels enhance AI node processing power',
      effects: [
        { type: 'energy', intensity: 0.8, color: biome.colorScheme.accent, duration: 2000, frequency: 1, size: 20 },
        { type: 'data-flow', intensity: 0.6, color: biome.colorScheme.primary, duration: 3000, frequency: 0.5, size: 12 }
      ],
      particles: [
        { type: 'energy', count: 30, speed: 2, size: 3, color: biome.colorScheme.accent, opacity: 0.8, lifetime: 2000, spawnRate: 0.5, direction: 'up', gravity: 0, turbulence: 0.1 }
      ],
      duration: 5000
    },
    'ai-storage': {
      name: 'AI-Storage Integration',
      description: 'AI nodes optimize storage shard efficiency',
      effects: [
        { type: 'data-flow', intensity: 0.9, color: biome.colorScheme.primary, duration: 1500, frequency: 1.5, size: 15 },
        { type: 'glow', intensity: 0.7, color: biome.colorScheme.secondary, duration: 2500, frequency: 1, size: 25 }
      ],
      particles: [
        { type: 'data', count: 40, speed: 1.5, size: 2, color: biome.colorScheme.primary, opacity: 0.7, lifetime: 3000, spawnRate: 0.6, direction: 'random', gravity: 0, turbulence: 0.2 }
      ],
      duration: 4000
    },
    'storage-bridge': {
      name: 'Storage-Bridge Network',
      description: 'Storage shards provide data for bridge operations',
      effects: [
        { type: 'connection-line', intensity: 0.8, color: biome.colorScheme.accent, duration: 2000, frequency: 1, size: 8 },
        { type: 'pulse', intensity: 0.6, color: biome.colorScheme.secondary, duration: 3000, frequency: 0.8, size: 18 }
      ],
      particles: [
        { type: 'connection', count: 25, speed: 2, size: 1, color: biome.colorScheme.accent, opacity: 0.6, lifetime: 2000, spawnRate: 0.8, direction: 'random', gravity: 0, turbulence: 0.3 }
      ],
      duration: 6000
    },
    'land-bridge': {
      name: 'Land-Bridge Connection',
      description: 'Land parcels anchor bridge endpoints',
      effects: [
        { type: 'glow', intensity: 0.5, color: biome.colorScheme.primary, duration: 4000, frequency: 0.5, size: 30 },
        { type: 'ripple', intensity: 0.7, color: biome.colorScheme.accent, duration: 2500, frequency: 1, size: 20 }
      ],
      particles: [
        { type: 'floating', count: 35, speed: 1, size: 2.5, color: biome.colorScheme.primary, opacity: 0.7, lifetime: 4000, spawnRate: 0.4, direction: 'up', gravity: -0.05, turbulence: 0.1 }
      ],
      duration: 7000
    },
    'ai-bridge': {
      name: 'AI-Bridge Intelligence',
      description: 'AI nodes provide smart routing for bridges',
      effects: [
        { type: 'energy', intensity: 0.9, color: biome.colorScheme.accent, duration: 1500, frequency: 1.5, size: 22 },
        { type: 'connection-line', intensity: 0.8, color: biome.colorScheme.primary, duration: 2000, frequency: 1, size: 10 }
      ],
      particles: [
        { type: 'sparkle', count: 50, speed: 2.5, size: 1.5, color: biome.colorScheme.accent, opacity: 0.9, lifetime: 1500, spawnRate: 0.7, direction: 'radial', gravity: 0, turbulence: 0.4 }
      ],
      duration: 4500
    },
    'full-network': {
      name: 'Complete Metaverse Network',
      description: 'All assets working in perfect harmony',
      effects: [
        { type: 'energy', intensity: 1, color: biome.colorScheme.accent, duration: 2000, frequency: 1, size: 30 },
        { type: 'data-flow', intensity: 0.8, color: biome.colorScheme.primary, duration: 3000, frequency: 0.8, size: 20 },
        { type: 'connection-line', intensity: 0.9, color: biome.colorScheme.secondary, duration: 2500, frequency: 1, size: 12 },
        { type: 'glow', intensity: 0.6, color: biome.colorScheme.primary, duration: 4000, frequency: 0.5, size: 35 }
      ],
      particles: [
        { type: 'energy', count: 60, speed: 3, size: 3, color: biome.colorScheme.accent, opacity: 0.8, lifetime: 2000, spawnRate: 0.8, direction: 'random', gravity: 0, turbulence: 0.3 },
        { type: 'sparkle', count: 80, speed: 2, size: 1, color: biome.colorScheme.primary, opacity: 0.7, lifetime: 2500, spawnRate: 0.6, direction: 'radial', gravity: 0, turbulence: 0.2 }
      ],
      duration: 10000
    }
  };

  const config = combinationConfigs[combinationType];

  // Start combination animation
  useEffect(() => {
    if (isActive) {
      setActiveEffects(config.effects);
      
      // Create connection lines between assets
      const lines = [];
      for (let i = 0; i < assets.length - 1; i++) {
        lines.push({
          from: assets[i].id,
          to: assets[i + 1].id,
          progress: 0
        });
      }
      setConnectionLines(lines);

      // Animate combination progress
      const duration = config.duration;
      const startTime = Date.now();
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        setCombinationProgress(progress);
        
        // Update connection line progress
        setConnectionLines(prev => prev.map(line => ({
          ...line,
          progress: progress
        })));

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setIsActive(false);
          onCombinationComplete?.(combinationType);
        }
      };

      requestAnimationFrame(animate);
    }
  }, [isActive, config, assets]);

  // Trigger combination
  const triggerCombination = () => {
    setIsActive(true);
    setCombinationProgress(0);
  };

  // Get asset position for connection lines
  const getAssetPosition = (assetId: string) => {
    const asset = assets.find(a => a.id === assetId);
    if (!asset) return { x: 0, y: 0 };
    
    // Convert 3D position to 2D screen position
    return {
      x: asset.position[0] * 2 + 200, // Scale and offset
      y: asset.position[2] * 2 + 200
    };
  };

  return (
    <div className={`metaverse-combination ${className}`}>
      {/* Combination Controls */}
      <div className="combination-controls mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">{config.name}</h3>
            <p className="text-sm text-gray-600">{config.description}</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="text-sm text-gray-500">
              Progress: {Math.round(combinationProgress * 100)}%
            </div>
            <button
              onClick={triggerCombination}
              disabled={isActive}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isActive ? 'Running...' : 'Start Combination'}
            </button>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
          <motion.div
            className="bg-blue-600 h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${combinationProgress * 100}%` }}
            transition={{ duration: 0.1 }}
          />
        </div>
      </div>

      {/* Combination Visualization */}
      <div className="combination-visualization relative w-full h-96 bg-gray-100 rounded-lg overflow-hidden">
        {/* Background */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            background: `radial-gradient(circle at 50% 50%, ${biome.colorScheme.primary} 0%, transparent 70%)`
          }}
        />

        {/* Assets */}
        {assets.map((asset, index) => {
          const position = getAssetPosition(asset.id);
          return (
            <motion.div
              key={asset.id}
              className="absolute"
              style={{
                left: position.x,
                top: position.y,
                transform: 'translate(-50%, -50%)'
              }}
              animate={isActive ? {
                scale: [1, 1.1, 1],
                filter: [`brightness(1)`, `brightness(1.3)`, `brightness(1)`]
              } : {}}
              transition={{
                duration: 2,
                ease: 'easeInOut',
                repeat: Infinity
              }}
            >
              {/* Asset Icon */}
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
                style={{
                  backgroundColor: biome.colorScheme.primary,
                  border: `2px solid ${biome.colorScheme.secondary}`,
                  boxShadow: `0 4px 12px ${biome.colorScheme.primary}40`
                }}
              >
                {asset.assetType === 'land' && '🏞️'}
                {asset.assetType === 'ai_node' && '🤖'}
                {asset.assetType === 'storage_shard' && '💾'}
                {asset.assetType === 'bridge' && '🌉'}
              </div>

              {/* Asset Label */}
              <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 text-xs font-medium text-gray-700">
                {asset.assetType.replace('_', ' ')}
              </div>
            </motion.div>
          );
        })}

        {/* Connection Lines */}
        {connectionLines.map((line, index) => {
          const fromPos = getAssetPosition(line.from);
          const toPos = getAssetPosition(line.to);
          
          return (
            <motion.div
              key={`${line.from}-${line.to}`}
              className="absolute"
              style={{
                left: fromPos.x,
                top: fromPos.y,
                width: Math.sqrt(Math.pow(toPos.x - fromPos.x, 2) + Math.pow(toPos.y - fromPos.y, 2)),
                height: 2,
                backgroundColor: biome.colorScheme.accent,
                transformOrigin: '0 50%',
                transform: `rotate(${Math.atan2(toPos.y - fromPos.y, toPos.x - fromPos.x)}rad)`
              }}
              animate={isActive ? {
                scaleX: [0, line.progress],
                opacity: [0, 1]
              } : {}}
              transition={{ duration: 0.5 }}
            />
          );
        })}

        {/* Active Effects */}
        <AnimatePresence>
          {isActive && activeEffects.map((effect, index) => (
            <motion.div
              key={`effect-${index}`}
              className="absolute inset-0 pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Effect visualization based on type */}
              {effect.type === 'energy' && (
                <motion.div
                  className="absolute w-4 h-4 rounded-full"
                  style={{
                    backgroundColor: effect.color,
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%)'
                  }}
                  animate={{
                    scale: [0, effect.size / 10, 0],
                    opacity: [0, effect.intensity, 0]
                  }}
                  transition={{
                    duration: effect.duration / 1000,
                    ease: 'easeInOut',
                    repeat: Infinity
                  }}
                />
              )}

              {effect.type === 'data-flow' && (
                <motion.div
                  className="absolute w-2 h-2 rounded-full"
                  style={{
                    backgroundColor: effect.color,
                    left: '20%',
                    top: '50%'
                  }}
                  animate={{
                    x: ['0%', '60%', '0%'],
                    opacity: [0, effect.intensity, 0]
                  }}
                  transition={{
                    duration: effect.duration / 1000,
                    ease: 'easeInOut',
                    repeat: Infinity
                  }}
                />
              )}

              {effect.type === 'glow' && (
                <motion.div
                  className="absolute inset-0 rounded-lg"
                  style={{
                    background: `radial-gradient(circle at center, ${effect.color}20 0%, transparent 70%)`
                  }}
                  animate={{
                    opacity: [0, effect.intensity, 0]
                  }}
                  transition={{
                    duration: effect.duration / 1000,
                    ease: 'easeInOut',
                    repeat: Infinity
                  }}
                />
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Combination Status */}
        {isActive && (
          <motion.div
            className="absolute top-4 left-4 px-3 py-1 bg-blue-600 text-white text-sm rounded-full"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            {config.name} Active
          </motion.div>
        )}
      </div>

      {/* Combination Stats */}
      <div className="combination-stats mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center p-3 bg-gray-50 rounded">
          <div className="text-2xl font-bold text-blue-600">{assets.length}</div>
          <div className="text-sm text-gray-600">Assets</div>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded">
          <div className="text-2xl font-bold text-green-600">{config.effects.length}</div>
          <div className="text-sm text-gray-600">Effects</div>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded">
          <div className="text-2xl font-bold text-purple-600">{config.particles.length}</div>
          <div className="text-sm text-gray-600">Particle Systems</div>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded">
          <div className="text-2xl font-bold text-orange-600">{Math.round(config.duration / 1000)}s</div>
          <div className="text-sm text-gray-600">Duration</div>
        </div>
      </div>
    </div>
  );
};

// Combination Gallery Component
interface CombinationGalleryProps {
  biome: MetaverseBiome;
  className?: string;
}

export const MetaverseCombinationGallery: React.FC<CombinationGalleryProps> = ({
  biome,
  className = ''
}) => {
  const [selectedCombination, setSelectedCombination] = useState<string | null>(null);

  const combinations = [
    {
      id: 'land-ai',
      name: 'Land-AI Synergy',
      description: 'Land parcels enhance AI node processing power',
      icon: '🏞️🤖',
      color: '#3B82F6'
    },
    {
      id: 'ai-storage',
      name: 'AI-Storage Integration',
      description: 'AI nodes optimize storage shard efficiency',
      icon: '🤖💾',
      color: '#10B981'
    },
    {
      id: 'storage-bridge',
      name: 'Storage-Bridge Network',
      description: 'Storage shards provide data for bridge operations',
      icon: '💾🌉',
      color: '#8B5CF6'
    },
    {
      id: 'land-bridge',
      name: 'Land-Bridge Connection',
      description: 'Land parcels anchor bridge endpoints',
      icon: '🏞️🌉',
      color: '#F59E0B'
    },
    {
      id: 'ai-bridge',
      name: 'AI-Bridge Intelligence',
      description: 'AI nodes provide smart routing for bridges',
      icon: '🤖🌉',
      color: '#EF4444'
    },
    {
      id: 'full-network',
      name: 'Complete Network',
      description: 'All assets working in perfect harmony',
      icon: '🌟',
      color: '#EC4899'
    }
  ];

  return (
    <div className={`metaverse-combination-gallery ${className}`}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Metaverse Combinations</h2>
        <p className="text-gray-600">Explore how different metaverse assets work together</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {combinations.map((combination) => (
          <motion.div
            key={combination.id}
            className="p-4 border rounded-lg cursor-pointer hover:shadow-lg transition-shadow"
            style={{
              borderColor: selectedCombination === combination.id ? combination.color : '#E5E7EB',
              backgroundColor: selectedCombination === combination.id ? `${combination.color}10` : 'white'
            }}
            onClick={() => setSelectedCombination(combination.id)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="text-center">
              <div className="text-4xl mb-2">{combination.icon}</div>
              <h3 className="font-semibold mb-1">{combination.name}</h3>
              <p className="text-sm text-gray-600">{combination.description}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {selectedCombination && (
        <motion.div
          className="mt-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <MetaverseCombinationAnimations
            assets={[
              {
                id: 'land-1',
                assetType: 'land',
                biomeType: biome.type,
                developmentLevel: 3,
                size: 500,
                position: [-100, 0, 0],
                rotation: [0, 0, 0],
                scale: [1, 1, 1],
                model: { type: 'primitive', geometry: { shape: 'cube', dimensions: [100, 20, 100] } },
                materials: [{ type: 'solid', color: biome.colorScheme.primary, opacity: 0.8 }],
                animations: [],
                effects: [],
                interactions: []
              },
              {
                id: 'ai-1',
                assetType: 'ai_node',
                biomeType: biome.type,
                developmentLevel: 5,
                size: 1000,
                position: [100, 0, 0],
                rotation: [0, 0, 0],
                scale: [1.2, 1.2, 1.2],
                model: { type: 'primitive', geometry: { shape: 'sphere', dimensions: [80, 80, 80] } },
                materials: [{ type: 'emissive', color: biome.colorScheme.primary, opacity: 0.9, emissive: biome.colorScheme.accent, emissiveIntensity: 0.5 }],
                animations: [],
                effects: [],
                interactions: []
              }
            ]}
            biome={biome}
            combinationType={selectedCombination as any}
            onCombinationComplete={(type) => {
              console.log(`Combination ${type} completed!`);
            }}
          />
        </motion.div>
      )}
    </div>
  );
};

export default MetaverseCombinationAnimations;