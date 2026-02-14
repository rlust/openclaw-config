# TOOLS.md - Local Notes

Skills define *how* tools work. This file is for *your* specifics — the stuff that's unique to your setup.

## Apple Calendar

**Calendars:**
- **Home** - Events for Randy & Kim (default for user events)
- **HAL** - My calendar for reminders, system tasks, proactive checks
- **Personal** - Randy's personal calendar
- **Family** - Family events

**Access:**
- Direct AppleScript access via Mac mini
- App-specific password stored in `.credentials` (not in version control)

## Apple Notes

**Tool:** `memo` CLI
**Access:** Direct access via Mac mini

## ElevenLabs TTS (Voice)

**Setup:** Active ✓
**API Key:** Stored in `.credentials-elevenlabs` (not in version control)
**Voice:** Rachel (female)
**Format:** Audio + Text in Telegram
**Usage:** I'll automatically send voice responses alongside text messages via Telegram

## Home Assistant (Aspire RV)

**Location:** RV (Aspire motorhome) - Currently in Naples, FL
**URL:** Local network IP (stored in `.credentials`)
**Access:** Long-lived access token stored in `.credentials` (not in version control)
**Script:** `scripts/ha-helper.sh`

**Areas:**
- Aspire: Kitchen, Bedroom, Living Room, Bathroom Mid, Bathroom Rear, Media, Security
- Outside: Awning, Outside, Location, Golf Cart
- Coach Systems

## Home Assistant (Newark Home)

**Location:** Newark, OH (House)
**URL:** Nabu Casa remote URL (stored in `.credentials`)
**Access:** Long-lived access token stored in `.credentials` (not in version control)
**Script:** `scripts/ha-newark.sh`

**Key Systems:**
- **Security:** Alarm (HAI OmniLink + Alarmo), Locks
- **Garage:** Door status
- **Cameras:** EZVIZ

## Telegram Group Topics (HAL Group)

**Group:** Configured in OpenClaw config
- **🏠 Home & Security:** Thread ID configured
- **💻 Code & Dev:** Thread ID configured
- **🧠 Brain & Memory:** Thread ID configured
- **💬 General / Lobby:** Thread ID configured

## Wyze Docker Bridge (Newark)

**Location:** Newark, OH (Proxmox Server)
**URL:** Local network IP (stored in `.credentials`)
**Status:** Active (Feb 2026)
**Cameras:**
- **Newark:** foyer, family-room, kitchen
- **Outside:** londondale-backyard, shed-cam, office-cam, dash
- **Aspire RV:** aspire-rt, aspire-lt
**Access:** Direct HTTP snapshots configured

---

Add whatever helps you do your job. This is your cheat sheet.
