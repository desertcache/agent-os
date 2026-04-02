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
tags: [session, project-name]
project: {vault-folder-name}
---

# {Topic}

## What Was Done
- [Completed item 1]
- [Completed item 2]
- [Completed item 3]

## Current State
[Describe the state of the code/work -- what's built, what's running, what's broken]

## Next Steps
1. [Most important next action]
2. [Second priority]
3. [Third priority]

## Decisions (if any)
- **[Decision]:** [rationale]

## Blockers (if any)
- [What's blocking and what it's waiting on]
```

**Critical:** The `project:` frontmatter field MUST match the vault folder name exactly (e.g., `Agent-OS`, `Job-Search`). This feeds the session-start project index. Use `"general"` if the session doesn't map to a specific project.

## Execution Steps

1. **Gather context** from the current conversation:
   - What was the user's original request?
   - What files were modified?
   - What decisions were made?
   - What's still pending?

2. **Identify blockers** -- anything preventing progress

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
- Keep it concise -- under 30 lines of content. Only add Decisions or Blockers if they have content
- All paths come from agent-os.config.json -- never hardcode user-specific paths
