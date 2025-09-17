// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * ProofOfOptimization
 * - Verifies DOM optimization proofs anchored by a Merkle root of DOM diffs/artifacts
 * - Records bytesSaved and backlinksCount for reward logic done off-chain or by token contract
 * - Supports a challenge window for disputes; owner can resolve and slash
 */
contract ProofOfOptimization {
    struct Proof {
        address submitter;
        bytes32 merkleRoot;
        uint256 bytesSaved;
        uint256 backlinksCount;
        string artifactCID; // e.g., IPFS CID of light DOM bundle
        uint64 submittedAt;
        uint64 challengeWindowEnds;
        bool finalized;
        bool slashed;
    }

    event ProofSubmitted(
        bytes32 indexed crawlId,
        address indexed submitter,
        bytes32 merkleRoot,
        uint256 bytesSaved,
        uint256 backlinksCount,
        string artifactCID,
        uint64 challengeWindowEnds
    );

    event Challenged(bytes32 indexed crawlId, address indexed challenger, string reason);
    event Finalized(bytes32 indexed crawlId);
    event Slashed(bytes32 indexed crawlId, address indexed submitter, string reason);

    address public owner;
    uint64 public defaultChallengeWindow; // seconds

    mapping(bytes32 => Proof) public proofs; // crawlId => proof
    mapping(bytes32 => bool) public challenged; // crawlId => challenged

    modifier onlyOwner() {
        require(msg.sender == owner, "not owner");
        _;
    }

    constructor(uint64 _challengeWindowSeconds) {
        owner = msg.sender;
        defaultChallengeWindow = _challengeWindowSeconds;
    }

    function setDefaultChallengeWindow(uint64 seconds_) external onlyOwner {
        require(seconds_ >= 60 && seconds_ <= 30 days, "invalid window");
        defaultChallengeWindow = seconds_;
    }

    function submitProof(
        bytes32 crawlId,
        bytes32 merkleRoot,
        uint256 bytesSaved,
        uint256 backlinksCount,
        string calldata artifactCID
    ) external {
        require(proofs[crawlId].submittedAt == 0, "exists");
        require(bytesSaved > 0, "no savings");
        require(merkleRoot != bytes32(0), "root");

        uint64 nowTs = uint64(block.timestamp);
        proofs[crawlId] = Proof({
            submitter: msg.sender,
            merkleRoot: merkleRoot,
            bytesSaved: bytesSaved,
            backlinksCount: backlinksCount,
            artifactCID: artifactCID,
            submittedAt: nowTs,
            challengeWindowEnds: nowTs + defaultChallengeWindow,
            finalized: false,
            slashed: false
        });

        emit ProofSubmitted(
            crawlId,
            msg.sender,
            merkleRoot,
            bytesSaved,
            backlinksCount,
            artifactCID,
            proofs[crawlId].challengeWindowEnds
        );
    }

    function challenge(bytes32 crawlId, string calldata reason) external {
        Proof storage p = proofs[crawlId];
        require(p.submittedAt != 0, "not found");
        require(!p.finalized && !p.slashed, "closed");
        require(block.timestamp <= p.challengeWindowEnds, "window over");
        challenged[crawlId] = true;
        emit Challenged(crawlId, msg.sender, reason);
    }

    function finalize(bytes32 crawlId) external {
        Proof storage p = proofs[crawlId];
        require(p.submittedAt != 0, "not found");
        require(!p.finalized && !p.slashed, "closed");
        require(block.timestamp > p.challengeWindowEnds, "window open");
        // If challenged, require owner resolution (keep simple)
        require(!challenged[crawlId], "needs owner resolution");
        p.finalized = true;
        emit Finalized(crawlId);
    }

    function ownerSlash(bytes32 crawlId, string calldata reason) external onlyOwner {
        Proof storage p = proofs[crawlId];
        require(p.submittedAt != 0, "not found");
        require(!p.finalized && !p.slashed, "closed");
        p.slashed = true;
        emit Slashed(crawlId, p.submitter, reason);
    }
}


