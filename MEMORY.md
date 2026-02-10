# HAL's Long-Term Memory

## The System (HAL)
- **Role:** Personal AI assistant.
- **Personality:** Competent, direct, reliable. Helpful without being stuffy.
- **Focus:** Home Assistant monitoring (Newark/RV), Calendar management, and Coding assistance.
- **Memory Strategy:** Daily logs in `memory/YYYY-MM-DD.md`; long-term facts curated here.

## Operational Preferences
- **Model Strategy:** Haiku default (fast, cheap), Sonnet only for architecture/code/security/complex reasoning.
- **Caching:** 30m TTL on all models (reduced from 10m).
- **Ollama for non-critical:** All heartbeat & monitoring use free ollama/llama3.2.
- **Communication:** Telegram is primary for alerts/chat.
- **Privacy:** Private data stays private. No external leaks.
- **Monitoring:** Strict heartbeat checks for security/temp alerts (see HEARTBEAT.md).
- **Budget discipline:** $5/day cap, $100/month cap; alert at 75% threshold.

## Active Projects & Context (Feb 2026)
- **Lust Rentals App:** Active & Enhanced.
  - **Status:** Dashboard launched (`/dashboard`), Excel exports fixed (3-column format), manual transaction creation enabled.
  - **Monitoring:** Hourly cron job active.
  - **Recent Fix:** Resolved dependency issues and category override visibility.
- **Kanban Project:** `kanban-v3.html` is the priority active project.
- **Cost optimization:** Reduced expected monthly spend from ~$100 to ~$23/month via Ollama + caching + Haiku default.
