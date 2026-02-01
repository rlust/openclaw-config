#!/bin/bash
# Proactive update checker for Randy

HA_URL="http://192.168.100.234:8123"
HA_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJhYzRlZWZiMTkwYTY0YWIxYWM5YjNhMWYxMzY0ZGQyZCIsImlhdCI6MTc2OTYzNzg0NywiZXhwIjoyMDg0OTk3ODQ3fQ.L-_SFOLFCbHaO9K7aGKA0mT5E5ZHzRTbNaeqYynOtTI"

echo "=== Home Assistant Update Check ==="

# Get all update entities
UPDATES=$(curl -s -X GET "$HA_URL/api/states" \
  -H "Authorization: Bearer $HA_TOKEN" \
  -H "Content-Type: application/json" | \
  jq '[.[] | select(.entity_id | startswith("update.")) | select(.state == "on") | {name: .attributes.friendly_name, version: .attributes.latest_version}]')

if [ "$UPDATES" != "[]" ]; then
  echo "🔴 Updates Available:"
  echo "$UPDATES" | jq '.[] | "- \(.name): \(.version)"' -r
else
  echo "✅ All systems up to date"
fi

echo ""
echo "=== OpenClaw News Check ==="
# Note: This would search for OpenClaw updates
# Could use web_search tool or check GitHub releases
echo "Checking for OpenClaw updates..."
