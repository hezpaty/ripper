      const http = require('http');
const net = require('net');
const url = require('url');
const { createServer } = require('ws');

const UUID = 'aaaaaaa1-bbbb-2ccc-accc-eeeeeeeeeee3';
const WS_PATH = '/hez';
const HOST_HEADER = 'hezpaty-281713011959.us-west1.run.app';

const server = http.createServer((req, res) => {
  if (req.url === WS_PATH) {
    res.writeHead(400);
    res.end();
    return;
  }
  res.writeHead(200);
  res.end('OK');
});

const wss = new createServer({ noServer: true });
wss.on('connection', function connection(ws) {
  const socket = net.connect({ host: '127.0.0.1', port: 443 }, () => {
    ws.on('message', msg => socket.write(msg));
    socket.on('data', chunk => ws.send(chunk));
    socket.on('close', () => ws.close());
    ws.on('close', () => socket.end());
  });
});

server.on('upgrade', function upgrade(req, socket, head) {
  const pathname = url.parse(req.url).pathname;
  const host = req.headers['host'];
  const secWebSocketProtocol = req.headers['sec-websocket-protocol'] || '';
  if (pathname === WS_PATH && host === HOST_HEADER && secWebSocketProtocol.includes(UUID)) {
    wss.handleUpgrade(req, socket, head, ws => wss.emit('connection', ws, req));
  } else {
    socket.destroy();
  }
});

server.listen(8080);
