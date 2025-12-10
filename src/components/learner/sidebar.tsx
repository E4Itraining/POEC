'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslation } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  LayoutDashboard,
  BookOpen,
  GraduationCap,
  Trophy,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  User,
  Menu,
  X,
} from 'lucide-react'
import { signOut, useSession } from 'next-auth/react'
import type { LucideIcon } from 'lucide-react'

interface NavItem {
  name: string
  href: string
  icon: LucideIcon
}

interface SidebarProps {
  className?: string
}

export function LearnerSidebar({ className }: SidebarProps) {
  const { t } = useTranslation()
  const pathname = usePathname()
  const { data: session } = useSession()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const user = session?.user

  const navigation = [
    {
      name: t.nav.dashboard,
      href: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: t.nav.myCourses,
      href: '/my-courses',
      icon: BookOpen,
    },
    {
      name: t.nav.courses,
      href: '/courses',
      icon: GraduationCap,
    },
    {
      name: t.nav.achievements,
      href: '/achievements',
      icon: Trophy,
    },
  ]

  const bottomNavigation = [
    {
      name: t.nav.settings,
      href: '/settings',
      icon: Settings,
    },
  ]

  const NavLink = ({ item, showLabel = true }: { item: NavItem, showLabel?: boolean }) => {
    const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
    return (
      <Link
        href={item.href}
        onClick={() => setIsMobileOpen(false)}
        className={cn(
          'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
          'hover:bg-primary/10 hover:text-primary',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
          isActive
            ? 'bg-primary text-primary-foreground shadow-md shadow-primary/25'
            : 'text-muted-foreground',
          !showLabel && 'justify-center px-2'
        )}
        aria-current={isActive ? 'page' : undefined}
      >
        <item.icon className={cn('h-5 w-5 flex-shrink-0', isActive && 'text-primary-foreground')} />
        {showLabel && (
          <span className="truncate">{item.name}</span>
        )}
      </Link>
    )
  }

  const SidebarContent = ({ collapsed = false }: { collapsed?: boolean }) => (
    <div className="flex h-full flex-col">
      {/* Logo / Header */}
      <div className={cn(
        'flex items-center gap-3 px-4 py-6 border-b border-border/50',
        collapsed && 'justify-center px-2'
      )}>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/70 text-primary-foreground font-bold text-lg shadow-lg shadow-primary/25">
          L
        </div>
        {!collapsed && (
          <div className="flex flex-col">
            <span className="font-bold text-lg">LearnHub</span>
            <span className="text-xs text-muted-foreground">Learning Platform</span>
          </div>
        )}
      </div>

      {/* User Info */}
      {user && (
        <div className={cn(
          'px-4 py-4 border-b border-border/50',
          collapsed && 'px-2 flex justify-center'
        )}>
          <div className={cn(
            'flex items-center gap-3',
            collapsed && 'flex-col'
          )}>
            <Avatar className="h-10 w-10 ring-2 ring-primary/20">
              <AvatarImage src={user.avatar || ''} alt={user.firstName || ''} />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {user.firstName?.[0]}{user.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            {!collapsed && (
              <div className="flex flex-col min-w-0">
                <span className="font-medium truncate">
                  {user.firstName} {user.lastName}
                </span>
                <span className="text-xs text-muted-foreground truncate">
                  {user.email}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="flex flex-col gap-1">
          {navigation.map((item) => (
            <NavLink key={item.href} item={item} showLabel={!collapsed} />
          ))}
        </nav>
      </ScrollArea>

      {/* Bottom Navigation */}
      <div className="border-t border-border/50 px-3 py-4 space-y-1">
        {bottomNavigation.map((item) => (
          <NavLink key={item.href} item={item} showLabel={!collapsed} />
        ))}
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className={cn(
            'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium w-full transition-all duration-200',
            'text-muted-foreground hover:bg-destructive/10 hover:text-destructive',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive focus-visible:ring-offset-2',
            !collapsed ? '' : 'justify-center px-2'
          )}
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          {!collapsed && <span>{t.nav.logout}</span>}
        </button>
      </div>

      {/* Collapse Button (Desktop) */}
      <div className="hidden lg:flex border-t border-border/50 p-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full justify-center"
          aria-label={isCollapsed ? t.a11y.expandSection : t.a11y.collapseSection}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden bg-background/80 backdrop-blur-sm shadow-lg"
        onClick={() => setIsMobileOpen(true)}
        aria-label={t.a11y.openMenu}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-72 bg-card border-r border-border shadow-2xl transform transition-transform duration-300 ease-in-out lg:hidden',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4"
          onClick={() => setIsMobileOpen(false)}
          aria-label={t.a11y.closeMenu}
        >
          <X className="h-5 w-5" />
        </Button>
        <SidebarContent />
      </aside>

      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'hidden lg:flex flex-col bg-card border-r border-border transition-all duration-300 ease-in-out',
          isCollapsed ? 'w-20' : 'w-72',
          className
        )}
      >
        <SidebarContent collapsed={isCollapsed} />
      </aside>
    </>
  )
}
