import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from "./components/Login";
import Home from "./components/Home";
import Welcome from "./components/Welcome";
import Web3Provider from "./helpers/web3Client"


function App() {
  return (
    <div id="App">
      <Router>
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
