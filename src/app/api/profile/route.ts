import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return new Response("Unauthorized", { status: 401 });

    const rl = rateLimit(userId, "standard");
    if (!rl.allowed) return rateLimitResponse(rl.retryAfter!);

    const { data: userRow } = await supabase
      .from("users")
      .select("id")
      .eq("clerk_id", userId)
      .single();

    if (!userRow) {
      return NextResponse.json({
        essays_completed: 0,
        words_learned: 0,
        streak_days: 0,
        current_band: null,
      });
    }

    const { data: progress } = await supabase
      .from("progress")
      .select("essays_completed, words_learned, streak_days, current_band")
      .eq("user_id", userRow.id)
      .single();

    return NextResponse.json({
      essays_completed: progress?.essays_completed ?? 0,
      words_learned: progress?.words_learned ?? 0,
      streak_days: progress?.streak_days ?? 0,
      current_band: progress?.current_band ?? null,
    });
  } catch (err) {
    console.error("[profile] error:", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
