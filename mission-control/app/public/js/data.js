/**
 * DataManager - Fetches and manages all dashboard data
 * Handles Home Assistant, cost tracking, agent status, etc.
 */
class DataManager {
  constructor() {
    this.data = {
      health: { mac: {}, vps: {} },
      costs: { daily: 0, monthly: 0 },
      agents: { running: 0, idle: 0, error: 0 },
      piwigo: { transferred: '0GB', total: '0GB', percent: 0 },
      tasks: [],
      lastUpdate: null
    };
    this.refreshInterval = 20000; // 20 seconds
    this.isRefreshing = false;
  }

  async init() {
    console.log('📊 DataManager initializing...');
    await this.refresh();
    this.startAutoRefresh();
  }

  async refresh() {
    if (this.isRefreshing) return;
    this.isRefreshing = true;

    try {
      console.log('🔄 Refreshing dashboard data...');
      
      // Fetch all data in parallel
      const [health, costs, agents, piwigo] = await Promise.all([
        this.fetchHealth(),
        this.fetchCosts(),
        this.fetchAgents(),
        this.fetchPiwigo()
      ]);

      this.data.health = health;
      this.data.costs = costs;
      this.data.agents = agents;
      this.data.piwigo = piwigo;
      this.data.lastUpdate = new Date();

      console.log('✅ Data refreshed', this.data);
      this.notifyListeners();
    } catch (err) {
      console.error('❌ Data refresh failed:', err);
    } finally {
      this.isRefreshing = false;
    }
  }

  startAutoRefresh() {
    setInterval(() => this.refresh(), this.refreshInterval);
    console.log(`⏱️ Auto-refresh enabled (every ${this.refreshInterval/1000}s)`);
  }

  async fetchHealth() {
    try {
      // Try to get real data from Home Assistant
      const response = await fetch('/api/health');
      if (response.ok) {
        return await response.json();
      }
    } catch (err) {
      console.warn('Health API unavailable, using mock data');
    }

    // Mock data fallback
    return {
      mac: {
        cpu: Math.floor(Math.random() * 80) + 20,
        memory: Math.floor(Math.random() * 75) + 25,
        disk: 85
      },
      vps: {
        cpu: Math.floor(Math.random() * 60) + 15,
        memory: Math.floor(Math.random() * 50) + 20,
        disk: 55
      }
    };
  }

  async fetchCosts() {
    try {
      const response = await fetch('/api/costs');
      if (response.ok) {
        return await response.json();
      }
    } catch (err) {
      console.warn('Costs API unavailable, using mock data');
    }

    return {
      daily: 0.32,
      dailyCap: 5.0,
      monthly: 18.47,
      monthlyCap: 100.0,
      models: {
        'Claude': { cost: 8.23, percent: 45 },
        'Gemini': { cost: 5.12, percent: 28 },
        'GPT': { cost: 4.31, percent: 23 },
        'Local': { cost: 0.81, percent: 4 }
      }
    };
  }

  async fetchAgents() {
    try {
      const response = await fetch('/api/agents');
      if (response.ok) {
        return await response.json();
      }
    } catch (err) {
      console.warn('Agents API unavailable, using mock data');
    }

    return {
      running: 5,
      idle: 8,
      error: 2,
      list: [
        { id: 'scout', status: 'running', lastRun: '2m ago' },
        { id: 'researcher', status: 'idle', lastRun: '1h ago' },
        { id: 'writer', status: 'idle', lastRun: '3h ago' },
        { id: 'monitor', status: 'running', lastRun: '30s ago' }
      ]
    };
  }

  async fetchPiwigo() {
    try {
      const response = await fetch('/api/piwigo');
      if (response.ok) {
        return await response.json();
      }
    } catch (err) {
      console.warn('Piwigo API unavailable, using mock data');
    }

    return {
      transferred: '2.7 GB',
      total: '7.8 GB',
      percent: 35,
      galleries: 37,
      galleriesTotal: 37,
      eta: '~45 minutes',
      status: 'Running'
    };
  }

  // Observer pattern for reactive updates
  listeners = [];

  subscribe(callback) {
    this.listeners.push(callback);
  }

  notifyListeners() {
    this.listeners.forEach(cb => cb(this.data));
  }
}

/**
 * DashboardRenderer - Updates UI with data
 */
class DashboardRenderer {
  constructor(dataManager) {
    this.data = dataManager;
    this.data.subscribe(data => this.render(data));
  }

  render(data) {
    console.log('🎨 Rendering dashboards...');
    this.renderHealth(data.health);
    this.renderCosts(data.costs);
    this.renderAgents(data.agents);
    this.renderPiwigo(data.piwigo);
  }

  renderHealth(health) {
    // Mac Mini
    const macCpu = document.querySelector('[data-metric="mac-cpu"]');
    const macMem = document.querySelector('[data-metric="mac-memory"]');
    const macDisk = document.querySelector('[data-metric="mac-disk"]');

    if (macCpu) {
      macCpu.querySelector('.value').textContent = health.mac.cpu + '%';
      macCpu.querySelector('.fill').style.width = health.mac.cpu + '%';
      macCpu.querySelector('.fill').className = 'fill ' + this.getHealthClass(health.mac.cpu);
    }
    if (macMem) {
      macMem.querySelector('.value').textContent = health.mac.memory + '%';
      macMem.querySelector('.fill').style.width = health.mac.memory + '%';
      macMem.querySelector('.fill').className = 'fill ' + this.getHealthClass(health.mac.memory);
    }
    if (macDisk) {
      macDisk.querySelector('.value').textContent = health.mac.disk + '%';
      macDisk.querySelector('.fill').style.width = health.mac.disk + '%';
      macDisk.querySelector('.fill').className = 'fill ' + this.getHealthClass(health.mac.disk);
    }

    // Hetzner VPS
    const vpsCpu = document.querySelector('[data-metric="vps-cpu"]');
    const vpsMem = document.querySelector('[data-metric="vps-memory"]');
    const vpsDisk = document.querySelector('[data-metric="vps-disk"]');

    if (vpsCpu) {
      vpsCpu.querySelector('.value').textContent = health.vps.cpu + '%';
      vpsCpu.querySelector('.fill').style.width = health.vps.cpu + '%';
      vpsCpu.querySelector('.fill').className = 'fill ' + this.getHealthClass(      health.vps.cpu);
      vpsMem.querySelector('.fill').className = 'fill ' + this.getHealthClass(health.vps.memory);
    }
    if (vpsDisk) {
      vpsDisk.querySelector('.value').textContent = health.vps.disk + '%';
      vpsDisk.querySelector('.fill').style.width = health.vps.disk + '%';
      vpsDisk.querySelector('.fill').className = 'fill ' + this.getHealthClass(health.vps.disk);
    }
  }

  renderCosts(costs) {
    const dailyPct = (costs.daily / costs.dailyCap) * 100;
    const monthlyPct = (costs.monthly / costs.monthlyCap) * 100;

    const daily = document.querySelector('[data-metric="cost-daily"]');
    if (daily) {
      daily.querySelector('.value').textContent = `$${costs.daily.toFixed(2)} / $${costs.dailyCap}`;
      daily.querySelector('.fill').style.width = dailyPct + '%';
      daily.querySelector('.fill').className = 'fill ' + (dailyPct > 75 ? 'bad' : dailyPct > 50 ? 'warn' : '');
    }

    const monthly = document.querySelector('[data-metric="cost-monthly"]');
    if (monthly) {
      monthly.querySelector('.value').textContent = `$${costs.monthly.toFixed(2)} / $${costs.monthlyCap}`;
      monthly.querySelector('.fill').style.width = monthlyPct + '%';
      monthly.querySelector('.fill').className = 'fill ' + (monthlyPct > 75 ? 'bad' : monthlyPct > 50 ? 'warn' : '');
    }
  }

  renderAgents(agents) {
    const el = document.querySelector('[data-metric="agents"]');
    if (el) {
      el.innerHTML = `
        <div class="agent-stat"><span class="ok">●</span> ${agents.running} Running</div>
        <div class="agent-stat"><span class="muted">●</span> ${agents.idle} Idle</div>
        <div class="agent-stat"><span class="bad">●</span> ${agents.error} Error</div>
      `;
    }
  }

  renderPiwigo(piwigo) {
    const el = document.querySelector('[data-metric="piwigo"]');
    if (el) {
      el.innerHTML = `
        <div class="stat">
          <span>${piwigo.transferred} / ${piwigo.total}</span>
          <div class="progress"><div class="fill" style="width: ${piwigo.percent}%"></div></div>
          <span class="value">${piwigo.percent}%</span>
        </div>
        <div style="margin-top: 10px; font-size: 12px; color: #9fb0d6;">
          Galleries: ${piwigo.galleries}/${piwigo.galleriesTotal} | ETA: ${piwigo.eta} | ${piwigo.status}
        </div>
      `;
    }
  }

  getHealthClass(percent) {
    if (percent > 80) return 'bad';
    if (percent > 60) return 'warn';
    return '';
  }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 Mission Control with real data starting...');

  const dataManager = new DataManager();
  const renderer = new DashboardRenderer(dataManager);
  const tabManager = new TabManager();

  // Initialize everything
  dataManager.init();
  tabManager.init();

  // Handle browser back/forward
  window.addEventListener('hashchange', () => {
    const tabId = window.location.hash.slice(1) || 'overview';
    tabManager.switchTab(tabId);
  });

  // Set initial tab
  const initialTab = window.location.hash.slice(1) || 'overview';
  tabManager.switchTab(initialTab);

  console.log('✅ Mission Control ready with auto-refresh!');
});
