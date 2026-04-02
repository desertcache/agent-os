# Agent OS — Claude Code Configuration

## AUTO-DISPATCH RULES

When I mention these topics, automatically use the corresponding capability without asking.

### Session & Project Management
| I mention... | Auto-invoke |
|--------------|-------------|
| Session start, catch me up, where were we | `/session-start` |
| Session handoff, pause work, save context | `/session-handoff` |
| Cleanup, wrap up, end session | `/session-cleanup` |
| Retro, reflect, what did we learn | `/retro` |
| Project status, where are we, what's blocked | `/project-status` |
| Audit instructions, check rules | `/audit-instructions` |
| Index codebase, map codebase | `/index-codebase` |
| Red team this, challenge this, poke holes | `/red-team` |
| Meeting notes, process meeting, action items | `/meeting-notes` |

### Knowledge & Memory
| I mention... | Auto-use |
|--------------|----------|
| Remember this, save for later | Write to vault or memory files |
| What do you know about, recall | Read from vault + memory files |

<!-- Add your own auto-dispatch rules here. Examples:
| I mention... | Auto-use |
|--------------|----------|
| Calendar, schedule, meeting | `gcalcli` via Bash |
| GitHub repo, PR, issues | `gh` CLI via Bash |
| Library docs, latest docs | Context7 MCP |
-->

## BEHAVIOR PREFERENCES

1. **Auto-invoke skills** — Don't ask "would you like me to use X?" — just use the right tool
2. **Use CLIs directly** — When a CLI tool can do the job, use it immediately
3. **Combine capabilities** — Use multiple tools together for complex tasks

## SELF-IMPROVEMENT RULES

1. **Error self-correction**: After 3+ same-type tool errors in a session, proactively add the pattern to `error-patterns.md` (don't wait for `/retro`)
2. **Context-drift detection**: If MEMORY.md or vault info contradicts what you see in the current codebase, flag it to the user immediately
3. **Post-work reflection nudge**: After substantial work (multiple file changes, debugging sessions, or new features), suggest `/retro` once per session

## TASK INTENSITY SIGNALS

Recognize these implicit workload indicators:

| Signal Words | Intensity | Response Style |
|--------------|-----------|----------------|
| "quick check", "glance", "wrap up" | Light | Fast, minimal output |
| "review", "status", "sync" | Medium | Thorough but focused |
| "deep dive", "investigate", "audit" | Heavy | Comprehensive analysis |

## VAULT (Agent Memory)

Vault location: `<!-- VAULT_PATH from agent-os.config.json -->`

This vault is Claude's persistent memory across sessions. Use direct file access (Read, Write, Edit, Glob, Grep).

**At Session Start:**
1. Check `Sessions/` for recent handoff notes relevant to current work
2. Read `Projects/<name>/README.md` for context
3. Consult `BRAIN.md` if unsure how to use the vault

**During Work:**
- Document important decisions, findings, and context as you go

**At Session End:**
1. Update project README with any significant changes
2. Create `Sessions/YYYY-MM-DD-topic.md` for work-in-progress handoffs
3. Update MEMORY.md with any new environment facts or tool discoveries

## PROJECT-CODEBASE MAPPING

<!-- Add your projects here. This table maps vault folders to codebase paths. -->
<!-- The session-context-preloader hook uses agent-os.config.json for the same mapping. -->

| Vault Folder | Codebase |
|--------------|----------|
| `Projects/example-app/` | `/path/to/example-app/` |
