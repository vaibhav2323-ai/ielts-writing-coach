"use client"

import { useMemo, useState } from "react"
import { Sparkles, CheckCircle2, AlertCircle, RotateCcw, FileText } from "lucide-react"
import { Card, PageIntro, Button, Badge } from "@/components/app/primitives"
import { cn } from "@/lib/utils"

const taskTypes = ["Task 2 — Essay", "Task 1 — Academic", "Task 1 — General"]

type Criterion = { label: string; band: number; note: string }
type EvalResult = {
  overall: number
  criteria: Criterion[]
  strengths: string[]
  improvements: string[]
}

export default function EvaluatorPage() {
  const [task, setTask] = useState(taskTypes[0])
  const [text, setText] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<EvalResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const wordCount = useMemo(() => (text.trim() ? text.trim().split(/\s+/).length : 0), [text])

  function toTaskType(label: string) {
    return label.startsWith("Task 1") ? "task1" : "task2"
  }

  async function evaluate() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ essay: text, taskType: toTaskType(task) }),
      })
      if (!res.ok) throw new Error("Evaluation failed")
      const raw = await res.json()
      const result: EvalResult = {
        overall: raw.overall_band ?? 0,
        criteria: [
          { label: "Task Achievement", band: raw.task_achievement?.score ?? 0, note: raw.task_achievement?.feedback ?? "" },
          { label: "Coherence & Cohesion", band: raw.coherence_cohesion?.score ?? 0, note: raw.coherence_cohesion?.feedback ?? "" },
          { label: "Lexical Resource", band: raw.lexical_resource?.score ?? 0, note: raw.lexical_resource?.feedback ?? "" },
          { label: "Grammatical Range", band: raw.grammatical_range?.score ?? 0, note: raw.grammatical_range?.feedback ?? "" },
        ],
        strengths: [],
        improvements: (raw.mistakes ?? []).map((m: { original?: string; correction?: string }) =>
          m.original && m.correction ? `"${m.original}" → "${m.correction}"` : (m.correction ?? "")
        ).filter(Boolean),
      }
      setResult(result)
    } catch (e) {
      setError("Could not evaluate essay. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  function reset() {
    setText("")
    setResult(null)
    setError(null)
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-8">
      <PageIntro
        title="Essay Evaluator"
        description="Paste your response and get an examiner-style band score across all four criteria."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Input */}
        <div className="lg:col-span-3">
          <Card className="overflow-hidden">
            <div className="flex flex-wrap items-center gap-2 border-b border-border px-4 py-3">
              {taskTypes.map((t) => (
                <button
                  key={t}
                  onClick={() => setTask(t)}
                  className={cn(
                    "rounded-lg border px-2.5 py-1.5 text-[12px] font-medium transition-colors",
                    task === t
                      ? "border-primary/40 bg-primary/10 text-primary"
                      : "border-border bg-secondary text-muted-foreground hover:text-foreground",
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste or write your essay here…"
              className="h-80 w-full resize-none bg-transparent p-4 text-[14px] leading-relaxed text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
            <div className="flex items-center justify-between border-t border-border px-4 py-3">
              <div className="flex items-center gap-3 text-[12px] text-muted-foreground">
                <span className="tabular">{wordCount} words</span>
                <span className={cn(wordCount >= 250 ? "text-[#4ade80]" : "text-[#fbbf24]")}>
                  {wordCount >= 250 ? "Meets length" : "Min. 250"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="secondary" onClick={reset}>
                  <RotateCcw className="size-3.5" strokeWidth={1.75} />
                  Clear
                </Button>
                <Button onClick={evaluate} disabled={wordCount < 10 || loading}>
                  <Sparkles className="size-3.5" strokeWidth={1.75} />
                  {loading ? "Evaluating…" : "Evaluate"}
                </Button>
              </div>
            </div>
          </Card>
          {error && (
            <p className="mt-2 text-[13px] text-destructive">{error}</p>
          )}
        </div>

        {/* Results */}
        <div className="lg:col-span-2">
          {!result ? (
            <Card className="flex h-full flex-col items-center justify-center p-10 text-center">
              <div className="flex size-11 items-center justify-center rounded-lg border border-border bg-secondary text-muted-foreground">
                <FileText className="size-5" strokeWidth={1.5} />
              </div>
              <p className="mt-4 text-[14px] font-medium text-foreground">No evaluation yet</p>
              <p className="mt-1 text-[12px] text-muted-foreground">
                Submit your essay to see a full band breakdown and feedback.
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              <Card className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[12px] text-muted-foreground">Overall band</p>
                    <p className="text-[40px] font-semibold leading-none tracking-tight text-foreground tabular">
                      {result.overall.toFixed(1)}
                    </p>
                  </div>
                  <Badge tone="green">Estimated</Badge>
                </div>
                <div className="mt-5 space-y-3.5">
                  {result.criteria.map((c) => (
                    <div key={c.label}>
                      <div className="mb-1 flex items-center justify-between text-[12px]">
                        <span className="text-foreground">{c.label}</span>
                        <span className="font-medium text-foreground tabular">{c.band.toFixed(1)}</span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${(c.band / 9) * 100}%` }}
                        />
                      </div>
                      <p className="mt-1 text-[11px] text-muted-foreground">{c.note}</p>
                    </div>
                  ))}
                </div>
              </Card>

              {result.strengths?.length > 0 && (
                <Card className="p-4">
                  <p className="mb-2.5 text-[12px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Strengths
                  </p>
                  <ul className="space-y-2">
                    {result.strengths.map((s) => (
                      <li key={s} className="flex gap-2 text-[13px] text-foreground/90">
                        <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[#4ade80]" strokeWidth={1.75} />
                        {s}
                      </li>
                    ))}
                  </ul>
                </Card>
              )}

              {result.improvements?.length > 0 && (
                <Card className="p-4">
                  <p className="mb-2.5 text-[12px] font-semibold uppercase tracking-wide text-muted-foreground">
                    To improve
                  </p>
                  <ul className="space-y-2">
                    {result.improvements.map((s) => (
                      <li key={s} className="flex gap-2 text-[13px] text-foreground/90">
                        <AlertCircle className="mt-0.5 size-4 shrink-0 text-[#fbbf24]" strokeWidth={1.75} />
                        {s}
                      </li>
                    ))}
                  </ul>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
