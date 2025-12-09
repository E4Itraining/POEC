import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'
import { Toaster } from '@/components/ui/toaster'
import { SkipLink } from '@/components/ui/skip-link'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'Erythix Campus - Formation DevOps & Infrastructure',
    template: '%s | Erythix Campus',
  },
  description: 'L\'expertise terrain, pas le buzzword. Formations observabilité, HPC et infrastructures souveraines.',
  keywords: ['formation', 'DevOps', 'observabilité', 'HPC', 'infrastructure', 'VictoriaMetrics', 'Rocky Linux', 'open-source'],
  authors: [{ name: 'Erythix' }],
  creator: 'Erythix',
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    alternateLocale: 'en_US',
    siteName: 'Erythix Campus',
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
