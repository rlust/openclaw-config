# RV-C Bridge Firmware: Thermostat Control Implementation

## Overview

This guide explains how the bridge **firmware** should handle thermostat control commands from Home Assistant.

## MQTT Subscription

The firmware **must subscribe** to the control topic:

```c
mqtt_subscribe("rvcbridge/thermostat_control/+");
```

When a message arrives on `rvcbridge/thermostat_control/0`, `rvcbridge/thermostat_control/1`, etc., the handler is invoked.

## Message Handler

```c
void mqtt_on_thermostat_control(char *topic, char *payload) {
    // topic = "rvcbridge/thermostat_control/0"
    // payload = '{"setpoint_f": 72, "mode": 1, "fan_mode": 2}'
    
    // Parse instance from topic
    int instance = atoi(strrchr(topic, '/') + 1);
    
    // Validate instance (0-6 for typical RVs)
    if (instance < 0 || instance > 6) {
        log_audit("ERR", instance, "invalid_instance", payload);
        return;
    }
    
    // Parse JSON
    cJSON *cmd = cJSON_Parse(payload);
    if (!cmd) {
        log_audit("ERR", instance, "invalid_json", payload);
        return;
    }
    
    // Check rate limit (max 1 cmd per 2 seconds per zone)
    if (!check_rate_limit(instance, 2000)) {
        log_audit("RATE_LIMITED", instance, "cmd_rejected", payload);
        cJSON_Delete(cmd);
        return;
    }
    
    // Extract and validate commands
    int rc = RV_SUCCESS;
    
    // === TEMPERATURE SETPOINT ===
    if (cJSON_HasObjectItem(cmd, "setpoint_f")) {
        double setpoint = cJSON_GetObjectItem(cmd, "setpoint_f")->valuedouble;
        
        if (setpoint < 50 || setpoint > 95) {
            log_audit("ERR", instance, "setpoint_out_of_range", 
                      "{\"value\": %.1f}", setpoint);
            rc = RV_ERR_INVALID_RANGE;
        } else {
            // Send RV-C PGN for thermostat setpoint
            // Example: PGN_THERMOSTAT_SETPOINT (depends on your RV's docs)
            rc = send_thermostat_setpoint(instance, setpoint);
            log_audit(rc ? "ERR" : "OK", instance, "setpoint_change",
                      "{\"new_setpoint_f\": %.1f}", setpoint);
        }
    }
    
    // === HVAC MODE ===
    if (cJSON_HasObjectItem(cmd, "mode")) {
        int mode = cJSON_GetObjectItem(cmd, "mode")->valueint;
        
        // Validate mode (0=OFF, 1=HEAT, 2=COOL, 3=AUTO, 4=FAN_ONLY)
        if (mode < 0 || mode > 4) {
            log_audit("ERR", instance, "invalid_mode", 
                      "{\"mode\": %d}", mode);
            rc = RV_ERR_INVALID_MODE;
        } else {
            rc = send_thermostat_mode(instance, mode);
            const char *mode_str[] = {"OFF", "HEAT", "COOL", "AUTO", "FAN"};
            log_audit(rc ? "ERR" : "OK", instance, "mode_change",
                      "{\"new_mode\": \"%s\"}", mode_str[mode]);
        }
    }
    
    // === FAN MODE ===
    if (cJSON_HasObjectItem(cmd, "fan_mode")) {
        int fan = cJSON_GetObjectItem(cmd, "fan_mode")->valueint;
        
        // Validate fan (0=OFF, 1=AUTO, 2=ON)
        if (fan < 0 || fan > 2) {
            log_audit("ERR", instance, "invalid_fan_mode", 
                      "{\"fan_mode\": %d}", fan);
            rc = RV_ERR_INVALID_FAN;
        } else {
            rc = send_thermostat_fan(instance, fan);
            const char *fan_str[] = {"OFF", "AUTO", "ON"};
            log_audit(rc ? "ERR" : "OK", instance, "fan_change",
                      "{\"new_fan\": \"%s\"}", fan_str[fan]);
        }
    }
    
    // Cleanup
    cJSON_Delete(cmd);
    
    // Optionally publish result back
    if (rc != RV_SUCCESS) {
        char err_msg[128];
        snprintf(err_msg, sizeof(err_msg), 
                 "{\"error\": %d, \"msg\": \"command_failed\"}", rc);
        mqtt_publish("rvcbridge/thermostat_control/nack", err_msg);
    }
}
```

## CAN Frame Transmission

Each control command maps to one or more RV-C PGNs. For the Entegra Aspire, the thermostat control uses **PGN 0x1FFE2** (THERMOSTAT_STATUS_1) in both directions (RX status, TX commands).

### Thermostat Control PGN (0x1FFE2 — THERMOSTAT_STATUS_1)

```c
int send_thermostat_control(int instance, double setpoint_f, int mode, int fan_mode) {
    // Convert Fahrenheit to Celsius
    // Unit: 0.01°C (multiply by 100)
    double setpoint_c = (setpoint_f - 32) * 5.0 / 9.0;
    uint16_t setpoint_c100 = (uint16_t)(setpoint_c * 100);  // Little endian uint16
    
    // Build RV-C CAN frame
    struct rvc_frame frame = {
        .pgn = 0x1FFE2,  // Thermostat Status (bidirectional control)
        .priority = 6,
        .instance = instance,
        .data_len = 8,
    };
    
    // Construct payload (little-endian uint16 for temperatures)
    // Byte layout:
    //  [0] = instance (zone: 0-6)
    //  [1] = mode[3:0] | fan_mode[5:4] | schedule[7:6]
    //  [2] = fan_speed (0-100%)
    //  [3-4] = setpoint heat (uint16 LE, °C × 100)
    //  [5-6] = setpoint cool (uint16 LE, °C × 100)
    //  [7] = reserved (0xFF)
    
    frame.data[0] = instance;
    frame.data[1] = (mode & 0x0F) | ((fan_mode & 0x03) << 4);  // Combine mode + fan
    frame.data[2] = 50;  // Fan speed (can be made configurable)
    
    // Heat setpoint (use same as cool for single setpoint)
    frame.data[3] = setpoint_c100 & 0xFF;        // LSB
    frame.data[4] = (setpoint_c100 >> 8) & 0xFF; // MSB
    
    // Cool setpoint
    frame.data[5] = setpoint_c100 & 0xFF;        // LSB
    frame.data[6] = (setpoint_c100 >> 8) & 0xFF; // MSB
    
    frame.data[7] = 0xFF;  // Reserved
    
    // TX gate check
    if (!tx_enabled) {
        log_audit("ERR", instance, "tx_disabled", 
                  "{\"reason\": \"hardware_gate\"");
        return RV_ERR_TX_DISABLED;
    }
    
    // Send on CAN1
    int rc = can_send(CAN1, &frame);
    
    if (rc == 0) {
        log_debug("CAN1 TX: PGN=0x%X instance=%d setpoint=%.1f°C",
                  frame.pgn, instance, setpoint_c);
    } else {
        log_error("CAN1 TX FAILED: %d", rc);
    }
    
    return rc;
}
```

### Ambient Temperature Reading (0x1FF9C — THERMOSTAT_AMBIENT_STATUS)

This PGN is **read-only** from the RV thermostat. Your CAN RX handler should parse this:

```c
void handle_thermostat_ambient_status(struct rvc_frame *frame) {
    // PGN 0x1FF9C
    int instance = frame->data[0];
    
    // Temperature: uint16 little-endian, unit 0.01°C
    uint16_t temp_c100 = frame->data[1] | (frame->data[2] << 8);
    double temp_c = temp_c100 / 100.0;
    double temp_f = (temp_c * 9.0 / 5.0) + 32;
    
    // Publish to MQTT for HA
    char topic[64];
    snprintf(topic, sizeof(topic), "rvcbridge/thermostat_ambient/%d", instance);
    
    char payload[128];
    snprintf(payload, sizeof(payload), "{\"temp_c\": %.2f, \"temp_f\": %.2f}", 
             temp_c, temp_f);
    
    mqtt_publish(topic, payload);
}
```

### Thermostat Status Reading (0x1FFE2 — THERMOSTAT_STATUS_1)

This PGN carries the current thermostat state. Parse it like this:

```c
void handle_thermostat_status(struct rvc_frame *frame) {
    // PGN 0x1FFE2
    int instance = frame->data[0];
    
    // Mode: bits [3:0] of byte 1
    int mode = frame->data[1] & 0x0F;
    // Values: 0=OFF, 1=COOL, 2=HEAT, 3=AUTO, 4=FAN_ONLY
    
    // Fan mode: bits [5:4] of byte 1
    int fan_mode = (frame->data[1] >> 4) & 0x03;
    // Values: 0=AUTO, 1=ON
    
    // Fan speed: byte 2
    int fan_speed = frame->data[2];
    
    // Setpoint heat: bytes [3-4] (uint16 LE, 0.01°C)
    uint16_t heat_c100 = frame->data[3] | (frame->data[4] << 8);
    double heat_c = heat_c100 / 100.0;
    double heat_f = (heat_c * 9.0 / 5.0) + 32;
    
    // Setpoint cool: bytes [5-6] (uint16 LE, 0.01°C)
    uint16_t cool_c100 = frame->data[5] | (frame->data[6] << 8);
    double cool_c = cool_c100 / 100.0;
    double cool_f = (cool_c * 9.0 / 5.0) + 32;
    
    // Publish to MQTT
    char topic[64];
    snprintf(topic, sizeof(topic), "rvcbridge/thermostat_status/%d", instance);
    
    char payload[256];
    snprintf(payload, sizeof(payload),
             "{\"mode\": %d, \"fan_mode\": %d, \"fan_speed\": %d, "
             "\"setpoint_heat_c\": %.2f, \"setpoint_heat_f\": %.2f, "
             "\"setpoint_cool_c\": %.2f, \"setpoint_cool_f\": %.2f}",
             mode, fan_mode, fan_speed, heat_c, heat_f, cool_c, cool_f);
    
    mqtt_publish(topic, payload);
}
```

## Rate Limiting & Safety

```c
// Track last command timestamp per instance
static uint32_t last_command_ms[7] = {0};
static const uint32_t MIN_INTERVAL_MS = 2000;  // 2 sec between commands

int check_rate_limit(int instance, uint32_t min_interval) {
    uint32_t now = millis();
    uint32_t elapsed = now - last_command_ms[instance];
    
    if (elapsed < min_interval) {
        return 0;  // Rate limited
    }
    
    last_command_ms[instance] = now;
    return 1;  // OK
}
```

## Audit Logging

Every command is logged for safety & debugging:

```c
void log_audit(const char *status, int instance, const char *action,
               const char *fmt, ...) {
    // Build JSON entry
    struct audit_entry {
        time_t timestamp;
        int instance;
        char status[16];      // "OK", "ERR", "RATE_LIMITED"
        char action[32];      // "setpoint_change", "mode_change", etc.
        char details[256];    // Custom JSON data
    };
    
    // Append to local audit log (flash storage or SDIO)
    // Also publish to MQTT for visibility:
    // rvcbridge/audit/thermostat_control
    
    char audit_json[512];
    time_t now = time(NULL);
    snprintf(audit_json, sizeof(audit_json),
             "{"
             "\"timestamp\": %ld, "
             "\"instance\": %d, "
             "\"status\": \"%s\", "
             "\"action\": \"%s\", "
             "\"details\": ...",
             now, instance, status, action);
    
    mqtt_publish("rvcbridge/audit/thermostat_control", audit_json);
}
```

## Boot-up & TX Gating

On firmware startup:

```c
void firmware_init(void) {
    // ...
    
    // TX disabled by default (safe mode)
    tx_enabled = 0;
    log_info("Boot: Thermostat TX is DISABLED (safe mode)");
    
    // User/admin can enable with a button press or MQTT command:
    // mqtt publish rvcbridge/system/enable_tx with {"key": "admin_key"}
    
    // Or if a physical switch is present:
    // if (gpio_read(TX_ENABLE_SWITCH) == HIGH) {
    //     tx_enabled = 1;
    //     log_info("TX ENABLE switch is ON");
    // }
}
```

## Next Steps

1. **Identify actual RV-C PGN values** from your RV's CAN docs (Entegra Aspire, Monaco Coach, etc.)
2. **Implement CAN frame builders** for each thermostat PGN (setpoint, mode, fan)
3. **Test with MQTT pub** before integrating with HA
4. **Monitor audit logs** for any rejected or errored commands
5. **Iterate on rate limits** based on RV hardware responsiveness
