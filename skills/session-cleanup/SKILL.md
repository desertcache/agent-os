---
name: session-cleanup
description: >
  End-of-session cleanup that syncs all persistent state. Use when the user says
  "cleanup", "wrap up", "end session", "save state", "sync everything", or "/cleanup".
  Performs four actions: (1) Update vault project notes and session handoff,
  (2) Update auto memory (MEMORY.md), (3) Record any new error learnings to error-patterns.md,
  (4) Commit and push changes to GitHub for any active project repos.
---

# Session Cleanup

Run all four phases in order. Report a brief summary after each.

## Phase 1: Vault Update

Vault path comes from agent-os.config.json.

1. Identify which project(s) were worked on this session
2. Read `<vaultPath>/Projects/<name>/README.md` (or the project's vault subfolder)
3. Update with significant changes, decisions, or new context
4. Create `<vaultPath>/Sessions/YYYY-MM-DD-<topic>.md` with:
   - YAML frontmatter: `date`, `tags`, `project`
   - What was done (bullets)
   - Current state
   - Blockers or next steps

## Phase 2: Auto Memory

Memory directory comes from agent-os.config.json.

1. Read `MEMORY.md` — add new projects, tools, or environment facts discovered
2. Correct anything that turned out wrong
3. Keep concise (max ~200 lines, loaded into every session prompt)

## Phase 3: Error Learnings

1. Read `error-patterns.md` in the memory directory
2. For each new error this session, add:
   - **What happened** — the specific error
   - **Rule** — what to do instead
3. If no new errors, report "No new patterns" and skip

## Phase 4: Git Sync

For each project repo worked on:

1. `git status` to check for uncommitted changes
2. If changes exist: stage, commit (descriptive message), push
3. Avoid committing `.env`, secrets, caches
4. If clean, report "Already up to date"

## Output

Print one-line summary per phase:

```
Cleanup complete:
  Vault:  Updated Projects/X/README.md + session note
  Memory: Added N entries to MEMORY.md
  Errors: No new patterns (or: Added N patterns)
  GitHub: Pushed to repo-name (or: Already up to date)
```

## Rules
- All paths come from agent-os.config.json — never hardcode user-specific paths
- Always ask before pushing to remote (unless user explicitly pre-authorized)
- Never commit .env files or secrets
