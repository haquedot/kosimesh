'use client';

import React, { useEffect, useState, useRef } from 'react';
import { ConnectedDevice, Message } from '@/types/schema';
import { Layers, Navigation, Plus, Minus, X, AlertTriangle, Ship, User, ChevronRight } from 'lucide-react';

interface LiveMeshMapProps {
  devices: ConnectedDevice[];
  messages: Message[];
  onSelectMessage?: (message: Message) => void;
  onSelectDevice?: (device: ConnectedDevice) => void;
}

export function LiveMeshMap({ devices, messages, onSelectMessage, onSelectDevice }: LiveMeshMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapInstanceRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markersLayerRef = useRef<any>(null);

  const [deviceFilter, setDeviceFilter] = useState('ALL');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [activePopup, setActivePopup] = useState<Message | null>(null);
  const [mapTileStyle, setMapTileStyle] = useState<'satellite' | 'dark' | 'topo'>('satellite');

  // Filter messages that have coordinates
  const geoMessages = messages.filter((m) => m.latitude && m.longitude);

  useEffect(() => {
    // Dynamically load Leaflet on client
    let isMounted = true;

    async function initMap() {
      if (typeof window === 'undefined' || !mapContainerRef.current) return;
      const L = (await import('leaflet')).default;

      if (!mapInstanceRef.current && mapContainerRef.current) {
        // Initialize map centered on Kosi River Basin
        const map = L.map(mapContainerRef.current, {
          center: [26.1300, 86.6050],
          zoom: 11,
          zoomControl: false,
          attributionControl: false,
        });

        // Satellite Tile Layer (Esri World Imagery)
        const satelliteLayer = L.tileLayer(
          'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
          { maxZoom: 18 }
        );

        // Labels / Boundaries overlay
        const labelLayer = L.tileLayer(
          'https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
          { maxZoom: 18 }
        );

        satelliteLayer.addTo(map);
        labelLayer.addTo(map);

        markersLayerRef.current = L.layerGroup().addTo(map);
        mapInstanceRef.current = map;
      }

      if (isMounted && mapInstanceRef.current && markersLayerRef.current) {
        const L = (await import('leaflet')).default;
        const group = markersLayerRef.current;
        group.clearLayers();

        // 1. Render Device Markers
        devices.forEach((device) => {
          if (roleFilter !== 'ALL' && device.role !== roleFilter) return;

          const isResponder = device.role === 'RESPONDER';
          const iconHtml = isResponder
            ? `<div class="w-8 h-8 rounded-full bg-orange-500 border-2 border-white shadow-md flex items-center justify-center text-white cursor-pointer hover:scale-110 transition-transform">
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M2 21c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1 .6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1M19.38 20A11.6 11.6 0 0 0 21 14l-9-4-9 4c0 2.9.94 5.34 2.81 7.76M19 13V7a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v6M12 1v4"/></svg>
               </div>`
            : `<div class="w-7 h-7 rounded-full bg-orange-500 border-2 border-white shadow-md flex items-center justify-center text-white cursor-pointer hover:scale-110 transition-transform">
                <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
               </div>`;

          const customIcon = L.divIcon({
            html: iconHtml,
            className: 'custom-mesh-marker',
            iconSize: isResponder ? [32, 32] : [28, 28],
            iconAnchor: isResponder ? [16, 16] : [14, 14],
          });

          const marker = L.marker([device.latitude, device.longitude], { icon: customIcon });
          marker.on('click', () => {
            if (onSelectDevice) onSelectDevice(device);
          });
          marker.addTo(group);
        });

        // 2. Render Incident / SOS Markers (Red Triangles)
        geoMessages.forEach((msg) => {
          if (severityFilter !== 'ALL' && msg.severity !== severityFilter) return;

          const isP1 = msg.severity === 'P1';
          const markerHtml = `
            <div class="relative cursor-pointer group">
              <div class="absolute -inset-2 bg-red-500/30 rounded-full marker-pulse"></div>
              <div class="w-8 h-8 rounded-full bg-red-600 border-2 border-white shadow-lg flex items-center justify-center text-white hover:scale-110 transition-transform">
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              </div>
            </div>
          `;

          const alertIcon = L.divIcon({
            html: markerHtml,
            className: 'custom-mesh-marker',
            iconSize: [32, 32],
            iconAnchor: [16, 16],
          });

          if (msg.latitude && msg.longitude) {
            const marker = L.marker([msg.latitude, msg.longitude], { icon: alertIcon });
            marker.on('click', () => {
              setActivePopup(msg);
              if (onSelectMessage) onSelectMessage(msg);
            });
            marker.addTo(group);
          }
        });
      }
    }

    initMap();

    return () => {
      isMounted = false;
    };
  }, [devices, geoMessages, roleFilter, severityFilter, onSelectMessage, onSelectDevice]);

  // Handle zoom in/out and locate
  const handleZoomIn = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomIn();
  };
  const handleZoomOut = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomOut();
  };
  const handleCenter = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([26.1300, 86.6050], 11);
    }
  };

  return (
    <div className="relative w-full h-[460px] rounded-2xl overflow-hidden border border-stone-200 shadow-sm bg-slate-900">
      {/* Map DOM Element */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Top Filter Bar Overlay matching UI.png */}
      <div className="absolute top-3 left-3 z-[1000] flex flex-wrap items-center gap-2">
        <select
          aria-label="Filter devices"
          value={deviceFilter}
          onChange={(e) => setDeviceFilter(e.target.value)}
          className="h-8 text-xs font-medium bg-white/95 backdrop-blur-sm text-slate-800 border border-stone-200 rounded-lg px-2.5 shadow-sm outline-none hover:bg-white focus:ring-2 focus:ring-orange-100 focus:border-orange-500 cursor-pointer"
        >
          <option value="ALL">All Devices</option>
          <option value="ONLINE">Online Only</option>
          <option value="OFFLINE">Offline Only</option>
        </select>

        <select
          aria-label="Filter roles"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="h-8 text-xs font-medium bg-white/95 backdrop-blur-sm text-slate-800 border border-stone-200 rounded-lg px-2.5 shadow-sm outline-none hover:bg-white focus:ring-2 focus:ring-orange-100 focus:border-orange-500 cursor-pointer"
        >
          <option value="ALL">All Roles</option>
          <option value="RESPONDER">Responders (Boats)</option>
          <option value="USER">Citizens (Users)</option>
        </select>

        <select
          aria-label="Filter severity"
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value)}
          className="h-8 text-xs font-medium bg-white/95 backdrop-blur-sm text-slate-800 border border-stone-200 rounded-lg px-2.5 shadow-sm outline-none hover:bg-white focus:ring-2 focus:ring-orange-100 focus:border-orange-500 cursor-pointer"
        >
          <option value="ALL">All Severity</option>
          <option value="P1">P1 Critical (🔴)</option>
          <option value="P2">P2 High (🟠)</option>
          <option value="P3">P3 Moderate (🟡)</option>
          <option value="P4">P4 Low (⚪)</option>
        </select>
      </div>

      {/* Geographic Watermark Labels */}
      <div className="absolute top-12 left-8 z-[500] pointer-events-none text-white/80 font-medium text-xs tracking-wider drop-shadow-md">
        Madhubani
      </div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-8 z-[500] pointer-events-none text-white font-semibold text-sm tracking-wide drop-shadow-lg">
        Supaul
      </div>
      <div className="absolute bottom-12 left-1/4 z-[500] pointer-events-none text-white/90 font-medium text-xs tracking-wider drop-shadow-md">
        Saharsa
      </div>
      <div className="absolute bottom-10 right-1/3 z-[500] pointer-events-none text-white/90 font-medium text-xs tracking-wider drop-shadow-md">
        Madhepura
      </div>
      <div className="absolute bottom-14 right-8 z-[500] pointer-events-none bg-blue-900/60 backdrop-blur-xs text-blue-200 px-2 py-0.5 rounded text-[11px] font-semibold border border-blue-400/30 rotate-[-12deg]">
        Kosi River Corridor
      </div>

      {/* Interactive Active Incident Popup matching UI.png */}
      {activePopup && (
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 z-[1000] bg-white rounded-xl shadow-xl border border-stone-200 p-3 min-w-[240px] animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-red-600">
              <span className="flex h-2 w-2 rounded-full bg-red-600 animate-ping"></span>
              <span>{activePopup.severity} • {activePopup.message.slice(0, 24)}...</span>
            </div>
            <button
              onClick={() => setActivePopup(null)}
              className="text-stone-400 hover:text-stone-700 p-0.5 rounded"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="text-[11px] text-slate-500 mb-2">
            {activePopup.locationName}, Bihar • {new Date(activePopup.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
          <button
            onClick={() => {
              if (onSelectMessage) onSelectMessage(activePopup);
            }}
            className="w-full flex items-center justify-between text-xs font-medium text-orange-600 hover:text-orange-700 bg-orange-50 hover:bg-orange-100 py-1.5 px-2.5 rounded-lg transition-colors"
          >
            <span>View AI Assessment</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Floating Right Map Controls matching UI.png */}
      <div className="absolute top-3 right-3 z-[1000] flex flex-col gap-1.5">
        <button
          title="Toggle Layers"
          onClick={() => setMapTileStyle((s) => (s === 'satellite' ? 'dark' : 'satellite'))}
          className="w-8 h-8 bg-white/95 backdrop-blur-sm border border-stone-200 rounded-lg shadow-sm flex items-center justify-center text-slate-700 hover:text-orange-600 hover:bg-white transition-colors"
        >
          <Layers className="w-4 h-4" />
        </button>

        <button
          title="Recenter Map"
          onClick={handleCenter}
          className="w-8 h-8 bg-white/95 backdrop-blur-sm border border-stone-200 rounded-lg shadow-sm flex items-center justify-center text-slate-700 hover:text-orange-600 hover:bg-white transition-colors"
        >
          <Navigation className="w-4 h-4" />
        </button>

        <div className="flex flex-col bg-white/95 backdrop-blur-sm border border-stone-200 rounded-lg shadow-sm overflow-hidden mt-1">
          <button
            title="Zoom In"
            onClick={handleZoomIn}
            className="w-8 h-8 flex items-center justify-center text-slate-700 hover:text-orange-600 hover:bg-stone-50 border-b border-stone-200 transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            title="Zoom Out"
            onClick={handleZoomOut}
            className="w-8 h-8 flex items-center justify-center text-slate-700 hover:text-orange-600 hover:bg-stone-50 transition-colors"
          >
            <Minus className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
