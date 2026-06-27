"use client";

import { useRef } from "react";
import { Send } from "lucide-react";
import { cn } from "@/lib/utils";

const QUICK_ACTIONS = [
  {
    label: "Task 1 Practice",
    prompt: "Give me a Task 1 practice question with a graph or chart to analyse and write about.",
  },
  {
    label: "Task 2 Practice",
    prompt: "Give me a Task 2 essay question to practise.",
  },
  {
    label: "Check My Essay",
    prompt:
      "Please check my essay, give me a band score for each criterion, fix all mistakes, and provide a Band 9 version:\n\n",
  },
  {
    label: "Synonym Quiz",
    prompt: "Give me a synonym quiz for high-frequency IELTS academic vocabulary.",
  },
  {
    label: "Grammar Drill",
    prompt: "Give me a grammar drill focused on the most common IELTS writing mistakes.",
  },
  {
    label: "Linker Practice",
    prompt:
      "Teach me how to use linkers and cohesive devices correctly in IELTS Writing with examples.",
  },
  {
    label: "Vocabulary Quiz",
    prompt: "Give me a vocabulary quiz for IELTS Academic Writing Task 2.",
  },
  {
    label: "Paraphrasing",
    prompt:
      "Teach me paraphrasing techniques for IELTS Task 2 introductions with practice exercises.",
  },
];

interface ChatInputProps {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  disabled?: boolean;
}

export function ChatInput({ value, onChange, onSend, disabled }: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!disabled && value.trim()) onSend();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 180) + "px";
  };

  const handleQuickAction = (prompt: string) => {
    onChange(prompt);
    setTimeout(() => {
      const ta = textareaRef.current;
      if (!ta) return;
      ta.focus();
      ta.style.height = "auto";
      ta.style.height = Math.min(ta.scrollHeight, 180) + "px";
      ta.selectionStart = ta.selectionEnd = prompt.length;
    }, 0);
  };

  return (
    <div className="border-t border-zinc-800/60 bg-zinc-950 px-4 pt-3 pb-4">
      {/* Quick action chips */}
      <div className="flex gap-1.5 flex-wrap mb-3">
        {QUICK_ACTIONS.map((a) => (
          <button
            key={a.label}
            onClick={() => handleQuickAction(a.prompt)}
            disabled={disabled}
            className="text-[11px] font-medium px-2.5 py-1 rounded-full border border-zinc-700/60 text-zinc-500 hover:border-blue-500/50 hover:text-blue-400 hover:bg-blue-500/5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {a.label}
          </button>
        ))}
      </div>

      {/* Textarea + send button */}
      <div className="flex items-end gap-2 rounded-xl border border-zinc-700/60 bg-zinc-900 px-3 py-2.5 focus-within:border-zinc-600 transition-colors">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Ask your IELTS coach anything… (Enter to send · Shift+Enter for new line)"
          rows={1}
          disabled={disabled}
          className="flex-1 resize-none bg-transparent text-sm text-zinc-200 placeholder:text-zinc-600 outline-none leading-6 min-h-[24px] max-h-[180px] disabled:opacity-50"
        />
        <button
          onClick={onSend}
          disabled={disabled || !value.trim()}
          className={cn(
            "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors mb-0.5",
            value.trim() && !disabled
              ? "bg-blue-500 text-white hover:bg-blue-600"
              : "bg-zinc-800 text-zinc-600 cursor-not-allowed"
          )}
        >
          <Send className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
