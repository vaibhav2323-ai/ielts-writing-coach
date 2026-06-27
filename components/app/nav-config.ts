import {
  LayoutDashboard,
  MessageSquare,
  ClipboardCheck,
  Dumbbell,
  Lightbulb,
  BookOpen,
  SpellCheck,
  Link2,
  LayoutTemplate,
  User,
  type LucideIcon,
} from "lucide-react"

export type NavItem = {
  label: string
  href: string
  icon: LucideIcon
  badge?: string
}

export type NavGroup = {
  title: string
  items: NavItem[]
}

export const navGroups: NavGroup[] = [
  {
    title: "Overview",
    items: [
      { label: "Dashboard", href: "/", icon: LayoutDashboard },
      { label: "AI Chat", href: "/chat", icon: MessageSquare, badge: "AI" },
    ],
  },
  {
    title: "Practice",
    items: [
      { label: "Essay Evaluator", href: "/evaluator", icon: ClipboardCheck },
      { label: "Daily Practice", href: "/practice", icon: Dumbbell },
      { label: "Question Generator", href: "/questions", icon: Lightbulb },
    ],
  },
  {
    title: "Learn",
    items: [
      { label: "Vocabulary", href: "/vocabulary", icon: BookOpen },
      { label: "Grammar", href: "/grammar", icon: SpellCheck },
      { label: "Linkers", href: "/linkers", icon: Link2 },
      { label: "Templates", href: "/templates", icon: LayoutTemplate },
    ],
  },
  {
    title: "Account",
    items: [{ label: "Profile", href: "/profile", icon: User }],
  },
]
