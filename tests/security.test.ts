import { describe, it, expect } from 'vitest';
import { RequestManager } from '../src/main/queue/requestManager';

describe('Security & Destructive Operation Guard', () => {
  const manager = new RequestManager();

  const destructiveCommands = [
    'rm -rf /',
    'rm -rf ./node_modules',
    'git reset --hard HEAD~1',
    'git push --force origin main',
    'git push -f origin main',
    'git clean -fd',
    'del /s /q C:\\Windows',
    'DROP DATABASE production;',
    'DROP TABLE users;',
    'TRUNCATE TABLE accounts;',
  ];

  const safeCommands = [
    'git status',
    'npm test',
    'git diff',
    'cargo check',
    'python main.py',
    'echo "hello world"',
    'tsc --noEmit',
  ];

  destructiveCommands.forEach((cmd) => {
    it(`flags destructive command: ${cmd}`, () => {
      const req = manager.addRequest({
        title: 'Run script',
        payload: { command: cmd },
      });
      expect(req.payload.destructive).toBe(true);
      expect(req.payload.riskReason).toBeDefined();
    });
  });

  safeCommands.forEach((cmd) => {
    it(`allows safe command without flag: ${cmd}`, () => {
      const req = manager.addRequest({
        title: 'Run script',
        payload: { command: cmd },
      });
      expect(req.payload.destructive).toBe(false);
    });
  });

  it('guarantees dismissing a request never approves the underlying action', () => {
    let resolved: any = null;
    const req = manager.addRequest({
      title: 'Pending Action',
    }, (val) => {
      resolved = val;
    });

    manager.dismiss(req.id);
    const updated = manager.getRequest(req.id);
    expect(updated?.status).toBe('dismissed');
    expect(resolved?.action).toBe('dismiss');
    expect(resolved?.action).not.toBe('allow');
  });
});
