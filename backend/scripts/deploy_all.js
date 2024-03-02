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

    const helperContractAddress = await deployContract("Helper"); 
    const userRegisterContractAddress = await deployContract("UserRegister", [helperContractAddress]); 
    const fileRegisterContractAddress = await deployContract("FileRegister", [helperContractAddress]);
    const accessControlContractAddress = await deployContract("AccessControl", [fileRegisterContractAddress, userRegisterContractAddress, helperContractAddress]);

    const accessControlContract = await hre.ethers.getContractAt("AccessControl", accessControlContractAddress);
    const auditLogControlContractAddress = await accessControlContract.getAuditLogControlAddress();
    const contractData = {
        address: auditLogControlContractAddress
    }
    const filePath = path.join(__dirname, `../../client/src/contracts/AuditLogControl_ContractAddress.json`);
    fs.writeFileSync(filePath, JSON.stringify(contractData, null, 2));
    console.log(
        `AuditLogControl deployed to ${auditLogControlContractAddress}`
    );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
