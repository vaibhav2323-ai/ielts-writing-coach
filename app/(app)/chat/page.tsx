"use client"

import { useRef, useState } from "react"
import {
  ArrowUp,
  PenLine,
  Sparkles,
  Paperclip,
  ClipboardCheck,
  Lightbulb,
  BookOpen,
  SpellCheck,
} from "lucide-react"
import { useUser } from "@clerk/nextjs"
import { cn } from "@/lib/utils"

type Message = { role: "user" | "assistant"; content: string }

const suggestions = [
  { icon: ClipboardCheck, label: "Evaluate my Task 2 essay" },
  { icon: Lightbulb, label: "Give me ideas for a question" },
  { icon: SpellCheck, label: "Fix the grammar in a paragraph" },
  { icon: BookOpen, label: "Teach me band-9 vocabulary" },
]

export default function ChatPage() {
  const { user } = useUser()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Initials for the user avatar
  const initials = user?.fullName
    ? user.fullName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "ME"

  async function send(text: string) {
    const content = text.trim()
    if (!content || loading) return

    const userMsg: Message = { role: "user", content }
    const next = [...messages, userMsg]
    setMessages(next)
    setInput("")
    setLoading(true)

    try {
      // ── calls your existing /api/chat route ──────────────────────────────
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      })
      const text = await res.text()
      const reply: Message = {
        role: "assistant",
        content: text || "Sorry, no response.",
      }
      setMessages((m) => [...m, reply])
    } catch {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "Something went wrong. Please try again." },
      ])
    } finally {
      setLoading(false)
      requestAnimationFrame(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" })
      })
    }
  }

  const empty = messages.length === 0

  return (
    <div className="flex h-[calc(100vh-3.5rem)] flex-col">
      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl px-4 py-8">
          {empty ? (
            <div className="flex flex-col items-center pt-16 text-center">
              <div className="flex size-12 items-center justify-center rounded-lg bg-primary">
                <Sparkles className="size-6 text-primary-foreground" strokeWidth={1.75} />
              </div>
              <h2 className="mt-4 text-xl font-semibold tracking-tight text-foreground">
                How can I help with your writing?
              </h2>
              <p className="mt-1 text-[13px] text-muted-foreground">
                Ask anything about IELTS Writing Task 1 and Task 2.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-7">
              {messages.map((msg, i) => (
                <div key={i} className="flex gap-3.5">
                  <div
                    className={cn(
                      "flex size-7 shrink-0 items-center justify-center rounded-lg text-xs font-semibold",
                      msg.role === "assistant"
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-foreground",
                    )}
                  >
                    {msg.role === "assistant" ? (
                      <PenLine className="size-4" strokeWidth={2} />
                    ) : (
                      initials
                    )}
                  </div>
                  <div className="min-w-0 flex-1 pt-0.5">
                    <p className="mb-1 text-[12px] font-medium text-muted-foreground">
                      {msg.role === "assistant" ? "Lexia Coach" : (user?.fullName ?? "You")}
                    </p>
                    <div className="whitespace-pre-wrap text-[14px] leading-relaxed text-foreground/90">
                      {msg.content}
                    </div>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex gap-3.5">
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <PenLine className="size-4" strokeWidth={2} />
                  </div>
                  <div className="min-w-0 flex-1 pt-0.5">
                    <p className="mb-1 text-[12px] font-medium text-muted-foreground">Lexia Coach</p>
                    <div className="flex gap-1 pt-2">
                      <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:0ms]" />
                      <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:150ms]" />
                      <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:300ms]" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Composer */}
      <div className="border-t border-border bg-background px-4 py-4">
        <div className="mx-auto max-w-3xl">
          {empty && (
            <div className="mb-3 flex flex-wrap justify-center gap-2">
              {suggestions.map((s) => (
                <button
                  key={s.label}
                  onClick={() => send(s.label)}
                  className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 text-[12px] text-muted-foreground transition-colors hover:border-[#333] hover:text-foreground"
                >
                  <s.icon className="size-3.5 text-primary" strokeWidth={1.75} />
                  {s.label}
                </button>
              ))}
            </div>
          )}
          <form
            onSubmit={(e) => {
              e.preventDefault()
              send(input)
            }}
            className="flex items-end gap-2 rounded-lg border border-border bg-card p-2 focus-within:border-[#333]"
          >
            <button
              type="button"
              className="flex size-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              aria-label="Attach"
            >
              <Paperclip className="size-4" strokeWidth={1.75} />
            </button>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  send(input)
                }
              }}
              rows={1}
              placeholder="Message Lexia Coach…"
              className="max-h-40 flex-1 resize-none bg-transparent py-2 text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-40"
              aria-label="Send"
            >
              <ArrowUp className="size-4" strokeWidth={2.25} />
            </button>
          </form>
          <p className="mt-2 text-center text-[11px] text-muted-foreground">
            Lexia can make mistakes. Verify band-critical advice.
          </p>
        </div>
      </div>
    </div>
  )
}
