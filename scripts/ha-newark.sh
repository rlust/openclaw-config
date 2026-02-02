#!/bin/bash
# Home Assistant API helper script for Newark Home

HA_URL="https://ykm02dybhyaob0myui6lj13x8kl7n996.ui.nabu.casa"
HA_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiI2NDE3N2FjYjNkNjk0YThhYTlhZjBjZmVmMjgxYTE3MSIsImlhdCI6MTc3MDAwMzcyMCwiZXhwIjoyMDg1MzYzNzIwfQ.Wq-ZjuWi5gVpAP8Ql5fTVm6hRMuZlykSTjo2xB0oI1Q"

# Get all states
if [ "$1" == "states" ]; then
    curl -s -X GET "$HA_URL/api/states" \
      -H "Authorization: Bearer $HA_TOKEN" \
      -H "Content-Type: application/json"

# Get specific entity
elif [ "$1" == "get" ] && [ -n "$2" ]; then
    curl -s -X GET "$HA_URL/api/states/$2" \
      -H "Authorization: Bearer $HA_TOKEN" \
      -H "Content-Type: application/json"

# Call service
elif [ "$1" == "service" ] && [ -n "$2" ]; then
    curl -s -X POST "$HA_URL/api/services/$2" \
      -H "Authorization: Bearer $HA_TOKEN" \
      -H "Content-Type: application/json" \
      -d "${3:-{}}"

# Get climate info
elif [ "$1" == "climate" ]; then
    curl -s -X GET "$HA_URL/api/states" \
      -H "Authorization: Bearer $HA_TOKEN" \
      -H "Content-Type: application/json" | \
      jq '[.[] | select(.entity_id | startswith("climate.")) | {entity_id, state, temp: .attributes.current_temperature, target: .attributes.temperature}]'

# Get alarm/security info
elif [ "$1" == "security" ]; then
    curl -s -X GET "$HA_URL/api/states" \
      -H "Authorization: Bearer $HA_TOKEN" \
      -H "Content-Type: application/json" | \
      jq '[.[] | select(.entity_id | startswith("alarm_control_panel.") or startswith("lock.") or startswith("binary_sensor.door") or startswith("binary_sensor.window")) | {entity_id, state, name: .attributes.friendly_name}]'

else
    echo "Usage: ha-newark.sh [states|get|service|climate|security] [args...]"
fi
