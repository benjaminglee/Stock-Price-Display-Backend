import express from 'express';
import WebSocket from 'ws';
import fs from 'fs';
import generatePrice from './PriceSimulator';

const app = express();
const server = app.listen(8080, () => {
  console.log('Server listening on port 8080');
});
const wss = new WebSocket.Server({ server });
const stockData = JSON.parse(fs.readFileSync('./stock_list.json', 'utf-8'));

const updatedStockPrices: { [symbol: string]: number } = {};
const updateInterval = 100;

const connectedClients: Set<WebSocket> = new Set();

wss.on('connection', (ws) => {
  connectedClients.add(ws);
  console.log('Client connected');

  ws.on('close', () => {
    connectedClients.delete(ws);
    console.log('Client disconnected');
  });
});

setInterval(() => {
  for(const symbol in stockData) {
    if(stockData.hasOwnProperty(symbol)) {
      updatedStockPrices[symbol] = generatePrice(symbol);
    }
  }
  console.log(updatedStockPrices);
  //loop through connections and send message to clients
  //TODO test connectino
  for (const ws of connectedClients) {
    const message = JSON.stringify(updatedStockPrices);
    ws.send(message);
  }
}, updateInterval)