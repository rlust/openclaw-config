# RV-C HVAC Command Center Setup

**Status:** 🚧 Framework Complete, Awaiting RV Configuration

---

## What We Built

A complete **RV-C HVAC monitoring and control system** for the Aspire RV with:

✅ **Monitor Agent** — Tracks temperature, mode, fan speed  
✅ **Control Scripts** — Set temperature, mode, fan speed  
✅ **Discord Integration** — Status updates & slash commands  
✅ **Diagnostic Mode** — Test sequences & failure logging  
✅ **Telegram Escalation** — Alerts for critical failures  

---

## Architecture

```
Aspire RV (on-site)
    ↓
Home Assistant (192.168.100.234:8123)
    ↓
MQTT Broker (climate entities)
    ↓
Scripts (status.sh, control.sh)
    ↓
RVC Monitor Agent
    ↓
Discord (status dashboard + commands)
    ↓
Telegram (alerts only)
```

---

## Files Created

```
agents/
└── rvc-hvac-monitor/
    ├── manifest.json          (agent config)
    ├── system.md              (agent instructions)
    └── hvac-formatter.js      (JSON → Discord format)

scripts/
├── rvc-hvac-status.sh         (query current state)
├── rvc-hvac-control.sh        (send commands)
└── rvc-hvac-dashboard.sh      (pull & format status)

logs/
└── rvc-hvac/
    ├── commands.log           (all commands sent)
    └── responses.log          (all responses received)
```

---

## Current Status

**⏳ Awaiting RV Configuration:**

1. **Home Assistant Entity IDs** — Need actual entity names from your RV's HA instance
   - Climate entity: `climate.aspire_main_hvac` (or?)
   - Temperature sensors: `sensor.kitchen_temp`, etc. (or?)
   - MQTT topics: `rv-c/hvac/command` (or custom?)

2. **MQTT Broker** — Confirm MQTT is active in HA
   - URL: Local network IP on RV
   - Credentials: If auth required
   - RV-C topics: Standard or custom payload format?

3. **Test Connection** — Verify Aspire RV HA is accessible
   - Can ping `192.168.100.234:8123` from Mac mini?
   - Can authenticate with token?

---

## Next Steps

**To activate the RV-C system, I need:**

1. **SSH/VNC into RV's Home Assistant** (or ask you to check)
   - Go to Developer Tools → States
   - Find the climate entity (probably `climate.*_hvac`)
   - Get exact entity_id
   - List all temperature sensor entities

2. **Confirm MQTT Setup**
   - Is MQTT add-on running in HA?
   - What topics does it publish/subscribe to?
   - Any authentication required?

3. **Test Command Format**
   - Have you successfully sent RV-C commands before?
   - What payload format works? (JSON, hex, other?)
   - Example: `{"action":"set_temp","value":72}` or different?

4. **Verify Network** 
   - Is RV on local WiFi currently?
   - What's the RV's IP address? (We have 192.168.100.234, is that correct?)
   - Can Mac mini ping the RV?

---

## Commands Ready to Use

Once configured, you'll have these Discord slash commands:

```
/hvac status              → Show current temp, mode, fan speed
/hvac set-temp 72        → Set target temperature to 72°F
/hvac set-mode heat|cool → Change heating/cooling mode
/hvac set-fan auto|on    → Control fan speed
/hvac test               → Run diagnostic test sequence
/hvac history            → Show recent commands/responses
```

---

## How to Get HA Entity Names

**From Home Assistant Web UI:**

1. Go to `http://192.168.100.234:8123`
2. Click ☰ Menu → Developer Tools → States
3. Look for entities starting with `climate.*` or `sensor.*`
4. Copy exact entity_id (e.g., `climate.entegra_hvac`)

**Or from Mac mini terminal:**

```bash
curl -s -H "Authorization: Bearer TOKEN" \
  http://192.168.100.234:8123/api/states | jq '.[] | select(.entity_id | contains("hvac"))'
```

---

## Testing

Once we have entity names, test with:

```bash
# Check status
bash scripts/rvc-hvac-status.sh

# Format for Discord
bash scripts/rvc-hvac-dashboard.sh

# Send a command
bash scripts/rvc-hvac-control.sh set-temp 72
```

---

## Security Notes

✅ Tokens stored in `.credentials` (not in version control)  
✅ Local network only (RV IP 192.168.100.234)  
✅ Home Assistant REST API (standard, safe)  
✅ Telegram alerts only for critical issues  

---

## What You Need to Do

1. **Check RV's Home Assistant**
   - Confirm IP: 192.168.100.234?
   - Go to Developer Tools → States
   - **Paste the entity list here**

2. **Confirm MQTT**
   - Is MQTT add-on installed in HA?
   - What topics does RV-C use?
   - **Paste topic names here**

3. **Test Network**
   ```bash
   ping 192.168.100.234  # Does this work?
   curl http://192.168.100.234:8123  # Does this respond?
   ```

---

Once you provide this info, I can **activate the full system** in minutes.

**Questions? Need help accessing the RV's HA?** Let me know!
