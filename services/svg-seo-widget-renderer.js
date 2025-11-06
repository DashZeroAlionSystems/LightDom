/**
 * SVG SEO Widget Renderer Service
 * 
 * Generates real-time SVG-based SEO widgets that:
 * - Display live SEO metrics without visual disruption
 * - Update automatically based on data mining
 * - Render rich snippets visually
 * - Show competitor comparisons
 * - Provide optimization recommendations
 * - Zero impact on page layout
 * - Configurable positioning and styling
 */

import { EventEmitter } from 'events';

class SVGSEOWidgetRenderer extends EventEmitter {
  constructor(config = {}) {
    super();
    
    this.config = {
      position: config.position || 'bottom-right',
      theme: config.theme || 'light',
      updateInterval: config.updateInterval || 5000, // 5 seconds
      showScore: config.showScore !== false,
      showCompetitors: config.showCompetitors !== false,
      showRecommendations: config.showRecommendations !== false,
      ...config
    };

    this.widgets = new Map();
  }

  /**
   * Generate SVG widget for SEO score display
   */
  generateSEOScoreWidget(data) {
    const { score, trend, history } = data;
    
    const widget = {
      id: `seo-score-${Date.now()}`,
      type: 'score-display',
      svg: this.createScoreSVG(score, trend, history),
      position: this.getPosition(),
      updateFrequency: this.config.updateInterval
    };

    this.widgets.set(widget.id, widget);
    return widget;
  }

  /**
   * Create SVG for score display
   */
  createScoreSVG(score, trend, history) {
    const width = 300;
    const height = 200;
    const color = this.getScoreColor(score);
    const trendArrow = trend > 0 ? '↑' : trend < 0 ? '↓' : '→';
    
    return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg" 
                 style="position: fixed; ${this.config.position}: 20px; z-index: 999999; 
                        background: rgba(255,255,255,0.95); border-radius: 8px; 
                        box-shadow: 0 4px 12px rgba(0,0,0,0.15); padding: 16px;">
      <!-- Score Circle -->
      <circle cx="100" cy="100" r="60" fill="none" stroke="#e0e0e0" stroke-width="12"/>
      <circle cx="100" cy="100" r="60" fill="none" stroke="${color}" stroke-width="12"
              stroke-dasharray="${(score / 100) * 377} 377" 
              stroke-linecap="round"
              transform="rotate(-90 100 100)"/>
      
      <!-- Score Text -->
      <text x="100" y="95" text-anchor="middle" font-size="32" font-weight="bold" fill="${color}">
        ${Math.round(score)}
      </text>
      <text x="100" y="115" text-anchor="middle" font-size="14" fill="#666">
        SEO Score
      </text>
      
      <!-- Trend Indicator -->
      <text x="100" y="140" text-anchor="middle" font-size="20" fill="${trend > 0 ? '#4caf50' : trend < 0 ? '#f44336' : '#999'}">
        ${trendArrow} ${Math.abs(trend).toFixed(1)}%
      </text>
      
      <!-- Sparkline History -->
      ${this.generateSparkline(history, 200, 160, 80, 30)}
      
      <!-- Powered By -->
      <text x="150" y="185" text-anchor="middle" font-size="10" fill="#999">
        Powered by LightDom
      </text>
    </svg>`;
  }

  /**
   * Generate competitor comparison widget
   */
  generateCompetitorWidget(data) {
    const { clientScore, competitors } = data;
    
    return {
      id: `competitor-${Date.now()}`,
      type: 'competitor-comparison',
      svg: this.createCompetitorSVG(clientScore, competitors),
      position: this.getPosition(),
      updateFrequency: this.config.updateInterval
    };
  }

  /**
   * Create SVG for competitor comparison
   */
  createCompetitorSVG(clientScore, competitors) {
    const width = 400;
    const height = 250;
    const barHeight = 30;
    const spacing = 10;
    
    const maxScore = Math.max(clientScore, ...competitors.map(c => c.score));
    
    let barsHTML = '';
    let yPosition = 50;
    
    // Client bar
    barsHTML += this.createBar('Your Site', clientScore, yPosition, maxScore, '#2196f3', true);
    yPosition += barHeight + spacing;
    
    // Competitor bars
    competitors.forEach((comp, index) => {
      barsHTML += this.createBar(comp.name, comp.score, yPosition, maxScore, '#9e9e9e', false);
      yPosition += barHeight + spacing;
    });
    
    return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg"
                 style="position: fixed; ${this.config.position}: 20px; z-index: 999998;
                        background: rgba(255,255,255,0.95); border-radius: 8px;
                        box-shadow: 0 4px 12px rgba(0,0,0,0.15); padding: 16px;">
      <!-- Title -->
      <text x="10" y="25" font-size="16" font-weight="bold" fill="#333">
        Competitor Comparison
      </text>
      
      ${barsHTML}
    </svg>`;
  }

  /**
   * Create individual bar for comparison
   */
  createBar(label, score, y, maxScore, color, highlight) {
    const maxWidth = 350;
    const barWidth = (score / maxScore) * maxWidth;
    
    return `
      <text x="10" y="${y - 5}" font-size="12" fill="#666">${label}</text>
      <rect x="10" y="${y}" width="${barWidth}" height="20" fill="${color}" rx="3"/>
      <text x="${barWidth + 15}" y="${y + 15}" font-size="12" font-weight="${highlight ? 'bold' : 'normal'}" fill="#333">
        ${Math.round(score)}
      </text>
    `;
  }

  /**
   * Generate rich snippet preview widget
   */
  generateRichSnippetWidget(schemas) {
    return {
      id: `rich-snippet-${Date.now()}`,
      type: 'rich-snippet-preview',
      svg: this.createRichSnippetSVG(schemas),
      position: this.getPosition(),
      updateFrequency: this.config.updateInterval
    };
  }

  /**
   * Create SVG for rich snippet preview
   */
  createRichSnippetSVG(schemas) {
    const width = 450;
    const height = 300;
    
    const schemaTypes = Object.keys(schemas);
    const schemaCount = schemaTypes.length;
    
    return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg"
                 style="position: fixed; ${this.config.position}: 20px; z-index: 999997;
                        background: rgba(255,255,255,0.95); border-radius: 8px;
                        box-shadow: 0 4px 12px rgba(0,0,0,0.15); padding: 16px;">
      <!-- Title -->
      <text x="10" y="25" font-size="16" font-weight="bold" fill="#333">
        Rich Snippets Active (${schemaCount})
      </text>
      
      <!-- Schema Types -->
      ${this.generateSchemaList(schemaTypes, 50)}
      
      <!-- Status Indicator -->
      <circle cx="420" cy="20" r="8" fill="#4caf50"/>
      <text x="435" y="25" font-size="10" fill="#666">Live</text>
    </svg>`;
  }

  /**
   * Generate schema list
   */
  generateSchemaList(schemaTypes, startY) {
    let html = '';
    let y = startY;
    
    schemaTypes.slice(0, 8).forEach((type, index) => {
      html += `
        <circle cx="20" cy="${y}" r="4" fill="#4caf50"/>
        <text x="30" y="${y + 4}" font-size="12" fill="#666">${type}</text>
      `;
      y += 20;
    });
    
    if (schemaTypes.length > 8) {
      html += `
        <text x="30" y="${y + 4}" font-size="12" fill="#999">
          +${schemaTypes.length - 8} more...
        </text>
      `;
    }
    
    return html;
  }

  /**
   * Generate optimization recommendations widget
   */
  generateRecommendationsWidget(recommendations) {
    return {
      id: `recommendations-${Date.now()}`,
      type: 'recommendations',
      svg: this.createRecommendationsSVG(recommendations),
      position: this.getPosition(),
      updateFrequency: this.config.updateInterval
    };
  }

  /**
   * Create SVG for recommendations
   */
  createRecommendationsSVG(recommendations) {
    const width = 500;
    const height = 350;
    
    const topRecommendations = recommendations.slice(0, 5);
    
    return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg"
                 style="position: fixed; ${this.config.position}: 20px; z-index: 999996;
                        background: rgba(255,255,255,0.95); border-radius: 8px;
                        box-shadow: 0 4px 12px rgba(0,0,0,0.15); padding: 16px;">
      <!-- Title -->
      <text x="10" y="25" font-size="16" font-weight="bold" fill="#333">
        Top SEO Recommendations
      </text>
      
      <!-- Recommendations List -->
      ${this.generateRecommendationsList(topRecommendations, 50)}
      
      <!-- Auto-Apply Status -->
      <text x="10" y="330" font-size="10" fill="#999">
        Auto-applying safe optimizations...
      </text>
    </svg>`;
  }

  /**
   * Generate recommendations list
   */
  generateRecommendationsList(recommendations, startY) {
    let html = '';
    let y = startY;
    
    recommendations.forEach((rec, index) => {
      const priorityColor = this.getPriorityColor(rec.priority);
      
      html += `
        <!-- Priority Badge -->
        <rect x="10" y="${y - 12}" width="60" height="18" fill="${priorityColor}" rx="3"/>
        <text x="40" y="${y + 1}" text-anchor="middle" font-size="10" fill="#fff" font-weight="bold">
          ${rec.priority.toUpperCase()}
        </text>
        
        <!-- Recommendation Text -->
        <text x="80" y="${y}" font-size="12" fill="#333">
          ${this.truncateText(rec.title, 45)}
        </text>
        
        <!-- Impact -->
        <text x="80" y="${y + 15}" font-size="10" fill="#666">
          Impact: +${rec.impactScore} points
        </text>
      `;
      
      y += 50;
    });
    
    return html;
  }

  /**
   * Generate sparkline for historical data
   */
  generateSparkline(history, x, y, width, height) {
    if (!history || history.length < 2) return '';
    
    const max = Math.max(...history);
    const min = Math.min(...history);
    const range = max - min || 1;
    
    const points = history.map((value, index) => {
      const xPos = x + (index / (history.length - 1)) * width;
      const yPos = y + height - ((value - min) / range) * height;
      return `${xPos},${yPos}`;
    }).join(' ');
    
    return `<polyline points="${points}" fill="none" stroke="#2196f3" stroke-width="2"/>`;
  }

  /**
   * Get position CSS
   */
  getPosition() {
    const positions = {
      'top-left': 'top: 20px; left: 20px;',
      'top-right': 'top: 20px; right: 20px;',
      'bottom-left': 'bottom: 20px; left: 20px;',
      'bottom-right': 'bottom: 20px; right: 20px;',
      'center': 'top: 50%; left: 50%; transform: translate(-50%, -50%);'
    };
    
    return positions[this.config.position] || positions['bottom-right'];
  }

  /**
   * Get color based on score
   */
  getScoreColor(score) {
    if (score >= 90) return '#4caf50'; // Green
    if (score >= 70) return '#8bc34a'; // Light Green
    if (score >= 50) return '#ff9800'; // Orange
    if (score >= 30) return '#ff5722'; // Deep Orange
    return '#f44336'; // Red
  }

  /**
   * Get color based on priority
   */
  getPriorityColor(priority) {
    const colors = {
      critical: '#f44336',
      high: '#ff9800',
      medium: '#2196f3',
      low: '#4caf50'
    };
    return colors[priority] || colors.medium;
  }

  /**
   * Truncate text to fit
   */
  truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
  }

  /**
   * Generate injectable script for widgets
   */
  generateInjectableScript(widgets) {
    const widgetsSVG = widgets.map(w => w.svg).join('\n');
    
    return `
(function() {
  'use strict';
  
  // LightDom SEO Widget Injector
  const widgets = ${JSON.stringify(widgets, null, 2)};
  
  // Inject widgets
  function injectWidgets() {
    widgets.forEach(widget => {
      const container = document.createElement('div');
      container.id = widget.id;
      container.innerHTML = widget.svg;
      document.body.appendChild(container);
    });
  }
  
  // Update widgets with live data
  function updateWidgets(data) {
    widgets.forEach(widget => {
      const element = document.getElementById(widget.id);
      if (element && data[widget.type]) {
        element.innerHTML = renderWidget(widget.type, data[widget.type]);
      }
    });
  }
  
  // Initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectWidgets);
  } else {
    injectWidgets();
  }
  
  // Setup live updates
  setInterval(() => {
    fetch('/api/seo/live-data?apiKey=' + window.LIGHTDOM_API_KEY)
      .then(res => res.json())
      .then(data => updateWidgets(data))
      .catch(err => console.warn('LightDom update failed:', err));
  }, ${this.config.updateInterval});
  
  console.log('[LightDom SEO] Widgets active:', widgets.length);
})();
`;
  }
}

export default SVGSEOWidgetRenderer;
export { SVGSEOWidgetRenderer };
