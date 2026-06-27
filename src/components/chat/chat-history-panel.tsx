"use client";

import { Plus, MessageSquare, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Chat } from "@/lib/supabase-chat";

interface ChatHistoryPanelProps {
  chats: Chat[];
  currentChatId: string | null;
  onSelectChat: (chat: Chat) => void;
  onNewChat: () => void;
  onDeleteChat: (id: string) => void;
}

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(diff / 3_600_000);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(diff / 86_400_000);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
}

export function ChatHistoryPanel({
  chats,
  currentChatId,
  onSelectChat,
  onNewChat,
  onDeleteChat,
}: ChatHistoryPanelProps) {
  return (
    <div className="flex flex-col h-full border-r border-zinc-800/60 bg-zinc-950">
      {/* Header */}
      <div className="flex h-[52px] items-center justify-between px-3 border-b border-zinc-800/60 shrink-0">
        <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-widest">
          History
        </span>
        <button
          onClick={onNewChat}
          className="flex h-6 w-6 items-center justify-center rounded-md text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
          title="New chat"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto py-1.5 px-1.5">
        {chats.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center px-3">
            <MessageSquare className="h-5 w-5 text-zinc-700 mb-2" />
            <p className="text-[11px] text-zinc-600">No chats yet</p>
          </div>
        ) : (
          <ul className="space-y-px">
            {chats.map((chat) => (
              <li key={chat.id} className="group relative">
                <button
                  onClick={() => onSelectChat(chat)}
                  className={cn(
                    "w-full text-left px-2.5 py-2 rounded-md transition-colors",
                    currentChatId === chat.id
                      ? "bg-zinc-800 text-zinc-100"
                      : "text-zinc-500 hover:bg-zinc-800/50 hover:text-zinc-200"
                  )}
                >
                  <p className="text-xs font-medium truncate pr-5 leading-snug">
                    {chat.title}
                  </p>
                  <p className="text-[10px] text-zinc-600 mt-0.5">
                    {relativeTime(chat.updated_at)}
                  </p>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteChat(chat.id);
                  }}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 h-5 w-5 flex items-center justify-center rounded text-zinc-700 hover:text-red-400 hover:bg-zinc-800 opacity-0 group-hover:opacity-100 transition-all"
                  title="Delete chat"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
