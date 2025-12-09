'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  BookOpen,
  Bell,
  Menu,
  X,
  Sun,
  Moon,
  User,
  Settings,
  LogOut,
  Search,
  GraduationCap,
  LayoutDashboard,
  Trophy,
  Globe,
  Shield,
  FileText,
} from 'lucide-react'
import { getInitials } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { useI18n } from '@/lib/i18n'
import { Locale } from '@/lib/i18n/translations'

interface HeaderProps {
  onMenuClick?: () => void
  showMenuButton?: boolean
}

export function Header({ onMenuClick, showMenuButton = false }: HeaderProps) {
  const { data: session } = useSession()
  const { theme, setTheme } = useTheme()
  const [searchOpen, setSearchOpen] = useState(false)
  const { locale, setLocale, t, localeNames, localeFlags, availableLocales } = useI18n()

  const isAdmin = session?.user?.role === 'ADMIN' || session?.user?.role === 'INSTRUCTOR'

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center px-4 md:px-6">
        {showMenuButton && (
          <Button
            variant="ghost"
            size="icon"
            className="mr-2 md:hidden"
            onClick={onMenuClick}
            aria-label={t.a11y.openMenu}
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}

        <Link href="/" className="flex items-center gap-2 mr-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <BookOpen className="h-5 w-5" aria-hidden="true" />
          </div>
          <span className="font-bold text-xl hidden sm:inline-block">Erythix Academy</span>
        </Link>

        {/* Navigation principale */}
        <nav className="hidden md:flex items-center gap-6 flex-1" aria-label="Navigation principale">
          <Link
            href="/academies"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            {t.nav.academies}
          </Link>
          <Link
            href="/courses"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            {t.nav.catalog}
          </Link>
          <Link
            href="/docs"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            {t.nav.docs}
          </Link>
          {session && (
            <>
              <Link
                href="/dashboard"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {t.nav.dashboard}
              </Link>
              <Link
                href="/my-courses"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {t.nav.myCourses}
              </Link>
            </>
          )}
        </nav>

        {/* Barre de recherche */}
        <div className="flex-1 mx-4 hidden lg:block max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
            <Input
              type="search"
              placeholder={t.courses.searchPlaceholder}
              className="pl-9 w-full"
              aria-label={t.courses.searchPlaceholder}
            />
          </div>
        </div>

        {/* Recherche mobile */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden mr-2"
          onClick={() => setSearchOpen(!searchOpen)}
          aria-label={t.common.search}
        >
          <Search className="h-5 w-5" />
        </Button>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Sélecteur de langue */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label={t.a11y.toggleLanguage}
              >
                <Globe className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuLabel>{t.a11y.toggleLanguage}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {availableLocales.map((loc) => (
                <DropdownMenuItem
                  key={loc}
                  className={`cursor-pointer ${locale === loc ? 'bg-accent' : ''}`}
                  onClick={() => setLocale(loc as Locale)}
                >
                  <span className="mr-2">{localeFlags[loc as Locale]}</span>
                  {localeNames[loc as Locale]}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Thème */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label={t.a11y.toggleTheme}
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Moon className="h-5 w-5" aria-hidden="true" />
            )}
          </Button>

          {session ? (
            <>
              {/* Notifications */}
              <Button variant="ghost" size="icon" aria-label={t.dashboard.notifications}>
                <Bell className="h-5 w-5" aria-hidden="true" />
              </Button>

              {/* Lien rapide vers l'espace apprenant */}
              <Button variant="ghost" size="icon" asChild aria-label={t.nav.learnerArea}>
                <Link href="/dashboard">
                  <GraduationCap className="h-5 w-5" aria-hidden="true" />
                </Link>
              </Button>

              {/* Lien admin si applicable */}
              {isAdmin && (
                <Button variant="ghost" size="icon" asChild aria-label={t.nav.adminArea}>
                  <Link href="/admin">
                    <Shield className="h-5 w-5 text-orange-500" aria-hidden="true" />
                  </Link>
                </Button>
              )}

              {/* Menu utilisateur */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={session.user.avatar || undefined} alt={session.user.name} />
                      <AvatarFallback>
                        {getInitials(session.user.firstName, session.user.lastName)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{session.user.name}</p>
                      <p className="text-xs text-muted-foreground">{session.user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="cursor-pointer">
                      <LayoutDashboard className="mr-2 h-4 w-4" aria-hidden="true" />
                      {t.nav.dashboard}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/my-courses" className="cursor-pointer">
                      <GraduationCap className="mr-2 h-4 w-4" aria-hidden="true" />
                      {t.nav.myCourses}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/achievements" className="cursor-pointer">
                      <Trophy className="mr-2 h-4 w-4" aria-hidden="true" />
                      {t.nav.achievements}
                    </Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="cursor-pointer text-orange-500">
                          <Shield className="mr-2 h-4 w-4" aria-hidden="true" />
                          {t.nav.adminArea}
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" aria-hidden="true" />
                      {t.nav.profile}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" aria-hidden="true" />
                      {t.nav.settings}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer text-red-600 focus:text-red-600"
                    onClick={() => signOut({ callbackUrl: '/' })}
                  >
                    <LogOut className="mr-2 h-4 w-4" aria-hidden="true" />
                    {t.nav.logout}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" asChild>
                <Link href="/auth/login">{t.nav.login}</Link>
              </Button>
              <Button asChild>
                <Link href="/auth/register">{t.nav.register}</Link>
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Barre de recherche mobile */}
      {searchOpen && (
        <div className="border-t p-4 lg:hidden">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
            <Input
              type="search"
              placeholder={t.courses.searchPlaceholder}
              className="pl-9 w-full"
              aria-label={t.courses.searchPlaceholder}
              autoFocus
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2"
              onClick={() => setSearchOpen(false)}
              aria-label={t.common.close}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </header>
  )
}
