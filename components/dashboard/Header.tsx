'use client';

import React from 'react';
import { Search, Bell, ChevronDown, Radio } from 'lucide-react';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  unreadCount: number;
  onOpenBroadcast?: () => void;
}

export function Header({ searchQuery, onSearchChange, unreadCount, onOpenBroadcast }: HeaderProps) {
  return (
    <header className="h-16 bg-white border-b border-stone-200 px-6 flex items-center justify-between gap-4 sticky top-0 z-40">
      {/* Search Input matching UI.png */}
      <div className="relative w-full max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search messages, devices, locations..."
          className="w-full h-10 pl-10 pr-4 rounded-xl border border-stone-200 bg-stone-50/60 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all"
        />
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Emergency Broadcast Button */}
        {onOpenBroadcast && (
          <button
            onClick={onOpenBroadcast}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-2xs"
          >
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span className="hidden sm:inline">Emergency Broadcast</span>
          </button>
        )}

        {/* Notification Bell with Badge 12 matching UI.png */}
        <button
          title="Notifications"
          className="relative w-9 h-9 rounded-xl hover:bg-stone-100 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute 1.5 top-1.5 -right-1 bg-orange-500 text-white text-[9px] font-bold h-4 min-w-4 px-1 rounded-full flex items-center justify-center border-2 border-white">
              {unreadCount}
            </span>
          )}
        </button>

        {/* User Pill */}
        <div className="flex items-center gap-2.5 pl-3 border-l border-stone-200 cursor-pointer group">
          <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center text-xs font-bold shadow-xs">
            A
          </div>
          <div className="text-xs font-semibold text-slate-800 hidden sm:block">
            Admin
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-colors" />
        </div>
      </div>
    </header>
  );
}
