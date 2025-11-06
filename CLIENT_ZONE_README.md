# Client Zone Feature

## Overview

The Client Zone is a comprehensive dashboard for users to view their mining statistics and purchase metaverse items that can be added to chat rooms through the Chrome extension.

## Features

### 1. Mining Statistics Dashboard

The Client Zone displays real-time mining data including:

- **Total Coins**: Total DSH tokens earned from mining activities
- **Mining Rate**: Current earning rate per hour
- **Space Saved**: Total bytes saved through DOM optimization
- **Optimizations Count**: Number of completed optimizations
- **Current Session**: Track current mining session with time elapsed and coins earned
- **Mining History**: View daily, weekly, and monthly earnings

### 2. Metaverse Item Marketplace

Browse and purchase metaverse items with the following features:

- **Category Filtering**: Filter items by category (furniture, decoration, effect, avatar, background)
- **Item Details**: View item name, description, features, and rarity
- **Rarity System**: Items are categorized as common, rare, epic, or legendary
- **Quick Purchase**: Buy items directly with DSH tokens
- **Inventory Management**: View purchased items in your inventory

#### Available Categories

- **Furniture**: Tables, chairs, platforms for chat rooms
- **Decoration**: Visual enhancements like lights and holograms
- **Effect**: Special effects like glows and shields
- **Avatar**: Appearance modifications for user avatars
- **Background**: Full-page background themes

### 3. Chrome Extension Integration

The Chrome extension enables seamless integration with chat rooms:

- **Purchase Notifications**: Receive notifications when items are purchased
- **Quick Add to Page**: Add purchased items to the current page/chat room with one click
- **Item Rendering**: Items are automatically rendered in chat rooms with animations
- **Persistent Storage**: Items are stored locally and synced across sessions

## API Endpoints

### GET `/api/client/mining-stats`
Fetch current mining statistics for the client

**Response:**
```json
{
  "success": true,
  "data": {
    "totalCoins": 1250.75,
    "miningRate": 45.5,
    "spaceSaved": 2547890,
    "optimizationsCount": 127,
    "currentSession": {
      "startTime": 1234567890,
      "coinsEarned": 45.5,
      "timeElapsed": 3600
    },
    "history": {
      "daily": 120.25,
      "weekly": 785.50,
      "monthly": 3250.75
    }
  }
}
```

### GET `/api/client/marketplace-items`
Get available items in the metaverse marketplace

**Query Parameters:**
- `category` (optional): Filter by category (furniture, decoration, effect, avatar, background)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "item-001",
      "name": "Neon Light Strip",
      "description": "Colorful animated light strip for chat room ambiance",
      "category": "decoration",
      "price": 50,
      "features": ["RGB Color Control", "Animated Effects", "Low Power Usage"],
      "rarity": "common"
    }
  ]
}
```

### GET `/api/client/inventory`
Get user's purchased items inventory

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "purchase-001",
      "itemId": "item-001",
      "item": { /* item details */ },
      "purchasedAt": 1234567890,
      "status": "active"
    }
  ]
}
```

### POST `/api/client/purchase-item`
Purchase a metaverse item

**Request Body:**
```json
{
  "itemId": "item-001"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "item": { /* purchased item */ },
    "remainingCoins": 1200.75
  },
  "message": "Item purchased successfully"
}
```

### POST `/api/client/simulate-mining`
Simulate mining activity (for testing/demo purposes)

**Request Body:**
```json
{
  "coins": 100,
  "spaceSaved": 5000
}
```

### POST `/api/client/reset-session`
Reset current mining session

## Usage

### Accessing the Client Zone

1. Navigate to `/dashboard/client-zone` in the application
2. Or click "Client Zone" in the dashboard navigation menu

### Viewing Mining Statistics

The mining statistics are automatically updated every 5 seconds to show:
- Real-time mining progress
- Current session earnings
- Historical data

### Purchasing Items

1. Browse the marketplace by category
2. Click on an item to view details
3. Click the "Buy" button to purchase (if sufficient funds)
4. Confirm the purchase
5. Item will be added to your inventory

### Adding Items to Chat Rooms

1. After purchasing an item, a notification will appear
2. Click "Add to Current Page" to add the item to the current chat room
3. Items will be rendered based on their category:
   - **Furniture**: Bottom left corner
   - **Decoration**: Top right corner
   - **Effect**: Center of page
   - **Avatar**: Bottom right corner
   - **Background**: Full page overlay

## Chrome Extension Messages

The extension listens for the following messages:

### `ITEM_PURCHASED`
Triggered when an item is purchased in the Client Zone
```javascript
{
  type: 'ITEM_PURCHASED',
  data: {
    item: { /* purchased item details */ }
  }
}
```

### `ADD_ITEM_TO_CHAT`
Add a purchased item to a chat room
```javascript
{
  type: 'ADD_ITEM_TO_CHAT',
  data: {
    itemId: 'item-001',
    chatRoomId: 'https://example.com/chat'
  }
}
```

### `CHAT_ROOM_ITEM_ADDED`
Broadcast when an item is added to a chat room
```javascript
{
  type: 'CHAT_ROOM_ITEM_ADDED',
  data: {
    chatRoomId: 'https://example.com/chat',
    item: { /* item details */ }
  }
}
```

## Development

### Running Locally

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Navigate to `http://localhost:3000/dashboard/client-zone`

### Testing

Run the client zone tests:
```bash
npm test src/api/__tests__/clientZoneApi.test.ts
```

## Future Enhancements

- [ ] Add item trading between users
- [ ] Implement item rarity-based effects
- [ ] Add animation customization for items
- [ ] Create item collections and achievements
- [ ] Add item preview before purchase
- [ ] Implement item level-up system
- [ ] Add seasonal limited edition items
- [ ] Create item gifting feature
- [ ] Add item categories with special abilities
- [ ] Implement item combination system

## Screenshots

### Client Zone Dashboard
The main dashboard showing mining statistics with real-time updates and historical data.

### Metaverse Marketplace
Browse and purchase items with category filtering and detailed information.

### Item Rendering
Items automatically render in chat rooms with smooth animations based on their category.

## Support

For issues or questions about the Client Zone feature:
1. Check this documentation
2. Review the API endpoints
3. Check the Chrome extension console for errors
4. Create an issue on GitHub

## License

This feature is part of the LightDom Space-Bridge Platform and follows the same license.
