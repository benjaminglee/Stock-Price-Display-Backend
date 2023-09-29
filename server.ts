import express from 'express';
import WebSocket from 'ws';

const app = express();
const server = app.listen(8080, () => {
  console.log('Server listening on port 8080');
});

const wss = new WebSocket.Server({ server });
