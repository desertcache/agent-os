# Error Patterns & Rules

Mistakes the agent has made and rules to prevent repeating them. Checked at every session start. Populated by `/retro`.

## Tool Errors

### Write tool: "File has not been read yet"
**What happened:** Tried to Write to existing files without reading them first. Parallel writes all failed because one sibling errored.
**Rule:** ALWAYS Read existing files before Writing. When rewriting multiple files, batch all Reads together first, then batch all Writes.

### Bash: wrong delete command for platform
**What happened:** Used platform-wrong delete command (e.g., `del` on Unix, `rm` on Windows CMD).
**Rule:** Check your shell environment. Use `rm` for bash/zsh, `del` for CMD. Check MEMORY.md for platform info.

### CLI tool not found despite being installed
**What happened:** A CLI tool was installed but not on the default PATH. Bare command fails.
**Rule:** Check MEMORY.md for tool paths. If a tool isn't found, check common install locations before giving up.

## API / Integration Errors

### Python: UnboundLocalError on global with augmented assignment
**What happened:** `global_var -= value` in a function caused `UnboundLocalError`. Python sees `-=` as assignment, making the variable local for the entire function scope.
**Rule:** Never use augmented assignment (`-=`, `+=`, `|=`) on global sets/dicts in functions. Use methods instead: `.difference_update()`, `.update()`, `.add()`. Or add `global varname` at the top.

### Large refactor: blast radius of renaming shared singletons
**What happened:** Renamed a shared singleton used by 6+ downstream files. Only updated the definition, breaking all consumers.
**Rule:** Before renaming a shared module/singleton, grep for ALL consumers first. Update ALL downstream files in the same batch.

### npm package security: low-quality package installed
**What happened:** Installed an npm package with 0 dependents, unknown maintainer. Couldn't verify source code or check for malicious scripts.
**Rule:** Before installing unknown npm packages, check: weekly downloads, dependents count, maintainer history, postinstall scripts. Zero dependents + new maintainer = don't install.

## Workflow Patterns

### Docker --rm doesn't clean up on force-close
**What happened:** `docker compose run --rm` containers kept running as orphans when terminal was force-closed instead of graceful exit.
**Rule:** Add a cleanup step at the start of Docker launcher scripts: `docker rm -f` any containers from previous runs. Don't rely on `--rm` alone.

## Platform-Specific

### Git push hangs or fails silently
**What happened:** `git push` hung indefinitely due to credential helper issues.
**Rule:** If `git push` hangs, check authentication status first. Use the platform's git credential helper or authenticated CLI tools.

### .bat files: Unix paths don't work
**What happened:** Used Unix-style paths (`/c/Program Files/...`) inside a `.bat` file. CMD couldn't resolve them.
**Rule:** In `.bat` files, always use Windows-style paths (`C:\Program Files\...`). Reserve `/c/...` paths for Git Bash scripts only.

### OAuth flows need separate terminal
**What happened:** CLI tools that open browser for OAuth can't do so from Claude's Bash sandbox.
**Rule:** Launch OAuth-requiring commands in a separate terminal window (e.g., `start powershell -Command "..."` on Windows, `open -a Terminal` on macOS).
