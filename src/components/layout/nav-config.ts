import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  MessageSquare,
  FileCheck2,
  CalendarCheck,
  Sparkles,
  FileText,
  BookOpen,
  GraduationCap,
  Link2,
  User,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export type NavSection = {
  label: string;
  items: NavItem[];
};

export const navSections: NavSection[] = [
  {
    label: "Home",
    items: [
      { href: "/dashboard",       label: "Dashboard", icon: LayoutDashboard },
      { href: "/dashboard/chat",  label: "AI Chat",   icon: MessageSquare   },
    ],
  },
  {
    label: "Practice",
    items: [
      { href: "/dashboard/evaluator", label: "Essay Evaluator",    icon: FileCheck2  },
      { href: "/dashboard/practice",  label: "Daily Practice",     icon: CalendarCheck },
      { href: "/dashboard/generator", label: "Question Generator", icon: Sparkles    },
    ],
  },
  {
    label: "Learn",
    items: [
      { href: "/dashboard/templates",  label: "Templates",  icon: FileText      },
      { href: "/dashboard/vocabulary", label: "Vocabulary", icon: BookOpen      },
      { href: "/dashboard/grammar",    label: "Grammar",    icon: GraduationCap },
      { href: "/dashboard/linkers",    label: "Linkers",    icon: Link2         },
    ],
  },
  {
    label: "Account",
    items: [
      { href: "/dashboard/profile", label: "Profile", icon: User },
    ],
  },
];

// Flat list for backward compatibility
export const navItems: NavItem[] = navSections.flatMap((s) => s.items);

export const mobileNavItems: NavItem[] = [
  { href: "/dashboard",           label: "Home",     icon: LayoutDashboard },
  { href: "/dashboard/chat",      label: "AI Chat",  icon: MessageSquare   },
  { href: "/dashboard/evaluator", label: "Evaluate", icon: FileCheck2      },
  { href: "/dashboard/practice",  label: "Practice", icon: CalendarCheck   },
  { href: "/dashboard/profile",   label: "Profile",  icon: User            },
];
