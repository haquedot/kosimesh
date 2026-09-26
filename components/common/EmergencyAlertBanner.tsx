'use client';

import React from 'react';
import { Message } from '@/types/schema';
import { AlertOctagon, Volume2, VolumeX, ChevronRight, ShieldAlert } from 'lucide-react';

interface EmergencyAlertBannerProps {
  unresolvedP1Messages: Message[];
  isAudioEnabled: boolean;
  onToggleAudio: () => void;
  onSelectMessage: (message: Message) => void;
}

export function EmergencyAlertBanner({
  unresolvedP1Messages,
  isAudioEnabled,
  onToggleAudio,
  onSelectMessage,
}: EmergencyAlertBannerProps) {
  if (unresolvedP1Messages.length === 0) return null;

  const topP1 = unresolvedP1Messages[0];

  return (
    <div className="bg-red-600 text-white px-6 py-2.5 flex items-center justify-between shadow-md animate-in slide-in-from-top duration-300">
      <div className="flex items-center gap-3 overflow-hidden">
        <div className="w-6 h-6 rounded-md bg-red-700 flex items-center justify-center shrink-0 animate-pulse">
          <AlertOctagon className="w-4 h-4 text-white" />
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold truncate">
          <span className="bg-white text-red-700 px-1.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wide">
            P1 Critical Alert ({unresolvedP1Messages.length})
          </span>
          <span className="truncate">
            {topP1.senderName} ({topP1.locationName}): &ldquo;{topP1.message}&rdquo;
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0 ml-4">
        <button
          onClick={() => onSelectMessage(topP1)}
          className="flex items-center gap-1 text-xs font-bold bg-white/20 hover:bg-white/30 text-white px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
        >
          <span>Triage Now</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>

        <button
          title={isAudioEnabled ? 'Mute Alert Chimes' : 'Enable Alert Chimes'}
          onClick={onToggleAudio}
          className="w-7 h-7 rounded-lg bg-red-700/80 hover:bg-red-700 flex items-center justify-center text-white transition-colors cursor-pointer"
        >
          {isAudioEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  );
}
