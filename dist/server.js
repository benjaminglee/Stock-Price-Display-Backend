"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const ws_1 = __importDefault(require("ws"));
const fs_1 = __importDefault(require("fs"));
const PriceSimulator_1 = __importDefault(require("./PriceSimulator"));
const cors = require('cors');
const constants_1 = require("./constants");
const app = (0, express_1.default)();
const server = app.listen(8080, () => {
    console.log('Server listening on port 8080');
});
app.use(cors({ origin: 'http://localhost:3000' }));
const wss = new ws_1.default.Server({ server });
const stockData = JSON.parse(fs_1.default.readFileSync('./stock_list.json', 'utf-8'));
const updatedStockPrices = {};
app.get('/api/stocks', (req, res) => {
    res.send(stockData);
});
// Initialize a Map to store WebSocket connections and selected stocks
const connectedClients = new Map();
wss.on('connection', (ws) => {
    console.log('Client connected');
    ws.onmessage = (event) => {
        if (typeof event.data === 'string') {
            const selectedStocks = JSON.parse(event.data);
            connectedClients.set(ws, selectedStocks); //pair socket with requested stock info
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
            updatedStockPrices[symbol] = (0, PriceSimulator_1.default)(symbol);
        }
    }
    for (const [ws, selectedStocks] of connectedClients) {
        const filteredData = {};
        for (const stockSymbol of selectedStocks) {
            if (stockData.hasOwnProperty(stockSymbol)) {
                filteredData[stockSymbol] = updatedStockPrices[stockSymbol];
            }
        }
        console.log(filteredData, 'filtered');
        const message = JSON.stringify(filteredData);
        ws.send(message);
    }
}, constants_1.updateInterval);
