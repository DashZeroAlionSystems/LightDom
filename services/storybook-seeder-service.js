/**
 * Storybook Seeder Service
 * 
 * Manages URL seeding specifically for Storybook discovery.
 * Integrates with URLSeedingService and StorybookDiscoveryService.
 * 
 * Features:
 * - Intelligent seed URL generation for Storybook instances
 * - GitHub repository discovery for Storybook projects
 * - NPM package discovery for component libraries
 * - Integration with search engines
 * - Priority-based seeding
 */

import { EventEmitter } from 'events';
import axios from 'axios';
import { URL } from 'url';

export class StorybookSeederService extends EventEmitter {
  constructor(config = {}) {
    super();
    
    this.config = {
      githubToken: config.githubToken || process.env.GITHUB_TOKEN,
      npmRegistry: config.npmRegistry || 'https://registry.npmjs.org',
      maxSeedsPerSource: config.maxSeedsPerSource || 100,
      enableGithub: config.enableGithub !== false,
      enableNpm: config.enableNpm !== false,
      enableWebSearch: config.enableWebSearch !== false,
      ...config,
    };

    this.seeds = new Map(); // url -> seed metadata
    this.sources = new Map(); // source -> seeds
    
    this.stats = {
      totalSeeds: 0,
      githubSeeds: 0,
      npmSeeds: 0,
      webSeeds: 0,
      lastUpdate: null,
    };
  }

  /**
   * Generate seeds from multiple sources
   */
  async generateSeeds() {
    console.log('🌱 Generating Storybook seeds...');
    
    const tasks = [];
    
    if (this.config.enableGithub) {
      tasks.push(this.seedFromGitHub());
    }
    
    if (this.config.enableNpm) {
      tasks.push(this.seedFromNPM());
    }
    
    if (this.config.enableWebSearch) {
      tasks.push(this.seedFromKnownSources());
    }
    
    await Promise.all(tasks);
    
    this.stats.lastUpdate = new Date().toISOString();
    
    console.log(`✅ Generated ${this.seeds.size} Storybook seeds`);
    return Array.from(this.seeds.values());
  }

  /**
   * Seed from GitHub repositories
   */
  async seedFromGitHub() {
    console.log('🔍 Searching GitHub for Storybook projects...');
    
    try {
      const queries = [
        'storybook in:readme',
        '.storybook language:javascript',
        '.storybook language:typescript',
        'topic:storybook',
        'topic:component-library',
        'topic:design-system',
      ];
      
      for (const query of queries) {
        await this.searchGitHub(query);
      }
      
    } catch (error) {
      console.error('Failed to seed from GitHub:', error.message);
    }
  }

  /**
   * Search GitHub API
   */
  async searchGitHub(query) {
    try {
      const headers = {
        'Accept': 'application/vnd.github.v3+json',
      };
      
      if (this.config.githubToken) {
        headers['Authorization'] = `token ${this.config.githubToken}`;
      }
      
      const response = await axios.get('https://api.github.com/search/repositories', {
        params: {
          q: query,
          per_page: 30,
          sort: 'stars',
        },
        headers,
      });
      
      const repos = response.data.items || [];
      console.log(`📦 Found ${repos.length} GitHub repositories for: ${query}`);
      
      for (const repo of repos) {
        // Try to find Storybook deployment URLs
        const urls = await this.extractStorybookUrls(repo);
        
        for (const url of urls) {
          this.addSeed({
            url,
            source: 'github',
            repository: repo.full_name,
            stars: repo.stargazers_count,
            priority: this.calculatePriority(repo),
            tags: ['github', 'open-source'],
          });
        }
      }
      
    } catch (error) {
      console.error(`GitHub search failed for "${query}":`, error.message);
    }
  }

  /**
   * Extract potential Storybook URLs from GitHub repo
   */
  async extractStorybookUrls(repo) {
    const urls = [];
    
    // Check GitHub Pages
    if (repo.has_pages) {
      const pagesUrl = `https://${repo.owner.login}.github.io/${repo.name}`;
      urls.push(pagesUrl);
    }
    
    // Check common deployment patterns
    const deploymentPatterns = [
      `https://${repo.name}.vercel.app`,
      `https://${repo.name}.netlify.app`,
      `https://${repo.owner.login}-${repo.name}.netlify.app`,
      `https://storybook-${repo.name}.vercel.app`,
    ];
    
    // Only add if they might exist (we'll verify later)
    urls.push(...deploymentPatterns);
    
    // Check README for Storybook links
    try {
      const readmeUrl = `https://raw.githubusercontent.com/${repo.full_name}/${repo.default_branch}/README.md`;
      const response = await axios.get(readmeUrl, { timeout: 5000 });
      const readme = response.data;
      
      // Extract URLs that might be Storybook
      const urlRegex = /https?:\/\/[^\s<>"]+/g;
      const matches = readme.match(urlRegex) || [];
      
      for (const url of matches) {
        if (url.toLowerCase().includes('storybook') || 
            url.toLowerCase().includes('chromatic')) {
          urls.push(url);
        }
      }
    } catch (error) {
      // README not found or inaccessible
    }
    
    return [...new Set(urls)]; // Remove duplicates
  }

  /**
   * Calculate priority based on repository metrics
   */
  calculatePriority(repo) {
    let priority = 5; // Base priority
    
    // Adjust based on stars
    if (repo.stargazers_count > 10000) priority += 3;
    else if (repo.stargazers_count > 1000) priority += 2;
    else if (repo.stargazers_count > 100) priority += 1;
    
    // Boost if recently updated
    const daysSinceUpdate = (Date.now() - new Date(repo.updated_at)) / (1000 * 60 * 60 * 24);
    if (daysSinceUpdate < 30) priority += 1;
    
    // Cap at 10
    return Math.min(priority, 10);
  }

  /**
   * Seed from NPM packages
   */
  async seedFromNPM() {
    console.log('📦 Searching NPM for Storybook packages...');
    
    try {
      const queries = [
        'storybook',
        'component-library',
        'design-system',
        'ui-components',
      ];
      
      for (const query of queries) {
        await this.searchNPM(query);
      }
      
    } catch (error) {
      console.error('Failed to seed from NPM:', error.message);
    }
  }

  /**
   * Search NPM registry
   */
  async searchNPM(query) {
    try {
      const response = await axios.get(`https://registry.npmjs.org/-/v1/search`, {
        params: {
          text: query,
          size: 20,
        },
      });
      
      const packages = response.data.objects || [];
      console.log(`📦 Found ${packages.length} NPM packages for: ${query}`);
      
      for (const pkg of packages) {
        const pkgData = pkg.package;
        
        // Extract Storybook URLs from package metadata
        const urls = this.extractUrlsFromPackage(pkgData);
        
        for (const url of urls) {
          this.addSeed({
            url,
            source: 'npm',
            package: pkgData.name,
            version: pkgData.version,
            priority: this.calculateNpmPriority(pkgData),
            tags: ['npm', 'package'],
          });
        }
      }
      
    } catch (error) {
      console.error(`NPM search failed for "${query}":`, error.message);
    }
  }

  /**
   * Extract URLs from NPM package metadata
   */
  extractUrlsFromPackage(pkg) {
    const urls = [];
    
    // Check homepage
    if (pkg.links?.homepage) {
      urls.push(pkg.links.homepage);
    }
    
    // Check repository
    if (pkg.links?.repository) {
      const repoUrl = pkg.links.repository.replace('github.com', 'github.io');
      if (repoUrl.includes('github.io')) {
        urls.push(repoUrl);
      }
    }
    
    // Check description for Storybook mentions
    if (pkg.description) {
      const desc = pkg.description.toLowerCase();
      if (desc.includes('storybook') || desc.includes('component library')) {
        // Likely has a Storybook instance
      }
    }
    
    return urls;
  }

  /**
   * Calculate NPM package priority
   */
  calculateNpmPriority(pkg) {
    let priority = 5;
    
    // Boost popular packages
    const score = pkg.score?.final || 0;
    if (score > 0.8) priority += 2;
    else if (score > 0.6) priority += 1;
    
    // Boost recent packages
    const daysSincePublish = (Date.now() - new Date(pkg.date)) / (1000 * 60 * 60 * 24);
    if (daysSincePublish < 90) priority += 1;
    
    return Math.min(priority, 10);
  }

  /**
   * Seed from known Storybook sources
   */
  async seedFromKnownSources() {
    console.log('🌐 Adding seeds from known sources...');
    
    const knownSources = [
      // Official Storybook
      {
        url: 'https://storybook.js.org/showcase',
        priority: 10,
        tags: ['official', 'showcase'],
      },
      {
        url: 'https://component.gallery',
        priority: 10,
        tags: ['gallery', 'curated'],
      },
      
      // Popular component libraries
      {
        url: 'https://main--624b4db2c36c3900398eea65.chromatic.com',
        priority: 9,
        tags: ['ant-design', 'popular'],
      },
      {
        url: 'https://react.carbondesignsystem.com',
        priority: 9,
        tags: ['ibm', 'carbon', 'design-system'],
      },
      {
        url: 'https://primer.style/react/storybook',
        priority: 9,
        tags: ['github', 'primer', 'design-system'],
      },
      {
        url: 'https://storybook.grommet.io',
        priority: 8,
        tags: ['grommet', 'hp'],
      },
      {
        url: 'https://main--62b71fabe3dbc10041b90e42.chromatic.com',
        priority: 8,
        tags: ['atlassian', 'atlaskit'],
      },
      
      // Framework-specific
      {
        url: 'https://vue-next.storybook.js.org',
        priority: 8,
        tags: ['vue', 'framework'],
      },
      {
        url: 'https://angular.io/guide/storybook',
        priority: 8,
        tags: ['angular', 'framework'],
      },
    ];
    
    for (const seed of knownSources) {
      this.addSeed({
        ...seed,
        source: 'known',
      });
    }
    
    this.stats.webSeeds += knownSources.length;
  }

  /**
   * Add a seed to the collection
   */
  addSeed(seedData) {
    const { url } = seedData;
    
    // Validate URL
    try {
      new URL(url);
    } catch (error) {
      console.warn(`Invalid seed URL: ${url}`);
      return;
    }
    
    // Don't add duplicates (but update if priority is higher)
    if (this.seeds.has(url)) {
      const existing = this.seeds.get(url);
      if (seedData.priority > existing.priority) {
        this.seeds.set(url, { ...existing, ...seedData });
      }
      return;
    }
    
    this.seeds.set(url, {
      ...seedData,
      addedAt: new Date().toISOString(),
    });
    
    // Track by source
    const source = seedData.source || 'unknown';
    if (!this.sources.has(source)) {
      this.sources.set(source, []);
    }
    this.sources.get(source).push(url);
    
    // Update stats
    this.stats.totalSeeds++;
    if (source === 'github') this.stats.githubSeeds++;
    if (source === 'npm') this.stats.npmSeeds++;
    
    this.emit('seed:added', seedData);
  }

  /**
   * Get all seeds sorted by priority
   */
  getSeeds(options = {}) {
    const {
      source = null,
      minPriority = 0,
      tags = null,
      limit = null,
    } = options;
    
    let seeds = Array.from(this.seeds.values());
    
    // Filter by source
    if (source) {
      seeds = seeds.filter(s => s.source === source);
    }
    
    // Filter by priority
    seeds = seeds.filter(s => (s.priority || 0) >= minPriority);
    
    // Filter by tags
    if (tags && tags.length > 0) {
      seeds = seeds.filter(s => 
        tags.some(tag => s.tags?.includes(tag))
      );
    }
    
    // Sort by priority (descending)
    seeds.sort((a, b) => (b.priority || 0) - (a.priority || 0));
    
    // Limit results
    if (limit) {
      seeds = seeds.slice(0, limit);
    }
    
    return seeds;
  }

  /**
   * Get statistics
   */
  getStats() {
    return {
      ...this.stats,
      sourceBreakdown: Object.fromEntries(
        Array.from(this.sources.entries()).map(([source, urls]) => [
          source,
          urls.length,
        ])
      ),
    };
  }

  /**
   * Export seeds to JSON
   */
  exportSeeds() {
    return {
      seeds: Array.from(this.seeds.values()),
      stats: this.getStats(),
      exportedAt: new Date().toISOString(),
    };
  }
}

export default StorybookSeederService;
