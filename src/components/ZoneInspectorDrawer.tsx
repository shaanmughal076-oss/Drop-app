import React from 'react';
import {
  CAMPUS_ZONES,
  CampusMetrics,
  CampusZoneId,
} from '../domain/campusData';
import { soundEngine } from '../utils/soundEffects';
import { ZoneOrderVelocityChart } from './ZoneOrderVelocityChart';

export interface ZoneInspectorDrawerProps {
  isOpen: boolean;
  activeZone: CampusZoneId;
  metrics: CampusMetrics;
  onClose: () => void;
  onSelectZone: (zoneId: CampusZoneId) => void;
  onOpenSimulator: () => void;
}

export const ZoneInspectorDrawer: React.FC<ZoneInspectorDrawerProps> = ({
  isOpen,
  activeZone,
  metrics,
  onClose,
  onSelectZone,
  onOpenSimulator,
}) => {
  if (!isOpen) return null;

  const zone = CAMPUS_ZONES.find((z) => z.id === activeZone) ?? CAMPUS_ZONES[0];

  return (
    <aside
      aria-label="Campus Zone Architectural Blueprint Inspector"
      className="fixed top-16 right-4 z-20 w-[92vw] max-w-[390px] max-h-[calc(100vh-190px)] overflow-y-auto rounded-xl bg-[#0f172a]/95 border border-slate-700 p-5 text-white shadow-2xl"
    >
      {/* Top Unboxed Metadata & Close Button */}
      <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <span>{zone.wingLocation}</span>
        </div>
        <button
          type="button"
          onClick={() => {
            soundEngine.playUiClick(460);
            onClose();
          }}
          aria-label="Close Zone Blueprint Inspector"
          className="px-2.5 py-1 rounded text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer whitespace-nowrap shrink-0"
        >
          Close
        </button>
      </div>

      {/* Zone Title & Summary */}
      <div className="mt-2.5">
        <h2 className="font-brand text-base font-bold text-[#d49b27] leading-snug">
          {zone.title}
        </h2>
        <p className="mt-1.5 text-xs leading-relaxed text-slate-300">
          {zone.summary}
        </p>
      </div>

      {/* D3 Real-Time 60-Minute Order Flow Velocity Chart */}
      <ZoneOrderVelocityChart
        zoneId={activeZone}
        liveOrders={metrics.liveOrders}
      />

      {/* Architectural Specs Strip */}
      <div className="mt-3.5 grid grid-cols-2 gap-3 py-3 border-y border-slate-800 text-xs">
        <div>
          <div className="text-slate-400">Floor Area</div>
          <div className="mt-0.5 text-sm font-semibold text-white font-mono-tabular">
            {zone.floorAreaSqFt.toLocaleString()} sq ft
          </div>
        </div>
        <div>
          <div className="text-slate-400">Assigned Personnel</div>
          <div className="mt-0.5 text-sm font-semibold text-white font-mono-tabular">
            {zone.teamCount} Specialists
          </div>
        </div>
        <div className="col-span-2">
          <div className="text-slate-400">Material Finish Specification</div>
          <div className="mt-0.5 text-xs font-medium text-slate-200">
            {zone.architecturalFinish}
          </div>
        </div>
      </div>

      {/* Key Architectural & Operational Features */}
      <div className="mt-3.5">
        <h3 className="text-xs font-semibold text-slate-200">
          Installed Systems & Interior Fit-Out
        </h3>
        <ul className="mt-2 space-y-1.5 text-xs text-slate-300">
          {zone.features.map((feat, idx) => (
            <li key={idx} className="leading-relaxed">
              0{idx + 1}. {feat}
            </li>
          ))}
        </ul>
      </div>

      {/* Live Joya Hyperlocal Telemetry Summary */}
      <div className="mt-4 pt-3 border-t border-slate-800">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>DROP — Joya, Amroha Network</span>
          <span className="font-mono-tabular text-[#10b981]">
            {metrics.avgDeliveryMins}m Avg SLA
          </span>
        </div>
        <div className="mt-2 grid grid-cols-3 gap-2 text-center bg-slate-900/90 border border-slate-800 rounded-lg p-2.5">
          <div>
            <div className="text-[11px] text-slate-400">Live Orders</div>
            <div className="text-sm font-bold text-white font-mono-tabular">
              {metrics.liveOrders}
            </div>
          </div>
          <div>
            <div className="text-[11px] text-slate-400">EV Riders</div>
            <div className="text-sm font-bold text-[#10b981] font-mono-tabular">
              {metrics.activeRiders}
            </div>
          </div>
          <div>
            <div className="text-[11px] text-slate-400">Joya Stores</div>
            <div className="text-sm font-bold text-[#d49b27] font-mono-tabular">
              {metrics.joyaMerchants}
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-4 flex items-center gap-2">
        <button
          type="button"
          onClick={() => {
            soundEngine.playUiClick(620);
            onOpenSimulator();
          }}
          className="flex-1 px-4 py-2 rounded-lg bg-[#10b981] hover:bg-[#34d399] text-slate-950 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          Dispatch Local Order
        </button>
        <button
          type="button"
          onClick={() => {
            const idx = CAMPUS_ZONES.findIndex((z) => z.id === activeZone);
            const nextZone = CAMPUS_ZONES[(idx + 1) % CAMPUS_ZONES.length];
            soundEngine.playUiClick(540);
            onSelectZone(nextZone.id);
          }}
          className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          Next Wing
        </button>
      </div>
    </aside>
  );
};
