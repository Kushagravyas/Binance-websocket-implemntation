import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEthereum, faBtc } from '@fortawesome/free-brands-svg-icons';
import { faSyncAlt } from '@fortawesome/free-solid-svg-icons';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import Chart from 'chart.js/auto'; // Assuming you're using Chart.js

const CryptoChart = () => {
  const [selectedPair, setSelectedPair] = useState('ethusdt');
  const [selectedInterval, setSelectedInterval] = useState('1m');
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const socket = new WebSocket(`wss://stream.binance.com:9443/ws/${selectedPair}@kline_${selectedInterval}`);

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      const candlestick = message.k;
      
      // Extract the candlestick data
      const newCandle = {
        time: candlestick.t,
        open: candlestick.o,
        high: candlestick.h,
        low: candlestick.l,
        close: candlestick.c,
      };

      setChartData((prevData) => [...prevData, newCandle]);
      setLoading(false);
    };

    return () => {
      socket.close();
    };
  }, [selectedPair, selectedInterval]);

  const handlePairChange = (e) => {
    setSelectedPair(e.target.value);
    setChartData([]); // Clear chart data when switching pairs
  };

  const handleIntervalChange = (e) => {
    setSelectedInterval(e.target.value);
    setChartData([]); // Clear chart data when switching intervals
  };

  return (
    <div>
      <h1>Cryptocurrency Candlestick Chart</h1>

      {/* Dropdown for selecting cryptocurrency */}
      <label>
        Select Cryptocurrency:
        <select value={selectedPair} onChange={handlePairChange}>
          <option value="ethusdt">
            <FontAwesomeIcon icon={faEthereum} /> ETH/USDT
          </option>
          <option value="bnbusdt">
            <FontAwesomeIcon icon={faBtc} /> BNB/USDT
          </option>
          <option value="dotusdt">DOT/USDT</option>
        </select>
      </label>

      {/* Dropdown for selecting timeframe */}
      <label>
        <AccessTimeIcon /> Select Timeframe:
        <select value={selectedInterval} onChange={handleIntervalChange}>
          <option value="1m">1 Minute</option>
          <option value="3m">3 Minutes</option>
          <option value="5m">5 Minutes</option>
        </select>
      </label>

      {/* Real-time refresh icon */}
      <div>
        <h3>
          Real-time Data <FontAwesomeIcon icon={faSyncAlt} spin />
        </h3>
      </div>

      {/* Chart visualization */}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div>
          {/* Render your candlestick chart here */}
          <canvas id="cryptoChart"></canvas>
        </div>
      )}
    </div>
  );
};

export default CryptoChart;
