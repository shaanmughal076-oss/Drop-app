import React from 'react';
import { CampusZoneId } from '../domain/campusData';
import { soundEngine } from '../utils/soundEffects';

export interface TopBarProps {
  activeZone: CampusZoneId;
  onSelectZone: (zoneId: CampusZoneId) => void;
  onOpenSimulator: () => void;
  onOpenDownloadModal: () => void;
}

const NAV_ITEMS: Array<{ id: CampusZoneId; label: string }> = [
  { id: 'overview', label: 'Campus Vista' },
  { id: 'executive', label: 'Executive Suite' },
  { id: 'dispatch', label: 'DROP Dispatch' },
  { id: 'engineering', label: 'Engineering Lab' },
];

export const TopBar: React.FC<TopBarProps> = ({
  activeZone,
  onSelectZone,
  onOpenSimulator,
  onOpenDownloadModal,
}) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-20 flex items-center justify-between gap-3 md:gap-8 px-3.5 md:px-6 py-3 bg-[#0f172a]/95 border-b border-slate-800 text-white">
      {/* Zone 1: Single text element wordmark */}
      <a
        href="#overview"
        onClick={(e) => {
          e.preventDefault();
          soundEngine.playUiClick(500);
          onSelectZone('overview');
        }}
        className="font-brand text-sm sm:text-base md:text-lg font-bold tracking-wider text-[#d49b27] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-[#d49b27]"
      >
        VENOM STONE COMPANY
      </a>

      {/* Zone 2: 5 concise single-line text navigation links */}
      <nav
        aria-label="Campus Zones"
        className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-300"
      >
        {NAV_ITEMS.map((item) => {
          const isActive = activeZone === item.id;
          return (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={(e) => {
                e.preventDefault();
                soundEngine.playUiClick(540);
                onSelectZone(item.id);
              }}
              className={`whitespace-nowrap shrink-0 py-1 border-b-2 transition-colors ${
                isActive
                  ? 'border-[#d49b27] text-white font-semibold'
                  : 'border-transparent text-slate-300 hover:text-white hover:border-slate-500'
              }`}
            >
              {item.label}
            </a>
          );
        })}
        <a
          href="#simulator"
          onClick={(e) => {
            e.preventDefault();
            soundEngine.playUiClick(620);
            onOpenSimulator();
          }}
          className="whitespace-nowrap shrink-0 py-1 border-b-2 border-transparent text-[#10b981] hover:text-[#34d399] hover:border-[#10b981] transition-colors"
        >
          DROP Simulator
        </a>
      </nav>

      {/* Zone 3: 1 primary action — Prominent Green "Download DROP App" Button */}
      <div className="flex items-center shrink-0">
        <button
          type="button"
          onClick={() => {
            soundEngine.playUiClick(660);
            onOpenDownloadModal();
          }}
          className="px-3.5 md:px-5 py-2 text-xs md:text-sm font-bold text-slate-950 bg-[#10b981] hover:bg-[#34d399] rounded-lg shadow-md transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-white"
        >
          Download DROP App
        </button>
      </div>
    </header>
  );
};
