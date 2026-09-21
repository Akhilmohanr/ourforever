"""Local website + live Drive album: python3 scripts/serve.py"""
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlsplit, unquote
from pathlib import Path
import json
import re
from sync_memories import read_folder

ROOT = Path(__file__).resolve().parents[1]

class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def do_GET(self):
        path = urlsplit(self.path).path
        if path == '/api/memories':
            try:
                config = (ROOT / 'js/invitation.js').read_text()
                match = re.search(r"DRIVE_FOLDER_URL:\s*'([^']+)'", config)
                if not match or not re.fullmatch(r'https://drive\.google\.com/drive/folders/[\w-]+', match[1]):
                    raise ValueError('Invalid configured Drive folder')
                photos = []
                for entry in read_folder(match[1]):
                    if not entry[3].startswith('image/') or not re.fullmatch(r'[\w-]+', entry[0]):
                        continue
                    photos.append({'src': f'https://drive.google.com/thumbnail?id={entry[0]}&sz=w1600',
                                   'alt': f'Our memories, photo {len(photos) + 1}',
                                   'caption': f'Memory {len(photos) + 1}'})
                body = json.dumps({'photos': photos}).encode()
                status = 200
            except Exception as error:
                print(f'Drive album unavailable: {error}', flush=True)
                status = 502
                body = b'{"error":"The album is temporarily unavailable."}'
            self.send_response(status)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.send_header('Cache-Control', 'no-store')
            # Allows index.html opened directly on this computer to use the local service.
            if self.headers.get('Origin') == 'null':
                self.send_header('Access-Control-Allow-Origin', 'null')
            self.end_headers()
            self.wfile.write(body)
            return
        decoded = unquote(path)
        if '..' in Path(decoded).parts or not (decoded in ('/', '/index.html', '/invite.html') or decoded.startswith(('/assets/', '/css/', '/js/'))):
            self.send_error(404)
            return
        if (ROOT / decoded.lstrip('/')).is_dir() and decoded != '/':
            self.send_error(404)
            return
        super().do_GET()

if __name__ == '__main__':
    print('Local invitation: http://127.0.0.1:8787 — live Drive album enabled', flush=True)
    ThreadingHTTPServer(('127.0.0.1', 8787), Handler).serve_forever()
