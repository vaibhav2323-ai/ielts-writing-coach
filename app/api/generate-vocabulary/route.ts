import { auth } from "@clerk/nextjs/server";
import Groq from "groq-sdk";
import { NextRequest, NextResponse } from "next/server";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { sanitizeInput, wrapUserInput, ANTI_INJECTION_FOOTER, MAX_LENGTHS } from "@/lib/sanitize";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const VALID_BAND_LEVELS = new Set(["6", "7", "8", "9"]);

// FIXED: topic no longer interpolated into system prompt — moved to user message
const SYSTEM_PROMPT = `You are an expert IELTS Academic vocabulary teacher. Generate 20 completely unique advanced vocabulary words for IELTS Academic essays on the topic and band level provided in the user message. The words must be sophisticated, commonly tested in IELTS, and impressive to examiners. For each word return a JSON array with objects containing: word, meaning, part_of_speech, synonyms (3 words array), antonyms (2 words array), example_sentence (a perfect Band 9 IELTS essay sentence using this word naturally), topic, band_level. Return ONLY the raw JSON array. No markdown. No backticks. No explanation.${ANTI_INJECTION_FOOTER}`;

type RawWord = {
  word?: string;
  meaning?: string;
  part_of_speech?: string;
  synonyms?: unknown;
  antonyms?: unknown;
  example_sentence?: string;
  topic?: string;
  band_level?: unknown;
};

function toArr(val: unknown): string[] {
  if (Array.isArray(val)) return val.filter((v) => typeof v === "string") as string[];
  if (typeof val === "string") return val.split(",").map((s) => s.trim()).filter(Boolean);
  return [];
}

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

    const { topic, band_level } = body as Record<string, unknown>;

    if (typeof topic !== "string" || !topic.trim()) {
      return NextResponse.json({ error: "topic is required" }, { status: 400 });
    }
    if (typeof band_level !== "string" || !VALID_BAND_LEVELS.has(band_level)) {
      return NextResponse.json({ error: "band_level must be 6, 7, 8, or 9" }, { status: 400 });
    }

    let sanitizedTopic: string;
    try {
      sanitizedTopic = sanitizeInput(topic, MAX_LENGTHS.topic);
    } catch {
      return NextResponse.json({ error: "Invalid input detected" }, { status: 400 });
    }

    // band_level is validated against an allowlist — safe to use directly
    const userContent = `Topic: ${wrapUserInput(sanitizedTopic)}\nBand Level: ${band_level}`;

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userContent },
      ],
      stream: false,
      max_tokens: 3000,
      temperature: 0.8,
    });

    const raw = response.choices[0]?.message?.content ?? "[]";

    let parsed: RawWord[] = [];
    try {
      const j = JSON.parse(raw);
      parsed = Array.isArray(j) ? j : (j.words ?? []);
    } catch {
      const m = raw.match(/\[[\s\S]*\]/);
      if (m) {
        try { parsed = JSON.parse(m[0]); } catch { parsed = []; }
      }
    }

    const words = parsed.map((w, i) => ({
      id: `${Date.now()}-${i}`,
      word: (w.word ?? "").trim(),
      meaning: (w.meaning ?? "").trim(),
      part_of_speech: (w.part_of_speech ?? "noun").toLowerCase().trim(),
      synonyms: toArr(w.synonyms),
      antonyms: toArr(w.antonyms),
      example_sentence: (w.example_sentence ?? "").trim(),
      topic: (w.topic ?? sanitizedTopic).trim(),
      band_level: String(w.band_level ?? band_level).trim(),
    }));

    return NextResponse.json({ words });
  } catch (err) {
    console.error("[generate-vocabulary] error:", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
