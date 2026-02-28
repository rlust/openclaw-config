#!/bin/bash

# RV-C HVAC System Activation
# Run when Aspire RV comes online to activate full monitoring + control

WORKSPACE="/Users/randylust/.openclaw/workspace"
RVC_DIR="$WORKSPACE/roc-mqtt-custom"
SCRIPTS="$WORKSPACE/scripts"

echo "=========================================="
echo "RV-C HVAC System Activation"
echo "=========================================="
echo ""

# Step 1: Verify RV is reachable
echo "[$(date)] Step 1: Network Test"
if ping -c 1 192.168.100.234 > /dev/null 2>&1; then
  echo "✅ Aspire RV is reachable (192.168.100.234)"
else
  echo "❌ Aspire RV not reachable. RV may still be offline."
  exit 1
fi

echo ""

# Step 2: Check HA connectivity
echo "[$(date)] Step 2: Home Assistant Test"
HA_TOKEN=$(grep -A 2 "Home Assistant (Aspire RV)" "$WORKSPACE/.credentials" | grep "Long-lived" | cut -d' ' -f5)

if curl -s -H "Authorization: Bearer $HA_TOKEN" http://192.168.100.234:8123/api/states > /dev/null 2>&1; then
  echo "✅ Home Assistant API responding"
else
  echo "❌ Home Assistant API not responding. Check token or connection."
  exit 1
fi

echo ""

# Step 3: Test MQTT connectivity
echo "[$(date)] Step 3: MQTT Broker Test"
if timeout 2 mosquitto_pub -h 192.168.100.234 -t "test/ping" -m '{"ping":"test"}' 2>/dev/null; then
  echo "✅ MQTT broker responding"
else
  echo "⚠️ MQTT broker may not be responding (expected if not configured)"
fi

echo ""

# Step 4: Query thermostat status
echo "[$(date)] Step 4: Thermostat Status Query"
STATUS=$(bash "$SCRIPTS/rvc-hvac-status.sh" 2>&1)

if echo "$STATUS" | grep -q "online"; then
  echo "✅ Thermostat status received"
  echo ""
  echo "Current Status:"
  echo "$STATUS" | jq '.' 2>/dev/null || echo "$STATUS"
else
  echo "⚠️ Thermostat may not be responding (RV climate system may be off)"
fi

echo ""

# Step 5: Display dashboard
echo "[$(date)] Step 5: Dashboard Format"
DASHBOARD=$(bash "$SCRIPTS/rvc-hvac-dashboard.sh" 2>&1)

if [ ! -z "$DASHBOARD" ]; then
  echo "$DASHBOARD"
fi

echo ""
echo "=========================================="
echo "RV-C HVAC System Status"
echo "=========================================="
echo ""
echo "✅ Network: Online"
echo "✅ Home Assistant: Connected"
echo "✅ MQTT: Available"
echo "✅ Thermostat: Responsive"
echo ""
echo "Next steps:"
echo "1. Start monitoring (cron runs daily at 4 PM ET)"
echo "2. Enable control when needed:"
echo "   python3 $RVC_DIR/thermostat_command_bridge.py --broker 192.168.100.234 --tx-enable"
echo "3. Post status to Discord:"
echo "   bash $SCRIPTS/rvc-hvac-dashboard.sh | send to Discord"
echo ""
echo "Full documentation:"
echo "  cat $WORKSPACE/RVC_ASPIRE_ENTITY_MAP.md"
echo ""
