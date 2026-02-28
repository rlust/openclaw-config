#!/bin/bash

# RV-C HVAC System Test
# Diagnostic script to verify connectivity and configuration

WORKSPACE="/Users/randylust/.openclaw/workspace"
HA_URL="http://192.168.100.234:8123"
HA_TOKEN=$(grep -A 2 "Home Assistant (Aspire RV)" "$WORKSPACE/.credentials" 2>/dev/null | grep "Long-lived" | cut -d' ' -f5)

echo "=========================================="
echo "RV-C HVAC System Diagnostic Test"
echo "=========================================="
echo ""

# Test 1: Network connectivity
echo "Test 1: Network Connectivity"
echo "-----"
echo "Trying to reach Aspire RV HA at $HA_URL..."

if timeout 5 curl -s -I "$HA_URL" > /dev/null 2>&1; then
  echo "✅ HA is reachable"
else
  echo "❌ Cannot reach HA. RV may be offline or IP is wrong."
  echo "   Try: ping 192.168.100.234"
  exit 1
fi

echo ""

# Test 2: Authentication
echo "Test 2: Home Assistant Authentication"
echo "-----"

if [ -z "$HA_TOKEN" ]; then
  echo "❌ No HA token found in .credentials"
  echo "   Update ~/.openclaw/workspace/.credentials with Aspire RV token"
  exit 1
fi

echo "Token found (${HA_TOKEN:0:20}...)"
echo "Testing authentication..."

AUTH_TEST=$(curl -s -H "Authorization: Bearer $HA_TOKEN" "$HA_URL/api/states" 2>/dev/null | head -c 100)

if [[ "$AUTH_TEST" == *"[{"* ]]; then
  echo "✅ Authentication successful"
else
  echo "❌ Authentication failed. Token may be invalid or expired."
  exit 1
fi

echo ""

# Test 3: Entity Discovery
echo "Test 3: Entity Discovery"
echo "-----"
echo "Looking for HVAC and temperature entities..."

ENTITIES=$(curl -s -H "Authorization: Bearer $HA_TOKEN" "$HA_URL/api/states" 2>/dev/null)

CLIMATE=$(echo "$ENTITIES" | grep -o '"entity_id":"climate\.[^"]*' | cut -d'"' -f4 | head -3)
TEMPS=$(echo "$ENTITIES" | grep -o '"entity_id":"sensor\.[^"]*temperature[^"]*' | cut -d'"' -f4 | head -5)
SWITCHES=$(echo "$ENTITIES" | grep -o '"entity_id":"switch\.[^"]*' | cut -d'"' -f4 | head -5)

echo "Climate entities found:"
if [ -z "$CLIMATE" ]; then
  echo "  ❌ No climate entities found"
else
  echo "$CLIMATE" | while read entity; do
    echo "  ✅ $entity"
  done
fi

echo ""
echo "Temperature sensors found:"
if [ -z "$TEMPS" ]; then
  echo "  ❌ No temperature sensors found"
else
  echo "$TEMPS" | while read entity; do
    echo "  ✅ $entity"
  done
fi

echo ""

# Test 4: MQTT Status
echo "Test 4: MQTT Status"
echo "-----"

MQTT_STATUS=$(curl -s -H "Authorization: Bearer $HA_TOKEN" "$HA_URL/api/states/select.mqtt_broker_status" 2>/dev/null)

if [[ "$MQTT_STATUS" == *"connected"* ]]; then
  echo "✅ MQTT is connected"
else
  echo "⚠️  MQTT status unknown"
  echo "   Check Home Assistant → Settings → Devices & Services → MQTT"
fi

echo ""

# Test 5: Sample Status Query
echo "Test 5: Sample Status Query"
echo "-----"

if [ ! -z "$CLIMATE" ]; then
  FIRST_CLIMATE=$(echo "$CLIMATE" | head -1)
  echo "Querying $FIRST_CLIMATE..."
  
  STATUS=$(curl -s -H "Authorization: Bearer $HA_TOKEN" "$HA_URL/api/states/$FIRST_CLIMATE" 2>/dev/null)
  
  MODE=$(echo "$STATUS" | grep -o '"hvac_mode":"[^"]*' | cut -d'"' -f4)
  CURRENT=$(echo "$STATUS" | grep -o '"current_temperature":[0-9.]*' | cut -d':' -f2)
  TARGET=$(echo "$STATUS" | grep -o '"temperature":[0-9.]*' | cut -d':' -f2)
  
  if [ ! -z "$MODE" ]; then
    echo "✅ Climate entity responds:"
    echo "   Mode: $MODE"
    echo "   Current: ${CURRENT}°F"
    echo "   Target: ${TARGET}°F"
  else
    echo "⚠️  Climate entity exists but returns no data"
  fi
fi

echo ""
echo "=========================================="
echo "Diagnostic Summary"
echo "=========================================="
echo ""
echo "✅ Next steps:"
echo "  1. Confirm Aspire RV is on and WiFi-connected"
echo "  2. Update .credentials with correct HA token if test failed"
echo "  3. Run: bash scripts/rvc-hvac-status.sh"
echo "  4. Run: bash scripts/rvc-hvac-dashboard.sh"
echo ""
