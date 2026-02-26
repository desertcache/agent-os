# Architecture

## System Overview

agent-os adds three layers on top of Claude Code:

1. **Hooks** — Invisible automation that runs before/after tool calls
2. **Skills** — User-invoked workflows triggered by `/commands`
3. **Memory** — Persistent files that accumulate knowledge across sessions

These layers connect through a **vault** (a folder of markdown files) and a **config file** (`agent-os.config.json`).

## Data Flow

```
agent-os.config.json (source of truth)
├── vaultPath ──► vault/BRAIN.md, Projects/, Sessions/
├── memoryDir ──► MEMORY.md, error-patterns.md, patterns.md, debugging.md
├── projects[] ──► session-context-preloader.js (project detection)
└── cacheDir ──► session-context.json, session-activity.log
```

## Config Resolution

Hooks and skills find configuration by checking these locations in order:

1. `~/.claude/agent-os.config.json` (primary — installed by setup.js)
2. `<repo-root>/agent-os.config.json` (fallback — for development)

If no config is found, hooks degrade gracefully (no project detection, no vault reads) but don't crash.

## Hook Architecture

### SessionStart: session-context-preloader.js

```
Claude Code starts
    ↓
Hook receives { cwd } on stdin
    ↓
Reads agent-os.config.json
    ↓
Matches cwd against config.projects[].codebase paths
    ↓
If match → reads recent Sessions/*.md from vault
    ↓
Writes cache/session-context.json:
  { detectedProject, vaultProjectPath, recentSessions }
    ↓
/session-start reads this cache for instant briefing
```

### PostToolUse: session-activity-logger.js

```
Any Bash command runs
    ↓
Hook receives { tool_input: { command } } on stdin
    ↓
Quick check: contains "git commit" or "git push"?
  No → exit immediately (<50ms)
  Yes ↓
Extract commit message via regex
    ↓
Append to cache/session-activity.log:
  "2026-02-25T10:45:32 | git commit | message..."
    ↓
/retro reads this log for activity analysis
```

## Skill Architecture

Skills are markdown files (`SKILL.md`) that tell Claude Code how to execute a workflow. They're not code — they're structured instructions that leverage Claude's built-in tools (Read, Write, Edit, Glob, Grep, Bash, Task).

Skills reference `agent-os.config.json` for paths, making them portable across machines.

## Memory Architecture

See [memory-system.md](memory-system.md) for the full deep dive.

The key insight: memory files are **loaded into every session's context window** (via CLAUDE.md referencing them). This means:
- MEMORY.md must stay under 200 lines
- error-patterns.md is checked before every operation
- New patterns are only added through quality gates (3-strike rule, duplicate detection)
