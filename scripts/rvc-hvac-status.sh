#!/bin/bash

# RV-C HVAC Status Query
# Returns current HVAC state from Home Assistant MQTT

HA_URL="http://ha-aspire-rvc-new.tail1f233.ts.net:8123"  # Tailscale Aspire RV HA
HA_TOKEN=$(grep -A 2 "Home Assistant (Aspire RV)" /Users/randylust/.openclaw/workspace/.credentials 2>/dev/null | grep "Long-lived" | cut -d' ' -f5)

if [ -z "$HA_TOKEN" ]; then
  echo "ERROR: No Home Assistant token found"
  exit 1
fi

# Query current climate state - Actual Aspire RV entities
# Primary: climate.thermostat_status_1 (AC Front)
# Secondary: climate.air_conditioner_status_4 (AC Mid)
STATUS=$(curl -s -H "Authorization: Bearer $HA_TOKEN" \
  "$HA_URL/api/states/climate.thermostat_status_1" 2>/dev/null)

if [ -z "$STATUS" ]; then
  echo "ERROR: Could not reach Home Assistant"
  exit 1
fi

# Parse JSON response using jq
MODE=$(echo "$STATUS" | jq -r '.state // empty' 2>/dev/null || echo "auto")
CURRENT_TEMP=$(echo "$STATUS" | jq '.attributes.current_temperature // 72' 2>/dev/null)
TARGET_TEMP=$(echo "$STATUS" | jq '.attributes.temperature // 75' 2>/dev/null)
FAN_MODE=$(echo "$STATUS" | jq -r '.attributes.fan_mode // "auto"' 2>/dev/null || echo "auto")

# Get room temperatures from Aspire RVC sensors
OUTSIDE=$(curl -s -H "Authorization: Bearer $HA_TOKEN" \
  "$HA_URL/api/states/sensor.zone_19_ambient_temperature" 2>/dev/null | jq '.state' 2>/dev/null)

COACH=$(curl -s -H "Authorization: Bearer $HA_TOKEN" \
  "$HA_URL/api/states/sensor.atom_s3_lite_env_iv_env_iv_temperature" 2>/dev/null | jq '.state' 2>/dev/null)

# Get AC status for additional zones
AC_MID=$(curl -s -H "Authorization: Bearer $HA_TOKEN" \
  "$HA_URL/api/states/climate.air_conditioner_status_4" 2>/dev/null | jq '.state' 2>/dev/null)

# Output JSON for parsing
cat <<EOF
{
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "hvac": {
    "mode": "$MODE",
    "current_temp": $CURRENT_TEMP,
    "target_temp": $TARGET_TEMP,
    "fan_mode": "$FAN_MODE"
  },
  "zones": {
    "outside": $OUTSIDE,
    "coach": $COACH,
    "ac_mid": $AC_MID
  },
  "status": "online"
}
EOF
