'use client';

import React, { useState } from 'react';
import { PriorityLevel } from '@/types/schema';
import { X, Radio, AlertTriangle, Send } from 'lucide-react';

interface BroadcastModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBroadcast: (message: string, severity: PriorityLevel, locationName: string) => Promise<void>;
}

export function BroadcastModal({ isOpen, onClose, onBroadcast }: BroadcastModalProps) {
  const [broadcastText, setBroadcastText] = useState('');
  const [severity, setSeverity] = useState<PriorityLevel>('P1');
  const [locationName, setLocationName] = useState('All Operational Sectors');
  const [isBroadcasting, setIsBroadcasting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastText.trim() || isBroadcasting) return;

    setIsBroadcasting(true);
    await onBroadcast(broadcastText.trim(), severity, locationName);
    setIsBroadcasting(false);
    setBroadcastText('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[2500] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl border border-stone-200 shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between bg-red-50/60">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center">
              <Radio className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Mesh Emergency Broadcast</h3>
              <p className="text-[11px] text-slate-500">
                Push high-priority alert to all connected nodes
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg hover:bg-stone-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Target Broadcast Area
            </label>
            <input
              type="text"
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              placeholder="e.g. Sector Alpha & North Embankment Zone"
              className="w-full text-xs rounded-xl border border-stone-200 p-2.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Alert Severity Level
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(['P1', 'P2', 'P3', 'P4'] as PriorityLevel[]).map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setSeverity(level)}
                  className={`py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                    severity === level
                      ? level === 'P1'
                        ? 'bg-red-500 text-white border-red-500'
                        : level === 'P2'
                        ? 'bg-orange-500 text-white border-orange-500'
                        : 'bg-amber-500 text-white border-amber-500'
                      : 'bg-white text-slate-700 border-stone-200 hover:bg-stone-50'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Emergency Broadcast Message
            </label>
            <textarea
              rows={4}
              value={broadcastText}
              onChange={(e) => setBroadcastText(e.target.value)}
              placeholder="e.g. FLASH FLOOD WARNING: Water discharge increased upstream. All citizens in low-lying areas must immediately move to designated embankments."
              className="w-full text-xs rounded-xl border border-stone-200 p-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 resize-none"
            />
          </div>

          {/* Warning Banner */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2 text-xs text-amber-900">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              This message will trigger a priority push notification on all citizen and responder mobile nodes connected within radio range.
            </p>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={!broadcastText.trim() || isBroadcasting}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 active:bg-red-800 rounded-lg shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isBroadcasting ? 'Broadcasting...' : 'Broadcast to Mesh'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
