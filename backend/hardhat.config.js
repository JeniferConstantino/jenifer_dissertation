require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.19",
  paths: {
    artifacts: '../client/src/contracts',
  },
  networks: {
    hardhat: {
      allowUnlimitedContractSize: true, 
      chainId: 31337,
    }
  }
};
