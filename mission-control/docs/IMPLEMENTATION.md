# MVP Implementation Steps

1. Scaffold app server + static UI ✅
2. Add `/api/health` and `/api/routing` ✅
3. Add `/api/sessions` ✅
4. Add `/api/workflows` templates panel ✅
5. Add dashboard controls + basic error banner ✅
6. Add Phase 2-lite run controls via `openclaw agent` bridge (`/api/spawn`, `/api/kill`) ✅
7. Keep note: direct Gateway RPC integration still pending for deterministic subagent IDs ✅
8. Add Phase 3 observability panel (`/api/ops-status`, `/api/recent-errors`) ✅

## Exact Commands
```bash
cd /Users/randylust/.openclaw/workspace/mission-control/app
npm install
npm run start
```

## Test Plan
1. Open UI at `http://127.0.0.1:18888`
2. Click **Refresh**: health + routing + sessions populate
3. Spawn test run using small prompt
4. Kill run with `CONFIRM` text
5. Verify no changes to Discord routing

## Rollback Plan
- Stop process: `pkill -f "node server.js"`
- Delete folder: `rm -rf /Users/randylust/.openclaw/workspace/mission-control`
- No existing OpenClaw config paths modified
