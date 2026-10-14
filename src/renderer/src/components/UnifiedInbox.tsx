import React, { useState } from 'react';
import { AgentRequest, ActionType } from '../../../shared/types';
import { 
  Search, 
  Terminal, 
  HelpCircle, 
  FileCode, 
  AlertTriangle, 
  Check, 
  X, 
  Trash2,
  Clock,
  Filter
} from 'lucide-react';

interface UnifiedInboxProps {
  requests: AgentRequest[];
  onRespond: (id: string, action: ActionType, input?: string) => void;
  onDismiss: (id: string) => void;
  onClearHistory: () => void;
  onOpenDetails: (req: AgentRequest) => void;
}

export const UnifiedInbox: React.FC<UnifiedInboxProps> = ({
  requests,
  onRespond,
  onDismiss,
  onClearHistory,
  onOpenDetails,
}) => {
  const [filterTab, setFilterTab] = useState<'all' | 'pending' | 'resolved' | 'dismissed'>('all');
  const [agentFilter, setAgentFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const uniqueAgents = Array.from(new Set(requests.map(r => r.agentName)));

  const filteredRequests = requests.filter(req => {
    // Tab filter
    if (filterTab === 'pending' && req.status !== 'pending') return false;
    if (filterTab === 'resolved' && (req.status !== 'approved' && req.status !== 'denied' && req.status !== 'submitted')) return false;
    if (filterTab === 'dismissed' && req.status !== 'dismissed' && req.status !== 'expired') return false;

    // Agent filter
    if (agentFilter !== 'all' && req.agentName !== agentFilter) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = req.title.toLowerCase().includes(q);
      const matchDesc = req.description.toLowerCase().includes(q);
      const matchCmd = req.payload.command?.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchCmd) return false;
    }

    return true;
  });

  return (
    <div className="flex flex-col h-full bg-slate-900/60 overflow-hidden text-slate-200">
      {/* Top Filter & Search Bar */}
      <div className="p-3 border-b border-slate-800 space-y-2">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-2.5 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search commands, questions, workspaces..."
              className="w-full bg-slate-950/80 border border-slate-700/80 rounded-md pl-8 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {uniqueAgents.length > 0 && (
            <select
              value={agentFilter}
              onChange={(e) => setAgentFilter(e.target.value)}
              className="bg-slate-950/80 border border-slate-700/80 rounded-md px-2 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">All Agents</option>
              {uniqueAgents.map(name => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          )}

          <button
            onClick={onClearHistory}
            className="p-1.5 rounded-md text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
            title="Clear Resolved History"
          >
            <Trash2 size={14} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 text-xs">
          {(['all', 'pending', 'resolved', 'dismissed'] as const).map(tab => {
            const count = requests.filter(r => {
              if (tab === 'all') return true;
              if (tab === 'pending') return r.status === 'pending';
              if (tab === 'resolved') return r.status === 'approved' || r.status === 'denied' || r.status === 'submitted';
              if (tab === 'dismissed') return r.status === 'dismissed' || r.status === 'expired';
              return true;
            }).length;

            return (
              <button
                key={tab}
                onClick={() => setFilterTab(tab)}
                className={`px-3 py-1 rounded-md capitalize font-medium transition ${
                  filterTab === tab
                    ? 'bg-indigo-600 text-white font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                {tab} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Requests List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {filteredRequests.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center text-slate-400">
            <Filter size={24} className="mb-2 text-slate-600" />
            <p className="text-xs font-medium">No requests match this filter.</p>
          </div>
        ) : (
          filteredRequests.map(req => {
            const isPending = req.status === 'pending';
            const isDestructive = req.payload.destructive;

            return (
              <div
                key={req.id}
                onClick={() => onOpenDetails(req)}
                className={`p-3 rounded-lg border transition cursor-pointer ${
                  isPending
                    ? isDestructive
                      ? 'bg-rose-950/20 border-rose-500/40 hover:border-rose-400'
                      : 'bg-slate-800/40 border-indigo-500/30 hover:border-indigo-400'
                    : 'bg-slate-900/40 border-slate-800/80 opacity-75 hover:opacity-100 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {req.agentName}
                    </span>
                    <span className="text-xs font-semibold text-slate-200 truncate">
                      {req.title}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full capitalize ${
                      req.status === 'pending' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse' :
                      req.status === 'approved' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                      req.status === 'denied' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                      'bg-slate-700 text-slate-400'
                    }`}>
                      {req.status}
                    </span>
                    <span className="text-[10px] text-slate-500 flex items-center gap-1">
                      <Clock size={10} />
                      {new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                {req.payload.command && (
                  <div className="p-2 rounded bg-slate-950/80 border border-slate-800 text-xs code-block text-cyan-300 my-1 truncate">
                    $ {req.payload.command}
                  </div>
                )}

                {req.payload.question && (
                  <div className="text-xs text-amber-200/90 my-1 line-clamp-2">
                    {req.payload.question}
                  </div>
                )}

                {/* Actions for pending requests */}
                {isPending && (
                  <div className="flex items-center justify-end gap-2 mt-2 pt-2 border-t border-slate-800/60" onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => onDismiss(req.id)}
                      className="px-2.5 py-1 text-xs rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                    >
                      Dismiss
                    </button>
                    <button
                      onClick={() => onRespond(req.id, 'deny')}
                      className="px-3 py-1 text-xs rounded bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/50 flex items-center gap-1"
                    >
                      <X size={12} />
                      Deny
                    </button>
                    <button
                      onClick={() => onRespond(req.id, 'allow')}
                      className="px-3 py-1 text-xs rounded bg-indigo-600 hover:bg-indigo-500 text-white font-medium flex items-center gap-1"
                    >
                      <Check size={12} />
                      Allow
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
