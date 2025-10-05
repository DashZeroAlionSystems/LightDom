// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title StorageToken
 * @dev ERC20 token for the decentralized storage platform
 * @notice This token is used for payments between renters and hosts
 */
contract StorageToken is ERC20, Ownable, Pausable {
    uint256 public constant INITIAL_SUPPLY = 1000000000 * 10**18; // 1 billion tokens
    uint256 public constant MAX_SUPPLY = 10000000000 * 10**18; // 10 billion tokens max
    
    // Mapping to track locked tokens for storage contracts
    mapping(address => uint256) public lockedTokens;
    
    event TokensLocked(address indexed account, uint256 amount);
    event TokensUnlocked(address indexed account, uint256 amount);
    
    constructor() ERC20("StorageToken", "STOR") {
        _mint(msg.sender, INITIAL_SUPPLY);
    }
    
    /**
     * @dev Lock tokens for storage contracts
     * @param amount Amount of tokens to lock
     */
    function lockTokens(uint256 amount) external whenNotPaused {
        require(balanceOf(msg.sender) >= amount, "Insufficient balance");
        require(amount > 0, "Amount must be greater than 0");
        
        lockedTokens[msg.sender] += amount;
        _transfer(msg.sender, address(this), amount);
        
        emit TokensLocked(msg.sender, amount);
    }
    
    /**
     * @dev Unlock tokens from storage contracts
     * @param amount Amount of tokens to unlock
     */
    function unlockTokens(uint256 amount) external whenNotPaused {
        require(lockedTokens[msg.sender] >= amount, "Insufficient locked tokens");
        require(amount > 0, "Amount must be greater than 0");
        
        lockedTokens[msg.sender] -= amount;
        _transfer(address(this), msg.sender, amount);
        
        emit TokensUnlocked(msg.sender, amount);
    }
    
    /**
     * @dev Get available balance (total - locked)
     * @param account Account to check
     * @return Available balance
     */
    function getAvailableBalance(address account) external view returns (uint256) {
        return balanceOf(account) - lockedTokens[account];
    }
    
    /**
     * @dev Mint new tokens (only owner)
     * @param to Address to mint to
     * @param amount Amount to mint
     */
    function mint(address to, uint256 amount) external onlyOwner {
        require(totalSupply() + amount <= MAX_SUPPLY, "Exceeds max supply");
        _mint(to, amount);
    }
    
    /**
     * @dev Pause token transfers
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause token transfers
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Override transfer to check for locked tokens
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override {
        super._beforeTokenTransfer(from, to, amount);
        
        if (from != address(0) && from != address(this)) {
            require(
                balanceOf(from) - lockedTokens[from] >= amount,
                "Transfer exceeds available balance"
            );
        }
    }
}
