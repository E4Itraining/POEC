'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import {
  LayoutDashboard,
  BookOpen,
  GraduationCap,
  Trophy,
  BarChart3,
  Settings,
  Users,
  FileText,
  HelpCircle,
  Bookmark,
  Clock,
  X,
} from 'lucide-react'

interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
}

const learnerNavigation = [
  { name: 'Tableau de bord', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Catalogue', href: '/courses', icon: BookOpen },
  { name: 'Mes cours', href: '/my-courses', icon: GraduationCap },
  { name: 'Mes favoris', href: '/bookmarks', icon: Bookmark },
  { name: 'Mes badges', href: '/achievements', icon: Trophy },
  { name: 'Historique', href: '/history', icon: Clock },
]

const instructorNavigation = [
  { name: 'Mes formations', href: '/instructor/courses', icon: BookOpen },
  { name: 'Statistiques', href: '/instructor/analytics', icon: BarChart3 },
  { name: 'Étudiants', href: '/instructor/students', icon: Users },
]

const adminNavigation = [
  { name: 'Administration', href: '/admin', icon: Settings },
  { name: 'Utilisateurs', href: '/admin/users', icon: Users },
  { name: 'Cours', href: '/admin/courses', icon: BookOpen },
  { name: 'Rapports', href: '/admin/reports', icon: FileText },
]

export function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const userRole = session?.user?.role

  return (
    <>
      {/* Overlay mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] w-64 border-r bg-background transition-transform duration-300 ease-in-out md:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        aria-label="Sidebar"
      >
        <div className="flex h-full flex-col">
          {/* Bouton fermer mobile */}
          <div className="flex items-center justify-between p-4 md:hidden">
            <span className="font-semibold">Menu</span>
            <Button variant="ghost" size="icon" onClick={onClose} aria-label="Fermer le menu">
              <X className="h-5 w-5" />
            </Button>
          </div>

          <ScrollArea className="flex-1 px-3">
            {/* Navigation apprenant */}
            <nav className="space-y-1 py-4" aria-label="Navigation principale">
              <p className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Apprenant
              </p>
              {learnerNavigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    pathname === item.href || pathname.startsWith(item.href + '/')
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  )}
                  onClick={onClose}
                >
                  <item.icon className="h-4 w-4" aria-hidden="true" />
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* Navigation formateur */}
            {(userRole === 'INSTRUCTOR' || userRole === 'ADMIN') && (
              <nav className="space-y-1 py-4 border-t" aria-label="Navigation formateur">
                <p className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Formateur
                </p>
                {instructorNavigation.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                      pathname === item.href || pathname.startsWith(item.href + '/')
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                    )}
                    onClick={onClose}
                  >
                    <item.icon className="h-4 w-4" aria-hidden="true" />
                    {item.name}
                  </Link>
                ))}
              </nav>
            )}

            {/* Navigation admin */}
            {userRole === 'ADMIN' && (
              <nav className="space-y-1 py-4 border-t" aria-label="Navigation administrateur">
                <p className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Administration
                </p>
                {adminNavigation.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                      pathname === item.href || pathname.startsWith(item.href + '/')
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                    )}
                    onClick={onClose}
                  >
                    <item.icon className="h-4 w-4" aria-hidden="true" />
                    {item.name}
                  </Link>
                ))}
              </nav>
            )}
          </ScrollArea>

          {/* Progression globale */}
          {session && (
            <div className="border-t p-4">
              <div className="rounded-lg bg-muted p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Progression globale</span>
                  <span className="text-sm text-muted-foreground">45%</span>
                </div>
                <Progress value={45} className="h-2" />
                <p className="text-xs text-muted-foreground mt-2">
                  3 cours en cours
                </p>
              </div>
            </div>
          )}

          {/* Aide */}
          <div className="border-t p-4">
            <Link
              href="/help"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <HelpCircle className="h-4 w-4" aria-hidden="true" />
              Centre d'aide
            </Link>
          </div>
        </div>
      </aside>
    </>
  )
}
