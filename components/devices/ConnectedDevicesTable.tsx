'use client';

import React from 'react';
import { ConnectedDevice } from '@/types/schema';
import { Smartphone, Ship, ArrowRight } from 'lucide-react';

interface ConnectedDevicesTableProps {
  devices: ConnectedDevice[];
  onSelectDevice?: (device: ConnectedDevice) => void;
  onViewAll?: () => void;
}

export function ConnectedDevicesTable({ devices, onSelectDevice, onViewAll }: ConnectedDevicesTableProps) {
  // Take first 5-6 devices for compact dashboard table
  const displayedDevices = devices.slice(0, 5);

  const getBatteryColor = (percent: number) => {
    if (percent >= 50) return 'bg-emerald-500';
    if (percent >= 25) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const getBatteryTrack = (percent: number) => {
    if (percent >= 50) return 'bg-emerald-100';
    if (percent >= 25) return 'bg-amber-100';
    return 'bg-red-100';
  };

  const formatLastSeen = (isoString: string) => {
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    if (diffMins < 1) return 'Just now';
    if (diffMins === 1) return '1 min ago';
    if (diffMins < 60) return `${diffMins} mins ago`;
    const diffHours = Math.floor(diffMins / 60);
    return `${diffHours} hr${diffHours > 1 ? 's' : ''} ago`;
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-5">
      {/* Table Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
            <Smartphone className="w-4 h-4" />
          </div>
          <h2 className="text-sm font-semibold text-slate-900">Connected Devices</h2>
        </div>

        <button
          onClick={onViewAll}
          className="flex items-center gap-1 text-xs font-medium text-orange-600 hover:text-orange-700 hover:underline transition-colors cursor-pointer"
        >
          <span>View All</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Responsive Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="text-slate-400 font-medium border-b border-stone-100 pb-2">
              <th className="pb-2.5 font-medium">Device</th>
              <th className="pb-2.5 font-medium">User</th>
              <th className="pb-2.5 font-medium">Role</th>
              <th className="pb-2.5 font-medium">Location</th>
              <th className="pb-2.5 font-medium">Battery</th>
              <th className="pb-2.5 font-medium">Status</th>
              <th className="pb-2.5 font-medium text-right">Last Seen</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {displayedDevices.map((device) => {
              const isResponder = device.role === 'RESPONDER';
              const isOnline = device.status === 'ONLINE';

              return (
                <tr
                  key={device.id || device.deviceId}
                  onClick={() => onSelectDevice && onSelectDevice(device)}
                  className="hover:bg-stone-50/80 transition-colors cursor-pointer group"
                >
                  {/* Device ID */}
                  <td className="py-3 font-semibold text-slate-900">
                    {device.deviceId}
                  </td>

                  {/* User & Avatar */}
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-semibold ${
                        isResponder
                          ? 'bg-slate-800 text-white'
                          : 'bg-stone-200 text-slate-700'
                      }`}>
                        {isResponder ? (
                          <Ship className="w-3 h-3" />
                        ) : (
                          device.userName.charAt(0).toUpperCase()
                        )}
                      </div>
                      <span className="font-medium text-slate-800">{device.userName}</span>
                    </div>
                  </td>

                  {/* Role Badge */}
                  <td className="py-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${
                        isResponder
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                          : 'bg-blue-50 text-blue-700 border border-blue-200/60'
                      }`}
                    >
                      {isResponder ? 'Responder' : 'User'}
                    </span>
                  </td>

                  {/* Location & GPS */}
                  <td className="py-3">
                    <div>
                      <div className="font-medium text-slate-800">{device.locationName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {device.latitude.toFixed(4)}, {device.longitude.toFixed(4)}
                      </div>
                    </div>
                  </td>

                  {/* Battery Progress */}
                  <td className="py-3">
                    <div className="flex items-center gap-2 min-w-[90px]">
                      <span className="font-medium text-slate-700 w-8">{device.battery}%</span>
                      <div className={`w-12 h-2 rounded-full overflow-hidden ${getBatteryTrack(device.battery)}`}>
                        <div
                          className={`h-full rounded-full ${getBatteryColor(device.battery)}`}
                          style={{ width: `${device.battery}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="py-3">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          isOnline ? 'bg-emerald-500' : 'bg-red-500'
                        }`}
                      />
                      <span className={`font-medium ${isOnline ? 'text-slate-800' : 'text-red-600'}`}>
                        {isOnline ? 'Online' : 'Offline'}
                      </span>
                    </div>
                  </td>

                  {/* Last Seen */}
                  <td className="py-3 text-right text-slate-400 font-normal">
                    {formatLastSeen(device.lastSeen)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
