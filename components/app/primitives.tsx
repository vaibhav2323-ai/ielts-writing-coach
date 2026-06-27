import * as React from "react"
import { cn } from "@/lib/utils"

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("rounded-lg border border-border bg-card", className)}
      {...props}
    />
  )
}

export function PageIntro({ title, description }: { title: string; description?: string }) {
  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold tracking-tight text-foreground">{title}</h2>
      {description && <p className="mt-1 text-[13px] text-muted-foreground">{description}</p>}
    </div>
  )
}

export function SectionTitle({
  children,
  action,
}: {
  children: React.ReactNode
  action?: React.ReactNode
}) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h3 className="text-[13px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
        {children}
      </h3>
      {action}
    </div>
  )
}

type ButtonVariant = "primary" | "secondary" | "ghost"

const buttonVariants: Record<ButtonVariant, string> = {
  primary: "bg-primary text-primary-foreground hover:bg-primary/90 border border-transparent",
  secondary:
    "bg-card text-foreground border border-border hover:border-[#333] hover:bg-secondary",
  ghost: "bg-transparent text-muted-foreground hover:bg-accent hover:text-foreground border border-transparent",
}

export function Button({
  variant = "primary",
  className,
  ...props
}: { variant?: ButtonVariant } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "inline-flex h-9 items-center justify-center gap-2 rounded-lg px-3.5 text-[13px] font-medium transition-colors disabled:pointer-events-none disabled:opacity-50",
        buttonVariants[variant],
        className,
      )}
      {...props}
    />
  )
}

export function Badge({
  className,
  tone = "neutral",
  ...props
}: {
  tone?: "neutral" | "indigo" | "green" | "amber" | "red"
} & React.HTMLAttributes<HTMLSpanElement>) {
  const tones = {
    neutral: "border-border bg-secondary text-muted-foreground",
    indigo: "border-primary/30 bg-primary/10 text-primary",
    green: "border-[#22c55e]/30 bg-[#22c55e]/10 text-[#4ade80]",
    amber: "border-[#f59e0b]/30 bg-[#f59e0b]/10 text-[#fbbf24]",
    red: "border-[#ef4444]/30 bg-[#ef4444]/10 text-[#f87171]",
  }
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[11px] font-medium",
        tones[tone],
        className,
      )}
      {...props}
    />
  )
}
