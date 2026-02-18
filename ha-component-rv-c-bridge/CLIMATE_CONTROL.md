# RV-C Bridge Climate (Thermostat) Control

## Overview

The Climate platform adds **thermostat control** to Home Assistant for your RV. It integrates with the RV-C Bridge to:

- **Read** thermostat status (mode, fan mode, current setpoint)
- **Write** commands (temperature, HVAC mode, fan mode)
- Control each zone independently (front, mid, rear, bay, floor, etc.)

## How It Works

### 1. Home Assistant (climate.py)
- Creates a `climate` entity for each thermostat zone
- User adjusts temperature or mode in HA UI
- Service calls are converted to RV-C commands
- Commands published to: `rvcbridge/thermostat_control/{instance}`

### 2. Bridge Firmware
- Subscribes to `rvcbridge/thermostat_control/#`
- Parses command JSON
- Converts to RV-C PGN frames
- Sends on CAN1 (house/coach network)
- Logs all TX for audit

### 3. RV Hardware
- RV thermostat receives CAN frame
- Updates setpoint/mode/fan
- Broadcasts status back via CAN
- Bridge forwards status to MQTT sensors

## Entity Examples

In Home Assistant, you'll see:

```
climate.rv_front_thermostat
climate.rv_mid_thermostat
climate.rv_rear_thermostat
climate.rv_bay_thermostat
climate.rv_floor_thermostat
climate.rv_zone_4_thermostat
```

## Supported Commands

### Set Temperature
```json
{
  "setpoint_f": 72
}
```
Publishes to: `rvcbridge/thermostat_control/{instance}`

### Set HVAC Mode
```json
{
  "mode": 1
}
```
Mode codes:
- `0` = OFF
- `1` = HEAT
- `2` = COOL
- `3` = AUTO (HEAT_COOL)
- `4` = FAN_ONLY

### Set Fan Mode
```json
{
  "fan_mode": 1
}
```
Fan mode codes:
- `0` = OFF
- `1` = AUTO
- `2` = ON

### Combined Command
```json
{
  "setpoint_f": 72,
  "mode": 1,
  "fan_mode": 2
}
```

## Firmware Implementation (Bridge)

The bridge firmware needs to:

1. **Subscribe to control topic**
   ```
   MQTT: rvcbridge/thermostat_control/+
   ```

2. **Parse and validate command**
   ```c
   // Pseudo-code
   if (msg.setpoint_f) {
       validate_range(50, 95);
       send_rvc_pgn(PGN_THERMOSTAT_SETPOINT, instance, setpoint);
   }
   if (msg.mode) {
       validate_enum(0, 4);
       send_rvc_pgn(PGN_THERMOSTAT_MODE, instance, mode);
   }
   // ... etc
   ```

3. **Rate limit & audit**
   - Max 1 command per 2 seconds per zone
   - Log to local JSON: `{"ts": "2026-02-15T...", "zone": 0, "cmd": {...}, "result": "OK"}`
   - Publish audit to: `rvcbridge/audit/thermostat_control`

4. **Gating (Safety)**
   - Only allow if TX is enabled (GPIO gate + firmware flag)
   - Whitelist PGNs by instance (config file or hardcoded per zone)
   - On error: publish nack to MQTT, log locally

## Testing

### 1. Manual MQTT publish (mosquitto_pub)
```bash
mosquitto_pub -h 192.168.100.234 -t "rvcbridge/thermostat_control/0" -m '{"setpoint_f": 70}'
```

### 2. Home Assistant Climate UI
- Go to Climate entity
- Adjust temperature slider or mode dropdown
- Watch the bridge logs:
  ```
  [INFO] RVC TX: PGN=<X> instance=0 setpoint=70°F
  ```

### 3. Check status feedback
- Watch `rvcbridge/thermostat_setpoint/0` for ACK from RV hardware
- Should see new temperature published back

## Error Handling

### Publish fails (MQTT offline)
- HA UI shows "unavailable"
- Command is not queued (stateless)
- Retry by user re-adjusting in HA

### Bridge firmware rejects command
- Invalid range, out-of-bounds instance, etc.
- Firmware publishes nack JSON to control topic
- HA logs warning

### RV hardware doesn't respond
- Status sensors don't update within 5 seconds
- HA treats as "unavailable" (optional timeout)
- User can force retry

## Future Enhancements

- [ ] Multi-zone presets (e.g., "sleeping mode" = all zones 65°F)
- [ ] Thermostat lock (read-only mode to prevent accidental changes)
- [ ] Scheduling (via HA automations + cron)
- [ ] Temperature history / analytics
- [ ] Integration with awning/slide controls for smart cooling

## References

- **RV-C PGN**: Thermostat setpoint / mode / status (check Entegra/Monaco docs)
- **MQTT**: rvcbridge/* spec
- **HA Climate**: https://developers.home-assistant.io/docs/core/entity/climate/
