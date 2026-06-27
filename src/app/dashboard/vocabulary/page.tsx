"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Loader2, Sparkles, BookOpen, Search, Brain, Layers,
  AlertCircle, ChevronLeft, ChevronRight, RotateCcw, X, Check,
  BookMarked, ArrowRight,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type VocabWord = {
  id: string;
  word: string;
  meaning: string;
  part_of_speech: string;
  synonyms: string[];
  antonyms: string[];
  example_sentence: string;
  topic: string;
  band_level: string;
};

type LookedUpWord = {
  word: string;
  part_of_speech: string;
  meaning: string;
  band_level: string;
  topic: string;
  synonyms: string[];
  antonyms: string[];
  example_sentence: string;
  collocations: string[];
  ielts_usage: string;
  common_mistakes: string;
};

// ─── Constants ────────────────────────────────────────────────────────────────

const TOPICS = [
  "Technology", "Education", "Environment", "Health", "Government",
  "Crime", "Business", "Transport", "Science", "Culture",
  "Media", "Globalisation", "Urbanisation", "Tourism", "Family",
  "Children", "Housing", "Animals", "Food", "Water",
  "Energy", "Population", "Poverty", "Gender Equality", "Sport",
  "Art", "History", "Language", "Space", "Psychology",
];

const BAND_LEVELS = ["6", "7", "8", "9"];

const POS_STYLE: Record<string, string> = {
  noun:      "bg-blue-500/15   text-blue-400   border-blue-500/25",
  verb:      "bg-green-500/15  text-green-400  border-green-500/25",
  adjective: "bg-orange-500/15 text-orange-400 border-orange-500/25",
  adverb:    "bg-violet-500/15 text-violet-400 border-violet-500/25",
  phrase:    "bg-cyan-500/15   text-cyan-400   border-cyan-500/25",
};

const BAND_STYLE: Record<string, string> = {
  "6": "bg-zinc-700/40    text-zinc-400",
  "7": "bg-blue-500/15   text-blue-400",
  "8": "bg-violet-500/15 text-violet-400",
  "9": "bg-amber-500/15  text-amber-400",
};

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

// ─── Shared badges ────────────────────────────────────────────────────────────

function PosBadge({ pos }: { pos: string }) {
  const s = POS_STYLE[pos.toLowerCase()] ?? "bg-zinc-700/40 text-zinc-400 border-zinc-700";
  return <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${s}`}>{pos}</span>;
}

function BandBadge({ band }: { band: string }) {
  const s = BAND_STYLE[band] ?? "bg-zinc-700/40 text-zinc-400";
  return <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${s}`}>Band {band}</span>;
}

// ─── Lookup Card ──────────────────────────────────────────────────────────────

function LookupCard({ result, onDismiss }: { result: LookedUpWord; onDismiss: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25 }}
    >
      <div className="rounded-xl border-2 border-blue-500/40 bg-blue-950/20 p-5 mb-6 relative">
        {/* Dismiss */}
        <button
          onClick={onDismiss}
          className="absolute top-3 right-3 text-zinc-500 hover:text-zinc-300 transition-colors"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header */}
        <div className="flex items-start gap-3 mb-4">
          <div className="p-2 rounded-lg bg-blue-500/10 shrink-0">
            <BookMarked className="h-4 w-4 text-blue-400" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h3 className="text-xl font-bold text-zinc-100">{result.word}</h3>
              <PosBadge pos={result.part_of_speech} />
              <BandBadge band={result.band_level} />
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-500">
                {result.topic}
              </span>
            </div>
            <p className="text-sm text-zinc-300 leading-relaxed">{result.meaning}</p>
          </div>
        </div>

        {/* Example sentence */}
        <div className="rounded-lg bg-blue-500/8 border border-blue-500/20 px-4 py-3 mb-4">
          <p className="text-[10px] font-semibold text-blue-400/70 uppercase tracking-widest mb-1">
            Band 9 Example
          </p>
          <p className="text-sm text-zinc-300 italic leading-relaxed">
            &ldquo;{result.example_sentence}&rdquo;
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          {/* Synonyms */}
          {result.synonyms?.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">Synonyms</p>
              <div className="flex flex-wrap gap-1.5">
                {result.synonyms.map((s, i) => (
                  <span key={i} className="text-xs px-2 py-1 rounded-md bg-green-500/10 text-green-400 border border-green-500/20">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Antonyms */}
          {result.antonyms?.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">Antonyms</p>
              <div className="flex flex-wrap gap-1.5">
                {result.antonyms.map((s, i) => (
                  <span key={i} className="text-xs px-2 py-1 rounded-md bg-red-500/10 text-red-400 border border-red-500/20">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Collocations */}
        {result.collocations?.length > 0 && (
          <div className="mb-4">
            <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">Collocations</p>
            <div className="flex flex-wrap gap-1.5">
              {result.collocations.map((c, i) => (
                <span key={i} className="text-xs px-2.5 py-1 rounded-md bg-violet-500/10 text-violet-400 border border-violet-500/20 font-medium">
                  {c}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* IELTS usage */}
          <div className="rounded-lg bg-zinc-800/50 px-4 py-3">
            <div className="flex items-center gap-1.5 mb-1.5">
              <ArrowRight className="h-3 w-3 text-blue-400" />
              <p className="text-[10px] font-semibold text-blue-400 uppercase tracking-wider">How to use in IELTS</p>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">{result.ielts_usage}</p>
          </div>

          {/* Common mistakes */}
          <div className="rounded-lg bg-zinc-800/50 px-4 py-3">
            <div className="flex items-center gap-1.5 mb-1.5">
              <AlertCircle className="h-3 w-3 text-amber-400" />
              <p className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider">Common Mistakes</p>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">{result.common_mistakes}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── SelectField ──────────────────────────────────────────────────────────────

function SelectField({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void; options: string[];
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-zinc-400">{label}</Label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-zinc-800/60 bg-zinc-900 px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-colors"
      >
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

// ─── Word Card ────────────────────────────────────────────────────────────────

function WordCard({ word }: { word: VocabWord }) {
  return (
    <Card className="bg-zinc-900 border-zinc-800/60 h-full">
      <CardContent className="pt-4 pb-4 flex flex-col gap-3 h-full">
        <div>
          <h3 className="text-base font-bold text-zinc-100 leading-tight mb-2">{word.word}</h3>
          <div className="flex flex-wrap gap-1.5">
            <PosBadge pos={word.part_of_speech} />
            <BandBadge band={word.band_level} />
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-500">
              {word.topic}
            </span>
          </div>
        </div>

        <p className="text-sm text-zinc-300 leading-relaxed">{word.meaning}</p>

        <p className="text-xs text-zinc-500 italic leading-relaxed border-l-2 border-zinc-700 pl-3">
          &ldquo;{word.example_sentence}&rdquo;
        </p>

        {word.synonyms?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 items-center">
            <span className="text-[10px] font-semibold text-zinc-600 uppercase tracking-wider">Syn:</span>
            {word.synonyms.map((s, i) => (
              <span key={i} className="text-[11px] px-1.5 py-0.5 rounded bg-green-500/10 text-green-400">{s}</span>
            ))}
          </div>
        )}

        {word.antonyms?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 items-center">
            <span className="text-[10px] font-semibold text-zinc-600 uppercase tracking-wider">Ant:</span>
            {word.antonyms.map((s, i) => (
              <span key={i} className="text-[11px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-400">{s}</span>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Flashcard mode ───────────────────────────────────────────────────────────

function FlipCard({ word, flipped, onFlip }: { word: VocabWord; flipped: boolean; onFlip: () => void }) {
  return (
    <div onClick={onFlip} style={{ perspective: "1200px" }} className="w-full cursor-pointer select-none">
      <motion.div
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        style={{ transformStyle: "preserve-3d", position: "relative", minHeight: "300px" }}
      >
        <div
          style={{ backfaceVisibility: "hidden" }}
          className="absolute inset-0 rounded-xl border border-zinc-800/60 bg-zinc-900 flex flex-col items-center justify-center gap-4 p-8"
        >
          <p className="text-[10px] font-semibold text-zinc-600 uppercase tracking-widest">Tap to reveal</p>
          <h2 className="text-4xl font-bold text-zinc-100 text-center">{word.word}</h2>
          <div className="flex gap-2">
            <PosBadge pos={word.part_of_speech} />
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-500">{word.topic}</span>
          </div>
        </div>
        <div
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
          className="absolute inset-0 rounded-xl border border-blue-800/30 bg-zinc-900 flex flex-col justify-center gap-4 p-8"
        >
          <h2 className="text-xl font-bold text-zinc-100">{word.word}</h2>
          <p className="text-sm text-zinc-300 leading-relaxed">{word.meaning}</p>
          <p className="text-xs text-zinc-500 italic leading-relaxed border-l-2 border-zinc-700 pl-3">
            &ldquo;{word.example_sentence}&rdquo;
          </p>
          {word.synonyms?.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              <span className="text-[10px] font-semibold text-zinc-600 uppercase tracking-wider">Syn:</span>
              {word.synonyms.map((s, i) => (
                <span key={i} className="text-[11px] px-1.5 py-0.5 rounded bg-green-500/10 text-green-400">{s}</span>
              ))}
            </div>
          )}
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
        <Button variant="outline" size="sm" onClick={onBack}
          className="gap-1.5 border-zinc-700 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200">
          <ChevronLeft className="h-3.5 w-3.5" /> Library
        </Button>
        <span className="text-xs text-zinc-500 tabular-nums">{index + 1} / {words.length}</span>
      </div>

      <div className="h-1.5 rounded-full bg-zinc-800">
        <motion.div className="h-1.5 rounded-full bg-blue-500"
          animate={{ width: `${progress}%` }} transition={{ duration: 0.3 }} />
      </div>

      <FlipCard word={words[index]} flipped={flipped} onFlip={() => setFlipped((f) => !f)} />

      <div className="flex justify-center gap-3">
        <Button variant="outline" size="sm" onClick={() => go(-1)} disabled={index === 0}
          className="border-zinc-700 text-zinc-400 hover:bg-zinc-800">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={() => setFlipped((f) => !f)}
          className="gap-1.5 border-zinc-700 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200">
          <RotateCcw className="h-3.5 w-3.5" /> Flip
        </Button>
        <Button variant="outline" size="sm" onClick={() => go(1)} disabled={index === words.length - 1}
          className="border-zinc-700 text-zinc-400 hover:bg-zinc-800">
          <ChevronRight className="h-4 w-4" />
        </Button>
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
    const ring = pct >= 80 ? "border-green-500 bg-green-500/10" : pct >= 50 ? "border-yellow-500 bg-yellow-500/10" : "border-red-500 bg-red-500/10";
    const txt  = pct >= 80 ? "text-green-400" : pct >= 50 ? "text-yellow-400" : "text-red-400";
    return (
      <div className="space-y-5">
        <Button variant="outline" size="sm" onClick={onBack}
          className="gap-1.5 border-zinc-700 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200">
          <ChevronLeft className="h-3.5 w-3.5" /> Library
        </Button>
        <Card className="bg-zinc-900 border-zinc-800/60">
          <CardContent className="pt-10 pb-10 flex flex-col items-center gap-4">
            <div className={`w-24 h-24 rounded-full border-4 flex flex-col items-center justify-center ${ring}`}>
              <span className={`text-3xl font-bold leading-none ${txt}`}>{pct}%</span>
            </div>
            <p className="text-lg font-semibold text-zinc-100">{score} / {quizSet.length} correct</p>
            <p className="text-sm text-zinc-500 text-center">
              {pct >= 80 ? "Excellent! You know these words well." : pct >= 50 ? "Good effort — keep practising." : "Keep studying, you'll get there!"}
            </p>
            <div className="flex gap-2 mt-2">
              <Button size="sm" onClick={restart} className="gap-2">
                <RotateCcw className="h-3.5 w-3.5" /> Try Again
              </Button>
              <Button size="sm" variant="outline" onClick={onBack}
                className="border-zinc-700 text-zinc-400 hover:bg-zinc-800">
                Back to Library
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" onClick={onBack}
          className="gap-1.5 border-zinc-700 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200">
          <ChevronLeft className="h-3.5 w-3.5" /> Library
        </Button>
        <span className="text-xs text-zinc-500 tabular-nums">Question {currentQ + 1} of {quizSet.length}</span>
      </div>

      <div className="h-1.5 rounded-full bg-zinc-800">
        <motion.div className="h-1.5 rounded-full bg-blue-500"
          animate={{ width: `${(currentQ / quizSet.length) * 100}%` }} transition={{ duration: 0.3 }} />
      </div>

      <Card className="bg-zinc-900 border-zinc-800/60">
        <CardContent className="pt-6 pb-6">
          <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-widest mb-2">
            What is the meaning of
          </p>
          <h2 className="text-2xl font-bold text-zinc-100 mb-2">{question?.word}</h2>
          <div className="mb-6">{question && <PosBadge pos={question.part_of_speech} />}</div>

          <AnimatePresence mode="wait">
            {options.length > 0 && (
              <motion.div key={currentQ} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }} className="grid gap-2">
                {options.map((opt, i) => {
                  let cls = "border border-zinc-800 bg-zinc-800/40 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100";
                  if (selected !== null) {
                    if (opt === question.meaning)  cls = "border border-green-500/60 bg-green-500/10 text-green-300";
                    else if (opt === selected)     cls = "border border-red-500/60   bg-red-500/10   text-red-300";
                    else                           cls = "border border-zinc-800 bg-zinc-800/20 text-zinc-600 opacity-50";
                  }
                  return (
                    <button key={i} onClick={() => handleSelect(opt)}
                      className={`w-full text-left text-sm px-4 py-3 rounded-lg transition-colors ${cls}`}>
                      <span className="font-semibold text-zinc-500 mr-2">{String.fromCharCode(65 + i)}.</span>
                      {opt}
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>

          {selected !== null && (
            <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
              className={`mt-4 flex items-center gap-2 text-sm ${selected === question.meaning ? "text-green-400" : "text-red-400"}`}>
              {selected === question.meaning ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
              {selected === question.meaning ? "Correct!" : `Correct: ${question.meaning}`}
            </motion.div>
          )}
        </CardContent>
      </Card>
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

  // Lookup state
  const [lookupInput, setLookupInput] = useState("");
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupResult, setLookupResult] = useState<LookedUpWord | null>(null);
  const [lookupError, setLookupError] = useState<string | null>(null);

  async function handleLookup() {
    const word = lookupInput.trim();
    if (!word) return;
    setLookupLoading(true);
    setLookupError(null);
    setLookupResult(null);
    try {
      const res = await fetch("/api/lookup-word", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ word }),
      });
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
    return words.filter(
      (w) => w.word.toLowerCase().includes(q) || w.meaning.toLowerCase().includes(q),
    );
  }, [words, search]);

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    setSearch("");
    setView("main");
    try {
      const res = await fetch("/api/generate-vocabulary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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

  // ── Mode views ──────────────────────────────────────────────────────────────

  if (view === "flashcard" && filtered.length > 0) {
    return (
      <div className="p-6 md:p-8 max-w-2xl">
        <FlashcardMode words={filtered} onBack={() => setView("main")} />
      </div>
    );
  }

  if (view === "quiz" && filtered.length >= 4) {
    return (
      <div className="p-6 md:p-8 max-w-2xl">
        <QuizMode words={filtered} onBack={() => setView("main")} />
      </div>
    );
  }

  // ── Library ─────────────────────────────────────────────────────────────────

  return (
    <div className="p-6 md:p-8 max-w-5xl">

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold text-zinc-100">Vocabulary</h2>
            {words.length > 0 && (
              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-zinc-800 text-zinc-400 tabular-nums">
                {filtered.length}{filtered.length !== words.length ? ` / ${words.length}` : ""} words
              </span>
            )}
          </div>
          <p className="text-sm text-zinc-500 mt-0.5">
            AI-generated IELTS vocabulary on any topic
          </p>
        </div>

        {filtered.length >= 4 && (
          <div className="flex gap-2 shrink-0">
            <Button size="sm" variant="outline" onClick={() => setView("flashcard")}
              className="gap-1.5 border-zinc-700 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200">
              <Layers className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Flashcards</span>
            </Button>
            <Button size="sm" variant="outline" onClick={() => setView("quiz")}
              className="gap-1.5 border-zinc-700 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200">
              <Brain className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Quiz</span>
            </Button>
          </div>
        )}
      </div>

      {/* ── Look Up Any Word ── */}
      <div className="mb-6">
        <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest mb-2">
          Look Up Any Word
        </p>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500 pointer-events-none" />
            <input
              type="text"
              placeholder="Type any English word…"
              value={lookupInput}
              onChange={(e) => setLookupInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleLookup(); }}
              className="w-full rounded-md border border-zinc-800/60 bg-zinc-900 pl-9 pr-8 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
            {lookupInput && (
              <button
                onClick={() => { setLookupInput(""); setLookupResult(null); setLookupError(null); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <Button
            onClick={handleLookup}
            disabled={lookupLoading || !lookupInput.trim()}
            size="sm"
            className="gap-2 shrink-0"
          >
            {lookupLoading
              ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
              : <BookMarked className="h-3.5 w-3.5" />}
            Look Up
          </Button>
        </div>

        {lookupError && (
          <div className="flex items-start gap-2 rounded-lg border border-red-800/40 bg-red-950/20 p-3 mt-3">
            <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
            <p className="text-xs text-red-400">{lookupError}</p>
          </div>
        )}

        {lookupLoading && (
          <div className="rounded-xl border-2 border-blue-500/20 bg-blue-950/10 p-8 mt-3 flex flex-col items-center gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
            <p className="text-xs text-zinc-500">Looking up IELTS details…</p>
          </div>
        )}

        <AnimatePresence>
          {lookupResult && !lookupLoading && (
            <div className="mt-3">
              <LookupCard result={lookupResult} onDismiss={() => setLookupResult(null)} />
            </div>
          )}
        </AnimatePresence>
      </div>

      <div className="border-t border-zinc-800/60 mb-6" />

      {/* Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-[1fr_140px_auto] gap-3 mb-4">
        <SelectField label="Topic" value={topic} onChange={setTopic} options={TOPICS} />
        <SelectField label="Band Level" value={bandLevel} onChange={setBandLevel} options={BAND_LEVELS} />
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-zinc-400 invisible select-none">Go</Label>
          <Button onClick={handleGenerate} disabled={loading} className="gap-2 w-full">
            {loading
              ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Generating…</>
              : <><Sparkles className="h-3.5 w-3.5" /> Generate Words</>}
          </Button>
        </div>
      </div>

      {/* Search */}
      {words.length > 0 && (
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500 pointer-events-none" />
          <input
            type="text"
            placeholder="Search words or meanings…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-md border border-zinc-800/60 bg-zinc-900 pl-9 pr-8 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
          {search && (
            <button onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-red-800/40 bg-red-950/20 p-3 mb-4">
          <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
          <p className="text-xs text-red-400">{error}</p>
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-56 rounded-xl border border-zinc-800/60 bg-zinc-900 animate-pulse" />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && words.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <BookOpen className="h-10 w-10 text-zinc-700" />
          <div>
            <p className="text-sm font-medium text-zinc-400 mb-1">No words yet</p>
            <p className="text-xs text-zinc-600 max-w-xs">
              Pick a topic and band level, then click Generate Words.
            </p>
          </div>
        </div>
      )}

      {/* Word grid */}
      {!loading && filtered.length > 0 && (
        <>
          {search && (
            <p className="text-xs text-zinc-600 mb-3">
              {filtered.length} of {words.length} words match &ldquo;{search}&rdquo;
            </p>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {filtered.map((word) => (
              <motion.div key={word.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}>
                <WordCard word={word} />
              </motion.div>
            ))}
          </div>
        </>
      )}

      {/* No search match */}
      {!loading && words.length > 0 && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <p className="text-sm text-zinc-500">No words match &ldquo;{search}&rdquo;</p>
          <button onClick={() => setSearch("")} className="text-xs text-blue-400 hover:text-blue-300">
            Clear search
          </button>
        </div>
      )}
    </div>
  );
}
