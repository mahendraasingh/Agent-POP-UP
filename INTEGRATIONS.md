# Agent Integrations Specification

Agent Pop-Up connects with multiple AI coding tools to capture requests and route decisions.

---

## 1. Claude Code Integration

### Integration Strategy
Claude Code uses a hook architecture and notification commands to inform users of actions needing permission:
- **Permission Hooks**: Hooks triggered before executing tool actions (Bash commands, file modifications, web fetching).
- **Notification Hook**: Triggered when Claude Code needs attention or finishes long operations.

### Protocol Flow
1. Claude Code invokes the AgentDock hook script configured in `~/.claude/settings.json` or project hooks.
2. The hook delivers an HTTP POST request to `http://127.0.0.1:49222/api/v1/requests` with payload:
   ```json
   {
     "agentId": "claude-code",
     "agentName": "Claude Code",
     "category": "command_permission",
     "title": "Execute Bash Command",
     "description": "Claude wants to run npm test",
     "payload": {
       "command": "npm test",
       "cwd": "d:/project"
     },
     "supportedActions": ["allow", "deny", "dismiss"],
     "timeoutMs": 300000
   }
   ```
3. The hook holds the HTTP connection open (long poll) or awaits a callback.
4. When the developer clicks **Allow** or **Deny** on the Agent Pop-Up, the response is returned immediately to the hook process, allowing Claude Code to resume execution seamlessly.

---

## 2. Antigravity IDE Integration

### Integration Strategy
- **Workspace Awareness**: Detects active workspace paths (`d:\agent pop up`).
- **Focus Restoration**: When the user clicks "Open in IDE" or responds to an Antigravity prompt, the companion uses native Windows APIs to bring the Antigravity window to the foreground.
- **IPC Event Streaming**: Receives prompt and completion notifications through the local AgentDock daemon.

---

## 3. Generic Agent Protocol (GAP)

Any custom agent, Python script, or CI pipeline can emit events to Agent Pop-Up using simple CLI calls or curl:

```bash
# Ask permission
curl -X POST http://127.0.0.1:49222/api/v1/requests \
  -H "Content-Type: application/json" \
  -d '{"agentId":"my-script","title":"Deploy to Staging","category":"approval","supportedActions":["allow","deny"]}'
```
