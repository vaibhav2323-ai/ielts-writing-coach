"use client"

import { useState } from "react"
import { Check, Circle, CheckCircle2, XCircle, ArrowRight } from "lucide-react"
import { Card, PageIntro, Badge } from "@/components/app/primitives"
import { cn } from "@/lib/utils"

type Topic = {
  id: string
  title: string
  level: string
  progress: number
  lesson: {
    summary: string
    points: string[]
    correct: string
    wrong: string
    tip: string
  }
}

const topics: Topic[] = [
  {
    id: "complex",
    title: "Complex Sentences",
    level: "Core",
    progress: 100,
    lesson: {
      summary:
        "Complex sentences combine an independent clause with one or more dependent clauses. Examiners reward a natural mix of simple, compound, and complex structures under Grammatical Range.",
      points: [
        "Use subordinating conjunctions: although, because, while, whereas.",
        "Place a comma after a dependent clause that starts the sentence.",
        "Avoid stringing too many clauses together — clarity beats length.",
      ],
      correct: "Although renewable energy is expensive initially, it reduces costs over time.",
      wrong: "Renewable energy is expensive initially it reduces costs over time.",
      tip: "Aim for at least one well-formed complex sentence in each body paragraph.",
    },
  },
  {
    id: "articles",
    title: "Articles (a / an / the)",
    level: "Core",
    progress: 60,
    lesson: {
      summary:
        "Articles signal whether a noun is specific or general. Misused articles are one of the most common band-limiting errors for non-native writers.",
      points: [
        "Use 'the' for specific or previously mentioned nouns.",
        "Use 'a/an' for non-specific singular countable nouns.",
        "Use no article for general plural and uncountable nouns.",
      ],
      correct: "The government should invest in education.",
      wrong: "Government should invest in the education.",
      tip: "Before abstract nouns used generally (e.g. 'education'), usually drop the article.",
    },
  },
  {
    id: "conditionals",
    title: "Conditionals",
    level: "Advanced",
    progress: 25,
    lesson: {
      summary:
        "Conditionals let you discuss hypothetical situations and consequences — useful for problem/solution and opinion essays.",
      points: [
        "First conditional: real future possibility (If we act, we will benefit).",
        "Second conditional: hypothetical present (If governments acted, they would benefit).",
        "Mixed conditionals show sophistication when used accurately.",
      ],
      correct: "If governments invested more, pollution would decline.",
      wrong: "If governments would invest more, pollution will decline.",
      tip: "Don't use 'would' in the 'if' clause of a second conditional.",
    },
  },
  {
    id: "passive",
    title: "Passive Voice",
    level: "Advanced",
    progress: 0,
    lesson: {
      summary:
        "The passive voice is especially valuable in Task 1 reports and when the action matters more than the actor.",
      points: [
        "Form: be + past participle (The data was collected).",
        "Useful for processes and objective description.",
        "Don't overuse it — active voice is clearer for arguments.",
      ],
      correct: "The samples were analysed over a six-month period.",
      wrong: "They analysed the samples over a six-month period in the report.",
      tip: "In Task 1 process diagrams, the passive often sounds the most natural.",
    },
  },
]

export default function GrammarPage() {
  const [active, setActive] = useState(topics[0])

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-8">
      <PageIntro
        title="Grammar"
        description="Targeted lessons on the structures that most affect your Grammatical Range score."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Topic list */}
        <Card className="h-fit overflow-hidden lg:col-span-1">
          <p className="border-b border-border px-4 py-3 text-[12px] font-semibold uppercase tracking-wide text-muted-foreground">
            Topics
          </p>
          <ul>
            {topics.map((t) => {
              const isActive = active.id === t.id
              const complete = t.progress === 100
              return (
                <li key={t.id}>
                  <button
                    onClick={() => setActive(t)}
                    className={cn(
                      "flex w-full items-center gap-3 border-b border-border px-4 py-3 text-left transition-colors last:border-b-0",
                      isActive ? "bg-secondary/60" : "hover:bg-secondary/30",
                    )}
                  >
                    {complete ? (
                      <CheckCircle2 className="size-4 shrink-0 text-[#4ade80]" strokeWidth={1.75} />
                    ) : (
                      <Circle className={cn("size-4 shrink-0", isActive ? "text-primary" : "text-muted-foreground")} strokeWidth={1.75} />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className={cn("text-[13px] font-medium", isActive ? "text-foreground" : "text-foreground/90")}>{t.title}</p>
                      <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-secondary">
                        <div className="h-full rounded-full bg-primary" style={{ width: `${t.progress}%` }} />
                      </div>
                    </div>
                  </button>
                </li>
              )
            })}
          </ul>
        </Card>

        {/* Lesson */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <div className="flex items-center gap-2">
              <Badge tone={active.level === "Advanced" ? "amber" : "indigo"}>{active.level}</Badge>
              <Badge>{active.progress}% complete</Badge>
            </div>
            <h2 className="mt-3 text-[20px] font-semibold tracking-tight text-foreground">{active.title}</h2>
            <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">{active.lesson.summary}</p>

            <p className="mt-6 text-[12px] font-semibold uppercase tracking-wide text-muted-foreground">Key points</p>
            <ul className="mt-3 space-y-2.5">
              {active.lesson.points.map((p) => (
                <li key={p} className="flex gap-2.5 text-[13px] leading-relaxed text-foreground/90">
                  <Check className="mt-0.5 size-4 shrink-0 text-primary" strokeWidth={2} />
                  {p}
                </li>
              ))}
            </ul>

            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-[#22c55e]/25 bg-[#22c55e]/5 p-4">
                <div className="mb-2 flex items-center gap-1.5 text-[12px] font-medium text-[#4ade80]">
                  <CheckCircle2 className="size-4" strokeWidth={1.75} /> Correct
                </div>
                <p className="text-[13px] leading-relaxed text-foreground/90">{active.lesson.correct}</p>
              </div>
              <div className="rounded-lg border border-[#ef4444]/25 bg-[#ef4444]/5 p-4">
                <div className="mb-2 flex items-center gap-1.5 text-[12px] font-medium text-[#f87171]">
                  <XCircle className="size-4" strokeWidth={1.75} /> Incorrect
                </div>
                <p className="text-[13px] leading-relaxed text-foreground/90">{active.lesson.wrong}</p>
              </div>
            </div>

            <div className="mt-4 rounded-lg border border-border bg-secondary/50 p-4">
              <p className="text-[12px] font-medium text-foreground">Examiner tip</p>
              <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">{active.lesson.tip}</p>
            </div>

            <button className="mt-6 inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-3.5 text-[13px] font-medium text-primary-foreground transition-colors hover:bg-primary/90">
              Practice this topic
              <ArrowRight className="size-4" strokeWidth={1.75} />
            </button>
          </Card>
        </div>
      </div>
    </div>
  )
}
