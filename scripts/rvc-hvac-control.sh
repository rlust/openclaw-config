#!/bin/bash

# RV-C HVAC Control
# Execute HVAC commands via Home Assistant REST API

HA_URL="http://192.168.100.234:8123"
HA_TOKEN=$(grep -A 2 "Home Assistant (Aspire RV)" /Users/randylust/.openclaw/workspace/.credentials 2>/dev/null | grep "Long-lived" | cut -d' ' -f5)
TIMESTAMP=$(date -u +%Y-%m-%dT%H:%M:%SZ)
LOG_DIR="/Users/randylust/.openclaw/workspace/logs/rvc-hvac"

mkdir -p "$LOG_DIR"

if [ -z "$HA_TOKEN" ]; then
  echo "ERROR: No Home Assistant token found"
  exit 1
fi

COMMAND=${1:-status}
VALUE=${2:-}

echo "[$(date)] RV-C HVAC Command: $COMMAND $VALUE"

case "$COMMAND" in
  
  status)
    # Query current state
    bash /Users/randylust/.openclaw/workspace/scripts/rvc-hvac-status.sh
    ;;
  
  set-temp)
    # Set target temperature (must be a valid number)
    if [ -z "$VALUE" ] || ! [[ "$VALUE" =~ ^[0-9]+$ ]]; then
      echo '{"error":"Invalid temperature value","example":"set-temp 72"}'
      exit 1
    fi
    
    echo "[$(date)] Setting temperature to ${VALUE}°F"
    RESULT=$(curl -s -X POST \
      -H "Authorization: Bearer $HA_TOKEN" \
      -H "Content-Type: application/json" \
      -d "{\"temperature\": $VALUE}" \
      "$HA_URL/api/services/climate/set_temperature" \
      -d '{"entity_id":"climate.aspire_main_hvac","temperature":'$VALUE'}' 2>&1)
    
    echo "{ \"command\": \"set-temp\", \"value\": $VALUE, \"timestamp\": \"$TIMESTAMP\", \"result\": \"sent\" }"
    echo "[$(date)] Set temp command sent. Waiting 3 seconds for response..."
    sleep 3
    bash /Users/randylust/.openclaw/workspace/scripts/rvc-hvac-status.sh
    ;;
  
  set-mode)
    # Set HVAC mode (heat/cool/auto/off)
    if [ -z "$VALUE" ]; then
      echo '{"error":"Mode required","valid_modes":["heat","cool","auto","off"]}'
      exit 1
    fi
    
    # Validate mode
    case "$VALUE" in
      heat|cool|auto|off) ;;
      *) echo '{"error":"Invalid mode"}'; exit 1 ;;
    esac
    
    echo "[$(date)] Setting mode to $VALUE"
    curl -s -X POST \
      -H "Authorization: Bearer $HA_TOKEN" \
      -H "Content-Type: application/json" \
      -d "{\"entity_id\":\"climate.aspire_main_hvac\",\"hvac_mode\":\"$VALUE\"}" \
      "$HA_URL/api/services/climate/set_hvac_mode" > /dev/null 2>&1
    
    echo "{ \"command\": \"set-mode\", \"value\": \"$VALUE\", \"timestamp\": \"$TIMESTAMP\", \"result\": \"sent\" }"
    echo "[$(date)] Mode command sent. Waiting 3 seconds..."
    sleep 3
    bash /Users/randylust/.openclaw/workspace/scripts/rvc-hvac-status.sh
    ;;
  
  set-fan)
    # Set fan mode (auto/on/off)
    if [ -z "$VALUE" ]; then
      echo '{"error":"Fan mode required","valid_modes":["auto","on","off"]}'
      exit 1
    fi
    
    echo "[$(date)] Setting fan to $VALUE"
    curl -s -X POST \
      -H "Authorization: Bearer $HA_TOKEN" \
      -H "Content-Type: application/json" \
      -d "{\"entity_id\":\"climate.aspire_main_hvac\",\"fan_mode\":\"$VALUE\"}" \
      "$HA_URL/api/services/climate/set_fan_mode" > /dev/null 2>&1
    
    echo "{ \"command\": \"set-fan\", \"value\": \"$VALUE\", \"timestamp\": \"$TIMESTAMP\", \"result\": \"sent\" }"
    sleep 3
    bash /Users/randylust/.openclaw/workspace/scripts/rvc-hvac-status.sh
    ;;
  
  test)
    # Diagnostic test sequence
    echo "[$(date)] Starting HVAC diagnostic test..."
    
    echo "Step 1: Status check"
    STATUS1=$(bash /Users/randylust/.openclaw/workspace/scripts/rvc-hvac-status.sh 2>&1)
    echo "$STATUS1"
    
    CURRENT=$(echo "$STATUS1" | grep -o '"current_temp":[0-9.]*' | cut -d':' -f2)
    TARGET=$(echo "$STATUS1" | grep -o '"target_temp":[0-9.]*' | cut -d':' -f2)
    
    echo ""
    echo "Step 2: Set temp +2°F"
    NEW_TEMP=$((${TARGET%.*} + 2))
    bash /Users/randylust/.openclaw/workspace/scripts/rvc-hvac-control.sh set-temp $NEW_TEMP
    
    echo ""
    echo "Step 3: Final status"
    bash /Users/randylust/.openclaw/workspace/scripts/rvc-hvac-status.sh
    
    echo ""
    echo "{ \"test\": \"complete\", \"timestamp\": \"$TIMESTAMP\" }"
    ;;
  
  *)
    echo '{"error":"Unknown command","valid_commands":["status","set-temp","set-mode","set-fan","test"]}'
    exit 1
    ;;
esac

# Log command
echo "$(date): $COMMAND $VALUE" >> "$LOG_DIR/commands.log"
