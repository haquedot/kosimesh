'use client';

import React, { useState } from 'react';
import { ConnectedDevice } from '@/types/schema';
import { 
  Search, 
  Smartphone, 
  Shield, 
  User, 
  Battery, 
  BatteryWarning, 
  Wifi, 
  WifiOff, 
  MapPin, 
  Radio, 
  Filter, 
  ArrowUpDown,
  ExternalLink,
  Send,
  Sparkles,
  RefreshCw,
  Plus
} from 'lucide-react';

interface FullDevicesViewProps {
  devices: ConnectedDevice[];
  onSelectDevice: (device: ConnectedDevice) => void;
  onOpenBroadcast?: () => void;
  onNavigateToMap?: () => void;
}

export function FullDevicesView({
  devices,
  onSelectDevice,
  onOpenBroadcast,
  onNavigateToMap,
}: FullDevicesViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'battery' | 'name' | 'lastSeen'>('battery');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [isPinging, setIsPinging] = useState<string | null>(null);

  const handlePing = (deviceId: string) => {
    setIsPinging(deviceId);
    setTimeout(() => {
      setIsPinging(null);
    }, 1200);
  };

  // Filter and sort
  const filteredDevices = devices
    .filter((d) => {
      if (roleFilter !== 'ALL' && d.role !== roleFilter) return false;
      if (statusFilter === 'ONLINE' && d.status !== 'ONLINE') return false;
      if (statusFilter === 'OFFLINE' && d.status !== 'OFFLINE') return false;
      if (statusFilter === 'LOW_BATTERY' && d.battery >= 25) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          d.deviceId.toLowerCase().includes(q) ||
          d.userName.toLowerCase().includes(q) ||
          d.locationName.toLowerCase().includes(q)
        );
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'battery') return a.battery - b.battery;
      if (sortBy === 'name') return a.userName.localeCompare(b.userName);
      return new Date(b.lastSeen).getTime() - new Date(a.lastSeen).getTime();
    });

  const onlineCount = devices.filter((d) => d.status === 'ONLINE').length;
  const responderCount = devices.filter((d) => d.role === 'RESPONDER').length;
  const lowBatteryCount = devices.filter((d) => d.battery < 25).length;
  const avgBattery = Math.round(
    devices.reduce((acc, d) => acc + d.battery, 0) / (devices.length || 1)
  );

  return (
    <div className="flex-1 p-6 space-y-6 max-w-7xl w-full mx-auto animate-in fade-in duration-150">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
              <Smartphone className="w-4 h-4" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Mesh Fleet & Connected Nodes Console
            </h1>
          </div>
          <p className="text-xs text-slate-500">
            Real-time multi-hop telemetry, battery health monitoring, and direct RF node management.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {onOpenBroadcast && (
            <button
              onClick={onOpenBroadcast}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Radio className="w-3.5 h-3.5" />
              <span>Broadcast to Fleet</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI mini strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div 
          onClick={() => setStatusFilter('ONLINE')}
          className={`p-4 rounded-2xl border bg-white cursor-pointer transition-all ${
            statusFilter === 'ONLINE' ? 'border-emerald-500 ring-2 ring-emerald-100 shadow-xs' : 'border-stone-200 hover:border-stone-300'
          }`}
        >
          <div className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>Online Nodes</span>
            <Wifi className="w-3.5 h-3.5" />
          </div>
          <div className="text-2xl font-black text-slate-900">{onlineCount} <span className="text-xs font-medium text-slate-400">/ {devices.length}</span></div>
          <div className="text-[10px] text-slate-500 mt-0.5">Active mesh relays</div>
        </div>

        <div 
          onClick={() => setRoleFilter('RESPONDER')}
          className={`p-4 rounded-2xl border bg-white cursor-pointer transition-all ${
            roleFilter === 'RESPONDER' ? 'border-blue-500 ring-2 ring-blue-100 shadow-xs' : 'border-stone-200 hover:border-stone-300'
          }`}
        >
          <div className="text-[11px] font-bold text-blue-600 uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>Field Responders</span>
            <Shield className="w-3.5 h-3.5" />
          </div>
          <div className="text-2xl font-black text-slate-900">{responderCount}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Dispatched rescue units</div>
        </div>

        <div 
          onClick={() => setStatusFilter('LOW_BATTERY')}
          className={`p-4 rounded-2xl border bg-white cursor-pointer transition-all ${
            statusFilter === 'LOW_BATTERY' ? 'border-amber-500 ring-2 ring-amber-100 shadow-xs' : 'border-stone-200 hover:border-stone-300'
          }`}
        >
          <div className="text-[11px] font-bold text-amber-600 uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>Low Battery Alert</span>
            <BatteryWarning className="w-3.5 h-3.5" />
          </div>
          <div className="text-2xl font-black text-slate-900">{lowBatteryCount}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">&lt; 25% battery reserve</div>
        </div>

        <div className="p-4 rounded-2xl border border-stone-200 bg-white shadow-xs">
          <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>Fleet Health</span>
            <Battery className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="text-2xl font-black text-slate-900">{avgBattery}%</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Average battery reserve</div>
        </div>
      </div>

      {/* Filter and Search Bar Card */}
      <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Node ID (e.g. NODE-001), responder name, or operational sector..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
            />
          </div>

          {/* View mode toggle */}
          <div className="flex items-center bg-stone-100 p-0.5 rounded-xl border border-stone-200 text-xs">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                viewMode === 'table' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Table View
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                viewMode === 'grid' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Grid Cards
            </button>
          </div>
        </div>

        {/* Filter Pills Row */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-stone-100">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1 mr-1">
              <Filter className="w-3 h-3" /> Filters:
            </span>

            {/* Role */}
            <div className="flex items-center bg-stone-100 p-0.5 rounded-lg border border-stone-200 text-xs">
              {[
                { id: 'ALL', label: 'All Roles' },
                { id: 'RESPONDER', label: 'Responders' },
                { id: 'USER', label: 'Citizens' },
              ].map((r) => (
                <button
                  key={r.id}
                  onClick={() => setRoleFilter(r.id)}
                  className={`px-2 py-1 rounded-md font-medium transition-all cursor-pointer ${
                    roleFilter === r.id
                      ? 'bg-white text-slate-900 shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>

            {/* Status */}
            <div className="flex items-center bg-stone-100 p-0.5 rounded-lg border border-stone-200 text-xs">
              {[
                { id: 'ALL', label: 'All Status' },
                { id: 'ONLINE', label: 'Online' },
                { id: 'OFFLINE', label: 'Offline' },
                { id: 'LOW_BATTERY', label: 'Low Battery' },
              ].map((st) => (
                <button
                  key={st.id}
                  onClick={() => setStatusFilter(st.id)}
                  className={`px-2 py-1 rounded-md font-medium transition-all cursor-pointer ${
                    statusFilter === st.id
                      ? 'bg-white text-slate-900 shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>

            {/* Sort by */}
            <div className="flex items-center gap-1.5 text-xs text-slate-600 pl-2">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <span>Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'battery' | 'name' | 'lastSeen')}
                className="bg-stone-50 border border-stone-200 rounded-lg px-2 py-1 text-xs text-slate-800 font-semibold focus:outline-none focus:border-orange-500 cursor-pointer"
              >
                <option value="battery">Lowest Battery First</option>
                <option value="name">Name (A-Z)</option>
                <option value="lastSeen">Recently Seen</option>
              </select>
            </div>
          </div>

          {(roleFilter !== 'ALL' || statusFilter !== 'ALL' || searchQuery) && (
            <button
              onClick={() => {
                setRoleFilter('ALL');
                setStatusFilter('ALL');
                setSearchQuery('');
              }}
              className="text-xs text-orange-600 hover:text-orange-700 font-semibold cursor-pointer underline"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Device List Rendering */}
      {filteredDevices.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center shadow-xs">
          <Smartphone className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-700">No connected devices match filters</h3>
          <p className="text-xs text-slate-500 mt-1">
            Try adjusting your search criteria or reset filters.
          </p>
        </div>
      ) : viewMode === 'table' ? (
        /* Table View */
        <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-stone-100/70 border-b border-stone-200 text-slate-600 font-semibold">
                  <th className="py-3 px-4">Node / Device</th>
                  <th className="py-3 px-4">Assigned User</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Sector / GPS</th>
                  <th className="py-3 px-4">Battery Reserve</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Last Telemetry</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredDevices.map((dev) => (
                  <tr 
                    key={dev.deviceId} 
                    className="hover:bg-stone-50/80 transition-colors group cursor-pointer"
                    onClick={() => onSelectDevice(dev)}
                  >
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-mono font-bold text-slate-900">{dev.deviceId}</div>
                      <div className="text-[10px] text-slate-400">{dev.deviceType} Node</div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-bold text-slate-900">{dev.userName}</div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        dev.role === 'RESPONDER' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-stone-100 text-slate-700'
                      }`}>
                        {dev.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="text-slate-700 font-medium">{dev.locationName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {dev.latitude.toFixed(3)}, {dev.longitude.toFixed(3)}
                      </div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-stone-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              dev.battery > 50
                                ? 'bg-emerald-500'
                                : dev.battery > 20
                                ? 'bg-amber-500'
                                : 'bg-red-500'
                            }`}
                            style={{ width: `${dev.battery}%` }}
                          />
                        </div>
                        <span className="font-mono text-xs font-bold text-slate-700">
                          {dev.battery}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        dev.status === 'ONLINE' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${dev.status === 'ONLINE' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                        {dev.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-slate-400 font-mono text-[11px]">
                      {new Date(dev.lastSeen).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-right space-x-1.5" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handlePing(dev.deviceId)}
                        className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-slate-700 font-medium text-xs transition-colors cursor-pointer"
                        title="Send RF Ping"
                      >
                        {isPinging === dev.deviceId ? 'Pinging...' : 'Ping'}
                      </button>
                      <button
                        onClick={() => onSelectDevice(dev)}
                        className="px-2.5 py-1 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-700 font-bold text-xs transition-colors cursor-pointer"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Grid Cards View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDevices.map((dev) => (
            <div
              key={dev.deviceId}
              onClick={() => onSelectDevice(dev)}
              className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs hover:border-orange-300 hover:shadow-sm transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                      dev.role === 'RESPONDER' ? 'bg-blue-100 text-blue-700' : 'bg-stone-100 text-slate-700'
                    }`}>
                      {dev.role === 'RESPONDER' ? <Shield className="w-4 h-4" /> : <User className="w-4 h-4" />}
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-900">{dev.userName}</h3>
                      <p className="text-[10px] font-mono text-slate-400">{dev.deviceId}</p>
                    </div>
                  </div>

                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    dev.status === 'ONLINE' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${dev.status === 'ONLINE' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                    {dev.status}
                  </span>
                </div>

                <div className="space-y-2 text-xs text-slate-600 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Sector:</span>
                    <span className="font-semibold text-slate-800">{dev.locationName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Battery:</span>
                    <span className="font-mono font-bold text-slate-800">{dev.battery}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        dev.battery > 50 ? 'bg-emerald-500' : dev.battery > 20 ? 'bg-amber-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${dev.battery}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                <span className="text-[10px] font-mono text-slate-400">
                  Last seen {new Date(dev.lastSeen).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                <span className="text-orange-600 font-bold text-xs hover:underline">
                  View Telemetry →
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
