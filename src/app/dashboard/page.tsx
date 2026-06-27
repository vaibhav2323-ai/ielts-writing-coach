import { currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { supabase } from "@/lib/supabase";
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

function getGreeting() {
  const hour = new Date().getUTCHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

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

  const stats = [
    {
      label: "Band Score",
      value: progressData.current_band != null ? progressData.current_band.toFixed(1) : "—",
    },
    {
      label: "Essays Done",
      value: String(progressData.essays_completed),
    },
    {
      label: "Words Learned",
      value: String(progressData.words_learned),
    },
    {
      label: "Day Streak",
      value: String(progressData.streak_days),
    },
  ];

  return (
    <div className="p-8 md:p-10 max-w-4xl space-y-12">

      {/* Greeting */}
      <div>
        <h1
          className="text-3xl font-bold text-white mb-2"
          style={{ letterSpacing: "-0.03em" }}
        >
          {getGreeting()}{firstName ? `, ${firstName}` : ""}
        </h1>
        <p style={{ fontSize: "14px", color: "#888", lineHeight: 1.6 }}>
          {progressData.current_band
            ? `You're ${(9 - progressData.current_band).toFixed(1)} band away from your target. Here's where things stand today.`
            : "Here's your dashboard. Start practising to track your progress."}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-[8px] p-5"
            style={{
              background: "#111111",
              border: "1px solid #222222",
              borderTop: "2px solid #4F46E5",
            }}
          >
            <p
              className="text-3xl font-bold text-white tabular"
              style={{ letterSpacing: "-0.03em", lineHeight: 1 }}
            >
              {stat.value}
            </p>
            <p className="mt-2 text-xs" style={{ color: "#888" }}>
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* Quick start */}
      <div>
        <p
          className="mb-4"
          style={{
            fontSize: "10px",
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "#555",
          }}
        >
          Quick Start
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {quickStart.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group flex flex-col gap-4 rounded-[8px] p-5 transition-colors hover:bg-[#1a1a1a]"
              style={{ background: "#111111", border: "1px solid #222222" }}
            >
              <div className="flex items-start justify-between">
                <div
                  className="w-9 h-9 rounded-[6px] flex items-center justify-center"
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
                <p
                  className="text-sm font-semibold text-white mb-1"
                  style={{ letterSpacing: "-0.01em" }}
                >
                  {item.title}
                </p>
                <p style={{ fontSize: "12px", color: "#888", lineHeight: 1.6 }}>
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
