import Web3 from 'web3'
import StoreFile from '../contracts/contracts/StoreFile.sol/StoreFile.json'
import StoreUser from '../contracts/contracts/StoreUser.sol/StoreUser.json'
import StoreFile_ContractAddress from '../contracts/StoreFile_ContractAddress.json'
import StoreUser_ContractAddress from '../contracts/StoreUser_ContractAddress.json'
import FileManagerFacade from './FileManagerFacade'

import React, { createContext, useContext, useCallback, useRef } from 'react';


const Web3Context= createContext();

export const useWeb3 = () => {
    const context = useContext(Web3Context);
    if(!context){
        throw new Error('useWeb3 must be used within a Web3Provider');
    }
    return context;
}

const Web3Provider = ({children}) => {

    let selectedAccount = useRef();     // Keeps track of wallet account change
    let storeFileContract = useRef();   // keeps the File Contract so its functions can be executed
    let storeUserContract = useRef();   // keeps the User Contract so its functions can be executed
    let provider = useRef();
    let fileManagerFacadeInstance = useRef(null);

    // Starts the app: contracts and metamask connection 
    const setup = useCallback(async () => {
        try {
            // Link to my Ethereum node - a "gateway" to the rest of the network 
            provider.current = window.ethereum; 

            // MetaMask is not installed
            if(typeof provider.current === 'undefined'){ 
                return "MetaMask not intsalled";
            }

            // Ask the user to connect is wallet to the website
            const accounts = await provider.current.request({ method: 'eth_requestAccounts' });

            selectedAccount.current = accounts[0];
            console.log(`Selected account is ${selectedAccount.current}`);

            // Initialize contracts
            const web3 = new Web3(provider.current) // now web3 instance can be used to make calls, transactions and much more 
            contractInitialization(StoreUser, StoreUser_ContractAddress, storeUserContract, web3);
            contractInitialization(StoreFile, StoreFile_ContractAddress, storeFileContract, web3);
            console.log("Contracts initialized");

            fileManagerFacadeInstance.current = new FileManagerFacade(storeFileContract.current, storeUserContract.current);
            fileManagerFacadeInstance.current._selectedAccount = selectedAccount;
        } catch (error) {
            return "Something went wrong while trying to authenticate the user. Make sure you're connected to metamask extension or ensure the contracts are deployed in the network you're in.";
        }
    }, []);

    // Initialize contracts
    const contractInitialization = (contract, contractAddress, contractVar, web3) => {
        contractVar.current = new web3.eth.Contract(
            contract.abi, 
            contractAddress.address
        );
    }

    // Keeps on listening if the account has changed
    window.ethereum.on('accountsChanged', function (accounts){
        selectedAccount.current = accounts[0];
        console.log(`Selected account changed to ${selectedAccount.current}`);
        logOut();
    });

    // Logs Out the user - clean variables
    const logOut = () => {
        provider = null;
        fileManagerFacadeInstance.current = null;
        storeFileContract = null;
        storeUserContract = null;
        selectedAccount = null;
        window.location.href = '/'; // Redirects the user to the login page
        return true
    }

    const value = {
        setup,
        logOut,
        fileManagerFacadeInstance,
    }

    return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>
}

export default Web3Provider;