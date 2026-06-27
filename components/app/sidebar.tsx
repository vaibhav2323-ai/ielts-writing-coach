"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { PenLine, ChevronRight } from "lucide-react"
import { UserButton, useUser } from "@clerk/nextjs"
import { cn } from "@/lib/utils"
import { navGroups } from "./nav-config"

export function Sidebar() {
  const pathname = usePathname()
  const { user } = useUser()

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-sidebar lg:flex">
      {/* Logo */}
      <div className="flex h-14 items-center gap-2.5 border-b border-border px-5">
        <div className="flex size-7 items-center justify-center rounded-lg bg-primary">
          <PenLine className="size-4 text-primary-foreground" strokeWidth={2.25} />
        </div>
        <span className="text-[15px] font-semibold tracking-tight text-foreground">Lexia</span>
        <span className="ml-auto rounded border border-border px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
          Pro
        </span>
      </div>

      {/* Nav */}
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
                      className={cn(
                        "group flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors",
                        isActive
                          ? "bg-accent text-foreground"
                          : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
                      )}
                    >
                      <item.icon
                        className={cn(
                          "size-4 transition-colors",
                          isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground",
                        )}
                        strokeWidth={1.75}
                      />
                      <span className="flex-1">{item.label}</span>
                      {item.badge && (
                        <span className="rounded border border-primary/30 bg-primary/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-primary">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer / Clerk user */}
      <div className="border-t border-border p-3">
        <div className="flex items-center gap-2.5 rounded-lg px-2 py-2">
          <UserButton afterSignOutUrl="/sign-in" />
          <div className="min-w-0 flex-1 leading-tight">
            <p className="truncate text-[13px] font-medium text-foreground">
              {user?.fullName ?? "My Account"}
            </p>
            <p className="truncate text-[11px] text-muted-foreground">
              {user?.primaryEmailAddress?.emailAddress ?? ""}
            </p>
          </div>
          <Link href="/profile">
            <ChevronRight className="size-4 text-muted-foreground" strokeWidth={1.75} />
          </Link>
        </div>
      </div>
    </aside>
  )
}
