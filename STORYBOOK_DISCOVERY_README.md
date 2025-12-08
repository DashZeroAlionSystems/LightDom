# Storybook Discovery and Mining System

Complete system for discovering, crawling, and mining Storybook component libraries from the internet.

## Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Architecture](#architecture)
4. [Quick Start](#quick-start)
5. [Configuration](#configuration)
6. [API Reference](#api-reference)
7. [CLI Usage](#cli-usage)
8. [Examples](#examples)
9. [Advanced Usage](#advanced-usage)

## Overview

The Storybook Discovery and Mining System automatically discovers Storybook instances on the internet and extracts:

- Component definitions and props
- Story configurations and variations
- Design tokens and styles
- Interaction tests and play functions
- Documentation and examples
- Accessibility information

## Features

### Discovery
- **Automatic URL Seeding**: Generate seed URLs from GitHub, NPM, and known sources
- **Intelligent Detection**: Detect Storybook instances via DOM inspection and API access
- **Related URL Discovery**: Find additional Storybook instances from crawled pages
- **Priority-based Crawling**: Focus on high-quality, popular component libraries

### Mining
- **Component Extraction**: Extract complete component definitions
- **Props Analysis**: Analyze component props and argTypes
- **Story Collection**: Collect all story variations
- **Style Mining**: Extract CSS and design tokens
- **Test Extraction**: Capture interaction tests
- **Documentation**: Pull component documentation

### Generation
- **Storybook Generation**: Generate complete Storybook instances from mined data
- **Multi-framework Support**: Support for React, Vue, Angular, and more
- **Preserves Structure**: Maintains original component organization
- **Adds Metadata**: Includes mining source and metadata

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  Storybook Discovery System              │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌────────────────┐     ┌──────────────────┐           │
│  │ Seeder Service │────▶│ Discovery Service│           │
│  └────────────────┘     └──────────────────┘           │
│         │                        │                       │
│         │                        │                       │
│         ▼                        ▼                       │
│  ┌────────────────────────────────────────┐             │
│  │        Storybook Crawler               │             │
│  │  ┌──────────────────────────────────┐  │             │
│  │  │  Component Extraction            │  │             │
│  │  │  Story Collection                │  │             │
│  │  │  Props Analysis                  │  │             │
│  │  │  Style Mining                    │  │             │
│  │  └──────────────────────────────────┘  │             │
│  └────────────────────────────────────────┘             │
│         │                                                │
│         ▼                                                │
│  ┌────────────────────────────────────────┐             │
│  │          Storage Layer                  │             │
│  │  - Database (PostgreSQL)                │             │
│  │  - Filesystem                           │             │
│  │  - Object Storage                       │             │
│  └────────────────────────────────────────┘             │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Run Discovery with Default Settings

```bash
# Using CLI
node scripts/storybook-discovery-cli.js discover --template quick

# Or using API
curl -X POST http://localhost:3001/api/storybook-discovery/start \
  -H "Content-Type: application/json" \
  -d '{"maxSeeds": 50}'
```

### 3. View Results

```bash
# Check statistics
node scripts/storybook-discovery-cli.js stats

# View crawled data
ls -la ./storybook-discoveries/
```

## Configuration

### Configuration File

Create `config/storybook-discovery-config.json`:

```json
{
  "discovery": {
    "enabled": true,
    "searchEngines": ["github", "npm", "known"],
    "targetPatterns": [
      "**/storybook/**",
      "**/?path=/story/**"
    ]
  },
  "mining": {
    "enabled": true,
    "componentTypes": ["Button", "Input", "Card"],
    "maxComponentsPerSite": 100
  },
  "crawler": {
    "maxConcurrency": 3,
    "maxDepth": 2,
    "requestDelay": 2000
  },
  "seeding": {
    "enabled": true,
    "autoDiscovery": true
  }
}
```

### Using Templates

Pre-configured templates are available:

- **quick**: Fast scan of popular libraries
- **deep**: Comprehensive extraction
- **react**: React-focused discovery
- **material**: Material Design focus
- **designSystems**: Complete design systems
- **openSource**: GitHub open source libraries
- **testing**: Extract interaction tests
- **custom**: Minimal base configuration

List all templates:

```bash
node scripts/storybook-discovery-cli.js templates
```

## API Reference

### Start Discovery

```bash
POST /api/storybook-discovery/start
```

**Request:**
```json
{
  "sessionId": "my-session",
  "maxSeeds": 50,
  "discover": true,
  "config": {
    "maxConcurrency": 3
  }
}
```

**Response:**
```json
{
  "success": true,
  "sessionId": "my-session",
  "message": "Storybook discovery started",
  "status": "running"
}
```

### Get Statistics

```bash
GET /api/storybook-discovery/stats?sessionId=my-session
```

**Response:**
```json
{
  "success": true,
  "stats": {
    "instancesCrawled": 15,
    "componentsMined": 234,
    "storiesExtracted": 567,
    "errors": 2
  }
}
```

### Generate Seeds

```bash
POST /api/storybook-discovery/seeds/generate
```

**Response:**
```json
{
  "success": true,
  "seeds": [
    {
      "url": "https://storybook.js.org/showcase",
      "priority": 10,
      "source": "known",
      "tags": ["official", "showcase"]
    }
  ],
  "total": 150,
  "stats": {
    "githubSeeds": 80,
    "npmSeeds": 50,
    "webSeeds": 20
  }
}
```

### Crawl Specific URL

```bash
POST /api/storybook-discovery/crawl
```

**Request:**
```json
{
  "url": "https://primer.style/react/storybook",
  "sessionId": "my-session"
}
```

### Get Crawled Data

```bash
GET /api/storybook-discovery/data?sessionId=my-session&format=json
```

### Stop Crawler

```bash
POST /api/storybook-discovery/stop
```

**Request:**
```json
{
  "sessionId": "my-session"
}
```

## CLI Usage

### Discover Storybooks

```bash
# Quick discovery
node scripts/storybook-discovery-cli.js discover --template quick

# Deep mining
node scripts/storybook-discovery-cli.js discover --template deep --max-seeds 100

# Custom output directory
node scripts/storybook-discovery-cli.js discover --output ./my-discoveries
```

### Generate Seeds

```bash
# Generate from all sources
node scripts/storybook-discovery-cli.js seeds --github --npm --known

# GitHub only
node scripts/storybook-discovery-cli.js seeds --github --output seeds-github.json
```

### Crawl Specific URL

```bash
node scripts/storybook-discovery-cli.js crawl \
  --url https://storybook.js.org \
  --depth 3 \
  --output ./storybook-official
```

### Detect Storybook

```bash
node scripts/storybook-discovery-cli.js detect \
  --url https://example.com
```

### View Statistics

```bash
node scripts/storybook-discovery-cli.js stats \
  --directory ./storybook-discoveries
```

## Examples

### Example 1: Discover React Component Libraries

```javascript
import { StorybookCrawler } from './services/storybook-crawler.js';
import { mergeConfig } from './config/storybook-crawler-templates.js';

const config = mergeConfig('react', {
  crawler: {
    maxConcurrency: 5,
  },
  seeding: {
    initialSeeds: [
      {
        url: 'https://github.com/topics/react-components',
        priority: 10,
      },
    ],
  },
});

const crawler = new StorybookCrawler(config);

await crawler.start({
  maxSeeds: 100,
  discover: true,
});

const data = crawler.getCrawledData();
console.log(`Mined ${data.length} Storybook instances`);

await crawler.close();
```

### Example 2: Generate Seeds from GitHub

```javascript
import { StorybookSeederService } from './services/storybook-seeder-service.js';

const seeder = new StorybookSeederService({
  enableGithub: true,
  githubToken: process.env.GITHUB_TOKEN,
});

await seeder.generateSeeds();

const seeds = seeder.getSeeds({
  minPriority: 7,
  limit: 50,
});

console.log(`Generated ${seeds.length} high-priority seeds`);
```

### Example 3: Crawl and Export Data

```javascript
import { StorybookDiscoveryService } from './services/storybook-discovery-service.js';

const discovery = new StorybookDiscoveryService({
  outputDir: './discoveries',
});

await discovery.initialize();

await discovery.start([
  'https://storybook.js.org/showcase',
  'https://component.gallery',
]);

// Export discovered instances
const exportPath = await discovery.exportDiscovered('json');
console.log(`Exported to ${exportPath}`);

await discovery.close();
```

### Example 4: Monitor Discovery Progress

```javascript
import { StorybookCrawler } from './services/storybook-crawler.js';

const crawler = new StorybookCrawler();

crawler.on('instance:crawled', ({ url, data }) => {
  console.log(`✅ Crawled: ${url}`);
  console.log(`   Components: ${data.components.length}`);
  console.log(`   Stories: ${data.stories.length}`);
});

await crawler.start({ maxSeeds: 20 });
```

## Advanced Usage

### Custom Detection Patterns

```javascript
const discovery = new StorybookDiscoveryService({
  detectionPatterns: {
    domSelectors: [
      '#custom-storybook-root',
      '.my-component-library',
    ],
    scriptPatterns: [
      /custom-storybook/i,
    ],
  },
});
```

### Database Integration

```javascript
import { Pool } from 'pg';

const db = new Pool({
  host: 'localhost',
  database: 'storybook_mining',
  user: 'postgres',
  password: 'password',
});

const crawler = new StorybookCrawler({
  db,
  storage: {
    database: {
      enabled: true,
      tables: {
        storybookInstances: 'storybook_instances',
        minedComponents: 'mined_components',
      },
    },
  },
});
```

### Event Handling

```javascript
crawler.on('instance:mined', ({ url, data }) => {
  console.log(`Mined: ${url}`);
});

crawler.on('component:extracted', ({ component }) => {
  console.log(`Component: ${component.name}`);
});

crawler.on('error', ({ error, url }) => {
  console.error(`Error at ${url}:`, error);
});
```

### Parallel Processing

```javascript
const crawler = new StorybookCrawler({
  maxConcurrency: 10, // 10 parallel workers
  requestDelay: 1000,  // 1 second between requests
});
```

### Rate Limiting

```javascript
const seeder = new StorybookSeederService({
  maxSeedsPerSource: 200,
  enableGithub: true,
  enableNpm: true,
});

// Respect GitHub API rate limits
if (process.env.GITHUB_TOKEN) {
  seeder.config.githubToken = process.env.GITHUB_TOKEN;
}
```

## Best Practices

1. **Use Templates**: Start with pre-configured templates and customize
2. **Set Reasonable Limits**: Use `maxSeeds` and `maxDepth` to control scope
3. **Monitor Progress**: Listen to events for real-time feedback
4. **Handle Errors**: Implement error handling for failed crawls
5. **Respect Rate Limits**: Add delays between requests
6. **Save Incrementally**: Export data periodically during long crawls
7. **Use Database**: Store results in database for large-scale mining

## Troubleshooting

### Puppeteer Installation

If Puppeteer fails to download Chrome:

```bash
PUPPETEER_SKIP_DOWNLOAD=true npm install
```

### GitHub API Rate Limits

Set a GitHub token to increase rate limits:

```bash
export GITHUB_TOKEN=your_github_token
```

### Memory Issues

For large crawls, reduce concurrency:

```javascript
const crawler = new StorybookCrawler({
  maxConcurrency: 2,
  maxComponentsPerSite: 50,
});
```

## License

MIT
