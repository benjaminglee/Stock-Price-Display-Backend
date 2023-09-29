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

setInterval(() => {
  for(const symbol in )
}, updateInterval)