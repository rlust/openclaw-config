# Aspire RV-C Entity Map & Configuration

**Source:** `ha-component-rv-c-bridge` integration  
**Updated:** Feb 25, 2026  
**Status:** Ready to activate when RV comes online

---

## Climate Entities (Thermostats)

All climate entities follow pattern: `climate.climate_thermostat_{instance}`

| Instance | Zone Name | Entity ID | Primary? | Notes |
|----------|-----------|-----------|----------|-------|
| 0 | Front | `climate.climate_thermostat_0` | ✅ YES | Main living area thermostat |
| 1 | Mid | `climate.climate_thermostat_1` | | Bedroom/mid-coach zone |
| 2 | Rear | `climate.climate_thermostat_2` | | Rear bedroom zone |
| 3 | Zone4 | `climate.climate_thermostat_3` | | Additional zone |
| 4 | Zone5 | `climate.climate_thermostat_4` | | Additional zone |
| 5 | Bay | `climate.climate_thermostat_5` | | Bay area (optional) |
| 6 | Floor | `climate.climate_thermostat_6` | | Floor heating zone |

---

## Temperature Sensors (Zone Sensors)

All sensors follow pattern: `sensor.rvc_zone_temperature_{instance}`

| Instance | Zone Name | Entity ID | Temperature Source |
|----------|-----------|-----------|-------------------|
| 0 | Front | `sensor.rvc_zone_temperature_0` | Front living area sensor |
| 1 | Mid | `sensor.rvc_zone_temperature_1` | Mid-coach sensor |
| 2 | Rear | `sensor.rvc_zone_temperature_2` | Rear bedroom sensor |
| 3 | Bay/Floor | `sensor.rvc_zone_temperature_3` | Bay area sensor |
| 4 | Zone5 | `sensor.rvc_zone_temperature_4` | Redundant zone5 sensor |
| 5 | Zone5 Alt | `sensor.rvc_zone_temperature_5` | Alternative zone5 |
| 19 | Outdoor | `sensor.rvc_zone_temperature_19` | Exterior/outdoor sensor |

---

## MQTT Topics

### Status Publishing (from RV-C Bridge)
```
rvcbridge/thermostat_status/{instance}
  ↓ Received by climate.py
  → climate.climate_thermostat_{instance}

Example:
  rvcbridge/thermostat_status/0
  {
    "mode": 1,              # 0=off, 1=heat, 2=cool, 3=auto, 4=fan_only
    "fan_mode": 0,          # 0=off, 1=auto, 2=on
    "setpoint_heat_f": 68,
    "setpoint_cool_f": 76
  }
```

### Setpoint Updates
```
rvcbridge/thermostat_setpoint/{instance}
  {
    "temp_f": 72.5
  }
```

### Temperature Sensors
```
rvcbridge/temperature/{instance}
  {
    "value": 72.5,
    "unit": "F"
  }
  → sensor.rvc_zone_temperature_{instance}
```

### Control Commands (from OpenClaw)
```
rvcbridge/thermostat_control/{instance}
  {
    "mode": 1,                    # 0=off, 1=heat, 2=cool, 3=auto
    "fan_mode": 0,                # 0=off, 1=auto
    "setpoint_heat_f": 70.0,
    "setpoint_cool_f": 78.0,
    "fan_speed": 50               # 0-100 if supported
  }
```

### Audit Log (logging all commands)
```
rvcbridge/audit/thermostat_control
  {
    "topic": "rvcbridge/thermostat_control/0",
    "payload": {...},
    "frame": {...},               # CAN frame details
    "tx_enabled": true,
    "ts": 1708881234.567
  }
```

---

## Commands

### Get Current Status
```bash
# Query Home Assistant REST API
curl -H "Authorization: Bearer $HA_TOKEN" \
  http://192.168.100.234:8123/api/states/climate.climate_thermostat_0

# Or query via MQTT
mosquitto_sub -h 192.168.100.234 -t "rvcbridge/thermostat_status/0"
```

### Set Temperature
```bash
mosquitto_pub -h 192.168.100.234 \
  -t "rvcbridge/thermostat_control/0" \
  -m '{"mode": 1, "setpoint_heat_f": 72}'
```

### Set Mode (heat/cool/auto/off)
```bash
# Heat (mode=1)
mosquitto_pub -h 192.168.100.234 \
  -t "rvcbridge/thermostat_control/0" \
  -m '{"mode": 1}'

# Cool (mode=2)
mosquitto_pub -h 192.168.100.234 \
  -t "rvcbridge/thermostat_control/0" \
  -m '{"mode": 2}'

# Auto (mode=3)
mosquitto_pub -h 192.168.100.234 \
  -t "rvcbridge/thermostat_control/0" \
  -m '{"mode": 3}'
```

---

## Safety Limits (from thermostat_pgn_map_aspire.json)

**Temperature Bounds:**
- Min: 50°F
- Max: 95°F
- Default setpoint: 72°F

**Allowed Instances:** 0-6

**Rate Limiting:** 
- Min 0.25 seconds between commands per instance

**Safe by Default:**
- Monitor-only until `--tx-enable` flag is set
- All TX commands validated before sending
- Audit trail logged to MQTT

---

## Related Files

- **Entity mappings:** `ha-component-rv-c-bridge/zone_mappings.py`
- **Climate platform:** `ha-component-rv-c-bridge/climate.py`
- **Thermostat bridge:** `roc-mqtt-custom/thermostat_command_bridge.py`
- **PGN mapping:** `roc-mqtt-custom/thermostat_pgn_map_aspire.json`
- **Status script:** `scripts/rvc-hvac-status.sh`
- **Control scripts:** `scripts/rvc-hvac-control.sh`
- **Monitor agent:** `agents/rvc-hvac-monitor/`

---

## Next Steps When RV is Online

1. **Test status query:**
   ```bash
   bash scripts/rvc-hvac-status.sh
   ```

2. **Verify MQTT topics:**
   ```bash
   mosquitto_sub -h 192.168.100.234 -t "rvcbridge/thermostat_status/0"
   ```

3. **Test control (dry-run first):**
   ```bash
   python3 roc-mqtt-custom/thermostat_command_bridge.py --broker 192.168.100.234 --dry-run
   ```

4. **Activate monitoring dashboard:**
   ```bash
   bash scripts/rvc-hvac-dashboard.sh
   ```

5. **Post to Discord:**
   ```bash
   # Run enhanced dashboard and post result
   ```

---

**Status:** Configuration ready. All entity IDs mapped. Awaiting RV online.
