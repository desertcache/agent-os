# Customization

agent-os is designed to be extended. Everything is markdown files and JavaScript — no framework, no compilation, no lock-in.

## Adding Projects

The preloader auto-discovers projects by scanning vault folders. Just create a folder with a README:

```bash
mkdir -p <vault>/Projects/my-new-app
```

And add a README with optional frontmatter:

```markdown
---
status: active
codebase: /path/to/my-new-app
---
# my-new-app
```

The preloader will pick it up automatically on next session start.

**Alternative:** Register projects explicitly in `agent-os.config.json` (useful for projects that don't have a vault folder yet):

```json
{
  "projects": [
    {
      "name": "my-new-app",
      "codebase": "/path/to/my-new-app",
      "vault": "Projects/my-new-app"
    }
  ]
}
```

### Multiple vault categories

If you organize work into categories (e.g., Projects + Ventures), add them to `vaultScanDirs`:

```json
{
  "vaultScanDirs": ["Projects", "Ventures"]
}
```

Then create the vault folder:
```bash
mkdir -p <vault>/Projects/my-new-app
```

And add a README:
```markdown
# my-new-app

## Status
Starting development.

## Next Steps
- [ ] Scaffold project
```

## Adding Auto-Dispatch Rules

Edit `~/.claude/CLAUDE.md` to add trigger phrases:

```markdown
### My Custom Rules
| I mention... | Auto-use |
|--------------|----------|
| Deploy, ship it | Run deploy script via Bash |
| Database, migration | `/my-migration-skill` |
```

## Creating Custom Skills

1. Create a folder: `~/.claude/skills/my-skill/`
2. Create `SKILL.md` with frontmatter and instructions:

```markdown
---
name: my-skill
description: >
  What this skill does. Use when the user says "trigger phrase".
---

# My Skill

## Steps
1. [What to do first]
2. [What to do second]

## Output Format
[What the user should see]

## Rules
- [Constraint 1]
- [Constraint 2]
```

Skills are just structured instructions — they tell Claude what tools to use and how to format output. No code needed.

## Adding Memory Categories

### New sections in existing files

Add a heading to `patterns.md`:

```markdown
## Deployment Patterns

### Blue-green with health checks
**Context:** Deploying to production with zero downtime
**Approach:** ...
**Why it works:** ...
```

### New memory files

1. Create the file in your memory directory
2. Reference it in your CLAUDE.md:

```markdown
## MEMORY FILES
Read these at session start:
- `<memoryDir>/MEMORY.md`
- `<memoryDir>/error-patterns.md`
- `<memoryDir>/my-domain-patterns.md`  ← new
```

3. Update `/retro` skill to check the new file for updates

## Modifying Hooks

### Add a new PostToolUse hook

Edit `~/.claude/settings.json`:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write",
        "hooks": [
          {
            "type": "command",
            "command": "node /path/to/my-hook.js"
          }
        ]
      }
    ]
  }
}
```

Hooks receive tool context on stdin as JSON. See the existing hooks for examples.

### Hook best practices

- Exit in <50ms for non-matching commands (check early, bail fast)
- Never fail the parent tool call — wrap everything in try/catch, always `process.exit(0)`
- Use `process.env.USERPROFILE || process.env.HOME` for cross-platform home directory
