import React, { useState } from 'react';
import { AgentRequest } from '../../../shared/types';
import { 
  Sparkles, 
  Terminal, 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle,
  FolderGit2
} from 'lucide-react';

interface FloatingOrbProps {
  pendingRequests: AgentRequest[];
  isWorking?: boolean;
  onExpand: () => void;
}

export const FloatingOrb: React.FC<FloatingOrbProps> = ({
  pendingRequests,
  isWorking = false,
  onExpand,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const pendingCount = pendingRequests.length;
  const topRequest = pendingRequests[0];
  const isDestructive = topRequest?.payload.destructive;
  const isQuestion = topRequest?.category === 'user_question';
  const isCompletion = topRequest?.category === 'task_completed';
  const isCommand = topRequest?.category === 'command_permission' || !!topRequest?.payload.command;

  // Determine active visual tone
  let glowColor = 'from-indigo-500/20 to-violet-500/30';
  let ringBorderColor = 'border-indigo-400/40';
  let statusBadgeColor = 'bg-indigo-500';
  let pulseAnimation = 'animate-pulse';

  if (pendingCount > 0) {
    if (isDestructive) {
      glowColor = 'from-rose-500/30 to-red-600/40';
      ringBorderColor = 'border-rose-500';
      statusBadgeColor = 'bg-rose-500 text-white shadow-rose-500/50';
      pulseAnimation = 'animate-bounce';
    } else if (isQuestion) {
      glowColor = 'from-amber-500/30 to-yellow-600/30';
      ringBorderColor = 'border-amber-400';
      statusBadgeColor = 'bg-amber-500 text-slate-950 font-bold shadow-amber-500/50';
    } else if (isCompletion) {
      glowColor = 'from-emerald-500/30 to-teal-600/30';
      ringBorderColor = 'border-emerald-400';
      statusBadgeColor = 'bg-emerald-500 text-slate-950';
    } else {
      glowColor = 'from-cyan-500/30 to-indigo-600/30';
      ringBorderColor = 'border-cyan-400';
      statusBadgeColor = 'bg-indigo-500 text-white shadow-indigo-500/50';
    }
  }

  return (
    <div 
      className="titlebar-drag w-full h-full flex items-center justify-center relative select-none cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onExpand}
      title={
        pendingCount > 0
          ? `${pendingCount} agent request${pendingCount > 1 ? 's' : ''} waiting - Click to open`
          : 'Agent POP-UP Idle - Click to open'
      }
    >
      {/* Outer ambient glow halo */}
      <div 
        className={`absolute inset-0 rounded-full bg-gradient-to-tr ${glowColor} blur-md transition-all duration-300 pointer-events-none ${
          pendingCount > 0 ? 'scale-110 opacity-100' : 'scale-90 opacity-40'
        }`} 
      />

      {/* Orbital Revolving Ring (when attention required or working) */}
      {(pendingCount > 0 || isWorking) && (
        <div 
          className={`absolute inset-1 rounded-full border border-dashed ${ringBorderColor} opacity-75 pointer-events-none animate-spin`}
          style={{ animationDuration: isWorking ? '3s' : '9s' }}
        />
      )}

      {/* Core Orb Sphere */}
      <div 
        className={`relative w-14 h-14 rounded-full flex items-center justify-center bg-gradient-to-b from-slate-900/95 via-slate-950/98 to-[#060a12] border shadow-2xl transition-all duration-200 ${
          pendingCount > 0 
            ? isDestructive 
              ? 'border-rose-500/80 shadow-rose-950/60 ring-2 ring-rose-500/30' 
              : 'border-indigo-400/80 shadow-indigo-950/60 ring-2 ring-indigo-500/30'
            : 'border-white/[0.12] shadow-black/80 hover:border-indigo-400/50'
        } ${isHovered ? 'scale-105' : 'scale-100'}`}
      >
        {/* Inner specular glossy highlight */}
        <div className="absolute top-1.5 left-2.5 w-5 h-2.5 rounded-full bg-gradient-to-b from-white/30 to-transparent blur-[0.5px] pointer-events-none" />

        {/* Center Icon Symbol */}
        <div className="relative z-10 flex items-center justify-center transition-transform">
          {isDestructive ? (
            <AlertTriangle size={20} className="text-rose-400 animate-pulse" />
          ) : isQuestion ? (
            <HelpCircle size={20} className="text-amber-400 animate-pulse" />
          ) : isCompletion ? (
            <CheckCircle2 size={20} className="text-emerald-400" />
          ) : isCommand ? (
            <Terminal size={20} className="text-cyan-300" />
          ) : (
            <div className="relative flex items-center justify-center">
              <Sparkles size={20} className="text-indigo-400 animate-breathe" />
              <div className="absolute w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400" />
            </div>
          )}
        </div>

        {/* Pending Request Attention Counter Badge */}
        {pendingCount > 0 && (
          <div className="absolute -top-1 -right-1 z-20">
            <span className="relative flex h-5 w-5">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${statusBadgeColor}`} />
              <span className={`relative inline-flex items-center justify-center rounded-full h-5 w-5 text-[10px] font-black shadow-md border border-slate-950 ${statusBadgeColor}`}>
                {pendingCount > 9 ? '9+' : pendingCount}
              </span>
            </span>
          </div>
        )}
      </div>

      {/* Hover Micro-pill Status Preview */}
      {isHovered && (
        <div className="absolute left-16 top-1/2 -translate-y-1/2 z-50 whitespace-nowrap bg-slate-950/95 border border-white/10 px-2.5 py-1 rounded-full text-[11px] shadow-xl backdrop-blur-md pointer-events-none flex items-center gap-1.5">
          <span className={`w-1.5 h-1.5 rounded-full ${pendingCount > 0 ? (isDestructive ? 'bg-rose-400' : 'bg-amber-400') : 'bg-emerald-400'}`} />
          <span className="font-semibold text-slate-200">
            {pendingCount > 0 ? topRequest?.agentName || 'Agent Request' : 'Agent POP-UP'}
          </span>
          <span className="text-slate-400 text-[10px]">
            {pendingCount > 0 ? (isDestructive ? 'Risk Warning' : topRequest?.title) : 'Idle & Ready'}
          </span>
        </div>
      )}
    </div>
  );
};
