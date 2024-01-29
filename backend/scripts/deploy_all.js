// deploy_all.js
const hre = require("hardhat");
const path = require('path');
const fs = require('fs');

async function deployContractStoreUser() {
    const storeUser = await hre.ethers.deployContract("StoreUser");

    await storeUser.waitForDeployment();

    const contractAddress = storeUser.target;

    const contractData = {
        address: contractAddress
    }

    // Create a file to store the contract address
    const filePath = path.join(__dirname, `../../client/src/contracts/StoreUser_ContractAddress.json`);
    fs.writeFileSync(filePath, JSON.stringify(contractData, null, 2));

    console.log(
        `StoreUser deployed to ${contractAddress}`
    );
}

async function deployContractStoreFile() {
    const storeFile = await hre.ethers.deployContract("StoreFile");

    await storeFile.waitForDeployment();

    const contractAddress = storeFile.target;

    const contractData = {
        address: contractAddress
    }

    // Create a file to store the contract address
    const filePath = path.join(__dirname, `../../client/src/contracts/StoreFile_ContractAddress.json`);
    fs.writeFileSync(filePath, JSON.stringify(contractData, null, 2));

    console.log(
        `StoreFile deployed to ${contractAddress}`
    );
}


async function main() {
    await deployContractStoreUser();
    await deployContractStoreFile();    
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
