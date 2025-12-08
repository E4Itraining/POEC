import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'
import { Toaster } from '@/components/ui/toaster'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'LMS Platform - Plateforme d\'apprentissage',
    template: '%s | LMS Platform',
  },
  description: 'Plateforme d\'apprentissage en ligne complète, évolutive et accessible',
  keywords: ['LMS', 'formation', 'e-learning', 'cours en ligne', 'apprentissage'],
  authors: [{ name: 'LMS Platform' }],
  creator: 'LMS Platform',
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    siteName: 'LMS Platform',
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
          <a href="#main-content" className="skip-link">
            Aller au contenu principal
          </a>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}
