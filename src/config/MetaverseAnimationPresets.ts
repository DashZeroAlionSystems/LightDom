import { 
  AnimationPreset, 
  MetaverseBiome, 
  MetaverseAnimationConfig,
  ParticleSystem,
  LightingConfig
} from '../types/MetaverseAnimationTypes';

// Animation Presets
export const animationPresets: AnimationPreset[] = [
  // Entrance Animations
  {
    id: 'entrance-fade-in',
    name: 'Fade In',
    category: 'entrance',
    description: 'Smooth fade in with scale up',
    keyframes: [
      { offset: 0, properties: { opacity: 0, scale: 0.8 } },
      { offset: 1, properties: { opacity: 1, scale: 1 } }
    ],
    duration: 500,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    loop: false,
    direction: 'normal',
    tags: ['entrance', 'fade', 'scale']
  },
  {
    id: 'entrance-slide-up',
    name: 'Slide Up',
    category: 'entrance',
    description: 'Slide up from below with fade in',
    keyframes: [
      { offset: 0, properties: { translateY: 50, opacity: 0 } },
      { offset: 1, properties: { translateY: 0, opacity: 1 } }
    ],
    duration: 600,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    loop: false,
    direction: 'normal',
    tags: ['entrance', 'slide', 'up']
  },
  {
    id: 'entrance-bounce',
    name: 'Bounce In',
    category: 'entrance',
    description: 'Bouncy entrance with elastic easing',
    keyframes: [
      { offset: 0, properties: { scale: 0, opacity: 0 } },
      { offset: 0.6, properties: { scale: 1.1, opacity: 1 } },
      { offset: 0.8, properties: { scale: 0.95 } },
      { offset: 1, properties: { scale: 1 } }
    ],
    duration: 800,
    easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    loop: false,
    direction: 'normal',
    tags: ['entrance', 'bounce', 'elastic']
  },

  // Exit Animations
  {
    id: 'exit-fade-out',
    name: 'Fade Out',
    category: 'exit',
    description: 'Smooth fade out with scale down',
    keyframes: [
      { offset: 0, properties: { opacity: 1, scale: 1 } },
      { offset: 1, properties: { opacity: 0, scale: 0.8 } }
    ],
    duration: 400,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    loop: false,
    direction: 'normal',
    tags: ['exit', 'fade', 'scale']
  },
  {
    id: 'exit-slide-down',
    name: 'Slide Down',
    category: 'exit',
    description: 'Slide down with fade out',
    keyframes: [
      { offset: 0, properties: { translateY: 0, opacity: 1 } },
      { offset: 1, properties: { translateY: -50, opacity: 0 } }
    ],
    duration: 400,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    loop: false,
    direction: 'normal',
    tags: ['exit', 'slide', 'down']
  },

  // Attention Animations
  {
    id: 'attention-pulse',
    name: 'Pulse',
    category: 'attention',
    description: 'Gentle pulsing to draw attention',
    keyframes: [
      { offset: 0, properties: { scale: 1 } },
      { offset: 0.5, properties: { scale: 1.05 } },
      { offset: 1, properties: { scale: 1 } }
    ],
    duration: 1500,
    easing: 'ease-in-out',
    loop: true,
    direction: 'normal',
    tags: ['attention', 'pulse', 'scale']
  },
  {
    id: 'attention-glow',
    name: 'Glow',
    category: 'attention',
    description: 'Glowing effect with intensity changes',
    keyframes: [
      { offset: 0, properties: { filter: 'brightness(1) drop-shadow(0 0 5px currentColor)' } },
      { offset: 0.5, properties: { filter: 'brightness(1.2) drop-shadow(0 0 15px currentColor)' } },
      { offset: 1, properties: { filter: 'brightness(1) drop-shadow(0 0 5px currentColor)' } }
    ],
    duration: 2000,
    easing: 'ease-in-out',
    loop: true,
    direction: 'normal',
    tags: ['attention', 'glow', 'filter']
  },
  {
    id: 'attention-shake',
    name: 'Shake',
    category: 'attention',
    description: 'Quick shake to indicate error or warning',
    keyframes: [
      { offset: 0, properties: { translateX: 0 } },
      { offset: 0.1, properties: { translateX: -5 } },
      { offset: 0.2, properties: { translateX: 5 } },
      { offset: 0.3, properties: { translateX: -5 } },
      { offset: 0.4, properties: { translateX: 5 } },
      { offset: 0.5, properties: { translateX: -3 } },
      { offset: 0.6, properties: { translateX: 3 } },
      { offset: 0.7, properties: { translateX: -2 } },
      { offset: 0.8, properties: { translateX: 2 } },
      { offset: 0.9, properties: { translateX: -1 } },
      { offset: 1, properties: { translateX: 0 } }
    ],
    duration: 500,
    easing: 'ease-in-out',
    loop: false,
    direction: 'normal',
    tags: ['attention', 'shake', 'error']
  },

  // Ambient Animations
  {
    id: 'ambient-float',
    name: 'Float',
    category: 'ambient',
    description: 'Gentle floating motion',
    keyframes: [
      { offset: 0, properties: { translateY: 0 } },
      { offset: 0.5, properties: { translateY: -10 } },
      { offset: 1, properties: { translateY: 0 } }
    ],
    duration: 3000,
    easing: 'ease-in-out',
    loop: true,
    direction: 'normal',
    tags: ['ambient', 'float', 'gentle']
  },
  {
    id: 'ambient-rotate',
    name: 'Rotate',
    category: 'ambient',
    description: 'Slow continuous rotation',
    keyframes: [
      { offset: 0, properties: { rotation: 0 } },
      { offset: 1, properties: { rotation: 360 } }
    ],
    duration: 10000,
    easing: 'linear',
    loop: true,
    direction: 'normal',
    tags: ['ambient', 'rotate', 'continuous']
  },
  {
    id: 'ambient-breathe',
    name: 'Breathe',
    category: 'ambient',
    description: 'Breathing-like scale animation',
    keyframes: [
      { offset: 0, properties: { scale: 1 } },
      { offset: 0.5, properties: { scale: 1.02 } },
      { offset: 1, properties: { scale: 1 } }
    ],
    duration: 4000,
    easing: 'ease-in-out',
    loop: true,
    direction: 'normal',
    tags: ['ambient', 'breathe', 'scale']
  },

  // Interaction Animations
  {
    id: 'interaction-hover',
    name: 'Hover',
    category: 'interaction',
    description: 'Hover effect with scale and glow',
    keyframes: [
      { offset: 0, properties: { scale: 1, filter: 'brightness(1)' } },
      { offset: 1, properties: { scale: 1.05, filter: 'brightness(1.1)' } }
    ],
    duration: 200,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    loop: false,
    direction: 'normal',
    tags: ['interaction', 'hover', 'scale']
  },
  {
    id: 'interaction-click',
    name: 'Click',
    category: 'interaction',
    description: 'Click feedback with scale down',
    keyframes: [
      { offset: 0, properties: { scale: 1 } },
      { offset: 0.5, properties: { scale: 0.95 } },
      { offset: 1, properties: { scale: 1 } }
    ],
    duration: 150,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    loop: false,
    direction: 'normal',
    tags: ['interaction', 'click', 'feedback']
  },
  {
    id: 'interaction-success',
    name: 'Success',
    category: 'interaction',
    description: 'Success animation with checkmark',
    keyframes: [
      { offset: 0, properties: { scale: 1, opacity: 1 } },
      { offset: 0.3, properties: { scale: 1.1 } },
      { offset: 0.6, properties: { scale: 1, opacity: 1 } },
      { offset: 1, properties: { scale: 1, opacity: 1 } }
    ],
    duration: 800,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    loop: false,
    direction: 'normal',
    tags: ['interaction', 'success', 'feedback']
  }
];

// Metaverse Biomes
export const metaverseBiomes: MetaverseBiome[] = [
  {
    id: 'digital',
    name: 'Digital Realm',
    type: 'digital',
    colorScheme: {
      primary: '#00D4FF',
      secondary: '#0099CC',
      accent: '#FF6B6B',
      background: '#0A0A0A',
      surface: '#1A1A1A',
      text: '#FFFFFF'
    },
    animations: {
      ambient: ['ambient-float', 'ambient-breathe'],
      interactive: ['interaction-hover', 'interaction-click'],
      transitions: ['entrance-fade-in', 'exit-fade-out']
    },
    particles: [
      {
        id: 'digital-data',
        type: 'data',
        count: 50,
        speed: 2,
        size: 2,
        color: '#00D4FF',
        opacity: 0.8,
        lifetime: 3000,
        spawnRate: 0.5,
        direction: 'up',
        gravity: 0,
        turbulence: 0.1
      },
      {
        id: 'digital-sparkles',
        type: 'sparkle',
        count: 30,
        speed: 1,
        size: 1,
        color: '#FFFFFF',
        opacity: 0.6,
        lifetime: 2000,
        spawnRate: 0.3,
        direction: 'random',
        gravity: 0,
        turbulence: 0.2
      }
    ],
    lighting: {
      ambient: '#00D4FF',
      directional: { color: '#FFFFFF', intensity: 0.8, direction: [1, 1, 1] },
      point: [
        { color: '#00D4FF', intensity: 1, position: [0, 10, 0], range: 20 },
        { color: '#FF6B6B', intensity: 0.5, position: [-10, 5, 10], range: 15 }
      ],
      effects: [
        { type: 'pulse', duration: 2000, intensity: 0.5 },
        { type: 'glow', duration: 3000, intensity: 0.3 }
      ]
    }
  },
  {
    id: 'professional',
    name: 'Professional Hub',
    type: 'professional',
    colorScheme: {
      primary: '#2563EB',
      secondary: '#1D4ED8',
      accent: '#F59E0B',
      background: '#F8FAFC',
      surface: '#FFFFFF',
      text: '#1E293B'
    },
    animations: {
      ambient: ['ambient-breathe'],
      interactive: ['interaction-hover', 'interaction-click'],
      transitions: ['entrance-slide-up', 'exit-slide-down']
    },
    particles: [
      {
        id: 'professional-energy',
        type: 'energy',
        count: 20,
        speed: 1,
        size: 3,
        color: '#2563EB',
        opacity: 0.7,
        lifetime: 4000,
        spawnRate: 0.2,
        direction: 'up',
        gravity: 0,
        turbulence: 0.05
      }
    ],
    lighting: {
      ambient: '#FFFFFF',
      directional: { color: '#FFFFFF', intensity: 1, direction: [0, -1, 0] },
      point: [
        { color: '#2563EB', intensity: 0.8, position: [0, 8, 0], range: 25 }
      ],
      effects: [
        { type: 'glow', duration: 4000, intensity: 0.2 }
      ]
    }
  },
  {
    id: 'commercial',
    name: 'Commercial District',
    type: 'commercial',
    colorScheme: {
      primary: '#10B981',
      secondary: '#059669',
      accent: '#F97316',
      background: '#F0FDF4',
      surface: '#FFFFFF',
      text: '#064E3B'
    },
    animations: {
      ambient: ['ambient-float', 'ambient-rotate'],
      interactive: ['interaction-hover', 'interaction-click', 'interaction-success'],
      transitions: ['entrance-bounce', 'exit-fade-out']
    },
    particles: [
      {
        id: 'commercial-sparkles',
        type: 'sparkle',
        count: 40,
        speed: 1.5,
        size: 2,
        color: '#10B981',
        opacity: 0.8,
        lifetime: 2500,
        spawnRate: 0.4,
        direction: 'radial',
        gravity: 0,
        turbulence: 0.15
      }
    ],
    lighting: {
      ambient: '#FFFFFF',
      directional: { color: '#FFFFFF', intensity: 1, direction: [0, -1, 0] },
      point: [
        { color: '#10B981', intensity: 1, position: [0, 6, 0], range: 20 },
        { color: '#F97316', intensity: 0.6, position: [5, 4, 5], range: 12 }
      ],
      effects: [
        { type: 'pulse', duration: 3000, intensity: 0.3 }
      ]
    }
  },
  {
    id: 'social',
    name: 'Social Network',
    type: 'social',
    colorScheme: {
      primary: '#EC4899',
      secondary: '#DB2777',
      accent: '#8B5CF6',
      background: '#FDF2F8',
      surface: '#FFFFFF',
      text: '#831843'
    },
    animations: {
      ambient: ['ambient-float', 'ambient-breathe'],
      interactive: ['interaction-hover', 'interaction-click'],
      transitions: ['entrance-fade-in', 'exit-fade-out']
    },
    particles: [
      {
        id: 'social-connections',
        type: 'connection',
        count: 25,
        speed: 2,
        size: 1,
        color: '#EC4899',
        opacity: 0.6,
        lifetime: 2000,
        spawnRate: 0.6,
        direction: 'random',
        gravity: 0,
        turbulence: 0.3
      }
    ],
    lighting: {
      ambient: '#FFFFFF',
      directional: { color: '#FFFFFF', intensity: 0.8, direction: [0, -1, 0] },
      point: [
        { color: '#EC4899', intensity: 0.9, position: [0, 7, 0], range: 18 },
        { color: '#8B5CF6', intensity: 0.7, position: [-8, 5, 8], range: 15 }
      ],
      effects: [
        { type: 'wave', duration: 2500, intensity: 0.4 }
      ]
    }
  },
  {
    id: 'knowledge',
    name: 'Knowledge Archive',
    type: 'knowledge',
    colorScheme: {
      primary: '#7C3AED',
      secondary: '#6D28D9',
      accent: '#06B6D4',
      background: '#FAF5FF',
      surface: '#FFFFFF',
      text: '#581C87'
    },
    animations: {
      ambient: ['ambient-rotate', 'ambient-breathe'],
      interactive: ['interaction-hover', 'interaction-click'],
      transitions: ['entrance-slide-up', 'exit-slide-down']
    },
    particles: [
      {
        id: 'knowledge-floating',
        type: 'floating',
        count: 35,
        speed: 0.8,
        size: 2.5,
        color: '#7C3AED',
        opacity: 0.7,
        lifetime: 5000,
        spawnRate: 0.3,
        direction: 'up',
        gravity: -0.1,
        turbulence: 0.1
      }
    ],
    lighting: {
      ambient: '#FFFFFF',
      directional: { color: '#FFFFFF', intensity: 0.9, direction: [0, -1, 0] },
      point: [
        { color: '#7C3AED', intensity: 1, position: [0, 9, 0], range: 22 },
        { color: '#06B6D4', intensity: 0.5, position: [10, 6, -10], range: 16 }
      ],
      effects: [
        { type: 'glow', duration: 3500, intensity: 0.3 }
      ]
    }
  },
  {
    id: 'community',
    name: 'Community Garden',
    type: 'community',
    colorScheme: {
      primary: '#22C55E',
      secondary: '#16A34A',
      accent: '#F59E0B',
      background: '#F0FDF4',
      surface: '#FFFFFF',
      text: '#14532D'
    },
    animations: {
      ambient: ['ambient-float', 'ambient-breathe'],
      interactive: ['interaction-hover', 'interaction-click', 'interaction-success'],
      transitions: ['entrance-bounce', 'exit-fade-out']
    },
    particles: [
      {
        id: 'community-nature',
        type: 'floating',
        count: 45,
        speed: 1,
        size: 2,
        color: '#22C55E',
        opacity: 0.8,
        lifetime: 4000,
        spawnRate: 0.5,
        direction: 'up',
        gravity: -0.05,
        turbulence: 0.2
      }
    ],
    lighting: {
      ambient: '#FFFFFF',
      directional: { color: '#FFFFFF', intensity: 1, direction: [0, -1, 0] },
      point: [
        { color: '#22C55E', intensity: 0.8, position: [0, 8, 0], range: 25 },
        { color: '#F59E0B', intensity: 0.6, position: [-12, 4, 12], range: 18 }
      ],
      effects: [
        { type: 'pulse', duration: 4000, intensity: 0.2 }
      ]
    }
  },
  {
    id: 'entertainment',
    name: 'Entertainment Zone',
    type: 'entertainment',
    colorScheme: {
      primary: '#F59E0B',
      secondary: '#D97706',
      accent: '#EF4444',
      background: '#FFFBEB',
      surface: '#FFFFFF',
      text: '#92400E'
    },
    animations: {
      ambient: ['ambient-float', 'ambient-rotate', 'ambient-breathe'],
      interactive: ['interaction-hover', 'interaction-click', 'interaction-success'],
      transitions: ['entrance-bounce', 'exit-fade-out']
    },
    particles: [
      {
        id: 'entertainment-sparkles',
        type: 'sparkle',
        count: 60,
        speed: 2.5,
        size: 1.5,
        color: '#F59E0B',
        opacity: 0.9,
        lifetime: 1500,
        spawnRate: 0.8,
        direction: 'radial',
        gravity: 0,
        turbulence: 0.4
      },
      {
        id: 'entertainment-energy',
        type: 'energy',
        count: 30,
        speed: 3,
        size: 3,
        color: '#EF4444',
        opacity: 0.7,
        lifetime: 2000,
        spawnRate: 0.6,
        direction: 'random',
        gravity: 0,
        turbulence: 0.3
      }
    ],
    lighting: {
      ambient: '#FFFFFF',
      directional: { color: '#FFFFFF', intensity: 0.9, direction: [0, -1, 0] },
      point: [
        { color: '#F59E0B', intensity: 1.2, position: [0, 6, 0], range: 20 },
        { color: '#EF4444', intensity: 0.8, position: [8, 5, -8], range: 15 },
        { color: '#8B5CF6', intensity: 0.6, position: [-8, 5, 8], range: 15 }
      ],
      effects: [
        { type: 'pulse', duration: 1500, intensity: 0.5 },
        { type: 'flicker', duration: 2000, intensity: 0.3 }
      ]
    }
  },
  {
    id: 'production',
    name: 'Production Facility',
    type: 'production',
    colorScheme: {
      primary: '#6B7280',
      secondary: '#4B5563',
      accent: '#F59E0B',
      background: '#F9FAFB',
      surface: '#FFFFFF',
      text: '#374151'
    },
    animations: {
      ambient: ['ambient-rotate'],
      interactive: ['interaction-hover', 'interaction-click'],
      transitions: ['entrance-slide-up', 'exit-slide-down']
    },
    particles: [
      {
        id: 'production-data',
        type: 'data',
        count: 40,
        speed: 1.5,
        size: 2,
        color: '#6B7280',
        opacity: 0.6,
        lifetime: 3000,
        spawnRate: 0.4,
        direction: 'up',
        gravity: 0,
        turbulence: 0.1
      }
    ],
    lighting: {
      ambient: '#FFFFFF',
      directional: { color: '#FFFFFF', intensity: 1, direction: [0, -1, 0] },
      point: [
        { color: '#6B7280', intensity: 0.8, position: [0, 10, 0], range: 30 },
        { color: '#F59E0B', intensity: 0.5, position: [15, 8, 15], range: 20 }
      ],
      effects: [
        { type: 'glow', duration: 5000, intensity: 0.2 }
      ]
    }
  }
];

// Default Animation Configuration
export const metaverseAnimationConfig: MetaverseAnimationConfig = {
  presets: animationPresets,
  biomes: metaverseBiomes,
  defaultAnimations: {
    land: ['entrance-fade-in', 'ambient-breathe', 'interaction-hover'],
    ai_node: ['entrance-slide-up', 'ambient-float', 'interaction-click'],
    storage_shard: ['entrance-bounce', 'ambient-rotate', 'interaction-hover'],
    bridge: ['entrance-fade-in', 'ambient-breathe', 'interaction-click']
  },
  performance: {
    maxParticles: 100,
    maxAnimations: 50,
    quality: 'high',
    enableShadows: true,
    enableReflections: true,
    enablePostProcessing: true
  },
  accessibility: {
    respectReducedMotion: true,
    highContrast: false,
    largeText: false,
    audioDescriptions: false
  }
};