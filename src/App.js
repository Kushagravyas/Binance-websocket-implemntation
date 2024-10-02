import React from 'react';
import LiveChart from './CryptoChart';
import './App.css';

const App = () => {
  return (
    <div>
      <h1 className='h1'>Binance Market Data WebSocket Implementation</h1>
      <LiveChart />
    </div>
  );
};

export default App;
