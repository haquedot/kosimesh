'use client';

import React, { useState } from 'react';
import { Message, MessageStatus, PriorityLevel } from '@/types/schema';
import { 
  Search, 
  Filter, 
  Sparkles, 
  Send, 
  UserCheck, 
  Clock, 
  MapPin, 
  Radio, 
  CheckCircle2, 
  AlertTriangle, 
  MessageSquare,
  SlidersHorizontal,
  ChevronRight,
  Shield,
  Check
} from 'lucide-react';

interface FullMessagesViewProps {
  messages: Message[];
  onSelectMessage: (message: Message) => void;
  onUpdateStatus: (id: string, status: MessageStatus, severity?: PriorityLevel) => Promise<void>;
  onReply: (message: Message) => void;
  onAssignResponder: (message: Message) => void;
  onOpenBroadcast?: () => void;
}

export function FullMessagesView({
  messages,
  onSelectMessage,
  onUpdateStatus,
  onReply,
  onAssignResponder,
  onOpenBroadcast,
}: FullMessagesViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Filtering
  const filteredMessages = messages.filter((m) => {
    if (severityFilter !== 'ALL' && m.severity !== severityFilter) return false;
    if (statusFilter !== 'ALL' && m.status !== statusFilter) return false;
    if (roleFilter !== 'ALL' && m.senderRole !== roleFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        m.message.toLowerCase().includes(q) ||
        m.senderName.toLowerCase().includes(q) ||
        m.locationName.toLowerCase().includes(q) ||
        (m.severityReason && m.severityReason.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const p1Count = messages.filter((m) => m.severity === 'P1').length;
  const unreadCount = messages.filter((m) => m.status === 'UNREAD').length;
  const inProgressCount = messages.filter((m) => m.status === 'IN_PROGRESS').length;
  const resolvedCount = messages.filter((m) => m.status === 'RESOLVED').length;

  return (
    <div className="flex-1 p-6 space-y-6 max-w-7xl w-full mx-auto animate-in fade-in duration-150">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
              <MessageSquare className="w-4 h-4" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Emergency Messages & AI Triage Console
            </h1>
          </div>
          <p className="text-xs text-slate-500">
            Real-time multi-hazard incoming transmissions prioritized via automated Gemini 2.5 Flash analysis.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {onOpenBroadcast && (
            <button
              onClick={onOpenBroadcast}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Radio className="w-3.5 h-3.5" />
              <span>Mesh Broadcast</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI mini strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div 
          onClick={() => setSeverityFilter('P1')}
          className={`p-4 rounded-2xl border bg-white cursor-pointer transition-all ${
            severityFilter === 'P1' ? 'border-red-500 ring-2 ring-red-100 shadow-xs' : 'border-stone-200 hover:border-stone-300'
          }`}
        >
          <div className="text-[11px] font-bold text-red-600 uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>Critical (P1)</span>
            <AlertTriangle className="w-3.5 h-3.5" />
          </div>
          <div className="text-2xl font-black text-slate-900">{p1Count}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Immediate dispatch required</div>
        </div>

        <div 
          onClick={() => setStatusFilter('UNREAD')}
          className={`p-4 rounded-2xl border bg-white cursor-pointer transition-all ${
            statusFilter === 'UNREAD' ? 'border-orange-500 ring-2 ring-orange-100 shadow-xs' : 'border-stone-200 hover:border-stone-300'
          }`}
        >
          <div className="text-[11px] font-bold text-orange-600 uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>Unread Queue</span>
            <Clock className="w-3.5 h-3.5" />
          </div>
          <div className="text-2xl font-black text-slate-900">{unreadCount}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Awaiting first triage action</div>
        </div>

        <div 
          onClick={() => setStatusFilter('IN_PROGRESS')}
          className={`p-4 rounded-2xl border bg-white cursor-pointer transition-all ${
            statusFilter === 'IN_PROGRESS' ? 'border-blue-500 ring-2 ring-blue-100 shadow-xs' : 'border-stone-200 hover:border-stone-300'
          }`}
        >
          <div className="text-[11px] font-bold text-blue-600 uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>In Progress</span>
            <Shield className="w-3.5 h-3.5" />
          </div>
          <div className="text-2xl font-black text-slate-900">{inProgressCount}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Responders actively deployed</div>
        </div>

        <div 
          onClick={() => setStatusFilter('RESOLVED')}
          className={`p-4 rounded-2xl border bg-white cursor-pointer transition-all ${
            statusFilter === 'RESOLVED' ? 'border-emerald-500 ring-2 ring-emerald-100 shadow-xs' : 'border-stone-200 hover:border-stone-300'
          }`}
        >
          <div className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>Resolved</span>
            <CheckCircle2 className="w-3.5 h-3.5" />
          </div>
          <div className="text-2xl font-black text-slate-900">{resolvedCount}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Successfully closed cases</div>
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
              placeholder="Search emergency transcripts, victims, sectors, or AI triage reasons..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
            />
          </div>

          {/* View mode toggle */}
          <div className="flex items-center bg-stone-100 p-0.5 rounded-xl border border-stone-200 text-xs">
            <button
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                viewMode === 'cards' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Card Feed
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                viewMode === 'table' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Dense Table
            </button>
          </div>
        </div>

        {/* Filter Pills Row */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-stone-100">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1 mr-1">
              <Filter className="w-3 h-3" /> Filters:
            </span>

            {/* Severity */}
            <div className="flex items-center bg-stone-100 p-0.5 rounded-lg border border-stone-200 text-xs">
              {['ALL', 'P1', 'P2', 'P3', 'P4'].map((sev) => (
                <button
                  key={sev}
                  onClick={() => setSeverityFilter(sev)}
                  className={`px-2 py-1 rounded-md font-bold transition-all cursor-pointer ${
                    severityFilter === sev
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

            {/* Status */}
            <div className="flex items-center bg-stone-100 p-0.5 rounded-lg border border-stone-200 text-xs">
              {[
                { id: 'ALL', label: 'All Status' },
                { id: 'UNREAD', label: 'Unread' },
                { id: 'ACKNOWLEDGED', label: 'Ack' },
                { id: 'IN_PROGRESS', label: 'In Progress' },
                { id: 'RESOLVED', label: 'Resolved' },
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

            {/* Role */}
            <div className="flex items-center bg-stone-100 p-0.5 rounded-lg border border-stone-200 text-xs">
              {[
                { id: 'ALL', label: 'All Senders' },
                { id: 'USER', label: 'Citizens' },
                { id: 'RESPONDER', label: 'Responders' },
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
          </div>

          {(severityFilter !== 'ALL' || statusFilter !== 'ALL' || roleFilter !== 'ALL' || searchQuery) && (
            <button
              onClick={() => {
                setSeverityFilter('ALL');
                setStatusFilter('ALL');
                setRoleFilter('ALL');
                setSearchQuery('');
              }}
              className="text-xs text-orange-600 hover:text-orange-700 font-semibold cursor-pointer underline"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Messages List Area */}
      {filteredMessages.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center shadow-xs">
          <MessageSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-700">No emergency messages found</h3>
          <p className="text-xs text-slate-500 mt-1">
            Try adjusting your search query or reset active filters.
          </p>
        </div>
      ) : viewMode === 'cards' ? (
        /* Cards View */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredMessages.map((msg) => (
            <div
              key={msg.id}
              className={`bg-white rounded-2xl border p-5 shadow-xs transition-all flex flex-col justify-between ${
                msg.severity === 'P1'
                  ? 'border-l-4 border-l-red-500 border-stone-200 hover:border-red-300'
                  : msg.severity === 'P2'
                  ? 'border-l-4 border-l-orange-500 border-stone-200 hover:border-orange-300'
                  : 'border-stone-200 hover:border-stone-300'
              }`}
            >
              <div>
                {/* Card Top Metadata */}
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
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
                    <span className="text-xs font-bold text-slate-900 truncate">
                      {msg.senderName}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-stone-100 text-slate-600 font-medium">
                      {msg.senderRole}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>

                {/* Message Body */}
                <p className="text-xs text-slate-800 leading-relaxed font-medium mb-3">
                  {msg.message}
                </p>

                {/* Gemini AI Triage Reason Box */}
                {msg.severityReason && (
                  <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-2.5 mb-3 flex items-start gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-[11px] text-amber-900 leading-tight">
                      <strong className="font-semibold">AI Triage:</strong> {msg.severityReason}
                    </p>
                  </div>
                )}

                {/* Location Pill */}
                <div className="flex items-center gap-1 text-[11px] text-slate-500 mb-4">
                  <MapPin className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                  <span className="truncate">{msg.locationName || 'Field Operational Zone'}</span>
                  {msg.latitude && msg.longitude && (
                    <span className="font-mono text-[10px] text-slate-400">
                      ({msg.latitude.toFixed(3)}, {msg.longitude.toFixed(3)})
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons Footer */}
              <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onSelectMessage(msg)}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-orange-50 text-orange-700 hover:bg-orange-100 font-bold text-xs transition-colors cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>AI Insights</span>
                  </button>

                  <button
                    onClick={() => onReply(msg)}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-stone-100 text-slate-700 hover:bg-stone-200 font-semibold text-xs transition-colors cursor-pointer"
                  >
                    <Send className="w-3 h-3" />
                    <span>Reply</span>
                  </button>

                  <button
                    onClick={() => onAssignResponder(msg)}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-stone-100 text-slate-700 hover:bg-stone-200 font-semibold text-xs transition-colors cursor-pointer"
                  >
                    <UserCheck className="w-3 h-3" />
                    <span>Dispatch</span>
                  </button>
                </div>

                {/* Fast status toggle */}
                <select
                  value={msg.status}
                  onChange={(e) => onUpdateStatus(msg.id, e.target.value as MessageStatus)}
                  className="text-[11px] font-bold rounded-lg border border-stone-200 px-2 py-1 bg-stone-50 text-slate-700 focus:outline-none focus:border-orange-500 cursor-pointer"
                >
                  <option value="UNREAD">UNREAD</option>
                  <option value="ACKNOWLEDGED">ACK</option>
                  <option value="IN_PROGRESS">IN PROGRESS</option>
                  <option value="RESOLVED">RESOLVED</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Dense Table View */
        <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-stone-100/70 border-b border-stone-200 text-slate-600 font-semibold">
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Sender</th>
                  <th className="py-3 px-4">Message Transcript</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Time</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredMessages.map((msg) => (
                  <tr key={msg.id} className="hover:bg-stone-50/80 transition-colors">
                    <td className="py-3 px-4 whitespace-nowrap">
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
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-bold text-slate-900">{msg.senderName}</div>
                      <div className="text-[10px] text-slate-500">{msg.senderRole}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-800 line-clamp-2 max-w-md">{msg.message}</div>
                      {msg.severityReason && (
                        <div className="text-[10px] text-amber-700 truncate max-w-sm mt-0.5">
                          💡 {msg.severityReason}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-slate-600">
                      {msg.locationName}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        msg.status === 'UNREAD' ? 'bg-red-100 text-red-700' :
                        msg.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' :
                        msg.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-700' :
                        'bg-stone-100 text-slate-700'
                      }`}>
                        {msg.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-slate-400 font-mono text-[11px]">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-right space-x-1.5">
                      <button
                        onClick={() => onSelectMessage(msg)}
                        className="px-2 py-1 rounded bg-orange-50 text-orange-700 hover:bg-orange-100 font-bold text-xs transition-colors cursor-pointer"
                      >
                        Insights
                      </button>
                      <button
                        onClick={() => onReply(msg)}
                        className="px-2 py-1 rounded bg-stone-100 text-slate-700 hover:bg-stone-200 font-medium text-xs transition-colors cursor-pointer"
                      >
                        Reply
                      </button>
                      <button
                        onClick={() => onAssignResponder(msg)}
                        className="px-2 py-1 rounded bg-stone-100 text-slate-700 hover:bg-stone-200 font-medium text-xs transition-colors cursor-pointer"
                      >
                        Dispatch
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
