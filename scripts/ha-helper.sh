#!/bin/bash
# Home Assistant API helper script

HA_URL="http://192.168.100.234:8123"
HA_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJhYzRlZWZiMTkwYTY0YWIxYWM5YjNhMWYxMzY0ZGQyZCIsImlhdCI6MTc2OTYzNzg0NywiZXhwIjoyMDg0OTk3ODQ3fQ.L-_SFOLFCbHaO9K7aGKA0mT5E5ZHzRTbNaeqYynOtTI"

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

# Get lights
elif [ "$1" == "lights" ]; then
    curl -s -X GET "$HA_URL/api/states" \
      -H "Authorization: Bearer $HA_TOKEN" \
      -H "Content-Type: application/json" | \
      jq '[.[] | select(.entity_id | startswith("light.")) | {entity_id, state, name: .attributes.friendly_name}]'

else
    echo "Usage: ha-helper.sh [states|get|service|climate|lights] [args...]"
    echo ""
    echo "Examples:"
    echo "  ha-helper.sh states              # Get all states"
    echo "  ha-helper.sh get sensor.temp     # Get specific entity"
    echo "  ha-helper.sh climate             # Show climate devices"
    echo "  ha-helper.sh lights              # Show all lights"
fi
