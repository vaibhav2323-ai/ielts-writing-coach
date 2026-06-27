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
      className="flex h-[52px] shrink-0 items-center justify-between px-4 z-10"
      style={{
        background: "#0a0a0f",
        borderBottom: "1px solid #1e1e2e",
      }}
    >
      {/* Left */}
      <div className="flex items-center gap-3">
        {/* Mobile logo */}
        <div className="flex lg:hidden items-center gap-2.5">
          <span
            className="flex h-[26px] w-[26px] items-center justify-center rounded-lg shrink-0"
            style={{
              background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
              boxShadow: "0 2px 10px rgba(99,102,241,0.4)",
            }}
          >
            <span style={{ fontSize: "11px", fontWeight: 900, color: "white", lineHeight: 1 }}>
              I
            </span>
          </span>
          <span
            className="text-sm font-bold gradient-text"
            style={{ letterSpacing: "-0.02em" }}
          >
            IELTS Writing
          </span>
        </div>

        {/* Desktop page title */}
        <span
          className="hidden lg:block text-sm font-semibold"
          style={{ color: "#f0f0fa", letterSpacing: "-0.01em" }}
        >
          {title}
        </span>

        {/* Mobile subtitle */}
        <span
          className="lg:hidden text-xs ml-1"
          style={{ color: "#6b7280" }}
        >
          {title}
        </span>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        {isLoaded && user && (
          <span
            className="hidden sm:block text-xs select-none max-w-[180px] truncate"
            style={{ color: "#6b7280" }}
          >
            {user.fullName ?? user.firstName ?? user.primaryEmailAddress?.emailAddress}
          </span>
        )}
        <UserButton
          afterSignOutUrl="/"
          appearance={{
            elements: {
              avatarBox: "h-7 w-7",
              userButtonAvatarBox: "ring-1 ring-indigo-500/30",
            },
          }}
        />
      </div>
    </header>
  );
}
