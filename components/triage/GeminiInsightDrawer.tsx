'use client';

import React, { useState } from 'react';
import { Message, MessageStatus, PriorityLevel } from '@/types/schema';
import { X, Sparkles, AlertTriangle, Users, Clock, ShieldAlert, CheckCircle2, UserCheck, RefreshCw } from 'lucide-react';

interface GeminiInsightDrawerProps {
  message: Message | null;
  onClose: () => void;
  onUpdateStatus: (id: string, status: MessageStatus, severity?: PriorityLevel) => void;
  onAssignResponder?: (message: Message) => void;
  onReply?: (message: Message) => void;
}

export function GeminiInsightDrawer({
  message,
  onClose,
  onUpdateStatus,
  onAssignResponder,
  onReply,
}: GeminiInsightDrawerProps) {
  const [selectedSeverity, setSelectedSeverity] = useState<PriorityLevel | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  if (!message) return null;

  const analysis = message.geminiAnalysis;
  const currentSeverity = selectedSeverity || message.severity;

  const getSeverityBadge = (level: PriorityLevel) => {
    switch (level) {
      case 'P1':
        return 'bg-red-50 text-red-600 border border-red-200';
      case 'P2':
        return 'bg-orange-50 text-orange-600 border border-orange-200';
      case 'P3':
        return 'bg-amber-50 text-amber-600 border border-amber-200';
      case 'P4':
        return 'bg-slate-100 text-slate-700 border border-slate-200';
    }
  };

  const handleStatusChange = async (newStatus: MessageStatus) => {
    setIsUpdating(true);
    await onUpdateStatus(message.id, newStatus, selectedSeverity || undefined);
    setIsUpdating(false);
  };

  return (
    <div className="fixed inset-0 z-[2000] flex justify-end bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col border-l border-stone-200 overflow-hidden animate-in slide-in-from-right duration-250">
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50/70">
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-mono font-semibold text-slate-500 bg-white px-2 py-1 rounded-md border border-stone-200">
              {message.id}
            </span>
            <span className={`text-xs font-semibold px-2 py-1 rounded-md ${getSeverityBadge(currentSeverity)}`}>
              {currentSeverity} • {analysis?.severityLabel || 'INCIDENT'}
            </span>
            {message.status === 'RESOLVED' && (
              <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Resolved
              </span>
            )}
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-stone-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Sender & Metadata Card */}
          <div className="bg-stone-50 rounded-xl p-4 border border-stone-200">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs text-slate-400 font-medium">Reported by</div>
                <div className="text-sm font-semibold text-slate-900">{message.senderName}</div>
                <div className="text-xs text-slate-500 mt-0.5">
                  Role: <span className="font-medium text-slate-700">{message.senderRole}</span> • Device:{' '}
                  <span className="font-mono text-slate-700">{message.senderId}</span>
                </div>
              </div>

              <div className="text-right">
                <div className="text-xs text-slate-400 font-medium">Location</div>
                <div className="text-sm font-semibold text-slate-900">{message.locationName}</div>
                {message.latitude && message.longitude && (
                  <div className="text-[11px] font-mono text-slate-500">
                    {message.latitude.toFixed(4)}, {message.longitude.toFixed(4)}
                  </div>
                )}
              </div>
            </div>

            {/* Original Message Quote */}
            <div className="mt-3.5 pt-3 border-t border-stone-200/80">
              <div className="text-xs text-slate-400 font-medium mb-1">Message Content</div>
              <blockquote className="text-xs font-medium text-slate-800 bg-white p-3 rounded-lg border border-stone-200/60 leading-relaxed italic">
                &ldquo;{message.message}&rdquo;
              </blockquote>
            </div>
          </div>

          {/* Gemini AI Assessment Box */}
          <div className="rounded-xl border border-orange-200 bg-orange-50/40 p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-orange-700 uppercase tracking-wide">
                <Sparkles className="w-4 h-4 text-orange-600" />
                <span>Gemini AI Severity Assessment</span>
              </div>
              {analysis?.confidence && (
                <span className="text-[11px] font-semibold text-orange-800 bg-orange-100 px-2 py-0.5 rounded-full">
                  {Math.round(analysis.confidence * 100)}% Confidence
                </span>
              )}
            </div>

            {/* Metrics Row: Casualties & Urgency */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-lg p-2.5 border border-orange-100 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-md bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-medium">Estimated Casualties</div>
                  <div className="text-sm font-bold text-slate-900">
                    {analysis?.casualties ? `${analysis.casualties} people` : 'None specified'}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-2.5 border border-orange-100 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-md bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-medium">Urgency Level</div>
                  <div className="text-sm font-bold text-slate-900">
                    {analysis?.urgency || 'HIGH'}
                  </div>
                </div>
              </div>
            </div>

            {/* Vulnerability Tags */}
            {analysis?.vulnerabilities && analysis.vulnerabilities.length > 0 && (
              <div>
                <div className="text-[11px] font-semibold text-slate-600 mb-1.5">Identified Risk Factors</div>
                <div className="flex flex-wrap gap-1.5">
                  {analysis.vulnerabilities.map((v, i) => (
                    <span
                      key={i}
                      className="text-[11px] font-medium bg-white text-slate-700 border border-stone-200 px-2 py-0.5 rounded-md"
                    >
                      {v.replace(/_/g, ' ')}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Reasoning */}
            <div>
              <div className="text-[11px] font-semibold text-slate-600 mb-1">AI Reasoning</div>
              <p className="text-xs text-slate-700 leading-relaxed bg-white/80 p-2.5 rounded-lg border border-orange-100">
                {analysis?.reason || message.severityReason}
              </p>
            </div>

            {/* Recommended Action */}
            {analysis?.recommendedAction && (
              <div className="bg-orange-500/10 border border-orange-300/80 rounded-lg p-3">
                <div className="flex items-center gap-1 text-xs font-bold text-orange-900 mb-1">
                  <ShieldAlert className="w-3.5 h-3.5 text-orange-600" />
                  <span>Recommended Operational Action</span>
                </div>
                <p className="text-xs font-medium text-orange-950 leading-normal">
                  {analysis.recommendedAction}
                </p>
              </div>
            )}
          </div>

          {/* Priority Override Selector */}
          <div className="bg-stone-50 rounded-xl p-4 border border-stone-200">
            <div className="text-xs font-semibold text-slate-900 mb-2">
              Human-in-the-Loop Severity Override
            </div>
            <div className="grid grid-cols-4 gap-2">
              {(['P1', 'P2', 'P3', 'P4'] as PriorityLevel[]).map((level) => (
                <button
                  key={level}
                  onClick={() => setSelectedSeverity(level)}
                  className={`py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                    currentSeverity === level
                      ? 'bg-orange-500 text-white border-orange-500 shadow-xs'
                      : 'bg-white text-slate-700 border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Action Footer */}
        <div className="p-4 border-t border-stone-200 bg-stone-50 flex flex-col gap-2.5">
          <div className="grid grid-cols-2 gap-2">
            <button
              disabled={isUpdating}
              onClick={() => handleStatusChange('ACKNOWLEDGED')}
              className="flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-medium text-slate-800 bg-white border border-stone-200 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Acknowledge</span>
            </button>

            <button
              onClick={() => onAssignResponder && onAssignResponder(message)}
              className="flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-medium text-white bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors cursor-pointer shadow-xs"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Assign Boat/Unit</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onReply && onReply(message)}
              className="py-2 px-3 text-xs font-medium text-orange-600 bg-orange-50 hover:bg-orange-100 border border-orange-200/80 rounded-lg transition-colors cursor-pointer text-center"
            >
              Reply / Send ETA
            </button>

            <button
              disabled={isUpdating}
              onClick={() => handleStatusChange('RESOLVED')}
              className="py-2 px-3 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors cursor-pointer text-center disabled:opacity-50"
            >
              Mark Resolved
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
