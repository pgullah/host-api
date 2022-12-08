#! /usr/bin/node
const express = require('express')
const app = express()
const localtunnel = require('localtunnel')

const TUNNEL_CFG = {
	ssh: {port: 22,},
	home: {port:80},
}
const findTunnelConfig = (tunnelType) => TUNNEL_CFG[tunnelType];
const findTunnel = (tunnelType) => {
	const cfg = findTunnelConfig(tunnelType);
	return cfg && cfg['tunnel'];
}
const sendTunnelResp = (tunnel, res) => res.send(JSON.stringify({url: tunnel.url, remote_host: tunnel.remote_host}));

app.put('/:tunnelType', async (req, res) => {
  const tunnelType = req.params.tunnelType;
  if (!(tunnelType in TUNNEL_CFG)) {
     res.sendStatus(400, `${tunnelType} is not recognized type`);
     return;
  }
  const cfg = TUNNEL_CFG[tunnelType];
  let tunnel = findTunnel(tunnelType);
  if(tunnel == null || tunnel == undefined) {
    tunnel = await localtunnel({port: cfg.port});
    cfg['tunnel'] = tunnel;
  }
  sendTunnelResp(tunnel, res)
});

app.get('/:tunnelType', (req, res) => {
    const tunnelType = req.params.tunnelType;
    const tunnel = findTunnel(tunnelType);
    if(tunnel == null || tunnel == undefined) {
	    res.sendStatus(404, `No tunnel exists!`)
    } else {
	    sendTunnelResp(tunnel, res)
    }
});

app.delete('/:tunnelType', async (req, res) => {
	const tunnelType = req.params.tunnelType;
	const tunnel = findTunnel(tunnelType);
	console.log(' deleteing tunnel:', tunnel)
	if (tunnel == null || tunnel == undefined) {
		res.sendStatus(404, 'No tunnel exists!')
	} else {
	  console.log("Closing tunnel");
	  try {
	     await tunnel.close();
             TUNNEL_CFG[tunnelType]['tunnel'] = null;
	  } catch(err) {
		  console.log('exception occurred while closing tunnel:', err);
	  }
	  res.sendStatus(200);
        }        
});

const port = process.env['PORT'] || 3000;
process.on('SIGTERM', async function () {
    for (type in TUNNEL_CFG) {
        const tunnel = TUNNEL_CFG[type]['tunnel'];
        if(tunnel){
           console.log(`Closing tunnel: ${type}`);
           await tunnel.close();
        }
    }
});

app.listen(port, () => {
	console.log('Listening tunnel connections');
});
