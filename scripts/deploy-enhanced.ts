/**
 * Enhanced Deployment Script for DOM Space Optimization System
 * Deploys all contracts and sets up the complete optimization infrastructure
 */

import { ethers } from "hardhat";
import { Contract } from "ethers";

async function main() {
  console.log("🚀 Starting enhanced DOM Space Optimization deployment...");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // Deploy Enhanced DOM Space Token
  console.log("\n📦 Deploying Enhanced DOM Space Token...");
  const DOMSpaceToken = await ethers.getContractFactory("EnhancedDOMSpaceToken");
  const domSpaceToken = await DOMSpaceToken.deploy();
  await domSpaceToken.deployed();
  console.log("✅ Enhanced DOM Space Token deployed to:", domSpaceToken.address);

  // Deploy Virtual Land NFT
  console.log("\n🏞️ Deploying Virtual Land NFT...");
  const VirtualLandNFT = await ethers.getContractFactory("VirtualLandNFT");
  const virtualLandNFT = await VirtualLandNFT.deploy();
  await virtualLandNFT.deployed();
  console.log("✅ Virtual Land NFT deployed to:", virtualLandNFT.address);

  // Deploy Optimization Registry
  console.log("\n📊 Deploying Optimization Registry...");
  const OptimizationRegistry = await ethers.getContractFactory("OptimizationRegistry");
  const optimizationRegistry = await OptimizationRegistry.deploy();
  await optimizationRegistry.deployed();
  console.log("✅ Optimization Registry deployed to:", optimizationRegistry.address);

  // Deploy Proof of Optimization
  console.log("\n🔐 Deploying Proof of Optimization...");
  const ProofOfOptimization = await ethers.getContractFactory("ProofOfOptimization");
  const proofOfOptimization = await ProofOfOptimization.deploy(7 * 24 * 60 * 60); // 7 days challenge window
  await proofOfOptimization.deployed();
  console.log("✅ Proof of Optimization deployed to:", proofOfOptimization.address);

  // Set up initial configuration
  console.log("\n⚙️ Setting up initial configuration...");
  
  // Set space multiplier to 100 (1 KB = 0.001 DSH base)
  await domSpaceToken.setSpaceMultiplier(100);
  console.log("✅ Space multiplier set to 100");

  // Set staking reward rate to 10% APY
  await domSpaceToken.setStakingRewardRate(10);
  console.log("✅ Staking reward rate set to 10% APY");

  // Set biome multipliers
  const biomeMultipliers = [
    { biome: 0, multiplier: 100 }, // Digital
    { biome: 1, multiplier: 200 }, // Commercial
    { biome: 2, multiplier: 150 }, // Knowledge
    { biome: 3, multiplier: 120 }, // Entertainment
    { biome: 4, multiplier: 180 }, // Social
    { biome: 5, multiplier: 130 }, // Community
    { biome: 6, multiplier: 250 }, // Professional
    { biome: 7, multiplier: 300 }  // Production
  ];

  for (const { biome, multiplier } of biomeMultipliers) {
    await domSpaceToken.setBiomeMultiplier(biome, multiplier);
  }
  console.log("✅ Biome multipliers configured");

  // Deploy test harvesters
  console.log("\n👥 Setting up test harvesters...");
  const testHarvesters = [
    "0x1234567890123456789012345678901234567890",
    "0x2345678901234567890123456789012345678901",
    "0x3456789012345678901234567890123456789012"
  ];

  for (const harvester of testHarvesters) {
    // In a real deployment, you would need to fund these addresses
    console.log(`📝 Test harvester: ${harvester}`);
  }

  // Deploy test optimizations
  console.log("\n🔧 Deploying test optimizations...");
  const testOptimizations = [
    {
      url: "https://github.com",
      spaceBytes: 50000, // 50KB
      proofHash: ethers.utils.keccak256(ethers.utils.toUtf8Bytes("github_optimization")),
      biomeType: 0 // Digital
    },
    {
      url: "https://stackoverflow.com",
      spaceBytes: 75000, // 75KB
      proofHash: ethers.utils.keccak256(ethers.utils.toUtf8Bytes("stackoverflow_optimization")),
      biomeType: 2 // Knowledge
    },
    {
      url: "https://medium.com",
      spaceBytes: 100000, // 100KB
      proofHash: ethers.utils.keccak256(ethers.utils.toUtf8Bytes("medium_optimization")),
      biomeType: 2 // Knowledge
    }
  ];

  // Note: In a real deployment, you would need to register harvesters first
  console.log("📝 Test optimizations prepared (harvesters need to be registered first)");

  // Generate deployment summary
  console.log("\n📋 Deployment Summary:");
  console.log("====================");
  console.log(`Enhanced DOM Space Token: ${domSpaceToken.address}`);
  console.log(`Virtual Land NFT: ${virtualLandNFT.address}`);
  console.log(`Optimization Registry: ${optimizationRegistry.address}`);
  console.log(`Proof of Optimization: ${proofOfOptimization.address}`);
  console.log(`Deployer: ${deployer.address}`);
  console.log(`Network: ${await deployer.provider.getNetwork().then(n => n.name)}`);

  // Save deployment addresses
  const deploymentInfo = {
    network: await deployer.provider.getNetwork().then(n => n.name),
    chainId: await deployer.provider.getNetwork().then(n => n.chainId),
    deployer: deployer.address,
    contracts: {
      domSpaceToken: domSpaceToken.address,
      virtualLandNFT: virtualLandNFT.address,
      optimizationRegistry: optimizationRegistry.address,
      proofOfOptimization: proofOfOptimization.address
    },
    configuration: {
      spaceMultiplier: 100,
      stakingRewardRate: 10,
      biomeMultipliers: biomeMultipliers.reduce((acc, { biome, multiplier }) => {
        acc[biome] = multiplier;
        return acc;
      }, {} as Record<number, number>)
    },
    testHarvesters,
    testOptimizations: testOptimizations.map(opt => ({
      ...opt,
      proofHash: opt.proofHash
    })),
    timestamp: new Date().toISOString()
  };

  // Write deployment info to file
  const fs = require('fs');
  const path = require('path');
  const deploymentPath = path.join(__dirname, '../deployments', `${deploymentInfo.network}-${deploymentInfo.chainId}.json`);
  
  // Ensure deployments directory exists
  const deploymentsDir = path.dirname(deploymentPath);
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }
  
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
  console.log(`\n💾 Deployment info saved to: ${deploymentPath}`);

  // Generate verification commands
  console.log("\n🔍 Contract Verification Commands:");
  console.log("==================================");
  console.log(`npx hardhat verify --network ${deploymentInfo.network} ${domSpaceToken.address}`);
  console.log(`npx hardhat verify --network ${deploymentInfo.network} ${virtualLandNFT.address}`);
  console.log(`npx hardhat verify --network ${deploymentInfo.network} ${optimizationRegistry.address}`);
  console.log(`npx hardhat verify --network ${deploymentInfo.network} ${proofOfOptimization.address} "604800"`);

  // Generate test commands
  console.log("\n🧪 Test Commands:");
  console.log("=================");
  console.log(`# Test token functions`);
  console.log(`npx hardhat run scripts/test-token.ts --network ${deploymentInfo.network}`);
  console.log(`# Test optimization submission`);
  console.log(`npx hardhat run scripts/test-optimization.ts --network ${deploymentInfo.network}`);

  console.log("\n🎉 Enhanced DOM Space Optimization deployment completed!");
  console.log("\nNext steps:");
  console.log("1. Verify contracts on block explorer");
  console.log("2. Set up frontend to connect to deployed contracts");
  console.log("3. Configure API server with contract addresses");
  console.log("4. Start optimization monitoring and harvesting");

  return deploymentInfo;
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
