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
    }

    await deployContract("StoreFile");
    await deployContract("StoreUser"); 
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
