"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { motion, AnimatePresence } from "framer-motion";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabase";
import { upsertUser } from "@/lib/supabase-chat";
import { Loader2, Send, RotateCcw, CheckCircle2, AlertCircle } from "lucide-react";

type CriterionResult = { score: number; feedback: string };
type Mistake = { original: string; correction: string };
type EvaluationResult = {
  overall_band: number;
  task_achievement: CriterionResult;
  coherence_cohesion: CriterionResult;
  lexical_resource: CriterionResult;
  grammatical_range: CriterionResult;
  mistakes: Mistake[];
  improved_essay: string;
  band9_version: string;
};

function bandColor(score: number) {
  if (score >= 7) return { text: "#22c55e", bar: "#22c55e", bg: "rgba(34,197,94,0.08)", border: "#22c55e40" };
  if (score >= 5) return { text: "#f59e0b", bar: "#f59e0b", bg: "rgba(245,158,11,0.08)", border: "#f59e0b40" };
  return { text: "#ef4444", bar: "#ef4444", bg: "rgba(239,68,68,0.08)", border: "#ef444440" };
}

function BandCircle({ score }: { score: number }) {
  const c = bandColor(score);
  return (
    <div
      className="w-20 h-20 rounded-full flex flex-col items-center justify-center shrink-0"
      style={{ border: `3px solid ${c.text}`, background: c.bg }}
    >
      <span className="text-2xl font-bold leading-none" style={{ color: c.text }}>{score}</span>
      <span style={{ fontSize: "10px", color: "#666", marginTop: 2 }}>Band</span>
    </div>
  );
}

function CriterionCard({ label, score, feedback }: { label: string; score: number; feedback: string }) {
  const c = bandColor(score);
  return (
    <div className="rounded-lg p-4" style={{ background: "#111111", border: "1px solid #222222" }}>
      <div className="flex items-center justify-between mb-2">
        <p style={{ fontSize: "11px", fontWeight: 600, color: "#666", textTransform: "uppercase", letterSpacing: "0.06em" }}>
          {label}
        </p>
        <span className="text-base font-bold tabular" style={{ color: c.text }}>{score}</span>
      </div>
      <div className="h-1 rounded-full mb-3" style={{ background: "#1a1a1a" }}>
        <div className="h-1 rounded-full" style={{ width: `${(score / 9) * 100}%`, background: c.bar }} />
      </div>
      <p style={{ fontSize: "12px", color: "#888", lineHeight: 1.6 }}>{feedback}</p>
    </div>
  );
}

const SELECT_CLS = "w-full rounded-lg border px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#4F46E5] transition-colors";
const SELECT_STYLE = { background: "#111111", borderColor: "#222222", colorScheme: "dark" } as React.CSSProperties;

export default function EvaluatorPage() {
  const { user, isLoaded } = useUser();
  const [supabaseUserId, setSupabaseUserId] = useState<string | null>(null);
  const [essay, setEssay] = useState("");
  const [taskType, setTaskType] = useState<"task1" | "task2">("task2");
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<EvaluationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!isLoaded || !user) return;
    upsertUser(user.id, user.primaryEmailAddress?.emailAddress ?? "", user.fullName ?? null, user.imageUrl ?? null)
      .then(setSupabaseUserId).catch(console.error);
  }, [isLoaded, user]);

  const wordCount = essay.trim() === "" ? 0 : essay.trim().split(/\s+/).length;

  async function handleSubmit() {
    if (!essay.trim() || wordCount < 50) return;
    setLoading(true); setError(null); setResult(null); setSaved(false);
    try {
      const res = await fetch("/api/evaluate", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ essay, taskType, question }),
      });
      if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
      const data: EvaluationResult = await res.json();
      if (data.overall_band === undefined) throw new Error("Invalid response from evaluator");
      setResult(data);
      if (supabaseUserId) {
        const { error: dbErr } = await supabase.from("essays").insert({
          user_id: supabaseUserId, task_type: taskType,
          question: question.trim() || "No question provided",
          content: essay, band_score: data.overall_band, feedback: JSON.stringify(data),
        });
        if (!dbErr) setSaved(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setEssay(""); setQuestion(""); setResult(null); setError(null); setSaved(false);
  }

  return (
    <div className="p-6 md:p-8 max-w-3xl">
      <div className="mb-7">
        <h1 className="text-xl font-bold text-white mb-1" style={{ letterSpacing: "-0.02em" }}>Essay Evaluator</h1>
        <p style={{ fontSize: "14px", color: "#888" }}>Instant IELTS band scores and detailed examiner feedback</p>
      </div>

      <AnimatePresence mode="wait">
        {!result ? (
          <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            <div className="space-y-1.5">
              <label style={{ fontSize: "12px", fontWeight: 500, color: "#888" }}>Task Type</label>
              <select value={taskType} onChange={(e) => setTaskType(e.target.value as "task1" | "task2")} className={SELECT_CLS} style={SELECT_STYLE}>
                <option value="task2">Academic Task 2 — Essay</option>
                <option value="task1">Academic Task 1 — Report</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label style={{ fontSize: "12px", fontWeight: 500, color: "#888" }}>
                Question <span style={{ color: "#555", fontWeight: 400 }}>(optional)</span>
              </label>
              <Textarea
                placeholder="Paste the exam question here…"
                className="min-h-[72px] text-sm resize-none rounded-lg border text-white placeholder:text-[#444] focus-visible:ring-1 focus-visible:ring-[#4F46E5]"
                style={{ background: "#111111", borderColor: "#222222" }}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label style={{ fontSize: "12px", fontWeight: 500, color: "#888" }}>Your Essay</label>
              <Textarea
                placeholder="Paste or type your essay here…"
                className="min-h-[320px] text-sm leading-relaxed resize-none rounded-lg border text-white placeholder:text-[#444] focus-visible:ring-1 focus-visible:ring-[#4F46E5]"
                style={{ background: "#111111", borderColor: "#222222" }}
                value={essay}
                onChange={(e) => setEssay(e.target.value)}
              />
              <p style={{ fontSize: "12px", color: wordCount >= 250 ? "#22c55e" : wordCount >= 150 ? "#f59e0b" : "#555" }}>
                {wordCount} words{wordCount > 0 && wordCount < 250 ? " — aim for 250+" : ""}
              </p>
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-lg p-3" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
                <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                <p style={{ fontSize: "12px", color: "#f87171" }}>{error}</p>
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading || wordCount < 50}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: "#4F46E5" }}
            >
              {loading ? <><Loader2 className="h-3.5 w-3.5 animate-spin" />Evaluating…</> : <><Send className="h-3.5 w-3.5" />Evaluate Essay</>}
            </button>
          </motion.div>
        ) : (
          <motion.div key="results" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="space-y-6">
            {/* Overall band */}
            <div className="rounded-lg p-5" style={{ background: "#111111", border: "1px solid #222222" }}>
              <div className="flex items-center gap-5">
                <BandCircle score={result.overall_band} />
                <div>
                  <p style={{ fontSize: "11px", fontWeight: 600, color: "#555", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Overall Band Score</p>
                  <p className="text-2xl font-bold text-white tabular" style={{ letterSpacing: "-0.03em" }}>{result.overall_band} / 9</p>
                  <p style={{ fontSize: "12px", color: "#888", marginTop: 4 }}>
                    {result.overall_band >= 7 ? "Good — above average performance" : result.overall_band >= 5 ? "Modest — meaningful room for improvement" : "Limited — significant development needed"}
                  </p>
                  {saved && <p className="flex items-center gap-1 mt-2" style={{ fontSize: "11px", color: "#22c55e" }}><CheckCircle2 className="h-3 w-3" />Saved to your progress</p>}
                </div>
              </div>
            </div>

            {/* Criteria */}
            <div>
              <p className="mb-3" style={{ fontSize: "11px", fontWeight: 600, color: "#555", textTransform: "uppercase", letterSpacing: "0.06em" }}>Criteria Breakdown</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <CriterionCard label="Task Achievement" score={result.task_achievement.score} feedback={result.task_achievement.feedback} />
                <CriterionCard label="Coherence & Cohesion" score={result.coherence_cohesion.score} feedback={result.coherence_cohesion.feedback} />
                <CriterionCard label="Lexical Resource" score={result.lexical_resource.score} feedback={result.lexical_resource.feedback} />
                <CriterionCard label="Grammatical Range" score={result.grammatical_range.score} feedback={result.grammatical_range.feedback} />
              </div>
            </div>

            {/* Mistakes */}
            {result.mistakes?.length > 0 && (
              <div>
                <p className="mb-3" style={{ fontSize: "11px", fontWeight: 600, color: "#555", textTransform: "uppercase", letterSpacing: "0.06em" }}>Mistakes & Corrections</p>
                <div className="rounded-lg p-4 space-y-3" style={{ background: "#111111", border: "1px solid #222222" }}>
                  {result.mistakes.map((m, i) => (
                    <div key={i} className="flex flex-col gap-1 pb-3 last:pb-0" style={{ borderBottom: i < result.mistakes.length - 1 ? "1px solid #1a1a1a" : "none" }}>
                      <span style={{ fontSize: "12px", color: "#f87171", textDecoration: "line-through", opacity: 0.8 }}>{m.original}</span>
                      <span style={{ fontSize: "12px", color: "#4ade80" }}>→ {m.correction}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Improved essay */}
            <div>
              <p className="mb-3" style={{ fontSize: "11px", fontWeight: 600, color: "#555", textTransform: "uppercase", letterSpacing: "0.06em" }}>Improved Essay</p>
              <div className="rounded-lg p-4" style={{ background: "#111111", border: "1px solid #222222" }}>
                <p style={{ fontSize: "13px", color: "#ccc", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{result.improved_essay}</p>
              </div>
            </div>

            {/* Band 9 version */}
            <div>
              <p className="mb-3" style={{ fontSize: "11px", fontWeight: 600, color: "#555", textTransform: "uppercase", letterSpacing: "0.06em" }}>Band 9 Version</p>
              <div className="rounded-lg p-4" style={{ background: "#111111", border: "1px solid #4F46E540" }}>
                <p style={{ fontSize: "11px", fontWeight: 600, color: "#6366f1", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Examiner-Level Answer</p>
                <p style={{ fontSize: "13px", color: "#ccc", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{result.band9_version}</p>
              </div>
            </div>

            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              style={{ background: "#111111", border: "1px solid #222222", color: "#888" }}
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Evaluate another essay
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
