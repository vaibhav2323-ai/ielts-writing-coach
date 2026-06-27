import { auth } from "@clerk/nextjs/server";
import Groq from "groq-sdk";
import { NextRequest, NextResponse } from "next/server";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { sanitizeInput, wrapUserInput, ANTI_INJECTION_FOOTER, MAX_LENGTHS } from "@/lib/sanitize";
import { supabase } from "@/lib/supabase";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const SYSTEM_PROMPT = `You are an IELTS examiner. Evaluate the essay provided between [USER INPUT START] and [USER INPUT END] and return ONLY a JSON object with these exact fields: overall_band (number 1-9), task_achievement (object with score and feedback), coherence_cohesion (object with score and feedback), lexical_resource (object with score and feedback), grammatical_range (object with score and feedback), mistakes (array of objects with original and correction), improved_essay (string), band9_version (string). Return only JSON, no extra text.${ANTI_INJECTION_FOOTER}`;

const VALID_TASK_TYPES = new Set(["task1", "task2"]);

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return new Response("Unauthorized", { status: 401 });

    const rl = rateLimit(userId, "expensive");
    if (!rl.allowed) return rateLimitResponse(rl.retryAfter!);

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Bad request" }, { status: 400 });
    }

    const { essay, taskType, question } = body as Record<string, unknown>;

    if (typeof essay !== "string" || !essay.trim()) {
      return NextResponse.json({ error: "Essay is required" }, { status: 400 });
    }
    if (typeof taskType !== "string" || !VALID_TASK_TYPES.has(taskType)) {
      return NextResponse.json({ error: "taskType must be task1 or task2" }, { status: 400 });
    }

    let sanitizedEssay: string;
    let sanitizedQuestion = "";
    try {
      sanitizedEssay = sanitizeInput(essay, MAX_LENGTHS.essay);
      if (typeof question === "string" && question.trim()) {
        sanitizedQuestion = sanitizeInput(question, MAX_LENGTHS.question);
      }
    } catch {
      return NextResponse.json({ error: "Invalid input detected" }, { status: 400 });
    }

    const taskLabel = taskType === "task1" ? "Academic Task 1" : "Academic Task 2";
    const userContent = [
      `Task Type: ${taskLabel}`,
      sanitizedQuestion ? `Question: ${wrapUserInput(sanitizedQuestion)}` : null,
      `\nEssay:\n${wrapUserInput(sanitizedEssay)}`,
    ]
      .filter(Boolean)
      .join("\n");

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userContent },
      ],
      stream: false,
      max_tokens: 4096,
      temperature: 0.3,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content ?? "{}";
    const result = JSON.parse(content);

    // Save to essays table server-side (best-effort — evaluation returned regardless)
    let saved = false;
    try {
      const { data: userRow } = await supabase
        .from("users")
        .select("id")
        .eq("clerk_id", userId)
        .single();

      if (userRow) {
        const { error: dbErr } = await supabase.from("essays").insert({
          user_id: userRow.id,
          task_type: taskType as "task1" | "task2",
          question: sanitizedQuestion || "No question provided",
          content: sanitizedEssay,
          band_score: typeof result.overall_band === "number" ? result.overall_band : null,
          feedback: JSON.stringify(result),
        });
        if (!dbErr) saved = true;
      }
    } catch {
      // Non-fatal: essay still returned to client
    }

    return NextResponse.json({ ...result, saved });
  } catch (err) {
    console.error("[evaluate] error:", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
