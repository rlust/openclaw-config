using terms from application "Mail"
    on perform mail action with messages theMessages for rule theRule
        set logPath to "/Users/randylust/.openclaw/workspace/mail-intake/inbox.log"
        repeat with eachMessage in theMessages
            set theSender to sender of eachMessage
            set theSubject to subject of eachMessage
            set theBody to content of eachMessage
            set timeStamp to (current date) as string
            set logEntry to "====\n" & timeStamp & "\nFrom: " & theSender & "\nSubject: " & theSubject & "\n\n" & theBody & "\n====\n"
            do shell script "printf %s " & quoted form of logEntry & " >> " & quoted form of logPath
        end repeat
    end perform mail action with messages
end using terms from
