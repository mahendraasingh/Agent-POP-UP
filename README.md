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
**Agent Pop-Up** is a small, beautiful, always-accessible **floating desktop icon (AI Companion Orb)** that sits directly on top of your normal desktop applications (top-left by default). You can continue coding in your IDE, terminal, or browser without switching windows.

When an agent needs your attention, the orb pulses with a live counter badge. Clicking the orb expands a compact, contextual request card right where you are. When you're done, it collapses back to the tiny floating icon.

---

## ✨ Features
- 🔮 **Floating Desktop Icon (Primary Interface)**: Extremely small 72×72px desktop footprint. Stays visible and accessible above normal windows without stealing focus.
- ⚡ **3-Tier Window Geometry**:
  - **Tier 1 (Orb)**: Minimal floating AI companion emblem with orbital breathing animations.
  - **Tier 2 (Panel)**: Compact 420×290px request card anchored to the icon for instant Allow / Deny / Question input.
  - **Tier 3 (Inbox)**: Full 740×560px search-enabled unified history, opened only on demand.
- 💬 **Interactive Question Responses**: Type and submit clarifications directly to agents without leaving your active window.
- 🛡️ **Destructive Command Detection**: Automatically highlights high-risk commands (`rm -rf`, force reset) with glowing crimson warnings.
- 🔌 **Multiple Agent Integrations**: Native support for Claude Code hook adapter, Antigravity assistant protocol, and Generic Agent Protocol (GAP) via local loopback (`127.0.0.1:49222`).
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
