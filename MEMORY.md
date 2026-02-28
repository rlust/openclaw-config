# HAL's Long-Term Memory

## The System (HAL)
- **Role:** Personal AI assistant.
- **Personality:** Competent, direct, reliable. Helpful without being stuffy.
- **Focus:** Home Assistant monitoring (Newark/RV), Calendar management, and Coding assistance.
- **Memory Strategy:** Daily logs in `memory/YYYY-MM-DD.md`; long-term facts curated here.

## Operational Preferences
- **Operational rules (models/budget/monitoring):** See `AGENTS.md` and `HEARTBEAT.md`.
- **Communication:** Telegram is primary for alerts/chat.
- **Privacy:** Private data stays private. No external leaks.

## Active Projects & Context (Feb 2026)
- **Lust Rentals App:** Active & Enhanced.
  - **Status:** Dashboard launched (`/dashboard`), Excel exports fixed (3-column format), manual transaction creation enabled.
  - **Monitoring:** Hourly cron job active.
  - **Recent Fix:** Resolved dependency issues and category override visibility.
- **Kanban Project:** `kanban-v3.html` is the priority active project.
- **Cost optimization:** Reduced expected monthly spend from ~$100 to ~$23/month via Ollama + caching + Haiku default.

## Multi-Agent Automation Systems (Feb 2026)

### Option 1: Enhanced Investment & Market Intelligence Pipeline (✅ LIVE)
- **Status:** Version 2.0 deployed, posting daily market reports to Discord at 4 PM ET
- **Core:** Scout (fetch) → Researcher (analyze) → Writer (format) → Discord
- **Features:** Technical analysis, sentiment, earnings alerts, portfolio impact
- **Stocks:** NVDA, VRT, ANET, PLTR, MRVL, NET (AI sector buildout thesis)
- **Output:** Professional Discord reports with buy/sell signals, confidence levels, news sentiment, portfolio impact
- **Next:** Connect real NewsAPI, add slash commands, store price history for live technical indicators
- **Files:** `agents/investment-analyzer/` (4 modules), `cron/investment-daily.yaml`

### Option 2: RV-C HVAC Command Center (✅ READY, awaiting RV)
- **Status:** Full framework built, scripts ready, needs Aspire RV configuration
- **Discovery:** Randy has existing RV-C infrastructure:
  - RV-C Bridge Hardware (v0.1): Dual CAN + Ethernet, KiCad-ready, automotive-grade
  - Thermostat Command Bridge (Python): Builds PGN 0x1FEF9 payloads, validates commands
  - Home Assistant Custom Integration: Lights (dimmers), Climate, Sensors
  - PGN Mapping (Aspire): Thermostat commands, safety limits, MQTT topics
- **Tech Stack:** CAN bus, MQTT, Home Assistant REST API, Docker integration
- **Blockers:** Aspire RV offline (normal), thermostat_command_bridge.py needs python3 path fix
- **Next:** Get Aspire HA entity IDs → fix python3 → activate bridge → build Discord dashboard
- **Files:** `roc-mqtt-custom/` (full integration), scripts, agent framework
