import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MetaverseScene as MetaverseSceneType,
  MetaverseBiome,
  MetaverseAssetVisual,
  CameraConfig,
  EnvironmentConfig,
  ParticleSystem
} from '../types/MetaverseAnimationTypes';
import {
  MetaverseLandAsset,
  MetaverseAINodeAsset,
  MetaverseStorageShardAsset,
  MetaverseBridgeAsset
} from './MetaverseAssetAnimations';

interface MetaverseSceneProps {
  scene: MetaverseSceneType;
  onAssetInteraction?: (assetId: string, interactionType: string) => void;
  onBiomeTransition?: (fromBiome: MetaverseBiome, toBiome: MetaverseBiome) => void;
  className?: string;
}

export const MetaverseScene: React.FC<MetaverseSceneProps> = ({
  scene,
  onAssetInteraction,
  onBiomeTransition,
  className = ''
}) => {
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null);
  const [hoveredAsset, setHoveredAsset] = useState<string | null>(null);
  const [cameraPosition, setCameraPosition] = useState(scene.camera.position);
  const [cameraTarget, setCameraTarget] = useState(scene.camera.target);
  const sceneRef = useRef<HTMLDivElement>(null);

  // Scene transition animations
  const sceneVariants = {
    initial: {
      opacity: 0,
      scale: 0.9,
      filter: 'blur(10px)'
    },
    animate: {
      opacity: 1,
      scale: 1,
      filter: 'blur(0px)',
      transition: {
        duration: 0.8,
        ease: 'easeOut',
        staggerChildren: 0.1
      }
    },
    exit: {
      opacity: 0,
      scale: 1.1,
      filter: 'blur(10px)',
      transition: {
        duration: 0.5,
        ease: 'easeIn'
      }
    }
  };

  // Asset container animations
  const assetContainerVariants = {
    initial: {
      opacity: 0,
      y: 50,
      scale: 0.8
    },
    animate: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: 'easeOut'
      }
    },
    hover: {
      scale: 1.02,
      transition: {
        duration: 0.2,
        ease: 'easeOut'
      }
    }
  };

  // Handle asset interactions
  const handleAssetInteraction = (assetId: string, interactionType: string) => {
    setSelectedAsset(interactionType === 'click' ? assetId : null);
    setHoveredAsset(interactionType === 'hover' ? assetId : null);
    
    if (onAssetInteraction) {
      onAssetInteraction(assetId, interactionType);
    }
  };

  // Render asset based on type
  const renderAsset = (asset: MetaverseAssetVisual) => {
    const commonProps = {
      asset,
      biome: scene.biome,
      isInteractive: true,
      onInteraction: handleAssetInteraction,
      className: selectedAsset === asset.id ? 'selected' : ''
    };

    switch (asset.assetType) {
      case 'land':
        return <MetaverseLandAsset {...commonProps} />;
      case 'ai_node':
        return <MetaverseAINodeAsset {...commonProps} />;
      case 'storage_shard':
        return <MetaverseStorageShardAsset {...commonProps} />;
      case 'bridge':
        return <MetaverseBridgeAsset {...commonProps} />;
      default:
        return null;
    }
  };

  // Render particle systems
  const renderParticleSystem = (particleSystem: ParticleSystem) => {
    return (
      <motion.div
        key={particleSystem.id}
        className="particle-system-overlay"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 1
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        {/* Particle system implementation would go here */}
        <div className="particle-container">
          {Array.from({ length: particleSystem.count }, (_, i) => (
            <motion.div
              key={i}
              className="particle"
              style={{
                position: 'absolute',
                width: `${particleSystem.size}px`,
                height: `${particleSystem.size}px`,
                backgroundColor: particleSystem.color,
                borderRadius: '50%',
                opacity: particleSystem.opacity
              }}
              animate={{
                x: [0, Math.random() * 200 - 100],
                y: [0, Math.random() * 200 - 100],
                opacity: [0, particleSystem.opacity, 0],
                scale: [0, 1, 0]
              }}
              transition={{
                duration: particleSystem.lifetime / 1000,
                ease: 'easeOut',
                repeat: Infinity,
                delay: i * 0.1
              }}
            />
          ))}
        </div>
      </motion.div>
    );
  };

  return (
    <motion.div
      ref={sceneRef}
      className={`metaverse-scene ${className}`}
      style={{
        width: '100%',
        height: '600px',
        position: 'relative',
        overflow: 'hidden',
        borderRadius: '16px',
        background: `linear-gradient(135deg, ${scene.biome.colorScheme.background} 0%, ${scene.biome.colorScheme.surface} 100%)`,
        border: `2px solid ${scene.biome.colorScheme.primary}`,
        boxShadow: `0 8px 32px ${scene.biome.colorScheme.primary}30`
      }}
      variants={sceneVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {/* Scene Background Effects */}
      <div className="scene-background" style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: `radial-gradient(circle at 30% 20%, ${scene.biome.colorScheme.primary}20 0%, transparent 50%),
                     radial-gradient(circle at 70% 80%, ${scene.biome.colorScheme.accent}15 0%, transparent 50%)`,
        pointerEvents: 'none'
      }} />

      {/* Environment Skybox */}
      {scene.environment.skybox.type === 'gradient' && (
        <div className="skybox" style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: `linear-gradient(180deg, ${scene.environment.skybox.gradient?.map(g => g.color).join(', ')})`,
          opacity: 0.3,
          pointerEvents: 'none'
        }} />
      )}

      {/* Ground */}
      {scene.environment.ground.type !== 'none' && (
        <motion.div
          className="ground"
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '100%',
            height: '20%',
            backgroundColor: scene.environment.ground.material.color,
            opacity: scene.environment.ground.material.opacity,
            borderRadius: '0 0 16px 16px'
          }}
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      )}

      {/* Assets Grid */}
      <motion.div
        className="assets-container"
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          padding: '40px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
          gap: '20px',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2
        }}
        variants={assetContainerVariants}
        initial="initial"
        animate="animate"
        whileHover="hover"
      >
        <AnimatePresence>
          {scene.assets.map((asset, index) => (
            <motion.div
              key={asset.id}
              className="asset-wrapper"
              style={{
                position: 'relative',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }}
              variants={assetContainerVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              layout
              transition={{
                duration: 0.5,
                ease: 'easeOut',
                delay: index * 0.1
              }}
            >
              {renderAsset(asset)}
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Particle Systems */}
      {scene.particles.map(renderParticleSystem)}

      {/* Scene Information Overlay */}
      <motion.div
        className="scene-info"
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          padding: '12px 16px',
          backgroundColor: `${scene.biome.colorScheme.surface}CC`,
          borderRadius: '8px',
          border: `1px solid ${scene.biome.colorScheme.primary}`,
          color: scene.biome.colorScheme.text,
          fontSize: '14px',
          fontWeight: 'bold',
          backdropFilter: 'blur(10px)',
          zIndex: 10
        }}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <div className="scene-name">{scene.name}</div>
        <div className="scene-biome" style={{
          fontSize: '12px',
          opacity: 0.8,
          marginTop: '4px'
        }}>
          {scene.biome.name}
        </div>
        <div className="scene-assets-count" style={{
          fontSize: '10px',
          opacity: 0.6,
          marginTop: '2px'
        }}>
          {scene.assets.length} assets
        </div>
      </motion.div>

      {/* Asset Details Panel */}
      <AnimatePresence>
        {selectedAsset && (
          <motion.div
            className="asset-details-panel"
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              padding: '16px',
              backgroundColor: `${scene.biome.colorScheme.surface}CC`,
              borderRadius: '12px',
              border: `1px solid ${scene.biome.colorScheme.primary}`,
              color: scene.biome.colorScheme.text,
              fontSize: '12px',
              backdropFilter: 'blur(10px)',
              zIndex: 10,
              minWidth: '200px'
            }}
            initial={{ opacity: 0, x: 20, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.9 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            {(() => {
              const asset = scene.assets.find(a => a.id === selectedAsset);
              if (!asset) return null;

              return (
                <>
                  <div className="asset-details-title" style={{
                    fontSize: '14px',
                    fontWeight: 'bold',
                    marginBottom: '8px',
                    textTransform: 'capitalize'
                  }}>
                    {asset.assetType.replace('_', ' ')} Details
                  </div>
                  <div className="asset-details-content">
                    <div className="detail-row">
                      <span className="detail-label">Size:</span>
                      <span className="detail-value">{asset.size} KB</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Level:</span>
                      <span className="detail-value">{asset.developmentLevel}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Position:</span>
                      <span className="detail-value">
                        {asset.position.map(p => p.toFixed(1)).join(', ')}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Effects:</span>
                      <span className="detail-value">{asset.effects.length}</span>
                    </div>
                  </div>
                  <button
                    className="close-button"
                    onClick={() => setSelectedAsset(null)}
                    style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      background: 'none',
                      border: 'none',
                      color: scene.biome.colorScheme.text,
                      cursor: 'pointer',
                      fontSize: '16px',
                      opacity: 0.6
                    }}
                  >
                    ×
                  </button>
                </>
              );
            })()}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scene Controls */}
      <motion.div
        className="scene-controls"
        style={{
          position: 'absolute',
          bottom: '20px',
          right: '20px',
          display: 'flex',
          gap: '8px',
          zIndex: 10
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.5 }}
      >
        <button
          className="control-button"
          onClick={() => {
            // Reset camera
            setCameraPosition(scene.camera.position);
            setCameraTarget(scene.camera.target);
          }}
          style={{
            padding: '8px 12px',
            backgroundColor: `${scene.biome.colorScheme.primary}CC`,
            color: scene.biome.colorScheme.text,
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '12px',
            backdropFilter: 'blur(10px)'
          }}
        >
          Reset View
        </button>
        <button
          className="control-button"
          onClick={() => {
            // Toggle fullscreen
            if (sceneRef.current) {
              if (document.fullscreenElement) {
                document.exitFullscreen();
              } else {
                sceneRef.current.requestFullscreen();
              }
            }
          }}
          style={{
            padding: '8px 12px',
            backgroundColor: `${scene.biome.colorScheme.accent}CC`,
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '12px',
            backdropFilter: 'blur(10px)'
          }}
        >
          Fullscreen
        </button>
      </motion.div>

      {/* Loading Indicator */}
      <motion.div
        className="loading-indicator"
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: scene.biome.colorScheme.text,
          fontSize: '14px',
          opacity: 0.6,
          zIndex: 5
        }}
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ delay: 1, duration: 0.5 }}
      >
        Loading {scene.name}...
      </motion.div>
    </motion.div>
  );
};

// CSS Styles
const styles = `
.metaverse-scene {
  font-family: 'Roboto', sans-serif;
}

.asset-wrapper {
  transition: all 0.3s ease;
}

.asset-wrapper:hover {
  z-index: 5;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
}

.detail-label {
  opacity: 0.7;
}

.detail-value {
  font-weight: 500;
}

.control-button:hover {
  transform: scale(1.05);
  transition: transform 0.2s ease;
}

.particle-system-overlay {
  overflow: hidden;
}

.particle {
  border-radius: 50%;
}

.scene-info,
.asset-details-panel {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.close-button:hover {
  opacity: 1 !important;
  transform: scale(1.1);
  transition: all 0.2s ease;
}

/* Responsive Design */
@media (max-width: 768px) {
  .metaverse-scene {
    height: 400px;
  }
  
  .assets-container {
    padding: 20px;
    gap: 15px;
  }
  
  .scene-info,
  .asset-details-panel {
    font-size: 12px;
    padding: 8px 12px;
  }
  
  .scene-controls {
    bottom: 10px;
    right: 10px;
  }
  
  .control-button {
    padding: 6px 10px;
    font-size: 10px;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .metaverse-scene {
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .metaverse-scene * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}