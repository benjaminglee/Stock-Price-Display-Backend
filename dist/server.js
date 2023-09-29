"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const ws_1 = __importDefault(require("ws"));
const fs_1 = __importDefault(require("fs"));
const app = (0, express_1.default)();
const server = app.listen(8080, () => {
    console.log('Server listening on port 8080');
});
const wss = new ws_1.default.Server({ server });
const stockData = JSON.parse(fs_1.default.readFileSync('./stock_list.json', 'utf-8'));
console.log(stockData);
