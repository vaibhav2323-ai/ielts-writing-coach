"use client";

import { useState, useEffect, useRef } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import {
  Flame,
  BookOpen,
  TrendingUp,
  FileText,
  Eye,
  EyeOff,
  Check,
  LogOut,
  Moon,
  Sun,
  Key,
  Calendar,
  ChevronRight,
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
  const initials = name
    ? name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  if (src) {
    return (
      <img
        src={src}
        alt={name ?? "Avatar"}
        className="w-20 h-20 rounded-full object-cover ring-2 ring-zinc-700/60"
      />
    );
  }

  return (
    <div className="w-20 h-20 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center ring-2 ring-zinc-700/60">
      <span className="text-2xl font-bold text-blue-300">{initials}</span>
    </div>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-zinc-800/60 bg-zinc-900/60 px-4 py-4">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>
        {icon}
      </div>
      <p className="text-xl font-bold text-zinc-100">{value}</p>
      <p className="text-[11px] text-zinc-500 leading-tight">{label}</p>
    </div>
  );
}

// ─── Toggle ───────────────────────────────────────────────────────────────────

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      role="switch"
      aria-checked={on}
      onClick={onToggle}
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
        on ? "bg-blue-600" : "bg-zinc-700"
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${
          on ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest px-1 mb-3">
        {title}
      </p>
      <div className="rounded-2xl border border-zinc-800/60 bg-zinc-900/60 overflow-hidden divide-y divide-zinc-800/50">
        {children}
      </div>
    </div>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center gap-3 px-4 py-3.5">{children}</div>;
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();

  const [progress, setProgress] = useState<Progress | null>(null);
  const [progressLoading, setProgressLoading] = useState(true);

  // Settings state
  const [darkMode, setDarkMode] = useState(true);
  const [groqKey, setGroqKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load settings from localStorage
  useEffect(() => {
    const storedTheme = localStorage.getItem("theme");
    setDarkMode(storedTheme !== "light");

    const storedKey = localStorage.getItem("groq_api_key") ?? "";
    setGroqKey(storedKey);
  }, []);

  // Apply dark/light class on toggle
  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  // Fetch progress from Supabase via API
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
    if (groqKey.trim()) {
      localStorage.setItem("groq_api_key", groqKey.trim());
    } else {
      localStorage.removeItem("groq_api_key");
    }
    setSaved(true);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => setSaved(false), 2000);
  }

  async function handleSignOut() {
    await signOut();
    router.push("/");
  }

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : null;

  const bandDisplay = progress?.current_band
    ? progress.current_band.toFixed(1)
    : "—";

  return (
    <div className="max-w-lg mx-auto px-4 py-8 pb-28 space-y-8">

      {/* ── Identity card ── */}
      <div className="rounded-2xl border border-zinc-800/60 bg-zinc-900/60 px-5 py-6">
        {isLoaded ? (
          <div className="flex items-center gap-4">
            <Avatar src={user?.imageUrl} name={user?.fullName} />
            <div className="min-w-0">
              <p className="text-base font-bold text-zinc-100 truncate">
                {user?.fullName ?? "—"}
              </p>
              <p className="text-sm text-zinc-500 truncate mt-0.5">
                {user?.primaryEmailAddress?.emailAddress ?? ""}
              </p>
              {memberSince && (
                <div className="flex items-center gap-1.5 mt-2">
                  <Calendar className="h-3 w-3 text-zinc-600" />
                  <span className="text-[11px] text-zinc-600">
                    Member since {memberSince}
                  </span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-zinc-800 animate-pulse" />
            <div className="space-y-2">
              <div className="h-4 w-36 rounded bg-zinc-800 animate-pulse" />
              <div className="h-3 w-48 rounded bg-zinc-800 animate-pulse" />
            </div>
          </div>
        )}
      </div>

      {/* ── Stats grid ── */}
      <div>
        <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest px-1 mb-3">
          Your Progress
        </p>
        {progressLoading ? (
          <div className="grid grid-cols-2 gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 rounded-xl bg-zinc-900/60 border border-zinc-800/60 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <StatCard
              icon={<TrendingUp className="h-4 w-4 text-blue-400" />}
              label="Current Band"
              value={bandDisplay}
              color="bg-blue-500/10"
            />
            <StatCard
              icon={<FileText className="h-4 w-4 text-violet-400" />}
              label="Essays Completed"
              value={progress?.essays_completed ?? 0}
              color="bg-violet-500/10"
            />
            <StatCard
              icon={<Flame className="h-4 w-4 text-orange-400" />}
              label="Day Streak"
              value={progress?.streak_days ?? 0}
              color="bg-orange-500/10"
            />
            <StatCard
              icon={<BookOpen className="h-4 w-4 text-emerald-400" />}
              label="Words Learned"
              value={progress?.words_learned ?? 0}
              color="bg-emerald-500/10"
            />
          </div>
        )}
      </div>

      {/* ── Settings ── */}
      <Section title="Settings">
        {/* Dark mode */}
        <Row>
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${darkMode ? "bg-indigo-500/10" : "bg-amber-500/10"}`}>
            {darkMode
              ? <Moon className="h-4 w-4 text-indigo-400" />
              : <Sun className="h-4 w-4 text-amber-400" />
            }
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-zinc-200">Dark Mode</p>
            <p className="text-[11px] text-zinc-600">
              {darkMode ? "App is in dark mode" : "App is in light mode"}
            </p>
          </div>
          <Toggle on={darkMode} onToggle={() => setDarkMode((d) => !d)} />
        </Row>

        {/* Groq API key */}
        <div className="px-4 py-3.5 space-y-2.5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-zinc-800/80">
              <Key className="h-4 w-4 text-zinc-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-zinc-200">Groq API Key</p>
              <p className="text-[11px] text-zinc-600">Optional — overrides the default key</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type={showKey ? "text" : "password"}
                value={groqKey}
                onChange={(e) => setGroqKey(e.target.value)}
                placeholder="gsk_…"
                autoComplete="off"
                spellCheck={false}
                className="w-full rounded-xl bg-zinc-800/60 border border-zinc-700/50 px-3 py-2 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-700 pr-9"
              />
              <button
                type="button"
                onClick={() => setShowKey((s) => !s)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400 transition-colors"
              >
                {showKey ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Save button */}
        <div className="px-4 py-3 bg-zinc-900/30">
          <button
            onClick={handleSaveSettings}
            className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
              saved
                ? "bg-emerald-700/60 text-emerald-200 border border-emerald-700/40"
                : "bg-blue-600 hover:bg-blue-500 text-white"
            }`}
          >
            {saved ? (
              <>
                <Check className="h-4 w-4" />
                Settings Saved
              </>
            ) : (
              "Save Settings"
            )}
          </button>
        </div>
      </Section>

      {/* ── Account ── */}
      <Section title="Account">
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 px-4 py-3.5 text-left hover:bg-zinc-800/40 transition-colors group"
        >
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-red-500/10">
            <LogOut className="h-4 w-4 text-red-400" />
          </div>
          <span className="flex-1 text-sm text-red-400 font-medium">Sign Out</span>
          <ChevronRight className="h-4 w-4 text-zinc-700 group-hover:text-zinc-500 transition-colors" />
        </button>
      </Section>

    </div>
  );
}
