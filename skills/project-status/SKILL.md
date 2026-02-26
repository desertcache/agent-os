---
name: project-status
description: >
  Check status of all active projects and identify next actions.
  Use when the user says "project status", "where are we", "what's blocked", or "/project-status".
---

# Project Status

When invoked, check all registered projects and provide a unified status report.

## Projects to Check

Scan all project vault folders registered in agent-os.config.json. For each project:
- Read `<vaultPath>/<projectVaultFolder>/README.md`
- Read `<vaultPath>/<projectVaultFolder>/STATUS.md` (if it exists)

Also check:
- **Recent sessions:** `<vaultPath>/Sessions/` for latest handoffs
- **Planning:** `<vaultPath>/Planning/` for priorities (if exists)

## Report Format

```markdown
# Project Status Report
**Generated:** [date]

## Summary
| Project | Status | Blocked On |
|---------|--------|------------|
| [name] | [status] | [blocker or "None"] |

## [Project Name]
**Status:** [summary]

**Blockers:**
- [ ] [blocker 1]

**Next Actions:**
1. [action 1]
2. [action 2]

## Upcoming Deadlines
[Any dates mentioned in status files]
```

## Response Modes

**Before generating report, check context:**
- If user said "quick", "glance", or it's late evening: Use Quick mode
- If user said "detailed", "deep dive": Use Detailed mode
- Otherwise: Ask "Quick overview or detailed breakdown?"

### Quick Mode
- Summary table only (Project | Status | Blocker)
- 1 sentence per project max
- Skip sections with no updates

### Detailed Mode
- Full report format as specified above
- Include all blockers and next actions
- Cross-reference with recent sessions

## Execution Steps

1. Read the projects list from agent-os.config.json
2. Read README.md / STATUS.md for each project's vault folder
3. Check recent session notes for context
4. Synthesize into report format
5. Highlight what needs attention most urgently

## Rules
- All paths come from agent-os.config.json — never hardcode user-specific paths
- Concise bullet points, scannable format
- Highlight blockers prominently
- Use checkboxes for pending items
