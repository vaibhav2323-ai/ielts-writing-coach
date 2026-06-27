import { currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { auth } from "@clerk/nextjs/server";
import { supabase } from "@/lib/supabase";

const actions = [
  {
    label: "Daily Practice",
    href: "/dashboard/practice",
    icon: "✏️",
    desc: "Grammar, vocabulary & essay tasks",
    color: "#6366f1",
    glow: "rgba(99,102,241,0.12)",
  },
  {
    label: "AI Chat",
    href: "/dashboard/chat",
    icon: "🤖",
    desc: "Get writing guidance from AI",
    color: "#8b5cf6",
    glow: "rgba(139,92,246,0.12)",
  },
  {
    label: "Essay Evaluator",
    href: "/dashboard/evaluator",
    icon: "📝",
    desc: "Score your writing instantly",
    color: "#10b981",
    glow: "rgba(16,185,129,0.12)",
  },
  {
    label: "Vocabulary",
    href: "/dashboard/vocabulary",
    icon: "📖",
    desc: "Expand your academic word list",
    color: "#f59e0b",
    glow: "rgba(245,158,11,0.12)",
  },
];

export default async function DashboardPage() {
  const { userId } = await auth();
  const user = await currentUser();
  const firstName = user?.firstName ?? null;

  // Fetch real progress data
  let progressData = {
    current_band: null as number | null,
    essays_completed: 0,
    words_learned: 0,
    streak_days: 0,
  };

  if (userId) {
    const { data: userRow } = await supabase
      .from("users")
      .select("id")
      .eq("clerk_id", userId)
      .single();

    if (userRow) {
      const { data: progress } = await supabase
        .from("progress")
        .select("current_band, essays_completed, words_learned, streak_days")
        .eq("user_id", userRow.id)
        .single();

      if (progress) progressData = progress;
    }
  }

  const greeting = firstName
    ? `Good to see you, ${firstName}.`
    : "Welcome back.";

  return (
    <div className="p-6 md:p-8 max-w-5xl space-y-10">

      {/* Greeting */}
      <div className="animate-fade-up">
        <h1
          className="text-2xl font-bold"
          style={{ color: "#f8f8ff", letterSpacing: "-0.02em" }}
        >
          {greeting}
        </h1>
        <p className="text-sm mt-1" style={{ color: "#6b7280" }}>
          Here&apos;s a snapshot of your progress.
        </p>
      </div>

      {/* Stat cards */}
      <section className="animate-fade-up" style={{ animationDelay: "0.05s" }}>
        <p className="label mb-3">Overview</p>
        <DashboardStats
          band={progressData.current_band}
          essays={progressData.essays_completed}
          words={progressData.words_learned}
          streak={progressData.streak_days}
        />
      </section>

      {/* Quick actions */}
      <section className="animate-fade-up" style={{ animationDelay: "0.1s" }}>
        <p className="label mb-3">Quick start</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {actions.map((a) => (
            <Link
              key={a.href}
              href={a.href}
              className="group flex flex-col gap-3 rounded-xl p-4 transition-all duration-200 card-interactive"
              style={{
                background: "#111118",
                border: "1px solid #1e1e2e",
              }}
            >
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center text-lg transition-transform duration-200 group-hover:scale-110"
                style={{ background: a.glow }}
              >
                {a.icon}
              </div>
              <div>
                <p
                  className="text-sm font-semibold leading-tight mb-0.5"
                  style={{ color: "#f0f0fa", letterSpacing: "-0.01em" }}
                >
                  {a.label}
                </p>
                <p className="text-[11px] leading-snug" style={{ color: "#6b7280" }}>
                  {a.desc}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Recent activity empty state */}
      <section className="animate-fade-up" style={{ animationDelay: "0.15s" }}>
        <p className="label mb-3">Recent activity</p>
        <div
          className="rounded-xl p-10 flex flex-col items-center text-center gap-3"
          style={{ background: "#111118", border: "1px solid #1e1e2e" }}
        >
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
            style={{ background: "rgba(99,102,241,0.1)" }}
          >
            📓
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: "#f0f0fa" }}>
              No activity yet
            </p>
            <p className="text-xs mt-1 max-w-xs" style={{ color: "#6b7280" }}>
              Complete your first practice task to see your writing history here.
            </p>
          </div>
          <Button asChild size="sm" className="mt-1">
            <Link href="/dashboard/practice">Start practising</Link>
          </Button>
        </div>
      </section>

    </div>
  );
}
