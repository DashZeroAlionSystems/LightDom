// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title Virtual Land Parcel NFT
 * @dev ERC721 NFT representing virtual land parcels in the DOM Space Metaverse
 * @author DOM Space Harvester Team
 */
contract VirtualLandNFT is ERC721, ERC721URIStorage, ERC721Enumerable, Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;
    
    Counters.Counter private _tokenIdCounter;
    
    // Land parcel structure
    struct LandParcel {
        uint256 tokenId;
        string biomeType;
        uint256 size; // in square meters
        uint256 spaceHarvested; // KB of space that created this land
        string sourceUrl;
        string sourceDomain;
        uint256 developmentLevel;
        uint256 stakingRewards;
        bool isStaked;
        uint256 stakedAt;
        address originalHarvester;
    }
    
    // Biome types and their properties
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
    
    // Mapping from token ID to land parcel data
    mapping(uint256 => LandParcel) public landParcels;
    
    // Mapping from biome to land count
    mapping(BiomeType => uint256) public biomeLandCount;
    
    // Staking rewards per biome type (in DSH per day)
    mapping(BiomeType => uint256) public biomeRewardRates;
    
    // Events
    event LandMinted(
        address indexed to,
        uint256 indexed tokenId,
        string biomeType,
        uint256 size,
        string sourceUrl
    );
    
    event LandStaked(
        address indexed owner,
        uint256 indexed tokenId,
        uint256 stakingRewards
    );
    
    event LandUnstaked(
        address indexed owner,
        uint256 indexed tokenId,
        uint256 rewardsClaimed
    );
    
    event LandDeveloped(
        address indexed owner,
        uint256 indexed tokenId,
        uint256 newDevelopmentLevel
    );
    
    constructor() ERC721("DOM Space Virtual Land", "DSVL") {
        // Set initial reward rates per biome (in DSH per day)
        biomeRewardRates[BiomeType.Digital] = 1 * 10**18;      // 1 DSH/day
        biomeRewardRates[BiomeType.Commercial] = 2 * 10**18;   // 2 DSH/day
        biomeRewardRates[BiomeType.Knowledge] = 1.5 * 10**18;  // 1.5 DSH/day
        biomeRewardRates[BiomeType.Entertainment] = 1.2 * 10**18; // 1.2 DSH/day
        biomeRewardRates[BiomeType.Social] = 1.8 * 10**18;     // 1.8 DSH/day
        biomeRewardRates[BiomeType.Community] = 1.3 * 10**18;  // 1.3 DSH/day
        biomeRewardRates[BiomeType.Professional] = 2.5 * 10**18; // 2.5 DSH/day
        biomeRewardRates[BiomeType.Production] = 3 * 10**18;   // 3 DSH/day
    }
    
    /**
     * @dev Mint a new virtual land parcel
     * @param to Address to mint the land to
     * @param biomeType Type of biome for the land
     * @param size Size of the land parcel in square meters
     * @param spaceHarvested Amount of space that created this land
     * @param sourceUrl URL that was optimized to create this land
     * @param sourceDomain Domain of the source URL
     */
    function mintLandParcel(
        address to,
        string memory biomeType,
        uint256 size,
        uint256 spaceHarvested,
        string memory sourceUrl,
        string memory sourceDomain
    ) external onlyOwner returns (uint256) {
        _tokenIdCounter.increment();
        uint256 tokenId = _tokenIdCounter.current();
        
        // Parse biome type
        BiomeType biome = parseBiomeType(biomeType);
        
        // Create land parcel
        landParcels[tokenId] = LandParcel({
            tokenId: tokenId,
            biomeType: biomeType,
            size: size,
            spaceHarvested: spaceHarvested,
            sourceUrl: sourceUrl,
            sourceDomain: sourceDomain,
            developmentLevel: 1,
            stakingRewards: 0,
            isStaked: false,
            stakedAt: 0,
            originalHarvester: to
        });
        
        // Update biome count
        biomeLandCount[biome]++;
        
        // Mint NFT
        _safeMint(to, tokenId);
        
        // Set token URI
        string memory tokenURI = generateTokenURI(tokenId, biomeType, size);
        _setTokenURI(tokenId, tokenURI);
        
        emit LandMinted(to, tokenId, biomeType, size, sourceUrl);
        
        return tokenId;
    }
    
    /**
     * @dev Stake a land parcel to earn rewards
     * @param tokenId ID of the land parcel to stake
     */
    function stakeLand(uint256 tokenId) external {
        require(ownerOf(tokenId) == msg.sender, "Not the owner of this land");
        require(!landParcels[tokenId].isStaked, "Land already staked");
        
        landParcels[tokenId].isStaked = true;
        landParcels[tokenId].stakedAt = block.timestamp;
        
        emit LandStaked(msg.sender, tokenId, landParcels[tokenId].stakingRewards);
    }
    
    /**
     * @dev Unstake a land parcel and claim rewards
     * @param tokenId ID of the land parcel to unstake
     */
    function unstakeLand(uint256 tokenId) external nonReentrant {
        require(ownerOf(tokenId) == msg.sender, "Not the owner of this land");
        require(landParcels[tokenId].isStaked, "Land not staked");
        
        // Calculate rewards
        uint256 rewards = calculateStakingRewards(tokenId);
        landParcels[tokenId].stakingRewards += rewards;
        
        // Unstake
        landParcels[tokenId].isStaked = false;
        landParcels[tokenId].stakedAt = 0;
        
        emit LandUnstaked(msg.sender, tokenId, rewards);
    }
    
    /**
     * @dev Claim staking rewards for a land parcel
     * @param tokenId ID of the land parcel
     */
    function claimRewards(uint256 tokenId) external {
        require(ownerOf(tokenId) == msg.sender, "Not the owner of this land");
        
        uint256 rewards = calculateStakingRewards(tokenId);
        require(rewards > 0, "No rewards to claim");
        
        landParcels[tokenId].stakingRewards += rewards;
        landParcels[tokenId].stakedAt = block.timestamp; // Reset staking time
        
        // In a real implementation, transfer DSH tokens here
        // For now, just update the rewards counter
    }
    
    /**
     * @dev Develop a land parcel to increase its value
     * @param tokenId ID of the land parcel to develop
     * @param developmentCost Cost in DSH to develop the land
     */
    function developLand(uint256 tokenId, uint256 developmentCost) external {
        require(ownerOf(tokenId) == msg.sender, "Not the owner of this land");
        require(landParcels[tokenId].developmentLevel < 10, "Land already fully developed");
        require(developmentCost >= getDevelopmentCost(tokenId), "Insufficient development cost");
        
        // In a real implementation, burn DSH tokens here
        // For now, just increase development level
        
        landParcels[tokenId].developmentLevel++;
        
        emit LandDeveloped(msg.sender, tokenId, landParcels[tokenId].developmentLevel);
    }
    
    /**
     * @dev Calculate staking rewards for a land parcel
     * @param tokenId ID of the land parcel
     * @return rewards Amount of rewards earned
     */
    function calculateStakingRewards(uint256 tokenId) public view returns (uint256) {
        if (!landParcels[tokenId].isStaked) return 0;
        
        BiomeType biome = parseBiomeType(landParcels[tokenId].biomeType);
        uint256 rewardRate = biomeRewardRates[biome];
        uint256 timeStaked = block.timestamp - landParcels[tokenId].stakedAt;
        
        // Calculate rewards based on time staked and development level
        uint256 baseRewards = (rewardRate * timeStaked) / 1 days;
        uint256 developmentMultiplier = 100 + (landParcels[tokenId].developmentLevel * 10); // 10% per level
        
        return (baseRewards * developmentMultiplier) / 100;
    }
    
    /**
     * @dev Get development cost for a land parcel
     * @param tokenId ID of the land parcel
     * @return cost Cost in DSH to develop the land
     */
    function getDevelopmentCost(uint256 tokenId) public view returns (uint256) {
        uint256 currentLevel = landParcels[tokenId].developmentLevel;
        return (currentLevel * 100 * 10**18); // 100 DSH per level
    }
    
    /**
     * @dev Parse biome type string to enum
     * @param biomeType String representation of biome type
     * @return BiomeType enum value
     */
    function parseBiomeType(string memory biomeType) internal pure returns (BiomeType) {
        bytes32 hash = keccak256(abi.encodePacked(biomeType));
        
        if (hash == keccak256(abi.encodePacked("digital"))) return BiomeType.Digital;
        if (hash == keccak256(abi.encodePacked("commercial"))) return BiomeType.Commercial;
        if (hash == keccak256(abi.encodePacked("knowledge"))) return BiomeType.Knowledge;
        if (hash == keccak256(abi.encodePacked("entertainment"))) return BiomeType.Entertainment;
        if (hash == keccak256(abi.encodePacked("social"))) return BiomeType.Social;
        if (hash == keccak256(abi.encodePacked("community"))) return BiomeType.Community;
        if (hash == keccak256(abi.encodePacked("professional"))) return BiomeType.Professional;
        if (hash == keccak256(abi.encodePacked("production"))) return BiomeType.Production;
        
        return BiomeType.Digital; // Default
    }
    
    /**
     * @dev Generate token URI for a land parcel
     * @param tokenId ID of the token
     * @param biomeType Type of biome
     * @param size Size of the land
     * @return tokenURI JSON metadata URI
     */
    function generateTokenURI(
        uint256 tokenId,
        string memory biomeType,
        uint256 size
    ) internal pure returns (string memory) {
        return string(abi.encodePacked(
            "data:application/json;base64,",
            base64Encode(abi.encodePacked(
                '{"name":"Virtual Land Parcel #', tokenId.toString(), '",',
                '"description":"A virtual land parcel in the DOM Space Metaverse created from web optimization",',
                '"image":"https://domspaceharvester.com/land/', tokenId.toString(), '.png",',
                '"attributes":[',
                '{"trait_type":"Biome","value":"', biomeType, '"},',
                '{"trait_type":"Size","value":', size.toString(), '},',
                '{"trait_type":"Development Level","value":1}',
                ']}'
            ))
        ));
    }
    
    /**
     * @dev Base64 encode function
     */
    function base64Encode(bytes memory data) internal pure returns (string memory) {
        // Simplified base64 encoding - in production use a proper library
        return "base64_encoded_metadata";
    }
    
    /**
     * @dev Get land parcel details
     * @param tokenId ID of the land parcel
     * @return LandParcel struct with all details
     */
    function getLandParcel(uint256 tokenId) external view returns (LandParcel memory) {
        return landParcels[tokenId];
    }
    
    /**
     * @dev Get total land count by biome
     * @param biome Biome type to count
     * @return count Number of land parcels in this biome
     */
    function getBiomeLandCount(BiomeType biome) external view returns (uint256) {
        return biomeLandCount[biome];
    }
    
    /**
     * @dev Get all land parcels owned by an address
     * @param owner Address to query
     * @return tokenIds Array of token IDs owned by the address
     */
    function getOwnedLands(address owner) external view returns (uint256[] memory) {
        uint256 balance = balanceOf(owner);
        uint256[] memory tokenIds = new uint256[](balance);
        
        for (uint256 i = 0; i < balance; i++) {
            tokenIds[i] = tokenOfOwnerByIndex(owner, i);
        }
        
        return tokenIds;
    }
    
    // Required overrides for multiple inheritance
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal override(ERC721, ERC721Enumerable) {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }
    
    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }
    
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }
    
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
