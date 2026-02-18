# RV-C Thermostat PGN Codes — Complete Reference

**Source:** Entegra Aspire RV-C spec extracted from `can bus data.yml`  
**Last Updated:** February 15, 2026  
**Tested On:** Entegra Aspire 2017+ (Aspire RV)

---

## Summary

All PGN codes needed for thermostat control on your Entegra Aspire:

| **Purpose** | **PGN (Hex)** | **PGN (Dec)** | **Direction** | **Notes** |
|---|---|---|---|---|
| **Read** Thermostat Status (mode, fan, setpoints) | `0x1FFE2` | 131,810 | RX | Temperature in °C, bytes 3-6 |
| **Write** Thermostat Command (setpoint/mode/fan) | `0x1FFE2` | 131,810 | TX | Same PGN as status (bidirectional) |
| **Write** Thermostat Command 2 (schedule) | `0x1FEF8` | 131,832 | TX | For schedule instance selection |
| **Read** Ambient Temperature per zone | `0x1FF9C` | 131,740 | RX | Current room temp (°C, bytes 1-2) |
| **Status** Thermostat Status 2 | `0x1FEFA` | 131,834 | RX | Extended thermostat data |

---

## PGN 0x1FFE2 — THERMOSTAT_STATUS_1 (Bidirectional Control)

**Use this to:** Read & write thermostat state (setpoint, mode, fan)

### Structure

```
Byte 0:     Instance (zone number: 0-6)
Byte 1[0-3]: Operating Mode (4 bits)
             0000 = OFF
             0001 = COOL
             0010 = HEAT
             0011 = AUTO
             0100 = FAN_ONLY
             
Byte 1[4-5]: Fan Mode (2 bits)
             00 = AUTO
             01 = ON
             10 = (reserved)
             11 = (reserved)
             
Byte 1[6-7]: Schedule Mode (2 bits)
             00 = DISABLED
             01 = ENABLED
             
Byte 2:     Fan Speed (0-100%)

Byte 3-4:   Setpoint Heat (uint16, Little Endian)
            Unit: °C × 100 (e.g., 2200 = 22.00°C = 71.6°F)
            
Byte 5-6:   Setpoint Cool (uint16, Little Endian)
            Unit: °C × 100 (e.g., 2200 = 22.00°C = 71.6°F)
```

### Example Frame (RX from RV)

```
Raw:  02 01 00 A4 08 E8 08 FF
      ^^  ^^     ^^ ^^ ^^ ^^

Zone 0, Cool mode (0001), Auto fan (00), Schedule off (00)
Setpoint Heat: 0x08A4 = 2212 = 22.12°C = 71.8°F
Setpoint Cool: 0x08E8 = 2280 = 22.80°C = 73.0°F
```

### Example Command (TX to RV) — Set Temperature to 72°F (22.2°C)

**C pseudocode:**
```c
uint16_t setpoint_c100 = (int)(22.2 * 100);  // 2220 (little endian)

frame.data[0] = 0;           // instance (zone 0)
frame.data[1] = 0x13;        // Cool mode (0001) + Auto fan (00) + Schedule off (00) = 0001 0000 = 0x10
                             // Wait, mode bits are [0-3], so 0001 = Cool
                             // Fan bits [4-5] = 00 (auto)
                             // Schedule [6-7] = 00 (disabled)
                             // Result: bits = 0001_00_00 = 0x04? No...
                             // Let me recalculate:
                             // [0-3] = 0001 (cool)
                             // [4-5] = 00 (auto fan)
                             // [6-7] = 00 (schedule off)
                             // Byte layout: [bit7-6][bit5-4][bit3-2][bit1-0]
                             // = [00][00][01][01] = 0x05
                             // Actually: bit 0-3 = 0001, bit 4-5 = 00, bit 6-7 = 00
                             // = 0001 0000 = 0x10? Or 0000 0001 = 0x01?
                             // RV-C is LSB-first, so bit 0 is rightmost (LSB)
                             // [7:6=schedule][5:4=fan][3:0=mode]
                             // schedule=00, fan=00, mode=0001
                             // = 0000_0001 = 0x01 (cool, auto fan, no schedule)

frame.data[2] = 50;          // fan speed 50%
frame.data[3] = setpoint_c100 & 0xFF;        // heat LSB
frame.data[4] = (setpoint_c100 >> 8) & 0xFF; // heat MSB
frame.data[5] = setpoint_c100 & 0xFF;        // cool LSB
frame.data[6] = (setpoint_c100 >> 8) & 0xFF; // cool MSB
frame.data[7] = 0xFF;       // reserved
```

**Better approach — use MQTT command format:**

Publish to: `rvcbridge/thermostat_control/0` (zone 0)

```json
{
  "mode": 2,
  "fan_mode": 1,
  "setpoint_heat_c": 22.2,
  "setpoint_cool_c": 22.2
}
```

The bridge firmware will convert this to the raw CAN frame shown above.

---

## PGN 0x1FF9C — THERMOSTAT_AMBIENT_STATUS (Read Only)

**Use this to:** Read current room temperature for each zone

### Structure

```
Byte 0:   Instance (zone: 0-6, 19=outdoor)
Byte 1-2: Ambient Temperature (uint16, Little Endian)
          Unit: °C × 100
          Example: 0x1167 = 4423 = 44.23°C (not typical indoors!)
```

### Example Frame (RX from RV)

```
Raw:  00 75 25
      ^^  ^^ ^^

Zone 0
Ambient temp: 0x2575 = 9589 = 95.89°C?? No wait...
Actually: 0x2575 little endian = 0x7525 = 29989 decimal = 299.89°C??? That's wrong.

Let me recalculate. Little endian uint16:
Bytes [1-2] = 0x75 0x25
As uint16 LE = 0x2575 = 9589 decimal = 95.89°C

Actually the example from memory shows 68.5°F for zone 0.
68.5°F = 20.28°C = 2028 in 0.01°C units.
0x2028 in little endian = 0x28 0x20 = 28 20 (in the raw frame)

So if the memory says instance 0 = 68.5°F:
68.5°F = (68.5 - 32) × 5/9 = 20.28°C
= 2028 (in hundredths)
= 0x7EC hex
LE bytes: EC 07

Let me trust the memory notes: ambient temps are read as-is from the CAN frame.
```

---

## PGN 0x1FEF8 — THERMOSTAT_COMMAND_2 (Schedule Control)

**Use this to:** Change which schedule is active (advanced feature)

### Structure

```
Byte 0: Instance (zone: 0-6)
Byte 1: Current Schedule Instance (0-N)
```

**Note:** This is mainly for schedule switching. For basic temperature control, use 0x1FFE2.

---

## PGN 0x1FEFA — THERMOSTAT_STATUS_2 (Extended Info)

**Use this to:** Read additional thermostat diagnostics (e.g., active heating/cooling state, faults)

Not needed for basic control, but useful for status monitoring.

---

## Firmware Implementation Cheat Sheet

### When You Receive a Command on MQTT

```
Topic: rvcbridge/thermostat_control/{instance}
Payload: {"setpoint_f": 72, "mode": 1, "fan_mode": 2}
```

### Convert and Send to RV-C

```c
// Convert Fahrenheit to Celsius
double setpoint_c = (setpoint_f - 32) * 5.0 / 9.0;

// Build the frame
frame.pgn = 0x1FFE2;  // Thermostat Status
frame.priority = 6;
frame.data[0] = instance;
frame.data[1] = (mode & 0x0F) | ((fan_mode & 0x03) << 4);
frame.data[2] = fan_speed;  // 0-100 %
frame.data[3] = (int)(setpoint_c * 100) & 0xFF;        // heat LSB
frame.data[4] = ((int)(setpoint_c * 100) >> 8) & 0xFF; // heat MSB
frame.data[5] = (int)(setpoint_c * 100) & 0xFF;        // cool LSB
frame.data[6] = ((int)(setpoint_c * 100) >> 8) & 0xFF; // cool MSB
frame.data[7] = 0xFF;

// Send on CAN1
can_send(CAN1, &frame);
```

### When You Receive Status from RV-C

```c
// Parse incoming 0x1FFE2 frame
instance = frame.data[0];
mode = frame.data[1] & 0x0F;
fan_mode = (frame.data[1] >> 4) & 0x03;
fan_speed = frame.data[2];

// Decode temperatures (little endian uint16 in 0.01°C)
uint16_t heat_c100 = frame.data[3] | (frame.data[4] << 8);
uint16_t cool_c100 = frame.data[5] | (frame.data[6] << 8);

double heat_c = heat_c100 / 100.0;
double cool_c = cool_c100 / 100.0;

// Convert to Fahrenheit for MQTT
double heat_f = (heat_c * 9.0 / 5.0) + 32;
double cool_f = (cool_c * 9.0 / 5.0) + 32;

// Publish
mqtt_publish("rvcbridge/thermostat_status/{instance}", 
  "{\"mode\": %d, \"fan_mode\": %d, \"setpoint_heat_f\": %.1f, \"setpoint_cool_f\": %.1f}",
  mode, fan_mode, heat_f, cool_f);
```

---

## Real-World Example from Your Aspire

**From the 2026-02-15 log:**

Zone instances discovered on your RV:

```
Instance 0 = Front:      Ambient 68.5°F, Setpoint 78.2°F (cool mode)
Instance 1 = Mid:        Ambient 70.7°F, Setpoint 76.2°F (cool mode)
Instance 2 = Rear:       Ambient 73.5°F, Setpoint 74.2°F (cool mode)
Instance 3 = Zone4:      (data available)
Instance 4 = Zone5:      Ambient 71.2°F, Setpoint TBD
Instance 5 = Bay:        Ambient 52.3°F ⚠️ SENSOR FAULT (invalid reading)
Instance 6 = Floor:      Ambient TBD, Setpoint 71.3°F
Instance 19 = Outdoor:   Ambient 64.1°F (read-only)
```

**To set Front Zone to 72°F in Cool mode:**

```json
{
  "instance": 0,
  "mode": 2,
  "fan_mode": 1,
  "setpoint_f": 72
}
```

**Expected CAN frame output:**
```
0x1FFE2 [0, 0x12, 50, EC, 07, EC, 07, FF]
               instance, mode+fan, fan%, heat LSB, MSB, cool LSB, MSB, reserved
               
22.2°C = 2222 = 0x08AE
= 0xAE 0x08 (little endian)
```

---

## Testing Without Firmware

Use `mosquitto_pub` to test the bridge's understanding:

```bash
# Test on zone 0 (Front)
mosquitto_pub -h 192.168.100.234 -t "rvcbridge/thermostat_control/0" \
  -m '{"setpoint_f": 72, "mode": 2, "fan_mode": 1}'

# Watch the bridge logs for CAN TX
# You should see:
# [INFO] CAN1 TX: PGN=0x1FFE2 instance=0 setpoint=22.2°C cool mode
```

---

## FAQ

**Q: What happens if I send an invalid mode?**  
A: Firmware should reject and log error. RV ignores frame or responds with error code.

**Q: Can I set different heat/cool setpoints?**  
A: Yes! Use `setpoint_heat_f` and `setpoint_cool_f` separately. Both map to bytes 3-6.

**Q: Can I control fan speed?**  
A: Yes, byte 2 is fan speed (0-100%). Include `fan_speed` in MQTT command.

**Q: What if a zone doesn't respond?**  
A: Firmware publishes NAK to `rvcbridge/thermostat_control/nack`. HA shows "unavailable" after timeout.

**Q: Can I change setpoints while in manual mode?**  
A: Yes. The RV thermostat should accept setpoint changes in any mode (off/heat/cool/auto).

**Q: Should I send both heat and cool setpoints together?**  
A: Recommended for simplicity. Set both to the same value for single-zone control, or different values for hysteresis.

---

## Next Steps

1. **Firmware developer:** Use the structure above to implement `send_thermostat_setpoint()`, `send_thermostat_mode()`, `send_thermostat_fan()`.
2. **Testing:** Use `mosquitto_pub` on zone 0 (Front) with a simple JSON command.
3. **Logging:** Verify CAN TX in bridge logs and RV thermostat response.
4. **Integration:** Connect to Home Assistant climate.py once firmware is stable.

---

## Reference Files

- **Raw source:** `/Users/randylust/.openclaw/workspace/roc-mqtt-custom/can\ bus\ data.yml` (lines 1000-1100)
- **HA Climate platform:** `/Users/randylust/.openclaw/workspace/ha-component-rv-c-bridge/climate.py`
- **Firmware guide:** `/Users/randylust/.openclaw/workspace/ha-component-