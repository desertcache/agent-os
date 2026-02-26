/**
 * session-activity-logger.js
 * PostToolUse hook on Bash: logs git commit/push commands to activity file.
 * Must exit in <50ms for non-matching commands.
 * Reads stdin JSON for tool_input.command.
 *
 * Part of agent-os — https://github.com/desertcache/agent-os
 */

const fs = require('fs');
const path = require('path');

const CACHE_DIR = path.join(process.env.USERPROFILE || process.env.HOME, '.claude', 'cache');
const LOG_FILE = path.join(CACHE_DIR, 'session-activity.log');

function main() {
  try {
    const input = fs.readFileSync(0, 'utf8');
    const parsed = JSON.parse(input);
    const command = (parsed.tool_input && parsed.tool_input.command) || '';

    // Quick exit for non-matching commands
    const isCommit = command.includes('git commit');
    const isPush = command.includes('git push');
    if (!isCommit && !isPush) {
      process.exit(0);
    }

    // Ensure cache dir
    if (!fs.existsSync(CACHE_DIR)) {
      fs.mkdirSync(CACHE_DIR, { recursive: true });
    }

    const timestamp = new Date().toISOString().slice(0, 19);
    let logLine;

    if (isCommit) {
      // Try to extract commit message from -m "..." or -m '...' or heredoc
      let message = '';
      const mFlag = command.match(/-m\s+["']([^"']+)["']/);
      const heredoc = command.match(/<<'?EOF'?\n([\s\S]*?)\nEOF/);
      if (mFlag) {
        message = mFlag[1];
      } else if (heredoc) {
        message = heredoc[1].trim().split('\n')[0];
      } else {
        message = '(message not parsed)';
      }
      logLine = `${timestamp} | git commit | ${message.slice(0, 80)}`;
    } else {
      logLine = `${timestamp} | git push | ${command.slice(0, 80)}`;
    }

    fs.appendFileSync(LOG_FILE, logLine + '\n');
    process.exit(0);
  } catch {
    // Never fail the tool call
    process.exit(0);
  }
}

main();
