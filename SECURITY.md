# Security Policy & Safeguards

## Overview
**Agent Pop-Up** operates as a privileged desktop utility that interacts with terminal processes, developers' file operations, and AI coding assistants. Because it can display and authorize execution commands, security is foundational to its design.

---

## Security Principles

### 1. Isolated Contexts
- Electron's `contextIsolation` is permanently **enabled**.
- `nodeIntegration` is permanently **disabled** in all renderer processes.
- The renderer communicates strictly via typed APIs exposed in `preload.ts` through `contextBridge`.

### 2. No Blind or Blanket Approvals
- The application will **never** automatically auto-approve pending actions without explicit user action or strict user-configured rules.
- Dismissing a notification or closing the popup hides the UI alert; it **never** grants permission or triggers approval.

### 3. Destruction Awareness & High-Risk Highlighting
- Any terminal command matching destructive patterns (e.g. `rm -rf`, `DROP TABLE`, `git reset --hard`, `del /s /q`, `mkfs`, force pushes) is explicitly flagged with high-visibility caution tags and requires explicit confirmation.

### 4. Loopback Local Only
- The ingestion listener binds strictly to `127.0.0.1` (loopback interface).
- Requests from external network interfaces or public IPs are rejected.
- Authentication tokens or random session keys protect local HTTP/socket endpoints from cross-origin browser exploitation (CORS + Host verification).

### 5. Sensitive Data Sanitization
- Local activity history excludes sensitive tokens, authorization headers, and environment variables matching `*TOKEN*`, `*KEY*`, `*SECRET*`, `*PASSWORD*`.
- Users can clear their local activity history at any time with one click.
- Zero remote telemetry: no external cloud servers receive any command or conversation telemetry.
