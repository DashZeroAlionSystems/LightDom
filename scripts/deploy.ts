import { ethers } from 'hardhat';

async function main() {
  const Token = await ethers.getContractFactory('DOMSpaceToken');
  const token = await Token.deploy();
  await token.waitForDeployment();
  const address = await token.getAddress();
  console.log('DSH deployed:', address);

  const Registry = await ethers.getContractFactory('OptimizationRegistry');
  const registry = await Registry.deploy();
  await registry.waitForDeployment();
  const regAddr = await registry.getAddress();
  console.log('Registry deployed:', regAddr);
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
