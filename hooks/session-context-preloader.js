/**
 * session-context-preloader.js
 * SessionStart hook: pre-gathers project context into cache JSON.
 * Reads stdin for { cwd } from Claude Code, maps to project via config,
 * scans recent vault sessions.
 * Writes consolidated JSON to ~/.claude/cache/session-context.json
 *
 * Part of agent-os — https://github.com/desertcache/agent-os
 */

const fs = require('fs');
const path = require('path');

// --- Config resolution ---
const HOME = process.env.USERPROFILE || process.env.HOME;
const CONFIG_LOCATIONS = [
  path.join(HOME, '.claude', 'agent-os.config.json'),
  path.join(__dirname, '..', 'agent-os.config.json'),
];

function loadConfig() {
  for (const loc of CONFIG_LOCATIONS) {
    try {
      return JSON.parse(fs.readFileSync(loc, 'utf8'));
    } catch {
      // Try next location
    }
  }
  return null;
}

// --- Main logic ---
const CACHE_DIR = path.join(HOME, '.claude', 'cache');
const CACHE_FILE = path.join(CACHE_DIR, 'session-context.json');

function ensureCacheDir() {
  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
  }
}

function normalizePath(p) {
  return p.replace(/\\/g, '/').toLowerCase();
}

function detectProject(cwd, projects) {
  if (!cwd || !projects) return null;
  const normalized = normalizePath(cwd);
  for (const project of projects) {
    if (project.codebase && normalized.startsWith(normalizePath(project.codebase))) {
      return project;
    }
  }
  return null;
}

function getRecentSessions(vaultPath, count) {
  const sessionsDir = path.join(vaultPath, 'Sessions');
  const results = [];
  try {
    const files = fs.readdirSync(sessionsDir)
      .filter(f => f.endsWith('.md'))
      .map(f => ({
        name: f,
        fullPath: path.join(sessionsDir, f),
        mtime: fs.statSync(path.join(sessionsDir, f)).mtimeMs
      }))
      .sort((a, b) => b.mtime - a.mtime)
      .slice(0, count);

    for (const file of files) {
      try {
        const content = fs.readFileSync(file.fullPath, 'utf8');
        const lines = content.split('\n').slice(0, 10).join('\n');
        results.push({ file: file.name, preview: lines });
      } catch {
        results.push({ file: file.name, preview: '(unreadable)' });
      }
    }
  } catch {
    // Sessions dir may not exist yet
  }
  return results;
}

function main() {
  try {
    ensureCacheDir();

    const config = loadConfig();

    // Read stdin for cwd
    let cwd = null;
    try {
      const input = fs.readFileSync(0, 'utf8');
      const parsed = JSON.parse(input);
      cwd = parsed.cwd || null;
    } catch {
      // No stdin or invalid JSON — that's fine
    }

    const project = config ? detectProject(cwd, config.projects) : null;
    const recentSessions = config && config.vaultPath
      ? getRecentSessions(config.vaultPath, 3)
      : [];

    const result = {
      timestamp: new Date().toISOString(),
      cwd: cwd,
      detectedProject: project ? project.name : null,
      vaultProjectPath: project ? project.vault : null,
      recentSessions: recentSessions
    };

    fs.writeFileSync(CACHE_FILE, JSON.stringify(result, null, 2));
    process.exit(0);
  } catch (err) {
    // Don't fail the session start on errors
    console.error('session-context-preloader error:', err.message);
    process.exit(0);
  }
}

main();
