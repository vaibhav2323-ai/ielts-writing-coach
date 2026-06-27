"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { navSections } from "./nav-config";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const EXPANDED_W = 224;
const COLLAPSED_W = 52;

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <TooltipProvider delayDuration={60}>
      <motion.aside
        animate={{ width: collapsed ? COLLAPSED_W : EXPANDED_W }}
        transition={{ duration: 0.22, ease: [0.25, 0.1, 0.25, 1] }}
        className="relative hidden lg:flex flex-col shrink-0 h-screen overflow-hidden"
        style={{ background: "#0d0d14", borderRight: "1px solid #1e1e2e" }}
      >
        {/* Logo header */}
        <div
          className="flex h-[52px] items-center px-3 shrink-0"
          style={{ borderBottom: "1px solid #1e1e2e" }}
        >
          <AnimatePresence mode="wait" initial={false}>
            {collapsed ? (
              <motion.div
                key="icon"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.1 }}
                className="flex w-full items-center justify-center"
              >
                <LogoMark />
              </motion.div>
            ) : (
              <motion.div
                key="full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.12 }}
                className="flex items-center gap-2.5 flex-1 min-w-0"
              >
                <LogoMark />
                <span
                  className="text-sm font-bold truncate gradient-text"
                  style={{ letterSpacing: "-0.02em" }}
                >
                  IELTS Writing
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {!collapsed && (
            <button
              onClick={() => setCollapsed(true)}
              className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-md transition-colors"
              style={{ color: "#3d3d58" }}
              aria-label="Collapse sidebar"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
          )}

          {collapsed && (
            <button
              onClick={() => setCollapsed(false)}
              className="absolute right-1.5 top-3 flex h-6 w-6 items-center justify-center rounded-md transition-colors"
              style={{ color: "#3d3d58" }}
              aria-label="Expand sidebar"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-2 space-y-5">
          {navSections.map((section, si) => (
            <div key={section.label}>
              <AnimatePresence initial={false}>
                {!collapsed && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.1 }}
                    className="px-2 mb-2 select-none"
                    style={{
                      fontSize: "10px",
                      fontWeight: 500,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color: "#2a2a3f",
                    }}
                  >
                    {section.label}
                  </motion.p>
                )}
              </AnimatePresence>

              {collapsed && si > 0 && (
                <div className="mx-auto mb-3 h-px w-5" style={{ background: "#1e1e2e" }} />
              )}

              <ul className="flex flex-col gap-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);

                  const linkContent = (
                    <Link
                      href={item.href}
                      className={cn(
                        "group relative flex items-center gap-2.5 rounded-lg py-[7px] text-sm w-full transition-all duration-150",
                        collapsed ? "justify-center px-2" : "px-2.5",
                        active
                          ? "font-medium"
                          : "hover:bg-zinc-800/50"
                      )}
                      style={
                        active
                          ? { background: "rgba(99,102,241,0.12)", color: "#a5b4fc" }
                          : { color: "#3d3d58" }
                      }
                    >
                      {/* Indigo left accent bar */}
                      {active && !collapsed && (
                        <span
                          className="absolute left-0 top-1/2 -translate-y-1/2 rounded-full"
                          style={{ width: "3px", height: "18px", background: "#6366f1" }}
                        />
                      )}

                      <Icon
                        className="h-4 w-4 shrink-0"
                        style={{ color: active ? "#818cf8" : "currentColor" }}
                        strokeWidth={active ? 2.2 : 1.75}
                      />

                      <AnimatePresence initial={false}>
                        {!collapsed && (
                          <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.1 }}
                            className="truncate leading-none"
                          >
                            {item.label}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </Link>
                  );

                  return (
                    <li key={item.href}>
                      {collapsed ? (
                        <Tooltip>
                          <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                          <TooltipContent
                            side="right"
                            className="text-xs"
                            style={{
                              background: "#16161f",
                              border: "1px solid #2a2a3f",
                              color: "#f0f0fa",
                            }}
                          >
                            {item.label}
                          </TooltipContent>
                        </Tooltip>
                      ) : (
                        linkContent
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Tagline */}
        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1 }}
              className="shrink-0 px-4 py-3"
              style={{ borderTop: "1px solid #1e1e2e" }}
            >
              <p style={{ fontSize: "10px", color: "#2a2a3f", lineHeight: 1.4 }}>
                Band 9 AI Writing Coach
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.aside>
    </TooltipProvider>
  );
}

function LogoMark() {
  return (
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
  );
}
