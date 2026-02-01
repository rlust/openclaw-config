# Proactive Monitoring

## Rate Limit Monitoring (Feb 1, 2026 - ACTIVE)
**Context:** Applied token optimization (maxConcurrent 4→2, subagents 8→4, cache TTL 1h→5m, maxTokens caps)
**Goal:** Keep input tokens/min under 50k limit
**Watch for:** HTTP 429 rate_limit_error from Claude API
**Status:** ENABLED - Check logs on each heartbeat

## Checks to run on heartbeat:
1. **Rate limit check** - Look for 429 errors in logs
2. Home Assistant for available updates
3. OpenClaw news/updates on web
4. Important system alerts

## Actions when found:
- **429 error detected** → Alert Randy immediately in Telegram (this is the problem we're solving)
- Update alerts to HAL calendar
- Notify Randy in Telegram if critical
