import { expect } from "chai";
import { ethers } from "hardhat";
import { LightDomToken } from "../../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("LightDomToken", function () {
  let token: LightDomToken;
  let owner: SignerWithAddress;
  let addr1: SignerWithAddress;
  let addr2: SignerWithAddress;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    const LightDomToken = await ethers.getContractFactory("LightDomToken");
    token = await LightDomToken.deploy();
    await token.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await token.owner()).to.equal(owner.address);
    });

    it("Should have correct name and symbol", async function () {
      expect(await token.name()).to.equal("LightDom");
      expect(await token.symbol()).to.equal("LDM");
    });

    it("Should have correct decimals", async function () {
      expect(await token.decimals()).to.equal(18);
    });
  });

  describe("Minting", function () {
    it("Should allow owner to mint tokens", async function () {
      const mintAmount = ethers.parseEther("100");
      await token.mint(addr1.address, mintAmount);
      expect(await token.balanceOf(addr1.address)).to.equal(mintAmount);
    });

    it("Should not allow non-owner to mint tokens", async function () {
      const mintAmount = ethers.parseEther("100");
      await expect(
        token.connect(addr1).mint(addr2.address, mintAmount)
      ).to.be.reverted;
    });

    it("Should update total supply when minting", async function () {
      const initialSupply = await token.totalSupply();
      const mintAmount = ethers.parseEther("100");
      await token.mint(addr1.address, mintAmount);
      expect(await token.totalSupply()).to.equal(initialSupply + mintAmount);
    });
  });

  describe("Transfers", function () {
    beforeEach(async function () {
      await token.mint(addr1.address, ethers.parseEther("100"));
    });

    it("Should transfer tokens between accounts", async function () {
      const transferAmount = ethers.parseEther("50");
      await token.connect(addr1).transfer(addr2.address, transferAmount);
      expect(await token.balanceOf(addr2.address)).to.equal(transferAmount);
      expect(await token.balanceOf(addr1.address)).to.equal(
        ethers.parseEther("50")
      );
    });

    it("Should fail if sender doesn't have enough tokens", async function () {
      const initialBalance = await token.balanceOf(addr1.address);
      await expect(
        token.connect(addr1).transfer(addr2.address, initialBalance + BigInt(1))
      ).to.be.reverted;
    });

    it("Should emit Transfer event", async function () {
      const transferAmount = ethers.parseEther("50");
      await expect(token.connect(addr1).transfer(addr2.address, transferAmount))
        .to.emit(token, "Transfer")
        .withArgs(addr1.address, addr2.address, transferAmount);
    });
  });

  describe("Allowances", function () {
    beforeEach(async function () {
      await token.mint(owner.address, ethers.parseEther("1000"));
    });

    it("Should approve tokens for delegate spending", async function () {
      const approveAmount = ethers.parseEther("100");
      await token.approve(addr1.address, approveAmount);
      expect(await token.allowance(owner.address, addr1.address)).to.equal(
        approveAmount
      );
    });

    it("Should allow transferFrom with sufficient allowance", async function () {
      const approveAmount = ethers.parseEther("100");
      const transferAmount = ethers.parseEther("50");
      
      await token.approve(addr1.address, approveAmount);
      await token.connect(addr1).transferFrom(
        owner.address,
        addr2.address,
        transferAmount
      );
      
      expect(await token.balanceOf(addr2.address)).to.equal(transferAmount);
      expect(await token.allowance(owner.address, addr1.address)).to.equal(
        approveAmount - transferAmount
      );
    });

    it("Should fail transferFrom with insufficient allowance", async function () {
      const approveAmount = ethers.parseEther("50");
      const transferAmount = ethers.parseEther("100");
      
      await token.approve(addr1.address, approveAmount);
      await expect(
        token.connect(addr1).transferFrom(
          owner.address,
          addr2.address,
          transferAmount
        )
      ).to.be.reverted;
    });
  });

  describe("Burning", function () {
    beforeEach(async function () {
      await token.mint(addr1.address, ethers.parseEther("100"));
    });

    it("Should allow users to burn their own tokens", async function () {
      const burnAmount = ethers.parseEther("50");
      const initialBalance = await token.balanceOf(addr1.address);
      
      await token.connect(addr1).burn(burnAmount);
      
      expect(await token.balanceOf(addr1.address)).to.equal(
        initialBalance - burnAmount
      );
    });

    it("Should decrease total supply when burning", async function () {
      const burnAmount = ethers.parseEther("50");
      const initialSupply = await token.totalSupply();
      
      await token.connect(addr1).burn(burnAmount);
      
      expect(await token.totalSupply()).to.equal(initialSupply - burnAmount);
    });
  });
});
