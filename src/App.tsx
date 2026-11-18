/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { BottomControlDock } from './components/BottomControlDock';
import { CampusViewport } from './components/CampusViewport';
import { DownloadShareModal } from './components/DownloadShareModal';
import { DropSimulatorModal } from './components/DropSimulatorModal';
import { TopBar } from './components/TopBar';
import { ZoneInspectorDrawer } from './components/ZoneInspectorDrawer';
import {
  CAMPUS_ZONES,
  CampusMetrics,
  CampusZoneId,
  DispatchFormInput,
  DropOrder,
  INITIAL_CAMPUS_METRICS,
  INITIAL_DROP_ORDERS,
  LightingPreset,
  createDispatchedOrder,
  getAmbientSoundscapeForZone,
} from './domain/campusData';
import { soundEngine } from './utils/soundEffects';

export default function App() {
  const [activeZone, setActiveZone] = useState<CampusZoneId>('overview');
  // Default to Open-Roof HQ cutaway (1.0) so the multi-wing interior is immediately visible
  const [cutawayFactor, setCutawayFactor] = useState<number>(1.0);
  const [lightingPreset, setLightingPreset] = useState<LightingPreset>('daylight');
  // Collapse 3D controls by default on narrow mobile screens so sticky bar height stays <= 15%
  const [dockCollapsed, setDockCollapsed] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.innerWidth < 640 : false,
  );
  const [inspectorOpen, setInspectorOpen] = useState<boolean>(false);
  const [simulatorOpen, setSimulatorOpen] = useState<boolean>(false);
  const [downloadModalOpen, setDownloadModalOpen] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [orders, setOrders] = useState<DropOrder[]>(INITIAL_DROP_ORDERS);
  const [metrics, setMetrics] = useState<CampusMetrics>(INITIAL_CAMPUS_METRICS);
  const [dispatchPulseCount, setDispatchPulseCount] = useState<number>(0);

  const currentZoneSpec =
    CAMPUS_ZONES.find((z) => z.id === activeZone) ?? CAMPUS_ZONES[0];
  const activeSoundscape = getAmbientSoundscapeForZone(activeZone);

  // Sync activeZone with the ambient soundscapes manager in soundEngine
  useEffect(() => {
    soundEngine.setZoneSoundscape(activeZone);
  }, [activeZone]);

  // Keyboard shortcut 'H' to toggle Bottom Control Dock (Cinema / Zen Mode)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement &&
        ['INPUT', 'SELECT', 'TEXTAREA'].includes(document.activeElement.tagName)
      ) {
        return;
      }
      if (e.key === 'h' || e.key === 'H') {
        setDockCollapsed((prev) => !prev);
      } else if (e.key === 'Escape') {
        setSimulatorOpen(false);
        setInspectorOpen(false);
        setDownloadModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSelectZone = (zoneId: CampusZoneId) => {
    setActiveZone(zoneId);
    // When selecting an interior room, ensure roof cutaway is open enough to see inside
    if (
      (zoneId === 'executive' ||
        zoneId === 'dispatch' ||
        zoneId === 'engineering' ||
        zoneId === 'merchant') &&
      cutawayFactor < 0.7
    ) {
      setCutawayFactor(1.0);
    }
  };

  const handleDispatchOrder = (input: DispatchFormInput) => {
    const result = createDispatchedOrder(input, orders, metrics);
    setOrders(result.updatedOrders);
    setMetrics(result.updatedMetrics);
    setDispatchPulseCount((c) => c + 1);
  };

  const handleToggleSound = () => {
    const next = !soundEnabled;
    soundEngine.setEnabled(next);
    setSoundEnabled(next);
    if (next) {
      soundEngine.playUiClick(600);
    }
  };

  return (
    <main
      data-zone={activeZone}
      data-soundscape={activeSoundscape.trackId}
      data-roof={cutawayFactor >= 0.5 ? 'open' : 'closed'}
      className="relative w-full h-full overflow-hidden select-none"
    >
      {/* 1. Dedicated 3D WebGL Viewport Container */}
      <CampusViewport
        activeZone={activeZone}
        cutawayFactor={cutawayFactor}
        lightingPreset={lightingPreset}
        dispatchPulseCount={dispatchPulseCount}
        onSelectZone={(zoneId) => {
          handleSelectZone(zoneId);
          setInspectorOpen(true);
        }}
      />

      {/* 2. Top Navigation Bar (Strict 3-Zone Contract with "Download DROP App" Green CTA) */}
      <TopBar
        activeZone={activeZone}
        onSelectZone={handleSelectZone}
        onOpenSimulator={() => setSimulatorOpen(true)}
        onOpenDownloadModal={() => setDownloadModalOpen(true)}
      />

      {/* 3. Minimal Top-Left Spec Badge (Zero Center Viewport Occlusion) */}
      <div className="fixed top-14 left-3.5 right-3.5 sm:right-auto z-10 pointer-events-none sm:max-w-md">
        <div className="rounded-xl bg-[#0f172a]/90 border border-slate-700/80 px-3.5 py-2 text-white shadow-lg">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-slate-300">
            <span className="whitespace-nowrap">Joya, Amroha HQ</span>
            <span aria-hidden="true">·</span>
            <span className="text-[#10b981] font-mono-tabular whitespace-nowrap">
              {metrics.liveOrders} Live Orders
            </span>
            <span aria-hidden="true">·</span>
            <span className="text-[#d49b27] whitespace-nowrap">
              {activeSoundscape.label} ({activeSoundscape.trackId})
            </span>
          </div>
          <h1 className="font-brand text-sm sm:text-base font-bold text-white mt-0.5 truncate">
            {currentZoneSpec.title}
          </h1>
          <p className="text-[11px] text-slate-300 mt-0.5 truncate">
            DROP — One App for Everything Local · Drag to Orbit · Click Any Wing to Inspect
          </p>
        </div>
      </div>

      {/* 4. Optional Slide-Over Zone Architectural Blueprint Inspector */}
      <ZoneInspectorDrawer
        isOpen={inspectorOpen}
        activeZone={activeZone}
        metrics={metrics}
        onClose={() => setInspectorOpen(false)}
        onSelectZone={handleSelectZone}
        onOpenSimulator={() => setSimulatorOpen(true)}
      />

      {/* 5. Unified Collapsible Bottom Control Dock & Sticky "Download DROP - Free" Bar */}
      <BottomControlDock
        activeZone={activeZone}
        cutawayFactor={cutawayFactor}
        lightingPreset={lightingPreset}
        dockCollapsed={dockCollapsed}
        inspectorOpen={inspectorOpen}
        soundEnabled={soundEnabled}
        activeSoundscape={activeSoundscape}
        onSelectZone={handleSelectZone}
        onChangeCutaway={setCutawayFactor}
        onChangeLighting={setLightingPreset}
        onToggleDock={() => setDockCollapsed((prev) => !prev)}
        onToggleInspector={() => setInspectorOpen((prev) => !prev)}
        onToggleSound={handleToggleSound}
        onOpenSimulator={() => setSimulatorOpen(true)}
        onOpenDownloadModal={() => setDownloadModalOpen(true)}
      />

      {/* 6. DROP — One App for Everything Local (Joya, Amroha) Live Dispatch Simulator Modal */}
      <DropSimulatorModal
        isOpen={simulatorOpen}
        orders={orders}
        metrics={metrics}
        onClose={() => setSimulatorOpen(false)}
        onDispatchOrder={handleDispatchOrder}
      />

      {/* 7. Download & Share DROP App Popup Modal (PWA / ZIP / Public Share Link) */}
      <DownloadShareModal
        isOpen={downloadModalOpen}
        activeZone={activeZone}
        orders={orders}
        metrics={metrics}
        onClose={() => setDownloadModalOpen(false)}
      />
    </main>
  );
}
