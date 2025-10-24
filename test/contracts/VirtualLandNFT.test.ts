import { expect } from "chai";
import { ethers } from "hardhat";
import { VirtualLandNFT } from "../../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("VirtualLandNFT", function () {
  let nft: VirtualLandNFT;
  let owner: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    const VirtualLandNFT = await ethers.getContractFactory("VirtualLandNFT");
    nft = await VirtualLandNFT.deploy();
    await nft.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should deploy successfully", async function () {
      const address = await nft.getAddress();
      expect(address).to.not.equal(ethers.ZeroAddress);
    });

    it("Should have correct name and symbol", async function () {
      expect(await nft.name()).to.equal("LightDom Virtual Land");
      expect(await nft.symbol()).to.equal("LDVL");
    });

    it("Should set the right owner", async function () {
      expect(await nft.owner()).to.equal(owner.address);
    });
  });

  describe("Minting", function () {
    it("Should mint new land parcel", async function () {
      const tokenId = 1;
      const tokenURI = "ipfs://QmTest123";

      await expect(nft.mintLand(user1.address, tokenId, tokenURI))
        .to.emit(nft, "Transfer")
        .withArgs(ethers.ZeroAddress, user1.address, tokenId);
    });

    it("Should set correct token URI", async function () {
      const tokenId = 1;
      const tokenURI = "ipfs://QmTest123";

      await nft.mintLand(user1.address, tokenId, tokenURI);
      expect(await nft.tokenURI(tokenId)).to.equal(tokenURI);
    });

    it("Should increment token counter", async function () {
      await nft.mintLand(user1.address, 1, "ipfs://1");
      await nft.mintLand(user1.address, 2, "ipfs://2");
      await nft.mintLand(user1.address, 3, "ipfs://3");

      expect(await nft.balanceOf(user1.address)).to.equal(3);
    });

    it("Should not allow non-owner to mint", async function () {
      await expect(
        nft.connect(user1).mintLand(user2.address, 1, "ipfs://test")
      ).to.be.reverted;
    });

    it("Should not allow minting duplicate token IDs", async function () {
      await nft.mintLand(user1.address, 1, "ipfs://1");
      
      await expect(
        nft.mintLand(user2.address, 1, "ipfs://2")
      ).to.be.revertedWith("ERC721: token already minted");
    });
  });

  describe("Land Properties", function () {
    beforeEach(async function () {
      await nft.mintLand(user1.address, 1, "ipfs://land1");
    });

    it("Should set land coordinates", async function () {
      await nft.setLandCoordinates(1, 10, 20);
      
      const coords = await nft.getLandCoordinates(1);
      expect(coords.x).to.equal(10);
      expect(coords.y).to.equal(20);
    });

    it("Should set land size", async function () {
      await nft.setLandSize(1, 100);
      expect(await nft.getLandSize(1)).to.equal(100);
    });

    it("Should set land biome", async function () {
      const biome = "Digital Forest";
      await nft.setLandBiome(1, biome);
      expect(await nft.getLandBiome(1)).to.equal(biome);
    });

    it("Should track land optimization score", async function () {
      await nft.setOptimizationScore(1, 850);
      expect(await nft.getOptimizationScore(1)).to.equal(850);
    });

    it("Should only allow owner to set properties", async function () {
      await expect(
        nft.connect(user1).setLandCoordinates(1, 5, 5)
      ).to.be.reverted;

      await expect(
        nft.connect(user1).setLandSize(1, 50)
      ).to.be.reverted;
    });
  });

  describe("Transfers", function () {
    beforeEach(async function () {
      await nft.mintLand(user1.address, 1, "ipfs://land1");
    });

    it("Should transfer land between users", async function () {
      await nft.connect(user1).transferFrom(user1.address, user2.address, 1);
      expect(await nft.ownerOf(1)).to.equal(user2.address);
    });

    it("Should update balances after transfer", async function () {
      await nft.connect(user1).transferFrom(user1.address, user2.address, 1);
      
      expect(await nft.balanceOf(user1.address)).to.equal(0);
      expect(await nft.balanceOf(user2.address)).to.equal(1);
    });

    it("Should emit Transfer event", async function () {
      await expect(
        nft.connect(user1).transferFrom(user1.address, user2.address, 1)
      )
        .to.emit(nft, "Transfer")
        .withArgs(user1.address, user2.address, 1);
    });

    it("Should preserve land properties after transfer", async function () {
      await nft.setLandCoordinates(1, 10, 20);
      await nft.setLandSize(1, 100);
      await nft.setLandBiome(1, "Digital Forest");

      await nft.connect(user1).transferFrom(user1.address, user2.address, 1);

      const coords = await nft.getLandCoordinates(1);
      expect(coords.x).to.equal(10);
      expect(coords.y).to.equal(20);
      expect(await nft.getLandSize(1)).to.equal(100);
      expect(await nft.getLandBiome(1)).to.equal("Digital Forest");
    });
  });

  describe("Approvals", function () {
    beforeEach(async function () {
      await nft.mintLand(user1.address, 1, "ipfs://land1");
    });

    it("Should approve another address to transfer", async function () {
      await nft.connect(user1).approve(user2.address, 1);
      expect(await nft.getApproved(1)).to.equal(user2.address);
    });

    it("Should allow approved address to transfer", async function () {
      await nft.connect(user1).approve(user2.address, 1);
      await nft.connect(user2).transferFrom(user1.address, user2.address, 1);
      
      expect(await nft.ownerOf(1)).to.equal(user2.address);
    });

    it("Should set approval for all tokens", async function () {
      await nft.connect(user1).setApprovalForAll(user2.address, true);
      expect(await nft.isApprovedForAll(user1.address, user2.address)).to.be.true;
    });

    it("Should allow operator to transfer any token", async function () {
      await nft.mintLand(user1.address, 2, "ipfs://land2");
      await nft.connect(user1).setApprovalForAll(user2.address, true);

      await nft.connect(user2).transferFrom(user1.address, user2.address, 1);
      await nft.connect(user2).transferFrom(user1.address, user2.address, 2);

      expect(await nft.ownerOf(1)).to.equal(user2.address);
      expect(await nft.ownerOf(2)).to.equal(user2.address);
    });
  });

  describe("Batch Operations", function () {
    it("Should mint multiple lands in batch", async function () {
      const tokenIds = [1, 2, 3];
      const tokenURIs = [
        "ipfs://land1",
        "ipfs://land2",
        "ipfs://land3"
      ];

      await nft.batchMintLand(user1.address, tokenIds, tokenURIs);

      for (let i = 0; i < tokenIds.length; i++) {
        expect(await nft.ownerOf(tokenIds[i])).to.equal(user1.address);
        expect(await nft.tokenURI(tokenIds[i])).to.equal(tokenURIs[i]);
      }
    });

    it("Should fail if array lengths don't match", async function () {
      const tokenIds = [1, 2, 3];
      const tokenURIs = ["ipfs://land1", "ipfs://land2"]; // Mismatched length

      await expect(
        nft.batchMintLand(user1.address, tokenIds, tokenURIs)
      ).to.be.revertedWith("Array length mismatch");
    });
  });

  describe("Land Merging", function () {
    beforeEach(async function () {
      await nft.mintLand(user1.address, 1, "ipfs://land1");
      await nft.mintLand(user1.address, 2, "ipfs://land2");
      await nft.setLandSize(1, 100);
      await nft.setLandSize(2, 150);
    });

    it("Should merge adjacent lands", async function () {
      await nft.connect(user1).mergeLands(1, 2, 3, "ipfs://merged");

      expect(await nft.ownerOf(3)).to.equal(user1.address);
      expect(await nft.getLandSize(3)).to.equal(250);
    });

    it("Should burn merged lands", async function () {
      await nft.connect(user1).mergeLands(1, 2, 3, "ipfs://merged");

      await expect(nft.ownerOf(1)).to.be.revertedWith("ERC721: invalid token ID");
      await expect(nft.ownerOf(2)).to.be.revertedWith("ERC721: invalid token ID");
    });

    it("Should only allow owner to merge their lands", async function () {
      await expect(
        nft.connect(user2).mergeLands(1, 2, 3, "ipfs://merged")
      ).to.be.revertedWith("Not the owner of both lands");
    });
  });

  describe("Staking", function () {
    beforeEach(async function () {
      await nft.mintLand(user1.address, 1, "ipfs://land1");
    });

    it("Should stake land", async function () {
      await nft.connect(user1).stakeLand(1);
      expect(await nft.isLandStaked(1)).to.be.true;
    });

    it("Should not allow transfer of staked land", async function () {
      await nft.connect(user1).stakeLand(1);
      
      await expect(
        nft.connect(user1).transferFrom(user1.address, user2.address, 1)
      ).to.be.revertedWith("Land is staked");
    });

    it("Should unstake land", async function () {
      await nft.connect(user1).stakeLand(1);
      await nft.connect(user1).unstakeLand(1);
      
      expect(await nft.isLandStaked(1)).to.be.false;
    });

    it("Should allow transfer after unstaking", async function () {
      await nft.connect(user1).stakeLand(1);
      await nft.connect(user1).unstakeLand(1);
      
      await nft.connect(user1).transferFrom(user1.address, user2.address, 1);
      expect(await nft.ownerOf(1)).to.equal(user2.address);
    });

    it("Should track staking time", async function () {
      await nft.connect(user1).stakeLand(1);
      const stakingTime = await nft.getStakingTime(1);
      expect(stakingTime).to.be.gt(0);
    });
  });

  describe("Query Functions", function () {
    beforeEach(async function () {
      await nft.mintLand(user1.address, 1, "ipfs://land1");
      await nft.mintLand(user1.address, 2, "ipfs://land2");
      await nft.mintLand(user2.address, 3, "ipfs://land3");
    });

    it("Should return all tokens owned by address", async function () {
      const tokens = await nft.tokensOfOwner(user1.address);
      expect(tokens.length).to.equal(2);
      expect(tokens).to.include(1n);
      expect(tokens).to.include(2n);
    });

    it("Should return correct total supply", async function () {
      expect(await nft.totalSupply()).to.equal(3);
    });

    it("Should support ERC721 interface", async function () {
      const ERC721InterfaceId = "0x80ac58cd";
      expect(await nft.supportsInterface(ERC721InterfaceId)).to.be.true;
    });
  });

  describe("Land Enhancement", function () {
    beforeEach(async function () {
      await nft.mintLand(user1.address, 1, "ipfs://land1");
    });

    it("Should enhance land with optimization", async function () {
      const currentScore = await nft.getOptimizationScore(1);
      await nft.enhanceLand(1, 100);
      
      const newScore = await nft.getOptimizationScore(1);
      expect(newScore).to.equal(currentScore + 100n);
    });

    it("Should emit LandEnhanced event", async function () {
      await expect(nft.enhanceLand(1, 100))
        .to.emit(nft, "LandEnhanced")
        .withArgs(1, 100);
    });

    it("Should cap optimization score at maximum", async function () {
      await nft.enhanceLand(1, 2000); // Over max
      const score = await nft.getOptimizationScore(1);
      expect(score).to.be.lte(1000);
    });
  });
});
