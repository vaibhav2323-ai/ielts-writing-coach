"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { navSections } from "./nav-config";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <TooltipProvider delayDuration={80}>
      <aside
        className="relative hidden lg:flex flex-col shrink-0 h-screen overflow-hidden"
        style={{
          width: collapsed ? 48 : 220,
          transition: "width 0.2s ease",
          background: "#0a0a0a",
          borderRight: "1px solid #1a1a1a",
        }}
      >
        {/* Logo */}
        <div
          className="flex h-12 items-center shrink-0 px-3"
          style={{ borderBottom: "1px solid #1a1a1a" }}
        >
          {collapsed ? (
            <button
              onClick={() => setCollapsed(false)}
              className="flex w-full justify-center"
            >
              <LogoMark />
            </button>
          ) : (
            <div className="flex items-center gap-2 w-full">
              <LogoMark />
              <span
                className="text-sm font-semibold text-white truncate"
                style={{ letterSpacing: "-0.02em" }}
              >
                Lexia
              </span>
              <button
                onClick={() => setCollapsed(true)}
                className="ml-auto p-1 rounded-md hover:bg-white/5 transition-colors"
                style={{ color: "#555" }}
                aria-label="Collapse sidebar"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3 px-2 space-y-4">
          {navSections.map((section, si) => (
            <div key={section.label}>
              {!collapsed && (
                <p
                  className="px-2 mb-1 select-none"
                  style={{
                    fontSize: "11px",
                    fontWeight: 500,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    color: "#3a3a3a",
                  }}
                >
                  {section.label}
                </p>
              )}
              {collapsed && si > 0 && (
                <div
                  className="mx-auto mb-2 h-px w-4"
                  style={{ background: "#1a1a1a" }}
                />
              )}
              <ul className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);

                  const linkEl = (
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-2.5 rounded-lg py-1.5 text-sm transition-colors",
                        collapsed ? "justify-center px-2" : "px-2.5",
                        active
                          ? "text-white"
                          : "hover:bg-white/5 hover:text-white"
                      )}
                      style={
                        active
                          ? { background: "rgba(255,255,255,0.08)", color: "white" }
                          : { color: "#888" }
                      }
                    >
                      <Icon
                        className="h-4 w-4 shrink-0"
                        strokeWidth={active ? 2 : 1.75}
                      />
                      {!collapsed && (
                        <span className="truncate leading-none">{item.label}</span>
                      )}
                    </Link>
                  );

                  return (
                    <li key={item.href}>
                      {collapsed ? (
                        <Tooltip>
                          <TooltipTrigger asChild>{linkEl}</TooltipTrigger>
                          <TooltipContent
                            side="right"
                            style={{
                              background: "#1a1a1a",
                              border: "1px solid #2a2a2a",
                              color: "#fff",
                              fontSize: "12px",
                            }}
                          >
                            {item.label}
                          </TooltipContent>
                        </Tooltip>
                      ) : (
                        linkEl
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Footer */}
        {!collapsed && (
          <div
            className="shrink-0 px-4 py-3"
            style={{ borderTop: "1px solid #1a1a1a" }}
          >
            <p style={{ fontSize: "11px", color: "#333" }}>Band 9 AI Coach</p>
          </div>
        )}
      </aside>
    </TooltipProvider>
  );
}

function LogoMark() {
  return (
    <span
      className="flex h-6 w-6 items-center justify-center rounded-md shrink-0"
      style={{ background: "#4F46E5" }}
    >
      <span style={{ fontSize: "11px", fontWeight: 800, color: "white", lineHeight: 1 }}>
        L
      </span>
    </span>
  );
}
