import React from 'react'; 

import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import WalletConnection from "./components/WalletConnection";
import Home from "./components/Home";
import Register from "./components/Register";
import Web3Provider from "./helpers/web3Client"
import nearsoftLogo from './imgs/nearsoftLogo.png';
import Login from './components/Login';


function App() {
  return (
    <div id="App">
      <Router>
        <img className='nearsoftLogo' src={nearsoftLogo} alt='Logo'/>
        <Web3Provider>
          <Routes>
            <Route path="/" element={<WalletConnection/>}/>
            <Route path="/home" element={<Home/>}/>
            <Route path="/register" element={<Register/>}/>
            <Route path="/login" element={<Login/>}/>
          </Routes>
        </Web3Provider>
      </Router>
    </div>
  );
}

export default App;
