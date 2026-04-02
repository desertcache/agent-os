#!/usr/bin/env node

/**
 * agent-os setup
 * Interactive installer that configures Claude Code with the agent-os infrastructure.
 * Zero dependencies — uses only Node.js built-ins (readline, fs, path, child_process).
 *
 * Usage: node setup.js
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { execSync } = require('child_process');

// --- Constants ---
const HOME = process.env.USERPROFILE || process.env.HOME;
const CLAUDE_DIR = path.join(HOME, '.claude');
const REPO_ROOT = __dirname;
const PLATFORM = process.platform; // win32, darwin, linux

// --- Helpers ---
function normalizePath(p) {
  return p.replace(/\\/g, '/');
}

function expandHome(p) {
  if (p.startsWith('~')) {
    return path.join(HOME, p.slice(1));
  }
  return p;
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function backupFile(filePath) {
  if (fs.existsSync(filePath)) {
    const backupPath = filePath + '.bak';
    fs.copyFileSync(filePath, backupPath);
    return backupPath;
  }
  return null;
}

function copyDir(src, dest) {
  ensureDir(dest);
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function commandExists(cmd) {
  try {
    execSync(PLATFORM === 'win32' ? `where ${cmd}` : `which ${cmd}`, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function findGhCli() {
  // Check common locations
  if (commandExists('gh')) return 'gh';
  const winPath = 'C:/Program Files/GitHub CLI/gh.exe';
  if (PLATFORM === 'win32' && fs.existsSync(winPath)) return `"${normalizePath(winPath)}"`;
  return null;
}

// --- Interactive prompts ---
function createInterface() {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
}

function ask(rl, question, defaultValue) {
  return new Promise((resolve) => {
    const prompt = defaultValue ? `${question} [${defaultValue}]: ` : `${question}: `;
    rl.question(prompt, (answer) => {
      resolve(answer.trim() || defaultValue || '');
    });
  });
}

function askYesNo(rl, question, defaultYes = true) {
  return new Promise((resolve) => {
    const hint = defaultYes ? '[Y/n]' : '[y/N]';
    rl.question(`${question} ${hint}: `, (answer) => {
      const a = answer.trim().toLowerCase();
      if (a === '') resolve(defaultYes);
      else resolve(a === 'y' || a === 'yes');
    });
  });
}

// --- Main setup flow ---
async function main() {
  console.log(`
╔══════════════════════════════════════╗
║          agent-os setup              ║
║  Turn Claude Code into a persistent, ║
║  self-improving agent.               ║
╚══════════════════════════════════════╝
`);
  console.log(`Platform: ${PLATFORM}`);
  console.log(`Home: ${HOME}`);
  console.log(`Claude config: ${CLAUDE_DIR}`);
  console.log();

  const rl = createInterface();

  try {
    // --- Step 1: Vault path ---
    console.log('── Step 1: Vault ──');
    console.log('The vault is a folder of markdown files that serves as your agent\'s persistent memory.');
    console.log('It stores project docs, session handoffs, and reference material.');
    console.log();

    let vaultPath = await ask(rl, 'Vault directory path', path.join(HOME, 'Documents', 'AgentVault'));
    vaultPath = expandHome(vaultPath);
    vaultPath = normalizePath(vaultPath);

    if (!fs.existsSync(vaultPath)) {
      const create = await askYesNo(rl, `Directory doesn't exist. Create it?`);
      if (create) {
        ensureDir(vaultPath);
        console.log(`  Created: ${vaultPath}`);
      } else {
        console.log('Vault is required for agent-os. Please create the directory and re-run setup.');
        process.exit(1);
      }
    }

    // --- Step 2: Memory directory ---
    console.log('\n── Step 2: Memory ──');
    console.log('Memory files (error patterns, workflow patterns) live in a separate directory.');
    console.log();

    const defaultMemory = normalizePath(path.join(CLAUDE_DIR, 'projects', 'memory'));
    let memoryDir = await ask(rl, 'Memory directory path', defaultMemory);
    memoryDir = expandHome(memoryDir);
    memoryDir = normalizePath(memoryDir);
    ensureDir(memoryDir);

    // --- Step 3: Projects ---
    console.log('\n── Step 3: Projects ──');
    console.log('Register your projects so the agent can detect them from your working directory.');
    console.log('You can add more later by editing agent-os.config.json.');
    console.log();

    const projects = [];
    let addMore = await askYesNo(rl, 'Register a project now?');

    while (addMore) {
      const name = await ask(rl, '  Project name (e.g., my-app)');
      const codebase = normalizePath(expandHome(await ask(rl, '  Codebase path (e.g., ~/code/my-app)')));
      const vault = await ask(rl, '  Vault subfolder (e.g., Projects/my-app)', `Projects/${name}`);

      projects.push({ name, codebase, vault });
      console.log(`  Added: ${name}`);

      addMore = await askYesNo(rl, 'Register another project?', false);
    }

    // Vault scan directories
    console.log('\n  The preloader auto-discovers projects by scanning vault folders.');
    console.log('  Default: just "Projects". Add more if you organize work into categories.');
    const extraDirs = await ask(rl, '  Additional vault folders to scan (comma-separated, or press Enter to skip)');
    const vaultScanDirs = ['Projects'];
    if (extraDirs) {
      for (const dir of extraDirs.split(',').map(d => d.trim()).filter(Boolean)) {
        if (!vaultScanDirs.includes(dir)) vaultScanDirs.push(dir);
      }
    }
    if (vaultScanDirs.length > 1) {
      console.log(`  Scanning: ${vaultScanDirs.join(', ')}`);
    }

    // --- Step 4: Detect tools ---
    console.log('\n── Step 4: Tools ──');

    const ghPath = findGhCli();
    console.log(`  gh CLI: ${ghPath || 'not found (optional — install from https://cli.github.com)'}`);

    const hasPrettier = commandExists('npx');
    console.log(`  prettier (via npx): ${hasPrettier ? 'available' : 'not found'}`);

    const hasRuff = commandExists('ruff');
    console.log(`  ruff (Python formatter): ${hasRuff ? 'available' : 'not found'}`);

    // --- Step 5: Generate config ---
    console.log('\n── Step 5: Installing ──');

    const config = {
      vaultPath,
      memoryDir,
      cacheDir: normalizePath(path.join(CLAUDE_DIR, 'cache')),
      projects,
      vaultScanDirs,
      ghCliPath: ghPath || 'gh',
      platform: PLATFORM,
      formatters: {
        typescript: hasPrettier ? 'npx prettier --write' : null,
        python: hasRuff ? 'ruff format' : null,
      },
    };

    // Write config to ~/.claude/ (runtime location)
    ensureDir(CLAUDE_DIR);
    const configPath = path.join(CLAUDE_DIR, 'agent-os.config.json');
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    console.log(`  Config: ${configPath}`);

    // --- Copy hooks ---
    const hooksDir = path.join(CLAUDE_DIR, 'hooks');
    ensureDir(hooksDir);
    fs.copyFileSync(
      path.join(REPO_ROOT, 'hooks', 'session-context-preloader.js'),
      path.join(hooksDir, 'session-context-preloader.js')
    );
    fs.copyFileSync(
      path.join(REPO_ROOT, 'hooks', 'session-activity-logger.js'),
      path.join(hooksDir, 'session-activity-logger.js')
    );
    console.log(`  Hooks: ${hooksDir}`);

    // --- Copy skills ---
    const skillsDir = path.join(CLAUDE_DIR, 'skills');
    const skillNames = ['session-start', 'session-handoff', 'session-cleanup', 'retro', 'project-status', 'audit-instructions', 'index-codebase', 'red-team', 'meeting-notes'];
    for (const skill of skillNames) {
      const destDir = path.join(skillsDir, skill);
      ensureDir(destDir);
      fs.copyFileSync(
        path.join(REPO_ROOT, 'skills', skill, 'SKILL.md'),
        path.join(destDir, 'SKILL.md')
      );
    }
    console.log(`  Skills: ${skillsDir} (${skillNames.length} skills)`);

    // --- Copy memory templates (only if files don't exist) ---
    const memoryFiles = ['MEMORY.md', 'error-patterns.md', 'patterns.md', 'debugging.md'];
    let memCopied = 0;
    for (const file of memoryFiles) {
      const dest = path.join(memoryDir, file);
      if (!fs.existsSync(dest)) {
        fs.copyFileSync(path.join(REPO_ROOT, 'memory', file), dest);
        memCopied++;
      }
    }
    console.log(`  Memory: ${memoryDir} (${memCopied} new files, ${memoryFiles.length - memCopied} already existed)`);

    // --- Create vault structure ---
    const vaultDirs = [...new Set([...vaultScanDirs, 'Sessions', 'Reference', 'Planning'])];
    for (const dir of vaultDirs) {
      ensureDir(path.join(vaultPath, dir));
    }

    // Create project subfolders in vault
    for (const project of projects) {
      const projectDir = path.join(vaultPath, project.vault);
      ensureDir(projectDir);
      const readmePath = path.join(projectDir, 'README.md');
      if (!fs.existsSync(readmePath)) {
        fs.writeFileSync(readmePath, `# ${project.name}\n\n## Status\nNew project — not yet documented.\n\n## Next Steps\n- [ ] Add project description\n- [ ] Document architecture\n`);
      }
    }

    // Copy BRAIN.md to vault root
    const brainDest = path.join(vaultPath, 'BRAIN.md');
    if (!fs.existsSync(brainDest)) {
      fs.copyFileSync(path.join(REPO_ROOT, 'vault', 'BRAIN.md'), brainDest);
    }
    console.log(`  Vault: ${vaultPath} (${vaultDirs.length} folders + BRAIN.md)`);

    // --- Install CLAUDE.md ---
    const claudeMdDest = path.join(CLAUDE_DIR, 'CLAUDE.md');
    if (fs.existsSync(claudeMdDest)) {
      console.log(`\n  CLAUDE.md already exists at ${claudeMdDest}`);
      const action = await ask(rl, '  Merge agent-os rules into existing file? (merge/replace/skip)', 'skip');
      if (action === 'replace') {
        backupFile(claudeMdDest);
        let template = fs.readFileSync(path.join(REPO_ROOT, 'templates', 'CLAUDE.md'), 'utf8');
        template = template.replace('<!-- VAULT_PATH from agent-os.config.json -->', vaultPath);
        fs.writeFileSync(claudeMdDest, template);
        console.log('  Replaced (backup saved as .bak)');
      } else if (action === 'merge') {
        backupFile(claudeMdDest);
        const existing = fs.readFileSync(claudeMdDest, 'utf8');
        let template = fs.readFileSync(path.join(REPO_ROOT, 'templates', 'CLAUDE.md'), 'utf8');
        template = template.replace('<!-- VAULT_PATH from agent-os.config.json -->', vaultPath);
        fs.writeFileSync(claudeMdDest, existing + '\n\n' + template);
        console.log('  Merged (backup saved as .bak)');
      } else {
        console.log('  Skipped — you can manually add agent-os rules from templates/CLAUDE.md');
      }
    } else {
      let template = fs.readFileSync(path.join(REPO_ROOT, 'templates', 'CLAUDE.md'), 'utf8');
      template = template.replace('<!-- VAULT_PATH from agent-os.config.json -->', vaultPath);
      fs.writeFileSync(claudeMdDest, template);
      console.log(`  CLAUDE.md: ${claudeMdDest}`);
    }

    // --- Merge settings.json hooks ---
    const settingsDest = path.join(CLAUDE_DIR, 'settings.json');
    const hooksPath = normalizePath(path.join(CLAUDE_DIR, 'hooks'));

    if (fs.existsSync(settingsDest)) {
      const action = await ask(rl, '  settings.json exists. Merge agent-os hooks? (merge/skip)', 'merge');
      if (action === 'merge') {
        backupFile(settingsDest);
        try {
          const existing = JSON.parse(fs.readFileSync(settingsDest, 'utf8'));
          if (!existing.hooks) existing.hooks = {};

          // Add SessionStart hook
          if (!existing.hooks.SessionStart) existing.hooks.SessionStart = [];
          const preloaderCmd = `node "${hooksPath}/session-context-preloader.js"`;
          const hasPreloader = existing.hooks.SessionStart.some(h =>
            h.hooks && h.hooks.some(hh => hh.command && hh.command.includes('session-context-preloader'))
          );
          if (!hasPreloader) {
            existing.hooks.SessionStart.push({
              hooks: [{ type: 'command', command: preloaderCmd }]
            });
          }

          // Add PostToolUse activity logger
          if (!existing.hooks.PostToolUse) existing.hooks.PostToolUse = [];
          const loggerCmd = `node "${hooksPath}/session-activity-logger.js"`;
          const hasLogger = existing.hooks.PostToolUse.some(h =>
            h.hooks && h.hooks.some(hh => hh.command && hh.command.includes('session-activity-logger'))
          );
          if (!hasLogger) {
            existing.hooks.PostToolUse.push({
              matcher: 'Bash',
              hooks: [{ type: 'command', command: loggerCmd }]
            });
          }

          fs.writeFileSync(settingsDest, JSON.stringify(existing, null, 2));
          console.log('  Settings: Merged hooks (backup saved as .bak)');
        } catch (err) {
          console.log(`  Settings: Failed to merge — ${err.message}. Edit manually.`);
        }
      } else {
        console.log('  Settings: Skipped');
      }
    } else {
      // Create new settings.json with hooks
      const settings = {
        hooks: {
          PostToolUse: [
            {
              matcher: 'Bash',
              hooks: [{ type: 'command', command: `node "${hooksPath}/session-activity-logger.js"` }]
            }
          ],
          SessionStart: [
            {
              hooks: [{ type: 'command', command: `node "${hooksPath}/session-context-preloader.js"` }]
            }
          ]
        }
      };

      // Add formatters if available
      if (config.formatters.typescript) {
        settings.hooks.PostToolUse.unshift({
          matcher: 'Edit|Write',
          hooks: [{
            type: 'command',
            command: PLATFORM === 'win32'
              ? `powershell -Command "$file = $env:CLAUDE_FILE_PATH; if ($file -match '\\.(ts|tsx|js|jsx)$') { ${config.formatters.typescript} $file 2>$null }"`
              : `file="$CLAUDE_FILE_PATH"; if [[ "$file" =~ \\.(ts|tsx|js|jsx)$ ]]; then ${config.formatters.typescript} "$file" 2>/dev/null; fi`
          }]
        });
      }
      if (config.formatters.python) {
        settings.hooks.PostToolUse.unshift({
          matcher: 'Edit|Write',
          hooks: [{
            type: 'command',
            command: PLATFORM === 'win32'
              ? `powershell -Command "$file = $env:CLAUDE_FILE_PATH; if ($file -match '\\.py$') { ${config.formatters.python} $file 2>$null }"`
              : `file="$CLAUDE_FILE_PATH"; if [[ "$file" =~ \\.py$ ]]; then ${config.formatters.python} "$file" 2>/dev/null; fi`
          }]
        });
      }

      fs.writeFileSync(settingsDest, JSON.stringify(settings, null, 2));
      console.log(`  Settings: ${settingsDest}`);
    }

    // --- Done ---
    console.log(`
╔══════════════════════════════════════╗
║          Setup complete!             ║
╚══════════════════════════════════════╝

Installed:
  Config:  ${configPath}
  Hooks:   ${hooksDir} (2 hooks)
  Skills:  ${skillsDir} (${skillNames.length} skills)
  Memory:  ${memoryDir} (4 files)
  Vault:   ${vaultPath} (${vaultDirs.length} folders)

Next steps:
  1. Open a terminal and start Claude Code
  2. Type /session-start for your first briefing
  3. Work on your projects as usual
  4. Type /retro to capture learnings
  5. Type /session-cleanup when you're done

Skills available:
  /session-start      — Instant project briefing
  /session-handoff    — Save context for later
  /session-cleanup    — End-of-session sync
  /retro              — Capture what you learned
  /project-status     — Multi-project dashboard
  /audit-instructions — Check for config drift
  /index-codebase     — Document a project's structure
  /red-team           — Adversarial review of plans and designs
  /meeting-notes      — Process meeting notes with action items

Learn more: https://github.com/desertcache/agent-os
`);
  } finally {
    rl.close();
  }
}

main().catch((err) => {
  console.error('Setup failed:', err.message);
  process.exit(1);
});
