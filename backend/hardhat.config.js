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
  },
  gasReporter: {
    currency: 'EUR', // currency which gas costs are reported
    gasPrice: 27,    // gas price to be used for calculating gas costs - adjust according to the fas price in the network
    enabled: true,
    coinmarketcap: "5be6b9cc-2d28-4889-8d4a-c1c90ad0cca3",
    // --- To create a report file uncomment these lines bellow ---
    //outputFile: 'gar-report.txt', // gar report file name
    //noColors: true,
  },
};
