"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";

const ChartRenderer = dynamic(
  () => import("@/components/generator/chart-renderer"),
  { ssr: false }
);
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Loader2,
  Sparkles,
  Copy,
  Star,
  Check,
  AlertCircle,
  Clock,
} from "lucide-react";

const TASK_TYPES = [
  { value: "task2", label: "Academic Task 2 — Essay" },
  { value: "task1", label: "Academic Task 1 — Report" },
];

const TASK1_TYPES = [
  { value: "Bar Chart", label: "Bar Chart" },
  { value: "Line Graph", label: "Line Graph" },
  { value: "Pie Chart", label: "Pie Chart" },
  { value: "Table", label: "Table" },
  { value: "Map", label: "Map (two maps comparing change)" },
  { value: "Diagram", label: "Diagram (how something works)" },
  { value: "Process Diagram", label: "Process Diagram" },
  { value: "Mixed (Bar + Line)", label: "Mixed (Bar + Line)" },
];

const TASK2_TYPES = [
  { value: "Opinion Essay", label: "Opinion Essay (agree / disagree)" },
  { value: "Discussion Essay", label: "Discussion Essay (both views)" },
  { value: "Advantages and Disadvantages", label: "Advantages and Disadvantages" },
  { value: "Problems and Solutions", label: "Problems and Solutions" },
  { value: "Double Question", label: "Double Question" },
  { value: "Positive or Negative Development", label: "Positive or Negative Development" },
  { value: "Causes and Effects", label: "Causes and Effects" },
  { value: "Causes and Solutions", label: "Causes and Solutions" },
];

const TOPICS = [
  "Technology", "Education", "Environment", "Health", "Government",
  "Crime", "Business", "Transport", "Science", "Culture",
  "Media", "Globalisation", "Urbanisation", "Tourism", "Family",
  "Children", "Housing", "Animals", "Food", "Water",
  "Energy", "Population", "Poverty", "Gender Equality", "Sport",
  "Art", "History", "Language", "Space", "Psychology",
];

const STORAGE_KEY = "ielts_question_history";

type HistoryItem = {
  id: string;
  question: string;
  task_type: string;
  essay_type: string;
  topic: string;
  created_at: string;
  favourite: boolean;
};

function loadHistory(): HistoryItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function persistHistory(items: HistoryItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, 10)));
}

function formatRelative(date: Date): string {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-zinc-400">{label}</Label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-zinc-800/60 bg-zinc-900 px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-colors"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function HistoryCard({
  item,
  onToggleFavourite,
  onUse,
}: {
  item: HistoryItem;
  onToggleFavourite: () => void;
  onUse: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const label = `Task ${item.task_type === "task1" ? "1" : "2"} · ${item.essay_type} · ${item.topic}`;

  return (
    <div className="rounded-xl border border-zinc-800/60 bg-zinc-900 p-3">
      <div className="flex items-start gap-3">
        <button className="text-left flex-1 min-w-0" onClick={() => setExpanded((v) => !v)}>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
              {label}
            </span>
            {item.favourite && (
              <Star className="h-3 w-3 text-yellow-400 fill-yellow-400 shrink-0" />
            )}
          </div>
          <p className={`text-xs text-zinc-400 leading-relaxed ${expanded ? "" : "line-clamp-2"}`}>
            {item.question}
          </p>
        </button>
        <button
          onClick={onToggleFavourite}
          className={`p-1.5 rounded-md hover:bg-zinc-800 transition-colors shrink-0 ${
            item.favourite ? "text-yellow-400" : "text-zinc-600 hover:text-zinc-400"
          }`}
          title={item.favourite ? "Remove from favourites" : "Save to favourites"}
        >
          <Star className={`h-3.5 w-3.5 ${item.favourite ? "fill-yellow-400" : ""}`} />
        </button>
      </div>
      <div className="flex items-center gap-3 mt-2">
        <span className="flex items-center gap-1 text-[10px] text-zinc-600">
          <Clock className="h-3 w-3" />
          {formatRelative(new Date(item.created_at))}
        </span>
        <button
          onClick={onUse}
          className="text-[10px] font-medium text-blue-400 hover:text-blue-300 transition-colors"
        >
          Use this question →
        </button>
      </div>
    </div>
  );
}

export default function GeneratorPage() {
  const [taskType, setTaskType] = useState("task2");
  const [subType, setSubType] = useState("Opinion Essay");
  const [topic, setTopic] = useState("Technology");

  function handleTaskTypeChange(t: string) {
    setTaskType(t);
    setSubType(t === "task1" ? "Bar Chart" : "Opinion Essay");
  }
  const [loading, setLoading] = useState(false);
  const [question, setQuestion] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [chartData, setChartData] = useState<unknown>(null);
  const [chartLoading, setChartLoading] = useState(false);

  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  const currentIsFavourite = question
    ? (history.find((h) => h.question === question)?.favourite ?? false)
    : false;

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    setQuestion(null);
    setCopied(false);
    setChartData(null);
    setChartLoading(false);

    try {
      const res = await fetch("/api/generate-question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task_type: taskType, sub_type: subType, topic }),
      });

      if (!res.ok) throw new Error(`Request failed with status ${res.status}`);

      const text = await res.text();
      if (!text.trim()) throw new Error("Empty response received");
      setQuestion(text.trim());

      // For Task 1, fetch chart data in parallel (non-blocking)
      if (taskType === "task1") {
        setChartLoading(true);
        fetch("/api/generate-chart-data", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question: text.trim(), chart_type: subType }),
        })
          .then((r) => (r.ok ? r.json() : null))
          .then((d) => { if (d && !d.error) setChartData(d); })
          .catch(() => {})
          .finally(() => setChartLoading(false));
      }

      const item: HistoryItem = {
        id: crypto.randomUUID(),
        question: text.trim(),
        task_type: taskType,
        essay_type: subType,
        topic,
        created_at: new Date().toISOString(),
        favourite: false,
      };

      setHistory((prev) => {
        const updated = [item, ...prev].slice(0, 10);
        persistHistory(updated);
        return updated;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleCopy() {
    if (!question) return;
    navigator.clipboard.writeText(question).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function handleToggleFavourite() {
    if (!question) return;
    setHistory((prev) => {
      const updated = prev.map((item) =>
        item.question === question ? { ...item, favourite: !item.favourite } : item
      );
      persistHistory(updated);
      return updated;
    });
  }

  function toggleHistoryFavourite(id: string) {
    setHistory((prev) => {
      const updated = prev.map((item) =>
        item.id === id ? { ...item, favourite: !item.favourite } : item
      );
      persistHistory(updated);
      return updated;
    });
  }

  return (
    <div className="p-6 md:p-8 max-w-3xl">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-zinc-100 mb-1">IELTS Question Generator</h2>
        <p className="text-sm text-zinc-500">
          Generate authentic Cambridge-style IELTS questions instantly
        </p>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        <SelectField
          label="Task Type"
          value={taskType}
          onChange={handleTaskTypeChange}
          options={TASK_TYPES}
        />

        <AnimatePresence mode="wait">
          <motion.div
            key={taskType}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <SelectField
              label={taskType === "task1" ? "Chart / Diagram Type" : "Essay Type"}
              value={subType}
              onChange={setSubType}
              options={taskType === "task1" ? TASK1_TYPES : TASK2_TYPES}
            />
          </motion.div>
        </AnimatePresence>

        <SelectField
          label="Topic"
          value={topic}
          onChange={setTopic}
          options={TOPICS.map((t) => ({ value: t, label: t }))}
        />
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-red-800/40 bg-red-950/20 p-3 mb-4">
          <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
          <p className="text-xs text-red-400">{error}</p>
        </div>
      )}

      <Button onClick={handleGenerate} disabled={loading} className="gap-2 mb-8">
        {loading ? (
          <>
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Generating…
          </>
        ) : (
          <>
            <Sparkles className="h-3.5 w-3.5" />
            Generate Question
          </>
        )}
      </Button>

      {/* Generated question card */}
      <AnimatePresence>
        {question && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="mb-8"
          >
            <h3 className="text-xs font-medium text-zinc-600 uppercase tracking-widest mb-3">
              Generated Question
            </h3>

            {/* Chart — Task 1 only */}
            {taskType === "task1" && chartLoading && (
              <div className="rounded-xl border border-zinc-800/60 bg-zinc-900 mb-4 h-48 flex items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin text-zinc-600" />
                  <p className="text-xs text-zinc-600">Generating chart…</p>
                </div>
              </div>
            )}
            {taskType === "task1" && !chartLoading && !!chartData && (
              <ChartRenderer chartType={subType} data={chartData} />
            )}

            <Card className="bg-zinc-900 border-blue-800/30 border">
              <CardContent className="pt-5 pb-4">
                <p className="text-sm text-zinc-200 leading-relaxed mb-5">{question}</p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCopy}
                    className="gap-2 border-zinc-700 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
                  >
                    {copied ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-green-400" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        Copy
                      </>
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleToggleFavourite}
                    className={`gap-2 border-zinc-700 hover:bg-zinc-800 transition-colors ${
                      currentIsFavourite
                        ? "text-yellow-400 hover:text-yellow-300"
                        : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    <Star
                      className={`h-3.5 w-3.5 ${currentIsFavourite ? "fill-yellow-400" : ""}`}
                    />
                    {currentIsFavourite ? "Saved" : "Save to Favourites"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* History */}
      {history.length > 0 && (
        <div>
          <h3 className="text-xs font-medium text-zinc-600 uppercase tracking-widest mb-3">
            Recent Questions
          </h3>
          <div className="space-y-2">
            {history.map((item) => (
              <HistoryCard
                key={item.id}
                item={item}
                onToggleFavourite={() => toggleHistoryFavourite(item.id)}
                onUse={() => { setQuestion(item.question); setChartData(null); setChartLoading(false); }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
