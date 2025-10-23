/**
 * Metaverse Creature & Object API
 * Handles NFT creation, lore generation, benefits tracking, and auctions
 */

import { Router, Request, Response } from 'express';
import { MetaverseLoreGenerator } from '../services/MetaverseLoreGenerator';

const router = Router();

// Initialize lore generator
const loreGenerator = new MetaverseLoreGenerator();

// In-memory storage (replace with database in production)
interface CreatureEntity {
  tokenId: string;
  owner: string;
  name: string;
  isCreature: boolean;
  category: string;
  rarity: string;
  lore: any;
  imageURI: string;
  animationURI: string;
  attributes: {
    miningPower: number;
    speedBonus: number;
    defenseRating: number;
    magicPower: number;
    intelligence: number;
    charisma: number;
  };
  level: number;
  experience: number;
  benefits: {
    totalMined: number;
    totalOptimizations: number;
    totalAuctionSales: number;
    totalRentalIncome: number;
    prestigePoints: number;
  };
  usage: {
    lastUsed: number;
    totalSessions: number;
    averageSessionDuration: number;
    favoriteCount: number;
  };
  createdAt: number;
  updatedAt: number;
}

interface AuctionListing {
  listingId: string;
  tokenId: string;
  seller: string;
  listingType: 'fixed' | 'auction' | 'rental';
  price: number;
  minBid?: number;
  currentBid?: number;
  highestBidder?: string;
  duration: number;
  expiresAt: number;
  status: 'active' | 'sold' | 'cancelled' | 'expired';
  rentalPricePerDay?: number;
  createdAt: number;
}

const entities: Map<string, CreatureEntity> = new Map();
const auctions: Map<string, AuctionListing> = new Map();
const userEntities: Map<string, string[]> = new Map();

/**
 * Generate lore for a creature
 * POST /api/metaverse-creature/generate-lore
 */
router.post('/generate-lore', (req: Request, res: Response) => {
  try {
    const { entityType, category, rarity, primaryAttribute, customName } = req.body;

    if (!entityType || !category || !rarity || !primaryAttribute) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameters'
      });
    }

    let lore;

    if (entityType === 'creature') {
      lore = loreGenerator.generateCreatureLore({
        category,
        rarity,
        primaryAttribute,
        customName
      });
    } else {
      lore = loreGenerator.generateObjectLore({
        category,
        rarity,
        primaryPower: primaryAttribute,
        customName
      });
    }

    res.json({
      success: true,
      lore
    });
  } catch (error: any) {
    console.error('Error generating lore:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate lore',
      error: error.message
    });
  }
});

/**
 * Get metaverse world information
 * GET /api/metaverse-creature/world
 */
router.get('/world', (req: Request, res: Response) => {
  try {
    const world = loreGenerator.getWorld();

    res.json({
      success: true,
      world
    });
  } catch (error: any) {
    console.error('Error fetching world:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch world information',
      error: error.message
    });
  }
});

/**
 * Create a new creature/object NFT
 * POST /api/metaverse-creature/create
 */
router.post('/create', async (req: Request, res: Response) => {
  try {
    const {
      owner,
      name,
      isCreature,
      category,
      rarity,
      primaryAttribute,
      lore,
      imageURI,
      animationURI
    } = req.body;

    if (!owner || !name || !category || !rarity) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameters'
      });
    }

    // Generate token ID
    const tokenId = `LDME-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Calculate base attributes based on rarity
    const rarityMultipliers: Record<string, number> = {
      Common: 10,
      Uncommon: 25,
      Rare: 50,
      Epic: 100,
      Legendary: 200,
      Mythical: 500
    };

    const baseAttribute = rarityMultipliers[rarity] || 10;
    const secondaryAttribute = Math.floor(baseAttribute * 0.2);

    // Create entity
    const entity: CreatureEntity = {
      tokenId,
      owner,
      name,
      isCreature: isCreature !== false,
      category,
      rarity,
      lore,
      imageURI: imageURI || '',
      animationURI: animationURI || '',
      attributes: {
        miningPower: primaryAttribute === 'Mining' ? baseAttribute : secondaryAttribute,
        speedBonus: primaryAttribute === 'Speed' ? baseAttribute : secondaryAttribute,
        defenseRating: primaryAttribute === 'Defense' ? baseAttribute : secondaryAttribute,
        magicPower: primaryAttribute === 'Magic' ? baseAttribute : secondaryAttribute,
        intelligence: primaryAttribute === 'Intelligence' ? baseAttribute : secondaryAttribute,
        charisma: primaryAttribute === 'Charm' ? baseAttribute : secondaryAttribute
      },
      level: 1,
      experience: 0,
      benefits: {
        totalMined: 0,
        totalOptimizations: 0,
        totalAuctionSales: 0,
        totalRentalIncome: 0,
        prestigePoints: 0
      },
      usage: {
        lastUsed: Date.now(),
        totalSessions: 0,
        averageSessionDuration: 0,
        favoriteCount: 0
      },
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    // Store entity
    entities.set(tokenId, entity);

    // Track user entities
    const userEntityList = userEntities.get(owner) || [];
    userEntityList.push(tokenId);
    userEntities.set(owner, userEntityList);

    res.json({
      success: true,
      tokenId,
      entity
    });
  } catch (error: any) {
    console.error('Error creating entity:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create entity',
      error: error.message
    });
  }
});

/**
 * Get entity details
 * GET /api/metaverse-creature/entity/:tokenId
 */
router.get('/entity/:tokenId', (req: Request, res: Response) => {
  try {
    const { tokenId } = req.params;

    const entity = entities.get(tokenId);

    if (!entity) {
      return res.status(404).json({
        success: false,
        message: 'Entity not found'
      });
    }

    res.json({
      success: true,
      entity
    });
  } catch (error: any) {
    console.error('Error fetching entity:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch entity',
      error: error.message
    });
  }
});

/**
 * Get user's entities
 * GET /api/metaverse-creature/user/:address
 */
router.get('/user/:address', (req: Request, res: Response) => {
  try {
    const { address } = req.params;

    const userEntityIds = userEntities.get(address) || [];
    const userEntityList = userEntityIds.map(id => entities.get(id)).filter(Boolean);

    res.json({
      success: true,
      count: userEntityList.length,
      entities: userEntityList
    });
  } catch (error: any) {
    console.error('Error fetching user entities:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user entities',
      error: error.message
    });
  }
});

/**
 * Add experience to entity
 * POST /api/metaverse-creature/add-experience
 */
router.post('/add-experience', (req: Request, res: Response) => {
  try {
    const { tokenId, experience } = req.body;

    const entity = entities.get(tokenId);

    if (!entity) {
      return res.status(404).json({
        success: false,
        message: 'Entity not found'
      });
    }

    entity.experience += experience;
    entity.updatedAt = Date.now();

    // Level up logic
    const expRequirements = [100, 250, 500, 1000, 2500, 5000, 10000, 25000, 50000];

    while (entity.level < 10 && entity.experience >= expRequirements[entity.level - 1]) {
      entity.level++;

      // Apply level up bonuses
      const bonusMultiplier = entity.rarity === 'Mythical' ? 200 :
                             entity.rarity === 'Legendary' ? 80 :
                             entity.rarity === 'Epic' ? 40 :
                             entity.rarity === 'Rare' ? 20 :
                             entity.rarity === 'Uncommon' ? 10 : 5;

      // Boost primary attribute
      Object.keys(entity.attributes).forEach(key => {
        const attrKey = key as keyof typeof entity.attributes;
        if (entity.attributes[attrKey] > 0) {
          entity.attributes[attrKey] += bonusMultiplier;
        }
      });
    }

    res.json({
      success: true,
      entity
    });
  } catch (error: any) {
    console.error('Error adding experience:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add experience',
      error: error.message
    });
  }
});

/**
 * Record benefits
 * POST /api/metaverse-creature/record-benefit
 */
router.post('/record-benefit', (req: Request, res: Response) => {
  try {
    const { tokenId, benefitType, amount } = req.body;

    const entity = entities.get(tokenId);

    if (!entity) {
      return res.status(404).json({
        success: false,
        message: 'Entity not found'
      });
    }

    // Update benefits
    if (benefitType === 'mining') {
      entity.benefits.totalMined += amount;
    } else if (benefitType === 'optimization') {
      entity.benefits.totalOptimizations += amount;
    } else if (benefitType === 'auction') {
      entity.benefits.totalAuctionSales += amount;
    } else if (benefitType === 'rental') {
      entity.benefits.totalRentalIncome += amount;
    } else if (benefitType === 'prestige') {
      entity.benefits.prestigePoints += amount;
    }

    entity.updatedAt = Date.now();

    res.json({
      success: true,
      benefits: entity.benefits
    });
  } catch (error: any) {
    console.error('Error recording benefit:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to record benefit',
      error: error.message
    });
  }
});

/**
 * Record usage
 * POST /api/metaverse-creature/record-usage
 */
router.post('/record-usage', (req: Request, res: Response) => {
  try {
    const { tokenId, duration } = req.body;

    const entity = entities.get(tokenId);

    if (!entity) {
      return res.status(404).json({
        success: false,
        message: 'Entity not found'
      });
    }

    entity.usage.lastUsed = Date.now();
    entity.usage.totalSessions++;
    entity.usage.averageSessionDuration =
      (entity.usage.averageSessionDuration * (entity.usage.totalSessions - 1) + duration) /
      entity.usage.totalSessions;

    entity.updatedAt = Date.now();

    res.json({
      success: true,
      usage: entity.usage
    });
  } catch (error: any) {
    console.error('Error recording usage:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to record usage',
      error: error.message
    });
  }
});

/**
 * Create auction listing
 * POST /api/metaverse-creature/auction/create
 */
router.post('/auction/create', (req: Request, res: Response) => {
  try {
    const {
      tokenId,
      seller,
      listingType,
      price,
      minBid,
      duration,
      rentalPricePerDay
    } = req.body;

    const entity = entities.get(tokenId);

    if (!entity) {
      return res.status(404).json({
        success: false,
        message: 'Entity not found'
      });
    }

    if (entity.owner !== seller) {
      return res.status(403).json({
        success: false,
        message: 'Not the owner of this entity'
      });
    }

    const listingId = `LISTING-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const listing: AuctionListing = {
      listingId,
      tokenId,
      seller,
      listingType,
      price: price || 0,
      minBid: minBid || 0,
      duration: duration || 86400000, // 24 hours default
      expiresAt: Date.now() + (duration || 86400000),
      status: 'active',
      rentalPricePerDay,
      createdAt: Date.now()
    };

    auctions.set(listingId, listing);

    res.json({
      success: true,
      listingId,
      listing
    });
  } catch (error: any) {
    console.error('Error creating auction:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create auction',
      error: error.message
    });
  }
});

/**
 * Place bid on auction
 * POST /api/metaverse-creature/auction/bid
 */
router.post('/auction/bid', (req: Request, res: Response) => {
  try {
    const { listingId, bidder, bidAmount } = req.body;

    const listing = auctions.get(listingId);

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found'
      });
    }

    if (listing.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Listing is not active'
      });
    }

    if (Date.now() > listing.expiresAt) {
      listing.status = 'expired';
      return res.status(400).json({
        success: false,
        message: 'Listing has expired'
      });
    }

    if (listing.listingType !== 'auction') {
      return res.status(400).json({
        success: false,
        message: 'This is not an auction listing'
      });
    }

    if (bidAmount < (listing.minBid || 0)) {
      return res.status(400).json({
        success: false,
        message: 'Bid amount is below minimum bid'
      });
    }

    if (bidAmount <= (listing.currentBid || 0)) {
      return res.status(400).json({
        success: false,
        message: 'Bid amount must be higher than current bid'
      });
    }

    listing.currentBid = bidAmount;
    listing.highestBidder = bidder;

    res.json({
      success: true,
      listing
    });
  } catch (error: any) {
    console.error('Error placing bid:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to place bid',
      error: error.message
    });
  }
});

/**
 * Get all active listings
 * GET /api/metaverse-creature/auction/listings
 */
router.get('/auction/listings', (req: Request, res: Response) => {
  try {
    const activeListings = Array.from(auctions.values())
      .filter(listing => listing.status === 'active' && Date.now() < listing.expiresAt)
      .map(listing => {
        const entity = entities.get(listing.tokenId);
        return {
          ...listing,
          entity
        };
      });

    res.json({
      success: true,
      count: activeListings.length,
      listings: activeListings
    });
  } catch (error: any) {
    console.error('Error fetching listings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch listings',
      error: error.message
    });
  }
});

/**
 * Get analytics for user's entities
 * GET /api/metaverse-creature/analytics/:address
 */
router.get('/analytics/:address', (req: Request, res: Response) => {
  try {
    const { address } = req.params;

    const userEntityIds = userEntities.get(address) || [];
    const userEntityList = userEntityIds.map(id => entities.get(id)).filter(Boolean) as CreatureEntity[];

    // Calculate analytics
    const analytics = {
      totalEntities: userEntityList.length,
      totalValue: userEntityList.reduce((sum, e) => {
        const rarityValues: Record<string, number> = {
          Common: 0.02,
          Uncommon: 0.03,
          Rare: 0.04,
          Epic: 0.06,
          Legendary: 0.1,
          Mythical: 0.2
        };
        return sum + (rarityValues[e.rarity] || 0);
      }, 0),
      totalBenefits: {
        mined: userEntityList.reduce((sum, e) => sum + e.benefits.totalMined, 0),
        optimizations: userEntityList.reduce((sum, e) => sum + e.benefits.totalOptimizations, 0),
        auctionSales: userEntityList.reduce((sum, e) => sum + e.benefits.totalAuctionSales, 0),
        rentalIncome: userEntityList.reduce((sum, e) => sum + e.benefits.totalRentalIncome, 0),
        prestige: userEntityList.reduce((sum, e) => sum + e.benefits.prestigePoints, 0)
      },
      categoryBreakdown: userEntityList.reduce((acc, e) => {
        acc[e.category] = (acc[e.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      rarityBreakdown: userEntityList.reduce((acc, e) => {
        acc[e.rarity] = (acc[e.rarity] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      averageLevel: userEntityList.length > 0
        ? userEntityList.reduce((sum, e) => sum + e.level, 0) / userEntityList.length
        : 0,
      totalUsageTime: userEntityList.reduce((sum, e) =>
        sum + (e.usage.totalSessions * e.usage.averageSessionDuration), 0)
    };

    res.json({
      success: true,
      analytics
    });
  } catch (error: any) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics',
      error: error.message
    });
  }
});

/**
 * Get all entities (paginated)
 * GET /api/metaverse-creature/entities
 */
router.get('/entities', (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const category = req.query.category as string;
    const rarity = req.query.rarity as string;

    let entitiesList = Array.from(entities.values());

    // Filter by category
    if (category) {
      entitiesList = entitiesList.filter(e => e.category === category);
    }

    // Filter by rarity
    if (rarity) {
      entitiesList = entitiesList.filter(e => e.rarity === rarity);
    }

    // Paginate
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedEntities = entitiesList.slice(startIndex, endIndex);

    res.json({
      success: true,
      page,
      limit,
      total: entitiesList.length,
      totalPages: Math.ceil(entitiesList.length / limit),
      entities: paginatedEntities
    });
  } catch (error: any) {
    console.error('Error fetching entities:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch entities',
      error: error.message
    });
  }
});

export default router;
