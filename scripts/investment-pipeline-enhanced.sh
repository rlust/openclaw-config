#!/bin/bash

# Enhanced Investment & Market Intelligence Pipeline
# Scout → Researcher (with Technical/Sentiment/Earnings/Portfolio) → Writer → Discord

set -e

WORKSPACE="/Users/randylust/.openclaw/workspace"
ANALYZER_DIR="$WORKSPACE/agents/investment-analyzer"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_DIR="$WORKSPACE/logs/investment"

mkdir -p "$LOG_DIR"

echo "[$(date)] 📊 Enhanced Investment Pipeline Started"

# Step 1: Scout - Fetch market data
echo "[$(date)] Step 1: Scout Agent - Fetching market data"
SCOUT_OUTPUT=$(node "$WORKSPACE/agents/investment-scout/scout.js" 2>&1)
SCOUT_JSON=$(echo "$SCOUT_OUTPUT" | tail -1)

echo "[$(date)] Step 2: Enhanced Researcher - Technical Analysis + Sentiment + Earnings + Portfolio"
RESEARCH_OUTPUT=$(echo "$SCOUT_JSON" | node "$ANALYZER_DIR/enhanced-researcher.js" 2>&1)
ANALYSIS_JSON=$(echo "$RESEARCH_OUTPUT" | tail -1)

echo "[$(date)] Step 3: Enhanced Writer - Formatting message"
WRITER_OUTPUT=$(echo "$ANALYSIS_JSON" | node "$ANALYZER_DIR/enhanced-writer.js" 2>&1)
DISCORD_MSG=$(echo "$WRITER_OUTPUT")

# Save outputs for reference
echo "$SCOUT_JSON" > "$LOG_DIR/scout_$TIMESTAMP.json"
echo "$ANALYSIS_JSON" > "$LOG_DIR/analysis_$TIMESTAMP.json"
echo "$DISCORD_MSG" > "$LOG_DIR/discord_msg_enhanced_$TIMESTAMP.txt"

echo "[$(date)] ✅ Pipeline complete"
echo ""
echo "========== ENHANCED DISCORD MESSAGE =========="
echo "$DISCORD_MSG"
echo "=============================================="
echo ""
echo "[$(date)] Message saved to: $LOG_DIR/discord_msg_enhanced_$TIMESTAMP.txt"

# Output the message for Discord posting
echo "$DISCORD_MSG"
