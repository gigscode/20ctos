import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: "20 Conversations with Olajide Igbalaye | Let's Make Progress",
  description: 'An open invitation to connect with Olajide Igbalaye. Explore practical conversations around business, AI, technology, digital products, career development, and mentorship.',
  alternates: { canonical: '/' },
  openGraph: {
    title: "20 Conversations with Olajide Igbalaye | Let's Make Progress",
    description: 'An open invitation to talk about what you are building, facing, or figuring out.',
    type: 'website',
    images: [{ url: '/og-campaign.png', width: 1200, height: 630, alt: '20 Conversations with Olajide Igbalaye' }],
  },
  robots: { index: true, follow: true },
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
  colorScheme: 'light',
  themeColor: '#fafaf8',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
