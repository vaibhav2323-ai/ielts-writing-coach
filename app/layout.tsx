// ─── LEXIA ROOT LAYOUT ───────────────────────────────────────────────────────
// ClerkProvider is already here. If your project uses a different Clerk import
// path (e.g. from a custom package) adjust the import below.
// ─────────────────────────────────────────────────────────────────────────────
import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import './globals.css'

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Lexia — IELTS Writing Coach',
  description:
    'Lexia is a premium IELTS Writing coach. Track your band score, complete guided essays, build vocabulary, and keep your streak alive.',
  icons: {
    icon: [
      { url: '/icon-light-32x32.png', media: '(prefers-color-scheme: light)' },
      { url: '/icon-dark-32x32.png', media: '(prefers-color-scheme: dark)' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#080808',
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        className={`dark ${inter.variable} bg-background`}
      >
        <body className="font-sans antialiased">
          {children}
          {process.env.NODE_ENV === 'production' && <Analytics />}
        </body>
      </html>
    </ClerkProvider>
  )
}
