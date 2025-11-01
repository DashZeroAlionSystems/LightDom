import { EventEmitter } from 'events';
import { Logger } from '../../utils/Logger';
import {
  MetaverseAssetAnimation,
  MetaverseAssetVisual,
  MetaverseBiome,
  MetaverseScene,
  AnimationPreset,
  ParticleSystem,
  VisualEffect,
  InteractionAction,
  MetaverseAnimationConfig,
  MetaverseAnimationEvents
} from '@/types/MetaverseAnimationTypes';
import { metaverseAnimationConfig } from '../../config/MetaverseAnimationPresets';

export class MetaverseAnimationService extends EventEmitter {
  private logger: Logger;
  private config: MetaverseAnimationConfig;
  private activeAnimations: Map<string, MetaverseAssetAnimation> = new Map();
  private activeParticles: Map<string, ParticleSystem> = new Map();
  private scenes: Map<string, MetaverseScene> = new Map();
  private animationQueue: Map<string, MetaverseAssetAnimation[]> = new Map();
  private isInitialized = false;
  private animationFrameId: number | null = null;
  private lastUpdateTime = 0;
  private performanceMetrics = {
    frameRate: 0,
    animationCount: 0,
    particleCount: 0,
    memoryUsage: 0
  };

  constructor(config?: MetaverseAnimationConfig) {
    super();
    this.config = config || metaverseAnimationConfig;
    this.logger = new Logger('MetaverseAnimationService');
  }

  /**
   * Initialize the animation service
   */
  async initialize(): Promise<void> {
    try {
      this.logger.info('Initializing MetaverseAnimationService');

      // Check for reduced motion preference
      if (this.config.accessibility.respectReducedMotion) {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) {
          this.logger.info('Reduced motion preference detected, disabling animations');
          this.disableAnimations();
        }
      }

      // Start animation loop
      this.startAnimationLoop();

      this.isInitialized = true;
      this.logger.info('MetaverseAnimationService initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize MetaverseAnimationService:', error);
      throw error;
    }
  }

  /**
   * Create a metaverse scene
   */
  createScene(sceneData: Omit<MetaverseScene, 'id'>): MetaverseScene {
    const scene: MetaverseScene = {
      id: `scene_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...sceneData
    };

    this.scenes.set(scene.id, scene);
    this.logger.info(`Created scene: ${scene.name}`, { sceneId: scene.id });

    this.emit('sceneLoad', scene);
    return scene;
  }

  /**
   * Add asset to scene with animations
   */
  addAssetToScene(sceneId: string, asset: MetaverseAssetVisual): boolean {
    const scene = this.scenes.get(sceneId);
    if (!scene) {
      this.logger.error(`Scene ${sceneId} not found`);
      return false;
    }

    scene.assets.push(asset);
    
    // Apply default animations based on asset type
    const defaultAnimations = this.config.defaultAnimations[asset.assetType];
    if (defaultAnimations) {
      defaultAnimations.forEach(animationId => {
        const preset = this.config.presets.find(p => p.id === animationId);
        if (preset) {
          this.applyAnimationToAsset(asset.id, preset);
        }
      });
    }

    this.logger.info(`Added asset ${asset.id} to scene ${sceneId}`);
    return true;
  }

  /**
   * Apply animation to asset
   */
  applyAnimationToAsset(assetId: string, animationPreset: AnimationPreset): string {
    const animation: MetaverseAssetAnimation = {
      id: `anim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      assetId,
      assetType: 'land', // This would be determined from the asset
      animationType: 'idle',
      duration: animationPreset.duration,
      easing: animationPreset.easing,
      loop: animationPreset.loop,
      direction: animationPreset.direction,
      keyframes: animationPreset.keyframes,
      triggers: [],
      metadata: {
        presetId: animationPreset.id,
        presetName: animationPreset.name,
        category: animationPreset.category
      }
    };

    this.activeAnimations.set(animation.id, animation);
    this.logger.info(`Applied animation ${animationPreset.name} to asset ${assetId}`);

    this.emit('animationStart', animation, this.getAssetById(assetId));
    return animation.id;
  }

  /**
   * Create custom animation
   */
  createCustomAnimation(
    assetId: string,
    animationData: Omit<MetaverseAssetAnimation, 'id' | 'assetId'>
  ): string {
    const animation: MetaverseAssetAnimation = {
      id: `anim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      assetId,
      ...animationData
    };

    this.activeAnimations.set(animation.id, animation);
    this.logger.info(`Created custom animation for asset ${assetId}`);

    this.emit('animationStart', animation, this.getAssetById(assetId));
    return animation.id;
  }

  /**
   * Stop animation
   */
  stopAnimation(animationId: string): boolean {
    const animation = this.activeAnimations.get(animationId);
    if (!animation) {
      this.logger.warn(`Animation ${animationId} not found`);
      return false;
    }

    this.activeAnimations.delete(animationId);
    this.logger.info(`Stopped animation ${animationId}`);

    this.emit('animationEnd', animation, this.getAssetById(animation.assetId));
    return true;
  }

  /**
   * Pause animation
   */
  pauseAnimation(animationId: string): boolean {
    const animation = this.activeAnimations.get(animationId);
    if (!animation) {
      this.logger.warn(`Animation ${animationId} not found`);
      return false;
    }

    // In a real implementation, you would pause the animation
    animation.metadata.paused = true;
    this.logger.info(`Paused animation ${animationId}`);
    return true;
  }

  /**
   * Resume animation
   */
  resumeAnimation(animationId: string): boolean {
    const animation = this.activeAnimations.get(animationId);
    if (!animation) {
      this.logger.warn(`Animation ${animationId} not found`);
      return false;
    }

    // In a real implementation, you would resume the animation
    animation.metadata.paused = false;
    this.logger.info(`Resumed animation ${animationId}`);
    return true;
  }

  /**
   * Add particle system to scene
   */
  addParticleSystem(sceneId: string, particleSystem: ParticleSystem): boolean {
    const scene = this.scenes.get(sceneId);
    if (!scene) {
      this.logger.error(`Scene ${sceneId} not found`);
      return false;
    }

    scene.particles.push(particleSystem);
    this.activeParticles.set(particleSystem.id, particleSystem);
    
    this.logger.info(`Added particle system ${particleSystem.id} to scene ${sceneId}`);
    return true;
  }

  /**
   * Remove particle system
   */
  removeParticleSystem(particleSystemId: string): boolean {
    const particleSystem = this.activeParticles.get(particleSystemId);
    if (!particleSystem) {
      this.logger.warn(`Particle system ${particleSystemId} not found`);
      return false;
    }

    this.activeParticles.delete(particleSystemId);
    this.logger.info(`Removed particle system ${particleSystemId}`);
    return true;
  }

  /**
   * Apply visual effect to asset
   */
  applyVisualEffect(assetId: string, effect: VisualEffect): string {
    const effectId = `effect_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // In a real implementation, you would apply the visual effect
    this.logger.info(`Applied visual effect ${effect.type} to asset ${assetId}`);
    
    return effectId;
  }

  /**
   * Handle asset interaction
   */
  handleAssetInteraction(assetId: string, interactionType: string, action: InteractionAction): void {
    const asset = this.getAssetById(assetId);
    if (!asset) {
      this.logger.warn(`Asset ${assetId} not found`);
      return;
    }

    this.logger.info(`Asset interaction: ${interactionType} on ${assetId}`);
    this.emit('assetInteraction', asset, action);

    // Trigger interaction animations
    switch (interactionType) {
      case 'hover':
        this.triggerInteractionAnimation(assetId, 'interaction-hover');
        break;
      case 'click':
        this.triggerInteractionAnimation(assetId, 'interaction-click');
        break;
      case 'success':
        this.triggerInteractionAnimation(assetId, 'interaction-success');
        break;
    }
  }

  /**
   * Transition between biomes
   */
  transitionBiome(sceneId: string, fromBiome: MetaverseBiome, toBiome: MetaverseBiome): void {
    const scene = this.scenes.get(sceneId);
    if (!scene) {
      this.logger.error(`Scene ${sceneId} not found`);
      return;
    }

    this.logger.info(`Transitioning from ${fromBiome.name} to ${toBiome.name}`);
    
    // Apply transition animations to all assets
    scene.assets.forEach(asset => {
      this.triggerTransitionAnimation(asset.id, fromBiome, toBiome);
    });

    // Update scene biome
    scene.biome = toBiome;

    this.emit('biomeTransition', fromBiome, toBiome);
  }

  /**
   * Get animation by ID
   */
  getAnimation(animationId: string): MetaverseAssetAnimation | null {
    return this.activeAnimations.get(animationId) || null;
  }

  /**
   * Get all animations for asset
   */
  getAssetAnimations(assetId: string): MetaverseAssetAnimation[] {
    return Array.from(this.activeAnimations.values()).filter(anim => anim.assetId === assetId);
  }

  /**
   * Get scene by ID
   */
  getScene(sceneId: string): MetaverseScene | null {
    return this.scenes.get(sceneId) || null;
  }

  /**
   * Get all scenes
   */
  getAllScenes(): MetaverseScene[] {
    return Array.from(this.scenes.values());
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics(): typeof this.performanceMetrics {
    return { ...this.performanceMetrics };
  }

  /**
   * Update performance settings
   */
  updatePerformanceSettings(settings: Partial<typeof this.config.performance>): void {
    this.config.performance = { ...this.config.performance, ...settings };
    this.logger.info('Updated performance settings', settings);
  }

  /**
   * Start animation loop
   */
  private startAnimationLoop(): void {
    const animate = (currentTime: number) => {
      if (currentTime - this.lastUpdateTime >= 16) { // ~60fps
        this.updateAnimations(currentTime);
        this.updateParticles(currentTime);
        this.updatePerformanceMetrics();
        this.lastUpdateTime = currentTime;
      }
      
      this.animationFrameId = requestAnimationFrame(animate);
    };

    this.animationFrameId = requestAnimationFrame(animate);
  }

  /**
   * Update animations
   */
  private updateAnimations(currentTime: number): void {
    for (const [animationId, animation] of this.activeAnimations) {
      if (animation.metadata.paused) continue;

      // In a real implementation, you would update animation progress
      // and apply keyframe transformations to the DOM elements
      
      // Check for animation completion
      if (animation.metadata.startTime && 
          currentTime - animation.metadata.startTime >= animation.duration) {
        
        if (animation.loop) {
          // Restart animation
          animation.metadata.startTime = currentTime;
          this.emit('animationLoop', animation, this.getAssetById(animation.assetId));
        } else {
          // Complete animation
          this.activeAnimations.delete(animationId);
          this.emit('animationEnd', animation, this.getAssetById(animation.assetId));
        }
      }
    }
  }

  /**
   * Update particles
   */
  private updateParticles(currentTime: number): void {
    for (const [particleId, particleSystem] of this.activeParticles) {
      // In a real implementation, you would update particle positions,
      // lifetimes, and render them
      
      // Check performance limits
      if (this.performanceMetrics.particleCount > this.config.performance.maxParticles) {
        this.logger.warn('Particle count exceeds performance limit');
        this.emit('performanceWarning', 'Particle count limit exceeded', this.performanceMetrics);
      }
    }
  }

  /**
   * Update performance metrics
   */
  private updatePerformanceMetrics(): void {
    this.performanceMetrics.animationCount = this.activeAnimations.size;
    this.performanceMetrics.particleCount = this.activeParticles.size;
    
    // Calculate frame rate
    const now = performance.now();
    if (this.performanceMetrics.frameRate === 0) {
      this.performanceMetrics.frameRate = 60; // Initial estimate
    } else {
      // Simple frame rate calculation
      const deltaTime = now - this.lastUpdateTime;
      this.performanceMetrics.frameRate = Math.round(1000 / deltaTime);
    }
  }

  /**
   * Trigger interaction animation
   */
  private triggerInteractionAnimation(assetId: string, animationType: string): void {
    const preset = this.config.presets.find(p => p.id === animationType);
    if (preset) {
      this.applyAnimationToAsset(assetId, preset);
    }
  }

  /**
   * Trigger transition animation
   */
  private triggerTransitionAnimation(assetId: string, fromBiome: MetaverseBiome, toBiome: MetaverseBiome): void {
    // Apply exit animation from current biome
    const exitAnimation = fromBiome.animations.transitions.find(anim => anim.includes('exit'));
    if (exitAnimation) {
      const preset = this.config.presets.find(p => p.id === exitAnimation);
      if (preset) {
        this.applyAnimationToAsset(assetId, preset);
      }
    }

    // Apply entrance animation for new biome
    setTimeout(() => {
      const entranceAnimation = toBiome.animations.transitions.find(anim => anim.includes('entrance'));
      if (entranceAnimation) {
        const preset = this.config.presets.find(p => p.id === entranceAnimation);
        if (preset) {
          this.applyAnimationToAsset(assetId, preset);
        }
      }
    }, 500); // Delay for smooth transition
  }

  /**
   * Get asset by ID
   */
  private getAssetById(assetId: string): MetaverseAssetVisual | null {
    for (const scene of this.scenes.values()) {
      const asset = scene.assets.find(a => a.id === assetId);
      if (asset) return asset;
    }
    return null;
  }

  /**
   * Disable animations for accessibility
   */
  private disableAnimations(): void {
    this.config.performance.maxAnimations = 0;
    this.config.performance.maxParticles = 0;
    this.logger.info('Animations disabled for accessibility');
  }

  /**
   * Get service status
   */
  getStatus(): any {
    return {
      isInitialized: this.isInitialized,
      activeAnimations: this.activeAnimations.size,
      activeParticles: this.activeParticles.size,
      scenes: this.scenes.size,
      performance: this.performanceMetrics,
      config: {
        presets: this.config.presets.length,
        biomes: this.config.biomes.length,
        performance: this.config.performance,
        accessibility: this.config.accessibility
      }
    };
  }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    try {
      if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId);
        this.animationFrameId = null;
      }

      this.activeAnimations.clear();
      this.activeParticles.clear();
      this.scenes.clear();
      this.animationQueue.clear();

      this.isInitialized = false;
      this.logger.info('MetaverseAnimationService cleaned up');
    } catch (error) {
      this.logger.error('Error during cleanup:', error);
      throw error;
    }
  }
}

export default MetaverseAnimationService;