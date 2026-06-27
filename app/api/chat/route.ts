import { auth } from "@clerk/nextjs/server";
import Groq from "groq-sdk";
import { NextRequest } from "next/server";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { sanitizeInput, wrapUserInput, ANTI_INJECTION_FOOTER, MAX_LENGTHS } from "@/lib/sanitize";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const MAX_MESSAGES = 40;

const SYSTEM_PROMPT = `You are an expert IELTS Academic Writing Coach. You teach Task 1 (graphs, charts, maps, tables, process diagrams) and Task 2 (opinion, discussion, advantages/disadvantages, problems/solutions essays).

When a student gives you a question: generate a full essay plan and a complete Band 9 answer. Explain each paragraph in detail. Highlight all key vocabulary, topic-specific synonyms, and linking devices used.

When a student gives you their essay: assign an overall band score and score each of the four IELTS criteria separately (Task Achievement, Coherence and Cohesion, Lexical Resource, Grammatical Range and Accuracy). Highlight every mistake, explain why it is wrong, correct it, and then provide a complete Band 9 rewritten version.

For every grammar, vocabulary, or writing skill lesson: explain the concept clearly, give the rule, show a Band 8 example, list the most common student mistakes and how to avoid them, give real examiner tips, teach relevant synonyms and linkers with example sentences.

Always end every single response with a **Homework** section giving the student one specific writing task to complete.${ANTI_INJECTION_FOOTER}`;

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return new Response("Unauthorized", { status: 401 });

    const rl = rateLimit(userId, "expensive");
    if (!rl.allowed) return rateLimitResponse(rl.retryAfter!);

    const body = await req.json().catch(() => null);
    if (!body || !Array.isArray(body.messages)) {
      return new Response("Bad request: messages array required", { status: 400 });
    }

    // Enforce message count limit
    const rawMessages: unknown[] = body.messages.slice(0, MAX_MESSAGES);

    // Validate and sanitize each message
    const messages: { role: "user" | "assistant"; content: string }[] = [];
    for (const msg of rawMessages) {
      if (
        typeof msg !== "object" ||
        msg === null ||
        !("role" in msg) ||
        !("content" in msg)
      ) {
        continue;
      }
      const m = msg as { role: unknown; content: unknown };
      if (m.role !== "user" && m.role !== "assistant") continue;
      if (typeof m.content !== "string") continue;

      let content: string;
      try {
        content = sanitizeInput(m.content, MAX_LENGTHS.message);
      } catch {
        return new Response("Bad request: invalid message content", { status: 400 });
      }

      // Wrap only user messages in delimiters
      messages.push({
        role: m.role,
        content: m.role === "user" ? wrapUserInput(content) : content,
      });
    }

    if (messages.length === 0) {
      return new Response("Bad request: no valid messages", { status: 400 });
    }

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          const stream = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
            stream: true,
            max_tokens: 4096,
            temperature: 0.7,
          });

          for await (const chunk of stream) {
            const text = chunk.choices[0]?.delta?.content ?? "";
            if (text) controller.enqueue(encoder.encode(text));
          }
          controller.close();
        } catch (err) {
          console.error("[chat] stream error:", err instanceof Error ? err.message : err);
          controller.enqueue(encoder.encode("\n\n_Something went wrong. Please try again._"));
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (err) {
    console.error("[chat] unhandled error:", err instanceof Error ? err.message : err);
    return new Response("Something went wrong. Please try again.", { status: 500 });
  }
}
