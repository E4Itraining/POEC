'use client'

import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { LearnerSidebar, LearnerHeader } from '@/components/learner'
import { useTranslation } from '@/lib/i18n'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const { t } = useTranslation()

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="h-16 w-16 rounded-full border-4 border-muted animate-pulse" />
            <div className="absolute inset-0 h-16 w-16 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          </div>
          <p className="text-muted-foreground">{t.common.loading}</p>
        </div>
      </div>
    )
  }

  if (!session) {
    redirect('/auth/login')
  }

  return (
    <div className="flex min-h-screen bg-muted/30">
      {/* Sidebar */}
      <LearnerSidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        <main
          id="main-content"
          className="flex-1 overflow-auto"
        >
          {children}
        </main>
      </div>
    </div>
  )
}
