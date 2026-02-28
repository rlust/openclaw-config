#!/usr/bin/env bash
set -euo pipefail

BASE="/Users/randylust/.openclaw/workspace"
MEM_DIR="$BASE/memory"
WEEKLY_DIR="$MEM_DIR/weekly"
mkdir -p "$WEEKLY_DIR"

python3 - <<'PY'
from pathlib import Path
from datetime import datetime, timedelta
import re

base = Path('/Users/randylust/.openclaw/workspace')
mem = base / 'memory'
weekly = mem / 'weekly'
weekly.mkdir(parents=True, exist_ok=True)

now = datetime.now()
week_id = now.strftime('%Y-W%U')
out = weekly / f'{week_id}.md'

pattern = re.compile(r'^\d{4}-\d{2}-\d{2}\.md$')
files = []
for p in sorted(mem.glob('*.md')):
    if pattern.match(p.name):
        dt = datetime.strptime(p.stem, '%Y-%m-%d')
        if now - dt <= timedelta(days=8):
            files.append((dt, p))

highlights = []
counts = {'decision':0,'preference':0,'alert':0,'followup':0}
for _, f in files:
    txt = f.read_text(errors='ignore').splitlines()
    for line in txt:
        l = line.strip()
        if not l:
            continue
        if '#decision' in l: counts['decision'] += 1
        if '#preference' in l: counts['preference'] += 1
        if '#alert' in l: counts['alert'] += 1
        if '#followup' in l: counts['followup'] += 1
        if l.startswith('- ') or l.startswith('## ') or l.startswith('### '):
            if len(l) <= 180:
                highlights.append((f.name, l))

highlights = highlights[:60]

lines = []
lines.append(f'# Weekly Memory Hygiene - {week_id}')
lines.append('')
lines.append(f'Generated: {now.isoformat()}')
lines.append('')
lines.append('## Source files scanned')
for _, f in files:
    lines.append(f'- {f.name}')
lines.append('')
lines.append('## Tag counts (last ~7 days)')
for k,v in counts.items():
    lines.append(f'- {k}: {v}')
lines.append('')
lines.append('## Candidate highlights (review before promotion)')
if highlights:
    for fname, h in highlights:
        lines.append(f'- [{fname}] {h}')
else:
    lines.append('- (none)')
lines.append('')
lines.append('## Promotion checklist')
lines.append('- Move only durable facts/preferences/decisions to MEMORY.md')
lines.append('- Remove stale entries from MEMORY.md')
lines.append('- Keep secrets out of all memory files')

out.write_text('\n'.join(lines) + '\n')
print(out)
PY
