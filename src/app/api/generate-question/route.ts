import { auth } from "@clerk/nextjs/server";
import Groq from "groq-sdk";
import { NextRequest, NextResponse } from "next/server";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { sanitizeInput, wrapUserInput, ANTI_INJECTION_FOOTER, MAX_LENGTHS } from "@/lib/sanitize";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const VALID_TASK_TYPES = new Set(["task1", "task2"]);

const SYSTEM_PROMPT = `You are a senior IELTS examiner who has written questions for Cambridge IELTS books 10 to 19. Generate one completely original question that is indistinguishable from real Cambridge IELTS exam questions. Match the exact style, difficulty, academic vocabulary, sentence structure, and format of Cambridge IELTS. For Task 1: describe specific realistic data with actual numbers, percentages, years, and locations. For Task 2: use sophisticated academic phrasing, real-world complex issues, and always include the exact instruction line used in Cambridge exams. Return only the question text, nothing else. Never repeat the same question twice.${ANTI_INJECTION_FOOTER}`;

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return new Response("Unauthorized", { status: 401 });

    const rl = rateLimit(userId, "generator");
    if (!rl.allowed) return rateLimitResponse(rl.retryAfter!);

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Bad request" }, { status: 400 });
    }

    const { task_type, sub_type, topic } = body as Record<string, unknown>;

    if (typeof task_type !== "string" || !VALID_TASK_TYPES.has(task_type)) {
      return NextResponse.json({ error: "task_type must be task1 or task2" }, { status: 400 });
    }
    if (typeof topic !== "string" || !topic.trim()) {
      return NextResponse.json({ error: "topic is required" }, { status: 400 });
    }

    let sanitizedTopic: string;
    let sanitizedSubType = "";
    try {
      sanitizedTopic = sanitizeInput(topic, MAX_LENGTHS.topic);
      if (typeof sub_type === "string" && sub_type.trim()) {
        sanitizedSubType = sanitizeInput(sub_type, MAX_LENGTHS.topic);
      }
    } catch {
      return NextResponse.json({ error: "Invalid input detected" }, { status: 400 });
    }

    const taskLabel = task_type === "task1" ? "Academic Task 1" : "Academic Task 2";
    const subLine =
      task_type === "task1"
        ? sanitizedSubType ? `Chart / diagram type: ${sanitizedSubType}` : null
        : sanitizedSubType ? `Essay type: ${sanitizedSubType}` : null;

    const userContent = [
      `Generate one Cambridge IELTS ${taskLabel} question.`,
      subLine,
      `Topic: ${wrapUserInput(sanitizedTopic)}`,
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
      max_tokens: 512,
      temperature: 0.9,
    });

    const text = response.choices[0]?.message?.content ?? "";
    return new Response(text.trim(), {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (err) {
    console.error("[generate-question] error:", err instanceof Error ? err.message : err);
    return new Response("Something went wrong. Please try again.", { status: 500 });
  }
}
