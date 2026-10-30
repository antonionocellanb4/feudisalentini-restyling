"""Server locale del prototipo senza cache (così il browser vede sempre l'ultima versione).
Uso, dalla cartella del progetto: python -I tools/serve.py   ->  http://127.0.0.1:5510/"""
import http.server, functools, pathlib

class NoCache(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()

root = pathlib.Path(__file__).resolve().parent.parent
http.server.ThreadingHTTPServer(('127.0.0.1', 5510), functools.partial(NoCache, directory=str(root))).serve_forever()
