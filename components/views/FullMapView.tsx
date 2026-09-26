'use client';

import React, { useState } from 'react';
import { ConnectedDevice, Message } from '@/types/schema';
import { LiveMeshMap } from '../map/LiveMeshMap';
import { 
  Radio, 
  AlertTriangle, 
  Users, 
  Compass, 
  SlidersHorizontal,
  ChevronRight,
  ChevronLeft,
  Search,
  Battery,
  Shield,
  Clock,
  Sparkles
} from 'lucide-react';

interface FullMapViewProps {
  devices: ConnectedDevice[];
  messages: Message[];
  onSelectMessage: (message: Message) => void;
  onSelectDevice?: (device: ConnectedDevice) => void;
  onOpenBroadcast?: () => void;
}

export function FullMapView({
  devices,
  messages,
  onSelectMessage,
  onSelectDevice,
  onOpenBroadcast,
}: FullMapViewProps) {
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');
  const [filterRole, setFilterRole] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Filter messages
  const filteredMessages = messages.filter((m) => {
    if (filterSeverity !== 'ALL' && m.severity !== filterSeverity) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        m.message.toLowerCase().includes(q) ||
        m.senderName.toLowerCase().includes(q) ||
        m.locationName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Filter devices
  const filteredDevices = devices.filter((d) => {
    if (filterRole !== 'ALL' && d.role !== filterRole) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        d.userName.toLowerCase().includes(q) ||
        d.deviceId.toLowerCase().includes(q) ||
        d.locationName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const p1Count = messages.filter((m) => m.severity === 'P1' && m.status !== 'RESOLVED').length;
  const onlineCount = devices.filter((d) => d.status === 'ONLINE').length;
  const responderCount = devices.filter((d) => d.role === 'RESPONDER' && d.status === 'ONLINE').length;

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-4.25rem)] bg-stone-50 overflow-hidden">
      {/* Top Filter Bar */}
      <div className="bg-white border-b border-stone-200 px-6 py-3 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h1 className="text-sm font-bold text-slate-900 tracking-tight">
              Tactical Mesh Map Console
            </h1>
          </div>

          <div className="h-4 w-px bg-stone-200" />

          {/* Quick Metrics Pills */}
          <div className="flex items-center gap-2 text-xs">
            <span className="px-2.5 py-1 rounded-full bg-stone-100 text-stone-700 font-medium flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-stone-500" />
              {onlineCount} Online Nodes
            </span>
            <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 font-medium flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-blue-600" />
              {responderCount} Responders
            </span>
            {p1Count > 0 && (
              <span className="px-2.5 py-1 rounded-full bg-red-50 text-red-700 font-bold flex items-center gap-1.5 animate-pulse">
                <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                {p1Count} Critical Incidents
              </span>
            )}
          </div>
        </div>

        {/* Filters and Search */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter sector or node..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-200 w-48"
            />
          </div>

          {/* Severity filter pills */}
          <div className="flex items-center bg-stone-100 p-0.5 rounded-lg border border-stone-200 text-xs">
            {['ALL', 'P1', 'P2', 'P3'].map((sev) => (
              <button
                key={sev}
                onClick={() => setFilterSeverity(sev)}
                className={`px-2 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                  filterSeverity === sev
                    ? sev === 'P1'
                      ? 'bg-red-600 text-white shadow-xs'
                      : sev === 'P2'
                      ? 'bg-orange-500 text-white shadow-xs'
                      : sev === 'P3'
                      ? 'bg-amber-500 text-white shadow-xs'
                      : 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>

          {/* Role filter */}
          <div className="flex items-center bg-stone-100 p-0.5 rounded-lg border border-stone-200 text-xs">
            {['ALL', 'RESPONDER', 'USER'].map((r) => (
              <button
                key={r}
                onClick={() => setFilterRole(r)}
                className={`px-2 py-1 rounded-md font-medium transition-all cursor-pointer ${
                  filterRole === r
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {r === 'ALL' ? 'All Roles' : r === 'RESPONDER' ? 'Responders' : 'Citizens'}
              </button>
            ))}
          </div>

          {onOpenBroadcast && (
            <button
              onClick={onOpenBroadcast}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-semibold text-xs rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <Radio className="w-3.5 h-3.5" />
              <span>Broadcast</span>
            </button>
          )}

          {/* Toggle telemetry panel */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-lg border border-stone-200 bg-white text-slate-600 hover:bg-stone-100 transition-colors cursor-pointer"
            title={sidebarOpen ? 'Collapse side panel' : 'Expand side panel'}
          >
            {sidebarOpen ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Tactical Split: Map + Side Telemetry Panel */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* The Live Map */}
        <div className="flex-1 h-full relative">
          <LiveMeshMap
            devices={filteredDevices}
            messages={filteredMessages}
            onSelectMessage={onSelectMessage}
            onSelectDevice={onSelectDevice}
            heightClass="h-full"
          />
        </div>

        {/* Collapsible Telemetry & Incidents Radar */}
        {sidebarOpen && (
          <div className="w-80 border-l border-stone-200 bg-white flex flex-col shrink-0 h-full overflow-hidden shadow-lg z-10 animate-in slide-in-from-right duration-200">
            <div className="p-4 border-b border-stone-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-orange-600" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Live Radar Feed
                </h3>
              </div>
              <span className="text-[11px] font-semibold text-slate-500">
                {filteredMessages.length} Incidents
              </span>
            </div>

            {/* Incidents Stream */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
              {filteredMessages.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  No active incidents matching filters.
                </div>
              ) : (
                filteredMessages.map((msg) => (
                  <div
                    key={msg.id}
                    onClick={() => onSelectMessage(msg)}
                    className="p-3 rounded-xl border border-stone-200 bg-stone-50 hover:bg-white hover:border-orange-300 hover:shadow-xs transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                          msg.severity === 'P1'
                            ? 'bg-red-500 text-white'
                            : msg.severity === 'P2'
                            ? 'bg-orange-500 text-white'
                            : msg.severity === 'P3'
                            ? 'bg-amber-500 text-white'
                            : 'bg-slate-500 text-white'
                        }`}
                      >
                        {msg.severity}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <p className="text-xs font-semibold text-slate-900 line-clamp-2 leading-relaxed mb-1.5">
                      {msg.message}
                    </p>

                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span className="font-medium text-slate-700 truncate max-w-[120px]">
                        {msg.senderName}
                      </span>
                      <span className="text-orange-600 font-medium group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                        Inspect <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Active Nodes Mini Strip */}
            <div className="p-3 border-t border-stone-100 bg-stone-50">
              <div className="text-[11px] font-bold text-slate-700 mb-2 flex items-center justify-between">
                <span>Active Mesh Units ({filteredDevices.length})</span>
                <span className="text-emerald-600 font-semibold">{onlineCount} connected</span>
              </div>
              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {filteredDevices.slice(0, 6).map((dev) => (
                  <div
                    key={dev.deviceId}
                    onClick={() => onSelectDevice?.(dev)}
                    className="flex items-center justify-between text-xs p-1.5 bg-white rounded-lg border border-stone-200 hover:border-orange-300 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className={`w-2 h-2 rounded-full ${dev.status === 'ONLINE' ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                      <span className="font-medium text-slate-800 truncate">{dev.userName}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-slate-500 shrink-0 font-mono">
                      <Battery className={`w-3 h-3 ${dev.battery < 20 ? 'text-red-500' : 'text-slate-400'}`} />
                      {dev.battery}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
