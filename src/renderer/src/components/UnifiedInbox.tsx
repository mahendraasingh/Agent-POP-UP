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
  Filter,
  CheckCircle2,
  FolderGit2
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
      const matchQ = req.payload.question?.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchCmd && !matchQ) return false;
    }

    return true;
  });

  return (
    <div className="flex flex-col h-full bg-slate-950/40 overflow-hidden text-slate-200 select-none">
      {/* Top Filter & Search Bar */}
      <div className="p-3 border-b border-white/[0.08] space-y-2.5 bg-slate-950/50">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search commands, questions, workspaces..."
              className="w-full bg-slate-900/90 border border-slate-700/80 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500/30 transition"
            />
          </div>

          {uniqueAgents.length > 0 && (
            <select
              value={agentFilter}
              onChange={(e) => setAgentFilter(e.target.value)}
              className="bg-slate-900/90 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500/80 transition"
            >
              <option value="all">All Agents</option>
              {uniqueAgents.map(name => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          )}

          <button
            onClick={onClearHistory}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800/80 transition"
            title="Clear Resolved History"
          >
            <Trash2 size={14} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 text-xs">
          {(['all', 'pending', 'resolved', 'dismissed'] as const).map(tab => {
            const count = requests.filter(r => {
              if (tab === 'all') return true;
              if (tab === 'pending') return r.status === 'pending';
              if (tab === 'resolved') return r.status === 'approved' || r.status === 'denied' || r.status === 'submitted';
              if (tab === 'dismissed') return r.status === 'dismissed' || r.status === 'expired';
              return true;
            }).length;

            const isSelected = filterTab === tab;

            return (
              <button
                key={tab}
                onClick={() => setFilterTab(tab)}
                className={`px-3 py-1 rounded-md capitalize font-medium transition text-[11px] flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-indigo-600 text-white font-semibold shadow-sm shadow-indigo-950/50'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <span>{tab}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  isSelected ? 'bg-indigo-700/80 text-white' : 'bg-slate-800 text-slate-400'
                }`}>
                  {count}
                </span>
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
                className={`p-3 rounded-xl border transition cursor-pointer select-none ${
                  isPending
                    ? isDestructive
                      ? 'bg-rose-950/20 border-rose-500/40 hover:border-rose-400 shadow-sm shadow-rose-950/30'
                      : 'bg-slate-900/60 border-indigo-500/30 hover:border-indigo-400/80 shadow-sm shadow-indigo-950/20'
                    : 'bg-slate-900/30 border-white/[0.06] opacity-75 hover:opacity-100 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {req.agentName}
                    </span>
                    <span className="text-xs font-semibold text-slate-100 truncate">
                      {req.title}
                    </span>
                    {req.workspacePath && (
                      <span className="text-[10px] text-slate-500 flex items-center gap-1 font-mono">
                        <FolderGit2 size={10} />
                        {req.workspacePath.split(/[\/\\]/).pop()}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full capitalize ${
                      req.status === 'pending' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse' :
                      req.status === 'approved' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                      req.status === 'denied' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                      req.status === 'submitted' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' :
                      'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}>
                      {req.status}
                    </span>
                    <span className="text-[10px] text-slate-500 flex items-center gap-1 font-mono">
                      <Clock size={10} />
                      {new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                {req.payload.command && (
                  <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800 text-xs code-block text-cyan-300 my-1 truncate flex items-center justify-between gap-2">
                    <span className="truncate">$ {req.payload.command}</span>
                    {isDestructive && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] bg-rose-500/20 text-rose-300 border border-rose-500/30 font-sans font-bold shrink-0">
                        DESTRUCTIVE
                      </span>
                    )}
                  </div>
                )}

                {req.payload.question && (
                  <div className="p-2 rounded-lg bg-amber-950/20 border border-amber-500/30 text-xs text-amber-200/90 my-1 line-clamp-2">
                    {req.payload.question}
                  </div>
                )}

                {/* Actions for pending requests */}
                {isPending && (
                  <div className="flex items-center justify-end gap-2 mt-2 pt-2 border-t border-slate-800/60" onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => onDismiss(req.id)}
                      className="px-2.5 py-1 text-xs rounded-md bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition"
                      title="Hide from popup without deciding"
                    >
                      Hide
                    </button>
                    {req.supportedActions.includes('deny') && (
                      <button
                        onClick={() => onRespond(req.id, 'deny')}
                        className="px-3 py-1 text-xs rounded-md bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/50 flex items-center gap-1 transition"
                      >
                        <X size={12} />
                        Deny
                      </button>
                    )}
                    {req.supportedActions.includes('allow') && (
                      <button
                        onClick={() => onRespond(req.id, 'allow')}
                        className={`px-3 py-1 text-xs rounded-md text-white font-medium flex items-center gap-1 shadow transition ${
                          isDestructive 
                            ? 'bg-rose-600 hover:bg-rose-500 border border-rose-400' 
                            : 'bg-indigo-600 hover:bg-indigo-500 border border-indigo-400'
                        }`}
                      >
                        <Check size={12} />
                        {isDestructive ? 'Approve Risk' : 'Allow'}
                      </button>
                    )}
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
