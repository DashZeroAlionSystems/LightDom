/**
 * Paint Profiler - Tracks DOM painting events using Chrome DevTools Protocol
 * 
 * Captures:
 * - Paint timing per element
 * - Layer composition events  
 * - Paint snapshots for timeline playback
 * - Painted vs unpainted layer data
 */

import { Pool } from 'pg';
import puppeteer, { Browser, Page, CDPSession } from 'puppeteer';

export interface PaintEvent {
  timestamp: number;
  elementId: string;
  eventType: 'paint' | 'composite' | 'layout' | 'style';
  duration: number;
  rect: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  layerId?: string;
  paintOrder: number;
  compositeOrder?: number;
}

export interface PaintSnapshot {
  id: string;
  timestamp: number;
  url: string;
  events: PaintEvent[];
  layerTree: LayerTreeNode[];
  paintedElements: string[];
  unpaintedElements: string[];
  metadata: {
    totalPaintTime: number;
    totalElements: number;
    paintedCount: number;
    firstPaint: number;
    largestContentfulPaint: number;
  };
}

export interface LayerTreeNode {
  layerId: string;
  parentLayerId?: string;
  nodeId: number;
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  paintCount: number;
  drawsContent: boolean;
  invisible: boolean;
  scrollRectangles?: any[];
  compositingReasons?: string[];
}

export interface PaintTimelineConfig {
  captureInterval?: number; // ms between snapshots
  maxSnapshots?: number;
  trackLayers?: boolean;
  trackCompositing?: boolean;
}

export class PaintProfiler {
  private db: Pool;
  private browser?: Browser;
  private paintEvents: PaintEvent[] = [];
  private layerTree: LayerTreeNode[] = [];
  private paintOrder = 0;

  constructor(db: Pool) {
    this.db = db;
  }

  /**
   * Profile paint events for a URL
   */
  async profileURL(
    url: string,
    config: PaintTimelineConfig = {}
  ): Promise<PaintSnapshot> {
    const {
      captureInterval = 100,
      maxSnapshots = 100,
      trackLayers = true,
      trackCompositing = true,
    } = config;

    this.browser = await puppeteer.launch({
      headless: true,
      args: ['--enable-gpu', '--enable-logging', '--v=1'],
    });

    const page = await this.browser.newPage();
    const client = await page.target().createCDPSession();

    // Enable required domains
    await client.send('Performance.enable');
    await client.send('LayerTree.enable');
    await client.send('DOM.enable');
    await client.send('CSS.enable');

    // Track paint events
    this.paintEvents = [];
    this.layerTree = [];
    this.paintOrder = 0;

    const startTime = Date.now();
    let firstPaint = 0;
    let largestContentfulPaint = 0;

    // Listen to paint events
    client.on('LayerTree.layerPainted', (event: any) => {
      const paintEvent: PaintEvent = {
        timestamp: Date.now() - startTime,
        elementId: `layer-${event.layerId}`,
        eventType: 'paint',
        duration: 0,
        rect: event.clip || { x: 0, y: 0, width: 0, height: 0 },
        layerId: event.layerId,
        paintOrder: this.paintOrder++,
      };

      this.paintEvents.push(paintEvent);

      if (!firstPaint) {
        firstPaint = paintEvent.timestamp;
      }
    });

    // Listen to layer tree updates
    if (trackLayers) {
      client.on('LayerTree.layerTreeDidChange', async () => {
        try {
          const layerTreeData = await client.send('LayerTree.snapshot', {});
          this.processLayerTree(layerTreeData);
        } catch (error) {
          console.error('Error capturing layer tree:', error);
        }
      });
    }

    // Navigate and wait for network idle
    await page.goto(url, { waitUntil: 'networkidle2' });

    // Get performance metrics
    const performanceMetrics = await client.send('Performance.getMetrics');
    const lcp = performanceMetrics.metrics.find((m: any) => 
      m.name === 'LargestContentfulPaint'
    );
    if (lcp) {
      largestContentfulPaint = lcp.value * 1000;
    }

    // Get final layer tree
    if (trackLayers) {
      try {
        const finalLayerTree = await client.send('LayerTree.snapshot', {});
        this.processLayerTree(finalLayerTree);
      } catch (error) {
        console.error('Error capturing final layer tree:', error);
      }
    }

    // Get painted and unpainted elements
    const paintedElements = await this.getPaintedElements(page);
    const allElements = await this.getAllElements(page);
    const unpaintedElements = allElements.filter(
      (el) => !paintedElements.includes(el)
    );

    // Create snapshot
    const snapshot: PaintSnapshot = {
      id: `snapshot-${Date.now()}`,
      timestamp: Date.now(),
      url,
      events: this.paintEvents,
      layerTree: this.layerTree,
      paintedElements,
      unpaintedElements,
      metadata: {
        totalPaintTime: Date.now() - startTime,
        totalElements: allElements.length,
        paintedCount: paintedElements.length,
        firstPaint,
        largestContentfulPaint,
      },
    };

    await this.browser.close();

    // Save to database
    await this.saveSnapshot(snapshot);

    return snapshot;
  }

  /**
   * Process layer tree data from CDP
   */
  private processLayerTree(layerTreeData: any) {
    if (!layerTreeData || !layerTreeData.layers) return;

    this.layerTree = layerTreeData.layers.map((layer: any) => ({
      layerId: layer.layerId,
      parentLayerId: layer.parentLayerId,
      nodeId: layer.backendNodeId,
      bounds: {
        x: layer.offsetX || 0,
        y: layer.offsetY || 0,
        width: layer.width || 0,
        height: layer.height || 0,
      },
      paintCount: layer.paintCount || 0,
      drawsContent: layer.drawsContent || false,
      invisible: layer.invisible || false,
      scrollRectangles: layer.scrollRectangles,
      compositingReasons: layer.compositingReasons,
    }));
  }

  /**
   * Get elements that have been painted
   */
  private async getPaintedElements(page: Page): Promise<string[]> {
    return await page.evaluate(() => {
      const painted: string[] = [];
      const elements = document.querySelectorAll('*');

      elements.forEach((el, index) => {
        const computedStyle = window.getComputedStyle(el);
        const visibility = computedStyle.visibility;
        const display = computedStyle.display;
        const opacity = computedStyle.opacity;

        // Element is painted if visible
        if (
          visibility !== 'hidden' &&
          display !== 'none' &&
          parseFloat(opacity) > 0
        ) {
          painted.push(`element-${index}`);
          (el as any).__paintId = `element-${index}`;
        }
      });

      return painted;
    });
  }

  /**
   * Get all elements
   */
  private async getAllElements(page: Page): Promise<string[]> {
    return await page.evaluate(() => {
      const elements = document.querySelectorAll('*');
      return Array.from(elements).map((el, index) => `element-${index}`);
    });
  }

  /**
   * Save snapshot to database
   */
  private async saveSnapshot(snapshot: PaintSnapshot) {
    await this.db.query(
      `INSERT INTO paint_timeline_snapshots 
       (id, timestamp, url, events, layer_tree, painted_elements, unpainted_elements, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        snapshot.id,
        new Date(snapshot.timestamp),
        snapshot.url,
        JSON.stringify(snapshot.events),
        JSON.stringify(snapshot.layerTree),
        JSON.stringify(snapshot.paintedElements),
        JSON.stringify(snapshot.unpaintedElements),
        JSON.stringify(snapshot.metadata),
      ]
    );
  }

  /**
   * Get snapshots for URL
   */
  async getSnapshots(url: string, limit = 10): Promise<PaintSnapshot[]> {
    const result = await this.db.query(
      `SELECT * FROM paint_timeline_snapshots 
       WHERE url = $1 
       ORDER BY timestamp DESC 
       LIMIT $2`,
      [url, limit]
    );

    return result.rows.map((row) => ({
      id: row.id,
      timestamp: new Date(row.timestamp).getTime(),
      url: row.url,
      events: JSON.parse(row.events),
      layerTree: JSON.parse(row.layer_tree),
      paintedElements: JSON.parse(row.painted_elements),
      unpaintedElements: JSON.parse(row.unpainted_elements),
      metadata: JSON.parse(row.metadata),
    }));
  }

  /**
   * Filter events by schema model
   */
  filterByModel(
    snapshot: PaintSnapshot,
    modelType: 'richSnippet' | 'framework' | 'custom',
    customFilter?: (event: PaintEvent) => boolean
  ): PaintEvent[] {
    switch (modelType) {
      case 'richSnippet':
        // Filter for elements near rich snippet content
        return snapshot.events.filter((event) =>
          snapshot.paintedElements.some((el) => el.includes('article') || el.includes('product'))
        );

      case 'framework':
        // Filter for framework component elements
        return snapshot.events.filter((event) =>
          event.elementId.includes('react') || event.elementId.includes('vue')
        );

      case 'custom':
        return snapshot.events.filter(customFilter || (() => true));

      default:
        return snapshot.events;
    }
  }
}
