'use client'

import { useTranslation } from '@/lib/i18n'
import { Button } from '@/components/ui/button'
import { LanguageSwitcher } from '@/components/ui/language-switcher'
import { useTheme } from 'next-themes'
import { Bell, Moon, Sun, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { useState, useEffect } from 'react'

interface HeaderProps {
  title?: string
  subtitle?: string
  showSearch?: boolean
}

export function LearnerHeader({ title, subtitle, showSearch = false }: HeaderProps) {
  const { t } = useTranslation()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [notifications, setNotifications] = useState<number>(0)

  useEffect(() => {
    setMounted(true)
    // Simulate notification count
    setNotifications(3)
  }, [])

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-border/50 bg-background/80 backdrop-blur-md px-4 lg:px-8">
      {/* Left side - Title or Search */}
      <div className="flex items-center gap-4 flex-1 lg:pl-0 pl-12">
        {showSearch ? (
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder={t.courses.searchPlaceholder}
              className="pl-10 bg-muted/50 border-0 focus-visible:ring-1"
            />
          </div>
        ) : (
          <div>
            {title && (
              <h1 className="text-xl font-semibold">{title}</h1>
            )}
            {subtitle && (
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            )}
          </div>
        )}
      </div>

      {/* Right side - Actions */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {notifications > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px]"
                >
                  {notifications}
                </Badge>
              )}
              <span className="sr-only">{t.dashboard.notifications}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <div className="p-4 text-center text-sm text-muted-foreground">
              {t.dashboard.noNotifications}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Theme Toggle */}
        {mounted && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label={t.a11y.toggleTheme}
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>
        )}

        {/* Language Switcher */}
        <LanguageSwitcher />
      </div>
    </header>
  )
}
