"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { mobileNavItems } from "./nav-config";

export function BottomNav() {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <nav
      className="lg:hidden fixed bottom-0 inset-x-0 z-50 flex h-16 backdrop-blur-xl"
      style={{
        background: "rgba(13,13,20,0.92)",
        borderTop: "1px solid #1e1e2e",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      {mobileNavItems.map((item) => {
        const Icon = item.icon;
        const active = isActive(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-1 flex-col items-center justify-center gap-1 transition-colors",
              active ? "" : "text-zinc-600 hover:text-zinc-400"
            )}
            style={
              active
                ? { color: "#818cf8" }
                : {}
            }
          >
            <Icon
              className="h-5 w-5 transition-colors"
              strokeWidth={active ? 2.2 : 1.75}
            />
            <span
              style={{
                fontSize: "10px",
                fontWeight: active ? 600 : 500,
                letterSpacing: "0.03em",
              }}
            >
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
