import { auth } from "@clerk/nextjs/server";
import Groq from "groq-sdk";
import { NextRequest, NextResponse } from "next/server";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { sanitizeInput, wrapUserInput, ANTI_INJECTION_FOOTER, MAX_LENGTHS } from "@/lib/sanitize";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const SYSTEM_PROMPT = `You are an expert IELTS Academic Writing teacher with 20 years of experience. A student will provide an IELTS essay question or Task 1 prompt between [USER INPUT START] and [USER INPUT END]. Your job is to:

1. Identify the EXACT essay type from this list:
   - "Opinion" — questions with "To what extent do you agree?", "Do you agree or disagree?", "In your opinion..."
   - "Discussion" — questions with "Discuss both views", "Some people think X while others think Y"
   - "Advantages/Disadvantages" — questions asking about pros and cons, "Do the advantages outweigh the disadvantages?"
   - "Problems/Solutions" — questions asking "What are the causes/problems? What solutions can you suggest?"
   - "Double Question" — questions with two distinct direct questions to answer
   - "Task 1 - Chart" — bar charts, line graphs, tables, pie charts
   - "Task 1 - Map" — two maps comparing a location at different times
   - "Task 1 - Process" — a diagram showing how something works or is made

2. Generate a COMPLETE, fully-structured Band 9 essay template for that specific question. The template must:
   - Include ALL paragraphs with paragraph labels like "▌ INTRODUCTION", "▌ BODY PARAGRAPH 1", "▌ BODY PARAGRAPH 2", "▌ CONCLUSION"
   - Replace generic placeholders with TOPIC-SPECIFIC HINTS drawn from the question
   - Use Band 9 vocabulary and sophisticated sentence starters
   - Use [CAPS IN BRACKETS] format for all hints and placeholders

3. Keep it practical — a student should be able to fill in the blanks and have a complete Band 7.5–9 essay.

Return ONLY a valid JSON object with exactly these fields:
{
  "essayType": "identified type from the list above",
  "templateName": "descriptive name e.g. 'Band 9 Opinion Essay — Climate Change'",
  "explanation": "2-3 sentences: essay type identified, why this structure works best, one key tip specific to this question",
  "band": 9,
  "customizedTemplate": "the full multi-paragraph template text"
}${ANTI_INJECTION_FOOTER}`;

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

    const { question } = body as Record<string, unknown>;
    if (typeof question !== "string" || !question.trim()) {
      return NextResponse.json({ error: "Question is required" }, { status: 400 });
    }

    let sanitizedQuestion: string;
    try {
      sanitizedQuestion = sanitizeInput(question, MAX_LENGTHS.question);
    } catch {
      return NextResponse.json({ error: "Invalid input detected" }, { status: 400 });
    }

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `IELTS Question:\n${wrapUserInput(sanitizedQuestion)}` },
      ],
      stream: false,
      temperature: 0.4,
      max_tokens: 2048,
      response_format: { type: "json_object" },
    });

    const raw = response.choices[0]?.message?.content ?? "{}";
    const result = JSON.parse(raw);
    return NextResponse.json(result);
  } catch (err) {
    console.error("[find-template] error:", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
