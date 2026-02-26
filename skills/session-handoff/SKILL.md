---
name: session-handoff
description: >
  Create a session handoff note for context continuity.
  Use when the user says "session handoff", "pause work", "save context", or "/session-handoff".
---

# Session Handoff

When invoked, create a clean handoff note summarizing the current session's work for future continuity.

## When to Use

- Pausing work mid-task
- Ending a session with incomplete work
- Before context gets too large
- When switching to a different project

## Output Location

Create file in the vault Sessions folder (path from agent-os.config.json):
```
<vaultPath>/Sessions/YYYY-MM-DD-topic.md
```

Where `topic` is a short kebab-case description (e.g., `auth-refactor-wip`).

## Handoff Note Template

```markdown
---
date: YYYY-MM-DD
tags: [session, handoff, project-name]
---

# Session Handoff: [Topic]

**Project:** [Project name]
**Duration:** [Approximate session length]
**Status:** Paused / Blocked / In Progress

---

## Summary
[1-2 sentences describing what this session was about]

## Accomplished
- [x] Completed item 1
- [x] Completed item 2
- [x] Completed item 3

## In Progress
- [ ] Task that's partially done
  - What's done: [details]
  - What's left: [details]

## Not Started
- [ ] Planned but didn't get to
- [ ] Deferred for later

## Blockers
| Blocker | Waiting On | Impact |
|---------|------------|--------|
| [description] | [person/event] | [what's blocked] |

## Key Decisions Made
1. **Decision:** [what was decided]
   **Rationale:** [why]

## Context for Next Session

### Current State
[Describe the state of the code/work]

### Files Changed
- `path/to/file1` - [what changed]
- `path/to/file2` - [what changed]

### Commands to Resume
```bash
# How to pick up where we left off
cd [project-path]
[relevant commands]
```

## Next Steps (Priority Order)
1. [Most important next action]
2. [Second priority]
3. [Third priority]

## Notes
[Any other context that might be helpful]
```

## Execution Steps

1. **Gather context** from the current conversation:
   - What was the user's original request?
   - What files were modified?
   - What decisions were made?
   - What's still pending?

2. **Identify blockers** — anything preventing progress

3. **List next steps** in priority order

4. **Write the note** to the Sessions folder

5. **Update related project README** if significant changes were made:
   - Update at `<vaultPath>/<projectVaultFolder>/README.md`

6. **Confirm** the handoff note location to the user

## Rules

- Be specific about file paths and line numbers
- Include enough context that a fresh session can pick up quickly
- Don't assume future Claude will have any context from this session
- Include any error messages or unexpected behaviors encountered
- All paths come from agent-os.config.json — never hardcode user-specific paths
