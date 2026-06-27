"use client"

import { useState } from "react"
import { Copy } from "lucide-react"
import { Card, PageIntro, Badge } from "@/components/app/primitives"
import { cn } from "@/lib/utils"

type Linker = { phrase: string; register: "Formal" | "Neutral"; example: string }

const categories: Record<string, Linker[]> = {
  Addition: [
    { phrase: "Furthermore", register: "Formal", example: "Furthermore, recycling reduces landfill waste." },
    { phrase: "Moreover", register: "Formal", example: "Moreover, it creates new jobs in green industries." },
    { phrase: "In addition", register: "Neutral", example: "In addition, public transport eases congestion." },
    { phrase: "What is more", register: "Neutral", example: "What is more, the policy is cost-effective." },
  ],
  Contrast: [
    { phrase: "However", register: "Neutral", example: "However, this view overlooks the long-term costs." },
    { phrase: "Nevertheless", register: "Formal", example: "Nevertheless, progress has been substantial." },
    { phrase: "On the other hand", register: "Neutral", example: "On the other hand, critics raise valid concerns." },
    { phrase: "Conversely", register: "Formal", example: "Conversely, rural areas saw a decline." },
  ],
  "Cause & Effect": [
    { phrase: "Consequently", register: "Formal", example: "Consequently, emissions fell sharply." },
    { phrase: "As a result", register: "Neutral", example: "As a result, productivity improved." },
    { phrase: "Therefore", register: "Neutral", example: "Therefore, intervention is necessary." },
    { phrase: "Owing to", register: "Formal", example: "Owing to better funding, results improved." },
  ],
  Example: [
    { phrase: "For instance", register: "Neutral", example: "For instance, solar power is now cheaper." },
    { phrase: "To illustrate", register: "Formal", example: "To illustrate, consider the case of Norway." },
    { phrase: "Namely", register: "Formal", example: "Two factors, namely cost and access, matter most." },
  ],
  Conclusion: [
    { phrase: "In conclusion", register: "Neutral", example: "In conclusion, the benefits outweigh the drawbacks." },
    { phrase: "To summarise", register: "Neutral", example: "To summarise, three measures are essential." },
    { phrase: "Ultimately", register: "Formal", example: "Ultimately, education is the key driver." },
  ],
}

const tabs = Object.keys(categories)

export default function LinkersPage() {
  const [tab, setTab] = useState(tabs[0])

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-8">
      <PageIntro
        title="Linkers"
        description="Cohesive devices grouped by function. Use them naturally — variety lifts Coherence & Cohesion."
      />

      {/* Tabs */}
      <div className="mb-5 flex flex-wrap gap-1.5 border-b border-border">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "-mb-px border-b-2 px-3 py-2.5 text-[13px] font-medium transition-colors",
              tab === t
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {categories[tab].map((l) => (
          <Card key={l.phrase} className="group p-4 transition-colors hover:border-[#333]">
            <div className="flex items-start justify-between">
              <h3 className="text-[15px] font-semibold text-foreground">{l.phrase}</h3>
              <button
                className="text-muted-foreground opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100"
                aria-label={`Copy ${l.phrase}`}
              >
                <Copy className="size-3.5" strokeWidth={1.75} />
              </button>
            </div>
            <Badge tone={l.register === "Formal" ? "indigo" : "neutral"} className="mt-2">
              {l.register}
            </Badge>
            <p className="mt-3 border-l-2 border-border pl-3 text-[12px] italic leading-relaxed text-muted-foreground">
              {l.example}
            </p>
          </Card>
        ))}
      </div>
    </div>
  )
}
