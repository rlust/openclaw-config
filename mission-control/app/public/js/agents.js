/**
 * Agent Control Panel
 * Monitor and control agents (start/stop/restart)
 */
class AgentManager {
  constructor() {
    this.agents = [];
    this.autoRefresh = CONFIG.agents.autoRefresh;
    this.refreshInterval = CONFIG.agents.refreshInterval;
  }

  async init() {
    console.log('🤖 Agent Manager initializing...');
    await this.refresh();
    
    if (this.autoRefresh) {
      setInterval(() => this.refresh(), this.refreshInterval);
      console.log(`⏱️ Agent auto-refresh enabled (${this.refreshInterval}ms)`);
    }
  }

  async refresh() {
    try {
      const response = await fetch(CONFIG.api.agents);
      if (response.ok) {
        const data = await response.json();
        this.agents = data.list || [];
        console.log(`🤖 Agents refreshed: ${this.agents.length} agents`);
        this.notifyListeners();
      }
    } catch (err) {
      console.error('Agent refresh failed:', err);
    }
  }

  async startAgent(agentId) {
    console.log(`▶️ Starting agent: ${agentId}`);
    try {
      const response = await fetch(CONFIG.api.agentControl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'start', agentId })
      });
      
      if (response.ok) {
        console.log(`✅ Agent started: ${agentId}`);
        await this.refresh();
        return true;
      }
    } catch (err) {
      console.error(`Failed to start agent ${agentId}:`, err);
    }
    return false;
  }

  async stopAgent(agentId) {
    console.log(`⏹️ Stopping agent: ${agentId}`);
    try {
      const response = await fetch(CONFIG.api.agentControl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'stop', agentId })
      });
      
      if (response.ok) {
        console.log(`✅ Agent stopped: ${agentId}`);
        await this.refresh();
        return true;
      }
    } catch (err) {
      console.error(`Failed to stop agent ${agentId}:`, err);
    }
    return false;
  }

  async restartAgent(agentId) {
    console.log(`🔄 Restarting agent: ${agentId}`);
    try {
      const response = await fetch(CONFIG.api.agentControl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'restart', agentId })
      });
      
      if (response.ok) {
        console.log(`✅ Agent restarted: ${agentId}`);
        await this.refresh();
        return true;
      }
    } catch (err) {
      console.error(`Failed to restart agent ${agentId}:`, err);
    }
    return false;
  }

  getAgentsByCategory(category) {
    const categoryAgents = CONFIG.agents.categories[category] || [];
    return this.agents.filter(a => categoryAgents.includes(a.id));
  }

  getAllCategories() {
    return Object.keys(CONFIG.agents.categories);
  }

  // Observer pattern for UI updates
  listeners = [];

  subscribe(callback) {
    this.listeners.push(callback);
    // Call immediately with current state
    callback(this.agents);
  }

  notifyListeners() {
    this.listeners.forEach(cb => cb(this.agents));
  }

  getStatus(agent) {
    const icons = {
      'running': '▶️',
      'idle': '⏸️',
      'error': '❌',
      'stopped': '⏹️'
    };
    return icons[agent.status] || '❓';
  }
}

/**
 * Agent Control UI
 * Renders agent panel and handles interactions
 */
class AgentControlUI {
  constructor(agentManager) {
    this.manager = agentManager;
    this.manager.subscribe(agents => this.render(agents));
  }

  render(agents) {
    const container = document.querySelector('[data-panel="agents"]');
    if (!container) return;

    const categories = this.manager.getAllCategories();
    let html = '';

    for (const category of categories) {
      const catAgents = this.manager.getAgentsByCategory(category);
      if (catAgents.length === 0) continue;

      html += `<div class="agent-category">
        <h4>${category}</h4>
        <div class="agent-list">`;

      for (const agent of catAgents) {
        const statusIcon = this.manager.getStatus(agent);
        html += `
          <div class="agent-item ${agent.status}">
            <div class="agent-header">
              <span class="agent-icon">${statusIcon}</span>
              <span class="agent-name">${agent.id}</span>
              <span class="agent-lastrun">${agent.lastRun || 'never'}</span>
            </div>
            <div class="agent-controls">
              <button class="btn-small" onclick="agentUI.start('${agent.id}')">Start</button>
              <button class="btn-small" onclick="agentUI.stop('${agent.id}')">Stop</button>
              <button class="btn-small" onclick="agentUI.restart('${agent.id}')">Restart</button>
            </div>
          </div>`;
      }

      html += `</div></div>`;
    }

    container.innerHTML = html;
  }

  async start(agentId) {
    await this.manager.startAgent(agentId);
  }

  async stop(agentId) {
    await this.manager.stopAgent(agentId);
  }

  async restart(agentId) {
    await this.manager.restartAgent(agentId);
  }
}

// Global instance
window.AgentManager = AgentManager;
window.agentManager = null;
window.agentUI = null;

document.addEventListener('DOMContentLoaded', async () => {
  window.agentManager = new AgentManager();
  window.agentUI = new AgentControlUI(window.agentManager);
  await window.agentManager.init();
});
