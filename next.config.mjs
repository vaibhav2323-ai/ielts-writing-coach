/** @type {import('next').NextConfig} */

const securityHeaders = [
  // Prevent clickjacking — no iframing of any page
  { key: "X-Frame-Options", value: "DENY" },

  // Prevent MIME-type sniffing
  { key: "X-Content-Type-Options", value: "nosniff" },

  // Control referrer information
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },

  // Legacy XSS filter (belt-and-suspenders)
  { key: "X-XSS-Protection", value: "1; mode=block" },

  // Disable browser features not needed by this app
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=()",
  },

  // Force HTTPS for 2 years, include subdomains, eligible for preload list
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },

  // Content Security Policy
  // - unsafe-eval / unsafe-inline required by Next.js + Clerk
  // - Supabase, Groq, Clerk endpoints whitelisted in connect-src
  // - Google Fonts whitelisted for Inter
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://*.clerk.accounts.dev https://*.clerk.com https://clerk.browser-telemetry.com https://*.ielts-writing-coach-seven.vercel.app",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self' data:",
      [
        "connect-src 'self'",
        "https://*.supabase.co",
        "https://api.groq.com",
        "https://*.clerk.accounts.dev",
        "https://*.clerk.com",
        "https://clerk.browser-telemetry.com",
      ].join(" "),
      "frame-src 'self' https://*.clerk.accounts.dev https://*.clerk.com",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  },
];

const nextConfig = {
  transpilePackages: ["react-markdown", "remark-gfm"],

  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
