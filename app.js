const os = require('os');
const http = require('http');
const fs = require('fs');
const path = require('path');
const net = require('net');
const { exec, execSync } = require('child_process');

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

const NAME = process.env.NAME || os.hostname();

const clientVlessConfig = {
  "dns": {
    "servers": ["localhost"]
  },
  "inbounds": [
    {
      "listen": "0.0.0.0",
      "port": 1080,
      "protocol": "dokodemo-door",
      "settings": {
        "network": ["tcp", "udp"],
        "followRedirect": true,
        "address": "127.0.0.1"
      },
      "tag": "tun-inbound"
    },
    {
      "listen": "127.0.0.1",
      "port": 10808,
      "protocol": "socks",
      "settings": {
        "auth": "noauth",
        "udp": true
      },
      "tag": "socks-inbound"
    }
  ],
  "outbounds": [
    {
      "mux": {
        "enabled": false
      },
      "protocol": "vless",
      "proxySettings": {
        "tag": "hezpaty",
        "transportLayer": true
      },
      "settings": {
        "vnext": [
          {
            "address": "ge0.ggpht.com",
            "port": 443,
            "users": [
              {
                "id": "aaaaaaa1-bbbb-2ccc-accc-eeeeeeeeeee3",
                "level": 8,
                "encryption": "none"
              }
            ]
          }
        ]
      },
      "streamSettings": {
        "network": "ws",
        "security": "tls",
        "tlsSettings": {
          "allowInsecure": true,
          "serverName": "hezpaty-281713011959.us-west1.run.ap"
        },
        "wsSettings": {
          "headers": {
            "Host": "hezpaty-281713011959.us-west1.run.app"
          },
          "path": "/topnet"
        }
      },
      "tag": "VLESS"
    },
    {
      "domainStrategy": "AsIs",
      "protocol": "http",
      "settings": {
        "servers": [
          {
            "address": "57.144.138.4",
            "port": 8080
          },
          {
            "address": "157.240.195.32",
            "port": 8080
          }
        ],
        "headers": {
          "Host": "ge0.ggpht.com",
          "Proxy-Connection": "keep-alive",
          "User-Agent": "Mozilla/5.0 (Linux; Android 14; SM-A245F Build/UP1A.231005.007; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/133.0.6943.122 Mobile Safari/537.36 [FBAN/InternetOrgApp;FBAV/166.0.0.0.169;]",
          "X-iorg-bsid": "@hezpaty"
        }
      },
      "tag": "hezpaty"
    }
  ],
  "policy": {
    "levels": {
      "8": {
        "connIdle": 300,
        "downlinkOnly": 1,
        "handshake": 4,
        "uplinkOnly": 1
      }
    }
  }
};
const UUID = "aaaaaaa1-bbbb-2ccc-accc-eeeeeeeeeee3";
const DOMAIN = "hezpaty-281713011959.us-west1.run.app";
const PORT = process.env.PORT || 8080;

console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
console.log("甬哥Github项目  ：github.com/Hubdarkweb");
console.log("甬哥Blogger博客 ：topnet.blogspot.com");
console.log("甬哥YouTube频道 ：www.youtube.com/@topnet");
console.log("Nodejs真一键无交互Vless代理脚本");
console.log("当前版本：25.6.9");
console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");

const httpServer = http.createServer((req, res) => {
    if (req.url === '/') {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Hello, TOpNeT Customs\n');
    } else if (req.url === `/${UUID}`) {
        const vlessURL = `vless://${UUID}@yt3.ggpht.com:443?encryption=none&security=tls&sni=yt3.ggpht.com&type=ws&host=${DOMAIN}&path=%2Ftopnet#Vl-ws-tls-${NAME}`;
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end(vlessURL + '\n');
    } else if (req.url === '/client-config') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(clientVlessConfig, null, 2));
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found\n');
    }
});

httpServer.listen(PORT, () => {
    console.log(`HTTP Server is running on port ${PORT}`);
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
            duplex.on('error', () => { }).pipe(this).on('error', () => { }).pipe(duplex);
        }).on('error', () => { });
    }).on('error', () => { });
});

console.log(`✅ VLESS WS-TLS server running on /topnet`);
console.log(`🌐 Config available at: https://${DOMAIN}/client-config`);
