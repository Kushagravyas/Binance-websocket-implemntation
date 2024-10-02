import React, { useEffect, useState, useRef } from 'react';
import { Chart } from 'react-chartjs-2';
import 'chartjs-adapter-moment';
import {
    CategoryScale, TimeScale, LinearScale, BarElement, Chart as ChartJS
} from 'chart.js';
import { CandlestickController, CandlestickElement } from 'chartjs-chart-financial';

// Register the required components and plugins
ChartJS.register(CategoryScale, TimeScale, LinearScale, BarElement, CandlestickController, CandlestickElement);

const CryptoChart = () => {
    const [selectedPair, setSelectedPair] = useState('ethusdt');
    const [selectedInterval, setSelectedInterval] = useState('1m');
    const [chartData, setChartData] = useState([]);
    const socketRef = useRef(null);

    useEffect(() => {
        if (socketRef.current) {
            socketRef.current.close(); // Close previous WebSocket connection
        }

        socketRef.current = new WebSocket(`wss://stream.binance.com:9443/ws/${selectedPair}@kline_${selectedInterval}`);

        socketRef.current.onmessage = function (event) {
            const data = JSON.parse(event.data);

            if (data.k && data.k.x) {
                const newCandle = {
                    t: new Date(data.k.t), // timestamp
                    o: data.k.o, // open price
                    h: data.k.h, // high price
                    l: data.k.l, // low price
                    c: data.k.c, // close price
                };

                setChartData((prevData) => [...prevData, newCandle]); // Add new candle to chart data
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

    const data = {
        datasets: [
            {
                label: selectedPair.toUpperCase(),
                data: chartData,
                type: 'candlestick',
                borderColor: '#00FF00',
                borderWidth: 1,
                fill: false,
            },
        ],
    };

    const options = {
        scales: {
            x: {
                type: 'time',
                time: {
                    unit: 'minute',
                },
            },
        },
    };

    return (
        <div>
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

            <div className="chart-container">
                <Chart data={data} options={options} />
            </div>
        </div>
    );
};

export default CryptoChart;
