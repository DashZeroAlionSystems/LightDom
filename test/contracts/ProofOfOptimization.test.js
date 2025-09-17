import { expect } from 'chai';
import { ethers } from 'hardhat';
import { describe, it, before, after } from 'vitest';

describe("ProofOfOptimization", function () {
  let pooContract;
  let owner;
  let submitter;
  let challenger;
  let addr1, addr2, addrs;

  beforeEach(async function () {
    [owner, submitter, challenger, addr1, addr2, ...addrs] = await ethers.getSigners();
    
    const ProofOfOptimization = await ethers.getContractFactory("ProofOfOptimization");
    pooContract = await ProofOfOptimization.deploy(
      ethers.ZeroAddress, // token contract (not used in tests)
      ethers.ZeroAddress  // land contract (not used in tests)
    );
    await pooContract.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await pooContract.owner()).to.equal(owner.address);
    });

    it("Should initialize with zero total proofs", async function () {
      expect(await pooContract.getTotalProofs()).to.equal(0);
    });
  });

  describe("PoO Submission", function () {
    it("Should allow valid PoO submission", async function () {
      const crawlId = ethers.keccak256(ethers.toUtf8Bytes("test-crawl"));
      const merkleRoot = ethers.keccak256(ethers.toUtf8Bytes("test-merkle"));
      const bytesSaved = 1024;
      const backlinksCount = 5;
      const artifactCID = "ipfs://test-cid";

      await expect(
        pooContract.connect(submitter).submitPoO(
          crawlId,
          merkleRoot,
          bytesSaved,
          backlinksCount,
          artifactCID
        )
      ).to.emit(pooContract, "ProofSubmitted")
        .withArgs(crawlId, submitter.address, merkleRoot, bytesSaved, backlinksCount, artifactCID, await pooContract.getChallengeWindowEnds(crawlId));
    });

    it("Should reject duplicate PoO submission", async function () {
      const crawlId = ethers.keccak256(ethers.toUtf8Bytes("test-crawl"));
      const merkleRoot = ethers.keccak256(ethers.toUtf8Bytes("test-merkle"));
      const bytesSaved = 1024;
      const backlinksCount = 5;
      const artifactCID = "ipfs://test-cid";

      await pooContract.connect(submitter).submitPoO(
        crawlId,
        merkleRoot,
        bytesSaved,
        backlinksCount,
        artifactCID
      );

      await expect(
        pooContract.connect(submitter).submitPoO(
          crawlId,
          merkleRoot,
          bytesSaved,
          backlinksCount,
          artifactCID
        )
      ).to.be.revertedWith("Proof already exists");
    });

    it("Should update total statistics", async function () {
      const crawlId = ethers.keccak256(ethers.toUtf8Bytes("test-crawl"));
      const merkleRoot = ethers.keccak256(ethers.toUtf8Bytes("test-merkle"));
      const bytesSaved = 1024;
      const backlinksCount = 5;
      const artifactCID = "ipfs://test-cid";

      await pooContract.connect(submitter).submitPoO(
        crawlId,
        merkleRoot,
        bytesSaved,
        backlinksCount,
        artifactCID
      );

      expect(await pooContract.getTotalProofs()).to.equal(1);
      expect(await pooContract.getTotalBytesSaved()).to.equal(bytesSaved);
      expect(await pooContract.getTotalBacklinks()).to.equal(backlinksCount);
    });
  });

  describe("PoO Challenge", function () {
    beforeEach(async function () {
      const crawlId = ethers.keccak256(ethers.toUtf8Bytes("test-crawl"));
      const merkleRoot = ethers.keccak256(ethers.toUtf8Bytes("test-merkle"));
      const bytesSaved = 1024;
      const backlinksCount = 5;
      const artifactCID = "ipfs://test-cid";

      await pooContract.connect(submitter).submitPoO(
        crawlId,
        merkleRoot,
        bytesSaved,
        backlinksCount,
        artifactCID
      );
    });

    it("Should allow PoO challenge within window", async function () {
      const crawlId = ethers.keccak256(ethers.toUtf8Bytes("test-crawl"));
      const merkleProof = [ethers.keccak256(ethers.toUtf8Bytes("proof1"))];
      const leafData = ethers.keccak256(ethers.toUtf8Bytes("leaf"));

      await expect(
        pooContract.connect(challenger).challengePoO(crawlId, merkleProof, leafData)
      ).to.emit(pooContract, "ProofChallenged")
        .withArgs(crawlId, challenger.address);
    });

    it("Should reject challenge after window expires", async function () {
      const crawlId = ethers.keccak256(ethers.toUtf8Bytes("test-crawl"));
      const merkleProof = [ethers.keccak256(ethers.toUtf8Bytes("proof1"))];
      const leafData = ethers.keccak256(ethers.toUtf8Bytes("leaf"));

      // Fast forward past challenge window
      await ethers.provider.send("evm_increaseTime", [86400 * 8]); // 8 days
      await ethers.provider.send("evm_mine");

      await expect(
        pooContract.connect(challenger).challengePoO(crawlId, merkleProof, leafData)
      ).to.be.revertedWith("Challenge window expired");
    });
  });

  describe("PoO Finalization", function () {
    beforeEach(async function () {
      const crawlId = ethers.keccak256(ethers.toUtf8Bytes("test-crawl"));
      const merkleRoot = ethers.keccak256(ethers.toUtf8Bytes("test-merkle"));
      const bytesSaved = 1024;
      const backlinksCount = 5;
      const artifactCID = "ipfs://test-cid";

      await pooContract.connect(submitter).submitPoO(
        crawlId,
        merkleRoot,
        bytesSaved,
        backlinksCount,
        artifactCID
      );
    });

    it("Should allow owner to finalize PoO", async function () {
      const crawlId = ethers.keccak256(ethers.toUtf8Bytes("test-crawl"));

      await expect(
        pooContract.finalizePoO(crawlId)
      ).to.emit(pooContract, "ProofFinalized")
        .withArgs(crawlId);
    });

    it("Should reject finalization by non-owner", async function () {
      const crawlId = ethers.keccak256(ethers.toUtf8Bytes("test-crawl"));

      await expect(
        pooContract.connect(submitter).finalizePoO(crawlId)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("PoO Slashing", function () {
    beforeEach(async function () {
      const crawlId = ethers.keccak256(ethers.toUtf8Bytes("test-crawl"));
      const merkleRoot = ethers.keccak256(ethers.toUtf8Bytes("test-merkle"));
      const bytesSaved = 1024;
      const backlinksCount = 5;
      const artifactCID = "ipfs://test-cid";

      await pooContract.connect(submitter).submitPoO(
        crawlId,
        merkleRoot,
        bytesSaved,
        backlinksCount,
        artifactCID
      );
    });

    it("Should allow owner to slash invalid PoO", async function () {
      const crawlId = ethers.keccak256(ethers.toUtf8Bytes("test-crawl"));

      await expect(
        pooContract.slashPoO(crawlId)
      ).to.emit(pooContract, "ProofSlashed")
        .withArgs(crawlId);
    });

    it("Should reject slashing by non-owner", async function () {
      const crawlId = ethers.keccak256(ethers.toUtf8Bytes("test-crawl"));

      await expect(
        pooContract.connect(submitter).slashPoO(crawlId)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("Batch Operations", function () {
    it("Should allow batch PoO submission", async function () {
      const batch = [
        {
          crawlId: ethers.keccak256(ethers.toUtf8Bytes("crawl1")),
          merkleRoot: ethers.keccak256(ethers.toUtf8Bytes("merkle1")),
          bytesSaved: 1024,
          backlinksCount: 5,
          artifactCID: "ipfs://cid1"
        },
        {
          crawlId: ethers.keccak256(ethers.toUtf8Bytes("crawl2")),
          merkleRoot: ethers.keccak256(ethers.toUtf8Bytes("merkle2")),
          bytesSaved: 2048,
          backlinksCount: 10,
          artifactCID: "ipfs://cid2"
        }
      ];

      const batchHash = ethers.keccak256(ethers.toUtf8Bytes("batch-hash"));
      const signature = ethers.keccak256(ethers.toUtf8Bytes("signature"));

      await expect(
        pooContract.connect(submitter).submitBatchPoO(batch, batchHash, signature)
      ).to.emit(pooContract, "BatchPoOSubmitted")
        .withArgs(submitter.address, batch.length, batchHash);
    });
  });
});
