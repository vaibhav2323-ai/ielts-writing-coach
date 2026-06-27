import { auth } from "@clerk/nextjs/server";
import Groq from "groq-sdk";
import { NextRequest, NextResponse } from "next/server";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { sanitizeInput, wrapUserInput, ANTI_INJECTION_FOOTER, MAX_LENGTHS } from "@/lib/sanitize";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const SYSTEM_PROMPT = `You are an expert IELTS Academic writing teacher and vocabulary specialist. When given an English word between [USER INPUT START] and [USER INPUT END], return a detailed IELTS-level analysis as a JSON object with exactly these fields:

{
  "word": string,
  "part_of_speech": string (noun/verb/adjective/adverb/phrase),
  "meaning": string (clear, precise definition),
  "band_level": string (6, 7, 8, or 9),
  "topic": string (one IELTS topic this word best fits),
  "synonyms": [string, string, string],
  "antonyms": [string, string],
  "example_sentence": string (a perfect Band 9 IELTS Academic essay sentence),
  "collocations": [string, string, string, string],
  "ielts_usage": string (2-3 sentences on how and when to use this word in IELTS essays),
  "common_mistakes": string (2-3 sentences on common errors with this word)
}

Return ONLY the JSON object. No markdown, no backticks, no extra text.${ANTI_INJECTION_FOOTER}`;

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

    const { word } = body as Record<string, unknown>;
    if (typeof word !== "string" || !word.trim()) {
      return NextResponse.json({ error: "Word is required" }, { status: 400 });
    }

    let sanitizedWord: string;
    try {
      sanitizedWord = sanitizeInput(word, MAX_LENGTHS.word);
    } catch {
      return NextResponse.json({ error: "Invalid input detected" }, { status: 400 });
    }

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `Look up this word for IELTS: ${wrapUserInput(sanitizedWord)}` },
      ],
      stream: false,
      temperature: 0.3,
      max_tokens: 1024,
      response_format: { type: "json_object" },
    });

    const raw = response.choices[0]?.message?.content ?? "{}";
    const result = JSON.parse(raw);
    return NextResponse.json(result);
  } catch (err) {
    console.error("[lookup-word] error:", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
