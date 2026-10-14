import { EventEmitter } from 'events';
import { 
  AgentRequest, 
  AgentInfo, 
  ActionType, 
  RequestStatus 
} from '../../shared/types';

export interface PendingResponseCallback {
  resolve: (value: { action: ActionType; input?: string }) => void;
  reject: (reason: Error) => void;
  timeoutTimer: NodeJS.Timeout;
}

export class RequestManager extends EventEmitter {
  private requests: Map<string, AgentRequest> = new Map();
  private agents: Map<string, AgentInfo> = new Map();
  private callbacks: Map<string, PendingResponseCallback> = new Map();

  constructor() {
    super();
    this.seedDefaultAgents();
  }

  private seedDefaultAgents() {
    this.registerAgent({
      id: 'claude-code',
      name: 'Claude Code',
      type: 'claude_code',
      status: 'idle',
      lastSeen: Date.now(),
      pendingCount: 0,
      totalHandled: 0,
      description: 'Official Claude Code CLI companion hook',
    });

    this.registerAgent({
      id: 'antigravity',
      name: 'Antigravity IDE',
      type: 'antigravity',
      status: 'connected',
      lastSeen: Date.now(),
      pendingCount: 0,
      totalHandled: 0,
      description: 'Antigravity IDE workspace partner',
    });
  }

  public registerAgent(agent: AgentInfo): void {
    this.agents.set(agent.id, agent);
    this.emit('agents-updated', this.getAllAgents());
  }

  public getAllAgents(): AgentInfo[] {
    const list = Array.from(this.agents.values());
    for (const a of list) {
      a.pendingCount = this.getPendingRequestsByAgent(a.id).length;
    }
    return list;
  }

  public getAllRequests(): AgentRequest[] {
    return Array.from(this.requests.values()).sort((a, b) => b.createdAt - a.createdAt);
  }

  public getPendingRequests(): AgentRequest[] {
    return this.getAllRequests().filter(r => r.status === 'pending');
  }

  public getPendingRequestsByAgent(agentId: string): AgentRequest[] {
    return this.getPendingRequests().filter(r => r.agentId === agentId);
  }

  public getRequest(id: string): AgentRequest | undefined {
    return this.requests.get(id);
  }

  public addRequest(raw: Partial<AgentRequest>, callback?: (res: { action: ActionType; input?: string }) => void): AgentRequest {
    const id = raw.id || `req_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    
    // Check if destructive
    const isDestructive = this.checkDestructive(raw.payload?.command || '');
    const riskReason = isDestructive ? 'Potential destructive file/system operation' : undefined;

    const request: AgentRequest = {
      id,
      agentId: raw.agentId || 'generic',
      agentName: raw.agentName || 'AI Agent',
      agentIcon: raw.agentIcon,
      sessionTitle: raw.sessionTitle,
      workspacePath: raw.workspacePath,
      category: raw.category || 'command_permission',
      title: raw.title || 'Agent Action Requested',
      description: raw.description || '',
      payload: {
        ...raw.payload,
        destructive: raw.payload?.destructive ?? isDestructive,
        riskReason: raw.payload?.riskReason ?? riskReason,
      },
      supportedActions: raw.supportedActions || ['allow', 'deny', 'dismiss'],
      status: 'pending',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      timeoutMs: raw.timeoutMs || 180000, // 3 minutes default
    };

    // Update agent status & lastSeen
    const agent = this.agents.get(request.agentId) || {
      id: request.agentId,
      name: request.agentName,
      type: 'generic' as const,
      status: 'connected' as const,
      lastSeen: Date.now(),
      pendingCount: 0,
      totalHandled: 0,
    };
    agent.status = 'connected';
    agent.lastSeen = Date.now();
    this.agents.set(request.agentId, agent);

    this.requests.set(id, request);

    // If there's a response callback, register timeout
    if (callback) {
      const timeoutTimer = setTimeout(() => {
        this.expireRequest(id);
      }, request.timeoutMs);

      this.callbacks.set(id, {
        resolve: callback,
        reject: () => {},
        timeoutTimer,
      });
    }

    this.emit('requests-updated', this.getAllRequests());
    this.emit('agents-updated', this.getAllAgents());
    return request;
  }

  public respond(id: string, action: ActionType, input?: string): boolean {
    const req = this.requests.get(id);
    if (!req) return false;
    if (req.status !== 'pending' && action !== 'dismiss') return false;

    let newStatus: RequestStatus = 'pending';
    if (action === 'allow') newStatus = 'approved';
    else if (action === 'deny') newStatus = 'denied';
    else if (action === 'submit') newStatus = 'submitted';
    else if (action === 'dismiss') newStatus = 'dismissed';

    req.status = newStatus;
    req.updatedAt = Date.now();
    req.userResponse = {
      action,
      input,
      respondedAt: Date.now(),
    };

    // Update agent stats
    const agent = this.agents.get(req.agentId);
    if (agent) {
      agent.totalHandled += 1;
      agent.lastSeen = Date.now();
    }

    // Trigger callback if registered
    const cb = this.callbacks.get(id);
    if (cb) {
      clearTimeout(cb.timeoutTimer);
      this.callbacks.delete(id);
      cb.resolve({ action, input });
    }

    this.emit('requests-updated', this.getAllRequests());
    this.emit('agents-updated', this.getAllAgents());
    return true;
  }

  public dismiss(id: string): boolean {
    return this.respond(id, 'dismiss');
  }

  public expireRequest(id: string): void {
    const req = this.requests.get(id);
    if (!req || req.status !== 'pending') return;

    req.status = 'expired';
    req.updatedAt = Date.now();

    const cb = this.callbacks.get(id);
    if (cb) {
      clearTimeout(cb.timeoutTimer);
      this.callbacks.delete(id);
      cb.resolve({ action: 'deny' });
    }

    this.emit('requests-updated', this.getAllRequests());
    this.emit('agents-updated', this.getAllAgents());
  }

  public clearHistory(): void {
    const pending = Array.from(this.requests.values()).filter(r => r.status === 'pending');
    this.requests.clear();
    for (const p of pending) {
      this.requests.set(p.id, p);
    }
    this.emit('requests-updated', this.getAllRequests());
  }

  private checkDestructive(command: string): boolean {
    const lower = command.toLowerCase();
    const riskyPatterns = [
      'rm -rf',
      'rm -f',
      'del /f',
      'del /s /q',
      'format ',
      'git reset --hard',
      'git push --force',
      'git push -f',
      'git clean -fd',
      'drop database',
      'drop table',
      'truncate table',
      'mkfs',
      'dd if=',
    ];
    return riskyPatterns.some(pat => lower.includes(pat));
  }
}
