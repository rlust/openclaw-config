/**
 * Home Assistant Integration
 * Connects to HA instances and pulls live entity data
 */
class HomeAssistantClient {
  constructor(instance) {
    this.instance = instance;
    this.entities = {};
    this.connected = false;
  }

  async connect() {
    try {
      console.log(`🏠 Connecting to ${this.instance.name}...`);
      
      // Test connection
      const response = await fetch(`${this.instance.url}/api/`, {
        headers: { 'Authorization': `Bearer ${this.instance.token}` }
      });

      if (response.ok) {
        this.connected = true;
        console.log(`✅ Connected to ${this.instance.name}`);
        return true;
      }
    } catch (err) {
      console.warn(`⚠️ Could not connect to ${this.instance.name}:`, err.message);
    }

    this.connected = false;
    return false;
  }

  async getEntity(entityId) {
    if (!this.connected) return null;

    try {
      const response = await fetch(
        `${this.instance.url}/api/states/${entityId}`,
        { headers: { 'Authorization': `Bearer ${this.instance.token}` } }
      );

      if (response.ok) {
        const data = await response.json();
        this.entities[entityId] = data;
        return data;
      }
    } catch (err) {
      console.warn(`Entity fetch failed: ${entityId}`, err);
    }

    return null;
  }

  async getEntities(entityIds) {
    const results = {};
    const promises = entityIds.map(async id => {
      const data = await this.getEntity(id);
      if (data) results[id] = data;
    });

    await Promise.all(promises);
    return results;
  }

  async callService(domain, service, data) {
    if (!this.connected) return false;

    try {
      const response = await fetch(
        `${this.instance.url}/api/services/${domain}/${service}`,
        {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${this.instance.token}` },
          body: JSON.stringify(data)
        }
      );

      return response.ok;
    } catch (err) {
      console.error(`Service call failed: ${domain}/${service}`, err);
      return false;
    }
  }
}

/**
 * Home Assistant Data Manager
 * Manages both HA instances and exposes clean API
 */
class HomeAssistantManager {
  constructor() {
    this.clients = {};
    this.data = {
      newark: null,
      aspire: null
    };
  }

  async init() {
    console.log('🏠 Initializing Home Assistant Manager...');

    // Connect to available HA instances
    for (const [key, config] of Object.entries(CONFIG.homeAssistant)) {
      if (config.enabled) {
        const client = new HomeAssistantClient(config);
        if (await client.connect()) {
          this.clients[key] = client;
        }
      }
    }

    if (Object.keys(this.clients).length > 0) {
      console.log(`✅ Connected to ${Object.keys(this.clients).length} HA instances`);
    } else {
      console.warn('⚠️ No Home Assistant instances available');
    }
  }

  async getNewarkHealth() {
    const client = this.clients.newark;
    if (!client) return null;

    try {
      const entities = await client.getEntities([
        'sensor.family_room_temperature',
        'sensor.family_room_humidity',
        'binary_sensor.front_door',
        'cover.garage_door',
        'alarm_control_panel.omnilink_area_1'
      ]);

      return {
        temperature: entities['sensor.family_room_temperature']?.state || 'N/A',
        humidity: entities['sensor.family_room_humidity']?.state || 'N/A',
        frontDoor: entities['binary_sensor.front_door']?.state || 'unknown',
        garage: entities['cover.garage_door']?.state || 'unknown',
        alarm: entities['alarm_control_panel.omnilink_area_1']?.state || 'unknown'
      };
    } catch (err) {
      console.error('Newark health fetch failed:', err);
      return null;
    }
  }

  async getAspireHealth() {
    const client = this.clients.aspire;
    if (!client) return null;

    try {
      const entities = await client.getEntities([
        'sensor.aspire_thermostat_temp',
        'climate.aspire_ac',
        'sensor.water_tank',
        'sensor.chassis_battery'
      ]);

      return {
        temperature: entities['sensor.aspire_thermostat_temp']?.state || 'N/A',
        acStatus: entities['climate.aspire_ac']?.state || 'unknown',
        water: entities['sensor.water_tank']?.state || 'N/A',
        battery: entities['sensor.chassis_battery']?.state || 'N/A'
      };
    } catch (err) {
      console.error('Aspire health fetch failed:', err);
      return null;
    }
  }

  async controlLock(instance, lockId, action) {
    const client = this.clients[instance];
    if (!client) return false;

    const service = action === 'lock' ? 'lock' : 'unlock';
    return await client.callService('lock', service, { entity_id: lockId });
  }

  async controlThermostat(instance, climateId, temperature) {
    const client = this.clients[instance];
    if (!client) return false;

    return await client.callService('climate', 'set_temperature', {
      entity_id: climateId,
      temperature: temperature
    });
  }
}

// Initialize on window load
window.HomeAssistantManager = HomeAssistantManager;
window.haManager = null;

document.addEventListener('DOMContentLoaded', async () => {
  window.haManager = new HomeAssistantManager();
  await window.haManager.init();
});
