/**
 * Configuration for Mission Control
 * Home Assistant URLs and tokens
 */
const CONFIG = {
  // Home Assistant Instances
  homeAssistant: {
    // Newark Home (main house)
    newark: {
      name: 'Newark Home',
      enabled: true,
      url: 'http://localhost:8123', // Will be overridden by server
      token: null, // Server will inject from .credentials
      entities: {
        temperature: 'sensor.family_room_temperature',
        humidity: 'sensor.family_room_humidity',
        mainDoor: 'binary_sensor.front_door',
        garageDoor: 'cover.garage_door',
        alarm: 'alarm_control_panel.omnilink_area_1'
      }
    },
    // Aspire RV
    aspire: {
      name: 'Aspire RV',
      enabled: false, // Will enable if available
      url: null, // Local network IP
      token: null,
      entities: {
        temperature: 'sensor.aspire_thermostat_temp',
        acStatus: 'climate.aspire_ac',
        waterLevel: 'sensor.water_tank',
        battery: 'sensor.chassis_battery'
      }
    }
  },

  // Agent Control Configuration
  agents: {
    autoRefresh: true,
    refreshInterval: 30000, // 30 seconds
    maxAgents: 20,
    categories: {
      'Stock': ['scout', 'analyst', 'reporter'],
      'Development': ['coder', 'reviewer', 'debugger'],
      'Monitoring': ['monitor', 'alerter', 'health-check'],
      'Content': ['writer', 'editor', 'publisher']
    }
  },

  // Dashboard Configuration
  dashboard: {
    refreshInterval: 20000, // 20 seconds
    theme: 'dark',
    autoRefreshEnabled: true,
    cacheDuration: 5000 // Cache data for 5 seconds
  },

  // API Endpoints
  api: {
    health: '/api/health',
    costs: '/api/costs',
    agents: '/api/agents',
    piwigo: '/api/piwigo',
    homeAssistant: '/api/homeassistant',
    agentControl: '/api/agents/control'
  }
};

// Configuration initialization
function initConfig() {
  console.log('⚙️ Configuration loaded');
  console.log('  Home Assistant (Newark):', CONFIG.homeAssistant.newark.enabled ? '✓' : '✗');
  console.log('  Home Assistant (Aspire):', CONFIG.homeAssistant.aspire.enabled ? '✓' : '✗');
  console.log('  Agent refresh:', CONFIG.agents.autoRefresh ? 'enabled' : 'disabled');
  console.log('  Dashboard refresh:', CONFIG.dashboard.refreshInterval + 'ms');
}

// Export for use in other modules
window.CONFIG = CONFIG;
window.initConfig = initConfig;
