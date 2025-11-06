/**
 * DOM Rendering Engine Plugin System
 * 
 * Provides extensible plugin architecture for DOM rendering with support for:
 * - Runtime plugin loading and registration
 * - Plugin lifecycle hooks
 * - DOM manipulation extensions
 * - Component rendering plugins
 * - Event system integration
 */

export interface PluginManifest {
  name: string;
  version: string;
  description: string;
  author?: string;
  main: string;
  hooks?: string[];
  dependencies?: Record<string, string>;
  permissions?: string[];
}

export interface PluginContext {
  domRenderer: DOMRenderingEngine;
  eventBus: EventBus;
  componentRegistry: ComponentRegistry;
  logger: Logger;
}

export interface Plugin {
  manifest: PluginManifest;
  onLoad?: (context: PluginContext) => Promise<void>;
  onUnload?: (context: PluginContext) => Promise<void>;
  onRender?: (element: HTMLElement, context: PluginContext) => HTMLElement;
  onUpdate?: (element: HTMLElement, context: PluginContext) => void;
  hooks?: Record<string, (data: unknown) => unknown>;
}

export interface EventBus {
  on(event: string, handler: (...args: unknown[]) => void): void;
  emit(event: string, ...args: unknown[]): void;
  off(event: string, handler: (...args: unknown[]) => void): void;
}

export interface ComponentRegistry {
  register(name: string, component: unknown): void;
  get(name: string): unknown;
  has(name: string): boolean;
}

export interface Logger {
  log(...args: unknown[]): void;
  warn(...args: unknown[]): void;
  error(...args: unknown[]): void;
}

export interface DOMRenderingEngine {
  render(element: unknown, container: HTMLElement): void;
  update(element: unknown): void;
  unmount(container: HTMLElement): void;
}

export class PluginManager {
  private plugins: Map<string, Plugin>;
  private loadedPlugins: Set<string>;
  private context: PluginContext;
  private hooks: Map<string, Array<(data: unknown) => unknown>>;

  constructor(context: PluginContext) {
    this.plugins = new Map();
    this.loadedPlugins = new Set();
    this.context = context;
    this.hooks = new Map();
  }

  /**
   * Register a plugin
   */
  async registerPlugin(plugin: Plugin): Promise<void> {
    if (this.plugins.has(plugin.manifest.name)) {
      throw new Error(`Plugin ${plugin.manifest.name} is already registered`);
    }

    // Validate manifest
    this.validateManifest(plugin.manifest);

    // Register plugin
    this.plugins.set(plugin.manifest.name, plugin);

    // Register hooks
    if (plugin.hooks) {
      Object.entries(plugin.hooks).forEach(([hookName, handler]) => {
        this.registerHook(hookName, handler);
      });
    }

    this.context.logger.log(`✅ Plugin registered: ${plugin.manifest.name} v${plugin.manifest.version}`);
  }

  /**
   * Load a plugin
   */
  async loadPlugin(name: string): Promise<void> {
    const plugin = this.plugins.get(name);
    if (!plugin) {
      throw new Error(`Plugin ${name} not found`);
    }

    if (this.loadedPlugins.has(name)) {
      this.context.logger.warn(`Plugin ${name} is already loaded`);
      return;
    }

    // Check dependencies
    await this.checkDependencies(plugin);

    // Run onLoad hook
    if (plugin.onLoad) {
      await plugin.onLoad(this.context);
    }

    this.loadedPlugins.add(name);
    this.context.eventBus.emit('plugin:loaded', { name, version: plugin.manifest.version });
    this.context.logger.log(`✅ Plugin loaded: ${name}`);
  }

  /**
   * Unload a plugin
   */
  async unloadPlugin(name: string): Promise<void> {
    const plugin = this.plugins.get(name);
    if (!plugin) {
      throw new Error(`Plugin ${name} not found`);
    }

    if (!this.loadedPlugins.has(name)) {
      this.context.logger.warn(`Plugin ${name} is not loaded`);
      return;
    }

    // Run onUnload hook
    if (plugin.onUnload) {
      await plugin.onUnload(this.context);
    }

    this.loadedPlugins.delete(name);
    this.context.eventBus.emit('plugin:unloaded', { name });
    this.context.logger.log(`✅ Plugin unloaded: ${name}`);
  }

  /**
   * Load plugin from file
   */
  async loadPluginFromFile(filepath: string): Promise<void> {
    try {
      // Dynamic import of plugin
      const pluginModule = await import(filepath);
      const plugin = pluginModule.default as Plugin;

      await this.registerPlugin(plugin);
      await this.loadPlugin(plugin.manifest.name);
    } catch (error) {
      this.context.logger.error(`Failed to load plugin from ${filepath}:`, error);
      throw error;
    }
  }

  /**
   * Execute render hook on all loaded plugins
   */
  executeRenderHook(element: HTMLElement): HTMLElement {
    let result = element;

    this.loadedPlugins.forEach((name) => {
      const plugin = this.plugins.get(name);
      if (plugin?.onRender) {
        result = plugin.onRender(result, this.context);
      }
    });

    return result;
  }

  /**
   * Execute update hook on all loaded plugins
   */
  executeUpdateHook(element: HTMLElement): void {
    this.loadedPlugins.forEach((name) => {
      const plugin = this.plugins.get(name);
      if (plugin?.onUpdate) {
        plugin.onUpdate(element, this.context);
      }
    });
  }

  /**
   * Execute custom hook
   */
  executeHook(hookName: string, data: unknown): unknown {
    const handlers = this.hooks.get(hookName);
    if (!handlers || handlers.length === 0) {
      return data;
    }

    let result = data;
    handlers.forEach((handler) => {
      result = handler(result);
    });

    return result;
  }

  /**
   * Get all loaded plugins
   */
  getLoadedPlugins(): Plugin[] {
    return Array.from(this.loadedPlugins)
      .map((name) => this.plugins.get(name))
      .filter((p): p is Plugin => p !== undefined);
  }

  /**
   * Get plugin info
   */
  getPluginInfo(name: string): PluginManifest | undefined {
    return this.plugins.get(name)?.manifest;
  }

  /**
   * Check if plugin is loaded
   */
  isPluginLoaded(name: string): boolean {
    return this.loadedPlugins.has(name);
  }

  // Private methods

  private validateManifest(manifest: PluginManifest): void {
    if (!manifest.name || !manifest.version || !manifest.main) {
      throw new Error('Invalid plugin manifest: missing required fields (name, version, main)');
    }

    // Validate version format (semver)
    const versionRegex = /^\d+\.\d+\.\d+$/;
    if (!versionRegex.test(manifest.version)) {
      throw new Error(`Invalid version format: ${manifest.version}`);
    }
  }

  private async checkDependencies(plugin: Plugin): Promise<void> {
    if (!plugin.manifest.dependencies) {
      return;
    }

    const missingDeps: string[] = [];

    Object.keys(plugin.manifest.dependencies).forEach((depName) => {
      if (!this.loadedPlugins.has(depName)) {
        missingDeps.push(depName);
      }
    });

    if (missingDeps.length > 0) {
      throw new Error(
        `Plugin ${plugin.manifest.name} has missing dependencies: ${missingDeps.join(', ')}`
      );
    }
  }

  private registerHook(name: string, handler: (data: unknown) => unknown): void {
    if (!this.hooks.has(name)) {
      this.hooks.set(name, []);
    }

    this.hooks.get(name)!.push(handler);
  }
}

/**
 * Extension API for plugins to use
 */
export class ExtensionAPI {
  private pluginManager: PluginManager;
  private context: PluginContext;

  constructor(pluginManager: PluginManager, context: PluginContext) {
    this.pluginManager = pluginManager;
    this.context = context;
  }

  /**
   * Register a component
   */
  registerComponent(name: string, component: unknown): void {
    this.context.componentRegistry.register(name, component);
    this.context.eventBus.emit('component:registered', { name });
  }

  /**
   * Get a component
   */
  getComponent(name: string): unknown {
    return this.context.componentRegistry.get(name);
  }

  /**
   * Subscribe to DOM events
   */
  on(event: string, handler: (...args: unknown[]) => void): void {
    this.context.eventBus.on(event, handler);
  }

  /**
   * Emit DOM event
   */
  emit(event: string, ...args: unknown[]): void {
    this.context.eventBus.emit(event, ...args);
  }

  /**
   * Log message
   */
  log(...args: unknown[]): void {
    this.context.logger.log(...args);
  }

  /**
   * Execute hook
   */
  executeHook(hookName: string, data: unknown): unknown {
    return this.pluginManager.executeHook(hookName, data);
  }

  /**
   * Render element with plugins
   */
  renderWithPlugins(element: HTMLElement): HTMLElement {
    return this.pluginManager.executeRenderHook(element);
  }
}

/**
 * Simple EventBus implementation
 */
export class SimpleEventBus implements EventBus {
  private handlers: Map<string, Array<(...args: unknown[]) => void>>;

  constructor() {
    this.handlers = new Map();
  }

  on(event: string, handler: (...args: unknown[]) => void): void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, []);
    }
    this.handlers.get(event)!.push(handler);
  }

  emit(event: string, ...args: unknown[]): void {
    const eventHandlers = this.handlers.get(event);
    if (eventHandlers) {
      eventHandlers.forEach((handler) => handler(...args));
    }
  }

  off(event: string, handler: (...args: unknown[]) => void): void {
    const eventHandlers = this.handlers.get(event);
    if (eventHandlers) {
      const index = eventHandlers.indexOf(handler);
      if (index !== -1) {
        eventHandlers.splice(index, 1);
      }
    }
  }
}

/**
 * Simple ComponentRegistry implementation
 */
export class SimpleComponentRegistry implements ComponentRegistry {
  private components: Map<string, unknown>;

  constructor() {
    this.components = new Map();
  }

  register(name: string, component: unknown): void {
    this.components.set(name, component);
  }

  get(name: string): unknown {
    return this.components.get(name);
  }

  has(name: string): boolean {
    return this.components.has(name);
  }
}

/**
 * Simple Logger implementation
 */
export class SimpleLogger implements Logger {
  log(...args: unknown[]): void {
    console.log('[Plugin]', ...args);
  }

  warn(...args: unknown[]): void {
    console.warn('[Plugin]', ...args);
  }

  error(...args: unknown[]): void {
    console.error('[Plugin]', ...args);
  }
}
