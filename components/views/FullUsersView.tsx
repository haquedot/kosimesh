'use client';

import React, { useState } from 'react';
import { ConnectedDevice, Message } from '@/types/schema';
import { 
  Users, 
  Shield, 
  UserCheck, 
  HeartHandshake, 
  Search, 
  MapPin, 
  Smartphone, 
  Battery, 
  PhoneCall, 
  Send, 
  Radio, 
  Sparkles,
  CheckCircle2,
  Clock,
  Filter
} from 'lucide-react';

interface FullUsersViewProps {
  devices: ConnectedDevice[];
  messages: Message[];
  onSelectDevice?: (device: ConnectedDevice) => void;
  onOpenBroadcast?: () => void;
}

export function FullUsersView({
  devices,
  messages,
  onSelectDevice,
  onOpenBroadcast,
}: FullUsersViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');

  // Compute personnel data
  const usersList = devices.map((dev) => {
    // Count associated active messages or assigned missions
    const assignedTasks = messages.filter(
      (m) => m.assignedResponderId === dev.deviceId || m.senderId === dev.deviceId
    );
    const activeTasksCount = assignedTasks.filter((m) => m.status === 'IN_PROGRESS').length;

    let squad = 'Citizen Node';
    let rank = 'Registered Citizen';

    if (dev.role === 'RESPONDER') {
      if (dev.userName.toLowerCase().includes('ndrf') || dev.userName.toLowerCase().includes('rescue')) {
        squad = 'Search & Rescue Unit Alpha';
        rank = 'Squad Commander';
      } else if (dev.userName.toLowerCase().includes('sdrf') || dev.userName.toLowerCase().includes('boat')) {
        squad = 'Water Rescue Unit Beta';
        rank = 'Vessel Operator';
      } else if (dev.userName.toLowerCase().includes('medic') || dev.userName.toLowerCase().includes('health')) {
        squad = 'Emergency Medical Squad';
        rank = 'Field Paramedic';
      } else {
        squad = 'Field Response Team';
        rank = 'Tactical Responder';
      }
    }

    return {
      ...dev,
      squad,
      rank,
      activeTasksCount,
      totalInteractions: assignedTasks.length,
    };
  });

  const filteredUsers = usersList.filter((u) => {
    if (roleFilter !== 'ALL' && u.role !== roleFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        u.userName.toLowerCase().includes(q) ||
        u.deviceId.toLowerCase().includes(q) ||
        u.squad.toLowerCase().includes(q) ||
        u.locationName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const totalResponders = usersList.filter((u) => u.role === 'RESPONDER').length;
  const activeResponders = usersList.filter((u) => u.role === 'RESPONDER' && u.status === 'ONLINE').length;
  const totalCitizens = usersList.filter((u) => u.role === 'USER').length;

  return (
    <div className="flex-1 p-6 space-y-6 max-w-7xl w-full mx-auto animate-in fade-in duration-150">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Personnel, Responders & Citizen Roster
            </h1>
          </div>
          <p className="text-xs text-slate-500">
            Operational deployment hierarchy, responder squad statuses, and field mesh node assignments.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {onOpenBroadcast && (
            <button
              onClick={onOpenBroadcast}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Radio className="w-3.5 h-3.5" />
              <span>Broadcast to Personnel</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI mini strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div 
          onClick={() => setRoleFilter('RESPONDER')}
          className={`p-4 rounded-2xl border bg-white cursor-pointer transition-all ${
            roleFilter === 'RESPONDER' ? 'border-blue-500 ring-2 ring-blue-100 shadow-xs' : 'border-stone-200 hover:border-stone-300'
          }`}
        >
          <div className="text-[11px] font-bold text-blue-600 uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>Active Responders</span>
            <Shield className="w-3.5 h-3.5" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {activeResponders} <span className="text-xs font-medium text-slate-400">/ {totalResponders} Deployed</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Online tactical field units</div>
        </div>

        <div 
          onClick={() => setRoleFilter('USER')}
          className={`p-4 rounded-2xl border bg-white cursor-pointer transition-all ${
            roleFilter === 'USER' ? 'border-orange-500 ring-2 ring-orange-100 shadow-xs' : 'border-stone-200 hover:border-stone-300'
          }`}
        >
          <div className="text-[11px] font-bold text-orange-600 uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>Registered Citizens</span>
            <HeartHandshake className="w-3.5 h-3.5" />
          </div>
          <div className="text-2xl font-black text-slate-900">{totalCitizens}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Connected mesh civilian nodes</div>
        </div>

        <div className="p-4 rounded-2xl border border-stone-200 bg-white shadow-xs">
          <div className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>Deployment Readiness</span>
            <CheckCircle2 className="w-3.5 h-3.5" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {Math.round((activeResponders / (totalResponders || 1)) * 100)}%
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Field coverage efficiency</div>
        </div>
      </div>

      {/* Filter and Search Bar Card */}
      <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search personnel by name, squad, device ID, or active sector..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
            />
          </div>

          <div className="flex items-center bg-stone-100 p-0.5 rounded-xl border border-stone-200 text-xs">
            {[
              { id: 'ALL', label: 'All Personnel' },
              { id: 'RESPONDER', label: 'Tactical Responders' },
              { id: 'USER', label: 'Citizens' },
            ].map((r) => (
              <button
                key={r.id}
                onClick={() => setRoleFilter(r.id)}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  roleFilter === r.id ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Roster Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredUsers.map((user) => (
          <div
            key={user.deviceId}
            className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs hover:border-stone-300 transition-all flex flex-col justify-between"
          >
            <div>
              {/* Header */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                    user.role === 'RESPONDER'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-stone-100 text-slate-700'
                  }`}>
                    {user.userName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{user.userName}</h3>
                    <p className="text-xs text-slate-500 font-medium">{user.rank}</p>
                  </div>
                </div>

                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  user.status === 'ONLINE'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-slate-100 text-slate-500'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'ONLINE' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                  {user.status}
                </span>
              </div>

              {/* Squad & Sector Details */}
              <div className="space-y-2 py-3 border-y border-stone-100 text-xs text-slate-600 mb-3">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Assigned Squad:</span>
                  <span className="font-semibold text-slate-800">{user.squad}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Operational Sector:</span>
                  <span className="font-medium text-slate-800 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-orange-500" />
                    {user.locationName}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Mesh Node Hardware:</span>
                  <span className="font-mono text-slate-700 font-medium flex items-center gap-1">
                    <Smartphone className="w-3 h-3 text-slate-400" />
                    {user.deviceId}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Battery Level:</span>
                  <span className="font-mono font-bold text-slate-800 flex items-center gap-1">
                    <Battery className={`w-3.5 h-3.5 ${user.battery < 20 ? 'text-red-500' : 'text-slate-400'}`} />
                    {user.battery}%
                  </span>
                </div>
              </div>

              {user.activeTasksCount > 0 && (
                <div className="mb-3 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-800 flex items-center justify-between">
                  <span className="font-semibold">Active Dispatch Mission</span>
                  <span className="font-bold bg-blue-200/80 px-2 py-0.5 rounded-md text-[11px]">
                    {user.activeTasksCount} In Progress
                  </span>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="pt-2 flex items-center justify-between gap-2">
              <button
                onClick={() => onSelectDevice?.(user)}
                className="flex-1 py-1.5 px-2.5 bg-stone-100 hover:bg-stone-200 text-slate-800 font-semibold text-xs rounded-xl transition-colors cursor-pointer text-center"
              >
                Telemetry
              </button>
              {onOpenBroadcast && (
                <button
                  onClick={onOpenBroadcast}
                  className="flex-1 py-1.5 px-2.5 bg-orange-50 hover:bg-orange-100 text-orange-700 font-bold text-xs rounded-xl transition-colors cursor-pointer text-center"
                >
                  Direct Msg
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
