// Metaverse Animation related types
export interface MetaverseAssetAnimation {
  id: string;
  assetId: string;
  assetType?: string;
  animationType?: 'idle' | 'active' | 'harvesting' | 'upgrading' | 'combining' | 'error' | 'success';
  type: 'transform' | 'color' | 'scale' | 'rotation' | 'opacity';
  duration: number;
  easing: string;
  loop: boolean;
  direction?: 'normal' | 'reverse' | 'alternate' | 'alternate-reverse';
  keyframes: AnimationKeyframe[];
  triggers?: AnimationTrigger[];
  startTime?: number;
  endTime?: number;
  state: 'idle' | 'playing' | 'paused' | 'completed';
  metadata?: {
    paused?: boolean;
    startTime?: number;
    currentTime?: number;
    [key: string]: any;
  };
}

export interface AnimationTrigger {
  type: 'hover' | 'click' | 'focus' | 'load' | 'custom';
  condition?: string;
  delay?: number;
  once?: boolean;
}

export interface MetaverseAssetVisual {
  id: string;
  assetType: 'model' | 'texture' | 'material' | 'light' | 'particle';
  name: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  animations: MetaverseAssetAnimation[];
  metadata: Record<string, any>;
}

export interface MetaverseBiome {
  id: string;
  name: string;
  type: 'forest' | 'desert' | 'ocean' | 'mountain' | 'urban';
  assets: MetaverseAssetVisual[];
  lighting: LightingConfig;
  effects: VisualEffect[];
  animations?: {
    transitions?: string[];
    ambient?: string[];
    interactive?: string[];
  };
}

export interface MetaverseScene {
  id: string;
  name: string;
  biome: MetaverseBiome;
  assets: MetaverseAssetVisual[];
  camera: CameraConfig;
  lighting: LightingConfig;
  effects: VisualEffect[];
  interactions: InteractionAction[];
  particles?: ParticleSystem[];
}

export interface AnimationPreset {
  id: string;
  name: string;
  /** Optional human-friendly description for the preset */
  description?: string;
  /** Optional tags for categorization */
  tags?: string[];
  type: string;
  duration?: number;
  easing?: string;
  loop?: boolean;
  direction?: 'normal' | 'reverse' | 'alternate';
  category?: string;
  config: AnimationConfig;
  keyframes: AnimationKeyframe[];
}

export interface ParticleSystem {
  id: string;
  type: 'emitter' | 'field' | 'attractor';
  position: [number, number, number];
  config: ParticleConfig;
  active: boolean;
}

export interface VisualEffect {
  id: string;
  type: 'fog' | 'rain' | 'snow' | 'fire' | 'magic';
  intensity: number;
  config: Record<string, any>;
}

export interface InteractionAction {
  id: string;
  trigger: 'click' | 'hover' | 'proximity' | 'timer';
  target: string;
  action: 'play' | 'pause' | 'stop' | 'emit' | 'teleport';
  params: Record<string, any>;
}

export interface MetaverseAnimationConfig {
  enabled: boolean;
  maxConcurrentAnimations: number;
  defaultFrameRate: number;
  presets: AnimationPreset[];
  defaultAnimations: Record<string, string[]>;
  particleSystems: ParticleSystem[];
  globalEffects: VisualEffect[];
  performance?: {
    maxAnimations?: number;
    maxParticles?: number;
    targetFrameRate?: number;
    adaptiveQuality?: boolean;
  };
  accessibility?: {
    respectReducedMotion?: boolean;
    highContrast?: boolean;
    reducedParticles?: boolean;
  };
  biomes?: MetaverseBiome[];
}

export interface MetaverseAnimationEvents {
  animationStart: (animation: MetaverseAssetAnimation) => void;
  animationEnd: (animation: MetaverseAssetAnimation) => void;
  sceneLoad: (scene: MetaverseScene) => void;
  assetAdd: (asset: MetaverseAssetVisual) => void;
  interaction: (action: InteractionAction) => void;
}

export interface AnimationKeyframe {
  // Support both time/value and offset/properties shapes used across the codebase
  time?: number;
  offset?: number;
  value?: any;
  properties?: Record<string, any>;
  easing?: string;
  composite?: 'replace' | 'add' | string;
  [key: string]: any;
}

export interface AnimationConfig {
  duration?: number;
  easing?: string;
  loop?: boolean;
  delay?: number;
  direction?: 'normal' | 'reverse' | 'alternate';
}

export interface ParticleConfig {
  count: number;
  lifetime: number;
  speed: number;
  size: number;
  color: string;
  texture?: string;
}

export interface CameraConfig {
  position: [number, number, number];
  target: [number, number, number];
  fov: number;
  near: number;
  far: number;
}

export interface PointLight {
  position?: [number, number, number];
  color: string;
  intensity?: number;
  range?: number;
  [key: string]: any;
}

export type AmbientConfig = string | { color: string; intensity?: number };

export interface LightingConfig {
  /** Ambient can be a simple color string (hex/name) or an object with color and optional intensity */
  ambient?: AmbientConfig;
  directional?: {
    color: string;
    intensity?: number;
    direction?: [number, number, number];
    [key: string]: any;
  };
  /** Support both `point` and `pointLights` shapes used across the codebase */
  point?: PointLight[];
  pointLights?: PointLight[];
  effects?: Array<{
    type: string;
    duration?: number;
    intensity?: number;
    [key: string]: any;
  }>;
  [key: string]: any;
}