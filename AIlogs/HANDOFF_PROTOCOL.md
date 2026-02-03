# AI Handoff Protocol - Forma Project

## Purpose
Structured communication between Claude and Gemini to prevent context loss and duplicated work.

---

## File Naming Convention
```
YYYY-MM-DD_HH-MM_[FROM]_to_[TO]_[topic].md
```
Example: `2026-01-22_13-30_claude_to_gemini_api-setup.md`

---

## Handoff Template

```markdown
# Handoff: [Topic]
**From:** [Claude/Gemini]
**To:** [Claude/Gemini]
**Date:** YYYY-MM-DD HH:MM
**Session Duration:** X hours

## What Was Done
- [ ] Task 1
- [ ] Task 2

## What's Working
- Item 1
- Item 2

## What's Broken / Blocked
- Issue 1: [description] → [suggested fix]

## Next Steps (Priority Order)
1. Step 1
2. Step 2

## Files Changed
| File | Change Type | Notes |
|------|-------------|-------|
| path/to/file | Created/Modified/Deleted | Brief description |

## Environment State
- Database: [connected/disconnected/migrated]
- API: [running/stopped/error]
- Web: [running/stopped/error]
- Docker: [up/down]

## Commands to Resume
```bash
# Run these to get back to working state
command 1
command 2
```

## Context the Next AI Needs
[Any important decisions, user preferences, or gotchas]
```

---

## Rules
1. **Always create a handoff log before stopping**
2. **Read the latest handoff log before starting**
3. **Don't repeat completed work**
4. **Update status table at end of every message**
