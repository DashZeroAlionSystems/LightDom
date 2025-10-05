const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // Deploy StorageToken
  console.log("\nDeploying StorageToken...");
  const StorageToken = await ethers.getContractFactory("StorageToken");
  const storageToken = await StorageToken.deploy();
  await storageToken.deployed();
  console.log("StorageToken deployed to:", storageToken.address);

  // Deploy StorageContract
  console.log("\nDeploying StorageContract...");
  const StorageContract = await ethers.getContractFactory("StorageContract");
  const storageContract = await StorageContract.deploy(storageToken.address);
  await storageContract.deployed();
  console.log("StorageContract deployed to:", storageContract.address);

  // Deploy StorageGovernance
  console.log("\nDeploying StorageGovernance...");
  const StorageGovernance = await ethers.getContractFactory("StorageGovernance");
  const storageGovernance = await StorageGovernance.deploy(storageToken.address);
  await storageGovernance.deployed();
  console.log("StorageGovernance deployed to:", storageGovernance.address);

  // Transfer ownership of StorageToken to StorageGovernance
  console.log("\nTransferring StorageToken ownership to StorageGovernance...");
  await storageToken.transferOwnership(storageGovernance.address);
  console.log("Ownership transferred successfully");

  // Deploy DataEncryption contract
  console.log("\nDeploying DataEncryption...");
  const DataEncryption = await ethers.getContractFactory("DataEncryption");
  const dataEncryption = await DataEncryption.deploy();
  await dataEncryption.deployed();
  console.log("DataEncryption deployed to:", dataEncryption.address);

  // Deploy HostManager contract
  console.log("\nDeploying HostManager...");
  const HostManager = await ethers.getContractFactory("HostManager");
  const hostManager = await HostManager.deploy(storageContract.address, storageToken.address);
  await hostManager.deployed();
  console.log("HostManager deployed to:", hostManager.address);

  // Deploy FileManager contract
  console.log("\nDeploying FileManager...");
  const FileManager = await ethers.getContractFactory("FileManager");
  const fileManager = await FileManager.deploy(storageContract.address, dataEncryption.address);
  await fileManager.deployed();
  console.log("FileManager deployed to:", fileManager.address);

  console.log("\n=== Deployment Summary ===");
  console.log("StorageToken:", storageToken.address);
  console.log("StorageContract:", storageContract.address);
  console.log("StorageGovernance:", storageGovernance.address);
  console.log("DataEncryption:", dataEncryption.address);
  console.log("HostManager:", hostManager.address);
  console.log("FileManager:", fileManager.address);

  // Save deployment addresses
  const deploymentInfo = {
    network: hre.network.name,
    timestamp: new Date().toISOString(),
    contracts: {
      StorageToken: storageToken.address,
      StorageContract: storageContract.address,
      StorageGovernance: storageGovernance.address,
      DataEncryption: dataEncryption.address,
      HostManager: hostManager.address,
      FileManager: fileManager.address,
    },
    deployer: deployer.address,
  };

  const fs = require("fs");
  const path = require("path");
  const deploymentsDir = path.join(__dirname, "..", "deployments");
  
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }
  
  const deploymentFile = path.join(deploymentsDir, `${hre.network.name}.json`);
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
  
  console.log(`\nDeployment info saved to: ${deploymentFile}`);
  
  // Verify contracts on Etherscan (if not localhost)
  if (hre.network.name !== "localhost" && hre.network.name !== "hardhat") {
    console.log("\nWaiting for block confirmations...");
    await storageToken.deployTransaction.wait(6);
    await storageContract.deployTransaction.wait(6);
    await storageGovernance.deployTransaction.wait(6);
    await dataEncryption.deployTransaction.wait(6);
    await hostManager.deployTransaction.wait(6);
    await fileManager.deployTransaction.wait(6);

    console.log("\nVerifying contracts on Etherscan...");
    try {
      await hre.run("verify:verify", {
        address: storageToken.address,
        constructorArguments: [],
      });
      console.log("StorageToken verified");
    } catch (error) {
      console.log("StorageToken verification failed:", error.message);
    }

    try {
      await hre.run("verify:verify", {
        address: storageContract.address,
        constructorArguments: [storageToken.address],
      });
      console.log("StorageContract verified");
    } catch (error) {
      console.log("StorageContract verification failed:", error.message);
    }

    try {
      await hre.run("verify:verify", {
        address: storageGovernance.address,
        constructorArguments: [storageToken.address],
      });
      console.log("StorageGovernance verified");
    } catch (error) {
      console.log("StorageGovernance verification failed:", error.message);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
