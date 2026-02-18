#!/bin/bash
# Helper to stream a file into an Ollama model for summaries/analysis.
# Usage: scripts/ollama-summarize.sh <file> [model]

set -euo pipefail

if [ $# -lt 1 ]; then
  echo "Usage: $0 <file> [model]" >&2
  exit 1
fi

FILE=$1
MODEL=${2:-deepseek-coder:6.7b}

if [ ! -f "$FILE" ]; then
  echo "Error: File '$FILE' not found." >&2
  exit 1
fi

PROMPT=$(cat <<EOF
Summarize the following file (${FILE}):

$(cat "$FILE")
EOF
)

printf "%s" "$PROMPT" | ollama run "$MODEL"
