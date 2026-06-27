"use client"

import { useState } from "react"
import { Shuffle, Bookmark, Clock, Copy, ArrowRight } from "lucide-react"
import { Card, PageIntro, Button, Badge } from "@/components/app/primitives"
import { cn } from "@/lib/utils"

const filters = {
  Task: ["Task 2", "Task 1 Academic", "Task 1 General"],
  Type: ["Opinion", "Discussion", "Problem/Solution", "Advantages", "Two-part"],
  Topic: ["Technology", "Environment", "Education", "Health", "Society", "Work"],
}

type Generated = { topic: string; type: string; task: string; prompt: string; minWords: number; time: number }

const defaultGenerated: Generated = {
  topic: "Technology",
  type: "Opinion",
  task: "Task 2",
  prompt: "Some people believe that the increasing use of artificial intelligence in the workplace will create more opportunities than it removes. To what extent do you agree or disagree with this statement?",
  minWords: 250,
  time: 40,
}

export default function QuestionsPage() {
  const [selected, setSelected] = useState<Record<string, string>>({
    Task: "Task 2",
    Type: "Opinion",
    Topic: "Technology",
  })
  const [generated, setGenerated] = useState<Generated>(defaultGenerated)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  async function generate() {
    setLoading(true)
    try {
      const taskType = selected.Task === "Task 2" ? "task2" : "task1"
      const res = await fetch("/api/generate-question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task_type: taskType,
          sub_type: selected.Type,
          topic: selected.Topic,
        }),
      })
      if (!res.ok) throw new Error("Failed")
      const prompt = await res.text()
      setGenerated({
        topic: selected.Topic,
        type: selected.Type,
        task: selected.Task,
        prompt,
        minWords: taskType === "task2" ? 250 : 150,
        time: taskType === "task2" ? 40 : 20,
      })
    } catch {
      // keep existing question on error
    } finally {
      setLoading(false)
    }
  }

  function copyPrompt() {
    navigator.clipboard.writeText(generated.prompt)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-8">
      <PageIntro
        title="Question Generator"
        description="Set your filters and generate authentic, exam-style prompts to practice with."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Filters */}
        <Card className="h-fit p-5 lg:col-span-1">
          <p className="text-[13px] font-semibold text-foreground">Filters</p>
          <div className="mt-4 space-y-5">
            {Object.entries(filters).map(([group, options]) => (
              <div key={group}>
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{group}</p>
                <div className="flex flex-wrap gap-1.5">
                  {options.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setSelected((s) => ({ ...s, [group]: opt }))}
                      className={cn(
                        "rounded-lg border px-2.5 py-1.5 text-[12px] font-medium transition-colors",
                        selected[group] === opt
                          ? "border-primary/40 bg-primary/10 text-primary"
                          : "border-border bg-secondary text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <Button className="mt-6 w-full" onClick={generate} disabled={loading}>
            <Shuffle className="size-4" strokeWidth={1.75} />
            {loading ? "Generating…" : "Generate question"}
          </Button>
        </Card>

        {/* Generated card */}
        <div className="lg:col-span-2">
          <Card className="overflow-hidden">
            <div className="flex items-center justify-between border-b border-border px-5 py-3">
              <div className="flex items-center gap-2">
                <Badge tone="indigo">{generated.task}</Badge>
                <Badge>{generated.type}</Badge>
                <Badge>{generated.topic}</Badge>
              </div>
              <button className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground" aria-label="Save question">
                <Bookmark className="size-4" strokeWidth={1.75} />
              </button>
            </div>
            <div className="p-6">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Your prompt</p>
              {loading ? (
                <div className="mt-3 flex gap-1">
                  <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:0ms]" />
                  <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:150ms]" />
                  <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:300ms]" />
                </div>
              ) : (
                <p className="mt-3 text-[18px] leading-relaxed text-foreground">{generated.prompt}</p>
              )}
              <div className="mt-6 flex flex-wrap items-center gap-4 text-[12px] text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="size-3.5" strokeWidth={1.75} />
                  {generated.time} min recommended
                </span>
                <span className="inline-flex items-center gap-1.5">
                  Minimum {generated.minWords} words
                </span>
              </div>
              <div className="mt-6 flex flex-wrap gap-2">
                <Button>
                  Start writing
                  <ArrowRight className="size-4" strokeWidth={1.75} />
                </Button>
                <Button variant="secondary" onClick={copyPrompt}>
                  <Copy className="size-3.5" strokeWidth={1.75} />
                  {copied ? "Copied!" : "Copy"}
                </Button>
                <Button variant="secondary" onClick={generate} disabled={loading}>
                  <Shuffle className="size-3.5" strokeWidth={1.75} />
                  Regenerate
                </Button>
              </div>
            </div>
          </Card>

          <p className="mt-4 px-1 text-[12px] text-muted-foreground">
            Tip: practice the same topic across different question types to build flexible idea banks.
          </p>
        </div>
      </div>
    </div>
  )
}
