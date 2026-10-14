import React, { useState, useEffect } from 'react';
import { 
  AgentRequest, 
  AgentInfo, 
  AgentDockSettings, 
  DEFAULT_SETTINGS, 
  ActionType 
} from '../../shared/types';
import { FloatingCard } from './components/FloatingCard';
import { UnifiedInbox } from './components/UnifiedInbox';
import { AgentOverview } from './components/AgentOverview';
import { RequestDetailsModal } from './components/RequestDetailsModal';
import { SettingsModal } from './components/SettingsModal';
import { 
  Minimize2, 
  Inbox, 
  Bot, 
  Sliders, 
  Minus, 
  ChevronDown, 
  ChevronUp, 
  Sparkles,
  Shield
} from 'lucide-react';

declare global {
  interface Window {
    agentDockAPI?: import('../../preload').AgentDockAPI;
  }
}

export const App: React.FC = () => {
  const [requests, setRequests] = useState<AgentRequest[]>([]);
  const [agents, setAgents] = useState<AgentInfo[]>([]);
  const [settings, setSettings] = useState<AgentDockSettings>(DEFAULT_SETTINGS);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'inbox' | 'agents'>('inbox');
  const [selectedRequest, setSelectedRequest] = useState<AgentRequest | null>(null);
  const [showSettings, setShowSettings] = useState<boolean>(false);

  useEffect(() => {
    if (window.agentDockAPI) {
      // Load initial state
      window.agentDockAPI.getRequests().then(setRequests);
      window.agentDockAPI.getAgents().then(setAgents);
      window.agentDockAPI.getSettings().then(setSettings);

      // Listen for push updates
      const unsubReq = window.agentDockAPI.onRequestUpdate(setRequests);
      const unsubAgents = window.agentDockAPI.onAgentUpdate(setAgents);
      const unsubSettings = window.agentDockAPI.onSettingsUpdate(setSettings);

      return () => {
        unsubReq();
        unsubAgents();
        unsubSettings();
      };
    } else {
      // Mock demo data when previewing in standard browser
      setRequests([
        {
          id: 'demo-1',
          agentId: 'claude-code',
          agentName: 'Claude Code',
          category: 'command_permission',
          title: 'Execute Test Suite',
          description: 'Claude wants to run the test suite to verify code changes',
          payload: {
            command: 'npm run test:unit -- --coverage',
            cwd: 'd:/agent pop up',
            destructive: false,
          },
          supportedActions: ['allow', 'deny', 'dismiss'],
          status: 'pending',
          createdAt: Date.now() - 30000,
          updatedAt: Date.now(),
        },
        {
          id: 'demo-2',
          agentId: 'antigravity',
          agentName: 'Antigravity IDE',
          category: 'command_permission',
          title: 'Git Force Clean Operation',
          description: 'Agent requested hard clean of uncommitted workspace state',
          payload: {
            command: 'git clean -fd && git reset --hard HEAD',
            cwd: 'd:/agent pop up',
            destructive: true,
            riskReason: 'Will discard all untracked and modified files',
          },
          supportedActions: ['allow', 'deny', 'dismiss'],
          status: 'pending',
          createdAt: Date.now() - 120000,
          updatedAt: Date.now(),
        },
      ]);

      setAgents([
        {
          id: 'claude-code',
          name: 'Claude Code',
          type: 'claude_code',
          status: 'connected',
          lastSeen: Date.now(),
          pendingCount: 1,
          totalHandled: 14,
        },
        {
          id: 'antigravity',
          name: 'Antigravity IDE',
          type: 'antigravity',
          status: 'connected',
          lastSeen: Date.now(),
          pendingCount: 1,
          totalHandled: 28,
        },
      ]);
    }
  }, []);

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const topRequest = pendingRequests[0];

  const handleRespond = async (id: string, action: ActionType, input?: string) => {
    if (window.agentDockAPI) {
      await window.agentDockAPI.respondToRequest(id, action, input);
    } else {
      setRequests(prev => prev.map(r => r.id === id ? {
        ...r, 
        status: action === 'allow' ? 'approved' : action === 'deny' ? 'denied' : 'submitted',
        userResponse: { action, input, respondedAt: Date.now() }
      } : r));
    }
  };

  const handleDismiss = async (id: string) => {
    if (window.agentDockAPI) {
      await window.agentDockAPI.dismissRequest(id);
    } else {
      setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'dismissed' } : r));
    }
  };

  const handleClearHistory = async () => {
    if (window.agentDockAPI) {
      await window.agentDockAPI.clearHistory();
    } else {
      setRequests(prev => prev.filter(r => r.status === 'pending'));
    }
  };

  const handleToggleExpand = async () => {
    if (window.agentDockAPI) {
      const next = await window.agentDockAPI.toggleExpand();
      setIsExpanded(next);
    } else {
      setIsExpanded(prev => !prev);
    }
  };

  const handleMinimize = () => {
    window.agentDockAPI?.minimize();
  };

  const isDestructive = topRequest?.payload.destructive;

  return (
    <div className={`w-screen h-screen rounded-xl overflow-hidden flex flex-col transition-all duration-200 glass-panel ${
      topRequest ? (isDestructive ? 'glow-destructive' : 'glow-border') : ''
    }`}>
      {/* Top Titlebar / Drag Handle */}
      <div className="titlebar-drag h-8 px-3 flex items-center justify-between border-b border-slate-800/80 bg-slate-950/40 select-none">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-400" />
          <span className="text-xs font-bold tracking-tight text-slate-200">
            Agent<span className="text-indigo-400">Dock</span>
          </span>
          {pendingRequests.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              {pendingRequests.length} pending
            </span>
          )}
        </div>

        {/* Window controls */}
        <div className="no-drag flex items-center gap-1">
          {isExpanded && (
            <div className="flex items-center mr-2 border-r border-slate-800 pr-2">
              <button
                onClick={() => setActiveTab('inbox')}
                className={`px-2 py-0.5 rounded text-xs flex items-center gap-1 transition ${
                  activeTab === 'inbox' ? 'bg-indigo-600 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Inbox size={12} />
                Inbox
              </button>
              <button
                onClick={() => setActiveTab('agents')}
                className={`px-2 py-0.5 rounded text-xs flex items-center gap-1 transition ${
                  activeTab === 'agents' ? 'bg-indigo-600 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Bot size={12} />
                Agents
              </button>
            </div>
          )}

          <button
            onClick={() => setShowSettings(true)}
            className="p-1 rounded text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition"
            title="Settings"
          >
            <Sliders size={13} />
          </button>
          <button
            onClick={handleToggleExpand}
            className="p-1 rounded text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition"
            title={isExpanded ? 'Collapse to Floating Card' : 'Expand Unified Inbox'}
          >
            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          <button
            onClick={handleMinimize}
            className="p-1 rounded text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition"
            title="Minimize"
          >
            <Minus size={14} />
          </button>
        </div>
      </div>

      {/* Main Body */}
      <div className="flex-1 overflow-hidden relative">
        {!isExpanded ? (
          <FloatingCard
            request={topRequest}
            pendingCount={pendingRequests.length}
            onRespond={handleRespond}
            onDismiss={handleDismiss}
            onToggleExpand={handleToggleExpand}
            onOpenDetails={setSelectedRequest}
            onOpenSettings={() => setShowSettings(true)}
          />
        ) : activeTab === 'inbox' ? (
          <UnifiedInbox
            requests={requests}
            onRespond={handleRespond}
            onDismiss={handleDismiss}
            onClearHistory={handleClearHistory}
            onOpenDetails={setSelectedRequest}
          />
        ) : (
          <AgentOverview agents={agents} />
        )}
      </div>

      {/* Modals */}
      {selectedRequest && (
        <RequestDetailsModal
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
          onRespond={handleRespond}
        />
      )}

      {showSettings && (
        <SettingsModal
          settings={settings}
          onClose={() => setShowSettings(false)}
          onSave={(patch) => {
            setSettings(prev => ({ ...prev, ...patch }));
            window.agentDockAPI?.saveSettings(patch);
          }}
          onClearHistory={handleClearHistory}
        />
      )}
    </div>
  );
};

export default App;
