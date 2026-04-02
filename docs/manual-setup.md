# Manual Setup

If you prefer to set things up by hand instead of using `node setup.js`, follow these steps.

## 1. Create the config file

Create `~/.claude/agent-os.config.json`:

```json
{
  "vaultPath": "/path/to/your/vault",
  "memoryDir": "/path/to/memory/dir",
  "cacheDir": "~/.claude/cache",
  "projects": [
    {
      "name": "my-project",
      "codebase": "/path/to/my-project",
      "vault": "Projects/my-project"
    }
  ],
  "vaultScanDirs": ["Projects"],
  "ghCliPath": "gh",
  "platform": "auto",
  "formatters": {
    "typescript": "npx prettier --write",
    "python": "ruff format"
  }
}
```

`vaultScanDirs` tells the preloader which vault folders to scan for project READMEs. Default is `["Projects"]`. Add more if you organize work into categories (e.g., `["Projects", "Ventures"]`).

Adjust paths for your system. Use forward slashes even on Windows.

## 2. Copy hooks

```bash
cp hooks/session-context-preloader.js ~/.claude/hooks/
cp hooks/session-activity-logger.js ~/.claude/hooks/
```

## 3. Copy skills

```bash
for skill in session-start session-handoff session-cleanup retro project-status audit-instructions index-codebase red-team meeting-notes; do
  mkdir -p ~/.claude/skills/$skill
  cp skills/$skill/SKILL.md ~/.claude/skills/$skill/
done
```

## 4. Copy memory templates

```bash
mkdir -p /path/to/memory/dir
cp memory/MEMORY.md /path/to/memory/dir/
cp memory/error-patterns.md /path/to/memory/dir/
cp memory/patterns.md /path/to/memory/dir/
cp memory/debugging.md /path/to/memory/dir/
```

## 5. Create vault structure

```bash
mkdir -p /path/to/vault/{Projects,Sessions,Reference,Planning}
cp vault/BRAIN.md /path/to/vault/
```

For each project, create a folder and README:

```bash
mkdir -p /path/to/vault/Projects/my-project
echo "# my-project\n\n## Status\nNew project." > /path/to/vault/Projects/my-project/README.md
```

## 6. Install CLAUDE.md

Copy the template or merge with your existing CLAUDE.md:

```bash
cp templates/CLAUDE.md ~/.claude/CLAUDE.md
```

Edit `~/.claude/CLAUDE.md`:
- Replace `<!-- VAULT_PATH from agent-os.config.json -->` with your actual vault path
- Add your projects to the mapping table
- Add any custom auto-dispatch rules

## 7. Configure settings.json

Edit (or create) `~/.claude/settings.json` to add the hooks:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "node \"/path/to/.claude/hooks/session-activity-logger.js\""
          }
        ]
      }
    ],
    "SessionStart": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "node \"/path/to/.claude/hooks/session-context-preloader.js\""
          }
        ]
      }
    ]
  }
}
```

Replace `/path/to/.claude/` with the actual absolute path to your `.claude` directory.

**Optional: auto-formatting hooks**

Add before the activity logger in the `PostToolUse` array:

```json
{
  "matcher": "Edit|Write",
  "hooks": [
    {
      "type": "command",
      "command": "file=\"$CLAUDE_FILE_PATH\"; if [[ \"$file\" =~ \\.(ts|tsx|js|jsx)$ ]]; then npx prettier --write \"$file\" 2>/dev/null; fi"
    }
  ]
}
```

## 8. Verify

1. Open Claude Code
2. Type `/session-start` — you should see a project briefing
3. Make some changes and run `git commit`
4. Type `/retro` — the activity logger should have captured the commit
