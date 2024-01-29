const hre = require("hardhat");
const path = require('path');
const fs = require('fs');

async function main() {

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

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
