import { supabase } from "./supabase";

export interface Chat {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface DBMessage {
  id: string;
  chat_id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

export async function upsertUser(
  clerkId: string,
  email: string,
  name: string | null,
  avatarUrl: string | null
): Promise<string> {
  const { data, error } = await supabase
    .from("users")
    .upsert(
      { clerk_id: clerkId, email, name, avatar_url: avatarUrl },
      { onConflict: "clerk_id" }
    )
    .select("id")
    .single();

  if (error) throw error;
  return data.id;
}

export async function loadChats(userId: string): Promise<Chat[]> {
  const { data, error } = await supabase
    .from("chats")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function createChat(userId: string, title: string): Promise<Chat> {
  const { data, error } = await supabase
    .from("chats")
    .insert({ user_id: userId, title })
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

export async function deleteChat(chatId: string, userId: string): Promise<void> {
  // Filter by both id AND user_id to prevent cross-user deletion
  const { error } = await supabase
    .from("chats")
    .delete()
    .eq("id", chatId)
    .eq("user_id", userId);
  if (error) throw error;
}

/** Loads messages only after verifying the chat belongs to userId. */
export async function loadMessages(chatId: string, userId: string): Promise<DBMessage[]> {
  // Ownership check: confirm this chat belongs to the requesting user
  const { data: chat } = await supabase
    .from("chats")
    .select("id")
    .eq("id", chatId)
    .eq("user_id", userId)
    .single();

  if (!chat) return []; // Chat not found or doesn't belong to this user

  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("chat_id", chatId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

/** Saves a message only after verifying the chat belongs to userId. */
export async function saveMessage(
  chatId: string,
  role: "user" | "assistant",
  content: string,
  userId: string
): Promise<DBMessage | null> {
  // Ownership check: confirm this chat belongs to the requesting user
  const { data: chat } = await supabase
    .from("chats")
    .select("id")
    .eq("id", chatId)
    .eq("user_id", userId)
    .single();

  if (!chat) return null; // Reject silently to avoid breaking the UI flow

  const { data, error } = await supabase
    .from("messages")
    .insert({ chat_id: chatId, role, content })
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

/** Updates chat timestamp only if it belongs to userId. */
export async function touchChat(chatId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from("chats")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", chatId)
    .eq("user_id", userId);
  if (error) throw error;
}
