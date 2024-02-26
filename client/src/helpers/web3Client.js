import Web3 from 'web3'
import AccessControl from '../contracts/contracts/AccessControl.sol/AccessControl.json'
import FileRegister from '../contracts/contracts/FileRegister.sol/FileRegister.json'
import UserRegister from '../contracts/contracts/UserRegister.sol/UserRegister.json'
import UserRegister_ContractAddress from '../contracts/UserRegister_ContractAddress.json'
import FileRegister_ContractAddress from '../contracts/FileRegister_ContractAddress.json'
import AccessControl_ContractAddress from '../contracts/AccessControl_ContractAddress.json'
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

    let selectedAccount = useRef();         // keeps track of wallet account change
    let fileRegisterContract = useRef();    // keeps the File Register Contract so its functions can be executed
    let userRegisterContract = useRef();    // keeps the User Register Contract so its functions can be executed
    let accessControlContract = useRef();   // keeps the Access Control Contract so its functions can be executed
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
            contractInitialization(UserRegister, UserRegister_ContractAddress, userRegisterContract, web3);
            contractInitialization(FileRegister, FileRegister_ContractAddress, fileRegisterContract, web3);
            contractInitialization(AccessControl, AccessControl_ContractAddress, accessControlContract, web3);
            console.log("Contracts initialized");

            fileManagerFacadeInstance.current = new FileManagerFacade(fileRegisterContract.current, userRegisterContract.current, accessControlContract.current);
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
        fileRegisterContract = null;
        userRegisterContract = null;
        accessControlContract = null;
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