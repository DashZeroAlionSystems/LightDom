/**
 * Client Zone API - Endpoints for mining statistics and metaverse item marketplace
 */

import { Router, Request, Response } from 'express';

const router = Router();

// Mock data storage (in production, this would use a database)
let clientMiningData: any = {
  totalCoins: 1250.75,
  miningRate: 45.5,
  spaceSaved: 2547890,
  optimizationsCount: 127,
  currentSession: {
    startTime: Date.now() - 3600000, // Started 1 hour ago
    coinsEarned: 45.5,
    timeElapsed: 3600
  },
  history: {
    daily: 120.25,
    weekly: 785.50,
    monthly: 3250.75
  }
};

const marketplaceItems = [
  {
    id: 'item-001',
    name: 'Neon Light Strip',
    description: 'Colorful animated light strip for chat room ambiance',
    category: 'decoration',
    price: 50,
    features: ['RGB Color Control', 'Animated Effects', 'Low Power Usage'],
    rarity: 'common'
  },
  {
    id: 'item-002',
    name: 'Holographic Display',
    description: 'Advanced 3D holographic display panel',
    category: 'decoration',
    price: 150,
    features: ['3D Projection', 'Customizable Content', 'Interactive'],
    rarity: 'rare'
  },
  {
    id: 'item-003',
    name: 'Floating Platform',
    description: 'Anti-gravity platform for chat room furniture',
    category: 'furniture',
    price: 200,
    features: ['Gravity Defying', 'Customizable Height', 'Stable'],
    rarity: 'epic'
  },
  {
    id: 'item-004',
    name: 'Cosmic Background',
    description: 'Animated cosmic space background with stars and nebulas',
    category: 'background',
    price: 100,
    features: ['Animated Stars', 'Nebula Effects', 'Parallax Scrolling'],
    rarity: 'rare'
  },
  {
    id: 'item-005',
    name: 'Avatar Glow Effect',
    description: 'Luminescent glow effect for user avatars',
    category: 'effect',
    price: 75,
    features: ['Color Customization', 'Intensity Control', 'Pulsing Animation'],
    rarity: 'common'
  },
  {
    id: 'item-006',
    name: 'Quantum Table',
    description: 'High-tech table with particle effects',
    category: 'furniture',
    price: 180,
    features: ['Particle Effects', 'Touch Reactive', 'Holographic Surface'],
    rarity: 'epic'
  },
  {
    id: 'item-007',
    name: 'Energy Shield',
    description: 'Protective energy barrier with visual effects',
    category: 'effect',
    price: 120,
    features: ['Ripple Effects', 'Customizable Color', 'Sound Effects'],
    rarity: 'rare'
  },
  {
    id: 'item-008',
    name: 'Digital Plant',
    description: 'Self-sustaining digital plant with growth animation',
    category: 'decoration',
    price: 60,
    features: ['Auto Growing', 'Season Changes', 'Low Maintenance'],
    rarity: 'common'
  },
  {
    id: 'item-009',
    name: 'Legendary Throne',
    description: 'Majestic throne with particle and light effects',
    category: 'furniture',
    price: 500,
    features: ['Royal Aura', 'Animated Particles', 'Status Symbol', 'Sound Effects'],
    rarity: 'legendary'
  },
  {
    id: 'item-010',
    name: 'Cyber Avatar Skin',
    description: 'Futuristic cyberpunk avatar appearance',
    category: 'avatar',
    price: 250,
    features: ['Neon Accents', 'Tech Enhancements', 'Animated Elements'],
    rarity: 'epic'
  }
];

let userInventory: any[] = [];

/**
 * GET /api/client/mining-stats
 * Get current mining statistics for the client
 */
router.get('/mining-stats', async (req: Request, res: Response) => {
  try {
    // Update current session time
    const sessionDuration = Math.floor((Date.now() - clientMiningData.currentSession.startTime) / 1000);
    clientMiningData.currentSession.timeElapsed = sessionDuration;
    
    // Simulate continuous earning (coins earned = time * rate)
    const hoursElapsed = sessionDuration / 3600;
    clientMiningData.currentSession.coinsEarned = hoursElapsed * clientMiningData.miningRate;
    
    res.json({
      success: true,
      data: clientMiningData
    });
  } catch (error) {
    console.error('Error fetching mining stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch mining statistics',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/client/marketplace-items
 * Get available items in the metaverse marketplace
 */
router.get('/marketplace-items', async (req: Request, res: Response) => {
  try {
    const category = req.query.category as string;
    
    let items = marketplaceItems;
    if (category && category !== 'all') {
      items = marketplaceItems.filter(item => item.category === category);
    }

    res.json({
      success: true,
      data: items
    });
  } catch (error) {
    console.error('Error fetching marketplace items:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch marketplace items',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/client/inventory
 * Get user's purchased items inventory
 */
router.get('/inventory', async (req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      data: userInventory
    });
  } catch (error) {
    console.error('Error fetching inventory:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch inventory',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/client/purchase-item
 * Purchase a metaverse item
 */
router.post('/purchase-item', async (req: Request, res: Response) => {
  try {
    const { itemId } = req.body;

    if (!itemId) {
      return res.status(400).json({
        success: false,
        message: 'Item ID is required'
      });
    }

    // Find the item
    const item = marketplaceItems.find(i => i.id === itemId);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    // Check if user has enough coins
    if (clientMiningData.totalCoins < item.price) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient funds'
      });
    }

    // Check if item already owned
    const alreadyOwned = userInventory.some(inv => inv.itemId === itemId);
    if (alreadyOwned) {
      return res.status(400).json({
        success: false,
        message: 'You already own this item'
      });
    }

    // Deduct coins
    clientMiningData.totalCoins -= item.price;

    // Add to inventory
    const purchase = {
      id: `purchase-${Date.now()}`,
      itemId: item.id,
      item: item,
      purchasedAt: Date.now(),
      status: 'active'
    };
    userInventory.push(purchase);

    res.json({
      success: true,
      data: {
        item: purchase,
        remainingCoins: clientMiningData.totalCoins
      },
      message: 'Item purchased successfully'
    });
  } catch (error) {
    console.error('Error purchasing item:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to purchase item',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/client/simulate-mining
 * Simulate mining activity (for testing/demo purposes)
 */
router.post('/simulate-mining', async (req: Request, res: Response) => {
  try {
    const { coins, spaceSaved } = req.body;

    // Add coins
    if (coins) {
      clientMiningData.totalCoins += coins;
      clientMiningData.currentSession.coinsEarned += coins;
      clientMiningData.history.daily += coins;
      clientMiningData.history.weekly += coins;
      clientMiningData.history.monthly += coins;
    }

    // Add space saved
    if (spaceSaved) {
      clientMiningData.spaceSaved += spaceSaved;
    }

    // Increment optimizations count
    clientMiningData.optimizationsCount += 1;

    res.json({
      success: true,
      data: clientMiningData,
      message: 'Mining simulated successfully'
    });
  } catch (error) {
    console.error('Error simulating mining:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to simulate mining',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/client/reset-session
 * Reset current mining session
 */
router.post('/reset-session', async (req: Request, res: Response) => {
  try {
    clientMiningData.currentSession = {
      startTime: Date.now(),
      coinsEarned: 0,
      timeElapsed: 0
    };

    res.json({
      success: true,
      data: clientMiningData,
      message: 'Session reset successfully'
    });
  } catch (error) {
    console.error('Error resetting session:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset session',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
