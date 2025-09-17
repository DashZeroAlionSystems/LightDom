// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title Enhanced DOM Space Harvester Token (DSH)
 * @dev Complete implementation of space optimization tokenization system
 * @author DOM Space Harvester Team
 */
contract EnhancedDOMSpaceToken is ERC20, ERC20Burnable, Ownable, Pausable, ReentrancyGuard {
    using Counters for Counters.Counter;
    
    // Token constants
    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 10**18; // 1 billion DSH
    uint256 public constant INITIAL_SUPPLY = 100_000_000 * 10**18; // 100 million initial
    uint256 public constant REWARD_HALVING_INTERVAL = 2_102_400; // ~24 days (2,102,400 blocks)
    
    // Mining rewards
    uint256 public currentBlockReward = 50 * 10**18; // 50 DSH per block initially
    uint256 public lastHalvingBlock;
    uint256 public totalMined;
    
    // Space conversion rates (1 KB = 0.001 DSH base)
    uint256 public constant BASE_SPACE_RATE = 1000; // 1 KB = 0.001 DSH
    uint256 public spaceMultiplier = 100; // Can be adjusted by owner
    
    // Reputation system
    mapping(address => uint256) public reputationScore;
    mapping(address => uint256) public totalSpaceHarvested;
    mapping(address => uint256) public lastOptimizationBlock;
    mapping(address => uint256) public optimizationCount;
    
    // Optimization verification
    mapping(bytes32 => bool) public optimizationProofs;
    mapping(address => bool) public isHarvester;
    
    // Metaverse infrastructure generation
    Counters.Counter private _landParcelCounter;
    Counters.Counter private _aiNodeCounter;
    Counters.Counter private _storageShardCounter;
    Counters.Counter private _bridgeCounter;
    
    // Staking system
    mapping(address => uint256) public stakedAmount;
    mapping(address => uint256) public stakingRewards;
    mapping(address => uint256) public lastStakingUpdate;
    uint256 public totalStaked;
    uint256 public stakingRewardRate = 10; // 10% APY
    
    // Biome types and their multipliers
    enum BiomeType {
        Digital,        // 0 - Tech websites
        Commercial,     // 1 - E-commerce
        Knowledge,      // 2 - Educational
        Entertainment,  // 3 - Media/Entertainment
        Social,         // 4 - Social networks
        Community,      // 5 - Forums/Communities
        Professional,   // 6 - Business/Professional
        Production      // 7 - Manufacturing/Production
    }
    
    mapping(BiomeType => uint256) public biomeMultipliers;
    
    // Events
    event SpaceHarvested(address indexed harvester, uint256 spaceBytes, uint256 tokensEarned, string url);
    event ReputationUpdated(address indexed harvester, uint256 newScore);
    event VirtualLandCreated(address indexed owner, uint256 landId, BiomeType biome, uint256 size);
    event AINodeDeployed(address indexed operator, uint256 nodeId, uint256 computePower);
    event StorageShardCreated(address indexed provider, uint256 shardId, uint256 capacity);
    event BridgeEstablished(address indexed validator, uint256 bridgeId, string sourceChain, string targetChain);
    event RewardHalving(uint256 newReward, uint256 blockNumber);
    event HarvesterRegistered(address indexed harvester, uint256 stakeAmount);
    event TokensStaked(address indexed staker, uint256 amount);
    event TokensUnstaked(address indexed staker, uint256 amount);
    event StakingRewardsClaimed(address indexed staker, uint256 amount);
    
    constructor() ERC20("DOM Space Harvester", "DSH") {
        _mint(msg.sender, INITIAL_SUPPLY);
        lastHalvingBlock = block.number;
        
        // Set biome multipliers
        biomeMultipliers[BiomeType.Production] = 300; // 3x multiplier
        biomeMultipliers[BiomeType.Professional] = 250; // 2.5x multiplier
        biomeMultipliers[BiomeType.Commercial] = 200; // 2x multiplier
        biomeMultipliers[BiomeType.Social] = 180; // 1.8x multiplier
        biomeMultipliers[BiomeType.Knowledge] = 150; // 1.5x multiplier
        biomeMultipliers[BiomeType.Community] = 130; // 1.3x multiplier
        biomeMultipliers[BiomeType.Entertainment] = 120; // 1.2x multiplier
        biomeMultipliers[BiomeType.Digital] = 100; // 1x multiplier
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
        BiomeType biomeType
    ) external whenNotPaused nonReentrant {
        require(spaceBytes > 0, "Space saved must be positive");
        require(!optimizationProofs[proofHash], "Proof already used");
        require(bytes(url).length > 0, "URL cannot be empty");
        require(isHarvester[msg.sender], "Not a registered harvester");
        
        // Verify proof (simplified - in production, use more sophisticated verification)
        require(verifyOptimizationProof(url, spaceBytes, proofHash), "Invalid optimization proof");
        
        // Mark proof as used
        optimizationProofs[proofHash] = true;
        
        // Calculate tokens earned
        uint256 tokensEarned = calculateTokensEarned(spaceBytes, msg.sender, biomeType);
        
        // Update harvester stats
        totalSpaceHarvested[msg.sender] += spaceBytes;
        optimizationCount[msg.sender]++;
        lastOptimizationBlock[msg.sender] = block.number;
        
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
     * @dev Register as a harvester (requires staking)
     */
    function registerHarvester(uint256 stakeAmount) external {
        require(stakeAmount >= 1000 * 10**18, "Minimum stake: 1000 DSH");
        require(balanceOf(msg.sender) >= stakeAmount, "Insufficient balance");
        require(!isHarvester[msg.sender], "Already a harvester");
        
        // Transfer tokens to contract
        _transfer(msg.sender, address(this), stakeAmount);
        
        // Update staking
        stakedAmount[msg.sender] += stakeAmount;
        totalStaked += stakeAmount;
        lastStakingUpdate[msg.sender] = block.timestamp;
        
        // Register as harvester
        isHarvester[msg.sender] = true;
        
        // Bonus reputation for staking
        reputationScore[msg.sender] += 1000;
        
        emit HarvesterRegistered(msg.sender, stakeAmount);
    }
    
    /**
     * @dev Stake additional tokens
     */
    function stakeTokens(uint256 amount) external {
        require(amount > 0, "Amount must be positive");
        require(balanceOf(msg.sender) >= amount, "Insufficient balance");
        
        // Claim existing rewards first
        claimStakingRewards();
        
        // Transfer tokens to contract
        _transfer(msg.sender, address(this), amount);
        
        // Update staking
        stakedAmount[msg.sender] += amount;
        totalStaked += amount;
        lastStakingUpdate[msg.sender] = block.timestamp;
        
        emit TokensStaked(msg.sender, amount);
    }
    
    /**
     * @dev Unstake tokens
     */
    function unstakeTokens(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be positive");
        require(stakedAmount[msg.sender] >= amount, "Insufficient staked amount");
        
        // Claim existing rewards first
        claimStakingRewards();
        
        // Update staking
        stakedAmount[msg.sender] -= amount;
        totalStaked -= amount;
        
        // Transfer tokens back to user
        _transfer(address(this), msg.sender, amount);
        
        emit TokensUnstaked(msg.sender, amount);
    }
    
    /**
     * @dev Claim staking rewards
     */
    function claimStakingRewards() public {
        uint256 rewards = calculateStakingRewards(msg.sender);
        if (rewards > 0) {
            stakingRewards[msg.sender] += rewards;
            _mint(msg.sender, rewards);
            lastStakingUpdate[msg.sender] = block.timestamp;
            
            emit StakingRewardsClaimed(msg.sender, rewards);
        }
    }
    
    /**
     * @dev Calculate tokens earned based on space saved, reputation, and biome
     */
    function calculateTokensEarned(uint256 spaceBytes, address harvester, BiomeType biomeType) public view returns (uint256) {
        uint256 spaceKB = spaceBytes / 1024;
        uint256 baseTokens = (spaceKB * spaceMultiplier) / BASE_SPACE_RATE;
        uint256 reputationBonus = getReputationMultiplier(harvester);
        uint256 biomeBonus = biomeMultipliers[biomeType];
        
        return (baseTokens * reputationBonus * biomeBonus) / (100 * 100);
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
        BiomeType biomeType
    ) internal {
        uint256 spaceKB = spaceBytes / 1024;
        
        // Generate virtual land (1 parcel per 100KB)
        if (spaceKB >= 100) {
            uint256 landParcels = spaceKB / 100;
            for (uint256 i = 0; i < landParcels; i++) {
                _landParcelCounter.increment();
                emit VirtualLandCreated(owner, _landParcelCounter.current(), biomeType, spaceKB);
            }
        }
        
        // Generate AI consensus nodes (1 node per 1000KB)
        if (spaceKB >= 1000) {
            uint256 nodes = spaceKB / 1000;
            for (uint256 i = 0; i < nodes; i++) {
                _aiNodeCounter.increment();
                emit AINodeDeployed(owner, _aiNodeCounter.current(), spaceKB);
            }
        }
        
        // Generate storage shards (1 shard per 500KB)
        if (spaceKB >= 500) {
            uint256 shards = spaceKB / 500;
            for (uint256 i = 0; i < shards; i++) {
                _storageShardCounter.increment();
                emit StorageShardCreated(owner, _storageShardCounter.current(), spaceKB);
            }
        }
        
        // Generate bridges (1 bridge per 2000KB)
        if (spaceKB >= 2000) {
            uint256 bridges = spaceKB / 2000;
            for (uint256 i = 0; i < bridges; i++) {
                _bridgeCounter.increment();
                emit BridgeEstablished(owner, _bridgeCounter.current(), "Ethereum", "Polygon");
            }
        }
    }
    
    /**
     * @dev Calculate staking rewards for a user
     */
    function calculateStakingRewards(address user) public view returns (uint256) {
        if (stakedAmount[user] == 0) return 0;
        
        uint256 timeStaked = block.timestamp - lastStakingUpdate[user];
        uint256 annualReward = (stakedAmount[user] * stakingRewardRate) / 100;
        uint256 dailyReward = annualReward / 365;
        uint256 rewards = (dailyReward * timeStaked) / 1 days;
        
        return rewards;
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
     * @dev Get total metaverse infrastructure count
     */
    function getMetaverseStats() external view returns (
        uint256 land,
        uint256 nodes,
        uint256 shards,
        uint256 bridges
    ) {
        return (
            _landParcelCounter.current(),
            _aiNodeCounter.current(),
            _storageShardCounter.current(),
            _bridgeCounter.current()
        );
    }
    
    /**
     * @dev Get harvester statistics
     */
    function getHarvesterStats(address harvester) external view returns (
        uint256 reputation,
        uint256 spaceHarvested,
        uint256 optimizations,
        uint256 tokensEarned,
        uint256 stakedAmount_,
        uint256 stakingRewards_
    ) {
        return (
            reputationScore[harvester],
            totalSpaceHarvested[harvester],
            optimizationCount[harvester],
            balanceOf(harvester),
            stakedAmount[harvester],
            stakingRewards[harvester]
        );
    }
    
    /**
     * @dev Get staking information
     */
    function getStakingInfo(address user) external view returns (
        uint256 staked,
        uint256 rewards,
        uint256 pendingRewards
    ) {
        return (
            stakedAmount[user],
            stakingRewards[user],
            calculateStakingRewards(user)
        );
    }
    
    /**
     * @dev Update space multiplier (owner only)
     */
    function setSpaceMultiplier(uint256 newMultiplier) external onlyOwner {
        require(newMultiplier > 0, "Multiplier must be positive");
        spaceMultiplier = newMultiplier;
    }
    
    /**
     * @dev Update staking reward rate (owner only)
     */
    function setStakingRewardRate(uint256 newRate) external onlyOwner {
        require(newRate <= 100, "Rate cannot exceed 100%");
        stakingRewardRate = newRate;
    }
    
    /**
     * @dev Update biome multiplier (owner only)
     */
    function setBiomeMultiplier(BiomeType biome, uint256 multiplier) external onlyOwner {
        biomeMultipliers[biome] = multiplier;
    }
    
    /**
     * @dev Emergency pause function
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause function
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Override transfer to include reputation bonus
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override whenNotPaused {
        super._beforeTokenTransfer(from, to, amount);
    }
}
