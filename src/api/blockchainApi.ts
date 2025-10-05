import { Router } from 'express';
import { BlockchainService, BlockchainConfig } from '../services/BlockchainService';

const router = Router();

// Initialize blockchain service
let blockchainService: BlockchainService | null = null;

const initializeBlockchainService = () => {
  if (!blockchainService) {
    const config: BlockchainConfig = {
      rpcUrl: process.env.RPC_URL || 'http://localhost:8545',
      contractAddresses: {
        token: process.env.LIGHTDOM_TOKEN_ADDRESS || '',
        registry: process.env.OPTIMIZATION_REGISTRY_ADDRESS || '',
        nft: process.env.VIRTUAL_LAND_NFT_ADDRESS || ''
      },
      networkId: parseInt(process.env.CHAIN_ID || '1337')
    };

    blockchainService = new BlockchainService(config);
  }
  return blockchainService;
};

// Get blockchain status
router.get('/status', async (req, res) => {
  try {
    const service = initializeBlockchainService();
    const networkInfo = await service.getNetworkInfo();
    
    res.json({
      success: true,
      data: {
        connected: true,
        network: networkInfo,
        contracts: {
          token: process.env.LIGHTDOM_TOKEN_ADDRESS || '',
          registry: process.env.OPTIMIZATION_REGISTRY_ADDRESS || '',
          nft: process.env.VIRTUAL_LAND_NFT_ADDRESS || ''
        }
      }
    });
  } catch (error) {
    console.error('Blockchain status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get blockchain status'
    });
  }
});

// Get harvester stats
router.get('/harvester-stats/:address', async (req, res) => {
  try {
    const { address } = req.params;
    const service = initializeBlockchainService();
    const stats = await service.getHarvesterStats(address);
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Harvester stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get harvester stats'
    });
  }
});

// Get metaverse stats
router.get('/metaverse-stats', async (req, res) => {
  try {
    const service = initializeBlockchainService();
    const stats = await service.getMetaverseStats();
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Metaverse stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get metaverse stats'
    });
  }
});

// Get token balance
router.get('/token-balance/:address', async (req, res) => {
  try {
    const { address } = req.params;
    const service = initializeBlockchainService();
    const balance = await service.getTokenBalance(address);
    
    res.json({
      success: true,
      data: { balance }
    });
  } catch (error) {
    console.error('Token balance error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get token balance'
    });
  }
});

// Get staking rewards
router.get('/staking-rewards/:address', async (req, res) => {
  try {
    const { address } = req.params;
    const service = initializeBlockchainService();
    const rewards = await service.getStakingRewards(address);
    
    res.json({
      success: true,
      data: { rewards }
    });
  } catch (error) {
    console.error('Staking rewards error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get staking rewards'
    });
  }
});

// Submit optimization (this would typically require wallet signature)
router.post('/submit-optimization', async (req, res) => {
  try {
    const { url, spaceBytes, proofHash, biomeType, metadata } = req.body;
    
    // Validate required fields
    if (!url || !spaceBytes || !proofHash || !biomeType) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    // In a real implementation, this would require wallet signature
    // For now, we'll just return a mock response
    res.json({
      success: true,
      data: {
        message: 'Optimization submitted successfully',
        txHash: '0x' + Math.random().toString(16).substr(2, 64),
        optimizationId: 'opt_' + Date.now()
      }
    });
  } catch (error) {
    console.error('Submit optimization error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit optimization'
    });
  }
});

// Get network info
router.get('/network-info', async (req, res) => {
  try {
    const service = initializeBlockchainService();
    const networkInfo = await service.getNetworkInfo();
    
    res.json({
      success: true,
      data: networkInfo
    });
  } catch (error) {
    console.error('Network info error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get network info'
    });
  }
});

export default router;