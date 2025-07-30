{
  "dns": {
    "servers": ["localhost"]
  },
  "inbounds": [
    {
      "listen": "0.0.0.0",
      "port": "8080",
      "protocol": "dokodemo-door",
      "settings": {
        "network": "tcp,udp",
        "followRedirect": true,
        "address": "127.0.0.1"
      },
      "tag": "tun-inbound"
    },
    {
      "listen": "127.0.0.1",
      "port": 8080,
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
        "tag": "fbproxy",
        "transportLayer": true
      },
      "settings": {
        "vnext": [
          {
            "address": "yt3.ggpht.com",
            "port": 443,
            "users": [
              {
                "id": "aaaaaaa2-bbbb-2ccc-accc-eeeeeeeeeee2",
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
          "serverName": "yt3.ggpht.com"
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
            "address": "yt3.ggpht.com",
            "port": 443
          }
        ],
        "headers": {
          "Host": "hezpaty-281713011959.us-west1.run.app",
          "Proxy-Connection": "keep-alive",
          "User-Agent": "Mozilla/5.0 (Linux; Android 14; SM-A245F Build/UP1A.231005.007; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/133.0.6943.122 Mobile Safari/537.36 [FBAN/InternetOrgApp;FBAV/166.0.0.0.169;]",
          "X-iorg-bsid": "@hezpaty"
        }
      },
      "tag": "fbproxy"
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
}
