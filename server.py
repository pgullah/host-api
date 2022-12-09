from flask import Flask, jsonify
from pyngrok import ngrok
import localtunnel
import os

port = os.env['PORT'] if 'PORT' in os.environ else 3000
app = Flask(__name__)

TUNNEL_CFG = {
    "ssh": {
        "port": 22,
    },
    "home": {
        "port": 80
    },
}

def __findTunnelConfig(tunnelType):
    return TUNNEL_CFG.get(tunnelType, None)


def __findTunnel(tunnelType):
    cfg = __findTunnelConfig(tunnelType)
    return cfg and cfg.get('tunnel', None)


def __sendTunnelResp(tunnel):
    return jsonify({"url": tunnel.url, "remote_host": tunnel.remote_host})



@app.route('/<tunnelType>', methods=['PUT'])
def put(tunnelType):
    if tunnelType in TUNNEL_CFG:
        return '{} is not recognized type'.format(tunnelType), 400


    cfg = TUNNEL_CFG[tunnelType]
    tunnel = __findTunnel(tunnelType)
    if tunnel is None: 
        if tunnelType == 'ssh':
            tunnel = ngrok.connect(cfg.port, 'tcp')
        else:
            tunnel = localtunnel.connect(cfg.port, 'http')
        cfg['tunnel'] = tunnel

    return __sendTunnelResp(tunnel)


@app.route('/<tunnelType>', methods=['GET'])
def get(tunnelType):
    tunnel = __findTunnel(tunnelType)
    if tunnel:
        return __sendTunnelResp(tunnel)
    else:
        return 'No tunnel exists!', 400



@app.route('/<tunnelType>', methods=['DELETE'])
def delete(tunnelType):
    tunnel = __findTunnel(tunnelType)
    print(' deleteing tunnel:', tunnel)

    if tunnel:
        print("Closing tunnel")
        try:
            tunnel.close()
            TUNNEL_CFG[tunnelType]['tunnel'] = None
        except:
            print('exception occurred while closing tunnel:')
    else:
        return 'No tunnel exists!', 404


@app.on_event("shutdown")
def shutdown():
    for type in TUNNEL_CFG:
        tunnel = TUNNEL_CFG[type]['tunnel']
        if tunnel:
            print(f'Closing tunnel: {type}')
            tunnel.close()


if __name__ == '__main__':
    app.run(port=port)
