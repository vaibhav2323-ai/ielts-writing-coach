"use client"

import { useEffect, useState } from "react"
import { Mail, Calendar, GraduationCap, Bell, Globe, CreditCard, Shield, ChevronRight } from "lucide-react"
import { useUser, useClerk } from "@clerk/nextjs"
import { Card, PageIntro, Button, Badge } from "@/components/app/primitives"
import { cn } from "@/lib/utils"

type Profile = { essays_completed: number; words_learned: number; streak_days: number; current_band: number | null }

function Toggle({ defaultOn = false }: { defaultOn?: boolean }) {
  const [on, setOn] = useState(defaultOn)
  return (
    <button
      onClick={() => setOn((v) => !v)}
      className={cn(
        "relative h-5 w-9 shrink-0 rounded-full border transition-colors",
        on ? "border-primary bg-primary" : "border-border bg-secondary",
      )}
      role="switch"
      aria-checked={on}
    >
      <span
        className={cn(
          "absolute top-0.5 size-3.5 rounded-full bg-white transition-transform",
          on ? "translate-x-4" : "translate-x-0.5",
        )}
      />
    </button>
  )
}

const settings = [
  { icon: Bell, title: "Practice reminders", desc: "Daily nudge to keep your streak", toggle: true, on: true },
  { icon: Mail, title: "Email summaries", desc: "Weekly progress report", toggle: true, on: true },
  { icon: Globe, title: "Public profile", desc: "Show your band on the leaderboard", toggle: true, on: false },
]

const account = [
  { icon: CreditCard, title: "Billing & plan", desc: "Lexia Pro" },
  { icon: Shield, title: "Security", desc: "Password and two-factor auth" },
  { icon: GraduationCap, title: "Study goal", desc: "Band 8.0" },
]

export default function ProfilePage() {
  const { user } = useUser()
  const { signOut } = useClerk()
  const [profileData, setProfileData] = useState<Profile | null>(null)

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then(setProfileData)
      .catch(() => {})
  }, [])

  const fullName = user?.fullName ?? "My Account"
  const email = user?.primaryEmailAddress?.emailAddress ?? ""
  const initials = fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 md:px-6 md:py-8">
      <PageIntro title="Profile" description="Manage your account, study goals, and preferences." />

      {/* Header card */}
      <Card className="p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="flex size-16 items-center justify-center rounded-lg bg-primary text-xl font-semibold text-primary-foreground">
            {initials}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-[18px] font-semibold tracking-tight text-foreground">{fullName}</h2>
              <Badge tone="indigo">Pro</Badge>
            </div>
            <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-muted-foreground">
              {email && (
                <span className="inline-flex items-center gap-1.5">
                  <Mail className="size-3.5" strokeWidth={1.75} /> {email}
                </span>
              )}
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="size-3.5" strokeWidth={1.75} />
                Joined {user?.createdAt ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "—"}
              </span>
            </div>
          </div>
          <Button variant="secondary" onClick={() => user?.update({})}>
            Edit profile
          </Button>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 border-t border-border pt-5 sm:grid-cols-4">
          {[
            { label: "Current Band", value: profileData?.current_band != null ? profileData.current_band.toFixed(1) : "—" },
            { label: "Target Band", value: "8.0" },
            { label: "Essays", value: profileData?.essays_completed != null ? String(profileData.essays_completed) : "—" },
            { label: "Day Streak", value: profileData?.streak_days != null ? String(profileData.streak_days) : "—" },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-[24px] font-semibold leading-none tracking-tight text-foreground tabular">
                {s.value}
              </p>
              <p className="mt-1.5 text-[12px] text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </Card>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Preferences */}
        <Card className="overflow-hidden">
          <p className="border-b border-border px-5 py-3.5 text-[13px] font-semibold text-foreground">
            Preferences
          </p>
          <ul className="divide-y divide-border">
            {settings.map((s) => (
              <li key={s.title} className="flex items-center gap-3 px-5 py-3.5">
                <div className="flex size-8 items-center justify-center rounded-lg border border-border bg-secondary text-muted-foreground">
                  <s.icon className="size-4" strokeWidth={1.75} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-medium text-foreground">{s.title}</p>
                  <p className="text-[12px] text-muted-foreground">{s.desc}</p>
                </div>
                <Toggle defaultOn={s.on} />
              </li>
            ))}
          </ul>
        </Card>

        {/* Account */}
        <Card className="overflow-hidden">
          <p className="border-b border-border px-5 py-3.5 text-[13px] font-semibold text-foreground">
            Account
          </p>
          <ul className="divide-y divide-border">
            {account.map((a) => (
              <li key={a.title}>
                <button className="flex w-full items-center gap-3 px-5 py-3.5 text-left transition-colors hover:bg-secondary/40">
                  <div className="flex size-8 items-center justify-center rounded-lg border border-border bg-secondary text-muted-foreground">
                    <a.icon className="size-4" strokeWidth={1.75} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-medium text-foreground">{a.title}</p>
                    <p className="text-[12px] text-muted-foreground">{a.desc}</p>
                  </div>
                  <ChevronRight className="size-4 text-muted-foreground" strokeWidth={1.75} />
                </button>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="mt-6 flex justify-end">
        <Button
          variant="ghost"
          className="text-[#f87171] hover:bg-[#ef4444]/10 hover:text-[#f87171]"
          onClick={() => signOut({ redirectUrl: "/sign-in" })}
        >
          Sign out
        </Button>
      </div>
    </div>
  )
}
