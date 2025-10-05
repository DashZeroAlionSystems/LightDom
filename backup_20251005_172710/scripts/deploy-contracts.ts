import { ethers } from 'hardhat';
import { Contract } from 'ethers';
import fs from 'fs';
import path from 'path';

interface DeploymentConfig {
  network: string;
  rpcUrl: string;
  privateKey: string;
  gasPrice?: string;
  gasLimit?: string;
}

interface ContractAddresses {
  LightDomToken: string;
  OptimizationRegistry: string;
  VirtualLandNFT: string;
  ProofOfOptimization: string;
}

class ContractDeployer {
  private config: DeploymentConfig;
  private contracts: { [key: string]: Contract } = {};

  constructor(config: DeploymentConfig) {
    this.config = config;
  }

  /**
   * Deploy all contracts
   */
  async deployAll(): Promise<ContractAddresses> {
    console.log('🚀 Starting contract deployment...');
    console.log(`Network: ${this.config.network}`);
    console.log(`RPC URL: ${this.config.rpcUrl}`);

    try {
      // Deploy LightDom Token
      const tokenAddress = await this.deployLightDomToken();
      
      // Deploy Optimization Registry
      const registryAddress = await this.deployOptimizationRegistry();
      
      // Deploy Virtual Land NFT
      const nftAddress = await this.deployVirtualLandNFT();
      
      // Deploy Proof of Optimization
      const pooAddress = await this.deployProofOfOptimization();

      const addresses: ContractAddresses = {
        LightDomToken: tokenAddress,
        OptimizationRegistry: registryAddress,
        VirtualLandNFT: nftAddress,
        ProofOfOptimization: pooAddress
      };

      // Save deployment addresses
      await this.saveDeploymentAddresses(addresses);

      console.log('✅ All contracts deployed successfully!');
      console.log('Contract Addresses:');
      console.log(JSON.stringify(addresses, null, 2));

      return addresses;
    } catch (error) {
      console.error('❌ Deployment failed:', error);
      throw error;
    }
  }

  /**
   * Deploy LightDom Token contract
   */
  private async deployLightDomToken(): Promise<string> {
    console.log('📄 Deploying LightDom Token...');
    
    const LightDomToken = await ethers.getContractFactory('LightDomToken');
    const token = await LightDomToken.deploy();
    await token.waitForDeployment();
    
    const address = await token.getAddress();
    this.contracts.LightDomToken = token;
    
    console.log(`✅ LightDom Token deployed to: ${address}`);
    return address;
  }

  /**
   * Deploy Optimization Registry contract
   */
  private async deployOptimizationRegistry(): Promise<string> {
    console.log('📋 Deploying Optimization Registry...');
    
    const OptimizationRegistry = await ethers.getContractFactory('OptimizationRegistry');
    const registry = await OptimizationRegistry.deploy();
    await registry.waitForDeployment();
    
    const address = await registry.getAddress();
    this.contracts.OptimizationRegistry = registry;
    
    console.log(`✅ Optimization Registry deployed to: ${address}`);
    return address;
  }

  /**
   * Deploy Virtual Land NFT contract
   */
  private async deployVirtualLandNFT(): Promise<string> {
    console.log('🏞️ Deploying Virtual Land NFT...');
    
    const VirtualLandNFT = await ethers.getContractFactory('VirtualLandNFT');
    const nft = await VirtualLandNFT.deploy();
    await nft.waitForDeployment();
    
    const address = await nft.getAddress();
    this.contracts.VirtualLandNFT = nft;
    
    console.log(`✅ Virtual Land NFT deployed to: ${address}`);
    return address;
  }

  /**
   * Deploy Proof of Optimization contract
   */
  private async deployProofOfOptimization(): Promise<string> {
    console.log('🔐 Deploying Proof of Optimization...');
    
    const ProofOfOptimization = await ethers.getContractFactory('ProofOfOptimization');
    const poo = await ProofOfOptimization.deploy();
    await poo.waitForDeployment();
    
    const address = await poo.getAddress();
    this.contracts.ProofOfOptimization = poo;
    
    console.log(`✅ Proof of Optimization deployed to: ${address}`);
    return address;
  }

  /**
   * Save deployment addresses to file
   */
  private async saveDeploymentAddresses(addresses: ContractAddresses): Promise<void> {
    const deploymentDir = path.join(__dirname, '../deployments');
    if (!fs.existsSync(deploymentDir)) {
      fs.mkdirSync(deploymentDir, { recursive: true });
    }

    const deploymentFile = path.join(deploymentDir, `${this.config.network}.json`);
    const deploymentData = {
      network: this.config.network,
      timestamp: new Date().toISOString(),
      addresses,
      config: this.config
    };

    fs.writeFileSync(deploymentFile, JSON.stringify(deploymentData, null, 2));
    console.log(`📁 Deployment data saved to: ${deploymentFile}`);
  }

  /**
   * Verify contracts on Etherscan
   */
  async verifyContracts(addresses: ContractAddresses): Promise<void> {
    console.log('🔍 Verifying contracts on Etherscan...');
    
    try {
      // Verify LightDom Token
      await this.verifyContract('LightDomToken', addresses.LightDomToken, []);
      
      // Verify Optimization Registry
      await this.verifyContract('OptimizationRegistry', addresses.OptimizationRegistry, []);
      
      // Verify Virtual Land NFT
      await this.verifyContract('VirtualLandNFT', addresses.VirtualLandNFT, []);
      
      // Verify Proof of Optimization
      await this.verifyContract('ProofOfOptimization', addresses.ProofOfOptimization, []);
      
      console.log('✅ All contracts verified successfully!');
    } catch (error) {
      console.error('❌ Contract verification failed:', error);
      throw error;
    }
  }

  /**
   * Verify a single contract
   */
  private async verifyContract(contractName: string, address: string, constructorArgs: any[]): Promise<void> {
    try {
      await ethers.run('verify:verify', {
        address,
        constructorArguments: constructorArgs
      });
      console.log(`✅ ${contractName} verified at ${address}`);
    } catch (error) {
      console.error(`❌ Failed to verify ${contractName}:`, error);
      throw error;
    }
  }

  /**
   * Get contract instance
   */
  getContract(contractName: string): Contract {
    if (!this.contracts[contractName]) {
      throw new Error(`Contract ${contractName} not deployed`);
    }
    return this.contracts[contractName];
  }

  /**
   * Get all deployed contracts
   */
  getAllContracts(): { [key: string]: Contract } {
    return this.contracts;
  }
}

/**
 * Main deployment function
 */
async function main() {
  const network = process.env.NETWORK || 'localhost';
  
  // Load configuration based on network
  const config: DeploymentConfig = {
    network,
    rpcUrl: process.env.RPC_URL || 'http://localhost:8545',
    privateKey: process.env.PRIVATE_KEY || '',
    gasPrice: process.env.GAS_PRICE,
    gasLimit: process.env.GAS_LIMIT
  };

  if (!config.privateKey) {
    console.error('❌ Private key not provided. Set PRIVATE_KEY environment variable.');
    process.exit(1);
  }

  const deployer = new ContractDeployer(config);
  
  try {
    // Deploy all contracts
    const addresses = await deployer.deployAll();
    
    // Verify contracts if not localhost
    if (network !== 'localhost' && network !== 'hardhat') {
      await deployer.verifyContracts(addresses);
    }
    
    console.log('\n🎉 Deployment completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Update your .env file with the contract addresses');
    console.log('2. Start the API server');
    console.log('3. Test the blockchain integration');
    
  } catch (error) {
    console.error('❌ Deployment failed:', error);
    process.exit(1);
  }
}

// Run deployment if this script is executed directly
if (require.main === module) {
  main().catch((error) => {
    console.error('❌ Unhandled error:', error);
    process.exit(1);
  });
}

export { ContractDeployer, DeploymentConfig, ContractAddresses };
