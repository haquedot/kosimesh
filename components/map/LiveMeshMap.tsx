'use client';

import React, { useEffect, useState, useRef } from 'react';
import { ConnectedDevice, Message } from '@/types/schema';
import { Layers, Navigation, Plus, Minus, X, ChevronRight, Check } from 'lucide-react';

export type MapTileProvider = 'satellite' | 'dark' | 'street' | 'topo';

interface LiveMeshMapProps {
  devices: ConnectedDevice[];
  messages: Message[];
  onSelectMessage?: (message: Message) => void;
  onSelectDevice?: (device: ConnectedDevice) => void;
  heightClass?: string;
  selectedPriorityFilter?: string;
}

export function LiveMeshMap({
  devices,
  messages,
  onSelectMessage,
  onSelectDevice,
  heightClass = 'h-[460px]',
  selectedPriorityFilter = 'ALL',
}: LiveMeshMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapInstanceRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tileLayerRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markersLayerRef = useRef<any>(null);

  const [deviceFilter, setDeviceFilter] = useState('ALL');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [severityFilter, setSeverityFilter] = useState(selectedPriorityFilter);
  const [activePopup, setActivePopup] = useState<Message | null>(null);
  const [currentTile, setCurrentTile] = useState<MapTileProvider>('satellite');
  const [isLayerMenuOpen, setIsLayerMenuOpen] = useState(false);

  // Sync external filter changes
  useEffect(() => {
    if (selectedPriorityFilter) {
      setSeverityFilter(selectedPriorityFilter);
    }
  }, [selectedPriorityFilter]);

  // Filter messages with GPS coordinates
  const geoMessages = messages.filter((m) => m.latitude && m.longitude);

  // Dynamic Center & Bounding Box Calculation
  const calculateCentroidAndBounds = () => {
    const allCoords: [number, number][] = [];
    devices.forEach((d) => {
      if (d.latitude && d.longitude) allCoords.push([d.latitude, d.longitude]);
    });
    geoMessages.forEach((m) => {
      if (m.latitude && m.longitude) allCoords.push([m.latitude, m.longitude]);
    });

    if (allCoords.length === 0) {
      return { center: [26.1300, 86.6050] as [number, number], bounds: null };
    }

    const sumLat = allCoords.reduce((acc, c) => acc + c[0], 0);
    const sumLng = allCoords.reduce((acc, c) => acc + c[1], 0);
    const center: [number, number] = [sumLat / allCoords.length, sumLng / allCoords.length];

    return { center, bounds: allCoords };
  };

  const getTileUrl = (provider: MapTileProvider) => {
    switch (provider) {
      case 'satellite':
        return {
          url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
          maxZoom: 19,
        };
      case 'dark':
        return {
          url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
          maxZoom: 19,
        };
      case 'street':
        return {
          url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
          maxZoom: 19,
        };
      case 'topo':
        return {
          url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
          maxZoom: 17,
        };
    }
  };

  useEffect(() => {
    let isMounted = true;

    async function initMap() {
      if (typeof window === 'undefined' || !mapContainerRef.current) return;
      const L = (await import('leaflet')).default;

      const { center, bounds } = calculateCentroidAndBounds();

      if (!mapInstanceRef.current && mapContainerRef.current) {
        const map = L.map(mapContainerRef.current, {
          center,
          zoom: 11,
          zoomControl: false,
          attributionControl: false,
        });

        const tileConfig = getTileUrl(currentTile);
        tileLayerRef.current = L.tileLayer(tileConfig.url, { maxZoom: tileConfig.maxZoom }).addTo(map);

        markersLayerRef.current = L.layerGroup().addTo(map);
        mapInstanceRef.current = map;

        if (bounds && bounds.length > 1) {
          map.fitBounds(L.latLngBounds(bounds), { padding: [40, 40] });
        }
      }

      // Update Tiles if changed
      if (mapInstanceRef.current && tileLayerRef.current) {
        const tileConfig = getTileUrl(currentTile);
        mapInstanceRef.current.removeLayer(tileLayerRef.current);
        tileLayerRef.current = L.tileLayer(tileConfig.url, { maxZoom: tileConfig.maxZoom }).addTo(mapInstanceRef.current);
        tileLayerRef.current.bringToBack();
      }

      if (isMounted && mapInstanceRef.current && markersLayerRef.current) {
        const L = (await import('leaflet')).default;
        const group = markersLayerRef.current;
        group.clearLayers();

        // 1. Render Device Markers
        devices.forEach((device) => {
          if (roleFilter !== 'ALL' && device.role !== roleFilter) return;
          if (deviceFilter === 'ONLINE' && device.status !== 'ONLINE') return;
          if (deviceFilter === 'OFFLINE' && device.status === 'ONLINE') return;

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
  }, [devices, geoMessages, roleFilter, severityFilter, deviceFilter, currentTile, onSelectMessage, onSelectDevice]);

  // Recenter / Fit Bounds
  const handleRecenter = async () => {
    if (!mapInstanceRef.current) return;
    const L = (await import('leaflet')).default;
    const { center, bounds } = calculateCentroidAndBounds();

    if (bounds && bounds.length > 1) {
      mapInstanceRef.current.fitBounds(L.latLngBounds(bounds), { padding: [40, 40] });
    } else {
      mapInstanceRef.current.setView(center, 12);
    }
  };

  return (
    <div className={`relative w-full ${heightClass} rounded-2xl overflow-hidden border border-stone-200 shadow-sm bg-slate-900`}>
      {/* Map DOM Element */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Top Filter Bar Overlay */}
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
          <option value="RESPONDER">Responders (Field Units)</option>
          <option value="USER">Citizens / Observers</option>
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

      {/* Dynamic Tactical Node Badge */}
      <div className="absolute bottom-3 left-3 z-[1000] bg-slate-950/80 backdrop-blur-md border border-slate-700/60 text-white px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-2 shadow-lg">
        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="font-semibold">{devices.length} Nodes Active</span>
        <span className="text-slate-400">•</span>
        <span className="text-orange-400">{geoMessages.length} Incidents Pinpointed</span>
      </div>

      {/* Interactive Active Incident Popup */}
      {activePopup && (
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 z-[1000] bg-white rounded-xl shadow-xl border border-stone-200 p-3.5 min-w-[260px] max-w-sm animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-red-600">
              <span className="flex h-2 w-2 rounded-full bg-red-600 animate-ping" />
              <span>{activePopup.severity} • {activePopup.senderName}</span>
            </div>
            <button
              onClick={() => setActivePopup(null)}
              className="text-stone-400 hover:text-stone-700 p-0.5 rounded cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-xs text-slate-800 font-medium line-clamp-2 mb-2">
            &ldquo;{activePopup.message}&rdquo;
          </p>
          <div className="text-[11px] text-slate-500 mb-2.5 flex items-center justify-between border-t border-stone-100 pt-1.5">
            <span>{activePopup.locationName}</span>
            <span>{new Date(activePopup.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          <button
            onClick={() => {
              if (onSelectMessage) onSelectMessage(activePopup);
            }}
            className="w-full flex items-center justify-between text-xs font-bold text-white bg-orange-500 hover:bg-orange-600 py-1.5 px-3 rounded-lg transition-colors cursor-pointer shadow-xs"
          >
            <span>Inspect AI Assessment</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Floating Right Map Controls */}
      <div className="absolute top-3 right-3 z-[1000] flex flex-col gap-1.5">
        {/* Layer Selector Toggle */}
        <div className="relative">
          <button
            title="Switch Map Tiles"
            onClick={() => setIsLayerMenuOpen(!isLayerMenuOpen)}
            className={`w-8 h-8 rounded-lg shadow-sm flex items-center justify-center transition-colors cursor-pointer ${
              isLayerMenuOpen
                ? 'bg-orange-500 text-white'
                : 'bg-white/95 backdrop-blur-sm border border-stone-200 text-slate-700 hover:text-orange-600 hover:bg-white'
            }`}
          >
            <Layers className="w-4 h-4" />
          </button>

          {/* Layer Selector Dropdown Menu */}
          {isLayerMenuOpen && (
            <div className="absolute right-10 top-0 bg-white rounded-xl shadow-xl border border-stone-200 p-1.5 min-w-[170px] z-[1100] animate-in fade-in zoom-in-95 duration-100 space-y-0.5">
              {[
                { id: 'satellite', label: '🛰️ Satellite (Esri)' },
                { id: 'dark', label: '🌑 Dark Matter' },
                { id: 'street', label: '🗺️ OpenStreetMap' },
                { id: 'topo', label: '🏔️ Topographic' },
              ].map((tile) => (
                <button
                  key={tile.id}
                  onClick={() => {
                    setCurrentTile(tile.id as MapTileProvider);
                    setIsLayerMenuOpen(false);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition-colors cursor-pointer ${
                    currentTile === tile.id
                      ? 'bg-orange-50 text-orange-600 font-semibold'
                      : 'text-slate-700 hover:bg-stone-100'
                  }`}
                >
                  <span>{tile.label}</span>
                  {currentTile === tile.id && <Check className="w-3.5 h-3.5 text-orange-600" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Dynamic Auto-Bounding Recenter */}
        <button
          title="Auto-Fit All Nodes & Incidents"
          onClick={handleRecenter}
          className="w-8 h-8 bg-white/95 backdrop-blur-sm border border-stone-200 rounded-lg shadow-sm flex items-center justify-center text-slate-700 hover:text-orange-600 hover:bg-white transition-colors cursor-pointer"
        >
          <Navigation className="w-4 h-4" />
        </button>

        {/* Zoom Controls */}
        <div className="flex flex-col bg-white/95 backdrop-blur-sm border border-stone-200 rounded-lg shadow-sm overflow-hidden mt-1">
          <button
            title="Zoom In"
            onClick={() => mapInstanceRef.current && mapInstanceRef.current.zoomIn()}
            className="w-8 h-8 flex items-center justify-center text-slate-700 hover:text-orange-600 hover:bg-stone-50 border-b border-stone-200 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            title="Zoom Out"
            onClick={() => mapInstanceRef.current && mapInstanceRef.current.zoomOut()}
            className="w-8 h-8 flex items-center justify-center text-slate-700 hover:text-orange-600 hover:bg-stone-50 transition-colors cursor-pointer"
          >
            <Minus className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
