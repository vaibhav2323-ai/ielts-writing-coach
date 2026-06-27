"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, BookOpen, ChevronRight, AlertCircle, GraduationCap } from "lucide-react";
import type { Components } from "react-markdown";

// ─── Constants ────────────────────────────────────────────────────────────────

const TOPICS = [
  "Tenses", "Articles", "Passive Voice", "Conditional Sentences", "Relative Clauses",
  "Modal Verbs", "Conjunctions", "Prepositions", "Subject-Verb Agreement", "Parallelism",
  "Punctuation", "Sentence Structure", "Complex Sentences", "Noun Phrases", "Adverbial Clauses",
  "Comparison Structures", "Inversion", "Cleft Sentences", "Nominalization", "Cohesive Devices",
];

// ─── Special section card wrapper ─────────────────────────────────────────────

function SectionCard({ children, variant }: { children: React.ReactNode; variant: "practice" | "homework" }) {
  const styles = {
    practice: { wrap: "border rounded-lg px-5 py-4 mb-4", borderColor: "#4F46E540", bg: "rgba(79,70,229,0.06)", label: "#4F46E5", icon: "✏️", text: "Practice Exercise" },
    homework: { wrap: "border rounded-lg px-5 py-4 mb-4", borderColor: "#f59e0b40", bg: "rgba(245,158,11,0.06)", label: "#f59e0b", icon: "📝", text: "Homework" },
  };
  const s = styles[variant];
  return (
    <div className={s.wrap} style={{ background: s.bg, borderColor: s.borderColor }}>
      <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: s.label }}>{s.icon} {s.text}</p>
      {children}
    </div>
  );
}

// ─── Markdown components ──────────────────────────────────────────────────────

function buildComponents(): Components {
  const state = { inPractice: false, inHomework: false };

  function classifyHeading(text: string) {
    const t = text.toLowerCase();
    if (t.includes("8.") && t.includes("practice")) { state.inPractice = true; state.inHomework = false; }
    else if (t.includes("9.") && t.includes("homework")) { state.inHomework = true; state.inPractice = false; }
    else if (/^\d+\./.test(text.trim())) { state.inPractice = false; state.inHomework = false; }
  }

  return {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    h2({ children, ...props }: any) {
      const text = String(children ?? "");
      classifyHeading(text);
      return (
        <h2 {...props} className="text-base font-bold mt-7 mb-3 pb-2" style={{
          color: state.inPractice ? "#4F46E5" : state.inHomework ? "#f59e0b" : "white",
          borderBottom: `1px solid ${state.inPractice ? "#4F46E540" : state.inHomework ? "#f59e0b40" : "#222222"}`,
        }}>
          {children}
        </h2>
      );
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    h3({ children, ...props }: any) {
      return <h3 {...props} className="text-sm font-semibold mt-4 mb-2" style={{ color: "#ddd" }}>{children}</h3>;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    p({ children, ...props }: any) {
      return <p {...props} className="text-sm leading-relaxed mb-3" style={{ color: "#ccc" }}>{children}</p>;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ul({ children, ...props }: any) {
      const list = <ul {...props} className="list-disc list-outside space-y-1.5 mb-4 ml-4">{children}</ul>;
      if (state.inPractice) return <SectionCard variant="practice">{list}</SectionCard>;
      if (state.inHomework) return <SectionCard variant="homework">{list}</SectionCard>;
      return list;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ol({ children, ...props }: any) {
      const list = <ol {...props} className="list-decimal list-outside space-y-1.5 mb-4 ml-4">{children}</ol>;
      if (state.inPractice) return <SectionCard variant="practice">{list}</SectionCard>;
      if (state.inHomework) return <SectionCard variant="homework">{list}</SectionCard>;
      return list;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    li({ children, ...props }: any) {
      return <li {...props} className="text-sm leading-relaxed" style={{ color: "#ccc" }}>{children}</li>;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    strong({ children, ...props }: any) {
      return <strong {...props} className="font-semibold" style={{ color: "white" }}>{children}</strong>;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    em({ children, ...props }: any) {
      return <em {...props} className="italic" style={{ color: "#888" }}>{children}</em>;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    code({ children, ...props }: any) {
      return <code {...props} className="px-1.5 py-0.5 rounded text-xs font-mono" style={{ background: "#1a1a1a", color: "#a5b4fc" }}>{children}</code>;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    blockquote({ children, ...props }: any) {
      return <blockquote {...props} className="pl-4 my-3 text-sm italic" style={{ borderLeft: "2px solid #4F46E5", color: "#888" }}>{children}</blockquote>;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    hr(props: any) {
      return <hr {...props} style={{ borderColor: "#222222", margin: "20px 0" }} />;
    },
  };
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function LessonSkeleton() {
  return (
    <div className="space-y-5 animate-pulse">
      <div className="h-5 rounded w-48" style={{ background: "#1a1a1a" }} />
      <div className="space-y-2">
        {[1, 5/6, 4/6].map((w, i) => <div key={i} className="h-3 rounded" style={{ background: "#1a1a1a", width: `${w * 100}%` }} />)}
      </div>
      <div className="h-4 rounded w-36 mt-6" style={{ background: "#1a1a1a" }} />
      <div className="space-y-2">
        {[1, 3/4, 5/6, 2/3].map((w, i) => <div key={i} className="h-3 rounded" style={{ background: "#1a1a1a", width: `${w * 100}%` }} />)}
      </div>
      <div className="h-4 rounded w-40 mt-6" style={{ background: "#1a1a1a" }} />
      <div className="space-y-2">
        {[1, 1, 4/5].map((w, i) => <div key={i} className="h-3 rounded" style={{ background: "#1a1a1a", width: `${w * 100}%` }} />)}
      </div>
      <div className="h-28 rounded-lg mt-4" style={{ background: "#1a1a1a" }} />
      <div className="h-20 rounded-lg" style={{ background: "#111111" }} />
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
    setActiveTopic(topic); setLesson(null); setError(null); setLoading(true);
    try {
      const res = await fetch("/api/grammar-lesson", {
        method: "POST", headers: { "Content-Type": "application/json" },
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

  const mdComponents = buildComponents();

  return (
    <div className="flex" style={{ minHeight: "calc(100vh - 48px)" }}>
      {/* ── Sidebar ── */}
      <aside className="w-56 shrink-0 overflow-y-auto py-5 px-3" style={{ borderRight: "1px solid #1a1a1a" }}>
        <p className="text-[10px] font-semibold uppercase tracking-widest px-2 mb-3" style={{ color: "#444" }}>Grammar Topics</p>
        <nav className="space-y-0.5">
          {TOPICS.map((topic) => {
            const isActive = activeTopic === topic;
            return (
              <button
                key={topic}
                onClick={() => handleTopicClick(topic)}
                disabled={loading}
                className="w-full text-left flex items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-sm transition-colors group"
                style={{
                  background: isActive ? "rgba(79,70,229,0.15)" : "transparent",
                  color: isActive ? "#a5b4fc" : "#888",
                  opacity: loading && !isActive ? 0.4 : 1,
                  cursor: loading && !isActive ? "not-allowed" : "pointer",
                }}
                onMouseEnter={(e) => { if (!isActive && !loading) (e.currentTarget as HTMLElement).style.color = "#ccc"; }}
                onMouseLeave={(e) => { if (!isActive) (e.currentTarget as HTMLElement).style.color = "#888"; }}
              >
                <span className="truncate">{topic}</span>
                {isActive && loading
                  ? <Loader2 className="h-3 w-3 animate-spin shrink-0 opacity-70" />
                  : <ChevronRight className={`h-3 w-3 shrink-0 transition-opacity ${isActive ? "opacity-70" : "opacity-0 group-hover:opacity-40"}`} />
                }
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
              <div className="p-4 rounded-2xl" style={{ background: "#111111" }}>
                <GraduationCap className="h-8 w-8" style={{ color: "#555" }} />
              </div>
              <div>
                <p className="text-sm font-medium mb-1" style={{ color: "#888" }}>Select a grammar topic</p>
                <p className="text-xs max-w-xs" style={{ color: "#555" }}>
                  Choose any topic from the sidebar to get an instant AI-generated IELTS grammar lesson with examples, exercises, and homework.
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-2 max-w-xs mt-1">
                {["Passive Voice", "Tenses", "Inversion"].map((t) => (
                  <button key={t} onClick={() => handleTopicClick(t)}
                    className="text-xs px-3 py-1.5 rounded-full transition-colors"
                    style={{ background: "#111111", color: "#888", border: "1px solid #222222" }}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-start gap-3 rounded-lg p-4" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
              <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-400 mb-0.5">Failed to load lesson</p>
                <p className="text-xs" style={{ color: "#f87171", opacity: 0.7 }}>{error}</p>
              </div>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div>
              <div className="flex items-center gap-3 mb-7">
                <div className="p-1.5 rounded-lg" style={{ background: "rgba(79,70,229,0.1)" }}>
                  <BookOpen className="h-4 w-4" style={{ color: "#4F46E5" }} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" style={{ color: "#4F46E5" }} />
                    <span className="text-sm font-medium" style={{ color: "#ccc" }}>
                      Generating lesson on <span style={{ color: "#4F46E5" }}>{activeTopic}</span>…
                    </span>
                  </div>
                  <p className="text-xs mt-0.5" style={{ color: "#555" }}>This takes a few seconds</p>
                </div>
              </div>
              <LessonSkeleton />
            </div>
          )}

          {/* Lesson */}
          <AnimatePresence mode="wait">
            {lesson && !loading && (
              <motion.div key={activeTopic} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                <div className="flex items-center gap-3 mb-6 pb-5" style={{ borderBottom: "1px solid #222222" }}>
                  <div className="p-2 rounded-lg shrink-0" style={{ background: "rgba(79,70,229,0.1)" }}>
                    <BookOpen className="h-4 w-4" style={{ color: "#4F46E5" }} />
                  </div>
                  <div>
                    <h1 className="text-lg font-bold text-white" style={{ letterSpacing: "-0.02em" }}>{activeTopic}</h1>
                    <p className="text-xs" style={{ color: "#555" }}>IELTS Academic Grammar Lesson</p>
                  </div>
                </div>
                <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>{lesson}</ReactMarkdown>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
