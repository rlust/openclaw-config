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

---

Add whatever helps you do your job. This is your cheat sheet.
