let socket;
let selectedPair = 'ethusdt'; // Default cryptocurrency pair
let selectedInterval = '1m';  // Default interval
let chart;

// Function to initialize the chart
function initChart() {
    const ctx = document.getElementById('cryptoChart').getContext('2d');
    chart = new Chart(ctx, {
        type: 'candlestick', // Add candlestick support with Chart.js
        data: {
            datasets: [{
                label: selectedPair.toUpperCase(),
                data: [], // Initialize with empty data
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'minute'
                    }
                }
            }
        }
    });
}

// Function to update the chart with new candlestick data
function updateChart(candlestick) {
    const newCandle = {
        t: new Date(candlestick.t), // timestamp
        o: candlestick.o, // open price
        h: candlestick.h, // high price
        l: candlestick.l, // low price
        c: candlestick.c, // close price
    };
    
    chart.data.datasets[0].data.push(newCandle);
    chart.update();
}

// Function to persist chart data in localStorage
function saveToLocalStorage(pair, data) {
    localStorage.setItem(pair, JSON.stringify(data));
}

// Function to retrieve persisted chart data from localStorage
function getFromLocalStorage(pair) {
    return JSON.parse(localStorage.getItem(pair)) || [];
}

// Function to create and manage WebSocket connection
function updateWebSocket() {
    if (socket) {
        socket.close(); // Close previous WebSocket connection
    }

    socket = new WebSocket(`wss://stream.binance.com:9443/ws/${selectedPair}@kline_${selectedInterval}`);

    // Load previous data if available
    const previousData = getFromLocalStorage(selectedPair);
    chart.data.datasets[0].data = previousData;
    chart.update();

    socket.onmessage = function(event) {
        const data = JSON.parse(event.data);
        if (data.k && data.k.x) {
            updateChart(data.k);

            // Save the updated chart data to local storage
            saveToLocalStorage(selectedPair, chart.data.datasets[0].data);
        }
    };
}

// Event listener for cryptocurrency selection
document.getElementById('crypto-select').addEventListener('change', (e) => {
    selectedPair = e.target.value;
    updateWebSocket(); // Reinitialize WebSocket with new cryptocurrency pair
});

// Event listener for timeframe selection
document.getElementById('timeframe-select').addEventListener('change', (e) => {
    selectedInterval = e.target.value;
    updateWebSocket(); // Reinitialize WebSocket with new interval
});

// Initialize chart and WebSocket on page load
window.onload = () => {
    initChart();
    updateWebSocket();
};
