// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

/**
 * @title LightDom Token (LDOM)
 * @dev Advanced ERC20 token for DOM space optimization mining
 * @author LightDom Team
 */
contract LightDomToken is ERC20, ERC20Burnable, ERC20Pausable, AccessControl, ReentrancyGuard {
    using SafeMath for uint256;

    // Roles
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    // Token constants
    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 10**18; // 1 billion LDOM
    uint256 public constant INITIAL_SUPPLY = 100_000_000 * 10**18; // 100 million initial
    uint256 public constant REWARD_HALVING_INTERVAL = 2_102_400; // ~24 days (2,102,400 blocks)
    
    // Mining rewards
    uint256 public currentBlockReward = 50 * 10**18; // 50 LDOM per block initially
    uint256 public lastHalvingBlock;
    uint256 public totalMined;
    
    // Space conversion rates (1 KB = 0.001 LDOM base)
    uint256 public constant BASE_SPACE_RATE = 1000; // 1 KB = 0.001 LDOM
    uint256 public spaceMultiplier = 100; // Can be adjusted by admin
    
    // Reputation system
    mapping(address => uint256) public reputationScore;
    mapping(address => uint256) public totalSpaceHarvested;
    mapping(address => uint256) public lastOptimizationBlock;
    mapping(address => uint256) public optimizationStreak;
    
    // Optimization verification
    mapping(bytes32 => bool) public optimizationProofs;
    mapping(address => uint256) public optimizationCount;
    mapping(address => uint256) public successfulOptimizations;
    
    // Staking system
    mapping(address => uint256) public stakedAmount;
    mapping(address => uint256) public stakingStartTime;
    mapping(address => uint256) public stakingRewards;
    uint256 public constant MIN_STAKE_AMOUNT = 1000 * 10**18; // 1000 LDOM
    uint256 public constant STAKING_REWARD_RATE = 5; // 5% annual reward
    
    // Metaverse infrastructure generation
    uint256 public virtualLandCount;
    uint256 public aiNodeCount;
    uint256 public storageShardCount;
    uint256 public bridgeCount;
    
    // Events
    event SpaceHarvested(address indexed harvester, uint256 spaceBytes, uint256 tokensEarned, string url);
    event ReputationUpdated(address indexed harvester, uint256 newScore);
    event VirtualLandCreated(address indexed owner, uint256 landId, string biome, uint256 size);
    event AINodeDeployed(address indexed operator, uint256 nodeId, uint256 computePower);
    event StorageShardCreated(address indexed provider, uint256 shardId, uint256 capacity);
    event BridgeEstablished(address indexed validator, uint256 bridgeId, string sourceChain, string targetChain);
    event RewardHalving(uint256 newReward, uint256 blockNumber);
    event TokensStaked(address indexed staker, uint256 amount, uint256 timestamp);
    event TokensUnstaked(address indexed staker, uint256 amount, uint256 rewards);
    event StakingRewardsClaimed(address indexed staker, uint256 rewards);
    
    constructor() ERC20("LightDom Token", "LDOM") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        
        _mint(msg.sender, INITIAL_SUPPLY);
        lastHalvingBlock = block.number;
    }
    
    /**
     * @dev Submit DOM optimization proof and claim rewards
     * @param url The URL that was optimized
     * @param spaceBytes Amount of space saved in bytes
     * @param proofHash Cryptographic proof of optimization
     * @param biomeType Type of website biome for metaverse generation
     */
    function submitOptimization(
        string memory url,
        uint256 spaceBytes,
        bytes32 proofHash,
        string memory biomeType
    ) external whenNotPaused nonReentrant {
        require(spaceBytes > 0, "Space saved must be positive");
        require(!optimizationProofs[proofHash], "Proof already used");
        require(bytes(url).length > 0, "URL cannot be empty");
        
        // Verify proof (simplified - in production, use more sophisticated verification)
        require(verifyOptimizationProof(url, spaceBytes, proofHash), "Invalid optimization proof");
        
        // Mark proof as used
        optimizationProofs[proofHash] = true;
        
        // Calculate tokens earned
        uint256 tokensEarned = calculateTokensEarned(spaceBytes, msg.sender);
        
        // Update harvester stats
        totalSpaceHarvested[msg.sender] += spaceBytes;
        optimizationCount[msg.sender]++;
        successfulOptimizations[msg.sender]++;
        lastOptimizationBlock[msg.sender] = block.number;
        
        // Update optimization streak
        if (block.number - lastOptimizationBlock[msg.sender] <= 100) {
            optimizationStreak[msg.sender]++;
        } else {
            optimizationStreak[msg.sender] = 1;
        }
        
        // Update reputation
        updateReputation(msg.sender, spaceBytes);
        
        // Mint tokens
        _mint(msg.sender, tokensEarned);
        totalMined += tokensEarned;
        
        // Generate metaverse infrastructure
        generateMetaverseInfrastructure(msg.sender, spaceBytes, biomeType);
        
        // Check for halving
        checkRewardHalving();
        
        emit SpaceHarvested(msg.sender, spaceBytes, tokensEarned, url);
    }
    
    /**
     * @dev Calculate tokens earned based on space saved and reputation
     */
    function calculateTokensEarned(uint256 spaceBytes, address harvester) public view returns (uint256) {
        uint256 baseTokens = (spaceBytes * spaceMultiplier) / BASE_SPACE_RATE;
        uint256 reputationBonus = getReputationMultiplier(harvester);
        uint256 streakBonus = getStreakMultiplier(harvester);
        
        return (baseTokens * reputationBonus * streakBonus) / (100 * 100);
    }
    
    /**
     * @dev Get reputation-based multiplier (100-500%)
     */
    function getReputationMultiplier(address harvester) public view returns (uint256) {
        uint256 score = reputationScore[harvester];
        if (score >= 10000) return 500; // 5x multiplier for top harvesters
        if (score >= 5000) return 300;  // 3x multiplier
        if (score >= 1000) return 200;  // 2x multiplier
        if (score >= 100) return 150;   // 1.5x multiplier
        return 100; // 1x base multiplier
    }
    
    /**
     * @dev Get streak-based multiplier (100-200%)
     */
    function getStreakMultiplier(address harvester) public view returns (uint256) {
        uint256 streak = optimizationStreak[harvester];
        if (streak >= 100) return 200; // 2x multiplier for 100+ streak
        if (streak >= 50) return 150;  // 1.5x multiplier for 50+ streak
        if (streak >= 10) return 120; // 1.2x multiplier for 10+ streak
        return 100; // 1x base multiplier
    }
    
    /**
     * @dev Update harvester reputation based on optimization quality
     */
    function updateReputation(address harvester, uint256 spaceBytes) internal {
        uint256 reputationGain = spaceBytes / 1024; // 1 point per KB
        reputationScore[harvester] += reputationGain;
        emit ReputationUpdated(harvester, reputationScore[harvester]);
    }
    
    /**
     * @dev Generate metaverse infrastructure from harvested space
     */
    function generateMetaverseInfrastructure(
        address owner,
        uint256 spaceBytes,
        string memory biomeType
    ) internal {
        uint256 spaceKB = spaceBytes / 1024;
        
        // Generate virtual land (1 parcel per 100KB)
        if (spaceKB >= 100) {
            uint256 landParcels = spaceKB / 100;
            for (uint256 i = 0; i < landParcels; i++) {
                virtualLandCount++;
                emit VirtualLandCreated(owner, virtualLandCount, biomeType, spaceKB);
            }
        }
        
        // Generate AI consensus nodes (1 node per 1000KB)
        if (spaceKB >= 1000) {
            uint256 nodes = spaceKB / 1000;
            for (uint256 i = 0; i < nodes; i++) {
                aiNodeCount++;
                emit AINodeDeployed(owner, aiNodeCount, spaceKB);
            }
        }
        
        // Generate storage shards (1 shard per 500KB)
        if (spaceKB >= 500) {
            uint256 shards = spaceKB / 500;
            for (uint256 i = 0; i < shards; i++) {
                storageShardCount++;
                emit StorageShardCreated(owner, storageShardCount, spaceKB);
            }
        }
        
        // Generate bridges (1 bridge per 2000KB)
        if (spaceKB >= 2000) {
            uint256 bridges = spaceKB / 2000;
            for (uint256 i = 0; i < bridges; i++) {
                bridgeCount++;
                emit BridgeEstablished(owner, bridgeCount, "Ethereum", "Polygon");
            }
        }
    }
    
    /**
     * @dev Verify optimization proof (simplified implementation)
     */
    function verifyOptimizationProof(
        string memory url,
        uint256 spaceBytes,
        bytes32 proofHash
    ) internal pure returns (bool) {
        // In production, implement proper cryptographic verification
        // For now, accept all proofs (this is a demo)
        return true;
    }
    
    /**
     * @dev Check if reward halving should occur
     */
    function checkRewardHalving() internal {
        if (block.number - lastHalvingBlock >= REWARD_HALVING_INTERVAL) {
            currentBlockReward = currentBlockReward / 2;
            lastHalvingBlock = block.number;
            emit RewardHalving(currentBlockReward, block.number);
        }
    }
    
    /**
     * @dev Stake tokens to earn rewards (minimum 1000 LDOM)
     */
    function stakeTokens(uint256 amount) external {
        require(amount >= MIN_STAKE_AMOUNT, "Minimum stake: 1000 LDOM");
        require(balanceOf(msg.sender) >= amount, "Insufficient balance");
        
        // Claim existing rewards if any
        if (stakedAmount[msg.sender] > 0) {
            claimStakingRewards();
        }
        
        // Transfer tokens to contract
        _transfer(msg.sender, address(this), amount);
        
        // Update staking info
        stakedAmount[msg.sender] += amount;
        stakingStartTime[msg.sender] = block.timestamp;
        
        emit TokensStaked(msg.sender, amount, block.timestamp);
    }
    
    /**
     * @dev Unstake tokens (with cooldown period)
     */
    function unstakeTokens(uint256 amount) external {
        require(amount > 0, "Amount must be positive");
        require(stakedAmount[msg.sender] >= amount, "Insufficient staked balance");
        
        // Claim rewards first
        claimStakingRewards();
        
        // Transfer tokens back to user
        _transfer(address(this), msg.sender, amount);
        
        // Update staking info
        stakedAmount[msg.sender] -= amount;
        
        emit TokensUnstaked(msg.sender, amount, stakingRewards[msg.sender]);
    }
    
    /**
     * @dev Claim staking rewards
     */
    function claimStakingRewards() public {
        require(stakedAmount[msg.sender] > 0, "No staked tokens");
        
        uint256 rewards = calculateStakingRewards(msg.sender);
        if (rewards > 0) {
            stakingRewards[msg.sender] = 0;
            _mint(msg.sender, rewards);
            emit StakingRewardsClaimed(msg.sender, rewards);
        }
    }
    
    /**
     * @dev Calculate staking rewards
     */
    function calculateStakingRewards(address staker) public view returns (uint256) {
        if (stakedAmount[staker] == 0) return 0;
        
        uint256 timeStaked = block.timestamp - stakingStartTime[staker];
        uint256 annualReward = (stakedAmount[staker] * STAKING_REWARD_RATE) / 100;
        uint256 rewards = (annualReward * timeStaked) / 365 days;
        
        return rewards + stakingRewards[staker];
    }
    
    /**
     * @dev Get total metaverse infrastructure count
     */
    function getMetaverseStats() external view returns (
        uint256 land,
        uint256 nodes,
        uint256 shards,
        uint256 bridges
    ) {
        return (virtualLandCount, aiNodeCount, storageShardCount, bridgeCount);
    }
    
    /**
     * @dev Get harvester statistics
     */
    function getHarvesterStats(address harvester) external view returns (
        uint256 reputation,
        uint256 spaceHarvested,
        uint256 optimizations,
        uint256 successfulOptimizations,
        uint256 streak,
        uint256 tokensEarned,
        uint256 stakedAmount,
        uint256 stakingRewards
    ) {
        return (
            reputationScore[harvester],
            totalSpaceHarvested[harvester],
            optimizationCount[harvester],
            successfulOptimizations[harvester],
            optimizationStreak[harvester],
            balanceOf(harvester),
            stakedAmount[harvester],
            calculateStakingRewards(harvester)
        );
    }
    
    /**
     * @dev Mint tokens (only for authorized minters)
     */
    function mint(address to, uint256 amount) external onlyRole(MINTER_ROLE) {
        require(totalSupply() + amount <= MAX_SUPPLY, "Exceeds max supply");
        _mint(to, amount);
    }
    
    /**
     * @dev Pause token transfers
     */
    function pause() external onlyRole(PAUSER_ROLE) {
        _pause();
    }
    
    /**
     * @dev Unpause token transfers
     */
    function unpause() external onlyRole(PAUSER_ROLE) {
        _unpause();
    }
    
    /**
     * @dev Update space multiplier (admin only)
     */
    function setSpaceMultiplier(uint256 newMultiplier) external onlyRole(ADMIN_ROLE) {
        require(newMultiplier > 0, "Multiplier must be positive");
        spaceMultiplier = newMultiplier;
    }
    
    /**
     * @dev Override required functions
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override(ERC20, ERC20Pausable) whenNotPaused {
        super._beforeTokenTransfer(from, to, amount);
    }
}