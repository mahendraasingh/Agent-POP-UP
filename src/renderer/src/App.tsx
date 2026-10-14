import React, { useState, useEffect } from 'react';
import { 
  AgentRequest, 
  AgentInfo, 
  AgentDockSettings, 
  DEFAULT_SETTINGS, 
  ActionType,
  WindowViewMode 
} from '../../shared/types';
import { FloatingOrb } from './components/FloatingOrb';
import { FloatingCard } from './components/FloatingCard';
import { UnifiedInbox } from './components/UnifiedInbox';
import { AgentOverview } from './components/AgentOverview';
import { RequestDetailsModal } from './components/RequestDetailsModal';
import { SettingsModal } from './components/SettingsModal';
import { 
  Inbox, 
  Bot, 
  Sliders, 
  Minus, 
  ChevronDown, 
  ChevronUp, 
  Sparkles,
  RotateCcw,
  Terminal,
  HelpCircle,
  AlertTriangle,
  CheckCircle2,
  Minimize2,
  X,
  Monitor
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
  
  // 3-Tier View Mode: 'icon' (72x72) | 'panel' (420x290) | 'inbox' (740x560)
  const [viewMode, setViewMode] = useState<WindowViewMode>('icon');
  const [activeTab, setActiveTab] = useState<'inbox' | 'agents'>('inbox');
  const [selectedRequest, setSelectedRequest] = useState<AgentRequest | null>(null);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [activeRequestIndex, setActiveRequestIndex] = useState<number>(0);
  const [hiddenRequestIds, setHiddenRequestIds] = useState<Set<string>>(new Set());

  const isDesktopNative = typeof window !== 'undefined' && !!window.agentDockAPI;

  useEffect(() => {
    if (isDesktopNative && window.agentDockAPI) {
      // Load initial state
      window.agentDockAPI.getRequests().then(setRequests);
      window.agentDockAPI.getAgents().then(setAgents);
      window.agentDockAPI.getSettings().then(setSettings);
      window.agentDockAPI.getMode().then(setViewMode);

      // Listen for push updates
      const unsubReq = window.agentDockAPI.onRequestUpdate((updatedReqs) => {
        setRequests(updatedReqs);
        // Clear hidden state for requests that are no longer pending
        setHiddenRequestIds(prev => {
          const next = new Set(prev);
          for (const id of prev) {
            const req = updatedReqs.find(r => r.id === id);
            if (!req || req.status !== 'pending') {
              next.delete(id);
            }
          }
          return next;
        });
      });
      const unsubAgents = window.agentDockAPI.onAgentUpdate(setAgents);
      const unsubSettings = window.agentDockAPI.onSettingsUpdate(setSettings);

      return () => {
        unsubReq();
        unsubAgents();
        unsubSettings();
      };
    } else {
      // Initial realistic mock data for browser preview
      loadBrowserMockData();
    }
  }, [isDesktopNative]);

  const loadBrowserMockData = () => {
    setRequests([
      {
        id: 'req-claude-1',
        agentId: 'claude-code',
        agentName: 'Claude Code',
        category: 'command_permission',
        title: 'Run Vitest Test Suite',
        description: 'Claude needs permission to execute the test suite to verify code changes',
        workspacePath: 'd:/agent pop up',
        payload: {
          command: 'npm run test:unit -- --coverage',
          cwd: 'd:/agent pop up',
          destructive: false,
        },
        supportedActions: ['allow', 'deny', 'dismiss'],
        status: 'pending',
        createdAt: Date.now() - 45000,
        updatedAt: Date.now(),
      },
      {
        id: 'req-anti-1',
        agentId: 'antigravity',
        agentName: 'Antigravity IDE',
        category: 'user_question',
        title: 'Select Component Architecture',
        description: 'Clarification required before proceeding with layout refactoring',
        workspacePath: 'd:/agent pop up',
        payload: {
          question: 'Should the desktop companion use Framer Motion or lightweight CSS transitions for 60fps overlay animations?',
          options: ['Lightweight CSS Transitions', 'Framer Motion'],
        },
        supportedActions: ['submit', 'dismiss'],
        status: 'pending',
        createdAt: Date.now() - 15000,
        updatedAt: Date.now(),
      },
      {
        id: 'req-anti-2',
        agentId: 'antigravity',
        agentName: 'Antigravity IDE',
        category: 'command_permission',
        title: 'Git Force Clean Operation',
        description: 'Agent requested hard clean of uncommitted workspace state',
        workspacePath: 'd:/agent pop up',
        payload: {
          command: 'git clean -fd && git reset --hard HEAD',
          cwd: 'd:/agent pop up',
          destructive: true,
          riskReason: 'Will permanently discard all untracked and modified workspace files',
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
        totalHandled: 16,
        description: 'Official Anthropic CLI Agent Hook',
      },
      {
        id: 'antigravity',
        name: 'Antigravity IDE',
        type: 'antigravity',
        status: 'connected',
        lastSeen: Date.now(),
        pendingCount: 2,
        totalHandled: 34,
        description: 'Autonomous Coding Assistant Protocol',
      },
    ]);
  };

  const allPending = requests.filter(r => r.status === 'pending');
  const visiblePending = allPending.filter(r => !hiddenRequestIds.has(r.id));
  const safeIndex = visiblePending.length > 0 ? Math.min(activeRequestIndex, visiblePending.length - 1) : 0;
  const currentFloatingRequest = visiblePending[safeIndex] || (visiblePending.length > 0 ? visiblePending[0] : undefined);

  // Switch view mode with Electron window resize sync
  const switchMode = async (targetMode: WindowViewMode) => {
    setViewMode(targetMode);
    if (window.agentDockAPI) {
      await window.agentDockAPI.setMode(targetMode);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showSettings || selectedRequest) return;
      if (e.key === 'Escape') {
        if (viewMode === 'inbox') {
          switchMode('panel');
        } else if (viewMode === 'panel') {
          switchMode('icon');
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewMode, showSettings, selectedRequest]);

  const handleRespond = async (id: string, action: ActionType, input?: string) => {
    if (window.agentDockAPI) {
      await window.agentDockAPI.respondToRequest(id, action, input);
    } else {
      await new Promise(r => setTimeout(r, 450));
      setRequests(prev => prev.map(r => r.id === id ? {
        ...r, 
        status: action === 'allow' ? 'approved' : action === 'deny' ? 'denied' : 'submitted',
        userResponse: { action, input, respondedAt: Date.now() },
        updatedAt: Date.now()
      } : r));
    }
  };

  const handleDismiss = async (id: string) => {
    // Hide popup without changing underlying request status:
    setHiddenRequestIds(prev => new Set(prev).add(id));
    // Collapse to floating icon
    await switchMode('icon');
  };

  const handleClearHistory = async () => {
    if (window.agentDockAPI) {
      await window.agentDockAPI.clearHistory();
    } else {
      setRequests(prev => prev.filter(r => r.status === 'pending'));
    }
  };

  // Browser test scenario injectors
  const injectSimulatorRequest = (type: 'claude_cmd' | 'anti_question' | 'risk_cmd' | 'completed') => {
    const id = `sim-${Date.now()}`;
    let newReq: AgentRequest;

    if (type === 'claude_cmd') {
      newReq = {
        id,
        agentId: 'claude-code',
        agentName: 'Claude Code',
        category: 'command_permission',
        title: 'Install Project Dependency',
        description: 'Claude wants to run npm install for motion graphics library',
        workspacePath: 'd:/agent pop up',
        payload: {
          command: 'npm install -D clsx tailwind-merge',
          cwd: 'd:/agent pop up',
          destructive: false,
        },
        supportedActions: ['allow', 'deny', 'dismiss'],
        status: 'pending',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
    } else if (type === 'anti_question') {
      newReq = {
        id,
        agentId: 'antigravity',
        agentName: 'Antigravity IDE',
        category: 'user_question',
        title: 'Database Migration Strategy',
        description: 'Antigravity detected pending schema changes in migration files',
        workspacePath: 'd:/agent pop up',
        payload: {
          question: 'Do you want to run dry-run verification first or apply migrations directly?',
          options: ['Dry-run verification', 'Apply directly'],
        },
        supportedActions: ['submit', 'dismiss'],
        status: 'pending',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
    } else if (type === 'risk_cmd') {
      newReq = {
        id,
        agentId: 'claude-code',
        agentName: 'Claude Code',
        category: 'command_permission',
        title: 'Delete Build Artifacts Directory',
        description: 'High risk file deletion operation requested',
        workspacePath: 'd:/agent pop up',
        payload: {
          command: 'rm -rf dist release .cache',
          cwd: 'd:/agent pop up',
          destructive: true,
          riskReason: 'Recursively removes all production and release builds without recycle bin',
        },
        supportedActions: ['allow', 'deny', 'dismiss'],
        status: 'pending',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
    } else {
      newReq = {
        id,
        agentId: 'antigravity',
        agentName: 'Antigravity IDE',
        category: 'task_completed',
        title: 'Styling Overhaul Complete',
        description: 'All components updated with glassmorphism and Tailwind v4 engine',
        workspacePath: 'd:/agent pop up',
        payload: {},
        supportedActions: ['dismiss'],
        status: 'pending',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
    }

    setRequests(prev => [newReq, ...prev]);
    setHiddenRequestIds(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    setActiveRequestIndex(0);
  };

  const isDestructive = currentFloatingRequest?.payload.destructive;
  const isQuestion = currentFloatingRequest?.category === 'user_question';
  const isCompletion = currentFloatingRequest?.category === 'task_completed';

  // -------------------------------------------------------------
  // RENDER COMPACT FLOATING PANEL (Tier 2) & INBOX (Tier 3)
  // -------------------------------------------------------------
  const renderCardOrInboxContent = () => {
    const isInbox = viewMode === 'inbox';

    return (
      <div className={`w-full h-full rounded-2xl overflow-hidden flex flex-col transition-all duration-200 glass-panel border ${
        currentFloatingRequest 
          ? isDestructive 
            ? 'glow-destructive' 
            : isQuestion 
              ? 'glow-amber' 
              : isCompletion 
                ? 'glow-emerald' 
                : 'glow-border' 
          : 'border-slate-800/90 shadow-2xl'
      }`}>
        {/* Top Header / Titlebar */}
        <div className="titlebar-drag h-8 px-3 flex items-center justify-between border-b border-white/[0.08] bg-slate-950/60 select-none backdrop-blur-md">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-400 shadow-sm shadow-indigo-500/50" />
            <span className="text-xs font-bold tracking-tight text-slate-100 flex items-center gap-1">
              Agent<span className="text-indigo-400 font-extrabold">POP-UP</span>
            </span>
            {allPending.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {allPending.length} pending
              </span>
            )}
          </div>

          {/* Window controls */}
          <div className="no-drag flex items-center gap-1">
            {isInbox && (
              <div className="flex items-center mr-2 border-r border-slate-800 pr-2 gap-1">
                <button
                  onClick={() => setActiveTab('inbox')}
                  className={`px-2.5 py-0.5 rounded text-xs flex items-center gap-1.5 transition ${
                    activeTab === 'inbox' 
                      ? 'bg-indigo-600 text-white font-medium shadow-sm' 
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <Inbox size={12} />
                  Inbox
                </button>
                <button
                  onClick={() => setActiveTab('agents')}
                  className={`px-2.5 py-0.5 rounded text-xs flex items-center gap-1.5 transition ${
                    activeTab === 'agents' 
                      ? 'bg-indigo-600 text-white font-medium shadow-sm' 
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <Bot size={12} />
                  Agents
                </button>
              </div>
            )}

            <button
              onClick={() => setShowSettings(true)}
              className="p-1 rounded text-slate-400 hover:text-slate-100 hover:bg-slate-800/70 transition"
              title="Settings"
            >
              <Sliders size={13} />
            </button>
            <button
              onClick={() => switchMode(isInbox ? 'panel' : 'inbox')}
              className="p-1 rounded text-slate-400 hover:text-slate-100 hover:bg-slate-800/70 transition"
              title={isInbox ? 'Collapse to Compact Panel' : 'Expand to Full Inbox'}
            >
              {isInbox ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
            </button>
            <button
              onClick={() => switchMode('icon')}
              className="p-1 rounded text-slate-400 hover:text-slate-100 hover:bg-slate-800/70 transition"
              title="Collapse to Floating Icon"
            >
              <Minimize2 size={13} />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-hidden relative">
          {!isInbox ? (
            <FloatingCard
              request={currentFloatingRequest}
              pendingCount={visiblePending.length}
              allPendingRequests={visiblePending}
              currentIndex={safeIndex}
              onNavigateRequest={(idx) => setActiveRequestIndex(idx)}
              onRespond={handleRespond}
              onDismiss={handleDismiss}
              onToggleExpand={() => switchMode('inbox')}
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

  // -------------------------------------------------------------
  // NATIVE ELECTRON DESKTOP RUNTIME
  // -------------------------------------------------------------
  if (isDesktopNative) {
    if (viewMode === 'icon') {
      return (
        <div className="w-screen h-screen flex items-center justify-center p-1 overflow-hidden bg-transparent">
          <FloatingOrb
            pendingRequests={allPending}
            onExpand={() => switchMode('panel')}
          />
        </div>
      );
    }

    return (
      <div className="w-screen h-screen p-1.5 overflow-hidden bg-transparent">
        {renderCardOrInboxContent()}
      </div>
    );
  }

  // -------------------------------------------------------------
  // LOCALHOST WEB BROWSER DESKTOP SIMULATOR
  // -------------------------------------------------------------
  return (
    <div className="min-h-screen w-screen bg-[#070b12] text-slate-100 flex flex-col font-sans select-none overflow-hidden relative">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Simulator Top Nav Bar */}
      <header className="h-12 border-b border-slate-800/80 bg-slate-950/70 px-4 flex items-center justify-between z-20 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-bold tracking-tight text-slate-200">
              Agent POP-UP <span className="text-indigo-400 font-normal">Desktop Icon Simulator</span>
            </span>
          </div>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800/90 text-slate-400 border border-slate-700 font-mono">
            127.0.0.1:49222
          </span>
        </div>

        {/* Live Test Scenario Injectors */}
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-[11px] text-slate-500 mr-1 hidden sm:inline">Simulate Agent:</span>
          <button
            onClick={() => injectSimulatorRequest('claude_cmd')}
            className="px-2 py-1 rounded-md bg-indigo-950/40 hover:bg-indigo-900/60 border border-indigo-700/50 text-indigo-300 text-[11px] flex items-center gap-1 transition"
            title="Inject Claude Command permission request"
          >
            <Terminal size={11} />
            + Command
          </button>
          <button
            onClick={() => injectSimulatorRequest('anti_question')}
            className="px-2 py-1 rounded-md bg-amber-950/40 hover:bg-amber-900/60 border border-amber-700/50 text-amber-300 text-[11px] flex items-center gap-1 transition"
            title="Inject Antigravity interactive user question"
          >
            <HelpCircle size={11} />
            + Question
          </button>
          <button
            onClick={() => injectSimulatorRequest('risk_cmd')}
            className="px-2 py-1 rounded-md bg-rose-950/40 hover:bg-rose-900/60 border border-rose-700/50 text-rose-300 text-[11px] flex items-center gap-1 transition"
            title="Inject Destructive command request"
          >
            <AlertTriangle size={11} />
            + Destructive
          </button>
          <button
            onClick={() => injectSimulatorRequest('completed')}
            className="px-2 py-1 rounded-md bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-700/50 text-emerald-300 text-[11px] flex items-center gap-1 transition"
            title="Inject Task Finished notification"
          >
            <CheckCircle2 size={11} />
            + Complete
          </button>
          <button
            onClick={loadBrowserMockData}
            className="p-1 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition ml-1"
            title="Reset Mock Data"
          >
            <RotateCcw size={13} />
          </button>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => switchMode('icon')}
            className={`px-2.5 py-0.5 rounded text-[11px] transition font-medium ${
              viewMode === 'icon'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Floating Icon (72×72)
          </button>
          <button
            onClick={() => switchMode('panel')}
            className={`px-2.5 py-0.5 rounded text-[11px] transition font-medium ${
              viewMode === 'panel'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Panel (420×290)
          </button>
          <button
            onClick={() => switchMode('inbox')}
            className={`px-2.5 py-0.5 rounded text-[11px] transition font-medium ${
              viewMode === 'inbox'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Inbox (740×560)
          </button>
        </div>
      </header>

      {/* Simulated Desktop Workspace Area */}
      <main className="flex-1 p-8 relative overflow-hidden flex flex-col justify-between">
        {/* Subtle grid background */}
        <div 
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)`,
            backgroundSize: '24px 24px',
          }}
        />

        {/* Top-Left Callout info */}
        <div className="text-[11px] text-slate-500 flex items-center gap-2 font-mono z-10">
          <Monitor size={13} className="text-slate-400" />
          <span>Desktop Workspace · Always-on-top Floating Overlay</span>
          {viewMode === 'icon' && (
            <span className="text-indigo-400 font-sans font-semibold bg-indigo-950/40 px-2 py-0.5 rounded border border-indigo-800/40">
              👈 Click the floating orb to expand
            </span>
          )}
        </div>

        {/* THE FLOATING ORB OR ANCHORED PANEL */}
        <div className="relative z-20 my-auto">
          {viewMode === 'icon' ? (
            <div className="w-[72px] h-[72px] transition-transform duration-200 hover:scale-105">
              <FloatingOrb
                pendingRequests={allPending}
                onExpand={() => switchMode('panel')}
              />
            </div>
          ) : (
            <div 
              className="transition-all duration-300 relative z-10 shadow-2xl"
              style={{
                width: viewMode === 'inbox' ? '740px' : '420px',
                height: viewMode === 'inbox' ? '560px' : '290px',
                maxWidth: '95vw',
                maxHeight: '85vh',
              }}
            >
              {renderCardOrInboxContent()}
            </div>
          )}
        </div>

        {/* Instructions Footer */}
        <div className="text-[11px] text-slate-500 flex items-center justify-between z-10 pt-4 border-t border-slate-900">
          <div className="flex items-center gap-4">
            <span>• Primary Footprint: <strong>72×72px Floating Orb</strong></span>
            <span>• Expands contextually only when attention required or clicked</span>
            <span>• ✕ Collapses panel without dismissing request from inbox</span>
          </div>
          <span className="font-mono text-slate-400">Press Esc to collapse</span>
        </div>
      </main>
    </div>
  );
};

export default App;
