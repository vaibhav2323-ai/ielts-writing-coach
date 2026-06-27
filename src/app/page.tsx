"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2 } from "lucide-react";

const features = [
  {
    icon: "✍️",
    title: "Practice Tasks",
    description: "Authentic Task 1 & Task 2 prompts with Band 9 outlines and model answers.",
    accent: "#6366f1",
  },
  {
    icon: "⚡",
    title: "Instant Feedback",
    description: "AI-scored essays with detailed analysis of coherence, vocabulary, and grammar.",
    accent: "#8b5cf6",
  },
  {
    icon: "📈",
    title: "Track Progress",
    description: "Watch your band score climb over time with streak tracking and analytics.",
    accent: "#10b981",
  },
];

const highlights = [
  "Grammar & vocabulary quizzes",
  "Linker practice with explanations",
  "Essay paraphrasing exercises",
  "Error correction training",
];

export default function HomePage() {
  return (
    <main
      className="min-h-screen"
      style={{ background: "#0a0a0f" }}
    >
      {/* Nav */}
      <nav
        className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto"
        style={{ borderBottom: "1px solid #1e1e2e" }}
      >
        <div className="flex items-center gap-2.5">
          <span
            className="flex h-7 w-7 items-center justify-center rounded-lg"
            style={{
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              boxShadow: "0 2px 10px rgba(99,102,241,0.4)",
            }}
          >
            <span style={{ fontSize: "11px", fontWeight: 900, color: "white", lineHeight: 1 }}>
              I
            </span>
          </span>
          <span
            className="font-bold text-sm gradient-text"
            style={{ letterSpacing: "-0.02em" }}
          >
            IELTS Writing
          </span>
        </div>

        <div className="flex gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/sign-in">Sign in</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/sign-up">Get started</Link>
          </Button>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex flex-col items-center text-center px-6 pt-24 pb-20 max-w-3xl mx-auto">
        {/* Badge */}
        <motion.div
          className="mb-6 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium"
          style={{
            background: "rgba(99,102,241,0.12)",
            border: "1px solid rgba(99,102,241,0.25)",
            color: "#a5b4fc",
          }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: "#6366f1" }}
          />
          AI-powered IELTS preparation
        </motion.div>

        <motion.h1
          className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-5"
          style={{ color: "#f8f8ff", letterSpacing: "-0.03em", lineHeight: 1.1 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
        >
          Ace your IELTS{" "}
          <span className="gradient-text">Writing</span>{" "}
          band score
        </motion.h1>

        <motion.p
          className="text-base sm:text-lg mb-8 max-w-xl"
          style={{ color: "#6b7280", lineHeight: 1.7 }}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.12 }}
        >
          Practice real exam tasks, get AI-powered feedback, and track your
          progress from Band 5 to Band 9 — all in one focused workspace.
        </motion.p>

        <motion.div
          className="flex flex-wrap gap-3 justify-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Button size="lg" asChild>
            <Link href="/sign-up" className="flex items-center gap-2">
              Start for free
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/sign-in">Sign in</Link>
          </Button>
        </motion.div>

        {/* Micro proof */}
        <motion.div
          className="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
        >
          {highlights.map((h) => (
            <span
              key={h}
              className="flex items-center gap-1.5 text-xs"
              style={{ color: "#3d3d58" }}
            >
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500/70" />
              {h}
            </span>
          ))}
        </motion.div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              className="rounded-xl p-6 card-interactive"
              style={{
                background: "#111118",
                border: "1px solid #1e1e2e",
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.28 + i * 0.08 }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-4"
                style={{ background: `${f.accent}18` }}
              >
                {f.icon}
              </div>

              <h3
                className="text-sm font-semibold mb-2"
                style={{ color: "#f0f0fa", letterSpacing: "-0.01em" }}
              >
                {f.title}
              </h3>

              <p className="text-xs leading-relaxed" style={{ color: "#6b7280" }}>
                {f.description}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA strip */}
      <section className="max-w-5xl mx-auto px-6 pb-24">
        <motion.div
          className="relative rounded-2xl p-8 sm:p-12 overflow-hidden text-center"
          style={{
            background: "linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(139,92,246,0.08) 100%)",
            border: "1px solid rgba(99,102,241,0.2)",
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          {/* Glow */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.12) 0%, transparent 70%)",
            }}
          />

          <h2
            className="text-2xl sm:text-3xl font-bold mb-3 relative"
            style={{ color: "#f8f8ff", letterSpacing: "-0.02em" }}
          >
            Ready to reach Band 9?
          </h2>
          <p className="text-sm mb-6 relative" style={{ color: "#6b7280" }}>
            Join thousands of IELTS candidates improving their writing score every day.
          </p>
          <Button size="lg" asChild className="relative">
            <Link href="/sign-up">Get started free</Link>
          </Button>
        </motion.div>
      </section>
    </main>
  );
}
