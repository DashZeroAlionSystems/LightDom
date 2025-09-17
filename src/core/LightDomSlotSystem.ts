/**
 * Light DOM Slot System
 * Provides slot-based content projection and optimization for the LightDom framework
 */

export interface SlotConfig {
  id: string;
  name: string;
  type: 'static' | 'dynamic' | 'lazy';
  optimizationLevel: 'aggressive' | 'moderate' | 'conservative';
  allowedElements: string[];
  maxSize?: number;
  priority: 'high' | 'medium' | 'low';
}

export interface SlotContent {
  id: string;
  slotId: string;
  element: HTMLElement;
  originalSize: number;
  optimizedSize: number;
  optimizationType: string;
  timestamp: number;
  metadata: Record<string, any>;
}

export interface SlotOptimization {
  slotId: string;
  spaceSaved: number;
  optimizationStrategy: string;
  performance: {
    renderTime: number;
    layoutShifts: number;
    memoryUsage: number;
  };
  recommendations: string[];
}

export class LightDomSlotSystem {
  private slots: Map<string, SlotConfig> = new Map();
  private slotContent: Map<string, SlotContent[]> = new Map();
  private optimizations: Map<string, SlotOptimization> = new Map();
  private observers: Map<string, MutationObserver> = new Map();
  private performanceEntries: Map<string, PerformanceEntry[]> = new Map();

  constructor() {
    this.initializeDefaultSlots();
    this.setupPerformanceMonitoring();
  }

  /**
   * Register a new slot with optimization configuration
   */
  registerSlot(config: SlotConfig): void {
    this.slots.set(config.id, config);
    this.slotContent.set(config.id, []);
    this.setupSlotObserver(config.id);
  }

  /**
   * Project content into a slot with optimization
   */
  projectContent(slotId: string, element: HTMLElement): SlotContent | null {
    const slotConfig = this.slots.get(slotId);
    if (!slotConfig) {
      console.warn(`Slot ${slotId} not found`);
      return null;
    }

    // Validate element against slot configuration
    if (!this.validateElement(element, slotConfig)) {
      console.warn(`Element not allowed in slot ${slotId}`);
      return null;
    }

    const originalSize = this.calculateElementSize(element);
    const optimizedElement = this.optimizeElement(element, slotConfig);
    const optimizedSize = this.calculateElementSize(optimizedElement);

    const slotContent: SlotContent = {
      id: `content_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      slotId,
      element: optimizedElement,
      originalSize,
      optimizedSize,
      optimizationType: this.getOptimizationType(slotConfig.optimizationLevel),
      timestamp: Date.now(),
      metadata: this.extractElementMetadata(element),
    };

    const currentContent = this.slotContent.get(slotId) || [];
    this.slotContent.set(slotId, [...currentContent, slotContent]);

    // Update optimization metrics
    this.updateSlotOptimization(slotId);

    return slotContent;
  }

  /**
   * Get content projected in a specific slot
   */
  getSlotContent(slotId: string): SlotContent[] {
    return this.slotContent.get(slotId) || [];
  }

  /**
   * Get optimization metrics for a slot
   */
  getSlotOptimization(slotId: string): SlotOptimization | null {
    return this.optimizations.get(slotId) || null;
  }

  /**
   * Remove content from a slot
   */
  removeContent(contentId: string): boolean {
    for (const [slotId, contents] of this.slotContent.entries()) {
      const index = contents.findIndex(content => content.id === contentId);
      if (index !== -1) {
        contents.splice(index, 1);
        this.updateSlotOptimization(slotId);
        return true;
      }
    }
    return false;
  }

  /**
   * Get all registered slots
   */
  getAllSlots(): SlotConfig[] {
    return Array.from(this.slots.values());
  }

  /**
   * Get total space saved across all slots
   */
  getTotalSpaceSaved(): number {
    let totalSaved = 0;
    for (const contents of this.slotContent.values()) {
      for (const content of contents) {
        totalSaved += (content.originalSize - content.optimizedSize);
      }
    }
    return totalSaved;
  }

  /**
   * Optimize a slot by reprocessing its content
   */
  async optimizeSlot(slotId: string): Promise<SlotOptimization | null> {
    const slotConfig = this.slots.get(slotId);
    const contents = this.slotContent.get(slotId);
    
    if (!slotConfig || !contents) {
      return null;
    }

    const startTime = performance.now();
    let totalSpaceSaved = 0;
    const recommendations: string[] = [];

    // Re-optimize each content item
    for (const content of contents) {
      const newOptimizedElement = this.optimizeElement(content.element, slotConfig);
      const newSize = this.calculateElementSize(newOptimizedElement);
      
      const additionalSavings = content.optimizedSize - newSize;
      if (additionalSavings > 0) {
        content.element = newOptimizedElement;
        content.optimizedSize = newSize;
        totalSpaceSaved += additionalSavings;
      }
    }

    const optimization: SlotOptimization = {
      slotId,
      spaceSaved: totalSpaceSaved,
      optimizationStrategy: this.getOptimizationStrategy(slotConfig),
      performance: {
        renderTime: performance.now() - startTime,
        layoutShifts: this.measureLayoutShifts(slotId),
        memoryUsage: this.estimateMemoryUsage(contents),
      },
      recommendations: this.generateRecommendations(slotConfig, contents),
    };

    this.optimizations.set(slotId, optimization);
    return optimization;
  }

  private initializeDefaultSlots(): void {
    // Header slot for navigation and branding
    this.registerSlot({
      id: 'header',
      name: 'Header Content',
      type: 'static',
      optimizationLevel: 'moderate',
      allowedElements: ['nav', 'header', 'div', 'a', 'img', 'svg'],
      priority: 'high',
    });

    // Main content slot for primary content
    this.registerSlot({
      id: 'main',
      name: 'Main Content',
      type: 'dynamic',
      optimizationLevel: 'aggressive',
      allowedElements: ['article', 'section', 'div', 'p', 'h1', 'h2', 'h3', 'img'],
      priority: 'high',
    });

    // Sidebar slot for secondary content
    this.registerSlot({
      id: 'sidebar',
      name: 'Sidebar Content',
      type: 'lazy',
      optimizationLevel: 'conservative',
      allowedElements: ['aside', 'div', 'nav', 'ul', 'li'],
      priority: 'medium',
    });

    // Footer slot for footer content
    this.registerSlot({
      id: 'footer',
      name: 'Footer Content',
      type: 'static',
      optimizationLevel: 'moderate',
      allowedElements: ['footer', 'div', 'p', 'a', 'small'],
      priority: 'low',
    });

    // Widget slot for dynamic widgets
    this.registerSlot({
      id: 'widgets',
      name: 'Widget Area',
      type: 'dynamic',
      optimizationLevel: 'aggressive',
      allowedElements: ['*'], // Allow all elements for widgets
      maxSize: 100 * 1024, // 100KB max
      priority: 'medium',
    });
  }

  private validateElement(element: HTMLElement, config: SlotConfig): boolean {
    if (config.allowedElements.includes('*')) {
      return true;
    }
    
    return config.allowedElements.includes(element.tagName.toLowerCase());
  }

  private calculateElementSize(element: HTMLElement): number {
    // Calculate size including content, attributes, and structure
    const outerHTML = element.outerHTML;
    return new Blob([outerHTML]).size;
  }

  private optimizeElement(element: HTMLElement, config: SlotConfig): HTMLElement {
    const clonedElement = element.cloneNode(true) as HTMLElement;
    
    switch (config.optimizationLevel) {
      case 'aggressive':
        this.applyAggressiveOptimization(clonedElement);
        break;
      case 'moderate':
        this.applyModerateOptimization(clonedElement);
        break;
      case 'conservative':
        this.applyConservativeOptimization(clonedElement);
        break;
    }
    
    return clonedElement;
  }

  private applyAggressiveOptimization(element: HTMLElement): void {
    // Remove all unnecessary attributes
    const preservedAttrs = ['id', 'class', 'src', 'href', 'alt'];
    Array.from(element.attributes).forEach(attr => {
      if (!preservedAttrs.includes(attr.name)) {
        element.removeAttribute(attr.name);
      }
    });

    // Minimize whitespace
    if (element.textContent) {
      element.textContent = element.textContent.trim().replace(/\s+/g, ' ');
    }

    // Remove empty elements
    const childElements = Array.from(element.children);
    childElements.forEach(child => {
      if (child.textContent?.trim() === '' && child.children.length === 0) {
        child.remove();
      }
    });
  }

  private applyModerateOptimization(element: HTMLElement): void {
    // Remove common unnecessary attributes
    const removeAttrs = ['style', 'title', 'data-*'];
    removeAttrs.forEach(attr => {
      if (attr.includes('*')) {
        Array.from(element.attributes).forEach(a => {
          if (a.name.startsWith(attr.replace('*', ''))) {
            element.removeAttribute(a.name);
          }
        });
      } else {
        element.removeAttribute(attr);
      }
    });

    // Normalize whitespace
    if (element.textContent) {
      element.textContent = element.textContent.replace(/\s+/g, ' ').trim();
    }
  }

  private applyConservativeOptimization(element: HTMLElement): void {
    // Only remove obviously unnecessary attributes
    const removeAttrs = ['data-test', 'data-debug'];
    removeAttrs.forEach(attr => {
      element.removeAttribute(attr);
    });
  }

  private getOptimizationType(level: string): string {
    return `lightdom-${level}-optimization`;
  }

  private extractElementMetadata(element: HTMLElement): Record<string, any> {
    return {
      tagName: element.tagName.toLowerCase(),
      className: element.className,
      id: element.id,
      childrenCount: element.children.length,
      hasText: !!element.textContent?.trim(),
      hasImages: element.querySelectorAll('img').length,
      hasLinks: element.querySelectorAll('a').length,
    };
  }

  private updateSlotOptimization(slotId: string): void {
    const contents = this.slotContent.get(slotId) || [];
    const slotConfig = this.slots.get(slotId)!;
    
    const spaceSaved = contents.reduce((total, content) => 
      total + (content.originalSize - content.optimizedSize), 0);

    const optimization: SlotOptimization = {
      slotId,
      spaceSaved,
      optimizationStrategy: this.getOptimizationStrategy(slotConfig),
      performance: {
        renderTime: 0, // Will be measured during actual rendering
        layoutShifts: 0,
        memoryUsage: this.estimateMemoryUsage(contents),
      },
      recommendations: this.generateRecommendations(slotConfig, contents),
    };

    this.optimizations.set(slotId, optimization);
  }

  private getOptimizationStrategy(config: SlotConfig): string {
    return `${config.type}-${config.optimizationLevel}`;
  }

  private estimateMemoryUsage(contents: SlotContent[]): number {
    return contents.reduce((total, content) => total + content.optimizedSize, 0);
  }

  private generateRecommendations(config: SlotConfig, contents: SlotContent[]): string[] {
    const recommendations: string[] = [];
    
    if (contents.length > 10) {
      recommendations.push('Consider implementing lazy loading for this slot');
    }
    
    const avgSize = contents.reduce((sum, c) => sum + c.optimizedSize, 0) / contents.length;
    if (avgSize > 10000) {
      recommendations.push('Content items are large, consider more aggressive optimization');
    }
    
    if (config.type === 'dynamic' && contents.length > 0) {
      recommendations.push('Monitor for frequent DOM changes that may impact performance');
    }
    
    return recommendations;
  }

  private measureLayoutShifts(slotId: string): number {
    // In a real implementation, this would use the Layout Instability API
    return Math.random() * 0.1; // Simulated value
  }

  private setupSlotObserver(slotId: string): void {
    // This would set up mutation observers for real-time slot monitoring
    const observer = new MutationObserver((mutations) => {
      // Handle slot content changes
      this.updateSlotOptimization(slotId);
    });
    
    this.observers.set(slotId, observer);
  }

  private setupPerformanceMonitoring(): void {
    // Set up performance monitoring for slot operations
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const slotId = (entry as any).detail?.slotId;
          if (slotId) {
            const entries = this.performanceEntries.get(slotId) || [];
            entries.push(entry);
            this.performanceEntries.set(slotId, entries);
          }
        }
      });
      
      observer.observe({ entryTypes: ['measure', 'navigation', 'paint'] });
    }
  }
}

// Create singleton instance
export const lightDomSlotSystem = new LightDomSlotSystem();