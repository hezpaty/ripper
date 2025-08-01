FROM alpine

ADD xray /usr/bin/xray
ADD config.json /etc/xray/config.json

CMD ["/usr/bin/xray", "-config", "/etc/xray/config.json"]
