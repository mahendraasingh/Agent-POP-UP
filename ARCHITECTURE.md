# Agent Pop-Up (AgentDock) Architecture

## Overview
**Agent Pop-Up** is a lightweight, high-performance Windows desktop companion designed to centralize and streamline interactions from autonomous AI coding agents (such as Claude Code, Antigravity, and extensible third-party agents). It removes window-switching friction by presenting actionable requests—such as terminal command executions, file edits, questions, and decisions—in a persistent, non-intrusive floating desktop interface.

---

## Core Product Principle
> **One floating desktop interface. Multiple AI agents. Real request handling. Less context switching.**

---

## High-Level Architecture Diagram

```
+-------------------------------------------------------------------------+
|                              Desktop Host                               |
|                                                                         |
|  +--------------------------+       IPC        +---------------------+  |
|  |     Electron Renderer    | <=============>  | Electron Main       |  |
|  |  (React + TypeScript)    | (ContextBridge)  | Process (Node.js)   |  |
|  |                          |                  |                     |  |
|  |  - Floating Card / Panel |                  | - Window Lifecycle  |  |
|  |  - Unified Agent Inbox   |                  | - System Tray & Hotkey |
|  |  - Agent Health Overview |                  | - Request Manager   |  |
|  |  - Request Detail Modal  |                  | - Persistence Store |  |
|  |  - Settings & History    |                  | - Security Guard    |  |
|  +--------------------------+                  +----------+----------+  |
|                                                           |             |
|                                                           | Internal    |
|                                                           | API / Hooks |
|                                                           v             |
|                                                +---------------------+  |
|                                                | Integration Adapter |  |
|                                                | Engine              |  |
|                                                | - Claude Code Hook  |  |
|                                                | - Antigravity Adptr |  |
|                                                | - HTTP / Socket IPC |  |
|                                                +----------+----------+  |
+-----------------------------------------------------------|-------------+
                                                            |
                                  Supported Agent Protocols v
                       +--------------------------------------------------+
                       | Claude Code CLI | Antigravity IDE | Custom Agent |
                       +--------------------------------------------------+
```

---

## Key Subsystems

### 1. Main Process (`src/main/`)
- **Window Management**: Controls the floating popup window, compact/expanded modes, multi-monitor bounds clamp, always-on-top, and screen corner positioning (top-left default).
- **System Tray & Global Shortcuts**: Tray icon with quick actions (Show/Hide, Inbox, Preferences, Quit) and configurable global hotkey (e.g. `Ctrl+Alt+Space` or `Alt+Shift+A`).
- **Request Manager (`src/main/queue/`)**: Normalizes events from agent adapters into standard request objects, handles deduplication, timeout tracking, state transitions (`pending`, `approved`, `rejected`, `submitted`, `dismissed`, `expired`), and emits updates to renderer.
- **Local Persistence (`src/main/store/`)**: Stores user preferences, window geometry, and sanitised local activity history.
- **Agent Server / Ingestion Layer (`src/main/server/`)**: Secure local IPC/HTTP loopback listener where agent hooks, plugins, or background scripts publish request events and receive synchronous or asynchronous decisions.

### 2. Preload Bridge (`src/preload/`)
- Implements strict Electron **Context Isolation** with `contextBridge.exposeInMainWorld('agentDockAPI', ...)`.
- Exposes only strongly-typed, schema-validated methods to the renderer.
- No direct Node.js or arbitrary shell execution capabilities are accessible from renderer.

### 3. Renderer (`src/renderer/`)
- Built with **React**, **TypeScript**, and modern **Tailwind CSS**.
- **Floating Compact Panel**: Instant glance at the highest-priority actionable request with 1-click Approve, Deny, Submit answer, or Dismiss.
- **Unified Agent Inbox**: Multi-tab or filtered list of all connected agents, pending approvals, waiting items, and completed/dismissed logs.
- **Agent Health Matrix**: Live status of active agents, connectivity health, active workspace/session IDs, and error troubleshooting.
- **Detail Modal**: Inspect full command payload, diff preview, cwd, and risk level (destructive operations flagged with prominent caution indicators).

### 4. Integration Adapters (`src/integrations/`)
- **Claude Code Adapter**: Integrates with Claude Code's notification/permission hook architecture, capturing tool execution approval requests and returning allowed/denied exit codes or responses.
- **Antigravity Adapter**: Interacts with local workspace metadata, notifications, and navigation hooks to refocus the IDE.
- **Generic Agent Protocol (GAP)**: JSON-over-HTTP/Unix Domain Socket/Named Pipe standard for any local CLI agent.

---

## Security Model
- **Strict Context Isolation & Disabled Node Integration** in the renderer.
- **Origin Validation**: Loopback-only communication (`127.0.0.1`), token/session verification.
- **No Blanket Automatic Approvals**: Requires deliberate user interaction. Dismissal never grants approval.
- **Zero Remote Telemetry**: All data remains strictly local on the user's machine.
