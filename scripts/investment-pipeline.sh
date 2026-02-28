#!/bin/bash

# Investment & Market Intelligence Pipeline
# Orchestrates Scout → Researcher → Writer → Discord

set -e

WORKSPACE="/Users/randylust/.openclaw/workspace"
AGENT_DIR="$WORKSPACE/agents"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_DIR="$WORKSPACE/logs/investment"

mkdir -p "$LOG_DIR"

echo "[$(date)] Starting investment pipeline..."

# Step 1: Scout - Fetch market data
echo "[$(date)] Step 1: Scout Agent - Fetching market data"
SCOUT_OUTPUT=$(node "$AGENT_DIR/investment-scout/scout.js" 2>&1)
echo "$SCOUT_OUTPUT" > "$LOG_DIR/scout_$TIMESTAMP.log"

# Extract JSON - Scout outputs JSON at the end (after "Data collection complete")
# Find the line with "Data collection complete" and take everything after it
SCOUT_JSON=$(echo "$SCOUT_OUTPUT" | awk '/Data collection complete/{flag=1;next} flag' | jq -s '.[0]' 2>/dev/null)

if [[ -z "$SCOUT_JSON" ]] || [[ "$SCOUT_JSON" == "null" ]]; then
  # Fallback: just get the last valid JSON object
  SCOUT_JSON=$(echo "$SCOUT_OUTPUT" | tail -50 | jq -s '.[] | select(.timestamp)' 2>/dev/null | tail -1)
fi

echo "[$(date)] Step 2: Researcher Agent - Analyzing data"
RESEARCH_OUTPUT=$(echo "$SCOUT_JSON" | node "$AGENT_DIR/investment-researcher/researcher.js" 2>&1)
echo "$RESEARCH_OUTPUT" > "$LOG_DIR/research_$TIMESTAMP.log"

# Extract analysis JSON - look for [FINAL_ANALYSIS] marker
ANALYSIS_JSON=$(echo "$RESEARCH_OUTPUT" | awk '/\[FINAL_ANALYSIS\]/{flag=1;next} flag' | head -1)

if [[ -z "$ANALYSIS_JSON" ]]; then
  # Fallback
  ANALYSIS_JSON=$(echo "$RESEARCH_OUTPUT" | jq -s '.[] | select(.timestamp)' 2>/dev/null | tail -1)
fi

echo "[$(date)] Step 3: Writer Agent - Formatting message"
WRITER_OUTPUT=$(echo "$ANALYSIS_JSON" | node "$AGENT_DIR/investment-writer/writer.js" 2>&1)
echo "$WRITER_OUTPUT" > "$LOG_DIR/writer_$TIMESTAMP.log"

# Extract message - skip the [DISCORD_MESSAGE] marker
DISCORD_MSG=$(echo "$WRITER_OUTPUT" | awk '/\[DISCORD_MESSAGE\]/{flag=1;next} flag')

# Extract just the message content (skip the [DISCORD_MESSAGE] marker)
DISCORD_MSG=$(echo "$DISCORD_MSG" | tail -n +2)

echo "[$(date)] Step 4: Posting to Discord"
# Post to Discord using the configured channel
CHANNEL_ID="1476004276311560345"

# Use openclaw's message tool via environment variable
export DISCORD_CHANNEL_ID="$CHANNEL_ID"
export DISCORD_MESSAGE="$DISCORD_MSG"

# Post via curl to gateway (alternative: use OpenClaw CLI)
# For now, log to file - we'll integrate with OpenClaw message tool next
echo "$DISCORD_MSG" > "$LOG_DIR/discord_msg_$TIMESTAMP.txt"

echo "[$(date)] Pipeline complete"
echo "[$(date)] Message saved to: $LOG_DIR/discord_msg_$TIMESTAMP.txt"
echo "[$(date)] Logs available at: $LOG_DIR/"
