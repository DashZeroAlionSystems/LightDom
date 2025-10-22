# Metaverse NFT System Documentation

## Overview

The LightDom Metaverse NFT System is a comprehensive blockchain-based platform for creating, trading, and managing metaverse items as NFTs. It features user-generated content, procedural animation art, real-time chat bridges, and gamification elements.

## Table of Contents

1. [Architecture](#architecture)
2. [Smart Contracts](#smart-contracts)
3. [LightDOM Encapsulation](#lightdom-encapsulation)
4. [Animation Generator](#animation-generator)
5. [User-Generated Items](#user-generated-items)
6. [Chat Bridge System](#chat-bridge-system)
7. [Chrome Extension](#chrome-extension)
8. [API Endpoints](#api-endpoints)
9. [Usage Examples](#usage-examples)

---

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────┐
│                   Frontend Layer                         │
├─────────────────────────────────────────────────────────┤
│  • React UI Components                                   │
│  • Chrome Extension (Popup, Sidepanel, Chat Bridge)     │
│  • Demo Pages (HTML/CSS/JS)                             │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│                   API Layer                              │
├─────────────────────────────────────────────────────────┤
│  • User Generated Items API                              │
│  • Metaverse Mining API                                  │
│  • Gamification API                                      │
│  • Metaverse Alchemy API                                │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│                   Core Layer                             │
├─────────────────────────────────────────────────────────┤
│  • LightDOM Encapsulation Engine                        │
│  • NFT Animation Generator                               │
│  • Chat Bridge System                                    │
│  • Space Mining Engine                                   │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│                   Blockchain Layer                       │
├─────────────────────────────────────────────────────────┤
│  • MetaverseItemNFT (ERC1155)                           │
│  • MetaverseMarketplace                                  │
│  • VirtualLandNFT (ERC721)                              │
│  • DOMSpaceToken (ERC20)                                │
└─────────────────────────────────────────────────────────┘
```

### Technology Stack

- **Smart Contracts**: Solidity 0.8.19, OpenZeppelin libraries
- **Frontend**: React 19, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express.js, TypeScript
- **Real-time**: WebSocket (Socket.IO)
- **Storage**: IPFS for metadata, PostgreSQL for application data
- **Browser Extension**: Manifest V3, Chrome Extension APIs

---

## Smart Contracts

### MetaverseItemNFT.sol

ERC1155 multi-token contract for metaverse items with user-generated content support.

#### Features

- **Multi-token Standard**: Single contract manages multiple item types
- **8 Item Categories**: Avatar, Environment, Tool, Pet, Building, Vehicle, Art, Special
- **6 Rarity Levels**: Common, Uncommon, Rare, Epic, Legendary, Mythical
- **User-Generated Items**: Users can create custom items with 0.01 ETH fee
- **Mining Power Bonuses**: Each item provides mining efficiency bonuses
- **Supply Control**: Configurable max supply per item
- **Batch Operations**: Efficient batch minting

#### Key Functions

```solidity
// Create admin item
function createItem(
    string memory name,
    string memory description,
    ItemCategory category,
    Rarity rarity,
    uint256 miningPowerBonus,
    uint256 maxSupply,
    string memory animationURI,
    string memory metadataURI
) external onlyOwner returns (uint256)

// Create user-generated item
function createUserItem(
    string memory name,
    string memory description,
    ItemCategory category,
    string memory animationURI,
    string memory metadataURI
) external payable returns (uint256)

// Mint items
function mintItem(
    address to,
    uint256 itemId,
    uint256 amount
) external payable nonReentrant

// Batch mint
function mintBatch(
    address to,
    uint256[] memory itemIds,
    uint256[] memory amounts
) external payable nonReentrant
```

#### Rarity-Based Pricing

| Rarity | Price (ETH) | Mining Power Multiplier |
|--------|-------------|-------------------------|
| Common | 0.001 | 1x |
| Uncommon | 0.005 | 1.5x |
| Rare | 0.01 | 2x |
| Epic | 0.05 | 3x |
| Legendary | 0.1 | 5x |
| Mythical | 0.5 | 10x |

### MetaverseMarketplace.sol

Full-featured NFT marketplace with multiple listing types.

#### Features

- **Fixed Price Sales**: Traditional buy-now listings
- **Auction System**: Time-based bidding with automatic finalization
- **Offer System**: Make and accept offers
- **Platform Fee**: 2.5% on all sales (configurable, max 10%)
- **Multi-NFT Support**: Works with any ERC1155 contract
- **Batch Operations**: List and purchase multiple items

#### Listing Types

```solidity
enum ListingType {
    FixedPrice,    // 0 - Fixed price sale
    Auction,       // 1 - Auction with bids
    Offer          // 2 - Accept offers
}
```

#### Key Functions

```solidity
// Create fixed price listing
function createListing(
    address nftContract,
    uint256 itemId,
    uint256 amount,
    uint256 price,
    uint256 duration
) external returns (uint256)

// Create auction
function createAuction(
    address nftContract,
    uint256 itemId,
    uint256 amount,
    uint256 minBid,
    uint256 duration
) external returns (uint256)

// Buy listing
function buyListing(uint256 listingId, uint256 amount) external payable nonReentrant

// Place bid
function placeBid(uint256 listingId) external payable nonReentrant

// Make offer
function makeOffer(
    uint256 listingId,
    uint256 amount,
    uint256 duration
) external payable

// Accept offer
function acceptOffer(uint256 listingId, uint256 offerIndex) external nonReentrant
```

---

## LightDOM Encapsulation

Shadow DOM-like encapsulation system for Light DOM elements with optimization capabilities.

### Features

- **Isolation**: Prevent style and script leakage
- **Slot System**: Organize content into manageable slots
- **Optimization Levels**: Conservative, Moderate, Aggressive
- **Export/Import**: Serialize for metaverse bridges
- **Mutation Observer**: Track DOM changes
- **Performance Metrics**: Track render time and space saved

### Usage Example

```typescript
import { lightDomEncapsulation } from './core/LightDomEncapsulation';

// Create isolated root
const root = lightDomEncapsulation.createRoot(
  document.getElementById('app'),
  true // isolated
);

// Create slots
const headerSlot = lightDomEncapsulation.createSlot(
  root,
  'header',
  'moderate' // optimization level
);

const contentSlot = lightDomEncapsulation.createSlot(
  root,
  'content',
  'aggressive'
);

// Assign content
const content = document.querySelectorAll('.content-item');
lightDomEncapsulation.assignContent(contentSlot, Array.from(content));

// Export for bridge
const serialized = lightDomEncapsulation.exportRoot(root);
```

### Optimization Levels

| Level | Features | Use Case |
|-------|----------|----------|
| Conservative | Remove comments only | Production content |
| Moderate | Remove comments, whitespace | Standard optimization |
| Aggressive | Remove comments, whitespace, inline styles | Maximum optimization |

---

## Animation Generator

Procedural SVG animation art generator for NFT items.

### Features

- **Procedural Generation**: Create unique art based on item properties
- **Rarity-Based Complexity**: Higher rarity = more complex animations
- **SVG Format**: Scalable vector graphics with animations
- **Category-Specific Shapes**: Different shapes for different item types
- **Color Palettes**: Rarity-based color schemes
- **Seeded Randomness**: Reproducible results

### Usage Example

```typescript
import { nftAnimationGenerator } from './core/NFTAnimationGenerator';

// Generate animation
const animation = nftAnimationGenerator.generateAnimation(
  'Cyber Visor',
  {
    rarity: 'rare',
    category: 'avatar',
    colors: ['#667eea', '#764ba2', '#f093fb'],
    patterns: ['geometric'],
    effects: ['glow']
  },
  12345 // optional seed
);

// Result
console.log(animation.svg); // SVG string
console.log(animation.dataURI); // data:image/svg+xml;base64,...
console.log(animation.metadata); // width, height, duration, complexity

// Generate metadata
const metadata = nftAnimationGenerator.generateMetadata(
  'Cyber Visor',
  'Advanced heads-up display for metaverse navigation',
  {
    rarity: 'rare',
    category: 'avatar',
    colors: [],
    patterns: [],
    effects: []
  },
  animation.dataURI,
  {
    miningPowerBonus: 25,
    wearable: true
  }
);
```

### Animation Complexity

| Rarity | Complexity | Shapes | Animation Duration |
|--------|-----------|--------|-------------------|
| Common | 1 | 5-7 | 2s |
| Uncommon | 2 | 7-9 | 3s |
| Rare | 3 | 9-11 | 4s |
| Epic | 4 | 11-13 | 5s |
| Legendary | 5 | 13-15 | 6s |
| Mythical | 6 | 15+ | 8s |

---

## User-Generated Items

API and workflow for creating custom metaverse items.

### Templates

Pre-defined templates for different item categories:

1. **Avatar Basic**: Wearable items (clothing, accessories)
2. **Tool Basic**: Mining and optimization tools
3. **Pet Basic**: Companion pets with animations
4. **Building Basic**: Structures and buildings
5. **Art Basic**: Decorative art pieces

### Workflow

```
1. Select Template → 2. Customize Item → 3. Preview → 4. Validate → 5. Mint
```

### API Endpoints

```typescript
// Get templates
GET /api/user-items/templates
GET /api/user-items/templates/:id

// Validate item
POST /api/user-items/validate
{
  "templateId": "avatar-basic",
  "itemData": {
    "name": "Custom Helmet",
    "description": "My custom helmet design",
    "colors": ["#ff0000", "#00ff00"],
    "patterns": ["geometric"]
  }
}

// Preview item
POST /api/user-items/preview
{
  "templateId": "avatar-basic",
  "itemData": {...}
}

// Create item
POST /api/user-items/create
{
  "templateId": "avatar-basic",
  "itemData": {...},
  "userAddress": "0x..."
}

// Get user's items
GET /api/user-items/user/:address
```

### Validation Rules

- **Name**: 3-50 characters
- **Description**: 0-500 characters
- **Colors**: Maximum 5 colors
- **Required Fields**: Based on template
- **Content Safety**: No offensive content

---

## Chat Bridge System

Real-time communication through mined storage bridges.

### Features

- **WebSocket Connection**: Real-time bidirectional communication
- **Multi-Bridge Support**: Connect to multiple bridges simultaneously
- **Message Persistence**: Store messages locally
- **Reconnection Logic**: Automatic reconnection with exponential backoff
- **Bridge Capabilities**: Chat, Data Transfer, Asset Sharing, Cross-Chain Computing

### Architecture

```
Chrome Extension → WebSocket Client → WebSocket Server → Bridge Manager
                                                              ↓
                                                        Message Queue
                                                              ↓
                                                        Persistence Layer
```

### Usage in Extension

```javascript
// Initialize
const chatBridge = new ChatBridge();
await chatBridge.initialize();

// Create bridge
const bridge = await chatBridge.createBridge(
  'LightDOM',
  'DigitalRealm',
  'isolated_dom_123'
);

// Connect to bridge
await chatBridge.connectToBridge(bridge.id);

// Send message
chatBridge.sendChatMessage(bridge.id, 'Hello metaverse!');

// Listen for messages
chatBridge.on('chat_message', (message) => {
  console.log('New message:', message);
});

// Get bridge messages
const messages = chatBridge.getBridgeMessages(bridge.id);
```

### Bridge Structure

```typescript
interface Bridge {
  id: string;
  sourceDomain: string;
  targetDomain: string;
  isolatedDomId: string;
  status: 'active' | 'inactive';
  createdAt: number;
  connectedUsers: number;
  capabilities: string[];
}
```

### Message Types

- **chat_message**: User chat messages
- **bridge_status**: Bridge status updates
- **user_joined**: User joined event
- **user_left**: User left event
- **system**: System notifications

---

## Chrome Extension

Enhanced with chat bridge and NFT features.

### New Features

1. **Chat Bridge UI**: Dedicated page for bridge communication
2. **NFT Gallery**: View owned metaverse items
3. **Item Creator**: Create user-generated items
4. **Bridge Selector**: Switch between active bridges
5. **Notification System**: Real-time chat notifications

### New Commands

```json
{
  "open-chat-bridge": {
    "suggested_key": {
      "default": "Ctrl+Shift+B",
      "mac": "Command+Shift+B"
    },
    "description": "Open chat bridge"
  }
}
```

### Files Added

- `extension/chat-bridge.js` - Chat bridge core functionality
- `extension/chat-bridge.html` - Chat bridge UI

---

## API Endpoints

### User-Generated Items API

```
GET    /api/user-items/templates          - Get all templates
GET    /api/user-items/templates/:id      - Get specific template
POST   /api/user-items/validate           - Validate item data
POST   /api/user-items/preview            - Generate preview
POST   /api/user-items/create             - Create new item
GET    /api/user-items/user/:address      - Get user's items
GET    /api/user-items/stats/:itemId      - Get item statistics
```

### Metaverse Mining API

```
GET    /api/metaverse/mining-data         - Get all mining data
POST   /api/metaverse/toggle-mining       - Toggle mining
POST   /api/metaverse/add-task            - Add mining task
GET    /api/metaverse/algorithms          - Get algorithms
GET    /api/metaverse/data-mining         - Get data mining results
GET    /api/metaverse/upgrades            - Get blockchain upgrades
GET    /api/metaverse/biomes              - Get biomes
GET    /api/metaverse/stats               - Get mining stats
GET    /api/metaverse/bridge/:bridgeId    - Get bridge details
GET    /api/metaverse/bridge/:bridgeId/chat - Get bridge chat history
```

---

## Usage Examples

### Complete Item Creation Workflow

```typescript
// 1. Get available templates
const templates = await fetch('/api/user-items/templates').then(r => r.json());

// 2. Validate item data
const validation = await fetch('/api/user-items/validate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    templateId: 'avatar-basic',
    itemData: {
      name: 'Cyber Helmet',
      description: 'Futuristic helmet design',
      colors: ['#667eea', '#764ba2']
    }
  })
}).then(r => r.json());

// 3. Generate preview
const preview = await fetch('/api/user-items/preview', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    templateId: 'avatar-basic',
    itemData: { ... }
  })
}).then(r => r.json());

// 4. Create item (requires payment)
const item = await fetch('/api/user-items/create', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    templateId: 'avatar-basic',
    itemData: { ... },
    userAddress: '0x...'
  })
}).then(r => r.json());
```

### Marketplace Operations

```typescript
// List item for sale
const listing = await marketplace.createListing(
  nftContract,
  itemId,
  amount,
  ethers.utils.parseEther('0.01'), // price
  86400 // duration: 24 hours
);

// Create auction
const auction = await marketplace.createAuction(
  nftContract,
  itemId,
  amount,
  ethers.utils.parseEther('0.001'), // min bid
  86400 // duration: 24 hours
);

// Buy item
await marketplace.buyListing(
  listingId,
  amount,
  { value: totalPrice }
);

// Place bid
await marketplace.placeBid(
  listingId,
  { value: bidAmount }
);
```

### Chat Bridge Integration

```typescript
// In your application
import { chatBridge } from './extension/chat-bridge';

// Create bridge for isolated DOM
const isolatedDom = lightDomEncapsulation.exportRoot(root);
const bridge = await chatBridge.createBridge(
  'MyApp',
  'MetaverseRealm',
  isolatedDom.id
);

// Connect and chat
await chatBridge.connectToBridge(bridge.id);
chatBridge.sendChatMessage(bridge.id, 'Connected to metaverse!');

// Listen for responses
chrome.runtime.onMessage.addListener((request) => {
  if (request.type === 'chat_bridge_event') {
    if (request.event === 'chat_message') {
      console.log('New message:', request.data);
    }
  }
});
```

---

## Security Considerations

### Smart Contracts

1. **ReentrancyGuard**: Prevents reentrancy attacks
2. **Access Control**: Owner-only functions for critical operations
3. **Input Validation**: All inputs validated
4. **Safe Math**: Using Solidity 0.8+ built-in overflow protection
5. **Audited Libraries**: OpenZeppelin contracts

### API

1. **Rate Limiting**: Prevent abuse
2. **Input Sanitization**: XSS prevention
3. **Authentication**: Required for sensitive operations
4. **CORS**: Properly configured
5. **Content Validation**: Check for offensive content

### Chrome Extension

1. **Content Security Policy**: Restrict inline scripts
2. **Permissions**: Minimal required permissions
3. **Sandboxing**: Isolated execution contexts
4. **Secure Communication**: Message validation

---

## Performance Optimization

### LightDOM Encapsulation

- **Lazy Loading**: Load slots on demand
- **Content Optimization**: Remove unnecessary elements
- **Style Containment**: Prevent style recalculation
- **Layout Isolation**: Contain layout shifts

### Animation Generator

- **Seeded Randomness**: Reproducible results
- **SVG Optimization**: Minimal file size
- **Animation Caching**: Cache generated animations
- **Progressive Rendering**: Load animations progressively

### Chat Bridge

- **Message Batching**: Reduce WebSocket overhead
- **Local Storage**: Cache recent messages
- **Reconnection Backoff**: Prevent server overload
- **Message Compression**: Reduce bandwidth usage

---

## Future Enhancements

1. **Cross-Chain Support**: Bridge to other blockchains (Polygon, BSC, etc.)
2. **Advanced Animations**: 3D models, particle effects
3. **Item Crafting**: Combine items to create new ones
4. **Guild System**: Team-based features
5. **Governance**: DAO for platform decisions
6. **Mobile App**: Native iOS/Android applications
7. **VR/AR Support**: Immersive metaverse experience
8. **AI-Generated Art**: ML-based item generation

---

## Support and Resources

- **Demo**: [metaverse-nft-demo.html](./metaverse-nft-demo.html)
- **API Documentation**: See inline JSDoc comments
- **Smart Contracts**: See contracts/ directory
- **GitHub Issues**: [Report bugs](https://github.com/DashZeroAlionSystems/LightDom/issues)

---

## License

MIT License - See LICENSE file for details
