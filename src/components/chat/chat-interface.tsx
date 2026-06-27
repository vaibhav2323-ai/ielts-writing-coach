"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import { ChatHistoryPanel } from "./chat-history-panel";
import { ChatMessage } from "./chat-message";
import { ChatInput } from "./chat-input";
import {
  upsertUser,
  loadChats,
  createChat,
  deleteChat,
  loadMessages,
  saveMessage,
  touchChat,
} from "@/lib/supabase-chat";
import type { Chat } from "@/lib/supabase-chat";

interface UIMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
}

export function ChatInterface() {
  const { user, isLoaded } = useUser();

  const [supabaseUserId, setSupabaseUserId] = useState<string | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<UIMessage[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentChatIdRef = useRef<string | null>(null);
  const supabaseUserIdRef = useRef<string | null>(null);
  currentChatIdRef.current = currentChatId;
  supabaseUserIdRef.current = supabaseUserId;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Init: upsert user, load chats
  useEffect(() => {
    if (!isLoaded || !user) return;
    (async () => {
      try {
        const uid = await upsertUser(
          user.id,
          user.primaryEmailAddress?.emailAddress ?? "",
          user.fullName ?? null,
          user.imageUrl ?? null
        );
        setSupabaseUserId(uid);
        setChats(await loadChats(uid));
      } catch (e) {
        console.error("Supabase init:", e);
      }
    })();
  }, [isLoaded, user]);

  const handleSelectChat = useCallback(async (chat: Chat) => {
    setCurrentChatId(chat.id);
    setMessages([]);
    try {
      const msgs = await loadMessages(chat.id, supabaseUserIdRef.current!);
      setMessages(msgs.map((m) => ({ id: m.id, role: m.role, content: m.content })));
    } catch (e) {
      console.error("Load messages:", e);
    }
  }, []);

  const handleNewChat = useCallback(() => {
    setCurrentChatId(null);
    setMessages([]);
    setInput("");
  }, []);

  const handleDeleteChat = useCallback(async (chatId: string) => {
    if (!supabaseUserIdRef.current) return;
    // Use Supabase UUID (not Clerk user.id) — this is what chats.user_id stores
    try { await deleteChat(chatId, supabaseUserIdRef.current); } catch {}
    setChats((prev) => prev.filter((c) => c.id !== chatId));
    if (currentChatIdRef.current === chatId) {
      setCurrentChatId(null);
      setMessages([]);
    }
  }, []);

  // Core stream function — adds assistant bubble and streams into it
  const streamResponse = useCallback(
    async (
      apiMessages: Array<{ role: "user" | "assistant"; content: string }>,
      chatId: string,
      supUserId: string
    ) => {
      const assistantId = crypto.randomUUID();
      setMessages((prev) => [
        ...prev,
        { id: assistantId, role: "assistant", content: "", isStreaming: true },
      ]);
      setIsStreaming(true);

      let fullContent = "";
      let hadError = false;

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: apiMessages }),
        });

        if (!res.ok) throw new Error(`API error ${res.status}`);

        const reader = res.body!.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          fullContent += decoder.decode(value, { stream: true });
          setMessages((prev) =>
            prev.map((m) => (m.id === assistantId ? { ...m, content: fullContent } : m))
          );
        }
      } catch {
        hadError = true;
        fullContent = "Sorry, something went wrong. Please try again.";
      }

      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId ? { ...m, content: fullContent, isStreaming: false } : m
        )
      );
      setIsStreaming(false);

      if (!hadError && fullContent && supUserId) {
        try {
          await saveMessage(chatId, "assistant", fullContent, supUserId);
          await touchChat(chatId, supUserId);
          setChats(await loadChats(supUserId));
        } catch {}
      }
    },
    []
  );

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isStreaming) return;

      setInput("");

      // Snapshot current messages for the API call before state update
      const historyForApi = messages
        .filter((m) => !m.isStreaming)
        .map((m) => ({ role: m.role, content: m.content }));

      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: "user", content },
      ]);

      const apiMessages = [...historyForApi, { role: "user" as const, content }];

      let chatId = currentChatIdRef.current;
      const supUserId = supabaseUserIdRef.current;

      if (!chatId && supUserId) {
        try {
          const title = content.slice(0, 60) + (content.length > 60 ? "…" : "");
          const newChat = await createChat(supUserId, title);
          chatId = newChat.id;
          setCurrentChatId(newChat.id);
          setChats((prev) => [newChat, ...prev]);
        } catch (e) {
          console.error("Create chat:", e);
        }
      }

      if (supUserId && chatId) {
        try { await saveMessage(chatId, "user", content, supUserId); } catch {}
      }

      if (chatId && supUserId) {
        await streamResponse(apiMessages, chatId, supUserId);
      } else {
        // No Supabase — still stream without saving
        await streamResponse(apiMessages, "__local__", "");
      }
    },
    [isStreaming, messages, streamResponse]
  );

  const handleRegenerate = useCallback(async () => {
    if (isStreaming) return;

    // Find last assistant message index
    let lastAssistantIdx = -1;
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === "assistant") { lastAssistantIdx = i; break; }
    }
    if (lastAssistantIdx === -1) return;

    const apiMessages = messages
      .slice(0, lastAssistantIdx)
      .filter((m) => !m.isStreaming)
      .map((m) => ({ role: m.role, content: m.content }));

    setMessages((prev) => prev.filter((_, i) => i !== lastAssistantIdx));

    const chatId = currentChatIdRef.current;
    const supUserId = supabaseUserIdRef.current;

    await streamResponse(
      apiMessages,
      chatId ?? "__local__",
      supUserId ?? ""
    );
  }, [isStreaming, messages, streamResponse]);

  const isReady = isLoaded && !!user;

  return (
    <div className="flex overflow-hidden h-[calc(100vh-52px)]">
      {/* Sidebar — desktop only */}
      <div className="hidden lg:flex w-60 xl:w-72 shrink-0 flex-col">
        <ChatHistoryPanel
          chats={chats}
          currentChatId={currentChatId}
          onSelectChat={handleSelectChat}
          onNewChat={handleNewChat}
          onDeleteChat={handleDeleteChat}
        />
      </div>

      {/* Main chat column */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {messages.length === 0 ? (
            <WelcomeScreen />
          ) : (
            <div className="max-w-3xl mx-auto py-4">
              {messages.map((msg, i) => (
                <ChatMessage
                  key={msg.id}
                  role={msg.role}
                  content={msg.content}
                  isStreaming={msg.isStreaming}
                  isLast={i === messages.length - 1}
                  onRegenerate={handleRegenerate}
                />
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input — pb-16 lifts it above mobile bottom nav */}
        <div className="shrink-0 pb-16 lg:pb-0">
          <ChatInput
            value={input}
            onChange={setInput}
            onSend={() => sendMessage(input)}
            disabled={isStreaming || !isReady}
          />
        </div>
      </div>
    </div>
  );
}

function WelcomeScreen() {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px] px-6 text-center">
      <div className="h-14 w-14 rounded-2xl bg-blue-500 flex items-center justify-center text-2xl font-black text-white mb-5 shadow-lg shadow-blue-500/20">
        I
      </div>
      <h2 className="text-xl font-semibold text-zinc-100 mb-2">IELTS Writing Coach</h2>
      <p className="text-sm text-zinc-500 max-w-sm leading-relaxed">
        Practice Task 1 or Task 2, get your essay scored and fixed, or learn vocabulary, grammar and linkers. Use the quick buttons below to get started.
      </p>
    </div>
  );
}
