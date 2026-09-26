'use client';

import React, { useRef, useEffect } from 'react';
import { 
  Shield, 
  Database, 
  Cpu, 
  Radio, 
  Volume2, 
  RefreshCw, 
  Power, 
  Activity,
  CheckCircle2,
  Sliders,
  Settings
} from 'lucide-react';
import { playEmergencyChime } from '../common/EmergencyAudioChime';

interface AdminDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onTriggerSimulation?: () => void;
  onResetData?: () => void;
}

export function AdminDropdown({
  isOpen,
  onClose,
  onTriggerSimulation,
  onResetData,
}: AdminDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl border border-stone-200 shadow-xl py-2 z-[2200] animate-in fade-in zoom-in-95 duration-150"
    >
      {/* Profile summary */}
      <div className="px-4 py-3 border-b border-stone-100 bg-stone-50/70">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-orange-500 text-white font-bold text-xs flex items-center justify-center shadow-xs">
            DC
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900">Duty Commander Alpha</div>
            <div className="text-[10px] text-slate-500 font-medium">Incident Command Post (EOC)</div>
          </div>
        </div>
        <div className="mt-2 flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>MESH GATEWAY CONNECTED (868 MHz)</span>
        </div>
      </div>

      {/* Diagnostics */}
      <div className="p-3 border-b border-stone-100 space-y-1.5 text-xs text-slate-600">
        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1 mb-1">
          System Diagnostics
        </div>

        <div className="flex items-center justify-between px-2 py-1 bg-stone-50 rounded-lg">
          <span className="flex items-center gap-1.5 text-slate-600">
            <Cpu className="w-3.5 h-3.5 text-orange-500" />
            <span>AI Triage Engine:</span>
          </span>
          <span className="font-semibold text-slate-900 text-[11px]">Gemini 2.5 Flash</span>
        </div>

        <div className="flex items-center justify-between px-2 py-1 bg-stone-50 rounded-lg">
          <span className="flex items-center gap-1.5 text-slate-600">
            <Database className="w-3.5 h-3.5 text-blue-500" />
            <span>Storage Layer:</span>
          </span>
          <span className="font-semibold text-slate-900 text-[11px]">Active Memory + Mongo</span>
        </div>

        <div className="flex items-center justify-between px-2 py-1 bg-stone-50 rounded-lg">
          <span className="flex items-center gap-1.5 text-slate-600">
            <Radio className="w-3.5 h-3.5 text-emerald-500" />
            <span>Radio Encryption:</span>
          </span>
          <span className="font-semibold text-slate-900 text-[11px]">AES-128 GCM</span>
        </div>
      </div>

      {/* Quick Tools */}
      <div className="p-2 space-y-1 text-xs">
        <button
          onClick={() => {
            playEmergencyChime();
          }}
          className="w-full text-left px-3 py-2 rounded-xl hover:bg-stone-100 text-slate-700 flex items-center justify-between transition-colors cursor-pointer"
        >
          <span className="flex items-center gap-2 font-medium">
            <Volume2 className="w-3.5 h-3.5 text-slate-500" />
            <span>Test Emergency Alarm</span>
          </span>
          <span className="text-[10px] text-slate-400 font-mono">Chime</span>
        </button>

        {onTriggerSimulation && (
          <button
            onClick={() => {
              onTriggerSimulation();
              onClose();
            }}
            className="w-full text-left px-3 py-2 rounded-xl hover:bg-stone-100 text-slate-700 flex items-center justify-between transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-2 font-medium">
              <Activity className="w-3.5 h-3.5 text-orange-500" />
              <span>Trigger Patrol Simulation</span>
            </span>
            <span className="text-[10px] text-orange-600 font-bold">Step</span>
          </button>
        )}
      </div>

      {/* Footer / Reset */}
      <div className="p-2 border-t border-stone-100">
        <button
          onClick={() => {
            window.location.reload();
          }}
          className="w-full text-left px-3 py-1.5 rounded-xl hover:bg-red-50 text-slate-600 hover:text-red-700 flex items-center gap-2 text-xs font-medium transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Hard Refresh Dashboard</span>
        </button>
      </div>
    </div>
  );
}
