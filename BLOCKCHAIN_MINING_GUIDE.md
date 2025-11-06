# 🚀 LightDOM Blockchain Mining System

## Overview

The LightDOM Blockchain Mining System enables you to mine LDOM tokens by optimizing websites and harvesting DOM space. The system combines web crawling, DOM optimization analysis, and blockchain mining to create a unique Proof of Optimization (PoO) consensus mechanism.

## 🎯 How It Works

1. **Web Crawling**: The system crawls websites to analyze their DOM structure
2. **Optimization Analysis**: Identifies unused CSS, orphaned JavaScript, and redundant DOM elements
3. **Space Harvesting**: Calculates how much space can be saved through optimization
4. **Block Mining**: Bundles optimizations into blocks using Proof of Work
5. **Token Rewards**: Miners earn LDOM tokens based on space optimized
6. **Training Data**: Collected data trains ML models for better optimization

## 🛠️ Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Start Local Blockchain

```bash
npm run blockchain:start
```

This starts a local Hardhat node on http://localhost:8545

### 3. Deploy Smart Contracts

In a new terminal:

```bash
npm run blockchain:compile
npm run mining:deploy
```

This will:
- Compile the smart contracts
- Deploy ProofOfOptimization and LightDomToken contracts
- Initialize the mining system
- Start mining automatically

### 4. Start Mining API (Alternative)

If you want to run just the mining API:

```bash
npm run mining:start
```

Access the API at http://localhost:3002

## 📊 Mining Dashboard

View the mining dashboard in your browser:

1. Start the frontend:
```bash
npm run dev
```

2. Navigate to: http://localhost:3000/mining

The dashboard shows:
- Sites optimized
- Space saved
- Blocks mined
- LDOM tokens earned
- Mining performance metrics
- Recent blocks

## ⛏️ Mining Process

### Block Structure

Each block contains:
- **Index**: Block number in the chain
- **Timestamp**: When the block was mined
- **Previous Hash**: Link to previous block
- **Hash**: Current block hash
- **Nonce**: Proof of Work nonce
- **Difficulty**: Current mining difficulty
- **Optimizations**: Array of website optimizations
- **Miner**: Address of the miner
- **Reward**: LDOM tokens earned
- **Space Optimized**: Total bytes saved

### Mining Rewards

Rewards are calculated based on:
- **Base Reward**: 50 LDOM per block
- **Space Bonus**: 1 LDOM per 100KB optimized
- **Optimization Bonus**: 5 LDOM per optimization
- **Halving**: Rewards halve every 100,000 blocks

### Difficulty Adjustment

The system adjusts difficulty to maintain ~15 second block times:
- If blocks are mined too fast (< 7.5s), difficulty increases
- If blocks are mined too slow (> 30s), difficulty decreases
- Difficulty ranges from 1 to 6

## 🌐 Supported Optimizations

### 1. Unused CSS Detection
- Identifies CSS selectors not used in the DOM
- Calculates potential space savings
- Provides removal recommendations

### 2. Orphaned JavaScript
- Detects script files not referenced
- Identifies dead code paths
- Suggests consolidation strategies

### 3. Redundant DOM Elements
- Finds empty or unnecessary elements
- Identifies duplicate structures
- Recommends simplification

### 4. Schema.org Optimization
- Extracts structured data
- Identifies missing schemas
- Suggests SEO improvements

## 📈 Training Data Collection

The system collects data for ML model training:

### Data Types
- **Optimization Patterns**: What works for different site types
- **Domain Statistics**: Performance by domain
- **Temporal Patterns**: When optimizations are most effective
- **Technique Effectiveness**: Which methods save the most space

### Export Format
```json
{
  "metadata": {
    "exportTime": "2023-...",
    "systemVersion": "1.0.0",
    "statistics": {...}
  },
  "miningData": {
    "blocks": [...],
    "optimizations": [...],
    "patterns": {...}
  },
  "seoInsights": {
    "weakSEOSites": [...],
    "recommendations": [...]
  }
}
```

### Using Training Data

1. **Export data**:
```bash
curl -X POST http://localhost:3002/api/mining/export-training-data
```

2. **Access exported files**:
- Raw data: `./training-data/raw/`
- Processed data: `./training-data/processed/`
- SEO reports: `./training-data/reports/`

## 🔧 API Endpoints

### Mining Control

**Get Mining Status**
```bash
GET /api/mining/stats
```

**Start Mining**
```bash
POST /api/mining/start
```

**Stop Mining**
```bash
POST /api/mining/stop
```

### Data Access

**Get Recent Blocks**
```bash
GET /api/mining/blocks/recent?limit=10
```

**Get Training Data**
```bash
GET /api/mining/training-data
```

**Get SEO Insights**
```bash
GET /api/mining/seo-insights
```

### Manual Submission

**Submit Optimization**
```bash
POST /api/mining/submit-optimization
{
  "url": "https://example.com",
  "spaceSaved": 50000,
  "optimizations": [
    {
      "type": "unused_css",
      "count": 25,
      "potentialSavings": 30000
    }
  ]
}
```

## 🎯 SEO Service Integration

The mining system provides SEO insights for websites:

### Weak SEO Detection
- Missing Schema.org data
- Excessive DOM size
- Low backlink count
- Poor optimization

### Recommendations Generated
- Schema implementation guides
- DOM optimization strategies
- Backlink building suggestions
- Performance improvements

### SEO Report Example
```markdown
# SEO Analysis Report

## Sites with Weak SEO
1. example.com
   - Space Wasted: 245 KB
   - Missing Schema: Yes
   - Backlinks: 3

## Recommendations
- Implement JSON-LD schema
- Optimize DOM structure
- Build quality backlinks
```

## 🔌 Extension Integration

The mined data powers the browser extension:

1. **Optimization Injection**: Apply learned optimizations to any site
2. **Chat Integration**: Inject chat functionality into optimized sites
3. **Real-time Analysis**: Show optimization potential while browsing
4. **One-click Mining**: Mine sites directly from the extension

## 📊 Metaverse Infrastructure

Mining generates virtual infrastructure:

### Virtual Land
- 1 parcel per 100KB optimized
- Different biomes based on site type
- Used for metaverse visualization

### AI Nodes
- 1 node per 1MB optimized
- Provides consensus for optimization verification
- Powers ML model training

### Storage Shards
- 1 shard per 500KB optimized
- Stores optimization artifacts
- Enables decentralized data access

### Dimensional Bridges
- 1 bridge per 2MB optimized
- Connects different blockchain networks
- Enables cross-chain optimization

## 🛡️ Security Considerations

### Smart Contract Security
- ProofOfOptimization uses challenge windows
- Prevents duplicate proof submissions
- Owner-controlled dispute resolution

### Mining Security
- Rate limiting on API endpoints
- Proof verification before rewards
- Merkle tree validation

### Data Privacy
- No personal data collected
- Only public website data analyzed
- Opt-out available via robots.txt

## 🚀 Advanced Configuration

### Custom Seed URLs
Edit `start-mining.js`:
```javascript
seedUrls: [
  'https://your-site.com',
  'https://another-site.com'
]
```

### Mining Parameters
```javascript
miningConfig: {
  miningInterval: 30000,        // Time between mining attempts
  minOptimizationsPerBlock: 3,  // Min optimizations per block
  targetBlockTime: 15000,       // Target time per block
  maxConcurrency: 3             // Parallel crawlers
}
```

### Training Data Export
```javascript
exportInterval: 300000  // Export every 5 minutes
```

## 📈 Performance Optimization

### For Better Mining Performance
1. Increase crawler concurrency (uses more resources)
2. Reduce request delay (be respectful of sites)
3. Lower minimum optimizations per block
4. Adjust difficulty ranges

### For Better Optimization Detection
1. Add more seed URLs
2. Increase crawl depth
3. Enable schema extraction
4. Track backlink networks

## 🎯 Use Cases

### 1. Website Optimization Service
- Analyze client websites
- Generate optimization reports
- Provide before/after metrics
- Track improvements over time

### 2. SEO Consulting
- Identify SEO weaknesses
- Generate actionable recommendations
- Monitor competitor optimizations
- Track industry trends

### 3. Training ML Models
- Collect real-world optimization data
- Train models for better detection
- Improve optimization algorithms
- Predict optimization potential

### 4. Browser Extension Development
- Power real-time optimization
- Enable one-click improvements
- Inject optimized chat interfaces
- Provide instant SEO insights

## 🤝 Contributing

### Adding New Optimization Types
1. Edit `crawler/RealWebCrawlerSystem.js`
2. Add detection method
3. Calculate space savings
4. Update reward calculations

### Improving Mining Algorithm
1. Edit `blockchain/LightDomMiningSystem.js`
2. Adjust proof of work
3. Optimize block structure
4. Enhance difficulty adjustment

### Enhancing Training Data
1. Edit `blockchain/IntegratedOptimizationMiner.js`
2. Add new pattern analysis
3. Improve SEO insights
4. Export additional metrics

---

## 📚 Additional Resources

- [Smart Contract Documentation](contracts/README.md)
- [Crawler System Guide](crawler/README.md)
- [API Documentation](docs/api.md)
- [Extension Development](extension/README.md)

---

**Happy Mining! ⛏️💎**
