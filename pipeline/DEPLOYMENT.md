# Discord Content Pipeline (High-Signal) — Deployment

## Channels
- #tweet-alerts
- #story-research
- #learning-content
- #pipeline-ops (recommended)

## Schedules (America/New_York)
- Scout: 0 */2 * * *
- Researcher: 10 */2 * * *
- Writer: 25 */2 * * *

## Existing local artifacts
- pipeline/tweet_queue.jsonl
- pipeline/research_queue.jsonl
- pipeline/state.json
- pipeline/prompts/scout.md
- pipeline/prompts/researcher.md
- pipeline/prompts/writer.md

## Agent config defaults
- signalThreshold: 75
- maxItemsPerRun: 3
- dedupeDays: 7

## Manual smoke test (run once in order)
1) Trigger Scout once
2) Confirm Discord post in #tweet-alerts and row added to tweet_queue.jsonl
3) Trigger Researcher once
4) Confirm Discord post in #story-research and row added to research_queue.jsonl
5) Trigger Writer once
6) Confirm final markdown doc in #learning-content

## Auto-pause policy
If any stage fails 3 consecutive runs, pause that stage and notify #pipeline-ops.
