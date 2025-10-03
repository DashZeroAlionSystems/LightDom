import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MetaverseAssetVisual,
  MetaverseAssetAnimation,
  MetaverseBiome,
  VisualEffect,
  ParticleSystem
} from '../types/MetaverseAnimationTypes';

interface MetaverseAssetProps {
  asset: MetaverseAssetVisual;
  biome: MetaverseBiome;
  isInteractive?: boolean;
  onInteraction?: (assetId: string, interactionType: string) => void;
  className?: string;
}

export const MetaverseLandAsset: React.FC<MetaverseAssetProps> = ({
  asset,
  biome,
  isInteractive = true,
  onInteraction,
  className = ''
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const assetRef = useRef<HTMLDivElement>(null);

  // Land-specific animations
  const landVariants = {
    idle: {
      scale: 1,
      rotateY: 0,
      filter: 'brightness(1)',
      transition: {
        duration: 2,
        ease: 'easeInOut',
        repeat: Infinity,
        repeatType: 'reverse' as const
      }
    },
    hover: {
      scale: 1.05,
      rotateY: 5,
      filter: 'brightness(1.1) drop-shadow(0 0 10px currentColor)',
      transition: {
        duration: 0.3,
        ease: 'easeOut'
      }
    },
    click: {
      scale: 0.95,
      transition: {
        duration: 0.1,
        ease: 'easeInOut'
      }
    },
    harvesting: {
      scale: [1, 1.1, 1],
      filter: 'brightness(1.2) drop-shadow(0 0 15px #00D4FF)',
      transition: {
        duration: 1,
        ease: 'easeInOut',
        repeat: Infinity
      }
    },
    upgrading: {
      scale: [1, 1.05, 1],
      rotateY: [0, 10, 0],
      filter: 'brightness(1.1) drop-shadow(0 0 12px #F59E0B)',
      transition: {
        duration: 1.5,
        ease: 'easeInOut',
        repeat: Infinity
      }
    }
  };

  const handleInteraction = (type: string) => {
    if (isInteractive && onInteraction) {
      onInteraction(asset.id, type);
    }
  };

  return (
    <motion.div
      ref={assetRef}
      className={`metaverse-land-asset ${className}`}
      style={{
        width: `${asset.scale[0] * 100}px`,
        height: `${asset.scale[1] * 100}px`,
        backgroundColor: biome.colorScheme.primary,
        borderRadius: '12px',
        position: 'relative',
        cursor: isInteractive ? 'pointer' : 'default',
        border: `2px solid ${biome.colorScheme.secondary}`,
        boxShadow: `0 4px 12px ${biome.colorScheme.primary}40`
      }}
      variants={landVariants}
      initial="idle"
      animate={isClicked ? 'click' : isHovered ? 'hover' : 'idle'}
      whileHover={isInteractive ? 'hover' : undefined}
      whileTap={isInteractive ? 'click' : undefined}
      onHoverStart={() => {
        setIsHovered(true);
        handleInteraction('hover');
      }}
      onHoverEnd={() => setIsHovered(false)}
      onTap={() => {
        setIsClicked(true);
        handleInteraction('click');
        setTimeout(() => setIsClicked(false), 150);
      }}
    >
      {/* Land Content */}
      <div className="land-content" style={{
        padding: '16px',
        color: biome.colorScheme.text,
        textAlign: 'center',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <div className="land-icon" style={{
          fontSize: '24px',
          marginBottom: '8px'
        }}>
          🏞️
        </div>
        <div className="land-title" style={{
          fontSize: '14px',
          fontWeight: 'bold',
          marginBottom: '4px'
        }}>
          Land Parcel
        </div>
        <div className="land-details" style={{
          fontSize: '12px',
          opacity: 0.8
        }}>
          {asset.size} KB
        </div>
        <div className="land-level" style={{
          fontSize: '10px',
          marginTop: '4px',
          padding: '2px 6px',
          backgroundColor: biome.colorScheme.accent,
          borderRadius: '4px',
          color: '#FFFFFF'
        }}>
          Lv.{asset.developmentLevel}
        </div>
      </div>

      {/* Visual Effects */}
      {asset.effects.map((effect, index) => (
        <VisualEffectComponent
          key={`${effect.type}-${index}`}
          effect={effect}
          biome={biome}
        />
      ))}

      {/* Particles */}
      {biome.particles.map((particle) => (
        <ParticleSystemComponent
          key={particle.id}
          particleSystem={particle}
          assetId={asset.id}
        />
      ))}
    </motion.div>
  );
};

export const MetaverseAINodeAsset: React.FC<MetaverseAssetProps> = ({
  asset,
  biome,
  isInteractive = true,
  onInteraction,
  className = ''
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);

  const aiNodeVariants = {
    idle: {
      scale: 1,
      rotateY: 0,
      filter: 'brightness(1)',
      transition: {
        duration: 3,
        ease: 'easeInOut',
        repeat: Infinity,
        repeatType: 'reverse' as const
      }
    },
    hover: {
      scale: 1.08,
      rotateY: 10,
      filter: 'brightness(1.2) drop-shadow(0 0 15px currentColor)',
      transition: {
        duration: 0.3,
        ease: 'easeOut'
      }
    },
    click: {
      scale: 0.92,
      transition: {
        duration: 0.1,
        ease: 'easeInOut'
      }
    },
    active: {
      scale: [1, 1.05, 1],
      rotateY: [0, 360],
      filter: 'brightness(1.3) drop-shadow(0 0 20px #00D4FF)',
      transition: {
        duration: 2,
        ease: 'easeInOut',
        repeat: Infinity
      }
    }
  };

  const handleInteraction = (type: string) => {
    if (isInteractive && onInteraction) {
      onInteraction(asset.id, type);
    }
  };

  return (
    <motion.div
      className={`metaverse-ai-node-asset ${className}`}
      style={{
        width: `${asset.scale[0] * 120}px`,
        height: `${asset.scale[1] * 120}px`,
        backgroundColor: biome.colorScheme.primary,
        borderRadius: '50%',
        position: 'relative',
        cursor: isInteractive ? 'pointer' : 'default',
        border: `3px solid ${biome.colorScheme.secondary}`,
        boxShadow: `0 6px 20px ${biome.colorScheme.primary}60`
      }}
      variants={aiNodeVariants}
      initial="idle"
      animate={isClicked ? 'click' : isHovered ? 'hover' : 'idle'}
      whileHover={isInteractive ? 'hover' : undefined}
      whileTap={isInteractive ? 'click' : undefined}
      onHoverStart={() => {
        setIsHovered(true);
        handleInteraction('hover');
      }}
      onHoverEnd={() => setIsHovered(false)}
      onTap={() => {
        setIsClicked(true);
        handleInteraction('click');
        setTimeout(() => setIsClicked(false), 150);
      }}
    >
      {/* AI Node Content */}
      <div className="ai-node-content" style={{
        padding: '20px',
        color: biome.colorScheme.text,
        textAlign: 'center',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <div className="ai-node-icon" style={{
          fontSize: '32px',
          marginBottom: '8px',
          animation: 'ai-pulse 2s ease-in-out infinite'
        }}>
          🤖
        </div>
        <div className="ai-node-title" style={{
          fontSize: '16px',
          fontWeight: 'bold',
          marginBottom: '4px'
        }}>
          AI Node
        </div>
        <div className="ai-node-details" style={{
          fontSize: '12px',
          opacity: 0.8
        }}>
          {asset.size} KB
        </div>
        <div className="ai-node-level" style={{
          fontSize: '10px',
          marginTop: '4px',
          padding: '2px 8px',
          backgroundColor: biome.colorScheme.accent,
          borderRadius: '12px',
          color: '#FFFFFF'
        }}>
          Lv.{asset.developmentLevel}
        </div>
      </div>

      {/* AI Node Effects */}
      <div className="ai-node-effects" style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '100%',
        height: '100%',
        pointerEvents: 'none'
      }}>
        <motion.div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: '80%',
            height: '80%',
            border: `2px solid ${biome.colorScheme.accent}`,
            borderRadius: '50%',
            transform: 'translate(-50%, -50%)'
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0.8, 0.5]
          }}
          transition={{
            duration: 3,
            ease: 'easeInOut',
            repeat: Infinity
          }}
        />
        <motion.div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: '60%',
            height: '60%',
            border: `1px solid ${biome.colorScheme.primary}`,
            borderRadius: '50%',
            transform: 'translate(-50%, -50%)'
          }}
          animate={{
            scale: [1, 1.4, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{
            duration: 2,
            ease: 'easeInOut',
            repeat: Infinity
          }}
        />
      </div>

      {/* Visual Effects */}
      {asset.effects.map((effect, index) => (
        <VisualEffectComponent
          key={`${effect.type}-${index}`}
          effect={effect}
          biome={biome}
        />
      ))}
    </motion.div>
  );
};

export const MetaverseStorageShardAsset: React.FC<MetaverseAssetProps> = ({
  asset,
  biome,
  isInteractive = true,
  onInteraction,
  className = ''
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);

  const storageVariants = {
    idle: {
      scale: 1,
      rotateZ: 0,
      filter: 'brightness(1)',
      transition: {
        duration: 4,
        ease: 'easeInOut',
        repeat: Infinity,
        repeatType: 'reverse' as const
      }
    },
    hover: {
      scale: 1.06,
      rotateZ: 5,
      filter: 'brightness(1.15) drop-shadow(0 0 12px currentColor)',
      transition: {
        duration: 0.3,
        ease: 'easeOut'
      }
    },
    click: {
      scale: 0.94,
      transition: {
        duration: 0.1,
        ease: 'easeInOut'
      }
    },
    active: {
      scale: [1, 1.03, 1],
      rotateZ: [0, 180, 360],
      filter: 'brightness(1.2) drop-shadow(0 0 18px #10B981)',
      transition: {
        duration: 3,
        ease: 'linear',
        repeat: Infinity
      }
    }
  };

  const handleInteraction = (type: string) => {
    if (isInteractive && onInteraction) {
      onInteraction(asset.id, type);
    }
  };

  return (
    <motion.div
      className={`metaverse-storage-shard-asset ${className}`}
      style={{
        width: `${asset.scale[0] * 80}px`,
        height: `${asset.scale[1] * 80}px`,
        backgroundColor: biome.colorScheme.primary,
        borderRadius: '8px',
        position: 'relative',
        cursor: isInteractive ? 'pointer' : 'default',
        border: `2px solid ${biome.colorScheme.secondary}`,
        boxShadow: `0 4px 16px ${biome.colorScheme.primary}50`,
        transform: 'rotate(45deg)'
      }}
      variants={storageVariants}
      initial="idle"
      animate={isClicked ? 'click' : isHovered ? 'hover' : 'idle'}
      whileHover={isInteractive ? 'hover' : undefined}
      whileTap={isInteractive ? 'click' : undefined}
      onHoverStart={() => {
        setIsHovered(true);
        handleInteraction('hover');
      }}
      onHoverEnd={() => setIsHovered(false)}
      onTap={() => {
        setIsClicked(true);
        handleInteraction('click');
        setTimeout(() => setIsClicked(false), 150);
      }}
    >
      {/* Storage Shard Content */}
      <div className="storage-shard-content" style={{
        padding: '12px',
        color: biome.colorScheme.text,
        textAlign: 'center',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        transform: 'rotate(-45deg)'
      }}>
        <div className="storage-shard-icon" style={{
          fontSize: '20px',
          marginBottom: '4px'
        }}>
          💾
        </div>
        <div className="storage-shard-title" style={{
          fontSize: '12px',
          fontWeight: 'bold',
          marginBottom: '2px'
        }}>
          Storage
        </div>
        <div className="storage-shard-details" style={{
          fontSize: '10px',
          opacity: 0.8
        }}>
          {asset.size} KB
        </div>
        <div className="storage-shard-level" style={{
          fontSize: '8px',
          marginTop: '2px',
          padding: '1px 4px',
          backgroundColor: biome.colorScheme.accent,
          borderRadius: '2px',
          color: '#FFFFFF'
        }}>
          Lv.{asset.developmentLevel}
        </div>
      </div>

      {/* Storage Effects */}
      <div className="storage-effects" style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '100%',
        height: '100%',
        pointerEvents: 'none'
      }}>
        <motion.div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: '120%',
            height: '120%',
            border: `1px solid ${biome.colorScheme.accent}`,
            borderRadius: '8px',
            transform: 'translate(-50%, -50%)'
          }}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{
            duration: 2,
            ease: 'easeInOut',
            repeat: Infinity
          }}
        />
      </div>

      {/* Visual Effects */}
      {asset.effects.map((effect, index) => (
        <VisualEffectComponent
          key={`${effect.type}-${index}`}
          effect={effect}
          biome={biome}
        />
      ))}
    </motion.div>
  );
};

export const MetaverseBridgeAsset: React.FC<MetaverseAssetProps> = ({
  asset,
  biome,
  isInteractive = true,
  onInteraction,
  className = ''
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);

  const bridgeVariants = {
    idle: {
      scale: 1,
      filter: 'brightness(1)',
      transition: {
        duration: 2,
        ease: 'easeInOut',
        repeat: Infinity,
        repeatType: 'reverse' as const
      }
    },
    hover: {
      scale: 1.04,
      filter: 'brightness(1.1) drop-shadow(0 0 8px currentColor)',
      transition: {
        duration: 0.3,
        ease: 'easeOut'
      }
    },
    click: {
      scale: 0.96,
      transition: {
        duration: 0.1,
        ease: 'easeInOut'
      }
    },
    active: {
      scale: [1, 1.02, 1],
      filter: 'brightness(1.2) drop-shadow(0 0 12px #8B5CF6)',
      transition: {
        duration: 1.5,
        ease: 'easeInOut',
        repeat: Infinity
      }
    }
  };

  const handleInteraction = (type: string) => {
    if (isInteractive && onInteraction) {
      onInteraction(asset.id, type);
    }
  };

  return (
    <motion.div
      className={`metaverse-bridge-asset ${className}`}
      style={{
        width: `${asset.scale[0] * 100}px`,
        height: `${asset.scale[1] * 40}px`,
        backgroundColor: biome.colorScheme.primary,
        borderRadius: '20px',
        position: 'relative',
        cursor: isInteractive ? 'pointer' : 'default',
        border: `2px solid ${biome.colorScheme.secondary}`,
        boxShadow: `0 4px 12px ${biome.colorScheme.primary}40`
      }}
      variants={bridgeVariants}
      initial="idle"
      animate={isClicked ? 'click' : isHovered ? 'hover' : 'idle'}
      whileHover={isInteractive ? 'hover' : undefined}
      whileTap={isInteractive ? 'click' : undefined}
      onHoverStart={() => {
        setIsHovered(true);
        handleInteraction('hover');
      }}
      onHoverEnd={() => setIsHovered(false)}
      onTap={() => {
        setIsClicked(true);
        handleInteraction('click');
        setTimeout(() => setIsClicked(false), 150);
      }}
    >
      {/* Bridge Content */}
      <div className="bridge-content" style={{
        padding: '8px 16px',
        color: biome.colorScheme.text,
        textAlign: 'center',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <div className="bridge-icon" style={{
          fontSize: '16px',
          marginBottom: '4px'
        }}>
          🌉
        </div>
        <div className="bridge-title" style={{
          fontSize: '12px',
          fontWeight: 'bold',
          marginBottom: '2px'
        }}>
          Bridge
        </div>
        <div className="bridge-details" style={{
          fontSize: '10px',
          opacity: 0.8
        }}>
          {asset.size} KB
        </div>
        <div className="bridge-level" style={{
          fontSize: '8px',
          marginTop: '2px',
          padding: '1px 4px',
          backgroundColor: biome.colorScheme.accent,
          borderRadius: '2px',
          color: '#FFFFFF'
        }}>
          Lv.{asset.developmentLevel}
        </div>
      </div>

      {/* Bridge Effects */}
      <div className="bridge-effects" style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '100%',
        height: '100%',
        pointerEvents: 'none'
      }}>
        <motion.div
          style={{
            position: 'absolute',
            top: '50%',
            left: '0',
            width: '100%',
            height: '2px',
            backgroundColor: biome.colorScheme.accent,
            transform: 'translateY(-50%)'
          }}
          animate={{
            scaleX: [0, 1, 0],
            opacity: [0, 1, 0]
          }}
          transition={{
            duration: 2,
            ease: 'easeInOut',
            repeat: Infinity
          }}
        />
      </div>

      {/* Visual Effects */}
      {asset.effects.map((effect, index) => (
        <VisualEffectComponent
          key={`${effect.type}-${index}`}
          effect={effect}
          biome={biome}
        />
      ))}
    </motion.div>
  );
};

// Visual Effect Component
interface VisualEffectComponentProps {
  effect: VisualEffect;
  biome: MetaverseBiome;
}

const VisualEffectComponent: React.FC<VisualEffectComponentProps> = ({ effect, biome }) => {
  const getEffectAnimation = () => {
    switch (effect.type) {
      case 'glow':
        return {
          animate: {
            filter: `brightness(${1 + effect.intensity * 0.2}) drop-shadow(0 0 ${effect.size * 2}px ${effect.color})`,
            opacity: [0.5, 1, 0.5]
          },
          transition: {
            duration: effect.duration / 1000,
            ease: 'easeInOut',
            repeat: Infinity
          }
        };
      case 'pulse':
        return {
          animate: {
            scale: [1, 1 + effect.intensity * 0.1, 1]
          },
          transition: {
            duration: effect.duration / 1000,
            ease: 'easeInOut',
            repeat: Infinity
          }
        };
      case 'sparkle':
        return {
          animate: {
            opacity: [0, 1, 0],
            scale: [0.5, 1, 0.5]
          },
          transition: {
            duration: effect.duration / 1000,
            ease: 'easeInOut',
            repeat: Infinity
          }
        };
      default:
        return {};
    }
  };

  return (
    <motion.div
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: `${effect.size}px`,
        height: `${effect.size}px`,
        backgroundColor: effect.color,
        borderRadius: '50%',
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'none',
        opacity: effect.intensity
      }}
      {...getEffectAnimation()}
    />
  );
};

// Particle System Component
interface ParticleSystemComponentProps {
  particleSystem: ParticleSystem;
  assetId: string;
}

const ParticleSystemComponent: React.FC<ParticleSystemComponentProps> = ({ particleSystem, assetId }) => {
  const [particles, setParticles] = useState<Array<{
    id: string;
    x: number;
    y: number;
    opacity: number;
    scale: number;
  }>>([]);

  useEffect(() => {
    const generateParticles = () => {
      const newParticles = Array.from({ length: particleSystem.count }, (_, i) => ({
        id: `${assetId}-particle-${i}`,
        x: Math.random() * 200 - 100,
        y: Math.random() * 200 - 100,
        opacity: Math.random() * particleSystem.opacity,
        scale: Math.random() * particleSystem.size
      }));
      setParticles(newParticles);
    };

    generateParticles();
    const interval = setInterval(generateParticles, particleSystem.lifetime);
    return () => clearInterval(interval);
  }, [particleSystem, assetId]);

  return (
    <div className="particle-system" style={{
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: '200px',
      height: '200px',
      pointerEvents: 'none'
    }}>
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            width: `${particle.scale}px`,
            height: `${particle.scale}px`,
            backgroundColor: particleSystem.color,
            borderRadius: '50%',
            opacity: particle.opacity
          }}
          animate={{
            x: particle.x,
            y: particle.y,
            opacity: [particle.opacity, 0],
            scale: [0, 1, 0]
          }}
          transition={{
            duration: particleSystem.lifetime / 1000,
            ease: 'easeOut'
          }}
        />
      ))}
    </div>
  );
};

// CSS Animations
const styles = `
@keyframes ai-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.metaverse-land-asset,
.metaverse-ai-node-asset,
.metaverse-storage-shard-asset,
.metaverse-bridge-asset {
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}

.metaverse-land-asset:hover,
.metaverse-ai-node-asset:hover,
.metaverse-storage-shard-asset:hover,
.metaverse-bridge-asset:hover {
  z-index: 10;
}

.particle-system {
  overflow: hidden;
}
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}