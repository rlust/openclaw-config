# OpenClaw Cron Jobs

## Active Monitoring Jobs

### Kanban Server Monitor
- **Schedule:** Every 5 minutes
- **Type:** systemEvent (main session)
- **Action:** Monitor `kanban-server-v3.py` and restart if not running
- **Cost:** $0 (no API calls)

### Lust Rentals App Monitor
- **Schedule:** Every 1 hour
- **Type:** agentTurn (isolated, Ollama/llama3.2)
- **Action:** Check http://100.78.223.120:8000 status; restart if down
- **Cost:** $0 (local Ollama)
- **Job ID:** `250494eb-df1a-43c8-bbde-096b7c56ce1f`

### Water Heater Temperature Monitor
- **Schedule:** Every 4 hours
- **Type:** agentTurn (isolated, Claude Haiku)
- **Action:** Check Aspire water heater temp; alert if below 120°F
- **Cost:** ~$0.0008 per run
- **Job ID:** `665d955c-8ea9-4ce6-abfb-9e2086ae33f3`

## Daily Reporting Jobs

### Daily System Review
- **Schedule:** 8:00 AM EST
- **Type:** agentTurn (isolated, Ollama/llama3.2)
- **Action:** Review workspace files for cleanup opportunities
- **Cost:** $0 (local Ollama)

### Daily Newark Home Report
- **Schedule:** 9:00 AM EST
- **Type:** agentTurn (isolated, Ollama/llama3.2)
- **Action:** Check alarm, garage, door, and temperature status
- **Cost:** $0 (local Ollama)

### Daily Camera Report
- **Schedule:** 9:00 AM EST
- **Type:** agentTurn (isolated, Ollama/llama3.2)
- **Action:** Capture and send camera snapshots
- **Cost:** $0 (local Ollama)

## Hourly Status Updates

### HAL Hourly Updates (4 active)
- **Schedule:** 9:30 AM, 10:30 AM, 11:30 AM, 12:30 PM EST
- **Type:** agentTurn (isolated)
- **Action:** Send Telegram status updates
- **Cost:** ~$0.008 per run (Haiku - no model override)
- **Note:** Removed 6 failing hourly updates (1:30 PM - 6:00 PM) due to Telegram delivery issues

## Market Updates

### Market Close Summary
- **Schedule:** 4:00 PM EST (weekdays only)
- **Type:** systemEvent (main session)
- **Action:** Check S&P 500, Dow, Nasdaq; send daily summary
- **Cost:** $0 (systemEvent)

## Monthly Estimated Costs

| Job | Frequency | Cost/Run | Monthly Runs | Monthly Cost |
|-----|-----------|----------|--------------|--------------|
| Water Heater Monitor | 4 hrs | $0.0008 | 180 | ~$0.14 |
| Hourly Updates (4x) | 1 hr | $0.008 | 2,880 | ~$23 |
| **Total** | | | | **~$23.14** |

**Note:** All other jobs use Ollama or systemEvent (no cost).

## Notes

- All Ollama jobs are free (local execution)
- Haiku is the default for low-cost jobs (~$0.0008 per run with cache optimization)
- Cron job details are stored in the OpenClaw Gateway, not in this repo
- To update a job: `cron update <jobId> --patch <changes>`
- To add a job: `cron add --job <json>`
- To remove a job: `cron remove <jobId>`
