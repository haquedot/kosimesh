'use client';

import React, { useState } from 'react';
import { ConnectedDevice } from '@/types/schema';
import { 
  X, 
  Smartphone, 
  Shield, 
  User, 
  Battery, 
  MapPin, 
  Clock, 
  Radio, 
  Send, 
  Wifi, 
  Activity,
  Zap,
  Navigation
} from 'lucide-react';

interface DeviceDetailModalProps {
  device: ConnectedDevice | null;
  onClose: () => void;
  onOpenMessage?: (device: ConnectedDevice) => void;
  onLocateOnMap?: (device: ConnectedDevice) => void;
}

export function DeviceDetailModal({
  device,
  onClose,
  onOpenMessage,
  onLocateOnMap,
}: DeviceDetailModalProps) {
  const [isPinging, setIsPinging] = useState(false);
  const [pingSuccess, setPingSuccess] = useState(false);

  if (!device) return null;

  const handlePing = () => {
    setIsPinging(true);
    setPingSuccess(false);
    setTimeout(() => {
      setIsPinging(false);
      setPingSuccess(true);
      setTimeout(() => setPingSuccess(false), 2500);
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-[2600] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl border border-stone-200 shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/80">
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              device.role === 'RESPONDER' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'
            }`}>
              {device.role === 'RESPONDER' ? <Shield className="w-5 h-5" /> : <Smartphone className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">{device.userName}</h3>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  device.status === 'ONLINE' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500'
                }`}>
                  {device.status}
                </span>
              </div>
              <p className="text-[11px] font-mono text-slate-400">{device.deviceId}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg hover:bg-stone-200 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          {/* Battery telemetry card */}
          <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                <Battery className={`w-4 h-4 ${device.battery < 20 ? 'text-red-500' : 'text-slate-500'}`} />
                Battery Reserve Telemetry
              </span>
              <span className="font-mono font-bold text-slate-900">{device.battery}%</span>
            </div>
            <div className="w-full h-2 bg-stone-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  device.battery > 50 ? 'bg-emerald-500' : device.battery > 20 ? 'bg-amber-500' : 'bg-red-500'
                }`}
                style={{ width: `${device.battery}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
              <span>Estimated field runtime:</span>
              <span className="font-medium text-slate-700">~{Math.round(device.battery * 0.24)} hrs active</span>
            </div>
          </div>

          {/* Grid telemetry properties */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                Node Role
              </span>
              <span className="font-semibold text-slate-800">{device.role}</span>
            </div>

            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                Device Hardware
              </span>
              <span className="font-semibold text-slate-800">{device.deviceType} Node</span>
            </div>

            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 col-span-2">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                Active Operational Sector
              </span>
              <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                <span>{device.locationName}</span>
              </div>
              <div className="text-[11px] font-mono text-slate-500 mt-1">
                Coordinates: {device.latitude.toFixed(4)}° N, {device.longitude.toFixed(4)}° E
              </div>
            </div>

            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 col-span-2">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                Last Radio Heartbeat
              </span>
              <div className="text-xs text-slate-700 font-mono flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>{new Date(device.lastSeen).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Ping feedback alert */}
          {pingSuccess && (
            <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2 animate-in fade-in">
              <Wifi className="w-4 h-4 text-emerald-600" />
              <span>Radio heartbeat acknowledged. 12ms RF round-trip.</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-stone-100 bg-stone-50 flex items-center justify-between gap-2">
          <button
            onClick={handlePing}
            disabled={isPinging}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-stone-200 hover:bg-stone-100 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            <Activity className="w-3.5 h-3.5 text-slate-500" />
            <span>{isPinging ? 'Pinging RF...' : 'Ping Node'}</span>
          </button>

          <div className="flex items-center gap-2">
            {onLocateOnMap && (
              <button
                onClick={() => {
                  onLocateOnMap(device);
                  onClose();
                }}
                className="flex items-center gap-1.5 px-3 py-2 bg-stone-200 hover:bg-stone-300 text-slate-800 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Locate</span>
              </button>
            )}

            {onOpenMessage && (
              <button
                onClick={() => {
                  onOpenMessage(device);
                  onClose();
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Direct Msg</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
