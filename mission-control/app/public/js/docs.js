/**
 * Documentation Manager - Searchable docs for all applications
 */
class DocsManager {
  constructor() {
    this.docs = [
      {
        id: 'mission-control',
        title: 'Mission Control Dashboard',
        category: 'Dashboard',
        content: `# Mission Control Dashboard

**URL:** http://127.0.0.1:18888
**Access:** Local (no auth needed)

Real-time monitoring of homes, RV, agents, and scheduled jobs.

## Features
- **Newark Home** - Temperature, humidity, doors, garage, alarm (live HA)
- **Aspire RV** - AC temps (3 zones), tank levels, battery (live RVC)
- **Schedule** - 7-day calendar of all cron jobs, color-coded by type
- **Costs** - Monthly breakdown (~$23.14)
- **Agents** - Running/idle/error counts with start/stop controls

## Data Sources
- Newark HA: https://ykm02dybhyaob0myui6lj13x8kl7n996.ui.nabu.casa
- Aspire HA: https://xrragqdun8wc4zeezbrx0q7ge9xzzrcw.ui.nabu.casa
- Lust Rentals: http://100.78.223.120:8000
- Kanban: http://localhost:5000

## Tools
\`node discover-ha.js\` - Find all Home Assistant entities`
      },
      {
        id: 'lust-rentals',
        title: 'Lust Rentals App',
        category: 'Application',
        content: `# Lust Rentals Property Management

**URL:** http://100.78.223.120:8000/dashboard
**Username:** N/A
**Password:** N/A

Manage rental properties with revenue tracking and Excel export.

## Features
- Property list + status
- Monthly revenue
- Transaction creation
- Excel export (Property | Date | Amount)
- Dashboard charts

## Monitoring
- Hourly status check (cron)
- Auto-restart if down
- Cost: $0 (Ollama)

## Status Check
\`curl http://100.78.223.120:8000\``
      },
      {
        id: 'kanban',
        title: 'Kanban Board',
        category: 'Application',
        content: `# Kanban v3 - Task Board

**URL:** http://localhost:5000
**Username:** N/A
**Password:** N/A

Simple task management with drag-and-drop.

## Features
- Columns: To Do, In Progress, Done
- Recurring task support
- Local storage persistence
- Python backend

## Start
\`cd workspace && python3 kanban-server-v3.py\`

## Monitoring
- Every 5 minutes: systemEvent check
- Auto-restart if down
- Cost: $0`
      },
      {
        id: 'home-assistant',
        title: 'Home Assistant Setup',
        category: 'Smart Home',
        content: `# Home Assistant Integration

## Instances

### Newark Home (Nabu Casa)
**URL:** https://ykm02dybhyaob0myui6lj13x8kl7n996.ui.nabu.casa
**Token:** In .credentials
**Entities:**
- sensor.family_room_temperature
- sensor.family_room_humidity
- binary_sensor.front_door
- cover.garage_door
- alarm_control_panel.omnilink_area_1

### Aspire RV (Nabu Casa)
**URL:** https://xrragqdun8wc4zeezbrx0q7ge9xzzrcw.ui.nabu.casa
**Token:** In .credentials
**Entities:**
- climate.thermostat_status_1 (Front AC)
- climate.air_conditioner_status_4 (Mid AC)
- climate.air_conditioner_status_2 (Rear AC)
- sensor.tank_status_2 (Fresh water)
- sensor.tank_status (Gray waste)
- sensor.tank_status_3 (Black waste)
- sensor.dchouse_battery_ble_dchouse_soc (Battery)

## Tools
\`node discover-ha.js\` - List all entities`
      },
      {
        id: 'investment-analyzer',
        title: 'Investment Market Analyzer',
        category: 'Agent',
        content: `# Investment Market Analyzer

**Schedule:** 4:00 PM EST, Mon-Fri
**Cron:** \`0 16 * * 1-5\`
**Output:** Discord message

Automated stock analysis with technical, sentiment, and portfolio data.

## Pipeline
1. **Scout** - Fetch market data
2. **Researcher** - Technical + Sentiment + Earnings
3. **Writer** - Format Discord message

## Stocks
NVDA, VRT, ANET, PLTR, MRVL, NET (AI sector)

## Cost
~$0.002/run (Haiku)`
      }
    ];
  }

  init() {
    console.log('📚 Docs Manager initialized');
    this.render();
    this.setupSearch();
  }

  render() {
    const container = document.querySelector('[data-panel="docs-list"]');
    if (!container) return;

    let html = '<div class="docs-list">';
    this.docs.forEach(doc => {
      html += `
        <div class="doc-item" data-doc-id="${doc.id}">
          <div class="doc-header">
            <h3>${doc.title}</h3>
            <span class="doc-category">${doc.category}</span>
          </div>
          <p class="doc-preview">${doc.content.split('\n')[2] || 'Documentation'}</p>
        </div>`;
    });
    html += '</div>';

    const viewContainer = document.querySelector('[data-panel="docs-view"]');
    if (viewContainer) {
      viewContainer.innerHTML = `
        <div class="doc-content">
          <h2>Welcome to Documentation</h2>
          <p>Click a document to view full details.</p>
        </div>`;
    }

    container.innerHTML = html;
    this.attachListeners();
  }

  attachListeners() {
    document.querySelectorAll('.doc-item').forEach(item => {
      item.addEventListener('click', () => {
        const docId = item.dataset.docId;
        this.viewDoc(docId);
      });
    });
  }

  viewDoc(docId) {
    const doc = this.docs.find(d => d.id === docId);
    if (!doc) return;

    // Highlight selected doc
    document.querySelectorAll('.doc-item').forEach(item => {
      item.classList.remove('active');
    });
    document.querySelector(`[data-doc-id="${docId}"]`).classList.add('active');

    // Show content
    const viewContainer = document.querySelector('[data-panel="docs-view"]');
    if (viewContainer) {
      viewContainer.innerHTML = `<div class="doc-content markdown-content">${this.renderMarkdown(doc.content)}</div>`;
    }
  }

  renderMarkdown(md) {
    return md
      .replace(/^# (.*?)$/gm, '<h1>$1</h1>')
      .replace(/^## (.*?)$/gm, '<h2>$1</h2>')
      .replace(/^### (.*?)$/gm, '<h3>$1</h3>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\`(.*?)\`/g, '<code>$1</code>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/^- (.*?)$/gm, '<li>$1</li>')
      .replace(/\n/g, '<br>');
  }

  setupSearch() {
    const searchInput = document.querySelector('[data-panel="docs-search"]');
    if (!searchInput) return;

    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase();
      this.search(query);
    });
  }

  search(query) {
    if (!query) {
      this.render();
      return;
    }

    const results = this.docs.filter(doc => {
      const titleMatch = doc.title.toLowerCase().includes(query);
      const contentMatch = doc.content.toLowerCase().includes(query);
      const categoryMatch = doc.category.toLowerCase().includes(query);
      return titleMatch || contentMatch || categoryMatch;
    });

    const container = document.querySelector('[data-panel="docs-list"]');
    if (!container) return;

    let html = '<div class="docs-list">';
    if (results.length === 0) {
      html += '<p style="color: #9fb0d6; padding: 20px;">No results found.</p>';
    } else {
      results.forEach(doc => {
        html += `
          <div class="doc-item" data-doc-id="${doc.id}">
            <div class="doc-header">
              <h3>${doc.title}</h3>
              <span class="doc-category">${doc.category}</span>
            </div>
            <p class="doc-preview">${doc.content.split('\n')[2] || 'Documentation'}</p>
          </div>`;
      });
    }
    html += '</div>';

    container.innerHTML = html;
    this.attachListeners();
  }
}

// Initialize on page load
window.DocsManager = DocsManager;
window.docsManager = null;

document.addEventListener('DOMContentLoaded', () => {
  window.docsManager = new DocsManager();
  window.docsManager.init();
  console.log('✅ Docs Manager loaded');
});
