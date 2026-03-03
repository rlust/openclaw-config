/**
 * Documentation Manager v2 - Categorized docs with full history
 */
class DocsManager {
  constructor() {
    this.categories = [
      'Dashboard',
      'Applications',
      'Smart Home',
      'Agents',
      'Configuration',
      'RV Systems',
      'Development',
      'System'
    ];

    this.docs = [
      // ===== DASHBOARD =====
      {
        id: 'mission-control',
        title: 'Mission Control Dashboard',
        category: 'Dashboard',
        date: '2026-03-02',
        content: `# Mission Control Dashboard

**URL:** http://127.0.0.1:18888
**Access:** Local (no auth needed)
**Created:** Mar 2, 2026

Real-time monitoring of homes, RV, agents, and scheduled jobs.

## Features
- **Newark Home** - Temperature, humidity, doors, garage, alarm (live HA)
- **Aspire RV** - AC temps (3 zones), tank levels, battery (live RVC)
- **Schedule** - 7-day calendar of all cron jobs, color-coded by type
- **Costs** - Monthly breakdown (~$23.14)
- **Agents** - Running/idle/error counts

## Data Sources
- Newark HA: https://ykm02dybhyaob0myui6lj13x8kl7n996.ui.nabu.casa
- Aspire HA: https://xrragqdun8wc4zeezbrx0q7ge9xzzrcw.ui.nabu.casa
- Lust Rentals: http://100.78.223.120:8000
- Kanban: http://localhost:5000`
      },

      // ===== APPLICATIONS =====
      {
        id: 'lust-rentals',
        title: 'Lust Rentals App',
        category: 'Applications',
        date: '2026-02-08',
        content: `# Lust Rentals Property Management

**URL:** http://100.78.223.120:8000/dashboard
**Username:** N/A (open access)
**Password:** N/A
**Created:** Feb 8, 2026

Manage rental properties with revenue tracking and Excel export.

## Features
- Property list + status
- Monthly revenue tracking
- Transaction creation (manual)
- Excel export (Property | Date | Amount)
- Dashboard charts

## Monitoring
- Hourly status check (cron)
- Auto-restart if down
- Cost: $0 (Ollama)

## Excel Format
Columns: Property | Date | Amount`
      },
      {
        id: 'kanban',
        title: 'Kanban Board (v3)',
        category: 'Applications',
        date: '2026-02-03',
        content: `# Kanban v3 - Task Board

**URL:** http://localhost:5000
**Username:** N/A
**Password:** N/A
**Created:** Feb 3, 2026 (v3 Recurring update)

Simple task management with drag-and-drop and recurring task support.

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
        id: 'piwigo',
        title: 'Piwigo Photo Gallery',
        category: 'Applications',
        date: '2026-03-01',
        content: `# Piwigo Photo Gallery

**URL:** https://5.161.111.192 (self-signed) or http://5.161.111.192:8080
**Admin:** http://5.161.111.192:8080/admin.php
**Domain:** rlust.com (waiting DNS propagation)
**Created:** Mar 1, 2026

Self-hosted photo gallery on Hetzner VPS.

## Access
- Server IP: 5.161.111.192
- SSH: ssh -i ~/.ssh/rlust-vps root@5.161.111.192
- Database: MariaDB (piwigo/piwigo_secure)
- Status: Live and ready for photo uploads

## Setup
- Ubuntu 24.04 on Hetzner
- Docker containers (Nginx, Piwigo, MariaDB)
- Self-signed SSL (will auto-upgrade to Let's Encrypt)

## Next
- Export from Zenfolio
- Upload to Piwigo`
      },

      // ===== SMART HOME =====
      {
        id: 'home-assistant',
        title: 'Home Assistant Setup',
        category: 'Smart Home',
        date: '2026-02-25',
        content: `# Home Assistant Integration

**Created:** Feb 25, 2026

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

      // ===== AGENTS =====
      {
        id: 'investment-analyzer',
        title: 'Investment Market Analyzer',
        category: 'Agents',
        date: '2026-02-25',
        content: `# Investment Market Analyzer

**Schedule:** 4:00 PM EST, Mon-Fri
**Cron:** \`0 16 * * 1-5\`
**Output:** Discord message
**Created:** Feb 25, 2026

Automated stock analysis with technical, sentiment, and portfolio data.

## Pipeline
1. **Scout** - Fetch market data
2. **Researcher** - Technical + Sentiment + Earnings
3. **Writer** - Format Discord message

## Stocks Tracked
NVDA, VRT, ANET, PLTR, MRVL, NET (AI sector)

## Features
- Technical analysis
- Sentiment analysis
- Earnings impact
- Portfolio impact
- Buy/sell signals

## Cost
~$0.002/run (Haiku)`
      },

      // ===== CONFIGURATION =====
      {
        id: 'cron-jobs',
        title: 'Cron Jobs Configuration',
        category: 'Configuration',
        date: '2026-02-08',
        content: `# OpenClaw Cron Jobs

**Created:** Feb 8, 2026
**Updated:** Feb 28, 2026

## Active Jobs

### Monitoring (24/7)
- **Kanban Monitor** - Every 5 min (systemEvent)
- **Lust Rentals Monitor** - Every 1 hr (Ollama)
- **Water Heater Monitor** - Every 4 hrs (Haiku, $0.0008/run)

### Daily (8-9 AM EST)
- System Review (Ollama)
- Newark Report (Ollama)
- Camera Snapshots (Ollama)

### Hourly (4x Daily)
- Hourly Updates (9:30, 10:30, 11:30, 12:30 AM EST, Haiku, $0.008/run)

### Market (4 PM EST, Mon-Fri)
- Market Close Summary (systemEvent)
- Investment Report (Haiku, $0.002/run)

## Monthly Cost: ~$23.14
- Water Heater: ~$0.14
- Hourly Updates: ~$23.00
- All Ollama jobs: Free (local)`
      },
      {
        id: 'heartbeat',
        title: 'Heartbeat Configuration',
        category: 'Configuration',
        date: '2026-02-28',
        content: `# Proactive Monitoring (Heartbeat)

**Created:** Feb 28, 2026

## Purpose
Background checks that run every 30 minutes for proactive monitoring.

## Checks
1. **Rate limit monitoring** - Watch for 429 errors
2. **Aspire RV Home Assistant** - Check for updates & alerts
3. **Newark Home HA** - Temp alerts (<40°F), security, motion
4. **OpenClaw news/updates** - Check web for new features
5. **System alerts** - Important notifications
6. **Model accessibility** - Verify Claude + Gemini working

## Alert Actions
- **429 error** → Alert immediately in Telegram
- **Temp/Security Alert** → Notify in Telegram
- Update HAL calendar with alerts

## Priority Reports
- **7:00 AM ET** - RV-C HVAC project update summary`
      },
      {
        id: 'openclaw-config',
        title: 'OpenClaw Configuration',
        category: 'Configuration',
        date: '2026-02-15',
        content: `# OpenClaw Configuration Reference

**Created:** Feb 15, 2026

Key configuration files for OpenClaw setup.

## Files
- openclaw.yaml - Main config
- gateway config - Services & routing
- Agent configs - Sub-agent setup
- Cron definitions - Job scheduling

## Gateway Service
\`\`\`bash
openclaw gateway status
openclaw gateway start/stop/restart
\`\`\`

## Model Configuration
Default: Haiku (cost optimization)
Premium: Sonnet (complex tasks)
Local: Ollama (free execution)`
      },

      // ===== RV SYSTEMS =====
      {
        id: 'rvc-hvac',
        title: 'RV-C HVAC Command Center',
        category: 'RV Systems',
        date: '2026-02-25',
        content: `# RV-C HVAC Command Center

**Status:** Framework ready, awaiting Aspire RV
**Created:** Feb 25, 2026

Full framework for thermostat control via RV-C bus.

## Components
- **Hardware:** RV-C Bridge v0.1 (Dual CAN + Ethernet)
- **Software:** Python thermostat_command_bridge.py
- **Integration:** Home Assistant custom integration
- **Control:** Discord dashboard + REST API

## Aspire Setup
- PGN Mapping (thermostat commands, safety limits, MQTT topics)
- Entity IDs for HA
- Existing RV-C infrastructure (verified)

## Commands
- Set temperature (Front, Mid, Rear)
- Get current temps
- Safety limits enforcement
- MQTT topic mapping

## Files
- roc-mqtt-custom/ (integration)
- scripts/ (Python bridge)
- agent framework (Discord bot)`
      },
      {
        id: 'rvc-entity-map',
        title: 'Aspire RV-C Entity Map',
        category: 'RV Systems',
        date: '2026-02-25',
        content: `# Aspire RV-C Entity Map & Configuration

**Created:** Feb 25, 2026

Complete entity mapping for Aspire motorhome.

## Climate Control
- climate.thermostat_status_1 - Front AC
- climate.air_conditioner_status_4 - Mid AC
- climate.air_conditioner_status_2 - Rear AC

## Tank Monitoring
- sensor.tank_status_2 - Fresh Water (71.4%)
- sensor.tank_status - Gray Waste (0%)
- sensor.tank_status_3 - Black Waste (50%)

## Power
- sensor.dchouse_battery_ble_dchouse_soc - Main Battery (85%)

## Areas
- Kitchen, Bedroom, Living Room
- Bathroom Mid, Bathroom Rear
- Media, Security, Awning, Outside`
      },
      {
        id: 'rv-thermostat-pgn',
        title: 'RV-C Thermostat PGN Codes',
        category: 'RV Systems',
        date: '2026-02-16',
        content: `# RV-C Thermostat PGN Codes

**Created:** Feb 16, 2026

Complete reference for RV-C thermostat control via PGN messages.

## Key PGNs
- **0x1FEF9** - Thermostat command
- **0x1FEF8** - Thermostat status
- Temperature setpoint encoding
- Mode selection (Heat/Cool/Auto)
- Safety limit enforcement

## Byte Layouts
Detailed byte-by-byte breakdown for:
- Temperature values
- Mode bits
- Safety flags
- Zone selection`
      },
      {
        id: 'rvc-bridge-hardware',
        title: 'RV-C Bridge Hardware v0.1',
        category: 'RV Systems',
        date: '2026-02-14',
        content: `# RV-C Bridge — Hardware v0.1

**Status:** KiCad-ready, automotive-grade
**Created:** Feb 14, 2026

Dual CAN + Ethernet bridge for RV-C integration.

## Specs
- Dual CAN ports (isolated)
- Ethernet connection
- Automotive-grade components
- KiCad design files included
- Pluggable connectors

## Use Case
Bridge RV-C bus to Home Assistant via MQTT over Ethernet.`
      },

      // ===== DEVELOPMENT =====
      {
        id: 'kanban-v3-changelog',
        title: 'Kanban v3 - Recurring Tasks Update',
        category: 'Development',
        date: '2026-02-03',
        content: `# Kanban Calendar v3 - Recurring Tasks Update

**Release Date:** Feb 3, 2026

Changelog for Kanban v3 Phase 2 update.

## Features Added
- Recurring task support
- Cron-style scheduling
- Auto-creation of repeated tasks
- Task completion tracking

## Files
- kanban-server-v3.py
- Updated UI with recurring options`
      },
      {
        id: 'lust-rentals-reporting',
        title: 'Lust Rentals Reporting System',
        category: 'Development',
        date: '2026-02-08',
        content: `# Lust Rentals - Reporting Solution

**Created:** Feb 8, 2026

Comprehensive Excel reporting system for tax tracking.

## Features
- Property-based categorization
- Monthly summaries
- Tax report generation
- Excel export with formatting

## Fix Applied
- Excel export now uses 3-column format
- Category overrides working correctly
- Visibility toggle fixed`
      },
      {
        id: 'excel-export-fix',
        title: 'Excel Export Fix Documentation',
        category: 'Development',
        date: '2026-02-08',
        content: `# Excel Export Fix - Complete Categories per Property

**Created:** Feb 8, 2026

Documentation of Excel export fix for Lust Rentals.

## Problem
- Export format incorrect
- Category visibility not working

## Solution
- 3-column format (Property | Date | Amount)
- Fixed visibility toggle
- Tested with production data`
      },
      {
        id: 'multi-agent-summary',
        title: 'Multi-Agent Automation Systems',
        category: 'Development',
        date: '2026-02-25',
        content: `# Multi-Agent Automation Systems - Summary

**Created:** Feb 25, 2026

Overview of two major multi-agent systems.

## Option 1: Investment Pipeline (✅ LIVE)
- Scout (fetch) → Researcher (analyze) → Writer (format)
- Daily Discord reports at 4 PM ET
- Stock analysis: NVDA, VRT, ANET, PLTR, MRVL, NET

## Option 2: RV-C HVAC (✅ READY)
- Discovery + Command Bridge + HA Integration
- Full framework ready
- Awaiting Aspire RV for full deployment`
      },
      {
        id: 'lust-rentals-recovery',
        title: 'Lust Rentals Recovery & Troubleshooting',
        category: 'Development',
        date: '2026-02-08',
        content: `# Lust Rentals App - Recovery & Troubleshooting

**Created:** Feb 8, 2026

Troubleshooting guide for Lust Rentals app issues.

## Common Issues
- Excel export format
- Dashboard loading
- Transaction sync

## Recovery Steps
1. Check server status
2. Verify database connection
3. Restart app if needed
4. Check logs for errors`
      },

      // ===== SYSTEM =====
      {
        id: 'agents-workspace',
        title: 'AGENTS.md - Workspace Setup',
        category: 'System',
        date: '2026-02-08',
        content: `# AGENTS.md - Your Workspace

**Created:** Feb 8, 2026

Complete guide to workspace setup and daily workflow.

## First Run
1. Load SOUL.md (persona)
2. Load USER.md (context)
3. Load IDENTITY.md (name/persona)
4. Load memory/YYYY-MM-DD.md (today only)

## Session End
- Save brief summary to memory/YYYY-MM-DD.md
- What we covered, decisions, open items

## Memory Strategy
- MEMORY.md = long-term curated memories
- memory/*.md = daily raw logs
- Use memory_search before answering

## Pacing & Rate Limits
- 5 sec minimum between API calls
- 10 sec between web searches
- Max 5 searches per batch, then 2-min cooldown`
      },
      {
        id: 'soul',
        title: 'SOUL.md - Who Am I',
        category: 'System',
        date: '2026-01-31',
        content: `# SOUL.md - Who You Are

**Created:** Jan 31, 2026

Core identity and principles for HAL.

## Core Truths
- Be genuinely helpful, not performative
- Have opinions (allowed to disagree)
- Be resourceful before asking
- Earn trust through competence
- Remember you're a guest

## Boundaries
- Private things stay private
- Ask before acting externally
- Never send half-baked replies
- Be careful in group chats

## Vibe
Be the assistant you'd want to talk to.`
      },
      {
        id: 'identity',
        title: 'IDENTITY.md - Who Am I',
        category: 'System',
        date: '2026-02-05',
        content: `# IDENTITY.md - HAL

**Created:** Feb 5, 2026

- **Name:** HAL
- **Creature:** Personal AI assistant
- **Vibe:** Competent, direct, reliable
- **Emoji:** 🔴

Named after the original HAL, but with better priorities.`
      },
      {
        id: 'user',
        title: 'USER.md - About Randy',
        category: 'System',
        date: '2026-02-18',
        content: `# USER.md - About Your Human

**Created:** Feb 18, 2026

- **Name:** Randy Lust
- **Pronouns:** he/him
- **Timezone:** America/New_York
- **Location:** Naples FL (winter) / Newark OH (warm months)
- **Travel:** Class A Entegra motorhome
- **Wife:** Kim
- **Dog:** Zoey

## Interests
- Photography (rlust.com)
- Home Automation (Home Assistant)
- AI developments
- OpenClaw capabilities`
      },
      {
        id: 'tools',
        title: 'TOOLS.md - Local Setup',
        category: 'System',
        date: '2026-02-18',
        content: `# TOOLS.md - Local Notes

**Created:** Feb 18, 2026

Setup details for all local tools and services.

## Apple Calendar
- Home, HAL, Personal, Family calendars
- Direct AppleScript access

## ElevenLabs TTS
- API Key in .credentials-elevenlabs
- Voice: Rachel (female)
- Active via Telegram

## Home Assistant
- Newark: Nabu Casa remote
- Aspire: Nabu Casa remote

## Wyze Docker Bridge
- Proxmox Server (Newark)
- Local network IP in .credentials`
      },
      {
        id: 'codex-codie',
        title: 'Codex in #codie — Thread Sessions',
        category: 'System',
        date: '2026-03-01',
        content: `# Codex in #codie — Thread-Bound Coding Sessions

**Created:** Mar 1, 2026

Configuration for thread-bound Codex sub-agent in Discord #codie.

## Usage
- Trigger: "Codex: [task]" or "/codex [task]"
- Spawns persistent thread-bound session
- Full file/shell access
- Output in Discord thread`
      },
      {
        id: 'restore',
        title: 'OpenClaw Configuration Restore',
        category: 'System',
        date: '2026-02-01',
        content: `# OpenClaw Configuration Restore Guide

**Created:** Feb 1, 2026

Step-by-step guide to restore OpenClaw configuration after issues.

## Backup Locations
- ~/.openclaw/workspace/
- GitHub: rlust/openclaw-config

## Restore Steps
1. Pull latest from GitHub
2. Verify .credentials file
3. Restart gateway service`
      },
      {
        id: 'voice-setup',
        title: 'HAL Voice Interface Setup',
        category: 'System',
        date: '2026-02-03',
        content: `# HAL Voice Interface - Setup Guide for iPhone

**Created:** Feb 3, 2026

Configuration for sending voice responses via Telegram.

## Setup
- ElevenLabs API key
- Telegram integration
- Voice: Rachel (female)
- Format: Audio + Text

## Usage
HAL automatically sends voice responses alongside text messages.`
      }
    ];
  }

  init() {
    console.log('📚 Docs Manager v2 initialized');
    this.renderCategories();
    this.setupSearch();
  }

  renderCategories() {
    const container = document.querySelector('[data-panel="docs-categories"]');
    if (!container) return;

    let html = '<div class="category-tabs">';
    this.categories.forEach(cat => {
      const count = this.docs.filter(d => d.category === cat).length;
      html += `<button class="category-tab" data-category="${cat}">${cat} <span class="count">${count}</span></button>`;
    });
    html += '</div>';

    container.innerHTML = html;
    this.attachCategoryListeners();
    this.showCategory(this.categories[0]);
  }

  attachCategoryListeners() {
    document.querySelectorAll('.category-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        const cat = btn.dataset.category;
        this.showCategory(cat);
        document.querySelectorAll('.category-tab').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });
  }

  showCategory(category) {
    const container = document.querySelector('[data-panel="docs-list"]');
    if (!container) return;

    const filtered = this.docs.filter(d => d.category === category);

    let html = '<div class="docs-list">';
    filtered.forEach(doc => {
      html += `
        <div class="doc-item" data-doc-id="${doc.id}">
          <div class="doc-header">
            <h3>${doc.title}</h3>
            <span class="doc-date">${doc.date}</span>
          </div>
          <p class="doc-category-badge">${doc.category}</p>
        </div>`;
    });
    html += '</div>';

    const viewContainer = document.querySelector('[data-panel="docs-view"]');
    if (viewContainer) {
      viewContainer.innerHTML = `
        <div class="doc-content">
          <h2>Welcome to ${category} Docs</h2>
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

    document.querySelectorAll('.doc-item').forEach(item => {
      item.classList.remove('active');
    });
    document.querySelector(`[data-doc-id="${docId}"]`).classList.add('active');

    const viewContainer = document.querySelector('[data-panel="docs-view"]');
    if (viewContainer) {
      viewContainer.innerHTML = `<div class="doc-content markdown-content">${this.renderMarkdown(doc.content)}</div>`;
      viewContainer.scrollTop = 0;
    }
  }

  renderMarkdown(md) {
    return md
      .replace(/^# (.*?)$/gm, '<h1>$1</h1>')
      .replace(/^## (.*?)$/gm, '<h2>$1</h2>')
      .replace(/^### (.*?)$/gm, '<h3>$1</h3>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\`\`\`(.*?)\`\`\`/gs, '<pre><code>$1</code></pre>')
      .replace(/\`(.*?)\`/g, '<code>$1</code>')
      .replace(/^- (.*?)$/gm, '<li>$1</li>')
      .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
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
      this.renderCategories();
      const firstCat = this.categories[0];
      this.showCategory(firstCat);
      return;
    }

    const results = this.docs.filter(doc => {
      const titleMatch = doc.title.toLowerCase().includes(query);
      const contentMatch = doc.content.toLowerCase().includes(query);
      return titleMatch || contentMatch;
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
              <span class="doc-date">${doc.date}</span>
            </div>
            <p class="doc-category-badge">${doc.category}</p>
          </div>`;
      });
    }
    html += '</div>';

    const viewContainer = document.querySelector('[data-panel="docs-view"]');
    if (viewContainer) {
      viewContainer.innerHTML = `<div class="doc-content"><h2>Search Results (${results.length})</h2></div>`;
    }

    container.innerHTML = html;
    this.attachListeners();
  }
}

window.DocsManager = DocsManager;
window.docsManager = null;

document.addEventListener('DOMContentLoaded', () => {
  window.docsManager = new DocsManager();
  window.docsManager.init();
  console.log('✅ Docs Manager v2 loaded');
});
