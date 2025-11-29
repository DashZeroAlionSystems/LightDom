/**
 * Client Analytics and Reporting Service
 * Generates comprehensive reports for clients about their websites
 * Integrates with DOM rendering layers and 3D visualization
 * Created: 2025-11-06
 */

export interface WebsiteMetrics {
  url: string;
  lastCrawled: string;
  domComplexity: {
    totalElements: number;
    depth: number;
    renderLayers: number;
  };
  performance: {
    loadTime: number;
    renderTime: number;
    paintMetrics: {
      firstPaint: number;
      firstContentfulPaint: number;
      largestContentfulPaint: number;
    };
  };
  optimization: {
    spaceOptimized: number;
    elementsOptimized: number;
    compressionRatio: number;
    biomeType: string;
  };
  seo: {
    score: number;
    issues: string[];
    recommendations: string[];
  };
}

export interface ClientReport {
  clientId: string;
  clientName: string;
  websites: WebsiteMetrics[];
  generatedAt: string;
  reportPeriod: {
    start: string;
    end: string;
  };
  summary: {
    totalOptimizations: number;
    totalSpaceSaved: number;
    averagePerformanceGain: number;
    topIssues: string[];
  };
  visualizations: {
    domLayersData: any;
    performanceCharts: any;
    optimizationMaps: any;
  };
}

export class ClientAnalyticsService {
  /**
   * Generate comprehensive report for a client
   */
  static async generateClientReport(
    clientId: string,
    options: {
      startDate?: string;
      endDate?: string;
      includeVisualizations?: boolean;
    } = {}
  ): Promise<ClientReport> {
    const {
      startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      endDate = new Date().toISOString(),
      includeVisualizations = true
    } = options;

    // Fetch client data
    const client = await this.fetchClientData(clientId);
    
    // Fetch website metrics for all client websites
    const websites = await this.fetchWebsiteMetrics(clientId, startDate, endDate);
    
    // Generate summary statistics
    const summary = this.generateSummary(websites);
    
    // Generate visualizations if requested
    const visualizations = includeVisualizations
      ? await this.generateVisualizations(websites)
      : { domLayersData: null, performanceCharts: null, optimizationMaps: null };

    return {
      clientId,
      clientName: client.name,
      websites,
      generatedAt: new Date().toISOString(),
      reportPeriod: {
        start: startDate,
        end: endDate
      },
      summary,
      visualizations
    };
  }

  /**
   * Fetch client data from API
   */
  private static async fetchClientData(clientId: string): Promise<{ name: string }> {
    try {
      const response = await fetch(`/api/users/${clientId}`);
      const data = await response.json();
      return {
        name: data.user.first_name && data.user.last_name
          ? `${data.user.first_name} ${data.user.last_name}`
          : data.user.username
      };
    } catch (error) {
      console.error('Error fetching client data:', error);
      return { name: 'Unknown Client' };
    }
  }

  /**
   * Fetch website metrics for client
   */
  private static async fetchWebsiteMetrics(
    clientId: string,
    startDate: string,
    endDate: string
  ): Promise<WebsiteMetrics[]> {
    try {
      // Fetch optimization data from API
      const response = await fetch(
        `/api/optimizations?user_id=${clientId}&start_date=${startDate}&end_date=${endDate}`
      );
      const data = await response.json();
      
      // Transform to WebsiteMetrics format
      return data.optimizations?.map((opt: any) => ({
        url: opt.url,
        lastCrawled: opt.crawl_timestamp || opt.created_at,
        domComplexity: {
          totalElements: opt.metadata?.dom_stats?.total_elements || 0,
          depth: opt.metadata?.dom_stats?.max_depth || 0,
          renderLayers: opt.metadata?.chrome_layers?.length || 0
        },
        performance: {
          loadTime: opt.performance_metrics?.load_time || 0,
          renderTime: opt.performance_metrics?.render_time || 0,
          paintMetrics: {
            firstPaint: opt.performance_metrics?.first_paint || 0,
            firstContentfulPaint: opt.performance_metrics?.first_contentful_paint || 0,
            largestContentfulPaint: opt.performance_metrics?.largest_contentful_paint || 0
          }
        },
        optimization: {
          spaceOptimized: opt.space_saved_bytes || 0,
          elementsOptimized: opt.optimization_types?.length || 0,
          compressionRatio: opt.metadata?.compression_ratio || 0,
          biomeType: opt.biome_type || 'unknown'
        },
        seo: {
          score: opt.metadata?.seo_score || 0,
          issues: opt.metadata?.seo_issues || [],
          recommendations: opt.metadata?.seo_recommendations || []
        }
      })) || [];
    } catch (error) {
      console.error('Error fetching website metrics:', error);
      return [];
    }
  }

  /**
   * Generate summary statistics
   */
  private static generateSummary(websites: WebsiteMetrics[]): ClientReport['summary'] {
    const totalOptimizations = websites.length;
    const totalSpaceSaved = websites.reduce((sum, w) => sum + w.optimization.spaceOptimized, 0);
    
    // Calculate average performance gain
    const performanceGains = websites.map(w => {
      const baseline = w.performance.loadTime + w.performance.renderTime;
      const optimized = baseline * (1 - w.optimization.compressionRatio);
      return baseline > 0 ? ((baseline - optimized) / baseline) * 100 : 0;
    });
    const averagePerformanceGain = performanceGains.length > 0
      ? performanceGains.reduce((sum, g) => sum + g, 0) / performanceGains.length
      : 0;
    
    // Aggregate top issues across all websites
    const allIssues = websites.flatMap(w => w.seo.issues);
    const issueFrequency: Record<string, number> = {};
    allIssues.forEach(issue => {
      issueFrequency[issue] = (issueFrequency[issue] || 0) + 1;
    });
    const topIssues = Object.entries(issueFrequency)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([issue]) => issue);

    return {
      totalOptimizations,
      totalSpaceSaved,
      averagePerformanceGain,
      topIssues
    };
  }

  /**
   * Generate 3D visualizations using DOM rendering layers
   */
  private static async generateVisualizations(
    websites: WebsiteMetrics[]
  ): Promise<ClientReport['visualizations']> {
    // Generate DOM layers data for 3D visualization
    const domLayersData = websites.map(website => ({
      url: website.url,
      layers: this.generateDOMLayersVisualization(website),
      complexity: website.domComplexity
    }));

    // Generate performance charts
    const performanceCharts = {
      loadTimes: websites.map(w => ({
        url: w.url,
        loadTime: w.performance.loadTime,
        renderTime: w.performance.renderTime
      })),
      paintMetrics: websites.map(w => ({
        url: w.url,
        ...w.performance.paintMetrics
      }))
    };

    // Generate optimization maps
    const optimizationMaps = {
      spaceByUrl: websites.map(w => ({
        url: w.url,
        saved: w.optimization.spaceOptimized,
        ratio: w.optimization.compressionRatio
      })),
      biomeDistribution: this.calculateBiomeDistribution(websites)
    };

    return {
      domLayersData,
      performanceCharts,
      optimizationMaps
    };
  }

  /**
   * Generate 3D DOM layers visualization data
   * This creates data structure for rendering DOM as 3D layers
   */
  private static generateDOMLayersVisualization(website: WebsiteMetrics): any[] {
    const layers = [];
    const totalLayers = website.domComplexity.renderLayers || 5;
    
    for (let i = 0; i < totalLayers; i++) {
      layers.push({
        id: `layer-${i}`,
        depth: i,
        position: {
          x: 0,
          y: i * 10, // Stack layers vertically in 3D space
          z: i * 5
        },
        dimensions: {
          width: 100 - (i * 5), // Layers get smaller at higher depths
          height: 100 - (i * 5),
          thickness: 2
        },
        color: this.getLayerColor(i, totalLayers),
        opacity: 1 - (i * 0.1), // Deeper layers are more transparent
        elements: Math.max(1, website.domComplexity.totalElements / totalLayers),
        metadata: {
          renderOrder: i,
          paintLayer: i < 3, // First 3 layers are paint layers
          compositingLayer: i >= 3 // Rest are compositing layers
        }
      });
    }
    
    return layers;
  }

  /**
   * Get color for DOM layer based on depth
   */
  private static getLayerColor(layerIndex: number, totalLayers: number): string {
    // Create gradient from blue (shallow) to purple (deep)
    const hue = 240 - (layerIndex / totalLayers) * 60; // 240 (blue) to 180 (cyan-purple)
    const saturation = 70;
    const lightness = 50 + (layerIndex / totalLayers) * 20;
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  }

  /**
   * Calculate biome distribution across websites
   */
  private static calculateBiomeDistribution(websites: WebsiteMetrics[]): Record<string, number> {
    const distribution: Record<string, number> = {};
    websites.forEach(w => {
      const biome = w.optimization.biomeType;
      distribution[biome] = (distribution[biome] || 0) + 1;
    });
    return distribution;
  }

  /**
   * Generate interactive infographic data
   * Creates rich, entertaining visualization data
   */
  static generateInfographicData(report: ClientReport): any {
    return {
      headerStats: [
        {
          label: 'Total Space Saved',
          value: `${(report.summary.totalSpaceSaved / 1024 / 1024).toFixed(2)} MB`,
          icon: 'database',
          color: '#52c41a',
          trend: '+' + report.summary.averagePerformanceGain.toFixed(1) + '%'
        },
        {
          label: 'Websites Optimized',
          value: report.websites.length,
          icon: 'globe',
          color: '#1890ff'
        },
        {
          label: 'Optimizations',
          value: report.summary.totalOptimizations,
          icon: 'rocket',
          color: '#722ed1'
        },
        {
          label: 'Avg Performance Gain',
          value: `${report.summary.averagePerformanceGain.toFixed(1)}%`,
          icon: 'trending-up',
          color: '#fa8c16'
        }
      ],
      charts: [
        {
          type: '3d-dom-layers',
          title: 'DOM Structure Visualization',
          data: report.visualizations.domLayersData,
          config: {
            perspective: 1000,
            rotationSpeed: 0.5,
            interactive: true
          }
        },
        {
          type: 'performance-timeline',
          title: 'Performance Metrics Timeline',
          data: report.visualizations.performanceCharts,
          config: {
            showPaintMetrics: true,
            highlightLCP: true
          }
        },
        {
          type: 'optimization-map',
          title: 'Optimization Impact Map',
          data: report.visualizations.optimizationMaps,
          config: {
            colorScale: 'viridis',
            showBiomes: true
          }
        }
      ],
      insights: report.summary.topIssues.map(issue => ({
        type: 'warning',
        title: issue,
        description: 'This issue was found across multiple websites',
        actionable: true
      }))
    };
  }

  /**
   * Export report in different formats
   */
  static async exportReport(
    report: ClientReport,
    format: 'json' | 'pdf' | 'html'
  ): Promise<string | Blob> {
    switch (format) {
      case 'json':
        return JSON.stringify(report, null, 2);
      
      case 'html':
        return this.generateHTMLReport(report);
      
      case 'pdf':
        // Would integrate with PDF generation library
        return new Blob([this.generateHTMLReport(report)], { type: 'text/html' });
      
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  }

  /**
   * Generate HTML report
   */
  private static generateHTMLReport(report: ClientReport): string {
    const infographic = this.generateInfographicData(report);
    
    return `
<!DOCTYPE html>
<html>
<head>
  <title>Website Analytics Report - ${report.clientName}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 1200px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px; border-radius: 12px; margin-bottom: 30px; }
    .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin: 30px 0; }
    .stat-card { background: white; padding: 24px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .stat-value { font-size: 32px; font-weight: bold; margin: 10px 0; }
    .website-card { background: white; padding: 20px; border-radius: 8px; margin: 15px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .metric { display: inline-block; margin: 10px 15px 10px 0; }
    .metric-label { color: #666; font-size: 12px; }
    .metric-value { font-weight: bold; font-size: 16px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Website Analytics Report</h1>
    <p>Client: ${report.clientName}</p>
    <p>Period: ${new Date(report.reportPeriod.start).toLocaleDateString()} - ${new Date(report.reportPeriod.end).toLocaleDateString()}</p>
  </div>
  
  <div class="stats">
    ${infographic.headerStats.map(stat => `
      <div class="stat-card" style="border-left: 4px solid ${stat.color}">
        <div class="metric-label">${stat.label}</div>
        <div class="stat-value" style="color: ${stat.color}">${stat.value}</div>
        ${stat.trend ? `<div style="color: #52c41a">${stat.trend}</div>` : ''}
      </div>
    `).join('')}
  </div>
  
  <h2>Website Performance</h2>
  ${report.websites.map(website => `
    <div class="website-card">
      <h3>${website.url}</h3>
      <div class="metric">
        <div class="metric-label">Space Saved</div>
        <div class="metric-value">${(website.optimization.spaceOptimized / 1024).toFixed(2)} KB</div>
      </div>
      <div class="metric">
        <div class="metric-label">Load Time</div>
        <div class="metric-value">${website.performance.loadTime.toFixed(2)}ms</div>
      </div>
      <div class="metric">
        <div class="metric-label">SEO Score</div>
        <div class="metric-value">${website.seo.score}/100</div>
      </div>
      <div class="metric">
        <div class="metric-label">Biome Type</div>
        <div class="metric-value">${website.optimization.biomeType}</div>
      </div>
    </div>
  `).join('')}
  
  <h2>Top Issues to Address</h2>
  <ul>
    ${report.summary.topIssues.map(issue => `<li>${issue}</li>`).join('')}
  </ul>
</body>
</html>
    `.trim();
  }
}

export default ClientAnalyticsService;
