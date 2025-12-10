import type { Metadata, Viewport } from 'next'
import './globals.css'
import { Providers } from '@/components/providers'
import { Toaster } from '@/components/ui/toaster'
import { SkipLink } from '@/components/ui/skip-link'
import Script from 'next/script'

// Use system font stack for offline builds and better performance
const systemFontClass = 'font-sans'

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://campus.erythix.com'),
  title: {
    default: 'Erythix Campus - Formation DevOps & Infrastructure',
    template: '%s | Erythix Campus',
  },
  description: 'L\'expertise terrain, pas le buzzword. Formations observabilité IA, HPC souverain et infrastructures industrielles.',
  keywords: [
    'formation professionnelle',
    'DevOps',
    'observabilité',
    'HPC',
    'infrastructure',
    'VictoriaMetrics',
    'Rocky Linux',
    'open-source',
    'IA observabilité',
    'EU AI Act',
    'Slurm',
    'Kubernetes'
  ],
  authors: [{ name: 'Erythix', url: 'https://erythix.com' }],
  creator: 'Erythix',
  publisher: 'Erythix',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Erythix Campus',
  },
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    alternateLocale: ['en_US', 'de_DE', 'nl_NL'],
    siteName: 'Erythix Campus',
    title: 'Erythix Campus - Formation DevOps & Infrastructure',
    description: 'L\'expertise terrain, pas le buzzword. Formations observabilité IA, HPC souverain et infrastructures industrielles.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Erythix Campus - Formation Professionnelle',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Erythix Campus - Formation DevOps & Infrastructure',
    description: 'L\'expertise terrain, pas le buzzword. Formations observabilité IA, HPC souverain et infrastructures industrielles.',
    images: ['/og-image.png'],
    creator: '@erythix',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/icons/icon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/icon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      { rel: 'mask-icon', url: '/icons/safari-pinned-tab.svg', color: '#6366f1' },
    ],
  },
  verification: {
    // google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
  },
  category: 'education',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <link rel="dns-prefetch" href="https://tube.erythix.com" />
      </head>
      <body className={systemFontClass}>
        <Providers>
          <SkipLink />
          {children}
          <Toaster />
        </Providers>

        {/* Service Worker Registration */}
        <Script
          id="sw-register"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('SW registered: ', registration);
                    })
                    .catch(function(registrationError) {
                      console.log('SW registration failed: ', registrationError);
                    });
                });
              }
            `,
          }}
        />

        {/* Structured Data */}
        <Script
          id="structured-data"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'EducationalOrganization',
              name: 'Erythix Campus',
              alternateName: 'Erythix Academy',
              url: 'https://campus.erythix.com',
              logo: 'https://campus.erythix.com/logo.png',
              description: 'Formation professionnelle en DevOps, observabilité IA, HPC et infrastructures souveraines',
              address: {
                '@type': 'PostalAddress',
                addressCountry: 'FR',
              },
              sameAs: [
                'https://www.linkedin.com/company/erythix',
                'https://github.com/erythix'
              ],
              offers: {
                '@type': 'Offer',
                category: 'Professional Training'
              }
            }),
          }}
        />
      </body>
    </html>
  )
}
