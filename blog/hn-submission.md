# Hacker News Submission

## Title
Show HN: Agent-OS -- persistence layer for Claude Code (hooks, skills, memory)

## URL
https://github.com/desertcache/agent-os

## First Comment (post immediately after submitting)

I built this because I use Claude Code 8+ hours/day across 14 projects, and the context loss between sessions was killing my velocity.

The core problem: Claude Code is stateless. Every session starts from zero. You can write a CLAUDE.md, but it's static. It doesn't learn from mistakes, track what you worked on yesterday, or improve over time.

agent-os adds three layers:

- **Hooks** (automatic): Pre-gather project context at session start (<100ms), log git activity for later analysis.
- **Skills** (invoked): `/session-start` for instant briefings, `/retro` for post-work reflection, `/session-cleanup` for end-of-session state sync.
- **Memory** (persistent): Three-file system (error-patterns, patterns, debugging) with quality gates: 3-strike rule (only persist recurring errors), duplicate detection, 200-line hard budget.

The quality gates are the most important design decision. Most AI memory just accumulates noise. The 3-strike rule means only patterns that recur 3+ times in a session get persisted. The 200-line budget forces prioritization.

Zero dependencies, pure Node.js + markdown. Works with Obsidian or any text editor.

Happy to answer questions about the architecture or the DevOps-for-AI-agents framing.
