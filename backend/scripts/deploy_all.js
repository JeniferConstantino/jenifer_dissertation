// deploy_all.js
const hre = require("hardhat");
const path = require('path');
const fs = require('fs');

async function main() {
    async function deployContract(contractName) {
        const contract = await hre.ethers.deployContract(contractName);
    
        await contract.waitForDeployment();
    
        const contractAddress = contract.target;
    
        const contractData = {
            address: contractAddress
        }
    
        // Create a file to store the contract address (hardhat doesn't provide for the frontend)
        const filePath = path.join(__dirname, `../../client/src/contracts/${contractName}_ContractAddress.json`);
        fs.writeFileSync(filePath, JSON.stringify(contractData, null, 2));
    
        console.log(
            `${contractName} deployed to ${contractAddress}`
        );

        return contractAddress;
    }

    async function deployFileManager(fileManagerAddress) {
        const accessManagerContractFactory = await hre.ethers.getContractFactory("FileManager");
        const accessManagerContract = await accessManagerContractFactory.deploy(fileManagerAddress);
    
        await accessManagerContract.waitForDeployment();
    
        const contractData = {
            address: accessManagerContract.target
        }
    
        const filePath = path.join(__dirname, `../../client/src/contracts/FileManager_ContractAddress.json`);
        fs.writeFileSync(filePath, JSON.stringify(contractData, null, 2));
    
        console.log(
            `AccessManager deployed to ${accessManagerContract.target}`
        );
    }

    const accessManagerContractAddress = await deployContract("AccessManager");
    await deployContract("UserManager"); 
    await deployFileManager(accessManagerContractAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
