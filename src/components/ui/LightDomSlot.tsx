/**
 * Light DOM Slot Component
 * React component that implements slot-based content projection with optimization
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { lightDomSlotSystem, SlotConfig, SlotContent, SlotOptimization } from '../../core/LightDomSlotSystem';

interface LightDomSlotProps {
  slotId: string;
  slotConfig?: Partial<SlotConfig>;
  children?: React.ReactNode;
  onOptimization?: (optimization: SlotOptimization) => void;
  className?: string;
  style?: React.CSSProperties;
}

export const LightDomSlot: React.FC<LightDomSlotProps> = ({
  slotId,
  slotConfig,
  children,
  onOptimization,
  className = '',
  style = {},
}) => {
  const slotRef = useRef<HTMLDivElement>(null);
  const [slotContent, setSlotContent] = useState<SlotContent[]>([]);
  const [optimization, setOptimization] = useState<SlotOptimization | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);

  // Register slot with configuration
  useEffect(() => {
    if (slotConfig) {
      const config: SlotConfig = {
        id: slotId,
        name: slotConfig.name || `Slot ${slotId}`,
        type: slotConfig.type || 'dynamic',
        optimizationLevel: slotConfig.optimizationLevel || 'moderate',
        allowedElements: slotConfig.allowedElements || ['*'],
        maxSize: slotConfig.maxSize,
        priority: slotConfig.priority || 'medium',
        ...slotConfig,
      };
      
      lightDomSlotSystem.registerSlot(config);
    }
  }, [slotId, slotConfig]);

  // Update slot content when children change
  useEffect(() => {
    if (slotRef.current && children) {
      const tempDiv = document.createElement('div');
      const reactContent = React.createElement('div', { children });
      
      // In a real implementation, you'd render React content to DOM
      // For this demo, we'll simulate content projection
      const childElements = slotRef.current.children;
      
      Array.from(childElements).forEach(element => {
        if (element instanceof HTMLElement) {
          const content = lightDomSlotSystem.projectContent(slotId, element);
          if (content) {
            setSlotContent(prev => {
              const filtered = prev.filter(c => c.id !== content.id);
              return [...filtered, content];
            });
          }
        }
      });
    }
  }, [children, slotId]);

  // Monitor slot optimization changes
  useEffect(() => {
    const interval = setInterval(() => {
      const currentOptimization = lightDomSlotSystem.getSlotOptimization(slotId);
      if (currentOptimization && JSON.stringify(currentOptimization) !== JSON.stringify(optimization)) {
        setOptimization(currentOptimization);
        onOptimization?.(currentOptimization);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [slotId, optimization, onOptimization]);

  const handleOptimizeSlot = useCallback(async () => {
    setIsOptimizing(true);
    try {
      const result = await lightDomSlotSystem.optimizeSlot(slotId);
      if (result) {
        setOptimization(result);
        onOptimization?.(result);
      }
    } catch (error) {
      console.error('Failed to optimize slot:', error);
    } finally {
      setIsOptimizing(false);
    }
  }, [slotId, onOptimization]);

  const handleClearSlot = useCallback(() => {
    slotContent.forEach(content => {
      lightDomSlotSystem.removeContent(content.id);
    });
    setSlotContent([]);
  }, [slotContent]);

  return (
    <div
      ref={slotRef}
      className={`lightdom-slot ${className}`}
      style={{
        position: 'relative',
        border: '1px dashed #4a5568',
        borderRadius: '4px',
        padding: '8px',
        margin: '4px',
        ...style,
      }}
      data-lightdom-slot={slotId}
    >
      {/* Slot header with optimization controls */}
      <div
        style={{
          fontSize: '12px',
          color: '#718096',
          marginBottom: '8px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span>Slot: {slotId}</span>
        <div style={{ display: 'flex', gap: '4px' }}>
          <button
            onClick={handleOptimizeSlot}
            disabled={isOptimizing}
            style={{
              fontSize: '10px',
              padding: '2px 6px',
              background: '#4299e1',
              color: 'white',
              border: 'none',
              borderRadius: '2px',
              cursor: isOptimizing ? 'not-allowed' : 'pointer',
            }}
          >
            {isOptimizing ? 'Optimizing...' : 'Optimize'}
          </button>
          <button
            onClick={handleClearSlot}
            style={{
              fontSize: '10px',
              padding: '2px 6px',
              background: '#e53e3e',
              color: 'white',
              border: 'none',
              borderRadius: '2px',
              cursor: 'pointer',
            }}
          >
            Clear
          </button>
        </div>
      </div>

      {/* Optimization metrics */}
      {optimization && (
        <div
          style={{
            fontSize: '11px',
            color: '#4a5568',
            background: '#f7fafc',
            padding: '4px',
            borderRadius: '2px',
            marginBottom: '8px',
          }}
        >
          <div>Space Saved: {optimization.spaceSaved} bytes</div>
          <div>Strategy: {optimization.optimizationStrategy}</div>
          <div>Render Time: {optimization.performance.renderTime.toFixed(2)}ms</div>
          {optimization.recommendations.length > 0 && (
            <div style={{ marginTop: '4px' }}>
              <strong>Recommendations:</strong>
              <ul style={{ margin: '2px 0', paddingLeft: '16px' }}>
                {optimization.recommendations.map((rec, index) => (
                  <li key={index}>{rec}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Slot content */}
      <div className="lightdom-slot-content">
        {children}
      </div>

      {/* Content metrics */}
      {slotContent.length > 0 && (
        <div
          style={{
            fontSize: '10px',
            color: '#a0aec0',
            marginTop: '8px',
            borderTop: '1px solid #e2e8f0',
            paddingTop: '4px',
          }}
        >
          Content Items: {slotContent.length} | Total Original: {slotContent.reduce((sum, c) => sum + c.originalSize, 0)} bytes
        </div>
      )}
    </div>
  );
};

// Higher-order component for automatic slot wrapping
export const withLightDomSlot = (
  slotId: string,
  slotConfig?: Partial<SlotConfig>
) => {
  return function <P extends object>(Component: React.ComponentType<P>) {
    return function WrappedComponent(props: P) {
      return (
        <LightDomSlot slotId={slotId} slotConfig={slotConfig}>
          <Component {...props} />
        </LightDomSlot>
      );
    };
  };
};

// Hook for using slot system in functional components
export const useLightDomSlot = (slotId: string) => {
  const [slotContent, setSlotContent] = useState<SlotContent[]>([]);
  const [optimization, setOptimization] = useState<SlotOptimization | null>(null);

  useEffect(() => {
    const updateContent = () => {
      const content = lightDomSlotSystem.getSlotContent(slotId);
      setSlotContent(content);
      
      const opt = lightDomSlotSystem.getSlotOptimization(slotId);
      setOptimization(opt);
    };

    updateContent();
    const interval = setInterval(updateContent, 1000);
    
    return () => clearInterval(interval);
  }, [slotId]);

  const optimizeSlot = useCallback(async () => {
    return lightDomSlotSystem.optimizeSlot(slotId);
  }, [slotId]);

  const projectContent = useCallback((element: HTMLElement) => {
    return lightDomSlotSystem.projectContent(slotId, element);
  }, [slotId]);

  const getTotalSpaceSaved = useCallback(() => {
    return lightDomSlotSystem.getTotalSpaceSaved();
  }, []);

  return {
    slotContent,
    optimization,
    optimizeSlot,
    projectContent,
    getTotalSpaceSaved,
  };
};