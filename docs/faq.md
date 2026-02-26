# FAQ

## General

### Does this work with Cursor, Windsurf, or other AI coding tools?

The memory system (error-patterns.md, patterns.md, debugging.md, MEMORY.md) works with any tool that reads markdown files. The hooks and skills are Claude Code-specific, but the patterns and architecture are transferable.

### Do I need Obsidian?

No. The vault is just a folder of markdown files. Obsidian is a nice viewer, but any markdown editor (VS Code, Typora, even Notepad) works fine. You can also just browse the files in your file explorer.

### How much disk space does this use?

Negligible. Everything is markdown text files. A year of daily session notes might be 1-2 MB.

### Does this send my data anywhere?

No. Everything is local. The hooks write to your filesystem. The skills read/write local files. Nothing is uploaded, tracked, or telemetered.

## Setup

### Setup script fails with permission errors

On macOS/Linux, make sure you have write access to `~/.claude/`:
```bash
chmod -R u+w ~/.claude/
```

On Windows, run your terminal as your normal user (not Administrator).

### I already have a CLAUDE.md — will setup overwrite it?

No. The setup script asks what to do: merge (append agent-os rules to your existing file), replace (with backup), or skip.

### Can I re-run setup.js?

Yes. It's idempotent — it won't duplicate hooks or overwrite existing memory files. It will update the config and offer to merge/skip existing files.

## Usage

### /session-start shows "No project detected"

This means your current working directory doesn't match any registered project. Either:
- `cd` into a registered project's codebase directory
- Add the project to `agent-os.config.json`

### The activity logger isn't capturing my commits

Check that the hook is configured in `~/.claude/settings.json` under `PostToolUse` with `matcher: "Bash"`. The hook only captures `git commit` and `git push` commands run through Claude's Bash tool.

### Memory files are getting too long

Run `/audit-instructions` to check if MEMORY.md is approaching the 200-line limit. Prune entries for archived projects. The `/retro` skill has built-in duplicate detection to prevent bloat.

### Can I use this with multiple machines?

Yes. Keep the vault in a synced folder (Dropbox, iCloud, Google Drive) and run `node setup.js` on each machine. The memory files and vault are the shared state; hooks and skills are installed locally.

## Troubleshooting

### Hooks aren't running

1. Check `~/.claude/settings.json` — are the hooks configured?
2. Check that the hook file paths are absolute and correct
3. Try running the hook manually: `echo '{"cwd":"/tmp"}' | node ~/.claude/hooks/session-context-preloader.js`
4. Check `~/.claude/cache/` — do `session-context.json` and `session-activity.log` exist?

### Skills aren't recognized

Skills must be in `~/.claude/skills/<name>/SKILL.md`. Check:
1. The directory name matches the skill name
2. The SKILL.md file has valid frontmatter with `name` and `description`
3. Restart Claude Code after adding new skills
