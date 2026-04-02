# Reddit Post for r/ClaudeAI

## Title
I built a persistence layer for Claude Code: session continuity, self-correcting memory, structured workflows

## Body

I've been using Claude Code 8+ hours a day across 14 projects. The biggest pain point: every session starts from zero. No memory of what I worked on yesterday, which mistakes it already made, or what decisions we landed on.

I built **agent-os** to fix that. It's open source and it adds three things:

**1. Hooks (run automatically)**
A `SessionStart` hook pre-gathers your project context before you type anything (<100ms). It knows which project you're in and pulls your last session's handoff notes. A `PostToolUse` hook silently logs git activity for later analysis.

**2. Skills (slash commands)**
- `/session-start` - instant briefing with project state, blockers, and recent work
- `/retro` - post-work reflection that captures learnings to memory files
- `/session-cleanup` - end-of-session: update vault, sync memory, push to git

**3. Memory (self-improving)**
Three markdown files that the agent reads every session:
- `error-patterns.md` - mistakes stored as prescriptive rules ("do X instead of Y")
- `patterns.md` - workflow approaches that worked
- `debugging.md` - symptom to root cause mappings

The key: quality gates prevent bloat. A 3-strike rule means patterns only get saved after recurring 3+ times. A 200-line hard cap on MEMORY.md forces prioritization. It grows slowly and deliberately.

**Setup is 3 commands:**
```
git clone https://github.com/desertcache/agent-os.git
cd agent-os
node setup.js
```

Zero dependencies. Works with Obsidian. MIT licensed.

GitHub: https://github.com/desertcache/agent-os

Would love feedback from other heavy Claude Code users. What does your persistence setup look like?
