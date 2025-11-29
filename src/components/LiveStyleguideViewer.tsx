/**
 * Live Styleguide Viewer
 * 
 * An interactive styleguide viewer inspired by animejs.com that shows
 * design tokens with live editing and real-time updates across the system.
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Palette, 
  Type, 
  Layout, 
  Zap,
  Eye,
  Code,
  Download,
  Upload,
  Play,
  Pause,
  RefreshCw,
  Settings,
  Copy,
  Check
} from 'lucide-react';
import { colors, typography, spacing, animations as designAnimations } from '../styles/design-system';
import anime from 'animejs';

interface StyleguideViewerProps {
  onConfigChange?: (config: any) => void;
  initialConfig?: any;
}

export const LiveStyleguideViewer: React.FC<StyleguideViewerProps> = ({
  onConfigChange,
  initialConfig
}) => {
  const [activeTab, setActiveTab] = useState<'colors' | 'typography' | 'spacing' | 'animations'>('colors');
  const [isLiveMode, setIsLiveMode] = useState(true);
  const [config, setConfig] = useState(initialConfig || {});
  const [copied, setCopied] = useState(false);
  const [animationPlaying, setAnimationPlaying] = useState<string | null>(null);

  // Sync config changes
  useEffect(() => {
    if (isLiveMode && onConfigChange) {
      onConfigChange(config);
    }
  }, [config, isLiveMode, onConfigChange]);

  // Handle config change with animation
  const handleConfigChange = (category: string, key: string, value: any) => {
    setConfig((prev: any) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value,
      },
    }));

    // Animate the change indicator
    anime({
      targets: '.config-indicator',
      scale: [1, 1.2, 1],
      duration: 400,
      easing: 'easeOutElastic(1, .5)',
    });
  };

  // Copy config to clipboard
  const copyConfig = () => {
    navigator.clipboard.writeText(JSON.stringify(config, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Play animation preview
  const playAnimation = (animationName: string) => {
    setAnimationPlaying(animationName);
    const target = `.animation-preview-${animationName}`;
    
    switch (animationName) {
      case 'button-hover':
        anime({
          targets: target,
          scale: [1, 1.05, 1],
          duration: 400,
          easing: 'easeOutElastic(1, .5)',
        });
        break;
      case 'card-entrance':
        anime({
          targets: target,
          translateY: [40, 0],
          opacity: [0, 1],
          duration: 800,
          easing: 'easeOutExpo',
        });
        break;
      case 'fade-in':
        anime({
          targets: target,
          opacity: [0, 1],
          duration: 600,
          easing: 'easeOutQuad',
        });
        break;
    }
    
    setTimeout(() => setAnimationPlaying(null), 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0E27] via-[#151A31] to-[#1E2438]">
      {/* Header */}
      <header className="border-b border-[#2E3349] bg-[#151A31]/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-[#5865F2] to-[#7C5CFF] bg-clip-text text-transparent">
                LightDom Styleguide
              </h1>
              <motion.div
                className="config-indicator w-2 h-2 rounded-full bg-green-400"
                initial={{ scale: 0 }}
                animate={{ scale: isLiveMode ? 1 : 0 }}
              />
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsLiveMode(!isLiveMode)}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                  isLiveMode
                    ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                    : 'bg-gray-500/20 text-gray-400 hover:bg-gray-500/30'
                }`}
              >
                {isLiveMode ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                <span>{isLiveMode ? 'Live' : 'Paused'}</span>
              </button>
              
              <button
                onClick={copyConfig}
                className="px-4 py-2 rounded-lg bg-[#5865F2]/20 text-[#5865F2] hover:bg-[#5865F2]/30 transition-colors flex items-center gap-2"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied!' : 'Copy Config'}</span>
              </button>
              
              <button className="p-2 rounded-lg bg-[#2E3349] hover:bg-[#40444B] transition-colors">
                <Download className="w-5 h-5 text-white" />
              </button>
              
              <button className="p-2 rounded-lg bg-[#2E3349] hover:bg-[#40444B] transition-colors">
                <Settings className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="border-b border-[#2E3349] bg-[#151A31]/60 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-2">
            {[
              { id: 'colors', label: 'Colors', icon: Palette },
              { id: 'typography', label: 'Typography', icon: Type },
              { id: 'spacing', label: 'Spacing', icon: Layout },
              { id: 'animations', label: 'Animations', icon: Zap },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`relative px-6 py-4 flex items-center gap-2 transition-colors ${
                    activeTab === tab.id
                      ? 'text-[#5865F2]'
                      : 'text-[#B9BBBE] hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{tab.label}</span>
                  
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#5865F2] to-[#7C5CFF]"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'colors' && <ColorsPanel config={config} onChange={handleConfigChange} />}
            {activeTab === 'typography' && <TypographyPanel config={config} onChange={handleConfigChange} />}
            {activeTab === 'spacing' && <SpacingPanel config={config} onChange={handleConfigChange} />}
            {activeTab === 'animations' && (
              <AnimationsPanel 
                config={config} 
                onChange={handleConfigChange}
                onPlayAnimation={playAnimation}
                animationPlaying={animationPlaying}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

// Colors Panel Component
const ColorsPanel: React.FC<any> = ({ config, onChange }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Object.entries(colors).map(([category, shades]) => {
        if (typeof shades !== 'object' || category === 'gradients') return null;
        
        return (
          <motion.div
            key={category}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4, delay: Math.random() * 0.2 }}
            className="bg-gradient-to-br from-[#151A31] to-[#1E2438] rounded-xl p-6 border border-[#2E3349] hover:border-[#5865F2] transition-colors"
          >
            <h3 className="text-lg font-semibold text-white mb-4 capitalize">{category}</h3>
            <div className="space-y-2">
              {Object.entries(shades as any).map(([shade, color]) => (
                <div key={shade} className="flex items-center gap-3 group">
                  <div
                    className="w-12 h-12 rounded-lg shadow-lg cursor-pointer transition-transform hover:scale-110"
                    style={{ backgroundColor: color as string }}
                    onClick={() => {
                      anime({
                        targets: `[data-color="${category}-${shade}"]`,
                        scale: [1, 1.2, 1],
                        duration: 400,
                        easing: 'easeOutElastic(1, .5)',
                      });
                    }}
                    data-color={`${category}-${shade}`}
                  />
                  <div className="flex-1">
                    <div className="text-sm text-white font-medium">{shade}</div>
                    <div className="text-xs text-[#72767D] font-mono">{color}</div>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(color as string);
                      anime({
                        targets: `[data-color="${category}-${shade}"]`,
                        scale: [1, 1.1, 1],
                        duration: 300,
                      });
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-[#2E3349] rounded"
                  >
                    <Copy className="w-4 h-4 text-[#B9BBBE]" />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

// Typography Panel Component
const TypographyPanel: React.FC<any> = ({ config, onChange }) => {
  const fontSizes = ['xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl'];
  
  return (
    <div className="space-y-8">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-gradient-to-br from-[#151A31] to-[#1E2438] rounded-xl p-8 border border-[#2E3349]"
      >
        <h3 className="text-xl font-semibold text-white mb-6">Font Scale</h3>
        <div className="space-y-4">
          {fontSizes.map((size, index) => (
            <motion.div
              key={size}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center gap-6 p-4 rounded-lg hover:bg-[#2E3349]/30 transition-colors cursor-pointer group"
            >
              <div className="w-16 text-sm text-[#72767D] font-mono">{size}</div>
              <div
                className={`text-${size} text-white font-sans transition-all group-hover:text-[#5865F2]`}
                style={{ fontFamily: typography.fontFamily.sans.join(', ') }}
              >
                The quick brown fox jumps over the lazy dog
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-gradient-to-br from-[#151A31] to-[#1E2438] rounded-xl p-8 border border-[#2E3349]"
      >
        <h3 className="text-xl font-semibold text-white mb-6">Font Weights</h3>
        <div className="space-y-4">
          {[
            { weight: 'light', value: 300 },
            { weight: 'normal', value: 400 },
            { weight: 'medium', value: 500 },
            { weight: 'semibold', value: 600 },
            { weight: 'bold', value: 700 },
          ].map(({ weight, value }) => (
            <div key={weight} className="flex items-center gap-6 p-4">
              <div className="w-24 text-sm text-[#72767D] font-mono">{weight} ({value})</div>
              <div
                className="text-2xl text-white"
                style={{ fontWeight: value }}
              >
                The quick brown fox jumps over the lazy dog
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

// Spacing Panel Component
const SpacingPanel: React.FC<any> = ({ config, onChange }) => {
  const spacingValues = [0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24, 32, 40, 48, 56, 64];
  
  return (
    <div className="bg-gradient-to-br from-[#151A31] to-[#1E2438] rounded-xl p-8 border border-[#2E3349]">
      <h3 className="text-xl font-semibold text-white mb-6">Spacing Scale</h3>
      <div className="space-y-4">
        {spacingValues.map((value, index) => (
          <motion.div
            key={value}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: index * 0.03 }}
            className="flex items-center gap-6"
          >
            <div className="w-16 text-sm text-[#72767D] font-mono">{value * 4}px</div>
            <div className="flex-1 flex items-center gap-4">
              <motion.div
                className="h-8 bg-gradient-to-r from-[#5865F2] to-[#7C5CFF] rounded"
                style={{ width: `${value * 4}px` }}
                whileHover={{ scale: 1.05 }}
                transition={{ type: 'spring', stiffness: 400 }}
              />
              <div className="text-xs text-[#B9BBBE] font-mono">spacing-{value}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// Animations Panel Component
const AnimationsPanel: React.FC<any> = ({ config, onChange, onPlayAnimation, animationPlaying }) => {
  const animations = [
    { id: 'button-hover', name: 'Button Hover', description: 'Elastic scale effect' },
    { id: 'card-entrance', name: 'Card Entrance', description: 'Smooth reveal animation' },
    { id: 'fade-in', name: 'Fade In', description: 'Simple opacity transition' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {animations.map((animation, index) => (
        <motion.div
          key={animation.id}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: index * 0.1 }}
          className="bg-gradient-to-br from-[#151A31] to-[#1E2438] rounded-xl p-6 border border-[#2E3349] hover:border-[#5865F2] transition-colors"
        >
          <h4 className="text-lg font-semibold text-white mb-2">{animation.name}</h4>
          <p className="text-sm text-[#B9BBBE] mb-4">{animation.description}</p>
          
          <div className="bg-[#0A0E27] rounded-lg p-8 mb-4 flex items-center justify-center">
            <div
              className={`animation-preview-${animation.id} w-16 h-16 bg-gradient-to-br from-[#5865F2] to-[#7C5CFF] rounded-lg`}
            />
          </div>
          
          <button
            onClick={() => onPlayAnimation(animation.id)}
            disabled={animationPlaying === animation.id}
            className="w-full px-4 py-2 rounded-lg bg-[#5865F2] hover:bg-[#6C7BFF] text-white font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Play className="w-4 h-4" />
            <span>{animationPlaying === animation.id ? 'Playing...' : 'Play Animation'}</span>
          </button>
        </motion.div>
      ))}
    </div>
  );
};

export default LiveStyleguideViewer;
