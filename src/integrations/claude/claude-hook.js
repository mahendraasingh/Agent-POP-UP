#!/usr/bin/env node

/**
 * Claude Code Hook Adapter for Agent Pop-Up (AgentDock)
 * 
 * Usage:
 *   node claude-hook.js "command to run" "workspace path"
 * 
 * Exits with code 0 if allowed by user, code 1 if denied.
 */

const http = require('http');

const command = process.argv[2] || 'npm test';
const cwd = process.argv[3] || process.cwd();
const port = process.env.AGENTDOCK_PORT || 49222;

const payload = JSON.stringify({
  agentId: 'claude-code',
  agentName: 'Claude Code',
  category: 'command_permission',
  title: 'Execute Command',
  description: `Claude Code is requesting permission to execute: ${command}`,
  workspacePath: cwd,
  payload: {
    command,
    cwd,
  },
  supportedActions: ['allow', 'deny', 'dismiss'],
  timeoutMs: 180000,
});

const req = http.request(
  {
    hostname: '127.0.0.1',
    port,
    path: '/api/v1/requests?wait=true',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload),
    },
    timeout: 180000,
  },
  (res) => {
    let body = '';
    res.on('data', (chunk) => (body += chunk));
    res.on('end', () => {
      try {
        const result = JSON.parse(body);
        if (result.allowed) {
          console.log(`[AgentDock] Permission GRANTED for command: ${command}`);
          process.exit(0);
        } else {
          console.warn(`[AgentDock] Permission DENIED for command: ${command}`);
          process.exit(1);
        }
      } catch (err) {
        console.error('[AgentDock] Error parsing response:', err);
        process.exit(1);
      }
    });
  }
);

req.on('error', (err) => {
  // If Agent Pop-Up is not currently running, fall back gracefully
  console.warn(`[AgentDock] Companion not responding (${err.message}). Defaulting to standard prompt.`);
  process.exit(0);
});

req.write(payload);
req.end();
