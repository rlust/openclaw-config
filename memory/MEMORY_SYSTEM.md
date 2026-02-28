# Memory System (HAL + Randy)

## Purpose
Keep memory useful, searchable, and low-noise across sessions.

## Tiers
1. **Daily logs** (`memory/YYYY-MM-DD.md`)
   - Raw session notes, work logs, temporary details.
2. **Long-term memory** (`MEMORY.md`)
   - Durable facts, preferences, stable project context, decisions.
3. **Operational state** (`memory/*-state.json`)
   - Machine-readable check timestamps and guard state.

## What goes where

### Put in daily logs
- Progress updates
- Troubleshooting details
- One-off commands/results
- Draft thoughts

### Promote to MEMORY.md only when durable
- Repeated preferences
- Stable environments/endpoints
- Long-lived project status
- Important decisions + rationale

### Do NOT promote
- Temporary errors unless recurring
- Sensitive secrets/tokens
- Verbose run logs

## Weekly hygiene process
- Run `scripts/memory-hygiene.sh`
- Generates `memory/weekly/YYYY-Www.md`
- Review summary and promote only durable items to `MEMORY.md`
- Keep MEMORY.md concise and current

## Tagging convention (recommended)
Use lightweight tags in daily notes for better recall:
- `#decision`
- `#preference`
- `#project:<name>`
- `#alert`
- `#followup`
