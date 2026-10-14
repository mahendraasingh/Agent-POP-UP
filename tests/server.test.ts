import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import http from 'http';
import { RequestManager } from '../src/main/queue/requestManager';
import { IngestServer } from '../src/main/server/ingestServer';

describe('IngestServer HTTP API', () => {
  let manager: RequestManager;
  let server: IngestServer;
  let port: number;

  beforeAll(async () => {
    manager = new RequestManager();
    server = new IngestServer(manager, 49299);
    port = await server.start();
  });

  afterAll(async () => {
    await server.stop();
  });

  function postJson(path: string, data: any): Promise<{ status: number; body: any }> {
    return new Promise((resolve, reject) => {
      const payload = JSON.stringify(data);
      const req = http.request(
        {
          hostname: '127.0.0.1',
          port,
          path,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(payload),
          },
        },
        (res) => {
          let body = '';
          res.on('data', (chunk) => (body += chunk));
          res.on('end', () => {
            try {
              resolve({ status: res.statusCode || 0, body: JSON.parse(body) });
            } catch {
              resolve({ status: res.statusCode || 0, body });
            }
          });
        }
      );
      req.on('error', reject);
      req.write(payload);
      req.end();
    });
  }

  function getJson(path: string): Promise<{ status: number; body: any }> {
    return new Promise((resolve, reject) => {
      const req = http.get(`http://127.0.0.1:${port}${path}`, (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          resolve({ status: res.statusCode || 0, body: JSON.parse(body) });
        });
      });
      req.on('error', reject);
    });
  }

  it('responds with 200 and health info on GET /api/v1/health', async () => {
    const res = await getJson('/api/v1/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.service).toBe('Agent Pop-Up Host');
  });

  it('queues a request asynchronously on POST /api/v1/requests', async () => {
    const res = await postJson('/api/v1/requests', {
      agentId: 'claude-code',
      title: 'Run lint check',
      payload: { command: 'npm run lint' },
    });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe('queued');
    expect(res.body.requestId).toBeDefined();

    const pending = manager.getPendingRequests();
    expect(pending.some((r) => r.id === res.body.requestId)).toBe(true);
  });

  it('handles long-polling resolution on POST /api/v1/requests?wait=true', async () => {
    // Start long poll request in background
    const requestPromise = postJson('/api/v1/requests?wait=true', {
      agentId: 'claude-code',
      title: 'Execute build command',
      payload: { command: 'npm run build' },
    });

    // Wait 50ms for server to register request
    await new Promise((r) => setTimeout(r, 50));

    const pending = manager.getPendingRequests();
    const current = pending.find((r) => r.title === 'Execute build command');
    expect(current).toBeDefined();

    // User approves in UI
    manager.respond(current!.id, 'allow');

    const res = await requestPromise;
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('resolved');
    expect(res.body.allowed).toBe(true);
    expect(res.body.decision).toBe('allow');
  });
});
