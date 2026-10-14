import React, { useState } from 'react';
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
  Info, 
  Copy, 
  Send, 
  ChevronLeft, 
  ChevronRight, 
  Loader2,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';

interface FloatingCardProps {
  request?: AgentRequest;
  pendingCount: number;
  allPendingRequests?: AgentRequest[];
  currentIndex?: number;
  onNavigateRequest?: (index: number) => void;
  onRespond: (id: string, action: ActionType, input?: string) => Promise<void> | void;
  onDismiss: (id: string) => void;
  onToggleExpand: () => void;
  onOpenDetails: (req: AgentRequest) => void;
  onOpenSettings: () => void;
}

export const FloatingCard: React.FC<FloatingCardProps> = ({
  request,
  pendingCount,
  allPendingRequests = [],
  currentIndex = 0,
  onNavigateRequest,
  onRespond,
  onDismiss,
  onToggleExpand,
  onOpenDetails,
  onOpenSettings,
}) => {
  const [questionInput, setQuestionInput] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submittingAction, setSubmittingAction] = useState<ActionType | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const handleAction = async (action: ActionType, input?: string) => {
    if (!request || isSubmitting) return;
    setIsSubmitting(true);
    setSubmittingAction(action);
    try {
      await onRespond(request.id, action, input);
      setQuestionInput('');
    } finally {
      setIsSubmitting(false);
      setSubmittingAction(null);
    }
  };

  const copyCommand = (cmd: string) => {
    navigator.clipboard.writeText(cmd);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!request) {
    return (
      <div className="flex flex-col justify-between h-full p-4 select-none">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-bold tracking-wider text-slate-300 uppercase">
              Agent POP-UP
            </span>
          </div>
          <div className="flex items-center gap-1.5 no-drag">
            <button 
              onClick={onToggleExpand}
              className="p-1 rounded-md text-slate-400 hover:text-slate-100 hover:bg-slate-800/80 transition"
              title="Expand Unified Inbox"
            >
              <Maximize2 size={13} />
            </button>
          </div>
        </div>

        {/* Empty Body */}
        <div className="flex flex-col items-center justify-center my-auto text-center px-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500/20 to-violet-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-2.5 shadow-lg shadow-indigo-950/40">
            <Sparkles size={22} className="animate-pulse" />
          </div>
          <p className="text-sm font-semibold text-slate-200">Listening for Agent Events</p>
          <p className="text-[11px] text-slate-400 mt-1 max-w-[280px] leading-relaxed">
            Run commands in Claude Code or Antigravity. Requests and permissions will pop up automatically.
          </p>
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2.5 border-t border-slate-800/80">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            127.0.0.1:49222
          </span>
          <span className="text-[10px] bg-slate-800/70 px-2 py-0.5 rounded text-slate-300 border border-slate-700/60 font-mono">
            Ctrl+Shift+Space
          </span>
        </div>
      </div>
    );
  }

  const isDestructive = request.payload.destructive;
  const isQuestion = request.category === 'user_question';
  const isCommand = request.category === 'command_permission' || !!request.payload.command;
  const isCompletion = request.category === 'task_completed';
  const isFileOp = request.category === 'file_operation';

  return (
    <div className={`flex flex-col justify-between h-full p-3.5 select-none ${
      isDestructive ? 'bg-gradient-to-b from-rose-950/25 to-slate-950/40' : ''
    }`}>
      {/* Top Bar: Agent Badge, Workspace & Request Pager */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          {/* Agent Pill */}
          <span className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border truncate ${
            request.agentId.includes('claude') 
              ? 'bg-amber-500/15 border-amber-500/30 text-amber-300' 
              : 'bg-indigo-500/15 border-indigo-500/30 text-indigo-300'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${
              request.agentId.includes('claude') ? 'bg-amber-400' : 'bg-indigo-400'
            }`} />
            {request.agentName}
          </span>

          {/* Workspace Path */}
          {request.workspacePath && (
            <span 
              className="text-[11px] text-slate-400 flex items-center gap-1 truncate max-w-[130px] hover:text-slate-200 transition"
              title={request.workspacePath}
            >
              <FolderGit2 size={12} className="shrink-0 text-slate-500" />
              {request.workspacePath.split(/[\/\\]/).pop()}
            </span>
          )}

          {/* Multiple Pending Requests Pager */}
          {pendingCount > 1 && (
            <div className="no-drag flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-slate-800/90 border border-slate-700/80 text-[10px] text-slate-300">
              {onNavigateRequest && (
                <button
                  onClick={() => onNavigateRequest(Math.max(0, currentIndex - 1))}
                  disabled={currentIndex === 0}
                  className="p-0.5 hover:text-white disabled:opacity-30"
                  title="Previous request"
                >
                  <ChevronLeft size={10} />
                </button>
              )}
              <span className="px-1 font-mono font-medium">
                {currentIndex + 1}/{pendingCount}
              </span>
              {onNavigateRequest && (
                <button
                  onClick={() => onNavigateRequest(Math.min(pendingCount - 1, currentIndex + 1))}
                  disabled={currentIndex === pendingCount - 1}
                  className="p-0.5 hover:text-white disabled:opacity-30"
                  title="Next request"
                >
                  <ChevronRight size={10} />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Window controls */}
        <div className="no-drag flex items-center gap-1 shrink-0">
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
            className="p-1 rounded text-slate-400 hover:text-amber-400 hover:bg-slate-800/80 transition"
            title="Hide popup (Request stays pending in Inbox)"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Main Request Content */}
      <div className="my-2 space-y-2">
        <div className="flex items-start gap-2.5">
          <div className="mt-0.5 shrink-0">
            {isDestructive ? (
              <div className="w-6 h-6 rounded-lg bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
                <AlertTriangle size={14} />
              </div>
            ) : isCommand ? (
              <div className="w-6 h-6 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300">
                <Terminal size={14} />
              </div>
            ) : isQuestion ? (
              <div className="w-6 h-6 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300">
                <HelpCircle size={14} />
              </div>
            ) : isCompletion ? (
              <div className="w-6 h-6 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300">
                <CheckCircle2 size={14} />
              </div>
            ) : (
              <div className="w-6 h-6 rounded-lg bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-300">
                <FileCode size={14} />
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-[13px] font-semibold text-slate-100 leading-snug truncate">
              {request.title}
            </h4>
            {request.description && (
              <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5 leading-normal">
                {request.description}
              </p>
            )}
          </div>
        </div>

        {/* Command Box */}
        {request.payload.command && (
          <div className={`p-2 rounded-lg bg-slate-950/80 border text-[11px] code-block flex items-center justify-between gap-2 overflow-hidden ${
            isDestructive ? 'border-rose-500/40 text-rose-200' : 'border-slate-800 text-cyan-300'
          }`}>
            <span className="truncate select-text" title={request.payload.command}>
              <span className="text-slate-500 select-none mr-1.5">$</span>
              {request.payload.command}
            </span>
            <div className="flex items-center gap-1.5 shrink-0 no-drag">
              {isDestructive && (
                <span className="px-1.5 py-0.2 rounded text-[9px] bg-rose-500/25 text-rose-300 border border-rose-500/40 font-sans font-bold">
                  HIGH RISK
                </span>
              )}
              <button
                onClick={() => copyCommand(request.payload.command!)}
                className="p-1 rounded text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition"
                title="Copy command"
              >
                {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
              </button>
            </div>
          </div>
        )}

        {/* Destructive warning reason */}
        {isDestructive && request.payload.riskReason && (
          <div className="flex items-center gap-1.5 text-[10px] text-rose-300/90 bg-rose-950/30 border border-rose-900/40 px-2 py-1 rounded">
            <ShieldAlert size={11} className="shrink-0 text-rose-400" />
            <span className="truncate">{request.payload.riskReason}</span>
          </div>
        )}

        {/* Question Input Area */}
        {isQuestion && (
          <div className="space-y-1.5 no-drag">
            <div className="p-2 rounded-lg bg-slate-950/80 border border-amber-500/30 text-[11px] text-amber-200/95 leading-relaxed line-clamp-2">
              {request.payload.question || request.title}
            </div>
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={questionInput}
                onChange={(e) => setQuestionInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && questionInput.trim()) {
                    handleAction('submit', questionInput.trim());
                  }
                }}
                placeholder="Type your response to agent..."
                disabled={isSubmitting}
                className="flex-1 bg-slate-950 border border-slate-700/80 rounded-md px-2.5 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 disabled:opacity-50"
              />
              <button
                onClick={() => handleAction('submit', questionInput.trim())}
                disabled={!questionInput.trim() || isSubmitting}
                className="btn-action px-3 py-1.5 rounded-md text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-40 flex items-center gap-1 shadow-md shadow-indigo-950/40"
              >
                {isSubmitting ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                Reply
              </button>
            </div>
          </div>
        )}

        {/* File Operation Preview */}
        {isFileOp && request.payload.filePath && (
          <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800 text-[11px] code-block text-indigo-300 truncate">
            <span className="text-slate-500 mr-1.5">File:</span>
            {request.payload.filePath}
          </div>
        )}

        {/* Task Completed Indicator */}
        {isCompletion && (
          <div className="p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-500/30 flex items-center justify-between text-xs text-emerald-200">
            <span>Task completed successfully</span>
            <CheckCircle2 size={14} className="text-emerald-400" />
          </div>
        )}
      </div>

      {/* Action Buttons (For Non-Question Requests) */}
      {!isQuestion && (
        <div className="no-drag flex items-center gap-2 pt-1 border-t border-slate-800/80">
          {isCompletion ? (
            <button
              onClick={() => onDismiss(request.id)}
              className="btn-action w-full py-1.5 px-3 rounded-md text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center gap-1.5 border border-slate-700"
            >
              <Check size={13} />
              Acknowledge & Close
            </button>
          ) : (
            <>
              {request.supportedActions.includes('deny') && (
                <button
                  onClick={() => handleAction('deny')}
                  disabled={isSubmitting}
                  className="btn-action flex-1 py-1.5 px-3 rounded-md text-xs font-medium bg-slate-800/90 hover:bg-slate-800 text-rose-300 hover:text-rose-200 border border-slate-700/80 hover:border-rose-500/40 flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {isSubmitting && submittingAction === 'deny' ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : (
                    <X size={13} />
                  )}
                  Deny
                </button>
              )}

              {request.supportedActions.includes('allow') && (
                <button
                  onClick={() => handleAction('allow')}
                  disabled={isSubmitting}
                  className={`btn-action flex-[1.4] py-1.5 px-3 rounded-md text-xs font-semibold text-white flex items-center justify-center gap-1.5 shadow-lg disabled:opacity-50 ${
                    isDestructive 
                      ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-950/50 border border-rose-400/80' 
                      : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-950/50 border border-indigo-400/80'
                  }`}
                >
                  {isSubmitting && submittingAction === 'allow' ? (
                    <>
                      <Loader2 size={13} className="animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Check size={14} />
                      <span>{isDestructive ? 'Approve Risk' : 'Allow Action'}</span>
                    </>
                  )}
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};
