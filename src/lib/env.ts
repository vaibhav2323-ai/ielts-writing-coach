/**
 * Server-only environment variable validation.
 * NEVER import this file in any client component or "use client" file.
 * Call validateServerEnv() early in any API route to catch misconfigurations fast.
 */

if (typeof window !== "undefined") {
  throw new Error(
    "src/lib/env.ts is server-only. Do not import it in client components."
  );
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value || value.trim() === "") {
    throw new Error(
      `Missing required environment variable: "${name}". ` +
        `Ensure it is set in .env.local. See .env.example for reference.`
    );
  }
  return value.trim();
}

/** Validates all required server-side env vars. Throws with a clear message if any are missing. */
export function validateServerEnv(): void {
  requireEnv("GROQ_API_KEY");
  requireEnv("NEXT_PUBLIC_SUPABASE_URL");
  requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  requireEnv("CLERK_SECRET_KEY");
  requireEnv("NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY");
}

/** Typed getters — use these instead of process.env directly for clarity. */
export const serverEnv = {
  groqApiKey: () => requireEnv("GROQ_API_KEY"),
  supabaseUrl: () => requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
  supabaseAnonKey: () => requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
} as const;
