"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const ws_1 = __importDefault(require("ws"));
const fs_1 = __importDefault(require("fs"));
const PriceSimulator_1 = __importDefault(require("./PriceSimulator"));
const constants_1 = require("./constants");
const app = (0, express_1.default)();
const server = app.listen(8080, () => {
    console.log('Server listening on port 8080');
});
const wss = new ws_1.default.Server({ server });
const stockData = JSON.parse(fs_1.default.readFileSync('./stock_list.json', 'utf-8'));
const updatedStockPrices = {};
const connectedClients = new Set();
wss.on('connection', (ws) => {
    connectedClients.add(ws);
    console.log('Client connected');
    ws.on('close', () => {
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
    console.log(updatedStockPrices);
    //loop through connections and send message to clients
    //TODO test connectino
    for (const ws of connectedClients) {
        const message = JSON.stringify(updatedStockPrices);
        ws.send(message);
    }
}, constants_1.updateInterval);
