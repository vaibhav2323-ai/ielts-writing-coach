"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Flame, CheckCircle2, XCircle, Loader2, AlertCircle, ArrowLeft, RefreshCw, LayoutGrid,
} from "lucide-react";

// ─── Constants ────────────────────────────────────────────────────────────────

type PracticeType =
  | "task2" | "task1" | "grammar" | "vocabulary" | "linker"
  | "paraphrase" | "error" | "mixed";

type CardDef = { type: PracticeType; title: string; desc: string; emoji: string; color: string };

const CARDS: CardDef[] = [
  { type: "task2",      title: "Task 2 Essay",    desc: "Write an academic essay",       emoji: "✍️",  color: "#4F46E5" },
  { type: "task1",      title: "Task 1 Report",    desc: "Describe charts and data",      emoji: "📊",  color: "#06b6d4" },
  { type: "grammar",    title: "Grammar Quiz",     desc: "Test your grammar rules",       emoji: "✏️",  color: "#8b5cf6" },
  { type: "vocabulary", title: "Vocabulary Quiz",  desc: "Learn academic vocabulary",     emoji: "📚",  color: "#10b981" },
  { type: "linker",     title: "Linker Practice",  desc: "Choose the right connector",    emoji: "🔗",  color: "#f59e0b" },
  { type: "paraphrase", title: "Paraphrasing",     desc: "Upgrade sentences to Band 9",   emoji: "🔄",  color: "#ec4899" },
  { type: "error",      title: "Error Correction", desc: "Find and fix mistakes",          emoji: "🔍",  color: "#f97316" },
  { type: "mixed",      title: "Mixed Practice",   desc: "Random surprise exercise",      emoji: "🎲",  color: "#a78bfa" },
];

const CARD_MAP = Object.fromEntries(CARDS.map((c) => [c.type, c])) as Record<PracticeType, CardDef>;

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
  type: PracticeType; topic: string;
  essay_type?: string; question?: string; tips?: string; band9_outline?: string;
  chart_type?: string; data_hint?: string; model_overview?: string;
  sentence?: string; word?: string; options?: string[]; correct?: string; explanation?: string;
  original?: string; band9_version?: string; key_changes?: string;
  paragraph?: string; corrected_paragraph?: string;
  errors?: { wrong: string; correct: string; type: string; explanation: string }[];
};

type Stats = { streak: number; completedToday: number };

// ─── Option button ─────────────────────────────────────────────────────────────

function OptionBtn({ option, selected, disabled, onClick }: { option: string; selected: boolean; disabled: boolean; onClick: () => void }) {
  const letter = option.charAt(0);
  const text = option.replace(/^[A-D]\)\s*/, "").trim();
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full flex items-start gap-3 px-4 py-3 rounded-lg text-sm text-left transition-all"
      style={{
        background: selected ? "rgba(79,70,229,0.12)" : "#111111",
        border: `1px solid ${selected ? "#4F46E5" : "#222222"}`,
        color: selected ? "#a5b4fc" : disabled ? "#444" : "#ccc",
        cursor: disabled ? "default" : "pointer",
      }}
    >
      <span className="shrink-0 w-5 h-5 rounded-full border border-current flex items-center justify-center text-[10px] font-bold mt-0.5 opacity-70">{letter}</span>
      <span className="flex-1 leading-snug">{text}</span>
    </button>
  );
}

// ─── Option result ─────────────────────────────────────────────────────────────

function OptionResult({ option, selected, isCorrectAnswer }: { option: string; selected: boolean; isCorrectAnswer: boolean }) {
  const letter = option.charAt(0);
  const text = option.replace(/^[A-D]\)\s*/, "").trim();
  let bg = "#111111", border = "#222222", color = "#444";
  if (isCorrectAnswer)      { bg = "rgba(34,197,94,0.08)"; border = "#22c55e40"; color = "#4ade80"; }
  else if (selected)        { bg = "rgba(239,68,68,0.08)"; border = "#ef444440"; color = "#f87171"; }
  return (
    <div className="w-full flex items-start gap-3 px-4 py-3 rounded-lg text-sm" style={{ background: bg, border: `1px solid ${border}`, color }}>
      <span className="shrink-0 w-5 h-5 rounded-full border border-current flex items-center justify-center text-[10px] font-bold mt-0.5 opacity-70">{letter}</span>
      <span className="flex-1 leading-snug">{text}</span>
      {isCorrectAnswer && <CheckCircle2 className="h-4 w-4 text-green-400 shrink-0 mt-0.5" />}
      {selected && !isCorrectAnswer && <XCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />}
    </div>
  );
}

// ─── Stats bar ────────────────────────────────────────────────────────────────

function StatsBar({ stats, loading }: { stats: Stats; loading: boolean }) {
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  return (
    <div className="flex items-center gap-3 mb-7 flex-wrap">
      <p className="text-xs mr-auto" style={{ color: "#555" }}>{today}</p>
      {loading ? (
        <div className="h-7 w-40 rounded-lg animate-pulse" style={{ background: "#1a1a1a" }} />
      ) : (
        <>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg" style={{ background: "#111111", border: "1px solid #222222" }}>
            <Flame className="h-3.5 w-3.5 text-orange-400" />
            <span className="text-sm font-bold text-white">{stats.streak}</span>
            <span className="text-[10px]" style={{ color: "#555" }}>day streak</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg" style={{ background: "#111111", border: "1px solid #222222" }}>
            <CheckCircle2 className="h-3.5 w-3.5 text-green-400" />
            <span className="text-sm font-bold text-white">{stats.completedToday}</span>
            <span className="text-[10px]" style={{ color: "#555" }}>done today</span>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Menu view ────────────────────────────────────────────────────────────────

function MenuView({ onSelect }: { onSelect: (type: PracticeType) => void }) {
  return (
    <motion.div key="menu" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
      <div className="mb-5">
        <h1 className="text-lg font-bold text-white" style={{ letterSpacing: "-0.02em" }}>Daily Practice</h1>
        <p className="text-xs mt-0.5" style={{ color: "#555" }}>Choose a practice type to get started</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {CARDS.map((card) => (
          <button
            key={card.type}
            onClick={() => onSelect(card.type)}
            className="group flex flex-col items-start gap-2.5 rounded-lg p-4 text-left transition-colors"
            style={{ background: "#111111", border: `1px solid #222222` }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = card.color + "60"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#222222"; }}
          >
            <span className="text-2xl leading-none select-none">{card.emoji}</span>
            <div>
              <p className="text-sm font-semibold text-white leading-tight">{card.title}</p>
              <p className="text-[11px] mt-0.5 leading-snug" style={{ color: "#555" }}>{card.desc}</p>
            </div>
          </button>
        ))}
      </div>
    </motion.div>
  );
}

// ─── Topic selector view ──────────────────────────────────────────────────────

function TopicView({ practiceType, onBack, onGenerate }: { practiceType: PracticeType; onBack: () => void; onGenerate: (topic: string) => void }) {
  const [selected, setSelected] = useState<string | null>(null);
  const card = CARD_MAP[practiceType];
  const topics = TOPICS[practiceType];

  return (
    <motion.div key="topic" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }} className="space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="flex items-center gap-1.5 text-xs transition-colors" style={{ color: "#555" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#ccc"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "#555"; }}>
          <ArrowLeft className="h-3.5 w-3.5" /> Back
        </button>
        <span style={{ color: "#333" }}>·</span>
        <div className="flex items-center gap-2">
          <span className="text-lg leading-none select-none">{card.emoji}</span>
          <span className="text-sm font-semibold text-white">{card.title}</span>
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold mb-3 uppercase tracking-wider" style={{ color: "#555" }}>Choose a topic</p>
        <div className="flex flex-wrap gap-2">
          {topics.map((topic) => (
            <button
              key={topic}
              onClick={() => setSelected(topic)}
              className="px-3.5 py-1.5 rounded-full text-sm transition-all"
              style={{
                background: selected === topic ? card.color + "20" : "#111111",
                border: `1px solid ${selected === topic ? card.color : "#222222"}`,
                color: selected === topic ? card.color : "#888",
                fontWeight: selected === topic ? 600 : 400,
              }}
            >
              {topic}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={() => selected && onGenerate(selected)}
        disabled={!selected}
        className="w-full py-3 rounded-lg text-white text-sm font-semibold transition-colors disabled:opacity-35 disabled:cursor-not-allowed"
        style={{ background: "#4F46E5" }}
      >
        Generate Exercise →
      </button>
    </motion.div>
  );
}

// ─── Exercise view ────────────────────────────────────────────────────────────

const TA_STYLE = "w-full rounded-lg px-4 py-3 text-sm text-white resize-none focus:outline-none focus:ring-1 focus:ring-[#4F46E5] transition-colors placeholder:text-[#444]";
const TA_STYLE_OBJ = { background: "#111111", border: "1px solid #222222" };

function ExerciseView({ exercise, onSubmitMCQ, onSubmitWriting }: { exercise: Exercise; onSubmitMCQ: (l: string) => void; onSubmitWriting: (t: string) => void }) {
  const [selectedOption, setSelectedOption] = useState("");
  const [textAnswer, setTextAnswer] = useState("");
  const isMCQ = exercise.type === "grammar" || exercise.type === "vocabulary" || exercise.type === "linker";
  const card = CARD_MAP[exercise.type];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full" style={{ background: card.color + "20", color: card.color, border: `1px solid ${card.color}40` }}>
          {card.title}
        </span>
        {exercise.topic && (
          <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: "#1a1a1a", border: "1px solid #222222", color: "#555" }}>{exercise.topic}</span>
        )}
      </div>

      {/* Grammar MCQ */}
      {exercise.type === "grammar" && (
        <div className="space-y-3">
          <p className="text-sm text-white leading-relaxed">{exercise.question}</p>
          {exercise.sentence && (
            <div className="px-4 py-3 rounded-lg" style={{ background: "#1a1a1a", border: "1px solid #222222" }}>
              <p className="text-sm italic leading-relaxed" style={{ color: "#ccc" }}>{exercise.sentence}</p>
            </div>
          )}
          <div className="space-y-2">
            {exercise.options?.map((opt) => (
              <OptionBtn key={opt} option={opt} selected={selectedOption === opt.charAt(0)} disabled={false} onClick={() => setSelectedOption(opt.charAt(0))} />
            ))}
          </div>
          <button onClick={() => onSubmitMCQ(selectedOption)} disabled={!selectedOption}
            className="w-full py-2.5 rounded-lg text-white text-sm font-medium transition-colors disabled:opacity-40"
            style={{ background: "#8b5cf6" }}>Check Answer</button>
        </div>
      )}

      {/* Vocabulary MCQ */}
      {exercise.type === "vocabulary" && (
        <div className="space-y-3">
          <p className="text-sm text-white leading-relaxed">{exercise.question}</p>
          {exercise.sentence && (
            <div className="px-4 py-3 rounded-lg" style={{ background: "#1a1a1a", border: "1px solid #222222" }}>
              <p className="text-sm leading-relaxed" style={{ color: "#ccc" }}>{exercise.sentence}</p>
              {exercise.word && <p className="text-[10px] mt-2" style={{ color: "#555" }}>Word in focus: <span style={{ color: "#10b981" }} className="font-semibold">{exercise.word}</span></p>}
            </div>
          )}
          <div className="space-y-2">
            {exercise.options?.map((opt) => (
              <OptionBtn key={opt} option={opt} selected={selectedOption === opt.charAt(0)} disabled={false} onClick={() => setSelectedOption(opt.charAt(0))} />
            ))}
          </div>
          <button onClick={() => onSubmitMCQ(selectedOption)} disabled={!selectedOption}
            className="w-full py-2.5 rounded-lg text-white text-sm font-medium transition-colors disabled:opacity-40"
            style={{ background: "#10b981" }}>Check Answer</button>
        </div>
      )}

      {/* Linker fill-in-blank */}
      {exercise.type === "linker" && (
        <div className="space-y-3">
          <div className="px-4 py-4 rounded-lg" style={{ background: "#1a1a1a", border: "1px solid #f59e0b40" }}>
            <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: "#f59e0b" }}>Fill in the blank</p>
            <p className="text-sm leading-relaxed" style={{ color: "#ccc" }}>{String(exercise.sentence ?? "").replace("___", "______")}</p>
          </div>
          <div className="space-y-2">
            {exercise.options?.map((opt) => (
              <OptionBtn key={opt} option={opt} selected={selectedOption === opt.charAt(0)} disabled={false} onClick={() => setSelectedOption(opt.charAt(0))} />
            ))}
          </div>
          <button onClick={() => onSubmitMCQ(selectedOption)} disabled={!selectedOption}
            className="w-full py-2.5 rounded-lg text-white text-sm font-medium transition-colors disabled:opacity-40"
            style={{ background: "#f59e0b" }}>Check Answer</button>
        </div>
      )}

      {/* Task 2 Essay */}
      {exercise.type === "task2" && (
        <div className="space-y-3">
          <div className="px-4 py-4 rounded-lg" style={{ background: "#111111", border: "1px solid #4F46E540" }}>
            {exercise.essay_type && <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: "#4F46E5" }}>{exercise.essay_type}</p>}
            <p className="text-sm leading-relaxed" style={{ color: "#ccc" }}>{exercise.question}</p>
          </div>
          <textarea value={textAnswer} onChange={(e) => setTextAnswer(e.target.value)} placeholder="Write your essay here… (aim for 250+ words)" rows={10} className={TA_STYLE} style={TA_STYLE_OBJ} />
          <div className="flex items-center justify-between">
            <span className="text-[11px]" style={{ color: "#555" }}>{textAnswer.trim() ? textAnswer.trim().split(/\s+/).length : 0} words</span>
            <button onClick={() => onSubmitWriting(textAnswer)} className="px-5 py-2 rounded-lg text-white text-sm font-medium transition-colors" style={{ background: "#4F46E5" }}>Mark as Complete</button>
          </div>
        </div>
      )}

      {/* Task 1 Report */}
      {exercise.type === "task1" && (
        <div className="space-y-3">
          <div className="px-4 py-4 rounded-lg" style={{ background: "#111111", border: "1px solid #06b6d440" }}>
            {exercise.chart_type && <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: "#06b6d4" }}>{exercise.chart_type}</p>}
            <p className="text-sm leading-relaxed" style={{ color: "#ccc" }}>{exercise.question}</p>
            {exercise.data_hint && <p className="text-[11px] mt-3 pt-3 italic" style={{ color: "#555", borderTop: "1px solid #222222" }}>Data context: {exercise.data_hint}</p>}
          </div>
          <textarea value={textAnswer} onChange={(e) => setTextAnswer(e.target.value)} placeholder="Write your report here… (at least 150 words)" rows={8} className={TA_STYLE} style={TA_STYLE_OBJ} />
          <div className="flex items-center justify-between">
            <span className="text-[11px]" style={{ color: "#555" }}>{textAnswer.trim() ? textAnswer.trim().split(/\s+/).length : 0} words</span>
            <button onClick={() => onSubmitWriting(textAnswer)} className="px-5 py-2 rounded-lg text-white text-sm font-medium" style={{ background: "#06b6d4" }}>Mark as Complete</button>
          </div>
        </div>
      )}

      {/* Paraphrase */}
      {exercise.type === "paraphrase" && (
        <div className="space-y-3">
          <div className="px-4 py-4 rounded-lg" style={{ background: "#111111", border: "1px solid #ec489940" }}>
            <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: "#ec4899" }}>Original (Band 5–6)</p>
            <p className="text-sm italic leading-relaxed" style={{ color: "#ccc" }}>&ldquo;{exercise.original}&rdquo;</p>
          </div>
          <textarea value={textAnswer} onChange={(e) => setTextAnswer(e.target.value)} placeholder="Write your Band 9 paraphrase…" rows={4} className={TA_STYLE} style={TA_STYLE_OBJ} />
          <button onClick={() => onSubmitWriting(textAnswer)} className="w-full py-2.5 rounded-lg text-white text-sm font-medium" style={{ background: "#ec4899" }}>Mark as Complete</button>
        </div>
      )}

      {/* Error Correction */}
      {exercise.type === "error" && (
        <div className="space-y-3">
          <div className="px-4 py-4 rounded-lg" style={{ background: "#111111", border: "1px solid #f9731640" }}>
            <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: "#f97316" }}>Find &amp; Correct the Errors</p>
            <p className="text-sm leading-relaxed" style={{ color: "#ccc" }}>{exercise.paragraph}</p>
          </div>
          <textarea value={textAnswer} onChange={(e) => setTextAnswer(e.target.value)} placeholder="Rewrite the paragraph with all errors corrected…" rows={6} className={TA_STYLE} style={TA_STYLE_OBJ} />
          <button onClick={() => onSubmitWriting(textAnswer)} className="w-full py-2.5 rounded-lg text-white text-sm font-medium" style={{ background: "#f97316" }}>Mark as Complete</button>
        </div>
      )}

      {!isMCQ && (
        <button onClick={() => onSubmitWriting("")} className="text-xs transition-colors" style={{ color: "#444" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#888"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "#444"; }}>
          Skip this exercise
        </button>
      )}
    </div>
  );
}

// ─── Result view ──────────────────────────────────────────────────────────────

function ResultView({ exercise, userAnswer, isCorrect, onTryAnother, onBackToMenu }: {
  exercise: Exercise; userAnswer: string; isCorrect: boolean; onTryAnother: () => void; onBackToMenu: () => void;
}) {
  const isMCQ = exercise.type === "grammar" || exercise.type === "vocabulary" || exercise.type === "linker";
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="space-y-4">
      {/* Result header */}
      {isMCQ ? (
        <div className="flex items-center gap-3 px-4 py-3 rounded-lg" style={{
          background: isCorrect ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.08)",
          border: `1px solid ${isCorrect ? "#22c55e40" : "#ef444440"}`,
          color: isCorrect ? "#4ade80" : "#f87171",
        }}>
          {isCorrect ? <CheckCircle2 className="h-5 w-5 shrink-0" /> : <XCircle className="h-5 w-5 shrink-0" />}
          <span className="text-sm font-semibold">{isCorrect ? "Correct! Well done." : "Incorrect — see the right answer below."}</span>
        </div>
      ) : (
        <div className="flex items-center gap-3 px-4 py-3 rounded-lg" style={{ background: "rgba(34,197,94,0.08)", border: "1px solid #22c55e40", color: "#4ade80" }}>
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <span className="text-sm font-semibold">Exercise completed!</span>
        </div>
      )}

      {/* MCQ results */}
      {isMCQ && exercise.options && (
        <div className="space-y-2">
          {exercise.options.map((opt) => (
            <OptionResult key={opt} option={opt} selected={userAnswer === opt.charAt(0)} isCorrectAnswer={exercise.correct === opt.charAt(0)} />
          ))}
        </div>
      )}

      {/* Explanation */}
      {isMCQ && exercise.explanation && (
        <div className="px-4 py-3 rounded-lg" style={{ background: "#111111", border: "1px solid #222222" }}>
          <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: "#555" }}>Explanation</p>
          <p className="text-sm leading-relaxed" style={{ color: "#ccc" }}>{exercise.explanation}</p>
        </div>
      )}

      {/* User response */}
      {!isMCQ && userAnswer && (
        <div className="px-4 py-3 rounded-lg" style={{ background: "#111111", border: "1px solid #222222" }}>
          <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: "#555" }}>Your Response</p>
          <p className="text-xs leading-relaxed whitespace-pre-wrap" style={{ color: "#888" }}>{userAnswer}</p>
        </div>
      )}

      {/* Task 2 model answer */}
      {exercise.type === "task2" && (
        <div className="space-y-3">
          {exercise.tips && (
            <div className="px-4 py-3 rounded-lg" style={{ background: "#111111", border: "1px solid #4F46E540" }}>
              <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: "#4F46E5" }}>Tips for This Question</p>
              <div className="space-y-1.5">
                {exercise.tips.split("|").map((t, i) => (
                  <p key={i} className="text-xs flex gap-2 leading-snug" style={{ color: "#ccc" }}>
                    <span style={{ color: "#4F46E5" }} className="shrink-0">→</span>{t.trim()}
                  </p>
                ))}
              </div>
            </div>
          )}
          {exercise.band9_outline && (
            <div className="px-4 py-3 rounded-lg" style={{ background: "#111111", border: "1px solid #222222" }}>
              <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: "#555" }}>Band 9 Outline</p>
              <div className="space-y-1.5">
                {exercise.band9_outline.split("|").map((part, i) => (
                  <p key={i} className="text-xs flex gap-2 leading-snug" style={{ color: "#ccc" }}>
                    <span className="font-medium shrink-0" style={{ color: "#444" }}>{i + 1}.</span>{part.trim()}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Task 1 model overview */}
      {exercise.type === "task1" && exercise.model_overview && (
        <div className="px-4 py-3 rounded-lg" style={{ background: "#111111", border: "1px solid #06b6d440" }}>
          <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: "#06b6d4" }}>Band 9 Overview Sentence</p>
          <p className="text-sm italic leading-relaxed" style={{ color: "#ccc" }}>&ldquo;{exercise.model_overview}&rdquo;</p>
        </div>
      )}

      {/* Paraphrase model */}
      {exercise.type === "paraphrase" && exercise.band9_version && (
        <div className="space-y-3">
          <div className="px-4 py-3 rounded-lg" style={{ background: "#111111", border: "1px solid #ec489940" }}>
            <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: "#ec4899" }}>Band 9 Version</p>
            <p className="text-sm italic leading-relaxed" style={{ color: "#ccc" }}>&ldquo;{exercise.band9_version}&rdquo;</p>
          </div>
          {exercise.key_changes && (
            <div className="px-4 py-3 rounded-lg" style={{ background: "#111111", border: "1px solid #222222" }}>
              <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: "#555" }}>Key Upgrades</p>
              <p className="text-xs leading-relaxed" style={{ color: "#888" }}>{exercise.key_changes}</p>
            </div>
          )}
        </div>
      )}

      {/* Error correction answer */}
      {exercise.type === "error" && (
        <div className="space-y-3">
          {exercise.corrected_paragraph && (
            <div className="px-4 py-3 rounded-lg" style={{ background: "#111111", border: "1px solid #f9731640" }}>
              <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: "#f97316" }}>Corrected Paragraph</p>
              <p className="text-sm leading-relaxed" style={{ color: "#ccc" }}>{exercise.corrected_paragraph}</p>
            </div>
          )}
          {exercise.errors && exercise.errors.length > 0 && (
            <div className="space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "#555" }}>Errors Explained</p>
              {exercise.errors.map((err, i) => (
                <div key={i} className="px-3 py-2.5 rounded-lg" style={{ background: "#111111", border: "1px solid #222222" }}>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wide" style={{ background: "rgba(239,68,68,0.15)", color: "#f87171" }}>{err.type}</span>
                    <span className="text-xs line-through" style={{ color: "#f87171" }}>{err.wrong}</span>
                    <span className="text-xs" style={{ color: "#444" }}>→</span>
                    <span className="text-xs font-medium" style={{ color: "#4ade80" }}>{err.correct}</span>
                  </div>
                  <p className="text-xs leading-snug" style={{ color: "#555" }}>{err.explanation}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-3 pt-2">
        <button onClick={onTryAnother}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-white text-sm font-semibold transition-colors"
          style={{ background: "#4F46E5" }}>
          <RefreshCw className="h-4 w-4" /> Try Another
        </button>
        <button onClick={onBackToMenu}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors"
          style={{ background: "#111111", border: "1px solid #222222", color: "#888" }}>
          <LayoutGrid className="h-4 w-4" /> Back to Menu
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

  const generateExercise = useCallback(async (type: PracticeType, topic: string) => {
    setGenerating(true); setGenerateError(null); setExercise(null);
    setSubmitted(false); setUserAnswer(""); setIsCorrect(false);
    try {
      const res = await fetch("/api/daily-practice/generate", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, topic }),
      });
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setExercise(json as Exercise);
      if (type === "mixed" && json.type) setActiveType(json.type as PracticeType);
    } catch (err) {
      setGenerateError(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setGenerating(false);
    }
  }, []);

  function handleSelectType(type: PracticeType) {
    setActiveType(type); setActiveTopic(null);
    if (type === "mixed") { setView("exercise"); generateExercise("mixed", "random"); }
    else setView("topic");
  }

  function handleSelectTopic(topic: string) {
    setActiveTopic(topic); setView("exercise"); generateExercise(activeType!, topic);
  }

  function handleSubmitMCQ(selectedLetter: string) {
    const correct = exercise?.correct === selectedLetter;
    setUserAnswer(selectedLetter); setIsCorrect(correct); setSubmitted(true);
    saveCompletion(exercise?.type ?? activeType!, exercise?.topic ?? activeTopic!, selectedLetter, correct);
  }

  function handleSubmitWriting(text: string) {
    setUserAnswer(text); setIsCorrect(true); setSubmitted(true);
    saveCompletion(exercise?.type ?? activeType!, exercise?.topic ?? activeTopic!, text, true);
  }

  async function saveCompletion(type: string, topic: string, answer: string, correct: boolean) {
    try {
      const res = await fetch("/api/daily-practice/submit", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exerciseType: type, topic, userAnswer: answer, isCorrect: correct }),
      });
      const json = await res.json();
      setStats((prev) => ({
        completedToday: json.completedToday ?? prev.completedToday,
        streak: json.streakUpdated ? prev.streak + 1 : prev.streak,
      }));
    } catch { /* non-fatal */ }
  }

  function handleTryAnother() {
    setSubmitted(false); setExercise(null); setGenerateError(null);
    if (activeType === "mixed") generateExercise("mixed", "random");
    else setView("topic");
  }

  function handleBackToMenu() {
    setView("menu"); setActiveType(null); setActiveTopic(null);
    setExercise(null); setSubmitted(false); setGenerateError(null);
  }

  function handleBackFromTopic() { setView("menu"); setActiveType(null); }

  function handleBackFromExercise() {
    if (activeType === "mixed") handleBackToMenu();
    else { setView("topic"); setExercise(null); setSubmitted(false); setGenerateError(null); }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-24">
      <StatsBar stats={stats} loading={statsLoading} />
      <AnimatePresence mode="wait">
        {view === "menu" && <MenuView key="menu" onSelect={handleSelectType} />}
        {view === "topic" && activeType && activeType !== "mixed" && (
          <TopicView key="topic" practiceType={activeType} onBack={handleBackFromTopic} onGenerate={handleSelectTopic} />
        )}
        {view === "exercise" && (
          <motion.div key="exercise" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }} className="space-y-5">
            <div className="flex items-center gap-3">
              <button onClick={handleBackFromExercise} className="flex items-center gap-1.5 text-xs transition-colors" style={{ color: "#555" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#ccc"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "#555"; }}>
                <ArrowLeft className="h-3.5 w-3.5" /> Back
              </button>
              {activeType && (
                <>
                  <span style={{ color: "#333" }}>·</span>
                  <div className="flex items-center gap-2">
                    <span className="text-base leading-none select-none">{CARD_MAP[activeType]?.emoji}</span>
                    <span className="text-sm font-medium text-white">{CARD_MAP[activeType]?.title}</span>
                  </div>
                </>
              )}
            </div>

            {generating && (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="h-8 w-8 animate-spin" style={{ color: "#4F46E5" }} />
                <p className="text-sm" style={{ color: "#888" }}>Generating your exercise…</p>
              </div>
            )}

            {generateError && !generating && (
              <div className="space-y-4">
                <div className="flex items-start gap-3 rounded-lg p-4" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
                  <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-400">Generation failed</p>
                    <p className="text-xs mt-0.5" style={{ color: "#f87171", opacity: 0.7 }}>{generateError}</p>
                  </div>
                </div>
                <button onClick={() => generateExercise(activeType!, activeTopic ?? "random")}
                  className="w-full py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                  style={{ background: "#111111", border: "1px solid #222222", color: "#888" }}>
                  <RefreshCw className="h-4 w-4" /> Try Again
                </button>
              </div>
            )}

            {!generating && !generateError && exercise && (
              submitted ? (
                <ResultView exercise={exercise} userAnswer={userAnswer} isCorrect={isCorrect} onTryAnother={handleTryAnother} onBackToMenu={handleBackToMenu} />
              ) : (
                <ExerciseView exercise={exercise} onSubmitMCQ={handleSubmitMCQ} onSubmitWriting={handleSubmitWriting} />
              )
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
