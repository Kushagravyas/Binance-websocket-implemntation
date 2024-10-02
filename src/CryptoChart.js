

import React, { useEffect, useRef, useState } from 'react';
import { createChart } from 'lightweight-charts';

const CryptoChart = () => {
  const chartContainerRef = useRef();
  const [chart, setChart] = useState(null);
  const [lineSeries, setLineSeries] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [selectedPair, setSelectedPair] = useState('ethusdt');
  const [selectedInterval, setSelectedInterval] = useState('1m');
  const socketRef = useRef(null);

  useEffect(() => {
    
    const chartInstance = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight,
    });

    const lineSeriesInstance = chartInstance.addLineSeries({
      color: 'rgba(75, 192, 192, 1)',
      lineWidth: 2,
    });

    setChart(chartInstance);
    setLineSeries(lineSeriesInstance);

    return () => {
      chartInstance.remove();
    };
  }, []);

  useEffect(() => {
    
    const fetchHistoricalData = async () => {
      try {
        const response = await fetch(
          `https://api.binance.com/api/v3/klines?symbol=${selectedPair.toUpperCase()}&interval=${selectedInterval}&limit=50`
        );
        const data = await response.json();

      
        const historicalCandles = data.map((candle) => ({
          time: Math.floor(candle[0] / 1000), 
          value: parseFloat(candle[4]), 
        }));

        
        historicalCandles.sort((a, b) => a.time - b.time);

        setChartData(historicalCandles); // Set initial historical data
        if (lineSeries) {
          lineSeries.setData(historicalCandles); // Set initial data for the line series
        }
      } catch (error) {
        console.error('Error fetching historical data:', error);
      }
    };

    fetchHistoricalData();
  }, [selectedPair, selectedInterval, lineSeries]);

  useEffect(() => {
    if (socketRef.current) {
      socketRef.current.close(); // Close previous WebSocket connection
    }

    socketRef.current = new WebSocket(
      `wss://stream.binance.com:9443/ws/${selectedPair}@kline_${selectedInterval}`
    );

    socketRef.current.onopen = () => {
      console.log('WebSocket connection opened');
    };

    socketRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('WebSocket data:', data); // Check incoming data

      if (data.k && data.k.x) {
        const newCandle = {
          time: Math.floor(data.k.t / 1000), // timestamp in seconds
          value: parseFloat(data.k.c), // close price
        };

        setChartData((prevData) => {
          const updatedData = [...prevData, newCandle];
          // Sort data by time in ascending order
          updatedData.sort((a, b) => a.time - b.time);
          // Keep only the last 50 data points
          return updatedData.length > 50 ? updatedData.slice(updatedData.length - 50) : updatedData;
        });
      }
    };

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [selectedPair, selectedInterval]);

  const handlePairChange = (e) => {
    setSelectedPair(e.target.value);
  };

  const handleIntervalChange = (e) => {
    setSelectedInterval(e.target.value);
  };

  useEffect(() => {
    if (lineSeries) {
      // Ensure chart data is sorted before setting it
      const sortedData = [...chartData].sort((a, b) => a.time - b.time);
      
      // Log the sorted data for debugging
      console.log('Current chart data for the line series:', sortedData);
      
      lineSeries.setData(sortedData);
    }
  }, [chartData, lineSeries]);

  return (
    <div className='first' >
      <div className='select-label'>

      <label>
        Select Cryptocurrency:
        <select value={selectedPair} onChange={handlePairChange}>
          <option value="ethusdt">ETH/USDT</option>
          <option value="bnbusdt">BNB/USDT</option>
          <option value="dotusdt">DOT/USDT</option>
        </select>
      </label>

      <label>
        Select Timeframe:
        <select value={selectedInterval} onChange={handleIntervalChange}>
          <option value="1m">1 Minute</option>
          <option value="3m">3 Minutes</option>
          <option value="5m">5 Minutes</option>
        </select>
      </label>

      </div>
      <div className='main'>
        <div
          className='chart-container'
          ref={chartContainerRef}
          style={{ position: 'relative', width: '100%', height: '400px' }}
        />
      </div>
    </div>
  );
};

export default CryptoChart;
