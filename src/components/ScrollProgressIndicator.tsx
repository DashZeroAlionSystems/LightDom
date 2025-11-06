/**
 * Scroll Progress Indicator
 * Exodus-style progress bar showing scroll position
 */

import React from 'react';
import { useScrollProgress } from '../hooks/useScrollEffects';
import { LightDomColors } from '../styles/LightDomDesignSystem';

const ScrollProgressIndicator: React.FC = () => {
  const scrollProgress = useScrollProgress();

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '3px',
        background: LightDomColors.dark.border,
        zIndex: 9999,
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          height: '100%',
          background: LightDomColors.gradients.primary,
          width: `${scrollProgress}%`,
          transition: 'width 0.1s ease-out',
          boxShadow: `0 0 10px ${LightDomColors.primary[500]}`,
        }}
      />
    </div>
  );
};

export default ScrollProgressIndicator;
