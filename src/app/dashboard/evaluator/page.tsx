"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { upsertUser } from "@/lib/supabase-chat";
import {
  Loader2,
  Send,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

type CriterionResult = {
  score: number;
  feedback: string;
};

type Mistake = {
  original: string;
  correction: string;
};

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
  if (score >= 7) return { ring: "border-green-500", text: "text-green-400", bg: "bg-green-500/10", bar: "bg-green-500" };
  if (score >= 5) return { ring: "border-yellow-500", text: "text-yellow-400", bg: "bg-yellow-500/10", bar: "bg-yellow-500" };
  return { ring: "border-red-500", text: "text-red-400", bg: "bg-red-500/10", bar: "bg-red-500" };
}

function BandCircle({ score }: { score: number }) {
  const c = bandColor(score);
  return (
    <div
      className={`w-24 h-24 rounded-full border-4 ${c.ring} ${c.bg} flex flex-col items-center justify-center shrink-0`}
    >
      <span className={`text-3xl font-bold leading-none ${c.text}`}>{score}</span>
      <span className="text-[10px] font-medium text-zinc-500 mt-0.5">Band</span>
    </div>
  );
}

function CriterionCard({ label, score, feedback }: { label: string; score: number; feedback: string }) {
  const c = bandColor(score);
  return (
    <Card className="bg-zinc-900 border-zinc-800/60">
      <CardContent className="pt-4 pb-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-widest leading-tight">
            {label}
          </p>
          <span className={`text-lg font-bold tabular-nums ${c.text}`}>{score}</span>
        </div>
        <div className="h-1.5 rounded-full bg-zinc-800 mb-3">
          <div
            className={`h-1.5 rounded-full ${c.bar}`}
            style={{ width: `${(score / 9) * 100}%` }}
          />
        </div>
        <p className="text-xs text-zinc-400 leading-relaxed">{feedback}</p>
      </CardContent>
    </Card>
  );
}

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
    upsertUser(
      user.id,
      user.primaryEmailAddress?.emailAddress ?? "",
      user.fullName ?? null,
      user.imageUrl ?? null
    )
      .then(setSupabaseUserId)
      .catch(console.error);
  }, [isLoaded, user]);

  const wordCount = essay.trim() === "" ? 0 : essay.trim().split(/\s+/).length;

  async function handleSubmit() {
    if (!essay.trim() || wordCount < 50) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setSaved(false);

    try {
      const res = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ essay, taskType, question }),
      });

      if (!res.ok) throw new Error(`Request failed with status ${res.status}`);

      const data: EvaluationResult = await res.json();
      if (data.overall_band === undefined) throw new Error("Invalid response from evaluator");
      setResult(data);

      if (supabaseUserId) {
        const { error: dbErr } = await supabase.from("essays").insert({
          user_id: supabaseUserId,
          task_type: taskType,
          question: question.trim() || "No question provided",
          content: essay,
          band_score: data.overall_band,
          feedback: JSON.stringify(data),
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
    setEssay("");
    setQuestion("");
    setResult(null);
    setError(null);
    setSaved(false);
  }

  return (
    <div className="p-6 md:p-8 max-w-3xl">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-zinc-100 mb-1">Essay Evaluator</h2>
        <p className="text-sm text-zinc-500">
          Instant IELTS band scores and detailed examiner feedback
        </p>
      </div>

      <AnimatePresence mode="wait">
        {!result ? (
          <motion.div
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {/* Task type */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-zinc-400">Task Type</Label>
              <select
                value={taskType}
                onChange={(e) => setTaskType(e.target.value as "task1" | "task2")}
                className="w-full rounded-md border border-zinc-800/60 bg-zinc-900 px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-zinc-600 transition-colors"
              >
                <option value="task2">Academic Task 2 — Essay</option>
                <option value="task1">Academic Task 1 — Report</option>
              </select>
            </div>

            {/* Optional question */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-zinc-400">
                Question{" "}
                <span className="text-zinc-600 font-normal">(optional — improves task achievement scoring)</span>
              </Label>
              <Textarea
                placeholder="Paste the exam question or task here…"
                className="min-h-[72px] text-sm resize-none bg-zinc-900 border-zinc-800/60 text-zinc-200 placeholder:text-zinc-600 focus-visible:ring-blue-500/50 focus-visible:border-zinc-600"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
              />
            </div>

            {/* Essay */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-zinc-400">Your Essay</Label>
              <Textarea
                placeholder="Paste or type your essay here…"
                className="min-h-[320px] text-sm leading-relaxed resize-none bg-zinc-900 border-zinc-800/60 text-zinc-200 placeholder:text-zinc-600 focus-visible:ring-blue-500/50 focus-visible:border-zinc-600"
                value={essay}
                onChange={(e) => setEssay(e.target.value)}
              />
              <p
                className={`text-xs tabular-nums transition-colors ${
                  wordCount >= 250
                    ? "text-green-500"
                    : wordCount >= 150
                    ? "text-yellow-500"
                    : "text-zinc-600"
                }`}
              >
                {wordCount} words
                {wordCount > 0 && wordCount < 250 && (
                  <span className="text-zinc-600"> — aim for 250+</span>
                )}
              </p>
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-lg border border-red-800/40 bg-red-950/20 p-3">
                <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                <p className="text-xs text-red-400">{error}</p>
              </div>
            )}

            <Button
              onClick={handleSubmit}
              disabled={loading || wordCount < 50}
              className="gap-2 w-full sm:w-auto"
            >
              {loading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Evaluating…
                </>
              ) : (
                <>
                  <Send className="h-3.5 w-3.5" />
                  Evaluate Essay
                </>
              )}
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Overall band */}
            <Card className="bg-zinc-900 border-zinc-800/60">
              <CardContent className="pt-5 pb-5">
                <div className="flex items-center gap-5">
                  <BandCircle score={result.overall_band} />
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-widest mb-1">
                      Overall Band Score
                    </p>
                    <p className="text-2xl font-bold text-zinc-100 tabular-nums">
                      {result.overall_band} / 9
                    </p>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      {result.overall_band >= 7
                        ? "Good — above average IELTS performance"
                        : result.overall_band >= 5
                        ? "Modest — meaningful room for improvement"
                        : "Limited — significant development needed"}
                    </p>
                    {saved && (
                      <p className="flex items-center gap-1 text-[11px] text-green-500 mt-2">
                        <CheckCircle2 className="h-3 w-3" />
                        Saved to your progress
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Four criteria */}
            <div>
              <h3 className="text-xs font-medium text-zinc-600 uppercase tracking-widest mb-3">
                Criteria Breakdown
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <CriterionCard
                  label="Task Achievement"
                  score={result.task_achievement.score}
                  feedback={result.task_achievement.feedback}
                />
                <CriterionCard
                  label="Coherence & Cohesion"
                  score={result.coherence_cohesion.score}
                  feedback={result.coherence_cohesion.feedback}
                />
                <CriterionCard
                  label="Lexical Resource"
                  score={result.lexical_resource.score}
                  feedback={result.lexical_resource.feedback}
                />
                <CriterionCard
                  label="Grammatical Range"
                  score={result.grammatical_range.score}
                  feedback={result.grammatical_range.feedback}
                />
              </div>
            </div>

            {/* Mistakes */}
            {result.mistakes?.length > 0 && (
              <div>
                <h3 className="text-xs font-medium text-zinc-600 uppercase tracking-widest mb-3">
                  Mistakes & Corrections
                </h3>
                <Card className="bg-zinc-900 border-zinc-800/60">
                  <CardContent className="pt-4 pb-4 space-y-3">
                    {result.mistakes.map((m, i) => (
                      <div key={i} className="flex flex-col gap-1 pb-3 border-b border-zinc-800/50 last:pb-0 last:border-0">
                        <span className="text-xs text-red-400 line-through opacity-80 leading-relaxed">
                          {m.original}
                        </span>
                        <span className="text-xs text-green-400 leading-relaxed">
                          → {m.correction}
                        </span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Improved essay */}
            <div>
              <h3 className="text-xs font-medium text-zinc-600 uppercase tracking-widest mb-3">
                Improved Essay
              </h3>
              <Card className="bg-zinc-900 border-zinc-800/60">
                <CardContent className="pt-4 pb-4">
                  <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">
                    {result.improved_essay}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Band 9 version */}
            <div>
              <h3 className="text-xs font-medium text-zinc-600 uppercase tracking-widest mb-3">
                Band 9 Version
              </h3>
              <Card className="bg-zinc-900 border border-blue-800/30">
                <CardHeader className="pb-2 pt-4">
                  <CardTitle className="text-[11px] text-blue-400 font-semibold uppercase tracking-widest">
                    Examiner-Level Answer
                  </CardTitle>
                </CardHeader>
                <CardContent className="pb-4">
                  <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">
                    {result.band9_version}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Reset */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="gap-2 border-zinc-700 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Evaluate another essay
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
