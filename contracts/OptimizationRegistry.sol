// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

/**
 * @title Optimization Registry
 * @dev Registry for tracking DOM optimizations and their proofs
 * @author LightDom Team
 */
contract OptimizationRegistry is AccessControl, ReentrancyGuard {
    using SafeMath for uint256;

    // Roles
    bytes32 public constant REGISTRAR_ROLE = keccak256("REGISTRAR_ROLE");
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    // Optimization data structure
    struct Optimization {
        address harvester;
        string url;
        uint256 spaceBytes;
        uint256 timestamp;
        bytes32 proofHash;
        string biomeType;
        bool verified;
        uint256 verificationScore;
        string metadata;
    }

    // Registry storage
    mapping(bytes32 => Optimization) public optimizations;
    mapping(address => bytes32[]) public harvesterOptimizations;
    mapping(string => bytes32[]) public urlOptimizations;
    mapping(bytes32 => bool) public usedProofs;
    
    // Statistics
    uint256 public totalOptimizations;
    uint256 public totalSpaceSaved;
    uint256 public totalVerifiedOptimizations;
    
    // Verification thresholds
    uint256 public constant MIN_VERIFICATION_SCORE = 70;
    uint256 public constant MAX_VERIFICATION_SCORE = 100;
    
    // Events
    event OptimizationRegistered(
        bytes32 indexed optimizationId,
        address indexed harvester,
        string url,
        uint256 spaceBytes,
        bytes32 proofHash
    );
    
    event OptimizationVerified(
        bytes32 indexed optimizationId,
        address indexed verifier,
        uint256 verificationScore
    );
    
    event OptimizationRejected(
        bytes32 indexed optimizationId,
        address indexed verifier,
        string reason
    );
    
    event RegistryUpdated(
        uint256 totalOptimizations,
        uint256 totalSpaceSaved,
        uint256 totalVerifiedOptimizations
    );

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(REGISTRAR_ROLE, msg.sender);
        _grantRole(VERIFIER_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
    }

    /**
     * @dev Register a new optimization
     * @param url The URL that was optimized
     * @param spaceBytes Amount of space saved in bytes
     * @param proofHash Cryptographic proof of optimization
     * @param biomeType Type of website biome
     * @param metadata Additional metadata about the optimization
     */
    function registerOptimization(
        string memory url,
        uint256 spaceBytes,
        bytes32 proofHash,
        string memory biomeType,
        string memory metadata
    ) external onlyRole(REGISTRAR_ROLE) nonReentrant {
        require(spaceBytes > 0, "Space saved must be positive");
        require(!usedProofs[proofHash], "Proof already used");
        require(bytes(url).length > 0, "URL cannot be empty");
        
        // Generate unique optimization ID
        bytes32 optimizationId = keccak256(
            abi.encodePacked(
                msg.sender,
                url,
                spaceBytes,
                proofHash,
                block.timestamp
            )
        );
        
        // Store optimization
        optimizations[optimizationId] = Optimization({
            harvester: msg.sender,
            url: url,
            spaceBytes: spaceBytes,
            timestamp: block.timestamp,
            proofHash: proofHash,
            biomeType: biomeType,
            verified: false,
            verificationScore: 0,
            metadata: metadata
        });
        
        // Update mappings
        harvesterOptimizations[msg.sender].push(optimizationId);
        urlOptimizations[url].push(optimizationId);
        usedProofs[proofHash] = true;
        
        // Update statistics
        totalOptimizations++;
        totalSpaceSaved += spaceBytes;
        
        emit OptimizationRegistered(optimizationId, msg.sender, url, spaceBytes, proofHash);
        emit RegistryUpdated(totalOptimizations, totalSpaceSaved, totalVerifiedOptimizations);
    }

    /**
     * @dev Verify an optimization
     * @param optimizationId The ID of the optimization to verify
     * @param verificationScore Score from 0-100
     * @param isVerified Whether the optimization is verified
     */
    function verifyOptimization(
        bytes32 optimizationId,
        uint256 verificationScore,
        bool isVerified
    ) external onlyRole(VERIFIER_ROLE) nonReentrant {
        require(optimizations[optimizationId].harvester != address(0), "Optimization not found");
        require(!optimizations[optimizationId].verified, "Already verified");
        require(verificationScore <= MAX_VERIFICATION_SCORE, "Invalid verification score");
        
        // Update optimization
        optimizations[optimizationId].verified = isVerified;
        optimizations[optimizationId].verificationScore = verificationScore;
        
        if (isVerified && verificationScore >= MIN_VERIFICATION_SCORE) {
            totalVerifiedOptimizations++;
            emit OptimizationVerified(optimizationId, msg.sender, verificationScore);
        } else {
            emit OptimizationRejected(optimizationId, msg.sender, "Low verification score");
        }
        
        emit RegistryUpdated(totalOptimizations, totalSpaceSaved, totalVerifiedOptimizations);
    }

    /**
     * @dev Get optimization details
     * @param optimizationId The ID of the optimization
     */
    function getOptimization(bytes32 optimizationId) external view returns (Optimization memory) {
        require(optimizations[optimizationId].harvester != address(0), "Optimization not found");
        return optimizations[optimizationId];
    }

    /**
     * @dev Get all optimizations for a harvester
     * @param harvester The harvester address
     */
    function getHarvesterOptimizations(address harvester) external view returns (bytes32[] memory) {
        return harvesterOptimizations[harvester];
    }

    /**
     * @dev Get all optimizations for a URL
     * @param url The URL
     */
    function getUrlOptimizations(string memory url) external view returns (bytes32[] memory) {
        return urlOptimizations[url];
    }

    /**
     * @dev Get registry statistics
     */
    function getRegistryStats() external view returns (
        uint256 totalOpts,
        uint256 totalSpace,
        uint256 totalVerified,
        uint256 verificationRate
    ) {
        totalOpts = totalOptimizations;
        totalSpace = totalSpaceSaved;
        totalVerified = totalVerifiedOptimizations;
        verificationRate = totalOptimizations > 0 ? (totalVerifiedOptimizations * 100) / totalOptimizations : 0;
    }

    /**
     * @dev Check if a proof has been used
     * @param proofHash The proof hash to check
     */
    function isProofUsed(bytes32 proofHash) external view returns (bool) {
        return usedProofs[proofHash];
    }

    /**
     * @dev Get optimization count for a harvester
     * @param harvester The harvester address
     */
    function getHarvesterOptimizationCount(address harvester) external view returns (uint256) {
        return harvesterOptimizations[harvester].length;
    }

    /**
     * @dev Get total space saved by a harvester
     * @param harvester The harvester address
     */
    function getHarvesterTotalSpaceSaved(address harvester) external view returns (uint256) {
        bytes32[] memory optimizationIds = harvesterOptimizations[harvester];
        uint256 totalSpace = 0;
        
        for (uint256 i = 0; i < optimizationIds.length; i++) {
            if (optimizations[optimizationIds[i]].verified) {
                totalSpace += optimizations[optimizationIds[i]].spaceBytes;
            }
        }
        
        return totalSpace;
    }

    /**
     * @dev Get recent optimizations (last N optimizations)
     * @param count Number of recent optimizations to return
     */
    function getRecentOptimizations(uint256 count) external view returns (bytes32[] memory) {
        require(count > 0, "Count must be positive");
        
        // This is a simplified implementation
        // In production, you might want to maintain a separate array for recent optimizations
        bytes32[] memory recent = new bytes32[](count);
        uint256 currentIndex = 0;
        
        // Note: This is not efficient for large datasets
        // Consider using a more efficient data structure for production
        for (uint256 i = 0; i < totalOptimizations && currentIndex < count; i++) {
            // This would need to be implemented with a proper indexing system
            // For now, return empty array
            break;
        }
        
        return recent;
    }
}