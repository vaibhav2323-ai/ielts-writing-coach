"use client";

import { useEffect, useState, useRef } from "react";
import { TrendingUp, FileText, BookOpen, Flame, ArrowUpRight } from "lucide-react";

type Props = {
  band: number | null;
  essays: number;
  words: number;
  streak: number;
};

function useCountUp(target: number, duration = 900) {
  const [value, setValue] = useState(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (target === 0) { setValue(0); return; }
    const start = performance.now();
    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      setValue(Math.round(eased * target));
      if (progress < 1) rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration]);

  return value;
}

type CardProps = {
  icon: React.ReactNode;
  iconColor: string;
  label: string;
  value: number | null;
  displayValue: string;
  sub: string;
  trend: string;
};

function StatCard({ icon, iconColor, label, value, displayValue, sub, trend }: CardProps) {
  const animated = useCountUp(value ?? 0, 900);
  const shown = value != null && value > 0
    ? (value < 10 ? animated.toFixed(1) : String(animated))
    : displayValue;

  return (
    <div
      className="flex flex-col p-5 rounded-lg"
      style={{ background: "#111111", border: "1px solid #222222" }}
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center"
          style={{ background: "#1a1a1a" }}
        >
          <span style={{ color: iconColor }}>{icon}</span>
        </div>
        <span
          className="text-xs font-medium flex items-center gap-0.5"
          style={{ color: "#4F46E5" }}
        >
          <ArrowUpRight className="h-3 w-3" />
          {trend}
        </span>
      </div>

      <p
        className="leading-none mb-1.5 tabular"
        style={{ fontSize: "2rem", fontWeight: 700, color: "white", letterSpacing: "-0.03em" }}
      >
        {shown}
      </p>
      <p className="text-sm font-medium text-white mb-0.5">{label}</p>
      <p style={{ fontSize: "12px", color: "#666" }}>{sub}</p>
    </div>
  );
}

export function DashboardStats({ band, essays, words, streak }: Props) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <StatCard
        icon={<TrendingUp className="h-4 w-4" />}
        iconColor="#4F46E5"
        label="Current Band"
        value={band}
        displayValue={band != null ? band.toFixed(1) : "—"}
        sub="from last test"
        trend="+0.5"
      />
      <StatCard
        icon={<FileText className="h-4 w-4" />}
        iconColor="#10b981"
        label="Essays Completed"
        value={essays}
        displayValue={String(essays)}
        sub="this month"
        trend={`+${essays}`}
      />
      <StatCard
        icon={<BookOpen className="h-4 w-4" />}
        iconColor="#f59e0b"
        label="Words Learned"
        value={words}
        displayValue={String(words)}
        sub="this week"
        trend={`+${words}`}
      />
      <StatCard
        icon={<Flame className="h-4 w-4" />}
        iconColor="#ef4444"
        label="Day Streak"
        value={streak}
        displayValue={String(streak)}
        sub="keep it up"
        trend={streak > 0 ? `Best: ${streak}` : "Start now"}
      />
    </div>
  );
}
