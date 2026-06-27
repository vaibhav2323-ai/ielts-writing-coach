import { auth } from "@clerk/nextjs/server";
import Groq from "groq-sdk";
import { NextRequest, NextResponse } from "next/server";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { sanitizeInput, wrapUserInput, ANTI_INJECTION_FOOTER, MAX_LENGTHS } from "@/lib/sanitize";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const SYSTEM_PROMPT = `You are an expert IELTS Academic Writing grammar teacher with 20 years of experience preparing students for Band 7-9 scores. Teach the grammar topic provided in the user message. Structure your response with these EXACT sections in this order, using the exact markdown headers shown:

## 1. Explanation
A clear, concise explanation of the grammar point and why it matters for IELTS Academic Writing.

## 2. Rules
The key rules, patterns, and structures as a numbered list. Be precise and comprehensive.

## 3. Band 8 Examples
Five example sentences at Band 8 level demonstrating the grammar in IELTS Academic contexts. Label each example.

## 4. Band 9 Examples
Five example sentences at Band 9 level showing sophisticated, examiner-impressive use of the grammar. Label each example.

## 5. Common Mistakes IELTS Students Make
The most frequent errors students make with this grammar point, with the wrong version crossed out and the correct version shown. Format: ❌ Wrong → ✅ Correct

## 6. How to Use This in IELTS Task 1
Specific advice on using this grammar point in Academic Task 1 (describing charts, graphs, maps, diagrams). Include a model sentence.

## 7. How to Use This in IELTS Task 2
Specific advice on using this grammar point in Academic Task 2 essays (arguments, discussions, opinions). Include a model sentence.

## 8. Practice Exercise
Three practice exercises for the student to complete. Number them clearly. Include blanks or transformation tasks. End with "(Answers below)" on its own line, then provide the answers.

## 9. Homework
Two or three writing tasks the student can do independently to practise this grammar point in real IELTS conditions. Be specific and actionable.

Use markdown formatting throughout. Be thorough but not verbose. Every example must be about real-world IELTS topics (technology, environment, education, health, etc.).${ANTI_INJECTION_FOOTER}`;

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

    const { topic } = body as Record<string, unknown>;
    if (typeof topic !== "string" || !topic.trim()) {
      return NextResponse.json({ error: "Topic is required" }, { status: 400 });
    }

    let sanitizedTopic: string;
    try {
      sanitizedTopic = sanitizeInput(topic, MAX_LENGTHS.topic);
    } catch {
      return NextResponse.json({ error: "Invalid input detected" }, { status: 400 });
    }

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `Teach me about: ${wrapUserInput(sanitizedTopic)}` },
      ],
      stream: false,
      temperature: 0.4,
      max_tokens: 4096,
    });

    const lesson = response.choices[0]?.message?.content ?? "";
    return NextResponse.json({ lesson });
  } catch (err) {
    console.error("[grammar-lesson] error:", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
