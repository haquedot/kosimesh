'use client';

import React, { useState } from 'react';
import { Message, PriorityLevel } from '@/types/schema';
import { MessageSquare, Ship, User, AlertTriangle, ArrowRight, ChevronRight } from 'lucide-react';

interface RecentMessagesCardProps {
  messages: Message[];
  onSelectMessage: (message: Message) => void;
  onViewAll?: () => void;
}

export function RecentMessagesCard({ messages, onSelectMessage, onViewAll }: RecentMessagesCardProps) {
  const [selectedTab, setSelectedTab] = useState<'ALL' | PriorityLevel>('ALL');

  // Count by priority
  const countAll = messages.length;
  const countP1 = messages.filter((m) => m.severity === 'P1').length;
  const countP2 = messages.filter((m) => m.severity === 'P2').length;
  const countP3 = messages.filter((m) => m.severity === 'P3').length;
  const countP4 = messages.filter((m) => m.severity === 'P4').length;

  const filtered = selectedTab === 'ALL'
    ? messages
    : messages.filter((m) => m.severity === selectedTab);

  // Take top 5 items for the right column view
  const displayItems = filtered.slice(0, 5);

  const getBadgeStyle = (severity: PriorityLevel) => {
    switch (severity) {
      case 'P1':
        return 'bg-red-500 text-white font-bold';
      case 'P2':
        return 'bg-orange-500 text-white font-bold';
      case 'P3':
        return 'bg-amber-500 text-white font-bold';
      case 'P4':
        return 'bg-slate-400 text-white font-bold';
    }
  };

  const getIconBackground = (severity: PriorityLevel) => {
    switch (severity) {
      case 'P1':
        return 'bg-red-100 text-red-700';
      case 'P2':
        return 'bg-orange-100 text-orange-700';
      case 'P3':
        return 'bg-amber-100 text-amber-700';
      case 'P4':
        return 'bg-slate-100 text-slate-700';
    }
  };

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-5 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-3.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
            <MessageSquare className="w-4 h-4 fill-orange-500/20" />
          </div>
          <h2 className="text-sm font-semibold text-slate-900">Recent Messages</h2>
        </div>

        <button
          onClick={onViewAll}
          className="flex items-center gap-1 text-xs font-medium text-orange-600 hover:text-orange-700 hover:underline transition-colors cursor-pointer"
        >
          <span>View All</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Filter Tabs matching UI.png */}
      <div className="flex items-center gap-1.5 border-b border-stone-100 pb-3 mb-2 overflow-x-auto text-xs">
        <button
          onClick={() => setSelectedTab('ALL')}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
            selectedTab === 'ALL'
              ? 'bg-orange-50 text-orange-600 font-semibold'
              : 'text-slate-500 hover:text-slate-900 hover:bg-stone-50'
          }`}
        >
          <span>All</span>
          <span className="text-[11px] opacity-75">{countAll}</span>
        </button>

        <button
          onClick={() => setSelectedTab('P1')}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
            selectedTab === 'P1'
              ? 'bg-red-50 text-red-600 font-semibold'
              : 'text-slate-500 hover:text-slate-900 hover:bg-stone-50'
          }`}
        >
          <span>P1</span>
          <span className="text-[11px] opacity-75">{countP1}</span>
        </button>

        <button
          onClick={() => setSelectedTab('P2')}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
            selectedTab === 'P2'
              ? 'bg-orange-50 text-orange-600 font-semibold'
              : 'text-slate-500 hover:text-slate-900 hover:bg-stone-50'
          }`}
        >
          <span>P2</span>
          <span className="text-[11px] opacity-75">{countP2}</span>
        </button>

        <button
          onClick={() => setSelectedTab('P3')}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
            selectedTab === 'P3'
              ? 'bg-amber-50 text-amber-600 font-semibold'
              : 'text-slate-500 hover:text-slate-900 hover:bg-stone-50'
          }`}
        >
          <span>P3</span>
          <span className="text-[11px] opacity-75">{countP3}</span>
        </button>

        <button
          onClick={() => setSelectedTab('P4')}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
            selectedTab === 'P4'
              ? 'bg-slate-100 text-slate-700 font-semibold'
              : 'text-slate-500 hover:text-slate-900 hover:bg-stone-50'
          }`}
        >
          <span>P4</span>
          <span className="text-[11px] opacity-75">{countP4}</span>
        </button>
      </div>

      {/* Message List Items matching UI.png */}
      <div className="space-y-1 divide-y divide-stone-50">
        {displayItems.map((item) => {
          const isResponder = item.senderRole === 'RESPONDER';

          return (
            <div
              key={item.id}
              onClick={() => onSelectMessage(item)}
              className="pt-2.5 pb-2.5 first:pt-1 px-1.5 rounded-xl hover:bg-stone-50/90 transition-all cursor-pointer flex items-center justify-between gap-3 group"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {/* Priority Badge */}
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[11px] shrink-0 ${getBadgeStyle(item.severity)}`}>
                  {item.severity}
                </div>

                {/* Sub-icon (User or Boat or Warning) */}
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${getIconBackground(item.severity)}`}>
                  {isResponder ? (
                    <Ship className="w-3.5 h-3.5" />
                  ) : item.severity === 'P3' ? (
                    <AlertTriangle className="w-3.5 h-3.5" />
                  ) : (
                    <User className="w-3.5 h-3.5" />
                  )}
                </div>

                {/* Content */}
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-slate-900 truncate group-hover:text-orange-600 transition-colors">
                    {item.message}
                  </div>
                  <div className="text-[11px] text-slate-400 truncate mt-0.5">
                    <span className="font-medium text-slate-600">
                      {isResponder ? `Responder • ${item.senderName}` : `${item.senderName} • User`}
                    </span>
                    <span className="mx-1.5">•</span>
                    <span>{item.locationName} • {formatTime(item.createdAt)}</span>
                  </div>
                </div>
              </div>

              {/* Right: New Badge & Arrow */}
              <div className="flex items-center gap-1.5 shrink-0">
                {item.isNew && (
                  <span className="text-[10px] font-semibold text-orange-600 bg-orange-50 border border-orange-200/60 px-1.5 py-0.5 rounded">
                    New
                  </span>
                )}
                <ChevronRight className="w-4 h-4 text-stone-300 group-hover:text-orange-500 group-hover:translate-x-0.5 transition-all" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
