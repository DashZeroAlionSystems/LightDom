/**
 * Contract ABIs Loader
 *
 * This module provides utilities for loading and accessing smart contract ABIs.
 * ABIs can be loaded from:
 * 1. Compiled artifacts (artifacts/contracts/*.sol/*.json)
 * 2. Pre-generated ABI files (blockchain/abi/*.json)
 * 3. Hardcoded ABIs for emergency fallback
 */

import fs from 'fs';
import path from 'path';

// Contract names to ABI mappings
const CONTRACT_NAMES = [
  'LightDomToken',
  'DOMSpaceToken',
  'EnhancedDOMSpaceToken',
  'OptimizationRegistry',
  'ProofOfOptimization',
  'VirtualLandNFT',
  'MetaverseCreatureNFT',
  'MetaverseItemNFT',
  'MetaverseMarketplace',
  'StorageContract',
  'StorageToken',
  'StorageGovernance',
  'ModelStorageContract',
  'FileManager',
  'HostManager',
  'DataEncryption',
  'EthereumBridge',
  'PolygonBridge',
  'SEODataMining'
] as const;

export type ContractName = typeof CONTRACT_NAMES[number];

// ABI cache
const abiCache = new Map<string, any[]>();

/**
 * Get contract ABI by name
 */
export function getContractABI(contractName: ContractName): any[] {
  // Check cache first
  if (abiCache.has(contractName)) {
    return abiCache.get(contractName)!;
  }

  // Try loading from pre-generated ABI files
  try {
    const abiPath = path.join(process.cwd(), 'blockchain/abi', `${contractName}.json`);

    if (fs.existsSync(abiPath)) {
      const abi = JSON.parse(fs.readFileSync(abiPath, 'utf-8'));
      abiCache.set(contractName, abi);
      return abi;
    }
  } catch (error) {
    console.warn(`Failed to load ABI file for ${contractName}:`, error);
  }

  // Try loading from compiled artifacts
  try {
    const artifactPath = path.join(
      process.cwd(),
      'artifacts/contracts',
      `${contractName}.sol`,
      `${contractName}.json`
    );

    if (fs.existsSync(artifactPath)) {
      const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf-8'));
      const abi = artifact.abi;
      abiCache.set(contractName, abi);
      return abi;
    }
  } catch (error) {
    console.warn(`Failed to load artifact for ${contractName}:`, error);
  }

  // If not found, return minimal ABI for basic functionality
  console.error(`ABI not found for ${contractName}, using minimal fallback`);
  return getMinimalABI(contractName);
}

/**
 * Load all contract ABIs
 */
export function loadAllContractABIs(): Map<ContractName, any[]> {
  const abis = new Map<ContractName, any[]>();

  for (const contractName of CONTRACT_NAMES) {
    try {
      abis.set(contractName, getContractABI(contractName));
    } catch (error) {
      console.error(`Failed to load ABI for ${contractName}:`, error);
    }
  }

  return abis;
}

/**
 * Check if ABIs are available
 */
export function checkABIsAvailability(): {
  available: boolean;
  missing: ContractName[];
  found: ContractName[];
} {
  const missing: ContractName[] = [];
  const found: ContractName[] = [];

  for (const contractName of CONTRACT_NAMES) {
    try {
      const abi = getContractABI(contractName);
      if (abi && abi.length > 0) {
        found.push(contractName);
      } else {
        missing.push(contractName);
      }
    } catch (error) {
      missing.push(contractName);
    }
  }

  return {
    available: missing.length === 0,
    missing,
    found
  };
}

/**
 * Get minimal ABI for basic ERC20 functionality
 * This is a fallback when actual ABIs are not available
 */
function getMinimalABI(contractName: ContractName): any[] {
  // Basic ERC20 ABI
  const erc20ABI = [
    {
      "inputs": [{"name": "account", "type": "address"}],
      "name": "balanceOf",
      "outputs": [{"name": "", "type": "uint256"}],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {"name": "to", "type": "address"},
        {"name": "amount", "type": "uint256"}
      ],
      "name": "transfer",
      "outputs": [{"name": "", "type": "bool"}],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ];

  // Return appropriate minimal ABI based on contract type
  if (contractName.includes('Token')) {
    return erc20ABI;
  }

  if (contractName.includes('NFT')) {
    return []; // Return empty array for NFTs - need full ABI
  }

  // Default minimal ABI
  return [];
}

/**
 * Clear ABI cache
 */
export function clearABICache(): void {
  abiCache.clear();
}

/**
 * Get contract artifact (full artifact including ABI, bytecode, etc.)
 */
export function getContractArtifact(contractName: ContractName): any {
  try {
    const artifactPath = path.join(
      process.cwd(),
      'artifacts/contracts',
      `${contractName}.sol`,
      `${contractName}.json`
    );

    if (fs.existsSync(artifactPath)) {
      return JSON.parse(fs.readFileSync(artifactPath, 'utf-8'));
    }
  } catch (error) {
    console.error(`Failed to load artifact for ${contractName}:`, error);
  }

  return null;
}

/**
 * Export contract names for type safety
 */
export { CONTRACT_NAMES };
export default {
  getContractABI,
  loadAllContractABIs,
  checkABIsAvailability,
  clearABICache,
  getContractArtifact,
  CONTRACT_NAMES
};
