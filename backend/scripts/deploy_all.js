// deploy_all.js
const hre = require("hardhat");
const path = require('path');
const fs = require('fs');

async function main() {
    async function deployContract(contractName, args = []) {

        const contractFactory = await hre.ethers.getContractFactory(contractName);
        const contract = await contractFactory.deploy(...args);
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

    async function addAdressToFile(contractAddress, fileName) {
        const contractData = {address: contractAddress};
        const filePath = path.join(__dirname, `../../client/src/contracts/${fileName}_ContractAddress.json`);
        fs.writeFileSync(filePath, JSON.stringify(contractData, null, 2));
        console.log(`${fileName} deployed to ${contractAddress}`);
    }

    // Deploys contracts
    const helperContractAddress = await deployContract("Helper"); 
    const accessControlContractAddress = await deployContract("AccessControl", [helperContractAddress]);

    // Gets the deployed AccessControl contract
    const accessControlContract = await hre.ethers.getContractAt("AccessControl", accessControlContractAddress);
    // Get the address of the contracts deployed by the AccessControl
    const auditLogControlContractAddress = await accessControlContract.getAuditLogControlAddress();
    const fileRegisterContractAddress = await accessControlContract.getFileRegisterAddress();
    const userRegisterContractAddress = await accessControlContract.getUserRegisterAddress();
    addAdressToFile(auditLogControlContractAddress, "AuditLogControl");
    addAdressToFile(fileRegisterContractAddress, "FileRegister");
    addAdressToFile(userRegisterContractAddress, "UserRegister");

    const fileRegisterContract = await hre.ethers.getContractAt("FileRegister", fileRegisterContractAddress);
    // Sets the needed variables for each contract
    await fileRegisterContract.setAccessControlAddress(accessControlContractAddress);        // sets the address of the access contract
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
