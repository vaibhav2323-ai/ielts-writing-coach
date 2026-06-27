# Lexia Frontend Migration

You are replacing the frontend of an existing Next.js IELTS Writing Coach app with the new **Lexia** design from V0.

## RULES — READ FIRST

1. **Never touch** `app/api/**` — all API routes stay 100% as-is.
2. **Never touch** `lib/supabase*`, `lib/db*`, or any Supabase client/server helpers.
3. **Never touch** `middleware.ts` — Clerk auth middleware stays unchanged.
4. **Never touch** `.env.local` or any environment variables.
5. **Never touch** `lib/groq*` or any AI/Groq helpers.
6. Only replace: pages, layouts, components, globals.css, and config files listed below.
7. After all files are written, run `pnpm install` then `pnpm build` and fix any TypeScript errors.

---

## STEP 1 — Install new dependencies

Run this in the project root:

```bash
pnpm add @base-ui/react class-variance-authority tw-animate-css @vercel/analytics
pnpm add -D @tailwindcss/postcss
```

> `clsx`, `tailwind-merge`, `lucide-react`, `next`, `react`, `react-dom`, `tailwindcss` are already in your project — skip them.

---

## STEP 2 — Write config files

### `postcss.config.mjs` (replace existing)
```js
/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    '@tailwindcss/postcss': {},
  },
}
export default config
```

### `components.json` (replace existing)
```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "base-nova",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "app/globals.css",
    "baseColor": "neutral",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  },
  "iconLibrary": "lucide"
}
```

### `next.config.mjs` (replace existing)
```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}
export default nextConfig
```

---

## STEP 3 — Write all files

Copy every file from the sections below exactly as written. Do not merge or diff — overwrite the destination path completely.

---

## STEP 4 — Clerk integration points

After writing the files, make these two Clerk-specific edits:

### 4a. `app/layout.tsx` — wrap with ClerkProvider
```tsx
// ADD this import at the top:
import { ClerkProvider } from '@clerk/nextjs'

// WRAP the <html> tag:
return (
  <ClerkProvider>
    <html ...>
      ...
    </html>
  </ClerkProvider>
)
```

### 4b. `components/app/sidebar.tsx` — replace the hardcoded user footer
Find the footer section (the `<Link href="/profile">` block at the bottom of `<aside>`).
Replace the hardcoded `AK` avatar and `Amara Khan` text with Clerk's `<UserButton>` and `<useUser>`:

```tsx
// ADD imports:
import { UserButton, useUser } from '@clerk/nextjs'

// REPLACE the footer <Link> block with:
<div className="border-t border-border p-3">
  <div className="flex items-center gap-2.5 rounded-lg px-2 py-2">
    <UserButton afterSignOutUrl="/sign-in" />
    <div className="min-w-0 flex-1 leading-tight">
      <p className="truncate text-[13px] font-medium text-foreground">
        {user?.fullName ?? 'My Account'}
      </p>
      <p className="truncate text-[11px] text-muted-foreground">
        {user?.primaryEmailAddress?.emailAddress ?? ''}
      </p>
    </div>
  </div>
</div>
```

And add `const { user } = useUser()` inside the `Sidebar` component body.

### 4c. `components/app/topbar.tsx` — replace hardcoded avatar
Find the `<div>` with class `bg-secondary text-foreground` showing `AK`.
Replace it with `<UserButton afterSignOutUrl="/sign-in" />` and add the Clerk import.

### 4d. `app/(app)/profile/page.tsx` — wire to real Clerk user
The profile page ships with static data (`Amara Khan`, `amara.khan@email.com`).
Replace those hardcoded strings using `useUser()`:
```tsx
import { useUser } from '@clerk/nextjs'
const { user } = useUser()
// then use user?.fullName, user?.primaryEmailAddress?.emailAddress, etc.
```

---

## STEP 5 — Supabase / Groq page wiring

Each page currently has **static mock data** (arrays defined at the top of the file).
Wire them to your existing API routes — the pattern is the same for every page:

```tsx
// Replace static arrays with a useEffect + fetch to your existing API route
const [data, setData] = useState([])
useEffect(() => {
  fetch('/api/YOUR_EXISTING_ROUTE')
    .then(r => r.json())
    .then(setData)
}, [])
```

Pages that need wiring and their likely existing API routes:

| Page | Data to fetch | Likely API route |
|------|--------------|-----------------|
| `app/(app)/page.tsx` (Dashboard) | band score, streak, recent activity | `/api/profile`, `/api/submissions` |
| `app/(app)/chat/page.tsx` | AI responses | `/api/chat` |
| `app/(app)/evaluator/page.tsx` | Essay evaluation | `/api/evaluate` |
| `app/(app)/vocabulary/page.tsx` | Word list + mastered state | `/api/vocabulary` |
| `app/(app)/questions/page.tsx` | Generated question | `/api/questions` |
| `app/(app)/profile/page.tsx` | User stats | `/api/profile` |

> Check your actual `app/api/` folder for the real route names before wiring.

---

## STEP 6 — Build check

```bash
pnpm build
```

Fix any TypeScript errors reported. Common ones:
- Missing `'use client'` directive on files that use hooks — add it at the top.
- Clerk `useUser` returns `user | null | undefined` — use optional chaining (`user?.fullName`).

---

## File manifest (all files to write)

```
app/globals.css
app/layout.tsx
app/(app)/layout.tsx
app/(app)/page.tsx
app/(app)/chat/page.tsx
app/(app)/evaluator/page.tsx
app/(app)/grammar/page.tsx
app/(app)/linkers/page.tsx
app/(app)/practice/page.tsx
app/(app)/profile/page.tsx
app/(app)/questions/page.tsx
app/(app)/templates/page.tsx
app/(app)/vocabulary/page.tsx
components/app/nav-config.ts
components/app/primitives.tsx
components/app/sidebar.tsx
components/app/topbar.tsx
components/ui/button.tsx
lib/utils.ts
```

All file contents follow below.
