'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ConnectedDevice, Message, MessageStatus, PriorityLevel, SystemMetrics } from '@/types/schema';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { KPICards } from './KPICards';
import { LiveMeshMap } from '../map/LiveMeshMap';
import { ConnectedDevicesTable } from '../devices/ConnectedDevicesTable';
import { RecentMessagesCard } from '../triage/RecentMessagesCard';
import { SeverityDistributionChart } from '../triage/SeverityDistributionChart';
import { GeminiInsightDrawer } from '../triage/GeminiInsightDrawer';
import { ReplyModal } from '../dispatch/ReplyModal';
import { AssignResponderModal } from '../dispatch/AssignResponderModal';
import { BroadcastModal } from '../dispatch/BroadcastModal';
import { SimulatorControlBar } from '../simulator/SimulatorControlBar';
import { EmergencyAlertBanner } from '../common/EmergencyAlertBanner';
import { playEmergencyChime } from '../common/EmergencyAudioChime';

// Views
import { FullMapView } from '../views/FullMapView';
import { FullMessagesView } from '../views/FullMessagesView';
import { FullDevicesView } from '../views/FullDevicesView';
import { FullUsersView } from '../views/FullUsersView';

// Modals & Popovers
import { DeviceDetailModal } from '../devices/DeviceDetailModal';
import { NotificationDrawer } from './NotificationDrawer';

interface CommandDashboardProps {
  initialDevices: ConnectedDevice[];
  initialMessages: Message[];
  initialMetrics: SystemMetrics;
}

export function CommandDashboard({
  initialDevices,
  initialMessages,
  initialMetrics,
}: CommandDashboardProps) {
  const [activeNav, setActiveNav] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [devices, setDevices] = useState<ConnectedDevice[]>(initialDevices);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [metrics, setMetrics] = useState<SystemMetrics>(initialMetrics);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);

  // Modal & Drawer States
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [selectedDevice, setSelectedDevice] = useState<ConnectedDevice | null>(null);
  const [replyTarget, setReplyTarget] = useState<Message | null>(null);
  const [assignTarget, setAssignTarget] = useState<Message | null>(null);
  const [isBroadcastOpen, setIsBroadcastOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  const prevMsgCountRef = useRef(messages.length);

  // Unread messages count for badges
  const unreadCount = messages.filter((m) => m.status === 'UNREAD').length;

  // Unresolved P1 messages for emergency alert banner
  const unresolvedP1Messages = messages.filter(
    (m) => m.severity === 'P1' && m.status !== 'RESOLVED'
  );

  // Polling data refresh
  const fetchData = useCallback(async () => {
    try {
      const [devRes, msgRes, metRes] = await Promise.all([
        fetch('/api/devices'),
        fetch('/api/messages'),
        fetch('/api/metrics'),
      ]);

      if (devRes.ok) {
        const data = await devRes.json();
        if (data.devices) setDevices(data.devices);
      }
      if (msgRes.ok) {
        const data = await msgRes.json();
        if (data.messages) {
          // Play audio chime if new P1 arrives
          if (data.messages.length > prevMsgCountRef.current) {
            const newP1 = data.messages
              .slice(0, data.messages.length - prevMsgCountRef.current)
              .some((m: Message) => m.severity === 'P1');
            if (newP1 && isAudioEnabled) {
              playEmergencyChime();
            }
          }
          prevMsgCountRef.current = data.messages.length;
          setMessages(data.messages);
        }
      }
      if (metRes.ok) {
        const data = await metRes.json();
        if (data.metrics) setMetrics(data.metrics);
      }
    } catch {
      // Ignore background network refresh glitches
    }
  }, [isAudioEnabled]);

  useEffect(() => {
    const interval = setInterval(fetchData, 4000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // Handle message status update
  const handleUpdateStatus = async (id: string, status: MessageStatus, severity?: PriorityLevel) => {
    try {
      const res = await fetch(`/api/messages/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, severity }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.message) {
          setMessages((prev) =>
            prev.map((m) => (m.id === id ? data.message : m))
          );
          if (selectedMessage?.id === id) {
            setSelectedMessage(data.message);
          }
        }
        fetchData();
      }
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  // Handle two-way reply
  const handleSendReply = async (messageId: string, replyText: string) => {
    try {
      const res = await fetch(`/api/messages/${messageId}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: replyText }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.message) {
          setMessages((prev) =>
            prev.map((m) => (m.id === messageId ? data.message : m))
          );
          if (selectedMessage?.id === messageId) {
            setSelectedMessage(data.message);
          }
        }
        fetchData();
      }
    } catch (err) {
      console.error('Failed to send reply', err);
    }
  };

  // Handle assigning responder unit
  const handleAssignResponder = async (messageId: string, device: ConnectedDevice) => {
    try {
      const res = await fetch(`/api/messages/${messageId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'IN_PROGRESS',
          assignedResponderId: device.deviceId,
          assignedResponderName: device.userName,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.message) {
          setMessages((prev) =>
            prev.map((m) => (m.id === messageId ? data.message : m))
          );
          if (selectedMessage?.id === messageId) {
            setSelectedMessage(data.message);
          }
        }
        fetchData();
      }
    } catch (err) {
      console.error('Failed to assign responder', err);
    }
  };

  // Handle emergency broadcast
  const handleBroadcast = async (message: string, severity: PriorityLevel, locationName: string) => {
    try {
      const res = await fetch('/api/messages/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, severity, locationName }),
      });

      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error('Failed to broadcast message', err);
    }
  };

  // Trigger manual simulation patrol step
  const handleTriggerSimulation = async () => {
    try {
      await fetch('/api/simulator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'STEP' }),
      });
      fetchData();
    } catch (err) {
      console.error('Simulation step failed', err);
    }
  };

  // Filtered lists for top search bar
  const displayedMessages = searchQuery.trim()
    ? messages.filter(
        (m) =>
          m.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.senderName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.locationName.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : messages;

  const displayedDevices = searchQuery.trim()
    ? devices.filter(
        (d) =>
          d.deviceId.toLowerCase().includes(searchQuery.toLowerCase()) ||
          d.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          d.locationName.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : devices;

  return (
    <div className="flex h-screen overflow-hidden bg-stone-50 font-sans text-slate-900 antialiased">
      {/* 1. Fixed Left Sidebar */}
      <Sidebar
        activeNav={activeNav}
        onNavChange={setActiveNav}
        unreadCount={unreadCount}
      />

      {/* 2. Scrollable Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        <Header
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          unreadCount={unreadCount}
          onOpenBroadcast={() => setIsBroadcastOpen(true)}
          onOpenNotifications={() => setIsNotificationOpen(true)}
          onTriggerSimulation={handleTriggerSimulation}
          onSelectMessage={(msg) => setSelectedMessage(msg)}
          onSelectDevice={(dev) => setSelectedDevice(dev)}
          onNavigateTab={(tab) => setActiveNav(tab)}
        />

        {/* Emergency Alert Banner for Unresolved P1 calls */}
        <EmergencyAlertBanner
          unresolvedP1Messages={unresolvedP1Messages}
          isAudioEnabled={isAudioEnabled}
          onToggleAudio={() => setIsAudioEnabled(!isAudioEnabled)}
          onSelectMessage={(msg) => setSelectedMessage(msg)}
        />

        {/* Dynamic View Rendering based on activeNav */}
        {activeNav === 'dashboard' && (
          <main className="flex-1 p-6 space-y-6 max-w-7xl w-full mx-auto animate-in fade-in duration-150">
            {/* Top KPI Cards Row matching UI.png */}
            <KPICards
              metrics={metrics}
              onClickTotalMessages={() => setActiveNav('messages')}
              onClickCriticalP1={() => {
                setSearchQuery('P1');
                setActiveNav('messages');
              }}
              onClickActiveResponders={() => {
                setActiveNav('users');
              }}
              onClickConnectedDevices={() => setActiveNav('devices')}
            />

            {/* Core Grid: Left 8 cols (Map + Devices Table) / Right 4 cols (Messages + Severity Chart) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left 8 Columns */}
              <div className="lg:col-span-8 space-y-6 flex flex-col">
                {/* Live GIS Satellite Multi-Hazard Map */}
                <LiveMeshMap
                  devices={displayedDevices}
                  messages={displayedMessages}
                  onSelectMessage={(msg) => setSelectedMessage(msg)}
                  onSelectDevice={(dev) => setSelectedDevice(dev)}
                />

                {/* Connected Devices Table */}
                <ConnectedDevicesTable
                  devices={displayedDevices}
                  onSelectDevice={(dev) => setSelectedDevice(dev)}
                  onViewAll={() => setActiveNav('devices')}
                />
              </div>

              {/* Right 4 Columns */}
              <div className="lg:col-span-4 space-y-6 flex flex-col">
                {/* Recent Messages Card */}
                <RecentMessagesCard
                  messages={displayedMessages}
                  onSelectMessage={(msg) => setSelectedMessage(msg)}
                  onViewAll={() => setActiveNav('messages')}
                />

                {/* Severity Distribution Bar Chart */}
                <SeverityDistributionChart
                  metrics={metrics}
                  onSelectSeverity={(sev) => {
                    setSearchQuery(sev);
                    setActiveNav('messages');
                  }}
                />
              </div>
            </div>
          </main>
        )}

        {/* View: Dedicated Full Map */}
        {activeNav === 'map' && (
          <FullMapView
            devices={displayedDevices}
            messages={displayedMessages}
            onSelectMessage={(msg) => setSelectedMessage(msg)}
            onSelectDevice={(dev) => setSelectedDevice(dev)}
            onOpenBroadcast={() => setIsBroadcastOpen(true)}
          />
        )}

        {/* View: Dedicated Messages & Triage */}
        {activeNav === 'messages' && (
          <FullMessagesView
            messages={displayedMessages}
            onSelectMessage={(msg) => setSelectedMessage(msg)}
            onUpdateStatus={handleUpdateStatus}
            onReply={(msg) => setReplyTarget(msg)}
            onAssignResponder={(msg) => setAssignTarget(msg)}
            onOpenBroadcast={() => setIsBroadcastOpen(true)}
          />
        )}

        {/* View: Dedicated Fleet & Devices */}
        {activeNav === 'devices' && (
          <FullDevicesView
            devices={displayedDevices}
            onSelectDevice={(dev) => setSelectedDevice(dev)}
            onOpenBroadcast={() => setIsBroadcastOpen(true)}
            onNavigateToMap={() => setActiveNav('map')}
          />
        )}

        {/* View: Dedicated Users & Personnel Roster */}
        {activeNav === 'users' && (
          <FullUsersView
            devices={displayedDevices}
            messages={displayedMessages}
            onSelectDevice={(dev) => setSelectedDevice(dev)}
            onOpenBroadcast={() => setIsBroadcastOpen(true)}
          />
        )}
      </div>

      {/* 3. Modals & Drawers */}
      <GeminiInsightDrawer
        message={selectedMessage}
        onClose={() => setSelectedMessage(null)}
        onUpdateStatus={handleUpdateStatus}
        onReply={(msg) => setReplyTarget(msg)}
        onAssignResponder={(msg) => setAssignTarget(msg)}
      />

      <DeviceDetailModal
        device={selectedDevice}
        onClose={() => setSelectedDevice(null)}
        onOpenMessage={() => setIsBroadcastOpen(true)}
        onLocateOnMap={() => {
          setActiveNav('map');
          setSelectedDevice(null);
        }}
      />

      <NotificationDrawer
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
        messages={messages}
        devices={devices}
        onSelectMessage={(msg) => setSelectedMessage(msg)}
        onSelectDevice={(dev) => setSelectedDevice(dev)}
        onMarkAllRead={() => {
          messages.forEach((m) => {
            if (m.status === 'UNREAD') {
              handleUpdateStatus(m.id, 'ACKNOWLEDGED');
            }
          });
        }}
      />

      <ReplyModal
        message={replyTarget}
        onClose={() => setReplyTarget(null)}
        onSendReply={handleSendReply}
      />

      <AssignResponderModal
        message={assignTarget}
        devices={devices}
        onClose={() => setAssignTarget(null)}
        onAssign={handleAssignResponder}
      />

      <BroadcastModal
        isOpen={isBroadcastOpen}
        onClose={() => setIsBroadcastOpen(false)}
        onBroadcast={handleBroadcast}
      />

      {/* 4. Demo Simulator Widget */}
      <SimulatorControlBar onSimulationUpdate={fetchData} />
    </div>
  );
}
