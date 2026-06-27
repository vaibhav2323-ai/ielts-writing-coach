"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, BookOpen, ChevronRight, AlertCircle, GraduationCap } from "lucide-react";
import type { Components } from "react-markdown";

// ─── Constants ────────────────────────────────────────────────────────────────

const TOPICS = [
  "Tenses",
  "Articles",
  "Passive Voice",
  "Conditional Sentences",
  "Relative Clauses",
  "Modal Verbs",
  "Conjunctions",
  "Prepositions",
  "Subject-Verb Agreement",
  "Parallelism",
  "Punctuation",
  "Sentence Structure",
  "Complex Sentences",
  "Noun Phrases",
  "Adverbial Clauses",
  "Comparison Structures",
  "Inversion",
  "Cleft Sentences",
  "Nominalization",
  "Cohesive Devices",
];

// ─── Special section card wrapper ─────────────────────────────────────────────

function SectionCard({
  children,
  variant,
}: {
  children: React.ReactNode;
  variant: "practice" | "homework";
}) {
  const styles = {
    practice: {
      wrap: "border border-blue-500/30 bg-blue-950/20 rounded-xl px-5 py-4 mb-4",
      label: "text-blue-400",
      icon: "✏️",
      text: "Practice Exercise",
    },
    homework: {
      wrap: "border border-amber-500/30 bg-amber-950/15 rounded-xl px-5 py-4 mb-4",
      label: "text-amber-400",
      icon: "📝",
      text: "Homework",
    },
  };
  const s = styles[variant];
  return (
    <div className={s.wrap}>
      <p className={`text-[10px] font-bold uppercase tracking-widest mb-3 ${s.label}`}>
        {s.icon} {s.text}
      </p>
      {children}
    </div>
  );
}

// ─── Markdown components ──────────────────────────────────────────────────────

function buildComponents(): Components {
  // Track which special section we're in across renders via a mutable ref-like object
  const state = { inPractice: false, inHomework: false };

  function classifyHeading(text: string) {
    const t = text.toLowerCase();
    if (t.includes("8.") && t.includes("practice")) {
      state.inPractice = true;
      state.inHomework = false;
    } else if (t.includes("9.") && t.includes("homework")) {
      state.inHomework = true;
      state.inPractice = false;
    } else if (/^\d+\./.test(text.trim())) {
      state.inPractice = false;
      state.inHomework = false;
    }
  }

  return {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    h2({ children, ...props }: any) {
      const text = String(children ?? "");
      classifyHeading(text);
      const isPrac = state.inPractice;
      const isHw = state.inHomework;
      return (
        <h2
          {...props}
          className={`text-base font-bold mt-7 mb-3 pb-2 border-b ${
            isPrac
              ? "text-blue-400 border-blue-500/30"
              : isHw
              ? "text-amber-400 border-amber-500/30"
              : "text-zinc-100 border-zinc-800/60"
          }`}
        >
          {children}
        </h2>
      );
    },

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    h3({ children, ...props }: any) {
      return (
        <h3 {...props} className="text-sm font-semibold text-zinc-200 mt-4 mb-2">
          {children}
        </h3>
      );
    },

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    p({ children, ...props }: any) {
      return (
        <p {...props} className="text-sm text-zinc-300 leading-relaxed mb-3">
          {children}
        </p>
      );
    },

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ul({ children, ...props }: any) {
      const list = (
        <ul {...props} className="list-disc list-outside space-y-1.5 mb-4 ml-4">
          {children}
        </ul>
      );
      if (state.inPractice) return <SectionCard variant="practice">{list}</SectionCard>;
      if (state.inHomework) return <SectionCard variant="homework">{list}</SectionCard>;
      return list;
    },

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ol({ children, ...props }: any) {
      const list = (
        <ol {...props} className="list-decimal list-outside space-y-1.5 mb-4 ml-4">
          {children}
        </ol>
      );
      if (state.inPractice) return <SectionCard variant="practice">{list}</SectionCard>;
      if (state.inHomework) return <SectionCard variant="homework">{list}</SectionCard>;
      return list;
    },

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    li({ children, ...props }: any) {
      return (
        <li {...props} className="text-sm text-zinc-300 leading-relaxed">
          {children}
        </li>
      );
    },

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    strong({ children, ...props }: any) {
      return (
        <strong {...props} className="font-semibold text-zinc-100">
          {children}
        </strong>
      );
    },

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    em({ children, ...props }: any) {
      return (
        <em {...props} className="italic text-zinc-400">
          {children}
        </em>
      );
    },

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    code({ children, ...props }: any) {
      return (
        <code
          {...props}
          className="bg-zinc-800 text-blue-300 px-1.5 py-0.5 rounded text-xs font-mono"
        >
          {children}
        </code>
      );
    },

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    blockquote({ children, ...props }: any) {
      return (
        <blockquote
          {...props}
          className="border-l-2 border-blue-500/40 pl-4 my-3 text-sm text-zinc-400 italic"
        >
          {children}
        </blockquote>
      );
    },

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    hr(props: any) {
      return <hr {...props} className="border-zinc-800/60 my-5" />;
    },
  };
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function LessonSkeleton() {
  return (
    <div className="space-y-5 animate-pulse">
      <div className="h-5 bg-zinc-800 rounded w-48" />
      <div className="space-y-2">
        <div className="h-3 bg-zinc-800 rounded w-full" />
        <div className="h-3 bg-zinc-800 rounded w-5/6" />
        <div className="h-3 bg-zinc-800 rounded w-4/6" />
      </div>
      <div className="h-4 bg-zinc-800 rounded w-36 mt-6" />
      <div className="space-y-2">
        <div className="h-3 bg-zinc-800 rounded w-full" />
        <div className="h-3 bg-zinc-800 rounded w-3/4" />
        <div className="h-3 bg-zinc-800 rounded w-5/6" />
        <div className="h-3 bg-zinc-800 rounded w-2/3" />
      </div>
      <div className="h-4 bg-zinc-800 rounded w-40 mt-6" />
      <div className="space-y-2">
        <div className="h-3 bg-zinc-800 rounded w-full" />
        <div className="h-3 bg-zinc-800 rounded w-full" />
        <div className="h-3 bg-zinc-800 rounded w-4/5" />
      </div>
      <div className="h-28 bg-zinc-800/50 rounded-xl mt-4" />
      <div className="h-20 bg-zinc-800/40 rounded-xl" />
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function GrammarPage() {
  const [activeTopic, setActiveTopic] = useState<string | null>(null);
  const [lesson, setLesson] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleTopicClick(topic: string) {
    if (loading) return;
    setActiveTopic(topic);
    setLesson(null);
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/grammar-lesson", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic }),
      });
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setLesson(data.lesson ?? "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load lesson.");
    } finally {
      setLoading(false);
    }
  }

  // Build fresh components each time so section-tracking state resets per render
  const mdComponents = buildComponents();

  return (
    <div className="flex min-h-[calc(100vh-52px)]">

      {/* ── Sidebar ── */}
      <aside className="w-56 shrink-0 border-r border-zinc-800/60 overflow-y-auto py-5 px-3">
        <p className="text-[10px] font-semibold text-zinc-600 uppercase tracking-widest px-2 mb-3">
          Grammar Topics
        </p>
        <nav className="space-y-0.5">
          {TOPICS.map((topic) => {
            const isActive = activeTopic === topic;
            return (
              <button
                key={topic}
                onClick={() => handleTopicClick(topic)}
                disabled={loading}
                className={`w-full text-left flex items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-sm transition-colors group ${
                  isActive
                    ? "bg-blue-600 text-white font-medium"
                    : "text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200"
                } ${loading && !isActive ? "opacity-40 cursor-not-allowed" : ""}`}
              >
                <span className="truncate">{topic}</span>
                {isActive && loading ? (
                  <Loader2 className="h-3 w-3 animate-spin shrink-0 opacity-70" />
                ) : (
                  <ChevronRight
                    className={`h-3 w-3 shrink-0 transition-opacity ${
                      isActive ? "opacity-70" : "opacity-0 group-hover:opacity-40"
                    }`}
                  />
                )}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* ── Main panel ── */}
      <main className="flex-1 min-w-0 overflow-y-auto">
        <div className="max-w-2xl px-8 py-7">

          {/* Empty state */}
          {!activeTopic && !error && (
            <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
              <div className="p-4 rounded-2xl bg-zinc-800/50">
                <GraduationCap className="h-8 w-8 text-zinc-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-400 mb-1">Select a grammar topic</p>
                <p className="text-xs text-zinc-600 max-w-xs">
                  Choose any topic from the sidebar to get an instant AI-generated IELTS grammar
                  lesson with examples, exercises, and homework.
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-2 max-w-xs mt-1">
                {["Passive Voice", "Tenses", "Inversion"].map((t) => (
                  <button
                    key={t}
                    onClick={() => handleTopicClick(t)}
                    className="text-xs px-3 py-1.5 rounded-full bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200 transition-colors border border-zinc-700/50"
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-start gap-3 rounded-lg border border-red-800/40 bg-red-950/20 p-4">
              <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-400 mb-0.5">Failed to load lesson</p>
                <p className="text-xs text-red-400/70">{error}</p>
              </div>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div>
              <div className="flex items-center gap-3 mb-7">
                <div className="p-1.5 rounded-lg bg-blue-500/10">
                  <BookOpen className="h-4 w-4 text-blue-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-400" />
                    <span className="text-sm font-medium text-zinc-300">
                      Generating lesson on{" "}
                      <span className="text-blue-400">{activeTopic}</span>…
                    </span>
                  </div>
                  <p className="text-xs text-zinc-600 mt-0.5">This takes a few seconds</p>
                </div>
              </div>
              <LessonSkeleton />
            </div>
          )}

          {/* Lesson */}
          <AnimatePresence mode="wait">
            {lesson && !loading && (
              <motion.div
                key={activeTopic}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
              >
                {/* Lesson header */}
                <div className="flex items-center gap-3 mb-6 pb-5 border-b border-zinc-800/60">
                  <div className="p-2 rounded-lg bg-blue-500/10 shrink-0">
                    <BookOpen className="h-4 w-4 text-blue-400" />
                  </div>
                  <div>
                    <h1 className="text-lg font-bold text-zinc-100">{activeTopic}</h1>
                    <p className="text-xs text-zinc-500">IELTS Academic Grammar Lesson</p>
                  </div>
                </div>

                {/* Markdown */}
                <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
                  {lesson}
                </ReactMarkdown>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </main>
    </div>
  );
}
