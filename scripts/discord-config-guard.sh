#!/usr/bin/env bash
set -euo pipefail

CFG="/Users/randylust/.openclaw/openclaw.json"
BASE="/Users/randylust/.openclaw/workspace/monitoring/discord-guard-baseline.json"
STATE="/Users/randylust/.openclaw/workspace/monitoring/discord-guard-state.json"
TARGET="1955999067"

python3 - <<'PY'
import json,hashlib,datetime
from pathlib import Path
import subprocess

cfg=Path('/Users/randylust/.openclaw/openclaw.json')
base=Path('/Users/randylust/.openclaw/workspace/monitoring/discord-guard-baseline.json')
state=Path('/Users/randylust/.openclaw/workspace/monitoring/discord-guard-state.json')

def send(msg):
    subprocess.run([
        'openclaw','message','send','--channel','telegram','--target','1955999067','--message',msg
    ], check=False)

if not base.exists():
    send('🚨 Discord guard baseline missing: monitoring/discord-guard-baseline.json')
    raise SystemExit(0)

try:
    cfg_obj=json.loads(cfg.read_text())
except Exception as e:
    send(f'🚨 Discord guard cannot read config: {e}')
    raise SystemExit(0)

base_obj=json.loads(base.read_text())
expected=base_obj.get('expected',{})
dc=((cfg_obj.get('channels') or {}).get('discord') or {})

token=dc.get('token','') if isinstance(dc,dict) else ''
sanitized={k:v for k,v in dc.items() if k!='token'} if isinstance(dc,dict) else {}
canon=json.dumps(sanitized,sort_keys=True,separators=(',',':'))
current={
    'discordConfigSha256':hashlib.sha256(canon.encode()).hexdigest(),
    'tokenPresent':bool(token),
    'tokenSha256':hashlib.sha256(token.encode()).hexdigest() if token else None,
}

issues=[]
if current['tokenPresent'] is False:
    issues.append('discord token is missing')
if expected.get('tokenSha256') and current.get('tokenSha256') != expected.get('tokenSha256'):
    issues.append('discord token changed')
if expected.get('discordConfigSha256') and current.get('discordConfigSha256') != expected.get('discordConfigSha256'):
    issues.append('channels.discord config changed')

sig='|'.join(issues) if issues else 'OK'
prev={}
if state.exists():
    try: prev=json.loads(state.read_text())
    except Exception: prev={}
prev_sig=prev.get('lastSignature')

if issues:
    if sig != prev_sig:
        ts=datetime.datetime.now().astimezone().strftime('%Y-%m-%d %I:%M:%S %p %Z')
        details='; '.join(issues)
        send(f'🚨 OpenClaw Discord config guard alert ({ts}): {details}.')
    state.write_text(json.dumps({'lastSignature':sig,'lastStatus':'alert','updatedAt':datetime.datetime.utcnow().isoformat()+'Z'},indent=2))
else:
    # clear noisy state after recovery
    if prev_sig and prev_sig != 'OK':
        ts=datetime.datetime.now().astimezone().strftime('%Y-%m-%d %I:%M:%S %p %Z')
        send(f'✅ OpenClaw Discord config guard recovered ({ts}).')
    state.write_text(json.dumps({'lastSignature':'OK','lastStatus':'ok','updatedAt':datetime.datetime.utcnow().isoformat()+'Z'},indent=2))
PY
