'use client';

import React, { useState } from 'react';
import { ConnectedDevice, Message } from '@/types/schema';
import { X, Ship, UserCheck, Battery, Navigation, Check } from 'lucide-react';

interface AssignResponderModalProps {
  message: Message | null;
  devices: ConnectedDevice[];
  onClose: () => void;
  onAssign: (messageId: string, device: ConnectedDevice) => Promise<void>;
}

export function AssignResponderModal({
  message,
  devices,
  onClose,
  onAssign,
}: AssignResponderModalProps) {
  const [selectedDevice, setSelectedDevice] = useState<ConnectedDevice | null>(null);
  const [isAssigning, setIsAssigning] = useState(false);

  if (!message) return null;

  // Filter responders only
  const responders = devices.filter((d) => d.role === 'RESPONDER');

  const handleConfirm = async () => {
    if (!selectedDevice || isAssigning) return;
    setIsAssigning(true);
    await onAssign(message.id, selectedDevice);
    setIsAssigning(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[2500] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl border border-stone-200 shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/70">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Assign Field Responder</h3>
              <p className="text-[11px] text-slate-400">
                Incident #{message.id} • {message.locationName}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg hover:bg-stone-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Responders List */}
        <div className="p-5 space-y-3 max-h-[60vh] overflow-y-auto">
          <div className="text-xs text-slate-500 mb-1">
            Select an active rescue vessel or squad to dispatch to this incident:
          </div>

          {responders.map((resp) => {
            const isSelected = selectedDevice?.deviceId === resp.deviceId;
            const isAssigned = message.assignedResponderId === resp.deviceId;

            return (
              <div
                key={resp.id || resp.deviceId}
                onClick={() => setSelectedDevice(resp)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  isSelected
                    ? 'border-orange-500 bg-orange-50/50 shadow-xs'
                    : 'border-stone-200 hover:border-stone-300 hover:bg-stone-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0">
                    <Ship className="w-4 h-4 text-orange-400" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                      <span>{resp.userName}</span>
                      <span className="font-mono text-[10px] text-slate-400">({resp.deviceId})</span>
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                      <span className="flex items-center gap-1">
                        <Navigation className="w-3 h-3 text-slate-400" />
                        {resp.locationName}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 font-medium text-slate-600">
                        <Battery className="w-3 h-3 text-slate-400" />
                        {resp.battery}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="shrink-0">
                  {isAssigned ? (
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                      Assigned
                    </span>
                  ) : isSelected ? (
                    <div className="w-5 h-5 rounded-full bg-orange-500 text-white flex items-center justify-center">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-stone-300" />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-stone-100 bg-stone-50 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={!selectedDevice || isAssigning}
            onClick={handleConfirm}
            className="px-4 py-2 text-xs font-semibold text-white bg-orange-500 hover:bg-orange-600 active:bg-orange-700 rounded-lg shadow-sm transition-all cursor-pointer disabled:opacity-50"
          >
            {isAssigning ? 'Dispatching...' : 'Confirm Dispatch Assignment'}
          </button>
        </div>
      </div>
    </div>
  );
}
