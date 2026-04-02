---
name: session-cleanup
description: >
  End-of-session cleanup that syncs all persistent state. Use when the user says
  "cleanup", "wrap up", "end session", "save state", "sync everything", or "/cleanup".
  Performs four phases: (1) Vault update + session note, (2) Auto memory sync,
  (3) Error learnings check, (4) Git commit and push.
---

# Session Cleanup

Run all four phases in order. Report a brief summary after each.

## Phase 1: Vault Update

All paths come from agent-os.config.json.

### Detect the project

Read `~/.claude/cache/session-context.json` for `detectedProject` and `vaultProjectPath`.
If null, infer from conversation context (files touched, topics discussed).

### Update project README

Read `<vaultPath>/<vaultProjectPath>/README.md`.
Update with significant changes, decisions, or new context from this session.

If the project's status changed (e.g., went from active to complete, or a major milestone was hit), update the `status:` field in the README frontmatter. The session-start index reads this field, so keeping it current matters.

### Create session note

Create `<vaultPath>/Sessions/YYYY-MM-DD-<topic>.md` with:

```yaml
---
date: YYYY-MM-DD
tags: [session, {project-tag}]
project: {vault-folder-name}
---
```

The `project:` field MUST match the vault folder name exactly (e.g., `Agent-OS`, `Job-Search`). This feeds the session-start project index. Use `"general"` if no specific project applies.

Include: what was done (bullets), current state, next steps. Keep it concise -- under 30 lines of content. Only add Decisions or Blockers sections if they have content.

## Phase 2: Auto Memory

Memory directory comes from agent-os.config.json.

1. Read `MEMORY.md` -- add new projects, tools, or environment facts discovered this session
2. Correct anything that turned out wrong
3. Keep concise (max ~200 lines, loaded into every session prompt)
4. Don't duplicate info the project index already captures (status, summary, last session -- those come from vault READMEs automatically)

## Phase 3: Error Learnings

If errors or new patterns occurred this session, suggest running `/retro` for thorough capture.

For quick cleanup without a full retro: only add to `error-patterns.md` if there was a genuinely new, likely-to-recur error pattern. Follow the existing format:
```markdown
### [Short descriptive title]
**What happened:** [Specific error]
**Rule:** [What to do instead]
```

If no new errors, report "No new patterns" and move on.

## Phase 4: Git Sync

For each project repo worked on:

1. `git status` to check for uncommitted changes
2. If changes exist: stage relevant files, commit with descriptive message
3. Push to remote
4. Avoid committing `.env`, secrets, caches, `node_modules`
5. If clean, report "Already up to date"

## Output

Print one-line summary per phase:

```
Cleanup complete:
  Vault:  Updated <project>/README.md + created session note
  Memory: Added N entries to MEMORY.md (or: No changes)
  Errors: No new patterns (or: Added N patterns / Suggest /retro)
  GitHub: Pushed to repo-name (or: Already up to date)
```

## Rules
- All paths come from agent-os.config.json -- never hardcode user-specific paths
- Always ask before pushing to remote (unless user explicitly pre-authorized)
- Never commit .env files or secrets
