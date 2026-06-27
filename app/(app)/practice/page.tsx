import Link from "next/link"
import {
  PenLine,
  BarChart3,
  BookOpen,
  SpellCheck,
  Link2,
  Timer,
  Flame,
  ArrowRight,
  CheckCircle2,
} from "lucide-react"
import { Card, PageIntro, SectionTitle, Badge } from "@/components/app/primitives"

const exercises = [
  { title: "Task 2 Essay", desc: "Full opinion or discussion essay under timed conditions.", icon: PenLine, time: "40 min", level: "All levels", color: "#4f46e5" },
  { title: "Task 1 Report", desc: "Describe a chart, graph, map, or process.", icon: BarChart3, time: "20 min", level: "All levels", color: "#22c55e" },
  { title: "Vocabulary Drill", desc: "Master 10 topic-specific band-8 words.", icon: BookOpen, time: "10 min", level: "Beginner", color: "#38bdf8" },
  { title: "Grammar Fix", desc: "Correct 15 sentences with common IELTS errors.", icon: SpellCheck, time: "12 min", level: "Intermediate", color: "#f59e0b" },
  { title: "Linker Practice", desc: "Use cohesive devices naturally in context.", icon: Link2, time: "8 min", level: "Intermediate", color: "#a78bfa" },
  { title: "Speed Paraphrase", desc: "Rewrite prompts quickly with synonyms.", icon: Timer, time: "6 min", level: "Advanced", color: "#f472b6" },
]

const week = [
  { d: "M", done: true },
  { d: "T", done: true },
  { d: "W", done: true },
  { d: "T", done: true },
  { d: "F", done: false, today: true },
  { d: "S", done: false },
  { d: "S", done: false },
]

export default function PracticePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-8">
      <PageIntro
        title="Daily Practice"
        description="Pick an exercise type. Short, focused drills that build the skills examiners reward."
      />

      {/* Streak banner */}
      <Card className="mb-8 flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg" style={{ backgroundColor: "#f59e0b1a", color: "#f59e0b" }}>
            <Flame className="size-5" strokeWidth={1.75} />
          </div>
          <div>
            <p className="text-[14px] font-medium text-foreground">16-day streak</p>
            <p className="text-[12px] text-muted-foreground">Complete one drill today to keep it alive.</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {week.map((day, i) => (
            <div key={i} className="flex flex-col items-center gap-1.5">
              <div
                className={
                  "flex size-8 items-center justify-center rounded-lg border text-[12px] font-medium " +
                  (day.done
                    ? "border-primary/40 bg-primary/15 text-primary"
                    : day.today
                      ? "border-dashed border-primary/50 text-primary"
                      : "border-border bg-secondary text-muted-foreground")
                }
              >
                {day.done ? <CheckCircle2 className="size-4" strokeWidth={2} /> : day.d}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <SectionTitle>Choose an exercise</SectionTitle>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {exercises.map((ex) => (
          <Card key={ex.title} className="group flex flex-col p-5 transition-colors hover:border-[#333] hover:bg-secondary/40">
            <div className="flex size-10 items-center justify-center rounded-lg" style={{ backgroundColor: `${ex.color}1a`, color: ex.color }}>
              <ex.icon className="size-5" strokeWidth={1.75} />
            </div>
            <p className="mt-4 text-[15px] font-medium text-foreground">{ex.title}</p>
            <p className="mt-1 flex-1 text-[12px] leading-relaxed text-muted-foreground">{ex.desc}</p>
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge>{ex.time}</Badge>
                <Badge>{ex.level}</Badge>
              </div>
              <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" strokeWidth={1.75} />
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-6">
        <Link
          href="/questions"
          className="flex items-center justify-center gap-2 rounded-lg border border-border bg-card py-3 text-[13px] font-medium text-foreground transition-colors hover:bg-secondary"
        >
          Or generate a custom question
          <ArrowRight className="size-4" strokeWidth={1.75} />
        </Link>
      </div>
    </div>
  )
}
