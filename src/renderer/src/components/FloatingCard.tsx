import React from 'react';
import { 
  AgentRequest, 
  ActionType 
} from '../../../shared/types';
import { 
  Terminal, 
  FileCode, 
  HelpCircle, 
  AlertTriangle, 
  CheckCircle2, 
  X, 
  Check, 
  Maximize2, 
  FolderGit2,
  Sparkles,
  Info
} from 'lucide-react';

interface FloatingCardProps {
  request?: AgentRequest;
  pendingCount: number;
  onRespond: (id: string, action: ActionType, input?: string) => void;
  onDismiss: (id: string) => void;
  onToggleExpand: () => void;
  onOpenDetails: (req: AgentRequest) => void;
  onOpenSettings: () => void;
}

export const FloatingCard: React.FC<FloatingCardProps> = ({
  request,
  pendingCount,
  onRespond,
  onDismiss,
  onToggleExpand,
  onOpenDetails,
}) => {
  if (!request) {
    return (
      <div className="flex flex-col justify-between h-full p-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-semibold tracking-wide text-slate-300 uppercase">
              AgentDock Live
            </span>
          </div>
          <button 
            onClick={onToggleExpand}
            className="no-drag p-1 rounded-md text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition"
            title="Expand Unified Inbox"
          >
            <Maximize2 size={14} />
          </button>
        </div>

        {/* Empty Body */}
        <div className="flex flex-col items-center justify-center my-auto text-center px-4">
          <div className="w-10 h-10 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-2">
            <Sparkles size={18} />
          </div>
          <p className="text-sm font-medium text-slate-200">All Agents Idle & Ready</p>
          <p className="text-xs text-slate-400 mt-1">
            Requests from Claude Code & Antigravity will float here automatically.
          </p>
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-800/80">
          <span>Loopback: 127.0.0.1:49222</span>
          <span>Press Alt+Shift+Space to toggle</span>
        </div>
      </div>
    );
  }

  const isDestructive = request.payload.destructive;
  const isQuestion = request.category === 'user_question';
  const isCommand = request.category === 'command_permission' || !!request.payload.command;

  return (
    <div className={`flex flex-col justify-between h-full p-3.5 ${isDestructive ? 'bg-rose-950/20' : ''}`}>
      {/* Top Bar: Agent Badge & Category & Window Controls */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 truncate">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
            {request.agentName}
          </span>
          {request.workspacePath && (
            <span className="text-[11px] text-slate-400 flex items-center gap-1 truncate max-w-[140px]" title={request.workspacePath}>
              <FolderGit2 size={11} className="shrink-0" />
              {request.workspacePath.split(/[\/\\]/).pop()}
            </span>
          )}
          {pendingCount > 1 && (
            <span className="px-1.5 py-0.5 text-[10px] font-medium rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              +{pendingCount - 1} more
            </span>
          )}
        </div>

        <div className="no-drag flex items-center gap-1">
          <button
            onClick={() => onOpenDetails(request)}
            className="p-1 rounded text-slate-400 hover:text-slate-100 hover:bg-slate-800/80 transition"
            title="Inspect Request Details"
          >
            <Info size={14} />
          </button>
          <button
            onClick={onToggleExpand}
            className="p-1 rounded text-slate-400 hover:text-slate-100 hover:bg-slate-800/80 transition"
            title="Open Unified Inbox"
          >
            <Maximize2 size={14} />
          </button>
          <button
            onClick={() => onDismiss(request.id)}
            className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-800/80 transition"
            title="Dismiss Notification (Does not approve/reject)"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Main Request Content */}
      <div className="my-2 space-y-1.5">
        <div className="flex items-start gap-2">
          {isDestructive ? (
            <AlertTriangle size={16} className="text-rose-400 shrink-0 mt-0.5" />
          ) : isCommand ? (
            <Terminal size={16} className="text-cyan-400 shrink-0 mt-0.5" />
          ) : isQuestion ? (
            <HelpCircle size={16} className="text-amber-400 shrink-0 mt-0.5" />
          ) : (
            <FileCode size={16} className="text-indigo-400 shrink-0 mt-0.5" />
          )}
          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-semibold text-slate-100 leading-tight truncate">
              {request.title}
            </h4>
            {request.description && (
              <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                {request.description}
              </p>
            )}
          </div>
        </div>

        {/* Command / Question Preview Box */}
        {request.payload.command && (
          <div className={`p-2 rounded-md bg-slate-950/70 border text-xs code-block flex items-center justify-between gap-2 overflow-hidden ${
            isDestructive ? 'border-rose-500/40 text-rose-200' : 'border-slate-800 text-cyan-300'
          }`}>
            <span className="truncate" title={request.payload.command}>
              $ {request.payload.command}
            </span>
            {isDestructive && (
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/30 font-sans font-semibold shrink-0">
                DESTRUCTIVE
              </span>
            )}
          </div>
        )}

        {request.payload.question && (
          <div className="p-2 rounded-md bg-slate-950/70 border border-slate-800 text-xs text-amber-200 line-clamp-2">
            {request.payload.question}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="no-drag flex items-center gap-2 pt-1 border-t border-slate-800/80">
        <button
          onClick={() => onRespond(request.id, 'deny')}
          className="btn-action flex-1 py-1.5 px-3 rounded-md text-xs font-medium bg-slate-800 hover:bg-slate-700 text-rose-300 hover:text-rose-200 border border-slate-700/80 hover:border-rose-500/40 flex items-center justify-center gap-1.5"
        >
          <X size={14} />
          Deny
        </button>

        <button
          onClick={() => onRespond(request.id, 'allow')}
          className={`btn-action flex-[1.4] py-1.5 px-3 rounded-md text-xs font-semibold text-white flex items-center justify-center gap-1.5 shadow-lg ${
            isDestructive 
              ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-900/30 border border-rose-400' 
              : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-900/30 border border-indigo-400'
          }`}
        >
          <Check size={14} />
          Allow Action
        </button>
      </div>
    </div>
  );
};
