"use client"

import { useState } from "react"
import { Sparkles, FileText, ArrowRight, Star } from "lucide-react"
import { Card, PageIntro, Button, Badge } from "@/components/app/primitives"
import { cn } from "@/lib/utils"

const questionTypes = ["Opinion", "Discussion", "Problem/Solution", "Advantages", "Task 1 Graph"]

type Template = {
  title: string
  type: string
  band: string
  uses: number
  featured?: boolean
  structure: string[]
}

const templates: Template[] = [
  {
    title: "Balanced Opinion Essay",
    type: "Opinion",
    band: "8.0+",
    uses: 2410,
    featured: true,
    structure: ["Paraphrase + clear thesis", "Reason 1 with example", "Reason 2 with example", "Restate position"],
  },
  {
    title: "Discuss Both Views",
    type: "Discussion",
    band: "7.5+",
    uses: 1980,
    structure: ["Introduce both sides", "View A explained", "View B explained", "Your opinion + summary"],
  },
  {
    title: "Problem & Solution",
    type: "Problem/Solution",
    band: "7.5+",
    uses: 1560,
    structure: ["State the problem", "Causes", "Solutions", "Concluding recommendation"],
  },
  {
    title: "Advantages Outweigh",
    type: "Advantages",
    band: "8.0+",
    uses: 1320,
    structure: ["Acknowledge both", "Main advantage", "Main disadvantage", "Weighted conclusion"],
  },
  {
    title: "Line Graph Overview",
    type: "Task 1 Graph",
    band: "7.5+",
    uses: 2100,
    structure: ["Paraphrase the task", "Overview of trends", "Detail group 1", "Detail group 2"],
  },
  {
    title: "Two-Part Question",
    type: "Discussion",
    band: "7.5+",
    uses: 980,
    structure: ["Introduce topic", "Answer part 1", "Answer part 2", "Summarise both"],
  },
]

export default function TemplatesPage() {
  const [filter, setFilter] = useState("All")
  const visible = filter === "All" ? templates : templates.filter((t) => t.type === filter)

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-8">
      <PageIntro
        title="Templates"
        description="Proven essay frameworks. Find the right structure for any question type in seconds."
      />

      {/* Smart finder */}
      <Card className="mb-7 p-5">
        <div className="flex items-center gap-2">
          <Sparkles className="size-4 text-primary" strokeWidth={1.75} />
          <p className="text-[13px] font-semibold text-foreground">Smart template finder</p>
        </div>
        <p className="mt-1 text-[12px] text-muted-foreground">
          Tell us your question type and we&apos;ll surface the best-matching structure.
        </p>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <input
            placeholder="Paste your question or describe the task…"
            className="h-9 flex-1 rounded-lg border border-border bg-secondary px-3 text-[13px] text-foreground placeholder:text-muted-foreground focus:border-[#333] focus:outline-none"
          />
          <Button>
            <Sparkles className="size-4" strokeWidth={1.75} />
            Find template
          </Button>
        </div>
      </Card>

      {/* Filter chips */}
      <div className="mb-5 flex flex-wrap gap-1.5">
        {["All", ...questionTypes].map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={cn(
              "rounded-lg border px-2.5 py-1.5 text-[12px] font-medium transition-colors",
              filter === t
                ? "border-primary/40 bg-primary/10 text-primary"
                : "border-border bg-secondary text-muted-foreground hover:text-foreground",
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((t) => (
          <Card key={t.title} className="group flex flex-col p-5 transition-colors hover:border-[#333]">
            <div className="flex items-start justify-between">
              <div className="flex size-9 items-center justify-center rounded-lg border border-border bg-secondary text-primary">
                <FileText className="size-[18px]" strokeWidth={1.75} />
              </div>
              {t.featured && (
                <Badge tone="amber">
                  <Star className="size-3 fill-current" strokeWidth={2} />
                  Popular
                </Badge>
              )}
            </div>
            <p className="mt-4 text-[15px] font-medium text-foreground">{t.title}</p>
            <div className="mt-2 flex items-center gap-2">
              <Badge>{t.type}</Badge>
              <Badge tone="indigo">Band {t.band}</Badge>
            </div>
            <ol className="mt-4 flex-1 space-y-1.5">
              {t.structure.map((step, i) => (
                <li key={step} className="flex gap-2 text-[12px] leading-relaxed text-muted-foreground">
                  <span className="font-medium text-foreground tabular">{i + 1}.</span>
                  {step}
                </li>
              ))}
            </ol>
            <button className="mt-5 inline-flex items-center gap-1.5 text-[13px] font-medium text-primary transition-colors hover:underline">
              Use template
              <ArrowRight className="size-3.5" strokeWidth={1.75} />
            </button>
          </Card>
        ))}
      </div>
    </div>
  )
}
