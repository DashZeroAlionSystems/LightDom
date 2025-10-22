/**
 * NFT Animation Generator - Procedural art generation for metaverse items
 * Creates animated SVG art based on item properties and rarity
 */

export interface AnimationConfig {
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythical';
  category: 'avatar' | 'environment' | 'tool' | 'pet' | 'building' | 'vehicle' | 'art' | 'special';
  colors: string[];
  patterns: string[];
  effects: string[];
}

export interface GeneratedAnimation {
  svg: string;
  dataURI: string;
  ipfsHash?: string;
  metadata: {
    width: number;
    height: number;
    animationDuration: number;
    complexity: number;
  };
}

export class NFTAnimationGenerator {
  private readonly rarityColors: Record<string, string[]> = {
    common: ['#94a3b8', '#cbd5e1', '#e2e8f0'],
    uncommon: ['#60a5fa', '#93c5fd', '#dbeafe'],
    rare: ['#a78bfa', '#c4b5fd', '#ede9fe'],
    epic: ['#fb923c', '#fdba74', '#fed7aa'],
    legendary: ['#fbbf24', '#fcd34d', '#fef3c7'],
    mythical: ['#f472b6', '#f9a8d4', '#fce7f3', '#c084fc']
  };

  private readonly categoryShapes: Record<string, string[]> = {
    avatar: ['circle', 'polygon', 'path'],
    environment: ['rect', 'polygon', 'path'],
    tool: ['rect', 'polygon', 'line'],
    pet: ['ellipse', 'circle', 'path'],
    building: ['rect', 'polygon'],
    vehicle: ['polygon', 'rect', 'ellipse'],
    art: ['circle', 'ellipse', 'path', 'polygon'],
    special: ['circle', 'ellipse', 'path', 'polygon', 'rect']
  };

  /**
   * Generate animation for an NFT item
   */
  generateAnimation(
    itemName: string,
    config: AnimationConfig,
    seed?: number
  ): GeneratedAnimation {
    const randomSeed = seed || this.hashString(itemName);
    const colors = config.colors.length > 0 ? config.colors : this.rarityColors[config.rarity];
    
    const width = 512;
    const height = 512;
    const complexity = this.getComplexityFromRarity(config.rarity);
    
    const svg = this.createAnimatedSVG(
      width,
      height,
      colors,
      config.category,
      complexity,
      randomSeed
    );
    
    const dataURI = `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
    
    return {
      svg,
      dataURI,
      metadata: {
        width,
        height,
        animationDuration: this.getAnimationDuration(config.rarity),
        complexity
      }
    };
  }

  /**
   * Create animated SVG with procedural patterns
   */
  private createAnimatedSVG(
    width: number,
    height: number,
    colors: string[],
    category: string,
    complexity: number,
    seed: number
  ): string {
    const shapes = this.generateShapes(width, height, colors, category, complexity, seed);
    const animations = this.generateAnimations(complexity);
    const filters = this.generateFilters(colors);
    
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" 
     viewBox="0 0 ${width} ${height}" 
     width="${width}" 
     height="${height}">
  <defs>
    ${filters}
    ${this.generateGradients(colors)}
  </defs>
  
  <!-- Background -->
  <rect width="${width}" height="${height}" fill="${colors[0]}" opacity="0.1"/>
  
  <!-- Animated background pattern -->
  <g id="background-pattern" opacity="0.3">
    ${this.generateBackgroundPattern(width, height, colors[1], seed)}
  </g>
  
  <!-- Main shapes -->
  <g id="main-shapes">
    ${shapes}
  </g>
  
  <!-- Animations -->
  ${animations}
  
  <!-- Border -->
  <rect width="${width}" height="${height}" 
        fill="none" 
        stroke="${colors[colors.length - 1]}" 
        stroke-width="4" 
        opacity="0.5"/>
</svg>`;
  }

  /**
   * Generate procedural shapes based on category
   */
  private generateShapes(
    width: number,
    height: number,
    colors: string[],
    category: string,
    complexity: number,
    seed: number
  ): string {
    const shapes: string[] = [];
    const shapeTypes = this.categoryShapes[category] || this.categoryShapes.special;
    const numShapes = Math.min(5 + complexity * 2, 15);
    
    for (let i = 0; i < numShapes; i++) {
      const shapeType = shapeTypes[this.seededRandom(seed + i) % shapeTypes.length];
      const color = colors[this.seededRandom(seed + i * 2) % colors.length];
      const shape = this.generateShape(
        shapeType,
        width,
        height,
        color,
        seed + i,
        i
      );
      shapes.push(shape);
    }
    
    return shapes.join('\n    ');
  }

  /**
   * Generate individual shape
   */
  private generateShape(
    type: string,
    width: number,
    height: number,
    color: string,
    seed: number,
    index: number
  ): string {
    const cx = (this.seededRandom(seed) % (width - 100)) + 50;
    const cy = (this.seededRandom(seed + 1) % (height - 100)) + 50;
    const size = 20 + (this.seededRandom(seed + 2) % 80);
    
    const animationId = `anim-${index}`;
    
    switch (type) {
      case 'circle':
        return `<circle cx="${cx}" cy="${cy}" r="${size}" 
                       fill="${color}" opacity="0.7" filter="url(#glow)">
                  <animate id="${animationId}" attributeName="r" 
                           from="${size}" to="${size * 1.2}" 
                           dur="${2 + (seed % 3)}s" 
                           repeatCount="indefinite" 
                           calcMode="spline" 
                           keySplines="0.4 0 0.2 1"/>
                </circle>`;
      
      case 'rect':
        return `<rect x="${cx - size / 2}" y="${cy - size / 2}" 
                     width="${size}" height="${size}" 
                     fill="${color}" opacity="0.6" filter="url(#glow)">
                  <animateTransform attributeName="transform" 
                                    type="rotate" 
                                    from="0 ${cx} ${cy}" 
                                    to="360 ${cx} ${cy}" 
                                    dur="${4 + (seed % 4)}s" 
                                    repeatCount="indefinite"/>
                </rect>`;
      
      case 'polygon':
        const points = this.generatePolygonPoints(cx, cy, size, 6);
        return `<polygon points="${points}" 
                        fill="${color}" opacity="0.5" filter="url(#glow)">
                  <animateTransform attributeName="transform" 
                                    type="scale" 
                                    from="1" to="1.1" 
                                    dur="${3 + (seed % 3)}s" 
                                    repeatCount="indefinite" 
                                    additive="sum"/>
                </polygon>`;
      
      case 'ellipse':
        return `<ellipse cx="${cx}" cy="${cy}" 
                        rx="${size}" ry="${size * 0.7}" 
                        fill="${color}" opacity="0.6" filter="url(#glow)">
                  <animate attributeName="ry" 
                           from="${size * 0.7}" to="${size}" 
                           dur="${2.5 + (seed % 2)}s" 
                           repeatCount="indefinite" 
                           direction="alternate"/>
                </ellipse>`;
      
      default:
        const pathData = this.generateRandomPath(cx, cy, size, seed);
        return `<path d="${pathData}" 
                     fill="${color}" opacity="0.5" filter="url(#glow)">
                  <animate attributeName="opacity" 
                           from="0.5" to="0.8" 
                           dur="${3 + (seed % 2)}s" 
                           repeatCount="indefinite" 
                           direction="alternate"/>
                </path>`;
    }
  }

  /**
   * Generate polygon points
   */
  private generatePolygonPoints(cx: number, cy: number, size: number, sides: number): string {
    const points: string[] = [];
    for (let i = 0; i < sides; i++) {
      const angle = (Math.PI * 2 * i) / sides;
      const x = cx + size * Math.cos(angle);
      const y = cy + size * Math.sin(angle);
      points.push(`${x.toFixed(2)},${y.toFixed(2)}`);
    }
    return points.join(' ');
  }

  /**
   * Generate random path
   */
  private generateRandomPath(cx: number, cy: number, size: number, seed: number): string {
    const numPoints = 4 + (this.seededRandom(seed) % 4);
    let path = `M ${cx} ${cy}`;
    
    for (let i = 0; i < numPoints; i++) {
      const angle = (Math.PI * 2 * i) / numPoints;
      const r = size * (0.5 + (this.seededRandom(seed + i) % 50) / 100);
      const x = cx + r * Math.cos(angle);
      const y = cy + r * Math.sin(angle);
      path += ` L ${x.toFixed(2)} ${y.toFixed(2)}`;
    }
    
    path += ' Z';
    return path;
  }

  /**
   * Generate background pattern
   */
  private generateBackgroundPattern(
    width: number,
    height: number,
    color: string,
    seed: number
  ): string {
    const patterns: string[] = [];
    const gridSize = 40;
    
    for (let x = 0; x < width; x += gridSize) {
      for (let y = 0; y < height; y += gridSize) {
        if (this.seededRandom(seed + x + y) % 3 === 0) {
          patterns.push(`<circle cx="${x}" cy="${y}" r="2" fill="${color}"/>`);
        }
      }
    }
    
    return patterns.join('\n    ');
  }

  /**
   * Generate SVG gradients
   */
  private generateGradients(colors: string[]): string {
    return `
    <linearGradient id="mainGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${colors[0]};stop-opacity:1" />
      <stop offset="50%" style="stop-color:${colors[1] || colors[0]};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${colors[2] || colors[1] || colors[0]};stop-opacity:1" />
    </linearGradient>
    
    <radialGradient id="radialGradient">
      <stop offset="0%" style="stop-color:${colors[colors.length - 1]};stop-opacity:0.8" />
      <stop offset="100%" style="stop-color:${colors[0]};stop-opacity:0" />
    </radialGradient>`;
  }

  /**
   * Generate SVG filters
   */
  private generateFilters(colors: string[]): string {
    return `
    <filter id="glow">
      <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
    
    <filter id="blur">
      <feGaussianBlur in="SourceGraphic" stdDeviation="2"/>
    </filter>`;
  }

  /**
   * Generate animations
   */
  private generateAnimations(complexity: number): string {
    const animations: string[] = [];
    
    // Add global pulse animation
    animations.push(`
    <animate href="#main-shapes" 
             attributeName="opacity" 
             from="0.8" to="1" 
             dur="2s" 
             repeatCount="indefinite" 
             direction="alternate"/>`);
    
    return animations.join('\n  ');
  }

  /**
   * Get complexity from rarity
   */
  private getComplexityFromRarity(rarity: string): number {
    const complexityMap: Record<string, number> = {
      common: 1,
      uncommon: 2,
      rare: 3,
      epic: 4,
      legendary: 5,
      mythical: 6
    };
    return complexityMap[rarity] || 1;
  }

  /**
   * Get animation duration from rarity
   */
  private getAnimationDuration(rarity: string): number {
    const durationMap: Record<string, number> = {
      common: 2000,
      uncommon: 3000,
      rare: 4000,
      epic: 5000,
      legendary: 6000,
      mythical: 8000
    };
    return durationMap[rarity] || 2000;
  }

  /**
   * Hash string to number for seeding
   */
  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  /**
   * Seeded random number generator
   */
  private seededRandom(seed: number): number {
    const x = Math.sin(seed) * 10000;
    return Math.floor((x - Math.floor(x)) * 1000);
  }

  /**
   * Generate metadata for NFT
   */
  generateMetadata(
    itemName: string,
    description: string,
    config: AnimationConfig,
    animationURI: string,
    attributes: Record<string, any> = {}
  ): string {
    const metadata = {
      name: itemName,
      description,
      image: animationURI,
      animation_url: animationURI,
      attributes: [
        {
          trait_type: 'Rarity',
          value: config.rarity.charAt(0).toUpperCase() + config.rarity.slice(1)
        },
        {
          trait_type: 'Category',
          value: config.category.charAt(0).toUpperCase() + config.category.slice(1)
        },
        {
          trait_type: 'Complexity',
          value: this.getComplexityFromRarity(config.rarity)
        },
        ...Object.entries(attributes).map(([key, value]) => ({
          trait_type: key,
          value
        }))
      ],
      properties: {
        category: config.category,
        rarity: config.rarity,
        animated: true,
        generated: true
      }
    };
    
    return JSON.stringify(metadata, null, 2);
  }
}

// Export singleton instance
export const nftAnimationGenerator = new NFTAnimationGenerator();
