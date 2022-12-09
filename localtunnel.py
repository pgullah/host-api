import os

class LocalTunnel:
    def __init__(self, port, tunnelType = 'http'):
        self.port = port
        self.tunnelType = tunnelType

    def connect(self):
        command = f'lt -p {self.port}'
        output = os.system(command)
        # your url is: https://major-cups-jog-51-198-12-10.loca.lt

    def close():
        pass


def connect(port, tunnelType):
    tunnel = LocalTunnel(port, tunnelType)
    tunnel.connect()
