# 📊 Investment & Market Intelligence Pipeline

**Status:** Active  
**Stocks Monitored:** NVDA, VRT, ANET, PLTR, MRVL, NET  
**Schedule:** 4:00 PM ET, Monday-Friday  
**Discord Channel:** `1476004276311560345`

---

## Overview

Three-stage pipeline that analyzes AI sector stocks at market close and posts intelligent summaries to Discord:

1. **Scout Agent** — Fetches real-time stock data (prices, volume, 52-week ranges)
2. **Researcher Agent** — Analyzes data, generates buy/sell signals, identifies trends
3. **Writer Agent** — Formats analysis into Discord-friendly messages

---

## Components

### Scout Agent (`agents/investment-scout/scout.js`)
- **Input:** Ticker list (NVDA, VRT, ANET, PLTR, MRVL, NET)
- **Output:** JSON with current price, change %, volume, 52-week high/low
- **Data Source:** Yahoo Finance API
- **Rate Limiting:** 500ms between requests

**Example Output:**
```json
{
  "timestamp": "2026-02-25T21:10:01.043Z",
  "stocks": {
    "NVDA": {
      "ticker": "NVDA",
      "current": 195.625,
      "previous": 192.85,
      "change": 2.77,
      "changePercent": 1.44,
      "high52": 212.19,
      "low52": 86.62,
      "volume": 196523805
    }
    // ... other stocks
  }
}
```

### Researcher Agent (`agents/investment-researcher/researcher.js`)
- **Input:** Scout JSON output
- **Output:** Analysis with signals (BUY_SIGNAL, SELL_SIGNAL, BULLISH, BEARISH, NEUTRAL)
- **Logic:**
  - `> ±3%` move = **BUY/SELL_SIGNAL** (high confidence)
  - `+1% to +3%` = **BULLISH**
  - `-1% to -3%` = **BEARISH**
  - Calculates position in 52-week range

**Example Output:**
```json
{
  "stocks": {
    "NVDA": {
      "ticker": "NVDA",
      "signal": "BULLISH",
      "confidence": 72,
      "changePercent": 1.44,
      "positionIn52w": 73  // % between 52-week low and high
    }
  },
  "summary": {
    "bullish": [{"ticker": "NVDA", "reason": "..."}],
    "bearish": [],
    "alerts": ["🟢 PLTR: BUY SIGNAL +4.15%"]
  }
}
```

### Writer Agent (`agents/investment-writer/writer.js`)
- **Input:** Researcher JSON analysis
- **Output:** Formatted Discord message
- **Format:**
  - Alert section (BUY/SELL signals only)
  - Stock table (ticker, price, change %, 52-week position)
  - Summary (bullish/bearish/neutral counts)
  - Top picks (bullish/bearish recommendations)

**Example Output:**
```
📊 **Market Close Report** — 04:00 PM ET

**⚠️ ALERTS**
🟢 PLTR: BUY SIGNAL +4.15%
🟢 NET: BUY SIGNAL +4.84%

**AI Sector Stocks**
`Ticker   | Price   | Change  | 52w Pos`
`NVDA     | $195.63 | 📈 +1.44% | 73%`
...

**Summary**
🟢 Bullish: 3 | 🔴 Bearish: 0 | ⚫ Neutral: 3

**Bullish Picks:**
• PLTR: BUY SIGNAL +4.15%
• NET: Mild uptrend +4.84%
• ANET: Mild uptrend +3.19%

---
*Not financial advice. For informational purposes only.*
```

---

## Workflow

```
4:00 PM ET (cron trigger)
    ↓
Scout Agent (fetch data)
    ↓
[JSON: prices, volume, changes]
    ↓
Researcher Agent (analyze)
    ↓
[JSON: signals, confidence, summary]
    ↓
Writer Agent (format)
    ↓
[Discord message text]
    ↓
Discord Bot (post to channel)
```

---

## Usage

### Manual Run
```bash
cd /Users/randylust/.openclaw/workspace
bash scripts/investment-pipeline.sh
```

### Automatic (Cron)
Pipeline runs automatically at 4:00 PM ET, Monday-Friday.

Check cron status:
```bash
openclaw cron list
openclaw cron logs investment-daily
```

### View Recent Reports
```bash
ls -lrt /Users/randylust/.openclaw/workspace/logs/investment/
cat logs/investment/discord_msg_<timestamp>.txt
```

---

## Configuration

### Change Stock List
Edit `agents/investment-scout/scout.js`:
```javascript
const STOCKS = ['NVDA', 'VRT', 'ANET', 'PLTR', 'MRVL', 'NET'];
```

### Change Alert Thresholds
Edit `agents/investment-researcher/researcher.js`:
```javascript
if (Math.abs(changePercent) > 3) {  // Change this value
  signal = changePercent > 0 ? 'BUY_SIGNAL' : 'SELL_SIGNAL';
}
```

### Change Schedule
Edit `cron/investment-daily.yaml`:
```yaml
schedule: "0 16 * * 1-5"  # 4 PM ET, Mon-Fri
```

---

## Troubleshooting

### Scout Agent Failing
- **Check:** Yahoo Finance API availability
- **Log:** `logs/investment/scout_*.log`
- **Fix:** API may have changed format; update URL/parsing in scout.js

### No Discord Message
- **Check:** Discord bot is online (`openclaw status`)
- **Check:** Bot has permissions in channel
- **Check:** Channel ID is correct (1476004276311560345)

### Missing Data
- **Time:** Runs at market close (4 PM ET). Markets may be closed on weekends/holidays.
- **Log:** Check `logs/investment/` for error messages

---

## Next Steps

- [ ] Integrate with OpenClaw message tool to auto-post to Discord
- [ ] Add earnings calendar alerts
- [ ] Add technical indicators (RSI, MACD, moving averages)
- [ ] Add sentiment analysis (news, Twitter mentions)
- [ ] Multi-day trend detection
- [ ] Portfolio impact analysis (how moves affect your positions)
- [ ] Telegram escalation for high-priority alerts (>5% moves)

---

## Files

```
/Users/randylust/.openclaw/workspace/
├── agents/
│   ├── investment-scout/
│   │   └── scout.js            # Fetch market data
│   ├── investment-researcher/
│   │   └── researcher.js        # Analyze data
│   └── investment-writer/
│       └── writer.js            # Format for Discord
├── scripts/
│   ├── investment-pipeline.sh   # Orchestrator
│   └── post-investment-report.sh # Discord poster
├── cron/
│   └── investment-daily.yaml    # Cron schedule
├── logs/
│   └── investment/              # Reports, logs
└── INVESTMENT_PIPELINE.md       # This file
```

---

**Questions?** Check logs, review agent output, or trigger manual run to debug.
