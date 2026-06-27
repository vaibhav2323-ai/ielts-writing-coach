import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit";

function todayDate(): string {
  return new Date().toISOString().split("T")[0];
}

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return new Response("Unauthorized", { status: 401 });

    const rl = rateLimit(userId, "standard");
    if (!rl.allowed) return rateLimitResponse(rl.retryAfter!);

    const date = todayDate();

    const { count: completedToday, error: countErr } = await supabase
      .from("daily_completions")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("date", date);

    if (countErr) {
      console.error("[daily-practice] completions count error:", countErr.code, countErr.message);
    }

    let streak = 0;
    const { data: userRow } = await supabase
      .from("users")
      .select("id")
      .eq("clerk_id", userId)
      .single();

    if (userRow) {
      const { data: progress } = await supabase
        .from("progress")
        .select("streak_days")
        .eq("user_id", userRow.id)
        .single();
      streak = progress?.streak_days ?? 0;
    }

    return NextResponse.json({ streak, completedToday: completedToday ?? 0, date });
  } catch (err) {
    console.error("[daily-practice] error:", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
