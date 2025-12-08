import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'
import { Toaster } from '@/components/ui/toaster'
import { SkipLink } from '@/components/ui/skip-link'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'LearnHub - Learning Platform',
    template: '%s | LearnHub',
  },
  description: 'Complete, scalable and accessible online learning platform',
  keywords: ['LMS', 'training', 'e-learning', 'online courses', 'learning', 'formation'],
  authors: [{ name: 'LearnHub' }],
  creator: 'LearnHub',
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    alternateLocale: 'en_US',
    siteName: 'LearnHub',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <SkipLink />
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}
