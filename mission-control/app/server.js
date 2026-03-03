import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 18888;
const PUBLIC_DIR = path.join(__dirname, 'public');

/**
 * API Handlers - Return real data or mock fallback
 */
const api = {
  health: () => {
    try {
      // Try to get real data from Home Assistant
      // For now, return mock data with some randomness
      return {
        mac: {
          cpu: Math.floor(Math.random() * 80) + 10,
          memory: Math.floor(Math.random() * 75) + 15,
          disk: 82
        },
        vps: {
          cpu: Math.floor(Math.random() * 60) + 10,
          memory: Math.floor(Math.random() * 50) + 15,
          disk: 55
        }
      };
    } catch (err) {
      console.error('Health API error:', err.message);
      return null;
    }
  },

  costs: () => {
    return {
      daily: Math.random() * 0.5 + 0.2,
      dailyCap: 5.0,
      monthly: Math.random() * 20 + 15,
      monthlyCap: 100.0,
      models: {
        'Claude': { cost: 8.23, percent: 45 },
        'Gemini': { cost: 5.12, percent: 28 },
        'GPT': { cost: 4.31, percent: 23 },
        'Local': { cost: 0.81, percent: 4 }
      }
    };
  },

  agents: () => {
    return {
      running: Math.floor(Math.random() * 4) + 3,
      idle: Math.floor(Math.random() * 6) + 5,
      error: Math.floor(Math.random() * 3),
      list: [
        { id: 'scout', status: 'running', lastRun: '2m ago' },
        { id: 'researcher', status: 'idle', lastRun: '1h ago' },
        { id: 'writer', status: 'idle', lastRun: '3h ago' }
      ]
    };
  },

  piwigo: () => {
    const percent = Math.floor(Math.random() * 10) + 30;
    return {
      transferred: `${(percent * 7.8 / 100).toFixed(1)} GB`,
      total: '7.8 GB',
      percent: percent,
      galleries: 37,
      galleriesTotal: 37,
      eta: '~45 minutes',
      status: 'Running'
    };
  },

  homeassistant: () => {
    // Mock Home Assistant data
    return {
      newark: {
        temperature: '72°F',
        humidity: '45%',
        frontDoor: 'closed',
        garage: 'closed',
        alarm: 'disarmed'
      },
      aspire: {
        temperature: '70°F',
        acStatus: 'off',
        water: '50%',
        battery: '95%'
      }
    };
  },

  'agents/control': (req, body) => {
    // Handle agent control actions
    let data = {};
    try {
      data = JSON.parse(body);
    } catch (e) {
      return { error: 'Invalid request' };
    }

    const { action, agentId } = data;
    console.log(`🤖 Agent control: ${action} ${agentId}`);

    // Mock implementation - in production, this would actually control agents
    return {
      success: true,
      action,
      agentId,
      message: `Agent ${agentId} ${action} command sent`
    };
  }
};

const server = http.createServer((req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Content-Type', 'application/json');

  // Handle API routes
  if (req.url.startsWith('/api/')) {
    const endpoint = req.url.replace('/api/', '');
    const handler = api[endpoint];

    if (handler) {
      // Handle POST requests (for agent control)
      if (req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
          const data = handler(req, body);
          if (data) {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(data));
            console.log(`✅ API ${endpoint} (POST) returned data`);
          }
        });
        return;
      }

      // Handle GET requests
      if (req.method === 'GET') {
        const data = handler();
        if (data) {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(data));
          console.log(`✅ API ${endpoint} returned data`);
          return;
        }
      }
    }

    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Not found' }));
    return;
  }

  // Serve static files
  let filePath = path.join(PUBLIC_DIR, req.url === '/' ? 'index.html' : req.url);

  // Security: prevent directory traversal
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not Found');
      return;
    }

    // Set content type
    const ext = path.extname(filePath);
    let contentType = 'text/plain';
    if (ext === '.html') contentType = 'text/html';
    if (ext === '.css') contentType = 'text/css';
    if (ext === '.js') contentType = 'application/javascript';
    if (ext === '.json') contentType = 'application/json';

    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Mission Control running at http://127.0.0.1:${PORT}`);
  console.log(`📊 API endpoints:`);
  console.log(`   GET /api/health - System metrics`);
  console.log(`   GET /api/costs - Cost tracking`);
  console.log(`   GET /api/agents - Agent status`);
  console.log(`   GET /api/piwigo - Piwigo progress`);
});
