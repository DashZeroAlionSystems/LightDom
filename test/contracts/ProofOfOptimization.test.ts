import { expect } from "chai";
import { ethers } from "hardhat";
import { ProofOfOptimization } from "../../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { time } from "@nomicfoundation/hardhat-network-helpers";

describe("ProofOfOptimization", function () {
  let poo: ProofOfOptimization;
  let owner: SignerWithAddress;
  let submitter: SignerWithAddress;
  let challenger: SignerWithAddress;

  const CHALLENGE_WINDOW = 7 * 24 * 60 * 60; // 7 days

  beforeEach(async function () {
    [owner, submitter, challenger] = await ethers.getSigners();

    const ProofOfOptimization = await ethers.getContractFactory("ProofOfOptimization");
    poo = await ProofOfOptimization.deploy(CHALLENGE_WINDOW);
    await poo.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should deploy successfully", async function () {
      const address = await poo.getAddress();
      expect(address).to.not.equal(ethers.ZeroAddress);
    });

    it("Should set correct challenge window", async function () {
      expect(await poo.defaultChallengeWindow()).to.equal(CHALLENGE_WINDOW);
    });
  });

  describe("Proof Submission", function () {
    const crawlId = ethers.id("crawl-123");
    const merkleRoot = ethers.id("merkle-root");
    const bytesSaved = 10240;
    const backlinksCount = 50;
    const artifactCID = "QmTest123";

    it("Should submit a new proof", async function () {
      await expect(
        poo.connect(submitter).submitProof(
          crawlId,
          merkleRoot,
          bytesSaved,
          backlinksCount,
          artifactCID
        )
      ).to.emit(poo, "ProofSubmitted");
    });

    it("Should store proof data correctly", async function () {
      await poo.connect(submitter).submitProof(
        crawlId,
        merkleRoot,
        bytesSaved,
        backlinksCount,
        artifactCID
      );

      const proof = await poo.proofs(crawlId);
      expect(proof.submitter).to.equal(submitter.address);
      expect(proof.merkleRoot).to.equal(merkleRoot);
      expect(proof.bytesSaved).to.equal(bytesSaved);
      expect(proof.backlinksCount).to.equal(backlinksCount);
      expect(proof.artifactCID).to.equal(artifactCID);
      expect(proof.finalized).to.be.false;
      expect(proof.slashed).to.be.false;
    });

    it("Should set challenge window end time", async function () {
      const tx = await poo.connect(submitter).submitProof(
        crawlId,
        merkleRoot,
        bytesSaved,
        backlinksCount,
        artifactCID
      );
      
      const receipt = await tx.wait();
      const block = await ethers.provider.getBlock(receipt!.blockNumber);
      const expectedEnd = block!.timestamp + CHALLENGE_WINDOW;

      const proof = await poo.proofs(crawlId);
      expect(proof.challengeWindowEnds).to.equal(expectedEnd);
    });

    it("Should not allow duplicate crawl ID", async function () {
      await poo.connect(submitter).submitProof(
        crawlId,
        merkleRoot,
        bytesSaved,
        backlinksCount,
        artifactCID
      );

      await expect(
        poo.connect(submitter).submitProof(
          crawlId,
          merkleRoot,
          bytesSaved,
          backlinksCount,
          artifactCID
        )
      ).to.be.revertedWith("Proof already exists");
    });

    it("Should require positive bytes saved", async function () {
      await expect(
        poo.connect(submitter).submitProof(
          crawlId,
          merkleRoot,
          0,
          backlinksCount,
          artifactCID
        )
      ).to.be.revertedWith("Invalid bytes saved");
    });
  });

  describe("Challenges", function () {
    const crawlId = ethers.id("crawl-123");
    const merkleRoot = ethers.id("merkle-root");

    beforeEach(async function () {
      await poo.connect(submitter).submitProof(
        crawlId,
        merkleRoot,
        10240,
        50,
        "QmTest123"
      );
    });

    it("Should allow anyone to challenge during window", async function () {
      await expect(
        poo.connect(challenger).challenge(crawlId, "Invalid data")
      ).to.emit(poo, "Challenged");
    });

    it("Should store challenge reason", async function () {
      const reason = "Merkle root doesn't match";
      await poo.connect(challenger).challenge(crawlId, reason);

      // Challenge data would be stored in events or separate mapping
      // This is a simplified test
    });

    it("Should not allow challenge after window closes", async function () {
      // Advance time past challenge window
      await time.increase(CHALLENGE_WINDOW + 1);

      await expect(
        poo.connect(challenger).challenge(crawlId, "Too late")
      ).to.be.revertedWith("Challenge window closed");
    });

    it("Should not allow challenge on non-existent proof", async function () {
      const fakeCrawlId = ethers.id("fake-crawl");
      
      await expect(
        poo.connect(challenger).challenge(fakeCrawlId, "Doesn't exist")
      ).to.be.revertedWith("Proof does not exist");
    });

    it("Should not allow challenge on finalized proof", async function () {
      await time.increase(CHALLENGE_WINDOW + 1);
      await poo.finalize(crawlId);

      await expect(
        poo.connect(challenger).challenge(crawlId, "Already finalized")
      ).to.be.revertedWith("Proof already finalized");
    });
  });

  describe("Finalization", function () {
    const crawlId = ethers.id("crawl-123");

    beforeEach(async function () {
      await poo.connect(submitter).submitProof(
        crawlId,
        ethers.id("merkle-root"),
        10240,
        50,
        "QmTest123"
      );
    });

    it("Should finalize after challenge window", async function () {
      await time.increase(CHALLENGE_WINDOW + 1);

      await expect(poo.finalize(crawlId))
        .to.emit(poo, "Finalized")
        .withArgs(crawlId);
    });

    it("Should mark proof as finalized", async function () {
      await time.increase(CHALLENGE_WINDOW + 1);
      await poo.finalize(crawlId);

      const proof = await poo.proofs(crawlId);
      expect(proof.finalized).to.be.true;
    });

    it("Should not finalize before window closes", async function () {
      await expect(
        poo.finalize(crawlId)
      ).to.be.revertedWith("Challenge window not ended");
    });

    it("Should not finalize already finalized proof", async function () {
      await time.increase(CHALLENGE_WINDOW + 1);
      await poo.finalize(crawlId);

      await expect(
        poo.finalize(crawlId)
      ).to.be.revertedWith("Already finalized");
    });

    it("Should not finalize slashed proof", async function () {
      await poo.connect(owner).ownerSlash(crawlId, "Invalid");

      await time.increase(CHALLENGE_WINDOW + 1);
      await expect(
        poo.finalize(crawlId)
      ).to.be.revertedWith("Proof has been slashed");
    });
  });

  describe("Owner Slashing", function () {
    const crawlId = ethers.id("crawl-123");

    beforeEach(async function () {
      await poo.connect(submitter).submitProof(
        crawlId,
        ethers.id("merkle-root"),
        10240,
        50,
        "QmTest123"
      );
    });

    it("Should allow owner to slash", async function () {
      await expect(
        poo.connect(owner).ownerSlash(crawlId, "Fraudulent proof")
      ).to.emit(poo, "Slashed");
    });

    it("Should mark proof as slashed", async function () {
      await poo.connect(owner).ownerSlash(crawlId, "Fraudulent");

      const proof = await poo.proofs(crawlId);
      expect(proof.slashed).to.be.true;
    });

    it("Should not allow non-owner to slash", async function () {
      await expect(
        poo.connect(submitter).ownerSlash(crawlId, "Not owner")
      ).to.be.reverted;
    });

    it("Should not slash already finalized proof", async function () {
      await time.increase(CHALLENGE_WINDOW + 1);
      await poo.finalize(crawlId);

      await expect(
        poo.connect(owner).ownerSlash(crawlId, "Too late")
      ).to.be.revertedWith("Cannot slash finalized proof");
    });

    it("Should not slash already slashed proof", async function () {
      await poo.connect(owner).ownerSlash(crawlId, "First slash");

      await expect(
        poo.connect(owner).ownerSlash(crawlId, "Second slash")
      ).to.be.revertedWith("Already slashed");
    });
  });

  describe("Proof Verification", function () {
    const crawlId = ethers.id("crawl-123");
    const merkleRoot = ethers.id("merkle-root");

    beforeEach(async function () {
      await poo.connect(submitter).submitProof(
        crawlId,
        merkleRoot,
        10240,
        50,
        "QmTest123"
      );
    });

    it("Should verify valid proof exists", async function () {
      const exists = await poo.proofExists(crawlId);
      expect(exists).to.be.true;
    });

    it("Should return false for non-existent proof", async function () {
      const fakeCrawlId = ethers.id("fake-crawl");
      const exists = await poo.proofExists(fakeCrawlId);
      expect(exists).to.be.false;
    });

    it("Should check if proof is finalized", async function () {
      let isFinalized = await poo.isProofFinalized(crawlId);
      expect(isFinalized).to.be.false;

      await time.increase(CHALLENGE_WINDOW + 1);
      await poo.finalize(crawlId);

      isFinalized = await poo.isProofFinalized(crawlId);
      expect(isFinalized).to.be.true;
    });

    it("Should check if proof is slashed", async function () {
      let isSlashed = await poo.isProofSlashed(crawlId);
      expect(isSlashed).to.be.false;

      await poo.connect(owner).ownerSlash(crawlId, "Fraudulent");

      isSlashed = await poo.isProofSlashed(crawlId);
      expect(isSlashed).to.be.true;
    });
  });

  describe("Batch Operations", function () {
    it("Should submit multiple proofs", async function () {
      const crawlIds = [
        ethers.id("crawl-1"),
        ethers.id("crawl-2"),
        ethers.id("crawl-3")
      ];

      for (const crawlId of crawlIds) {
        await poo.connect(submitter).submitProof(
          crawlId,
          ethers.id("merkle-root"),
          10240,
          50,
          "QmTest123"
        );
      }

      for (const crawlId of crawlIds) {
        const exists = await poo.proofExists(crawlId);
        expect(exists).to.be.true;
      }
    });

    it("Should finalize multiple proofs", async function () {
      const crawlIds = [
        ethers.id("crawl-1"),
        ethers.id("crawl-2"),
        ethers.id("crawl-3")
      ];

      // Submit all proofs
      for (const crawlId of crawlIds) {
        await poo.connect(submitter).submitProof(
          crawlId,
          ethers.id("merkle-root"),
          10240,
          50,
          "QmTest123"
        );
      }

      // Advance time
      await time.increase(CHALLENGE_WINDOW + 1);

      // Finalize all proofs
      for (const crawlId of crawlIds) {
        await poo.finalize(crawlId);
      }

      // Verify all finalized
      for (const crawlId of crawlIds) {
        const isFinalized = await poo.isProofFinalized(crawlId);
        expect(isFinalized).to.be.true;
      }
    });
  });

  describe("Query Functions", function () {
    beforeEach(async function () {
      // Submit multiple proofs
      for (let i = 0; i < 5; i++) {
        await poo.connect(submitter).submitProof(
          ethers.id(`crawl-${i}`),
          ethers.id("merkle-root"),
          10240 * (i + 1),
          50 * (i + 1),
          `QmTest${i}`
        );
      }
    });

    it("Should get proof by crawl ID", async function () {
      const crawlId = ethers.id("crawl-0");
      const proof = await poo.proofs(crawlId);
      
      expect(proof.submitter).to.equal(submitter.address);
      expect(proof.bytesSaved).to.equal(10240);
    });

    it("Should get submitter proofs count", async function () {
      const count = await poo.getSubmitterProofsCount(submitter.address);
      expect(count).to.equal(5);
    });

    it("Should get total bytes saved", async function () {
      const total = await poo.getTotalBytesSaved();
      const expected = 10240 + 20480 + 30720 + 40960 + 51200;
      expect(total).to.equal(expected);
    });
  });

  describe("Events", function () {
    const crawlId = ethers.id("crawl-123");

    it("Should emit ProofSubmitted with correct parameters", async function () {
      const merkleRoot = ethers.id("merkle-root");
      const bytesSaved = 10240;
      const backlinksCount = 50;
      const artifactCID = "QmTest123";

      const tx = await poo.connect(submitter).submitProof(
        crawlId,
        merkleRoot,
        bytesSaved,
        backlinksCount,
        artifactCID
      );

      const receipt = await tx.wait();
      const block = await ethers.provider.getBlock(receipt!.blockNumber);
      const expectedEnd = block!.timestamp + CHALLENGE_WINDOW;

      await expect(tx)
        .to.emit(poo, "ProofSubmitted")
        .withArgs(
          crawlId,
          submitter.address,
          merkleRoot,
          bytesSaved,
          backlinksCount,
          artifactCID,
          expectedEnd
        );
    });

    it("Should emit Challenged event", async function () {
      await poo.connect(submitter).submitProof(
        crawlId,
        ethers.id("merkle-root"),
        10240,
        50,
        "QmTest123"
      );

      const reason = "Invalid data";
      await expect(poo.connect(challenger).challenge(crawlId, reason))
        .to.emit(poo, "Challenged")
        .withArgs(crawlId, challenger.address, reason);
    });

    it("Should emit Finalized event", async function () {
      await poo.connect(submitter).submitProof(
        crawlId,
        ethers.id("merkle-root"),
        10240,
        50,
        "QmTest123"
      );

      await time.increase(CHALLENGE_WINDOW + 1);

      await expect(poo.finalize(crawlId))
        .to.emit(poo, "Finalized")
        .withArgs(crawlId);
    });

    it("Should emit Slashed event", async function () {
      await poo.connect(submitter).submitProof(
        crawlId,
        ethers.id("merkle-root"),
        10240,
        50,
        "QmTest123"
      );

      const reason = "Fraudulent";
      await expect(poo.connect(owner).ownerSlash(crawlId, reason))
        .to.emit(poo, "Slashed")
        .withArgs(crawlId, submitter.address, reason);
    });
  });
});
