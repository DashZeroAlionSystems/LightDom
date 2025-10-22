/**
 * LightDomEncapsulation - Shadow DOM-like encapsulation for Light DOM elements
 * Provides isolation, scoping, and optimization for metaverse components
 */

export interface LightDomSlot {
  id: string;
  name: string;
  element: HTMLElement;
  content: Node[];
  isolated: boolean;
  optimizationLevel: 'conservative' | 'moderate' | 'aggressive';
  metadata: {
    createdAt: number;
    lastModified: number;
    spaceSaved: number;
    renderTime: number;
  };
}

export interface LightDomRoot {
  id: string;
  host: HTMLElement;
  slots: Map<string, LightDomSlot>;
  styles: Map<string, CSSStyleSheet>;
  isolated: boolean;
}

export class LightDomEncapsulation {
  private roots: Map<string, LightDomRoot> = new Map();
  private slotCounter: number = 0;
  private observer: MutationObserver | null = null;

  constructor() {
    this.initializeMutationObserver();
  }

  /**
   * Create a new Light DOM root with encapsulation
   */
  createRoot(hostElement: HTMLElement, isolated: boolean = true): LightDomRoot {
    const rootId = `lightdom-root-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const root: LightDomRoot = {
      id: rootId,
      host: hostElement,
      slots: new Map(),
      styles: new Map(),
      isolated
    };

    // Mark host element
    hostElement.setAttribute('data-lightdom-root', rootId);
    
    // Apply isolation styles
    if (isolated) {
      this.applyIsolationStyles(hostElement);
    }

    this.roots.set(rootId, root);
    
    console.log(`✅ LightDOM root created: ${rootId}`);
    return root;
  }

  /**
   * Create a slot within a Light DOM root
   */
  createSlot(
    root: LightDomRoot,
    name: string,
    optimizationLevel: 'conservative' | 'moderate' | 'aggressive' = 'moderate'
  ): LightDomSlot {
    const slotId = `lightdom-slot-${this.slotCounter++}`;
    
    // Create slot element
    const slotElement = document.createElement('div');
    slotElement.setAttribute('data-lightdom-slot', name);
    slotElement.setAttribute('data-slot-id', slotId);
    slotElement.className = 'lightdom-slot';

    const slot: LightDomSlot = {
      id: slotId,
      name,
      element: slotElement,
      content: [],
      isolated: root.isolated,
      optimizationLevel,
      metadata: {
        createdAt: Date.now(),
        lastModified: Date.now(),
        spaceSaved: 0,
        renderTime: 0
      }
    };

    root.slots.set(slotId, slot);
    root.host.appendChild(slotElement);

    console.log(`📦 LightDOM slot created: ${name} (${slotId})`);
    return slot;
  }

  /**
   * Assign content to a slot with optimization
   */
  assignContent(slot: LightDomSlot, content: Node[]): void {
    const startTime = performance.now();
    
    // Clear existing content
    slot.element.innerHTML = '';
    slot.content = [];

    // Optimize and add content based on optimization level
    const optimizedContent = this.optimizeContent(content, slot.optimizationLevel);
    
    optimizedContent.forEach(node => {
      slot.element.appendChild(node.cloneNode(true));
      slot.content.push(node);
    });

    // Update metadata
    const renderTime = performance.now() - startTime;
    slot.metadata.lastModified = Date.now();
    slot.metadata.renderTime = renderTime;
    
    console.log(`⚡ Content assigned to slot ${slot.name}: ${renderTime.toFixed(2)}ms`);
  }

  /**
   * Optimize content based on optimization level
   */
  private optimizeContent(
    content: Node[],
    level: 'conservative' | 'moderate' | 'aggressive'
  ): Node[] {
    let optimized = [...content];

    switch (level) {
      case 'conservative':
        // Remove comments only
        optimized = this.removeComments(optimized);
        break;
      
      case 'moderate':
        // Remove comments and whitespace
        optimized = this.removeComments(optimized);
        optimized = this.removeExcessWhitespace(optimized);
        break;
      
      case 'aggressive':
        // Remove comments, whitespace, and inline styles
        optimized = this.removeComments(optimized);
        optimized = this.removeExcessWhitespace(optimized);
        optimized = this.optimizeStyles(optimized);
        break;
    }

    return optimized;
  }

  /**
   * Remove comment nodes
   */
  private removeComments(nodes: Node[]): Node[] {
    return nodes.filter(node => {
      if (node.nodeType === Node.COMMENT_NODE) {
        return false;
      }
      // Recursively remove comments from child nodes
      if (node.childNodes.length > 0) {
        const childArray = Array.from(node.childNodes);
        const filtered = this.removeComments(childArray);
        // Clear and re-add filtered children
        while (node.firstChild) {
          node.removeChild(node.firstChild);
        }
        filtered.forEach(child => node.appendChild(child));
      }
      return true;
    });
  }

  /**
   * Remove excess whitespace
   */
  private removeExcessWhitespace(nodes: Node[]): Node[] {
    return nodes.map(node => {
      if (node.nodeType === Node.TEXT_NODE && node.textContent) {
        // Collapse multiple spaces
        node.textContent = node.textContent.replace(/\s+/g, ' ').trim();
      }
      return node;
    }).filter(node => {
      // Remove empty text nodes
      return !(node.nodeType === Node.TEXT_NODE && !node.textContent?.trim());
    });
  }

  /**
   * Optimize inline styles
   */
  private optimizeStyles(nodes: Node[]): Node[] {
    return nodes.map(node => {
      if (node instanceof HTMLElement && node.hasAttribute('style')) {
        const style = node.getAttribute('style') || '';
        // Remove redundant whitespace in style
        const optimized = style.replace(/\s+/g, ' ').trim();
        node.setAttribute('style', optimized);
      }
      return node;
    });
  }

  /**
   * Apply isolation styles to prevent style leakage
   */
  private applyIsolationStyles(element: HTMLElement): void {
    element.style.isolation = 'isolate';
    element.style.contain = 'layout style paint';
  }

  /**
   * Get slot by ID
   */
  getSlot(root: LightDomRoot, slotId: string): LightDomSlot | undefined {
    return root.slots.get(slotId);
  }

  /**
   * Get root by ID
   */
  getRoot(rootId: string): LightDomRoot | undefined {
    return this.roots.get(rootId);
  }

  /**
   * Initialize mutation observer for tracking DOM changes
   */
  private initializeMutationObserver(): void {
    this.observer = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        const target = mutation.target as HTMLElement;
        const rootId = target.getAttribute('data-lightdom-root');
        
        if (rootId) {
          const root = this.roots.get(rootId);
          if (root) {
            console.log(`🔄 LightDOM root mutated: ${rootId}`);
          }
        }
      });
    });
  }

  /**
   * Start observing a root for changes
   */
  observeRoot(root: LightDomRoot): void {
    if (this.observer) {
      this.observer.observe(root.host, {
        childList: true,
        subtree: true,
        attributes: true
      });
      console.log(`👁️ Observing LightDOM root: ${root.id}`);
    }
  }

  /**
   * Stop observing all roots
   */
  disconnect(): void {
    if (this.observer) {
      this.observer.disconnect();
      console.log(`⏹️ LightDOM observer disconnected`);
    }
  }

  /**
   * Get optimization statistics for a root
   */
  getStats(root: LightDomRoot): {
    totalSlots: number;
    totalSpaceSaved: number;
    avgRenderTime: number;
    isolated: boolean;
  } {
    const slots = Array.from(root.slots.values());
    
    return {
      totalSlots: slots.length,
      totalSpaceSaved: slots.reduce((sum, slot) => sum + slot.metadata.spaceSaved, 0),
      avgRenderTime: slots.reduce((sum, slot) => sum + slot.metadata.renderTime, 0) / slots.length || 0,
      isolated: root.isolated
    };
  }

  /**
   * Export root as serialized data for metaverse bridges
   */
  exportRoot(root: LightDomRoot): string {
    const data = {
      id: root.id,
      isolated: root.isolated,
      slots: Array.from(root.slots.entries()).map(([id, slot]) => ({
        id,
        name: slot.name,
        optimizationLevel: slot.optimizationLevel,
        metadata: slot.metadata,
        contentHTML: slot.element.innerHTML
      })),
      stats: this.getStats(root)
    };

    return JSON.stringify(data, null, 2);
  }

  /**
   * Import root from serialized data
   */
  importRoot(hostElement: HTMLElement, serializedData: string): LightDomRoot {
    const data = JSON.parse(serializedData);
    const root = this.createRoot(hostElement, data.isolated);

    data.slots.forEach((slotData: any) => {
      const slot = this.createSlot(root, slotData.name, slotData.optimizationLevel);
      slot.element.innerHTML = slotData.contentHTML;
      slot.metadata = slotData.metadata;
    });

    return root;
  }
}

// Export singleton instance
export const lightDomEncapsulation = new LightDomEncapsulation();
