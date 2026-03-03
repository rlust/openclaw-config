import http from 'http';
import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 18888;
const PUBLIC_DIR = path.join(__dirname, 'public');

// Load Home Assistant credentials
const HA_CREDS = loadHACredentials();

function loadHACredentials() {
  try {
    const credPath = path.join(process.env.HOME, '.openclaw/workspace/.credentials');
    const content = fs.readFileSync(credPath, 'utf-8');
    
    const aspireMatch = content.match(/## Home Assistant \(Aspire RV\)([\s\S]*?)## /);
    const newarkMatch = content.match(/## Home Assistant \(Newark Home\)([\s\S]*?)## /);
    
    const aspireUrl = aspireMatch?.[1].match(/URL: (.*)/)?.[1]?.trim();
    const aspireToken = aspireMatch?.[1].match(/token: (.*)/)?.[1]?.trim();
    const newarkUrl = newarkMatch?.[1].match(/URL: (.*)/)?.[1]?.trim();
    const newarkToken = newarkMatch?.[1].match(/token: (.*)/)?.[1]?.trim();
    
    return {
      aspire: { url: aspireUrl, token: aspireToken },
      newark: { url: newarkUrl, token: newarkToken }
    };
  } catch (err) {
    console.warn('⚠️ Could not load HA credentials:', err.message);
    return { aspire: {}, newark: {} };
  }
}

// Helper to fetch from Home Assistant
async function fetchHA(instance, endpoint) {
  return new Promise((resolve) => {
    if (!HA_CREDS[instance].token) {
      console.warn(`⚠️ No token for ${instance} HA`);
      resolve(null);
      return;
    }

    const url = new URL(endpoint, HA_CREDS[instance].url);
    const protocol = url.protocol === 'https:' ? https : http;
    
    const options = {
      headers: {
        'Authorization': `Bearer ${HA_CREDS[instance].token}`,
        'Content-Type': 'application/json'
      }
    };

    protocol.get(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          console.error(`Parse error from ${instance} at ${endpoint}:`);
          console.error(`  Response status: ${res.statusCode}`);
          console.error(`  Response starts with: ${data.substring(0, 100)}`);
          console.error(`  Error: ${e.message}`);
          resolve(null);
        }
      });
    }).on('error', (err) => {
      console.warn(`❌ HA fetch error (${instance}):`, err.message);
      resolve(null);
    });
  });
}

/**
 * API Handlers - Return real data or mock fallback
 */
const api = {
  health: async () => {
    try {
      // Return mock data with some randomness for now
      // (Could fetch from HA later)
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

  costs: async () => {
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

  agents: async () => {
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

  piwigo: async () => {
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

  homeassistant: async () => {
    // Fetch real Home Assistant data
    console.log('🏠 Fetching real HA data...');
    
    const newark = await fetchHA('newark', '/api/states/sensor.family_room_temperature');
    const newarkHumidity = await fetchHA('newark', '/api/states/sensor.family_room_humidity');
    const newarkDoor = await fetchHA('newark', '/api/states/binary_sensor.front_door');
    const newarkGarage = await fetchHA('newark', '/api/states/cover.garage_door');
    const newarkAlarm = await fetchHA('newark', '/api/states/alarm_control_panel.omnilink_area_1');
    
    // Aspire RV - Tank sensors + AC temps
    const aspireTemp = await fetchHA('aspire', '/api/states/climate.thermostat_status_1');
    const aspireACMid = await fetchHA('aspire', '/api/states/climate.air_conditioner_status_4');
    const aspireACRear = await fetchHA('aspire', '/api/states/climate.air_conditioner_status_2');
    const aspireFreshWater = await fetchHA('aspire', '/api/states/sensor.tank_status_2');
    const aspireGrayWaste = await fetchHA('aspire', '/api/states/sensor.tank_status');
    const aspireBlackWaste = await fetchHA('aspire', '/api/states/sensor.tank_status_3');
    const aspireBattery = await fetchHA('aspire', '/api/states/sensor.dchouse_battery_ble_dchouse_soc');

    return {
      newark: {
        temperature: newark?.state || 'N/A',
        humidity: newarkHumidity?.state || 'N/A',
        frontDoor: newarkDoor?.state || 'unknown',
        garage: newarkGarage?.state || 'unknown',
        alarm: newarkAlarm?.state || 'unknown'
      },
      aspire: {
        temperature: aspireTemp?.attributes?.temperature || 'N/A',
        tempFront: aspireTemp?.attributes?.temperature || 'N/A',
        tempMid: aspireACMid?.attributes?.temperature || 'N/A',
        tempRear: aspireACRear?.attributes?.temperature || 'N/A',
        freshWater: aspireFreshWater?.state || 'N/A',
        grayWaste: aspireGrayWaste?.state || 'N/A',
        blackWaste: aspireBlackWaste?.state || 'N/A',
        battery: aspireBattery?.state || 'N/A'
      }
    };
  },

  'agents/control': async (req, body) => {
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
        req.on('end', async () => {
          const data = await handler(req, body);
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
        handler().then(data => {
          if (data) {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(data));
            console.log(`✅ API ${endpoint} returned data`);
          } else {
            res.writeHead(500);
            res.end(JSON.stringify({ error: 'Failed to fetch data' }));
          }
        }).catch(err => {
          console.error(`API error: ${endpoint}`, err);
          res.writeHead(500);
          res.end(JSON.stringify({ error: err.message }));
        });
        return;
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
