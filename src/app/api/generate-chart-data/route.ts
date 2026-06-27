import { auth } from "@clerk/nextjs/server";
import Groq from "groq-sdk";
import { NextRequest, NextResponse } from "next/server";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { sanitizeInput, wrapUserInput, ANTI_INJECTION_FOOTER, MAX_LENGTHS } from "@/lib/sanitize";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const SYSTEM_PROMPT = `You are a data visualization expert for IELTS Academic Task 1. Generate realistic fake data that authentically matches the given question. All numbers, percentages, years, locations, and categories must look genuinely plausible. Return ONLY valid JSON matching the exact schema provided. No explanation, no extra text.${ANTI_INJECTION_FOOTER}`;

const ALLOWED_CHART_TYPES = new Set([
  "Bar Chart",
  "Line Graph",
  "Pie Chart",
  "Table",
  "Mixed (Bar + Line)",
  "Map",
  "Process Diagram",
  "Diagram",
]);

const SCHEMAS: Record<string, string> = {
  "Bar Chart": `Return JSON with this exact shape:
{"title":"string","xAxisLabel":"string","yAxisLabel":"string","data":[{"category":"string","<SeriesName>":number}],"series":[{"key":"string","color":"string"}]}
Rules: 5–7 data items. 2–4 series per item. Colors from: #3b82f6 #8b5cf6 #10b981 #f59e0b #ef4444.`,

  "Line Graph": `Return JSON with this exact shape:
{"title":"string","xAxisLabel":"string","yAxisLabel":"string","data":[{"x":"string","<SeriesName>":number}],"series":[{"key":"string","color":"string"}]}
Rules: 6–8 time points for x. 2–4 named series with realistic trends. Colors from: #3b82f6 #8b5cf6 #10b981 #f59e0b #ef4444.`,

  "Pie Chart": `Return JSON with this exact shape:
{"title":"string","data":[{"name":"string","value":number}]}
Rules: 5–7 segments. Values must sum to exactly 100 (percentages).`,

  "Table": `Return JSON with this exact shape:
{"title":"string","headers":["string"],"rows":[["string"]]}
Rules: 3–5 columns, 5–8 rows. Include units in column headers. First column is the row label.`,

  "Mixed (Bar + Line)": `Return JSON with this exact shape:
{"title":"string","xAxisLabel":"string","yLabel1":"string","yLabel2":"string","data":[{"x":"string","bar_value":number,"line_value":number}],"bars":[{"key":"bar_value","name":"string","color":"#3b82f6"}],"lines":[{"key":"line_value","name":"string","color":"#f59e0b"}]}
Rules: 6–8 time points. Bar and line values must be on very different scales.`,

  "Map": `Return JSON with this exact shape:
{"title":"string","period1":"string","period2":"string","changes":[{"feature":"string","before":"string","after":"string","type":"replaced"|"expanded"|"unchanged"|"removed"|"new"}]}
Rules: 6–8 features showing realistic urban development.`,

  "Process Diagram": `Return JSON with this exact shape:
{"title":"string","steps":["string"]}
Rules: 7–9 clear sequential steps. Each step is a concise active-voice phrase.`,

  "Diagram": `Return JSON with this exact shape:
{"title":"string","components":[{"id":"string","name":"string","description":"string"}],"connections":[{"from":"string","to":"string","label":"string"}]}
Rules: 5–7 components with ids A, B, C... Show the complete flow through connections.`,
};

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

    const { question, chart_type } = body as Record<string, unknown>;

    if (typeof question !== "string" || !question.trim()) {
      return NextResponse.json({ error: "question is required" }, { status: 400 });
    }
    // chart_type validated against allowlist — no free-form user input
    if (typeof chart_type !== "string" || !ALLOWED_CHART_TYPES.has(chart_type)) {
      return NextResponse.json({ error: "Unknown chart type" }, { status: 400 });
    }

    let sanitizedQuestion: string;
    try {
      sanitizedQuestion = sanitizeInput(question, MAX_LENGTHS.question);
    } catch {
      return NextResponse.json({ error: "Invalid input detected" }, { status: 400 });
    }

    const schema = SCHEMAS[chart_type];
    const userContent = `IELTS Task 1 question: ${wrapUserInput(sanitizedQuestion)}\n\nChart type: ${chart_type}\nSchema to follow:\n${schema}`;

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userContent },
      ],
      stream: false,
      max_tokens: 1024,
      temperature: 0.4,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content ?? "{}";
    const data = JSON.parse(content);
    return NextResponse.json(data);
  } catch (err) {
    console.error("[generate-chart-data] error:", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
