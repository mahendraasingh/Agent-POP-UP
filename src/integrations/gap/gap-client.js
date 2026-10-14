#!/usr/bin/env node

/**
 * Generic Agent Protocol (GAP) CLI Client
 * 
 * Usage:
 *   node gap-client.js --agent "MyAgent" --title "Deploy Staging" --cmd "git push staging main" [--wait]
 */

const http = require('http');

const args = process.argv.slice(2);
let agentName = 'Custom Agent';
let agentId = 'generic-agent';
let title = 'Action Required';
let command = '';
let question = '';
let wait = false;
let category = 'command_permission';

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--agent' && args[i + 1]) agentName = args[++i];
  if (args[i] === '--id' && args[i + 1]) agentId = args[++i];
  if (args[i] === '--title' && args[i + 1]) title = args[++i];
  if (args[i] === '--cmd' && args[i + 1]) command = args[++i];
  if (args[i] === '--question' && args[i + 1]) { question = args[++i]; category = 'user_question'; }
  if (args[i] === '--wait') wait = true;
}

const port = process.env.AGENTDOCK_PORT || 49222;

const payload = JSON.stringify({
  agentId,
  agentName,
  category,
  title,
  workspacePath: process.cwd(),
  payload: {
    command: command || undefined,
    question: question || undefined,
  },
  supportedActions: ['allow', 'deny', 'dismiss'],
});

const req = http.request(
  {
    hostname: '127.0.0.1',
    port,
    path: `/api/v1/requests${wait ? '?wait=true' : ''}`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload),
    },
  },
  (res) => {
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => {
      console.log(`[AgentDock Response]:`, body);
      try {
        const parsed = JSON.parse(body);
        if (wait && !parsed.allowed) {
          process.exit(1);
        }
      } catch {}
      process.exit(0);
    });
  }
);

req.on('error', (err) => {
  console.error('[AgentDock Error]:', err.message);
  process.exit(1);
});

req.write(payload);
req.end();
