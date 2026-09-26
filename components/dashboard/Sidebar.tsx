'use client';

import React from 'react';
import { LayoutDashboard, Map as MapIcon, MessageSquare, Smartphone, Users, ChevronRight, Waves } from 'lucide-react';

interface SidebarProps {
  activeNav: string;
  onNavChange: (nav: string) => void;
  unreadCount: number;
}

export function Sidebar({ activeNav, onNavChange, unreadCount }: SidebarProps) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'map', label: 'Map', icon: MapIcon },
    { id: 'messages', label: 'Messages', icon: MessageSquare, badge: unreadCount },
    { id: 'devices', label: 'Devices', icon: Smartphone },
    { id: 'users', label: 'Users', icon: Users },
  ];

  return (
    <aside className="w-64 bg-white border-r border-stone-200 flex flex-col justify-between shrink-0 select-none min-h-screen">
      {/* Top Section */}
      <div>
        {/* Logo matching UI.png */}
        <div className="h-16 px-6 flex items-center gap-3 border-b border-stone-100">
          <div className="w-9 h-9 rounded-xl bg-orange-500 text-white flex items-center justify-center shadow-sm shadow-orange-500/30">
            <Waves className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <div className="font-bold text-slate-900 text-base leading-tight tracking-tight">
              KosiMesh
            </div>
            <div className="text-[10px] text-slate-400 font-medium tracking-wide">
              Flood Response Network
            </div>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeNav === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onNavChange(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-orange-50 text-orange-600 font-semibold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-stone-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-orange-500 stroke-[2.2]' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>

                {item.badge !== undefined && item.badge > 0 && (
                  <span className="bg-orange-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-5 text-center">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Admin Profile Card matching UI.png */}
      <div className="p-3 border-t border-stone-100">
        <div className="p-2.5 rounded-xl bg-stone-50 hover:bg-stone-100/80 transition-colors flex items-center justify-between cursor-pointer border border-stone-200/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center text-xs font-bold shadow-xs">
              A
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-900 leading-tight">Admin</div>
              <div className="text-[10px] text-slate-400">Command Center</div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-stone-400" />
        </div>
      </div>
    </aside>
  );
}
