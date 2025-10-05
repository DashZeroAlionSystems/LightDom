// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./StorageToken.sol";

/**
 * @title StorageContract
 * @dev Manages storage agreements between renters and hosts
 * @notice This contract handles the core logic for decentralized storage
 */
contract StorageContract is ReentrancyGuard, Ownable {
    StorageToken public immutable storageToken;
    
    // Storage contract states
    enum ContractState { Pending, Active, Completed, Cancelled, Disputed }
    
    // Storage contract structure
    struct StorageAgreement {
        address renter;
        address host;
        string fileHash;
        uint256 fileSize;
        uint256 storageDuration;
        uint256 pricePerGBPerMonth;
        uint256 totalPrice;
        uint256 startTime;
        uint256 endTime;
        ContractState state;
        bool isActive;
        uint256 collateral;
        string[] shardHashes;
        mapping(string => bool) shardVerification;
    }
    
    // Host information
    struct HostInfo {
        address hostAddress;
        uint256 totalStorage; // in bytes
        uint256 availableStorage; // in bytes
        uint256 pricePerGBPerMonth; // in wei
        bool isActive;
        uint256 reputation;
        uint256 totalContracts;
        uint256 successfulContracts;
    }
    
    // Contract mappings
    mapping(bytes32 => StorageAgreement) public storageAgreements;
    mapping(address => HostInfo) public hosts;
    mapping(address => bytes32[]) public renterContracts;
    mapping(address => bytes32[]) public hostContracts;
    
    // Events
    event HostRegistered(address indexed host, uint256 totalStorage, uint256 pricePerGBPerMonth);
    event HostUpdated(address indexed host, uint256 pricePerGBPerMonth);
    event StorageContractCreated(bytes32 indexed contractId, address indexed renter, address indexed host);
    event StorageContractActivated(bytes32 indexed contractId);
    event StorageContractCompleted(bytes32 indexed contractId);
    event StorageContractCancelled(bytes32 indexed contractId, string reason);
    event PaymentReleased(bytes32 indexed contractId, address indexed host, uint256 amount);
    event CollateralSlashed(bytes32 indexed contractId, address indexed host, uint256 amount);
    event ShardVerified(bytes32 indexed contractId, string shardHash, bool verified);
    
    // Modifiers
    modifier onlyHost() {
        require(hosts[msg.sender].isActive, "Not a registered host");
        _;
    }
    
    modifier onlyRenter(bytes32 contractId) {
        require(storageAgreements[contractId].renter == msg.sender, "Not the renter");
        _;
    }
    
    modifier onlyHostOrRenter(bytes32 contractId) {
        require(
            storageAgreements[contractId].renter == msg.sender || 
            storageAgreements[contractId].host == msg.sender,
            "Not authorized"
        );
        _;
    }
    
    modifier contractExists(bytes32 contractId) {
        require(storageAgreements[contractId].renter != address(0), "Contract does not exist");
        _;
    }
    
    constructor(address _storageToken) {
        storageToken = StorageToken(_storageToken);
    }
    
    /**
     * @dev Register a new host
     * @param totalStorage Total storage capacity in bytes
     * @param pricePerGBPerMonth Price per GB per month in wei
     */
    function registerHost(uint256 totalStorage, uint256 pricePerGBPerMonth) external {
        require(totalStorage > 0, "Storage must be greater than 0");
        require(pricePerGBPerMonth > 0, "Price must be greater than 0");
        require(!hosts[msg.sender].isActive, "Host already registered");
        
        hosts[msg.sender] = HostInfo({
            hostAddress: msg.sender,
            totalStorage: totalStorage,
            availableStorage: totalStorage,
            pricePerGBPerMonth: pricePerGBPerMonth,
            isActive: true,
            reputation: 100, // Start with 100 reputation
            totalContracts: 0,
            successfulContracts: 0
        });
        
        emit HostRegistered(msg.sender, totalStorage, pricePerGBPerMonth);
    }
    
    /**
     * @dev Update host pricing
     * @param pricePerGBPerMonth New price per GB per month
     */
    function updateHostPricing(uint256 pricePerGBPerMonth) external onlyHost {
        require(pricePerGBPerMonth > 0, "Price must be greater than 0");
        
        hosts[msg.sender].pricePerGBPerMonth = pricePerGBPerMonth;
        
        emit HostUpdated(msg.sender, pricePerGBPerMonth);
    }
    
    /**
     * @dev Create a new storage contract
     * @param host Host address
     * @param fileHash Hash of the file to store
     * @param fileSize Size of the file in bytes
     * @param storageDuration Duration in months
     * @param shardHashes Array of shard hashes
     */
    function createStorageContract(
        address host,
        string memory fileHash,
        uint256 fileSize,
        uint256 storageDuration,
        string[] memory shardHashes
    ) external nonReentrant returns (bytes32) {
        require(hosts[host].isActive, "Host not available");
        require(fileSize > 0, "File size must be greater than 0");
        require(storageDuration > 0, "Storage duration must be greater than 0");
        require(shardHashes.length > 0, "Must have at least one shard");
        
        // Calculate pricing
        uint256 pricePerGBPerMonth = hosts[host].pricePerGBPerMonth;
        uint256 fileSizeInGB = (fileSize * 1e18) / (1024 * 1024 * 1024); // Convert to GB with 18 decimals
        uint256 totalPrice = (fileSizeInGB * pricePerGBPerMonth * storageDuration) / 1e18;
        
        // Check if host has enough available storage
        require(hosts[host].availableStorage >= fileSize, "Insufficient host storage");
        
        // Check if renter has enough tokens
        require(storageToken.getAvailableBalance(msg.sender) >= totalPrice, "Insufficient balance");
        
        // Generate contract ID
        bytes32 contractId = keccak256(abi.encodePacked(
            msg.sender,
            host,
            fileHash,
            fileSize,
            block.timestamp
        ));
        
        // Create storage agreement
        StorageAgreement storage agreement = storageAgreements[contractId];
        agreement.renter = msg.sender;
        agreement.host = host;
        agreement.fileHash = fileHash;
        agreement.fileSize = fileSize;
        agreement.storageDuration = storageDuration;
        agreement.pricePerGBPerMonth = pricePerGBPerMonth;
        agreement.totalPrice = totalPrice;
        agreement.startTime = block.timestamp;
        agreement.endTime = block.timestamp + (storageDuration * 30 days);
        agreement.state = ContractState.Pending;
        agreement.isActive = false;
        agreement.collateral = totalPrice / 10; // 10% collateral
        agreement.shardHashes = shardHashes;
        
        // Update host available storage
        hosts[host].availableStorage -= fileSize;
        hosts[host].totalContracts++;
        
        // Add to user contract lists
        renterContracts[msg.sender].push(contractId);
        hostContracts[host].push(contractId);
        
        // Lock tokens
        storageToken.lockTokens(totalPrice);
        
        emit StorageContractCreated(contractId, msg.sender, host);
        
        return contractId;
    }
    
    /**
     * @dev Activate a storage contract (host confirms storage)
     * @param contractId Contract ID to activate
     */
    function activateStorageContract(bytes32 contractId) external onlyHost contractExists(contractId) {
        StorageAgreement storage agreement = storageAgreements[contractId];
        require(agreement.host == msg.sender, "Not the host for this contract");
        require(agreement.state == ContractState.Pending, "Contract not in pending state");
        
        agreement.state = ContractState.Active;
        agreement.isActive = true;
        
        emit StorageContractActivated(contractId);
    }
    
    /**
     * @dev Verify a shard is stored correctly
     * @param contractId Contract ID
     * @param shardHash Hash of the shard to verify
     * @param isVerified Whether the shard is verified
     */
    function verifyShard(bytes32 contractId, string memory shardHash, bool isVerified) 
        external 
        onlyHostOrRenter(contractId) 
        contractExists(contractId) 
    {
        StorageAgreement storage agreement = storageAgreements[contractId];
        require(agreement.state == ContractState.Active, "Contract not active");
        
        agreement.shardVerification[shardHash] = isVerified;
        
        emit ShardVerified(contractId, shardHash, isVerified);
    }
    
    /**
     * @dev Complete a storage contract
     * @param contractId Contract ID to complete
     */
    function completeStorageContract(bytes32 contractId) 
        external 
        onlyRenter(contractId) 
        contractExists(contractId) 
        nonReentrant 
    {
        StorageAgreement storage agreement = storageAgreements[contractId];
        require(agreement.state == ContractState.Active, "Contract not active");
        require(block.timestamp >= agreement.endTime, "Contract not expired yet");
        
        agreement.state = ContractState.Completed;
        agreement.isActive = false;
        
        // Release payment to host
        storageToken.unlockTokens(agreement.totalPrice);
        storageToken.transfer(agreement.host, agreement.totalPrice);
        
        // Update host reputation and stats
        hosts[agreement.host].successfulContracts++;
        hosts[agreement.host].reputation += 10; // Increase reputation
        hosts[agreement.host].availableStorage += agreement.fileSize;
        
        emit StorageContractCompleted(contractId);
        emit PaymentReleased(contractId, agreement.host, agreement.totalPrice);
    }
    
    /**
     * @dev Cancel a storage contract
     * @param contractId Contract ID to cancel
     * @param reason Reason for cancellation
     */
    function cancelStorageContract(bytes32 contractId, string memory reason) 
        external 
        onlyRenter(contractId) 
        contractExists(contractId) 
        nonReentrant 
    {
        StorageAgreement storage agreement = storageAgreements[contractId];
        require(agreement.state == ContractState.Pending || agreement.state == ContractState.Active, 
                "Contract cannot be cancelled");
        
        agreement.state = ContractState.Cancelled;
        agreement.isActive = false;
        
        // Return tokens to renter
        storageToken.unlockTokens(agreement.totalPrice);
        
        // Return storage to host
        hosts[agreement.host].availableStorage += agreement.fileSize;
        
        emit StorageContractCancelled(contractId, reason);
    }
    
    /**
     * @dev Slash host collateral for non-compliance
     * @param contractId Contract ID
     * @param slashedAmount Amount to slash
     */
    function slashHostCollateral(bytes32 contractId, uint256 slashedAmount) 
        external 
        onlyOwner 
        contractExists(contractId) 
    {
        StorageAgreement storage agreement = storageAgreements[contractId];
        require(agreement.state == ContractState.Active, "Contract not active");
        require(slashedAmount <= agreement.collateral, "Amount exceeds collateral");
        
        // Reduce host reputation
        hosts[agreement.host].reputation = hosts[agreement.host].reputation > slashedAmount 
            ? hosts[agreement.host].reputation - slashedAmount 
            : 0;
        
        emit CollateralSlashed(contractId, agreement.host, slashedAmount);
    }
    
    /**
     * @dev Get contract details
     * @param contractId Contract ID
     * @return renter, host, fileHash, fileSize, storageDuration, pricePerGBPerMonth, totalPrice, startTime, endTime, state, isActive, collateral
     */
    function getContractDetails(bytes32 contractId) 
        external 
        view 
        contractExists(contractId) 
        returns (
            address renter,
            address host,
            string memory fileHash,
            uint256 fileSize,
            uint256 storageDuration,
            uint256 pricePerGBPerMonth,
            uint256 totalPrice,
            uint256 startTime,
            uint256 endTime,
            ContractState state,
            bool isActive,
            uint256 collateral
        ) 
    {
        StorageAgreement storage agreement = storageAgreements[contractId];
        return (
            agreement.renter,
            agreement.host,
            agreement.fileHash,
            agreement.fileSize,
            agreement.storageDuration,
            agreement.pricePerGBPerMonth,
            agreement.totalPrice,
            agreement.startTime,
            agreement.endTime,
            agreement.state,
            agreement.isActive,
            agreement.collateral
        );
    }
    
    /**
     * @dev Get shard hashes for a contract
     * @param contractId Contract ID
     * @return Array of shard hashes
     */
    function getShardHashes(bytes32 contractId) 
        external 
        view 
        contractExists(contractId) 
        returns (string[] memory) 
    {
        return storageAgreements[contractId].shardHashes;
    }
    
    /**
     * @dev Check if a shard is verified
     * @param contractId Contract ID
     * @param shardHash Shard hash to check
     * @return Whether the shard is verified
     */
    function isShardVerified(bytes32 contractId, string memory shardHash) 
        external 
        view 
        contractExists(contractId) 
        returns (bool) 
    {
        return storageAgreements[contractId].shardVerification[shardHash];
    }
}
