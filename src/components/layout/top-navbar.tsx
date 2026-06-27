"use client";

import { useUser, UserButton } from "@clerk/nextjs";
import { usePathname } from "next/navigation";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard":            "Dashboard",
  "/dashboard/chat":       "AI Chat",
  "/dashboard/evaluator":  "Essay Evaluator",
  "/dashboard/practice":   "Daily Practice",
  "/dashboard/generator":  "Question Generator",
  "/dashboard/templates":  "Templates",
  "/dashboard/vocabulary": "Vocabulary",
  "/dashboard/grammar":    "Grammar",
  "/dashboard/linkers":    "Linkers",
  "/dashboard/profile":    "Profile",
};

export function TopNav() {
  const { user, isLoaded } = useUser();
  const pathname = usePathname();
  const title = PAGE_TITLES[pathname] ?? "Dashboard";

  return (
    <header
      className="flex h-12 shrink-0 items-center justify-between px-5 z-10"
      style={{ background: "#0a0a0a", borderBottom: "1px solid #1a1a1a" }}
    >
      {/* Left */}
      <div className="flex items-center gap-3">
        {/* Mobile logo */}
        <div className="flex lg:hidden items-center gap-2">
          <span
            className="flex h-6 w-6 items-center justify-center rounded-md shrink-0"
            style={{ background: "#4F46E5" }}
          >
            <span style={{ fontSize: "11px", fontWeight: 800, color: "white", lineHeight: 1 }}>L</span>
          </span>
          <span className="text-sm font-semibold text-white" style={{ letterSpacing: "-0.02em" }}>
            Lexia
          </span>
        </div>

        {/* Desktop page title */}
        <span
          className="hidden lg:block text-sm font-medium text-white"
          style={{ letterSpacing: "-0.01em" }}
        >
          {title}
        </span>

        {/* Mobile page subtitle */}
        <span className="lg:hidden text-xs" style={{ color: "#666" }}>
          {title}
        </span>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        {isLoaded && user && (
          <span
            className="hidden sm:block text-xs select-none max-w-[160px] truncate"
            style={{ color: "#666" }}
          >
            {user.fullName ?? user.firstName ?? user.primaryEmailAddress?.emailAddress}
          </span>
        )}
        <UserButton
          afterSignOutUrl="/"
          appearance={{
            elements: {
              avatarBox: "h-7 w-7",
            },
          }}
        />
      </div>
    </header>
  );
}
