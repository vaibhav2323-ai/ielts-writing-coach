import { auth } from "@clerk/nextjs/server";
import Groq from "groq-sdk";
import { NextRequest, NextResponse } from "next/server";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { ANTI_INJECTION_FOOTER } from "@/lib/sanitize";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// All topics come from a server-side allowlist — never from user input directly
const TOPICS_MAP: Record<string, string[]> = {
  task2: [
    "Technology", "Environment", "Education", "Health", "Society",
    "Globalisation", "Crime & Justice", "Government Policy", "Transport", "Work & Employment",
  ],
  task1: ["Bar Chart", "Line Graph", "Pie Chart", "Table", "Map", "Process Diagram"],
  grammar: [
    "Tenses", "Articles", "Passive Voice", "Conditionals", "Relative Clauses",
    "Modal Verbs", "Subject-Verb Agreement", "Prepositions", "Conjunctions", "Parallel Structure",
  ],
  vocabulary: [
    "Technology", "Environment", "Education", "Health & Medicine",
    "Business & Economics", "Society & Culture", "Science", "Politics",
  ],
  linker: [
    "Contrast & Concession", "Cause & Effect", "Addition",
    "Example & Illustration", "Conclusion", "Sequence", "Condition", "Comparison",
  ],
  paraphrase: [
    "Opinion sentences", "Fact & Statistics", "Problem sentences",
    "Solution sentences", "Advantage/Disadvantage sentences",
  ],
  error: ["Grammar errors", "Vocabulary & Word Form", "Spelling & Punctuation", "Mixed errors"],
};

const ALLOWED_TYPES = new Set([...Object.keys(TOPICS_MAP), "mixed"]);

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function buildPrompt(type: string, topic: string): string {
  // topic is always from our server-side allowlist, never raw user input
  switch (type) {
    case "task2":
      return `Generate a single IELTS Academic Task 2 essay question on the topic: "${topic}".
Return a JSON object with exactly these fields:
{
  "essay_type": "one of: Opinion | Discussion | Advantages & Disadvantages | Problems & Solutions | Double Question",
  "question": "the complete IELTS question text ending with the full writing instruction",
  "tips": "Specific tip 1 for this exact question | Specific tip 2 | Specific tip 3",
  "band9_outline": "Introduction: paraphrase topic + state position | Body 1: first main argument with example | Body 2: second argument or counter-argument | Conclusion: restate position concisely"
}`;

    case "task1":
      return `Generate a single IELTS Academic Task 1 question for a ${topic}.
Return a JSON object with exactly these fields:
{
  "chart_type": "${topic}",
  "question": "The ${topic.toLowerCase()} below shows [describe specific imaginary IELTS data with categories and time period]. Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words.",
  "data_hint": "Key data: [highest category] had the highest value at [X]. [Lowest category] was lowest at [Y]. Overall, [1 sentence describing main trend].",
  "model_overview": "A single Band 9 overview sentence capturing the dominant trend and a key comparison."
}`;

    case "grammar":
      return `Generate a single IELTS Academic grammar multiple-choice question that tests "${topic}".
Return a JSON object with exactly these fields:
{
  "question": "Choose the grammatically correct option to complete this IELTS sentence:",
  "sentence": "A full academic sentence with ___ marking the blank position",
  "options": ["A) first choice", "B) second choice", "C) third choice", "D) fourth choice"],
  "correct": "B",
  "explanation": "Why B is correct: [grammar rule]. Why A is wrong: [reason]. Why C is wrong: [reason]. Why D is wrong: [reason]."
}`;

    case "vocabulary":
      return `Generate a single IELTS vocabulary multiple-choice question using an advanced academic word related to "${topic}".
Return a JSON object with exactly these fields:
{
  "question": "What does the bold word mean in this IELTS academic sentence?",
  "word": "THE_ADVANCED_WORD_IN_CAPITALS",
  "sentence": "A full IELTS-level sentence where the word is used naturally in context",
  "options": ["A) first meaning", "B) second meaning", "C) correct meaning", "D) fourth meaning"],
  "correct": "C",
  "explanation": "THE_WORD means [definition]. Synonyms for IELTS: [synonyms]. Common collocations: [collocations]. Tip: [usage note for writing]."
}`;

    case "linker":
      return `Generate a single IELTS linker fill-in-the-blank question testing "${topic}" connectives.
Return a JSON object with exactly these fields:
{
  "sentence": "A first clause that gives context. ___, a second clause that logically follows.",
  "category": "${topic}",
  "options": ["A) first linker", "B) second linker", "C) correct linker", "D) fourth linker"],
  "correct": "C",
  "explanation": "C is correct because [reason]. A is wrong because [reason]. B is wrong because [reason]. D is wrong because [reason]."
}`;

    case "paraphrase":
      return `Generate a single IELTS paraphrasing exercise. The sentence type is: ${topic}.
Return a JSON object with exactly these fields:
{
  "original": "A clear Band 5-6 sentence with simple vocabulary and basic grammar structure",
  "band9_version": "A sophisticated Band 9 rewrite using advanced vocabulary, nominalisation, and more complex grammar",
  "key_changes": "simple word → advanced synonym | basic phrase → academic noun phrase | simple structure → complex grammar pattern"
}`;

    case "error":
      return `Generate a paragraph of 4-5 sentences for an IELTS error correction exercise. Error category: ${topic}.
Return a JSON object with exactly these fields:
{
  "paragraph": "A paragraph with exactly 5 errors of the type '${topic}' embedded naturally in the text",
  "corrected_paragraph": "The identical paragraph with all 5 errors corrected",
  "errors": [
    {"wrong": "exact phrase from paragraph that contains the error", "correct": "the corrected version", "type": "Grammar|Vocabulary|Spelling|Punctuation", "explanation": "Why this is wrong and what rule applies"}
  ]
}`;

    default:
      return `Generate a single IELTS grammar MCQ.
Return JSON: { "question": "...", "sentence": "sentence with ___", "options": ["A)...","B)...","C)...","D)..."], "correct": "A", "explanation": "..." }`;
  }
}

const SYSTEM_PROMPT = `You are an expert IELTS Academic Writing teacher. Generate a single authentic IELTS practice exercise. Return ONLY a valid JSON object — no markdown fences, no extra text.${ANTI_INJECTION_FOOTER}`;

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

    const rawType = (body as Record<string, unknown>).type;
    const rawTopic = (body as Record<string, unknown>).topic;

    if (typeof rawType !== "string" || !ALLOWED_TYPES.has(rawType)) {
      return NextResponse.json({ error: "Invalid exercise type" }, { status: 400 });
    }

    // Mixed: resolve server-side — no user input used
    let resolvedType: string = rawType;
    let topic: unknown = rawTopic;
    if (rawType === "mixed") {
      const mixedTypes = ["task2", "task1", "grammar", "vocabulary", "linker"];
      resolvedType = pickRandom(mixedTypes);
      topic = pickRandom(TOPICS_MAP[resolvedType]);
    }

    const allowedTopics = TOPICS_MAP[resolvedType] ?? [];
    let resolvedTopic: string;

    if (typeof topic === "string" && allowedTopics.includes(topic)) {
      resolvedTopic = topic;
    } else {
      resolvedTopic = pickRandom(allowedTopics.length > 0 ? allowedTopics : ["General"]);
    }

    const prompt = buildPrompt(resolvedType, resolvedTopic);

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ],
      temperature: 0.8,
      max_tokens: 1200,
      response_format: { type: "json_object" },
    });

    const raw = completion.choices[0]?.message?.content ?? "{}";
    const exercise = JSON.parse(raw);
    return NextResponse.json({ ...exercise, type: resolvedType, topic: resolvedTopic });
  } catch (err) {
    console.error("[daily-practice/generate] error:", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
