# Kanban Calendar v3 - Phase 2 Update

**Status:** ✅ COMPLETED
**File:** `kanban-calendar-v3-fixed.html`

## 🔄 Recurring Tasks (New!)

The "brain" for recurring tasks is now active.

**How it works:**
1. **Create a Task:** Select "Recurring: Daily/Weekly/Monthly" in the new task modal.
2. **Complete It:** Drag it to "Done" (or bulk complete).
3. **Auto-Regeneration:**
   - The old task stays in "Done" (archived later).
   - A **NEW task** is instantly created in "Backlog".
   - **Due Date:** Automatically set to the next interval (Tomorrow, Next Week, Next Month).
   - **Attributes:** Keeps the same priority, assignee, and recurrence settings.

**Logic Handling:**
- **Daily:** Due date + 1 day.
- **Weekly:** Due date + 7 days.
- **Monthly:** Due date + 1 month.
- **Overdue Catch-up:** If you complete a task that was due 3 days ago, the *new* task will catch up to be due **tomorrow** (instead of 2 days ago), so you don't get stuck in the past.

## ✅ Bulk Actions

- **Multi-Select:** Click the checkboxes on cards.
- **Mark Done:** Click "Mark as Done" in the top bar.
- **Smart Handling:** If any selected tasks are recurring, they will **automatically regenerate** next versions while moving the current ones to Done.

## 🐛 Fixes
- Fixed "Done" column logic to support recurring triggers.
- Ensured Calendar Sync fires for the *newly created* recurring instances.

---

**Next Steps:**
- Open `kanban-calendar-v3-fixed.html` in your browser.
- Create a test task "Daily Standup", set to Daily.
- Drag it to Done -> Watch the new one appear in Backlog!
