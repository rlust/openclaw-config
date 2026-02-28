#!/bin/bash

# Post investment report to Discord
# Called by cron job after pipeline generates message

WORKSPACE="/Users/randylust/.openclaw/workspace"
LOG_DIR="$WORKSPACE/logs/investment"
LATEST_MSG=$(ls -t "$LOG_DIR"/discord_msg_*.txt 2>/dev/null | head -1)

if [ -z "$LATEST_MSG" ]; then
  echo "[$(date)] No message file found"
  exit 1
fi

MESSAGE=$(cat "$LATEST_MSG")
CHANNEL_ID="1476004276311560345"

echo "[$(date)] Posting investment report to Discord..."
echo "Message: $MESSAGE"

# We'll use OpenClaw's sessions_send to trigger a Discord post
# For now, save the command for manual execution
cat > "$LOG_DIR/pending_discord_post.json" <<EOF
{
  "channel": "discord",
  "target": "$CHANNEL_ID",
  "message": $(jq -R -s '.' <<< "$MESSAGE")
}
EOF

echo "[$(date)] Discord post queued"
echo "[$(date)] Command saved to: $LOG_DIR/pending_discord_post.json"
