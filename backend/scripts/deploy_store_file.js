const hre = require("hardhat");
const path = require('path');
const fs = require('fs');

async function main() {

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

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
