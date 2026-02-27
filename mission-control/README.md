# Mission Control (OpenClaw)

Local dashboard to orchestrate agents/subagents, monitor health, and run workflows safely.

## Phase 1 (MVP)
- Health view (gateway/channels)
- Agent/run visibility
- Run controls (spawn / list / cancel)
- Safe-by-default action confirmations

## Quick Start
```bash
cd /Users/randylust/.openclaw/workspace/mission-control/app
npm install
npm run start
# open http://127.0.0.1:18888
```

## Rollback
This app is isolated. To rollback, stop it and remove folder:
```bash
pkill -f "node server.js" || true
rm -rf /Users/randylust/.openclaw/workspace/mission-control
```
