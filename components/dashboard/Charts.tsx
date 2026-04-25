"use client";

import { useId, useState } from "react";

type Point = {
  label: string;
  count: number;
};

const chartColors = ["#ffffff", "#229ED9", "#a1a1aa", "#52525b", "#0ea5e9", "#d4d4d8"];
const compactNumber = new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 });

function EmptyChart() {
  return (
    <div className="flex h-64 items-center justify-center border border-white/5 bg-zinc-950/40 text-sm text-zinc-600">
      Not available
    </div>
  );
}

function shortLabel(label: string, maxLength = 18) {
  return label.length > maxLength ? `${label.slice(0, maxLength - 1)}...` : label;
}

function getMax(data: Point[]) {
  return Math.max(1, ...data.map((point) => point.count));
}

export function LineMetricChart({ data }: { data: Point[] }) {
  const gradientId = useId();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  if (!data.length) {
    return <EmptyChart />;
  }

  const width = 720;
  const height = 256;
  const padding = { top: 18, right: 18, bottom: 42, left: 48 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;
  const max = getMax(data);
  const points = data.map((point, index) => {
    const x =
      data.length === 1
        ? padding.left + plotWidth / 2
        : padding.left + (index / (data.length - 1)) * plotWidth;
    const y = padding.top + plotHeight - (point.count / max) * plotHeight;

    return { ...point, x, y };
  });
  const linePath = points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${padding.top + plotHeight} L ${points[0].x} ${
    padding.top + plotHeight
  } Z`;
  const xLabels =
    data.length <= 2
      ? points
      : [points[0], points[Math.floor(points.length / 2)], points[points.length - 1]];
  const activePoint = activeIndex === null ? null : points[activeIndex] ?? null;
  const tooltipWidth = 162;
  const tooltipHeight = 54;
  const tooltipX = activePoint
    ? Math.min(width - tooltipWidth - 8, Math.max(8, activePoint.x - tooltipWidth / 2))
    : 0;
  const tooltipY = activePoint
    ? activePoint.y < padding.top + tooltipHeight + 20
      ? activePoint.y + 18
      : activePoint.y - tooltipHeight - 18
    : 0;

  return (
    <svg
      className="h-64 w-full overflow-visible"
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label="Line chart"
      onMouseLeave={() => setActiveIndex(null)}
      onBlur={() => setActiveIndex(null)}
    >
      {[0, 0.25, 0.5, 0.75, 1].map((step) => {
        const y = padding.top + plotHeight - step * plotHeight;

        return (
          <g key={step}>
            <line x1={padding.left} x2={width - padding.right} y1={y} y2={y} stroke="rgba(255,255,255,0.08)" />
            <text x={padding.left - 10} y={y + 4} textAnchor="end" className="fill-zinc-600 text-[11px]">
              {compactNumber.format(Math.round(max * step))}
            </text>
          </g>
        );
      })}
      <path d={areaPath} fill={`url(#${gradientId})`} />
      <path d={linePath} fill="none" stroke="#ffffff" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
      {points.length === 1 ? <circle cx={points[0].x} cy={points[0].y} r="4" fill="#229ED9" /> : null}
      {xLabels.map((point) => (
        <text key={`${point.label}-${point.x}`} x={point.x} y={height - 14} textAnchor="middle" className="fill-zinc-500 text-[11px]">
          {point.label.slice(5)}
        </text>
      ))}
      {points.map((point, index) => {
        const previousX = index === 0 ? padding.left : (points[index - 1].x + point.x) / 2;
        const nextX = index === points.length - 1 ? width - padding.right : (point.x + points[index + 1].x) / 2;

        return (
          <rect
            key={`${point.label}-hit-zone`}
            x={previousX}
            y={padding.top}
            width={nextX - previousX}
            height={plotHeight}
            fill="transparent"
            tabIndex={0}
            onMouseEnter={() => setActiveIndex(index)}
            onFocus={() => setActiveIndex(index)}
          />
        );
      })}
      {activePoint ? (
        <g pointerEvents="none">
          <line
            x1={activePoint.x}
            x2={activePoint.x}
            y1={padding.top}
            y2={padding.top + plotHeight}
            stroke="rgba(34,158,217,0.55)"
            strokeDasharray="4 5"
          />
          <circle cx={activePoint.x} cy={activePoint.y} r="5" fill="#229ED9" stroke="#ffffff" strokeWidth="2" />
          <g transform={`translate(${tooltipX} ${tooltipY})`}>
            <rect width={tooltipWidth} height={tooltipHeight} fill="#050505" stroke="rgba(255,255,255,0.18)" />
            <text x="12" y="21" className="fill-zinc-400 text-[11px]">
              {activePoint.label}
            </text>
            <text x="12" y="41" className="fill-white text-[16px] font-semibold">
              {activePoint.count.toLocaleString("en")}
            </text>
          </g>
        </g>
      ) : null}
      <defs>
        <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#229ED9" stopOpacity="0.34" />
          <stop offset="100%" stopColor="#229ED9" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function BarMetricChart({ data }: { data: Point[] }) {
  if (!data.length) {
    return <EmptyChart />;
  }

  const rows = data.slice(0, 8);
  const max = getMax(rows);

  return (
    <div className="flex h-64 flex-col justify-center gap-3">
      {rows.map((point, index) => (
        <div key={point.label} className="grid grid-cols-[minmax(6rem,11rem)_1fr_3.5rem] items-center gap-3">
          <div className="truncate font-mono text-[11px] uppercase tracking-[0.12em] text-zinc-500" title={point.label}>
            {shortLabel(point.label)}
          </div>
          <div className="h-6 border border-white/10 bg-zinc-950">
            <div
              className="h-full bg-white"
              style={{
                width: `${Math.max(3, (point.count / max) * 100)}%`,
                backgroundColor: chartColors[index % chartColors.length],
              }}
            />
          </div>
          <div className="text-right font-mono text-xs text-zinc-400">{compactNumber.format(point.count)}</div>
        </div>
      ))}
    </div>
  );
}

export function DonutMetricChart({ data }: { data: Point[] }) {
  if (!data.length) {
    return <EmptyChart />;
  }

  const rows = data.slice(0, 6);
  const total = rows.reduce((sum, point) => sum + point.count, 0);
  const radius = 74;
  const circumference = 2 * Math.PI * radius;

  if (total <= 0) {
    return <EmptyChart />;
  }

  const segments = rows.map((point, index) => {
    const dash = (point.count / total) * circumference;
    const offset = rows
      .slice(0, index)
      .reduce((sum, previousPoint) => sum + (previousPoint.count / total) * circumference, 0);

    return { ...point, dash, offset };
  });

  return (
    <div className="grid h-64 min-w-0 items-center gap-4 sm:grid-cols-[15rem_1fr]">
      <svg className="mx-auto h-56 w-56" viewBox="0 0 200 200" role="img" aria-label="Donut chart">
        <circle cx="100" cy="100" r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="24" />
        {segments.map((point, index) => {
          return (
            <circle
              key={point.label}
              cx="100"
              cy="100"
              r={radius}
              fill="none"
              stroke={chartColors[index % chartColors.length]}
              strokeDasharray={`${Math.max(0, point.dash - 2)} ${circumference}`}
              strokeDashoffset={-point.offset}
              strokeWidth="24"
              transform="rotate(-90 100 100)"
            />
          );
        })}
        <text x="100" y="96" textAnchor="middle" className="fill-white text-2xl font-semibold">
          {compactNumber.format(total)}
        </text>
        <text x="100" y="117" textAnchor="middle" className="fill-zinc-500 text-[11px] uppercase tracking-[0.12em]">
          total
        </text>
      </svg>
      <div className="min-w-0 space-y-3">
        {rows.map((point, index) => (
          <div key={point.label} className="grid grid-cols-[0.75rem_1fr_auto] items-center gap-3 text-sm">
            <span className="h-3 w-3" style={{ backgroundColor: chartColors[index % chartColors.length] }} />
            <span className="truncate text-zinc-400" title={point.label}>
              {point.label}
            </span>
            <span className="font-mono text-xs text-zinc-500">{compactNumber.format(point.count)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
