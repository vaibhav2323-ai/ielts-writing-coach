import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          clerk_id: string;
          email: string;
          name: string | null;
          avatar_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          clerk_id: string;
          email: string;
          name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
        };
        Update: {
          clerk_id?: string;
          email?: string;
          name?: string | null;
          avatar_url?: string | null;
        };
      };
      chats: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          title?: string;
          updated_at?: string;
        };
      };
      messages: {
        Row: {
          id: string;
          chat_id: string;
          role: "user" | "assistant";
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          chat_id: string;
          role: "user" | "assistant";
          content: string;
          created_at?: string;
        };
        Update: never;
      };
      essays: {
        Row: {
          id: string;
          user_id: string;
          task_type: "task1" | "task2";
          question: string;
          content: string;
          band_score: number | null;
          feedback: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          task_type: "task1" | "task2";
          question: string;
          content: string;
          band_score?: number | null;
          feedback?: string | null;
          created_at?: string;
        };
        Update: {
          band_score?: number | null;
          feedback?: string | null;
        };
      };
      vocabulary: {
        Row: {
          id: string;
          user_id: string;
          word: string;
          meaning: string;
          part_of_speech: string;
          synonyms: string[];
          antonyms: string[];
          example_sentence: string;
          topic: string;
          band_level: string;
          bookmarked: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          word: string;
          meaning: string;
          part_of_speech?: string;
          synonyms?: string[];
          antonyms?: string[];
          example_sentence?: string;
          topic: string;
          band_level: string;
          bookmarked?: boolean;
          created_at?: string;
        };
        Update: {
          bookmarked?: boolean;
        };
      };
      progress: {
        Row: {
          id: string;
          user_id: string;
          essays_completed: number;
          words_learned: number;
          streak_days: number;
          current_band: number | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          essays_completed?: number;
          words_learned?: number;
          streak_days?: number;
          current_band?: number | null;
          updated_at?: string;
        };
        Update: {
          essays_completed?: number;
          words_learned?: number;
          streak_days?: number;
          current_band?: number | null;
          updated_at?: string;
        };
      };
      daily_exercises: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          exercises: unknown;
          streak_counted: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          date: string;
          exercises: unknown;
          streak_counted?: boolean;
          created_at?: string;
        };
        Update: {
          streak_counted?: boolean;
        };
      };
      daily_completions: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          exercise_id: string;
          user_answer: string | null;
          is_correct: boolean;
          completed_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          date: string;
          exercise_id: string;
          user_answer?: string | null;
          is_correct?: boolean;
          completed_at?: string;
        };
        Update: never;
      };
    };
  };
};
