# Quick Start Guide: NFT Metaverse Creatures & Objects

## 5-Minute Setup

### Step 1: Install Dependencies
```bash
cd /home/user/LightDom
npm install
```

### Step 2: Start the Backend API
```bash
# Start the API server
node api-server-express.js
# API will run on http://localhost:3001
```

### Step 3: Start the Frontend
```bash
cd frontend
npm run dev
# Frontend will run on http://localhost:3000
```

### Step 4: Load Chrome Extension
1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (top right)
3. Click "Load unpacked"
4. Select the `/home/user/LightDom/extension` folder
5. Pin the extension to your toolbar

## Using the System

### Create Your First Creature

#### Option 1: Via Web UI
1. Navigate to `http://localhost:3000/creature-creator`
2. Choose "Creature" or "Object" tab
3. Click "Generate Lore with AI"
4. Customize the generated backstory if desired
5. Upload an image/animation (optional)
6. Click "Create & Mint NFT"

#### Option 2: Via Chrome Extension
1. Click the LightDom extension icon
2. Click "Open side panel" (or Ctrl+Shift+D)
3. Scroll to "Metaverse Creatures & Objects" section
4. Click "✨ Create Entity"
5. Follow the same steps as Option 1

### View Your Entities
```javascript
// Get your entities via API
const response = await fetch('http://localhost:3001/api/metaverse-creature/user/YOUR_WALLET_ADDRESS');
const data = await response.json();
console.log(data.entities);
```

### List Entity for Sale
```javascript
// Create auction listing
const response = await fetch('http://localhost:3001/api/metaverse-creature/auction/create', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    tokenId: 'YOUR_TOKEN_ID',
    seller: 'YOUR_WALLET_ADDRESS',
    listingType: 'fixed', // or 'auction' or 'rental'
    price: 0.05, // ETH
    duration: 86400000 // 24 hours in ms
  })
});
```

## Testing the Lore Generator

```javascript
// Test lore generation
const MetaverseLoreGenerator = require('./src/services/MetaverseLoreGenerator');
const generator = new MetaverseLoreGenerator.MetaverseLoreGenerator();

// Generate creature lore
const creatureLore = generator.generateCreatureLore({
  category: 'Companion',
  rarity: 'Epic',
  primaryAttribute: 'Mining',
  customName: 'Sparkle the Mining Cat'
});

console.log(creatureLore);
// Output: {
//   name: 'Sparkle the Mining Cat',
//   species: 'Digital Familiar',
//   origin: 'Forged in The Optimization Nexus...',
//   backstory: 'Sparkle the Mining Cat, a magnificent...',
//   ...
// }

// Generate object lore
const objectLore = generator.generateObjectLore({
  category: 'Tool',
  rarity: 'Legendary',
  primaryPower: 'Mining'
});

console.log(objectLore);
```

## API Testing with cURL

### Generate Lore
```bash
curl -X POST http://localhost:3001/api/metaverse-creature/generate-lore \
  -H "Content-Type: application/json" \
  -d '{
    "entityType": "creature",
    "category": "Harvester",
    "rarity": "Rare",
    "primaryAttribute": "Mining"
  }'
```

### Create Entity
```bash
curl -X POST http://localhost:3001/api/metaverse-creature/create \
  -H "Content-Type: application/json" \
  -d '{
    "owner": "0x1234567890abcdef",
    "name": "Cyber Miner",
    "isCreature": true,
    "category": "Harvester",
    "rarity": "Rare",
    "primaryAttribute": "Mining",
    "lore": {}
  }'
```

### Get Entity
```bash
curl http://localhost:3001/api/metaverse-creature/entity/LDME-1234567890
```

### Get User Analytics
```bash
curl http://localhost:3001/api/metaverse-creature/analytics/0x1234567890abcdef
```

## Common Issues

### Issue: API endpoints return 404
**Solution**: Make sure the API route is registered in the main Express server:
```javascript
// In api-server-express.js
const metaverseCreatureApi = require('./src/api/metaverseCreatureApi');
app.use('/api/metaverse-creature', metaverseCreatureApi);
```

### Issue: Chrome extension not loading creatures
**Solution**:
1. Check that API server is running on port 3001
2. Open DevTools in the extension and check console for errors
3. Verify wallet address is set in Chrome storage

### Issue: Lore generation returns undefined
**Solution**: Make sure you're passing all required parameters:
- entityType: 'creature' or 'object'
- category: valid category string
- rarity: valid rarity string
- primaryAttribute: valid attribute string

## Next Steps

1. **Customize the Metaverse**: Edit `MetaverseLoreGenerator.ts` to change factions, locations, and events
2. **Add More Categories**: Extend the category enums in the smart contract
3. **Deploy Smart Contract**: Deploy `MetaverseCreatureNFT.sol` to testnet/mainnet
4. **Set Up IPFS**: Configure IPFS for decentralized image storage
5. **Create Marketplace UI**: Build a full marketplace interface
6. **Add Animations**: Create animated visualizations for entities

## Resources

- **Full Documentation**: See `NFT_METAVERSE_CREATURES.md`
- **Smart Contract**: `contracts/MetaverseCreatureNFT.sol`
- **API Routes**: `src/api/metaverseCreatureApi.ts`
- **UI Component**: `src/components/ui/CreatureCreator.tsx`
- **Lore Service**: `src/services/MetaverseLoreGenerator.ts`

## Support

If you encounter issues:
1. Check the API server console for errors
2. Check browser DevTools console for frontend errors
3. Check Chrome extension DevTools for extension errors
4. Verify all dependencies are installed
5. Ensure ports 3000 and 3001 are available

---

Happy creating! 🎨🐉✨
