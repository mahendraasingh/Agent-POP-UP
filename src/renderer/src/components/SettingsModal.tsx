import React from 'react';
import { AgentDockSettings } from '../../../shared/types';
import { X, Sliders, Volume2, Shield, Eye, Trash2, Keyboard } from 'lucide-react';

interface SettingsModalProps {
  settings: AgentDockSettings;
  onClose: () => void;
  onSave: (patch: Partial<AgentDockSettings>) => void;
  onClearHistory: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onClose,
  onSave,
  onClearHistory,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders size={18} className="text-indigo-400" />
            <h3 className="text-sm font-bold text-slate-100">Preferences & Settings</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition"
          >
            <X size={16} />
          </button>
        </div>

        {/* Settings Form */}
        <div className="p-4 overflow-y-auto space-y-4 text-xs text-slate-300">
          {/* Always on top */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950/60 border border-slate-800">
            <div className="flex items-center gap-2.5">
              <Eye size={16} className="text-indigo-400" />
              <div>
                <span className="font-semibold text-slate-200 block">Always on Top</span>
                <span className="text-[11px] text-slate-400">Keep popup floating over terminal and IDE windows</span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.alwaysOnTop}
              onChange={(e) => onSave({ alwaysOnTop: e.target.checked })}
              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 bg-slate-900 border-slate-700"
            />
          </div>

          {/* Sound notifications */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950/60 border border-slate-800">
            <div className="flex items-center gap-2.5">
              <Volume2 size={16} className="text-cyan-400" />
              <div>
                <span className="font-semibold text-slate-200 block">Audio Chimes</span>
                <span className="text-[11px] text-slate-400">Play subtle sound when high-priority actions arrive</span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.soundEnabled}
              onChange={(e) => onSave({ soundEnabled: e.target.checked })}
              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 bg-slate-900 border-slate-700"
            />
          </div>

          {/* Hotkey */}
          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 space-y-1.5">
            <div className="flex items-center gap-2 text-slate-200 font-semibold">
              <Keyboard size={16} className="text-violet-400" />
              Global Toggle Hotkey
            </div>
            <p className="text-[11px] text-slate-400">
              Press to instantly bring popup into view from any app
            </p>
            <div className="p-2 rounded bg-slate-900 border border-slate-700 font-mono text-indigo-300 text-xs">
              {settings.hotkey || 'CommandOrControl+Shift+Space'}
            </div>
          </div>

          {/* Data Privacy & History */}
          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-slate-200 font-semibold">
              <Shield size={16} className="text-emerald-400" />
              Local Privacy & Activity Storage
            </div>
            <p className="text-[11px] text-slate-400">
              AgentDock stores no cloud telemetry. All request histories remain strictly on your machine.
            </p>
            <button
              onClick={() => {
                onClearHistory();
                onClose();
              }}
              className="px-3 py-1.5 rounded bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/50 flex items-center gap-1.5 text-xs transition"
            >
              <Trash2 size={12} />
              Clear Local Request History
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/60 text-right">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold rounded bg-indigo-600 hover:bg-indigo-500 text-white"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
