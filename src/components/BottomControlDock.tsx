import React, { useState } from 'react';
import {
  AmbientSoundscapeSpec,
  CAMPUS_ZONES,
  CampusZoneId,
  LightingPreset,
  buildPublicShareLink,
} from '../domain/campusData';
import { soundEngine } from '../utils/soundEffects';
import { copyTextRobust } from '../utils/usePWAInstall';

export interface BottomControlDockProps {
  activeZone: CampusZoneId;
  cutawayFactor: number;
  lightingPreset: LightingPreset;
  dockCollapsed: boolean;
  inspectorOpen: boolean;
  soundEnabled: boolean;
  activeSoundscape: AmbientSoundscapeSpec;
  onSelectZone: (zoneId: CampusZoneId) => void;
  onChangeCutaway: (val: number) => void;
  onChangeLighting: (preset: LightingPreset) => void;
  onToggleDock: () => void;
  onToggleInspector: () => void;
  onToggleSound: () => void;
  onOpenSimulator: () => void;
  onOpenDownloadModal: () => void;
}

export const BottomControlDock: React.FC<BottomControlDockProps> = ({
  activeZone,
  cutawayFactor,
  lightingPreset,
  dockCollapsed,
  inspectorOpen,
  soundEnabled,
  activeSoundscape,
  onSelectZone,
  onChangeCutaway,
  onChangeLighting,
  onToggleDock,
  onToggleInspector,
  onToggleSound,
  onOpenSimulator,
  onOpenDownloadModal,
}) => {
  const [linkCopied, setLinkCopied] = useState(false);
  const isOpenRoof = cutawayFactor >= 0.5;

  const handleQuickCopyLink = async () => {
    soundEngine.playUiClick(680);
    const origin =
      typeof window !== 'undefined' ? window.location.origin : undefined;
    const pkg = buildPublicShareLink(origin, activeZone);
    await copyTextRobust(pkg.shareUrl);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 3000);
  };

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-20 flex flex-col items-center pointer-events-none"
      role="region"
      aria-label="3D Campus Controls and Download Sticky Dock"
    >
      {/* Collapsible 3D Campus Controls Panel */}
      <div className="w-[94vw] max-w-[940px] flex flex-col items-center">
        <button
          type="button"
          onClick={() => {
            soundEngine.playUiClick(480);
            onToggleDock();
          }}
          className="pointer-events-auto mb-1 px-3.5 py-1 rounded-t-lg bg-[#0f172a]/95 text-slate-200 hover:text-white border border-slate-700 text-xs font-medium tracking-wide transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          aria-expanded={!dockCollapsed}
        >
          {dockCollapsed ? '▴ Show 3D Controls (H)' : '▾ Hide 3D Controls (H)'}
        </button>

        {!dockCollapsed && (
          <div className="pointer-events-auto w-full rounded-t-xl bg-[#0f172a]/95 border-x border-t border-slate-700/90 px-3.5 py-2.5 text-white shadow-2xl flex flex-col gap-2.5">
            {/* Top Row: Zone Switcher Pills & Inspector/Simulator Toggles */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
              <div className="flex items-center gap-1 overflow-x-auto max-w-full py-0.5">
                {CAMPUS_ZONES.map((zone) => {
                  const selected = zone.id === activeZone;
                  return (
                    <button
                      key={zone.id}
                      type="button"
                      onClick={() => {
                        soundEngine.playUiClick(550);
                        onSelectZone(zone.id);
                      }}
                      className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                        selected
                          ? 'bg-[#d49b27] text-slate-950 font-semibold'
                          : 'bg-slate-800/90 text-slate-300 hover:bg-slate-700 hover:text-white'
                      }`}
                    >
                      {zone.shortLabel}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playUiClick(590);
                    onToggleInspector();
                  }}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    inspectorOpen
                      ? 'bg-[#d49b27] text-slate-950'
                      : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                  }`}
                >
                  {inspectorOpen ? 'Hide Blueprint' : 'Inspect Blueprint'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playUiClick(620);
                    onOpenSimulator();
                  }}
                  className="px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-[#10b981] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  DROP Live Simulator
                </button>
              </div>
            </div>

            {/* Middle Row: Open-Roof Cutaway Slider, Lighting Presets & Ambient Soundscape Toggle */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex flex-wrap items-center justify-between sm:justify-start gap-2 w-full lg:w-auto">
                <button
                  type="button"
                  onClick={() => {
                    const next = isOpenRoof ? 0 : 1;
                    soundEngine.playRoofWhoosh(next > 0.5);
                    onChangeCutaway(next);
                  }}
                  className={`px-2.5 py-1 rounded-md font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    isOpenRoof
                      ? 'bg-[#d49b27]/20 text-[#fbbf24] border border-[#d49b27]/50'
                      : 'bg-slate-800 text-slate-200 border border-slate-700'
                  }`}
                >
                  {isOpenRoof ? 'Open-Roof HQ Active' : 'Closed Roof'}
                </button>

                <label
                  htmlFor="roof-cutaway-slider"
                  className="flex items-center gap-2 text-slate-300 whitespace-nowrap shrink-0"
                >
                  <span>Roof Cutaway</span>
                  <input
                    id="roof-cutaway-slider"
                    type="range"
                    min={0}
                    max={100}
                    value={Math.round(cutawayFactor * 100)}
                    onChange={(e) => onChangeCutaway(Number(e.target.value) / 100)}
                    className="w-20 sm:w-28 accent-[#d49b27] cursor-pointer"
                  />
                  <span className="font-mono-tabular text-slate-200 w-9 text-right">
                    {Math.round(cutawayFactor * 100)}%
                  </span>
                </label>
              </div>

              <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800 shrink-0">
                {(
                  [
                    { id: 'daylight', label: 'Daylight Sky' },
                    { id: 'golden', label: 'Golden Hour' },
                    { id: 'night', label: 'Night Shift' },
                  ] as Array<{ id: LightingPreset; label: string }>
                ).map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      soundEngine.playUiClick(510);
                      onChangeLighting(preset.id);
                    }}
                    className={`px-2 py-1 rounded text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      lightingPreset === preset.id
                        ? 'bg-slate-700 text-white font-semibold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={onToggleSound}
                aria-label={soundEnabled ? 'Mute Campus Audio' : 'Enable Campus Audio'}
                title={activeSoundscape.description}
                className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer font-mono-tabular"
              >
                {soundEnabled
                  ? `Audio: ${activeSoundscape.trackId}`
                  : `Muted (${activeSoundscape.trackId})`}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Persistent Sticky Bottom Bar with "Copy Full Download Link" & "Download DROP - Free" */}
      <div className="pointer-events-auto w-full bg-[#0f172a]/95 border-t border-slate-800 px-3 md:px-6 py-2 flex items-center justify-between gap-2">
        <div className="hidden sm:flex items-center gap-2 min-w-0 text-xs text-slate-300 truncate">
          <span className="font-brand font-bold text-[#d49b27] whitespace-nowrap">
            DROP JOYA
          </span>
          <span aria-hidden="true">·</span>
          <span className="truncate">
            One App for Everything Local (Joya, Amroha)
          </span>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={handleQuickCopyLink}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            {linkCopied ? 'Copied Full Link!' : 'Copy Full Download Link'}
          </button>

          <button
            type="button"
            onClick={() => {
              soundEngine.playUiClick(680);
              onOpenDownloadModal();
            }}
            className="px-3.5 py-1.5 rounded-lg bg-[#10b981] hover:bg-[#34d399] text-slate-950 text-xs font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer shadow-sm"
          >
            Download DROP - Free
          </button>
        </div>
      </div>
    </div>
  );
};
