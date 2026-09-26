'use client';

import React from 'react';
import { MessageSquare, Bell, Users, Smartphone, ArrowUpRight } from 'lucide-react';
import { SystemMetrics } from '@/types/schema';

interface KPICardsProps {
  metrics: SystemMetrics;
  onFilterSeverity?: (severity: string) => void;
}

export function KPICards({ metrics }: KPICardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Total Messages */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-4 flex items-center justify-between hover:shadow-sm transition-shadow cursor-pointer">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-orange-100/70 text-orange-600 flex items-center justify-center">
            <MessageSquare className="w-5 h-5 fill-orange-500/20" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 leading-tight">
              {metrics.totalMessages}
            </div>
            <div className="text-xs text-slate-500 font-medium">Total Messages</div>
          </div>
        </div>
        <div className="flex items-center text-[11px] font-semibold text-emerald-600 self-start mt-0.5">
          <span>↑ {metrics.totalMessagesChangePct}%</span>
          <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
        </div>
      </div>

      {/* 2. Critical (P1) */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-4 flex items-center justify-between hover:shadow-sm transition-shadow cursor-pointer">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-red-100/70 text-red-600 flex items-center justify-center">
            <Bell className="w-5 h-5 fill-red-500/20" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 leading-tight">
              {metrics.criticalP1Count}
            </div>
            <div className="text-xs text-slate-500 font-medium">Critical (P1)</div>
          </div>
        </div>
        <div className="flex items-center text-[11px] font-semibold text-red-600 self-start mt-0.5">
          <span>↑ {metrics.criticalP1Change}</span>
          <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
        </div>
      </div>

      {/* 3. Active Responders */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-4 flex items-center justify-between hover:shadow-sm transition-shadow cursor-pointer">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-orange-100/70 text-orange-600 flex items-center justify-center">
            <Users className="w-5 h-5 fill-orange-500/20" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 leading-tight">
              {metrics.activeResponders}
            </div>
            <div className="text-xs text-slate-500 font-medium">Active Responders</div>
          </div>
        </div>
        <div className="flex items-center text-[11px] font-semibold text-emerald-600 self-start mt-0.5">
          <span>↑ {metrics.activeRespondersChange}</span>
          <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
        </div>
      </div>

      {/* 4. Connected Devices */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-4 flex items-center justify-between hover:shadow-sm transition-shadow cursor-pointer">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-blue-100/70 text-blue-600 flex items-center justify-center">
            <Smartphone className="w-5 h-5 fill-blue-500/20" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 leading-tight">
              {metrics.connectedDevices}
            </div>
            <div className="text-xs text-slate-500 font-medium">Connected Devices</div>
          </div>
        </div>
        <div className="flex items-center text-[11px] font-semibold text-emerald-600 self-start mt-0.5">
          <span>↑ {metrics.connectedDevicesChange}</span>
          <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
        </div>
      </div>
    </div>
  );
}
