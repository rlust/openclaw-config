# 🔴 openclaw-config

Randy's complete OpenClaw setup for personal automation, calendar management, home automation integration, and proactive monitoring.

## Quick Overview

**HAL** - Personal AI assistant that:
- Manages Apple Calendar and Notes
- Controls RV home automation (Home Assistant)
- Monitors for OpenClaw and system updates
- Falls back to Gemini when Claude hits rate limits

## What's Inside

```
├── openclaw.json          # Main config (models, channels, auth)
├── SOUL.md                # HAL's personality
├── USER.md                # Randy's profile
├── IDENTITY.md            # HAL's identity
├── TOOLS.md               # Tool configuration
├── HEARTBEAT.md           # Proactive checks
├── RESTORE.md             # Setup guide
└── scripts/               # Helper scripts
    ├── ha-helper.sh       # Home Assistant API helper
    └── check-updates.sh   # Update monitoring
```

## Quick Start

1. Read [RESTORE.md](RESTORE.md) for setup instructions
2. Copy config files to `~/.openclaw/`
3. Add credentials from [CREDENTIALS.template](CREDENTIALS.template)
4. Run `openclaw status` to verify

## Key Features

✅ **Calendar Management**
- AppleScript integration with Apple Calendar
- Automatic event creation via voice
- HAL's own calendar for reminders

✅ **Home Automation**
- Home Assistant API integration
- RV Aspire motorhome control
- Climate, lighting, security monitoring

✅ **Proactive Monitoring**
- Heartbeat checks every 30 min
- Home Assistant update detection
- OpenClaw news monitoring
- Auto-alerts to HAL calendar

✅ **Model Redundancy**
- Primary: Claude Sonnet 4.5
- Fallback: Gemini 2.0 Flash
- Never down due to rate limits

## Architecture

**Host**: Randy's Mac mini (192.168.100.201)
**RV Network**: 192.168.100.0/24
**RV Home Assistant**: http://192.168.100.234:8123

## System Components

- **Telegram**: Direct chat with HAL
- **Apple Calendar**: Event storage and reminders
- **Apple Notes**: Information storage
- **Home Assistant**: RV automation control
- **OpenClaw Gateway**: Local on Mac mini

## Configuration

See individual files:
- Model config → `openclaw.json`
- Personality → `SOUL.md`
- User preferences → `USER.md`
- Tools → `TOOLS.md`
- Monitoring → `HEARTBEAT.md`

## Credentials

⚠️ **Important**: Credentials are gitignored for security.
See `CREDENTIALS.template` for what you need to add.

## Status

Last updated: 2026-01-31
- OpenClaw: 2026.1.30
- Config: v1.0 (backup)

---

For full restoration instructions, see [RESTORE.md](RESTORE.md)
