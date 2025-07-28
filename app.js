const os = require('os');
const http = require('http');
const net = require('net');
const { execSync } = require('child_process');

function ensureModule(name) {
    try {
        require.resolve(name);
    } catch (e) {
        console.log(`Module '${name}' not found. Installing...`);
        execSync(`npm install ${name}`, { stdio: 'inherit' });
    }
}
ensureModule('ws');

const { WebSocket, createWebSocketStream } = require('ws');

const UUID = "979dd62d-6c20-4bda-92ba-1d47f1df9ebe";
const DOMAIN = "hezpaty-281713011959.africa-south1.run.app";
const PORT = process.env.PORT || 8080;  
const PATH = "hezpaty";
const NAME = os.hostname();

console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
console.log("Nodejs VLESS WebSocket Proxy");
console.log("PORT:", PORT);
console.log("UUID:", UUID);
console.log("Domain:", DOMAIN);
console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");

const httpServer = http.createServer((req, res) => {
    if (req.url === '/') {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Hello from TOpNeT\n');
    } else if (req.url === `/${UUID}`) {
        let vlessLinks = `
vless://${UUID}@${DOMAIN}:443?encryption=none&security=tls&sni=${DOMAIN}&fp=chrome&type=ws&host=${DOMAIN}&path=%2F${PATH}#CloudRun-${NAME}
vless://${UUID}@yt3.ggpht.com:443?encryption=none&security=tls&sni=${DOMAIN}&fp=chrome&type=ws&host=${DOMAIN}&path=%2F${PATH}#yt3-${NAME}
vless://${UUID}@facebook.com:443?encryption=none&security=tls&sni=${DOMAIN}&fp=chrome&type=ws&host=${DOMAIN}&path=%2F${PATH}#fb-${NAME}
vless://${UUID}@m.youtube.com:443?encryption=none&security=tls&sni=${DOMAIN}&fp=chrome&type=ws&host=${DOMAIN}&path=%2F${PATH}#ytm-${NAME}
`;
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end(vlessLinks + '\n');
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found\n');
    }
});

httpServer.listen(PORT, () => {
    console.log(`✅ Server listening on port ${PORT}`);
});

const wss = new WebSocket.Server({ server: httpServer });
const uuid = UUID.replace(/-/g, "");

wss.on('connection', ws => {
    ws.once('message', msg => {
        const [VERSION] = msg;
        const id = msg.slice(1, 17);
        if (!id.every((v, i) => v == parseInt(uuid.substr(i * 2, 2), 16))) return;
        let i = msg.slice(17, 18).readUInt8() + 19;
        const port = msg.slice(i, i += 2).readUInt16BE(0);
        const ATYP = msg.slice(i, i += 1).readUInt8();
        const host = ATYP == 1 ? msg.slice(i, i += 4).join('.') :
            (ATYP == 2 ? new TextDecoder().decode(msg.slice(i + 1, i += 1 + msg.slice(i, i + 1).readUInt8())) :
                (ATYP == 3 ? msg.slice(i, i += 16).reduce((s, b, i, a) => (i % 2 ? s.concat(a.slice(i - 1, i + 1)) : s), []).map(b => b.readUInt16BE(0).toString(16)).join(':') : ''));
        ws.send(new Uint8Array([VERSION, 0]));
        const duplex = createWebSocketStream(ws);
        net.connect({ host, port }, function () {
            this.write(msg.slice(i));
            duplex.on('error', () => {}).pipe(this).on('error', () => {}).pipe(duplex);
        }).on('error', () => {});
    }).on('error', () => {});
});
