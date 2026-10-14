import { contextBridge, ipcRenderer } from 'electron';
import { 
  AgentRequest, 
  AgentInfo, 
  AgentDockSettings, 
  ActionType, 
  IPC_CHANNELS 
} from '../shared/types';

export interface AgentDockAPI {
  // Window actions
  minimize: () => Promise<void>;
  hide: () => Promise<void>;
  show: () => Promise<void>;
  toggleExpand: (expand?: boolean) => Promise<boolean>;
  setMode: (mode: import('../shared/types').WindowViewMode) => Promise<import('../shared/types').WindowViewMode>;
  getMode: () => Promise<import('../shared/types').WindowViewMode>;
  setAlwaysOnTop: (alwaysOnTop: boolean) => Promise<void>;
  getBounds: () => Promise<{ x: number; y: number; width: number; height: number }>;

  // Requests
  getRequests: () => Promise<AgentRequest[]>;
  respondToRequest: (id: string, action: ActionType, input?: string) => Promise<boolean>;
  dismissRequest: (id: string) => Promise<boolean>;
  clearHistory: () => Promise<void>;
  onRequestUpdate: (callback: (requests: AgentRequest[]) => void) => () => void;

  // Agents
  getAgents: () => Promise<AgentInfo[]>;
  onAgentUpdate: (callback: (agents: AgentInfo[]) => void) => () => void;

  // Settings
  getSettings: () => Promise<AgentDockSettings>;
  saveSettings: (settings: Partial<AgentDockSettings>) => Promise<AgentDockSettings>;
  onSettingsUpdate: (callback: (settings: AgentDockSettings) => void) => () => void;

  // System
  openWorkspace: (path: string) => Promise<void>;
}

const api: AgentDockAPI = {
  minimize: () => ipcRenderer.invoke(IPC_CHANNELS.WINDOW_MINIMIZE),
  hide: () => ipcRenderer.invoke(IPC_CHANNELS.WINDOW_HIDE),
  show: () => ipcRenderer.invoke(IPC_CHANNELS.WINDOW_SHOW),
  toggleExpand: (expand) => ipcRenderer.invoke(IPC_CHANNELS.WINDOW_TOGGLE_EXPAND, expand),
  setMode: (mode) => ipcRenderer.invoke(IPC_CHANNELS.WINDOW_SET_MODE, mode),
  getMode: () => ipcRenderer.invoke(IPC_CHANNELS.WINDOW_GET_MODE),
  setAlwaysOnTop: (alwaysOnTop) => ipcRenderer.invoke(IPC_CHANNELS.WINDOW_SET_ALWAYS_ON_TOP, alwaysOnTop),
  getBounds: () => ipcRenderer.invoke(IPC_CHANNELS.WINDOW_GET_BOUNDS),

  getRequests: () => ipcRenderer.invoke(IPC_CHANNELS.REQUEST_GET_ALL),
  respondToRequest: (id, action, input) => ipcRenderer.invoke(IPC_CHANNELS.REQUEST_RESPOND, { id, action, input }),
  dismissRequest: (id) => ipcRenderer.invoke(IPC_CHANNELS.REQUEST_DISMISS, id),
  clearHistory: () => ipcRenderer.invoke(IPC_CHANNELS.REQUEST_CLEAR_HISTORY),
  onRequestUpdate: (callback) => {
    const handler = (_event: Electron.IpcRendererEvent, requests: AgentRequest[]) => callback(requests);
    ipcRenderer.on(IPC_CHANNELS.REQUEST_UPDATED, handler);
    return () => ipcRenderer.removeListener(IPC_CHANNELS.REQUEST_UPDATED, handler);
  },

  getAgents: () => ipcRenderer.invoke(IPC_CHANNELS.AGENTS_GET_ALL),
  onAgentUpdate: (callback) => {
    const handler = (_event: Electron.IpcRendererEvent, agents: AgentInfo[]) => callback(agents);
    ipcRenderer.on(IPC_CHANNELS.AGENTS_UPDATED, handler);
    return () => ipcRenderer.removeListener(IPC_CHANNELS.AGENTS_UPDATED, handler);
  },

  getSettings: () => ipcRenderer.invoke(IPC_CHANNELS.SETTINGS_GET),
  saveSettings: (settings) => ipcRenderer.invoke(IPC_CHANNELS.SETTINGS_SAVE, settings),
  onSettingsUpdate: (callback) => {
    const handler = (_event: Electron.IpcRendererEvent, settings: AgentDockSettings) => callback(settings);
    ipcRenderer.on(IPC_CHANNELS.SETTINGS_UPDATED, handler);
    return () => ipcRenderer.removeListener(IPC_CHANNELS.SETTINGS_UPDATED, handler);
  },

  openWorkspace: (path) => ipcRenderer.invoke(IPC_CHANNELS.OPEN_WORKSPACE, path),
};

contextBridge.exposeInMainWorld('agentDockAPI', api);
