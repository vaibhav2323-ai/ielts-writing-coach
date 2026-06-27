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
      className="lg:hidden fixed bottom-0 inset-x-0 z-50 flex h-16"
      style={{
        background: "#0a0a0a",
        borderTop: "1px solid #1a1a1a",
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
              "flex flex-1 flex-col items-center justify-center gap-1 transition-colors"
            )}
            style={{ color: active ? "#fff" : "#555" }}
          >
            <Icon className="h-5 w-5" strokeWidth={active ? 2 : 1.75} />
            <span style={{ fontSize: "10px", fontWeight: active ? 600 : 400 }}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
