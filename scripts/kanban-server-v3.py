#!/usr/bin/env python3
"""
Kanban Backend Service v3
- Serves the HTML App
- Serves/Updates kanban-data.json
- Syncs to Apple Calendar
- Accessible via 0.0.0.0 (Local Network / Tailscale)
"""

import json
import subprocess
import sys
import os
from datetime import datetime
from http.server import HTTPServer, BaseHTTPRequestHandler

# Paths relative to this script
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_FILE = os.path.join(SCRIPT_DIR, '../kanban-data.json')
HTML_FILE = os.path.join(SCRIPT_DIR, '../kanban-calendar-v3.html')

class RequestHandler(BaseHTTPRequestHandler):
    def _send_cors_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')

    def do_OPTIONS(self):
        self.send_response(200)
        self._send_cors_headers()
        self.end_headers()

    def do_GET(self):
        if self.path == '/' or self.path == '/index.html' or self.path.startswith('/kanban'):
            # Serve the HTML App
            try:
                with open(HTML_FILE, 'r') as f:
                    content = f.read()
                self.send_response(200)
                self._send_cors_headers()
                self.send_header('Content-Type', 'text/html')
                self.end_headers()
                self.wfile.write(content.encode())
            except Exception as e:
                self.send_response(500)
                self.end_headers()
                self.wfile.write(f"Error serving HTML: {e}".encode())

        elif self.path == '/data':
            # Serve Data
            try:
                with open(DATA_FILE, 'r') as f:
                    data = f.read()
                self.send_response(200)
                self._send_cors_headers()
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(data.encode())
            except Exception as e:
                self.send_response(500)
                self._send_cors_headers()
                self.end_headers()
                self.wfile.write(json.dumps({'error': str(e)}).encode())
        else:
            self.send_response(404)
            self.end_headers()

    def do_POST(self):
        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length).decode('utf-8')
        
        if self.path == '/data':
            # Save whole board data
            try:
                # Validate JSON before writing
                json_data = json.loads(body)
                with open(DATA_FILE, 'w') as f:
                    f.write(json.dumps(json_data, indent=2))
                
                self.send_response(200)
                self._send_cors_headers()
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'success': True}).encode())
            except Exception as e:
                self.send_response(500)
                self._send_cors_headers()
                self.end_headers()
                self.wfile.write(json.dumps({'error': str(e)}).encode())

        elif self.path == '/calendar':
            # Create calendar event
            try:
                data = json.loads(body)
                title = data.get('title', 'Untitled')
                due_date = data.get('dueDate', '')
                description = data.get('description', '')
                
                if due_date:
                    self.create_calendar_event(title, due_date, description)
                
                self.send_response(200)
                self._send_cors_headers()
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'success': True}).encode())
            except Exception as e:
                self.send_response(500)
                self._send_cors_headers()
                self.end_headers()
                self.wfile.write(json.dumps({'error': str(e)}).encode())
        else:
            self.send_response(404)
            self.end_headers()

    def create_calendar_event(self, title, due_date, description):
        """Create event in HAL Calendar via AppleScript"""
        try:
            date_obj = datetime.strptime(due_date, '%Y-%m-%d')
            month = date_obj.strftime('%B')
            day = date_obj.strftime('%d').lstrip('0')
            year = date_obj.strftime('%Y')
            
            title_safe = title.replace('"', '\\"')
            desc_combined = f"Kanban: {description}" if description else "Kanban task"
            desc_safe = desc_combined.replace('"', '\\"')
            
            applescript = f'''
tell application "Calendar"
    tell calendar "HAL"
        make new event with properties {{summary:"{title_safe}", start date:date "{month} {day}, {year} 9:00:00 AM", end date:date "{month} {day}, {year} 10:00:00 AM", description:"{desc_safe}"}}
    end tell
end tell
'''
            subprocess.run(['osascript', '-e', applescript], check=True, capture_output=True)
        except Exception as e:
            print(f"Calendar Sync Error: {e}", file=sys.stderr)
            # Don't fail the request if calendar fails (e.g. app not running)

def start_server(port=9999):
    # Listen on 0.0.0.0 to allow external connections (Tailscale/LAN)
    server = HTTPServer(('0.0.0.0', port), RequestHandler)
    print(f"🔴 Kanban Backend v3 running on http://0.0.0.0:{port}")
    print(f"   Local: http://localhost:{port}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass

if __name__ == '__main__':
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 9999
    start_server(port)
