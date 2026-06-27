"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Flame,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertCircle,
  ArrowLeft,
  RefreshCw,
  LayoutGrid,
} from "lucide-react";

// ─── Constants ────────────────────────────────────────────────────────────────

type PracticeType =
  | "task2"
  | "task1"
  | "grammar"
  | "vocabulary"
  | "linker"
  | "paraphrase"
  | "error"
  | "mixed";

const CARDS: {
  type: PracticeType;
  title: string;
  desc: string;
  icon: string;
  color: string;
  border: string;
  badge: string;
}[] = [
  { type: "task2",      title: "Task 2 Essay",       desc: "Write an academic essay",        icon: "✍️",  color: "bg-blue-500/10",   border: "border-blue-500/30",   badge: "text-blue-300 bg-blue-500/15"   },
  { type: "task1",      title: "Task 1 Report",       desc: "Describe charts and data",       icon: "📊",  color: "bg-cyan-500/10",    border: "border-cyan-500/30",   badge: "text-cyan-300 bg-cyan-500/15"   },
  { type: "grammar",    title: "Grammar Quiz",        desc: "Test your grammar rules",        icon: "✏️",  color: "bg-violet-500/10",  border: "border-violet-500/30", badge: "text-violet-300 bg-violet-500/15"},
  { type: "vocabulary", title: "Vocabulary Quiz",     desc: "Learn academic vocabulary",      icon: "📚",  color: "bg-emerald-500/10", border: "border-emerald-500/30",badge: "text-emerald-300 bg-emerald-500/15"},
  { type: "linker",     title: "Linker Practice",     desc: "Choose the right connector",     icon: "🔗",  color: "bg-orange-500/10",  border: "border-orange-500/30", badge: "text-orange-300 bg-orange-500/15"},
  { type: "paraphrase", title: "Paraphrasing",        desc: "Upgrade sentences to Band 9",    icon: "🔄",  color: "bg-pink-500/10",    border: "border-pink-500/30",   badge: "text-pink-300 bg-pink-500/15"   },
  { type: "error",      title: "Error Correction",    desc: "Find and fix mistakes",          icon: "🔍",  color: "bg-amber-500/10",   border: "border-amber-500/30",  badge: "text-amber-300 bg-amber-500/15" },
  { type: "mixed",      title: "Mixed Practice",      desc: "Random surprise exercise",       icon: "🎲",  color: "bg-indigo-500/10",  border: "border-indigo-500/30", badge: "text-indigo-300 bg-indigo-500/15"},
];

const CARD_MAP = Object.fromEntries(CARDS.map((c) => [c.type, c]));

const TOPICS: Record<PracticeType, string[]> = {
  task2:      ["Technology", "Environment", "Education", "Health", "Society", "Globalisation", "Crime & Justice", "Government Policy", "Transport", "Work & Employment"],
  task1:      ["Bar Chart", "Line Graph", "Pie Chart", "Table", "Map", "Process Diagram"],
  grammar:    ["Tenses", "Articles", "Passive Voice", "Conditionals", "Relative Clauses", "Modal Verbs", "Subject-Verb Agreement", "Prepositions", "Conjunctions", "Parallel Structure"],
  vocabulary: ["Technology", "Environment", "Education", "Health & Medicine", "Business & Economics", "Society & Culture", "Science", "Politics"],
  linker:     ["Contrast & Concession", "Cause & Effect", "Addition", "Example & Illustration", "Conclusion", "Sequence", "Condition", "Comparison"],
  paraphrase: ["Opinion sentences", "Fact & Statistics", "Problem sentences", "Solution sentences", "Advantage/Disadvantage"],
  error:      ["Grammar errors", "Vocabulary & Word Form", "Spelling & Punctuation", "Mixed errors"],
  mixed:      [],
};

// ─── Types ────────────────────────────────────────────────────────────────────

type Exercise = {
  type: PracticeType;
  topic: string;
  // Task 2
  essay_type?: string;
  question?: string;
  tips?: string;
  band9_outline?: string;
  // Task 1
  chart_type?: string;
  data_hint?: string;
  model_overview?: string;
  // MCQ (grammar / vocabulary / linker)
  sentence?: string;
  word?: string;
  options?: string[];
  correct?: string;
  explanation?: string;
  // Paraphrase
  original?: string;
  band9_version?: string;
  key_changes?: string;
  // Error
  paragraph?: string;
  corrected_paragraph?: string;
  errors?: { wrong: string; correct: string; type: string; explanation: string }[];
};

type Stats = { streak: number; completedToday: number };

// ─── Option button (for MCQ selection) ───────────────────────────────────────

function OptionBtn({
  option,
  selected,
  disabled,
  onClick,
}: {
  option: string;
  selected: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  const letter = option.charAt(0);
  const text = option.replace(/^[A-D]\)\s*/, "").trim();

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full flex items-start gap-3 px-4 py-3 rounded-xl border text-sm text-left transition-all duration-150 ${
        selected
          ? "border-blue-500/60 bg-blue-950/30 text-blue-200"
          : disabled
          ? "border-zinc-800/30 text-zinc-600 cursor-default"
          : "border-zinc-800/50 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200 hover:bg-zinc-800/30 cursor-pointer"
      }`}
    >
      <span className="shrink-0 w-5 h-5 rounded-full border border-current flex items-center justify-center text-[10px] font-bold mt-0.5 opacity-70">
        {letter}
      </span>
      <span className="flex-1 leading-snug">{text}</span>
    </button>
  );
}

// ─── Option result (shows correct/incorrect after submit) ─────────────────────

function OptionResult({
  option,
  selected,
  isCorrectAnswer,
}: {
  option: string;
  selected: boolean;
  isCorrectAnswer: boolean;
}) {
  const letter = option.charAt(0);
  const text = option.replace(/^[A-D]\)\s*/, "").trim();

  let cls = "w-full flex items-start gap-3 px-4 py-3 rounded-xl border text-sm ";
  if (isCorrectAnswer) {
    cls += "border-emerald-500/50 bg-emerald-950/25 text-emerald-200";
  } else if (selected) {
    cls += "border-red-500/40 bg-red-950/20 text-red-300";
  } else {
    cls += "border-zinc-800/30 text-zinc-600";
  }

  return (
    <div className={cls}>
      <span className="shrink-0 w-5 h-5 rounded-full border border-current flex items-center justify-center text-[10px] font-bold mt-0.5 opacity-70">
        {letter}
      </span>
      <span className="flex-1 leading-snug">{text}</span>
      {isCorrectAnswer && <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />}
      {selected && !isCorrectAnswer && <XCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />}
    </div>
  );
}

// ─── Stats bar ────────────────────────────────────────────────────────────────

function StatsBar({ stats, loading }: { stats: Stats; loading: boolean }) {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="flex items-center gap-3 mb-7 flex-wrap">
      <p className="text-xs text-zinc-500 mr-auto">{today}</p>
      {loading ? (
        <div className="h-7 w-40 rounded-lg bg-zinc-800 animate-pulse" />
      ) : (
        <>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800/60 border border-zinc-700/40">
            <Flame className="h-3.5 w-3.5 text-orange-400" />
            <span className="text-sm font-bold text-zinc-100">{stats.streak}</span>
            <span className="text-[10px] text-zinc-500">day streak</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800/60 border border-zinc-700/40">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
            <span className="text-sm font-bold text-zinc-100">{stats.completedToday}</span>
            <span className="text-[10px] text-zinc-500">done today</span>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Menu view ────────────────────────────────────────────────────────────────

function MenuView({ onSelect }: { onSelect: (type: PracticeType) => void }) {
  return (
    <motion.div
      key="menu"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
    >
      <div className="mb-5">
        <h1 className="text-lg font-bold text-zinc-100">Daily Practice</h1>
        <p className="text-xs text-zinc-500 mt-0.5">Choose a practice type to get started</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {CARDS.map((card) => (
          <button
            key={card.type}
            onClick={() => onSelect(card.type)}
            className={`group flex flex-col items-start gap-2.5 rounded-2xl border p-4 text-left transition-all duration-200 hover:scale-[1.02] hover:shadow-lg hover:shadow-zinc-900/50 ${card.color} ${card.border}`}
          >
            <span className="text-2xl leading-none select-none">{card.icon}</span>
            <div>
              <p className="text-sm font-semibold text-zinc-100 leading-tight">{card.title}</p>
              <p className="text-[11px] text-zinc-500 mt-0.5 leading-snug">{card.desc}</p>
            </div>
          </button>
        ))}
      </div>
    </motion.div>
  );
}

// ─── Topic selector view ──────────────────────────────────────────────────────

function TopicView({
  practiceType,
  onBack,
  onGenerate,
}: {
  practiceType: PracticeType;
  onBack: () => void;
  onGenerate: (topic: string) => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const card = CARD_MAP[practiceType];
  const topics = TOPICS[practiceType];

  return (
    <motion.div
      key="topic"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
      className="space-y-5"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back
        </button>
        <span className="text-zinc-700">·</span>
        <div className="flex items-center gap-2">
          <span className="text-lg leading-none select-none">{card.icon}</span>
          <span className="text-sm font-semibold text-zinc-200">{card.title}</span>
        </div>
      </div>

      {/* Topic chips */}
      <div>
        <p className="text-xs font-medium text-zinc-500 mb-3 uppercase tracking-wider">
          Choose a topic
        </p>
        <div className="flex flex-wrap gap-2">
          {topics.map((topic) => (
            <button
              key={topic}
              onClick={() => setSelected(topic)}
              className={`px-3.5 py-1.5 rounded-full text-sm border transition-all duration-150 ${
                selected === topic
                  ? `${card.badge} border-current font-medium`
                  : "border-zinc-700/50 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200"
              }`}
            >
              {topic}
            </button>
          ))}
        </div>
      </div>

      {/* Generate button */}
      <button
        onClick={() => selected && onGenerate(selected)}
        disabled={!selected}
        className="w-full py-3 rounded-xl bg-blue-600 text-white text-sm font-semibold transition-colors hover:bg-blue-500 disabled:opacity-35 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        Generate Exercise →
      </button>
    </motion.div>
  );
}

// ─── Exercise view ────────────────────────────────────────────────────────────

function ExerciseView({
  exercise,
  onSubmitMCQ,
  onSubmitWriting,
}: {
  exercise: Exercise;
  onSubmitMCQ: (selectedLetter: string) => void;
  onSubmitWriting: (text: string) => void;
}) {
  const [selectedOption, setSelectedOption] = useState("");
  const [textAnswer, setTextAnswer] = useState("");
  const isMCQ =
    exercise.type === "grammar" ||
    exercise.type === "vocabulary" ||
    exercise.type === "linker";

  return (
    <div className="space-y-4">
      {/* Type + topic badge row */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${CARD_MAP[exercise.type]?.badge}`}>
          {CARD_MAP[exercise.type]?.title}
        </span>
        {exercise.topic && (
          <span className="text-[10px] text-zinc-500 px-2 py-0.5 rounded-full bg-zinc-800/60 border border-zinc-700/40">
            {exercise.topic}
          </span>
        )}
      </div>

      {/* ── Grammar MCQ ── */}
      {exercise.type === "grammar" && (
        <div className="space-y-3">
          <p className="text-sm text-zinc-200 leading-relaxed">{exercise.question}</p>
          {exercise.sentence && (
            <div className="px-4 py-3 rounded-xl bg-zinc-800/50 border border-zinc-700/40">
              <p className="text-sm text-zinc-200 italic leading-relaxed">
                {exercise.sentence}
              </p>
            </div>
          )}
          <div className="space-y-2">
            {exercise.options?.map((opt) => (
              <OptionBtn
                key={opt}
                option={opt}
                selected={selectedOption === opt.charAt(0)}
                disabled={false}
                onClick={() => setSelectedOption(opt.charAt(0))}
              />
            ))}
          </div>
          <button
            onClick={() => onSubmitMCQ(selectedOption)}
            disabled={!selectedOption}
            className="w-full py-2.5 rounded-xl bg-violet-700 hover:bg-violet-600 text-white text-sm font-medium transition-colors disabled:opacity-40"
          >
            Check Answer
          </button>
        </div>
      )}

      {/* ── Vocabulary MCQ ── */}
      {exercise.type === "vocabulary" && (
        <div className="space-y-3">
          <p className="text-sm text-zinc-200 leading-relaxed">{exercise.question}</p>
          {exercise.sentence && (
            <div className="px-4 py-3 rounded-xl bg-zinc-800/50 border border-zinc-700/40">
              <p className="text-sm text-zinc-200 leading-relaxed">
                {exercise.sentence}
              </p>
              {exercise.word && (
                <p className="text-[10px] text-zinc-500 mt-2">
                  Word in focus: <span className="text-emerald-400 font-semibold">{exercise.word}</span>
                </p>
              )}
            </div>
          )}
          <div className="space-y-2">
            {exercise.options?.map((opt) => (
              <OptionBtn
                key={opt}
                option={opt}
                selected={selectedOption === opt.charAt(0)}
                disabled={false}
                onClick={() => setSelectedOption(opt.charAt(0))}
              />
            ))}
          </div>
          <button
            onClick={() => onSubmitMCQ(selectedOption)}
            disabled={!selectedOption}
            className="w-full py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-sm font-medium transition-colors disabled:opacity-40"
          >
            Check Answer
          </button>
        </div>
      )}

      {/* ── Linker fill-in-blank ── */}
      {exercise.type === "linker" && (
        <div className="space-y-3">
          <div className="px-4 py-4 rounded-xl bg-zinc-800/50 border border-zinc-700/40">
            <p className="text-[10px] font-bold text-orange-400 uppercase tracking-wider mb-2">
              Fill in the blank
            </p>
            <p className="text-sm text-zinc-200 leading-relaxed">
              {String(exercise.sentence ?? "").replace("___", "______")}
            </p>
          </div>
          <div className="space-y-2">
            {exercise.options?.map((opt) => (
              <OptionBtn
                key={opt}
                option={opt}
                selected={selectedOption === opt.charAt(0)}
                disabled={false}
                onClick={() => setSelectedOption(opt.charAt(0))}
              />
            ))}
          </div>
          <button
            onClick={() => onSubmitMCQ(selectedOption)}
            disabled={!selectedOption}
            className="w-full py-2.5 rounded-xl bg-orange-700 hover:bg-orange-600 text-white text-sm font-medium transition-colors disabled:opacity-40"
          >
            Check Answer
          </button>
        </div>
      )}

      {/* ── Task 2 Essay ── */}
      {exercise.type === "task2" && (
        <div className="space-y-3">
          <div className="px-4 py-4 rounded-xl bg-blue-950/20 border border-blue-500/25">
            {exercise.essay_type && (
              <p className="text-[10px] font-bold text-blue-400 uppercase tracking-wider mb-2">
                {exercise.essay_type}
              </p>
            )}
            <p className="text-sm text-zinc-200 leading-relaxed">{exercise.question}</p>
          </div>
          <textarea
            value={textAnswer}
            onChange={(e) => setTextAnswer(e.target.value)}
            placeholder="Write your essay here… (aim for 250+ words)"
            rows={10}
            className="w-full rounded-xl bg-zinc-800/40 border border-zinc-700/40 px-4 py-3 text-sm text-zinc-200 placeholder-zinc-600 resize-none focus:outline-none focus:border-blue-500/40 focus:ring-1 focus:ring-blue-500/10"
          />
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-zinc-600">
              {textAnswer.trim() ? textAnswer.trim().split(/\s+/).length : 0} words
            </span>
            <button
              onClick={() => onSubmitWriting(textAnswer)}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors"
            >
              Mark as Complete
            </button>
          </div>
        </div>
      )}

      {/* ── Task 1 Report ── */}
      {exercise.type === "task1" && (
        <div className="space-y-3">
          <div className="px-4 py-4 rounded-xl bg-cyan-950/15 border border-cyan-500/25">
            {exercise.chart_type && (
              <p className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider mb-2">
                {exercise.chart_type}
              </p>
            )}
            <p className="text-sm text-zinc-200 leading-relaxed">{exercise.question}</p>
            {exercise.data_hint && (
              <p className="text-[11px] text-zinc-500 mt-3 pt-3 border-t border-zinc-700/30 italic">
                Data context: {exercise.data_hint}
              </p>
            )}
          </div>
          <textarea
            value={textAnswer}
            onChange={(e) => setTextAnswer(e.target.value)}
            placeholder="Write your report here… (at least 150 words)"
            rows={8}
            className="w-full rounded-xl bg-zinc-800/40 border border-zinc-700/40 px-4 py-3 text-sm text-zinc-200 placeholder-zinc-600 resize-none focus:outline-none focus:border-cyan-500/40 focus:ring-1 focus:ring-cyan-500/10"
          />
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-zinc-600">
              {textAnswer.trim() ? textAnswer.trim().split(/\s+/).length : 0} words
            </span>
            <button
              onClick={() => onSubmitWriting(textAnswer)}
              className="px-5 py-2 rounded-xl bg-cyan-700 hover:bg-cyan-600 text-white text-sm font-medium transition-colors"
            >
              Mark as Complete
            </button>
          </div>
        </div>
      )}

      {/* ── Paraphrase ── */}
      {exercise.type === "paraphrase" && (
        <div className="space-y-3">
          <div className="px-4 py-4 rounded-xl bg-pink-950/15 border border-pink-500/25">
            <p className="text-[10px] font-bold text-pink-400 uppercase tracking-wider mb-2">
              Original (Band 5–6)
            </p>
            <p className="text-sm text-zinc-200 italic leading-relaxed">
              &ldquo;{exercise.original}&rdquo;
            </p>
          </div>
          <textarea
            value={textAnswer}
            onChange={(e) => setTextAnswer(e.target.value)}
            placeholder="Write your Band 9 paraphrase…"
            rows={4}
            className="w-full rounded-xl bg-zinc-800/40 border border-zinc-700/40 px-4 py-3 text-sm text-zinc-200 placeholder-zinc-600 resize-none focus:outline-none focus:border-pink-500/40 focus:ring-1 focus:ring-pink-500/10"
          />
          <button
            onClick={() => onSubmitWriting(textAnswer)}
            className="w-full py-2.5 rounded-xl bg-pink-700 hover:bg-pink-600 text-white text-sm font-medium transition-colors"
          >
            Mark as Complete
          </button>
        </div>
      )}

      {/* ── Error Correction ── */}
      {exercise.type === "error" && (
        <div className="space-y-3">
          <div className="px-4 py-4 rounded-xl bg-amber-950/15 border border-amber-500/25">
            <p className="text-[10px] font-bold text-amber-400 uppercase tracking-wider mb-2">
              Find &amp; Correct the Errors
            </p>
            <p className="text-sm text-zinc-200 leading-relaxed">{exercise.paragraph}</p>
          </div>
          <textarea
            value={textAnswer}
            onChange={(e) => setTextAnswer(e.target.value)}
            placeholder="Rewrite the paragraph with all errors corrected…"
            rows={6}
            className="w-full rounded-xl bg-zinc-800/40 border border-zinc-700/40 px-4 py-3 text-sm text-zinc-200 placeholder-zinc-600 resize-none focus:outline-none focus:border-amber-500/40 focus:ring-1 focus:ring-amber-500/10"
          />
          <button
            onClick={() => onSubmitWriting(textAnswer)}
            className="w-full py-2.5 rounded-xl bg-amber-700 hover:bg-amber-600 text-white text-sm font-medium transition-colors"
          >
            Mark as Complete
          </button>
        </div>
      )}

      {/* Skip for writing exercises */}
      {!isMCQ && (
        <button
          onClick={() => onSubmitWriting("")}
          className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
        >
          Skip this exercise
        </button>
      )}
    </div>
  );
}

// ─── Result view ──────────────────────────────────────────────────────────────

function ResultView({
  exercise,
  userAnswer,
  isCorrect,
  onTryAnother,
  onBackToMenu,
}: {
  exercise: Exercise;
  userAnswer: string;
  isCorrect: boolean;
  onTryAnother: () => void;
  onBackToMenu: () => void;
}) {
  const isMCQ =
    exercise.type === "grammar" ||
    exercise.type === "vocabulary" ||
    exercise.type === "linker";

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-4"
    >
      {/* Result header */}
      {isMCQ ? (
        <div
          className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${
            isCorrect
              ? "bg-emerald-950/25 border-emerald-500/30 text-emerald-300"
              : "bg-red-950/20 border-red-500/25 text-red-300"
          }`}
        >
          {isCorrect ? (
            <CheckCircle2 className="h-5 w-5 shrink-0" />
          ) : (
            <XCircle className="h-5 w-5 shrink-0" />
          )}
          <span className="text-sm font-semibold">
            {isCorrect ? "Correct! Well done." : "Incorrect — see the right answer below."}
          </span>
        </div>
      ) : (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl border bg-emerald-950/25 border-emerald-500/30 text-emerald-300">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <span className="text-sm font-semibold">Exercise completed!</span>
        </div>
      )}

      {/* MCQ results */}
      {isMCQ && exercise.options && (
        <div className="space-y-2">
          {exercise.options.map((opt) => (
            <OptionResult
              key={opt}
              option={opt}
              selected={userAnswer === opt.charAt(0)}
              isCorrectAnswer={exercise.correct === opt.charAt(0)}
            />
          ))}
        </div>
      )}

      {/* Explanation (MCQ) */}
      {isMCQ && exercise.explanation && (
        <div className="px-4 py-3 rounded-xl bg-zinc-800/50 border border-zinc-700/30">
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
            Explanation
          </p>
          <p className="text-sm text-zinc-300 leading-relaxed">{exercise.explanation}</p>
        </div>
      )}

      {/* Writing result — user's response */}
      {!isMCQ && userAnswer && (
        <div className="px-4 py-3 rounded-xl bg-zinc-800/40 border border-zinc-700/30">
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
            Your Response
          </p>
          <p className="text-xs text-zinc-400 leading-relaxed whitespace-pre-wrap">{userAnswer}</p>
        </div>
      )}

      {/* Task 2 model answer */}
      {exercise.type === "task2" && (
        <div className="space-y-3">
          {exercise.tips && (
            <div className="px-4 py-3 rounded-xl bg-blue-950/20 border border-blue-500/20">
              <p className="text-[10px] font-bold text-blue-400 uppercase tracking-wider mb-2">Tips for This Question</p>
              <div className="space-y-1.5">
                {exercise.tips.split("|").map((t, i) => (
                  <p key={i} className="text-xs text-zinc-300 flex gap-2 leading-snug">
                    <span className="text-blue-400 shrink-0">→</span>
                    {t.trim()}
                  </p>
                ))}
              </div>
            </div>
          )}
          {exercise.band9_outline && (
            <div className="px-4 py-3 rounded-xl bg-zinc-800/40 border border-zinc-700/30">
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2">Band 9 Outline</p>
              <div className="space-y-1.5">
                {exercise.band9_outline.split("|").map((part, i) => (
                  <p key={i} className="text-xs text-zinc-300 flex gap-2 leading-snug">
                    <span className="text-zinc-600 font-medium shrink-0">{i + 1}.</span>
                    {part.trim()}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Task 1 model overview */}
      {exercise.type === "task1" && exercise.model_overview && (
        <div className="px-4 py-3 rounded-xl bg-cyan-950/20 border border-cyan-500/20">
          <p className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider mb-1.5">Band 9 Overview Sentence</p>
          <p className="text-sm text-zinc-200 italic leading-relaxed">
            &ldquo;{exercise.model_overview}&rdquo;
          </p>
        </div>
      )}

      {/* Paraphrase model answer */}
      {exercise.type === "paraphrase" && exercise.band9_version && (
        <div className="space-y-3">
          <div className="px-4 py-3 rounded-xl bg-pink-950/15 border border-pink-500/20">
            <p className="text-[10px] font-bold text-pink-400 uppercase tracking-wider mb-1.5">Band 9 Version</p>
            <p className="text-sm text-zinc-200 italic leading-relaxed">
              &ldquo;{exercise.band9_version}&rdquo;
            </p>
          </div>
          {exercise.key_changes && (
            <div className="px-4 py-3 rounded-xl bg-zinc-800/40 border border-zinc-700/30">
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Key Upgrades</p>
              <p className="text-xs text-zinc-400 leading-relaxed">{exercise.key_changes}</p>
            </div>
          )}
        </div>
      )}

      {/* Error correction answer */}
      {exercise.type === "error" && (
        <div className="space-y-3">
          {exercise.corrected_paragraph && (
            <div className="px-4 py-3 rounded-xl bg-amber-950/15 border border-amber-500/20">
              <p className="text-[10px] font-bold text-amber-400 uppercase tracking-wider mb-1.5">Corrected Paragraph</p>
              <p className="text-sm text-zinc-200 leading-relaxed">{exercise.corrected_paragraph}</p>
            </div>
          )}
          {exercise.errors && exercise.errors.length > 0 && (
            <div className="space-y-2">
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Errors Explained</p>
              {exercise.errors.map((err, i) => (
                <div key={i} className="px-3 py-2.5 rounded-xl bg-zinc-800/40 border border-zinc-700/25">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-red-500/15 text-red-300 font-bold uppercase tracking-wide">
                      {err.type}
                    </span>
                    <span className="text-xs text-red-400 line-through">{err.wrong}</span>
                    <span className="text-zinc-700 text-xs">→</span>
                    <span className="text-xs text-emerald-400 font-medium">{err.correct}</span>
                  </div>
                  <p className="text-xs text-zinc-500 leading-snug">{err.explanation}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-3 pt-2">
        <button
          onClick={onTryAnother}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Try Another
        </button>
        <button
          onClick={onBackToMenu}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-sm font-medium transition-colors border border-zinc-700/50"
        >
          <LayoutGrid className="h-4 w-4" />
          Back to Menu
        </button>
      </div>
    </motion.div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

type PageView = "menu" | "topic" | "exercise";

export default function PracticePage() {
  const [view, setView] = useState<PageView>("menu");
  const [activeType, setActiveType] = useState<PracticeType | null>(null);
  const [activeTopic, setActiveTopic] = useState<string | null>(null);
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [userAnswer, setUserAnswer] = useState("");
  const [isCorrect, setIsCorrect] = useState(false);
  const [stats, setStats] = useState<Stats>({ streak: 0, completedToday: 0 });
  const [statsLoading, setStatsLoading] = useState(true);

  // Load stats on mount
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/daily-practice");
        if (res.ok) {
          const data = await res.json();
          setStats({ streak: data.streak ?? 0, completedToday: data.completedToday ?? 0 });
        }
      } catch { /* non-fatal */ }
      finally { setStatsLoading(false); }
    })();
  }, []);

  // Generate a single exercise
  const generateExercise = useCallback(async (type: PracticeType, topic: string) => {
    setGenerating(true);
    setGenerateError(null);
    setExercise(null);
    setSubmitted(false);
    setUserAnswer("");
    setIsCorrect(false);

    try {
      const res = await fetch("/api/daily-practice/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, topic }),
      });
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setExercise(json as Exercise);
      // For mixed, update the active type so the UI renders correctly
      if (type === "mixed" && json.type) {
        setActiveType(json.type as PracticeType);
      }
    } catch (err) {
      setGenerateError(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setGenerating(false);
    }
  }, []);

  // Step 1: user clicks a menu card
  function handleSelectType(type: PracticeType) {
    setActiveType(type);
    setActiveTopic(null);
    if (type === "mixed") {
      setView("exercise");
      generateExercise("mixed", "random");
    } else {
      setView("topic");
    }
  }

  // Step 2: user selects topic + clicks generate
  function handleSelectTopic(topic: string) {
    setActiveTopic(topic);
    setView("exercise");
    generateExercise(activeType!, topic);
  }

  // Step 3a: user submits MCQ
  function handleSubmitMCQ(selectedLetter: string) {
    const correct = exercise?.correct === selectedLetter;
    setUserAnswer(selectedLetter);
    setIsCorrect(correct);
    setSubmitted(true);
    saveCompletion(exercise?.type ?? activeType!, exercise?.topic ?? activeTopic!, selectedLetter, correct);
  }

  // Step 3b: user submits writing
  function handleSubmitWriting(text: string) {
    setUserAnswer(text);
    setIsCorrect(true);
    setSubmitted(true);
    saveCompletion(exercise?.type ?? activeType!, exercise?.topic ?? activeTopic!, text, true);
  }

  // Save completion to Supabase (non-blocking)
  async function saveCompletion(type: string, topic: string, answer: string, correct: boolean) {
    try {
      const res = await fetch("/api/daily-practice/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exerciseType: type,
          topic,
          userAnswer: answer,
          isCorrect: correct,
        }),
      });
      const json = await res.json();
      setStats((prev) => ({
        completedToday: json.completedToday ?? prev.completedToday,
        streak: json.streakUpdated ? prev.streak + 1 : prev.streak,
      }));
    } catch { /* non-fatal */ }
  }

  // "Try Another" — go back to topic selector for same type
  function handleTryAnother() {
    setSubmitted(false);
    setExercise(null);
    setGenerateError(null);
    if (activeType === "mixed") {
      generateExercise("mixed", "random");
    } else {
      setView("topic");
    }
  }

  // "Back to Menu"
  function handleBackToMenu() {
    setView("menu");
    setActiveType(null);
    setActiveTopic(null);
    setExercise(null);
    setSubmitted(false);
    setGenerateError(null);
  }

  // Back from topic to menu
  function handleBackFromTopic() {
    setView("menu");
    setActiveType(null);
  }

  // Back from exercise to topic (or menu for mixed)
  function handleBackFromExercise() {
    if (activeType === "mixed") {
      handleBackToMenu();
    } else {
      setView("topic");
      setExercise(null);
      setSubmitted(false);
      setGenerateError(null);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-24">
      <StatsBar stats={stats} loading={statsLoading} />

      <AnimatePresence mode="wait">
        {/* ── Menu ── */}
        {view === "menu" && (
          <MenuView key="menu" onSelect={handleSelectType} />
        )}

        {/* ── Topic selector ── */}
        {view === "topic" && activeType && activeType !== "mixed" && (
          <TopicView
            key="topic"
            practiceType={activeType}
            onBack={handleBackFromTopic}
            onGenerate={handleSelectTopic}
          />
        )}

        {/* ── Exercise ── */}
        {view === "exercise" && (
          <motion.div
            key="exercise"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-5"
          >
            {/* Back button header */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleBackFromExercise}
                className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back
              </button>
              {activeType && (
                <>
                  <span className="text-zinc-700">·</span>
                  <div className="flex items-center gap-2">
                    <span className="text-base leading-none select-none">
                      {CARD_MAP[activeType]?.icon}
                    </span>
                    <span className="text-sm font-medium text-zinc-300">
                      {CARD_MAP[activeType]?.title}
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Loading */}
            {generating && (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
                <p className="text-sm text-zinc-400">Generating your exercise…</p>
              </div>
            )}

            {/* Error */}
            {generateError && !generating && (
              <div className="space-y-4">
                <div className="flex items-start gap-3 rounded-xl border border-red-800/40 bg-red-950/15 p-4">
                  <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-400">Generation failed</p>
                    <p className="text-xs text-red-400/70 mt-0.5">{generateError}</p>
                  </div>
                </div>
                <button
                  onClick={() => generateExercise(activeType!, activeTopic ?? "random")}
                  className="w-full py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-sm font-medium transition-colors border border-zinc-700/50 flex items-center justify-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Try Again
                </button>
              </div>
            )}

            {/* Exercise or Result */}
            {!generating && !generateError && exercise && (
              submitted ? (
                <ResultView
                  exercise={exercise}
                  userAnswer={userAnswer}
                  isCorrect={isCorrect}
                  onTryAnother={handleTryAnother}
                  onBackToMenu={handleBackToMenu}
                />
              ) : (
                <ExerciseView
                  exercise={exercise}
                  onSubmitMCQ={handleSubmitMCQ}
                  onSubmitWriting={handleSubmitWriting}
                />
              )
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
