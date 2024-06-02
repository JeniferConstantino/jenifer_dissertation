# 🏃‍♀️Run

## 👉 Prerequisites

1. Make sure you have **hardhat** installed. If not: 
    
    cd backend < "npm install --save-dev hardhat"

2. Make sure you have the **MetaMask** extension on your browser. If not: https://metamask.io/download/

3. For **Eth-Gas-Reporter** to run correctly:

   Install: npm install –save-dev eth-gas-reporter;

   Ensure hardhat.config.js has a 'gar-reporter' configuration.

   It is necesary to create an account in: 
   https://pro.coinmarketcap.com/account/ and get the API key 

   Create a .env file and past: COINMARKETCAP_API_KEY="{your_api_key}" 

4. Make sure you have **Slither** installed

    Install Python

    Install pip2: python -m ensurepip --default-pip

    pip3 install slither-analyzer (slither —helps to ensure good installation)

    On the package.json added “scripts”<”slither”

    Executed solc-slect install 0.8.0 < solc-select use 0.8.0 < npm run slither 

## 👉 Run program

1. Run **IPFS** node.

   If you are using IPFS Desktop, you just need to have the app openned.

2. Run **back-end**

   cd backend < npx hardhat compile < npx hardhat node;
   
   in a seperate powershell: npx hardhat run scripts/deploy_all.js --network localhost

3. Run **front-end**

   cd client < npm run start

4. Configure **MetaMask**

   Add network < Add network manually < Network name: {insertName}, New RPC URL: {insert the http of the HardHat blockchain running, 
   the default one is: http://127.0.0.1:8545/}, Chain Id: {default one: 31337}, Currency Symbol: Eth

   Add some addresses, such as: "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80", "0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a",  "0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6"

## 👉 Testing
1. **Eth-Gas-Reporter**

   cd backend < npx hardhat test 

   To generate report uncomment lines in hardhat.config.js. In this report, only transactions are ilustrated, this is, get methods aren't because they don't use gas.

2. **Front-end**

   cd client < npm test 

   cd client < npx jest --coverage => to run with test coverage ( a folder called coverage is created. Open in chrome file: "index.html")

3. **Back-end**

   cd backend < npx hardhat coverage => a folder called "coverage" is generated. Open index.html in browser

## 👉 Security
1. **Front-end**
   
   cd client < npx eslint src/components src/helpers

2. **Back-end**

   cd backend < npm run slither

# ❓Frequent Problems:

## 👉 CORS Problems
If CORS problems are encountered:
1. If you're using IPFS Desktop App:

<img src="images/dockerApp.png" alt="DockerNode" width="600" height="300">


2. If you're using a local IPFS Node:

<img src="images/dockerNode.png" alt="DockerNode" width="400" height="300">