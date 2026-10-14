import React from 'react';
import { AgentInfo } from '../../../shared/types';
import { Bot, CheckCircle2, Clock, Terminal, AlertCircle } from 'lucide-react';

interface AgentOverviewProps {
  agents: AgentInfo[];
}

export const AgentOverview: React.FC<AgentOverviewProps> = ({ agents }) => {
  return (
    <div className="p-4 space-y-4 overflow-y-auto h-full text-slate-200">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-100">Connected Agent Matrix</h3>
          <p className="text-xs text-slate-400">Live monitoring of AI agent integrations & hook health</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {agents.map(agent => {
          const isConnected = agent.status === 'connected';
          const isIdle = agent.status === 'idle';

          return (
            <div 
              key={agent.id}
              className="p-3.5 rounded-lg bg-slate-900/70 border border-slate-800 flex items-start justify-between gap-3"
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${
                  isConnected ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' :
                  isIdle ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                  'bg-slate-800 text-slate-400'
                }`}>
                  <Bot size={20} />
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-semibold text-slate-100">{agent.name}</h4>
                    <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full capitalize ${
                      isConnected ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                      isIdle ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                      'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        isConnected ? 'bg-emerald-400 animate-pulse' :
                        isIdle ? 'bg-amber-400' :
                        'bg-slate-500'
                      }`} />
                      {agent.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 mt-0.5">{agent.description || 'Generic Agent Protocol Adapter'}</p>

                  <div className="flex items-center gap-4 text-[11px] text-slate-500 mt-2">
                    <span className="flex items-center gap-1">
                      <Clock size={11} />
                      Last seen: {new Date(agent.lastSeen).toLocaleTimeString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Terminal size={11} />
                      Total handled: {agent.totalHandled}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className="text-lg font-bold text-indigo-400">{agent.pendingCount}</span>
                <span className="block text-[10px] text-slate-400">pending</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Integration Instructions */}
      <div className="p-3.5 rounded-lg bg-indigo-950/20 border border-indigo-800/40 text-xs space-y-1.5">
        <div className="flex items-center gap-2 text-indigo-300 font-semibold">
          <AlertCircle size={14} />
          Connecting External Agents:
        </div>
        <p className="text-slate-300 text-[11px] leading-relaxed">
          Send POST requests to <code className="text-cyan-300 bg-slate-900 px-1 py-0.5 rounded">http://127.0.0.1:49222/api/v1/requests?wait=true</code>.
          Claude Code hooks and custom scripts will automatically route decisions back without any cloud reliance.
        </p>
      </div>
    </div>
  );
};
