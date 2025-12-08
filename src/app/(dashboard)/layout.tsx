'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { Sidebar } from '@/components/layout/sidebar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="spinner" aria-label="Chargement..." />
      </div>
    )
  }

  if (!session) {
    redirect('/auth/login')
  }

  return (
    <div className="min-h-screen bg-background">
      <Header
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        showMenuButton
      />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main
        id="main-content"
        className="md:pl-64 pt-4 pb-8 min-h-[calc(100vh-4rem)]"
      >
        <div className="container mx-auto px-4 md:px-6">
          {children}
        </div>
      </main>
    </div>
  )
}
