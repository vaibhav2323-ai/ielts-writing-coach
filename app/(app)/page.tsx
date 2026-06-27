"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  GraduationCap,
  FileText,
  BookOpen,
  Flame,
  ArrowUpRight,
  ClipboardCheck,
  MessageSquare,
  Lightbulb,
  Dumbbell,
  ArrowRight,
  TrendingUp,
} from "lucide-react"
import { useUser } from "@clerk/nextjs"
import { Card, PageIntro, SectionTitle, Badge } from "@/components/app/primitives"

type Profile = { essays_completed: number; words_learned: number; streak_days: number; current_band: number | null }

const statColors = {
  "Current Band": { icon: GraduationCap, color: "#4f46e5" },
  "Essays Completed": { icon: FileText, color: "#22c55e" },
  "Words Learned": { icon: BookOpen, color: "#38bdf8" },
  "Day Streak": { icon: Flame, color: "#f59e0b" },
} as const

const quickActions = [
  {
    title: "Evaluate an essay",
    desc: "Get an instant band score with detailed criterion feedback.",
    href: "/evaluator",
    icon: ClipboardCheck,
  },
  {
    title: "Ask the AI coach",
    desc: "Brainstorm ideas, fix grammar, or refine an argument.",
    href: "/chat",
    icon: MessageSquare,
  },
  {
    title: "Generate a question",
    desc: "Practice with fresh Task 1 and Task 2 prompts.",
    href: "/questions",
    icon: Lightbulb,
  },
  {
    title: "Daily practice",
    desc: "A focused 15-minute drill picked for your level.",
    href: "/practice",
    icon: Dumbbell,
  },
]

const activity = [
  {
    title: "Task 2 — Technology & Society",
    meta: "Evaluated · 1,420 words",
    band: "7.5",
    tone: "green" as const,
    time: "2h ago",
  },
  {
    title: "Vocabulary set — Environment",
    meta: "18 of 20 words mastered",
    band: "90%",
    tone: "indigo" as const,
    time: "Yesterday",
  },
  {
    title: "Task 1 — Line Graph Description",
    meta: "Evaluated · 198 words",
    band: "6.5",
    tone: "amber" as const,
    time: "Yesterday",
  },
  {
    title: "Grammar — Complex Sentences",
    meta: "Lesson completed",
    band: "Done",
    tone: "neutral" as const,
    time: "2d ago",
  },
]

const bandCriteria = [
  { label: "Task Response", value: 7.5 },
  { label: "Coherence & Cohesion", value: 7.0 },
  { label: "Lexical Resource", value: 6.5 },
  { label: "Grammatical Range", value: 7.0 },
]

export default function DashboardPage() {
  const { user } = useUser()
  const [profile, setProfile] = useState<Profile | null>(null)

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then(setProfile)
      .catch(() => {})
  }, [])

  const firstName = user?.firstName ?? user?.fullName?.split(" ")[0] ?? "there"

  const stats = [
    {
      label: "Current Band",
      value: profile?.current_band != null ? profile.current_band.toFixed(1) : "—",
      delta: "",
      sub: "overall band score",
      ...statColors["Current Band"],
    },
    {
      label: "Essays Completed",
      value: profile?.essays_completed != null ? String(profile.essays_completed) : "—",
      delta: "",
      sub: "total evaluated",
      ...statColors["Essays Completed"],
    },
    {
      label: "Words Learned",
      value: profile?.words_learned != null ? String(profile.words_learned) : "—",
      delta: "",
      sub: "vocabulary built",
      ...statColors["Words Learned"],
    },
    {
      label: "Day Streak",
      value: profile?.streak_days != null ? String(profile.streak_days) : "—",
      delta: "",
      sub: "keep it up",
      ...statColors["Day Streak"],
    },
  ]

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-8">
      <PageIntro
        title={`Welcome back, ${firstName}`}
        description="Here's where things stand today."
      />

      {/* Stats */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="p-4">
            <div className="flex items-center justify-between">
              <div
                className="flex size-9 items-center justify-center rounded-lg"
                style={{ backgroundColor: `${stat.color}1a`, color: stat.color }}
              >
                <stat.icon className="size-[18px]" strokeWidth={1.75} />
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
                <TrendingUp className="size-3" strokeWidth={2} style={{ color: stat.color }} />
                {stat.delta}
              </span>
            </div>
            <p className="mt-4 text-[28px] font-semibold leading-none tracking-tight text-foreground tabular">
              {stat.value}
            </p>
            <p className="mt-2 text-[13px] font-medium text-foreground">{stat.label}</p>
            <p className="text-[12px] text-muted-foreground">{stat.sub}</p>
          </Card>
        ))}
      </div>

      {/* Quick actions */}
      <div className="mt-8">
        <SectionTitle>Quick start</SectionTitle>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {quickActions.map((action) => (
            <Link key={action.title} href={action.href}>
              <Card className="group h-full p-4 transition-colors hover:border-[#333] hover:bg-secondary/40">
                <div className="flex items-center justify-between">
                  <div className="flex size-9 items-center justify-center rounded-lg border border-border bg-secondary text-primary">
                    <action.icon className="size-[18px]" strokeWidth={1.75} />
                  </div>
                  <ArrowUpRight className="size-4 text-muted-foreground transition-colors group-hover:text-foreground" strokeWidth={1.75} />
                </div>
                <p className="mt-4 text-[14px] font-medium text-foreground">{action.title}</p>
                <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">{action.desc}</p>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Activity + band breakdown */}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SectionTitle
            action={
              <Link href="/evaluator" className="text-[12px] font-medium text-primary hover:underline">
                View all
              </Link>
            }
          >
            Recent activity
          </SectionTitle>
          <Card className="divide-y divide-border">
            {activity.map((item) => (
              <div key={item.title} className="flex items-center gap-4 px-4 py-3.5 transition-colors hover:bg-secondary/30">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium text-foreground">{item.title}</p>
                  <p className="truncate text-[12px] text-muted-foreground">{item.meta}</p>
                </div>
                <Badge tone={item.tone}>{item.band}</Badge>
                <span className="w-16 shrink-0 text-right text-[11px] text-muted-foreground">{item.time}</span>
              </div>
            ))}
          </Card>
        </div>

        <div>
          <SectionTitle>Band breakdown</SectionTitle>
          <Card className="p-5">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-[12px] text-muted-foreground">Predicted overall</p>
                <p className="text-[34px] font-semibold leading-none tracking-tight text-foreground tabular">7.0</p>
              </div>
              <Badge tone="indigo">Target 8.0</Badge>
            </div>
            <div className="mt-6 space-y-4">
              {bandCriteria.map((c) => (
                <div key={c.label}>
                  <div className="mb-1.5 flex items-center justify-between text-[12px]">
                    <span className="text-muted-foreground">{c.label}</span>
                    <span className="font-medium text-foreground tabular">{c.value.toFixed(1)}</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${(c.value / 9) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <Link
              href="/practice"
              className="mt-6 flex items-center justify-center gap-1.5 rounded-lg border border-border bg-secondary py-2 text-[13px] font-medium text-foreground transition-colors hover:bg-accent"
            >
              Improve weakest area
              <ArrowRight className="size-3.5" strokeWidth={1.75} />
            </Link>
          </Card>
        </div>
      </div>
    </div>
  )
}
