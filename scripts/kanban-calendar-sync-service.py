#!/usr/bin/env python3
"""
Kanban ↔ Calendar Sync Service
Bridges the Kanban board (browser) to Apple Calendar
"""

import json
import subprocess
import sys
from datetime import datetime
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import parse_qs
import ssl

class SyncHandler(BaseHTTPRequestHandler):
    def do_POST(self):
        """Handle POST requests to create calendar events"""
        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length).decode('utf-8')
        
        try:
            data = json.loads(body)
            title = data.get('title', 'Untitled')
            due_date = data.get('dueDate', '')
            description = data.get('description', '')
            
            if not due_date:
                self.send_response(400)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'error': 'No due date provided'}).encode())
                return
            
            # Create calendar event
            result = self.create_calendar_event(title, due_date, description)
            
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            self.wfile.write(json.dumps({
                'success': True,
                'message': f'✅ Task "{title}" added to HAL Calendar',
                'date': due_date
            }).encode())
            
        except Exception as e:
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'error': str(e)}).encode())
    
    def do_OPTIONS(self):
        """Handle CORS preflight requests"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
    
    def create_calendar_event(self, title, due_date, description):
        """Create event in HAL Calendar via AppleScript"""
        
        # Parse date (format: YYYY-MM-DD)
        date_obj = datetime.strptime(due_date, '%Y-%m-%d')
        month = date_obj.strftime('%B')
        day = date_obj.strftime('%d').lstrip('0')  # Remove leading zero
        year = date_obj.strftime('%Y')
        
        # Escape quotes in strings for AppleScript
        title_safe = title.replace('"', '\\"')
        desc_combined = f"Kanban: {description}" if description else "Kanban task"
        desc_safe = desc_combined.replace('"', '\\"')
        
        # Format for AppleScript - compact single-line format that works
        applescript = f'''
tell application "Calendar"
    tell calendar "HAL"
        make new event with properties {{summary:"{title_safe}", start date:date "{month} {day}, {year} 9:00:00 AM", end date:date "{month} {day}, {year} 10:00:00 AM", description:"{desc_safe}"}}
    end tell
end tell
'''
        
        try:
            result = subprocess.run(
                ['osascript', '-e', applescript],
                capture_output=True,
                text=True,
                timeout=5
            )
            
            if result.returncode == 0:
                return result.stdout.strip()
            else:
                raise Exception(f"AppleScript error: {result.stderr}")
        
        except Exception as e:
            print(f"Error: {e}", file=sys.stderr)
            raise
    
    def log_message(self, format, *args):
        """Suppress default logging"""
        pass

def start_server(port=9999):
    """Start the sync service"""
    server = HTTPServer(('127.0.0.1', port), SyncHandler)
    print(f"🔴 Kanban-Calendar Sync Service running on http://localhost:{port}")
    print("Ready to sync tasks to HAL Calendar")
    
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n✅ Sync service stopped")
        server.shutdown()

if __name__ == '__main__':
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 9999
    start_server(port)
