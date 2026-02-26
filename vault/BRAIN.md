# Agent Brain — Vault Usage Instructions

This document tells Claude Code how to use and maintain this vault as a persistent memory system.

## Core Principle

This vault is Claude's memory across sessions. Before starting work, check relevant folders for context. After work, update relevant notes to maintain continuity.

## Folder Structure & Purpose

| Folder | Purpose | When to Check | When to Update |
|--------|---------|---------------|----------------|
| `Projects/` | Technical project docs | Before working on a project | After significant code changes |
| `Sessions/` | Session handoff notes | At session start | When pausing mid-task |
| `Reference/` | Stable reference material | When needing reference info | Rarely |
| `Planning/` | Goals, routines, priorities | When discussing priorities | When goals change |

## Session Protocol

### At Session Start

1. **Identify the project** from the working directory (or ask the user)
2. **Read the README.md** in the corresponding `Projects/` folder
3. **Check Sessions/** for any recent handoff notes
4. **Check Planning/** for current priorities if relevant

### At Session End

1. **Update project README** with any significant changes:
   - New features added
   - Bugs fixed
   - Architecture changes
   - Current status

2. **Create session note** if pausing mid-task:
   - File: `Sessions/YYYY-MM-DD-topic.md`
   - Include: what was done, what's next, any blockers

## File Naming Conventions

- **Session logs:** `YYYY-MM-DD-topic.md`
- **Project docs:** `README.md`, `STATUS.md`, `CODEBASE.md`
- **Reference:** `Topic-Name.md`

## Frontmatter Template

```yaml
---
date: YYYY-MM-DD
tags: [relevant, tags]
---
```

## Best Practices

1. **Read before you write** — Always check existing notes for context
2. **Keep it current** — Update status when things change
3. **Be concise** — Summaries over verbose logs
4. **Date everything** — Use YYYY-MM-DD format consistently
5. **One project per folder** — Each project gets its own subfolder in `Projects/`
