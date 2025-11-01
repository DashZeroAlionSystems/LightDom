/**
 * Dev Container Manager
 * Provides independent development container with code/preview split view
 * Supports hot-reload, schema validation, and modular component building
 */

import { EventEmitter } from 'events';
import express, { Express, Request, Response } from 'express';
import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import puppeteer, { Browser, Page } from 'puppeteer';
import chokidar, { FSWatcher } from 'chokidar';
import path from 'path';
import fs from 'fs';
import { Logger } from '../utils/Logger';
import SchemaComponentMapper from '../schema/SchemaComponentMapper';

export interface DevContainerConfig {
  port: number;
  previewPort: number;
  codeDir: string;
  buildDir: string;
  enableHotReload: boolean;
  enableSchemaValidation: boolean;
  schemaDir?: string;
  layout: 'horizontal' | 'vertical';
}

export interface ViewState {
  left: 'code' | 'preview' | 'schema';
  right: 'code' | 'preview' | 'schema';
  layout: 'horizontal' | 'vertical';
  syncScroll: boolean;
}

export class DevContainerManager extends EventEmitter {
  private config: DevContainerConfig;
  private app: Express;
  private server: HTTPServer | null = null;
  private io: SocketIOServer | null = null;
  private browser: Browser | null = null;
  private previewPage: Page | null = null;
  private fileWatcher: FSWatcher | null = null;
  private schemaMapper: SchemaComponentMapper | null = null;
  private logger: Logger;
  private viewState: ViewState;
  private isRunning = false;

  constructor(config: Partial<DevContainerConfig> = {}) {
    super();

    this.config = {
      port: config.port || 3100,
      previewPort: config.previewPort || 3101,
      codeDir: config.codeDir || path.join(process.cwd(), 'src'),
      buildDir: config.buildDir || path.join(process.cwd(), 'dist'),
      enableHotReload: config.enableHotReload !== false,
      enableSchemaValidation: config.enableSchemaValidation !== false,
      schemaDir: config.schemaDir,
      layout: config.layout || 'horizontal',
    };

    this.app = express();
    this.logger = new Logger('DevContainerManager');

    this.viewState = {
      left: 'code',
      right: 'preview',
      layout: this.config.layout,
      syncScroll: false,
    };
  }

  /**
   * Initialize the dev container
   */
  async initialize(): Promise<void> {
    this.logger.info('Initializing Dev Container...', {
      port: this.config.port,
      previewPort: this.config.previewPort,
    });

    // Setup Express app
    this.setupExpress();

    // Initialize headless browser
    await this.initializeBrowser();

    // Initialize schema mapper if enabled
    if (this.config.enableSchemaValidation) {
      this.schemaMapper = new SchemaComponentMapper(this.config.schemaDir);
      await this.schemaMapper.initialize();
    }

    // Setup file watcher for hot reload
    if (this.config.enableHotReload) {
      this.setupFileWatcher();
    }

    this.logger.info('Dev Container initialized');
  }

  /**
   * Setup Express application and routes
   */
  private setupExpress(): void {
    // Middleware
    this.app.use(express.json());
    this.app.use(express.static(path.join(__dirname, '../../dev-container/public')));

    // API Routes
    this.app.get('/api/status', (req, res) => this.handleStatus(req, res));
    this.app.get('/api/view-state', (req, res) => this.handleGetViewState(req, res));
    this.app.post('/api/view-state', (req, res) => this.handleSetViewState(req, res));
    this.app.post('/api/execute', (req, res) => this.handleExecute(req, res));
    this.app.post('/api/validate', (req, res) => this.handleValidate(req, res));
    this.app.get('/api/schemas', (req, res) => this.handleGetSchemas(req, res));
    this.app.post('/api/select-component', (req, res) => this.handleSelectComponent(req, res));
    this.app.get('/api/files', (req, res) => this.handleGetFiles(req, res));
    this.app.get('/api/file/:filepath(*)', (req, res) => this.handleGetFile(req, res));
    this.app.post('/api/file/:filepath(*)', (req, res) => this.handleSaveFile(req, res));

    // Health check
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        services: {
          browser: this.browser !== null,
          fileWatcher: this.fileWatcher !== null,
          schemaMapper: this.schemaMapper !== null,
        },
      });
    });
  }

  /**
   * Initialize headless browser for preview
   */
  private async initializeBrowser(): Promise<void> {
    this.logger.info('Initializing headless browser...');

    this.browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
      ],
      defaultViewport: {
        width: 1920,
        height: 1080,
      },
    });

    this.previewPage = await this.browser.newPage();

    // Setup console logging
    this.previewPage.on('console', (msg) => {
      this.emit('browserConsole', { type: msg.type(), text: msg.text() });
    });

    // Setup error logging
    this.previewPage.on('pageerror', (error) => {
      this.emit('browserError', error);
    });

    this.logger.info('Headless browser initialized');
  }

  /**
   * Setup file watcher for hot reload
   */
  private setupFileWatcher(): void {
    this.logger.info('Setting up file watcher...', { dir: this.config.codeDir });

    this.fileWatcher = chokidar.watch(this.config.codeDir, {
      ignored: /(^|[\/\\])\../, // ignore dotfiles
      persistent: true,
      ignoreInitial: true,
    });

    this.fileWatcher.on('change', (filepath) => {
      this.handleFileChange(filepath);
    });

    this.logger.info('File watcher setup complete');
  }

  /**
   * Handle file change for hot reload
   */
  private async handleFileChange(filepath: string): Promise<void> {
    try {
      // Read file content
      const content = fs.readFileSync(filepath, 'utf-8');

      // Emit file change event
      this.emit('fileChanged', { filepath, content });

      // Send to connected clients via WebSocket
      if (this.io) {
        this.io.emit('fileChanged', {
          filepath: path.relative(this.config.codeDir, filepath),
          content,
          timestamp: Date.now(),
        });
      }

      // Trigger hot reload if preview is showing
      if (this.viewState.left === 'preview' || this.viewState.right === 'preview') {
        await this.hotReload(content, filepath);
      }
    } catch (error) {
      this.logger.error('Failed to handle file change', { filepath, error });
    }
  }

  /**
   * Perform hot reload
   */
  private async hotReload(code: string, filepath: string): Promise<void> {
    try {
      // Validate code if schema validation is enabled
      if (this.config.enableSchemaValidation) {
        const validation = this.validateCode(code);
        
        if (!validation.valid) {
          this.emit('validationError', { filepath, errors: validation.errors });
          return;
        }
      }

      // Reload preview page
      if (this.previewPage) {
        await this.previewPage.reload({ waitUntil: 'networkidle2' });
        this.emit('hotReloadComplete', { filepath });
      }
    } catch (error) {
      this.emit('hotReloadError', { filepath, error });
    }
  }

  /**
   * Validate code
   */
  private validateCode(code: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    try {
      // Basic syntax checks
      const openBraces = (code.match(/{/g) || []).length;
      const closeBraces = (code.match(/}/g) || []).length;
      
      if (openBraces !== closeBraces) {
        errors.push('Unbalanced braces');
      }
    } catch (error) {
      errors.push(`Validation error: ${error}`);
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * Start the dev container
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      return;
    }

    this.logger.info('Starting Dev Container...');

    this.server = this.app.listen(this.config.port, () => {
      this.logger.info(`Dev Container listening on port ${this.config.port}`);
    });

    this.io = new SocketIOServer(this.server, {
      cors: { origin: '*', methods: ['GET', 'POST'] },
    });

    this.setupSocketIO();
    this.isRunning = true;
    this.emit('started');
  }

  /**
   * Setup Socket.IO event handlers
   */
  private setupSocketIO(): void {
    if (!this.io) return;

    this.io.on('connection', (socket) => {
      this.logger.info('Client connected', { id: socket.id });

      socket.on('switchView', (data) => {
        this.viewState = { ...this.viewState, ...data };
        this.io?.emit('viewStateChanged', this.viewState);
      });

      socket.on('executeCode', async (data) => {
        try {
          const result = await this.executeCode(data.code);
          socket.emit('executionResult', { success: true, result });
        } catch (error) {
          socket.emit('executionResult', { success: false, error: String(error) });
        }
      });

      socket.on('disconnect', () => {
        this.logger.info('Client disconnected', { id: socket.id });
      });
    });
  }

  /**
   * Execute code in preview browser
   */
  private async executeCode(code: string): Promise<any> {
    if (!this.previewPage) {
      throw new Error('Preview page not initialized');
    }

    return await this.previewPage.evaluate(code);
  }

  /**
   * API Handlers
   */
  private handleStatus(req: Request, res: Response): void {
    res.json({
      running: this.isRunning,
      config: this.config,
      viewState: this.viewState,
    });
  }

  private handleGetViewState(req: Request, res: Response): void {
    res.json(this.viewState);
  }

  private handleSetViewState(req: Request, res: Response): void {
    this.viewState = { ...this.viewState, ...req.body };
    if (this.io) this.io.emit('viewStateChanged', this.viewState);
    res.json({ success: true, viewState: this.viewState });
  }

  private async handleExecute(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.executeCode(req.body.code);
      res.json({ success: true, result });
    } catch (error) {
      res.status(500).json({ success: false, error: String(error) });
    }
  }

  private handleValidate(req: Request, res: Response): void {
    try {
      const validation = this.validateCode(req.body.code);
      res.json({ success: true, validation });
    } catch (error) {
      res.status(500).json({ success: false, error: String(error) });
    }
  }

  private handleGetSchemas(req: Request, res: Response): void {
    if (!this.schemaMapper) {
      res.status(503).json({ success: false, error: 'Schema mapper not enabled' });
      return;
    }
    res.json({ success: true, schemas: this.schemaMapper.getAllSchemas() });
  }

  private async handleSelectComponent(req: Request, res: Response): Promise<void> {
    if (!this.schemaMapper) {
      res.status(503).json({ success: false, error: 'Schema mapper not enabled' });
      return;
    }
    try {
      const match = await this.schemaMapper.selectComponent(req.body.useCase, req.body.context);
      res.json({ success: true, match });
    } catch (error) {
      res.status(500).json({ success: false, error: String(error) });
    }
  }

  private handleGetFiles(req: Request, res: Response): void {
    try {
      const files = this.getFileTree(this.config.codeDir);
      res.json({ success: true, files });
    } catch (error) {
      res.status(500).json({ success: false, error: String(error) });
    }
  }

  private handleGetFile(req: Request, res: Response): void {
    try {
      const fullPath = path.join(this.config.codeDir, req.params.filepath);
      if (!fullPath.startsWith(this.config.codeDir)) {
        res.status(403).json({ success: false, error: 'Access denied' });
        return;
      }
      const content = fs.readFileSync(fullPath, 'utf-8');
      res.json({ success: true, content });
    } catch (error) {
      res.status(500).json({ success: false, error: String(error) });
    }
  }

  private handleSaveFile(req: Request, res: Response): void {
    try {
      const fullPath = path.join(this.config.codeDir, req.params.filepath);
      if (!fullPath.startsWith(this.config.codeDir)) {
        res.status(403).json({ success: false, error: 'Access denied' });
        return;
      }
      fs.writeFileSync(fullPath, req.body.content, 'utf-8');
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, error: String(error) });
    }
  }

  private getFileTree(dir: string, relativePath: string = ''): any[] {
    const items: any[] = [];
    try {
      const files = fs.readdirSync(dir);
      for (const file of files) {
        if (file.startsWith('.') || file === 'node_modules') continue;
        const fullPath = path.join(dir, file);
        const stats = fs.statSync(fullPath);
        const itemPath = path.join(relativePath, file);
        if (stats.isDirectory()) {
          items.push({
            name: file,
            path: itemPath,
            type: 'directory',
            children: this.getFileTree(fullPath, itemPath),
          });
        } else {
          items.push({
            name: file,
            path: itemPath,
            type: 'file',
            size: stats.size,
          });
        }
      }
    } catch (error) {
      this.logger.error('Failed to read directory', { dir, error });
    }
    return items;
  }

  /**
   * Stop the dev container
   */
  async stop(): Promise<void> {
    this.logger.info('Stopping Dev Container...');

    if (this.fileWatcher) {
      await this.fileWatcher.close();
      this.fileWatcher = null;
    }

    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.previewPage = null;
    }

    if (this.io) {
      this.io.close();
      this.io = null;
    }

    if (this.server) {
      await new Promise<void>((resolve) => {
        this.server!.close(() => resolve());
      });
      this.server = null;
    }

    this.isRunning = false;
    this.emit('stopped');
  }
}

export default DevContainerManager;
