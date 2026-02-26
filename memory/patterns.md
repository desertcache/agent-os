# Workflow Patterns

Approaches and strategies that work well. Populated by `/retro`.

## File Operations

### Parallel Read-then-Write
**Context:** Need to modify multiple existing files in one step
**Approach:** Batch all Reads first, then batch all Writes. Never interleave.
**Why it works:** Write tool requires pre-read; parallel reads are fast, and batching writes avoids partial-failure cascades.

### Long-running installs in background
**Context:** Installing packages (pip, npm, winget) that take >30 seconds
**Approach:** Use `run_in_background: true` for the Bash command. Continue other work while waiting.
**Why it works:** Avoids blocking the conversation on slow network operations.

## Architecture Decisions

<!-- Add patterns here as you discover what works for your projects -->

## Session Management

<!-- Add session workflow patterns here -->

## Debugging Approaches

<!-- Add debugging strategies that proved effective -->
