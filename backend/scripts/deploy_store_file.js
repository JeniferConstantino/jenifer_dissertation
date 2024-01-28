const hre = require("hardhat");

async function main() {

  const storeFile = await hre.ethers.deployContract("StoreFile");

  await storeFile.waitForDeployment();

  console.log(
    `Deployed to ${storeFile.target}`
  );


}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
