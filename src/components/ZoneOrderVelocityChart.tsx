import React, { useEffect, useMemo, useState } from 'react';
import * as d3 from 'd3';
import {
  CampusZoneId,
  OrderVelocityPoint,
  computeOrderVelocitySummary,
  generateZoneOrderVelocitySeries,
} from '../domain/campusData';
import { soundEngine } from '../utils/soundEffects';

export interface ZoneOrderVelocityChartProps {
  zoneId: CampusZoneId;
  liveOrders: number;
}

export const ZoneOrderVelocityChart: React.FC<ZoneOrderVelocityChartProps> = ({
  zoneId,
  liveOrders,
}) => {
  const [tickStep, setTickStep] = useState<number>(0);
  const [isLive, setIsLive] = useState<boolean>(true);
  const [inspectedIndex, setInspectedIndex] = useState<number | null>(null);

  // Reset inspected point when switching campus zones
  useEffect(() => {
    setInspectedIndex(null);
  }, [zoneId]);

  // Real-time stream tick (advances order velocity curve every 2.5 seconds)
  useEffect(() => {
    if (!isLive) return;
    const intervalId = window.setInterval(() => {
      setTickStep((prev) => prev + 1);
    }, 2500);
    return () => window.clearInterval(intervalId);
  }, [isLive]);

  const series = useMemo(
    () => generateZoneOrderVelocitySeries(zoneId, liveOrders, tickStep),
    [zoneId, liveOrders, tickStep],
  );

  const summary = useMemo(
    () => computeOrderVelocitySummary(zoneId, series),
    [zoneId, series],
  );

  // SVG dimensions & D3 scales
  const width = 330;
  const height = 136;
  const padLeft = 28;
  const padRight = 10;
  const padTop = 12;
  const padBottom = 22;

  const { xScale, yScale, linePath, areaPath, yTicks } = useMemo(() => {
    const x = d3
      .scaleLinear()
      .domain([60, 0]) // 60 minutes ago on left -> 0 (Now) on right
      .range([padLeft, width - padRight]);

    const maxVal = d3.max(series, (d) => d.ordersPerMin) ?? 30;
    const minVal = d3.min(series, (d) => d.ordersPerMin) ?? 0;
    const yMin = Math.max(0, Math.floor(minVal * 0.75));
    const yMax = Math.ceil(maxVal * 1.15);

    const y = d3
      .scaleLinear()
      .domain([yMin, yMax])
      .range([height - padBottom, padTop]);

    const lineGen = d3
      .line<OrderVelocityPoint>()
      .x((d) => x(d.minutesAgo))
      .y((d) => y(d.ordersPerMin))
      .curve(d3.curveMonotoneX);

    const areaGen = d3
      .area<OrderVelocityPoint>()
      .x((d) => x(d.minutesAgo))
      .y0(height - padBottom)
      .y1((d) => y(d.ordersPerMin))
      .curve(d3.curveMonotoneX);

    return {
      xScale: x,
      yScale: y,
      linePath: lineGen(series) ?? '',
      areaPath: areaGen(series) ?? '',
      yTicks: y.ticks(3),
    };
  }, [series]);

  const activePointIndex =
    inspectedIndex !== null && series[inspectedIndex]
      ? inspectedIndex
      : series.length - 1;
  const activePoint = series[activePointIndex] ?? series[series.length - 1];

  const isPositiveDelta = summary.deltaPercent >= 0;

  return (
    <section
      aria-label="Order Flow Velocity Last Hour D3 Chart"
      className="mt-4 pt-3 border-t border-slate-800"
    >
      {/* Header Row */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <h3 className="text-xs font-semibold text-slate-200">
            Order Flow Velocity (Last 60m)
          </h3>
          <div className="text-[11px] text-slate-400">
            {summary.zoneUnitLabel} · 5m Interval Stream
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            soundEngine.playUiClick(580);
            setIsLive((prev) => !prev);
          }}
          aria-label={
            isLive
              ? 'Pause Real-Time Velocity Stream'
              : 'Resume Real-Time Velocity Stream'
          }
          className={`px-2 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer shrink-0 ${
            isLive
              ? 'bg-emerald-950/90 text-[#10b981] border border-emerald-700/60 hover:bg-emerald-900/80'
              : 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700'
          }`}
        >
          {isLive ? 'Live Stream · Active' : 'Stream Paused'}
        </button>
      </div>

      {/* KPI Summary Strip */}
      <div className="mt-2.5 grid grid-cols-4 gap-1.5 bg-slate-900/90 border border-slate-800 rounded-lg p-2 text-center">
        <div>
          <div className="text-[10px] text-slate-400">Current</div>
          <div
            data-testid="velocity-current-rate"
            className="text-xs font-bold text-white font-mono-tabular"
          >
            {summary.currentRate.toFixed(1)}/m
          </div>
        </div>
        <div>
          <div className="text-[10px] text-slate-400">60m Peak</div>
          <div
            data-testid="velocity-peak-rate"
            className="text-xs font-bold text-[#d49b27] font-mono-tabular"
          >
            {summary.peakRate.toFixed(1)}/m
          </div>
        </div>
        <div>
          <div className="text-[10px] text-slate-400">60m Avg</div>
          <div
            data-testid="velocity-avg-rate"
            className="text-xs font-bold text-slate-200 font-mono-tabular"
          >
            {summary.avgRate.toFixed(1)}/m
          </div>
        </div>
        <div>
          <div className="text-[10px] text-slate-400">1h Delta</div>
          <div
            data-testid="velocity-delta-pct"
            className={`text-xs font-bold font-mono-tabular ${
              isPositiveDelta ? 'text-[#10b981]' : 'text-amber-400'
            }`}
          >
            {isPositiveDelta ? '+' : ''}
            {summary.deltaPercent.toFixed(1)}%
          </div>
        </div>
      </div>

      {/* D3 SVG Line & Area Chart */}
      <div className="mt-2 bg-slate-950/90 border border-slate-800/90 rounded-lg p-2">
        <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1 px-1">
          <span>
            Window: <strong className="text-slate-200">-60m → Now</strong>
          </span>
          {activePoint && (
            <span className="font-mono-tabular text-slate-200">
              {activePoint.timeLabel}:{' '}
              <strong className="text-[#10b981]">
                {activePoint.ordersPerMin.toFixed(1)} orders/min
              </strong>
            </span>
          )}
        </div>

        <svg
          data-testid="d3-order-velocity-svg"
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-32 overflow-visible select-none"
          role="img"
          aria-label={`D3 line chart showing order flow velocity over the last 60 minutes for ${zoneId}`}
        >
          <defs>
            <linearGradient
              id={`velocity-area-grad-${zoneId}`}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.36" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {/* Horizontal Y-Axis Gridlines & Labels */}
          {yTicks.map((tickVal) => {
            const yPos = yScale(tickVal);
            return (
              <g key={tickVal}>
                <line
                  x1={padLeft}
                  x2={width - padRight}
                  y1={yPos}
                  y2={yPos}
                  stroke="#1e293b"
                  strokeDasharray="3 3"
                  strokeWidth={1}
                />
                <text
                  x={padLeft - 5}
                  y={yPos + 3}
                  textAnchor="end"
                  fill="#64748b"
                  fontSize="9"
                  className="font-mono-tabular"
                >
                  {tickVal}
                </text>
              </g>
            );
          })}

          {/* X-Axis Time Labels (-60m, -45m, -30m, -15m, Now) */}
          {[60, 45, 30, 15, 0].map((minAgo) => {
            const xPos = xScale(minAgo);
            return (
              <g key={minAgo}>
                <line
                  x1={xPos}
                  x2={xPos}
                  y1={padTop}
                  y2={height - padBottom}
                  stroke="#0f172a"
                  strokeWidth={1}
                />
                <text
                  x={xPos}
                  y={height - 6}
                  textAnchor="middle"
                  fill="#94a3b8"
                  fontSize="9"
                  className="font-mono-tabular"
                >
                  {minAgo === 0 ? 'Now' : `-${minAgo}m`}
                </text>
              </g>
            );
          })}

          {/* D3 Area Under Curve */}
          <path
            data-testid="d3-velocity-area"
            d={areaPath}
            fill={`url(#velocity-area-grad-${zoneId})`}
          />

          {/* D3 Monotone Cubic Line Path */}
          <path
            data-testid="d3-velocity-line"
            d={linePath}
            fill="none"
            stroke="#10b981"
            strokeWidth={2.25}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Active Crosshair Guide */}
          {activePoint && (
            <line
              x1={xScale(activePoint.minutesAgo)}
              x2={xScale(activePoint.minutesAgo)}
              y1={padTop}
              y2={height - padBottom}
              stroke="#d49b27"
              strokeWidth={1}
              strokeDasharray="2 2"
            />
          )}

          {/* Interactive Data Nodes */}
          {series.map((pt, idx) => {
            const cx = xScale(pt.minutesAgo);
            const cy = yScale(pt.ordersPerMin);
            const isSelected = idx === activePointIndex;
            return (
              <g key={pt.minutesAgo}>
                <circle
                  cx={cx}
                  cy={cy}
                  r={isSelected ? 4.5 : 2.5}
                  fill={isSelected ? '#d49b27' : '#10b981'}
                  stroke="#0f172a"
                  strokeWidth={1.5}
                />
                {/* Larger invisible hit target for easy hover/tap scrubbing */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={9}
                  fill="transparent"
                  className="cursor-pointer"
                  onMouseEnter={() => setInspectedIndex(idx)}
                  onClick={() => {
                    soundEngine.playUiClick(520 + idx * 15);
                    setInspectedIndex(idx);
                  }}
                >
                  <title>{`${pt.timeLabel}: ${pt.ordersPerMin.toFixed(1)} orders/min`}</title>
                </circle>
              </g>
            );
          })}
        </svg>
      </div>
    </section>
  );
};
