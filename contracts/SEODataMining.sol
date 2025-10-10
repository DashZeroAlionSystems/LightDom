// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";

/**
 * @title SEODataMining
 * @dev Blockchain system for mining 194 SEO features to train collective AI models
 * Users contribute data, earn rewards, and share in AI model profits
 */
contract SEODataMining is Ownable, ReentrancyGuard {
    using Math for uint256;

    // ============================================================================
    // State Variables
    // ============================================================================
    
    IERC20 public dshToken;
    
    // Mining rewards configuration
    uint256 public constant BASE_REWARD_PER_FEATURE = 10 * 10**15; // 0.01 DSH per feature
    uint256 public constant QUALITY_MULTIPLIER = 3; // Up to 3x for high quality
    uint256 public constant RARE_FEATURE_BONUS = 5; // 5x for rare features
    
    // AI model marketplace
    uint256 public modelIdCounter;
    uint256 public totalDataPoints;
    uint256 public totalFeaturesMined;
    
    // Feature rarity tracking (which of 194 features are rare)
    mapping(uint256 => uint256) public featureContributionCount;
    mapping(uint256 => bool) public isRareFeature;
    
    // ============================================================================
    // Structs
    // ============================================================================
    
    struct SEODataContribution {
        address contributor;
        string url;
        string keyword;
        uint256 timestamp;
        uint256 featuresProvided; // Bitmap of which features were provided
        uint256 qualityScore; // 0-100
        uint256 rewardEarned;
        bytes32 dataHash; // IPFS hash of full data
    }
    
    struct AIModel {
        uint256 id;
        string name;
        string version;
        uint256 trainedOnDataPoints;
        uint256 accuracy; // NDCG score * 100
        uint256 pricePerQuery; // Price to use the model
        uint256 totalRevenue;
        address[] contributors; // Users who contributed training data
        mapping(address => uint256) contributorShares; // Profit sharing
        bool isActive;
        bytes32 modelHash; // IPFS hash of model weights
    }
    
    struct MiningStats {
        uint256 totalContributions;
        uint256 totalRewards;
        uint256 uniqueUrls;
        uint256 averageQuality;
        mapping(uint256 => uint256) featuresCounted; // Count per feature type
    }
    
    // ============================================================================
    // Mappings
    // ============================================================================
    
    // Mining data
    mapping(uint256 => SEODataContribution) public contributions;
    mapping(address => uint256[]) public userContributions;
    mapping(string => bool) public urlProcessed;
    mapping(address => MiningStats) public minerStats;
    
    // AI Models
    mapping(uint256 => AIModel) public aiModels;
    mapping(address => uint256[]) public userModelShares;
    
    // Feature importance (0-100)
    mapping(uint256 => uint256) public featureImportance;
    
    // Quality validators
    mapping(address => bool) public isValidator;
    mapping(uint256 => mapping(address => bool)) public hasValidated;
    
    // ============================================================================
    // Events
    // ============================================================================
    
    event DataContributed(
        address indexed contributor,
        uint256 indexed contributionId,
        string url,
        uint256 featuresProvided,
        uint256 reward
    );
    
    event ModelTrained(
        uint256 indexed modelId,
        string name,
        uint256 accuracy,
        uint256 dataPoints
    );
    
    event ModelQueried(
        uint256 indexed modelId,
        address indexed user,
        uint256 payment
    );
    
    event ProfitDistributed(
        uint256 indexed modelId,
        uint256 totalProfit,
        uint256 contributors
    );
    
    event RareFeatureIdentified(
        uint256 featureId,
        uint256 contributionCount
    );
    
    // ============================================================================
    // Constructor
    // ============================================================================
    
    constructor(address _dshToken) Ownable(msg.sender) {
        dshToken = IERC20(_dshToken);
        
        // Initialize important features (top 20)
        featureImportance[102] = 100; // domain_authority
        featureImportance[82] = 95;   // total_backlinks
        featureImportance[138] = 90;  // word_count
        featureImportance[192] = 88;  // cwv_composite_score
        featureImportance[133] = 85;  // ctr_vs_expected
        featureImportance[4] = 82;    // title_optimal_length
        featureImportance[117] = 80;  // average_position
        featureImportance[103] = 78;  // page_authority
        featureImportance[128] = 75;  // engagement_rate
        featureImportance[154] = 73;  // content_age_days
        
        // Mark initially rare features
        for (uint256 i = 175; i <= 186; i++) {
            isRareFeature[i] = true; // Interaction features are rare
        }
    }
    
    // ============================================================================
    // Mining Functions
    // ============================================================================
    
    /**
     * @dev Contribute SEO data for mining rewards
     * @param url The URL analyzed
     * @param keyword Target keyword
     * @param featuresProvided Bitmap indicating which of 194 features are provided
     * @param dataHash IPFS hash containing full feature data
     * @param qualityScore Data quality (0-100) from validation
     */
    function contributeData(
        string memory url,
        string memory keyword,
        uint256 featuresProvided,
        bytes32 dataHash,
        uint256 qualityScore
    ) external nonReentrant {
        require(qualityScore <= 100, "Invalid quality score");
        require(featuresProvided > 0, "No features provided");
        require(!urlProcessed[url], "URL already processed");
        
        // Calculate reward based on features provided
        uint256 reward = calculateMiningReward(featuresProvided, qualityScore);
        
        // Create contribution record
        uint256 contributionId = totalDataPoints++;
        contributions[contributionId] = SEODataContribution({
            contributor: msg.sender,
            url: url,
            keyword: keyword,
            timestamp: block.timestamp,
            featuresProvided: featuresProvided,
            qualityScore: qualityScore,
            rewardEarned: reward,
            dataHash: dataHash
        });
        
        // Update mining stats
        userContributions[msg.sender].push(contributionId);
        urlProcessed[url] = true;
        minerStats[msg.sender].totalContributions++;
        minerStats[msg.sender].totalRewards += reward;
        minerStats[msg.sender].uniqueUrls++;
        
        // Update feature counts
        updateFeatureCounts(featuresProvided);
        
        // Transfer mining reward
        require(dshToken.transfer(msg.sender, reward), "Reward transfer failed");
        
        emit DataContributed(msg.sender, contributionId, url, featuresProvided, reward);
    }
    
    /**
     * @dev Calculate mining reward based on features and quality
     */
    function calculateMiningReward(
        uint256 featuresProvided,
        uint256 qualityScore
    ) public view returns (uint256) {
        uint256 reward = 0;
        uint256 featureCount = 0;
        
        // Count features and calculate base reward
        for (uint256 i = 0; i < 194; i++) {
            if (featuresProvided & (1 << i) != 0) {
                featureCount++;
                
                // Base reward per feature
                uint256 featureReward = BASE_REWARD_PER_FEATURE;
                
                // Apply importance multiplier
                if (featureImportance[i] > 0) {
                    featureReward = featureReward * featureImportance[i] / 50;
                }
                
                // Apply rarity bonus
                if (isRareFeature[i]) {
                    featureReward = featureReward * RARE_FEATURE_BONUS;
                }
                
                reward += featureReward;
            }
        }
        
        // Apply quality multiplier (0.5x to 3x based on quality)
        uint256 qualityMultiplier = 50 + (qualityScore * 250 / 100);
        reward = reward * qualityMultiplier / 100;
        
        // Bonus for providing many features
        if (featureCount >= 150) {
            reward = reward * 150 / 100; // 50% bonus for near-complete data
        } else if (featureCount >= 100) {
            reward = reward * 125 / 100; // 25% bonus
        } else if (featureCount >= 50) {
            reward = reward * 110 / 100; // 10% bonus
        }
        
        return reward;
    }
    
    /**
     * @dev Update feature contribution counts and identify rare features
     */
    function updateFeatureCounts(uint256 featuresProvided) internal {
        for (uint256 i = 0; i < 194; i++) {
            if (featuresProvided & (1 << i) != 0) {
                featureContributionCount[i]++;
                totalFeaturesMined++;
                
                // Update rarity status
                if (featureContributionCount[i] > 100 && isRareFeature[i]) {
                    isRareFeature[i] = false; // No longer rare
                } else if (featureContributionCount[i] < 10 && !isRareFeature[i]) {
                    isRareFeature[i] = true; // Became rare
                    emit RareFeatureIdentified(i, featureContributionCount[i]);
                }
            }
        }
    }
    
    // ============================================================================
    // AI Model Training & Marketplace
    // ============================================================================
    
    /**
     * @dev Train a new AI model using collected data
     * @param name Model name
     * @param version Model version
     * @param accuracy NDCG score * 100 (e.g., 85 for 0.85 NDCG)
     * @param modelHash IPFS hash of trained model
     * @param contributorList List of data contributors
     * @param shares Profit sharing percentages (must sum to 100)
     */
    function deployTrainedModel(
        string memory name,
        string memory version,
        uint256 accuracy,
        bytes32 modelHash,
        address[] memory contributorList,
        uint256[] memory shares
    ) external onlyOwner {
        require(contributorList.length == shares.length, "Mismatched arrays");
        require(accuracy <= 100, "Invalid accuracy");
        
        // Verify shares sum to 100
        uint256 totalShares = 0;
        for (uint256 i = 0; i < shares.length; i++) {
            totalShares += shares[i];
        }
        require(totalShares == 100, "Shares must sum to 100");
        
        // Create new model
        uint256 modelId = modelIdCounter++;
        AIModel storage model = aiModels[modelId];
        model.id = modelId;
        model.name = name;
        model.version = version;
        model.trainedOnDataPoints = totalDataPoints;
        model.accuracy = accuracy;
        model.pricePerQuery = calculateModelPrice(accuracy);
        model.isActive = true;
        model.modelHash = modelHash;
        model.contributors = contributorList;
        
        // Set contributor shares
        for (uint256 i = 0; i < contributorList.length; i++) {
            model.contributorShares[contributorList[i]] = shares[i];
            userModelShares[contributorList[i]].push(modelId);
        }
        
        emit ModelTrained(modelId, name, accuracy, totalDataPoints);
    }
    
    /**
     * @dev Calculate model query price based on accuracy
     */
    function calculateModelPrice(uint256 accuracy) public pure returns (uint256) {
        // Base price: 0.1 DSH, scaled by accuracy
        // 85% accuracy = 0.17 DSH per query
        return (10**17) * accuracy / 50;
    }
    
    /**
     * @dev Query an AI model (payment required)
     */
    function queryModel(uint256 modelId) external nonReentrant {
        AIModel storage model = aiModels[modelId];
        require(model.isActive, "Model not active");
        
        // Charge for query
        require(
            dshToken.transferFrom(msg.sender, address(this), model.pricePerQuery),
            "Payment failed"
        );
        
        model.totalRevenue += model.pricePerQuery;
        
        emit ModelQueried(modelId, msg.sender, model.pricePerQuery);
        
        // Distribute profits if revenue threshold reached
        if (model.totalRevenue >= 100 * 10**18) { // 100 DSH threshold
            distributeProfits(modelId);
        }
    }
    
    /**
     * @dev Distribute model profits to contributors
     */
    function distributeProfits(uint256 modelId) public nonReentrant {
        AIModel storage model = aiModels[modelId];
        require(model.totalRevenue > 0, "No revenue to distribute");
        
        uint256 toDistribute = model.totalRevenue;
        model.totalRevenue = 0;
        
        // Take 10% platform fee
        uint256 platformFee = toDistribute / 10;
        toDistribute -= platformFee;
        
        // Distribute to contributors based on shares
        for (uint256 i = 0; i < model.contributors.length; i++) {
            address contributor = model.contributors[i];
            uint256 share = model.contributorShares[contributor];
            uint256 payment = toDistribute * share / 100;
            
            if (payment > 0) {
                require(dshToken.transfer(contributor, payment), "Distribution failed");
            }
        }
        
        emit ProfitDistributed(modelId, toDistribute, model.contributors.length);
    }
    
    // ============================================================================
    // Data Quality Validation
    // ============================================================================
    
    /**
     * @dev Validate data quality (called by authorized validators)
     */
    function validateContribution(
        uint256 contributionId,
        uint256 qualityScore
    ) external {
        require(isValidator[msg.sender], "Not a validator");
        require(!hasValidated[contributionId][msg.sender], "Already validated");
        require(qualityScore <= 100, "Invalid score");
        
        SEODataContribution storage contribution = contributions[contributionId];
        require(contribution.contributor != address(0), "Invalid contribution");
        
        // Update quality score (average of validations)
        contribution.qualityScore = (contribution.qualityScore + qualityScore) / 2;
        hasValidated[contributionId][msg.sender] = true;
        
        // Additional reward for high quality
        if (qualityScore >= 90) {
            uint256 bonus = contribution.rewardEarned / 10; // 10% bonus
            require(dshToken.transfer(contribution.contributor, bonus), "Bonus failed");
        }
    }
    
    // ============================================================================
    // View Functions
    // ============================================================================
    
    /**
     * @dev Get feature rarity scores (for UI display)
     */
    function getFeatureRarityScores() external view returns (uint256[] memory) {
        uint256[] memory scores = new uint256[](194);
        
        for (uint256 i = 0; i < 194; i++) {
            if (featureContributionCount[i] == 0) {
                scores[i] = 100; // Maximum rarity
            } else {
                scores[i] = 100 - Math.min(featureContributionCount[i], 100);
            }
        }
        
        return scores;
    }
    
    /**
     * @dev Get user's mining statistics
     */
    function getUserMiningStats(address user) external view returns (
        uint256 totalContributions,
        uint256 totalRewards,
        uint256 uniqueUrls,
        uint256[] memory contributionIds
    ) {
        MiningStats storage stats = minerStats[user];
        return (
            stats.totalContributions,
            stats.totalRewards,
            stats.uniqueUrls,
            userContributions[user]
        );
    }
    
    /**
     * @dev Get model details
     */
    function getModelDetails(uint256 modelId) external view returns (
        string memory name,
        string memory version,
        uint256 accuracy,
        uint256 price,
        uint256 revenue,
        bool active
    ) {
        AIModel storage model = aiModels[modelId];
        return (
            model.name,
            model.version,
            model.accuracy,
            model.pricePerQuery,
            model.totalRevenue,
            model.isActive
        );
    }
    
    // ============================================================================
    // Admin Functions
    // ============================================================================
    
    function addValidator(address validator) external onlyOwner {
        isValidator[validator] = true;
    }
    
    function removeValidator(address validator) external onlyOwner {
        isValidator[validator] = false;
    }
    
    function updateFeatureImportance(
        uint256 featureId,
        uint256 importance
    ) external onlyOwner {
        require(featureId < 194, "Invalid feature ID");
        require(importance <= 100, "Invalid importance");
        featureImportance[featureId] = importance;
    }
    
    function withdrawPlatformFees() external onlyOwner {
        uint256 balance = dshToken.balanceOf(address(this));
        require(dshToken.transfer(owner(), balance), "Withdrawal failed");
    }
}