---
name: audit-instructions
description: >
  Self-review: finds stale, missing, redundant, or conflicting rules across all config files.
  Use when the user says "audit instructions", "check rules", or "/audit-instructions".
  Reads CLAUDE.md, MEMORY.md, error-patterns.md, BRAIN.md, all skill files, and settings.json
  to produce a categorized report with suggested fixes.
---

# Audit Instructions

Perform a thorough self-review of all configuration and instruction files. Produce an actionable report. Do NOT apply fixes without user confirmation.

## Files to Read

Read ALL of these files (use parallel reads where possible). Paths are resolved from agent-os.config.json:

1. `~/.claude/CLAUDE.md` — main instruction file
2. `<memoryDir>/MEMORY.md` — auto memory
3. `<memoryDir>/error-patterns.md` — error learnings
4. `<memoryDir>/patterns.md` — workflow patterns
5. `<memoryDir>/debugging.md` — debugging strategies
6. `<vaultPath>/BRAIN.md` — vault brain file
7. All skill files: `~/.claude/skills/*/SKILL.md`
8. `~/.claude/settings.json` — hooks and settings

## Checks to Perform

### STALE — Information that may be outdated
- Do codebase paths referenced in CLAUDE.md and skill files still exist on disk? (Use Glob to verify key directories)
- Is the project list current? Check if any projects in vault `Projects/` are missing from the mapping table
- Is MEMORY.md approaching the 200-line limit? (Count lines, warn if >180)
- Are there session handoff notes >30 days old that could be archived?

### MISSING — Things that should exist but don't
- Do all skills reference files that actually exist? (e.g., cache files, vault paths)
- Are there common error patterns from recent sessions not captured in error-patterns.md?
- Are there projects in the codebase mapping that lack a vault folder?
- Are there hook scripts referenced in settings.json that don't exist on disk?

### REDUNDANT — Same info in too many places
- Project-codebase mapping: canonical source is CLAUDE.md. The session-context-preloader hook has its own copy (in agent-os.config.json). Flag if they're out of sync.
- Are there duplicate rules or overlapping instructions between CLAUDE.md and MEMORY.md?
- Are there error patterns that are also mentioned in MEMORY.md (redundant)?

### CONFLICT — Contradictory information
- Do any files give conflicting paths or project names?
- Are there behavioral instructions that contradict each other?

## Output Format

```
Instruction Audit Report
========================

STALE (N issues)
- [file:line] Description of what's stale
  Suggested fix: ...

MISSING (N issues)
- [file] Description of what's missing
  Suggested fix: ...

REDUNDANT (N issues)
- [file1 + file2] Description of redundancy
  Suggested fix: ...

CONFLICT (N issues)
- [file1 vs file2] Description of conflict
  Suggested fix: ...

Summary: N total issues (N critical, N minor)
```

After presenting the report, ask: "Want me to apply the suggested fixes?"

## Rules
- Read files first, report second — don't guess about file contents
- Be specific: include file paths and line numbers where possible
- Categorize severity: CRITICAL (will cause errors), MINOR (cosmetic/organizational)
- Don't auto-fix anything — always ask first
- If everything looks clean, say so: "All instructions consistent. No issues found."
- Keep the report concise — group similar issues rather than listing each individually
