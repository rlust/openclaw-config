#!/bin/bash
# Sync Kanban tasks to HAL Calendar

TITLE="$1"
DUE_DATE="$2"  # Format: YYYY-MM-DD

if [ -z "$TITLE" ] || [ -z "$DUE_DATE" ]; then
    echo "Usage: kanban-sync-calendar.sh 'Task Title' 'YYYY-MM-DD'"
    exit 1
fi

# Convert date to proper format
DUE_DATETIME="${DUE_DATE}T09:00:00"
END_TIME="${DUE_DATE}T10:00:00"

osascript <<EOF
tell application "Calendar"
    set halCal to calendar "HAL"
    set dueDate to date "$DUE_DATETIME"
    set endDate to date "$END_TIME"
    
    tell halCal
        make new event with properties {summary:"$TITLE", start date:dueDate, end date:endDate, description:"Kanban task - auto-synced"}
    end tell
    
    return "✅ Added to HAL Calendar: $TITLE"
end tell
EOF
