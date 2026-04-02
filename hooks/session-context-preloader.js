/**
 * session-context-preloader.js
 * SessionStart hook: pre-gathers project context into cache JSON.
 * Reads stdin for { cwd } from Claude Code, auto-discovers projects from vault,
 * builds a full project index, maps recent sessions to projects.
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

/**
 * Parse YAML frontmatter from file content.
 * Returns key-value object. Lightweight, no dependencies.
 */
function parseFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return {};
  const result = {};
  for (const line of match[1].split(/\r?\n/)) {
    const kv = line.match(/^([\w-]+)\s*:\s*(.+)/);
    if (kv) {
      let val = kv[2].trim();
      if ((val.startsWith('"') && val.endsWith('"')) ||
          (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      result[kv[1]] = val;
    }
  }
  return result;
}

/**
 * Extract status from README content. Checks:
 * 1. Frontmatter `status:` field
 * 2. Body patterns like `## Status` or `**Status:**`
 * 3. Falls back to "unknown"
 *
 * Normalizes to: active, complete, deprecated, planned, paused, research, unknown
 */
function extractStatus(frontmatter, bodyLines) {
  let raw = '';

  if (frontmatter.status) {
    raw = frontmatter.status;
  } else {
    for (const line of bodyLines) {
      const m = line.match(/(?:^##\s*Status[:\s]*|^\*\*Status[:\s]*\*\*[:\s]*)(.+)/i);
      if (m) { raw = m[1]; break; }
    }
  }

  if (!raw) return 'unknown';
  raw = raw.toLowerCase().trim();

  if (raw.includes('deprecat')) return 'deprecated';
  if (raw.includes('complete') || raw.includes('done') || raw.includes('shipped')) return 'complete';
  if (raw.includes('plan') || raw.includes('idea')) return 'planned';
  if (raw.includes('pause') || raw.includes('hold')) return 'paused';
  if (raw.includes('research')) return 'research';
  if (raw.includes('active') || raw.includes('progress') || raw.includes('live')) return 'active';
  if (raw.includes('work') || raw.includes('build') || raw.includes('v2') || raw.includes('v1')) return 'active';
  return 'unknown';
}

/**
 * Extract a one-line summary from README content.
 * Takes the first non-empty, non-heading, non-table prose line after frontmatter.
 */
function extractSummary(bodyLines) {
  for (const line of bodyLines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (trimmed.startsWith('#')) continue;
    if (trimmed.startsWith('|')) continue;
    if (trimmed.startsWith('---')) continue;
    if (trimmed.startsWith('```')) continue;
    if (trimmed.startsWith('`') && trimmed.endsWith('`') && !trimmed.includes(' ')) continue;
    if (trimmed.startsWith('>')) {
      let summary = trimmed.replace(/^>\s*/, '').replace(/\*\*/g, '');
      if (summary.length > 80) summary = summary.slice(0, 77) + '...';
      return summary;
    }
    let summary = trimmed.replace(/\*\*/g, '').replace(/\*/g, '');
    if (summary.length > 80) summary = summary.slice(0, 77) + '...';
    return summary;
  }
  return '(no description)';
}

/**
 * Resolve codebase path for a project.
 * Priority: README frontmatter `codebase:` > config.projects[] name match > null
 */
function resolveCodebase(folderName, frontmatter, configProjects) {
  if (frontmatter.codebase) {
    return frontmatter.codebase.replace(/\/\s*$/, '');
  }
  if (configProjects) {
    const match = configProjects.find(
      p => p.name.toLowerCase() === folderName.toLowerCase()
    );
    if (match && match.codebase) return match.codebase;
  }
  return null;
}

/**
 * Scan a vault directory (e.g., Projects/) and build index entries.
 */
function scanVaultDir(vaultPath, dirName, configProjects) {
  const entries = [];
  const dirPath = path.join(vaultPath, dirName);

  try {
    const folders = fs.readdirSync(dirPath, { withFileTypes: true })
      .filter(d => d.isDirectory() && d.name !== 'Archive' && !d.name.startsWith('.'));

    for (const folder of folders) {
      const readmePath = path.join(dirPath, folder.name, 'README.md');
      try {
        const content = fs.readFileSync(readmePath, 'utf8');
        const frontmatter = parseFrontmatter(content);

        const fmEnd = content.indexOf('---', 4);
        const bodyStart = fmEnd > 0 ? content.indexOf('\n', fmEnd + 3) : 0;
        const bodyLines = content.slice(bodyStart).split(/\r?\n/).slice(0, 20);

        const status = extractStatus(frontmatter, bodyLines);
        const codebase = resolveCodebase(folder.name, frontmatter, configProjects);
        const summary = extractSummary(bodyLines);

        entries.push({
          name: folder.name,
          vault: dirName + '/' + folder.name,
          status,
          codebase,
          summary,
          lastSession: null,
          lastSessionFile: null,
        });
      } catch {
        entries.push({
          name: folder.name,
          vault: dirName + '/' + folder.name,
          status: 'unknown',
          codebase: resolveCodebase(folder.name, {}, configProjects),
          summary: '(no README)',
          lastSession: null,
          lastSessionFile: null,
        });
      }
    }
  } catch {
    // Directory doesn't exist
  }

  return entries;
}

/**
 * Build the full project index by scanning configured vault directories.
 * Default: just "Projects". Users can add more via vaultScanDirs config.
 */
function buildProjectIndex(vaultPath, config) {
  const scanDirs = config.vaultScanDirs || ['Projects'];
  const index = {};
  for (const dir of scanDirs) {
    // Use lowercase key for the index (e.g., "projects", "ventures")
    const key = dir.toLowerCase();
    index[key] = scanVaultDir(vaultPath, dir, config.projects);
  }
  return index;
}

/**
 * Map recent sessions to projects by reading frontmatter `project:` tags,
 * then falling back to filename matching for sessions without tags.
 * Sets lastSession/lastSessionFile on matching index entries.
 */
function mapSessionsToProjects(vaultPath, index) {
  const sessionsDir = path.join(vaultPath, 'Sessions');
  const allEntries = Object.values(index).flat();

  // Build a normalized name lookup
  const nameMap = new Map();
  for (const entry of allEntries) {
    nameMap.set(entry.name.toLowerCase().replace(/[-\s]/g, ''), entry);
  }

  try {
    const files = fs.readdirSync(sessionsDir)
      .filter(f => f.endsWith('.md'))
      .sort()
      .reverse()  // newest first (YYYY-MM-DD prefix)
      .slice(0, 50);

    // Pass 1: match by frontmatter project: tag (most reliable)
    for (const file of files) {
      try {
        const content = fs.readFileSync(path.join(sessionsDir, file), 'utf8');
        const first10 = content.split(/\r?\n/).slice(0, 10).join('\n');
        const fm = parseFrontmatter(first10);
        if (!fm.project) continue;

        const normalized = fm.project.toLowerCase().replace(/[-\s]/g, '');
        const entry = nameMap.get(normalized);
        if (entry && !entry.lastSession) {
          const dateMatch = file.match(/^(\d{4}-\d{2}-\d{2})/);
          entry.lastSession = dateMatch ? dateMatch[1] : null;
          entry.lastSessionFile = file;
        }
      } catch {
        // Skip unreadable session files
      }
    }

    // Pass 2: for entries still without a session, try filename matching
    const unmatched = allEntries.filter(e => !e.lastSession);
    if (unmatched.length > 0) {
      for (const file of files) {
        const filenameLower = file.toLowerCase();
        for (const entry of unmatched) {
          if (entry.lastSession) continue;
          const slug = entry.name.toLowerCase();
          if (filenameLower.includes(slug)) {
            const dateMatch = file.match(/^(\d{4}-\d{2}-\d{2})/);
            entry.lastSession = dateMatch ? dateMatch[1] : null;
            entry.lastSessionFile = file;
          }
        }
      }
    }
  } catch {
    // Sessions dir may not exist
  }
}

/**
 * Detect the current project from cwd using the full index and config.
 */
function detectProject(cwd, index, configProjects) {
  if (!cwd) return null;
  const normalized = normalizePath(cwd);
  const allEntries = Object.values(index).flat();

  // Collect all entries with a codebase path (from vault scan or config)
  const withCodebase = allEntries
    .filter(e => e.codebase)
    .sort((a, b) => b.codebase.length - a.codebase.length);

  for (const entry of withCodebase) {
    if (normalized.startsWith(normalizePath(entry.codebase))) {
      return entry;
    }
  }

  // Also check config.projects for entries not in the vault index
  if (configProjects) {
    const configOnly = configProjects
      .filter(p => p.codebase && !allEntries.some(
        e => e.name.toLowerCase() === p.name.toLowerCase()
      ))
      .sort((a, b) => b.codebase.length - a.codebase.length);

    for (const project of configOnly) {
      if (normalized.startsWith(normalizePath(project.codebase))) {
        return project;
      }
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
      // No stdin or invalid JSON
    }

    // If no config or no vault path, write minimal cache and exit
    if (!config || !config.vaultPath) {
      const result = {
        timestamp: new Date().toISOString(),
        cwd: cwd,
        detectedProject: null,
        vaultProjectPath: null,
        recentSessions: [],
        projectIndex: {},
      };
      fs.writeFileSync(CACHE_FILE, JSON.stringify(result, null, 2));
      process.exit(0);
    }

    // Build the full project index from vault
    const projectIndex = buildProjectIndex(config.vaultPath, config);
    mapSessionsToProjects(config.vaultPath, projectIndex);

    // Detect project from cwd using the full index
    const project = detectProject(cwd, projectIndex, config.projects);
    const recentSessions = getRecentSessions(config.vaultPath, 3);

    const result = {
      timestamp: new Date().toISOString(),
      cwd: cwd,
      detectedProject: project ? project.name : null,
      vaultProjectPath: project ? project.vault : null,
      recentSessions: recentSessions,
      projectIndex: projectIndex,
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
