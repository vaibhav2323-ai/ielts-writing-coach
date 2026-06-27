"use client";

import React from "react";
import {
  BarChart, Bar,
  LineChart, Line,
  PieChart, Pie, Cell,
  ComposedChart,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer,
} from "recharts";
import { ArrowRight } from "lucide-react";

// ─── Shared style constants ───────────────────────────────────────────────────

const PALETTE = [
  "#3b82f6", "#8b5cf6", "#10b981", "#f59e0b",
  "#ef4444", "#06b6d4", "#f97316", "#a855f7",
];
const TICK = "#71717a";
const GRID_C = "#3f3f46";
const TT: React.CSSProperties = {
  backgroundColor: "#18181b",
  border: "1px solid #3f3f46",
  borderRadius: "8px",
  color: "#e4e4e7",
  fontSize: "12px",
  padding: "8px 12px",
};
const LEG: React.CSSProperties = { color: "#a1a1aa", fontSize: "11px" };

function ChartTitle({ text }: { text: string }) {
  return (
    <p className="text-xs text-zinc-400 text-center mb-4 leading-snug px-2">{text}</p>
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = Record<string, any>;
type Series = { key: string; name?: string; color?: string };
type BarSeries = Series & { name: string };
type ChangeType = "replaced" | "expanded" | "unchanged" | "removed" | "new";

// ─── Bar Chart ────────────────────────────────────────────────────────────────

function BarView({ d }: { d: { title: string; xAxisLabel?: string; yAxisLabel?: string; data: Row[]; series: Series[] } }) {
  return (
    <>
      <ChartTitle text={d.title} />
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={d.data ?? []} margin={{ top: 4, right: 16, left: -4, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={GRID_C} />
          <XAxis dataKey="category" tick={{ fill: TICK, fontSize: 11 }} />
          <YAxis tick={{ fill: TICK, fontSize: 11 }} />
          <Tooltip contentStyle={TT} />
          <Legend wrapperStyle={LEG} />
          {(d.series ?? []).map((s, i) => (
            <Bar key={s.key} dataKey={s.key} name={s.name ?? s.key} fill={s.color ?? PALETTE[i % PALETTE.length]} radius={[3, 3, 0, 0]} maxBarSize={40} />
          ))}
        </BarChart>
      </ResponsiveContainer>
      {(d.xAxisLabel || d.yAxisLabel) && (
        <p className="text-[10px] text-zinc-600 text-center mt-1">
          {[d.xAxisLabel, d.yAxisLabel].filter(Boolean).join(" · ")}
        </p>
      )}
    </>
  );
}

// ─── Line Graph ───────────────────────────────────────────────────────────────

function LineView({ d }: { d: { title: string; xAxisLabel?: string; yAxisLabel?: string; data: Row[]; series: Series[] } }) {
  return (
    <>
      <ChartTitle text={d.title} />
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={d.data ?? []} margin={{ top: 4, right: 16, left: -4, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={GRID_C} />
          <XAxis dataKey="x" tick={{ fill: TICK, fontSize: 11 }} />
          <YAxis tick={{ fill: TICK, fontSize: 11 }} />
          <Tooltip contentStyle={TT} />
          <Legend wrapperStyle={LEG} />
          {(d.series ?? []).map((s, i) => (
            <Line
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.name ?? s.key}
              stroke={s.color ?? PALETTE[i % PALETTE.length]}
              strokeWidth={2}
              dot={{ r: 3, fill: s.color ?? PALETTE[i % PALETTE.length] }}
              activeDot={{ r: 5 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
      {(d.xAxisLabel || d.yAxisLabel) && (
        <p className="text-[10px] text-zinc-600 text-center mt-1">
          {[d.xAxisLabel, d.yAxisLabel].filter(Boolean).join(" · ")}
        </p>
      )}
    </>
  );
}

// ─── Pie Chart ────────────────────────────────────────────────────────────────

function PieView({ d }: { d: { title: string; data: { name: string; value: number }[] } }) {
  const renderLabel = ({
    cx = 0, cy = 0, midAngle = 0, innerRadius = 0, outerRadius = 0, percent = 0,
  }: {
    cx?: number; cy?: number; midAngle?: number;
    innerRadius?: number; outerRadius?: number; percent?: number;
  }) => {
    if (percent < 0.05) return null;
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.55;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return (
      <text x={x} y={y} fill="#e4e4e7" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={600}>
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <>
      <ChartTitle text={d.title} />
      <ResponsiveContainer width="100%" height={270}>
        <PieChart>
          <Pie
            data={d.data ?? []}
            cx="50%"
            cy="48%"
            outerRadius={100}
            dataKey="value"
            labelLine={false}
            label={renderLabel}
          >
            {(d.data ?? []).map((_, i) => (
              <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
            ))}
          </Pie>
          <Tooltip contentStyle={TT} formatter={(v) => [`${v}%`]} />
          <Legend wrapperStyle={LEG} />
        </PieChart>
      </ResponsiveContainer>
    </>
  );
}

// ─── Table ────────────────────────────────────────────────────────────────────

function TableView({ d }: { d: { title: string; headers: string[]; rows: (string | number)[][] } }) {
  return (
    <>
      <ChartTitle text={d.title} />
      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr>
              {(d.headers ?? []).map((h, i) => (
                <th
                  key={i}
                  className="px-3 py-2.5 text-left text-zinc-400 font-semibold border-b border-zinc-800 bg-zinc-800/60"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(d.rows ?? []).map((row, ri) => (
              <tr key={ri} className="border-b border-zinc-800/40 hover:bg-zinc-800/30 transition-colors">
                {row.map((cell, ci) => (
                  <td
                    key={ci}
                    className={`px-3 py-2 ${ci === 0 ? "font-medium text-zinc-200" : "text-zinc-300 tabular-nums"}`}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

// ─── Mixed Chart (Bar + Line, dual Y-axis) ────────────────────────────────────

function MixedView({ d }: {
  d: {
    title: string; xAxisLabel?: string; yLabel1?: string; yLabel2?: string;
    data: Row[]; bars: BarSeries[]; lines: BarSeries[];
  }
}) {
  return (
    <>
      <ChartTitle text={d.title} />
      <ResponsiveContainer width="100%" height={260}>
        <ComposedChart data={d.data ?? []} margin={{ top: 4, right: 32, left: -4, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={GRID_C} />
          <XAxis dataKey="x" tick={{ fill: TICK, fontSize: 11 }} />
          <YAxis yAxisId="left" tick={{ fill: TICK, fontSize: 11 }} />
          <YAxis yAxisId="right" orientation="right" tick={{ fill: TICK, fontSize: 11 }} />
          <Tooltip contentStyle={TT} />
          <Legend wrapperStyle={LEG} />
          {(d.bars ?? []).map((b, i) => (
            <Bar key={b.key} yAxisId="left" dataKey={b.key} name={b.name} fill={b.color ?? PALETTE[i % PALETTE.length]} radius={[3, 3, 0, 0]} maxBarSize={36} />
          ))}
          {(d.lines ?? []).map((l, i) => (
            <Line key={l.key} yAxisId="right" type="monotone" dataKey={l.key} name={l.name} stroke={l.color ?? PALETTE[(i + (d.bars?.length ?? 0)) % PALETTE.length]} strokeWidth={2} dot={{ r: 3 }} />
          ))}
        </ComposedChart>
      </ResponsiveContainer>
      <div className="flex gap-4 justify-center mt-1">
        {d.yLabel1 && <p className="text-[10px] text-zinc-600">← {d.yLabel1}</p>}
        {d.yLabel2 && <p className="text-[10px] text-zinc-600">{d.yLabel2} →</p>}
      </div>
    </>
  );
}

// ─── Map View ─────────────────────────────────────────────────────────────────

const CHANGE_STYLE: Record<ChangeType, { dot: string; bg: string; text: string; label: string }> = {
  new:       { dot: "bg-green-500",  bg: "bg-green-950/40",  text: "text-green-400",  label: "New" },
  expanded:  { dot: "bg-blue-500",   bg: "bg-blue-950/40",   text: "text-blue-400",   label: "Expanded" },
  replaced:  { dot: "bg-violet-500", bg: "bg-violet-950/40", text: "text-violet-400", label: "Replaced" },
  removed:   { dot: "bg-red-500",    bg: "bg-red-950/40",    text: "text-red-400",    label: "Removed" },
  unchanged: { dot: "bg-zinc-600",   bg: "bg-zinc-800/20",   text: "text-zinc-500",   label: "Unchanged" },
};

function MapView({ d }: {
  d: { title: string; period1: string; period2: string; changes: { feature: string; before: string; after: string; type: ChangeType }[] }
}) {
  return (
    <>
      <ChartTitle text={d.title} />
      <div className="grid grid-cols-2 gap-3 mb-4">
        {/* Before */}
        <div className="rounded-lg border border-zinc-800 bg-zinc-800/20 p-3">
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3">
            {d.period1 ?? "Before"}
          </p>
          <div className="space-y-2.5">
            {(d.changes ?? []).map((c, i) => {
              const s = CHANGE_STYLE[c.type] ?? CHANGE_STYLE.unchanged;
              return (
                <div key={i} className="flex items-start gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full shrink-0 mt-1.5 ${s.dot}`} />
                  <div>
                    <p className="text-[11px] font-medium text-zinc-300 leading-tight">{c.feature}</p>
                    <p className="text-[10px] text-zinc-500 leading-relaxed">{c.before}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        {/* After */}
        <div className="rounded-lg border border-zinc-800 bg-zinc-800/20 p-3">
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3">
            {d.period2 ?? "After"}
          </p>
          <div className="space-y-2">
            {(d.changes ?? []).map((c, i) => {
              const s = CHANGE_STYLE[c.type] ?? CHANGE_STYLE.unchanged;
              return (
                <div key={i} className={`flex items-start gap-2 rounded-md px-2 py-1.5 ${s.bg}`}>
                  <div className={`w-1.5 h-1.5 rounded-full shrink-0 mt-1.5 ${s.dot}`} />
                  <div>
                    <p className={`text-[11px] font-medium leading-tight ${s.text}`}>
                      {c.feature}
                      <span className="text-[9px] opacity-60 ml-1">({s.label})</span>
                    </p>
                    <p className="text-[10px] text-zinc-400 leading-relaxed">{c.after}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      {/* Legend */}
      <div className="flex flex-wrap gap-3 justify-center">
        {(Object.entries(CHANGE_STYLE) as [ChangeType, typeof CHANGE_STYLE[ChangeType]][]).map(([, s]) => (
          <div key={s.label} className="flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full ${s.dot}`} />
            <span className={`text-[10px] ${s.text}`}>{s.label}</span>
          </div>
        ))}
      </div>
    </>
  );
}

// ─── Process Diagram ──────────────────────────────────────────────────────────

function ProcessView({ d }: { d: { title: string; steps: string[] } }) {
  const steps = d.steps ?? [];
  return (
    <>
      <ChartTitle text={d.title} />
      <div className="space-y-0">
        {steps.map((step, i) => (
          <div key={i}>
            <div className="flex items-start gap-3 rounded-lg border border-zinc-800 bg-zinc-800/40 px-3 py-2.5">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-[10px] font-bold text-blue-400 mt-0.5">
                {i + 1}
              </span>
              <p className="text-xs text-zinc-300 leading-relaxed">{step}</p>
            </div>
            {i < steps.length - 1 && (
              <div className="flex justify-center my-0.5">
                <div className="w-px h-3 bg-zinc-700" />
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
}

// ─── Diagram (how something works) ───────────────────────────────────────────

function DiagramView({ d }: {
  d: {
    title: string;
    components: { id: string; name: string; description: string }[];
    connections: { from: string; to: string; label: string }[];
  }
}) {
  return (
    <>
      <ChartTitle text={d.title} />
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
        {(d.components ?? []).map((c) => (
          <div key={c.id} className="rounded-lg border border-zinc-800 bg-zinc-800/40 p-2.5">
            <div className="flex items-center gap-2 mb-1">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-[10px] font-bold text-blue-400">
                {c.id}
              </span>
              <p className="text-[11px] font-medium text-zinc-200 leading-tight">{c.name}</p>
            </div>
            <p className="text-[10px] text-zinc-500 leading-relaxed">{c.description}</p>
          </div>
        ))}
      </div>
      <p className="text-[10px] font-semibold text-zinc-600 uppercase tracking-wider mb-2">Flow</p>
      <div className="space-y-1.5">
        {(d.connections ?? []).map((c, i) => (
          <div key={i} className="flex items-center gap-2 rounded-md bg-zinc-800/30 px-3 py-1.5">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-[10px] font-bold text-zinc-400">
              {c.from}
            </span>
            <ArrowRight className="h-3 w-3 text-zinc-600 shrink-0" />
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-[10px] font-bold text-zinc-400">
              {c.to}
            </span>
            <span className="text-[10px] text-zinc-500 leading-relaxed">{c.label}</span>
          </div>
        ))}
      </div>
    </>
  );
}

// ─── Main Renderer ────────────────────────────────────────────────────────────

export default function ChartRenderer({ chartType, data }: { chartType: string; data: unknown }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const d = data as any;
  if (!d) return null;

  const inner = (() => {
    switch (chartType) {
      case "Bar Chart":          return <BarView d={d} />;
      case "Line Graph":         return <LineView d={d} />;
      case "Pie Chart":          return <PieView d={d} />;
      case "Table":              return <TableView d={d} />;
      case "Mixed (Bar + Line)": return <MixedView d={d} />;
      case "Map":                return <MapView d={d} />;
      case "Process Diagram":    return <ProcessView d={d} />;
      case "Diagram":            return <DiagramView d={d} />;
      default:                   return null;
    }
  })();

  if (!inner) return null;

  return (
    <div className="rounded-xl border border-zinc-800/60 bg-zinc-900 p-4 mb-4">
      {inner}
    </div>
  );
}
