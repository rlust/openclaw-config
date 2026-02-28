#!/bin/bash

# RV-C HVAC Dashboard
# Gets current status and formats for Discord display

WORKSPACE="/Users/randylust/.openclaw/workspace"
AGENT_DIR="$WORKSPACE/agents/rvc-hvac-monitor"

echo "[$(date)] RV-C HVAC Dashboard - Pulling status..."

# Get current HVAC status
STATUS=$(bash "$WORKSPACE/scripts/rvc-hvac-status.sh" 2>&1)

if [ $? -ne 0 ] || [ -z "$STATUS" ]; then
  echo "ERROR: Could not get HVAC status"
  echo "❌ **HVAC Status Unavailable**"
  echo "Could not connect to Home Assistant at 192.168.100.234:8123"
  exit 1
fi

# Format for Discord
DISCORD_MSG=$(echo "$STATUS" | node "$AGENT_DIR/hvac-formatter.js")

echo ""
echo "========== DISCORD MESSAGE =========="
echo "$DISCORD_MSG"
echo "====================================="
echo ""

# Output the message for external use
echo "$DISCORD_MSG"
