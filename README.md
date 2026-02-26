# agent-os

**Turn Claude Code from a stateless tool into a persistent, self-improving agent.**

Hooks, skills, and memory architecture that give Claude Code session continuity, structured workflows, and the ability to learn from its mistakes.

---

## The Problem

Claude Code is powerful but amnesiac. Every session starts from zero. It doesn't remember what it broke yesterday, what decisions you made last week, or where you left off an hour ago.

You can write a `CLAUDE.md` file, but that's a static document — it doesn't grow with your agent's experience, adapt to your workflow, or connect your sessions into a continuous narrative. The result: you re-explain context, re-encounter the same bugs, and lose hours to problems your agent should already know how to avoid.

## What agent-os Gives You

| Without agent-os | With agent-os |
|-----------------|---------------|
| "What project is this?" every session | Instant briefing with project state, blockers, and recent work |
| Same tool errors repeated across sessions | Error patterns captured and consulted automatically |
| Context lost when you pause work | Structured handoff notes for seamless session continuity |
| Manual status tracking across projects | One command for a multi-project status dashboard |
| No feedback loop — agent never improves | `/retro` captures learnings, `/audit-instructions` detects drift |

## Quick Start

```bash
git clone https://github.com/desertcache/agent-os.git
cd agent-os
node setup.js
```

The setup script will:
1. Ask for your vault directory (where session notes and project docs live)
2. Let you register your projects (name + codebase path)
3. Detect your tools (gh CLI, formatters)
4. Install hooks, skills, memory templates, and vault structure into `~/.claude/`

Then open Claude Code and type `/session-start`.

> Prefer manual setup? See [docs/manual-setup.md](docs/manual-setup.md).

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     SESSION LIFECYCLE                            │
│                                                                 │
│  Terminal opens                                                 │
│       │                                                         │
│       ▼                                                         │
│  SessionStart hook ──► session-context-preloader.js             │
│       │                  reads config, detects project,         │
│       │                  scans recent sessions                  │
│       │                  writes cache/session-context.json      │
│       ▼                                                         │
│  /session-start ──► reads cache + vault README + error warnings │
│       │              prints instant project briefing            │
│       │                                                         │
│       ▼                                                         │
│  ┌─────────────────────────────┐                                │
│  │       DURING WORK           │                                │
│  │                             │                                │
│  │  PostToolUse hooks:         │                                │
│  │  • Auto-format (prettier)   │                                │
│  │  • Log git activity         │                                │
│  │                             │                                │
│  │  3-strike rule:             │                                │
│  │  • 3+ same errors?          │                                │
│  │  • Auto-add to patterns     │                                │
│  └─────────────────────────────┘                                │
│       │                                                         │
│       ▼                                                         │
│  /retro ──► reads activity log + conversation                   │
│       │      updates error-patterns.md (if new)                 │
│       │      updates patterns.md (if new)                       │
│       │      updates debugging.md (if debugging occurred)       │
│       ▼                                                         │
│  /session-cleanup ──► updates vault README                      │
│                       creates Sessions/YYYY-MM-DD-topic.md      │
│                       updates MEMORY.md                         │
│                       commits and pushes to git                 │
└─────────────────────────────────────────────────────────────────┘
```

## Components

### Hooks (automatic, invisible)

| Hook | Trigger | What It Does |
|------|---------|-------------|
| [session-context-preloader](hooks/session-context-preloader.js) | Session start | Pre-gathers project context into cache for instant briefings |
| [session-activity-logger](hooks/session-activity-logger.js) | After Bash commands | Logs git commits/pushes for retrospective analysis |

### Skills (user-invoked)

| Skill | Command | What It Does |
|-------|---------|-------------|
| [session-start](skills/session-start/SKILL.md) | `/session-start` | Instant briefing: project state, blockers, recent sessions |
| [session-handoff](skills/session-handoff/SKILL.md) | `/session-handoff` | Create structured handoff note for session continuity |
| [session-cleanup](skills/session-cleanup/SKILL.md) | `/session-cleanup` | End-of-session: update vault, memory, errors, push to git |
| [retro](skills/retro/SKILL.md) | `/retro` | Post-work reflection: capture learnings to memory files |
| [project-status](skills/project-status/SKILL.md) | `/project-status` | Multi-project dashboard with blockers and next actions |
| [audit-instructions](skills/audit-instructions/SKILL.md) | `/audit-instructions` | Detect stale, missing, redundant, or conflicting config |
| [index-codebase](skills/index-codebase/SKILL.md) | `/index-codebase` | Generate CODEBASE.md documenting a project's structure |

### Memory (persistent, self-improving)

| File | Purpose | Updated By |
|------|---------|-----------|
| [MEMORY.md](memory/MEMORY.md) | Environment facts, project reference, preferences | `/session-cleanup` |
| [error-patterns.md](memory/error-patterns.md) | Mistakes and prevention rules | `/retro`, 3-strike auto-add |
| [patterns.md](memory/patterns.md) | Workflow approaches that work | `/retro` |
| [debugging.md](memory/debugging.md) | Symptom → root cause → fix playbook | `/retro` |

### Vault (knowledge base)

| Path | Purpose |
|------|---------|
| [BRAIN.md](vault/BRAIN.md) | Instructions for how the agent uses the vault |
| `Projects/<name>/README.md` | Per-project status, decisions, architecture |
| `Sessions/YYYY-MM-DD-topic.md` | Session handoff notes for continuity |
| `Reference/` | Stable reference material |
| `Planning/` | Goals, priorities, routines |

## The Memory System

agent-os uses a three-file memory architecture with quality gates to prevent bloat:

```
error-patterns.md          patterns.md              debugging.md
┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐
│ What happened:   │   │ Context:         │   │ Symptom:         │
│ [specific error] │   │ [when to use]    │   │ [what you saw]   │
│                  │   │                  │   │                  │
│ Rule:            │   │ Approach:        │   │ Root Cause:      │
│ [what to do      │   │ [what to do]     │   │ [actual cause]   │
│  instead]        │   │                  │   │                  │
│                  │   │ Why it works:    │   │ Fix:             │
│                  │   │ [explanation]    │   │ [resolution]     │
└─────────────────┘   └─────────────────┘   └─────────────────┘
```

**Quality gates prevent memory bloat:**
- **3-strike rule**: Only persist patterns that recur 3+ times in a session
- **Duplicate detection**: Check existing patterns before adding new ones
- **Prescriptive format**: "What to DO" not "what went wrong" — actionable, not narrative
- **Category enforcement**: Each pattern goes in a specific section, not dumped randomly

Read more: [docs/memory-system.md](docs/memory-system.md)

## Customization

agent-os is designed to be extended:

- **Add your own skills** — Drop a `SKILL.md` in `~/.claude/skills/your-skill/`
- **Add auto-dispatch rules** — Edit `CLAUDE.md` to trigger tools from natural language
- **Extend memory categories** — Add new sections to patterns.md or create new memory files
- **Register projects** — Edit `agent-os.config.json` or re-run `node setup.js`

Read more: [docs/customization.md](docs/customization.md)

## Philosophy

> Agentic engineering isn't about building agents. It's about building the infrastructure that makes agents reliable, persistent, and self-improving.

Most AI tooling focuses on the model — better prompts, bigger context windows, more tools. agent-os focuses on the **infrastructure layer**: How does the agent remember? How does it learn from mistakes? How does it maintain continuity across sessions? How does it know when its own config is drifting?

These are DevOps problems applied to AI agents. agent-os is the answer.

## Documentation

- [Architecture](docs/architecture.md) — How the system works
- [Session Lifecycle](docs/session-lifecycle.md) — Step-by-step session flow
- [Memory System](docs/memory-system.md) — Three-file architecture with quality gates
- [Customization](docs/customization.md) — Extending and modifying agent-os
- [Manual Setup](docs/manual-setup.md) — Install without the setup script
- [FAQ](docs/faq.md) — Common questions

## Contributing

Contributions welcome. The most valuable contributions are:
- New skill definitions for common workflows
- Memory pattern examples from your own agent usage
- Cross-platform compatibility fixes
- Documentation improvements

## License

MIT — see [LICENSE](LICENSE).
