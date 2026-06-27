import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { sanitizeInput, MAX_LENGTHS } from "@/lib/sanitize";

function todayDate(): string {
  return new Date().toISOString().split("T")[0];
}

const VALID_EXERCISE_TYPES = new Set([
  "task2", "task1", "grammar", "vocabulary", "linker", "paraphrase", "error", "mixed",
]);

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return new Response("Unauthorized", { status: 401 });

    const rl = rateLimit(userId, "standard");
    if (!rl.allowed) return rateLimitResponse(rl.retryAfter!);

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Bad request" }, { status: 400 });
    }

    const { exerciseType, topic, userAnswer, isCorrect } = body as Record<string, unknown>;

    // Validate exerciseType against allowlist
    if (typeof exerciseType !== "string" || !VALID_EXERCISE_TYPES.has(exerciseType)) {
      return NextResponse.json({ error: "Invalid exerciseType" }, { status: 400 });
    }

    // Sanitize userAnswer (may be empty for skipped exercises)
    let sanitizedAnswer = "";
    if (typeof userAnswer === "string" && userAnswer.trim()) {
      try {
        sanitizedAnswer = sanitizeInput(userAnswer, MAX_LENGTHS.answer);
      } catch {
        return NextResponse.json({ error: "Invalid input detected" }, { status: 400 });
      }
    }

    // isCorrect must be boolean
    const correct = isCorrect === true;

    // topic is informational only — sanitize it
    const sanitizedTopic = typeof topic === "string"
      ? topic.slice(0, 200).replace(/[<>]/g, "")
      : "unknown";

    const date = todayDate();

    const { count: prevCount } = await supabase
      .from("daily_completions")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("date", date);

    const isFirstToday = (prevCount ?? 0) === 0;

    const { error: insertErr } = await supabase.from("daily_completions").insert({
      user_id: userId,
      date,
      exercise_id: `${exerciseType}_${Date.now()}`,
      user_answer: sanitizedAnswer,
      is_correct: correct,
    });

    if (insertErr) {
      console.error("[submit] insert error:", insertErr.code, insertErr.message);
    }

    // Increment streak on first completion of the day
    let streakUpdated = false;
    if (isFirstToday) {
      const { data: userRow } = await supabase
        .from("users")
        .select("id")
        .eq("clerk_id", userId)
        .single();

      if (userRow) {
        const { data: progress } = await supabase
          .from("progress")
          .select("streak_days, essays_completed, words_learned, current_band")
          .eq("user_id", userRow.id)
          .single();

        const { error: upsertErr } = await supabase.from("progress").upsert(
          {
            user_id: userRow.id,
            streak_days: (progress?.streak_days ?? 0) + 1,
            essays_completed: progress?.essays_completed ?? 0,
            words_learned: progress?.words_learned ?? 0,
            current_band: progress?.current_band ?? null,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id" }
        );

        if (upsertErr) {
          console.error("[submit] streak upsert error:", upsertErr.code, upsertErr.message);
        } else {
          streakUpdated = true;
        }
      }
    }

    // intentionally not used in response — just for logging
    void sanitizedTopic;

    const { count: newCount } = await supabase
      .from("daily_completions")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("date", date);

    return NextResponse.json({ completedToday: newCount ?? 0, streakUpdated });
  } catch (err) {
    console.error("[submit] error:", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
