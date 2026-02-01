# OpenClaw Configuration Restore Guide

This repository contains Randy's complete OpenClaw configuration and automation setup.

## What's Included

- **openclaw.json** - Main OpenClaw configuration (models, auth profiles, channels)
- **SOUL.md** - AI personality and guidelines
- **USER.md** - User profile and preferences
- **IDENTITY.md** - HAL's identity (name, emoji, vibe)
- **TOOLS.md** - Local tool configuration and API endpoints
- **HEARTBEAT.md** - Proactive monitoring checklist
- **scripts/** - Helper scripts for Home Assistant and system checks

## What's NOT Included (Add Manually)

Sensitive credentials are gitignored for security:
- `.credentials` - Apple calendar app password
- `google.key` - Google Gemini API key
- Home Assistant token

## Restore Steps

### 1. Fresh OpenClaw Install

```bash
npm i -g openclaw
openclaw init
```

### 2. Copy Config Files

```bash
# Copy main config
cp openclaw.json ~/.openclaw/

# Copy workspace files
cp SOUL.md USER.md IDENTITY.md TOOLS.md HEARTBEAT.md ~/.openclaw/workspace/

# Copy scripts
mkdir -p ~/.openclaw/workspace/scripts
cp scripts/* ~/.openclaw/workspace/scripts/
```

### 3. Add Credentials

Create `~/.openclaw/.credentials`:
```
# Apple
- App-specific password: [get from Apple ID]

# Home Assistant
- URL: http://192.168.100.234:8123
- Long-lived access token: [generate from Home Assistant]

# Google Gemini
- Create ~/.openclaw/google.key with your API key from https://aistudio.google.com/apikey
```

### 4. Verify Setup

```bash
openclaw status
```

Check:
- ✅ Telegram channel connected
- ✅ Calendar access working (test with `osascript`)
- ✅ Home Assistant API responding

### 5. Create Memory Files

```bash
mkdir -p ~/.openclaw/workspace/memory
# Memory files will be created automatically on first run
```

## Key Systems

### Calendar Integration
- **Home** calendar: For Randy & Kim events
- **HAL** calendar: System reminders and monitoring alerts
- AppleScript-based access (no API needed)

### Home Assistant
- **URL**: http://192.168.100.234:8123
- **Areas**: Aspire (Kitchen, Bedroom, Bathrooms, Media, Security), Outside (Awning, Golf Cart, Location)
- **Helper script**: `scripts/ha-helper.sh`

### Models
- **Primary**: Claude Sonnet 4.5 (Anthropic)
- **Fallback**: Gemini 2.0 Flash (Google) when Claude hits limits

### Monitoring
- **Heartbeat**: Runs every 30 minutes
- **Checks**: Home Assistant updates, OpenClaw news
- **Actions**: Auto-adds alerts to HAL calendar

## Support

For OpenClaw docs: https://docs.openclaw.ai
