# Agent Pop-Up (AgentDock) Implementation Roadmap

This document outlines the phased development plan for **Agent Pop-Up**. Every logical step is built, tested, reviewed, committed, pushed to GitHub, and verified.

---

## Phase 1: Repository Audit & Development Workflow Foundation
- [x] Verify Git remote (`https://github.com/mahendraasingh/Agent-POP-UP.git`) and branch tracking (`main`).
- [x] Document system architecture (`ARCHITECTURE.md`).
- [x] Establish security principles (`SECURITY.md`).
- [x] Create integration specifications (`INTEGRATIONS.md`).
- [x] Set up living roadmap (`ROADMAP.md`).
- [x] Create safe incremental synchronization script (`scripts/sync-check.mjs`).
- [x] Push Phase 1 checkpoint to GitHub and verify.

---

## Phase 2: Desktop Foundation & Project Scaffolding
- [x] Scaffold Electron + Vite + React + TypeScript desktop application structure.
- [x] Implement secure Electron main process with proper window lifecycle (frameless, floating top-left, draggable, always-on-top, multi-monitor clamping).
- [x] Implement strict preload bridge (`contextBridge`) with typed IPC contracts.
- [x] Configure Tailwind CSS / modern CSS styling system and dark-theme foundation.
- [x] Set up build & dev scripts (`npm run dev`, `npm run build`, `npm test`).
- [x] Verify local compilation and window rendering.
- [x] Push Phase 2 checkpoint to GitHub and verify.

---

## Phase 3: Floating Popup UI & Unified Agent Inbox
- [x] Build floating compact notification card with agent badge, project context, command/question display, and action buttons (Allow, Deny, Submit, Dismiss).
- [x] Implement expand/collapse modes (Floating Quick Action <-> Unified Inbox).
- [x] Build Unified Inbox with tabbed/filtered views (Pending, Waiting, Resolved, Dismissed).
- [x] Build Request Detail Modal for large commands, diffs, and risk analysis.
- [x] Add smooth micro-animations and keyboard navigation (`Esc` dismiss, `Enter` allow).
- [x] Push Phase 3 checkpoint to GitHub and verify.

---

## Phase 4: Request Lifecycle, Queue & State Engine
- [x] Define standardized agent event schemas and validation.
- [x] Implement local Request Queue Manager with deduplication and TTL expiration.
- [x] Implement state transitions (`pending` -> `approved` / `rejected` / `submitted` / `dismissed` / `expired`).
- [x] Implement local JSON storage for settings, window coordinates, and sanitized history.
- [x] Add comprehensive Vitest unit tests covering queue logic and state transitions.
- [x] Push Phase 4 checkpoint to GitHub and verify.

---

## Phase 5: Agent Ingestion & Claude Code Integration
- [x] Build local loopback ingestion server (`127.0.0.1`) with HMAC/token security for agent events.
- [x] Implement Claude Code integration hook adapter (permission hooks, notification hooks).
- [x] Support synchronous decision response and asynchronous status updates.
- [x] Create mock agent harness for automated integration testing.
- [x] Push Phase 5 checkpoint to GitHub and verify.

---

## Phase 6: Antigravity IDE Integration & Generic Agent Protocol
- [x] Implement Antigravity integration adapter with window focus and workspace context awareness.
- [x] Implement Generic Agent Protocol (GAP) CLI utility for custom agents / shell scripts.
- [x] Document integration configuration and hook setup in `INTEGRATIONS.md`.
- [x] Push Phase 6 checkpoint to GitHub and verify.

---

## Phase 7: Product Features, Tray, Shortcuts & Settings
- [ ] Implement Windows System Tray with context menu (Show/Hide, Inbox, Pause, Settings, Quit).
- [ ] Implement global shortcut registration (e.g. `Ctrl+Alt+Space`) to toggle popup.
- [ ] Build Settings UI (Always-on-top toggle, start at login, notification sound, history retention).
- [ ] Implement Activity History viewer with search and clear history functionality.
- [ ] Push Phase 7 checkpoint to GitHub and verify.

---

## Phase 8: Comprehensive Quality Assurance & Security Audit
- [ ] Write end-to-end integration tests for request handling lifecycle.
- [ ] Audit IPC messages, input sanitation, and destructive command warnings.
- [ ] Run test suite with full coverage validation.
- [ ] Push Phase 8 checkpoint to GitHub and verify.

---

## Phase 9: Production Packaging & Release Verification
- [ ] Configure `electron-builder` for Windows packaging (NSIS installer / portable executable).
- [ ] Validate production build pipeline (`npm run build`).
- [ ] Test packaged desktop application output.
- [ ] Update documentation with verified installation and usage instructions.
- [ ] Final sync and repository verification.
