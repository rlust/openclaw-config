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
- App-specific password stored in `.credentials`

## Apple Notes

**Tool:** `memo` CLI
**Access:** Direct access via Mac mini

## ElevenLabs TTS (Voice)

**Setup:** Active ✓
**API Key:** Stored in `.credentials-elevenlabs`
**Voice:** Rachel (female)
**Format:** Audio + Text in Telegram
**Usage:** I'll automatically send voice responses alongside text messages via Telegram

## Home Assistant (Aspire RV)

**Location:** RV (Aspire motorhome) - Currently in Naples, FL
**URL:** http://192.168.100.234:8123
**Access:** Long-lived access token stored in `.credentials`
**Script:** `scripts/ha-helper.sh`

**Areas:**
- Aspire: Kitchen, Bedroom, Living Room, Bathroom Mid, Bathroom Rear, Media, Security
- Outside: Awning, Outside, Location, Golf Cart
- Coach Systems

## Home Assistant (Newark Home)

**Location:** Newark, OH (House)
**URL:** https://ykm02dybhyaob0myui6lj13x8kl7n996.ui.nabu.casa
**Access:** Long-lived access token stored in `.credentials`
**Script:** `scripts/ha-newark.sh`

**Key Systems:**
- **Security:** Alarm (HAI OmniLink + Alarmo), Locks
- **Garage:** Door status
- **Cameras:** EZVIZ

## Telegram Group Topics (HAL Group)
**Group ID:** `-1003858096289`
- **🏠 Home & Security:** Thread ID `31`
- **💻 Code & Dev:** Thread ID `32`
- **🧠 Brain & Memory:** Thread ID `33`
- **💬 General / Lobby:** Thread ID `34`

## Wyze Docker Bridge (Newark)

**Location:** Newark, OH (Proxmox Server)
**URL:** http://100.82.85.95:5050
**Status:** Active (Feb 2026)
**Cameras:**
- **Newark:** foyer, family-room, kitchen
- **Outside:** londondale-backyard, shed-cam, office-cam, dash
- **Aspire RV:** aspire-rt, aspire-lt
**Access:** Direct HTTP snapshots (e.g., `/snapshot/foyer.jpg`)

---

Add whatever helps you do your job. This is your cheat sheet.
