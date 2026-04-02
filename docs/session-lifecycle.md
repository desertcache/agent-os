# Session Lifecycle

A complete walkthrough of an agent-os session from start to finish.

## Phase 1: Session Start

### What happens automatically (hooks)

When you open Claude Code, the `SessionStart` hook fires:

1. `session-context-preloader.js` runs
2. Reads your working directory from stdin
3. Scans vault folders (configured via `vaultScanDirs`) for project READMEs
4. Parses frontmatter and body to extract status, codebase, and summary
5. Maps recent session notes to projects (via `project:` frontmatter tags, then filename matching)
6. Detects current project from cwd
7. Writes full project index to `~/.claude/cache/session-context.json`

This takes <100ms and happens before you type anything.

### What you trigger

Type `/session-start` (or "catch me up", "where were we"):

**Phase 1 -- If no project detected (e.g., home dir):**
```
Session Context Loaded

## Projects
| Project | Last Worked | Summary |
|---------|------------|---------|
| my-api  | 3/24       | JWT auth partially implemented |
| my-app  | 3/20       | React dashboard, v2 deployed   |

## Dormant
old-project (complete), prototype (deprecated)

What are we working on?
```

**Phase 2 -- After naming a project (or auto-detected from cwd):**
```
Deep Context: my-api

Status: active
Codebase: /path/to/my-api
Last Session: 3/24 -- auth-refactor-wip

Current State:
- JWT authentication partially implemented
- Token refresh endpoint working
- Middleware needs testing

Blockers: Waiting on OAuth provider credentials
Watch out for: Use `rm` not `del` in this environment

What's the focus?
```

## Phase 2: Working

During normal work, two things happen invisibly:

1. **Auto-formatting** (if configured): After every Edit/Write, prettier or ruff formats the file
2. **Activity logging**: After every `git commit` or `git push`, the command is logged to `session-activity.log`

The **3-strike rule** is also active: if Claude makes the same type of error 3+ times in one session, it automatically adds the pattern to `error-patterns.md` without waiting for `/retro`.

## Phase 3: Mid-Session Handoff (optional)

If you need to pause work, type `/session-handoff`:

This creates a streamlined note at `<vault>/Sessions/YYYY-MM-DD-topic.md` with:
- `project:` frontmatter linking to the vault project folder
- What was done (bullet list)
- Current state of the work
- Prioritized next steps
- Decisions and blockers (only if applicable)

## Phase 4: Retrospective

After completing substantial work, type `/retro`:

```
Retro Summary

Work Done:
- Implemented JWT token refresh endpoint
- Fixed middleware auth check ordering
- Updated API documentation

Captured:
- error-patterns.md: Added 1 pattern (token expiry edge case)
- patterns.md: No new patterns
- debugging.md: Added 1 entry (middleware ordering symptom)

Activity Log: 3 commits, 1 push

Save session note to vault? (y/n)
```

The retro skill:
1. Reads the activity log for what happened
2. Analyzes the conversation for errors, patterns, and debugging
3. Checks existing memory files for duplicates
4. Only writes genuinely new learnings
5. Offers to create a session note

## Phase 5: Cleanup

At the end of your session, type `/session-cleanup`:

```
Cleanup complete:
  Vault:  Updated Projects/my-api/README.md + session note
  Memory: Added 1 entry to MEMORY.md
  Errors: No new patterns (captured during retro)
  GitHub: Pushed to origin/main
```

Four phases run in order:
1. **Vault**: Update project README, create session handoff note
2. **Memory**: Update MEMORY.md with new facts
3. **Errors**: Add any uncaptured error patterns
4. **Git**: Commit and push any remaining changes

## Typical Session Flow

```
/session-start          ← "Where was I?"
[work for 2 hours]
/retro                  ← "What did I learn?"
/session-cleanup        ← "Save everything and push"
```

Or for longer sessions:

```
/session-start
[work on project A]
/session-handoff        ← Pause project A
[switch to project B]
/session-start          ← Context for project B
[work on project B]
/retro
/session-cleanup
```
