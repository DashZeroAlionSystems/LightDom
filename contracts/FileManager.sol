// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./StorageContract.sol";
import "./DataEncryption.sol";

/**
 * @title FileManager
 * @dev Manages file operations, metadata, and access control
 * @notice This contract handles file lifecycle and user interactions
 */
contract FileManager is Ownable, ReentrancyGuard {
    StorageContract public immutable storageContract;
    DataEncryption public immutable dataEncryption;
    
    // File status
    enum FileStatus { Uploading, Active, Archived, Deleted, Corrupted }
    
    // File metadata
    struct FileMetadata {
        bytes32 fileHash;
        address owner;
        string fileName;
        string fileType;
        uint256 fileSize;
        uint256 uploadTime;
        uint256 lastModified;
        FileStatus status;
        bool isPublic;
        string description;
        string[] tags;
        mapping(address => bool) sharedWith;
        mapping(address => uint256) accessPermissions; // 0 = no access, 1 = read, 2 = write, 3 = admin
    }
    
    // File access permissions
    enum AccessPermission { None, Read, Write, Admin }
    
    // File sharing
    struct FileShare {
        address fileOwner;
        address sharedWith;
        bytes32 fileHash;
        AccessPermission permission;
        uint256 sharedAt;
        uint256 expiresAt;
        bool isActive;
    }
    
    // State variables
    mapping(bytes32 => FileMetadata) public files;
    mapping(address => bytes32[]) public userFiles;
    mapping(address => bytes32[]) public sharedFiles;
    mapping(bytes32 => FileShare[]) public fileShares;
    mapping(bytes32 => bool) public fileExists;
    
    uint256 public totalFiles;
    uint256 public totalStorageUsed;
    
    // Events
    event FileUploaded(bytes32 indexed fileHash, address indexed owner, string fileName, uint256 fileSize);
    event FileUpdated(bytes32 indexed fileHash, address indexed owner, string fileName);
    event FileShared(bytes32 indexed fileHash, address indexed owner, address indexed sharedWith, AccessPermission permission);
    event FileUnshared(bytes32 indexed fileHash, address indexed owner, address indexed sharedWith);
    event FileDeleted(bytes32 indexed fileHash, address indexed owner);
    event FileStatusChanged(bytes32 indexed fileHash, FileStatus oldStatus, FileStatus newStatus);
    event FileAccessChanged(bytes32 indexed fileHash, address indexed user, AccessPermission oldPermission, AccessPermission newPermission);
    
    // Modifiers
    modifier onlyFileOwner(bytes32 fileHash) {
        require(files[fileHash].owner == msg.sender, "Not the file owner");
        _;
    }
    
    modifier fileExists(bytes32 fileHash) {
        require(fileExists[fileHash], "File does not exist");
        _;
    }
    
    modifier hasAccess(bytes32 fileHash, AccessPermission requiredPermission) {
        require(
            files[fileHash].owner == msg.sender || 
            files[fileHash].sharedWith[msg.sender] ||
            files[fileHash].isPublic,
            "No access to file"
        );
        require(
            files[fileHash].accessPermissions[msg.sender] >= uint256(requiredPermission) ||
            files[fileHash].owner == msg.sender,
            "Insufficient permissions"
        );
        _;
    }
    
    constructor(address _storageContract, address _dataEncryption) {
        storageContract = StorageContract(_storageContract);
        dataEncryption = DataEncryption(_dataEncryption);
    }
    
    /**
     * @dev Upload a new file
     * @param fileHash Hash of the file
     * @param fileName Name of the file
     * @param fileType Type of the file
     * @param fileSize Size of the file in bytes
     * @param description File description
     * @param tags File tags
     * @param isPublic Whether the file is public
     * @param shardHashes Array of shard hashes
     * @param redundancyFactor Redundancy factor for the file
     */
    function uploadFile(
        bytes32 fileHash,
        string memory fileName,
        string memory fileType,
        uint256 fileSize,
        string memory description,
        string[] memory tags,
        bool isPublic,
        bytes32[] memory shardHashes,
        uint256 redundancyFactor
    ) external nonReentrant {
        require(!fileExists[fileHash], "File already exists");
        require(bytes(fileName).length > 0, "File name cannot be empty");
        require(fileSize > 0, "File size must be greater than 0");
        require(shardHashes.length > 0, "Must have at least one shard");
        
        // Create file metadata
        FileMetadata storage file = files[fileHash];
        file.fileHash = fileHash;
        file.owner = msg.sender;
        file.fileName = fileName;
        file.fileType = fileType;
        file.fileSize = fileSize;
        file.uploadTime = block.timestamp;
        file.lastModified = block.timestamp;
        file.status = FileStatus.Uploading;
        file.isPublic = isPublic;
        file.description = description;
        file.tags = tags;
        file.accessPermissions[msg.sender] = uint256(AccessPermission.Admin);
        
        // Add to user's files
        userFiles[msg.sender].push(fileHash);
        
        fileExists[fileHash] = true;
        totalFiles++;
        totalStorageUsed += fileSize;
        
        // Encrypt and shard the file
        dataEncryption.encryptAndShardFile(
            fileHash,
            fileSize,
            shardHashes,
            redundancyFactor
        );
        
        emit FileUploaded(fileHash, msg.sender, fileName, fileSize);
    }
    
    /**
     * @dev Update file metadata
     * @param fileHash Hash of the file
     * @param fileName New file name
     * @param description New file description
     * @param tags New file tags
     * @param isPublic Whether the file is public
     */
    function updateFileMetadata(
        bytes32 fileHash,
        string memory fileName,
        string memory description,
        string[] memory tags,
        bool isPublic
    ) external fileExists(fileHash) hasAccess(fileHash, AccessPermission.Write) {
        require(bytes(fileName).length > 0, "File name cannot be empty");
        
        FileMetadata storage file = files[fileHash];
        file.fileName = fileName;
        file.description = description;
        file.tags = tags;
        file.isPublic = isPublic;
        file.lastModified = block.timestamp;
        
        emit FileUpdated(fileHash, file.owner, fileName);
    }
    
    /**
     * @dev Share a file with another user
     * @param fileHash Hash of the file
     * @param sharedWith Address to share with
     * @param permission Access permission level
     * @param expiresAt Expiration timestamp (0 for no expiration)
     */
    function shareFile(
        bytes32 fileHash,
        address sharedWith,
        AccessPermission permission,
        uint256 expiresAt
    ) external fileExists(fileHash) onlyFileOwner(fileHash) {
        require(sharedWith != address(0), "Invalid address");
        require(sharedWith != msg.sender, "Cannot share with yourself");
        require(permission != AccessPermission.None, "Invalid permission");
        
        FileMetadata storage file = files[fileHash];
        file.sharedWith[sharedWith] = true;
        file.accessPermissions[sharedWith] = uint256(permission);
        
        // Add to shared files
        sharedFiles[sharedWith].push(fileHash);
        
        // Create file share record
        fileShares[fileHash].push(FileShare({
            fileOwner: msg.sender,
            sharedWith: sharedWith,
            fileHash: fileHash,
            permission: permission,
            sharedAt: block.timestamp,
            expiresAt: expiresAt,
            isActive: true
        }));
        
        emit FileShared(fileHash, msg.sender, sharedWith, permission);
    }
    
    /**
     * @dev Unshare a file with a user
     * @param fileHash Hash of the file
     * @param sharedWith Address to unshare with
     */
    function unshareFile(bytes32 fileHash, address sharedWith) 
        external 
        fileExists(fileHash) 
        onlyFileOwner(fileHash) 
    {
        require(sharedWith != address(0), "Invalid address");
        
        FileMetadata storage file = files[fileHash];
        file.sharedWith[sharedWith] = false;
        file.accessPermissions[sharedWith] = 0;
        
        // Remove from shared files
        for (uint256 i = 0; i < sharedFiles[sharedWith].length; i++) {
            if (sharedFiles[sharedWith][i] == fileHash) {
                sharedFiles[sharedWith][i] = sharedFiles[sharedWith][sharedFiles[sharedWith].length - 1];
                sharedFiles[sharedWith].pop();
                break;
            }
        }
        
        // Deactivate file share
        for (uint256 i = 0; i < fileShares[fileHash].length; i++) {
            if (fileShares[fileHash][i].sharedWith == sharedWith) {
                fileShares[fileHash][i].isActive = false;
                break;
            }
        }
        
        emit FileUnshared(fileHash, msg.sender, sharedWith);
    }
    
    /**
     * @dev Delete a file
     * @param fileHash Hash of the file
     */
    function deleteFile(bytes32 fileHash) 
        external 
        fileExists(fileHash) 
        onlyFileOwner(fileHash) 
        nonReentrant 
    {
        FileMetadata storage file = files[fileHash];
        file.status = FileStatus.Deleted;
        
        // Update storage usage
        totalStorageUsed -= file.fileSize;
        
        // Remove from user's files
        for (uint256 i = 0; i < userFiles[msg.sender].length; i++) {
            if (userFiles[msg.sender][i] == fileHash) {
                userFiles[msg.sender][i] = userFiles[msg.sender][userFiles[msg.sender].length - 1];
                userFiles[msg.sender].pop();
                break;
            }
        }
        
        // Deactivate all shares
        for (uint256 i = 0; i < fileShares[fileHash].length; i++) {
            fileShares[fileHash][i].isActive = false;
        }
        
        emit FileDeleted(fileHash, msg.sender);
    }
    
    /**
     * @dev Change file status
     * @param fileHash Hash of the file
     * @param newStatus New file status
     */
    function changeFileStatus(bytes32 fileHash, FileStatus newStatus) 
        external 
        fileExists(fileHash) 
        hasAccess(fileHash, AccessPermission.Write) 
    {
        FileMetadata storage file = files[fileHash];
        FileStatus oldStatus = file.status;
        file.status = newStatus;
        
        emit FileStatusChanged(fileHash, oldStatus, newStatus);
    }
    
    /**
     * @dev Get file metadata
     * @param fileHash Hash of the file
     * @return fileHash, owner, fileName, fileType, fileSize, uploadTime, lastModified, status, isPublic, description, tags
     */
    function getFileMetadata(bytes32 fileHash) 
        external 
        view 
        fileExists(fileHash) 
        returns (
            bytes32,
            address,
            string memory,
            string memory,
            uint256,
            uint256,
            uint256,
            FileStatus,
            bool,
            string memory,
            string[] memory
        ) 
    {
        FileMetadata storage file = files[fileHash];
        return (
            file.fileHash,
            file.owner,
            file.fileName,
            file.fileType,
            file.fileSize,
            file.uploadTime,
            file.lastModified,
            file.status,
            file.isPublic,
            file.description,
            file.tags
        );
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
     * @dev Get files shared with user
     * @param user User address
     * @return Array of file hashes
     */
    function getSharedFiles(address user) external view returns (bytes32[] memory) {
        return sharedFiles[user];
    }
    
    /**
     * @dev Get file shares
     * @param fileHash Hash of the file
     * @return Array of file shares
     */
    function getFileShares(bytes32 fileHash) 
        external 
        view 
        fileExists(fileHash) 
        returns (FileShare[] memory) 
    {
        return fileShares[fileHash];
    }
    
    /**
     * @dev Check if user has access to file
     * @param fileHash Hash of the file
     * @param user User address
     * @return Whether the user has access
     */
    function hasFileAccess(bytes32 fileHash, address user) 
        external 
        view 
        fileExists(fileHash) 
        returns (bool) 
    {
        FileMetadata storage file = files[fileHash];
        return file.owner == user || file.sharedWith[user] || file.isPublic;
    }
    
    /**
     * @dev Get user's access permission for file
     * @param fileHash Hash of the file
     * @param user User address
     * @return Access permission level
     */
    function getFileAccessPermission(bytes32 fileHash, address user) 
        external 
        view 
        fileExists(fileHash) 
        returns (AccessPermission) 
    {
        FileMetadata storage file = files[fileHash];
        if (file.owner == user) {
            return AccessPermission.Admin;
        }
        return AccessPermission(file.accessPermissions[user]);
    }
    
    /**
     * @dev Get total files count
     * @return Total number of files
     */
    function getTotalFiles() external view returns (uint256) {
        return totalFiles;
    }
    
    /**
     * @dev Get total storage used
     * @return Total storage used in bytes
     */
    function getTotalStorageUsed() external view returns (uint256) {
        return totalStorageUsed;
    }
    
    /**
     * @dev Search files by name or tags
     * @param query Search query
     * @param user User address (0 for public search)
     * @return Array of matching file hashes
     */
    function searchFiles(string memory query, address user) 
        external 
        view 
        returns (bytes32[] memory) 
    {
        bytes32[] memory results = new bytes32[](0);
        uint256 count = 0;
        
        // Count matching files
        for (uint256 i = 0; i < allHosts.length; i++) {
            address host = allHosts[i];
            for (uint256 j = 0; j < userFiles[host].length; j++) {
                bytes32 fileHash = userFiles[host][j];
                FileMetadata storage file = files[fileHash];
                
                // Check if user has access
                bool hasAccess = file.owner == user || file.sharedWith[user] || file.isPublic;
                if (!hasAccess) continue;
                
                // Check if file matches query
                bool matches = false;
                
                // Check file name
                if (bytes(file.fileName).length > 0) {
                    matches = matches || contains(file.fileName, query);
                }
                
                // Check tags
                for (uint256 k = 0; k < file.tags.length; k++) {
                    if (contains(file.tags[k], query)) {
                        matches = true;
                        break;
                    }
                }
                
                if (matches) count++;
            }
        }
        
        // Create results array
        results = new bytes32[](count);
        uint256 index = 0;
        
        for (uint256 i = 0; i < allHosts.length; i++) {
            address host = allHosts[i];
            for (uint256 j = 0; j < userFiles[host].length; j++) {
                bytes32 fileHash = userFiles[host][j];
                FileMetadata storage file = files[fileHash];
                
                // Check if user has access
                bool hasAccess = file.owner == user || file.sharedWith[user] || file.isPublic;
                if (!hasAccess) continue;
                
                // Check if file matches query
                bool matches = false;
                
                // Check file name
                if (bytes(file.fileName).length > 0) {
                    matches = matches || contains(file.fileName, query);
                }
                
                // Check tags
                for (uint256 k = 0; k < file.tags.length; k++) {
                    if (contains(file.tags[k], query)) {
                        matches = true;
                        break;
                    }
                }
                
                if (matches) {
                    results[index] = fileHash;
                    index++;
                }
            }
        }
        
        return results;
    }
    
    /**
     * @dev Helper function to check if string contains substring
     * @param str String to search in
     * @param substr Substring to search for
     * @return Whether the string contains the substring
     */
    function contains(string memory str, string memory substr) internal pure returns (bool) {
        bytes memory strBytes = bytes(str);
        bytes memory substrBytes = bytes(substr);
        
        if (substrBytes.length > strBytes.length) return false;
        
        for (uint256 i = 0; i <= strBytes.length - substrBytes.length; i++) {
            bool found = true;
            for (uint256 j = 0; j < substrBytes.length; j++) {
                if (strBytes[i + j] != substrBytes[j]) {
                    found = false;
                    break;
                }
            }
            if (found) return true;
        }
        
        return false;
    }
}
