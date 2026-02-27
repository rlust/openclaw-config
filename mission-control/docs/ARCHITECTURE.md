# Architecture Plan

## Components
1. **Web UI** (static HTML/JS)
   - Dashboard cards: gateway, channels, agents, subagents
   - Actions: spawn subagent, refresh status, kill subagent
2. **Local API** (Node HTTP server)
   - Wraps `openclaw` CLI commands
   - Returns normalized JSON to UI
3. **Safety Layer**
   - Destructive actions require explicit confirmation text (`CONFIRM`)

## Data Sources
- `openclaw channels status --probe`
- `openclaw sessions --all-agents --json`
- `openclaw config get bindings --json`
- `openclaw subagents list` (via tooling equivalent; placeholder in MVP)

## Reliability
- Command timeouts + stderr capture
- Non-200 responses include command + error summary
- Next phase: retries/circuit breaker + fallback telemetry
