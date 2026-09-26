'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Bell, 
  ChevronDown, 
  Radio, 
  X, 
  Loader2, 
  MessageSquare, 
  Smartphone, 
  Shield, 
  MapPin, 
  Sparkles,
  ArrowRight,
  Clock,
  Battery
} from 'lucide-react';
import { AdminDropdown } from './AdminDropdown';
import { Message, ConnectedDevice } from '@/types/schema';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  unreadCount: number;
  onOpenBroadcast?: () => void;
  onOpenNotifications?: () => void;
  onTriggerSimulation?: () => void;
  onSelectMessage?: (message: Message) => void;
  onSelectDevice?: (device: ConnectedDevice) => void;
  onNavigateTab?: (tab: string) => void;
}

export function Header({
  searchQuery,
  onSearchChange,
  unreadCount,
  onOpenBroadcast,
  onOpenNotifications,
  onTriggerSimulation,
  onSelectMessage,
  onSelectDevice,
  onNavigateTab,
}: HeaderProps) {
  const [isAdminDropdownOpen, setIsAdminDropdownOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [recommendedMessages, setRecommendedMessages] = useState<Message[]>([]);
  const [recommendedDevices, setRecommendedDevices] = useState<ConnectedDevice[]>([]);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Close search suggestions on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch recommendations from API when user types
  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (!trimmed) {
      setRecommendedMessages([]);
      setRecommendedDevices([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    setIsSearchOpen(true);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(async () => {
      try {
        const [msgRes, devRes] = await Promise.all([
          fetch(`/api/messages?search=${encodeURIComponent(trimmed)}`),
          fetch(`/api/devices?search=${encodeURIComponent(trimmed)}`),
        ]);

        if (msgRes.ok) {
          const msgData = await msgRes.json();
          setRecommendedMessages((msgData.messages || []).slice(0, 4));
        }

        if (devRes.ok) {
          const devData = await devRes.json();
          setRecommendedDevices((devData.devices || []).slice(0, 4));
        }
      } catch (err) {
        console.error('Search recommendation error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 200);

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [searchQuery]);

  const handleClearSearch = () => {
    onSearchChange('');
    setIsSearchOpen(false);
    setRecommendedMessages([]);
    setRecommendedDevices([]);
  };

  const hasResults = recommendedMessages.length > 0 || recommendedDevices.length > 0;

  return (
    <header className="h-16 bg-white border-b border-stone-200 px-6 flex items-center justify-between gap-4 sticky top-0 z-40 shrink-0">
      {/* Search Input with API Recommendations matching UI.png */}
      <div ref={searchContainerRef} className="relative w-full max-w-md">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onFocus={() => {
              if (searchQuery.trim()) setIsSearchOpen(true);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Escape') setIsSearchOpen(false);
            }}
            placeholder="Search messages, devices, locations..."
            className="w-full h-10 pl-10 pr-10 rounded-xl border border-stone-200 bg-stone-50/60 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all"
          />

          {isSearching ? (
            <Loader2 className="w-3.5 h-3.5 text-orange-500 animate-spin absolute right-3.5 top-1/2 -translate-y-1/2" />
          ) : searchQuery.trim() ? (
            <button
              onClick={handleClearSearch}
              className="w-5 h-5 rounded-full hover:bg-stone-200 text-slate-400 hover:text-slate-600 flex items-center justify-center absolute right-3 top-1/2 -translate-y-1/2 transition-colors cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          ) : null}
        </div>

        {/* Live Search Recommendations Dropdown */}
        {isSearchOpen && searchQuery.trim().length > 0 && (
          <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl border border-stone-200 shadow-2xl overflow-hidden z-[2300] max-h-[480px] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
            {isSearching && !hasResults ? (
              <div className="p-6 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-orange-500" />
                <span>Searching mesh network...</span>
              </div>
            ) : !hasResults ? (
              <div className="p-6 text-center text-xs text-slate-500">
                <p className="font-semibold text-slate-700">No direct matches found</p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Try searching for keywords like &quot;water&quot;, &quot;roof&quot;, &quot;P1&quot;, &quot;NODE&quot;, or &quot;Alpha&quot;.
                </p>
              </div>
            ) : (
              <div className="p-3 space-y-3">
                {/* 1. Emergency Incidents Matches */}
                {recommendedMessages.length > 0 && (
                  <div>
                    <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <MessageSquare className="w-3 h-3 text-orange-500" />
                        Emergency Incidents ({recommendedMessages.length})
                      </span>
                      {onNavigateTab && (
                        <button
                          onClick={() => {
                            onNavigateTab('messages');
                            setIsSearchOpen(false);
                          }}
                          className="text-orange-600 hover:underline font-semibold cursor-pointer"
                        >
                          View all in Messages
                        </button>
                      )}
                    </div>

                    <div className="mt-1 space-y-1">
                      {recommendedMessages.map((msg) => (
                        <div
                          key={msg.id}
                          onClick={() => {
                            if (onSelectMessage) onSelectMessage(msg);
                            setIsSearchOpen(false);
                          }}
                          className="p-2.5 rounded-xl hover:bg-stone-50 transition-colors cursor-pointer border border-transparent hover:border-stone-200 group"
                        >
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <div className="flex items-center gap-1.5 truncate">
                              <span
                                className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded ${
                                  msg.severity === 'P1'
                                    ? 'bg-red-500 text-white'
                                    : msg.severity === 'P2'
                                    ? 'bg-orange-500 text-white'
                                    : 'bg-amber-500 text-white'
                                }`}
                              >
                                {msg.severity}
                              </span>
                              <span className="text-xs font-bold text-slate-900 truncate">
                                {msg.senderName}
                              </span>
                              <span className="text-[10px] text-slate-400 font-medium">
                                ({msg.locationName})
                              </span>
                            </div>

                            <span className="text-[10px] text-slate-400 font-mono shrink-0">
                              {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>

                          <p className="text-xs text-slate-600 line-clamp-1 group-hover:text-slate-900">
                            {msg.message}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2. Connected Nodes / Responders */}
                {recommendedDevices.length > 0 && (
                  <div className="pt-2 border-t border-stone-100">
                    <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Smartphone className="w-3 h-3 text-blue-500" />
                        Connected Nodes ({recommendedDevices.length})
                      </span>
                      {onNavigateTab && (
                        <button
                          onClick={() => {
                            onNavigateTab('devices');
                            setIsSearchOpen(false);
                          }}
                          className="text-orange-600 hover:underline font-semibold cursor-pointer"
                        >
                          View all in Devices
                        </button>
                      )}
                    </div>

                    <div className="mt-1 space-y-1">
                      {recommendedDevices.map((dev) => (
                        <div
                          key={dev.deviceId}
                          onClick={() => {
                            if (onSelectDevice) onSelectDevice(dev);
                            setIsSearchOpen(false);
                          }}
                          className="p-2 rounded-xl hover:bg-stone-50 transition-colors cursor-pointer border border-transparent hover:border-stone-200 flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2">
                            <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                              dev.role === 'RESPONDER' ? 'bg-blue-100 text-blue-700' : 'bg-stone-100 text-slate-700'
                            }`}>
                              {dev.role === 'RESPONDER' ? <Shield className="w-3 h-3" /> : <Smartphone className="w-3 h-3" />}
                            </div>
                            <div>
                              <div className="text-xs font-bold text-slate-900">{dev.userName}</div>
                              <div className="text-[10px] text-slate-400 font-mono">
                                {dev.deviceId} • {dev.locationName}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 text-[11px] font-mono text-slate-600">
                            <Battery className={`w-3.5 h-3.5 ${dev.battery < 20 ? 'text-red-500' : 'text-slate-400'}`} />
                            <span>{dev.battery}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Quick Filter Shortcuts Footer */}
            <div className="px-3 py-2 bg-stone-50 border-t border-stone-100 flex items-center justify-between text-[11px] text-slate-500">
              <span className="flex items-center gap-1">
                <span>Press</span>
                <kbd className="px-1.5 py-0.5 rounded bg-white border border-stone-200 font-mono text-[10px] shadow-2xs">ESC</kbd>
                <span>to close</span>
              </span>
              <span className="font-medium text-orange-600">
                Filtered active view
              </span>
            </div>
          </div>
        )}
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

        {/* Notification Bell with Badge */}
        <button
          onClick={onOpenNotifications}
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

        {/* User Pill with Admin Dropdown */}
        <div className="relative">
          <div
            onClick={() => setIsAdminDropdownOpen(!isAdminDropdownOpen)}
            className="flex items-center gap-2.5 pl-3 border-l border-stone-200 cursor-pointer group select-none"
          >
            <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center text-xs font-bold shadow-xs">
              A
            </div>
            <div className="text-xs font-semibold text-slate-800 hidden sm:block">
              Admin
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-colors" />
          </div>

          <AdminDropdown
            isOpen={isAdminDropdownOpen}
            onClose={() => setIsAdminDropdownOpen(false)}
            onTriggerSimulation={onTriggerSimulation}
          />
        </div>
      </div>
    </header>
  );
}
