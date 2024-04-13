import Web3 from 'web3'
import AccessControl from '../contracts/contracts/AccessControl.sol/AccessControl.json'
import AuditLogControl from '../contracts/contracts/AuditLogControl.sol/AuditLogControl.json'
import FileRegister from '../contracts/contracts/FileRegister.sol/FileRegister.json'
import UserRegister from '../contracts/contracts/UserRegister.sol/UserRegister.json'
import UserRegister_ContractAddress from '../contracts/UserRegister_ContractAddress.json'
import FileRegister_ContractAddress from '../contracts/FileRegister_ContractAddress.json'
import AccessControl_ContractAddress from '../contracts/AccessControl_ContractAddress.json'
import AuditLogControl_ContractAddress from '../contracts/AuditLogControl_ContractAddress.json'
import FileManagerFacade from './FileManagerFacade.js'
import PropTypes from 'prop-types';

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

    let selectedAccount = useRef(null);     // keeps track of wallet account change
    let fileRegisterContract = useRef();    // keeps the File Register Contract so its functions can be executed
    let userRegisterContract = useRef();    // keeps the User Register Contract so its functions can be executed
    let accessControlContract = useRef();   // keeps the Access Control Contract so its functions can be executed
    let auditLogControlContract = useRef(); // keeps the Audit Log Contract so its functions can be executed
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

            // Initialize contracts
            const web3 = new Web3(provider.current) // now web3 instance can be used to make calls, transactions and much more 
            contractInitialization(UserRegister, UserRegister_ContractAddress, userRegisterContract, web3);
            contractInitialization(FileRegister, FileRegister_ContractAddress, fileRegisterContract, web3);
            contractInitialization(AccessControl, AccessControl_ContractAddress, accessControlContract, web3);
            contractInitialization(AuditLogControl, AuditLogControl_ContractAddress, auditLogControlContract, web3);
            console.log("Contracts initialized");

            fileManagerFacadeInstance.current = new FileManagerFacade(fileRegisterContract.current, userRegisterContract.current, accessControlContract.current, auditLogControlContract.current);
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
        logOut();
    });

    // Initializes the FileManagerFacade with the needed contracts 
    const initializeFileManagerFacadeWContracts = useCallback(async () => {
        try {
            provider.current = window.ethereum; 
            // MetaMask is not installed
            if(typeof provider.current === 'undefined'){ 
                return "MetaMask not intsalled";
            }
            const web3 = new Web3(provider.current) // now web3 instance can be used to make calls, transactions and much more 
            contractInitialization(UserRegister, UserRegister_ContractAddress, userRegisterContract, web3);
            contractInitialization(FileRegister, FileRegister_ContractAddress, fileRegisterContract, web3);
            contractInitialization(AccessControl, AccessControl_ContractAddress, accessControlContract, web3);
            contractInitialization(AuditLogControl, AuditLogControl_ContractAddress, auditLogControlContract, web3);
            fileManagerFacadeInstance.current = new FileManagerFacade(fileRegisterContract.current, userRegisterContract.current, accessControlContract.current, auditLogControlContract.current);
            console.log("Contracts initialized");
        } catch (error) {
            return "Something went wrong while trying to initialize contracts.";
        }
    }, []);

    // Initializes selectedAccount attribute of the FileManagerFacadeInstance
    const setFileManagerFacadeWSelectedAccount = useCallback(async () => {
        try {
            // Ask the user to connect is wallet to the website
            const accounts = await provider.current.request({ method: 'eth_requestAccounts' });

            selectedAccount.current = accounts[0];
            fileManagerFacadeInstance.current._selectedAccount = selectedAccount;
        } catch (error) {
            return "Something went wrong while trying to get the selected account.";
        }
    }, []);

    // Returns the complete FileManagerFacadeInstance
    const setsFileManagerFacadeWSelectedUser = useCallback(async (user) => {
        try {
            fileManagerFacadeInstance.current._selectedUser = user;
        } catch (error) {
            return "Something went wrong while trying to set the selectedUser in the fileManagerFacadeInstance.";
        }
    }, []);

    // Logs Out the user - clean variables
    const logOut = () => {
        provider = null;
        fileManagerFacadeInstance.current = null;
        fileRegisterContract = null;
        userRegisterContract = null;
        accessControlContract = null;
        auditLogControlContract = null;
        selectedAccount = null;
        window.location.href = escape('/'); // Redirects the user to the login page
        return true
    }

    const value = {
        setup,
        logOut,
        setFileManagerFacadeWSelectedAccount,
        initializeFileManagerFacadeWContracts, 
        setsFileManagerFacadeWSelectedUser,
        fileManagerFacadeInstance,
    }

    return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>
}

Web3Provider.propTypes = {
    children: PropTypes.object.isRequired
};

export default Web3Provider;