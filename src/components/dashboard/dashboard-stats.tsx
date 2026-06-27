"use client";

import { useEffect, useState, useRef } from "react";

type Props = {
  band: number | null;
  essays: number;
  words: number;
  streak: number;
};

const stats = (p: Props) => [
  {
    label: "Current Band",
    value: p.band != null ? p.band : null,
    display: p.band != null ? p.band.toFixed(1) : "—",
    sub: p.band != null ? "Keep writing to improve" : "No essays scored yet",
    accent: "linear-gradient(90deg, #6366f1, #818cf8)",
    glow: "rgba(99,102,241,0.15)",
    isText: p.band == null,
  },
  {
    label: "Essays Completed",
    value: p.essays,
    display: String(p.essays),
    sub: p.essays > 0 ? `${p.essays} essay${p.essays === 1 ? "" : "s"} written` : "Start your first session",
    accent: "linear-gradient(90deg, #8b5cf6, #a78bfa)",
    glow: "rgba(139,92,246,0.15)",
    isText: false,
  },
  {
    label: "Words Learned",
    value: p.words,
    display: String(p.words),
    sub: p.words > 0 ? "From vocabulary practice" : "Explore vocabulary builder",
    accent: "linear-gradient(90deg, #10b981, #34d399)",
    glow: "rgba(16,185,129,0.15)",
    isText: false,
  },
  {
    label: "Day Streak",
    value: p.streak,
    display: String(p.streak),
    sub: p.streak > 0 ? `${p.streak} day${p.streak === 1 ? "" : "s"} in a row 🔥` : "Practice daily to build a streak",
    accent: "linear-gradient(90deg, #f59e0b, #fbbf24)",
    glow: "rgba(245,158,11,0.15)",
    isText: false,
  },
];

function useCountUp(target: number, duration = 900) {
  const [value, setValue] = useState(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (target === 0) { setValue(0); return; }
    const start = performance.now();

    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutQuart
      const eased = 1 - Math.pow(1 - progress, 4);
      setValue(Math.round(eased * target));
      if (progress < 1) rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration]);

  return value;
}

function StatCard({
  label,
  value,
  display,
  sub,
  accent,
  glow,
  isText,
  delay,
}: ReturnType<typeof stats>[number] & { delay: number }) {
  const animated = useCountUp(isText || value == null ? 0 : (value as number), 900);

  const displayValue = isText
    ? display
    : typeof value === "number" && value > 0
    ? value < 10
      ? animated.toFixed(label === "Current Band" ? 1 : 0)
      : String(animated)
    : display;

  return (
    <div
      className="relative rounded-xl p-5 overflow-hidden"
      style={{
        background: "#111118",
        border: "1px solid #1e1e2e",
        animationDelay: `${delay}s`,
      }}
    >
      {/* Accent top bar */}
      <div
        className="absolute top-0 inset-x-0 h-[2px]"
        style={{ background: accent }}
      />

      {/* Subtle glow in top corner */}
      <div
        className="absolute -top-6 -right-6 w-20 h-20 rounded-full pointer-events-none"
        style={{ background: glow, filter: "blur(20px)" }}
      />

      <p
        className="mb-3 mt-0.5"
        style={{
          fontSize: "11px",
          fontWeight: 500,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          color: "#6b7280",
        }}
      >
        {label}
      </p>

      <p
        className="num leading-none mb-2"
        style={{
          fontSize: "2rem",
          fontWeight: 700,
          letterSpacing: "-0.03em",
          color: "#f8f8ff",
        }}
      >
        {displayValue}
      </p>

      <p style={{ fontSize: "11px", color: "#3d3d58", lineHeight: 1.4 }}>
        {sub}
      </p>
    </div>
  );
}

export function DashboardStats({ band, essays, words, streak }: Props) {
  const cards = stats({ band, essays, words, streak });

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map((card, i) => (
        <StatCard key={card.label} {...card} delay={i * 0.05} />
      ))}
    </div>
  );
}
