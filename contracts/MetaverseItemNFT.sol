// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title Metaverse Item NFT
 * @dev ERC1155 NFT for tradeable metaverse items with animation art
 * Supports user-generated items and procedural generation
 */
contract MetaverseItemNFT is ERC1155, Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;
    using Strings for uint256;
    
    Counters.Counter private _itemIdCounter;
    
    // Item categories
    enum ItemCategory {
        Avatar,         // 0 - Avatar items (clothing, accessories)
        Environment,    // 1 - Environmental decorations
        Tool,          // 2 - Mining/optimization tools
        Pet,           // 3 - Companion pets
        Building,      // 4 - Structures and buildings
        Vehicle,       // 5 - Transportation
        Art,           // 6 - Decorative art pieces
        Special        // 7 - Special/limited items
    }
    
    // Item rarity levels
    enum Rarity {
        Common,        // 0
        Uncommon,      // 1
        Rare,          // 2
        Epic,          // 3
        Legendary,     // 4
        Mythical       // 5
    }
    
    // Item data structure
    struct MetaverseItem {
        uint256 itemId;
        string name;
        string description;
        ItemCategory category;
        Rarity rarity;
        uint256 miningPowerBonus;
        uint256 maxSupply;
        uint256 currentSupply;
        bool isUserGenerated;
        address creator;
        string animationURI;
        string metadataURI;
        uint256 createdAt;
    }
    
    // Mapping from item ID to item data
    mapping(uint256 => MetaverseItem) public items;
    
    // Mapping from creator to their items
    mapping(address => uint256[]) public creatorItems;
    
    // Item prices for minting (in wei)
    mapping(Rarity => uint256) public mintPrices;
    
    // User-generated item creation fee
    uint256 public userItemCreationFee = 0.01 ether;
    
    // Events
    event ItemCreated(
        uint256 indexed itemId,
        string name,
        ItemCategory category,
        Rarity rarity,
        address creator,
        bool isUserGenerated
    );
    
    event ItemMinted(
        address indexed to,
        uint256 indexed itemId,
        uint256 amount,
        uint256 price
    );
    
    event ItemBurned(
        address indexed from,
        uint256 indexed itemId,
        uint256 amount
    );
    
    event UserItemCreated(
        address indexed creator,
        uint256 indexed itemId,
        string name,
        string animationURI
    );
    
    constructor() ERC1155("https://api.lightdom.io/metaverse/item/{id}") {
        // Set initial mint prices by rarity
        mintPrices[Rarity.Common] = 0.001 ether;
        mintPrices[Rarity.Uncommon] = 0.005 ether;
        mintPrices[Rarity.Rare] = 0.01 ether;
        mintPrices[Rarity.Epic] = 0.05 ether;
        mintPrices[Rarity.Legendary] = 0.1 ether;
        mintPrices[Rarity.Mythical] = 0.5 ether;
        
        // Create some initial items
        _createInitialItems();
    }
    
    /**
     * @dev Create a new metaverse item (admin only)
     */
    function createItem(
        string memory name,
        string memory description,
        ItemCategory category,
        Rarity rarity,
        uint256 miningPowerBonus,
        uint256 maxSupply,
        string memory animationURI,
        string memory metadataURI
    ) external onlyOwner returns (uint256) {
        _itemIdCounter.increment();
        uint256 itemId = _itemIdCounter.current();
        
        items[itemId] = MetaverseItem({
            itemId: itemId,
            name: name,
            description: description,
            category: category,
            rarity: rarity,
            miningPowerBonus: miningPowerBonus,
            maxSupply: maxSupply,
            currentSupply: 0,
            isUserGenerated: false,
            creator: msg.sender,
            animationURI: animationURI,
            metadataURI: metadataURI,
            createdAt: block.timestamp
        });
        
        emit ItemCreated(itemId, name, category, rarity, msg.sender, false);
        
        return itemId;
    }
    
    /**
     * @dev Create a user-generated metaverse item
     */
    function createUserItem(
        string memory name,
        string memory description,
        ItemCategory category,
        string memory animationURI,
        string memory metadataURI
    ) external payable returns (uint256) {
        require(msg.value >= userItemCreationFee, "Insufficient creation fee");
        
        _itemIdCounter.increment();
        uint256 itemId = _itemIdCounter.current();
        
        // User-generated items are always Uncommon rarity with limited supply
        items[itemId] = MetaverseItem({
            itemId: itemId,
            name: name,
            description: description,
            category: category,
            rarity: Rarity.Uncommon,
            miningPowerBonus: 10, // Base 10 mining power for user items
            maxSupply: 100, // Limited to 100 copies
            currentSupply: 0,
            isUserGenerated: true,
            creator: msg.sender,
            animationURI: animationURI,
            metadataURI: metadataURI,
            createdAt: block.timestamp
        });
        
        creatorItems[msg.sender].push(itemId);
        
        emit ItemCreated(itemId, name, category, Rarity.Uncommon, msg.sender, true);
        emit UserItemCreated(msg.sender, itemId, name, animationURI);
        
        return itemId;
    }
    
    /**
     * @dev Mint an item to an address
     */
    function mintItem(
        address to,
        uint256 itemId,
        uint256 amount
    ) external payable nonReentrant {
        require(items[itemId].itemId != 0, "Item does not exist");
        require(
            items[itemId].currentSupply + amount <= items[itemId].maxSupply,
            "Exceeds max supply"
        );
        
        uint256 totalPrice = mintPrices[items[itemId].rarity] * amount;
        require(msg.value >= totalPrice, "Insufficient payment");
        
        items[itemId].currentSupply += amount;
        
        _mint(to, itemId, amount, "");
        
        emit ItemMinted(to, itemId, amount, totalPrice);
        
        // Refund excess payment
        if (msg.value > totalPrice) {
            payable(msg.sender).transfer(msg.value - totalPrice);
        }
    }
    
    /**
     * @dev Batch mint multiple items
     */
    function mintBatch(
        address to,
        uint256[] memory itemIds,
        uint256[] memory amounts
    ) external payable nonReentrant {
        require(itemIds.length == amounts.length, "Length mismatch");
        
        uint256 totalPrice = 0;
        
        for (uint256 i = 0; i < itemIds.length; i++) {
            require(items[itemIds[i]].itemId != 0, "Item does not exist");
            require(
                items[itemIds[i]].currentSupply + amounts[i] <= items[itemIds[i]].maxSupply,
                "Exceeds max supply"
            );
            
            totalPrice += mintPrices[items[itemIds[i]].rarity] * amounts[i];
            items[itemIds[i]].currentSupply += amounts[i];
        }
        
        require(msg.value >= totalPrice, "Insufficient payment");
        
        _mintBatch(to, itemIds, amounts, "");
        
        // Refund excess payment
        if (msg.value > totalPrice) {
            payable(msg.sender).transfer(msg.value - totalPrice);
        }
    }
    
    /**
     * @dev Burn items
     */
    function burn(
        address from,
        uint256 itemId,
        uint256 amount
    ) external {
        require(
            from == msg.sender || isApprovedForAll(from, msg.sender),
            "Not authorized"
        );
        
        _burn(from, itemId, amount);
        items[itemId].currentSupply -= amount;
        
        emit ItemBurned(from, itemId, amount);
    }
    
    /**
     * @dev Get item details
     */
    function getItem(uint256 itemId) external view returns (MetaverseItem memory) {
        require(items[itemId].itemId != 0, "Item does not exist");
        return items[itemId];
    }
    
    /**
     * @dev Get items created by a user
     */
    function getCreatorItems(address creator) external view returns (uint256[] memory) {
        return creatorItems[creator];
    }
    
    /**
     * @dev Update mint price for a rarity level
     */
    function updateMintPrice(Rarity rarity, uint256 newPrice) external onlyOwner {
        mintPrices[rarity] = newPrice;
    }
    
    /**
     * @dev Update user item creation fee
     */
    function updateUserItemCreationFee(uint256 newFee) external onlyOwner {
        userItemCreationFee = newFee;
    }
    
    /**
     * @dev Get URI for a token
     */
    function uri(uint256 itemId) public view override returns (string memory) {
        require(items[itemId].itemId != 0, "Item does not exist");
        
        if (bytes(items[itemId].metadataURI).length > 0) {
            return items[itemId].metadataURI;
        }
        
        return string(abi.encodePacked(
            "https://api.lightdom.io/metaverse/item/",
            itemId.toString()
        ));
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
     * @dev Create initial items for the metaverse
     */
    function _createInitialItems() private {
        // Avatar items
        _createItemInternal(
            "Cyber Visor",
            "Advanced heads-up display for metaverse navigation",
            ItemCategory.Avatar,
            Rarity.Rare,
            25,
            1000,
            "ipfs://QmCyberVisor",
            "ipfs://QmCyberVisorMeta"
        );
        
        // Mining tools
        _createItemInternal(
            "Quantum Miner",
            "Increases mining efficiency by 50%",
            ItemCategory.Tool,
            Rarity.Epic,
            50,
            500,
            "ipfs://QmQuantumMiner",
            "ipfs://QmQuantumMinerMeta"
        );
        
        // Pets
        _createItemInternal(
            "Data Dragon",
            "A loyal companion that helps optimize code",
            ItemCategory.Pet,
            Rarity.Legendary,
            100,
            100,
            "ipfs://QmDataDragon",
            "ipfs://QmDataDragonMeta"
        );
    }
    
    /**
     * @dev Internal function to create items
     */
    function _createItemInternal(
        string memory name,
        string memory description,
        ItemCategory category,
        Rarity rarity,
        uint256 miningPowerBonus,
        uint256 maxSupply,
        string memory animationURI,
        string memory metadataURI
    ) private {
        _itemIdCounter.increment();
        uint256 itemId = _itemIdCounter.current();
        
        items[itemId] = MetaverseItem({
            itemId: itemId,
            name: name,
            description: description,
            category: category,
            rarity: rarity,
            miningPowerBonus: miningPowerBonus,
            maxSupply: maxSupply,
            currentSupply: 0,
            isUserGenerated: false,
            creator: owner(),
            animationURI: animationURI,
            metadataURI: metadataURI,
            createdAt: block.timestamp
        });
        
        emit ItemCreated(itemId, name, category, rarity, owner(), false);
    }
}
