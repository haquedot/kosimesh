'use client';

import React from 'react';
import { Message, ConnectedDevice } from '@/types/schema';
import { 
  X, 
  Bell, 
  AlertTriangle, 
  Radio, 
  BatteryWarning, 
  Clock, 
  CheckCircle2, 
  Sparkles,
  ChevronRight
} from 'lucide-react';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  messages: Message[];
  devices: ConnectedDevice[];
  onSelectMessage: (message: Message) => void;
  onSelectDevice?: (device: ConnectedDevice) => void;
  onMarkAllRead?: () => void;
}

export function NotificationDrawer({
  isOpen,
  onClose,
  messages,
  devices,
  onSelectMessage,
  onSelectDevice,
  onMarkAllRead,
}: NotificationDrawerProps) {
  if (!isOpen) return null;

  // Derive notifications
  const criticalMessages = messages.filter((m) => m.severity === 'P1' && m.status !== 'RESOLVED');
  const unreadMessages = messages.filter((m) => m.status === 'UNREAD' && m.severity !== 'P1');
  const lowBatteryDevices = devices.filter((d) => d.battery < 25);

  const totalAlerts = criticalMessages.length + unreadMessages.length + lowBatteryDevices.length;

  return (
    <div className="fixed inset-0 z-[2400] flex justify-end bg-slate-900/30 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200 border-l border-stone-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Incident Alert Center</h3>
              <p className="text-[11px] text-slate-500">
                {totalAlerts} active alerts requiring attention
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onMarkAllRead && (
              <button
                onClick={onMarkAllRead}
                className="text-[11px] text-orange-600 hover:text-orange-700 font-semibold cursor-pointer"
              >
                Mark read
              </button>
            )}
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-lg hover:bg-stone-200 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Notifications Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {totalAlerts === 0 ? (
            <div className="py-16 text-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-slate-700">All caught up!</h4>
              <p className="text-xs text-slate-400 mt-1">
                No unacknowledged emergency alerts or low-battery warnings.
              </p>
            </div>
          ) : (
            <>
              {/* Critical P1 Alerts */}
              {criticalMessages.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-red-600 uppercase tracking-wider">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Critical Distress Calls ({criticalMessages.length})</span>
                  </div>
                  {criticalMessages.map((msg) => (
                    <div
                      key={msg.id}
                      onClick={() => {
                        onSelectMessage(msg);
                        onClose();
                      }}
                      className="p-3.5 rounded-xl border border-red-200 bg-red-50/70 hover:bg-red-50 hover:shadow-xs transition-all cursor-pointer group"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-red-600 text-white">
                          CRITICAL P1
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-slate-900 leading-snug mb-1">
                        {msg.message}
                      </p>
                      <div className="flex items-center justify-between text-[11px] text-slate-600">
                        <span className="font-semibold text-slate-700">{msg.senderName} ({msg.locationName})</span>
                        <span className="text-red-700 font-bold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                          Triage <ChevronRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Low Battery Device Alerts */}
              {lowBatteryDevices.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-600 uppercase tracking-wider">
                    <BatteryWarning className="w-3.5 h-3.5" />
                    <span>Low Battery Warning ({lowBatteryDevices.length})</span>
                  </div>
                  {lowBatteryDevices.map((dev) => (
                    <div
                      key={dev.deviceId}
                      onClick={() => {
                        onSelectDevice?.(dev);
                        onClose();
                      }}
                      className="p-3 rounded-xl border border-amber-200 bg-amber-50/50 hover:bg-amber-50 transition-all cursor-pointer flex items-center justify-between"
                    >
                      <div>
                        <div className="text-xs font-bold text-slate-900">{dev.userName}</div>
                        <div className="text-[10px] text-slate-500">{dev.locationName} • {dev.deviceId}</div>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-bold text-xs text-red-600">{dev.battery}%</span>
                        <div className="text-[10px] text-amber-700 font-semibold">Needs recharge</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* General Unread Queue */}
              {unreadMessages.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                    <Radio className="w-3.5 h-3.5" />
                    <span>Unread Transmissions ({unreadMessages.length})</span>
                  </div>
                  {unreadMessages.map((msg) => (
                    <div
                      key={msg.id}
                      onClick={() => {
                        onSelectMessage(msg);
                        onClose();
                      }}
                      className="p-3 rounded-xl border border-stone-200 bg-stone-50 hover:bg-white hover:border-orange-300 transition-all cursor-pointer"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          msg.severity === 'P2' ? 'bg-orange-500 text-white' : 'bg-slate-500 text-white'
                        }`}>
                          {msg.severity}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs text-slate-800 line-clamp-2 leading-relaxed">
                        {msg.message}
                      </p>
                      <div className="text-[11px] text-slate-500 mt-1 font-medium">
                        {msg.senderName} • {msg.locationName}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-100 bg-stone-50 text-center">
          <button
            onClick={onClose}
            className="w-full py-2 bg-white border border-stone-200 hover:bg-stone-100 text-slate-700 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
          >
            Close Notification Center
          </button>
        </div>
      </div>
    </div>
  );
}
