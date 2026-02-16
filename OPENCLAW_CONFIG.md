# OpenClaw Configuration Reference

**Status:** Last updated 2026-02-15 with xAI (Grok 2) fallback added.

⚠️ **IMPORTANT:** This file documents the configuration structure and setup. The actual config file (`.openclaw/openclaw.json`) is NOT committed to git for security — it contains API keys. Keep local backups safe.

## Current Configuration

### Authentication Profiles

```json
{
  "anthropic:default": { "provider": "anthropic", "mode": "oauth" },
  "google:default": { "provider": "google", "mode": "api_key" },
  "moonshot:default": { "provider": "moonshot", "mode": "api_key" },
  "openrouter:default": { "provider": "openrouter", "mode": "api_key" },
  "openai-codex:default": { "provider": "openai-codex", "mode": "oauth" },
  "ollama:default": { "provider": "ollama", "mode": "api_key" },
  "xai:default": { "provider": "xai", "mode": "api_key" }
}
```

### Model Providers Configured

#### 1. **Anthropic** (Primary)
- `claude-haiku-4-5` (alias: `haiku`) — fast, cheap default
- `claude-sonnet-4-5` (alias: `sonnet`) — medium reasoning
- `claude-opus-4-6` (alias: `opus`) — high reasoning

#### 2. **xAI** (Fallback #1) ⭐ NEW
- `grok-2-latest` (alias: `grok`)
  - 131K context window
  - Strong reasoning
  - Automatic fallback when Anthropic throttles

#### 3. **Ollama** (Local, Free)
- `llama3.2:latest` (alias: `llama-local`)
- `deepseek-coder:6.7b` (alias: `deepseek-local`)
- `gemma3:4b`
- `qwen2.5:7b`

#### 4. **OpenRouter** (Multi-provider)
- Routes to various models via OpenRouter API

#### 5. **Other** (Backup fallbacks)
- OpenAI (GPT-5.2, GPT-5-mini)
- Moonshot (Kimi K2.5)

### Model Fallback Chain (Automatic)

```
1. anthropic/claude-haiku-4-5 (primary)
   ↓ (if throttled)
2. xai/grok-2-latest (NEW: when Anthropic hits rate limits)
   ↓ (if throttled)
3. ollama/llama3.2:latest (local, always available)
4. ollama/deepseek-coder:6.7b
5. anthropic/claude-sonnet-4-5
6. anthropic/claude-opus-4-6
7. openai/gpt-5.3-codex
8. openai/gpt-5.2
... (and more)
```

### Cron Jobs Configured

| Name | Schedule | Purpose |
|------|----------|---------|
| Kanban Server Monitor | Every 30 min | Monitor `kanban-server-v3.py` |
| Lust Rentals App Monitor | Hourly | Check app status, restart if down |
| Water Heater Monitor | Every 4 hours | Alert if Aspire water heater <120°F |
| iCloud Backup Sync | 2:00 AM | Daily backup sync |
| Daily System Review | 8:00 AM | Review workspace files for cleanup |
| Daily Newark Report | 9:00 AM | Home Assistant status report |
| Daily Camera Report | 9:00 AM | Capture & send Newark camera snapshots |
| HAL Hourly Updates | 9:30/10:30/11:30/12:30 AM | Status updates to Telegram |
| HA Status Reports | 9:30 AM, 7:00 PM | Twice-daily HA reports via iMessage |
| Market Close Alert | 4:00 PM (weekdays) | Stock market close summary |

### Channels Configured

- **Telegram** — enabled for alerts & group messages (HAL Group)
- **Apple iMessage** — enabled for daily reports to Randy's iPhone

### Tools Enabled

- Web search (Brave API)
- Web fetch
- Browser automation
- Node/Canvas support
- MCP server support (mcporter)

### Workspace & Skills

- **Workspace:** `/Users/randylust/.openclaw/workspace`
- **Memory:** MEMORY.md + memory/*.md (on-demand search)
- **Skills installed:** All available (apple-notes, apple-reminders, github, gog, etc.)

---

## How to Restore Config

If you need to restore the OpenClaw config from backup:

1. **Get the latest config backup** (external drive, password manager, etc. — store separately from git)
2. **Place at:** `~/.openclaw/openclaw.json`
3. **Verify:** `openclaw status`
4. **Restart if needed:** `openclaw gateway restart`

---

## API Keys Required

The actual `.openclaw/openclaw.json` file contains:

| Service | Key Type | Status |
|---------|----------|--------|
| Anthropic | OAuth token | ✓ Active |
| xAI (Grok) | API Key | ✓ Active (Feb 2026) |
| OpenRouter | API Key | ✓ Active |
| Google | API Key | ✓ Active |
| Moonshot | API Key | ✓ Active |
| Brave Search | API Key | ✓ Active |
| Telegram Bot | Token | ✓ Active |
| Ollama | API Key (local) | ✓ Active |

---

## Key Decisions & Notes

1. **Haiku as primary** — Cost control + speed. Escalate to Sonnet/Grok only when needed.
2. **xAI fallback** — Added 2026-02-15 as first fallback when Anthropic throttles.
3. **Ollama local models** — Free, always available, no API dependency.
4. **30-min kanban monitor** — Reduced from 5 min to save tokens.
5. **Cron job fixes** — Fixed 7 jobs using broken `ollama/llama3.2` (missing `:latest`).
6. **.openclaw/ not in git** — Config file excluded to prevent API key leaks.

---

## To Update This Document

After config changes:
```bash
cd ~/.openclaw/workspace
git add OPENCLAW_CONFIG.md
git commit -m "Update OpenClaw config reference (e.g., added xAI fallback)"
git push
```

The actual config file stays local and backed up separately.
