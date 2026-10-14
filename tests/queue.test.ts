import { describe, it, expect, beforeEach } from 'vitest';
import { RequestManager } from '../src/main/queue/requestManager';

describe('RequestManager Queue & Lifecycle', () => {
  let manager: RequestManager;

  beforeEach(() => {
    manager = new RequestManager();
  });

  it('initializes with default seed agents', () => {
    const agents = manager.getAllAgents();
    expect(agents.length).toBeGreaterThanOrEqual(2);
    expect(agents.some(a => a.id === 'claude-code')).toBe(true);
    expect(agents.some(a => a.id === 'antigravity')).toBe(true);
  });

  it('adds an incoming request and marks pending status', () => {
    const req = manager.addRequest({
      agentId: 'claude-code',
      agentName: 'Claude Code',
      title: 'Run test',
      payload: { command: 'npm test' },
    });

    expect(req.id).toBeDefined();
    expect(req.status).toBe('pending');
    expect(req.payload.destructive).toBe(false);
    expect(manager.getPendingRequests().length).toBe(1);
  });

  it('detects destructive terminal commands automatically', () => {
    const req = manager.addRequest({
      agentId: 'claude-code',
      title: 'Hard reset',
      payload: { command: 'git reset --hard HEAD' },
    });

    expect(req.payload.destructive).toBe(true);
    expect(req.payload.riskReason).toBeDefined();
  });

  it('resolves request to approved on allow action', () => {
    let resolvedValue: any = null;
    const req = manager.addRequest({
      agentId: 'claude-code',
      title: 'Compile assets',
    }, (val) => {
      resolvedValue = val;
    });

    const success = manager.respond(req.id, 'allow');
    expect(success).toBe(true);

    const updated = manager.getRequest(req.id);
    expect(updated?.status).toBe('approved');
    expect(updated?.userResponse?.action).toBe('allow');
    expect(resolvedValue).toEqual({ action: 'allow', input: undefined });
    expect(manager.getPendingRequests().length).toBe(0);
  });

  it('resolves request to denied on deny action', () => {
    let resolvedValue: any = null;
    const req = manager.addRequest({
      agentId: 'claude-code',
      title: 'Delete files',
    }, (val) => {
      resolvedValue = val;
    });

    manager.respond(req.id, 'deny');
    const updated = manager.getRequest(req.id);
    expect(updated?.status).toBe('denied');
    expect(resolvedValue?.action).toBe('deny');
  });

  it('dismisses request without approving or denying', () => {
    const req = manager.addRequest({
      agentId: 'antigravity',
      title: 'Notification alert',
    });

    manager.dismiss(req.id);
    const updated = manager.getRequest(req.id);
    expect(updated?.status).toBe('dismissed');
  });

  it('clears resolved history but preserves pending requests', () => {
    const r1 = manager.addRequest({ title: 'Pending Task' });
    const r2 = manager.addRequest({ title: 'Completed Task' });
    manager.respond(r2.id, 'allow');

    expect(manager.getAllRequests().length).toBe(2);
    manager.clearHistory();

    const remaining = manager.getAllRequests();
    expect(remaining.length).toBe(1);
    expect(remaining[0].id).toBe(r1.id);
  });
});
