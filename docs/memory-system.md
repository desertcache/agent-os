# Memory System

The agent-os memory system solves a fundamental problem: **AI agents are goldfish.** They make the same mistake in session 47 that they made in session 1. Vector stores don't help because failure modes are specific, prescriptive rules — not semantic similarity.

## Three-File Architecture

### error-patterns.md — What fails and what to do instead

```markdown
### Write tool: "File has not been read yet"
**What happened:** Tried to Write to existing files without reading them first.
**Rule:** ALWAYS Read existing files before Writing. Batch all Reads first.
```

**Key design choice:** The "Rule" field is prescriptive ("always do X"), not descriptive ("Y is broken"). This makes patterns directly actionable — the agent reads the rule and knows exactly what to do.

### patterns.md — What works (reusable workflows)

```markdown
### Parallel Read-then-Write
**Context:** Need to modify multiple existing files
**Approach:** Batch all Reads first, then batch all Writes
**Why it works:** Write tool requires pre-read; parallel reads are fast
```

**Key design choice:** Patterns include "Why it works" — not just the what, but the reasoning. This helps the agent generalize to similar situations.

### debugging.md — Symptom → Root Cause → Fix

```markdown
### React UI renders blank but DOM elements exist
**Root Cause:** Library applied internal transforms pushing elements off-screen
**Fix:** Replaced library with native CSS. Used browser snapshot for diagnosis.
**Prevention:** Check element positions when UI is invisible. Suspect CSS transforms.
```

**Key design choice:** Three fields force structured thinking: symptom (observable), root cause (actual), prevention (systemic). This prevents "I fixed it but don't know why."

## Quality Gates

### The 3-Strike Rule

Not every error deserves a memory entry. One-off mistakes clutter the memory and slow down every future session (these files load into context).

**Rule:** Only persist patterns that recur 3+ times in a single session. One-off errors might just be bad luck. Recurring errors are systemic.

### Duplicate Detection

Before adding a new pattern, the `/retro` skill reads the existing file and checks for duplicates. This prevents the memory from growing unbounded with variations of the same issue.

### Category Enforcement

Each pattern must go in a specific section:

| File | Sections |
|------|----------|
| error-patterns.md | Tool Errors, API/Integration Errors, Workflow Patterns, Platform-Specific |
| patterns.md | File Operations, Architecture Decisions, Session Management, Debugging Approaches |
| debugging.md | Tool & Environment Issues, Code Issues, Integration Issues |

This structure makes patterns findable and prevents the files from becoming unstructured dumps.

### The 200-Line Budget

MEMORY.md loads into every session's context window. It has a hard budget of ~200 lines. This forces prioritization:
- Only environment facts that affect every session
- Only project references that are actively worked on
- Prune entries when projects are archived

## How Memory Flows Through the System

```
Session work → agent encounters errors / discovers patterns
                    ↓
3+ same errors? → auto-add to error-patterns.md (CLAUDE.md rule)
                    ↓
User runs /retro → reads activity log + conversation
                    ↓
                 checks existing files for duplicates
                    ↓
                 adds genuinely new patterns (skips duplicates)
                    ↓
Next session → /session-start reads error-patterns.md
                    ↓
             agent avoids previously-documented mistakes
```

## Extending the Memory System

You can add new memory files for domain-specific knowledge:

1. Create the file in your memory directory (e.g., `api-patterns.md`)
2. Add a reference to it in your CLAUDE.md so it loads into context
3. Update the `/retro` skill to check and update it

Or add new sections to existing files — the category headers are just markdown headings.
