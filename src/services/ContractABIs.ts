// Contract ABIs for LightDom Blockchain Application
// These are simplified ABIs for the main functions we need

export const LightDomTokenABI = [
  // ERC20 Standard Functions
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address owner) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function transferFrom(address from, address to, uint256 amount) returns (bool)",
  
  // LightDom Token Specific Functions
  "function submitOptimization(string memory url, uint256 spaceBytes, bytes32 proofHash, string memory biomeType) external",
  "function getHarvesterStats(address harvester) external view returns (uint256 reputation, uint256 spaceHarvested, uint256 optimizations, uint256 successfulOptimizations, uint256 streak, uint256 tokensEarned, uint256 stakedAmount, uint256 stakingRewards)",
  "function getMetaverseStats() external view returns (uint256 land, uint256 nodes, uint256 shards, uint256 bridges)",
  "function stakeTokens(uint256 amount) external",
  "function unstakeTokens(uint256 amount) external",
  "function claimStakingRewards() external",
  "function calculateStakingRewards(address staker) public view returns (uint256)",
  
  // Events
  "event SpaceHarvested(address indexed harvester, uint256 spaceBytes, uint256 tokensEarned, string url)",
  "event TokensStaked(address indexed staker, uint256 amount, uint256 timestamp)",
  "event TokensUnstaked(address indexed staker, uint256 amount, uint256 rewards)",
  "event StakingRewardsClaimed(address indexed staker, uint256 rewards)",
  "event VirtualLandCreated(address indexed owner, uint256 landId, string biome, uint256 size)",
  "event AINodeDeployed(address indexed operator, uint256 nodeId, uint256 computePower)",
  "event StorageShardCreated(address indexed provider, uint256 shardId, uint256 capacity)",
  "event BridgeEstablished(address indexed validator, uint256 bridgeId, string sourceChain, string targetChain)"
];

export const OptimizationRegistryABI = [
  // Registry Functions
  "function registerOptimization(string memory url, uint256 spaceBytes, bytes32 proofHash, string memory biomeType, string memory metadata) external",
  "function verifyOptimization(bytes32 optimizationId, uint256 verificationScore, bool isVerified) external",
  "function getOptimization(bytes32 optimizationId) external view returns (tuple(address harvester, string url, uint256 spaceBytes, uint256 timestamp, bytes32 proofHash, string biomeType, bool verified, uint256 verificationScore, string metadata))",
  "function getHarvesterOptimizations(address harvester) external view returns (bytes32[])",
  "function getUrlOptimizations(string memory url) external view returns (bytes32[])",
  "function getRegistryStats() external view returns (uint256 totalOpts, uint256 totalSpace, uint256 totalVerified, uint256 verificationRate)",
  "function isProofUsed(bytes32 proofHash) external view returns (bool)",
  
  // Events
  "event OptimizationRegistered(bytes32 indexed optimizationId, address indexed harvester, string url, uint256 spaceBytes, bytes32 proofHash)",
  "event OptimizationVerified(bytes32 indexed optimizationId, address indexed verifier, uint256 verificationScore)",
  "event OptimizationRejected(bytes32 indexed optimizationId, address indexed verifier, string reason)"
];

export const VirtualLandNFTABI = [
  // ERC721 Standard Functions
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function tokenURI(uint256 tokenId) view returns (string)",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function balanceOf(address owner) view returns (uint256)",
  "function approve(address to, uint256 tokenId) external",
  "function getApproved(uint256 tokenId) view returns (address)",
  "function setApprovalForAll(address operator, bool approved) external",
  "function isApprovedForAll(address owner, address operator) view returns (bool)",
  "function transferFrom(address from, address to, uint256 tokenId) external",
  "function safeTransferFrom(address from, address to, uint256 tokenId) external",
  
  // Virtual Land Specific Functions
  "function mintVirtualLand(address to, string memory biomeType, uint256 size) external",
  "function getLandMetadata(uint256 tokenId) external view returns (string memory biomeType, uint256 size, uint256 coordinates)",
  "function getOwnerLands(address owner) external view returns (uint256[])",
  
  // Events
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
  "event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId)",
  "event ApprovalForAll(address indexed owner, address indexed operator, bool approved)",
  "event VirtualLandMinted(address indexed to, uint256 indexed tokenId, string biomeType, uint256 size)"
];

export const ProofOfOptimizationABI = [
  // Proof Functions
  "function submitProof(bytes32 optimizationId, bytes32 proofHash, uint256 spaceBytes, string memory url) external",
  "function verifyProof(bytes32 proofHash) external view returns (bool)",
  "function getProof(bytes32 proofHash) external view returns (bytes32 optimizationId, uint256 spaceBytes, string memory url, uint256 timestamp)",
  "function getOptimizationProofs(bytes32 optimizationId) external view returns (bytes32[])",
  
  // Events
  "event ProofSubmitted(bytes32 indexed optimizationId, bytes32 indexed proofHash, uint256 spaceBytes, string url)",
  "event ProofVerified(bytes32 indexed proofHash, bool verified)"
];

// Helper function to get ABI by contract name
export function getContractABI(contractName: string): string[] {
  switch (contractName) {
    case 'LightDomToken':
      return LightDomTokenABI;
    case 'OptimizationRegistry':
      return OptimizationRegistryABI;
    case 'VirtualLandNFT':
      return VirtualLandNFTABI;
    case 'ProofOfOptimization':
      return ProofOfOptimizationABI;
    default:
      throw new Error(`Unknown contract: ${contractName}`);
  }
}

// Contract addresses (these should be set via environment variables)
export const DEFAULT_CONTRACT_ADDRESSES = {
  LightDomToken: '0x0000000000000000000000000000000000000000',
  OptimizationRegistry: '0x0000000000000000000000000000000000000000',
  VirtualLandNFT: '0x0000000000000000000000000000000000000000',
  ProofOfOptimization: '0x0000000000000000000000000000000000000000'
};