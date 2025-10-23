// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title Metaverse Creature NFT
 * @dev ERC721 NFT for unique animated metaverse creatures and objects
 * Features:
 * - User-generated creatures with backstory
 * - Dynamic attributes and evolution
 * - Lore coherence system
 * - Animation URI support
 * - Benefits tracking
 * - Auction integration
 */
contract MetaverseCreatureNFT is ERC721, ERC721Enumerable, Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;
    using Strings for uint256;

    Counters.Counter private _tokenIdCounter;

    // Creature categories
    enum CreatureCategory {
        Companion,      // 0 - Pet/companion
        Mount,          // 1 - Rideable mount
        Guardian,       // 2 - Protective guardian
        Harvester,      // 3 - Mining/harvesting assistant
        Mystical,       // 4 - Magical/mystical being
        Mechanical      // 5 - Robotic/mechanical
    }

    // Object categories
    enum ObjectCategory {
        Tool,           // 0 - Tool/implement
        Weapon,         // 1 - Weapon
        Armor,          // 2 - Armor/protection
        Artifact,       // 3 - Artifact/relic
        Vehicle,        // 4 - Vehicle
        Building        // 5 - Building/structure
    }

    // Rarity levels
    enum Rarity {
        Common,         // 0
        Uncommon,       // 1
        Rare,           // 2
        Epic,           // 3
        Legendary,      // 4
        Mythical        // 5
    }

    // Attribute types
    enum Attribute {
        Mining,         // 0
        Speed,          // 1
        Defense,        // 2
        Magic,          // 3
        Intelligence,   // 4
        Charm           // 5
    }

    // Creature/Object data structure
    struct MetaverseEntity {
        uint256 tokenId;
        string name;
        bool isCreature; // true = creature, false = object
        uint256 categoryId; // Maps to CreatureCategory or ObjectCategory
        Rarity rarity;
        Attribute primaryAttribute;

        // Lore and narrative
        string species; // For creatures
        string objectType; // For objects
        string origin;
        string backstory;
        string flavorText;
        string[] connections; // Links to other entities
        string[] relics; // Connected items
        string metaverseRole;
        string historicalSignificance;

        // Visual and animation
        string animationURI;
        string imageURI;
        string metadataURI;

        // Attributes
        uint256 miningPower;
        uint256 speedBonus;
        uint256 defenseRating;
        uint256 magicPower;
        uint256 intelligence;
        uint256 charisma;

        // Evolution and benefits
        uint256 level;
        uint256 experience;
        uint256 totalBenefitsEarned; // DSH earned through this entity
        uint256 totalUsageTime; // Seconds entity has been actively used

        // Creation info
        address creator;
        bool isUserGenerated;
        uint256 createdAt;
        uint256 lastEvolved;
    }

    // Storage
    mapping(uint256 => MetaverseEntity) public entities;
    mapping(address => uint256[]) public creatorEntities;
    mapping(string => bool) public nameExists;

    // Lore coherence tracking
    mapping(string => uint256[]) public factionEntities; // Faction name => entity IDs
    mapping(string => uint256[]) public locationEntities; // Location => entity IDs
    mapping(string => uint256[]) public eventEntities; // Event => entity IDs

    // Benefits tracking
    struct Benefits {
        uint256 totalMined; // DSH mined with this entity
        uint256 totalOptimizations; // Optimizations performed
        uint256 totalAuctionSales; // DSH earned from auctions
        uint256 totalRentalIncome; // DSH earned from rentals
        uint256 prestigePoints; // Accumulated prestige
    }

    mapping(uint256 => Benefits) public entityBenefits;

    // Usage tracking for analytics
    struct UsageStats {
        uint256 lastUsed;
        uint256 totalSessions;
        uint256 averageSessionDuration;
        uint256 favoriteCount; // How many users favorited this
    }

    mapping(uint256 => UsageStats) public entityUsage;

    // Creation fees
    uint256 public creatureCreationFee = 0.02 ether;
    uint256 public objectCreationFee = 0.015 ether;

    // Experience requirements for leveling
    uint256[] public experienceRequirements = [
        100,   // Level 1 -> 2
        250,   // Level 2 -> 3
        500,   // Level 3 -> 4
        1000,  // Level 4 -> 5
        2500,  // Level 5 -> 6
        5000,  // Level 6 -> 7
        10000, // Level 7 -> 8
        25000, // Level 8 -> 9
        50000  // Level 9 -> 10
    ];

    // Events
    event CreatureCreated(
        uint256 indexed tokenId,
        address indexed creator,
        string name,
        CreatureCategory category,
        Rarity rarity,
        bool isUserGenerated
    );

    event ObjectCreated(
        uint256 indexed tokenId,
        address indexed creator,
        string name,
        ObjectCategory category,
        Rarity rarity,
        bool isUserGenerated
    );

    event EntityEvolved(
        uint256 indexed tokenId,
        uint256 newLevel,
        uint256 bonusAttributePoints
    );

    event BenefitsEarned(
        uint256 indexed tokenId,
        string benefitType,
        uint256 amount
    );

    event EntityUsed(
        uint256 indexed tokenId,
        address indexed user,
        uint256 duration
    );

    event LoreUpdated(
        uint256 indexed tokenId,
        string updateType,
        string newData
    );

    constructor() ERC721("LightDom Metaverse Entity", "LDME") {}

    /**
     * @dev Create a user-generated creature
     */
    function createCreature(
        string memory name,
        CreatureCategory category,
        Attribute primaryAttribute,
        string memory species,
        string memory origin,
        string memory backstory,
        string memory flavorText,
        string memory animationURI,
        string memory imageURI,
        string[] memory connections,
        string metaverseRole
    ) external payable nonReentrant returns (uint256) {
        require(msg.value >= creatureCreationFee, "Insufficient creation fee");
        require(!nameExists[name], "Name already exists");
        require(bytes(name).length > 0 && bytes(name).length <= 50, "Invalid name length");

        _tokenIdCounter.increment();
        uint256 tokenId = _tokenIdCounter.current();

        // Determine rarity based on complexity and payment
        Rarity rarity = _determineRarity(msg.value, creatureCreationFee);

        // Calculate initial attributes
        uint256 baseAttribute = _calculateBaseAttribute(rarity);

        MetaverseEntity storage entity = entities[tokenId];
        entity.tokenId = tokenId;
        entity.name = name;
        entity.isCreature = true;
        entity.categoryId = uint256(category);
        entity.rarity = rarity;
        entity.primaryAttribute = primaryAttribute;
        entity.species = species;
        entity.origin = origin;
        entity.backstory = backstory;
        entity.flavorText = flavorText;
        entity.connections = connections;
        entity.metaverseRole = metaverseRole;
        entity.animationURI = animationURI;
        entity.imageURI = imageURI;
        entity.level = 1;
        entity.creator = msg.sender;
        entity.isUserGenerated = true;
        entity.createdAt = block.timestamp;

        // Set initial attributes based on primary attribute
        _setInitialAttributes(tokenId, primaryAttribute, baseAttribute);

        // Mint NFT
        _safeMint(msg.sender, tokenId);

        // Track creation
        creatorEntities[msg.sender].push(tokenId);
        nameExists[name] = true;

        emit CreatureCreated(tokenId, msg.sender, name, category, rarity, true);

        return tokenId;
    }

    /**
     * @dev Create a user-generated object
     */
    function createObject(
        string memory name,
        ObjectCategory category,
        Attribute primaryPower,
        string memory objectType,
        string memory origin,
        string memory backstory,
        string memory flavorText,
        string memory animationURI,
        string memory imageURI,
        string[] memory connections,
        string memory metaverseRole
    ) external payable nonReentrant returns (uint256) {
        require(msg.value >= objectCreationFee, "Insufficient creation fee");
        require(!nameExists[name], "Name already exists");
        require(bytes(name).length > 0 && bytes(name).length <= 50, "Invalid name length");

        _tokenIdCounter.increment();
        uint256 tokenId = _tokenIdCounter.current();

        Rarity rarity = _determineRarity(msg.value, objectCreationFee);
        uint256 baseAttribute = _calculateBaseAttribute(rarity);

        MetaverseEntity storage entity = entities[tokenId];
        entity.tokenId = tokenId;
        entity.name = name;
        entity.isCreature = false;
        entity.categoryId = uint256(category);
        entity.rarity = rarity;
        entity.primaryAttribute = primaryPower;
        entity.objectType = objectType;
        entity.origin = origin;
        entity.backstory = backstory;
        entity.flavorText = flavorText;
        entity.connections = connections;
        entity.metaverseRole = metaverseRole;
        entity.animationURI = animationURI;
        entity.imageURI = imageURI;
        entity.level = 1;
        entity.creator = msg.sender;
        entity.isUserGenerated = true;
        entity.createdAt = block.timestamp;

        _setInitialAttributes(tokenId, primaryPower, baseAttribute);

        _safeMint(msg.sender, tokenId);

        creatorEntities[msg.sender].push(tokenId);
        nameExists[name] = true;

        emit ObjectCreated(tokenId, msg.sender, name, category, rarity, true);

        return tokenId;
    }

    /**
     * @dev Add experience to entity and handle leveling
     */
    function addExperience(uint256 tokenId, uint256 expAmount) external {
        require(_exists(tokenId), "Entity does not exist");
        require(ownerOf(tokenId) == msg.sender, "Not entity owner");

        MetaverseEntity storage entity = entities[tokenId];
        entity.experience += expAmount;

        // Check for level up
        if (entity.level < 10 && entity.experience >= experienceRequirements[entity.level - 1]) {
            entity.level++;
            entity.lastEvolved = block.timestamp;

            uint256 bonusPoints = _calculateLevelUpBonus(entity.rarity);
            _applyLevelUpBonus(tokenId, bonusPoints);

            emit EntityEvolved(tokenId, entity.level, bonusPoints);
        }
    }

    /**
     * @dev Record benefits earned by entity
     */
    function recordBenefit(
        uint256 tokenId,
        string memory benefitType,
        uint256 amount
    ) external {
        require(_exists(tokenId), "Entity does not exist");

        Benefits storage benefits = entityBenefits[tokenId];

        if (keccak256(bytes(benefitType)) == keccak256(bytes("mining"))) {
            benefits.totalMined += amount;
        } else if (keccak256(bytes(benefitType)) == keccak256(bytes("optimization"))) {
            benefits.totalOptimizations += amount;
        } else if (keccak256(bytes(benefitType)) == keccak256(bytes("auction"))) {
            benefits.totalAuctionSales += amount;
        } else if (keccak256(bytes(benefitType)) == keccak256(bytes("rental"))) {
            benefits.totalRentalIncome += amount;
        } else if (keccak256(bytes(benefitType)) == keccak256(bytes("prestige"))) {
            benefits.prestigePoints += amount;
        }

        entities[tokenId].totalBenefitsEarned += amount;

        emit BenefitsEarned(tokenId, benefitType, amount);
    }

    /**
     * @dev Record entity usage
     */
    function recordUsage(uint256 tokenId, uint256 duration) external {
        require(_exists(tokenId), "Entity does not exist");

        entities[tokenId].totalUsageTime += duration;

        UsageStats storage stats = entityUsage[tokenId];
        stats.lastUsed = block.timestamp;
        stats.totalSessions++;
        stats.averageSessionDuration = (stats.averageSessionDuration * (stats.totalSessions - 1) + duration) / stats.totalSessions;

        emit EntityUsed(tokenId, msg.sender, duration);
    }

    /**
     * @dev Add entity to lore collection (faction/location/event)
     */
    function addToLoreCollection(
        uint256 tokenId,
        string memory collectionType,
        string memory collectionName
    ) external onlyOwner {
        require(_exists(tokenId), "Entity does not exist");

        if (keccak256(bytes(collectionType)) == keccak256(bytes("faction"))) {
            factionEntities[collectionName].push(tokenId);
        } else if (keccak256(bytes(collectionType)) == keccak256(bytes("location"))) {
            locationEntities[collectionName].push(tokenId);
        } else if (keccak256(bytes(collectionType)) == keccak256(bytes("event"))) {
            eventEntities[collectionName].push(tokenId);
        }
    }

    /**
     * @dev Get entity details
     */
    function getEntity(uint256 tokenId) external view returns (MetaverseEntity memory) {
        require(_exists(tokenId), "Entity does not exist");
        return entities[tokenId];
    }

    /**
     * @dev Get entity benefits
     */
    function getBenefits(uint256 tokenId) external view returns (Benefits memory) {
        require(_exists(tokenId), "Entity does not exist");
        return entityBenefits[tokenId];
    }

    /**
     * @dev Get entity usage stats
     */
    function getUsageStats(uint256 tokenId) external view returns (UsageStats memory) {
        require(_exists(tokenId), "Entity does not exist");
        return entityUsage[tokenId];
    }

    /**
     * @dev Get entities by faction
     */
    function getEntitiesByFaction(string memory faction) external view returns (uint256[] memory) {
        return factionEntities[faction];
    }

    /**
     * @dev Get entities by location
     */
    function getEntitiesByLocation(string memory location) external view returns (uint256[] memory) {
        return locationEntities[location];
    }

    /**
     * @dev Get entities by event
     */
    function getEntitiesByEvent(string memory eventName) external view returns (uint256[] memory) {
        return eventEntities[eventName];
    }

    /**
     * @dev Get creator's entities
     */
    function getCreatorEntities(address creator) external view returns (uint256[] memory) {
        return creatorEntities[creator];
    }

    /**
     * @dev Update creation fees
     */
    function updateCreationFees(uint256 newCreatureFee, uint256 newObjectFee) external onlyOwner {
        creatureCreationFee = newCreatureFee;
        objectCreationFee = newObjectFee;
    }

    /**
     * @dev Withdraw contract balance
     */
    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No balance to withdraw");
        payable(owner()).transfer(balance);
    }

    /**
     * @dev Override tokenURI to return metadata
     */
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_exists(tokenId), "Entity does not exist");

        MetaverseEntity memory entity = entities[tokenId];

        if (bytes(entity.metadataURI).length > 0) {
            return entity.metadataURI;
        }

        return string(abi.encodePacked(
            "https://api.lightdom.io/metaverse/entity/",
            tokenId.toString()
        ));
    }

    // Internal helper functions

    function _determineRarity(uint256 paid, uint256 baseFee) private pure returns (Rarity) {
        uint256 multiplier = paid / baseFee;

        if (multiplier >= 10) return Rarity.Mythical;
        if (multiplier >= 5) return Rarity.Legendary;
        if (multiplier >= 3) return Rarity.Epic;
        if (multiplier >= 2) return Rarity.Rare;
        if (multiplier >= 1.5 ether / 1 ether) return Rarity.Uncommon;
        return Rarity.Common;
    }

    function _calculateBaseAttribute(Rarity rarity) private pure returns (uint256) {
        if (rarity == Rarity.Common) return 10;
        if (rarity == Rarity.Uncommon) return 25;
        if (rarity == Rarity.Rare) return 50;
        if (rarity == Rarity.Epic) return 100;
        if (rarity == Rarity.Legendary) return 200;
        return 500; // Mythical
    }

    function _setInitialAttributes(uint256 tokenId, Attribute primaryAttribute, uint256 baseValue) private {
        MetaverseEntity storage entity = entities[tokenId];

        // Set primary attribute to full base value
        if (primaryAttribute == Attribute.Mining) {
            entity.miningPower = baseValue;
        } else if (primaryAttribute == Attribute.Speed) {
            entity.speedBonus = baseValue;
        } else if (primaryAttribute == Attribute.Defense) {
            entity.defenseRating = baseValue;
        } else if (primaryAttribute == Attribute.Magic) {
            entity.magicPower = baseValue;
        } else if (primaryAttribute == Attribute.Intelligence) {
            entity.intelligence = baseValue;
        } else if (primaryAttribute == Attribute.Charm) {
            entity.charisma = baseValue;
        }

        // Set secondary attributes to 20% of base value
        uint256 secondaryValue = baseValue / 5;
        entity.miningPower = entity.miningPower == 0 ? secondaryValue : entity.miningPower;
        entity.speedBonus = entity.speedBonus == 0 ? secondaryValue : entity.speedBonus;
        entity.defenseRating = entity.defenseRating == 0 ? secondaryValue : entity.defenseRating;
        entity.magicPower = entity.magicPower == 0 ? secondaryValue : entity.magicPower;
        entity.intelligence = entity.intelligence == 0 ? secondaryValue : entity.intelligence;
        entity.charisma = entity.charisma == 0 ? secondaryValue : entity.charisma;
    }

    function _calculateLevelUpBonus(Rarity rarity) private pure returns (uint256) {
        if (rarity == Rarity.Common) return 5;
        if (rarity == Rarity.Uncommon) return 10;
        if (rarity == Rarity.Rare) return 20;
        if (rarity == Rarity.Epic) return 40;
        if (rarity == Rarity.Legendary) return 80;
        return 200; // Mythical
    }

    function _applyLevelUpBonus(uint256 tokenId, uint256 bonusPoints) private {
        MetaverseEntity storage entity = entities[tokenId];

        // Apply bonus to primary attribute
        if (entity.primaryAttribute == Attribute.Mining) {
            entity.miningPower += bonusPoints;
        } else if (entity.primaryAttribute == Attribute.Speed) {
            entity.speedBonus += bonusPoints;
        } else if (entity.primaryAttribute == Attribute.Defense) {
            entity.defenseRating += bonusPoints;
        } else if (entity.primaryAttribute == Attribute.Magic) {
            entity.magicPower += bonusPoints;
        } else if (entity.primaryAttribute == Attribute.Intelligence) {
            entity.intelligence += bonusPoints;
        } else if (entity.primaryAttribute == Attribute.Charm) {
            entity.charisma += bonusPoints;
        }
    }

    // Required overrides
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal override(ERC721, ERC721Enumerable) {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
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
