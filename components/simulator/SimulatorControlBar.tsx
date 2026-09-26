'use client';

import React, { useState, useEffect } from 'react';
import { Play, Pause, AlertTriangle, Fuel, RotateCcw, ChevronUp, ChevronDown, Activity, Sparkles } from 'lucide-react';

interface SimulatorControlBarProps {
  onSimulationUpdate: () => void;
}

export function SimulatorControlBar({ onSimulationUpdate }: SimulatorControlBarProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [isTriggering, setIsTriggering] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  // Automatic tick loop
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isPlaying) {
      timer = setInterval(async () => {
        try {
          await fetch('/api/simulator', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'tick' }),
          });
          onSimulationUpdate();
        } catch {
          // Ignore polling errors
        }
      }, 3500);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPlaying, onSimulationUpdate]);

  const handleAction = async (action: 'flash_flood' | 'low_fuel' | 'reset') => {
    setIsTriggering(true);
    setStatusMsg(
      action === 'flash_flood'
        ? 'Generating AI-Triaged Flash Flood SOS...'
        : action === 'low_fuel'
        ? 'Generating Boat Low Fuel Alert...'
        : 'Resetting Data to Baseline...'
    );

    try {
      await fetch('/api/simulator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      onSimulationUpdate();
      setTimeout(() => setStatusMsg(null), 2500);
    } catch {
      setStatusMsg('Action failed');
      setTimeout(() => setStatusMsg(null), 2000);
    } finally {
      setIsTriggering(false);
    }
  };

  return (
    <aside aria-label="Demo Simulator" className="fixed bottom-4 right-6 z-[1500] select-none">
      <div className="bg-slate-900/95 backdrop-blur-md text-white rounded-2xl border border-slate-700/80 shadow-2xl p-3 max-w-md w-full transition-all">
        {/* Header / Toggle */}
        <div className="flex items-center justify-between gap-3 px-1">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-bold tracking-wide uppercase text-slate-200 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-orange-400" />
              <span>Mesh Demo Simulator</span>
            </span>
          </div>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>

        {/* Expanded Controls */}
        {isExpanded && (
          <div className="mt-3 pt-3 border-t border-slate-800 space-y-2.5">
            {/* Status Toast */}
            {statusMsg && (
              <div className="text-[11px] font-medium text-orange-300 bg-orange-950/60 border border-orange-500/30 px-2.5 py-1 rounded-lg animate-in fade-in flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-orange-400 shrink-0" />
                <span>{statusMsg}</span>
              </div>
            )}

            {/* Play / Pause Patrol Loop */}
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] text-slate-400 font-medium">
                Live Boat Patrol Motion:
              </span>
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs ${
                  isPlaying
                    ? 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                    : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
                }`}
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                <span>{isPlaying ? 'Pause Motion' : 'Start Live Patrols'}</span>
              </button>
            </div>

            {/* Scenario Triggers Grid */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                disabled={isTriggering}
                onClick={() => handleAction('flash_flood')}
                className="flex items-center justify-center gap-1.5 p-2 bg-red-950/70 hover:bg-red-900/80 border border-red-500/40 text-red-200 rounded-xl text-[11px] font-semibold transition-all cursor-pointer hover:border-red-400 disabled:opacity-50"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                <span>+ P1 Flood SOS</span>
              </button>

              <button
                disabled={isTriggering}
                onClick={() => handleAction('low_fuel')}
                className="flex items-center justify-center gap-1.5 p-2 bg-amber-950/70 hover:bg-amber-900/80 border border-amber-500/40 text-amber-200 rounded-xl text-[11px] font-semibold transition-all cursor-pointer hover:border-amber-400 disabled:opacity-50"
              >
                <Fuel className="w-3.5 h-3.5 text-amber-400" />
                <span>+ P2 Low Fuel</span>
              </button>
            </div>

            {/* Reset Button */}
            <button
              disabled={isTriggering}
              onClick={() => handleAction('reset')}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-300 rounded-xl text-[11px] font-medium transition-all cursor-pointer disabled:opacity-50"
            >
              <RotateCcw className="w-3 h-3 text-slate-400" />
              <span>Reset State to Seed Baseline</span>
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
