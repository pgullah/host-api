from http.server import BaseHTTPRequestHandler, HTTPServer
import sys

class html(BaseHTTPRequestHandler):
      def do_GET (self):
          self.send_response (300)
          self.send_header ('python 3','text/html')
          self.end_headers ()
          message = "Python 3 html server"
          self.wfile.write (bytes(message, "utf8"))
            
handler = html
if len(sys.argv) == 2:
    port=int(sys.argv[1]
else:
    port = 7000

with HTTPServer (('', port), handler) as server:
    print("Http server running at port:", port)
    server.serve_forever()
