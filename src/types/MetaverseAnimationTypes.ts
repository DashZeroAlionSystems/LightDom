// Metaverse Animation Types for LightDom Platform

export interface MetaverseAssetAnimation {
  id: string;
  assetId: string;
  assetType: 'land' | 'ai_node' | 'storage_shard' | 'bridge';
  animationType: 'idle' | 'active' | 'harvesting' | 'upgrading' | 'combining' | 'error' | 'success';
  duration: number; // Animation duration in milliseconds
  easing: string; // CSS easing function
  loop: boolean;
  direction: 'normal' | 'reverse' | 'alternate' | 'alternate-reverse';
  keyframes: AnimationKeyframe[];
  triggers: AnimationTrigger[];
  metadata: Record<string, any>;
}

export interface AnimationKeyframe {
  offset: number; // 0-1 percentage
  properties: {
    transform?: string;
    opacity?: number;
    filter?: string;
    background?: string;
    color?: string;
    scale?: number;
    rotation?: number;
    translateX?: number;
    translateY?: number;
    translateZ?: number;
    skewX?: number;
    skewY?: number;
    [key: string]: any;
  };
}

export interface AnimationTrigger {
  type: 'hover' | 'click' | 'focus' | 'load' | 'custom';
  condition?: string;
  delay?: number;
  once?: boolean;
}

export interface MetaverseBiome {
  id: string;
  name: string;
  type: 'digital' | 'professional' | 'commercial' | 'social' | 'knowledge' | 'community' | 'entertainment' | 'production';
  colorScheme: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
  };
  animations: {
    ambient: MetaverseAssetAnimation[];
    interactive: MetaverseAssetAnimation[];
    transitions: MetaverseAssetAnimation[];
  };
  particles: ParticleSystem[];
  lighting: LightingConfig;
}

export interface ParticleSystem {
  id: string;
  type: 'floating' | 'sparkle' | 'energy' | 'data' | 'connection';
  count: number;
  speed: number;
  size: number;
  color: string;
  opacity: number;
  lifetime: number;
  spawnRate: number;
  direction: 'up' | 'down' | 'left' | 'right' | 'random' | 'radial';
  gravity: number;
  turbulence: number;
}

export interface LightingConfig {
  ambient: {
    color: string;
    intensity: number;
  };
  directional: {
    color: string;
    intensity: number;
    direction: [number, number, number];
  };
  point: Array<{
    color: string;
    intensity: number;
    position: [number, number, number];
    range: number;
  }>;
  effects: Array<{
    type: 'pulse' | 'flicker' | 'wave' | 'glow';
    duration: number;
    intensity: number;
  }>;
}

export interface MetaverseAssetVisual {
  id: string;
  assetType: 'land' | 'ai_node' | 'storage_shard' | 'bridge';
  biomeType: string;
  developmentLevel: number;
  size: number;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  model: AssetModel;
  materials: AssetMaterial[];
  animations: string[]; // Animation IDs
  effects: VisualEffect[];
  interactions: InteractionZone[];
}

export interface AssetModel {
  type: 'primitive' | 'mesh' | 'procedural' | 'svg' | 'css';
  geometry: {
    shape: 'cube' | 'sphere' | 'cylinder' | 'plane' | 'torus' | 'custom';
    dimensions: [number, number, number];
    segments?: [number, number, number];
  };
  vertices?: number[][];
  faces?: number[][];
  normals?: number[][];
  uvs?: number[][];
}

export interface AssetMaterial {
  type: 'solid' | 'gradient' | 'texture' | 'shader' | 'glass' | 'metal' | 'emissive';
  color: string;
  opacity: number;
  roughness: number;
  metallic: number;
  emissive: string;
  emissiveIntensity: number;
  texture?: {
    url: string;
    repeat: [number, number];
    offset: [number, number];
    rotation: number;
  };
  gradient?: {
    type: 'linear' | 'radial' | 'conic';
    stops: Array<{ color: string; position: number }>;
    direction?: string;
  };
}

export interface VisualEffect {
  type: 'glow' | 'pulse' | 'ripple' | 'sparkle' | 'energy' | 'data-flow' | 'connection-line';
  intensity: number;
  color: string;
  duration: number;
  frequency: number;
  size: number;
  direction?: string;
  target?: string; // Target asset ID for connection effects
}

export interface InteractionZone {
  type: 'click' | 'hover' | 'proximity' | 'drag';
  bounds: {
    min: [number, number, number];
    max: [number, number, number];
  };
  actions: InteractionAction[];
}

export interface InteractionAction {
  type: 'animate' | 'sound' | 'particle' | 'light' | 'ui' | 'custom';
  target: string;
  parameters: Record<string, any>;
}

export interface MetaverseScene {
  id: string;
  name: string;
  biome: MetaverseBiome;
  assets: MetaverseAssetVisual[];
  camera: CameraConfig;
  environment: EnvironmentConfig;
  lighting: LightingConfig;
  particles: ParticleSystem[];
  animations: MetaverseAssetAnimation[];
  interactions: SceneInteraction[];
}

export interface CameraConfig {
  position: [number, number, number];
  target: [number, number, number];
  fov: number;
  near: number;
  far: number;
  controls: 'orbit' | 'fly' | 'first-person' | 'cinematic';
  constraints?: {
    minDistance: number;
    maxDistance: number;
    minPolarAngle: number;
    maxPolarAngle: number;
  };
}

export interface EnvironmentConfig {
  skybox: {
    type: 'color' | 'gradient' | 'texture' | 'procedural';
    color?: string;
    gradient?: Array<{ color: string; position: number }>;
    texture?: string;
  };
  fog: {
    enabled: boolean;
    color: string;
    near: number;
    far: number;
    density: number;
  };
  ground: {
    type: 'plane' | 'terrain' | 'none';
    material: AssetMaterial;
    size: [number, number];
  };
}

export interface SceneInteraction {
  id: string;
  type: 'asset-click' | 'asset-hover' | 'scene-transition' | 'ui-toggle';
  trigger: string;
  actions: InteractionAction[];
  conditions?: Record<string, any>;
}

export interface AnimationPreset {
  id: string;
  name: string;
  category: 'entrance' | 'exit' | 'attention' | 'ambient' | 'interaction';
  description: string;
  keyframes: AnimationKeyframe[];
  duration: number;
  easing: string;
  loop: boolean;
  direction: 'normal' | 'reverse' | 'alternate' | 'alternate-reverse';
  tags: string[];
}

export interface MetaverseAnimationConfig {
  presets: AnimationPreset[];
  biomes: MetaverseBiome[];
  defaultAnimations: {
    land: string[];
    ai_node: string[];
    storage_shard: string[];
    bridge: string[];
  };
  performance: {
    maxParticles: number;
    maxAnimations: number;
    quality: 'low' | 'medium' | 'high' | 'ultra';
    enableShadows: boolean;
    enableReflections: boolean;
    enablePostProcessing: boolean;
  };
  accessibility: {
    respectReducedMotion: boolean;
    highContrast: boolean;
    largeText: boolean;
    audioDescriptions: boolean;
  };
}

// Event types
export interface MetaverseAnimationEvents {
  'animationStart': (animation: MetaverseAssetAnimation, asset: MetaverseAssetVisual) => void;
  'animationEnd': (animation: MetaverseAssetAnimation, asset: MetaverseAssetVisual) => void;
  'animationLoop': (animation: MetaverseAssetAnimation, asset: MetaverseAssetVisual) => void;
  'assetInteraction': (asset: MetaverseAssetVisual, interaction: InteractionAction) => void;
  'biomeTransition': (fromBiome: MetaverseBiome, toBiome: MetaverseBiome) => void;
  'sceneLoad': (scene: MetaverseScene) => void;
  'performanceWarning': (message: string, metrics: any) => void;
  'error': (error: string, context: any) => void;
}

// Utility types
export type MetaverseAssetType = 'land' | 'ai_node' | 'storage_shard' | 'bridge';
export type AnimationType = 'idle' | 'active' | 'harvesting' | 'upgrading' | 'combining' | 'error' | 'success';
export type BiomeType = 'digital' | 'professional' | 'commercial' | 'social' | 'knowledge' | 'community' | 'entertainment' | 'production';
export type ParticleType = 'floating' | 'sparkle' | 'energy' | 'data' | 'connection';
export type VisualEffectType = 'glow' | 'pulse' | 'ripple' | 'sparkle' | 'energy' | 'data-flow' | 'connection-line';
export type InteractionType = 'click' | 'hover' | 'proximity' | 'drag';
export type MaterialType = 'solid' | 'gradient' | 'texture' | 'shader' | 'glass' | 'metal' | 'emissive';
export type ModelType = 'primitive' | 'mesh' | 'procedural' | 'svg' | 'css';