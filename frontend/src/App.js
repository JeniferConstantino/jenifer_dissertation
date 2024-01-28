import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Web3Provider from "./helpers/web3Client"

function App() {
  return (
    <div id="App">
      <Router>
        <Web3Provider>
            <Routes>
              
            </Routes>
          </Web3Provider>
      </Router>
    </div>
  );
}

export default App;
