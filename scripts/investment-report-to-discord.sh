#!/bin/bash

# Investment Market Close Report → Discord
# Direct posting without agent complexity

WORKSPACE="/Users/randylust/.openclaw/workspace"
CHANNEL_ID="1476004276311560345"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo "[$(date)] Starting investment report pipeline..."

# Run full pipeline and capture message
DISCORD_MSG=$(cd "$WORKSPACE" && \
  node agents/investment-scout/scout.js 2>/dev/null | \
  node agents/investment-researcher/researcher.js 2>/dev/null | \
  node agents/investment-writer/writer.js 2>/dev/null)

if [ -z "$DISCORD_MSG" ]; then
  echo "[$(date)] ERROR: Pipeline failed to generate message"
  exit 1
fi

echo "[$(date)] Message generated. Posting to Discord..."
echo ""
echo "========== DISCORD MESSAGE =========="
echo "$DISCORD_MSG"
echo "====================================="
echo ""

# Create a temporary file with the message
MSG_FILE="/tmp/investment_msg_$TIMESTAMP.txt"
echo "$DISCORD_MSG" > "$MSG_FILE"

# Save for reference
cp "$MSG_FILE" "$WORKSPACE/logs/investment/discord_msg_$TIMESTAMP.txt"

echo "[$(date)] Message saved to: $MSG_FILE"
echo "[$(date)] To post to Discord, run:"
echo "  openclaw config get channels.discord"
echo "  # Then use Discord webhook or CLI to post"

# Return the message for external posting
echo "$DISCORD_MSG"

echo "[$(date)] ✅ Pipeline complete"
