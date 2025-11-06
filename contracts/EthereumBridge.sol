// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

/**
 * @title Ethereum Bridge Contract
 * @dev Cross-chain bridge for DOM Space Harvester Token (DSH) transfers
 * @author LightDom Team
 */
contract EthereumBridge is Ownable, Pausable, ReentrancyGuard {
    using SafeERC20 for IERC20;
    using ECDSA for bytes32;
    using MessageHashUtils for bytes32;

    // Events
    event TokensLocked(
        address indexed user,
        uint256 amount,
        uint256 indexed nonce,
        bytes32 indexed txHash,
        uint256 targetChainId
    );
    
    event TokensUnlocked(
        address indexed user,
        uint256 amount,
        uint256 indexed nonce,
        bytes32 indexed sourceTxHash
    );
    
    event ValidatorAdded(address indexed validator);
    event ValidatorRemoved(address indexed validator);
    event BridgeFeeUpdated(uint256 newFee);
    event MinTransferAmountUpdated(uint256 newAmount);
    event MaxTransferAmountUpdated(uint256 newAmount);

    // State variables
    IERC20 public immutable token;
    uint256 public bridgeFee = 0.001 ether; // Bridge fee in ETH
    uint256 public minTransferAmount = 100 * 10**18; // Minimum 100 DSH
    uint256 public maxTransferAmount = 1000000 * 10**18; // Maximum 1M DSH
    
    // Validator management
    mapping(address => bool) public validators;
    uint256 public validatorCount;
    uint256 public requiredSignatures = 2; // Minimum signatures required
    
    // Transfer tracking
    mapping(bytes32 => bool) public processedTransactions;
    mapping(uint256 => bool) public usedNonces;
    uint256 public nonceCounter;
    
    // Supported chains
    mapping(uint256 => bool) public supportedChains;
    mapping(uint256 => address) public targetBridges; // chainId => bridge address
    
    // Transfer limits per user
    mapping(address => uint256) public dailyTransferLimit;
    mapping(address => uint256) public lastTransferDay;
    mapping(address => uint256) public dailyTransferAmount;

    constructor(
        address _token,
        address _owner
    ) Ownable(_owner) {
        token = IERC20(_token);
        
        // Initialize supported chains
        supportedChains[137] = true; // Polygon
        supportedChains[56] = true;  // BSC
        supportedChains[1] = true;   // Ethereum (for testing)
    }

    /**
     * @dev Lock tokens for cross-chain transfer
     * @param amount Amount of tokens to transfer
     * @param targetChainId Target chain ID
     * @param targetAddress Target address on destination chain
     */
    function lockTokens(
        uint256 amount,
        uint256 targetChainId,
        address targetAddress
    ) external payable whenNotPaused nonReentrant {
        require(supportedChains[targetChainId], "Unsupported target chain");
        require(amount >= minTransferAmount, "Amount below minimum");
        require(amount <= maxTransferAmount, "Amount above maximum");
        require(msg.value >= bridgeFee, "Insufficient bridge fee");
        require(targetAddress != address(0), "Invalid target address");
        
        // Check daily transfer limit
        _checkDailyLimit(msg.sender, amount);
        
        // Transfer tokens from user to bridge
        token.safeTransferFrom(msg.sender, address(this), amount);
        
        // Generate transaction hash
        uint256 nonce = _getNextNonce();
        bytes32 txHash = keccak256(
            abi.encodePacked(
                msg.sender,
                targetAddress,
                amount,
                targetChainId,
                nonce,
                block.chainid
            )
        );
        
        // Update daily transfer tracking
        _updateDailyTransfer(msg.sender, amount);
        
        emit TokensLocked(msg.sender, amount, nonce, txHash, targetChainId);
    }

    /**
     * @dev Unlock tokens from cross-chain transfer
     * @param user Target user address
     * @param amount Amount of tokens to unlock
     * @param sourceChainId Source chain ID
     * @param sourceTxHash Source transaction hash
     * @param nonce Transaction nonce
     * @param signatures Validator signatures
     */
    function unlockTokens(
        address user,
        uint256 amount,
        uint256 sourceChainId,
        bytes32 sourceTxHash,
        uint256 nonce,
        bytes[] calldata signatures
    ) external whenNotPaused nonReentrant {
        require(supportedChains[sourceChainId], "Unsupported source chain");
        require(!processedTransactions[sourceTxHash], "Transaction already processed");
        require(!usedNonces[nonce], "Nonce already used");
        require(user != address(0), "Invalid user address");
        require(amount > 0, "Invalid amount");
        require(signatures.length >= requiredSignatures, "Insufficient signatures");
        
        // Verify signatures
        require(_verifySignatures(
            user,
            amount,
            sourceChainId,
            sourceTxHash,
            nonce,
            signatures
        ), "Invalid signatures");
        
        // Mark transaction as processed
        processedTransactions[sourceTxHash] = true;
        usedNonces[nonce] = true;
        
        // Transfer tokens to user
        token.safeTransfer(user, amount);
        
        emit TokensUnlocked(user, amount, nonce, sourceTxHash);
    }

    /**
     * @dev Add validator
     * @param validator Validator address
     */
    function addValidator(address validator) external onlyOwner {
        require(validator != address(0), "Invalid validator address");
        require(!validators[validator], "Validator already exists");
        
        validators[validator] = true;
        validatorCount++;
        
        emit ValidatorAdded(validator);
    }

    /**
     * @dev Remove validator
     * @param validator Validator address
     */
    function removeValidator(address validator) external onlyOwner {
        require(validators[validator], "Validator does not exist");
        require(validatorCount > requiredSignatures, "Cannot remove validator");
        
        validators[validator] = false;
        validatorCount--;
        
        emit ValidatorRemoved(validator);
    }

    /**
     * @dev Update bridge fee
     * @param newFee New bridge fee in wei
     */
    function updateBridgeFee(uint256 newFee) external onlyOwner {
        bridgeFee = newFee;
        emit BridgeFeeUpdated(newFee);
    }

    /**
     * @dev Update minimum transfer amount
     * @param newAmount New minimum amount
     */
    function updateMinTransferAmount(uint256 newAmount) external onlyOwner {
        minTransferAmount = newAmount;
        emit MinTransferAmountUpdated(newAmount);
    }

    /**
     * @dev Update maximum transfer amount
     * @param newAmount New maximum amount
     */
    function updateMaxTransferAmount(uint256 newAmount) external onlyOwner {
        maxTransferAmount = newAmount;
        emit MaxTransferAmountUpdated(newAmount);
    }

    /**
     * @dev Update required signatures
     * @param newRequired New required signature count
     */
    function updateRequiredSignatures(uint256 newRequired) external onlyOwner {
        require(newRequired <= validatorCount, "Required signatures exceed validator count");
        require(newRequired > 0, "Required signatures must be greater than 0");
        
        requiredSignatures = newRequired;
    }

    /**
     * @dev Add supported chain
     * @param chainId Chain ID
     * @param bridgeAddress Bridge address on target chain
     */
    function addSupportedChain(uint256 chainId, address bridgeAddress) external onlyOwner {
        supportedChains[chainId] = true;
        targetBridges[chainId] = bridgeAddress;
    }

    /**
     * @dev Remove supported chain
     * @param chainId Chain ID
     */
    function removeSupportedChain(uint256 chainId) external onlyOwner {
        supportedChains[chainId] = false;
        delete targetBridges[chainId];
    }

    /**
     * @dev Set daily transfer limit for user
     * @param user User address
     * @param limit Daily limit amount
     */
    function setDailyTransferLimit(address user, uint256 limit) external onlyOwner {
        dailyTransferLimit[user] = limit;
    }

    /**
     * @dev Emergency withdraw tokens
     * @param amount Amount to withdraw
     */
    function emergencyWithdraw(uint256 amount) external onlyOwner {
        token.safeTransfer(owner(), amount);
    }

    /**
     * @dev Withdraw bridge fees
     */
    function withdrawFees() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No fees to withdraw");
        
        payable(owner()).transfer(balance);
    }

    /**
     * @dev Pause bridge operations
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpause bridge operations
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @dev Get next nonce
     */
    function _getNextNonce() internal returns (uint256) {
        return ++nonceCounter;
    }

    /**
     * @dev Verify validator signatures
     */
    function _verifySignatures(
        address user,
        uint256 amount,
        uint256 sourceChainId,
        bytes32 sourceTxHash,
        uint256 nonce,
        bytes[] calldata signatures
    ) internal view returns (bool) {
        bytes32 messageHash = keccak256(
            abi.encodePacked(
                user,
                amount,
                sourceChainId,
                sourceTxHash,
                nonce,
                block.chainid
            )
        );
        
        bytes32 ethSignedMessageHash = messageHash.toEthSignedMessageHash();
        
        address[] memory signers = new address[](signatures.length);
        uint256 validSignatures = 0;
        
        for (uint256 i = 0; i < signatures.length; i++) {
            address signer = ethSignedMessageHash.recover(signatures[i]);
            
            if (validators[signer]) {
                // Check for duplicate signatures
                bool isDuplicate = false;
                for (uint256 j = 0; j < validSignatures; j++) {
                    if (signers[j] == signer) {
                        isDuplicate = true;
                        break;
                    }
                }
                
                if (!isDuplicate) {
                    signers[validSignatures] = signer;
                    validSignatures++;
                }
            }
        }
        
        return validSignatures >= requiredSignatures;
    }

    /**
     * @dev Check daily transfer limit
     */
    function _checkDailyLimit(address user, uint256 amount) internal view {
        uint256 limit = dailyTransferLimit[user];
        if (limit > 0) {
            uint256 currentDay = block.timestamp / 1 days;
            uint256 lastDay = lastTransferDay[user];
            
            if (currentDay == lastDay) {
                require(
                    dailyTransferAmount[user] + amount <= limit,
                    "Daily transfer limit exceeded"
                );
            }
        }
    }

    /**
     * @dev Update daily transfer tracking
     */
    function _updateDailyTransfer(address user, uint256 amount) internal {
        uint256 currentDay = block.timestamp / 1 days;
        uint256 lastDay = lastTransferDay[user];
        
        if (currentDay == lastDay) {
            dailyTransferAmount[user] += amount;
        } else {
            dailyTransferAmount[user] = amount;
            lastTransferDay[user] = currentDay;
        }
    }

    /**
     * @dev Get bridge statistics
     */
    function getBridgeStats() external view returns (
        uint256 totalValidators,
        uint256 requiredSigs,
        uint256 bridgeFeeAmount,
        uint256 minTransfer,
        uint256 maxTransfer,
        uint256 nonce
    ) {
        return (
            validatorCount,
            requiredSignatures,
            bridgeFee,
            minTransferAmount,
            maxTransferAmount,
            nonceCounter
        );
    }

    /**
     * @dev Check if transaction is processed
     */
    function isTransactionProcessed(bytes32 txHash) external view returns (bool) {
        return processedTransactions[txHash];
    }

    /**
     * @dev Check if nonce is used
     */
    function isNonceUsed(uint256 nonce) external view returns (bool) {
        return usedNonces[nonce];
    }

    /**
     * @dev Get user's daily transfer info
     */
    function getUserDailyTransferInfo(address user) external view returns (
        uint256 limit,
        uint256 used,
        uint256 lastDay,
        uint256 currentDay
    ) {
        return (
            dailyTransferLimit[user],
            dailyTransferAmount[user],
            lastTransferDay[user],
            block.timestamp / 1 days
        );
    }
}