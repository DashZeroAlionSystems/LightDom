# NFT Metaverse Creatures & Objects System

## Overview

The LightDom NFT Metaverse Creatures & Objects system allows users to create, own, and trade unique animated NFT entities with AI-generated backstories. All entities are part of a coherent metaverse with interconnected lore, factions, locations, and historical events.

## Features

### 1. AI-Powered Lore Generation
- **Coherent Narratives**: All entities share the same metaverse world
- **Dynamic Backstories**: Automatically generated based on category, rarity, and attributes
- **Interconnected Lore**: Entities reference factions, locations, and historical events
- **Flavor Text**: Memorable quotes that capture the essence of each entity

### 2. Smart Contract (MetaverseCreatureNFT.sol)
- **ERC721 Standard**: Unique, non-fungible tokens
- **Two Entity Types**:
  - Creatures (Companions, Mounts, Guardians, Harvesters, Mystical, Mechanical)
  - Objects (Tools, Weapons, Armor, Artifacts, Vehicles, Buildings)
- **Rarity System**: Common, Uncommon, Rare, Epic, Legendary, Mythical
- **Dynamic Attributes**:
  - Mining Power
  - Speed Bonus
  - Defense Rating
  - Magic Power
  - Intelligence
  - Charisma
- **Leveling System**: Levels 1-10 with experience requirements
- **Benefits Tracking**:
  - DSH mined
  - Optimizations performed
  - Auction sales
  - Rental income
  - Prestige points

### 3. User Interface Components

#### CreatureCreator Component
A beautiful React interface for creating NFT entities:
- **Entity Type Selection**: Choose between creature or object
- **AI Lore Generation**: One-click backstory generation
- **Category Selection**: Choose from 6 creature or 6 object categories
- **Rarity Selection**: Common to Mythical with dynamic pricing
- **Attribute Selection**: Choose primary attribute (Mining, Speed, Defense, etc.)
- **Visual Assets**: Upload images and animations
- **Live Preview**: See generated lore before minting
- **Cost Calculator**: Real-time ETH cost estimation

#### Chrome Extension Integration
- **Sidepanel Widget**: Quick access to creatures and marketplace
- **Metrics Display**: Show entity count and DSH earned
- **Quick Actions**: Create entity or browse marketplace buttons
- **Benefits Summary**: Mining boost, speed bonus, earnings, prestige

### 4. API Endpoints

Base URL: `http://localhost:3001/api/metaverse-creature`

#### Lore Generation
```
POST /generate-lore
Body: {
  entityType: 'creature' | 'object',
  category: string,
  rarity: string,
  primaryAttribute: string,
  customName?: string
}
Response: { success: true, lore: CreatureLore | ObjectLore }
```

#### World Information
```
GET /world
Response: { success: true, world: MetaverseWorld }
```

#### Create Entity
```
POST /create
Body: {
  owner: string,
  name: string,
  isCreature: boolean,
  category: string,
  rarity: string,
  primaryAttribute: string,
  lore: object,
  imageURI?: string,
  animationURI?: string
}
Response: { success: true, tokenId: string, entity: CreatureEntity }
```

#### Get Entity
```
GET /entity/:tokenId
Response: { success: true, entity: CreatureEntity }
```

#### Get User's Entities
```
GET /user/:address
Response: { success: true, count: number, entities: CreatureEntity[] }
```

#### Add Experience
```
POST /add-experience
Body: { tokenId: string, experience: number }
Response: { success: true, entity: CreatureEntity }
```

#### Record Benefits
```
POST /record-benefit
Body: {
  tokenId: string,
  benefitType: 'mining' | 'optimization' | 'auction' | 'rental' | 'prestige',
  amount: number
}
Response: { success: true, benefits: Benefits }
```

#### Create Auction
```
POST /auction/create
Body: {
  tokenId: string,
  seller: string,
  listingType: 'fixed' | 'auction' | 'rental',
  price?: number,
  minBid?: number,
  duration: number,
  rentalPricePerDay?: number
}
Response: { success: true, listingId: string, listing: AuctionListing }
```

#### Place Bid
```
POST /auction/bid
Body: { listingId: string, bidder: string, bidAmount: number }
Response: { success: true, listing: AuctionListing }
```

#### Get Active Listings
```
GET /auction/listings
Response: { success: true, count: number, listings: Array }
```

#### Get Analytics
```
GET /analytics/:address
Response: {
  success: true,
  analytics: {
    totalEntities: number,
    totalValue: number,
    totalBenefits: object,
    categoryBreakdown: object,
    rarityBreakdown: object,
    averageLevel: number,
    totalUsageTime: number
  }
}
```

#### Get All Entities (Paginated)
```
GET /entities?page=1&limit=20&category=&rarity=
Response: {
  success: true,
  page: number,
  limit: number,
  total: number,
  totalPages: number,
  entities: CreatureEntity[]
}
```

## Metaverse World Structure

### Theme: Digital Enlightenment
The LightDom Metaverse is a vast digital realm where data becomes reality and optimization is power.

### Factions
1. **The Optimizers** - Masters of DOM manipulation and space harvesting
2. **The Hash Guild** - Guardians of blockchain integrity
3. **The Bloat Collective** - Entities that thrive on redundant data
4. **The Metaverse Architects** - Builders and creators of digital worlds

### Legendary Locations
1. **The Optimization Nexus** - Where optimal code converges into pure light
2. **Hash Mountains** - Towering peaks of cryptographic complexity
3. **The Data Plains** - Endless fields of flowing information
4. **Cache Forests** - Dense woodlands of temporary storage
5. **Memory Valleys** - Deep canyons carved by stored information

### Historical Events
1. **The Great Optimization** - When harvesters discovered DOM-to-value conversion
2. **The Bloat Wars** - Conflict between efficiency and excess
3. **The Hash Convergence** - When all factions agreed to blockchain verification

## Benefits for Users

### 1. Mining Enhancement
- **Mining Power Boost**: Increase DOM optimization efficiency
- **Passive Earnings**: Earn DSH while entities are active
- **Multiplier Effects**: Stack multiple entities for compound benefits

### 2. Trading & Economy
- **Marketplace Trading**: Buy and sell entities
- **Auction System**: Fixed price, auction, or rental listings
- **Rental Income**: Rent entities to other users for passive income
- **Value Appreciation**: Rare and high-level entities increase in value

### 3. Progression System
- **Experience Gain**: Entities level up through use
- **Attribute Growth**: Stats increase with each level
- **Prestige Points**: Accumulated through achievements
- **Evolution**: Higher levels unlock special abilities

### 4. Social Features
- **Collections**: Build themed entity collections
- **Faction Alignment**: Choose which faction to support
- **Leaderboards**: Compete for top entity rankings
- **Trading Community**: Connect with other collectors

## Pricing Structure

### Creation Fees (Base)
- **Creatures**: 0.02 ETH
- **Objects**: 0.015 ETH

### Rarity Multipliers
- Common: 1x
- Uncommon: 1.5x
- Rare: 2x
- Epic: 3x
- Legendary: 5x
- Mythical: 10x

**Example**: Creating a Legendary creature = 0.02 ETH × 5 = 0.1 ETH

## Technical Architecture

### Smart Contracts
- **Contract**: MetaverseCreatureNFT.sol
- **Standard**: ERC721 with extensions
- **Network**: Ethereum/Polygon
- **Features**: Enumerable, burnable, pausable

### Backend Services
- **Lore Generator**: MetaverseLoreGenerator.ts
- **API Layer**: metaverseCreatureApi.ts
- **Storage**: PostgreSQL (recommended) or in-memory

### Frontend Components
- **Creator UI**: CreatureCreator.tsx
- **Styling**: CreatureCreator.css
- **Framework**: React 18+ with Ant Design
- **State**: Local state with form validation

### Chrome Extension
- **Integration**: sidepanel.html + sidepanel.js
- **Communication**: Chrome message passing API
- **Storage**: Chrome local storage
- **Updates**: Real-time metrics via polling

## Usage Examples

### Example 1: Create a Mining Companion
```javascript
// Generate lore
const loreResponse = await fetch('/api/metaverse-creature/generate-lore', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    entityType: 'creature',
    category: 'Harvester',
    rarity: 'Rare',
    primaryAttribute: 'Mining'
  })
});
const { lore } = await loreResponse.json();

// Create entity
const createResponse = await fetch('/api/metaverse-creature/create', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    owner: userAddress,
    name: lore.name,
    isCreature: true,
    category: 'Harvester',
    rarity: 'Rare',
    primaryAttribute: 'Mining',
    lore
  })
});
const { tokenId } = await createResponse.json();
```

### Example 2: List Entity for Auction
```javascript
const response = await fetch('/api/metaverse-creature/auction/create', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    tokenId: 'LDME-1234567890',
    seller: userAddress,
    listingType: 'auction',
    minBid: 0.05,
    duration: 86400000 // 24 hours
  })
});
```

### Example 3: Add Experience After Mining
```javascript
// After successful mining session
await fetch('/api/metaverse-creature/add-experience', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    tokenId: activeCreature.tokenId,
    experience: 50 // Based on mining performance
  })
});

// Record benefits
await fetch('/api/metaverse-creature/record-benefit', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    tokenId: activeCreature.tokenId,
    benefitType: 'mining',
    amount: dshEarned
  })
});
```

## Integration Checklist

### Backend Setup
- [ ] Deploy MetaverseCreatureNFT.sol smart contract
- [ ] Add metaverseCreatureApi router to Express server
- [ ] Configure database (if not using in-memory storage)
- [ ] Set up IPFS for image/animation storage
- [ ] Configure environment variables

### Frontend Setup
- [ ] Add CreatureCreator component to routing
- [ ] Import MetaverseLoreGenerator service
- [ ] Configure API endpoint URLs
- [ ] Add marketplace page
- [ ] Set up wallet connection

### Chrome Extension
- [ ] Update manifest permissions if needed
- [ ] Test sidepanel integration
- [ ] Configure API endpoints
- [ ] Add error handling

## Future Enhancements

1. **Breeding System**: Combine two entities to create offspring
2. **Quests & Missions**: Entities can complete tasks for rewards
3. **Guild System**: Form guilds with other users
4. **Seasonal Events**: Limited-time entities and events
5. **Cross-Chain Support**: Bridge entities to other blockchains
6. **3D Visualization**: View entities in 3D metaverse space
7. **AI Companions**: Entities provide AI assistance
8. **Staking Rewards**: Stake entities for additional yields

## Support & Documentation

- **GitHub Repository**: https://github.com/DashZeroAlionSystems/LightDom
- **API Documentation**: See inline JSDoc comments
- **Smart Contract**: Verified on Etherscan
- **Community**: Discord server (link TBD)

## License

MIT License - See LICENSE file for details

---

**Created by**: Claude Code
**Version**: 1.0.0
**Last Updated**: 2025-10-23
