import express from 'express';
import WebSocket from 'ws';
import fs from 'fs';
import generatePrice from './PriceSimulator';
const cors = require('cors');
import { updateInterval } from './constants';

const app = express();
const server = app.listen(8080, () => {
  console.log('Server listening on port 8080');
});

app.use(cors());

const wss = new WebSocket.Server({ server });
const stockData = JSON.parse(fs.readFileSync('./stock_list.json', 'utf-8'));
const updatedStockPrices: { [symbol: string]: number } = {};

app.get('/api/stocks', (req, res) => {
  res.send(stockData);
});

app.get('/api/stocks', (req, res) => {
  res.send(stockData);
});

app.get('/api/search', (req, res) => {
  const query = req.query.q || '';
  console.log(query);
  console.log(Object.entries(stockData));
  const results = Object.entries(stockData)
    .filter(([symbol, price]) => {
      if (typeof query === 'string') {
        if (symbol.toLowerCase().includes(query.toLowerCase()) && query !== '') return [symbol, price];
      }
    })
    .map(([symbol, price]) => ({ symbol, price }));
  console.log(results, 'results');
  res.json(results);
});

// Initialize a Map to store WebSocket connections and selected stocks
const connectedClients = new Map();

wss.on('connection', (ws) => {
  console.log('Client connected');

  ws.onmessage = (event) => {
    if (typeof event.data === 'string') {
      const selectedStocks = JSON.parse(event.data);
      //pair socket with requested stock info
      connectedClients.set(ws, selectedStocks);
      const filteredData: { [symbol: string]: number } = {};
      for (const stockSymbol of selectedStocks) {
        if (stockData.hasOwnProperty(stockSymbol)) {
          filteredData[stockSymbol] = updatedStockPrices[stockSymbol];
        }
      }
      const message = JSON.stringify(filteredData);
      console.log(filteredData);
      //send message immediately to updated FE
      ws.send(message);
    }
  };

  ws.on('close', () => {
    // Remove the WebSocket connection from the Map when disconnected
    connectedClients.delete(ws);
    console.log('Client disconnected');
  });
});

setInterval(() => {
  for (const symbol in stockData) {
    if (stockData.hasOwnProperty(symbol)) {
      updatedStockPrices[symbol] = generatePrice(symbol);
    }
  }

  for (const [ws, selectedStocks] of connectedClients) {
    const filteredData: { [symbol: string]: number } = {};
    for (const stockSymbol of selectedStocks) {
      if (stockData.hasOwnProperty(stockSymbol)) {
        filteredData[stockSymbol] = updatedStockPrices[stockSymbol];
      }
    }
    const message = JSON.stringify(filteredData);
    console.log(filteredData);
    ws.send(message);
  }
}, updateInterval);
