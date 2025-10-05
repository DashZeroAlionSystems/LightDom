import React from 'react';
import './MetaverseItemGraphics.css';

interface MetaverseItemGraphicsProps {
  type: 'land' | 'building' | 'vehicle' | 'avatar' | 'tool' | 'decoration' | 'powerup';
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';
  size?: 'small' | 'medium' | 'large';
  animated?: boolean;
  className?: string;
}

const MetaverseItemGraphics: React.FC<MetaverseItemGraphicsProps> = ({
  type,
  rarity,
  size = 'medium',
  animated = false,
  className = ''
}) => {
  const getItemIcon = () => {
    const icons = {
      land: '🌲',
      building: '🏗️',
      vehicle: '⚡',
      avatar: '🛡️',
      tool: '🔨',
      decoration: '🎨',
      powerup: '💎'
    };
    return icons[type] || '⭐';
  };

  const getRarityClass = () => {
    return `rarity-${rarity}`;
  };

  const getSizeClass = () => {
    return `size-${size}`;
  };

  const getAnimationClass = () => {
    return animated ? 'animated' : '';
  };

  return (
    <div 
      className={`metaverse-item-graphics ${getRarityClass()} ${getSizeClass()} ${getAnimationClass()} ${className}`}
    >
      <div className="item-glow"></div>
      <div className="item-icon">{getItemIcon()}</div>
      <div className="item-particles"></div>
      <div className="item-border"></div>
    </div>
  );
};

export default MetaverseItemGraphics;