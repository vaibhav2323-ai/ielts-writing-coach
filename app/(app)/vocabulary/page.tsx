"use client"

import { useMemo, useState } from "react"
import { Search, Volume2, Bookmark, Sparkles } from "lucide-react"
import { Card, PageIntro, Button, Badge } from "@/components/app/primitives"
import { cn } from "@/lib/utils"

type Word = {
  word: string
  type: string
  band: number
  topic: string
  definition: string
  example: string
  mastered?: boolean
}

const seed: Word[] = [
  { word: "Mitigate", type: "verb", band: 8, topic: "Environment", definition: "To make something less severe or harmful.", example: "Governments must act to mitigate the effects of climate change.", mastered: true },
  { word: "Ubiquitous", type: "adjective", band: 8, topic: "Technology", definition: "Present, appearing, or found everywhere.", example: "Smartphones have become ubiquitous in modern life." },
  { word: "Detrimental", type: "adjective", band: 7, topic: "Health", definition: "Tending to cause harm or damage.", example: "Excessive screen time can be detrimental to children.", mastered: true },
  { word: "Proliferation", type: "noun", band: 8, topic: "Society", definition: "Rapid increase in the number or amount of something.", example: "The proliferation of social media has reshaped communication." },
  { word: "Advocate", type: "verb", band: 7, topic: "Education", definition: "To publicly recommend or support.", example: "Many experts advocate for smaller class sizes." },
  { word: "Exacerbate", type: "verb", band: 8, topic: "Health", definition: "To make a problem or situation worse.", example: "Poor diet can exacerbate existing health conditions." },
]

const topics = ["All", "Technology", "Environment", "Health", "Education", "Society", "Work"]
const bandLevels = ["7", "8", "9"]

export default function VocabularyPage() {
  const [words, setWords] = useState<Word[]>(seed)
  const [query, setQuery] = useState("")
  const [topic, setTopic] = useState("All")
  const [genTopic, setGenTopic] = useState("Technology")
  const [bandLevel, setBandLevel] = useState("8")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const filtered = useMemo(
    () =>
      words.filter(
        (w) =>
          (topic === "All" || w.topic === topic) &&
          (w.word.toLowerCase().includes(query.toLowerCase()) ||
            w.definition.toLowerCase().includes(query.toLowerCase())),
      ),
    [words, query, topic],
  )

  async function generate() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/generate-vocabulary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: genTopic, band_level: bandLevel }),
      })
      if (!res.ok) throw new Error("Failed")
      const data = await res.json()
      const mapped: Word[] = (data.words ?? []).map((w: {
        word: string; part_of_speech: string; band_level: string;
        topic: string; meaning: string; example_sentence: string
      }) => ({
        word: w.word,
        type: w.part_of_speech,
        band: parseInt(w.band_level) || parseInt(bandLevel),
        topic: w.topic || genTopic,
        definition: w.meaning,
        example: w.example_sentence,
        mastered: false,
      }))
      setWords(mapped)
      setTopic("All")
    } catch {
      setError("Could not generate words. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-8">
      <PageIntro
        title="Vocabulary"
        description="Curated band 7–9 words organised by topic, with definitions and example sentences."
      />

      {/* Generate bar */}
      <Card className="mb-5 flex flex-wrap items-center gap-3 p-4">
        <div className="flex flex-wrap gap-1.5">
          {topics.filter(t => t !== "All").map((t) => (
            <button
              key={t}
              onClick={() => setGenTopic(t)}
              className={cn(
                "rounded-lg border px-2.5 py-1.5 text-[12px] font-medium transition-colors",
                genTopic === t
                  ? "border-primary/40 bg-primary/10 text-primary"
                  : "border-border bg-secondary text-muted-foreground hover:text-foreground",
              )}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="flex gap-1.5">
          {bandLevels.map((b) => (
            <button
              key={b}
              onClick={() => setBandLevel(b)}
              className={cn(
                "rounded-lg border px-2.5 py-1.5 text-[12px] font-medium transition-colors",
                bandLevel === b
                  ? "border-primary/40 bg-primary/10 text-primary"
                  : "border-border bg-secondary text-muted-foreground hover:text-foreground",
              )}
            >
              Band {b}
            </button>
          ))}
        </div>
        <Button className="ml-auto" onClick={generate} disabled={loading}>
          <Sparkles className="size-3.5" strokeWidth={1.75} />
          {loading ? "Generating…" : "Generate words"}
        </Button>
      </Card>
      {error && <p className="mb-3 text-[13px] text-destructive">{error}</p>}

      {/* Controls */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" strokeWidth={1.75} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search words…"
            className="h-9 w-full rounded-lg border border-border bg-card pl-9 pr-3 text-[13px] text-foreground placeholder:text-muted-foreground focus:border-[#333] focus:outline-none"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {topics.map((t) => (
            <button
              key={t}
              onClick={() => setTopic(t)}
              className={cn(
                "rounded-lg border px-2.5 py-1.5 text-[12px] font-medium transition-colors",
                topic === t
                  ? "border-primary/40 bg-primary/10 text-primary"
                  : "border-border bg-secondary text-muted-foreground hover:text-foreground",
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((w) => (
          <Card key={w.word} className="group p-4 transition-colors hover:border-[#333]">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-[16px] font-semibold text-foreground">{w.word}</h3>
                  <button className="text-muted-foreground transition-colors hover:text-foreground" aria-label="Pronounce">
                    <Volume2 className="size-3.5" strokeWidth={1.75} />
                  </button>
                </div>
                <p className="text-[12px] italic text-muted-foreground">{w.type}</p>
              </div>
              <button
                className={cn(
                  "transition-colors",
                  w.mastered ? "text-primary" : "text-muted-foreground hover:text-foreground",
                )}
                aria-label="Save word"
              >
                <Bookmark className={cn("size-4", w.mastered && "fill-current")} strokeWidth={1.75} />
              </button>
            </div>
            <p className="mt-2.5 text-[13px] leading-relaxed text-foreground/90">{w.definition}</p>
            <p className="mt-2 border-l-2 border-border pl-3 text-[12px] italic leading-relaxed text-muted-foreground">
              {w.example}
            </p>
            <div className="mt-3 flex items-center gap-2">
              <Badge tone="indigo">Band {w.band}</Badge>
              <Badge>{w.topic}</Badge>
              {w.mastered && <Badge tone="green">Mastered</Badge>}
            </div>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <Card className="p-12 text-center">
          <p className="text-[14px] font-medium text-foreground">No words found</p>
          <p className="mt-1 text-[12px] text-muted-foreground">Try a different search or topic.</p>
        </Card>
      )}
    </div>
  )
}
