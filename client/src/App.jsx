import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from "./components/Login";
import Home from "./components/Home";
import Welcome from "./components/Welcome";
import Web3Provider from "./helpers/web3Client"
import nearsoftLogo from './imgs/nearsoftLogo.png';


function App() {
  return (
    <div id="App">
      <Router>
        <img className='nearsoftLogo' src={nearsoftLogo} alt='Logo'/>
        <Web3Provider>
          <Routes>
            <Route path="/" element={<Login/>}/>
            <Route path="/home" element={<Home/>}/>
            <Route path="/welcome" element={<Welcome/>}/>
          </Routes>
        </Web3Provider>
      </Router>
    </div>
  );
}

export default App;
