---
title: "I Built an Operating System for Claude Code"
published: false
description: "Hooks, skills, and a self-correcting memory system that turn Claude Code from a stateless tool into a persistent agent."
tags: ai, devtools, opensource, claudecode
---

# I Built an Operating System for Claude Code

Claude Code is one of the most capable AI coding tools available. It can refactor entire codebases, write tests, debug production issues, and ship features faster than I ever could alone.

It also has no idea who I am, what I was working on yesterday, or which mistakes it made three sessions ago.

Every time I open a new session, the same ritual plays out: re-explain the project, re-establish context, re-discover the same footguns. For a tool that helps me manage 14 codebases, this friction compounded fast. So I built the infrastructure layer to fix it.

[agent-os](https://github.com/desertcache/agent-os) is a persistence and workflow system for Claude Code. It gives your agent session continuity, structured workflows, and the ability to learn from its own mistakes. Three components: hooks that run automatically, skills you invoke with slash commands, and a memory system that grows smarter over time.

## The Problem

You can write a `CLAUDE.md` file to give Claude Code instructions. But `CLAUDE.md` is static. It doesn't grow with your agent's experience, adapt to new error patterns, or connect your sessions into a continuous thread.

Here's what that looks like in practice:

- **Monday**: Claude uses `del` instead of `rm` on your Linux machine. You correct it. It apologizes.
- **Tuesday**: Claude uses `del` again. Same correction. Same apology.
- **Wednesday**: You write "use `rm` not `del`" in `CLAUDE.md`. It finally sticks, but only because you manually intervened.

Now multiply that by every tool quirk, every platform gotcha, every workflow decision across every project. The information exists in your head, but your agent starts from zero every single time.

## The Architecture

agent-os has three layers, and the design is intentional. If you've worked in DevOps, the parallels are direct:

| DevOps Concept | agent-os Equivalent |
|---|---|
| Git hooks | `SessionStart` / `PostToolUse` hooks |
| Config management | Memory files (error-patterns, patterns, debugging) |
| CI quality gates | 3-strike rule, duplicate detection, 200-line budget |
| Post-incident review | `/retro` skill |
| Observability | Session activity logger |

**Hooks** run invisibly. When you open Claude Code, a `SessionStart` hook pre-gathers your project context in under 100ms: which project you're in, what you worked on last, what errors to watch for. After every bash command, a `PostToolUse` hook logs git commits and pushes for later analysis.

**Skills** are user-invoked workflows. `/session-start` gives you an instant briefing. `/retro` captures what you learned. `/session-cleanup` updates your vault, syncs memory, and pushes to git. Seven skills total, each doing one thing well.

**Memory** is where it gets interesting.

## The Memory System

Most AI memory implementations just accumulate text. Throw everything into a vector store, retrieve by similarity, hope for the best. agent-os takes a different approach: three specialized files, each with a specific format and quality gates to prevent bloat.

**error-patterns.md** stores mistakes as prescriptive rules, not narratives:

```markdown
### Write tool: "File has not been read yet"
**What happened:** Tried to Write to existing files without
reading them first.
**Rule:** ALWAYS Read existing files before Writing. When
rewriting multiple files, batch all Reads first, then Writes.
```

The format matters. "What happened" is context. "Rule" is what to do next time. The agent reads this file at the start of every session and consults it before taking actions. It doesn't just know what went wrong; it knows what to do instead.

**patterns.md** captures workflow approaches that work. **debugging.md** maps symptoms to root causes and fixes.

The quality gates are what keep this from turning into noise:

- **3-strike rule**: A pattern only gets persisted after it recurs 3+ times in a single session. One-off errors are not worth remembering.
- **Duplicate detection**: Before adding a new pattern, check if it already exists.
- **200-line budget**: `MEMORY.md` loads into every session context. Hard cap forces prioritization. If something isn't worth the budget, it gets cut.

## What a Session Looks Like

Here's a real workflow, from open to close:

**Start**: I open Claude Code in my project directory. The `SessionStart` hook fires, writes context to a cache file in under 100ms. I type `/session-start`.

```
Project: market-dashboard
Last Session: 2026-03-20 - binance-websocket-fix

Current State:
- Binance USD streaming working
- Alpaca integration code written, not activated
- Ref-based price storage avoiding re-render storms

Blockers: Alpaca API key signup pending
```

No re-explaining. No "let me explore the codebase." We're working in seconds.

**Work**: I code for two hours. The activity logger tracks my git commits silently. If I hit the same tool error three times, it auto-adds to `error-patterns.md` without waiting for me.

**End**: I type `/retro`. It reads the activity log and the conversation, checks for new patterns worth capturing, and only writes genuinely novel learnings. Then `/session-cleanup` updates the vault, creates a handoff note, and pushes to git. Tomorrow's session starts exactly where today's left off.

## Why I Built This

I use Claude Code 8+ hours a day across 14 projects. The context loss was costing me real time. Not minutes, but the compounding cost of re-establishing working memory across hundreds of sessions.

agent-os started as my own `CLAUDE.md` getting too big. Then it became a set of scripts. Then hooks. Then a system. The philosophy crystallized along the way:

> Agentic engineering isn't about building agents. It's about building the infrastructure that makes agents reliable, persistent, and self-improving.

Most AI tooling obsesses over the model. Better prompts, bigger context windows, more tools. agent-os focuses on what sits beneath: How does the agent remember? How does it learn from mistakes? How does it know when its own config is drifting?

## Try It

```bash
git clone https://github.com/desertcache/agent-os.git
cd agent-os
node setup.js
```

The setup script asks for your vault directory, registers your projects, detects your tools, and installs everything into `~/.claude/`. Zero dependencies. Works alongside Obsidian, VS Code, or any markdown tool.

7 skills. 2 hooks. 3 memory files. 0 dependencies.

MIT licensed. [github.com/desertcache/agent-os](https://github.com/desertcache/agent-os)
