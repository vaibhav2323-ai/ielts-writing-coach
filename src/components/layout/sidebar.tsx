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
          borderRight: "1px solid #222222",
        }}
      >
        {/* Logo */}
        <div
          className="flex h-12 items-center shrink-0 px-3"
          style={{ borderBottom: "1px solid #222222" }}
        >
          {collapsed ? (
            <button
              onClick={() => setCollapsed(false)}
              className="flex w-full justify-center"
              aria-label="Expand sidebar"
            >
              <LogoMark />
            </button>
          ) : (
            <div className="flex items-center gap-2.5 w-full">
              <LogoMark />
              <span
                className="text-sm font-bold text-white truncate"
                style={{ letterSpacing: "-0.02em" }}
              >
                IELTS Coach
              </span>
              <button
                onClick={() => setCollapsed(true)}
                className="ml-auto p-1 rounded transition-colors hover:bg-[#1a1a1a]"
                style={{ color: "#555" }}
                aria-label="Collapse sidebar"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-2 space-y-5">
          {navSections.map((section, si) => (
            <div key={section.label}>
              {!collapsed && (
                <p
                  className="px-3 mb-1.5 select-none"
                  style={{
                    fontSize: "10px",
                    fontWeight: 600,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "#555",
                  }}
                >
                  {section.label}
                </p>
              )}
              {collapsed && si > 0 && (
                <div
                  className="mx-auto mb-3 h-px w-5"
                  style={{ background: "#222222" }}
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
                        "flex items-center gap-2.5 rounded-[6px] py-1.5 text-sm transition-colors",
                        collapsed ? "justify-center px-2" : "px-3",
                        active
                          ? "text-white"
                          : "text-[#888] hover:text-white hover:bg-[#1a1a1a]"
                      )}
                      style={
                        active
                          ? {
                              background: "#1a1a1a",
                              color: "white",
                              borderLeft: collapsed ? "none" : "2px solid #4F46E5",
                              paddingLeft: collapsed ? undefined : "10px",
                            }
                          : {
                              borderLeft: collapsed ? "none" : "2px solid transparent",
                              paddingLeft: collapsed ? undefined : "10px",
                            }
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
                              border: "1px solid #222222",
                              color: "#fff",
                              fontSize: "12px",
                              borderRadius: "6px",
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
            style={{ borderTop: "1px solid #222222" }}
          >
            <p style={{ fontSize: "11px", color: "#444" }}>Band 9 AI Coach</p>
          </div>
        )}
      </aside>
    </TooltipProvider>
  );
}

function LogoMark() {
  return (
    <span
      className="flex h-6 w-6 items-center justify-center rounded-[6px] shrink-0"
      style={{ background: "#4F46E5" }}
    >
      <span style={{ fontSize: "11px", fontWeight: 800, color: "white", lineHeight: 1 }}>
        L
      </span>
    </span>
  );
}
