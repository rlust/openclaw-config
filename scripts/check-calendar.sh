#!/bin/bash
# Quick script to check upcoming Apple Calendar events

osascript <<'APPLESCRIPT'
tell application "Calendar"
    set today to current date
    set today's time to 0
    set twoWeeks to today + (14 * days)
    
    set output to "Upcoming events (next 14 days):\n\n"
    
    repeat with cal in calendars
        set calEvents to (every event of cal whose start date ≥ today and start date < twoWeeks)
        
        repeat with evt in calEvents
            set eventDate to start date of evt
            set eventSummary to summary of evt
            set calName to name of cal
            
            set output to output & eventSummary & "\n  " & (eventDate as string) & "\n  Calendar: " & calName & "\n\n"
        end repeat
    end repeat
    
    return output
end tell
APPLESCRIPT
