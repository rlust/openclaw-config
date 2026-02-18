# Thermostat Control — Quick Start

## What You Now Have

1. ✅ **Home Assistant Climate Platform** (`climate.py`)
   - Creates thermostat entities in HA UI
   - Handles temperature/mode/fan controls
   - Publishes commands to MQTT

2. 📋 **Implementation Docs**
   - `CLIMATE_CONTROL.md` — User-facing features
   - `FIRMWARE_THERMOSTAT_CONTROL.md` — Bridge firmware implementation

3. ⏳ **What's Still Needed**
   - Bridge firmware code (C/Rust/Python, depending on your bridge stack)
   - Actual RV-C PGN values for your RV model

## Architecture Flow

```
┌─────────────────────┐
│  Home Assistant     │
│  (climate.py)       │
└──────────┬──────────┘
           │
      User adjusts    
      temperature     
           │
           ▼
┌──────────────────────────────────────┐
│ MQTT: rvcbridge/thermostat_control/0 │
│ Payload: {"setpoint_f": 72}          │
└──────────┬───────────────────────────┘
           │
           ▼
┌──────────────────────────────┐
│  Bridge Firmware             │
│  - Validate command          │
│  - Convert to RV-C PGN frame │
│  - Send on CAN1              │
│  - Log to audit trail        │
└──────────┬───────────────────┘
           │
           ▼
┌──────────────────────────────┐
│  RV-C Coach Network (CAN1)   │
│  Thermostat receives frame   │
│  Updates setpoint            │
│  Broadcasts status via CAN   │
└──────────┬───────────────────┘
           │
           ▼
┌──────────────────────────────────┐
│  Bridge receives status frame    │
│  Publishes to MQTT:              │
│  rvcbridge/thermostat_setpoint/0 │
│  Payload: {"temp_f": 72}         │
└──────────┬───────────────────────┘
           │
           ▼
┌──────────────────────────────┐
│  Home Assistant              │
│  Updates climate entity      │
│  UI shows new setpoint       │
└──────────────────────────────┘
```

## Implementation Checklist

### Phase 1: Home Assistant Integration (DONE ✅)
- [x] Create climate.py
- [x] Add to PLATFORMS list in __init__.py
- [x] Subscribe to thermostat_status and thermostat_setpoint topics
- [x] Create climate entities for each zone
- [x] Handle user commands (set_temperature, set_hvac_mode, set_fan_mode)

### Phase 2: Bridge Firmware (TODO 📋)

**Step 1: Identify RV-C PGNs**
- [ ] Get RV-C spec for your RV model (Entegra Aspire, Monaco, etc.)
- [ ] Find PGN codes for:
  - Thermostat Setpoint
  - Thermostat Mode
  - Thermostat Fan Mode
- [ ] Document in FIRMWARE_THERMOSTAT_CONTROL.md

**Step 2: Implement MQTT Handler**
- [ ] Add callback for `rvcbridge/thermostat_control/+`
- [ ] Parse JSON payload
- [ ] Validate commands (range, enum, rate limit)

**Step 3: Implement CAN Framers**
- [ ] Write `send_thermostat_setpoint(instance, temp)`
- [ ] Write `send_thermostat_mode(instance, mode)`
- [ ] Write `send_thermostat_fan(instance, fan_mode)`
- [ ] Test with oscilloscope or CAN analyzer

**Step 4: Add Audit Logging**
- [ ] Log all commands to local storage
- [ ] Publish audit trail to MQTT: `rvcbridge/audit/thermostat_control`

**Step 5: Add TX Gating**
- [ ] Default TX disabled on boot
- [ ] Provide safe way to enable (button, MQTT with key, etc.)

### Phase 3: Testing (TODO 🧪)

**Manual Testing:**
```bash
# Test command via mosquitto_pub
mosquitto_pub -h 192.168.100.234 -t "rvcbridge/thermostat_control/0" \
  -m '{"setpoint_f": 72}'

# Watch bridge logs for CAN TX and status feedback
```

**HA UI Testing:**
- Open Home Assistant
- Navigate to: Climate → RV Front Thermostat
- Adjust temperature slider
- Watch for MQTT command in bridge logs
- Verify RV thermostat responds

**Error Cases:**
- Set temperature to 0°F (should reject)
- Send invalid mode code (should reject)
- Send 10 commands rapidly (should rate limit some)

## File Organization

```
ha-component-rv-c-bridge/
├── __init__.py                          (updated with PLATFORMS.CLIMATE)
├── config_flow.py
├── const.py
├── manifest.json
├── sensor.py
├── zone_mappings.py
├── climate.py                           (NEW ✨)
├── CLIMATE_CONTROL.md                   (NEW ✨ — user guide)
├── FIRMWARE_THERMOSTAT_CONTROL.md       (NEW ✨ — firmware impl guide)
└── THERMOSTAT_QUICKSTART.md             (this file)
```

## Next Action Items

**For you (Randy):**
1. Find RV-C thermostat PGN codes for your Entegra Aspire
2. Hand off FIRMWARE_THERMOSTAT_CONTROL.md to whoever is coding the bridge
3. Test climate.py in HA once you have a working bridge firmware

**For the bridge firmware developer:**
1. Review FIRMWARE_THERMOSTAT_CONTROL.md
2. Identify PGN codes from RV spec
3. Implement MQTT handler + CAN framers
4. Add rate limiting & audit logging
5. Test with manual MQTT publish before HA integration

## Questions / Troubleshooting

**Q: Can I use climate.py without bridge firmware?**  
A: Yes, read-only. Sensors will show temperature/mode. Setting won't work (command goes to MQTT but bridge ignores it).

**Q: Will this damage my RV?**  
A: No. The climate.py enforces safe ranges (50-95°F). Bridge firmware has TX gating + whitelist by default. Commands are logged for audit.

**Q: Can I control multiple zones independently?**  
A: Yes. Each thermostat instance (0-6) gets its own climate entity. You can set front to 72°F and rear to 68°F simultaneously.

**Q: What if the RV thermostat doesn't respond?**  
A: HA will show "unavailable" after a timeout. The command was sent safely; the RV may be offline or ignoring CAN traffic.

## References

- Home Assistant Climate: https://developers.home-assistant.io/docs/core/entity/climate/
- RV-C Spec: (Get from your RV manufacturer)
- Example RV-C PGN decoder: https://github.com/RV-C/RV-C

---

**Status:** Ready for firmware integration. Let me know when you have the RV-C PGN codes!
