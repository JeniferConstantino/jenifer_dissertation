# 🏃‍♀️Run

## Using Docker

// TODO

## Not using Docker

(Make sure you have hardhat installed. If not: cd backend < "npm install --save-dev hardhat")
1. Run IPFS node 
2. cd backend < npx hardhat compile < npx hardhat node and, in a seperate powershell: npx hardhat run scripts/deploy_all.js --network localhost
3. cd client < npm run start
4. cd backend < npx hardhat test => to run the tests in the backend
5. cd client < npm test => to run the tests in the front end

6. cd backend < npx hardhat coverage => to get the report on the test coverage in the backend

# Frequent Problems:

## CORS Problems
If CORS problems are encountered:
1. If you're using IPFS Desktop App:

![Docker](images/dockerApp.png)

2. If you're using a local IPFS Node:

![DockerNode](images/dockerNode.png)