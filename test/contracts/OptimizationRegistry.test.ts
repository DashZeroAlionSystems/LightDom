import { expect } from "chai";
import { ethers } from "hardhat";
import { OptimizationRegistry } from "../../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("OptimizationRegistry", function () {
  let registry: OptimizationRegistry;
  let owner: SignerWithAddress;
  let harvester1: SignerWithAddress;
  let harvester2: SignerWithAddress;

  beforeEach(async function () {
    [owner, harvester1, harvester2] = await ethers.getSigners();

    const OptimizationRegistry = await ethers.getContractFactory("OptimizationRegistry");
    registry = await OptimizationRegistry.deploy();
    await registry.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should deploy successfully", async function () {
      const address = await registry.getAddress();
      expect(address).to.not.equal(ethers.ZeroAddress);
    });

    it("Should set the right owner", async function () {
      expect(await registry.owner()).to.equal(owner.address);
    });
  });

  describe("Optimization Registration", function () {
    const testUrl = "https://example.com";
    const spaceBytes = 1024;
    const proofHash = ethers.id("test-proof");
    const biomeType = "e-commerce";

    it("Should register a new optimization", async function () {
      await expect(
        registry.connect(harvester1).registerOptimization(
          testUrl,
          spaceBytes,
          proofHash,
          biomeType,
          ""
        )
      ).to.emit(registry, "OptimizationRegistered");
    });

    it("Should store optimization details correctly", async function () {
      await registry.connect(harvester1).registerOptimization(
        testUrl,
        spaceBytes,
        proofHash,
        biomeType,
        "test metadata"
      );

      const optimization = await registry.getOptimization(proofHash);
      expect(optimization.url).to.equal(testUrl);
      expect(optimization.spaceBytes).to.equal(spaceBytes);
      expect(optimization.harvester).to.equal(harvester1.address);
      expect(optimization.biomeType).to.equal(biomeType);
    });

    it("Should track harvester optimizations", async function () {
      await registry.connect(harvester1).registerOptimization(
        testUrl,
        spaceBytes,
        proofHash,
        biomeType,
        ""
      );

      const harvesterOptimizations = await registry.getHarvesterOptimizations(
        harvester1.address
      );
      expect(harvesterOptimizations.length).to.equal(1);
      expect(harvesterOptimizations[0]).to.equal(proofHash);
    });

    it("Should track multiple optimizations per harvester", async function () {
      const proof1 = ethers.id("proof-1");
      const proof2 = ethers.id("proof-2");
      const proof3 = ethers.id("proof-3");

      await registry.connect(harvester1).registerOptimization(
        testUrl,
        spaceBytes,
        proof1,
        biomeType,
        ""
      );

      await registry.connect(harvester1).registerOptimization(
        testUrl,
        spaceBytes,
        proof2,
        biomeType,
        ""
      );

      await registry.connect(harvester1).registerOptimization(
        testUrl,
        spaceBytes,
        proof3,
        biomeType,
        ""
      );

      const harvesterOptimizations = await registry.getHarvesterOptimizations(
        harvester1.address
      );
      expect(harvesterOptimizations.length).to.equal(3);
    });

    it("Should prevent duplicate proof hashes", async function () {
      await registry.connect(harvester1).registerOptimization(
        testUrl,
        spaceBytes,
        proofHash,
        biomeType,
        ""
      );

      await expect(
        registry.connect(harvester2).registerOptimization(
          testUrl,
          spaceBytes,
          proofHash,
          biomeType,
          ""
        )
      ).to.be.revertedWith("Optimization already registered");
    });

    it("Should track total space saved", async function () {
      const proof1 = ethers.id("proof-1");
      const proof2 = ethers.id("proof-2");
      const space1 = 1024;
      const space2 = 2048;

      await registry.connect(harvester1).registerOptimization(
        testUrl,
        space1,
        proof1,
        biomeType,
        ""
      );

      await registry.connect(harvester1).registerOptimization(
        testUrl,
        space2,
        proof2,
        biomeType,
        ""
      );

      const totalSaved = await registry.getTotalSpaceSaved();
      expect(totalSaved).to.equal(space1 + space2);
    });
  });

  describe("URL Tracking", function () {
    it("Should track URLs that have been optimized", async function () {
      const url = "https://example.com";
      const proofHash = ethers.id("proof-1");

      await registry.connect(harvester1).registerOptimization(
        url,
        1024,
        proofHash,
        "blog",
        ""
      );

      const isOptimized = await registry.isUrlOptimized(url);
      expect(isOptimized).to.be.true;
    });

    it("Should return false for non-optimized URLs", async function () {
      const isOptimized = await registry.isUrlOptimized("https://not-optimized.com");
      expect(isOptimized).to.be.false;
    });

    it("Should track multiple optimizations for the same URL", async function () {
      const url = "https://example.com";
      const proof1 = ethers.id("proof-1");
      const proof2 = ethers.id("proof-2");

      await registry.connect(harvester1).registerOptimization(
        url,
        1024,
        proof1,
        "blog",
        ""
      );

      await registry.connect(harvester2).registerOptimization(
        url,
        512,
        proof2,
        "blog",
        ""
      );

      const urlOptimizations = await registry.getUrlOptimizations(url);
      expect(urlOptimizations.length).to.equal(2);
    });
  });

  describe("Statistics", function () {
    beforeEach(async function () {
      // Register multiple optimizations
      await registry.connect(harvester1).registerOptimization(
        "https://site1.com",
        1000,
        ethers.id("proof-1"),
        "e-commerce",
        ""
      );

      await registry.connect(harvester1).registerOptimization(
        "https://site2.com",
        2000,
        ethers.id("proof-2"),
        "blog",
        ""
      );

      await registry.connect(harvester2).registerOptimization(
        "https://site3.com",
        1500,
        ethers.id("proof-3"),
        "portfolio",
        ""
      );
    });

    it("Should return correct total optimizations count", async function () {
      const total = await registry.getTotalOptimizations();
      expect(total).to.equal(3);
    });

    it("Should return correct harvester statistics", async function () {
      const stats = await registry.getHarvesterStats(harvester1.address);
      expect(stats.optimizationCount).to.equal(2);
      expect(stats.totalSpaceSaved).to.equal(3000);
    });

    it("Should track unique harvesters", async function () {
      const uniqueCount = await registry.getUniqueHarvestersCount();
      expect(uniqueCount).to.equal(2);
    });

    it("Should return biome-specific statistics", async function () {
      const biomeStats = await registry.getBiomeStats("e-commerce");
      expect(biomeStats.count).to.equal(1);
      expect(biomeStats.totalSpace).to.equal(1000);
    });
  });

  describe("Admin Functions", function () {
    it("Should allow owner to pause registrations", async function () {
      await registry.pause();
      
      await expect(
        registry.connect(harvester1).registerOptimization(
          "https://example.com",
          1024,
          ethers.id("proof"),
          "blog",
          ""
        )
      ).to.be.revertedWith("Pausable: paused");
    });

    it("Should allow owner to unpause registrations", async function () {
      await registry.pause();
      await registry.unpause();

      await expect(
        registry.connect(harvester1).registerOptimization(
          "https://example.com",
          1024,
          ethers.id("proof"),
          "blog",
          ""
        )
      ).to.not.be.reverted;
    });

    it("Should not allow non-owner to pause", async function () {
      await expect(
        registry.connect(harvester1).pause()
      ).to.be.reverted;
    });

    it("Should allow owner to update optimization status", async function () {
      const proofHash = ethers.id("proof-1");
      
      await registry.connect(harvester1).registerOptimization(
        "https://example.com",
        1024,
        proofHash,
        "blog",
        ""
      );

      await registry.updateOptimizationStatus(proofHash, 2); // 2 = Verified

      const optimization = await registry.getOptimization(proofHash);
      expect(optimization.status).to.equal(2);
    });
  });

  describe("Events", function () {
    it("Should emit OptimizationRegistered event with correct parameters", async function () {
      const url = "https://example.com";
      const spaceBytes = 1024;
      const proofHash = ethers.id("proof");
      const biomeType = "blog";

      await expect(
        registry.connect(harvester1).registerOptimization(
          url,
          spaceBytes,
          proofHash,
          biomeType,
          "metadata"
        )
      )
        .to.emit(registry, "OptimizationRegistered")
        .withArgs(proofHash, harvester1.address, url, spaceBytes, biomeType);
    });

    it("Should emit StatusUpdated event when status changes", async function () {
      const proofHash = ethers.id("proof");
      
      await registry.connect(harvester1).registerOptimization(
        "https://example.com",
        1024,
        proofHash,
        "blog",
        ""
      );

      await expect(registry.updateOptimizationStatus(proofHash, 2))
        .to.emit(registry, "StatusUpdated")
        .withArgs(proofHash, 2);
    });
  });

  describe("Query Functions", function () {
    beforeEach(async function () {
      // Setup test data
      for (let i = 0; i < 5; i++) {
        await registry.connect(harvester1).registerOptimization(
          `https://site${i}.com`,
          1000 * (i + 1),
          ethers.id(`proof-${i}`),
          "blog",
          ""
        );
      }
    });

    it("Should return recent optimizations", async function () {
      const recent = await registry.getRecentOptimizations(3);
      expect(recent.length).to.equal(3);
    });

    it("Should return optimizations in reverse chronological order", async function () {
      const recent = await registry.getRecentOptimizations(5);
      
      // Verify the last registered is first in the array
      const lastProof = ethers.id("proof-4");
      expect(recent[0]).to.equal(lastProof);
    });

    it("Should handle limit greater than total optimizations", async function () {
      const recent = await registry.getRecentOptimizations(10);
      expect(recent.length).to.equal(5);
    });
  });
});
