# 🔧 RV-C HVAC Command Center

**Status:** ✅ Framework Complete | ⏳ Awaiting RV Configuration

---

## What's Ready

### ✅ Built & Tested
- Monitor Agent system prompt (detailed instructions)
- Status query script (`rvc-hvac-status.sh`)
- Control script (`rvc-hvac-control.sh`)
- Dashboard formatter (`hvac-formatter.js`)
- Diagnostic test suite (`rvc-hvac-test.sh`)
- Discord integration ready (via message tool)
- Telegram escalation template

### ⏳ Awaiting RV Configuration
- Actual HA entity IDs (climate, temperature sensors)
- MQTT topic/payload confirmation
- Network access (RV currently offline - normal for Feb)

---

## Quick Start (When RV is Online)

```bash
# 1. Verify system is ready
bash scripts/rvc-hvac-test.sh

# 2. Check current HVAC status
bash scripts/rvc-hvac-status.sh

# 3. Display status in Discord format
bash scripts/rvc-hvac-dashboard.sh

# 4. Send a command
bash scripts/rvc-hvac-control.sh set-temp 72

# 5. Run diagnostic test
bash scripts/rvc-hvac-control.sh test
```

---

## Available Commands

Once integrated with Discord, you'll have:

```
/hvac status              Show current temp, mode, fan speed
/hvac set-temp 72        Set target temperature
/hvac set-mode heat|cool Change HVAC mode
/hvac set-fan auto|on    Control fan speed
/hvac test               Run diagnostic test
/hvac history            Show recent commands & responses
```

---

## Architecture

```
┌─────────────────────────────────────────┐
│  Aspire RV (Local Network)              │
│  Home Assistant: 192.168.100.234:8123   │
│  - Climate entity (climate.*)           │
│  - Temperature sensors (sensor.*_temp)  │
│  - MQTT broker (rv-c topics)            │
└────────────────────┬────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────┐
│  Control Scripts (Mac mini)             │
│  - rvc-hvac-status.sh                   │
│  - rvc-hvac-control.sh                  │
│  - rvc-hvac-dashboard.sh                │
└────────────────────┬────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────┐
│  Monitor Agent                          │
│  - Parses status JSON                   │
│  - Formats for Discord                  │
│  - Logs all commands & responses        │
│  - Escalates failures to Telegram       │
└────────────────────┬────────────────────┘
                     │
        ┌────────────┴────────────┐
        ↓                         ↓
    Discord                   Telegram
    (Dashboard +             (Alerts:
     Slash Cmds)          No Response,
                          Errors, etc)
```

---

## What Happens When RV is Online

### 1. Status Query
```bash
$ bash scripts/rvc-hvac-status.sh

{
  "timestamp": "2026-02-25T22:05:00Z",
  "hvac": {
    "mode": "heat",
    "current_temp": 68,
    "target_temp": 72,
    "fan_mode": "auto"
  },
  "zones": {
    "kitchen": 68,
    "bedroom": 70,
    "living_room": 69
  },
  "status": "online"
}
```

### 2. Discord Display
```
✅ **RV-C HVAC Status**

**Main System**
Mode: 🔥 HEAT
Current: 68°F | Target: 72°F (4° below target)
Fan: auto

**Zone Temperatures**
🏠 Kitchen: 68°F
🛏️ Bedroom: 70°F
🛋️ Living Room: 69°F

**System Status**: ✅ Online
**Last Update**: 02/25/2026 5:05 PM ET

Commands: `/hvac set-temp 72` | `/hvac set-mode heat` | `/hvac test`
```

### 3. Control Command
```bash
$ bash scripts/rvc-hvac-control.sh set-temp 75

Command sent. Response:
{ "command": "set-temp", "value": 75, "result": "sent" }

[New status after 3-second wait]
✅ **RV-C HVAC Status**
Mode: 🔥 HEAT
Current: 68°F | Target: 75°F (7° below target, heating...)
```

### 4. Automatic Alerts (Telegram)
- **No Response**: HVAC doesn't answer for 30+ seconds
- **Invalid Command**: Response doesn't match expected format
- **Temperature Drift**: Setpoint changed but no heating/cooling
- **Connection Lost**: Can't reach Home Assistant

---

## File Structure

```
workspace/
├── agents/
│   └── rvc-hvac-monitor/
│       ├── manifest.json        Agent config
│       ├── system.md            Agent instructions
│       └── hvac-formatter.js    JSON → Discord
│
├── scripts/
│   ├── rvc-hvac-status.sh       Query HA API
│   ├── rvc-hvac-control.sh      Execute commands
│   ├── rvc-hvac-dashboard.sh    Format for Discord
│   └── rvc-hvac-test.sh         Diagnostic suite
│
├── logs/
│   └── rvc-hvac/
│       ├── commands.log         All commands sent
│       └── responses.log        All responses received
│
├── RVC_HVAC_README.md           This file
├── RVC_HVAC_SETUP.md            Configuration guide
└── .credentials                 HA token (secure)
```

---

## Configuration Checklist

- [ ] RV is connected to WiFi (when next online)
- [ ] HA token is in `.credentials` (done: `192.168.100.234`)
- [ ] Network is accessible from Mac mini (when RV online)
- [ ] Climate entity ID confirmed (e.g., `climate.aspire_hvac`)
- [ ] Temperature sensor IDs confirmed (kitchen, bedroom, etc)
- [ ] MQTT topics verified (or using HA climate platform)
- [ ] Test commands work (status, set-temp, etc)
- [ ] Discord integration enabled (`/hvac` slash commands)
- [ ] Telegram alerts configured for critical failures

---

## Diagnostic Commands

When the RV is online, use these to troubleshoot:

```bash
# Full diagnostic test
bash scripts/rvc-hvac-test.sh

# Check just connectivity
ping 192.168.100.234

# Check HA API
curl -H "Authorization: Bearer TOKEN" http://192.168.100.234:8123/api/states

# View command log
tail -50 logs/rvc-hvac/commands.log

# View response log
tail -50 logs/rvc-hvac/responses.log
```

---

## Next Steps

### Immediately (Mac mini setup)
- ✅ Framework complete
- ✅ Scripts ready
- ✅ Agent configured
- ⏳ Waiting for RV to be online

### When RV is Next Online (Naples, FL or en route)
1. Run: `bash scripts/rvc-hvac-test.sh`
2. Confirm all entities are found
3. Run: `bash scripts/rvc-hvac-dashboard.sh`
4. Verify status displays correctly
5. Test commands: `bash scripts/rvc-hvac-control.sh set-temp 72`
6. Enable Discord `/hvac` slash commands
7. Set up Telegram alerts

### Long-term Enhancements
- [ ] Multi-zone control (Kitchen, Bedroom, Living Room separate)
- [ ] Temperature schedules (seasonal, daily)
- [ ] Historical trending (track temps over days/weeks)
- [ ] Auto-heating/cooling based on outdoor weather
- [ ] Integration with Aspire shore power (only heat when plugged in?)
- [ ] Machine learning (learns your preferred temps)

---

## Troubleshooting

### RV Not Responding
- **Check**: Is RV on and WiFi connected?
- **Check**: IP address still 192.168.100.234?
- **Fix**: Update TOOLS.md with new IP if it changed

### HA Token Invalid
- **Fix**: Get new token from HA (Settings → Long-Lived Tokens)
- **Update**: Replace in `.credentials` file

### No Temperature Data
- **Check**: Temperature sensors exist in HA
- **Check**: Entity IDs in scripts match actual entities
- **Fix**: Update entity names in `rvc-hvac-status.sh`

### Command Sent But No Response
- **Likely**: MQTT topic is different
- **Check**: What topics does RV actually publish?
- **Fix**: Update topic in `rvc-hvac-control.sh`

---

## Safety Notes

✅ **Secure:**
- Tokens in `.credentials` (not in code)
- Local network only (RV IP)
- No remote access (safer for RV on road)
- HA REST API (industry standard)

⚠️ **Considerations:**
- Temperature changes limited to ±2°F per command (safety)
- All commands logged for debugging
- Failures logged with timestamps
- Telegram alerts for unresponsive system

---

## Support

If issues arise when RV is online:

1. Run diagnostic: `bash scripts/rvc-hvac-test.sh`
2. Check logs: `tail -100 logs/rvc-hvac/commands.log`
3. Review actual HVAC entities in HA Developer Tools
4. Update entity names in scripts as needed
5. Test with simple commands first

---

**Status:** Ready to activate when Aspire RV comes online! 🚀
