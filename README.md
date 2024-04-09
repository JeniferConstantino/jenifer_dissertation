# 🏃‍♀️Run

## Using Docker

// TODO

## Not using Docker

(Make sure you have hardhat installed. If not: cd backend < "npm install --save-dev hardhat")
1. Run IPFS node 
2. cd backend < npx hardhat compile < npx hardhat node and, in a seperate powershell: npx hardhat run scripts/deploy_all.js --network localhost
3. cd client < npm run start

# Eth Gas Reporter
cd backend < npx hardhat test

**To be correctly executed:**
1. It was necessary to install: npm install –save-dev eth-gas-reporter and add a configuration in the hardhat.config.js.
    1.1. It is necesary to create an account in: https://pro.coinmarketcap.com/account/ and get the API key 
    1.2. Create a .env file and past: COINMARKETCAP_API_KEY="{your_api_key}" 
2. To **generate report** uncomment lines in hardhat.config.js.

In this report, only transactions are ilustrated, this is, get methods aren't because they don't use gas.

# Test Coverage

## Front-end 
cd client < npm test 
cd client < npx jest --coverage => to run with test coverage ( a folder called coverage is created. Open in chrome file: "index.html")

## Back-end
cd backend < npx hardhat test < npx hardhat coverage => a folder called "coverage" is generated. Open index.html in browser

# Security Analysis

## Front-end

## Back-end
cd backend < npm run slither

**To install slither:**
1. Install Python
2. Install pip2: python -m ensurepip --default-pip
3. pip3 install slither-analyzer (slither —helps to ensure good installation)
4. On the package.json added “scripts”<”slither”
5. Executed solc-slect install 0.8.0 < solc-select use 0.8.0 < npm run slither 

# Frequent Problems:

## CORS Problems
If CORS problems are encountered:
1. If you're using IPFS Desktop App:

![Docker](images/dockerApp.png)

2. If you're using a local IPFS Node:

![DockerNode](images/dockerNode.png)