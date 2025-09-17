import { expect } from 'chai';
import { ethers } from 'hardhat';
import { describe, it, before, after } from 'vitest';

describe('DOMSpaceToken', function () {
  let token;
  let owner;
  let addr1, addr2, addrs;

  beforeEach(async function () {
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

    const DOMSpaceToken = await ethers.getContractFactory('DOMSpaceToken');
    token = await DOMSpaceToken.deploy();
    await token.waitForDeployment();
  });

  describe('Deployment', function () {
    it('Should set the right name and symbol', async function () {
      expect(await token.name()).to.equal('DOM Space Harvester');
      expect(await token.symbol()).to.equal('DSH');
    });

    it('Should set the right decimals', async function () {
      expect(await token.decimals()).to.equal(18);
    });

    it('Should set the right total supply', async function () {
      const totalSupply = await token.totalSupply();
      expect(totalSupply).to.equal(ethers.parseEther('1000000000')); // 1B tokens
    });

    it('Should assign the total supply to the owner', async function () {
      const ownerBalance = await token.balanceOf(owner.address);
      expect(await token.totalSupply()).to.equal(ownerBalance);
    });
  });

  describe('Minting', function () {
    it('Should allow owner to mint tokens', async function () {
      const mintAmount = ethers.parseEther('1000');

      await expect(token.mint(addr1.address, mintAmount))
        .to.emit(token, 'Transfer')
        .withArgs(ethers.ZeroAddress, addr1.address, mintAmount);

      expect(await token.balanceOf(addr1.address)).to.equal(mintAmount);
    });

    it('Should reject minting by non-owner', async function () {
      const mintAmount = ethers.parseEther('1000');

      await expect(token.connect(addr1).mint(addr2.address, mintAmount)).to.be.revertedWith(
        'Ownable: caller is not the owner'
      );
    });

    it('Should update total supply on minting', async function () {
      const mintAmount = ethers.parseEther('1000');
      const initialSupply = await token.totalSupply();

      await token.mint(addr1.address, mintAmount);

      expect(await token.totalSupply()).to.equal(initialSupply + mintAmount);
    });
  });

  describe('Transfers', function () {
    beforeEach(async function () {
      const transferAmount = ethers.parseEther('1000');
      await token.transfer(addr1.address, transferAmount);
    });

    it('Should transfer tokens between accounts', async function () {
      const transferAmount = ethers.parseEther('100');

      await expect(token.connect(addr1).transfer(addr2.address, transferAmount))
        .to.emit(token, 'Transfer')
        .withArgs(addr1.address, addr2.address, transferAmount);

      expect(await token.balanceOf(addr2.address)).to.equal(transferAmount);
    });

    it("Should fail if sender doesn't have enough tokens", async function () {
      const transferAmount = ethers.parseEther('10000');

      await expect(token.connect(addr1).transfer(addr2.address, transferAmount)).to.be.revertedWith(
        'ERC20: transfer amount exceeds balance'
      );
    });

    it('Should update balances after transfers', async function () {
      const transferAmount = ethers.parseEther('100');
      const addr1Balance = await token.balanceOf(addr1.address);
      const addr2Balance = await token.balanceOf(addr2.address);

      await token.connect(addr1).transfer(addr2.address, transferAmount);

      expect(await token.balanceOf(addr1.address)).to.equal(addr1Balance - transferAmount);
      expect(await token.balanceOf(addr2.address)).to.equal(addr2Balance + transferAmount);
    });
  });

  describe('Approvals', function () {
    it('Should allow spender to spend tokens', async function () {
      const approveAmount = ethers.parseEther('100');

      await expect(token.approve(addr1.address, approveAmount))
        .to.emit(token, 'Approval')
        .withArgs(owner.address, addr1.address, approveAmount);

      expect(await token.allowance(owner.address, addr1.address)).to.equal(approveAmount);
    });

    it('Should allow approved spender to transfer tokens', async function () {
      const approveAmount = ethers.parseEther('100');
      const transferAmount = ethers.parseEther('50');

      await token.approve(addr1.address, approveAmount);

      await expect(token.connect(addr1).transferFrom(owner.address, addr2.address, transferAmount))
        .to.emit(token, 'Transfer')
        .withArgs(owner.address, addr2.address, transferAmount);

      expect(await token.balanceOf(addr2.address)).to.equal(transferAmount);
      expect(await token.allowance(owner.address, addr1.address)).to.equal(
        approveAmount - transferAmount
      );
    });

    it("Should fail if spender doesn't have enough allowance", async function () {
      const approveAmount = ethers.parseEther('50');
      const transferAmount = ethers.parseEther('100');

      await token.approve(addr1.address, approveAmount);

      await expect(
        token.connect(addr1).transferFrom(owner.address, addr2.address, transferAmount)
      ).to.be.revertedWith('ERC20: insufficient allowance');
    });
  });

  describe('Burn', function () {
    it('Should allow burning tokens', async function () {
      const burnAmount = ethers.parseEther('1000');
      const initialBalance = await token.balanceOf(owner.address);

      await expect(token.burn(burnAmount))
        .to.emit(token, 'Transfer')
        .withArgs(owner.address, ethers.ZeroAddress, burnAmount);

      expect(await token.balanceOf(owner.address)).to.equal(initialBalance - burnAmount);
    });

    it('Should update total supply on burning', async function () {
      const burnAmount = ethers.parseEther('1000');
      const initialSupply = await token.totalSupply();

      await token.burn(burnAmount);

      expect(await token.totalSupply()).to.equal(initialSupply - burnAmount);
    });
  });
});
