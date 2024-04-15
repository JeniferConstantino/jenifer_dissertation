require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config();

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
    coinmarketcap: process.env.COINMARKETCAP_API_KEY,
    // --- To create a report file uncomment these lines bellow ---
    //outputFile: 'gar-report.txt', // gar report file name
    //noColors: true,
  },
};
