---
name: session-start
description: >
  Smart session boot: shows full project index, then loads deep context on demand.
  Use when the user says "session start", "catch me up", "where were we", or "/session-start".
  Reads pre-gathered context from cache (populated by SessionStart hook) and presents a two-phase briefing.
---

# Session Start

Two-phase boot: show what exists (Phase 1), then load deep context for the chosen focus (Phase 2).

## Step 1: Read Cache

Read `~/.claude/cache/session-context.json` (written by session-context-preloader hook).

Extract:
- `detectedProject` -- project matched from cwd (may be null)
- `vaultProjectPath` -- vault path for detected project
- `recentSessions` -- previews of last 3 session notes
- `projectIndex` -- all scanned vault directories with name, vault, status, codebase, summary, lastSession

If cache is missing, unreadable, or lacks `projectIndex`, fall back:
- Glob `<vaultPath>/Projects/*/README.md` (vault path from agent-os.config.json)
- Present folder names as a plain list (no metadata)

## Step 2: Present (Phase 1)

### If a project was detected from cwd:

**Skip straight to Phase 2 (Step 3)** for the detected project. After showing the deep briefing, append a condensed "Other Projects" list:
- Active projects as a simple bulleted list (name + last session date), not a full table
- Omit dormant items

### If no project detected (home dir or unmatched):

Display the full index. Sort all entries by `lastSession` date descending (most recently worked on first). Items with no session date go to the bottom.

**Format:**

For each key in `projectIndex` (e.g., "projects", "ventures"), show a table:

```
Session Context Loaded

## Projects
| Project | Last Worked | Summary |
|---------|------------|---------|
| {name} | {M/D or --} | {summary} |
...

## Ventures (if present in index)
| Venture | Last Worked | Summary |
|---------|------------|---------|
| {name} | {M/D or --} | {summary} |
...

## Dormant
{comma-separated list of items with status complete/deprecated/planned}

Recent Sessions:
- {M/D} -- {title extracted from session filename} ({project tag})
- ...

What are we working on?
```

**Rules for the index:**
- Convert lastSession dates to short format: "3/13" not "2026-03-13"
- Summaries should be under 10 words (truncate if needed from the cache data)
- Active = status is "active" or "unknown" with a recent session
- Dormant = status is "complete", "deprecated", "planned", or "unknown" with no session in last 60 days
- Put dormant items on a single comma-separated line with their status in parens, not a table row
- Target: 25-40 lines total for the index output

## Step 3: Deep Context Load (Phase 2)

When the user names a project to work on (or when auto-detected from cwd):

1. **Find the vault path** from the matching index entry's `vault` field
2. **Read the README**: `<vaultPath>/{vault}/README.md`
   - Extract: current status, what's built, blockers, next steps
   - Summarize in 4-6 bullets max -- do NOT dump the raw README
3. **Find related sessions**: Glob `<vaultPath>/Sessions/*` for files containing the project name. Also check the `lastSessionFile` from the index. Read first 20 lines of the 2 most recent matches.
4. **Check for extras** in the vault folder:
   - `CODEBASE.md` -- mention "CODEBASE.md available" if it exists (don't read unless asked)
   - `STATUS.md` -- read if exists, include key points
5. **Check error-patterns**: Read `<memoryDir>/error-patterns.md` and surface any entries that mention the project name or its key technologies
6. **Present deep briefing**:

```
Deep Context: {Project Name}

Status: {status}
Codebase: {codebase path}
Last Session: {date} -- {topic from session filename}

Current State:
- {bullet from README}
- {bullet from README}
- {bullet from README}

{If blockers exist:}
Blockers: {list}

{If CODEBASE.md exists:}
CODEBASE.md available for architecture reference.

{If relevant error patterns:}
Watch out for: {brief warning}

What's the focus?
```

## Step 4: Cross-reference Check

After loading deep context, quickly compare:
- Does MEMORY.md (already in system prompt) have info about this project that contradicts the README?
- If drift detected, flag it: "Note: MEMORY.md says X but README says Y -- which is current?"

## Rules
- Keep all output concise -- this is a briefing, not a report
- Don't read files that don't exist -- check gracefully with Glob first
- Phase 1 (index) = exactly 1 file read (the cache JSON)
- Phase 2 (deep load) = 2-4 file reads max (README + sessions + error-patterns)
- Never dump raw file contents -- always summarize
- If user asks to work on something not in the index, search the vault with Grep before saying it doesn't exist
- All paths come from agent-os.config.json -- never hardcode user-specific paths
