export type AgentCategory = 
  | 'command_permission'
  | 'file_operation'
  | 'user_question'
  | 'decision'
  | 'notification'
  | 'task_completed'
  | 'error_blocker';

export type RequestStatus = 
  | 'pending'
  | 'approved'
  | 'denied'
  | 'submitted'
  | 'dismissed'
  | 'expired'
  | 'failed';

export type ActionType = 'allow' | 'deny' | 'submit' | 'dismiss' | 'open_agent';

export interface AgentPayload {
  command?: string;
  cwd?: string;
  filePath?: string;
  diff?: string;
  question?: string;
  options?: string[];
  destructive?: boolean;
  riskReason?: string;
  details?: Record<string, unknown>;
}

export interface AgentRequest {
  id: string;
  agentId: string;
  agentName: string;
  agentIcon?: string;
  sessionTitle?: string;
  workspacePath?: string;
  category: AgentCategory;
  title: string;
  description: string;
  payload: AgentPayload;
  supportedActions: ActionType[];
  status: RequestStatus;
  createdAt: number;
  updatedAt: number;
  timeoutMs?: number;
  userResponse?: {
    action: ActionType;
    input?: string;
    respondedAt: number;
  };
}

export interface AgentInfo {
  id: string;
  name: string;
  type: 'claude_code' | 'antigravity' | 'generic';
  status: 'connected' | 'idle' | 'disconnected' | 'error';
  lastSeen: number;
  pendingCount: number;
  totalHandled: number;
  description?: string;
}

export interface AgentDockSettings {
  alwaysOnTop: boolean;
  startAtLogin: boolean;
  hotkey: string;
  theme: 'dark' | 'light' | 'system';
  soundEnabled: boolean;
  autoDismissSuccessMs: number;
  historyRetentionDays: number;
  windowPosition: { x: number; y: number };
  compactMode: boolean;
}

export const DEFAULT_SETTINGS: AgentDockSettings = {
  alwaysOnTop: true,
  startAtLogin: false,
  hotkey: 'CommandOrControl+Shift+Space',
  theme: 'dark',
  soundEnabled: true,
  autoDismissSuccessMs: 4000,
  historyRetentionDays: 14,
  windowPosition: { x: 24, y: 24 },
  compactMode: true,
};

export const IPC_CHANNELS = {
  // Window controls
  WINDOW_MINIMIZE: 'agentdock:window:minimize',
  WINDOW_HIDE: 'agentdock:window:hide',
  WINDOW_SHOW: 'agentdock:window:show',
  WINDOW_TOGGLE_EXPAND: 'agentdock:window:toggle-expand',
  WINDOW_SET_ALWAYS_ON_TOP: 'agentdock:window:set-always-on-top',
  WINDOW_GET_BOUNDS: 'agentdock:window:get-bounds',

  // Request queue
  REQUEST_GET_ALL: 'agentdock:requests:get-all',
  REQUEST_RESPOND: 'agentdock:requests:respond',
  REQUEST_DISMISS: 'agentdock:requests:dismiss',
  REQUEST_CLEAR_HISTORY: 'agentdock:requests:clear-history',
  REQUEST_UPDATED: 'agentdock:requests:updated',

  // Agents
  AGENTS_GET_ALL: 'agentdock:agents:get-all',
  AGENTS_UPDATED: 'agentdock:agents:updated',

  // Settings
  SETTINGS_GET: 'agentdock:settings:get',
  SETTINGS_SAVE: 'agentdock:settings:save',
  SETTINGS_UPDATED: 'agentdock:settings:updated',

  // System
  OPEN_WORKSPACE: 'agentdock:system:open-workspace',
} as const;
