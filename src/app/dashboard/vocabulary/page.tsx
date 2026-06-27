"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2, Sparkles, BookOpen, Search, Brain, Layers,
  AlertCircle, ChevronLeft, ChevronRight, RotateCcw, X, Check,
  BookMarked, ArrowRight,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type VocabWord = {
  id: string; word: string; meaning: string; part_of_speech: string;
  synonyms: string[]; antonyms: string[]; example_sentence: string;
  topic: string; band_level: string;
};

type LookedUpWord = {
  word: string; part_of_speech: string; meaning: string; band_level: string;
  topic: string; synonyms: string[]; antonyms: string[]; example_sentence: string;
  collocations: string[]; ielts_usage: string; common_mistakes: string;
};

// ─── Constants ────────────────────────────────────────────────────────────────

const TOPICS = [
  "Technology", "Education", "Environment", "Health", "Government", "Crime", "Business",
  "Transport", "Science", "Culture", "Media", "Globalisation", "Urbanisation", "Tourism",
  "Family", "Children", "Housing", "Animals", "Food", "Water", "Energy", "Population",
  "Poverty", "Gender Equality", "Sport", "Art", "History", "Language", "Space", "Psychology",
];

const BAND_LEVELS = ["6", "7", "8", "9"];

const POS_COLOR: Record<string, { bg: string; color: string; border: string }> = {
  noun:      { bg: "rgba(59,130,246,0.12)",  color: "#60a5fa",  border: "#3b82f630" },
  verb:      { bg: "rgba(34,197,94,0.12)",   color: "#4ade80",  border: "#22c55e30" },
  adjective: { bg: "rgba(245,158,11,0.12)",  color: "#fbbf24",  border: "#f59e0b30" },
  adverb:    { bg: "rgba(139,92,246,0.12)",  color: "#a78bfa",  border: "#8b5cf630" },
  phrase:    { bg: "rgba(6,182,212,0.12)",   color: "#22d3ee",  border: "#06b6d430" },
};

const BAND_COLOR: Record<string, { bg: string; color: string }> = {
  "6": { bg: "#1a1a1a",                 color: "#666" },
  "7": { bg: "rgba(59,130,246,0.12)",   color: "#60a5fa" },
  "8": { bg: "rgba(139,92,246,0.12)",   color: "#a78bfa" },
  "9": { bg: "rgba(245,158,11,0.12)",   color: "#fbbf24" },
};

function shuffle<T>(arr: T[]): T[] { return [...arr].sort(() => Math.random() - 0.5); }

// ─── Badges ───────────────────────────────────────────────────────────────────

function PosBadge({ pos }: { pos: string }) {
  const s = POS_COLOR[pos.toLowerCase()] ?? { bg: "#1a1a1a", color: "#666", border: "#2a2a2a" };
  return (
    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border" style={{ background: s.bg, color: s.color, borderColor: s.border }}>{pos}</span>
  );
}

function BandBadge({ band }: { band: string }) {
  const s = BAND_COLOR[band] ?? { bg: "#1a1a1a", color: "#666" };
  return (
    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: s.bg, color: s.color }}>Band {band}</span>
  );
}

// ─── Lookup Card ──────────────────────────────────────────────────────────────

function LookupCard({ result, onDismiss }: { result: LookedUpWord; onDismiss: () => void }) {
  return (
    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
      <div className="rounded-lg p-5 mb-6 relative" style={{ background: "#111111", border: "2px solid #4F46E540" }}>
        <button onClick={onDismiss} className="absolute top-3 right-3 transition-colors" style={{ color: "#555" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#ccc"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "#555"; }}>
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-start gap-3 mb-4">
          <div className="p-2 rounded-lg shrink-0" style={{ background: "rgba(79,70,229,0.1)" }}>
            <BookMarked className="h-4 w-4" style={{ color: "#4F46E5" }} />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h3 className="text-xl font-bold text-white">{result.word}</h3>
              <PosBadge pos={result.part_of_speech} />
              <BandBadge band={result.band_level} />
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "#1a1a1a", color: "#555" }}>{result.topic}</span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: "#ccc" }}>{result.meaning}</p>
          </div>
        </div>

        <div className="rounded-lg px-4 py-3 mb-4" style={{ background: "rgba(79,70,229,0.06)", border: "1px solid #4F46E530" }}>
          <p className="text-[10px] font-semibold uppercase tracking-widest mb-1" style={{ color: "#6366f1" }}>Band 9 Example</p>
          <p className="text-sm italic leading-relaxed" style={{ color: "#ccc" }}>&ldquo;{result.example_sentence}&rdquo;</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          {result.synonyms?.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: "#555" }}>Synonyms</p>
              <div className="flex flex-wrap gap-1.5">
                {result.synonyms.map((s, i) => (
                  <span key={i} className="text-xs px-2 py-1 rounded-md" style={{ background: "rgba(34,197,94,0.1)", color: "#4ade80", border: "1px solid rgba(34,197,94,0.2)" }}>{s}</span>
                ))}
              </div>
            </div>
          )}
          {result.antonyms?.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: "#555" }}>Antonyms</p>
              <div className="flex flex-wrap gap-1.5">
                {result.antonyms.map((s, i) => (
                  <span key={i} className="text-xs px-2 py-1 rounded-md" style={{ background: "rgba(239,68,68,0.1)", color: "#f87171", border: "1px solid rgba(239,68,68,0.2)" }}>{s}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        {result.collocations?.length > 0 && (
          <div className="mb-4">
            <p className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: "#555" }}>Collocations</p>
            <div className="flex flex-wrap gap-1.5">
              {result.collocations.map((c, i) => (
                <span key={i} className="text-xs px-2.5 py-1 rounded-md font-medium" style={{ background: "rgba(139,92,246,0.1)", color: "#a78bfa", border: "1px solid rgba(139,92,246,0.2)" }}>{c}</span>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-lg px-4 py-3" style={{ background: "#1a1a1a" }}>
            <div className="flex items-center gap-1.5 mb-1.5">
              <ArrowRight className="h-3 w-3" style={{ color: "#4F46E5" }} />
              <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "#4F46E5" }}>How to use in IELTS</p>
            </div>
            <p className="text-xs leading-relaxed" style={{ color: "#888" }}>{result.ielts_usage}</p>
          </div>
          <div className="rounded-lg px-4 py-3" style={{ background: "#1a1a1a" }}>
            <div className="flex items-center gap-1.5 mb-1.5">
              <AlertCircle className="h-3 w-3" style={{ color: "#f59e0b" }} />
              <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "#f59e0b" }}>Common Mistakes</p>
            </div>
            <p className="text-xs leading-relaxed" style={{ color: "#888" }}>{result.common_mistakes}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── SelectField ──────────────────────────────────────────────────────────────

function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <div className="space-y-1.5">
      <label style={{ fontSize: "12px", fontWeight: 500, color: "#888" }}>{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#4F46E5] transition-colors"
        style={{ background: "#111111", borderColor: "#222222", colorScheme: "dark" }}>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

// ─── Word Card ────────────────────────────────────────────────────────────────

function WordCard({ word }: { word: VocabWord }) {
  return (
    <div className="rounded-lg p-4 flex flex-col gap-3 h-full" style={{ background: "#111111", border: "1px solid #222222" }}>
      <div>
        <h3 className="text-base font-bold text-white leading-tight mb-2">{word.word}</h3>
        <div className="flex flex-wrap gap-1.5">
          <PosBadge pos={word.part_of_speech} />
          <BandBadge band={word.band_level} />
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "#1a1a1a", color: "#555" }}>{word.topic}</span>
        </div>
      </div>
      <p className="text-sm leading-relaxed" style={{ color: "#ccc" }}>{word.meaning}</p>
      <p className="text-xs italic leading-relaxed pl-3" style={{ color: "#666", borderLeft: "2px solid #222222" }}>&ldquo;{word.example_sentence}&rdquo;</p>
      {word.synonyms?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 items-center">
          <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "#444" }}>Syn:</span>
          {word.synonyms.map((s, i) => (
            <span key={i} className="text-[11px] px-1.5 py-0.5 rounded" style={{ background: "rgba(34,197,94,0.1)", color: "#4ade80" }}>{s}</span>
          ))}
        </div>
      )}
      {word.antonyms?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 items-center">
          <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "#444" }}>Ant:</span>
          {word.antonyms.map((s, i) => (
            <span key={i} className="text-[11px] px-1.5 py-0.5 rounded" style={{ background: "rgba(239,68,68,0.1)", color: "#f87171" }}>{s}</span>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Flashcard mode ───────────────────────────────────────────────────────────

function FlipCard({ word, flipped, onFlip }: { word: VocabWord; flipped: boolean; onFlip: () => void }) {
  return (
    <div onClick={onFlip} style={{ perspective: "1200px" }} className="w-full cursor-pointer select-none">
      <motion.div animate={{ rotateY: flipped ? 180 : 0 }} transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        style={{ transformStyle: "preserve-3d", position: "relative", minHeight: "300px" }}>
        <div style={{ backfaceVisibility: "hidden" }}
          className="absolute inset-0 rounded-lg flex flex-col items-center justify-center gap-4 p-8">
          <div className="absolute inset-0 rounded-lg" style={{ background: "#111111", border: "1px solid #222222" }} />
          <div className="relative z-10 flex flex-col items-center gap-4">
            <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "#444" }}>Tap to reveal</p>
            <h2 className="text-4xl font-bold text-white text-center">{word.word}</h2>
            <div className="flex gap-2">
              <PosBadge pos={word.part_of_speech} />
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "#1a1a1a", color: "#555" }}>{word.topic}</span>
            </div>
          </div>
        </div>
        <div style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
          className="absolute inset-0 rounded-lg flex flex-col justify-center gap-4 p-8">
          <div className="absolute inset-0 rounded-lg" style={{ background: "#111111", border: "1px solid #4F46E540" }} />
          <div className="relative z-10 flex flex-col gap-4">
            <h2 className="text-xl font-bold text-white">{word.word}</h2>
            <p className="text-sm leading-relaxed" style={{ color: "#ccc" }}>{word.meaning}</p>
            <p className="text-xs italic leading-relaxed pl-3" style={{ color: "#666", borderLeft: "2px solid #222222" }}>&ldquo;{word.example_sentence}&rdquo;</p>
            {word.synonyms?.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "#444" }}>Syn:</span>
                {word.synonyms.map((s, i) => <span key={i} className="text-[11px] px-1.5 py-0.5 rounded" style={{ background: "rgba(34,197,94,0.1)", color: "#4ade80" }}>{s}</span>)}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function FlashcardMode({ words, onBack }: { words: VocabWord[]; onBack: () => void }) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const progress = ((index + 1) / words.length) * 100;

  function go(dir: 1 | -1) {
    setFlipped(false);
    setTimeout(() => setIndex((i) => Math.min(Math.max(0, i + dir), words.length - 1)), 80);
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
          style={{ background: "#111111", border: "1px solid #222222", color: "#888" }}>
          <ChevronLeft className="h-3.5 w-3.5" /> Library
        </button>
        <span className="text-xs tabular-nums" style={{ color: "#555" }}>{index + 1} / {words.length}</span>
      </div>
      <div className="h-1.5 rounded-full" style={{ background: "#1a1a1a" }}>
        <motion.div className="h-1.5 rounded-full" style={{ background: "#4F46E5" }} animate={{ width: `${progress}%` }} transition={{ duration: 0.3 }} />
      </div>
      <FlipCard word={words[index]} flipped={flipped} onFlip={() => setFlipped((f) => !f)} />
      <div className="flex justify-center gap-3">
        <button onClick={() => go(-1)} disabled={index === 0} className="p-2 rounded-lg transition-colors disabled:opacity-30" style={{ background: "#111111", border: "1px solid #222222", color: "#888" }}>
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button onClick={() => setFlipped((f) => !f)} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors" style={{ background: "#111111", border: "1px solid #222222", color: "#888" }}>
          <RotateCcw className="h-3.5 w-3.5" /> Flip
        </button>
        <button onClick={() => go(1)} disabled={index === words.length - 1} className="p-2 rounded-lg transition-colors disabled:opacity-30" style={{ background: "#111111", border: "1px solid #222222", color: "#888" }}>
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// ─── Quiz mode ────────────────────────────────────────────────────────────────

function QuizMode({ words, onBack }: { words: VocabWord[]; onBack: () => void }) {
  const [quizSet] = useState(() => shuffle([...words]).slice(0, Math.min(10, words.length)));
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [options, setOptions] = useState<string[]>([]);
  const question = quizSet[currentQ];

  useEffect(() => {
    if (!question) return;
    const wrong = shuffle(words.filter((w) => w.id !== question.id)).slice(0, 3).map((w) => w.meaning);
    setOptions(shuffle([question.meaning, ...wrong]));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQ]);

  function handleSelect(opt: string) {
    if (selected !== null) return;
    setSelected(opt);
    if (opt === question.meaning) setScore((s) => s + 1);
    setTimeout(() => {
      if (currentQ + 1 >= quizSet.length) setFinished(true);
      else { setCurrentQ((q) => q + 1); setSelected(null); }
    }, 1100);
  }

  function restart() { setCurrentQ(0); setSelected(null); setScore(0); setFinished(false); }

  if (finished) {
    const pct = Math.round((score / quizSet.length) * 100);
    const color = pct >= 80 ? "#22c55e" : pct >= 50 ? "#f59e0b" : "#ef4444";
    return (
      <div className="space-y-5">
        <button onClick={onBack} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium" style={{ background: "#111111", border: "1px solid #222222", color: "#888" }}>
          <ChevronLeft className="h-3.5 w-3.5" /> Library
        </button>
        <div className="rounded-lg p-10 flex flex-col items-center gap-4" style={{ background: "#111111", border: "1px solid #222222" }}>
          <div className="w-24 h-24 rounded-full flex flex-col items-center justify-center" style={{ border: `3px solid ${color}`, background: color + "15" }}>
            <span className="text-3xl font-bold leading-none" style={{ color }}>{pct}%</span>
          </div>
          <p className="text-lg font-semibold text-white">{score} / {quizSet.length} correct</p>
          <p className="text-sm text-center" style={{ color: "#888" }}>
            {pct >= 80 ? "Excellent! You know these words well." : pct >= 50 ? "Good effort — keep practising." : "Keep studying, you'll get there!"}
          </p>
          <div className="flex gap-2 mt-2">
            <button onClick={restart} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white" style={{ background: "#4F46E5" }}>
              <RotateCcw className="h-3.5 w-3.5" /> Try Again
            </button>
            <button onClick={onBack} className="px-4 py-2 rounded-lg text-sm font-medium transition-colors" style={{ background: "#111111", border: "1px solid #222222", color: "#888" }}>
              Back to Library
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium" style={{ background: "#111111", border: "1px solid #222222", color: "#888" }}>
          <ChevronLeft className="h-3.5 w-3.5" /> Library
        </button>
        <span className="text-xs tabular-nums" style={{ color: "#555" }}>Question {currentQ + 1} of {quizSet.length}</span>
      </div>
      <div className="h-1.5 rounded-full" style={{ background: "#1a1a1a" }}>
        <motion.div className="h-1.5 rounded-full" style={{ background: "#4F46E5" }} animate={{ width: `${(currentQ / quizSet.length) * 100}%` }} transition={{ duration: 0.3 }} />
      </div>
      <div className="rounded-lg p-6" style={{ background: "#111111", border: "1px solid #222222" }}>
        <p className="text-[11px] font-semibold uppercase tracking-widest mb-2" style={{ color: "#555" }}>What is the meaning of</p>
        <h2 className="text-2xl font-bold text-white mb-2">{question?.word}</h2>
        <div className="mb-6">{question && <PosBadge pos={question.part_of_speech} />}</div>

        <AnimatePresence mode="wait">
          {options.length > 0 && (
            <motion.div key={currentQ} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="grid gap-2">
              {options.map((opt, i) => {
                let bg = "#1a1a1a", border = "#2a2a2a", color = "#ccc";
                if (selected !== null) {
                  if (opt === question.meaning)  { bg = "rgba(34,197,94,0.1)";  border = "rgba(34,197,94,0.3)";  color = "#4ade80"; }
                  else if (opt === selected)     { bg = "rgba(239,68,68,0.1)";  border = "rgba(239,68,68,0.3)";  color = "#f87171"; }
                  else                           { bg = "#111111"; border = "#1a1a1a"; color = "#444"; }
                }
                return (
                  <button key={i} onClick={() => handleSelect(opt)} className="w-full text-left text-sm px-4 py-3 rounded-lg transition-colors" style={{ background: bg, border: `1px solid ${border}`, color }}>
                    <span className="font-semibold mr-2" style={{ color: "#555" }}>{String.fromCharCode(65 + i)}.</span>{opt}
                  </button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {selected !== null && (
          <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
            className="mt-4 flex items-center gap-2 text-sm"
            style={{ color: selected === question.meaning ? "#4ade80" : "#f87171" }}>
            {selected === question.meaning ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
            {selected === question.meaning ? "Correct!" : `Correct: ${question.meaning}`}
          </motion.div>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function VocabularyPage() {
  const [topic, setTopic] = useState("Technology");
  const [bandLevel, setBandLevel] = useState("7");
  const [words, setWords] = useState<VocabWord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"main" | "flashcard" | "quiz">("main");

  const [lookupInput, setLookupInput] = useState("");
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupResult, setLookupResult] = useState<LookedUpWord | null>(null);
  const [lookupError, setLookupError] = useState<string | null>(null);

  async function handleLookup() {
    const word = lookupInput.trim();
    if (!word) return;
    setLookupLoading(true); setLookupError(null); setLookupResult(null);
    try {
      const res = await fetch("/api/lookup-word", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ word }) });
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setLookupResult(data as LookedUpWord);
    } catch (err) {
      setLookupError(err instanceof Error ? err.message : "Lookup failed. Please try again.");
    } finally {
      setLookupLoading(false);
    }
  }

  const filtered = useMemo(() => {
    if (!search) return words;
    const q = search.toLowerCase();
    return words.filter((w) => w.word.toLowerCase().includes(q) || w.meaning.toLowerCase().includes(q));
  }, [words, search]);

  async function handleGenerate() {
    setLoading(true); setError(null); setSearch(""); setView("main");
    try {
      const res = await fetch("/api/generate-vocabulary", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, band_level: bandLevel }),
      });
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setWords(data.words ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (view === "flashcard" && filtered.length > 0) {
    return <div className="p-6 md:p-8 max-w-2xl"><FlashcardMode words={filtered} onBack={() => setView("main")} /></div>;
  }
  if (view === "quiz" && filtered.length >= 4) {
    return <div className="p-6 md:p-8 max-w-2xl"><QuizMode words={filtered} onBack={() => setView("main")} /></div>;
  }

  return (
    <div className="p-6 md:p-8 max-w-5xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-7">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-white" style={{ letterSpacing: "-0.02em" }}>Vocabulary</h1>
            {words.length > 0 && (
              <span className="text-xs font-medium px-2.5 py-1 rounded-full tabular-nums" style={{ background: "#1a1a1a", color: "#555", border: "1px solid #222222" }}>
                {filtered.length}{filtered.length !== words.length ? ` / ${words.length}` : ""} words
              </span>
            )}
          </div>
          <p className="text-sm mt-0.5" style={{ color: "#888" }}>AI-generated IELTS vocabulary on any topic</p>
        </div>

        {filtered.length >= 4 && (
          <div className="flex gap-2 shrink-0">
            <button onClick={() => setView("flashcard")} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors" style={{ background: "#111111", border: "1px solid #222222", color: "#888" }}>
              <Layers className="h-3.5 w-3.5" /><span className="hidden sm:inline">Flashcards</span>
            </button>
            <button onClick={() => setView("quiz")} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors" style={{ background: "#111111", border: "1px solid #222222", color: "#888" }}>
              <Brain className="h-3.5 w-3.5" /><span className="hidden sm:inline">Quiz</span>
            </button>
          </div>
        )}
      </div>

      {/* Look Up Any Word */}
      <div className="mb-6">
        <p className="text-[10px] font-semibold uppercase tracking-widest mb-2" style={{ color: "#555" }}>Look Up Any Word</p>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 pointer-events-none" style={{ color: "#555" }} />
            <input
              type="text"
              placeholder="Type any English word…"
              value={lookupInput}
              onChange={(e) => setLookupInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleLookup(); }}
              className="w-full rounded-lg px-9 pr-8 py-2 text-sm text-white placeholder:text-[#444] focus:outline-none focus:ring-1 focus:ring-[#4F46E5]"
              style={{ background: "#111111", border: "1px solid #222222" }}
            />
            {lookupInput && (
              <button onClick={() => { setLookupInput(""); setLookupResult(null); setLookupError(null); }}
                className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "#555" }}>
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <button onClick={handleLookup} disabled={lookupLoading || !lookupInput.trim()}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-40 transition-colors shrink-0"
            style={{ background: "#4F46E5" }}>
            {lookupLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <BookMarked className="h-3.5 w-3.5" />}
            Look Up
          </button>
        </div>

        {lookupError && (
          <div className="flex items-start gap-2 rounded-lg p-3 mt-3" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
            <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
            <p className="text-xs text-red-400">{lookupError}</p>
          </div>
        )}

        {lookupLoading && (
          <div className="rounded-lg p-8 mt-3 flex flex-col items-center gap-3" style={{ background: "#111111", border: "1px solid #4F46E520" }}>
            <Loader2 className="h-6 w-6 animate-spin" style={{ color: "#4F46E5" }} />
            <p className="text-xs" style={{ color: "#555" }}>Looking up IELTS details…</p>
          </div>
        )}

        <AnimatePresence>
          {lookupResult && !lookupLoading && (
            <div className="mt-3"><LookupCard result={lookupResult} onDismiss={() => setLookupResult(null)} /></div>
          )}
        </AnimatePresence>
      </div>

      <div className="mb-6" style={{ borderTop: "1px solid #222222" }} />

      {/* Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-[1fr_140px_auto] gap-3 mb-4">
        <SelectField label="Topic" value={topic} onChange={setTopic} options={TOPICS} />
        <SelectField label="Band Level" value={bandLevel} onChange={setBandLevel} options={BAND_LEVELS} />
        <div className="space-y-1.5">
          <label className="invisible select-none text-xs">Go</label>
          <button onClick={handleGenerate} disabled={loading}
            className="flex items-center gap-2 w-full px-4 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-40 transition-colors justify-center"
            style={{ background: "#4F46E5" }}>
            {loading ? <><Loader2 className="h-3.5 w-3.5 animate-spin" />Generating…</> : <><Sparkles className="h-3.5 w-3.5" />Generate Words</>}
          </button>
        </div>
      </div>

      {/* Search */}
      {words.length > 0 && (
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 pointer-events-none" style={{ color: "#555" }} />
          <input
            type="text"
            placeholder="Search words or meanings…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg pl-9 pr-8 py-2 text-sm text-white placeholder:text-[#444] focus:outline-none focus:ring-1 focus:ring-[#4F46E5]"
            style={{ background: "#111111", border: "1px solid #222222" }}
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "#555" }}>
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 rounded-lg p-3 mb-4" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
          <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
          <p className="text-xs text-red-400">{error}</p>
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-56 rounded-lg animate-pulse" style={{ background: "#111111", border: "1px solid #1a1a1a" }} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && words.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <BookOpen className="h-10 w-10" style={{ color: "#333" }} />
          <div>
            <p className="text-sm font-medium mb-1" style={{ color: "#888" }}>No words yet</p>
            <p className="text-xs max-w-xs" style={{ color: "#555" }}>Pick a topic and band level, then click Generate Words.</p>
          </div>
        </div>
      )}

      {/* Word grid */}
      {!loading && filtered.length > 0 && (
        <>
          {search && <p className="text-xs mb-3" style={{ color: "#555" }}>{filtered.length} of {words.length} words match &ldquo;{search}&rdquo;</p>}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {filtered.map((word) => (
              <motion.div key={word.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
                <WordCard word={word} />
              </motion.div>
            ))}
          </div>
        </>
      )}

      {/* No search match */}
      {!loading && words.length > 0 && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <p className="text-sm" style={{ color: "#555" }}>No words match &ldquo;{search}&rdquo;</p>
          <button onClick={() => setSearch("")} className="text-xs" style={{ color: "#4F46E5" }}>Clear search</button>
        </div>
      )}
    </div>
  );
}
