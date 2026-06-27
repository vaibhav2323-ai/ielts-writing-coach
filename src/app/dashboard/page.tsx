import { currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { supabase } from "@/lib/supabase";
import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { ArrowUpRight, FileCheck2, MessageSquare, Sparkles, CalendarCheck } from "lucide-react";

const quickStart = [
  {
    href: "/dashboard/evaluator",
    icon: <FileCheck2 className="h-5 w-5" />,
    iconColor: "#4F46E5",
    title: "Evaluate an essay",
    desc: "Get an instant band score with detailed criterion feedback.",
  },
  {
    href: "/dashboard/chat",
    icon: <MessageSquare className="h-5 w-5" />,
    iconColor: "#10b981",
    title: "Ask the AI coach",
    desc: "Brainstorm ideas, fix grammar, or refine an argument.",
  },
  {
    href: "/dashboard/generator",
    icon: <Sparkles className="h-5 w-5" />,
    iconColor: "#f59e0b",
    title: "Generate a question",
    desc: "Practice with fresh Task 1 and Task 2 prompts.",
  },
  {
    href: "/dashboard/practice",
    icon: <CalendarCheck className="h-5 w-5" />,
    iconColor: "#8b5cf6",
    title: "Daily practice",
    desc: "A focused 15-minute drill picked for your level.",
  },
];

export default async function DashboardPage() {
  const { userId } = await auth();
  const user = await currentUser();
  const firstName = user?.firstName ?? null;

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

  return (
    <div className="p-6 md:p-8 max-w-3xl space-y-10">

      {/* Greeting */}
      <div>
        <h1
          className="text-2xl font-bold text-white mb-1"
          style={{ letterSpacing: "-0.025em" }}
        >
          {firstName ? `Welcome back, ${firstName}` : "Welcome back"}
        </h1>
        <p style={{ fontSize: "14px", color: "#888" }}>
          {progressData.current_band
            ? `You're ${(9 - progressData.current_band).toFixed(1)} band away from your target. Here's where things stand today.`
            : "Here's your dashboard. Start practising to track your progress."}
        </p>
      </div>

      {/* Stats */}
      <DashboardStats
        band={progressData.current_band}
        essays={progressData.essays_completed}
        words={progressData.words_learned}
        streak={progressData.streak_days}
      />

      {/* Quick start */}
      <div>
        <p
          className="mb-4"
          style={{
            fontSize: "11px",
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "#555",
          }}
        >
          Quick Start
        </p>
        <div className="grid grid-cols-2 gap-3">
          {quickStart.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group relative flex flex-col gap-3 rounded-lg p-5 transition-colors hover:bg-[#161616]"
              style={{ background: "#111111", border: "1px solid #222222" }}
            >
              <div className="flex items-start justify-between">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center"
                  style={{ background: "#1a1a1a", color: item.iconColor }}
                >
                  {item.icon}
                </div>
                <ArrowUpRight
                  className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ color: "#555" }}
                />
              </div>
              <div>
                <p className="text-sm font-semibold text-white mb-0.5" style={{ letterSpacing: "-0.01em" }}>
                  {item.title}
                </p>
                <p style={{ fontSize: "12px", color: "#888", lineHeight: 1.5 }}>
                  {item.desc}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>

    </div>
  );
}
