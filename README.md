# Agent Pop-Up (AgentDock)

> **One floating desktop interface. Multiple AI agents. Real request handling. Less context switching.**

[![GitHub Repository](https://img.shields.io/badge/GitHub-mahendraasingh%2FAgent--POP--UP-blue.svg)](https://github.com/mahendraasingh/Agent-POP-UP)
[![Platform](https://img.shields.io/badge/Platform-Windows%2010%2F11-informational.svg)]()
[![License](https://img.shields.io/badge/License-MIT-green.svg)]()

---

## 🎯 The Problem
When working with AI coding agents (such as Claude Code, Antigravity, and autonomous terminal agents), developers waste significant time and focus context-switching across multiple windows whenever an agent asks for:
- Permission to run a terminal command.
- Confirmation for file modifications.
- Input or clarification on architectural decisions.
- Notification of task completion or blocker errors.

## 🚀 The Solution
**Agent Pop-Up** is an always-accessible, lightweight Windows desktop companion that floats unobtrusively on your screen (top-left by default), aggregates real-time requests from your agents, and lets you inspect and respond directly without leaving your current workspace.

---

## ✨ Features
- 🪟 **Floating Desktop Window**: Compact, draggable, frameless, and always-on-top with multi-monitor DPI support.
- ⚡ **Instant 1-Click Actions**: Approve (`Allow`), Reject (`Deny`), or `Dismiss` requests in milliseconds.
- 📬 **Unified Agent Inbox**: Comprehensive dashboard listing active, waiting, and completed requests across all agents.
- 🛡️ **Destructive Command Detection**: Automatically highlights high-risk terminal commands (`rm -rf`, `DROP`, force push).
- 🔌 **Multiple Integrations**: Native support for Claude Code hook integration, Antigravity companion mode, and Generic Agent Protocol (GAP) via local loopback.
- 🔒 **Zero Remote Telemetry**: Strict local-first architecture. No external cloud servers or accounts required.

---

## 📚 Documentation
- [System Architecture](ARCHITECTURE.md)
- [Development Roadmap](ROADMAP.md)
- [Security Model & Safeguards](SECURITY.md)
- [Agent Integrations](INTEGRATIONS.md)

---

## 🛠️ Quick Start

```powershell
# Install dependencies
npm install

# Run in development mode
npm run dev

# Run test suite
npm test

# Build production bundle
npm run build
```

---

## 📄 License
MIT © [Mahendra Singh](https://github.com/mahendraasingh)
