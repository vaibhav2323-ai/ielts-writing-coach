"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X, Search, Bell, PenLine } from "lucide-react"
import { UserButton } from "@clerk/nextjs"
import { cn } from "@/lib/utils"
import { navGroups } from "./nav-config"

function useTitle() {
  const pathname = usePathname()
  for (const group of navGroups) {
    for (const item of group.items) {
      const match = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)
      if (match) return item.label
    }
  }
  return "Dashboard"
}

export function Topbar() {
  const title = useTitle()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <>
      <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-background/90 px-4 backdrop-blur-sm md:px-6">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground lg:hidden"
          aria-label="Open menu"
        >
          <Menu className="size-5" strokeWidth={1.75} />
        </button>

        <h1 className="text-[15px] font-semibold tracking-tight text-foreground">{title}</h1>

        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            className="hidden h-8 items-center gap-2 rounded-lg border border-border bg-card px-3 text-[13px] text-muted-foreground transition-colors hover:border-border hover:text-foreground sm:flex"
          >
            <Search className="size-3.5" strokeWidth={1.75} />
            <span>Search</span>
            <kbd className="rounded border border-border bg-secondary px-1 text-[10px] text-muted-foreground">⌘K</kbd>
          </button>
          <button
            type="button"
            className="relative flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            aria-label="Notifications"
          >
            <Bell className="size-4" strokeWidth={1.75} />
            <span className="absolute right-2 top-2 size-1.5 rounded-full bg-primary" />
          </button>
          {/* Clerk user button replaces hardcoded avatar */}
          <UserButton afterSignOutUrl="/sign-in" />
        </div>
      </header>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-background/80" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-0 flex h-full w-64 flex-col border-r border-border bg-sidebar">
            <div className="flex h-14 items-center gap-2.5 border-b border-border px-5">
              <div className="flex size-7 items-center justify-center rounded-lg bg-primary">
                <PenLine className="size-4 text-primary-foreground" strokeWidth={2.25} />
              </div>
              <span className="text-[15px] font-semibold tracking-tight text-foreground">Lexia</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="ml-auto flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground"
                aria-label="Close menu"
              >
                <X className="size-5" strokeWidth={1.75} />
              </button>
            </div>
            <nav className="flex flex-1 flex-col gap-6 overflow-y-auto px-3 py-5">
              {navGroups.map((group) => (
                <div key={group.title}>
                  <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground/60">
                    {group.title}
                  </p>
                  <ul className="flex flex-col gap-0.5">
                    {group.items.map((item) => {
                      const isActive =
                        item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)
                      return (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            onClick={() => setOpen(false)}
                            className={cn(
                              "flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors",
                              isActive
                                ? "bg-accent text-foreground"
                                : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
                            )}
                          >
                            <item.icon
                              className={cn("size-4", isActive ? "text-primary" : "text-muted-foreground")}
                              strokeWidth={1.75}
                            />
                            {item.label}
                          </Link>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              ))}
            </nav>
          </div>
        </div>
      )}
    </>
  )
}
