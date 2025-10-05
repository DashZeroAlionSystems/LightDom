/**
 * Light DOM Web Components
 * Custom elements that implement Light DOM slots for optimization
 */

import { lightDomSlotSystem } from '../core/LightDomSlotSystem';
import { slotAwareSpaceOptimizer } from '../core/SlotAwareSpaceOptimizer';

/**
 * Base Light DOM Component
 * Foundation class for all Light DOM custom elements
 */
export abstract class LightDomComponent extends HTMLElement {
  protected slotId: string;
  protected optimizationLevel: 'conservative' | 'moderate' | 'aggressive';
  protected initialized = false;
  private mutationObserver?: MutationObserver;
  private resizeObserver?: ResizeObserver;

  constructor() {
    super();
    this.slotId = this.getAttribute('slot-id') || this.generateSlotId();
    this.optimizationLevel = (this.getAttribute('optimization-level') as any) || 'moderate';
  }

  connectedCallback() {
    if (!this.initialized) {
      this.initialize();
      this.setupOptimization();
      this.setupMonitoring();
      this.initialized = true;
    }
  }

  disconnectedCallback() {
    this.cleanup();
  }

  protected abstract initialize(): void;

  private generateSlotId(): string {
    return `lightdom-${this.tagName.toLowerCase()}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private setupOptimization(): void {
    // Register this component as a slot
    lightDomSlotSystem.registerSlot({
      id: this.slotId,
      name: `${this.tagName} Component`,
      type: 'dynamic',
      optimizationLevel: this.optimizationLevel,
      allowedElements: ['*'],
      priority: this.getAttribute('priority') as any || 'medium',
    });

    // Project existing content into the slot
    this.projectContentToSlot();
  }

  private projectContentToSlot(): void {
    Array.from(this.children).forEach(child => {
      if (child instanceof HTMLElement) {
        lightDomSlotSystem.projectContent(this.slotId, child);
      }
    });
  }

  private setupMonitoring(): void {
    // Monitor for DOM changes
    this.mutationObserver = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach(node => {
            if (node instanceof HTMLElement) {
              lightDomSlotSystem.projectContent(this.slotId, node);
            }
          });
        }
      });
    });

    this.mutationObserver.observe(this, {
      childList: true,
      subtree: true,
    });

    // Monitor for size changes
    if ('ResizeObserver' in window) {
      this.resizeObserver = new ResizeObserver(() => {
        this.handleResize();
      });
      this.resizeObserver.observe(this);
    }
  }

  private handleResize(): void {
    // Trigger re-optimization on resize
    lightDomSlotSystem.optimizeSlot(this.slotId);
  }

  private cleanup(): void {
    this.mutationObserver?.disconnect();
    this.resizeObserver?.disconnect();
  }

  /**
   * Optimize this component's slot
   */
  async optimize(): Promise<void> {
    await lightDomSlotSystem.optimizeSlot(this.slotId);
  }

  /**
   * Get optimization metrics for this component
   */
  getOptimizationMetrics() {
    return lightDomSlotSystem.getSlotOptimization(this.slotId);
  }
}

/**
 * Light DOM Header Component
 * Optimized header with slot-based content management
 */
export class LightDomHeader extends LightDomComponent {
  protected initialize(): void {
    this.className = `lightdom-header ${this.className}`.trim();
    this.setAttribute('role', 'banner');
    
    // Add default styles if not present
    if (!this.style.cssText) {
      this.style.display = 'block';
      this.style.position = 'relative';
    }

    this.createSlotElements();
  }

  private createSlotElements(): void {
    // Create navigation slot
    const navSlot = document.createElement('div');
    navSlot.setAttribute('data-slot', 'navigation');
    navSlot.className = 'lightdom-nav-slot';
    
    // Create branding slot
    const brandSlot = document.createElement('div');
    brandSlot.setAttribute('data-slot', 'branding');
    brandSlot.className = 'lightdom-brand-slot';

    // Create actions slot
    const actionsSlot = document.createElement('div');
    actionsSlot.setAttribute('data-slot', 'actions');
    actionsSlot.className = 'lightdom-actions-slot';

    // Move existing content to appropriate slots
    this.distributeContent(navSlot, brandSlot, actionsSlot);

    // Clear and rebuild structure
    this.innerHTML = '';
    this.appendChild(brandSlot);
    this.appendChild(navSlot);
    this.appendChild(actionsSlot);
  }

  private distributeContent(navSlot: HTMLElement, brandSlot: HTMLElement, actionsSlot: HTMLElement): void {
    Array.from(this.children).forEach(child => {
      if (child.tagName === 'NAV' || child.classList.contains('nav')) {
        navSlot.appendChild(child.cloneNode(true));
      } else if (child.classList.contains('brand') || child.classList.contains('logo')) {
        brandSlot.appendChild(child.cloneNode(true));
      } else if (child.classList.contains('actions') || child.tagName === 'BUTTON') {
        actionsSlot.appendChild(child.cloneNode(true));
      } else {
        navSlot.appendChild(child.cloneNode(true)); // Default to nav slot
      }
    });
  }
}

/**
 * Light DOM Content Component
 * Optimized main content area with advanced slot management
 */
export class LightDomContent extends LightDomComponent {
  protected initialize(): void {
    this.className = `lightdom-content ${this.className}`.trim();
    this.setAttribute('role', 'main');
    
    this.createContentSlots();
  }

  private createContentSlots(): void {
    // Create primary content slot
    const primarySlot = document.createElement('div');
    primarySlot.setAttribute('data-slot', 'primary');
    primarySlot.className = 'lightdom-primary-slot';

    // Create secondary content slot
    const secondarySlot = document.createElement('div');
    secondarySlot.setAttribute('data-slot', 'secondary');
    secondarySlot.className = 'lightdom-secondary-slot';

    // Distribute content based on importance
    this.distributeContentByImportance(primarySlot, secondarySlot);

    this.innerHTML = '';
    this.appendChild(primarySlot);
    this.appendChild(secondarySlot);
  }

  private distributeContentByImportance(primarySlot: HTMLElement, secondarySlot: HTMLElement): void {
    Array.from(this.children).forEach(child => {
      const importance = this.calculateContentImportance(child);
      if (importance > 0.7) {
        primarySlot.appendChild(child.cloneNode(true));
      } else {
        secondarySlot.appendChild(child.cloneNode(true));
      }
    });
  }

  private calculateContentImportance(element: Element): number {
    let importance = 0.5; // Base importance

    // Header elements are important
    if (['H1', 'H2', 'H3'].includes(element.tagName)) {
      importance += 0.3;
    }

    // Elements with important classes
    if (element.classList.contains('important') || element.classList.contains('primary')) {
      importance += 0.3;
    }

    // Elements above the fold (approximate)
    const rect = element.getBoundingClientRect();
    if (rect.top < window.innerHeight) {
      importance += 0.2;
    }

    return Math.min(importance, 1.0);
  }
}

/**
 * Light DOM Widget Component
 * Highly optimized widget container with lazy loading
 */
export class LightDomWidget extends LightDomComponent {
  private isVisible = false;
  private intersectionObserver?: IntersectionObserver;

  protected initialize(): void {
    this.className = `lightdom-widget ${this.className}`.trim();
    this.setupLazyLoading();
  }

  private setupLazyLoading(): void {
    if ('IntersectionObserver' in window) {
      this.intersectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !this.isVisible) {
            this.loadWidget();
            this.isVisible = true;
          }
        });
      }, {
        threshold: 0.1,
        rootMargin: '100px'
      });

      this.intersectionObserver.observe(this);
    } else {
      // Fallback for browsers without IntersectionObserver
      this.loadWidget();
    }
  }

  private loadWidget(): void {
    // Add loaded class for styling
    this.classList.add('lightdom-widget-loaded');

    // Trigger optimization after load
    setTimeout(() => {
      this.optimize();
    }, 100);

    // Disconnect observer after loading
    this.intersectionObserver?.disconnect();
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.intersectionObserver?.disconnect();
  }
}

/**
 * Light DOM Optimized List Component
 * Virtualized list with slot-based item optimization
 */
export class LightDomOptimizedList extends LightDomComponent {
  private itemHeight = 50;
  private visibleItems = 10;
  private scrollContainer?: HTMLElement;

  protected initialize(): void {
    this.className = `lightdom-optimized-list ${this.className}`.trim();
    this.setupVirtualization();
  }

  private setupVirtualization(): void {
    this.itemHeight = parseInt(this.getAttribute('item-height') || '50');
    this.visibleItems = parseInt(this.getAttribute('visible-items') || '10');

    this.createVirtualizedStructure();
  }

  private createVirtualizedStructure(): void {
    // Create scroll container
    this.scrollContainer = document.createElement('div');
    this.scrollContainer.className = 'lightdom-list-container';
    this.scrollContainer.style.cssText = `
      height: ${this.itemHeight * this.visibleItems}px;
      overflow-y: auto;
      position: relative;
    `;

    // Create viewport
    const viewport = document.createElement('div');
    viewport.className = 'lightdom-list-viewport';
    viewport.style.cssText = `
      height: ${this.itemHeight * this.children.length}px;
      position: relative;
    `;

    // Create visible items container
    const itemsContainer = document.createElement('div');
    itemsContainer.className = 'lightdom-list-items';
    itemsContainer.style.position = 'absolute';

    this.scrollContainer.appendChild(viewport);
    viewport.appendChild(itemsContainer);

    // Setup scroll handling
    this.scrollContainer.addEventListener('scroll', () => {
      this.updateVisibleItems();
    });

    // Move content to virtualized structure
    const items = Array.from(this.children);
    this.innerHTML = '';
    this.appendChild(this.scrollContainer);

    // Store items for virtualization
    this.setAttribute('data-total-items', items.length.toString());
    items.forEach((item, index) => {
      item.setAttribute('data-item-index', index.toString());
    });

    this.updateVisibleItems();
  }

  private updateVisibleItems(): void {
    if (!this.scrollContainer) return;

    const scrollTop = this.scrollContainer.scrollTop;
    const startIndex = Math.floor(scrollTop / this.itemHeight);
    const endIndex = Math.min(startIndex + this.visibleItems + 1, this.children.length);

    // This is a simplified implementation
    // In a real implementation, you'd manage the visible items more efficiently
  }
}

// Register all custom elements
export function registerLightDomComponents(): void {
  if (!customElements.get('lightdom-header')) {
    customElements.define('lightdom-header', LightDomHeader);
  }
  
  if (!customElements.get('lightdom-content')) {
    customElements.define('lightdom-content', LightDomContent);
  }
  
  if (!customElements.get('lightdom-widget')) {
    customElements.define('lightdom-widget', LightDomWidget);
  }
  
  if (!customElements.get('lightdom-optimized-list')) {
    customElements.define('lightdom-optimized-list', LightDomOptimizedList);
  }

  console.log('✅ Light DOM Web Components registered');
}

// Auto-register components when module loads
registerLightDomComponents();

// Export for manual registration if needed
export { registerLightDomComponents as register };