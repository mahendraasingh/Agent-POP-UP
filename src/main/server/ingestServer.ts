import http from 'http';
import { RequestManager } from '../queue/requestManager';
import { ActionType } from '../../shared/types';

export class IngestServer {
  private server: http.Server | null = null;
  private port: number = 49222;
  private requestManager: RequestManager;

  constructor(requestManager: RequestManager, port: number = 49222) {
    this.requestManager = requestManager;
    this.port = port;
  }

  public start(): Promise<number> {
    return new Promise((resolve, reject) => {
      this.server = http.createServer((req, res) => {
        // Enforce loopback security
        const remoteIp = req.socket.remoteAddress;
        if (remoteIp !== '127.0.0.1' && remoteIp !== '::1' && remoteIp !== '::ffff:127.0.0.1') {
          res.writeHead(403, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Forbidden: Loopback only' }));
          return;
        }

        // Enable CORS for localhost
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

        if (req.method === 'OPTIONS') {
          res.writeHead(204);
          res.end();
          return;
        }

        const url = new URL(req.url || '/', `http://127.0.0.1:${this.port}`);

        // GET /api/v1/health
        if (req.method === 'GET' && url.pathname === '/api/v1/health') {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            status: 'ok',
            service: 'Agent Pop-Up Host',
            version: '0.1.0',
            pendingRequests: this.requestManager.getPendingRequests().length,
            connectedAgents: this.requestManager.getAllAgents().length,
          }));
          return;
        }

        // POST /api/v1/requests
        if (req.method === 'POST' && url.pathname === '/api/v1/requests') {
          let body = '';
          req.on('data', chunk => {
            body += chunk;
            if (body.length > 1024 * 512) { // 512KB max
              res.writeHead(413, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'Payload too large' }));
              req.destroy();
            }
          });

          req.on('end', () => {
            try {
              const data = JSON.parse(body);
              const waitForResponse = url.searchParams.get('wait') === 'true' || data.wait === true;

              if (waitForResponse) {
                // Long-poll: Hold connection open until user clicks Allow/Deny or timeout
                this.requestManager.addRequest(data, (decision: { action: ActionType; input?: string }) => {
                  if (!res.writableEnded) {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({
                      status: 'resolved',
                      decision: decision.action,
                      input: decision.input,
                      allowed: decision.action === 'allow',
                    }));
                  }
                });
              } else {
                const created = this.requestManager.addRequest(data);
                res.writeHead(201, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                  status: 'queued',
                  requestId: created.id,
                }));
              }
            } catch (err: unknown) {
              const message = err instanceof Error ? err.message : 'Invalid JSON';
              res.writeHead(400, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'Malformed JSON payload', details: message }));
            }
          });
          return;
        }

        // 404
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Not found' }));
      });

      this.server.on('error', (err: NodeJS.ErrnoException) => {
        if (err.code === 'EADDRINUSE') {
          console.warn(`Port ${this.port} in use, trying ${this.port + 1}`);
          this.port += 1;
          this.server?.listen(this.port, '127.0.0.1');
        } else {
          reject(err);
        }
      });

      this.server.listen(this.port, '127.0.0.1', () => {
        console.log(`[AgentDock] Ingest server listening at http://127.0.0.1:${this.port}`);
        resolve(this.port);
      });
    });
  }

  public stop(): Promise<void> {
    return new Promise((resolve) => {
      if (this.server) {
        this.server.close(() => resolve());
      } else {
        resolve();
      }
    });
  }

  public getPort(): number {
    return this.port;
  }
}
