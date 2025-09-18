// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title DataEncryption
 * @dev Handles data encryption, sharding, and verification for the storage platform
 * @notice This contract manages the cryptographic operations for file storage
 */
contract DataEncryption is Ownable, ReentrancyGuard {
    // Shard information
    struct ShardInfo {
        bytes32 shardHash;
        uint256 shardIndex;
        uint256 totalShards;
        bytes32 fileHash;
        address owner;
        bool isVerified;
        uint256 createdAt;
    }
    
    // File information
    struct FileInfo {
        bytes32 fileHash;
        address owner;
        uint256 fileSize;
        uint256 totalShards;
        uint256 redundancyFactor;
        bool isEncrypted;
        uint256 createdAt;
        mapping(uint256 => ShardInfo) shards;
    }
    
    // Encryption parameters
    struct EncryptionParams {
        uint256 shardSize; // Size of each shard in bytes
        uint256 redundancyFactor; // Number of redundant shards
        uint256 erasureCodeThreshold; // Minimum shards needed for recovery
    }
    
    // State variables
    mapping(bytes32 => FileInfo) public files;
    mapping(bytes32 => ShardInfo) public shards;
    mapping(address => bytes32[]) public userFiles;
    mapping(address => bytes32[]) public userShards;
    
    EncryptionParams public defaultEncryptionParams;
    uint256 public totalFiles;
    uint256 public totalShards;
    
    // Events
    event FileEncrypted(bytes32 indexed fileHash, address indexed owner, uint256 totalShards);
    event ShardCreated(bytes32 indexed shardHash, bytes32 indexed fileHash, uint256 shardIndex);
    event ShardVerified(bytes32 indexed shardHash, bool verified);
    event FileDecrypted(bytes32 indexed fileHash, address indexed owner);
    event EncryptionParamsUpdated(EncryptionParams newParams);
    
    // Modifiers
    modifier onlyFileOwner(bytes32 fileHash) {
        require(files[fileHash].owner == msg.sender, "Not the file owner");
        _;
    }
    
    modifier fileExists(bytes32 fileHash) {
        require(files[fileHash].owner != address(0), "File does not exist");
        _;
    }
    
    modifier shardExists(bytes32 shardHash) {
        require(shards[shardHash].owner != address(0), "Shard does not exist");
        _;
    }
    
    constructor() {
        // Set default encryption parameters
        defaultEncryptionParams = EncryptionParams({
            shardSize: 1024 * 1024, // 1MB per shard
            redundancyFactor: 3, // 3x redundancy
            erasureCodeThreshold: 2 // Need 2 shards for recovery
        });
    }
    
    /**
     * @dev Encrypt and shard a file
     * @param fileHash Hash of the original file
     * @param fileSize Size of the file in bytes
     * @param shardHashes Array of shard hashes
     * @param redundancyFactor Redundancy factor for the file
     */
    function encryptAndShardFile(
        bytes32 fileHash,
        uint256 fileSize,
        bytes32[] memory shardHashes,
        uint256 redundancyFactor
    ) external nonReentrant {
        require(files[fileHash].owner == address(0), "File already exists");
        require(fileSize > 0, "File size must be greater than 0");
        require(shardHashes.length > 0, "Must have at least one shard");
        require(redundancyFactor > 0, "Redundancy factor must be greater than 0");
        
        // Calculate total shards needed
        uint256 shardsNeeded = (fileSize + defaultEncryptionParams.shardSize - 1) / defaultEncryptionParams.shardSize;
        uint256 totalShards = shardsNeeded * redundancyFactor;
        
        require(shardHashes.length == totalShards, "Incorrect number of shards");
        
        // Create file info
        FileInfo storage file = files[fileHash];
        file.fileHash = fileHash;
        file.owner = msg.sender;
        file.fileSize = fileSize;
        file.totalShards = totalShards;
        file.redundancyFactor = redundancyFactor;
        file.isEncrypted = true;
        file.createdAt = block.timestamp;
        
        // Create shard info
        for (uint256 i = 0; i < shardHashes.length; i++) {
            bytes32 shardHash = shardHashes[i];
            require(shards[shardHash].owner == address(0), "Shard already exists");
            
            ShardInfo storage shard = shards[shardHash];
            shard.shardHash = shardHash;
            shard.shardIndex = i;
            shard.totalShards = totalShards;
            shard.fileHash = fileHash;
            shard.owner = msg.sender;
            shard.isVerified = false;
            shard.createdAt = block.timestamp;
            
            // Add to file's shards mapping
            file.shards[i] = shard;
            
            // Add to user's shards
            userShards[msg.sender].push(shardHash);
            
            emit ShardCreated(shardHash, fileHash, i);
        }
        
        // Add to user's files
        userFiles[msg.sender].push(fileHash);
        
        totalFiles++;
        totalShards += totalShards;
        
        emit FileEncrypted(fileHash, msg.sender, totalShards);
    }
    
    /**
     * @dev Verify a shard is stored correctly
     * @param shardHash Hash of the shard to verify
     * @param isVerified Whether the shard is verified
     */
    function verifyShard(bytes32 shardHash, bool isVerified) 
        external 
        shardExists(shardHash) 
    {
        ShardInfo storage shard = shards[shardHash];
        require(
            shard.owner == msg.sender || 
            files[shard.fileHash].owner == msg.sender,
            "Not authorized to verify shard"
        );
        
        shard.isVerified = isVerified;
        
        emit ShardVerified(shardHash, isVerified);
    }
    
    /**
     * @dev Check if a file can be decrypted (has enough verified shards)
     * @param fileHash Hash of the file to check
     * @return Whether the file can be decrypted
     */
    function canDecryptFile(bytes32 fileHash) 
        external 
        view 
        fileExists(fileHash) 
        returns (bool) 
    {
        FileInfo storage file = files[fileHash];
        uint256 verifiedShards = 0;
        
        for (uint256 i = 0; i < file.totalShards; i++) {
            if (file.shards[i].isVerified) {
                verifiedShards++;
            }
        }
        
        return verifiedShards >= defaultEncryptionParams.erasureCodeThreshold;
    }
    
    /**
     * @dev Get file information
     * @param fileHash Hash of the file
     * @return fileHash, owner, fileSize, totalShards, redundancyFactor, isEncrypted, createdAt
     */
    function getFileInfo(bytes32 fileHash) 
        external 
        view 
        fileExists(fileHash) 
        returns (
            bytes32,
            address,
            uint256,
            uint256,
            uint256,
            bool,
            uint256
        ) 
    {
        FileInfo storage file = files[fileHash];
        return (
            file.fileHash,
            file.owner,
            file.fileSize,
            file.totalShards,
            file.redundancyFactor,
            file.isEncrypted,
            file.createdAt
        );
    }
    
    /**
     * @dev Get shard information
     * @param shardHash Hash of the shard
     * @return shardHash, shardIndex, totalShards, fileHash, owner, isVerified, createdAt
     */
    function getShardInfo(bytes32 shardHash) 
        external 
        view 
        shardExists(shardHash) 
        returns (
            bytes32,
            uint256,
            uint256,
            bytes32,
            address,
            bool,
            uint256
        ) 
    {
        ShardInfo storage shard = shards[shardHash];
        return (
            shard.shardHash,
            shard.shardIndex,
            shard.totalShards,
            shard.fileHash,
            shard.owner,
            shard.isVerified,
            shard.createdAt
        );
    }
    
    /**
     * @dev Get all shards for a file
     * @param fileHash Hash of the file
     * @return Array of shard hashes
     */
    function getFileShards(bytes32 fileHash) 
        external 
        view 
        fileExists(fileHash) 
        returns (bytes32[] memory) 
    {
        FileInfo storage file = files[fileHash];
        bytes32[] memory shardHashes = new bytes32[](file.totalShards);
        
        for (uint256 i = 0; i < file.totalShards; i++) {
            shardHashes[i] = file.shards[i].shardHash;
        }
        
        return shardHashes;
    }
    
    /**
     * @dev Get user's files
     * @param user User address
     * @return Array of file hashes
     */
    function getUserFiles(address user) external view returns (bytes32[] memory) {
        return userFiles[user];
    }
    
    /**
     * @dev Get user's shards
     * @param user User address
     * @return Array of shard hashes
     */
    function getUserShards(address user) external view returns (bytes32[] memory) {
        return userShards[user];
    }
    
    /**
     * @dev Update encryption parameters (only owner)
     * @param newParams New encryption parameters
     */
    function updateEncryptionParams(EncryptionParams memory newParams) external onlyOwner {
        require(newParams.shardSize > 0, "Shard size must be greater than 0");
        require(newParams.redundancyFactor > 0, "Redundancy factor must be greater than 0");
        require(newParams.erasureCodeThreshold > 0, "Erasure code threshold must be greater than 0");
        require(newParams.erasureCodeThreshold <= newParams.redundancyFactor, 
                "Erasure code threshold cannot exceed redundancy factor");
        
        defaultEncryptionParams = newParams;
        
        emit EncryptionParamsUpdated(newParams);
    }
    
    /**
     * @dev Calculate shards needed for a file
     * @param fileSize Size of the file in bytes
     * @param redundancyFactor Redundancy factor
     * @return Number of shards needed
     */
    function calculateShardsNeeded(uint256 fileSize, uint256 redundancyFactor) 
        external 
        view 
        returns (uint256) 
    {
        uint256 shardsNeeded = (fileSize + defaultEncryptionParams.shardSize - 1) / defaultEncryptionParams.shardSize;
        return shardsNeeded * redundancyFactor;
    }
    
    /**
     * @dev Get current encryption parameters
     * @return Current encryption parameters
     */
    function getEncryptionParams() external view returns (EncryptionParams memory) {
        return defaultEncryptionParams;
    }
}