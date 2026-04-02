# Changelog

## [0.2.0] - 2026-04-01

### Added
- **red-team skill** -- Adversarial review for plans, architectures, and decisions
- **meeting-notes skill** -- Process meeting transcripts into structured notes with action items
- **Vault auto-discovery** -- Preloader scans vault folders for project metadata instead of requiring manual registration of every project
- **Two-phase session start** -- Phase 1 shows full project index, Phase 2 loads deep context on demand
- **Session-to-project mapping** -- Sessions with `project:` frontmatter are automatically linked to projects in the index
- **vaultScanDirs config** -- Support multiple vault category folders (e.g., Projects + Ventures)
- **CHANGELOG.md** -- This file

### Changed
- **session-context-preloader.js** -- Major overhaul: auto-discovers projects from vault READMEs (frontmatter + body parsing), builds full project index, two-pass session mapping (frontmatter tags + filename fallback)
- **session-start skill** -- Two-phase flow: index overview then deep context on demand. Auto-skips to Phase 2 when project detected from cwd
- **session-handoff skill** -- Streamlined template (~15 lines vs ~40 lines). Added required `project:` frontmatter field
- **session-cleanup skill** -- Reads cache for project detection. Ensures session notes have `project:` frontmatter. Defers error capture to /retro
- **retro skill** -- Added `project:` frontmatter guidance for session notes
- **setup.js** -- Installs 9 skills (was 7). New `vaultScanDirs` config option for multiple vault category folders

### Fixed
- Session-to-project linking now works via frontmatter tags instead of only filename matching

## [0.1.0] - 2026-02-25

### Added
- Initial release: 2 hooks, 7 skills, 4 memory templates
- Interactive setup.js installer (zero dependencies)
- Vault-based persistent memory system
- Session lifecycle management
- 6 documentation files + examples
