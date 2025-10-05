// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./StorageToken.sol";

/**
 * @title StorageGovernance
 * @dev Governance contract for the decentralized storage platform
 * @notice Handles voting, proposals, and platform parameter management
 */
contract StorageGovernance is Ownable, ReentrancyGuard {
    StorageToken public immutable storageToken;
    
    // Proposal types
    enum ProposalType { ParameterChange, ContractUpgrade, TreasuryAllocation, HostSlashing }
    
    // Proposal states
    enum ProposalState { Pending, Active, Passed, Rejected, Executed }
    
    // Proposal structure
    struct Proposal {
        uint256 id;
        address proposer;
        ProposalType proposalType;
        string title;
        string description;
        bytes callData;
        address target;
        uint256 startTime;
        uint256 endTime;
        uint256 forVotes;
        uint256 againstVotes;
        uint256 abstainVotes;
        ProposalState state;
        bool executed;
        mapping(address => bool) hasVoted;
        mapping(address => uint256) votingPower;
    }
    
    // Platform parameters
    struct PlatformParameters {
        uint256 minHostReputation;
        uint256 maxStorageDuration; // in months
        uint256 minCollateralPercentage; // in basis points (100 = 1%)
        uint256 maxFileSize; // in bytes
        uint256 disputeResolutionTime; // in days
        uint256 treasuryAllocation; // percentage of fees to treasury
    }
    
    // Voting power requirements
    uint256 public constant MIN_PROPOSAL_THRESHOLD = 1000 * 10**18; // 1000 tokens
    uint256 public constant VOTING_DURATION = 7 days;
    uint256 public constant EXECUTION_DELAY = 1 days;
    uint256 public constant QUORUM_THRESHOLD = 10000 * 10**18; // 10000 tokens
    
    // State variables
    mapping(uint256 => Proposal) public proposals;
    mapping(address => uint256) public votingPower;
    mapping(address => uint256) public lastVoteTime;
    
    PlatformParameters public platformParameters;
    uint256 public proposalCount;
    uint256 public treasuryBalance;
    
    // Events
    event ProposalCreated(uint256 indexed proposalId, address indexed proposer, ProposalType proposalType);
    event VoteCast(uint256 indexed proposalId, address indexed voter, uint256 votes, bool support);
    event ProposalExecuted(uint256 indexed proposalId);
    event ParametersUpdated(PlatformParameters newParameters);
    event TreasuryAllocated(uint256 amount, address recipient);
    
    constructor(address _storageToken) {
        storageToken = StorageToken(_storageToken);
        
        // Initialize default platform parameters
        platformParameters = PlatformParameters({
            minHostReputation: 50,
            maxStorageDuration: 24, // 24 months
            minCollateralPercentage: 1000, // 10%
            maxFileSize: 10 * 1024 * 1024 * 1024, // 10 GB
            disputeResolutionTime: 7, // 7 days
            treasuryAllocation: 500 // 5%
        });
    }
    
    /**
     * @dev Create a new proposal
     * @param proposalType Type of proposal
     * @param title Proposal title
     * @param description Proposal description
     * @param target Target contract for execution
     * @param callData Calldata for execution
     */
    function createProposal(
        ProposalType proposalType,
        string memory title,
        string memory description,
        address target,
        bytes memory callData
    ) external returns (uint256) {
        require(storageToken.balanceOf(msg.sender) >= MIN_PROPOSAL_THRESHOLD, "Insufficient voting power");
        require(bytes(title).length > 0, "Title cannot be empty");
        require(bytes(description).length > 0, "Description cannot be empty");
        
        uint256 proposalId = proposalCount++;
        Proposal storage proposal = proposals[proposalId];
        
        proposal.id = proposalId;
        proposal.proposer = msg.sender;
        proposal.proposalType = proposalType;
        proposal.title = title;
        proposal.description = description;
        proposal.target = target;
        proposal.callData = callData;
        proposal.startTime = block.timestamp;
        proposal.endTime = block.timestamp + VOTING_DURATION;
        proposal.state = ProposalState.Active;
        proposal.executed = false;
        
        emit ProposalCreated(proposalId, msg.sender, proposalType);
        
        return proposalId;
    }
    
    /**
     * @dev Vote on a proposal
     * @param proposalId Proposal ID
     * @param support True for yes, false for no
     * @param votes Number of votes to cast
     */
    function vote(uint256 proposalId, bool support, uint256 votes) external {
        Proposal storage proposal = proposals[proposalId];
        require(proposal.state == ProposalState.Active, "Proposal not active");
        require(block.timestamp >= proposal.startTime, "Voting not started");
        require(block.timestamp <= proposal.endTime, "Voting ended");
        require(!proposal.hasVoted[msg.sender], "Already voted");
        require(votes > 0, "Votes must be greater than 0");
        require(storageToken.balanceOf(msg.sender) >= votes, "Insufficient voting power");
        
        proposal.hasVoted[msg.sender] = true;
        proposal.votingPower[msg.sender] = votes;
        lastVoteTime[msg.sender] = block.timestamp;
        
        if (support) {
            proposal.forVotes += votes;
        } else {
            proposal.againstVotes += votes;
        }
        
        emit VoteCast(proposalId, msg.sender, votes, support);
    }
    
    /**
     * @dev Execute a passed proposal
     * @param proposalId Proposal ID to execute
     */
    function executeProposal(uint256 proposalId) external nonReentrant {
        Proposal storage proposal = proposals[proposalId];
        require(proposal.state == ProposalState.Active, "Proposal not active");
        require(block.timestamp > proposal.endTime, "Voting not ended");
        require(block.timestamp >= proposal.endTime + EXECUTION_DELAY, "Execution delay not met");
        require(!proposal.executed, "Proposal already executed");
        
        // Check if proposal passed
        uint256 totalVotes = proposal.forVotes + proposal.againstVotes;
        require(totalVotes >= QUORUM_THRESHOLD, "Quorum not met");
        require(proposal.forVotes > proposal.againstVotes, "Proposal not passed");
        
        proposal.state = ProposalState.Passed;
        proposal.executed = true;
        
        // Execute the proposal
        if (proposal.target != address(0)) {
            (bool success, ) = proposal.target.call(proposal.callData);
            require(success, "Proposal execution failed");
        }
        
        emit ProposalExecuted(proposalId);
    }
    
    /**
     * @dev Update platform parameters (only owner)
     * @param newParameters New platform parameters
     */
    function updatePlatformParameters(PlatformParameters memory newParameters) external onlyOwner {
        require(newParameters.minHostReputation > 0, "Invalid min host reputation");
        require(newParameters.maxStorageDuration > 0, "Invalid max storage duration");
        require(newParameters.minCollateralPercentage <= 5000, "Collateral too high"); // Max 50%
        require(newParameters.maxFileSize > 0, "Invalid max file size");
        require(newParameters.disputeResolutionTime > 0, "Invalid dispute resolution time");
        require(newParameters.treasuryAllocation <= 1000, "Treasury allocation too high"); // Max 10%
        
        platformParameters = newParameters;
        
        emit ParametersUpdated(newParameters);
    }
    
    /**
     * @dev Allocate treasury funds
     * @param amount Amount to allocate
     * @param recipient Recipient address
     */
    function allocateTreasury(uint256 amount, address recipient) external onlyOwner {
        require(amount <= treasuryBalance, "Insufficient treasury balance");
        require(recipient != address(0), "Invalid recipient");
        
        treasuryBalance -= amount;
        storageToken.transfer(recipient, amount);
        
        emit TreasuryAllocated(amount, recipient);
    }
    
    /**
     * @dev Deposit to treasury
     * @param amount Amount to deposit
     */
    function depositToTreasury(uint256 amount) external {
        require(amount > 0, "Amount must be greater than 0");
        require(storageToken.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        
        treasuryBalance += amount;
    }
    
    /**
     * @dev Get proposal details
     * @param proposalId Proposal ID
     * @return id, proposer, proposalType, title, description, target, startTime, endTime, forVotes, againstVotes, abstainVotes, state, executed
     */
    function getProposalDetails(uint256 proposalId) 
        external 
        view 
        returns (
            uint256 id,
            address proposer,
            ProposalType proposalType,
            string memory title,
            string memory description,
            address target,
            uint256 startTime,
            uint256 endTime,
            uint256 forVotes,
            uint256 againstVotes,
            uint256 abstainVotes,
            ProposalState state,
            bool executed
        ) 
    {
        Proposal storage proposal = proposals[proposalId];
        return (
            proposal.id,
            proposal.proposer,
            proposal.proposalType,
            proposal.title,
            proposal.description,
            proposal.target,
            proposal.startTime,
            proposal.endTime,
            proposal.forVotes,
            proposal.againstVotes,
            proposal.abstainVotes,
            proposal.state,
            proposal.executed
        );
    }
    
    /**
     * @dev Check if user has voted on a proposal
     * @param proposalId Proposal ID
     * @param voter Voter address
     * @return Whether the user has voted
     */
    function hasVoted(uint256 proposalId, address voter) external view returns (bool) {
        return proposals[proposalId].hasVoted[voter];
    }
    
    /**
     * @dev Get user's voting power for a proposal
     * @param proposalId Proposal ID
     * @param voter Voter address
     * @return Voting power
     */
    function getVotingPower(uint256 proposalId, address voter) external view returns (uint256) {
        return proposals[proposalId].votingPower[voter];
    }
    
    /**
     * @dev Get current platform parameters
     * @return Platform parameters
     */
    function getPlatformParameters() external view returns (PlatformParameters memory) {
        return platformParameters;
    }
}
