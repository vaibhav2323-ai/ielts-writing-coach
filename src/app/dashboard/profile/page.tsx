"use client";

import { useState, useEffect, useRef } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import {
  Flame, BookOpen, TrendingUp, FileText,
  Eye, EyeOff, Check, LogOut, Moon, Sun, Key, Calendar, ChevronRight,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Progress = {
  essays_completed: number;
  words_learned: number;
  streak_days: number;
  current_band: number | null;
};

// ─── Avatar ───────────────────────────────────────────────────────────────────

function Avatar({ src, name }: { src?: string | null; name?: string | null }) {
  const initials = name ? name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase() : "?";
  if (src) {
    return <img src={src} alt={name ?? "Avatar"} className="w-20 h-20 rounded-full object-cover" style={{ outline: "2px solid #2a2a2a" }} />;
  }
  return (
    <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: "rgba(79,70,229,0.12)", border: "2px solid rgba(79,70,229,0.25)" }}>
      <span className="text-2xl font-bold" style={{ color: "#818cf8" }}>{initials}</span>
    </div>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────

type StatCardProps = {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  iconBg: string;
};

function StatCard({ icon, label, value, iconBg }: StatCardProps) {
  return (
    <div className="flex flex-col gap-2 rounded-xl px-4 py-4" style={{ border: "1px solid #222222", background: "#111111" }}>
      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: iconBg }}>{icon}</div>
      <p className="text-xl font-bold text-white">{value}</p>
      <p className="text-[11px] leading-tight" style={{ color: "#555" }}>{label}</p>
    </div>
  );
}

// ─── Toggle ───────────────────────────────────────────────────────────────────

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button role="switch" aria-checked={on} onClick={onToggle}
      className="relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none"
      style={{ background: on ? "#4F46E5" : "#2a2a2a" }}>
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${on ? "translate-x-5" : "translate-x-0"}`} />
    </button>
  );
}

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <p className="text-[10px] font-bold uppercase tracking-widest px-1 mb-3" style={{ color: "#444" }}>{title}</p>
      <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid #222222", background: "#111111" }}>
        {children}
      </div>
    </div>
  );
}

function Row({ children, noBorder }: { children: React.ReactNode; noBorder?: boolean }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5" style={noBorder ? {} : { borderBottom: "1px solid #1a1a1a" }}>
      {children}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();

  const [progress, setProgress] = useState<Progress | null>(null);
  const [progressLoading, setProgressLoading] = useState(true);

  const [darkMode, setDarkMode] = useState(true);
  const [groqKey, setGroqKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const storedTheme = localStorage.getItem("theme");
    setDarkMode(storedTheme !== "light");
    setGroqKey(localStorage.getItem("groq_api_key") ?? "");
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/profile");
        if (res.ok) setProgress(await res.json());
      } catch { /* non-fatal */ }
      finally { setProgressLoading(false); }
    })();
  }, []);

  function handleSaveSettings() {
    localStorage.setItem("theme", darkMode ? "dark" : "light");
    if (groqKey.trim()) localStorage.setItem("groq_api_key", groqKey.trim());
    else localStorage.removeItem("groq_api_key");
    setSaved(true);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => setSaved(false), 2000);
  }

  async function handleSignOut() {
    await signOut();
    router.push("/");
  }

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : null;

  const bandDisplay = progress?.current_band ? progress.current_band.toFixed(1) : "—";

  return (
    <div className="max-w-lg mx-auto px-4 py-8 pb-28 space-y-8">

      {/* Identity card */}
      <div className="rounded-2xl px-5 py-6" style={{ border: "1px solid #222222", background: "#111111" }}>
        {isLoaded ? (
          <div className="flex items-center gap-4">
            <Avatar src={user?.imageUrl} name={user?.fullName} />
            <div className="min-w-0">
              <p className="text-base font-bold text-white truncate">{user?.fullName ?? "—"}</p>
              <p className="text-sm truncate mt-0.5" style={{ color: "#555" }}>{user?.primaryEmailAddress?.emailAddress ?? ""}</p>
              {memberSince && (
                <div className="flex items-center gap-1.5 mt-2">
                  <Calendar className="h-3 w-3" style={{ color: "#444" }} />
                  <span className="text-[11px]" style={{ color: "#444" }}>Member since {memberSince}</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full animate-pulse" style={{ background: "#1a1a1a" }} />
            <div className="space-y-2">
              <div className="h-4 w-36 rounded animate-pulse" style={{ background: "#1a1a1a" }} />
              <div className="h-3 w-48 rounded animate-pulse" style={{ background: "#1a1a1a" }} />
            </div>
          </div>
        )}
      </div>

      {/* Stats */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest px-1 mb-3" style={{ color: "#444" }}>Your Progress</p>
        {progressLoading ? (
          <div className="grid grid-cols-2 gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 rounded-xl animate-pulse" style={{ background: "#111111", border: "1px solid #1a1a1a" }} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <StatCard icon={<TrendingUp className="h-4 w-4" style={{ color: "#60a5fa" }} />} label="Current Band" value={bandDisplay} iconBg="rgba(59,130,246,0.1)" />
            <StatCard icon={<FileText className="h-4 w-4" style={{ color: "#a78bfa" }} />} label="Essays Completed" value={progress?.essays_completed ?? 0} iconBg="rgba(139,92,246,0.1)" />
            <StatCard icon={<Flame className="h-4 w-4" style={{ color: "#fb923c" }} />} label="Day Streak" value={progress?.streak_days ?? 0} iconBg="rgba(249,115,22,0.1)" />
            <StatCard icon={<BookOpen className="h-4 w-4" style={{ color: "#34d399" }} />} label="Words Learned" value={progress?.words_learned ?? 0} iconBg="rgba(52,211,153,0.1)" />
          </div>
        )}
      </div>

      {/* Settings */}
      <Section title="Settings">
        {/* Dark mode */}
        <Row>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: darkMode ? "rgba(99,102,241,0.1)" : "rgba(245,158,11,0.1)" }}>
            {darkMode ? <Moon className="h-4 w-4" style={{ color: "#818cf8" }} /> : <Sun className="h-4 w-4" style={{ color: "#fbbf24" }} />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-white">Dark Mode</p>
            <p className="text-[11px]" style={{ color: "#444" }}>{darkMode ? "App is in dark mode" : "App is in light mode"}</p>
          </div>
          <Toggle on={darkMode} onToggle={() => setDarkMode((d) => !d)} />
        </Row>

        {/* Groq API Key */}
        <div className="px-4 py-3.5 space-y-2.5" style={{ borderBottom: "1px solid #1a1a1a" }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#1a1a1a" }}>
              <Key className="h-4 w-4" style={{ color: "#555" }} />
            </div>
            <div className="flex-1">
              <p className="text-sm text-white">Groq API Key</p>
              <p className="text-[11px]" style={{ color: "#444" }}>Optional — overrides the default key</p>
            </div>
          </div>
          <div className="relative">
            <input
              type={showKey ? "text" : "password"}
              value={groqKey}
              onChange={(e) => setGroqKey(e.target.value)}
              placeholder="gsk_…"
              autoComplete="off"
              spellCheck={false}
              className="w-full rounded-xl px-3 py-2 text-sm text-white placeholder:text-[#333] focus:outline-none focus:ring-1 focus:ring-[#4F46E5] pr-9"
              style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", colorScheme: "dark" }}
            />
            <button type="button" onClick={() => setShowKey((s) => !s)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 transition-colors"
              style={{ color: "#555" }}>
              {showKey ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>

        {/* Save button */}
        <div className="px-4 py-3" style={{ background: "rgba(0,0,0,0.2)" }}>
          <button onClick={handleSaveSettings}
            className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2"
            style={saved
              ? { background: "rgba(52,211,153,0.12)", color: "#34d399", border: "1px solid rgba(52,211,153,0.25)" }
              : { background: "#4F46E5", color: "white" }}>
            {saved ? <><Check className="h-4 w-4" />Settings Saved</> : "Save Settings"}
          </button>
        </div>
      </Section>

      {/* Account */}
      <Section title="Account">
        <button onClick={handleSignOut}
          className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors"
          onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(239,68,68,0.05)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          style={{ background: "transparent" }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(239,68,68,0.1)" }}>
            <LogOut className="h-4 w-4 text-red-400" />
          </div>
          <span className="flex-1 text-sm text-red-400 font-medium">Sign Out</span>
          <ChevronRight className="h-4 w-4" style={{ color: "#444" }} />
        </button>
      </Section>

    </div>
  );
}
