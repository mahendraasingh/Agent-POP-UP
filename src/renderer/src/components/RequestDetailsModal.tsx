import React from 'react';
import { AgentRequest, ActionType } from '../../../shared/types';
import { X, Terminal, FolderGit2, AlertTriangle, ShieldCheck, Check, Clock } from 'lucide-react';

interface RequestDetailsModalProps {
  request: AgentRequest;
  onClose: () => void;
  onRespond: (id: string, action: ActionType, input?: string) => void;
}

export const RequestDetailsModal: React.FC<RequestDetailsModalProps> = ({
  request,
  onClose,
  onRespond,
}) => {
  const isDestructive = request.payload.destructive;
  const isPending = request.status === 'pending';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              {request.agentName}
            </span>
            <h3 className="text-sm font-bold text-slate-100 truncate">{request.title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 overflow-y-auto space-y-4 text-xs text-slate-300">
          {/* Risk Banner */}
          {isDestructive ? (
            <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-500/50 flex items-start gap-2.5 text-rose-200">
              <AlertTriangle size={18} className="shrink-0 text-rose-400 mt-0.5" />
              <div>
                <span className="font-semibold block">Destructive Operation Detected</span>
                <span className="text-[11px] text-rose-300">
                  {request.payload.riskReason || 'This command may permanently alter or delete system or git resources.'}
                </span>
              </div>
            </div>
          ) : (
            <div className="p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-500/30 flex items-center gap-2 text-emerald-300 text-[11px]">
              <ShieldCheck size={16} className="shrink-0 text-emerald-400" />
              Standard execution request verified.
            </div>
          )}

          {/* Description */}
          {request.description && (
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Description
              </span>
              <p className="p-2.5 rounded bg-slate-950/50 border border-slate-800 text-slate-200 leading-relaxed">
                {request.description}
              </p>
            </div>
          )}

          {/* Command inspect */}
          {request.payload.command && (
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Command Line
              </span>
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 code-block text-cyan-300 text-xs overflow-x-auto whitespace-pre-wrap select-text">
                $ {request.payload.command}
              </div>
            </div>
          )}

          {/* Working directory & metadata */}
          <div className="grid grid-cols-2 gap-3 text-[11px]">
            {request.workspacePath && (
              <div className="p-2 rounded bg-slate-950/50 border border-slate-800">
                <span className="text-slate-500 block mb-0.5">Workspace</span>
                <span className="text-slate-200 flex items-center gap-1 truncate" title={request.workspacePath}>
                  <FolderGit2 size={12} className="shrink-0" />
                  {request.workspacePath}
                </span>
              </div>
            )}

            <div className="p-2 rounded bg-slate-950/50 border border-slate-800">
              <span className="text-slate-500 block mb-0.5">Created At</span>
              <span className="text-slate-200 flex items-center gap-1">
                <Clock size={12} className="shrink-0" />
                {new Date(request.createdAt).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Diff if present */}
          {request.payload.diff && (
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                File Diff
              </span>
              <pre className="p-3 rounded-lg bg-slate-950 border border-slate-800 code-block text-slate-200 text-xs overflow-x-auto select-text">
                {request.payload.diff}
              </pre>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            Request ID: <code className="text-slate-400">{request.id}</code>
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-xs rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
            >
              Close
            </button>

            {isPending && (
              <>
                <button
                  onClick={() => {
                    onRespond(request.id, 'deny');
                    onClose();
                  }}
                  className="px-3 py-1.5 text-xs rounded bg-rose-950/50 hover:bg-rose-900/60 text-rose-300 border border-rose-800/60"
                >
                  Deny
                </button>
                <button
                  onClick={() => {
                    onRespond(request.id, 'allow');
                    onClose();
                  }}
                  className={`px-4 py-1.5 text-xs rounded font-semibold text-white flex items-center gap-1.5 ${
                    isDestructive ? 'bg-rose-600 hover:bg-rose-500' : 'bg-indigo-600 hover:bg-indigo-500'
                  }`}
                >
                  <Check size={14} />
                  Allow Action
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
