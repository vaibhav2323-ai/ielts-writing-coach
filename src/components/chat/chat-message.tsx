"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Copy, Check, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
  isLast?: boolean;
  onRegenerate?: () => void;
}

export function ChatMessage({
  role,
  content,
  isStreaming,
  isLast,
  onRegenerate,
}: ChatMessageProps) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn("group flex gap-3 px-4 py-3", role === "user" && "flex-row-reverse")}>
      {/* Avatar */}
      <div
        className={cn(
          "h-7 w-7 shrink-0 rounded-full flex items-center justify-center text-[11px] font-black mt-0.5",
          role === "assistant" ? "bg-blue-500 text-white" : "bg-zinc-700 text-zinc-300"
        )}
      >
        {role === "assistant" ? "AI" : "U"}
      </div>

      {/* Bubble */}
      <div className={cn("flex flex-col gap-1.5 max-w-[85%]", role === "user" && "items-end")}>
        <div
          className={cn(
            "rounded-2xl px-4 py-3 text-sm",
            role === "user"
              ? "bg-zinc-800 text-zinc-100 rounded-tr-sm"
              : "text-zinc-200 rounded-tl-sm"
          )}
        >
          {role === "user" ? (
            <p className="whitespace-pre-wrap leading-relaxed">{content}</p>
          ) : (
            <>
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  p: ({ children }) => (
                    <p className="mb-3 last:mb-0 leading-relaxed text-zinc-200">{children}</p>
                  ),
                  h1: ({ children }) => (
                    <h1 className="text-base font-bold text-zinc-100 mt-5 mb-2 first:mt-0 border-b border-zinc-700/50 pb-1">
                      {children}
                    </h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-sm font-bold text-zinc-100 mt-4 mb-2 first:mt-0">
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-sm font-semibold text-blue-400 mt-3 mb-1 first:mt-0">
                      {children}
                    </h3>
                  ),
                  ul: ({ children }) => (
                    <ul className="list-disc pl-5 mb-3 space-y-1 text-zinc-300">{children}</ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal pl-5 mb-3 space-y-1 text-zinc-300">{children}</ol>
                  ),
                  li: ({ children }) => (
                    <li className="leading-relaxed">{children}</li>
                  ),
                  strong: ({ children }) => (
                    <strong className="font-semibold text-zinc-100">{children}</strong>
                  ),
                  em: ({ children }) => (
                    <em className="italic text-zinc-300">{children}</em>
                  ),
                  pre: ({ children }) => (
                    <pre className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 mb-3 overflow-x-auto">
                      {children}
                    </pre>
                  ),
                  code: ({ className, children }) => {
                    const isBlock = Boolean(className);
                    return isBlock ? (
                      <code className="text-xs font-mono text-zinc-300 block">{children}</code>
                    ) : (
                      <code className="bg-zinc-800 text-blue-400 rounded px-1 py-0.5 text-xs font-mono">
                        {children}
                      </code>
                    );
                  },
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-2 border-blue-500 pl-3 italic text-zinc-400 mb-3 bg-zinc-900/40 py-1 rounded-r">
                      {children}
                    </blockquote>
                  ),
                  table: ({ children }) => (
                    <div className="overflow-x-auto mb-3 rounded-lg border border-zinc-800">
                      <table className="min-w-full border-collapse text-xs">{children}</table>
                    </div>
                  ),
                  thead: ({ children }) => <thead>{children}</thead>,
                  th: ({ children }) => (
                    <th className="border-b border-zinc-700 px-3 py-2 text-left font-semibold text-zinc-200 bg-zinc-800/60">
                      {children}
                    </th>
                  ),
                  td: ({ children }) => (
                    <td className="border-b border-zinc-800/60 px-3 py-2 text-zinc-300">
                      {children}
                    </td>
                  ),
                  hr: () => <hr className="border-zinc-700 my-4" />,
                }}
              >
                {content}
              </ReactMarkdown>
              {isStreaming && (
                <span className="inline-block w-1.5 h-4 bg-blue-400 ml-0.5 rounded-sm animate-pulse align-middle" />
              )}
            </>
          )}
        </div>

        {/* Action buttons */}
        {!isStreaming && content && (
          <div
            className={cn(
              "flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity",
              role === "user" && "flex-row-reverse"
            )}
          >
            <button
              onClick={copy}
              title="Copy"
              className="h-6 w-6 flex items-center justify-center rounded text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800 transition-colors"
            >
              {copied ? (
                <Check className="h-3 w-3 text-emerald-400" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </button>
            {role === "assistant" && isLast && onRegenerate && (
              <button
                onClick={onRegenerate}
                title="Regenerate"
                className="h-6 w-6 flex items-center justify-center rounded text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800 transition-colors"
              >
                <RefreshCw className="h-3 w-3" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
