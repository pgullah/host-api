const express = require('express');
const router = express.Router();
const localtunnel = require('localtunnel');
const ngrok = require('ngrok');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

const lookupHost = async (host) => {
    const cmd = `ping ${host} -c 1 | head -1 | awk '{print $3}' | sed 's/[()]//g'`;
    const resp = await exec(cmd);
    // console.log(">> resp:", resp);
    return resp.stdout;
 } 

const TUNNEL_CFG = {
    ssh: { port: 22, },
    home: { port: 80 },
}
const NGROK_URL_REGEX = /^tcp:\/\/([^:]+):(\d+)/;
const findTunnelConfig = (tunnelType) => TUNNEL_CFG[tunnelType];
const findTunnel = (tunnelType) => {
    const cfg = findTunnelConfig(tunnelType);
    return cfg && cfg['tunnel'];
}

const sendTunnelResp = (tunnel, res) => res.send(JSON.stringify({
    url: tunnel.url, remote_host: tunnel.remote_host, remote_port: tunnel.remote_port, remote_address: tunnel.remote_address
}));

// router.use(require("./auth"));

router.get('/:tunnelType', (req, res) => {
    const tunnelType = req.params.tunnelType;
    const tunnel = findTunnel(tunnelType);
    if (tunnel == null || tunnel == undefined) {
        res.status(404).send(`No tunnel exists!`)
    } else {
        sendTunnelResp(tunnel, res)
    }
});

router.put('/:tunnelType', async (req, res) => {
    const tunnelType = req.params.tunnelType;
    if (!(tunnelType in TUNNEL_CFG)) {
        res.sendStatus(400, `${tunnelType} is not recognized type`);
        return;
    }

    const cfg = TUNNEL_CFG[tunnelType];
    let tunnel = findTunnel(tunnelType);
    if (tunnel == null || tunnel == undefined) {
        if (tunnelType == 'ssh') {
            const ngrokUrl = await ngrok.connect({ proto: 'tcp', addr: cfg.port, });
            console.log('ngrok url:', ngrokUrl);
            const matches = ngrokUrl.match(NGROK_URL_REGEX);
            console.log(">> matches:", matches)
            const host = matches[1];
            const port = matches[2];
            const address = await lookupHost(host);
            tunnel = {
                url: ngrokUrl,
                remote_host: host,
                remote_port: port,
                remote_address: address,
                type: 'ngrok',
                close: ngrok.disconnect,
            }
        } else {
            // only supports http
            tunnel = await localtunnel({ port: cfg.port });
            tunnel.type = 'localtunnel';
        }
        cfg['tunnel'] = tunnel;
    }
    sendTunnelResp(tunnel, res)
});

router.delete('/:tunnelType', async (req, res) => {
    const tunnelType = req.params.tunnelType;
    const tunnel = findTunnel(tunnelType);
    console.log(' deleteing tunnel:', tunnelType)
    if (tunnel == null || tunnel == undefined) {
        res.sendStatus(404, 'No tunnel exists!')
    } else {
        console.log("Closing tunnel");
        try {
            await tunnel.close();
            TUNNEL_CFG[tunnelType]['tunnel'] = null;
        } catch (err) {
            console.log('exception occurred while closing tunnel:', err);
        }
        res.sendStatus(200);
    }
});

module.exports = router;